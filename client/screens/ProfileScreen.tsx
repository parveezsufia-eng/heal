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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";

type ProfileNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

const weeklyData = [
  { day: "Mon", mood: 3, sleep: 7, stress: 2 },
  { day: "Tue", mood: 4, sleep: 8, stress: 1 },
  { day: "Wed", mood: 3, sleep: 6, stress: 3 },
  { day: "Thu", mood: 5, sleep: 7.5, stress: 1 },
  { day: "Fri", mood: 4, sleep: 8, stress: 2 },
  { day: "Sat", mood: 5, sleep: 9, stress: 1 },
  { day: "Sun", mood: 4, sleep: 7, stress: 2 },
];

const achievements = [
  { id: "1", icon: "award", label: "7 Day Streak", color: Colors.light.accent },
  { id: "2", icon: "heart", label: "100 Entries", color: Colors.light.secondary },
  { id: "3", icon: "sun", label: "Early Bird", color: Colors.light.primary },
  { id: "4", icon: "star", label: "Consistent", color: Colors.light.success },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<ProfileNavigationProp>();

  const handleSettingsPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("Settings");
  };

  const averageMood = (weeklyData.reduce((sum, d) => sum + d.mood, 0) / weeklyData.length).toFixed(1);
  const averageSleep = (weeklyData.reduce((sum, d) => sum + d.sleep, 0) / weeklyData.length).toFixed(1);
  const averageStress = (weeklyData.reduce((sum, d) => sum + d.stress, 0) / weeklyData.length).toFixed(1);

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
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: Colors.light.primary + "30" }]}>
          <Feather name="user" size={40} color={Colors.light.primary} />
        </View>
        <ThemedText type="h2">Guest User</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Member since January 2026
        </ThemedText>
        <Pressable
          style={[styles.settingsButton, { backgroundColor: theme.backgroundDefault }]}
          onPress={handleSettingsPress}
        >
          <Feather name="settings" size={18} color={theme.text} />
          <ThemedText type="small">Settings</ThemedText>
        </Pressable>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Weekly Summary
        </ThemedText>
        <View style={styles.summaryGrid}>
          <Card style={[styles.summaryCard, { backgroundColor: Colors.light.primary + "15" }]}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.light.primary }]}>
              <Feather name="smile" size={20} color="#FFF" />
            </View>
            <ThemedText type="h3">{averageMood}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Avg Mood
            </ThemedText>
          </Card>
          <Card style={[styles.summaryCard, { backgroundColor: Colors.light.secondary + "15" }]}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.light.secondary }]}>
              <Feather name="moon" size={20} color="#FFF" />
            </View>
            <ThemedText type="h3">{averageSleep}h</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Avg Sleep
            </ThemedText>
          </Card>
          <Card style={[styles.summaryCard, { backgroundColor: Colors.light.accent + "15" }]}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.light.accent }]}>
              <Feather name="zap" size={20} color="#FFF" />
            </View>
            <ThemedText type="h3">{averageStress}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Stress Level
            </ThemedText>
          </Card>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Mood Chart
        </ThemedText>
        <Card style={[styles.chartCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.chart}>
            {weeklyData.map((data, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(data.mood / 5) * 100}%`,
                        backgroundColor: Colors.light.primary,
                      },
                    ]}
                  />
                </View>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {data.day}
                </ThemedText>
              </View>
            ))}
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Progress Dashboard
        </ThemedText>
        <Card style={[styles.progressCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Goals Completed
                </ThemedText>
                <ThemedText type="h4">75%</ThemedText>
              </View>
              <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: "75%", backgroundColor: Colors.light.primary },
                  ]}
                />
              </View>
            </View>
          </View>
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Habits Consistency
                </ThemedText>
                <ThemedText type="h4">88%</ThemedText>
              </View>
              <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: "88%", backgroundColor: Colors.light.success },
                  ]}
                />
              </View>
            </View>
          </View>
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Meditation Streak
                </ThemedText>
                <ThemedText type="h4">12 days</ThemedText>
              </View>
              <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: "60%", backgroundColor: Colors.light.secondary },
                  ]}
                />
              </View>
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Achievements
        </ThemedText>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[styles.achievementCard, { backgroundColor: achievement.color + "20" }]}
            >
              <View style={[styles.achievementIcon, { backgroundColor: achievement.color }]}>
                <Feather name={achievement.icon as any} size={20} color="#FFF" />
              </View>
              <ThemedText type="small" style={styles.achievementLabel}>
                {achievement.label}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Overall Records
        </ThemedText>
        <Card style={[styles.recordsCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.recordRow}>
            <View style={styles.recordInfo}>
              <Feather name="calendar" size={18} color={Colors.light.primary} />
              <ThemedText type="body">Total Days Active</ThemedText>
            </View>
            <ThemedText type="h4">45</ThemedText>
          </View>
          <View style={[styles.recordDivider, { backgroundColor: theme.border }]} />
          <View style={styles.recordRow}>
            <View style={styles.recordInfo}>
              <Feather name="book" size={18} color={Colors.light.secondary} />
              <ThemedText type="body">Journal Entries</ThemedText>
            </View>
            <ThemedText type="h4">32</ThemedText>
          </View>
          <View style={[styles.recordDivider, { backgroundColor: theme.border }]} />
          <View style={styles.recordRow}>
            <View style={styles.recordInfo}>
              <Feather name="video" size={18} color={Colors.light.accent} />
              <ThemedText type="body">Sessions Completed</ThemedText>
            </View>
            <ThemedText type="h4">8</ThemedText>
          </View>
          <View style={[styles.recordDivider, { backgroundColor: theme.border }]} />
          <View style={styles.recordRow}>
            <View style={styles.recordInfo}>
              <Feather name="award" size={18} color={Colors.light.success} />
              <ThemedText type="body">Longest Streak</ThemedText>
            </View>
            <ThemedText type="h4">14 days</ThemedText>
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
  profileHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  summaryCard: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  chartCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 120,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
  },
  barContainer: {
    flex: 1,
    width: 24,
    justifyContent: "flex-end",
    marginBottom: Spacing.sm,
  },
  bar: {
    width: "100%",
    borderRadius: BorderRadius.xs,
  },
  progressCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.lg,
  },
  progressRow: {
    gap: Spacing.sm,
  },
  progressItem: {
    gap: Spacing.sm,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  achievementCard: {
    width: "48%",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  achievementLabel: {
    textAlign: "center",
    fontWeight: "600",
  },
  recordsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  recordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recordInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  recordDivider: {
    height: 1,
    marginVertical: Spacing.md,
  },
});
