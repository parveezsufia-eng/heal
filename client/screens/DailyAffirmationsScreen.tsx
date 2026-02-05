import React, { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
    ActivityIndicator,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

const moodOptions = [
    { id: "anxious", label: "Anxious", icon: "alert-circle", color: Colors.light.cardPeach },
    { id: "sad", label: "Sad", icon: "cloud-rain", color: Colors.light.cardBlue },
    { id: "stressed", label: "Stressed", icon: "zap", color: Colors.light.secondary + "30" },
    { id: "tired", label: "Tired", icon: "moon", color: Colors.light.cardGreen },
    { id: "motivated", label: "Motivated", icon: "target", color: Colors.light.cardPeach },
    { id: "hopeful", label: "Hopeful", icon: "sun", color: Colors.light.cardBlue },
];

export default function DailyAffirmationsScreen() {
    const insets = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const { theme } = useTheme();

    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [challenges, setChallenges] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [affirmations, setAffirmations] = useState<string | null>(null);
    const [savedAffirmations, setSavedAffirmations] = useState<string[]>([]);

    const handleMoodSelect = (moodId: string) => {
        if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setSelectedMood(moodId);
    };

    const generateAffirmations = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(new URL("/api/ai/daily-affirmation", getApiUrl()).toString(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentMood: selectedMood || "neutral",
                    challenges,
                }),
            });
            const data = await response.json();
            setAffirmations(data.affirmations);
        } catch (error) {
            console.error("Affirmation error:", error);
            setAffirmations("1. I am worthy of love and kindness.\n2. I am doing the best I can, and that is enough.\n3. I choose to focus on what I can control.");
        } finally {
            setIsLoading(false);
        }
    };

    const saveAffirmation = (affirmation: string) => {
        if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        setSavedAffirmations((prev) => [...prev, affirmation]);
    };

    const parseAffirmations = (text: string): string[] => {
        if (!text) return [];
        // Parse numbered list format (1. ... 2. ... 3. ...)
        const lines = text.split(/\d+\.\s+/).filter(Boolean);
        return lines.map(line => line.trim());
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{
                    paddingTop: headerHeight + Spacing.md,
                    paddingBottom: insets.bottom + Spacing["5xl"],
                    paddingHorizontal: Spacing.xl,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <ThemedText style={styles.headerTitle}>Daily Affirmations</ThemedText>
                    <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                        Personalized positive affirmations for you
                    </ThemedText>
                </View>

                <ThemedText style={styles.sectionTitle}>How are you feeling?</ThemedText>
                <View style={styles.moodsGrid}>
                    {moodOptions.map((mood) => (
                        <Pressable
                            key={mood.id}
                            style={[
                                styles.moodCard,
                                {
                                    backgroundColor: mood.color,
                                    borderColor: selectedMood === mood.id ? Colors.light.primary : "transparent",
                                    borderWidth: selectedMood === mood.id ? 2 : 0,
                                },
                            ]}
                            onPress={() => handleMoodSelect(mood.id)}
                        >
                            <Feather name={mood.icon as any} size={20} color={Colors.light.primary} />
                            <ThemedText style={styles.moodLabel}>{mood.label}</ThemedText>
                        </Pressable>
                    ))}
                </View>

                <View style={styles.challengesSection}>
                    <ThemedText style={styles.sectionTitle}>What are you facing today?</ThemedText>
                    <TextInput
                        style={[styles.challengesInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                        placeholder="e.g., work presentation, difficult conversation..."
                        placeholderTextColor={theme.textSecondary}
                        value={challenges}
                        onChangeText={setChallenges}
                        multiline
                        numberOfLines={2}
                    />
                </View>

                <Pressable
                    style={[styles.generateButton, { backgroundColor: Colors.light.primary }]}
                    onPress={generateAffirmations}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <>
                            <Feather name="heart" size={18} color="#FFF" />
                            <ThemedText style={styles.generateButtonText}>Generate My Affirmations</ThemedText>
                        </>
                    )}
                </Pressable>

                {affirmations && (
                    <View style={styles.affirmationsSection}>
                        <ThemedText style={styles.sectionTitle}>Your Affirmations for Today</ThemedText>
                        {parseAffirmations(affirmations).map((affirmation, index) => (
                            <View key={index} style={[styles.affirmationCard, { backgroundColor: Colors.light.cardGreen }]}>
                                <View style={styles.affirmationContent}>
                                    <View style={[styles.affirmationNumber, { backgroundColor: Colors.light.success }]}>
                                        <ThemedText style={styles.affirmationNumberText}>{index + 1}</ThemedText>
                                    </View>
                                    <ThemedText style={styles.affirmationText}>{affirmation}</ThemedText>
                                </View>
                                <Pressable
                                    style={styles.saveButton}
                                    onPress={() => saveAffirmation(affirmation)}
                                >
                                    <Feather
                                        name={savedAffirmations.includes(affirmation) ? "heart" : "heart"}
                                        size={20}
                                        color={savedAffirmations.includes(affirmation) ? Colors.light.emergency : theme.textSecondary}
                                    />
                                </Pressable>
                            </View>
                        ))}
                    </View>
                )}

                <View style={[styles.tipCard, { backgroundColor: theme.backgroundSecondary }]}>
                    <Feather name="info" size={18} color={Colors.light.primary} />
                    <View style={styles.tipContent}>
                        <ThemedText style={styles.tipTitle}>Practice Tip</ThemedText>
                        <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
                            Repeat your affirmations in front of a mirror every morning. Looking yourself in the eyes helps
                            reinforce positive beliefs about yourself.
                        </ThemedText>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1 },
    header: { marginBottom: Spacing.xl },
    headerTitle: {
        fontSize: 28,
        fontFamily: "PlayfairDisplay_600SemiBold",
        color: Colors.light.text,
        marginBottom: Spacing.xs,
    },
    headerSubtitle: {
        fontSize: 15,
        fontFamily: "PlusJakartaSans_400Regular",
    },
    sectionTitle: {
        fontSize: 17,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: Colors.light.text,
        marginBottom: Spacing.md,
    },
    moodsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    moodCard: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
    },
    moodLabel: {
        fontSize: 13,
        fontFamily: "PlusJakartaSans_500Medium",
        color: Colors.light.text,
    },
    challengesSection: {
        marginBottom: Spacing.xl,
    },
    challengesInput: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        fontSize: 15,
        fontFamily: "PlusJakartaSans_400Regular",
        minHeight: 80,
        textAlignVertical: "top",
    },
    generateButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    generateButtonText: {
        fontSize: 15,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: "#FFF",
    },
    affirmationsSection: {
        marginBottom: Spacing.xl,
    },
    affirmationCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.md,
    },
    affirmationContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: Spacing.md,
    },
    affirmationNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    affirmationNumberText: {
        fontSize: 13,
        fontFamily: "PlusJakartaSans_700Bold",
        color: "#FFF",
    },
    affirmationText: {
        flex: 1,
        fontSize: 15,
        fontFamily: "PlusJakartaSans_500Medium",
        color: Colors.light.text,
        lineHeight: 22,
    },
    saveButton: {
        padding: Spacing.sm,
    },
    tipCard: {
        flexDirection: "row",
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        gap: Spacing.md,
        alignItems: "flex-start",
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: 14,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: Colors.light.text,
        marginBottom: Spacing.xs,
    },
    tipText: {
        fontSize: 13,
        fontFamily: "PlusJakartaSans_400Regular",
        lineHeight: 18,
    },
});
