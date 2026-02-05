import React, { useState, useRef } from "react";
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

const routineGoals = [
    { id: "anxiety", label: "Anxiety Management", icon: "heart", color: Colors.light.cardPeach },
    { id: "sleep", label: "Sleep Improvement", icon: "moon", color: Colors.light.cardBlue },
    { id: "productivity", label: "Productivity", icon: "zap", color: Colors.light.cardGreen },
    { id: "self-care", label: "Self-Care", icon: "sun", color: Colors.light.secondary + "30" },
];

interface RoutineActivity {
    time: string;
    activity: string;
    duration: string;
    benefit: string;
}

export default function RoutineCoachScreen() {
    const insets = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const { theme } = useTheme();
    const scrollViewRef = useRef<ScrollView>(null);

    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
    const [wakeTime, setWakeTime] = useState("7:00 AM");
    const [sleepTime, setSleepTime] = useState("10:00 PM");
    const [challenges, setChallenges] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [routine, setRoutine] = useState<RoutineActivity[]>([]);
    const [routineText, setRoutineText] = useState<string | null>(null);

    const handleGoalSelect = (goalId: string) => {
        if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setSelectedGoal(goalId);
    };

    const generateRoutine = async () => {
        if (!selectedGoal) return;

        setIsLoading(true);
        try {
            const response = await fetch(new URL("/api/ai/routine-generator", getApiUrl()).toString(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    goal: routineGoals.find(g => g.id === selectedGoal)?.label || selectedGoal,
                    wakeTime,
                    sleepTime,
                    currentChallenges: challenges,
                }),
            });
            const data = await response.json();
            setRoutine(data.schedule || []);
            setRoutineText(data.routine);

            // Scroll to show the routine
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error) {
            console.error("Routine generator error:", error);
            setRoutineText("Unable to generate a routine right now. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={{
                    paddingTop: headerHeight + Spacing.md,
                    paddingBottom: insets.bottom + Spacing["5xl"],
                    paddingHorizontal: Spacing.xl,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <ThemedText style={styles.headerTitle}>Routine Coach</ThemedText>
                    <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                        AI-powered daily routines for your wellbeing
                    </ThemedText>
                </View>

                <ThemedText style={styles.sectionTitle}>What's your goal?</ThemedText>
                <View style={styles.goalsGrid}>
                    {routineGoals.map((goal) => (
                        <Pressable
                            key={goal.id}
                            style={[
                                styles.goalCard,
                                {
                                    backgroundColor: goal.color,
                                    borderColor: selectedGoal === goal.id ? Colors.light.primary : "transparent",
                                    borderWidth: selectedGoal === goal.id ? 2 : 0,
                                },
                            ]}
                            onPress={() => handleGoalSelect(goal.id)}
                        >
                            <Feather name={goal.icon as any} size={24} color={Colors.light.primary} />
                            <ThemedText style={styles.goalLabel}>{goal.label}</ThemedText>
                        </Pressable>
                    ))}
                </View>

                <View style={styles.timeSection}>
                    <ThemedText style={styles.sectionTitle}>Your Schedule</ThemedText>
                    <View style={styles.timeRow}>
                        <View style={styles.timeInput}>
                            <ThemedText style={[styles.timeLabel, { color: theme.textSecondary }]}>Wake up</ThemedText>
                            <TextInput
                                style={[styles.timeValue, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                                value={wakeTime}
                                onChangeText={setWakeTime}
                                placeholder="7:00 AM"
                                placeholderTextColor={theme.textSecondary}
                            />
                        </View>
                        <View style={styles.timeInput}>
                            <ThemedText style={[styles.timeLabel, { color: theme.textSecondary }]}>Sleep</ThemedText>
                            <TextInput
                                style={[styles.timeValue, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                                value={sleepTime}
                                onChangeText={setSleepTime}
                                placeholder="10:00 PM"
                                placeholderTextColor={theme.textSecondary}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.challengesSection}>
                    <ThemedText style={styles.sectionTitle}>Current Challenges (Optional)</ThemedText>
                    <TextInput
                        style={[styles.challengesInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                        placeholder="e.g., I struggle with morning motivation, I often skip meals..."
                        placeholderTextColor={theme.textSecondary}
                        value={challenges}
                        onChangeText={setChallenges}
                        multiline
                        numberOfLines={2}
                    />
                </View>

                <Pressable
                    style={[
                        styles.generateButton,
                        { backgroundColor: selectedGoal ? Colors.light.primary : theme.backgroundSecondary },
                    ]}
                    onPress={generateRoutine}
                    disabled={isLoading || !selectedGoal}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <>
                            <Feather name="calendar" size={18} color={selectedGoal ? "#FFF" : theme.textSecondary} />
                            <ThemedText style={[
                                styles.generateButtonText,
                                { color: selectedGoal ? "#FFF" : theme.textSecondary }
                            ]}>
                                Generate My Routine
                            </ThemedText>
                        </>
                    )}
                </Pressable>

                {routine.length > 0 && (
                    <View style={styles.routineSection}>
                        <ThemedText style={styles.sectionTitle}>Your Personalized Routine</ThemedText>
                        <View style={styles.routineList}>
                            {routine.map((activity, index) => (
                                <View
                                    key={index}
                                    style={[styles.routineItem, { backgroundColor: theme.backgroundSecondary }]}
                                >
                                    <View style={[styles.timeIndicator, { backgroundColor: Colors.light.primary }]}>
                                        <ThemedText style={styles.timeIndicatorText}>{activity.time}</ThemedText>
                                    </View>
                                    <View style={styles.activityContent}>
                                        <ThemedText style={styles.activityName}>{activity.activity}</ThemedText>
                                        <View style={styles.activityMeta}>
                                            <Feather name="clock" size={12} color={theme.textSecondary} />
                                            <ThemedText style={[styles.activityDuration, { color: theme.textSecondary }]}>
                                                {activity.duration}
                                            </ThemedText>
                                        </View>
                                        {activity.benefit && (
                                            <ThemedText style={[styles.activityBenefit, { color: Colors.light.primary }]}>
                                                ✨ {activity.benefit}
                                            </ThemedText>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {routineText && routine.length === 0 && (
                    <View style={[styles.routineTextCard, { backgroundColor: Colors.light.cardGreen }]}>
                        <ThemedText style={styles.routineTextContent}>{routineText}</ThemedText>
                    </View>
                )}
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
    goalsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    goalCard: {
        width: "48%",
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        alignItems: "center",
    },
    goalLabel: {
        fontSize: 14,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: Colors.light.text,
        marginTop: Spacing.sm,
        textAlign: "center",
    },
    timeSection: {
        marginBottom: Spacing.xl,
    },
    timeRow: {
        flexDirection: "row",
        gap: Spacing.md,
    },
    timeInput: {
        flex: 1,
    },
    timeLabel: {
        fontSize: 13,
        fontFamily: "PlusJakartaSans_400Regular",
        marginBottom: Spacing.xs,
    },
    timeValue: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        fontSize: 15,
        fontFamily: "PlusJakartaSans_500Medium",
        textAlign: "center",
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
    },
    routineSection: {
        marginTop: Spacing.md,
    },
    routineList: {
        gap: Spacing.md,
    },
    routineItem: {
        flexDirection: "row",
        borderRadius: BorderRadius.xl,
        overflow: "hidden",
    },
    timeIndicator: {
        width: 80,
        padding: Spacing.md,
        alignItems: "center",
        justifyContent: "center",
    },
    timeIndicatorText: {
        fontSize: 12,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: "#FFF",
        textAlign: "center",
    },
    activityContent: {
        flex: 1,
        padding: Spacing.lg,
    },
    activityName: {
        fontSize: 15,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: Colors.light.text,
        marginBottom: Spacing.xs,
    },
    activityMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
        marginBottom: Spacing.xs,
    },
    activityDuration: {
        fontSize: 12,
        fontFamily: "PlusJakartaSans_400Regular",
    },
    activityBenefit: {
        fontSize: 12,
        fontFamily: "PlusJakartaSans_500Medium",
        marginTop: Spacing.xs,
    },
    routineTextCard: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
    },
    routineTextContent: {
        fontSize: 14,
        fontFamily: "PlusJakartaSans_400Regular",
        color: Colors.light.text,
        lineHeight: 22,
    },
});
