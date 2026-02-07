import {
  type User, type InsertUser, users,
  type MoodEntry, type InsertMoodEntry, moodEntries,
  type Task, type InsertTask, tasks,
  type Reminder, type InsertReminder, reminders,
  type Habit, type InsertHabit, habits,
  habitCompletions,
  type JournalEntry, type InsertJournalEntry, journalEntries,
  type Conversation, type InsertConversation, conversations,
  type Message, type InsertMessage, messages,
  type TherapistSession, type InsertTherapistSession, therapistSessions,
  type Routine, type InsertRoutine, routines,
  type LearningPath, type InsertLearningPath, learningPaths,
  type Affirmation, type InsertAffirmation, affirmations,
  type CrisisAlert, type InsertCrisisAlert, crisisAlerts,
  type MoodAnalytic, type InsertMoodAnalytic, moodAnalytics,
  type Meal, type InsertMeal, meals
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;

  // Moods
  getMoodEntries(userId: string): Promise<MoodEntry[]>;
  createMoodEntry(userId: string, entry: InsertMoodEntry): Promise<MoodEntry>;

  // Tasks
  getTasks(userId: string): Promise<Task[]>;
  createTask(userId: string, task: InsertTask): Promise<Task>;
  updateTask(userId: string, id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(userId: string, id: number): Promise<void>;

  // Reminders
  getReminders(userId: string): Promise<Reminder[]>;
  createReminder(userId: string, reminder: InsertReminder): Promise<Reminder>;
  updateReminder(userId: string, id: number, reminder: Partial<InsertReminder>): Promise<Reminder | undefined>;
  deleteReminder(userId: string, id: number): Promise<void>;

  // Habits
  getHabits(userId: string): Promise<Habit[]>;
  createHabit(userId: string, habit: InsertHabit): Promise<Habit>;
  updateHabit(userId: string, id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined>;

  // Journal
  getJournalEntries(userId: string): Promise<JournalEntry[]>;
  createJournalEntry(userId: string, entry: InsertJournalEntry): Promise<JournalEntry>;

  // AI Chat
  getConversations(userId: string): Promise<Conversation[]>;
  createConversation(userId: string, conversation: InsertConversation): Promise<Conversation>;
  getMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Therapist
  getTherapistSessions(userId: string): Promise<TherapistSession[]>;
  createTherapistSession(userId: string, session: InsertTherapistSession): Promise<TherapistSession>;

  // Routines
  getRoutines(userId: string): Promise<Routine[]>;
  createRoutine(userId: string, routine: InsertRoutine): Promise<Routine>;

  // Learning Paths
  getLearningPaths(userId: string): Promise<LearningPath[]>;
  createLearningPath(userId: string, path: InsertLearningPath): Promise<LearningPath>;
  updateLearningPath(userId: string, id: number, path: Partial<InsertLearningPath>): Promise<LearningPath | undefined>;

  // Affirmations
  getAffirmations(userId: string): Promise<Affirmation[]>;
  createAffirmation(userId: string, affirmation: InsertAffirmation): Promise<Affirmation>;

  // Meals
  getMeals(userId: string): Promise<Meal[]>;
  createMeal(userId: string, meal: InsertMeal): Promise<Meal>;
  updateMeal(userId: string, id: number, meal: Partial<InsertMeal>): Promise<Meal | undefined>;

  // Crisis Alerts
  getCrisisAlerts(userId: string): Promise<CrisisAlert[]>;
  createCrisisAlert(userId: string, alert: InsertCrisisAlert): Promise<CrisisAlert>;

  // Mood Analytics
  getMoodAnalytics(userId: string): Promise<MoodAnalytic[]>;
  createMoodAnalytics(userId: string, analytics: InsertMoodAnalytic): Promise<MoodAnalytic>;

  // Habit Completions (for streak tracking)
  createHabitCompletion(habitId: number): Promise<void>;
  getHabitCompletionsToday(habitId: number): Promise<number>;

  // Additional CRUD
  deleteHabit(userId: string, id: number): Promise<void>;
  updateRoutine(userId: string, id: number, routine: Partial<InsertRoutine>): Promise<Routine | undefined>;
  deleteRoutine(userId: string, id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  // Moods
  async getMoodEntries(userId: string): Promise<MoodEntry[]> {
    return await db.select().from(moodEntries).where(eq(moodEntries.userId, userId)).orderBy(desc(moodEntries.createdAt));
  }

  async createMoodEntry(userId: string, entry: InsertMoodEntry): Promise<MoodEntry> {
    const [result] = await db.insert(moodEntries).values({ ...entry, userId }).returning();
    return result;
  }

  // Tasks
  async getTasks(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
  }

  async createTask(userId: string, task: InsertTask): Promise<Task> {
    const [result] = await db.insert(tasks).values({ ...task, userId }).returning();
    return result;
  }

  async updateTask(userId: string, id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const [result] = await db.update(tasks).set(task).where(and(eq(tasks.id, id), eq(tasks.userId, userId))).returning();
    return result;
  }

  async deleteTask(userId: string, id: number): Promise<void> {
    await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  }

  // Reminders
  async getReminders(userId: string): Promise<Reminder[]> {
    return await db.select().from(reminders).where(eq(reminders.userId, userId)).orderBy(desc(reminders.createdAt));
  }

  async createReminder(userId: string, reminder: InsertReminder): Promise<Reminder> {
    const [result] = await db.insert(reminders).values({ ...reminder, userId }).returning();
    return result;
  }

  async updateReminder(userId: string, id: number, reminder: Partial<InsertReminder>): Promise<Reminder | undefined> {
    const [result] = await db.update(reminders).set(reminder).where(and(eq(reminders.id, id), eq(reminders.userId, userId))).returning();
    return result;
  }

  async deleteReminder(userId: string, id: number): Promise<void> {
    await db.delete(reminders).where(and(eq(reminders.id, id), eq(reminders.userId, userId)));
  }

  // Habits
  async getHabits(userId: string): Promise<Habit[]> {
    return await db.select().from(habits).where(eq(habits.userId, userId)).orderBy(desc(habits.createdAt));
  }

  async createHabit(userId: string, habit: InsertHabit): Promise<Habit> {
    const [result] = await db.insert(habits).values({ ...habit, userId }).returning();
    return result;
  }

  async updateHabit(userId: string, id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined> {
    const [result] = await db.update(habits).set(habit).where(and(eq(habits.id, id), eq(habits.userId, userId))).returning();
    return result;
  }

  // Journal
  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries).where(eq(journalEntries.userId, userId)).orderBy(desc(journalEntries.createdAt));
  }

  async createJournalEntry(userId: string, entry: InsertJournalEntry): Promise<JournalEntry> {
    const [result] = await db.insert(journalEntries).values({ ...entry, userId }).returning();
    return result;
  }

  // AI Chat
  async getConversations(userId: string): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.userId, userId)).orderBy(desc(conversations.createdAt));
  }

  async createConversation(userId: string, conversation: InsertConversation): Promise<Conversation> {
    const [result] = await db.insert(conversations).values({ ...conversation, userId }).returning();
    return result;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [result] = await db.insert(messages).values(message).returning();
    return result;
  }

  // Therapist
  async getTherapistSessions(userId: string): Promise<TherapistSession[]> {
    return await db.select().from(therapistSessions).where(eq(therapistSessions.userId, userId)).orderBy(desc(therapistSessions.createdAt));
  }

  async createTherapistSession(userId: string, session: InsertTherapistSession): Promise<TherapistSession> {
    const [result] = await db.insert(therapistSessions).values({ ...session, userId }).returning();
    return result;
  }

  // Routines
  async getRoutines(userId: string): Promise<Routine[]> {
    return await db.select().from(routines).where(eq(routines.userId, userId)).orderBy(desc(routines.createdAt));
  }

  async createRoutine(userId: string, routine: InsertRoutine): Promise<Routine> {
    const [result] = await db.insert(routines).values({ ...routine, userId }).returning();
    return result;
  }

  // Learning Paths
  async getLearningPaths(userId: string): Promise<LearningPath[]> {
    return await db.select().from(learningPaths).where(eq(learningPaths.userId, userId)).orderBy(desc(learningPaths.createdAt));
  }

  async createLearningPath(userId: string, path: InsertLearningPath): Promise<LearningPath> {
    const [result] = await db.insert(learningPaths).values({ ...path, userId }).returning();
    return result;
  }

  // Affirmations
  async getAffirmations(userId: string): Promise<Affirmation[]> {
    return await db.select().from(affirmations).where(eq(affirmations.userId, userId)).orderBy(desc(affirmations.createdAt));
  }

  async createAffirmation(userId: string, affirmation: InsertAffirmation): Promise<Affirmation> {
    const [result] = await db.insert(affirmations).values({ ...affirmation, userId }).returning();
    return result;
  }

  // Meals
  async getMeals(userId: string): Promise<Meal[]> {
    return await db.select().from(meals).where(eq(meals.userId, userId)).orderBy(desc(meals.createdAt));
  }

  async createMeal(userId: string, meal: InsertMeal): Promise<Meal> {
    const [result] = await db.insert(meals).values({ ...meal, userId }).returning();
    return result;
  }

  async updateMeal(userId: string, id: number, meal: Partial<InsertMeal>): Promise<Meal | undefined> {
    const [result] = await db.update(meals).set(meal).where(and(eq(meals.id, id), eq(meals.userId, userId))).returning();
    return result;
  }

  // Learning Path update
  async updateLearningPath(userId: string, id: number, path: Partial<InsertLearningPath>): Promise<LearningPath | undefined> {
    const [result] = await db.update(learningPaths).set(path).where(and(eq(learningPaths.id, id), eq(learningPaths.userId, userId))).returning();
    return result;
  }

  // Crisis Alerts
  async getCrisisAlerts(userId: string): Promise<CrisisAlert[]> {
    return await db.select().from(crisisAlerts).where(eq(crisisAlerts.userId, userId)).orderBy(desc(crisisAlerts.createdAt));
  }

  async createCrisisAlert(userId: string, alert: InsertCrisisAlert): Promise<CrisisAlert> {
    const [result] = await db.insert(crisisAlerts).values({ ...alert, userId }).returning();
    return result;
  }

  // Mood Analytics
  async getMoodAnalytics(userId: string): Promise<MoodAnalytic[]> {
    return await db.select().from(moodAnalytics).where(eq(moodAnalytics.userId, userId)).orderBy(desc(moodAnalytics.createdAt));
  }

  async createMoodAnalytics(userId: string, analytics: InsertMoodAnalytic): Promise<MoodAnalytic> {
    const [result] = await db.insert(moodAnalytics).values({ ...analytics, userId }).returning();
    return result;
  }

  // Habit Completions (for streak tracking)
  async createHabitCompletion(habitId: number): Promise<void> {
    await db.insert(habitCompletions).values({ habitId });
  }

  async getHabitCompletionsToday(habitId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completions = await db.select().from(habitCompletions)
      .where(and(eq(habitCompletions.habitId, habitId), gte(habitCompletions.completedAt, today)));
    return completions.length;
  }

  // Habit delete
  async deleteHabit(userId: string, id: number): Promise<void> {
    await db.delete(habits).where(and(eq(habits.id, id), eq(habits.userId, userId)));
  }

  // Routine updates
  async updateRoutine(userId: string, id: number, routine: Partial<InsertRoutine>): Promise<Routine | undefined> {
    const [result] = await db.update(routines).set(routine).where(and(eq(routines.id, id), eq(routines.userId, userId))).returning();
    return result;
  }

  async deleteRoutine(userId: string, id: number): Promise<void> {
    await db.delete(routines).where(and(eq(routines.id, id), eq(routines.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
