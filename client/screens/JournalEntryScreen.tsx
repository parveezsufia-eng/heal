import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { JournalStackParamList } from "@/navigation/JournalStackNavigator";

type JournalEntryRouteProp = RouteProp<JournalStackParamList, "JournalEntry">;

const moods = [
  { id: "happy", icon: "smile", label: "Happy", color: "#9FD8CB" },
  { id: "calm", icon: "coffee", label: "Calm", color: "#A8D5BA" },
  { id: "neutral", icon: "meh", label: "Neutral", color: "#FFD6A5" },
  { id: "sad", icon: "frown", label: "Sad", color: "#E8B4B8" },
  { id: "anxious", icon: "alert-circle", label: "Anxious", color: "#FF6B6B" },
];

export default function JournalEntryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<JournalEntryRouteProp>();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleMoodSelect = (moodId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedMood(moodId);
  };

  const handleSave = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    navigation.goBack();
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing["3xl"],
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.dateContainer}>
        <Feather name="calendar" size={16} color={theme.textSecondary} />
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {dateString}
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.label}>
          How are you feeling?
        </ThemedText>
        <View style={styles.moodContainer}>
          {moods.map((mood) => (
            <Pressable
              key={mood.id}
              style={[
                styles.moodButton,
                {
                  backgroundColor:
                    selectedMood === mood.id ? mood.color : theme.backgroundDefault,
                  borderColor: selectedMood === mood.id ? mood.color : "transparent",
                },
              ]}
              onPress={() => handleMoodSelect(mood.id)}
            >
              <Feather
                name={mood.icon as any}
                size={24}
                color={selectedMood === mood.id ? "#FFF" : theme.text}
              />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.label}>
          Title
        </ThemedText>
        <TextInput
          style={[
            styles.titleInput,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
            },
          ]}
          placeholder="Give your entry a title..."
          placeholderTextColor={theme.textSecondary}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.label}>
          Write your thoughts
        </ThemedText>
        <TextInput
          style={[
            styles.contentInput,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
            },
          ]}
          placeholder="What's on your mind today? Express your feelings, thoughts, gratitude, or anything you want to remember..."
          placeholderTextColor={theme.textSecondary}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.promptsSection}>
        <ThemedText type="h4" style={styles.label}>
          Writing prompts
        </ThemedText>
        <View style={styles.promptsContainer}>
          <Pressable style={[styles.promptChip, { backgroundColor: Colors.light.primary + "20" }]}>
            <ThemedText type="small" style={{ color: Colors.light.primary }}>
              What am I grateful for?
            </ThemedText>
          </Pressable>
          <Pressable style={[styles.promptChip, { backgroundColor: Colors.light.secondary + "20" }]}>
            <ThemedText type="small" style={{ color: Colors.light.secondary }}>
              What challenged me today?
            </ThemedText>
          </Pressable>
          <Pressable style={[styles.promptChip, { backgroundColor: Colors.light.accent + "20" }]}>
            <ThemedText type="small" style={{ color: Colors.light.accent }}>
              What made me smile?
            </ThemedText>
          </Pressable>
          <Pressable style={[styles.promptChip, { backgroundColor: Colors.light.success + "20" }]}>
            <ThemedText type="small" style={{ color: Colors.light.success }}>
              What do I want to improve?
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <Button
        onPress={handleSave}
        style={styles.saveButton}
        disabled={!title.trim() || !content.trim()}
      >
        Save Entry
      </Button>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.md,
  },
  moodContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moodButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  titleInput: {
    height: 52,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
  },
  contentInput: {
    height: 200,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
    lineHeight: 24,
  },
  promptsSection: {
    marginBottom: Spacing.xl,
  },
  promptsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  promptChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
  },
});
