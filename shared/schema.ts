import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Conversations for AI chat
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull().default("chat"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Mood entries for mood tracking
export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  mood: text("mood").notNull(),
  note: text("note"),
  sleepHours: integer("sleep_hours"),
  stressLevel: integer("stress_level"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Tasks for to-do list
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").default(false).notNull(),
  category: text("category").default("general"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Reminders
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  time: timestamp("time").notNull(),
  recurring: boolean("recurring").default(false),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Habits for habit tracking
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  frequency: text("frequency").default("daily"),
  streak: integer("streak").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Habit completions
export const habitCompletions = pgTable("habit_completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull().references(() => habits.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Journal entries
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mood: text("mood"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Therapist sessions
export const therapistSessions = pgTable("therapist_sessions", {
  id: serial("id").primaryKey(),
  therapistName: text("therapist_name").notNull(),
  specialty: text("specialty"),
  sessionDate: timestamp("session_date").notNull(),
  notes: text("notes"),
  status: text("status").default("scheduled"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({ id: true, createdAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export const insertReminderSchema = createInsertSchema(reminders).omit({ id: true, createdAt: true });
export const insertHabitSchema = createInsertSchema(habits).omit({ id: true, createdAt: true });
export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({ id: true, createdAt: true });
export const insertTherapistSessionSchema = createInsertSchema(therapistSessions).omit({ id: true, createdAt: true });

export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Reminder = typeof reminders.$inferSelect;
export type Habit = typeof habits.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type TherapistSession = typeof therapistSessions.$inferSelect;
