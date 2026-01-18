import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";

const moods = [
  { emoji: "happy", icon: "smile", label: "Happy", color: "#9FD8CB" },
  { emoji: "calm", icon: "coffee", label: "Calm", color: "#A8D5BA" },
  { emoji: "neutral", icon: "meh", label: "Neutral", color: "#FFD6A5" },
  { emoji: "sad", icon: "frown", label: "Sad", color: "#E8B4B8" },
  { emoji: "anxious", icon: "alert-circle", label: "Anxious", color: "#FF6B6B" },
];

const activities = [
  { id: "sleep", icon: "moon", label: "Sleep", value: "7.5h", target: "8h" },
  { id: "steps", icon: "activity", label: "Steps", value: "6,234", target: "10k" },
  { id: "water", icon: "droplet", label: "Water", value: "5", target: "8 cups" },
  { id: "exercise", icon: "heart", label: "Exercise", value: "30m", target: "45m" },
  { id: "meditate", icon: "sun", label: "Meditate", value: "10m", target: "15m" },
  { id: "stress", icon: "zap", label: "Stress", value: "Low", target: "" },
];

const quotes = [
  "Every day is a fresh start. Embrace it with open arms.",
  "You are stronger than you think, braver than you believe.",
  "Small steps every day lead to big changes.",
  "Be gentle with yourself. You're doing the best you can.",
];

const todoItems = [
  { id: "1", text: "Morning meditation", completed: true },
  { id: "2", text: "Take a 20-minute walk", completed: false },
  { id: "3", text: "Drink 8 glasses of water", completed: false },
  { id: "4", text: "Journal for 10 minutes", completed: false },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [todos, setTodos] = useState(todoItems);

  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good Morning" : today.getHours() < 17 ? "Good Afternoon" : "Good Evening";
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const handleMoodSelect = (mood: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedMood(mood);
  };

  const toggleTodo = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing["5xl"],
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.greetingSection}>
        <ThemedText type="h2">{greeting}</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          How are you feeling today?
        </ThemedText>
      </View>

      <Card style={[styles.quoteCard, { backgroundColor: Colors.light.primary + "15" }]}>
        <View style={styles.quoteIcon}>
          <Feather name="sun" size={20} color={Colors.light.primary} />
        </View>
        <ThemedText type="body" style={styles.quoteText}>
          "{randomQuote}"
        </ThemedText>
      </Card>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Today's Mood
        </ThemedText>
        <View style={styles.moodContainer}>
          {moods.map((mood) => (
            <Pressable
              key={mood.emoji}
              style={[
                styles.moodButton,
                {
                  backgroundColor:
                    selectedMood === mood.emoji
                      ? mood.color
                      : theme.backgroundDefault,
                  borderColor:
                    selectedMood === mood.emoji ? mood.color : "transparent",
                },
              ]}
              onPress={() => handleMoodSelect(mood.emoji)}
            >
              <Feather
                name={mood.icon as any}
                size={24}
                color={selectedMood === mood.emoji ? "#FFF" : theme.text}
              />
              <ThemedText
                type="small"
                style={[
                  styles.moodLabel,
                  selectedMood === mood.emoji && { color: "#FFF" },
                ]}
              >
                {mood.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Daily Activities
        </ThemedText>
        <View style={styles.activitiesGrid}>
          {activities.map((activity) => (
            <Card
              key={activity.id}
              style={[styles.activityCard, { backgroundColor: theme.backgroundDefault }]}
            >
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: Colors.light.primary + "20" },
                ]}
              >
                <Feather
                  name={activity.icon as any}
                  size={18}
                  color={Colors.light.primary}
                />
              </View>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {activity.label}
              </ThemedText>
              <ThemedText type="h4">{activity.value}</ThemedText>
              {activity.target ? (
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  / {activity.target}
                </ThemedText>
              ) : null}
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="h3">To-Do List</ThemedText>
          <Pressable>
            <Feather name="plus" size={20} color={Colors.light.primary} />
          </Pressable>
        </View>
        <View style={styles.todoList}>
          {todos.map((todo) => (
            <Pressable
              key={todo.id}
              style={[styles.todoItem, { backgroundColor: theme.backgroundDefault }]}
              onPress={() => toggleTodo(todo.id)}
            >
              <View
                style={[
                  styles.todoCheckbox,
                  {
                    backgroundColor: todo.completed
                      ? Colors.light.primary
                      : "transparent",
                    borderColor: todo.completed
                      ? Colors.light.primary
                      : theme.border,
                  },
                ]}
              >
                {todo.completed ? (
                  <Feather name="check" size={14} color="#FFF" />
                ) : null}
              </View>
              <ThemedText
                style={[
                  styles.todoText,
                  todo.completed && {
                    textDecorationLine: "line-through",
                    color: theme.textSecondary,
                  },
                ]}
              >
                {todo.text}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Meal Planning
        </ThemedText>
        <Card style={[styles.mealCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.mealRow}>
            <View style={styles.mealInfo}>
              <View style={[styles.mealIcon, { backgroundColor: Colors.light.accent + "30" }]}>
                <Feather name="sunrise" size={16} color={Colors.light.accent} />
              </View>
              <View>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Breakfast
                </ThemedText>
                <ThemedText type="body">Oatmeal with berries</ThemedText>
              </View>
            </View>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              350 cal
            </ThemedText>
          </View>
          <View style={[styles.mealDivider, { backgroundColor: theme.border }]} />
          <View style={styles.mealRow}>
            <View style={styles.mealInfo}>
              <View style={[styles.mealIcon, { backgroundColor: Colors.light.primary + "30" }]}>
                <Feather name="sun" size={16} color={Colors.light.primary} />
              </View>
              <View>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Lunch
                </ThemedText>
                <ThemedText type="body">Grilled chicken salad</ThemedText>
              </View>
            </View>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              480 cal
            </ThemedText>
          </View>
          <View style={[styles.mealDivider, { backgroundColor: theme.border }]} />
          <View style={styles.mealRow}>
            <View style={styles.mealInfo}>
              <View style={[styles.mealIcon, { backgroundColor: Colors.light.secondary + "30" }]}>
                <Feather name="moon" size={16} color={Colors.light.secondary} />
              </View>
              <View>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Dinner
                </ThemedText>
                <ThemedText type="body">Salmon with vegetables</ThemedText>
              </View>
            </View>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              520 cal
            </ThemedText>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Daily Streak
        </ThemedText>
        <Card style={[styles.streakCard, { backgroundColor: Colors.light.accent + "20" }]}>
          <View style={styles.streakContent}>
            <View style={[styles.streakIcon, { backgroundColor: Colors.light.accent }]}>
              <Feather name="award" size={24} color="#FFF" />
            </View>
            <View style={styles.streakInfo}>
              <ThemedText type="h2">7 Days</ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                You're on a roll! Keep it up.
              </ThemedText>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  greetingSection: {
    marginBottom: Spacing.xl,
  },
  quoteCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  quoteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  quoteText: {
    flex: 1,
    fontStyle: "italic",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  moodContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moodButton: {
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  moodLabel: {
    marginTop: Spacing.xs,
    fontSize: 11,
  },
  activitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  activityCard: {
    width: "31%",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  todoList: {
    gap: Spacing.sm,
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  todoCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  todoText: {
    flex: 1,
  },
  mealCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  mealRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  mealIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  mealDivider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  streakCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  streakContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  streakIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  streakInfo: {
    flex: 1,
  },
});
