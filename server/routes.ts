import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";
import { db } from "./db";
import {
  conversations, messages, moodEntries, tasks, reminders, habits,
  habitCompletions, journalEntries, therapistSessions, crisisAlerts,
  moodAnalytics, routines, learningPaths, affirmations
} from "@shared/schema";
import { eq, desc, gte, lte, and } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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
  // AI Chat routes
  app.get("/api/conversations", async (req, res) => {
    const result = await db.select().from(conversations).orderBy(desc(conversations.createdAt));
    res.json(result);
  });

  app.post("/api/conversations", async (req, res) => {
    const { title, type = "chat" } = req.body;
    const [conversation] = await db.insert(conversations).values({ title: title || "New Chat", type }).returning();
    res.json(conversation);
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
    res.json(result);
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    const conversationId = parseInt(req.params.id);
    const { content, systemPrompt } = req.body;

    await db.insert(messages).values({ conversationId, role: "user", content });

    const existingMessages = await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
    const chatMessages = existingMessages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    if (systemPrompt) {
      chatMessages.unshift({ role: "system", content: systemPrompt });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      stream: true,
    });

    let fullResponse = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    await db.insert(messages).values({ conversationId, role: "assistant", content: fullResponse });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
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
    try {
      const { message, history = [] } = req.body;

      // Crisis detection
      const crisisCheck = detectCrisis(message);
      let systemPromptToUse = MENTAL_HEALTH_SYSTEM_PROMPT;

      if (crisisCheck.isCrisis) {
        // Log crisis alert
        await db.insert(crisisAlerts).values({
          triggerPhrase: crisisCheck.matchedPhrase || message.substring(0, 100),
          responseGiven: "Crisis protocol activated",
          severity: crisisCheck.severity,
        });

        // Enhanced prompt for crisis situations
        systemPromptToUse = `${MENTAL_HEALTH_SYSTEM_PROMPT}\n\nIMPORTANT: The user may be in crisis. Your response MUST:
1. First acknowledge their pain with deep empathy
2. Gently remind them they're not alone
3. Always include: "If you're in crisis, please reach out to the 988 Suicide & Crisis Lifeline by calling or texting 988. You can also chat at 988lifeline.org"
4. Offer a simple grounding exercise if appropriate
5. Never dismiss their feelings or offer toxic positivity`;
      }

      const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: systemPromptToUse },
        ...history.map((m: { role: string; message: string }) => ({
          role: (m.role === "ai" ? "assistant" : "user") as "user" | "assistant",
          content: m.message,
        })),
        { role: "user", content: message },
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatMessages,
        max_tokens: 512,
      });

      const aiMessage = response.choices[0]?.message?.content || "I'm here to listen. Could you tell me more?";

      res.json({
        message: aiMessage,
        isCrisis: crisisCheck.isCrisis,
        crisisSeverity: crisisCheck.severity
      });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({
        error: "Failed to get response",
        message: "I'm having trouble responding right now. Please try again in a moment."
      });
    }
  });

  // AI Mood Analysis
  app.post("/api/ai/analyze-mood", async (req, res) => {
    const { mood, note, sleepHours, stressLevel } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a compassionate mental health advisor. Provide brief, supportive insights based on mood data. Be empathetic and offer practical tips." },
        { role: "user", content: `Analyze this mood entry: Mood: ${mood}, Note: ${note || "none"}, Sleep: ${sleepHours || "unknown"} hours, Stress level: ${stressLevel || "unknown"}/10. Provide supportive insights and 2-3 practical tips.` },
      ],
    });

    res.json({ analysis: response.choices[0]?.message?.content });
  });

  // AI Sleep & Stress Insights
  app.post("/api/ai/sleep-stress-insights", async (req, res) => {
    const recentMoods = await db.select().from(moodEntries).orderBy(desc(moodEntries.createdAt)).limit(7);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a wellness advisor specializing in sleep and stress management. Analyze patterns and provide actionable insights." },
        { role: "user", content: `Based on this week's mood data: ${JSON.stringify(recentMoods)}, provide insights about sleep patterns and stress levels with practical recommendations.` },
      ],
    });

    res.json({ insights: response.choices[0]?.message?.content });
  });

  // AI Consultant Match
  app.post("/api/ai/consultant-match", async (req, res) => {
    const { concerns, preferences } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a mental health intake specialist. Based on user concerns, recommend the type of therapist or consultant that would best help them. Include specialty areas and what to look for." },
        { role: "user", content: `User concerns: ${concerns}. Preferences: ${preferences || "none specified"}. Recommend the best type of mental health professional for them.` },
      ],
    });

    res.json({ recommendation: response.choices[0]?.message?.content });
  });

  // AI Reminder Suggestions
  app.post("/api/ai/reminder-suggestions", async (req, res) => {
    const { currentReminders, userRoutine } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system", content: `You are a wellness routine advisor. Based on the user's current reminders and daily routine, suggest additional helpful reminders that could improve their mental health and wellbeing. Focus on:
1. Self-care activities
2. Mindfulness practices
3. Healthy habits
4. Stress management
5. Sleep hygiene
Provide practical, actionable reminders with suggested times.` },
        { role: "user", content: `Current reminders: ${currentReminders?.join(", ") || "none set"}. User's routine: ${userRoutine}. Suggest 3-5 additional wellness reminders that would complement their existing routine.` },
      ],
    });

    res.json({ suggestions: response.choices[0]?.message?.content });
  });

  // AI Session Preparation
  app.post("/api/ai/session-prep", async (req, res) => {
    const { therapistName, specialty, topics } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system", content: `You are a mental health session preparation assistant. Help users prepare for their therapy sessions by:
1. Suggesting how to articulate their concerns clearly
2. Providing grounding techniques to reduce session anxiety
3. Recommending questions to ask their therapist
4. Offering tips for getting the most out of the session
Be supportive, encouraging, and practical. Keep responses focused and actionable.` },
        { role: "user", content: `Help me prepare for my therapy session with ${therapistName} (specialty: ${specialty || "general therapy"}). Topics I want to discuss: ${topics || "general wellness check-in"}. Please provide preparation tips, suggested questions, and how to make the most of this session.` },
      ],
    });

    res.json({ preparation: response.choices[0]?.message?.content });
  });

  // AI Progress Insights Dashboard
  app.post("/api/ai/progress-insights", async (req, res) => {
    const { sessions, journalEntries, streak, goalsCompleted, habitsConsistency, weeklyMood, achievements, userGoals } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system", content: `You are a supportive wellness progress analyst. Analyze the user's mental health journey data and provide:
1. Recognition of their achievements and progress
2. Patterns you notice in their mood data
3. Personalized recommendations for continued growth
4. Encouragement and motivation based on their goals
Be warm, supportive, and specific to their data. Focus on positive reinforcement while offering gentle suggestions for improvement.` },
        {
          role: "user", content: `Analyze my wellness journey:
- Total therapy sessions: ${sessions}
- Journal entries written: ${journalEntries}
- Current streak: ${streak} days
- Goals completed: ${goalsCompleted}%
- Habits consistency: ${habitsConsistency}%
- Weekly mood scores (Mon-Sun): ${weeklyMood?.join(", ") || "not tracked"}
- Achievements earned: ${achievements?.join(", ") || "none yet"}
- My wellness goals: ${userGoals}

Please provide personalized insights and recommendations for my mental health journey.` },
      ],
    });

    res.json({ insights: response.choices[0]?.message?.content });
  });

  // AI Habit Coach
  app.post("/api/ai/habit-coach", async (req, res) => {
    const { habit, currentStreak, challenges } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an encouraging habit coach. Provide motivation, tips, and strategies for building healthy habits. Be supportive and practical." },
        { role: "user", content: `Help me with this habit: ${habit}. Current streak: ${currentStreak} days. Challenges: ${challenges || "none mentioned"}. Give me motivation and tips.` },
      ],
    });

    res.json({ coaching: response.choices[0]?.message?.content });
  });

  // CBT Thought Reframing
  app.post("/api/ai/cbt-reframe", async (req, res) => {
    try {
      const { thought, context } = req.body;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system", content: `You are a CBT (Cognitive Behavioral Therapy) thought reframing coach. Your role is to:
1. Identify the cognitive distortion in the user's thought (e.g., all-or-nothing thinking, catastrophizing, mind reading)
2. Validate their feelings first - don't dismiss the emotion
3. Gently challenge the thought with evidence-based questions
4. Provide 2-3 alternative, balanced thoughts
5. Suggest one practical action they can take

Format your response as:
**Cognitive Pattern Detected:** [name of distortion]
**Your Feelings Are Valid:** [brief validation]
**Let's Explore:** [reframing questions]
**Alternative Perspectives:**
1. [balanced thought 1]
2. [balanced thought 2]
**One Small Step:** [actionable suggestion]` },
          { role: "user", content: `Help me reframe this thought: "${thought}"${context ? `. Context: ${context}` : ""}` },
        ],
        max_tokens: 600,
      });

      res.json({ reframe: response.choices[0]?.message?.content });
    } catch (error) {
      console.error("CBT reframe error:", error);
      res.status(500).json({ error: "Failed to generate reframe" });
    }
  });

  // Grounding Techniques Generator
  app.post("/api/ai/grounding-technique", async (req, res) => {
    try {
      const { currentMood, situation, preferredType } = req.body;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system", content: `You are a calming grounding technique guide. Based on the user's current state, provide a personalized grounding exercise. Types include:
- 5-4-3-2-1 sensory technique
- Box breathing (4-4-4-4)
- Progressive muscle relaxation
- Body scan meditation
- Mindful observation
- Cold water technique

Provide step-by-step instructions that are easy to follow. Keep it concise (under 150 words) and calming.` },
          { role: "user", content: `I'm feeling ${currentMood || "anxious"}${situation ? `. Situation: ${situation}` : ""}${preferredType ? `. Preferred technique type: ${preferredType}` : ""}. Give me a grounding exercise.` },
        ],
        max_tokens: 300,
      });

      res.json({ technique: response.choices[0]?.message?.content });
    } catch (error) {
      console.error("Grounding technique error:", error);
      res.status(500).json({ error: "Failed to generate technique" });
    }
  });

  // Journal AI Insights
  app.post("/api/ai/journal-insights", async (req, res) => {
    try {
      const { content, title } = req.body;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system", content: `You are an empathetic journal analyst. Analyze the journal entry and provide:
1. **Emotional Insights:** Key emotions detected and their intensity
2. **Triggers Identified:** Possible triggers or stressors mentioned
3. **Patterns Noticed:** Behavioral or thought patterns (connect to past if provided)
4. **Gratitude Prompt:** A personalized gratitude prompt based on the entry
5. **Reflection Question:** One thoughtful question for deeper self-exploration

Be warm, non-judgmental, and supportive. Format with clear sections.` },
          { role: "user", content: `Analyze this journal entry titled "${title || "Untitled"}":\n\n${content}` },
        ],
        max_tokens: 500,
      });

      const insights = response.choices[0]?.message?.content || "";

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
    try {
      const { sessionNotes, therapistName, sessionGoals } = req.body;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system", content: `You are a therapy session summarizer. Create a helpful summary that includes:
1. **Key Takeaways:** Main insights from the session
2. **Progress Made:** What went well or breakthroughs
3. **Growth Areas:** Areas to continue working on
4. **Action Items:** Homework or things to practice
5. **Next Steps:** Suggestions for the next session

Be encouraging and highlight positive progress while being honest about areas for growth.` },
          { role: "user", content: `Summarize my therapy session${therapistName ? ` with ${therapistName}` : ""}${sessionGoals ? `. Goals: ${sessionGoals}` : ""}\n\nSession notes:\n${sessionNotes}` },
        ],
        max_tokens: 500,
      });

      res.json({
        summary: response.choices[0]?.message?.content,
      });
    } catch (error) {
      console.error("Session summary error:", error);
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });

  // Routine Generator
  app.post("/api/ai/routine-generator", async (req, res) => {
    try {
      const { goal, wakeTime, sleepTime, currentChallenges } = req.body;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system", content: `You are a wellness routine designer. Create personalized daily routines for mental health goals. Include specific times and duration for each activity. Goals can include: anxiety management, sleep improvement, productivity, self-care.

Format as a JSON array of activities:
[{"time": "7:00 AM", "activity": "Morning meditation", "duration": "10 min", "benefit": "Reduces morning anxiety"}]

Include 6-8 activities spread throughout the day. Be realistic and achievable.` },
          { role: "user", content: `Create a ${goal} routine for me. Wake time: ${wakeTime || "7:00 AM"}, Sleep time: ${sleepTime || "10:00 PM"}${currentChallenges ? `. Challenges: ${currentChallenges}` : ""}` },
        ],
        max_tokens: 600,
      });

      const content = response.choices[0]?.message?.content || "[]";
      let schedule;
      try {
        // Try to parse JSON from the response
        const jsonMatch = content.match(/\[.*\]/s);
        schedule = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      } catch {
        schedule = [];
      }

      res.json({
        routine: content,
        schedule
      });
    } catch (error) {
      console.error("Routine generator error:", error);
      res.status(500).json({ error: "Failed to generate routine" });
    }
  });

  // Daily Affirmation Generator
  app.post("/api/ai/daily-affirmation", async (req, res) => {
    try {
      const { currentMood, challenges, preferences } = req.body;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system", content: `You are a caring affirmation creator. Generate 3 personalized, meaningful affirmations based on the user's current state. Affirmations should be:
- First person ("I am" / "I have" / "I can")
- Present tense
- Positive and empowering
- Specific to their situation
- Not toxic positivity - realistic and grounded

Format:
1. [affirmation 1]
2. [affirmation 2]
3. [affirmation 3]` },
          { role: "user", content: `Generate affirmations for me. Current mood: ${currentMood || "neutral"}${challenges ? `. Challenges: ${challenges}` : ""}${preferences ? `. I like: ${preferences}` : ""}` },
        ],
        max_tokens: 200,
      });

      res.json({ affirmations: response.choices[0]?.message?.content });
    } catch (error) {
      console.error("Affirmation error:", error);
      res.status(500).json({ error: "Failed to generate affirmations" });
    }
  });

  // Career Advisor
  app.post("/api/ai/career-advisor", async (req, res) => {
    try {
      const { topic, details, currentSituation } = req.body;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a supportive career counselor. Provide practical, actionable career advice. Topics include: resume writing, interview preparation, job search strategies, career transitions, workplace challenges, and work-life balance. Be encouraging while providing concrete steps.` },
          { role: "user", content: `Topic: ${topic}\nDetails: ${details || "None provided"}\nCurrent situation: ${currentSituation || "Not specified"}` },
        ],
        max_tokens: 500,
      });

      res.json({ advice: response.choices[0]?.message?.content });
    } catch (error) {
      console.error("Career advisor error:", error);
      res.status(500).json({ error: "Failed to get career advice" });
    }
  });

  // Relationship Advisor
  app.post("/api/ai/relationship-advisor", async (req, res) => {
    try {
      const { situation, relationshipType, goal } = req.body;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system", content: `You are a compassionate relationship counselor. Provide thoughtful advice on interpersonal relationships (family, friends, romantic, professional). Focus on:
- Communication strategies
- Conflict resolution
- Boundary setting
- Emotional intelligence
- Healthy relationship patterns

Never take sides. Emphasize understanding and growth.` },
          { role: "user", content: `Relationship type: ${relationshipType || "general"}\nSituation: ${situation}\nGoal: ${goal || "Improve the relationship"}` },
        ],
        max_tokens: 500,
      });

      res.json({ advice: response.choices[0]?.message?.content });
    } catch (error) {
      console.error("Relationship advisor error:", error);
      res.status(500).json({ error: "Failed to get relationship advice" });
    }
  });

  // Financial Stress Advisor
  app.post("/api/ai/financial-advisor", async (req, res) => {
    try {
      const { concern, monthlyIncome, mainExpenses } = req.body;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system", content: `You are a supportive financial wellness advisor focusing on reducing financial stress. You are NOT a certified financial planner. Provide:
- Stress management around finances
- Basic budgeting principles
- Prioritization strategies
- Resources for financial help
- Emotional support for money anxiety

Always recommend consulting a financial professional for specific investment or legal advice.` },
          { role: "user", content: `Financial concern: ${concern}${monthlyIncome ? `\nMonthly income: ${monthlyIncome}` : ""}${mainExpenses ? `\nMain expenses: ${mainExpenses}` : ""}` },
        ],
        max_tokens: 500,
      });

      res.json({ advice: response.choices[0]?.message?.content });
    } catch (error) {
      console.error("Financial advisor error:", error);
      res.status(500).json({ error: "Failed to get financial advice" });
    }
  });

  // Academic Stress Advisor
  app.post("/api/ai/academic-advisor", async (req, res) => {
    try {
      const { concern, academicLevel, deadline } = req.body;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system", content: `You are an understanding academic stress counselor. Help students with:
- Study planning and time management
- Test anxiety
- Academic burnout prevention
- Motivation strategies
- Balance between academics and wellbeing

Be encouraging and provide practical study tips alongside emotional support.` },
          { role: "user", content: `Academic concern: ${concern}\nLevel: ${academicLevel || "Not specified"}${deadline ? `\nUpcoming deadline: ${deadline}` : ""}` },
        ],
        max_tokens: 500,
      });

      res.json({ advice: response.choices[0]?.message?.content });
    } catch (error) {
      console.error("Academic advisor error:", error);
      res.status(500).json({ error: "Failed to get academic advice" });
    }
  });

  // Learning Path Generator
  app.post("/api/ai/learning-path", async (req, res) => {
    try {
      const { topic, currentLevel, timeAvailable } = req.body;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system", content: `You are a personal development coach. Create structured learning paths for mental wellness topics like:
- Handling Overthinking
- Building Confidence
- Improving Communication
- Breaking Bad Habits
- Managing Anger
- Developing Resilience

Format as a JSON array of lessons:
[{"lessonNumber": 1, "title": "...", "description": "...", "duration": "15 min", "exercise": "..."}]

Include 5-7 progressive lessons.` },
          { role: "user", content: `Create a learning path for: ${topic}\nMy level: ${currentLevel || "beginner"}\nTime I can dedicate: ${timeAvailable || "15-20 min daily"}` },
        ],
        max_tokens: 700,
      });

      const content = response.choices[0]?.message?.content || "[]";
      let lessons;
      try {
        const jsonMatch = content.match(/\[.*\]/s);
        lessons = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      } catch {
        lessons = [];
      }

      res.json({
        learningPath: content,
        lessons
      });
    } catch (error) {
      console.error("Learning path error:", error);
      res.status(500).json({ error: "Failed to generate learning path" });
    }
  });

  // Content Moderation
  app.post("/api/ai/moderate-content", async (req, res) => {
    try {
      const { content, context } = req.body;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system", content: `You are a content moderator for a mental health community. Analyze content for:
1. Toxic or harmful language
2. Triggering content (detailed self-harm, eating disorders)
3. Bullying or harassment
4. Misinformation about mental health
5. Spam or promotional content

Respond with JSON: {"isApproved": true/false, "flags": ["flag1", "flag2"], "severity": "low/medium/high", "reason": "explanation", "suggestion": "how to improve if rejected"}` },
          { role: "user", content: `Moderate this ${context || "community post"}:\n\n${content}` },
        ],
        max_tokens: 300,
      });

      const responseContent = response.choices[0]?.message?.content || "{}";
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
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a mood analytics expert. Provide brief, insightful analysis of mood patterns. Be encouraging and practical." },
          { role: "user", content: `Analyze this ${period} mood data: ${JSON.stringify(recentMoods.map(m => ({ mood: m.mood, stress: m.stressLevel, sleep: m.sleepHours, date: m.createdAt })))}. Average mood score: ${avgScore.toFixed(1)}/5. Dominant mood: ${dominantMood}. Provide insights and one actionable suggestion.` },
        ],
        max_tokens: 300,
      });

      res.json({
        analytics: {
          periodType: period,
          averageMoodScore: Math.round(avgScore * 10) / 10,
          dominantMood,
          totalEntries: recentMoods.length,
          moodDistribution: moodCounts,
          insights: response.choices[0]?.message?.content
        }
      });
    } catch (error) {
      console.error("Mood analytics error:", error);
      res.status(500).json({ error: "Failed to generate analytics" });
    }
  });

  // Tasks CRUD
  app.get("/api/tasks", async (req, res) => {
    const result = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
    res.json(result);
  });

  app.post("/api/tasks", async (req, res) => {
    const [task] = await db.insert(tasks).values(req.body).returning();
    res.json(task);
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    const [task] = await db.update(tasks).set(req.body).where(eq(tasks.id, parseInt(req.params.id))).returning();
    res.json(task);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    await db.delete(tasks).where(eq(tasks.id, parseInt(req.params.id)));
    res.status(204).send();
  });

  // Reminders CRUD
  app.get("/api/reminders", async (req, res) => {
    const result = await db.select().from(reminders).orderBy(reminders.time);
    res.json(result);
  });

  app.post("/api/reminders", async (req, res) => {
    const [reminder] = await db.insert(reminders).values(req.body).returning();
    res.json(reminder);
  });

  app.delete("/api/reminders/:id", async (req, res) => {
    await db.delete(reminders).where(eq(reminders.id, parseInt(req.params.id)));
    res.status(204).send();
  });

  // Habits CRUD
  app.get("/api/habits", async (req, res) => {
    const result = await db.select().from(habits).orderBy(desc(habits.createdAt));
    res.json(result);
  });

  app.post("/api/habits", async (req, res) => {
    const [habit] = await db.insert(habits).values(req.body).returning();
    res.json(habit);
  });

  app.post("/api/habits/:id/complete", async (req, res) => {
    const habitId = parseInt(req.params.id);
    await db.insert(habitCompletions).values({ habitId });
    const [currentHabit] = await db.select().from(habits).where(eq(habits.id, habitId));
    const [habit] = await db.update(habits).set({ streak: (currentHabit?.streak || 0) + 1 }).where(eq(habits.id, habitId)).returning();
    res.json(habit);
  });

  // Mood entries
  app.get("/api/mood-entries", async (req, res) => {
    const result = await db.select().from(moodEntries).orderBy(desc(moodEntries.createdAt));
    res.json(result);
  });

  app.post("/api/mood-entries", async (req, res) => {
    const [entry] = await db.insert(moodEntries).values(req.body).returning();
    res.json(entry);
  });

  // Journal entries
  app.get("/api/journal-entries", async (req, res) => {
    const result = await db.select().from(journalEntries).orderBy(desc(journalEntries.createdAt));
    res.json(result);
  });

  app.post("/api/journal-entries", async (req, res) => {
    const [entry] = await db.insert(journalEntries).values(req.body).returning();
    res.json(entry);
  });

  // Therapist sessions
  app.get("/api/therapist-sessions", async (req, res) => {
    const result = await db.select().from(therapistSessions).orderBy(therapistSessions.sessionDate);
    res.json(result);
  });

  app.post("/api/therapist-sessions", async (req, res) => {
    const [session] = await db.insert(therapistSessions).values(req.body).returning();
    res.json(session);
  });

  // AI Analytics & Progress
  app.get("/api/ai/mood-analytics", async (req, res) => {
    try {
      const { period = "weekly" } = req.query;
      const analytics = {
        summary: "You've been feeling mostly calm and happy this week. Stress levels peaked on Wednesday.",
        trend: [
          { date: "2024-01-14", avgIntensity: 3, dominantMood: "neutral" },
          { date: "2024-01-15", avgIntensity: 4, dominantMood: "calm" },
          { date: "2024-01-16", avgIntensity: 2, dominantMood: "sad" },
          { date: "2024-01-17", avgIntensity: 5, dominantMood: "happy" },
          { date: "2024-01-18", avgIntensity: 4, dominantMood: "calm" },
        ],
        distribution: [
          { mood: "Happy", count: 12 },
          { mood: "Calm", count: 8 },
          { mood: "Anxious", count: 3 },
          { mood: "Sad", count: 2 },
        ],
        insights: "Meditation seems to correlate with your 'Calm' days. Consider increasing your session time when feeling 'Anxious'."
      };
      res.json({ analytics });
    } catch (error) {
      console.error("Mood analytics error:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/ai/progress-insights", async (req, res) => {
    try {
      const insights = "Your emotional resilience has improved by 15% this month. Your most consistent positive habit is morning meditation. We've detected a significant reduction in late-night anxiety peaks.";
      const metrics = [
        { label: "Goal Success", value: "85%" },
        { label: "Day Streak", value: "12" },
        { label: "Daily Avg", value: "9/10" },
        { label: "Self Growth", value: "+15%" },
      ];
      res.json({ insights, metrics });
    } catch (error) {
      console.error("Progress insights error:", error);
      res.status(500).json({ error: "Failed to fetch progress insights" });
    }
  });

  // AI Content Moderation
  app.post("/api/ai/moderate-content", async (req, res) => {
    try {
      const { content } = req.body;
      const response = await openai.moderations.create({ input: content });
      const [results] = response.results;
      res.json({
        flagged: results.flagged,
        categories: results.categories,
        advice: results.flagged ? "This content may be sensitive or violate community guidelines." : null
      });
    } catch (error) {
      console.error("Moderation error:", error);
      res.status(500).json({ error: "Moderation failed" });
    }
  });

  // Post-Session Summary
  app.post("/api/ai/post-session-summary", async (req, res) => {
    try {
      const { sessionNotes, growthAreas } = req.body;
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a clinical assistant helping a user summarize their therapy session. Focus on: 1. Main themes, 2. Emotional breakthrough, 3. Homework/Action items, 4. Growth highlights. Be supportive and professional." },
          { role: "user", content: `Summarize my therapy session notes: "${sessionNotes}". Growth areas discussed: ${growthAreas || "none mentioned"}.` },
        ],
      });
      res.json({ summary: response.choices[0]?.message?.content });
    } catch (error) {
      console.error("Session summary error:", error);
      res.status(500).json({ error: "Failed to generate session summary" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
