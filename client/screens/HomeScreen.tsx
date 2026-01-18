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
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";

const moods = [
  { emoji: "happy", icon: "smile", label: "Happy", color: Colors.light.success },
  { emoji: "calm", icon: "coffee", label: "Calm", color: Colors.light.secondary },
  { emoji: "neutral", icon: "meh", label: "Okay", color: Colors.light.warm },
  { emoji: "sad", icon: "frown", label: "Sad", color: Colors.light.accent },
  { emoji: "anxious", icon: "alert-circle", label: "Anxious", color: Colors.light.emergency },
];

const activities = [
  { id: "sleep", icon: "moon", label: "Sleep", value: "7.5h", color: Colors.light.secondary },
  { id: "steps", icon: "activity", label: "Steps", value: "6,234", color: Colors.light.success },
  { id: "water", icon: "droplet", label: "Water", value: "5/8", color: Colors.light.secondary },
  { id: "mood", icon: "heart", label: "Mood", value: "Good", color: Colors.light.primary },
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
  { id: "3", text: "Journal for 10 minutes", completed: false },
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
  const dateString = today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
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
        paddingTop: headerHeight + Spacing.md,
        paddingBottom: tabBarHeight + Spacing["5xl"],
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.greetingSection}>
        <ThemedText type="h1" style={styles.greeting}>{greeting}</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          {dateString}
        </ThemedText>
      </View>

      <View style={[styles.quoteCard, { backgroundColor: Colors.light.warm + "25" }]}>
        <View style={[styles.quoteAccent, { backgroundColor: Colors.light.accent }]} />
        <ThemedText type="body" style={styles.quoteText}>
          "{randomQuote}"
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          How are you feeling?
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
                },
                selectedMood === mood.emoji && Shadows.small,
              ]}
              onPress={() => handleMoodSelect(mood.emoji)}
            >
              <Feather
                name={mood.icon as any}
                size={22}
                color={selectedMood === mood.emoji ? "#FFF" : mood.color}
              />
              <ThemedText
                type="small"
                style={[
                  styles.moodLabel,
                  { color: selectedMood === mood.emoji ? "#FFF" : theme.textSecondary },
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
          Daily Tracking
        </ThemedText>
        <View style={styles.activitiesGrid}>
          {activities.map((activity) => (
            <Pressable
              key={activity.id}
              style={[styles.activityCard, { backgroundColor: theme.backgroundDefault }, Shadows.small]}
            >
              <View style={[styles.activityIcon, { backgroundColor: activity.color + "20" }]}>
                <Feather name={activity.icon as any} size={20} color={activity.color} />
              </View>
              <ThemedText type="h4" style={styles.activityValue}>{activity.value}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {activity.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="h3">Today's Tasks</ThemedText>
          <Pressable style={[styles.addButton, { backgroundColor: Colors.light.primary + "15" }]}>
            <Feather name="plus" size={18} color={Colors.light.primary} />
          </Pressable>
        </View>
        <View style={styles.todoList}>
          {todos.map((todo) => (
            <Pressable
              key={todo.id}
              style={[styles.todoItem, { backgroundColor: theme.backgroundDefault }, Shadows.small]}
              onPress={() => toggleTodo(todo.id)}
            >
              <View
                style={[
                  styles.todoCheckbox,
                  {
                    backgroundColor: todo.completed ? Colors.light.primary : "transparent",
                    borderColor: todo.completed ? Colors.light.primary : theme.border,
                  },
                ]}
              >
                {todo.completed ? (
                  <Feather name="check" size={12} color="#FFF" />
                ) : null}
              </View>
              <ThemedText
                style={[
                  styles.todoText,
                  todo.completed && { textDecorationLine: "line-through", color: theme.textSecondary },
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
          Meal Plan
        </ThemedText>
        <View style={[styles.mealCard, { backgroundColor: theme.backgroundDefault }, Shadows.small]}>
          <View style={styles.mealItem}>
            <View style={[styles.mealIcon, { backgroundColor: Colors.light.accent + "20" }]}>
              <Feather name="sunrise" size={16} color={Colors.light.accent} />
            </View>
            <View style={styles.mealInfo}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Breakfast</ThemedText>
              <ThemedText type="body">Oatmeal with berries</ThemedText>
            </View>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>350 cal</ThemedText>
          </View>
          <View style={[styles.mealDivider, { backgroundColor: theme.border }]} />
          <View style={styles.mealItem}>
            <View style={[styles.mealIcon, { backgroundColor: Colors.light.secondary + "20" }]}>
              <Feather name="sun" size={16} color={Colors.light.secondary} />
            </View>
            <View style={styles.mealInfo}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Lunch</ThemedText>
              <ThemedText type="body">Grilled chicken salad</ThemedText>
            </View>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>480 cal</ThemedText>
          </View>
          <View style={[styles.mealDivider, { backgroundColor: theme.border }]} />
          <View style={styles.mealItem}>
            <View style={[styles.mealIcon, { backgroundColor: Colors.light.primary + "20" }]}>
              <Feather name="moon" size={16} color={Colors.light.primary} />
            </View>
            <View style={styles.mealInfo}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Dinner</ThemedText>
              <ThemedText type="body">Salmon with vegetables</ThemedText>
            </View>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>520 cal</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.streakCard, { backgroundColor: Colors.light.primary + "12" }]}>
          <View style={[styles.streakIcon, { backgroundColor: Colors.light.primary }]}>
            <Feather name="zap" size={24} color="#FFF" />
          </View>
          <View style={styles.streakInfo}>
            <ThemedText type="h2" style={{ color: Colors.light.primary }}>7 Days</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Amazing streak! Keep going.
            </ThemedText>
          </View>
        </View>
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
  greeting: {
    marginBottom: Spacing.xs,
  },
  quoteCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    overflow: "hidden",
  },
  quoteAccent: {
    width: 4,
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  quoteText: {
    flex: 1,
    fontStyle: "italic",
    lineHeight: 24,
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
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  moodContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  moodButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  moodLabel: {
    marginTop: Spacing.xs,
    fontSize: 11,
  },
  activitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  activityCard: {
    width: "47%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "flex-start",
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  activityValue: {
    marginBottom: Spacing.xs,
  },
  todoList: {
    gap: Spacing.sm,
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  todoCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  todoText: {
    flex: 1,
  },
  mealCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  mealIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  mealInfo: {
    flex: 1,
  },
  mealDivider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
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
