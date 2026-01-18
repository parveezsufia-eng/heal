import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";

type ProfileNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

const weeklyData = [
  { day: "M", value: 60 },
  { day: "T", value: 80 },
  { day: "W", value: 50 },
  { day: "T", value: 90 },
  { day: "F", value: 70 },
  { day: "S", value: 100 },
  { day: "S", value: 75 },
];

const achievements = [
  { id: "1", icon: "award", label: "7 Day Streak", color: Colors.light.accent },
  { id: "2", icon: "heart", label: "100 Entries", color: Colors.light.primary },
  { id: "3", icon: "sun", label: "Early Bird", color: Colors.light.secondary },
  { id: "4", icon: "star", label: "Consistent", color: Colors.light.success },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<ProfileNavigationProp>();

  const handleSettingsPress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Settings");
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundRoot }]} contentContainerStyle={{ paddingTop: headerHeight + Spacing.md, paddingBottom: tabBarHeight + Spacing["5xl"], paddingHorizontal: Spacing.lg }} scrollIndicatorInsets={{ bottom: insets.bottom }} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: Colors.light.warm + "40" }]}>
          <Feather name="user" size={36} color={Colors.light.primary} />
        </View>
        <ThemedText type="h2">Guest User</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>Member since January 2026</ThemedText>
        <Pressable style={[styles.settingsButton, { backgroundColor: theme.backgroundDefault }, Shadows.small]} onPress={handleSettingsPress}>
          <Feather name="settings" size={16} color={theme.text} />
          <ThemedText type="small">Settings</ThemedText>
        </Pressable>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>Weekly Mood</ThemedText>
        <View style={[styles.chartCard, { backgroundColor: theme.backgroundDefault }, Shadows.small]}>
          <View style={styles.chart}>
            {weeklyData.map((data, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View style={[styles.bar, { height: `${data.value}%`, backgroundColor: Colors.light.primary }]} />
                </View>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>{data.day}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>Summary</ThemedText>
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { backgroundColor: Colors.light.primary + "12" }]}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.light.primary }]}>
              <Feather name="smile" size={18} color="#FFF" />
            </View>
            <ThemedText type="h3">4.2</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Avg Mood</ThemedText>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: Colors.light.secondary + "12" }]}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.light.secondary }]}>
              <Feather name="moon" size={18} color="#FFF" />
            </View>
            <ThemedText type="h3">7.5h</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Avg Sleep</ThemedText>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: Colors.light.accent + "12" }]}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.light.accent }]}>
              <Feather name="zap" size={18} color="#FFF" />
            </View>
            <ThemedText type="h3">Low</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Stress</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>Progress</ThemedText>
        <View style={[styles.progressCard, { backgroundColor: theme.backgroundDefault }, Shadows.small]}>
          <View style={styles.progressRow}>
            <ThemedText type="body">Goals Completed</ThemedText>
            <ThemedText type="h4" style={{ color: Colors.light.primary }}>75%</ThemedText>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={[styles.progressFill, { width: "75%", backgroundColor: Colors.light.primary }]} />
          </View>
          <View style={styles.progressRow}>
            <ThemedText type="body">Habits Consistency</ThemedText>
            <ThemedText type="h4" style={{ color: Colors.light.success }}>88%</ThemedText>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={[styles.progressFill, { width: "88%", backgroundColor: Colors.light.success }]} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>Achievements</ThemedText>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => (
            <View key={achievement.id} style={[styles.achievementCard, { backgroundColor: achievement.color + "12" }]}>
              <View style={[styles.achievementIcon, { backgroundColor: achievement.color }]}>
                <Feather name={achievement.icon as any} size={18} color="#FFF" />
              </View>
              <ThemedText type="small" style={styles.achievementLabel}>{achievement.label}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>Records</ThemedText>
        <View style={[styles.recordsCard, { backgroundColor: theme.backgroundDefault }, Shadows.small]}>
          <View style={styles.recordRow}>
            <View style={styles.recordInfo}>
              <Feather name="calendar" size={16} color={Colors.light.primary} />
              <ThemedText type="body">Days Active</ThemedText>
            </View>
            <ThemedText type="h4">45</ThemedText>
          </View>
          <View style={[styles.recordDivider, { backgroundColor: theme.border }]} />
          <View style={styles.recordRow}>
            <View style={styles.recordInfo}>
              <Feather name="book-open" size={16} color={Colors.light.secondary} />
              <ThemedText type="body">Journal Entries</ThemedText>
            </View>
            <ThemedText type="h4">32</ThemedText>
          </View>
          <View style={[styles.recordDivider, { backgroundColor: theme.border }]} />
          <View style={styles.recordRow}>
            <View style={styles.recordInfo}>
              <Feather name="video" size={16} color={Colors.light.accent} />
              <ThemedText type="body">Sessions</ThemedText>
            </View>
            <ThemedText type="h4">8</ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: { alignItems: "center", marginBottom: Spacing.xl },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: Spacing.md },
  settingsButton: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, marginTop: Spacing.md },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { marginBottom: Spacing.md },
  chartCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg },
  chart: { flexDirection: "row", justifyContent: "space-between", height: 100 },
  chartBar: { flex: 1, alignItems: "center" },
  barContainer: { flex: 1, width: 20, justifyContent: "flex-end", marginBottom: Spacing.xs },
  bar: { width: "100%", borderRadius: BorderRadius.xs },
  summaryGrid: { flexDirection: "row", gap: Spacing.sm },
  summaryCard: { flex: 1, alignItems: "center", padding: Spacing.lg, borderRadius: BorderRadius.lg },
  summaryIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: Spacing.xs },
  progressCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg, gap: Spacing.sm },
  progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressBar: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  achievementsGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  achievementCard: { width: "48%", alignItems: "center", padding: Spacing.lg, borderRadius: BorderRadius.lg },
  achievementIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: Spacing.xs },
  achievementLabel: { textAlign: "center", fontWeight: "600", fontFamily: "PlusJakartaSans_600SemiBold" },
  recordsCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg },
  recordRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  recordInfo: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  recordDivider: { height: 1, marginVertical: Spacing.md },
});
