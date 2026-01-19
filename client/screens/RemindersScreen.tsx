import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Platform, TextInput, Modal, ActivityIndicator } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

interface Reminder {
  id: string;
  title: string;
  time: string;
  days: string[];
  enabled: boolean;
  type: "wellness" | "medication" | "hydration" | "exercise" | "custom";
}

const initialReminders: Reminder[] = [
  { id: "1", title: "Morning Meditation", time: "7:00 AM", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], enabled: true, type: "wellness" },
  { id: "2", title: "Take Vitamins", time: "8:00 AM", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], enabled: true, type: "medication" },
  { id: "3", title: "Drink Water", time: "Every 2 hours", days: ["Daily"], enabled: true, type: "hydration" },
  { id: "4", title: "Evening Walk", time: "6:00 PM", days: ["Mon", "Wed", "Fri"], enabled: false, type: "exercise" },
];

const typeIcons = {
  wellness: "heart",
  medication: "activity",
  hydration: "droplet",
  exercise: "activity",
  custom: "bell",
};

const typeColors = {
  wellness: Colors.light.cardPeach,
  medication: Colors.light.cardBlue,
  hydration: Colors.light.cardGreen,
  exercise: Colors.light.cardBlue,
  custom: Colors.light.backgroundSecondary,
};

export default function RemindersScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [showAIModal, setShowAIModal] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [userRoutine, setUserRoutine] = useState("");

  const toggleReminder = (id: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const addReminder = () => {
    if (!newReminderTitle.trim()) return;
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: newReminderTitle.trim(),
      time: "9:00 AM",
      days: ["Daily"],
      enabled: true,
      type: "custom",
    };
    setReminders((prev) => [newReminder, ...prev]);
    setNewReminderTitle("");
    setShowAddModal(false);
  };

  const getAISuggestions = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoadingAI(true);
    try {
      const response = await fetch(new URL("/api/ai/reminder-suggestions", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentReminders: reminders.map((r) => r.title),
          userRoutine: userRoutine || "general wellness routine",
        }),
      });
      const data = await response.json();
      if (data.suggestions) {
        setAiSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error("AI reminder suggestions error:", error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const enabledCount = reminders.filter((r) => r.enabled).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={{ paddingTop: headerHeight + Spacing.md, paddingBottom: tabBarHeight + Spacing["5xl"] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Reminders</ThemedText>
          <Pressable
            style={[styles.addButton, { backgroundColor: Colors.light.primary }]}
            onPress={() => setShowAddModal(true)}
            testID="button-add-reminder"
          >
            <Feather name="plus" size={20} color="#FFF" />
          </Pressable>
        </View>

        <Pressable
          style={[styles.aiCard, { backgroundColor: Colors.light.cardBlue }]}
          onPress={() => setShowAIModal(true)}
          testID="button-ai-reminders"
        >
          <View style={[styles.aiIcon, { backgroundColor: Colors.light.softBlue + "30" }]}>
            <Feather name="cpu" size={20} color={Colors.light.softBlue} />
          </View>
          <View style={styles.aiInfo}>
            <ThemedText style={styles.aiTitle}>AI Reminder Suggestions</ThemedText>
            <ThemedText style={[styles.aiSubtitle, { color: theme.textSecondary }]}>
              Get personalized wellness reminders
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.light.primary} />
        </Pressable>

        <View style={[styles.statsCard, { backgroundColor: Colors.light.cardPeach }]}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{reminders.length}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Total</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{enabledCount}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Active</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.sectionTitle}>Your Reminders</ThemedText>
        {reminders.map((reminder) => (
          <View key={reminder.id} style={[styles.reminderCard, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={[styles.reminderIcon, { backgroundColor: typeColors[reminder.type] }]}>
              <Feather name={typeIcons[reminder.type] as any} size={18} color={Colors.light.primary} />
            </View>
            <View style={styles.reminderContent}>
              <ThemedText style={styles.reminderTitle}>{reminder.title}</ThemedText>
              <View style={styles.reminderMeta}>
                <Feather name="clock" size={12} color={theme.textSecondary} />
                <ThemedText style={[styles.reminderTime, { color: theme.textSecondary }]}>{reminder.time}</ThemedText>
                <ThemedText style={[styles.reminderDays, { color: theme.textSecondary }]}>
                  {reminder.days.join(", ")}
                </ThemedText>
              </View>
            </View>
            <Pressable
              style={[
                styles.toggleButton,
                { backgroundColor: reminder.enabled ? Colors.light.primary : theme.border },
              ]}
              onPress={() => toggleReminder(reminder.id)}
              testID={`toggle-reminder-${reminder.id}`}
            >
              <View style={[styles.toggleThumb, { transform: [{ translateX: reminder.enabled ? 18 : 0 }] }]} />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <ThemedText style={styles.modalTitle}>Add Reminder</ThemedText>
              <Pressable onPress={() => setShowAddModal(false)} testID="button-close-add-reminder">
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <ThemedText style={styles.inputLabel}>Reminder Title</ThemedText>
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
                placeholder="e.g., Take a mindful break..."
                placeholderTextColor={theme.textSecondary}
                value={newReminderTitle}
                onChangeText={setNewReminderTitle}
                testID="input-reminder-title"
              />

              <Pressable
                style={[styles.saveButton, { backgroundColor: Colors.light.primary }]}
                onPress={addReminder}
                testID="button-save-reminder"
              >
                <Feather name="bell" size={20} color="#FFF" />
                <ThemedText style={styles.saveButtonText}>Add Reminder</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showAIModal} transparent animationType="slide" onRequestClose={() => setShowAIModal(false)}>
        <View style={styles.modalContainer}>
          <View style={[styles.aiModalContent, { backgroundColor: theme.backgroundRoot }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <View style={styles.modalHeaderLeft}>
                <View style={[styles.modalAvatar, { backgroundColor: Colors.light.cardBlue }]}>
                  <Feather name="cpu" size={18} color={Colors.light.softBlue} />
                </View>
                <ThemedText style={styles.modalTitle}>AI Reminders</ThemedText>
              </View>
              <Pressable onPress={() => setShowAIModal(false)} testID="button-close-ai-reminder">
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.aiModalScroll} contentContainerStyle={styles.aiModalScrollContent}>
              <View style={styles.formSection}>
                <ThemedText style={styles.inputLabel}>Tell us about your daily routine</ThemedText>
                <TextInput
                  style={[styles.formInput, { color: theme.text, backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
                  placeholder="e.g., I work from 9-5, exercise in evenings..."
                  placeholderTextColor={theme.textSecondary}
                  value={userRoutine}
                  onChangeText={setUserRoutine}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  testID="input-user-routine"
                />
              </View>

              <Pressable
                style={[styles.generateButton, { backgroundColor: isLoadingAI ? theme.textSecondary : Colors.light.primary }]}
                onPress={getAISuggestions}
                disabled={isLoadingAI}
                testID="button-get-ai-reminders"
              >
                {isLoadingAI ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Feather name="zap" size={18} color="#FFF" />
                    <ThemedText style={styles.generateButtonText}>Get Suggestions</ThemedText>
                  </>
                )}
              </Pressable>

              {aiSuggestions ? (
                <View style={[styles.resultCard, { backgroundColor: Colors.light.cardGreen }]}>
                  <View style={styles.resultHeader}>
                    <Feather name="bell" size={20} color={Colors.light.primary} />
                    <ThemedText style={styles.resultTitle}>Suggested Reminders</ThemedText>
                  </View>
                  <ThemedText style={styles.resultText}>{aiSuggestions}</ThemedText>
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  headerTitle: { fontSize: 28, fontFamily: "PlayfairDisplay_400Regular", color: Colors.light.text },
  addButton: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  aiCard: { flexDirection: "row", alignItems: "center", marginHorizontal: Spacing.xl, padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg, gap: Spacing.md },
  aiIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  aiInfo: { flex: 1 },
  aiTitle: { fontSize: 15, fontFamily: "PlusJakartaSans_600SemiBold", color: Colors.light.text },
  aiSubtitle: { fontSize: 12, fontFamily: "PlusJakartaSans_400Regular" },
  statsCard: { flexDirection: "row", marginHorizontal: Spacing.xl, padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.xl },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 28, fontFamily: "PlusJakartaSans_700Bold", color: Colors.light.text },
  statLabel: { fontSize: 12, fontFamily: "PlusJakartaSans_400Regular" },
  statDivider: { width: 1 },
  sectionTitle: { fontSize: 18, fontFamily: "PlayfairDisplay_400Regular", color: Colors.light.text, paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  reminderCard: { flexDirection: "row", alignItems: "center", marginHorizontal: Spacing.xl, padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, gap: Spacing.md },
  reminderIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  reminderContent: { flex: 1 },
  reminderTitle: { fontSize: 15, fontFamily: "PlusJakartaSans_500Medium", color: Colors.light.text },
  reminderMeta: { flexDirection: "row", alignItems: "center", marginTop: Spacing.xs, gap: Spacing.xs },
  reminderTime: { fontSize: 12, fontFamily: "PlusJakartaSans_400Regular" },
  reminderDays: { fontSize: 12, fontFamily: "PlusJakartaSans_400Regular" },
  toggleButton: { width: 44, height: 26, borderRadius: 13, justifyContent: "center", paddingHorizontal: 2 },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#FFF" },
  modalContainer: { flex: 1, justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, paddingBottom: Spacing["3xl"] },
  aiModalContent: { height: "75%", borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: Spacing.lg, borderBottomWidth: 1 },
  modalHeaderLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  modalAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontSize: 18, fontFamily: "PlusJakartaSans_600SemiBold", color: Colors.light.text },
  modalBody: { padding: Spacing.lg },
  aiModalScroll: { flex: 1 },
  aiModalScrollContent: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xl * 2 },
  formSection: { gap: Spacing.sm },
  inputLabel: { fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold", color: Colors.light.text, marginBottom: Spacing.sm },
  input: { height: 52, borderRadius: BorderRadius.md, borderWidth: 1, paddingHorizontal: Spacing.lg, fontSize: 15, fontFamily: "PlusJakartaSans_400Regular", marginBottom: Spacing.lg },
  formInput: { minHeight: 100, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, fontSize: 15, fontFamily: "PlusJakartaSans_400Regular" },
  saveButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg },
  saveButtonText: { fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold", color: "#FFF" },
  generateButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg },
  generateButtonText: { fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold", color: "#FFF" },
  resultCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg, gap: Spacing.md },
  resultHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  resultTitle: { fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold", color: Colors.light.text },
  resultText: { fontSize: 15, fontFamily: "PlusJakartaSans_400Regular", color: Colors.light.text, lineHeight: 24 },
});
