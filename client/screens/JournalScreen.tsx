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
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { JournalStackParamList } from "@/navigation/JournalStackNavigator";

type JournalNavigationProp = NativeStackNavigationProp<JournalStackParamList>;

interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  title: string;
  preview: string;
}

const moodIcons: Record<string, { icon: string; color: string }> = {
  happy: { icon: "smile", color: Colors.light.success },
  calm: { icon: "coffee", color: Colors.light.secondary },
  neutral: { icon: "meh", color: Colors.light.warm },
  sad: { icon: "frown", color: Colors.light.accent },
  anxious: { icon: "alert-circle", color: Colors.light.emergency },
};

const sampleEntries: JournalEntry[] = [
  {
    id: "1",
    date: "Today",
    mood: "happy",
    title: "A productive day",
    preview: "Had a great meditation session this morning. Feeling grateful for...",
  },
  {
    id: "2",
    date: "Yesterday",
    mood: "calm",
    title: "Finding peace",
    preview: "Took a long walk in the park. The weather was perfect and...",
  },
  {
    id: "3",
    date: "Jan 16",
    mood: "neutral",
    title: "Reflecting on goals",
    preview: "Spent some time thinking about my goals for this year...",
  },
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

  const renderEntry = ({ item }: { item: JournalEntry }) => {
    const moodInfo = moodIcons[item.mood];
    return (
      <Pressable onPress={() => handleEntryPress(item.id)}>
        <View style={[styles.entryCard, { backgroundColor: theme.backgroundDefault }, Shadows.small]}>
          <View style={styles.entryHeader}>
            <View style={[styles.moodBadge, { backgroundColor: moodInfo.color + "15" }]}>
              <Feather name={moodInfo.icon as any} size={16} color={moodInfo.color} />
            </View>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {item.date}
            </ThemedText>
          </View>
          <ThemedText type="h4" style={styles.entryTitle}>
            {item.title}
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }} numberOfLines={2}>
            {item.preview}
          </ThemedText>
        </View>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require("../assets/images/empty_journal_illustration.png")}
        style={styles.emptyImage}
        contentFit="contain"
      />
      <ThemedText type="h3" style={styles.emptyTitle}>
        Start Your Journey
      </ThemedText>
      <ThemedText type="body" style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Write your first journal entry and begin your healing path
      </ThemedText>
      <Button onPress={handleAddEntry} style={styles.emptyButton}>
        Write First Entry
      </Button>
    </View>
  );

  const renderLockedState = () => (
    <View style={styles.lockedContainer}>
      <View style={[styles.lockIcon, { backgroundColor: Colors.light.primary + "15" }]}>
        <Feather name="lock" size={48} color={Colors.light.primary} />
      </View>
      <ThemedText type="h2" style={styles.lockedTitle}>
        Journal Protected
      </ThemedText>
      <ThemedText type="body" style={[styles.lockedSubtitle, { color: theme.textSecondary }]}>
        Your entries are private and protected
      </ThemedText>
      <Button onPress={() => setShowPinModal(true)} style={styles.unlockButton}>
        Unlock Journal
      </Button>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {isLocked ? (
        <View style={{ flex: 1, paddingTop: headerHeight + Spacing.xl, paddingHorizontal: Spacing.lg }}>
          {renderLockedState()}
        </View>
      ) : (
        <>
          <FlatList
            data={entries}
            renderItem={renderEntry}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingTop: headerHeight + Spacing.md,
              paddingBottom: tabBarHeight + Spacing["5xl"],
              paddingHorizontal: Spacing.lg,
              flexGrow: 1,
            }}
            scrollIndicatorInsets={{ bottom: insets.bottom }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          />
          <Pressable
            style={[styles.fab, { backgroundColor: Colors.light.primary, bottom: tabBarHeight + Spacing.xl }, Shadows.medium]}
            onPress={handleAddEntry}
          >
            <Feather name="plus" size={24} color="#FFF" />
          </Pressable>
        </>
      )}

      <Modal visible={showPinModal} transparent animationType="fade" onRequestClose={() => setShowPinModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.pinModal, { backgroundColor: theme.backgroundDefault }]}>
            <View style={[styles.pinLockIcon, { backgroundColor: Colors.light.primary + "15" }]}>
              <Feather name="lock" size={28} color={Colors.light.primary} />
            </View>
            <ThemedText type="h3" style={styles.pinTitle}>Enter PIN</ThemedText>
            <ThemedText type="small" style={[styles.pinSubtitle, { color: theme.textSecondary }]}>
              Hint: 1234
            </ThemedText>
            <TextInput
              style={[styles.pinInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="Enter PIN"
              placeholderTextColor={theme.textSecondary}
            />
            <View style={styles.pinButtons}>
              <Pressable style={[styles.pinCancelButton, { borderColor: theme.border }]} onPress={() => { setShowPinModal(false); setPin(""); }}>
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Button onPress={handleUnlock} style={styles.pinUnlockButton}>Unlock</Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  entryCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.sm },
  moodBadge: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  entryTitle: { marginBottom: Spacing.xs },
  fab: { position: "absolute", right: Spacing.xl, width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.xl },
  emptyImage: { width: 180, height: 180, marginBottom: Spacing.xl },
  emptyTitle: { textAlign: "center", marginBottom: Spacing.sm },
  emptySubtitle: { textAlign: "center", marginBottom: Spacing.xl },
  emptyButton: { paddingHorizontal: Spacing["3xl"] },
  lockedContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.xl },
  lockIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: Spacing.xl },
  lockedTitle: { textAlign: "center", marginBottom: Spacing.sm },
  lockedSubtitle: { textAlign: "center", marginBottom: Spacing.xl },
  unlockButton: { paddingHorizontal: Spacing["3xl"] },
  modalOverlay: { flex: 1, backgroundColor: "rgba(52,50,50,0.6)", justifyContent: "center", alignItems: "center", padding: Spacing.xl },
  pinModal: { width: "100%", maxWidth: 320, borderRadius: BorderRadius.xl, padding: Spacing["2xl"], alignItems: "center" },
  pinLockIcon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: Spacing.lg },
  pinTitle: { marginBottom: Spacing.xs },
  pinSubtitle: { textAlign: "center", marginBottom: Spacing.xl },
  pinInput: { width: "100%", height: 56, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg, fontSize: 24, textAlign: "center", letterSpacing: 8, marginBottom: Spacing.xl, fontFamily: "PlusJakartaSans_600SemiBold" },
  pinButtons: { flexDirection: "row", gap: Spacing.md, width: "100%" },
  pinCancelButton: { flex: 1, alignItems: "center", paddingVertical: Spacing.md, borderWidth: 1, borderRadius: BorderRadius.lg },
  pinUnlockButton: { flex: 1 },
});
