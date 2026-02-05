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

const advisorTypes = [
    { id: "career", title: "Career Guidance", icon: "briefcase", color: Colors.light.cardBlue, description: "Resume, interviews, job search" },
    { id: "relationship", title: "Relationship Advice", icon: "heart", color: Colors.light.cardPeach, description: "Communication, conflict resolution" },
    { id: "financial", title: "Financial Wellness", icon: "dollar-sign", color: Colors.light.cardGreen, description: "Budgeting, financial stress" },
    { id: "academic", title: "Academic Support", icon: "book-open", color: Colors.light.secondary + "30", description: "Study stress, time management" },
];

export default function ConsultationAdvisorScreen() {
    const insets = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const { theme } = useTheme();
    const scrollViewRef = useRef<ScrollView>(null);

    const [activeAdvisor, setActiveAdvisor] = useState<string | null>(null);
    const [question, setQuestion] = useState("");
    const [additionalInfo, setAdditionalInfo] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [advice, setAdvice] = useState<string | null>(null);

    const handleAdvisorSelect = (advisorId: string) => {
        if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setActiveAdvisor(advisorId);
        setAdvice(null);
        setQuestion("");
        setAdditionalInfo("");
    };

    const getAdvice = async () => {
        if (!question.trim() || !activeAdvisor) return;

        setIsLoading(true);
        try {
            const endpoints: Record<string, string> = {
                career: "/api/ai/career-advisor",
                relationship: "/api/ai/relationship-advisor",
                financial: "/api/ai/financial-advisor",
                academic: "/api/ai/academic-advisor",
            };

            const payloads: Record<string, object> = {
                career: { topic: question, details: additionalInfo, currentSituation: additionalInfo },
                relationship: { situation: question, goal: additionalInfo, relationshipType: "general" },
                financial: { concern: question, mainExpenses: additionalInfo },
                academic: { concern: question, deadline: additionalInfo },
            };

            const response = await fetch(new URL(endpoints[activeAdvisor], getApiUrl()).toString(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payloads[activeAdvisor]),
            });
            const data = await response.json();
            setAdvice(data.advice);

            // Scroll to show the advice
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error) {
            console.error("Advisor error:", error);
            setAdvice("I'm having trouble providing advice right now. Please try again in a moment.");
        } finally {
            setIsLoading(false);
        }
    };

    const getPlaceholder = () => {
        switch (activeAdvisor) {
            case "career": return "e.g., How do I prepare for a job interview?";
            case "relationship": return "e.g., How do I communicate better with my partner?";
            case "financial": return "e.g., I'm stressed about my credit card debt";
            case "academic": return "e.g., I can't focus on studying for my exams";
            default: return "What would you like help with?";
        }
    };

    const getSecondaryPlaceholder = () => {
        switch (activeAdvisor) {
            case "career": return "Current job situation, experience level, goals...";
            case "relationship": return "What outcome are you hoping for?";
            case "financial": return "Main expenses or financial goals...";
            case "academic": return "Upcoming deadlines, subjects...";
            default: return "Additional context (optional)";
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
                    <ThemedText style={styles.headerTitle}>Consultation Advisor</ThemedText>
                    <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                        Get AI-powered guidance for life's challenges
                    </ThemedText>
                </View>

                <View style={styles.advisorsGrid}>
                    {advisorTypes.map((advisor) => (
                        <Pressable
                            key={advisor.id}
                            style={[
                                styles.advisorCard,
                                {
                                    backgroundColor: advisor.color,
                                    borderColor: activeAdvisor === advisor.id ? Colors.light.primary : "transparent",
                                    borderWidth: activeAdvisor === advisor.id ? 2 : 0,
                                },
                            ]}
                            onPress={() => handleAdvisorSelect(advisor.id)}
                        >
                            <Feather name={advisor.icon as any} size={28} color={Colors.light.primary} />
                            <ThemedText style={styles.advisorTitle}>{advisor.title}</ThemedText>
                            <ThemedText style={[styles.advisorDescription, { color: theme.textSecondary }]}>
                                {advisor.description}
                            </ThemedText>
                        </Pressable>
                    ))}
                </View>

                {activeAdvisor && (
                    <View style={styles.inputSection}>
                        <ThemedText style={styles.inputLabel}>What would you like guidance on?</ThemedText>
                        <TextInput
                            style={[styles.questionInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                            placeholder={getPlaceholder()}
                            placeholderTextColor={theme.textSecondary}
                            value={question}
                            onChangeText={setQuestion}
                            multiline
                            numberOfLines={3}
                            testID="input-question"
                        />
                        <TextInput
                            style={[styles.additionalInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                            placeholder={getSecondaryPlaceholder()}
                            placeholderTextColor={theme.textSecondary}
                            value={additionalInfo}
                            onChangeText={setAdditionalInfo}
                            testID="input-additional"
                        />
                        <Pressable
                            style={[
                                styles.submitButton,
                                {
                                    backgroundColor: question.trim() ? Colors.light.primary : theme.backgroundSecondary,
                                }
                            ]}
                            onPress={getAdvice}
                            disabled={isLoading || !question.trim()}
                            testID="button-get-advice"
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <>
                                    <Feather name="message-circle" size={18} color={question.trim() ? "#FFF" : theme.textSecondary} />
                                    <ThemedText style={[
                                        styles.submitButtonText,
                                        { color: question.trim() ? "#FFF" : theme.textSecondary }
                                    ]}>
                                        Get Advice
                                    </ThemedText>
                                </>
                            )}
                        </Pressable>
                    </View>
                )}

                {advice && (
                    <View style={[styles.adviceCard, { backgroundColor: Colors.light.cardGreen }]}>
                        <View style={styles.adviceHeader}>
                            <Feather name="check-circle" size={20} color={Colors.light.success} />
                            <ThemedText style={styles.adviceTitle}>AI Advisor Response</ThemedText>
                        </View>
                        <ThemedText style={styles.adviceText}>{advice}</ThemedText>
                        <View style={styles.disclaimerContainer}>
                            <Feather name="info" size={14} color={theme.textSecondary} />
                            <ThemedText style={[styles.disclaimerText, { color: theme.textSecondary }]}>
                                This is AI-generated advice. For professional matters, please consult a qualified expert.
                            </ThemedText>
                        </View>
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
    advisorsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    advisorCard: {
        width: "48%",
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        alignItems: "center",
    },
    advisorTitle: {
        fontSize: 15,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: Colors.light.text,
        marginTop: Spacing.md,
        textAlign: "center",
    },
    advisorDescription: {
        fontSize: 12,
        fontFamily: "PlusJakartaSans_400Regular",
        textAlign: "center",
        marginTop: Spacing.xs,
    },
    inputSection: {
        marginBottom: Spacing.xl,
    },
    inputLabel: {
        fontSize: 15,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: Colors.light.text,
        marginBottom: Spacing.md,
    },
    questionInput: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        fontSize: 15,
        fontFamily: "PlusJakartaSans_400Regular",
        minHeight: 100,
        textAlignVertical: "top",
        marginBottom: Spacing.md,
    },
    additionalInput: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        fontSize: 15,
        fontFamily: "PlusJakartaSans_400Regular",
        marginBottom: Spacing.lg,
    },
    submitButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
    },
    submitButtonText: {
        fontSize: 15,
        fontFamily: "PlusJakartaSans_600SemiBold",
    },
    adviceCard: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
    },
    adviceHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    adviceTitle: {
        fontSize: 17,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: Colors.light.text,
    },
    adviceText: {
        fontSize: 14,
        fontFamily: "PlusJakartaSans_400Regular",
        color: Colors.light.text,
        lineHeight: 22,
        marginBottom: Spacing.lg,
    },
    disclaimerContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: Spacing.sm,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.1)",
    },
    disclaimerText: {
        flex: 1,
        fontSize: 12,
        fontFamily: "PlusJakartaSans_400Regular",
        lineHeight: 16,
    },
});
