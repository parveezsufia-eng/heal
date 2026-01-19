import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  Modal,
  TextInput,
} from "react-native";
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
import { JournalStackParamList } from "@/navigation/JournalStackNavigator";

type JournalNavigationProp = NativeStackNavigationProp<JournalStackParamList>;

interface JournalEntry {
  id: string;
  date: string;
  day: string;
  title: string;
  preview: string;
  mood: string;
}

const moodColors: Record<string, string> = {
  happy: Colors.light.success,
  calm: Colors.light.secondary,
  neutral: Colors.light.primary,
  sad: Colors.light.accent,
  anxious: Colors.light.emergency,
};

const sampleEntries: JournalEntry[] = [
  { id: "1", date: "Jan 18", day: "Today", title: "Finding peace", preview: "Had a wonderful meditation session this morning...", mood: "calm" },
  { id: "2", date: "Jan 17", day: "Yesterday", title: "Grateful moments", preview: "Spent time reflecting on the things I'm grateful for...", mood: "happy" },
  { id: "3", date: "Jan 16", day: "Thursday", title: "New beginnings", preview: "Started a new breathing exercise routine...", mood: "neutral" },
];

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<JournalNavigationProp>();
  const [entries, setEntries] = useState<JournalEntry[]>(sampleEntries);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [isLocked, setIsLocked] = useState(true);

  const handleUnlock = () => {
    if (pin === "1234") {
      setIsLocked(false);
      setShowPinModal(false);
      setPin("");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const handleEntryPress = (entryId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("JournalEntry", { entryId });
  };

  const handleAddEntry = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("JournalEntry", {});
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <Pressable onPress={() => handleEntryPress(item.id)}>
      <View style={[styles.entryCard, { backgroundColor: theme.backgroundSecondary }]}>
        <View style={styles.entryLeft}>
          <ThemedText style={[styles.entryDay, { color: theme.textSecondary }]}>{item.day}</ThemedText>
          <ThemedText style={styles.entryTitle}>{item.title}</ThemedText>
          <ThemedText style={[styles.entryPreview, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.preview}
          </ThemedText>
        </View>
        <View style={[styles.moodIndicator, { backgroundColor: moodColors[item.mood] + "30" }]}>
          <View style={[styles.moodDot, { backgroundColor: moodColors[item.mood] }]} />
        </View>
      </View>
    </Pressable>
  );

  const renderLockedState = () => (
    <View style={styles.lockedContainer}>
      <View style={[styles.lockIconContainer, { backgroundColor: Colors.light.cardPeach }]}>
        <Image
          source={require("../assets/images/line_art_meditation_woman_illustration.png")}
          style={styles.lockImage}
          contentFit="contain"
        />
      </View>
      <ThemedText style={styles.lockedTitle}>Your Private Space</ThemedText>
      <ThemedText style={[styles.lockedSubtitle, { color: theme.textSecondary }]}>
        Your journal is protected. Enter your PIN to access your thoughts.
      </ThemedText>
      <Pressable
        style={[styles.unlockButton, { backgroundColor: Colors.light.primary }]}
        onPress={() => setShowPinModal(true)}
      >
        <ThemedText style={styles.unlockButtonText}>Unlock Journal</ThemedText>
      </Pressable>
    </View>
  );

  const handleNavigateHabit = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("Habit");
  };

  const handleNavigateFocus = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("Focus");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {isLocked ? (
        <View style={{ flex: 1, paddingTop: headerHeight + Spacing.xl, paddingHorizontal: Spacing.xl }}>
          {renderLockedState()}
        </View>
      ) : (
        <>
          <View style={[styles.header, { paddingTop: headerHeight + Spacing.md, paddingHorizontal: Spacing.xl }]}>
            <ThemedText style={styles.headerTitle}>Journal</ThemedText>
            <Pressable style={styles.addButton} onPress={handleAddEntry}>
              <Feather name="plus" size={22} color={theme.text} />
            </Pressable>
          </View>

          <View style={styles.quickNavRow}>
            <Pressable
              style={[styles.quickNavCard, { backgroundColor: Colors.light.cardPeach }]}
              onPress={handleNavigateHabit}
            >
              <Feather name="check-circle" size={24} color={Colors.light.primary} />
              <ThemedText style={styles.quickNavTitle}>Habits</ThemedText>
              <ThemedText style={[styles.quickNavSubtitle, { color: theme.textSecondary }]}>
                Track daily habits
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.quickNavCard, { backgroundColor: Colors.light.cardBlue }]}
              onPress={handleNavigateFocus}
            >
              <Feather name="target" size={24} color={Colors.light.secondary} />
              <ThemedText style={styles.quickNavTitle}>Focus</ThemedText>
              <ThemedText style={[styles.quickNavSubtitle, { color: theme.textSecondary }]}>
                Stay productive
              </ThemedText>
            </Pressable>
          </View>

          <ThemedText style={styles.entriesLabel}>Recent Entries</ThemedText>
          <FlatList
            data={entries}
            renderItem={renderEntry}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: Spacing.xl,
              paddingBottom: tabBarHeight + Spacing["5xl"],
              flexGrow: 1,
            }}
            scrollIndicatorInsets={{ bottom: insets.bottom }}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          />
        </>
      )}

      <Modal visible={showPinModal} transparent animationType="fade" onRequestClose={() => setShowPinModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.pinModal, { backgroundColor: theme.backgroundDefault }]}>
            <Pressable style={styles.closeModalButton} onPress={() => { setShowPinModal(false); setPin(""); }}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
            <ThemedText style={styles.pinTitle}>Enter PIN</ThemedText>
            <ThemedText style={[styles.pinHint, { color: theme.textSecondary }]}>
              Hint: 1234
            </ThemedText>
            <TextInput
              style={[styles.pinInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="****"
              placeholderTextColor={theme.textSecondary}
            />
            <Pressable
              style={[styles.submitButton, { backgroundColor: Colors.light.primary }]}
              onPress={handleUnlock}
            >
              <ThemedText style={styles.submitButtonText}>Unlock</ThemedText>
            </Pressable>
            <Pressable onPress={() => { setShowPinModal(false); setPin(""); }}>
              <ThemedText style={[styles.skipText, { color: theme.textSecondary }]}>Skip</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
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
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  quickNavRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  quickNavCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
  },
  quickNavTitle: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.light.text,
    marginTop: Spacing.sm,
  },
  quickNavSubtitle: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_400Regular",
    marginTop: Spacing.xs,
  },
  entriesLabel: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_400Regular",
    color: Colors.light.text,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  entryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  entryLeft: { flex: 1 },
  entryDay: { fontSize: 12, fontFamily: "PlusJakartaSans_400Regular", marginBottom: 2 },
  entryTitle: { fontSize: 17, fontFamily: "PlusJakartaSans_500Medium", color: Colors.light.text, marginBottom: 4 },
  entryPreview: { fontSize: 13, fontFamily: "PlusJakartaSans_400Regular" },
  moodIndicator: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  moodDot: { width: 12, height: 12, borderRadius: 6 },
  lockedContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.xl },
  lockIconContainer: { width: 200, height: 200, borderRadius: 100, alignItems: "center", justifyContent: "center", marginBottom: Spacing["2xl"] },
  lockImage: { width: 140, height: 140 },
  lockedTitle: { fontSize: 26, fontFamily: "PlayfairDisplay_400Regular", color: Colors.light.text, textAlign: "center", marginBottom: Spacing.md },
  lockedSubtitle: { fontSize: 15, fontFamily: "PlusJakartaSans_400Regular", textAlign: "center", marginBottom: Spacing["2xl"], lineHeight: 24 },
  unlockButton: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing["4xl"], borderRadius: BorderRadius.lg },
  unlockButtonText: { fontSize: 15, fontFamily: "PlusJakartaSans_600SemiBold", color: "#FFFFFF" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: Spacing.xl },
  pinModal: { width: "100%", maxWidth: 320, borderRadius: BorderRadius.xl, padding: Spacing["2xl"], alignItems: "center" },
  closeModalButton: { position: "absolute", top: Spacing.lg, right: Spacing.lg },
  pinTitle: { fontSize: 22, fontFamily: "PlayfairDisplay_400Regular", color: Colors.light.text, marginBottom: Spacing.xs, marginTop: Spacing.md },
  pinHint: { fontSize: 13, fontFamily: "PlusJakartaSans_400Regular", marginBottom: Spacing.xl },
  pinInput: { width: "100%", height: 56, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg, fontSize: 24, textAlign: "center", letterSpacing: 12, marginBottom: Spacing.xl, fontFamily: "PlusJakartaSans_600SemiBold" },
  submitButton: { width: "100%", paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg, alignItems: "center", marginBottom: Spacing.md },
  submitButtonText: { fontSize: 15, fontFamily: "PlusJakartaSans_600SemiBold", color: "#FFFFFF" },
  skipText: { fontSize: 14, fontFamily: "PlusJakartaSans_400Regular" },
});
