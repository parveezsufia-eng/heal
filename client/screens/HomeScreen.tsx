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
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";

const moods = [
  { id: "happy", icon: "smile", label: "Happy" },
  { id: "calm", icon: "coffee", label: "Calm" },
  { id: "neutral", icon: "meh", label: "Okay" },
  { id: "sad", icon: "frown", label: "Sad" },
  { id: "anxious", icon: "alert-circle", label: "Anxious" },
];

const goalCards = [
  {
    id: "breathing",
    title: "Breathing",
    sessions: "7 sessions",
    duration: "8-10 Minutes",
    image: require("../assets/images/line_art_breathing_faces_illustration.png"),
    bgColor: Colors.light.cardBlue,
  },
  {
    id: "meditation",
    title: "Meditation",
    sessions: "5 sessions",
    duration: "10-15 Minutes",
    image: require("../assets/images/line_art_supportive_hands_illustration.png"),
    bgColor: Colors.light.cardPeach,
  },
];

const dailyTasks = [
  { id: "1", text: "Morning meditation", completed: true, time: "8:00 AM" },
  { id: "2", text: "Breathing exercise", completed: false, time: "12:00 PM" },
  { id: "3", text: "Evening journaling", completed: false, time: "8:00 PM" },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [tasks, setTasks] = useState(dailyTasks);

  const handleMoodSelect = (moodId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedMood(moodId);
  };

  const toggleTask = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good Morning" : today.getHours() < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.md,
        paddingBottom: tabBarHeight + Spacing["5xl"],
        paddingHorizontal: Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.greeting}>{greeting}</ThemedText>
          <ThemedText style={styles.headerTitle}>
            Ready to start{"\n"}your goals?
          </ThemedText>
        </View>
        <Pressable style={styles.searchButton}>
          <Feather name="search" size={22} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>How are you feeling?</ThemedText>
        <View style={styles.moodRow}>
          {moods.map((mood) => (
            <Pressable
              key={mood.id}
              style={[
                styles.moodButton,
                selectedMood === mood.id && styles.moodButtonSelected,
              ]}
              onPress={() => handleMoodSelect(mood.id)}
            >
              <Feather
                name={mood.icon as any}
                size={24}
                color={selectedMood === mood.id ? Colors.light.primary : theme.textSecondary}
              />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Daily Goals</ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            1/5 selected
          </ThemedText>
        </View>
        <View style={styles.goalsGrid}>
          {goalCards.map((goal) => (
            <Pressable key={goal.id} style={[styles.goalCard, { backgroundColor: goal.bgColor }]}>
              <Image source={goal.image} style={styles.goalImage} contentFit="contain" />
              <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
              <View style={styles.goalMeta}>
                <ThemedText style={[styles.goalMetaText, { color: theme.textSecondary }]}>
                  {goal.sessions}
                </ThemedText>
                <ThemedText style={[styles.goalMetaText, { color: theme.textSecondary }]}>
                  {goal.duration}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Today's Schedule</ThemedText>
        <View style={styles.taskList}>
          {tasks.map((task) => (
            <Pressable
              key={task.id}
              style={[styles.taskItem, { backgroundColor: theme.backgroundSecondary }]}
              onPress={() => toggleTask(task.id)}
            >
              <View
                style={[
                  styles.taskCheckbox,
                  {
                    backgroundColor: task.completed ? Colors.light.primary : "transparent",
                    borderColor: task.completed ? Colors.light.primary : theme.border,
                  },
                ]}
              >
                {task.completed ? <Feather name="check" size={12} color="#FFF" /> : null}
              </View>
              <View style={styles.taskContent}>
                <ThemedText
                  style={[
                    styles.taskText,
                    task.completed && { textDecorationLine: "line-through", color: theme.textSecondary },
                  ]}
                >
                  {task.text}
                </ThemedText>
                <ThemedText style={[styles.taskTime, { color: theme.textSecondary }]}>
                  {task.time}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.featureCard, { backgroundColor: Colors.light.cardPeach }]}>
          <Image
            source={require("../assets/images/line_art_yoga_prayer_pose_illustration.png")}
            style={styles.featureImage}
            contentFit="contain"
          />
          <View style={styles.featureContent}>
            <ThemedText style={styles.featureTitle}>Breath In</ThemedText>
            <ThemedText style={[styles.featureDescription, { color: theme.textSecondary }]}>
              A 5-minute intro to breathing energy to heal and bring positivity
            </ThemedText>
            <Pressable style={[styles.startButton, { backgroundColor: Colors.light.primary }]}>
              <ThemedText style={styles.startButtonText}>Start</ThemedText>
            </Pressable>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing["2xl"],
  },
  greeting: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: "PlayfairDisplay_400Regular",
    color: Colors.light.text,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_400Regular",
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moodButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  moodButtonSelected: {
    backgroundColor: Colors.light.primary + "20",
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  goalsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  goalCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    height: 200,
  },
  goalImage: {
    width: "100%",
    height: 100,
    marginBottom: Spacing.sm,
  },
  goalTitle: {
    fontSize: 17,
    fontFamily: "PlayfairDisplay_400Regular",
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  goalMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  goalMetaText: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  taskList: {
    gap: Spacing.sm,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  taskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  taskContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskText: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_400Regular",
    color: Colors.light.text,
  },
  taskTime: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  featureCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
  },
  featureImage: {
    width: 100,
    height: 120,
  },
  featureContent: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  featureTitle: {
    fontSize: 22,
    fontFamily: "PlayfairDisplay_400Regular",
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  featureDescription: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  startButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignSelf: "flex-start",
  },
  startButtonText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#FFFFFF",
  },
});
