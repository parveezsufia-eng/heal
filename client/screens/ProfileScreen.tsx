import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
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
  { id: "1", icon: "award", label: "7 Day Streak" },
  { id: "2", icon: "book-open", label: "100 Entries" },
  { id: "3", icon: "sun", label: "Early Bird" },
  { id: "4", icon: "star", label: "Consistent" },
];

const stats = [
  { label: "Sessions", value: "12", icon: "video" },
  { label: "Journal", value: "45", icon: "book-open" },
  { label: "Streak", value: "7", icon: "zap" },
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
        <ThemedText style={styles.headerTitle}>Profile</ThemedText>
        <Pressable style={styles.settingsButton} onPress={handleSettingsPress}>
          <Feather name="settings" size={22} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.profileSection}>
        <View style={[styles.avatarContainer, { backgroundColor: Colors.light.cardPeach }]}>
          <Image
            source={require("../assets/images/line_art_meditation_woman_illustration.png")}
            style={styles.avatarImage}
            contentFit="contain"
          />
        </View>
        <ThemedText style={styles.userName}>Guest User</ThemedText>
        <ThemedText style={[styles.userMeta, { color: theme.textSecondary }]}>
          Member since January 2026
        </ThemedText>
      </View>

      <View style={styles.statsRow}>
        {stats.map((stat, index) => (
          <View key={index} style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name={stat.icon as any} size={18} color={Colors.light.primary} />
            <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Weekly Mood</ThemedText>
        <View style={[styles.chartContainer, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.chart}>
            {weeklyData.map((data, index) => (
              <View key={index} style={styles.chartColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      { height: `${data.value}%`, backgroundColor: Colors.light.primary },
                    ]}
                  />
                </View>
                <ThemedText style={[styles.dayLabel, { color: theme.textSecondary }]}>
                  {data.day}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Achievements</ThemedText>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => (
            <View key={achievement.id} style={[styles.achievementCard, { backgroundColor: Colors.light.cardPeach }]}>
              <View style={[styles.achievementIcon, { backgroundColor: Colors.light.primary + "20" }]}>
                <Feather name={achievement.icon as any} size={18} color={Colors.light.primary} />
              </View>
              <ThemedText style={styles.achievementLabel}>{achievement.label}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Progress</ThemedText>
        <View style={[styles.progressCard, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <ThemedText style={styles.progressLabel}>Goals Completed</ThemedText>
              <ThemedText style={[styles.progressPercent, { color: Colors.light.primary }]}>75%</ThemedText>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
              <View style={[styles.progressBarFill, { width: "75%", backgroundColor: Colors.light.primary }]} />
            </View>
          </View>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <ThemedText style={styles.progressLabel}>Habits Consistency</ThemedText>
              <ThemedText style={[styles.progressPercent, { color: Colors.light.success }]}>88%</ThemedText>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
              <View style={[styles.progressBarFill, { width: "88%", backgroundColor: Colors.light.success }]} />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.xl },
  headerTitle: { fontSize: 28, fontFamily: "PlayfairDisplay_400Regular", color: Colors.light.text },
  settingsButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.light.backgroundSecondary, alignItems: "center", justifyContent: "center" },
  profileSection: { alignItems: "center", marginBottom: Spacing["2xl"] },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: Spacing.md },
  avatarImage: { width: 70, height: 70 },
  userName: { fontSize: 22, fontFamily: "PlayfairDisplay_400Regular", color: Colors.light.text, marginBottom: 4 },
  userMeta: { fontSize: 13, fontFamily: "PlusJakartaSans_400Regular" },
  statsRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing["2xl"] },
  statCard: { flex: 1, alignItems: "center", padding: Spacing.lg, borderRadius: BorderRadius.lg, gap: Spacing.xs },
  statValue: { fontSize: 22, fontFamily: "PlusJakartaSans_700Bold", color: Colors.light.text },
  statLabel: { fontSize: 12, fontFamily: "PlusJakartaSans_400Regular" },
  section: { marginBottom: Spacing["2xl"] },
  sectionTitle: { fontSize: 18, fontFamily: "PlayfairDisplay_400Regular", color: Colors.light.text, marginBottom: Spacing.md },
  chartContainer: { padding: Spacing.lg, borderRadius: BorderRadius.lg },
  chart: { flexDirection: "row", justifyContent: "space-between", height: 100 },
  chartColumn: { flex: 1, alignItems: "center" },
  barWrapper: { flex: 1, width: 20, justifyContent: "flex-end", marginBottom: Spacing.xs },
  bar: { width: "100%", borderRadius: BorderRadius.xs },
  dayLabel: { fontSize: 12, fontFamily: "PlusJakartaSans_400Regular" },
  achievementsGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  achievementCard: { width: "47%", alignItems: "center", padding: Spacing.lg, borderRadius: BorderRadius.lg, gap: Spacing.sm },
  achievementIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  achievementLabel: { fontSize: 13, fontFamily: "PlusJakartaSans_500Medium", color: Colors.light.text, textAlign: "center" },
  progressCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg, gap: Spacing.lg },
  progressItem: { gap: Spacing.sm },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { fontSize: 14, fontFamily: "PlusJakartaSans_400Regular", color: Colors.light.text },
  progressPercent: { fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold" },
  progressBarBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 4 },
});
