import React, { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    Pressable,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

const { width } = Dimensions.get("window");
const chartWidth = width - Spacing.xl * 2;

interface MoodAnalyticsData {
    periodType: string;
    averageMoodScore: number;
    dominantMood: string;
    totalEntries: number;
    moodDistribution: Record<string, number>;
    insights: string;
}

const moodIcons: Record<string, string> = {
    happy: "smile",
    calm: "coffee",
    neutral: "meh",
    sad: "frown",
    anxious: "alert-circle",
};

const moodColors: Record<string, string> = {
    happy: Colors.light.success,
    calm: Colors.light.secondary,
    neutral: Colors.light.primary,
    sad: Colors.light.accent,
    anxious: Colors.light.emergency,
};

export default function MoodAnalyticsScreen() {
    const insets = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const { theme } = useTheme();

    const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
    const [isLoading, setIsLoading] = useState(true);
    const [analytics, setAnalytics] = useState<MoodAnalyticsData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                new URL(`/api/ai/mood-analytics?period=${period}`, getApiUrl()).toString()
            );
            const data = await response.json();
            if (data.analytics) {
                setAnalytics(data.analytics);
            } else {
                setError(data.message || "No data available");
                setAnalytics(null);
            }
        } catch (err) {
            console.error("Fetch analytics error:", err);
            setError("Failed to load analytics");
        } finally {
            setIsLoading(false);
        }
    };

    const getMoodScoreLabel = (score: number) => {
        if (score >= 4.5) return "Excellent";
        if (score >= 3.5) return "Good";
        if (score >= 2.5) return "Moderate";
        if (score >= 1.5) return "Low";
        return "Needs Attention";
    };

    const getMoodScoreColor = (score: number) => {
        if (score >= 4) return Colors.light.success;
        if (score >= 3) return Colors.light.primary;
        if (score >= 2) return Colors.light.accent;
        return Colors.light.emergency;
    };

    const renderMoodDistribution = () => {
        if (!analytics?.moodDistribution) return null;

        const total = Object.values(analytics.moodDistribution).reduce((a, b) => a + b, 0);

        return (
            <View style={styles.distributionContainer}>
                <ThemedText style={styles.sectionTitle}>Mood Distribution</ThemedText>
                <View style={styles.distributionBars}>
                    {Object.entries(analytics.moodDistribution).map(([mood, count]) => {
                        const percentage = total > 0 ? (count / total) * 100 : 0;
                        return (
                            <View key={mood} style={styles.distributionItem}>
                                <View style={styles.distributionLabelRow}>
                                    <Feather name={moodIcons[mood] as any || "circle"} size={16} color={moodColors[mood] || theme.text} />
                                    <ThemedText style={styles.distributionLabel}>{mood}</ThemedText>
                                    <ThemedText style={[styles.distributionCount, { color: theme.textSecondary }]}>
                                        {count} ({Math.round(percentage)}%)
                                    </ThemedText>
                                </View>
                                <View style={[styles.distributionBarBg, { backgroundColor: theme.backgroundSecondary }]}>
                                    <View
                                        style={[
                                            styles.distributionBarFill,
                                            {
                                                width: `${percentage}%`,
                                                backgroundColor: moodColors[mood] || Colors.light.primary
                                            }
                                        ]}
                                    />
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
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
                    <ThemedText style={styles.headerTitle}>Mood Analytics</ThemedText>
                    <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                        Track your emotional patterns over time
                    </ThemedText>
                </View>

                <View style={styles.periodToggle}>
                    <Pressable
                        style={[
                            styles.periodButton,
                            period === "weekly" && { backgroundColor: Colors.light.primary },
                        ]}
                        onPress={() => setPeriod("weekly")}
                    >
                        <ThemedText style={[
                            styles.periodButtonText,
                            { color: period === "weekly" ? "#FFF" : theme.text }
                        ]}>
                            Weekly
                        </ThemedText>
                    </Pressable>
                    <Pressable
                        style={[
                            styles.periodButton,
                            period === "monthly" && { backgroundColor: Colors.light.primary },
                        ]}
                        onPress={() => setPeriod("monthly")}
                    >
                        <ThemedText style={[
                            styles.periodButtonText,
                            { color: period === "monthly" ? "#FFF" : theme.text }
                        ]}>
                            Monthly
                        </ThemedText>
                    </Pressable>
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.light.primary} />
                        <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
                            Analyzing your mood data...
                        </ThemedText>
                    </View>
                ) : error ? (
                    <View style={[styles.emptyState, { backgroundColor: theme.backgroundSecondary }]}>
                        <Feather name="bar-chart-2" size={48} color={theme.textSecondary} />
                        <ThemedText style={styles.emptyStateTitle}>No Data Yet</ThemedText>
                        <ThemedText style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                            {error}. Start logging your moods to see analytics.
                        </ThemedText>
                    </View>
                ) : analytics && (
                    <>
                        <View style={[styles.scoreCard, { backgroundColor: Colors.light.cardPeach }]}>
                            <View style={styles.scoreHeader}>
                                <ThemedText style={styles.scoreLabel}>Average Mood Score</ThemedText>
                                <ThemedText style={[styles.periodBadge, { color: theme.textSecondary }]}>
                                    {period === "weekly" ? "Last 7 days" : "Last 30 days"}
                                </ThemedText>
                            </View>
                            <View style={styles.scoreContent}>
                                <ThemedText style={[styles.scoreValue, { color: getMoodScoreColor(analytics.averageMoodScore) }]}>
                                    {analytics.averageMoodScore.toFixed(1)}
                                </ThemedText>
                                <ThemedText style={styles.scoreMax}>/5</ThemedText>
                            </View>
                            <ThemedText style={[styles.scoreStatus, { color: getMoodScoreColor(analytics.averageMoodScore) }]}>
                                {getMoodScoreLabel(analytics.averageMoodScore)}
                            </ThemedText>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={[styles.statCard, { backgroundColor: Colors.light.cardBlue }]}>
                                <Feather name={moodIcons[analytics.dominantMood] as any || "activity"} size={24} color={Colors.light.primary} />
                                <ThemedText style={styles.statLabel}>Dominant Mood</ThemedText>
                                <ThemedText style={styles.statValue}>{analytics.dominantMood}</ThemedText>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: Colors.light.cardGreen }]}>
                                <Feather name="edit-3" size={24} color={Colors.light.success} />
                                <ThemedText style={styles.statLabel}>Entries Logged</ThemedText>
                                <ThemedText style={styles.statValue}>{analytics.totalEntries}</ThemedText>
                            </View>
                        </View>

                        {renderMoodDistribution()}

                        {analytics.insights && (
                            <View style={[styles.insightsCard, { backgroundColor: theme.backgroundSecondary }]}>
                                <View style={styles.insightsHeader}>
                                    <Feather name="cpu" size={20} color={Colors.light.primary} />
                                    <ThemedText style={styles.insightsTitle}>AI Insights</ThemedText>
                                </View>
                                <ThemedText style={styles.insightsText}>{analytics.insights}</ThemedText>
                            </View>
                        )}
                    </>
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
    periodToggle: {
        flexDirection: "row",
        backgroundColor: Colors.light.backgroundSecondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xs,
        marginBottom: Spacing.xl,
    },
    periodButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        alignItems: "center",
        borderRadius: BorderRadius.md,
    },
    periodButtonText: {
        fontSize: 14,
        fontFamily: "PlusJakartaSans_600SemiBold",
    },
    loadingContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: Spacing["5xl"],
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: 14,
        fontFamily: "PlusJakartaSans_400Regular",
    },
    emptyState: {
        alignItems: "center",
        padding: Spacing["3xl"],
        borderRadius: BorderRadius.xl,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: Colors.light.text,
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    emptyStateText: {
        fontSize: 14,
        fontFamily: "PlusJakartaSans_400Regular",
        textAlign: "center",
    },
    scoreCard: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.lg,
    },
    scoreHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: Spacing.md,
    },
    scoreLabel: {
        fontSize: 15,
        fontFamily: "PlusJakartaSans_500Medium",
        color: Colors.light.text,
    },
    periodBadge: {
        fontSize: 12,
        fontFamily: "PlusJakartaSans_400Regular",
    },
    scoreContent: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    scoreValue: {
        fontSize: 48,
        fontFamily: "PlusJakartaSans_700Bold",
    },
    scoreMax: {
        fontSize: 20,
        fontFamily: "PlusJakartaSans_400Regular",
        color: Colors.light.text,
        marginLeft: Spacing.xs,
    },
    scoreStatus: {
        fontSize: 14,
        fontFamily: "PlusJakartaSans_600SemiBold",
        marginTop: Spacing.xs,
    },
    statsRow: {
        flexDirection: "row",
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    statCard: {
        flex: 1,
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        alignItems: "center",
    },
    statLabel: {
        fontSize: 12,
        fontFamily: "PlusJakartaSans_400Regular",
        color: Colors.light.text,
        marginTop: Spacing.sm,
        opacity: 0.7,
    },
    statValue: {
        fontSize: 16,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: Colors.light.text,
        marginTop: Spacing.xs,
        textTransform: "capitalize",
    },
    distributionContainer: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 17,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: Colors.light.text,
        marginBottom: Spacing.md,
    },
    distributionBars: {
        gap: Spacing.md,
    },
    distributionItem: {
        marginBottom: Spacing.sm,
    },
    distributionLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: Spacing.xs,
        gap: Spacing.sm,
    },
    distributionLabel: {
        fontSize: 14,
        fontFamily: "PlusJakartaSans_500Medium",
        color: Colors.light.text,
        textTransform: "capitalize",
        flex: 1,
    },
    distributionCount: {
        fontSize: 12,
        fontFamily: "PlusJakartaSans_400Regular",
    },
    distributionBarBg: {
        height: 8,
        borderRadius: 4,
        overflow: "hidden",
    },
    distributionBarFill: {
        height: "100%",
        borderRadius: 4,
    },
    insightsCard: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
    },
    insightsHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    insightsTitle: {
        fontSize: 17,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: Colors.light.text,
    },
    insightsText: {
        fontSize: 14,
        fontFamily: "PlusJakartaSans_400Regular",
        color: Colors.light.text,
        lineHeight: 22,
    },
});
