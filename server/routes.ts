import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

let gemini: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (error) {
  console.error("Failed to initialize Gemini client:", error);
}

import pRetry from "p-retry";

// Helper function to generate AI response with retry logic
async function generateAIResponse(systemPrompt: string, userMessage: string): Promise<string> {
  if (!gemini) throw new Error("Gemini not initialized");

  return pRetry(
    async () => {
      const result = await gemini!.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}` }],
          },
        ],
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ],
      });
      return result.text || "";
    },
    {
      retries: 5,
      minTimeout: 2000,
      factor: 2,
      onFailedAttempt: (error: any) => {
        const details = error.error?.message || error.message || "Unknown error";
        const status = error.error?.status || "Unknown status";
        console.warn(`AI attempt ${error.attemptNumber} failed (Status: ${status}): ${details}. Retrying...`);
      },
    }
  );
}

import { storage } from "./storage";
import { db } from "./db";
import { gte, and } from "drizzle-orm";
import { moodEntries, type User } from "@shared/schema";

// Crisis detection phrases
const CRISIS_PHRASES = [
  "kill myself", "end my life", "suicide", "want to die", "don't want to live",
  "hurt myself", "self harm", "self-harm", "no reason to live", "end it all",
  "give up on life", "better off dead", "can't go on", "hopeless", "worthless"
];

function detectCrisis(message: string): { isCrisis: boolean; severity: string; matchedPhrase?: string } {
  const lowerMessage = message.toLowerCase();
  for (const phrase of CRISIS_PHRASES) {
    if (lowerMessage.includes(phrase)) {
      const highSeverity = ["kill myself", "suicide", "end my life", "want to die", "hurt myself"];
      return {
        isCrisis: true,
        severity: highSeverity.some(p => lowerMessage.includes(p)) ? "high" : "medium",
        matchedPhrase: phrase
      };
    }
  }
  return { isCrisis: false, severity: "none" };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware for /api routes
  app.use("/api", (req, res, next) => {
    if (req.method === "POST" && (req.path === "/login" || req.path === "/register")) {
      return next();
    }

    if (!req.isAuthenticated() && req.path !== "/user") {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  });

  // AI Chat routes
  app.get("/api/conversations", async (req, res) => {
    const userId = (req.user as User).id;
    const result = await storage.getConversations(userId);
    res.json(result);
  });

  app.post("/api/conversations", async (req, res) => {
    const userId = (req.user as User).id;
    const { title, type = "chat" } = req.body;
    const conversation = await storage.createConversation(userId, { title: title || "New Chat", type, userId });
    res.json(conversation);
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    const id = parseInt(req.params.id);
    // Note: Ideally we'd verify conversation belongs to user here
    const result = await storage.getMessages(id);
    res.json(result);
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    const conversationId = parseInt(req.params.id);
    const { content, systemPrompt } = req.body;

    await storage.createMessage({ conversationId, role: "user", content });

    const existingMessages = await storage.getMessages(conversationId);
    const chatHistory = existingMessages.map((m) => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`).join('\n');

    if (systemPrompt) {
      // Include system prompt in context
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    if (!gemini) {
      res.write(`data: ${JSON.stringify({ error: "AI service unavailable" })}\n\n`);
      res.end();
      return;
    }

    try {
      const fullPrompt = `${systemPrompt || 'You are a helpful mental health companion.'}\n\nConversation history:\n${chatHistory}\n\nUser: ${content}`;

      const response = await gemini.models.generateContentStream({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: fullPrompt }],
          },
        ],
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ],
      });

      let fullResponse = "";
      for await (const chunk of response) {
        const text = chunk.text || "";
        if (text) {
          fullResponse += text;
          res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
        }
      }

      await storage.createMessage({ conversationId, role: "assistant", content: fullResponse });
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Streaming error:", error);
      res.write(`data: ${JSON.stringify({ error: "Failed to generate response" })}\n\n`);
      res.end();
    }
  });

  // Simple non-streaming chat endpoint for mobile apps
  const MENTAL_HEALTH_SYSTEM_PROMPT = `You are Heal Here's AI Companion, a warm, empathetic, and supportive mental health assistant. Your role is to:

1. Listen actively and validate the user's feelings without judgment
2. Offer gentle, evidence-based coping strategies when appropriate
3. Encourage professional help when needed, while being supportive
4. Use calming, reassuring language that promotes emotional safety
5. Never diagnose conditions or replace professional mental health care
6. Recognize crisis situations and provide emergency resources (988 Suicide & Crisis Lifeline)

Guidelines:
- Be warm, patient, and understanding
- Use "I" statements and reflective listening
- Suggest breathing exercises, grounding techniques, or journaling when helpful
- Keep responses concise but meaningful (2-4 sentences typically)
- If someone mentions self-harm or suicide, always provide 988 crisis line info
- Celebrate small wins and progress

Remember: You're a supportive companion, not a replacement for therapy.`;

  app.post("/api/chat", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    try {
      const { message, history = [] } = req.body;
      const userId = (req.user as User).id;

      // Crisis detection
      const crisisCheck = detectCrisis(message);
      let systemPromptToUse = MENTAL_HEALTH_SYSTEM_PROMPT;

      if (crisisCheck.isCrisis) {
        try {
          await storage.createCrisisAlert(userId, {
            severity: crisisCheck.severity,
            triggerPhrase: crisisCheck.matchedPhrase || "",
            responseGiven: "Crisis response provided",
            userId
          });
        } catch (e) {
          console.error("Failed to log crisis alert:", e);
        }

        systemPromptToUse = `${MENTAL_HEALTH_SYSTEM_PROMPT}\n\nIMPORTANT: The user may be in crisis. Your response MUST:
1. First acknowledge their pain with deep empathy
2. Gently remind them they're not alone
3. Always include: "If you're in crisis, please reach out to the 988 Suicide & Crisis Lifeline by calling or texting 988. You can also chat at 988lifeline.org"
4. Offer a simple grounding exercise if appropriate
5. Never dismiss their feelings or offer toxic positivity`;
      }

      const chatHistory = history.map((m: { role: string; message: string }) =>
        `${m.role === 'ai' ? 'Assistant' : 'User'}: ${m.message}`
      ).join('\n');

      try {
        const aiMessage = await generateAIResponse(
          systemPromptToUse,
          `${chatHistory}\n\nUser: ${message}`
        );

        res.json({
          message: aiMessage || "I'm here to listen. Could you tell me more?",
          isCrisis: crisisCheck.isCrisis,
          crisisSeverity: crisisCheck.severity
        });
      } catch (error) {
        console.error("Error in chat:", error);
        res.json({
          message: crisisCheck.isCrisis
            ? "I can hear how much pain you're in, and I want you to know you're not alone. If you're in crisis, please reach out to the 988 Suicide & Crisis Lifeline by calling or texting 988. You can also chat at 988lifeline.org. I'm here to listen to anything you want to share."
            : "I'm here to listen, but I'm having a little trouble connecting to my full thoughts right now. Could you tell me more about how you're feeling? I'm always here for you.",
          isCrisis: crisisCheck.isCrisis,
          crisisSeverity: crisisCheck.severity
        });
      }
    } catch (error) {
      console.error("Global chat error:", error);
      res.status(500).json({
        error: "Failed to process chat",
        message: "I'm having trouble responding right now. Please try again in a moment."
      });
    }
  });

  // AI Mood Analysis
  app.post("/api/ai/analyze-mood", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    const { mood, note, sleepHours, stressLevel } = req.body;

    try {
      const analysis = await generateAIResponse(
        "You are a compassionate mental health advisor. Provide brief, supportive insights based on mood data. Be empathetic and offer practical tips.",
        `Analyze this mood entry: Mood: ${mood}, Note: ${note || "none"}, Sleep: ${sleepHours || "unknown"} hours, Stress level: ${stressLevel || "unknown"}/10. Provide supportive insights and 2-3 practical tips.`
      );

      res.json({ analysis });
    } catch (error) {
      console.error("Mood analysis error:", error);
      res.json({
        analysis: "I'm here for you. It sounds like you're going through a lot. Take a moment to breathe deeply. Remember, small steps lead to big changes. Consider journaling or a short walk to clear your mind."
      });
    }
  });

  // AI Sleep & Stress Insights
  app.post("/api/ai/sleep-stress-insights", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    const userId = (req.user as User).id;
    const recentMoods = await storage.getMoodEntries(userId);

    try {
      const insights = await generateAIResponse(
        "You are a wellness advisor specializing in sleep and stress management. Analyze patterns and provide actionable insights.",
        `Based on this week's mood data: ${JSON.stringify(recentMoods.slice(0, 7))}, provide insights about sleep patterns and stress levels with practical recommendations.`
      );
      res.json({ insights });
    } catch (error) {
      console.error("Sleep/stress analytics error:", error);
      res.json({ insights: "It's important to monitor your patterns. Consistent sleep and regular breaks can significantly reduce stress. Try to maintain a regular bedtime this week." });
    }
  });

  // AI Consultant Match
  app.post("/api/ai/consultant-match", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    const { concerns, preferences } = req.body;

    try {
      const recommendation = await generateAIResponse(
        "You are a mental health intake specialist. Based on user concerns, recommend the type of therapist or consultant that would best help them. Include specialty areas and what to look for.",
        `User concerns: ${concerns}. Preferences: ${preferences || "none specified"}. Recommend the best type of mental health professional for them.`
      );
      res.json({ recommendation });
    } catch (error) {
      console.error("Consultant match error:", error);
      res.json({ recommendation: "Based on your needs, a Licensed Professional Counselor (LPC) or Clinical Social Worker (LCSW) specializing in wellness and stress management would be a great start. Look for someone who uses evidence-based approaches like CBT." });
    }
  });

  // AI Reminder Suggestions
  app.post("/api/ai/reminder-suggestions", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    const { currentReminders, userRoutine } = req.body;

    try {
      const suggestions = await generateAIResponse(
        `You are a wellness routine advisor. Based on the user's current reminders and daily routine, suggest additional helpful reminders that could improve their mental health and wellbeing. Focus on: 1. Self-care activities 2. Mindfulness practices 3. Healthy habits 4. Stress management 5. Sleep hygiene. Provide practical, actionable reminders with suggested times.`,
        `Current reminders: ${currentReminders?.join(", ") || "none set"}. User's routine: ${userRoutine}. Suggest 3-5 additional wellness reminders that would complement their existing routine.`
      );
      res.json({ suggestions });
    } catch (error) {
      console.error("Reminder suggestions error:", error);
      res.json({ suggestions: "Consider adding a 5-minute breathing exercise in the afternoon and a screen-free hour before bed to improve your wellbeing." });
    }
  });

  // AI Session Preparation
  app.post("/api/ai/session-prep", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    const { therapistName, specialty, topics } = req.body;

    try {
      const preparation = await generateAIResponse(
        `You are a mental health session preparation assistant. Help users prepare for their therapy sessions by: 1. Suggesting how to articulate their concerns clearly 2. Providing grounding techniques to reduce session anxiety 3. Recommending questions to ask their therapist 4. Offering tips for getting the most out of the session. Be supportive, encouraging, and practical.`,
        `Help me prepare for my therapy session with ${therapistName} (specialty: ${specialty || "general therapy"}). Topics I want to discuss: ${topics || "general wellness check-in"}. Please provide preparation tips, suggested questions, and how to make the most of this session.`
      );
      res.json({ preparation });
    } catch (error) {
      console.error("Session prep error:", error);
      res.json({ preparation: "Before your session, take a few deep breaths and jot down 2-3 main points you want to discuss. Remember, your therapist is there to help you - be open and honest about how you're feeling." });
    }
  });

  // AI Progress Insights Dashboard
  app.post("/api/ai/progress-insights", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    const { sessions, journalEntries, streak, goalsCompleted, habitsConsistency, weeklyMood, achievements, userGoals } = req.body;

    try {
      const insights = await generateAIResponse(
        `You are a supportive wellness progress analyst. Analyze the user's mental health journey data and provide: 1. Recognition of their achievements and progress 2. Patterns you notice in their mood data 3. Personalized recommendations for continued growth 4. Encouragement and motivation based on their goals. Be warm, supportive, and specific.`,
        `Analyze my wellness journey: Total therapy sessions: ${sessions}, Journal entries: ${journalEntries}, Current streak: ${streak} days, Goals completed: ${goalsCompleted}%, Habits consistency: ${habitsConsistency}%, Weekly mood scores: ${weeklyMood?.join(", ") || "not tracked"}, Achievements: ${achievements?.join(", ") || "none yet"}, My wellness goals: ${userGoals}. Please provide personalized insights.`
      );
      res.json({ insights });
    } catch (error) {
      console.error("Progress insights error:", error);
      res.json({ insights: "You're making progress on your wellness journey! Keep tracking your moods and habits - consistency is key. Celebrate the small wins along the way." });
    }
  });

  // AI Habit Coach
  app.post("/api/ai/habit-coach", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    const { habit, currentStreak, challenges } = req.body;

    try {
      const coaching = await generateAIResponse(
        "You are an encouraging habit coach. Provide motivation, tips, and strategies for building healthy habits. Be supportive and practical.",
        `Help me with this habit: ${habit}. Current streak: ${currentStreak} days. Challenges: ${challenges || "none mentioned"}. Give me motivation and tips.`
      );
      res.json({ coaching });
    } catch (error) {
      console.error("Habit coach error:", error);
      res.json({ coaching: "Great job working on this habit! Remember, consistency beats perfection. Start small, celebrate progress, and don't be too hard on yourself if you miss a day." });
    }
  });

  // CBT Thought Reframing
  app.post("/api/ai/cbt-reframe", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    try {
      const { thought, context } = req.body;

      const reframe = await generateAIResponse(
        `You are a CBT (Cognitive Behavioral Therapy) thought reframing coach. Your role is to: 1. Identify the cognitive distortion in the user's thought (e.g., all-or-nothing thinking, catastrophizing, mind reading) 2. Validate their feelings first - don't dismiss the emotion 3. Gently challenge the thought with evidence-based questions 4. Provide 2-3 alternative, balanced thoughts 5. Suggest one practical action they can take. Format your response with sections for Cognitive Pattern Detected, Your Feelings Are Valid, Let's Explore, Alternative Perspectives, and One Small Step.`,
        `Help me reframe this thought: "${thought}"${context ? `. Context: ${context}` : ""}`
      );

      res.json({ reframe });
    } catch (error) {
      console.error("CBT reframe error:", error);
      res.status(500).json({ error: "Failed to generate reframe" });
    }
  });

  // Grounding Techniques Generator
  app.post("/api/ai/grounding-technique", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    try {
      const { currentMood, situation, preferredType } = req.body;

      const technique = await generateAIResponse(
        `You are a calming grounding technique guide. Based on the user's current state, provide a personalized grounding exercise. Types include: 5-4-3-2-1 sensory technique, Box breathing (4-4-4-4), Progressive muscle relaxation, Body scan meditation, Mindful observation, Cold water technique. Provide step-by-step instructions that are easy to follow. Keep it concise (under 150 words) and calming.`,
        `I'm feeling ${currentMood || "anxious"}${situation ? `. Situation: ${situation}` : ""}${preferredType ? `. Preferred technique type: ${preferredType}` : ""}. Give me a grounding exercise.`
      );

      res.json({ technique });
    } catch (error) {
      console.error("Grounding technique error:", error);
      res.status(500).json({ error: "Failed to generate technique" });
    }
  });

  // Journal AI Insights
  app.post("/api/ai/journal-insights", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    try {
      const { content, title } = req.body;

      const insights = await generateAIResponse(
        `You are an empathetic journal analyst. Analyze the journal entry and provide: 1. **Emotional Insights:** Key emotions detected and their intensity 2. **Triggers Identified:** Possible triggers or stressors mentioned 3. **Patterns Noticed:** Behavioral or thought patterns 4. **Gratitude Prompt:** A personalized gratitude prompt based on the entry 5. **Reflection Question:** One thoughtful question for deeper self-exploration. Be warm, non-judgmental, and supportive. Format with clear sections.`,
        `Analyze this journal entry titled "${title || "Untitled"}":\n\n${content}`
      );

      // Extract sections (simplified extraction)
      const triggersMatch = insights.match(/Triggers[^:]*:(.*?)(?=\*\*|$)/s);
      const patternsMatch = insights.match(/Patterns[^:]*:(.*?)(?=\*\*|$)/s);
      const gratitudeMatch = insights.match(/Gratitude[^:]*:(.*?)(?=\*\*|$)/s);

      res.json({
        insights,
        triggers: triggersMatch?.[1]?.trim() || null,
        patterns: patternsMatch?.[1]?.trim() || null,
        gratitudePrompt: gratitudeMatch?.[1]?.trim() || null
      });
    } catch (error) {
      console.error("Journal insights error:", error);
      res.status(500).json({ error: "Failed to analyze journal" });
    }
  });

  // Post-Session Summary
  app.post("/api/ai/post-session-summary", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    try {
      const { sessionNotes, therapistName, sessionGoals } = req.body;

      const summary = await generateAIResponse(
        `You are a therapy session summarizer. Create a helpful summary that includes: 1. **Key Takeaways:** Main insights from the session 2. **Progress Made:** What went well or breakthroughs 3. **Growth Areas:** Areas to continue working on 4. **Action Items:** Homework or things to practice 5. **Next Steps:** Suggestions for the next session. Be encouraging and highlight positive progress.`,
        `Summarize my therapy session${therapistName ? ` with ${therapistName}` : ""}${sessionGoals ? `. Goals: ${sessionGoals}` : ""}\n\nSession notes:\n${sessionNotes}`
      );

      res.json({ summary });
    } catch (error) {
      console.error("Session summary error:", error);
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });

  // Routine Generator
  app.post("/api/ai/routine-generator", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    try {
      const { goal, wakeTime, sleepTime, currentChallenges } = req.body;

      const routineContent = await generateAIResponse(
        `You are a wellness routine designer. Create personalized daily routines for mental health goals. Include specific times and duration for each activity. Format as a JSON array of activities: [{"time": "7:00 AM", "activity": "Morning meditation", "duration": "10 min", "benefit": "Reduces morning anxiety"}]. Include 6-8 activities spread throughout the day.`,
        `Create a ${goal} routine for me. Wake time: ${wakeTime || "7:00 AM"}, Sleep time: ${sleepTime || "10:00 PM"}${currentChallenges ? `. Challenges: ${currentChallenges}` : ""}`
      );

      let schedule;
      try {
        const jsonMatch = routineContent.match(/\[.*\]/s);
        schedule = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      } catch {
        schedule = [];
      }

      res.json({ routine: routineContent, schedule });
    } catch (error) {
      console.error("Routine generator error:", error);
      res.status(500).json({ error: "Failed to generate routine" });
    }
  });

  // Daily Affirmation Generator
  app.post("/api/ai/daily-affirmation", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    try {
      const { currentMood, challenges, preferences } = req.body;

      const affirmations = await generateAIResponse(
        `You are a caring affirmation creator. Generate 3 personalized, meaningful affirmations based on the user's current state. Affirmations should be: first person ("I am" / "I have" / "I can"), present tense, positive and empowering, specific to their situation, not toxic positivity - realistic and grounded. Format as numbered list.`,
        `Generate affirmations for me. Current mood: ${currentMood || "neutral"}${challenges ? `. Challenges: ${challenges}` : ""}${preferences ? `. I like: ${preferences}` : ""}`
      );

      res.json({ affirmations });
    } catch (error) {
      console.error("Affirmation error:", error);
      res.status(500).json({ error: "Failed to generate affirmations" });
    }
  });

  // Career Advisor
  app.post("/api/ai/career-advisor", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    try {
      const { topic, details, currentSituation } = req.body;

      const advice = await generateAIResponse(
        "You are a supportive career counselor. Provide practical, actionable career advice. Topics include: resume writing, interview preparation, job search strategies, career transitions, workplace challenges, and work-life balance. Be encouraging while providing concrete steps.",
        `Topic: ${topic}\nDetails: ${details || "None provided"}\nCurrent situation: ${currentSituation || "Not specified"}`
      );

      res.json({ advice });
    } catch (error) {
      console.error("Career advisor error:", error);
      res.status(500).json({ error: "Failed to get career advice" });
    }
  });

  // Relationship Advisor
  app.post("/api/ai/relationship-advisor", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    try {
      const { situation, relationshipType, goal } = req.body;

      const advice = await generateAIResponse(
        "You are a compassionate relationship counselor. Provide thoughtful advice on interpersonal relationships (family, friends, romantic, professional). Focus on: Communication strategies, Conflict resolution, Boundary setting, Emotional intelligence, Healthy relationship patterns. Never take sides. Emphasize understanding and growth.",
        `Relationship type: ${relationshipType || "general"}\nSituation: ${situation}\nGoal: ${goal || "Improve the relationship"}`
      );

      res.json({ advice });
    } catch (error) {
      console.error("Relationship advisor error:", error);
      res.status(500).json({ error: "Failed to get relationship advice" });
    }
  });

  // Financial Stress Advisor
  app.post("/api/ai/financial-advisor", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    try {
      const { concern, monthlyIncome, mainExpenses } = req.body;

      const advice = await generateAIResponse(
        "You are a supportive financial wellness advisor focusing on reducing financial stress. You are NOT a certified financial planner. Provide: Stress management around finances, Basic budgeting principles, Prioritization strategies, Resources for financial help, Emotional support for money anxiety. Always recommend consulting a financial professional for specific investment or legal advice.",
        `Financial concern: ${concern}${monthlyIncome ? `\nMonthly income: ${monthlyIncome}` : ""}${mainExpenses ? `\nMain expenses: ${mainExpenses}` : ""}`
      );

      res.json({ advice });
    } catch (error) {
      console.error("Financial advisor error:", error);
      res.status(500).json({ error: "Failed to get financial advice" });
    }
  });

  // Academic Stress Advisor
  app.post("/api/ai/academic-advisor", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    try {
      const { concern, academicLevel, deadline } = req.body;

      const advice = await generateAIResponse(
        "You are an understanding academic stress counselor. Help students with: Study planning and time management, Test anxiety, Academic burnout prevention, Motivation strategies, Balance between academics and wellbeing. Be encouraging and provide practical study tips alongside emotional support.",
        `Academic concern: ${concern}\nLevel: ${academicLevel || "Not specified"}${deadline ? `\nUpcoming deadline: ${deadline}` : ""}`
      );

      res.json({ advice });
    } catch (error) {
      console.error("Academic advisor error:", error);
      res.status(500).json({ error: "Failed to get academic advice" });
    }
  });

  // Learning Path Generator
  app.post("/api/ai/learning-path", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    try {
      const { topic, currentLevel, timeAvailable } = req.body;

      const pathContent = await generateAIResponse(
        `You are a personal development coach. Create structured learning paths for mental wellness topics like: Handling Overthinking, Building Confidence, Improving Communication, Breaking Bad Habits, Managing Anger, Developing Resilience. Format as a JSON array of lessons: [{"lessonNumber": 1, "title": "...", "description": "...", "duration": "15 min", "exercise": "..."}]. Include 5-7 progressive lessons.`,
        `Create a learning path for: ${topic}\nMy level: ${currentLevel || "beginner"}\nTime I can dedicate: ${timeAvailable || "15-20 min daily"}`
      );

      let lessons;
      try {
        const jsonMatch = pathContent.match(/\[.*\]/s);
        lessons = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      } catch {
        lessons = [];
      }

      res.json({ path: pathContent, lessons });
    } catch (error) {
      console.error("Learning path error:", error);
      res.status(500).json({ error: "Failed to generate learning path" });
    }
  });

  // Content Moderation
  app.post("/api/ai/moderate-content", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    try {
      const { content, context } = req.body;

      const responseContent = await generateAIResponse(
        `You are a content moderator for a mental health community. Analyze content for: 1. Toxic or harmful language 2. Triggering content (detailed self-harm, eating disorders) 3. Bullying or harassment 4. Misinformation about mental health 5. Spam or promotional content. Respond with JSON: {"isApproved": true/false, "flags": ["flag1"], "severity": "low/medium/high", "reason": "explanation", "suggestion": "how to improve if rejected"}`,
        `Moderate this ${context || "community post"}:\n\n${content}`
      );

      let moderation;
      try {
        const jsonMatch = responseContent.match(/\{.*\}/s);
        moderation = jsonMatch ? JSON.parse(jsonMatch[0]) : { isApproved: true, flags: [], severity: "low" };
      } catch {
        moderation = { isApproved: true, flags: [], severity: "low" };
      }

      res.json(moderation);
    } catch (error) {
      console.error("Content moderation error:", error);
      res.status(500).json({ error: "Failed to moderate content" });
    }
  });

  // Mood Analytics
  app.get("/api/ai/mood-analytics", async (req, res) => {
    try {
      const { period = "weekly" } = req.query;
      const now = new Date();
      const startDate = new Date(now);

      if (period === "monthly") {
        startDate.setMonth(startDate.getMonth() - 1);
      } else {
        startDate.setDate(startDate.getDate() - 7);
      }

      const recentMoods = await db.select().from(moodEntries)
        .where(gte(moodEntries.createdAt, startDate))
        .orderBy(moodEntries.createdAt);

      if (recentMoods.length === 0) {
        return res.json({ message: "Not enough mood data yet", analytics: null });
      }

      // Calculate basic analytics
      const moodScores: Record<string, number> = { happy: 5, calm: 4, neutral: 3, sad: 2, anxious: 1 };
      const avgScore = recentMoods.reduce((sum, m) => sum + (moodScores[m.mood] || 3), 0) / recentMoods.length;
      const moodCounts: Record<string, number> = {};
      recentMoods.forEach(m => { moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1; });
      const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";

      // Get AI insights
      if (!gemini) return res.json({ analytics: { periodType: period, averageMoodScore: Math.round(avgScore * 10) / 10, dominantMood, totalEntries: recentMoods.length, moodDistribution: moodCounts, insights: "You've been focused on your wellness lately! Consistency is key." } });

      try {
        const insights = await generateAIResponse(
          "You are a mood analytics expert. Provide brief, insightful analysis of mood patterns. Be encouraging and practical.",
          `Analyze this ${period} mood data: ${JSON.stringify(recentMoods.map(m => ({ mood: m.mood, stress: m.stressLevel, sleep: m.sleepHours, date: m.createdAt })))}. Average mood score: ${avgScore.toFixed(1)}/5. Dominant mood: ${dominantMood}. Provide insights and one actionable suggestion.`
        );

        res.json({
          analytics: {
            periodType: period,
            averageMoodScore: Math.round(avgScore * 10) / 10,
            dominantMood,
            totalEntries: recentMoods.length,
            moodDistribution: moodCounts,
            insights
          }
        });
      } catch (error) {
        console.error("Mood analytics AI fallback error:", error);
        res.json({
          analytics: {
            periodType: period,
            averageMoodScore: Math.round(avgScore * 10) / 10,
            dominantMood,
            totalEntries: recentMoods.length,
            moodDistribution: moodCounts,
            insights: "Your data shows a trend towards better self-awareness. Taking small steps daily is making an impact on your calibration."
          }
        });
      }
    } catch (error) {
      console.error("Mood analytics error:", error);
      res.status(500).json({ error: "Failed to generate analytics" });
    }
  });

  // Tasks CRUD
  app.get("/api/tasks", async (req, res) => {
    const userId = (req.user as User).id;
    const result = await storage.getTasks(userId);
    res.json(result);
  });

  app.post("/api/tasks", async (req, res) => {
    const userId = (req.user as User).id;
    const task = await storage.createTask(userId, { ...req.body, userId });
    res.json(task);
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    const userId = (req.user as User).id;
    const task = await storage.updateTask(userId, parseInt(req.params.id), req.body);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const userId = (req.user as User).id;
    await storage.deleteTask(userId, parseInt(req.params.id));
    res.status(204).send();
  });

  // Reminders CRUD
  app.get("/api/reminders", async (req, res) => {
    const userId = (req.user as User).id;
    const result = await storage.getReminders(userId);
    res.json(result);
  });

  app.post("/api/reminders", async (req, res) => {
    const userId = (req.user as User).id;
    const reminder = await storage.createReminder(userId, { ...req.body, userId });
    res.json(reminder);
  });

  app.delete("/api/reminders/:id", async (req, res) => {
    const userId = (req.user as User).id;
    await storage.deleteReminder(userId, parseInt(req.params.id));
    res.status(204).send();
  });

  // Habits CRUD
  app.get("/api/habits", async (req, res) => {
    const userId = (req.user as User).id;
    const result = await storage.getHabits(userId);
    res.json(result);
  });

  app.post("/api/habits", async (req, res) => {
    const userId = (req.user as User).id;
    const habit = await storage.createHabit(userId, { ...req.body, userId });
    res.json(habit);
  });

  app.post("/api/habits/:id/complete", async (req, res) => {
    const userId = (req.user as User).id;
    const habitId = parseInt(req.params.id);

    // Check if already completed today
    const completionsToday = await storage.getHabitCompletionsToday(habitId);
    if (completionsToday > 0) {
      return res.status(400).json({ message: "Habit already completed today" });
    }

    // Record the completion
    await storage.createHabitCompletion(habitId);

    // Get current habit and update streak
    const habits = await storage.getHabits(userId);
    const currentHabit = habits.find(h => h.id === habitId);
    const newStreak = (currentHabit?.streak || 0) + 1;

    const habit = await storage.updateHabit(userId, habitId, { streak: newStreak });
    res.json(habit);
  });

  app.delete("/api/habits/:id", async (req, res) => {
    const userId = (req.user as User).id;
    await storage.deleteHabit(userId, parseInt(req.params.id));
    res.status(204).send();
  });

  // Mood entries
  app.get("/api/mood-entries", async (req, res) => {
    const userId = (req.user as User).id;
    const result = await storage.getMoodEntries(userId);
    res.json(result);
  });

  app.post("/api/mood-entries", async (req, res) => {
    const userId = (req.user as User).id;
    const entry = await storage.createMoodEntry(userId, { ...req.body, userId });
    res.json(entry);
  });


  app.get("/api/ai/progress-insights", async (req, res) => {
    try {
      // Mock metrics for now as they require complex aggregation
      const metrics = [
        { label: "Goal Success", value: "85%" },
        { label: "Day Streak", value: "12" },
        { label: "Daily Avg", value: "9/10" },
        { label: "Self Growth", value: "+15%" },
      ];
      res.json({ insights: "Your resilience is improving!", metrics });
    } catch (error) {
      console.error("Progress insights error:", error);
      res.status(500).json({ error: "Failed to fetch progress insights" });
    }
  });

  // Journal entries
  app.get("/api/journal-entries", async (req, res) => {
    const userId = (req.user as User).id;
    const result = await storage.getJournalEntries(userId);
    res.json(result);
  });

  app.post("/api/journal-entries", async (req, res) => {
    const userId = (req.user as User).id;
    const entry = await storage.createJournalEntry(userId, { ...req.body, userId });
    res.json(entry);
  });

  // Therapist sessions
  app.get("/api/therapist-sessions", async (req, res) => {
    const userId = (req.user as User).id;
    const result = await storage.getTherapistSessions(userId);
    res.json(result);
  });

  app.post("/api/therapist-sessions", async (req, res) => {
    const userId = (req.user as User).id;
    const session = await storage.createTherapistSession(userId, { ...req.body, userId });
    res.json(session);
  });

  // AI Content Moderation using Gemini
  app.post("/api/ai/moderate-content", async (req, res) => {
    if (!gemini) return res.status(503).json({ error: "AI service unavailable" });
    try {
      const { content } = req.body;
      const moderationResponse = await generateAIResponse(
        "You are a content moderator. Analyze the following content for safety and community guidelines. Respond with a JSON object: { \"flagged\": boolean, \"advice\": string | null }. Flag content that is harmful, hateful, or promotes self-harm.",
        content
      );

      let results;
      try {
        const jsonMatch = moderationResponse.match(/\{.*\}/s);
        results = jsonMatch ? JSON.parse(jsonMatch[0]) : { flagged: false, advice: null };
      } catch {
        results = { flagged: false, advice: null };
      }

      res.json(results);
    } catch (error) {
      console.error("Moderation error:", error);
      res.json({ flagged: false, advice: null }); // Fallback to safe
    }
  });

  // Meals CRUD
  app.get("/api/meals", async (req, res) => {
    const userId = (req.user as User).id;
    const result = await storage.getMeals(userId);
    res.json(result);
  });

  app.post("/api/meals", async (req, res) => {
    const userId = (req.user as User).id;
    const meal = await storage.createMeal(userId, { ...req.body, userId });
    res.json(meal);
  });

  app.patch("/api/meals/:id", async (req, res) => {
    const userId = (req.user as User).id;
    const meal = await storage.updateMeal(userId, parseInt(req.params.id), req.body);
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    res.json(meal);
  });

  // Routines CRUD
  app.get("/api/routines", async (req, res) => {
    const userId = (req.user as User).id;
    const result = await storage.getRoutines(userId);
    res.json(result);
  });

  app.post("/api/routines", async (req, res) => {
    const userId = (req.user as User).id;
    const routine = await storage.createRoutine(userId, { ...req.body, userId });
    res.json(routine);
  });

  app.patch("/api/routines/:id", async (req, res) => {
    const userId = (req.user as User).id;
    const routine = await storage.updateRoutine(userId, parseInt(req.params.id), req.body);
    if (!routine) return res.status(404).json({ message: "Routine not found" });
    res.json(routine);
  });

  app.delete("/api/routines/:id", async (req, res) => {
    const userId = (req.user as User).id;
    await storage.deleteRoutine(userId, parseInt(req.params.id));
    res.status(204).send();
  });

  // Learning Paths CRUD
  app.get("/api/learning-paths", async (req, res) => {
    const userId = (req.user as User).id;
    const result = await storage.getLearningPaths(userId);
    res.json(result);
  });

  app.post("/api/learning-paths", async (req, res) => {
    const userId = (req.user as User).id;
    const path = await storage.createLearningPath(userId, { ...req.body, userId });
    res.json(path);
  });

  app.patch("/api/learning-paths/:id", async (req, res) => {
    const userId = (req.user as User).id;
    const path = await storage.updateLearningPath(userId, parseInt(req.params.id), req.body);
    if (!path) return res.status(404).json({ message: "Learning path not found" });
    res.json(path);
  });

  // Affirmations CRUD
  app.get("/api/affirmations", async (req, res) => {
    const userId = (req.user as User).id;
    const result = await storage.getAffirmations(userId);
    res.json(result);
  });

  app.post("/api/affirmations", async (req, res) => {
    const userId = (req.user as User).id;
    const affirmation = await storage.createAffirmation(userId, { ...req.body, userId });
    res.json(affirmation);
  });

  // Crisis Alerts (internal logging)
  app.get("/api/crisis-alerts", async (req, res) => {
    const userId = (req.user as User).id;
    const result = await storage.getCrisisAlerts(userId);
    res.json(result);
  });

  app.post("/api/crisis-alerts", async (req, res) => {
    const userId = (req.user as User).id;
    const alert = await storage.createCrisisAlert(userId, { ...req.body, userId });
    res.json(alert);
  });


  const httpServer = createServer(app);

  return httpServer;
}
