import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
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
import { getApiUrl } from "@/lib/query-client";

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
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<{
    insights: string;
    triggers: string | null;
    patterns: string | null;
    gratitudePrompt: string | null;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleGetInsights = async () => {
    if (!content.trim()) return;

    setIsGeneratingInsights(true);
    try {
      const response = await fetch(new URL("/api/ai/journal-insights", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, title }),
      });
      const data = await response.json();
      setAiInsights(data);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Failed to get journal insights:", error);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch(new URL("/api/journal-entries", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          mood: selectedMood,
          aiInsights: aiInsights?.insights,
          triggers: aiInsights?.triggers,
          patterns: aiInsights?.patterns,
          gratitudePrompt: aiInsights?.gratitudePrompt,
        }),
      });

      if (response.ok) {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        navigation.goBack();
      }
    } catch (error) {
      console.error("Failed to save journal entry:", error);
    } finally {
      setIsSaving(false);
    }
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
          <Pressable
            style={[styles.promptChip, { backgroundColor: Colors.light.primary + "20" }]}
            onPress={() => setContent(prev => prev + (prev ? "\n\n" : "") + "What am I grateful for today?")}
          >
            <ThemedText type="small" style={{ color: Colors.light.primary }}>
              What am I grateful for?
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.promptChip, { backgroundColor: Colors.light.secondary + "20" }]}
            onPress={() => setContent(prev => prev + (prev ? "\n\n" : "") + "The biggest challenge I faced today was...")}
          >
            <ThemedText type="small" style={{ color: Colors.light.secondary }}>
              What challenged me today?
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.promptChip, { backgroundColor: Colors.light.accent + "20" }]}
            onPress={() => setContent(prev => prev + (prev ? "\n\n" : "") + "One thing that made me smile was...")}
          >
            <ThemedText type="small" style={{ color: Colors.light.accent }}>
              What made me smile?
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={styles.aiSection}>
        <Pressable
          style={[styles.aiInsightButton, { backgroundColor: Colors.light.cardBlue }]}
          onPress={handleGetInsights}
          disabled={isGeneratingInsights || !content.trim()}
        >
          {isGeneratingInsights ? (
            <ActivityIndicator size="small" color={Colors.light.primary} />
          ) : (
            <>
              <Feather name="cpu" size={18} color={Colors.light.primary} />
              <ThemedText style={[styles.aiInsightButtonText, { color: Colors.light.primary }]}>
                Get AI Emotional Insights
              </ThemedText>
            </>
          )}
        </Pressable>

        {aiInsights && (
          <View style={[styles.aiInsightsContainer, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.insightHeader}>
              <Feather name="star" size={16} color={Colors.light.primary} />
              <ThemedText style={styles.insightTitle}>Emotional Analysis</ThemedText>
            </View>
            <ThemedText style={styles.insightText}>{aiInsights.insights}</ThemedText>

            {aiInsights.gratitudePrompt && (
              <View style={[styles.gratitudeBox, { backgroundColor: Colors.light.cardGreen }]}>
                <ThemedText style={styles.gratitudeLabel}>Gratitude Focus:</ThemedText>
                <ThemedText style={styles.gratitudeText}>{aiInsights.gratitudePrompt}</ThemedText>
              </View>
            )}
          </View>
        )}
      </View>

      <Button
        onPress={handleSave}
        style={styles.saveButton}
        disabled={!title.trim() || !content.trim() || isSaving}
      >
        {isSaving ? "Saving..." : "Save Entry"}
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
    marginTop: Spacing.xl,
  },
  aiSection: {
    marginBottom: Spacing.xl,
  },
  aiInsightButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.primary + "30",
  },
  aiInsightButtonText: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  aiInsightsContainer: {
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.primary + "20",
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  insightTitle: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_700Bold",
    color: Colors.light.primary,
  },
  insightText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_400Regular",
    lineHeight: 22,
    color: Colors.light.text,
  },
  gratitudeBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  gratitudeLabel: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_700Bold",
    color: Colors.light.success,
    marginBottom: 4,
  },
  gratitudeText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_500Medium",
    color: Colors.light.text,
  },
});
