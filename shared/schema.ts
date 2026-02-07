import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number"),
  name: text("name").notNull(),
  age: integer("age"),
  sex: text("sex"),
  medicalHistory: text("medical_history"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phoneNumber: true,
  name: true,
  age: true,
  sex: true,
  medicalHistory: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Conversations for AI chat
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mood: text("mood").notNull(),
  note: text("note"),
  sleepHours: integer("sleep_hours"),
  stressLevel: integer("stress_level"),
  autoMoodTag: text("auto_mood_tag"), // AI-detected mood tag
  emotionalIntensity: integer("emotional_intensity"), // 1-10 scale
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Tasks for to-do list
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  completed: boolean("completed").default(false).notNull(),
  category: text("category").default("general"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Reminders
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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

// Journal entries with AI insights
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mood: text("mood"),
  aiInsights: text("ai_insights"), // AI-generated emotional insights
  triggers: text("triggers"), // Identified emotional triggers
  patterns: text("patterns"), // Detected behavioral patterns
  gratitudePrompt: text("gratitude_prompt"), // AI-generated gratitude prompt
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Therapist sessions
export const therapistSessions = pgTable("therapist_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  therapistName: text("therapist_name").notNull(),
  specialty: text("specialty"),
  sessionDate: timestamp("session_date").notNull(),
  notes: text("notes"),
  status: text("status").default("scheduled"),
  aiSummary: text("ai_summary"), // AI-generated session summary
  growthAreas: text("growth_areas"), // AI-identified growth areas
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Crisis alerts for tracking crisis detection events
export const crisisAlerts = pgTable("crisis_alerts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  triggerPhrase: text("trigger_phrase").notNull(),
  responseGiven: text("response_given").notNull(),
  severity: text("severity").default("medium"), // low, medium, high
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Mood analytics for weekly/monthly aggregated insights
export const moodAnalytics = pgTable("mood_analytics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  periodType: text("period_type").notNull(), // weekly, monthly
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  averageMoodScore: integer("average_mood_score"),
  dominantMood: text("dominant_mood"),
  stressTrend: text("stress_trend"), // increasing, decreasing, stable
  insights: text("insights"), // AI-generated period insights
  burnoutRisk: integer("burnout_risk"), // 1-10 scale
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Personalized daily routines
export const routines = pgTable("routines", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  routineType: text("routine_type").notNull(), // anxiety, sleep, productivity, self-care
  schedule: jsonb("schedule"), // JSON array of time-based activities
  isActive: boolean("is_active").default(true),
  adaptedFromBehavior: boolean("adapted_from_behavior").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Personalized learning paths
export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // e.g., "Handling Overthinking"
  description: text("description"),
  lessons: jsonb("lessons"), // JSON array of lesson objects
  progressPercent: integer("progress_percent").default(0),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// AI-generated affirmations
export const affirmations = pgTable("affirmations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  category: text("category"), // motivation, self-love, confidence, etc.
  basedOnMood: text("based_on_mood"), // What mood this was generated for
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Meal entries for nutritional tracking
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  name: text("name").notNull(),
  calories: integer("calories").notNull(),
  time: text("time"),
  completed: boolean("completed").default(false).notNull(),
  prescribedBy: text("prescribed_by"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Session table for connect-pg-simple
export const sessions = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Insert schemas
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true });
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({ id: true, createdAt: true });
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;

export const insertReminderSchema = createInsertSchema(reminders).omit({ id: true, createdAt: true });
export type InsertReminder = z.infer<typeof insertReminderSchema>;

export const insertHabitSchema = createInsertSchema(habits).omit({ id: true, createdAt: true });
export type InsertHabit = z.infer<typeof insertHabitSchema>;

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({ id: true, createdAt: true });
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

export const insertTherapistSessionSchema = createInsertSchema(therapistSessions).omit({ id: true, createdAt: true });
export type InsertTherapistSession = z.infer<typeof insertTherapistSessionSchema>;

export const insertCrisisAlertSchema = createInsertSchema(crisisAlerts).omit({ id: true, createdAt: true });
export type InsertCrisisAlert = z.infer<typeof insertCrisisAlertSchema>;

export const insertMoodAnalyticsSchema = createInsertSchema(moodAnalytics).omit({ id: true, createdAt: true });
export type InsertMoodAnalytic = z.infer<typeof insertMoodAnalyticsSchema>;

export const insertRoutineSchema = createInsertSchema(routines).omit({ id: true, createdAt: true });
export type InsertRoutine = z.infer<typeof insertRoutineSchema>;

export const insertLearningPathSchema = createInsertSchema(learningPaths).omit({ id: true, createdAt: true });
export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;

export const insertAffirmationSchema = createInsertSchema(affirmations).omit({ id: true, createdAt: true });
export type InsertAffirmation = z.infer<typeof insertAffirmationSchema>;

export const insertMealSchema = createInsertSchema(meals).omit({ id: true, createdAt: true });
export type InsertMeal = z.infer<typeof insertMealSchema>;

// Types
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Reminder = typeof reminders.$inferSelect;
export type Habit = typeof habits.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type TherapistSession = typeof therapistSessions.$inferSelect;
export type CrisisAlert = typeof crisisAlerts.$inferSelect;
export type MoodAnalytic = typeof moodAnalytics.$inferSelect;
export type Routine = typeof routines.$inferSelect;
export type LearningPath = typeof learningPaths.$inferSelect;
export type Affirmation = typeof affirmations.$inferSelect;
export type Meal = typeof meals.$inferSelect;
