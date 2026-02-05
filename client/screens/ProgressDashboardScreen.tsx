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
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

const { width: screenWidth } = Dimensions.get("window");
const CHART_HEIGHT = 200;
const CHART_WIDTH = screenWidth - Spacing.xl * 2;

export default function ProgressDashboardScreen() {
    const insets = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const { theme } = useTheme();

    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch(new URL("/api/ai/progress-insights", getApiUrl()).toString());
                const data = await response.json();
                setDashboardData(data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <ThemedText style={{ marginTop: Spacing.md }}>Analyzing your transformation...</ThemedText>
            </View>
        );
    }

    // Simple SVG Line Chart helper
    const renderLineChart = (data: number[]) => {
        const max = Math.max(...data, 1);
        const min = Math.min(...data, 0);
        const range = max - min;

        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * CHART_WIDTH;
            const y = CHART_HEIGHT - ((val - min) / range) * (CHART_HEIGHT - 40) - 20;
            return { x, y };
        });

        let pathD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            pathD += ` L ${points[i].x} ${points[i].y}`;
        }

        return (
            <View style={styles.chartWrapper}>
                <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                    <Defs>
                        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={Colors.light.primary} stopOpacity="0.2" />
                            <Stop offset="1" stopColor={Colors.light.primary} stopOpacity="0" />
                        </LinearGradient>
                    </Defs>
                    {/* Fill under the path */}
                    <Path
                        d={pathD + ` L ${points[points.length - 1].x} ${CHART_HEIGHT} L ${points[0].x} ${CHART_HEIGHT} Z`}
                        fill="url(#grad)"
                    />
                    {/* Main line */}
                    <Path
                        d={pathD}
                        fill="none"
                        stroke={Colors.light.primary}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* Data points */}
                    {points.map((p, i) => (
                        <Circle key={i} cx={p.x} cy={p.y} r="5" fill={Colors.light.primary} />
                    ))}
                </Svg>
            </View>
        );
    };

    const trendData = [3, 4, 3.5, 5, 4.5, 6, 5.5]; // Sample resilience data

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
                    <ThemedText style={styles.headerTitle}>Progress Dashboard</ThemedText>
                    <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                        Your transformation journey at a glance
                    </ThemedText>
                </View>

                <View style={[styles.insightCard, { backgroundColor: Colors.light.primary + "15" }]}>
                    <View style={styles.insightHeader}>
                        <Feather name="trending-up" size={20} color={Colors.light.primary} />
                        <ThemedText style={styles.insightTitle}>Monthly Insight</ThemedText>
                    </View>
                    <ThemedText style={styles.insightText}>
                        {dashboardData?.insights || "Analyzing your data..."}
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Emotional Resilience Trend</ThemedText>
                    <View style={[styles.chartContainer, { backgroundColor: theme.backgroundSecondary }]}>
                        {renderLineChart(trendData)}
                        <View style={styles.chartLabels}>
                            {["Week 1", "Week 2", "Week 3", "Week 4"].map((label, i) => (
                                <ThemedText key={i} style={[styles.chartLabel, { color: theme.textSecondary }]}>{label}</ThemedText>
                            ))}
                        </View>
                    </View>
                </View>

                <ThemedText style={styles.sectionTitle}>Transformation Metrics</ThemedText>
                <View style={styles.metricsGrid}>
                    {dashboardData?.metrics?.map((metric: any, index: number) => (
                        <View
                            key={index}
                            style={[
                                styles.metricCard,
                                { backgroundColor: index % 2 === 0 ? Colors.light.cardPeach : Colors.light.cardBlue }
                            ]}
                        >
                            <ThemedText style={styles.metricValue}>{metric.value}</ThemedText>
                            <ThemedText style={styles.metricLabel}>{metric.label}</ThemedText>
                        </View>
                    )) || <ActivityIndicator size="small" color={Colors.light.primary} />}
                </View>

                <View style={[styles.milestoneCard, { backgroundColor: Colors.light.cardGreen }]}>
                    <View style={styles.milestoneIcon}>
                        <Feather name="award" size={24} color={Colors.light.success} />
                    </View>
                    <View style={styles.milestoneContent}>
                        <ThemedText style={styles.milestoneTitle}>New Milestone!</ThemedText>
                        <ThemedText style={styles.milestoneDesc}>You've completed 10 consecutive meditation sessions. Keep it up!</ThemedText>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1 },
    loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
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
    insightCard: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.xl,
        gap: Spacing.sm,
    },
    insightHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
    },
    insightTitle: {
        fontSize: 16,
        fontFamily: "PlusJakartaSans_700Bold",
        color: Colors.light.primary,
    },
    insightText: {
        fontSize: 14,
        fontFamily: "PlusJakartaSans_500Medium",
        color: Colors.light.text,
        lineHeight: 22,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: "PlayfairDisplay_500Medium",
        color: Colors.light.text,
        marginBottom: Spacing.md,
    },
    chartContainer: {
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.xl,
        alignItems: "center",
    },
    chartWrapper: {
        paddingHorizontal: Spacing.xl,
    },
    chartLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: CHART_WIDTH,
        marginTop: Spacing.sm,
        paddingHorizontal: Spacing.sm,
    },
    chartLabel: {
        fontSize: 10,
        fontFamily: "PlusJakartaSans_600SemiBold",
    },
    metricsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    metricCard: {
        width: "47%",
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        alignItems: "center",
    },
    metricValue: {
        fontSize: 24,
        fontFamily: "PlayfairDisplay_700Bold",
        color: Colors.light.primary,
    },
    metricLabel: {
        fontSize: 12,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: Colors.light.text,
        marginTop: 4,
    },
    milestoneCard: {
        flexDirection: "row",
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        alignItems: "center",
        gap: Spacing.md,
    },
    milestoneIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#FFFFFF80",
        alignItems: "center",
        justifyContent: "center",
    },
    milestoneContent: { flex: 1 },
    milestoneTitle: {
        fontSize: 16,
        fontFamily: "PlusJakartaSans_700Bold",
        color: Colors.light.success,
    },
    milestoneDesc: {
        fontSize: 13,
        fontFamily: "PlusJakartaSans_400Regular",
        color: Colors.light.text,
        marginTop: 2,
    },
});
