import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

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
  
  // AI Coach state
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [coachingChallenge, setCoachingChallenge] = useState("");
  const [isLoadingCoach, setIsLoadingCoach] = useState(false);
  const [coachingAdvice, setCoachingAdvice] = useState<string | null>(null);

  const openCoachModal = (habit: Habit) => {
    setSelectedHabit(habit);
    setCoachingAdvice(null);
    setCoachingChallenge("");
    setShowCoachModal(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const getCoaching = async () => {
    if (!selectedHabit) return;
    
    setIsLoadingCoach(true);
    try {
      const response = await fetch(new URL("/api/ai/habit-coach", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habit: selectedHabit.name,
          currentStreak: selectedHabit.streak,
          challenges: coachingChallenge,
        }),
      });
      const data = await response.json();
      setCoachingAdvice(data.coaching);
    } catch (error) {
      console.error("Coaching error:", error);
      setCoachingAdvice("Keep going! Every small step counts toward building lasting habits. Try starting with just 2 minutes a day.");
    } finally {
      setIsLoadingCoach(false);
    }
  };

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
                <Pressable
                  style={styles.coachButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    openCoachModal(habit);
                  }}
                  testID={`button-coach-${habit.id}`}
                >
                  <Feather name="cpu" size={14} color={Colors.light.primary} />
                </Pressable>
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

        <View style={[styles.aiCoachSection, { backgroundColor: Colors.light.cardBlue }]}>
          <View style={styles.aiCoachHeader}>
            <View style={[styles.aiCoachIcon, { backgroundColor: Colors.light.softBlue + "40" }]}>
              <Feather name="zap" size={20} color={Colors.light.softBlue} />
            </View>
            <View>
              <ThemedText style={styles.aiCoachTitle}>AI Habits Coach</ThemedText>
              <ThemedText style={[styles.aiCoachSubtitle, { color: theme.textSecondary }]}>
                Tap any habit's AI icon for personalized tips
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showCoachModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCoachModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]}>
            <View style={[styles.modalHeader, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
              <View style={styles.modalHeaderLeft}>
                <View style={[styles.modalAvatar, { backgroundColor: Colors.light.cardBlue }]}>
                  <Feather name="cpu" size={18} color={Colors.light.softBlue} />
                </View>
                <View>
                  <ThemedText style={styles.modalHeaderTitle}>AI Habits Coach</ThemedText>
                  <ThemedText style={[styles.modalHeaderSubtitle, { color: theme.textSecondary }]}>
                    {selectedHabit?.name || "Habit Tips"}
                  </ThemedText>
                </View>
              </View>
              <Pressable onPress={() => setShowCoachModal(false)} style={styles.modalCloseButton} testID="button-close-coach">
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
              {selectedHabit ? (
                <View style={[styles.selectedHabitCard, { backgroundColor: selectedHabit.color }]}>
                  <Feather name={selectedHabit.icon as any} size={28} color={Colors.light.primary} />
                  <View style={styles.selectedHabitInfo}>
                    <ThemedText style={styles.selectedHabitName}>{selectedHabit.name}</ThemedText>
                    <ThemedText style={[styles.selectedHabitStreak, { color: theme.textSecondary }]}>
                      {selectedHabit.streak} day streak
                    </ThemedText>
                  </View>
                </View>
              ) : null}

              <View style={styles.coachFormSection}>
                <ThemedText style={styles.coachFormLabel}>Any challenges you're facing?</ThemedText>
                <TextInput
                  style={[styles.coachInput, { color: theme.text, backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
                  placeholder="e.g., I keep forgetting, hard to stay motivated..."
                  placeholderTextColor={theme.textSecondary}
                  value={coachingChallenge}
                  onChangeText={setCoachingChallenge}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  testID="input-coaching-challenge"
                />
              </View>

              <Pressable
                style={[styles.getCoachingButton, { backgroundColor: isLoadingCoach ? theme.textSecondary : Colors.light.primary }]}
                onPress={getCoaching}
                disabled={isLoadingCoach}
                testID="button-get-coaching"
              >
                {isLoadingCoach ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Feather name="zap" size={18} color="#FFF" />
                    <ThemedText style={styles.getCoachingButtonText}>Get AI Coaching</ThemedText>
                  </>
                )}
              </Pressable>

              {coachingAdvice ? (
                <View style={[styles.adviceCard, { backgroundColor: Colors.light.cardGreen }]}>
                  <View style={styles.adviceHeader}>
                    <Feather name="award" size={20} color={Colors.light.primary} />
                    <ThemedText style={styles.adviceTitle}>Your Coaching Tips</ThemedText>
                  </View>
                  <ThemedText style={styles.adviceText}>{coachingAdvice}</ThemedText>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  coachButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.cardBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  aiCoachSection: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  aiCoachHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  aiCoachIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  aiCoachTitle: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.light.text,
  },
  aiCoachSubtitle: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "85%",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalHeaderTitle: {
    fontWeight: "600",
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  modalHeaderSubtitle: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  modalCloseButton: {
    padding: Spacing.xs,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },
  selectedHabitCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.lg,
  },
  selectedHabitInfo: {
    flex: 1,
  },
  selectedHabitName: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_700Bold",
    color: Colors.light.text,
  },
  selectedHabitStreak: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  coachFormSection: {
    gap: Spacing.sm,
  },
  coachFormLabel: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.light.text,
  },
  coachInput: {
    minHeight: 80,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 15,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  getCoachingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  getCoachingButtonText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#FFF",
  },
  adviceCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  adviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  adviceTitle: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.light.text,
  },
  adviceText: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_400Regular",
    color: Colors.light.text,
    lineHeight: 24,
  },
});
