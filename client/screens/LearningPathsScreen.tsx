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

const learningTopics = [
    { id: "overthinking", label: "Handling Overthinking", icon: "loader", color: Colors.light.cardPeach },
    { id: "confidence", label: "Building Confidence", icon: "award", color: Colors.light.cardBlue },
    { id: "communication", label: "Improve Communication", icon: "message-circle", color: Colors.light.cardGreen },
    { id: "habits", label: "Breaking Bad Habits", icon: "x-circle", color: Colors.light.secondary + "30" },
    { id: "anger", label: "Managing Anger", icon: "thermometer", color: Colors.light.cardPeach },
    { id: "resilience", label: "Developing Resilience", icon: "shield", color: Colors.light.cardBlue },
];

interface Lesson {
    lessonNumber: number;
    title: string;
    description: string;
    duration: string;
    exercise: string;
}

export default function LearningPathsScreen() {
    const insets = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const { theme } = useTheme();
    const scrollViewRef = useRef<ScrollView>(null);

    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [customTopic, setCustomTopic] = useState("");
    const [timeAvailable, setTimeAvailable] = useState("15-20 min daily");
    const [isLoading, setIsLoading] = useState(false);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [expandedLesson, setExpandedLesson] = useState<number | null>(null);

    const handleTopicSelect = (topicId: string) => {
        if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setSelectedTopic(topicId);
        setCustomTopic("");
    };

    const generatePath = async () => {
        const topic = customTopic || learningTopics.find(t => t.id === selectedTopic)?.label;
        if (!topic) return;

        setIsLoading(true);
        try {
            const response = await fetch(new URL("/api/ai/learning-path", getApiUrl()).toString(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic,
                    currentLevel: "beginner",
                    timeAvailable,
                }),
            });
            const data = await response.json();
            setLessons(data.lessons || []);

            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error) {
            console.error("Learning path error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleLesson = (lessonNumber: number) => {
        if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setExpandedLesson(expandedLesson === lessonNumber ? null : lessonNumber);
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
                    <ThemedText style={styles.headerTitle}>Learning Paths</ThemedText>
                    <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                        Personalized lessons for personal growth
                    </ThemedText>
                </View>

                <ThemedText style={styles.sectionTitle}>Choose a Topic</ThemedText>
                <View style={styles.topicsGrid}>
                    {learningTopics.map((topic) => (
                        <Pressable
                            key={topic.id}
                            style={[
                                styles.topicCard,
                                {
                                    backgroundColor: topic.color,
                                    borderColor: selectedTopic === topic.id ? Colors.light.primary : "transparent",
                                    borderWidth: selectedTopic === topic.id ? 2 : 0,
                                },
                            ]}
                            onPress={() => handleTopicSelect(topic.id)}
                        >
                            <Feather name={topic.icon as any} size={20} color={Colors.light.primary} />
                            <ThemedText style={styles.topicLabel}>{topic.label}</ThemedText>
                        </Pressable>
                    ))}
                </View>

                <View style={styles.customSection}>
                    <ThemedText style={[styles.orText, { color: theme.textSecondary }]}>
                        Or enter a custom topic:
                    </ThemedText>
                    <TextInput
                        style={[styles.customInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                        placeholder="e.g., Overcoming procrastination"
                        placeholderTextColor={theme.textSecondary}
                        value={customTopic}
                        onChangeText={(text) => {
                            setCustomTopic(text);
                            if (text) setSelectedTopic(null);
                        }}
                    />
                </View>

                <View style={styles.timeSection}>
                    <ThemedText style={styles.sectionTitle}>Time Available</ThemedText>
                    <View style={styles.timeOptions}>
                        {["10 min daily", "15-20 min daily", "30 min daily"].map((time) => (
                            <Pressable
                                key={time}
                                style={[
                                    styles.timeOption,
                                    {
                                        backgroundColor: timeAvailable === time ? Colors.light.primary : theme.backgroundSecondary,
                                    },
                                ]}
                                onPress={() => setTimeAvailable(time)}
                            >
                                <ThemedText style={[
                                    styles.timeOptionText,
                                    { color: timeAvailable === time ? "#FFF" : theme.text }
                                ]}>
                                    {time}
                                </ThemedText>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <Pressable
                    style={[
                        styles.generateButton,
                        { backgroundColor: (selectedTopic || customTopic) ? Colors.light.primary : theme.backgroundSecondary },
                    ]}
                    onPress={generatePath}
                    disabled={isLoading || (!selectedTopic && !customTopic)}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <>
                            <Feather name="book" size={18} color={(selectedTopic || customTopic) ? "#FFF" : theme.textSecondary} />
                            <ThemedText style={[
                                styles.generateButtonText,
                                { color: (selectedTopic || customTopic) ? "#FFF" : theme.textSecondary }
                            ]}>
                                Create Learning Path
                            </ThemedText>
                        </>
                    )}
                </Pressable>

                {lessons.length > 0 && (
                    <View style={styles.lessonsSection}>
                        <ThemedText style={styles.sectionTitle}>Your Learning Journey</ThemedText>
                        <View style={styles.lessonsList}>
                            {lessons.map((lesson, index) => (
                                <Pressable
                                    key={index}
                                    style={[styles.lessonCard, { backgroundColor: theme.backgroundSecondary }]}
                                    onPress={() => toggleLesson(lesson.lessonNumber)}
                                >
                                    <View style={styles.lessonHeader}>
                                        <View style={[styles.lessonNumber, { backgroundColor: Colors.light.primary }]}>
                                            <ThemedText style={styles.lessonNumberText}>{lesson.lessonNumber}</ThemedText>
                                        </View>
                                        <View style={styles.lessonInfo}>
                                            <ThemedText style={styles.lessonTitle}>{lesson.title}</ThemedText>
                                            <View style={styles.lessonMeta}>
                                                <Feather name="clock" size={12} color={theme.textSecondary} />
                                                <ThemedText style={[styles.lessonDuration, { color: theme.textSecondary }]}>
                                                    {lesson.duration}
                                                </ThemedText>
                                            </View>
                                        </View>
                                        <Feather
                                            name={expandedLesson === lesson.lessonNumber ? "chevron-up" : "chevron-down"}
                                            size={20}
                                            color={theme.textSecondary}
                                        />
                                    </View>
                                    {expandedLesson === lesson.lessonNumber && (
                                        <View style={styles.lessonContent}>
                                            <ThemedText style={[styles.lessonDescription, { color: theme.textSecondary }]}>
                                                {lesson.description}
                                            </ThemedText>
                                            {lesson.exercise && (
                                                <View style={[styles.exerciseBox, { backgroundColor: Colors.light.cardGreen }]}>
                                                    <Feather name="edit-3" size={14} color={Colors.light.success} />
                                                    <ThemedText style={styles.exerciseText}>{lesson.exercise}</ThemedText>
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </Pressable>
                            ))}
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
    sectionTitle: {
        fontSize: 17,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: Colors.light.text,
        marginBottom: Spacing.md,
    },
    topicsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    topicCard: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
    },
    topicLabel: {
        fontSize: 13,
        fontFamily: "PlusJakartaSans_500Medium",
        color: Colors.light.text,
    },
    customSection: {
        marginBottom: Spacing.xl,
    },
    orText: {
        fontSize: 13,
        fontFamily: "PlusJakartaSans_400Regular",
        marginBottom: Spacing.sm,
    },
    customInput: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        fontSize: 15,
        fontFamily: "PlusJakartaSans_400Regular",
    },
    timeSection: {
        marginBottom: Spacing.xl,
    },
    timeOptions: {
        flexDirection: "row",
        gap: Spacing.sm,
    },
    timeOption: {
        flex: 1,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.lg,
        alignItems: "center",
    },
    timeOptionText: {
        fontSize: 12,
        fontFamily: "PlusJakartaSans_500Medium",
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
    lessonsSection: {
        marginTop: Spacing.md,
    },
    lessonsList: {
        gap: Spacing.md,
    },
    lessonCard: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
    },
    lessonHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
    },
    lessonNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    lessonNumberText: {
        fontSize: 14,
        fontFamily: "PlusJakartaSans_700Bold",
        color: "#FFF",
    },
    lessonInfo: {
        flex: 1,
    },
    lessonTitle: {
        fontSize: 15,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: Colors.light.text,
        marginBottom: Spacing.xs,
    },
    lessonMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
    },
    lessonDuration: {
        fontSize: 12,
        fontFamily: "PlusJakartaSans_400Regular",
    },
    lessonContent: {
        marginTop: Spacing.lg,
        paddingTop: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.1)",
    },
    lessonDescription: {
        fontSize: 14,
        fontFamily: "PlusJakartaSans_400Regular",
        lineHeight: 20,
        marginBottom: Spacing.md,
    },
    exerciseBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
    },
    exerciseText: {
        flex: 1,
        fontSize: 13,
        fontFamily: "PlusJakartaSans_500Medium",
        color: Colors.light.text,
        lineHeight: 18,
    },
});
