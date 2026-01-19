import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";
import { db } from "./db";
import { conversations, messages, moodEntries, tasks, reminders, habits, habitCompletions, journalEntries, therapistSessions } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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

      const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: MENTAL_HEALTH_SYSTEM_PROMPT },
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

      res.json({ message: aiMessage });
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

  // AI Session Preparation
  app.post("/api/ai/session-prep", async (req, res) => {
    const { therapistName, specialty, topics } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `You are a mental health session preparation assistant. Help users prepare for their therapy sessions by:
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
        { role: "system", content: `You are a supportive wellness progress analyst. Analyze the user's mental health journey data and provide:
1. Recognition of their achievements and progress
2. Patterns you notice in their mood data
3. Personalized recommendations for continued growth
4. Encouragement and motivation based on their goals
Be warm, supportive, and specific to their data. Focus on positive reinforcement while offering gentle suggestions for improvement.` },
        { role: "user", content: `Analyze my wellness journey:
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

  const httpServer = createServer(app);
  return httpServer;
}
