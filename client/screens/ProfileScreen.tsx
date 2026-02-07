import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Platform, Modal, ActivityIndicator, TextInput } from "react-native";
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
import { getApiUrl } from "@/lib/query-client";
import { useAuth } from "@/hooks/use-auth";

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
  const { user } = useAuth();

  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState("");
  const [userGoals, setUserGoals] = useState("");

  const handleSettingsPress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Settings");
  };

  const openDashboardModal = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDashboardModal(true);
  };

  const getAIInsights = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoadingInsights(true);
    try {
      const progressData = {
        sessions: 12,
        journalEntries: 45,
        streak: 7,
        goalsCompleted: 75,
        habitsConsistency: 88,
        weeklyMood: weeklyData.map(d => d.value),
        achievements: achievements.map(a => a.label),
        userGoals: userGoals || "general wellness improvement",
      };
      const response = await fetch(new URL("/api/ai/progress-insights", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progressData),
      });
      const data = await response.json();
      if (data.insights) {
        setAiInsights(data.insights);
      }
    } catch (error) {
      console.error("AI insights error:", error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

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
        <ThemedText style={styles.userName}>{user.name}</ThemedText>
        <ThemedText style={[styles.userMeta, { color: theme.textSecondary }]}>
          {user.email}
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
        <ThemedText style={styles.sectionTitle}>Medical History Summary</ThemedText>
        <View style={[styles.progressCard, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText style={{ color: theme.textSecondary, fontStyle: user.medicalHistory ? "normal" : "italic" }}>
            {user.medicalHistory || "No medical history recorded."}
          </ThemedText>
        </View>
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

      <Pressable
        style={[styles.aiDashboardCard, { backgroundColor: Colors.light.cardBlue }]}
        onPress={openDashboardModal}
        testID="button-open-dashboard"
      >
        <View style={[styles.aiDashboardIcon, { backgroundColor: Colors.light.softBlue + "30" }]}>
          <Feather name="pie-chart" size={24} color={Colors.light.softBlue} />
        </View>
        <View style={styles.aiDashboardInfo}>
          <ThemedText style={styles.aiDashboardTitle}>AI Progress Dashboard</ThemedText>
          <ThemedText style={[styles.aiDashboardSubtitle, { color: theme.textSecondary }]}>
            Get personalized insights and recommendations
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={24} color={Colors.light.primary} />
      </Pressable>

      <Modal
        visible={showDashboardModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDashboardModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]}>
            <View style={[styles.modalHeader, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
              <View style={styles.modalHeaderLeft}>
                <View style={[styles.modalAvatar, { backgroundColor: Colors.light.cardBlue }]}>
                  <Feather name="pie-chart" size={18} color={Colors.light.softBlue} />
                </View>
                <View>
                  <ThemedText style={styles.modalHeaderTitle}>AI Progress Dashboard</ThemedText>
                  <ThemedText style={[styles.modalHeaderSubtitle, { color: theme.textSecondary }]}>
                    Your wellness journey insights
                  </ThemedText>
                </View>
              </View>
              <Pressable onPress={() => setShowDashboardModal(false)} style={styles.modalCloseButton} testID="button-close-dashboard">
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
              <View style={[styles.summaryCard, { backgroundColor: Colors.light.cardPeach }]}>
                <ThemedText style={styles.summaryTitle}>Your Progress Summary</ThemedText>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <ThemedText style={styles.summaryValue}>12</ThemedText>
                    <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>Sessions</ThemedText>
                  </View>
                  <View style={styles.summaryItem}>
                    <ThemedText style={styles.summaryValue}>45</ThemedText>
                    <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>Entries</ThemedText>
                  </View>
                  <View style={styles.summaryItem}>
                    <ThemedText style={styles.summaryValue}>7</ThemedText>
                    <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>Day Streak</ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>What are your wellness goals?</ThemedText>
                <TextInput
                  style={[styles.formInput, { color: theme.text, backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
                  placeholder="e.g., reduce anxiety, improve sleep, build healthy habits..."
                  placeholderTextColor={theme.textSecondary}
                  value={userGoals}
                  onChangeText={setUserGoals}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  testID="input-user-goals"
                />
              </View>

              <Pressable
                style={[styles.insightsButton, { backgroundColor: isLoadingInsights ? theme.textSecondary : Colors.light.primary }]}
                onPress={getAIInsights}
                disabled={isLoadingInsights}
                testID="button-get-insights"
              >
                {isLoadingInsights ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Feather name="zap" size={18} color="#FFF" />
                    <ThemedText style={styles.insightsButtonText}>Get AI Insights</ThemedText>
                  </>
                )}
              </Pressable>

              {aiInsights ? (
                <View style={[styles.insightsCard, { backgroundColor: Colors.light.cardGreen }]}>
                  <View style={styles.insightsHeader}>
                    <Feather name="award" size={20} color={Colors.light.primary} />
                    <ThemedText style={styles.insightsTitle}>Your Personalized Insights</ThemedText>
                  </View>
                  <ThemedText style={styles.insightsText}>{aiInsights}</ThemedText>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  aiDashboardCard: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.lg, padding: Spacing.lg, borderRadius: BorderRadius.lg, gap: Spacing.md },
  aiDashboardIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  aiDashboardInfo: { flex: 1 },
  aiDashboardTitle: { fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold", color: Colors.light.text },
  aiDashboardSubtitle: { fontSize: 13, fontFamily: "PlusJakartaSans_400Regular" },
  modalContainer: { flex: 1, justifyContent: "flex-end" },
  modalContent: { height: "85%", borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, overflow: "hidden" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: Spacing.lg, paddingTop: Spacing.xl, borderBottomWidth: 1 },
  modalHeaderLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  modalAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  modalHeaderTitle: { fontWeight: "600", fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold" },
  modalHeaderSubtitle: { fontSize: 12, fontFamily: "PlusJakartaSans_400Regular" },
  modalCloseButton: { padding: Spacing.xs },
  modalScroll: { flex: 1 },
  modalScrollContent: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xl * 2 },
  summaryCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg },
  summaryTitle: { fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold", color: Colors.light.text, marginBottom: Spacing.md },
  summaryGrid: { flexDirection: "row", justifyContent: "space-around" },
  summaryItem: { alignItems: "center" },
  summaryValue: { fontSize: 24, fontFamily: "PlusJakartaSans_700Bold", color: Colors.light.primary },
  summaryLabel: { fontSize: 12, fontFamily: "PlusJakartaSans_400Regular" },
  formSection: { gap: Spacing.sm },
  formLabel: { fontSize: 15, fontFamily: "PlusJakartaSans_600SemiBold", color: Colors.light.text },
  formInput: { minHeight: 80, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, fontSize: 15, fontFamily: "PlusJakartaSans_400Regular" },
  insightsButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg },
  insightsButtonText: { fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold", color: "#FFF" },
  insightsCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg, gap: Spacing.md },
  insightsHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  insightsTitle: { fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold", color: Colors.light.text },
  insightsText: { fontSize: 15, fontFamily: "PlusJakartaSans_400Regular", color: Colors.light.text, lineHeight: 24 },
});
