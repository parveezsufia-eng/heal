import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Platform, Modal, TextInput, ActivityIndicator } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

const mockSessions = [
  { id: "1", therapistName: "Dr. Sarah Chen", specialty: "CBT & Anxiety", date: "Jan 22, 2026", time: "10:00 AM", status: "upcoming" },
  { id: "2", therapistName: "Dr. Michael Ross", specialty: "Trauma & PTSD", date: "Jan 25, 2026", time: "2:30 PM", status: "upcoming" },
  { id: "3", therapistName: "Dr. Sarah Chen", specialty: "CBT & Anxiety", date: "Jan 15, 2026", time: "10:00 AM", status: "completed" },
  { id: "4", therapistName: "Dr. Emily Wright", specialty: "Mindfulness", date: "Jan 10, 2026", time: "11:00 AM", status: "completed" },
];

export default function SessionsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [showPrepModal, setShowPrepModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<typeof mockSessions[0] | null>(null);
  const [sessionTopics, setSessionTopics] = useState("");
  const [isLoadingPrep, setIsLoadingPrep] = useState(false);
  const [prepSuggestions, setPrepSuggestions] = useState("");

  const upcomingSessions = mockSessions.filter(s => s.status === "upcoming");
  const completedSessions = mockSessions.filter(s => s.status === "completed");

  const openPrepModal = (session: typeof mockSessions[0]) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSession(session);
    setShowPrepModal(true);
  };

  const getSessionPrep = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoadingPrep(true);
    try {
      const response = await fetch(new URL("/api/ai/session-prep", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistName: selectedSession?.therapistName,
          specialty: selectedSession?.specialty,
          topics: sessionTopics,
        }),
      });
      const data = await response.json();
      if (data.preparation) {
        setPrepSuggestions(data.preparation);
      }
    } catch (error) {
      console.error("Session prep error:", error);
    } finally {
      setIsLoadingPrep(false);
    }
  };

  const closePrepModal = () => {
    setShowPrepModal(false);
    setSelectedSession(null);
    setSessionTopics("");
    setPrepSuggestions("");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={{ paddingTop: headerHeight + Spacing.md, paddingBottom: tabBarHeight + Spacing["5xl"] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>My Sessions</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Manage your therapy appointments
          </ThemedText>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Upcoming</ThemedText>
            <View style={[styles.badge, { backgroundColor: Colors.light.primary }]}>
              <ThemedText style={styles.badgeText}>{upcomingSessions.length}</ThemedText>
            </View>
          </View>
          {upcomingSessions.map((session) => (
            <View key={session.id} style={[styles.sessionCard, { backgroundColor: Colors.light.cardBlue }]}>
              <View style={styles.sessionHeader}>
                <View style={[styles.avatar, { backgroundColor: Colors.light.softBlue + "30" }]}>
                  <Feather name="user" size={20} color={Colors.light.softBlue} />
                </View>
                <View style={styles.sessionInfo}>
                  <ThemedText style={styles.therapistName}>{session.therapistName}</ThemedText>
                  <ThemedText style={[styles.specialty, { color: theme.textSecondary }]}>{session.specialty}</ThemedText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: Colors.light.success + "20" }]}>
                  <Feather name="clock" size={12} color={Colors.light.success} />
                  <ThemedText style={[styles.statusText, { color: Colors.light.success }]}>Scheduled</ThemedText>
                </View>
              </View>
              <View style={styles.sessionDetails}>
                <View style={styles.detailRow}>
                  <Feather name="calendar" size={14} color={theme.textSecondary} />
                  <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>{session.date}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <Feather name="clock" size={14} color={theme.textSecondary} />
                  <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>{session.time}</ThemedText>
                </View>
              </View>
              <View style={styles.actionRow}>
                <Pressable 
                  style={[styles.prepButton, { backgroundColor: Colors.light.primary }]}
                  onPress={() => openPrepModal(session)}
                  testID={`button-prep-${session.id}`}
                >
                  <Feather name="zap" size={16} color="#FFF" />
                  <ThemedText style={styles.prepButtonText}>AI Prep</ThemedText>
                </Pressable>
                <Pressable style={[styles.joinButton, { backgroundColor: theme.backgroundSecondary }]}>
                  <Feather name="video" size={16} color={Colors.light.primary} />
                  <ThemedText style={[styles.joinButtonText, { color: Colors.light.primary }]}>Join Session</ThemedText>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Completed</ThemedText>
          {completedSessions.map((session) => (
            <View key={session.id} style={[styles.sessionCard, { backgroundColor: theme.backgroundSecondary }]}>
              <View style={styles.sessionHeader}>
                <View style={[styles.avatar, { backgroundColor: Colors.light.cardPeach }]}>
                  <Feather name="user" size={20} color={Colors.light.primary} />
                </View>
                <View style={styles.sessionInfo}>
                  <ThemedText style={styles.therapistName}>{session.therapistName}</ThemedText>
                  <ThemedText style={[styles.specialty, { color: theme.textSecondary }]}>{session.specialty}</ThemedText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: theme.border }]}>
                  <Feather name="check" size={12} color={theme.textSecondary} />
                  <ThemedText style={[styles.statusText, { color: theme.textSecondary }]}>Done</ThemedText>
                </View>
              </View>
              <View style={styles.sessionDetails}>
                <View style={styles.detailRow}>
                  <Feather name="calendar" size={14} color={theme.textSecondary} />
                  <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>{session.date}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <Feather name="clock" size={14} color={theme.textSecondary} />
                  <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>{session.time}</ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showPrepModal}
        transparent
        animationType="slide"
        onRequestClose={closePrepModal}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]}>
            <View style={[styles.modalHeader, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
              <View style={styles.modalHeaderLeft}>
                <View style={[styles.modalAvatar, { backgroundColor: Colors.light.cardBlue }]}>
                  <Feather name="zap" size={18} color={Colors.light.softBlue} />
                </View>
                <View>
                  <ThemedText style={styles.modalHeaderTitle}>AI Session Prep</ThemedText>
                  <ThemedText style={[styles.modalHeaderSubtitle, { color: theme.textSecondary }]}>
                    {selectedSession?.therapistName}
                  </ThemedText>
                </View>
              </View>
              <Pressable onPress={closePrepModal} style={styles.modalCloseButton} testID="button-close-prep">
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
              <View style={[styles.infoCard, { backgroundColor: Colors.light.cardPeach }]}>
                <Feather name="info" size={18} color={Colors.light.primary} />
                <ThemedText style={styles.infoText}>
                  Let our AI help you prepare for your session with {selectedSession?.therapistName}
                </ThemedText>
              </View>

              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>What would you like to discuss?</ThemedText>
                <TextInput
                  style={[styles.formInput, { color: theme.text, backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
                  placeholder="e.g., anxiety at work, relationship issues, sleep problems..."
                  placeholderTextColor={theme.textSecondary}
                  value={sessionTopics}
                  onChangeText={setSessionTopics}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  testID="input-session-topics"
                />
              </View>

              <Pressable
                style={[styles.generateButton, { backgroundColor: isLoadingPrep ? theme.textSecondary : Colors.light.primary }]}
                onPress={getSessionPrep}
                disabled={isLoadingPrep}
                testID="button-get-prep"
              >
                {isLoadingPrep ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Feather name="cpu" size={18} color="#FFF" />
                    <ThemedText style={styles.generateButtonText}>Generate Preparation Tips</ThemedText>
                  </>
                )}
              </Pressable>

              {prepSuggestions ? (
                <View style={[styles.resultCard, { backgroundColor: Colors.light.cardGreen }]}>
                  <View style={styles.resultHeader}>
                    <Feather name="check-circle" size={20} color={Colors.light.primary} />
                    <ThemedText style={styles.resultTitle}>Your Session Preparation</ThemedText>
                  </View>
                  <ThemedText style={styles.resultText}>{prepSuggestions}</ThemedText>
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
  mainScroll: { flex: 1 },
  header: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  headerTitle: { fontSize: 28, fontFamily: "PlayfairDisplay_400Regular", color: Colors.light.text },
  headerSubtitle: { fontSize: 14, fontFamily: "PlusJakartaSans_400Regular", marginTop: Spacing.xs },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 18, fontFamily: "PlayfairDisplay_400Regular", color: Colors.light.text },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  badgeText: { fontSize: 12, fontFamily: "PlusJakartaSans_600SemiBold", color: "#FFF" },
  sessionCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
  sessionHeader: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  sessionInfo: { flex: 1, marginLeft: Spacing.md },
  therapistName: { fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold", color: Colors.light.text },
  specialty: { fontSize: 13, fontFamily: "PlusJakartaSans_400Regular" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  statusText: { fontSize: 11, fontFamily: "PlusJakartaSans_500Medium" },
  sessionDetails: { flexDirection: "row", gap: Spacing.xl, marginBottom: Spacing.md },
  detailRow: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  detailText: { fontSize: 13, fontFamily: "PlusJakartaSans_400Regular" },
  actionRow: { flexDirection: "row", gap: Spacing.sm },
  prepButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.xs, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  prepButtonText: { fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold", color: "#FFF" },
  joinButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.xs, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  joinButtonText: { fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold" },
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
  infoCard: { flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.lg, borderRadius: BorderRadius.lg },
  infoText: { flex: 1, fontSize: 14, fontFamily: "PlusJakartaSans_400Regular", color: Colors.light.text },
  formSection: { gap: Spacing.sm },
  formLabel: { fontSize: 15, fontFamily: "PlusJakartaSans_600SemiBold", color: Colors.light.text },
  formInput: { minHeight: 100, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, fontSize: 15, fontFamily: "PlusJakartaSans_400Regular" },
  generateButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg },
  generateButtonText: { fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold", color: "#FFF" },
  resultCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg, gap: Spacing.md },
  resultHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  resultTitle: { fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold", color: Colors.light.text },
  resultText: { fontSize: 15, fontFamily: "PlusJakartaSans_400Regular", color: Colors.light.text, lineHeight: 24 },
});
