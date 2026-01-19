import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  streak: number;
  completedToday: boolean;
  weekProgress: boolean[];
}

const initialHabits: Habit[] = [
  { id: "1", name: "Morning Meditation", icon: "sun", color: Colors.light.cardPeach, streak: 7, completedToday: true, weekProgress: [true, true, true, true, true, true, true] },
  { id: "2", name: "Exercise", icon: "activity", color: Colors.light.cardBlue, streak: 5, completedToday: false, weekProgress: [true, true, false, true, true, true, false] },
  { id: "3", name: "Read 20 mins", icon: "book", color: Colors.light.cardGreen, streak: 12, completedToday: true, weekProgress: [true, true, true, true, true, true, true] },
  { id: "4", name: "Drink Water", icon: "droplet", color: Colors.light.secondary + "30", streak: 3, completedToday: false, weekProgress: [false, true, true, true, false, false, false] },
  { id: "5", name: "Gratitude Journal", icon: "heart", color: Colors.light.cardPeach, streak: 9, completedToday: false, weekProgress: [true, true, true, true, true, true, false] },
];

const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

export default function HabitScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");

  const toggleHabit = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completedToday: !h.completedToday,
              streak: h.completedToday ? h.streak - 1 : h.streak + 1,
            }
          : h
      )
    );
  };

  const addHabit = () => {
    if (newHabitName.trim()) {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: newHabitName.trim(),
        icon: "star",
        color: Colors.light.cardBlue,
        streak: 0,
        completedToday: false,
        weekProgress: [false, false, false, false, false, false, false],
      };
      setHabits((prev) => [...prev, newHabit]);
      setNewHabitName("");
      setShowAddHabit(false);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const completedCount = habits.filter((h) => h.completedToday).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: tabBarHeight + Spacing["5xl"],
          paddingHorizontal: Spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Habits</ThemedText>
          <Pressable
            style={[styles.addButton, { backgroundColor: Colors.light.primary }]}
            onPress={() => setShowAddHabit(!showAddHabit)}
          >
            <Feather name={showAddHabit ? "x" : "plus"} size={20} color="#FFF" />
          </Pressable>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: Colors.light.cardPeach }]}>
          <View style={styles.summaryContent}>
            <ThemedText style={styles.summaryTitle}>Today's Progress</ThemedText>
            <ThemedText style={styles.summaryStats}>
              {completedCount} of {habits.length} habits completed
            </ThemedText>
          </View>
          <View style={styles.progressCircle}>
            <ThemedText style={styles.progressText}>
              {Math.round((completedCount / habits.length) * 100)}%
            </ThemedText>
          </View>
        </View>

        {showAddHabit ? (
          <View style={[styles.addHabitCard, { backgroundColor: theme.backgroundSecondary }]}>
            <TextInput
              style={[styles.addHabitInput, { color: theme.text }]}
              placeholder="New habit name..."
              placeholderTextColor={theme.textSecondary}
              value={newHabitName}
              onChangeText={setNewHabitName}
              autoFocus
            />
            <Pressable
              style={[styles.saveButton, { backgroundColor: Colors.light.primary }]}
              onPress={addHabit}
            >
              <ThemedText style={styles.saveButtonText}>Add</ThemedText>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Your Habits</ThemedText>
          {habits.map((habit) => (
            <Pressable
              key={habit.id}
              style={[styles.habitCard, { backgroundColor: theme.backgroundSecondary }]}
              onPress={() => toggleHabit(habit.id)}
            >
              <View style={[styles.habitIcon, { backgroundColor: habit.color }]}>
                <Feather name={habit.icon as any} size={20} color={Colors.light.primary} />
              </View>
              <View style={styles.habitInfo}>
                <ThemedText style={styles.habitName}>{habit.name}</ThemedText>
                <View style={styles.weekRow}>
                  {weekDays.map((day, index) => (
                    <View
                      key={index}
                      style={[
                        styles.weekDot,
                        {
                          backgroundColor: habit.weekProgress[index]
                            ? Colors.light.primary
                            : theme.border,
                        },
                      ]}
                    >
                      <ThemedText style={[styles.weekDayText, { color: habit.weekProgress[index] ? "#FFF" : theme.textSecondary }]}>
                        {day}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.habitRight}>
                <View style={styles.streakBadge}>
                  <Feather name="zap" size={12} color={Colors.light.primary} />
                  <ThemedText style={styles.streakText}>{habit.streak}</ThemedText>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: habit.completedToday ? Colors.light.primary : "transparent",
                      borderColor: habit.completedToday ? Colors.light.primary : theme.border,
                    },
                  ]}
                >
                  {habit.completedToday ? (
                    <Feather name="check" size={14} color="#FFF" />
                  ) : null}
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "PlayfairDisplay_400Regular",
    color: Colors.light.text,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    flexDirection: "row",
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  summaryContent: { flex: 1 },
  summaryTitle: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_400Regular",
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  summaryStats: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_400Regular",
    color: Colors.light.textSecondary,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#FFF",
  },
  addHabitCard: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  addHabitInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "PlusJakartaSans_400Regular",
    paddingHorizontal: Spacing.md,
  },
  saveButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#FFF",
  },
  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_400Regular",
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  habitCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  habitIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  habitInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  habitName: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_500Medium",
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  weekRow: {
    flexDirection: "row",
    gap: 4,
  },
  weekDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  weekDayText: {
    fontSize: 9,
    fontFamily: "PlusJakartaSans_500Medium",
  },
  habitRight: {
    alignItems: "flex-end",
    gap: Spacing.sm,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  streakText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.light.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
