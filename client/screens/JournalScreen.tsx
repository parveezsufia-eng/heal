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
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { JournalStackParamList } from "@/navigation/JournalStackNavigator";

type JournalNavigationProp = NativeStackNavigationProp<JournalStackParamList>;

interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  title: string;
  preview: string;
  moodColor: string;
}

const moodIcons: Record<string, { icon: string; color: string }> = {
  happy: { icon: "smile", color: "#9FD8CB" },
  calm: { icon: "coffee", color: "#A8D5BA" },
  neutral: { icon: "meh", color: "#FFD6A5" },
  sad: { icon: "frown", color: "#E8B4B8" },
  anxious: { icon: "alert-circle", color: "#FF6B6B" },
};

const sampleEntries: JournalEntry[] = [
  {
    id: "1",
    date: "Today",
    mood: "happy",
    title: "A productive day",
    preview: "Had a great meditation session this morning. Feeling grateful for...",
    moodColor: "#9FD8CB",
  },
  {
    id: "2",
    date: "Yesterday",
    mood: "calm",
    title: "Finding peace",
    preview: "Took a long walk in the park. The weather was perfect and...",
    moodColor: "#A8D5BA",
  },
  {
    id: "3",
    date: "Jan 16",
    mood: "neutral",
    title: "Reflecting on goals",
    preview: "Spent some time thinking about my goals for this year...",
    moodColor: "#FFD6A5",
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
        <Card style={[styles.entryCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.entryHeader}>
            <View style={[styles.moodBadge, { backgroundColor: moodInfo.color + "30" }]}>
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
        </Card>
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
      <View style={[styles.lockIcon, { backgroundColor: Colors.light.primary + "20" }]}>
        <Feather name="lock" size={48} color={Colors.light.primary} />
      </View>
      <ThemedText type="h2" style={styles.lockedTitle}>
        Journal is Protected
      </ThemedText>
      <ThemedText type="body" style={[styles.lockedSubtitle, { color: theme.textSecondary }]}>
        Your journal entries are private and protected with a PIN
      </ThemedText>
      <Button onPress={() => setShowPinModal(true)} style={styles.unlockButton}>
        Unlock Journal
      </Button>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {isLocked ? (
        <View
          style={{
            flex: 1,
            paddingTop: headerHeight + Spacing.xl,
            paddingHorizontal: Spacing.lg,
          }}
        >
          {renderLockedState()}
        </View>
      ) : (
        <>
          <FlatList
            data={entries}
            renderItem={renderEntry}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingTop: headerHeight + Spacing.lg,
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
            style={[
              styles.fab,
              { backgroundColor: Colors.light.primary, bottom: tabBarHeight + Spacing.xl },
            ]}
            onPress={handleAddEntry}
          >
            <Feather name="plus" size={24} color="#FFF" />
          </Pressable>
        </>
      )}

      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.pinModal, { backgroundColor: theme.backgroundDefault }]}>
            <View style={[styles.pinLockIcon, { backgroundColor: Colors.light.primary + "20" }]}>
              <Feather name="lock" size={28} color={Colors.light.primary} />
            </View>
            <ThemedText type="h3" style={styles.pinTitle}>
              Enter PIN
            </ThemedText>
            <ThemedText type="small" style={[styles.pinSubtitle, { color: theme.textSecondary }]}>
              Enter your 4-digit PIN to unlock (hint: 1234)
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
              <Pressable
                style={[styles.pinCancelButton, { borderColor: theme.border }]}
                onPress={() => {
                  setShowPinModal(false);
                  setPin("");
                }}
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Button onPress={handleUnlock} style={styles.pinUnlockButton}>
                Unlock
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  entryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  moodBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  entryTitle: {
    marginBottom: Spacing.xs,
  },
  fab: {
    position: "absolute",
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing["3xl"],
  },
  lockedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  lockIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  lockedTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  lockedSubtitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  unlockButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing["3xl"],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  pinModal: {
    width: "100%",
    maxWidth: 320,
    borderRadius: BorderRadius.xl,
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  pinLockIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  pinTitle: {
    marginBottom: Spacing.xs,
  },
  pinSubtitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  pinInput: {
    width: "100%",
    height: 52,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: Spacing.xl,
  },
  pinButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
  },
  pinCancelButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  pinUnlockButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
  },
});
