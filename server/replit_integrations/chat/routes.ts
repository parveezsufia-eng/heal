import type { Express, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { chatStorage } from "./storage";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const gemini = genAI;

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

export function registerChatRoutes(app: Express): void {
  // Get all conversations
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const conversations = await chatStorage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get single conversation with messages
  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      const conversation = await chatStorage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      const messages = await chatStorage.getMessagesByConversation(id);
      res.json({ ...conversation, messages });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Create new conversation
  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      const conversation = await chatStorage.createConversation(title || "New Chat");
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Delete conversation
  app.delete("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      await chatStorage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Send message and get AI response (streaming)
  app.post("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id as string);
      const { content } = req.body;

      // Save user message
      await chatStorage.createMessage(conversationId, "user", content);

      // Get conversation history for context
      const messages = await chatStorage.getMessagesByConversation(conversationId);

      const contents = [
        { role: "user", parts: [{ text: MENTAL_HEALTH_SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "I understand. I'm here to support you." }] },
        ...messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      ];

      // Set up SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Stream response from Gemini
      const responseStream = await gemini.models.generateContentStream({
        model: "gemini-2.0-flash",
        contents,
      });

      let fullResponse = "";

      for await (const chunk of responseStream) {
        const chunkText = chunk.text || "";
        if (chunkText) {
          fullResponse += chunkText;
          res.write(`data: ${JSON.stringify({ content: chunkText })}\n\n`);
        }
      }

      // Save assistant message
      await chatStorage.createMessage(conversationId, "assistant", fullResponse);

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error sending message:", error);
      // Check if headers already sent (SSE streaming started)
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to send message" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });

  // Simple non-streaming chat endpoint for mobile apps
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { message, history = [] } = req.body;

      const contents = [
        { role: "user", parts: [{ text: MENTAL_HEALTH_SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "I understand. I'm here to support you." }] },
        ...history.map((m: { role: string; message: string }) => ({
          role: m.role === "ai" ? "model" : "user",
          parts: [{ text: m.message }],
        })),
        { role: "user", parts: [{ text: message }] },
      ];

      const response = await gemini.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
      });

      const aiMessage = response.text || "I'm here to listen. Could you tell me more?";

      res.json({ message: aiMessage });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({
        error: "Failed to get response",
        message: "I'm having trouble responding right now. Please try again in a moment."
      });
    }
  });
}

