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

const cbtTools = [
    { id: "reframe", title: "Thought Reframing", icon: "refresh-cw", description: "Transform negative thoughts into balanced perspectives" },
    { id: "grounding", title: "Grounding Techniques", icon: "anchor", description: "Calm your mind with sensory exercises" },
    { id: "patterns", title: "Pattern Detection", icon: "trending-up", description: "Identify cognitive distortions" },
];

const cognitiveDistortions = [
    { id: "catastrophizing", label: "Catastrophizing", description: "Expecting the worst outcome" },
    { id: "all-or-nothing", label: "All-or-Nothing", description: "Seeing things in black and white" },
    { id: "mind-reading", label: "Mind Reading", description: "Assuming you know what others think" },
    { id: "fortune-telling", label: "Fortune Telling", description: "Predicting negative outcomes" },
    { id: "personalization", label: "Personalization", description: "Blaming yourself for everything" },
    { id: "filtering", label: "Mental Filtering", description: "Focusing only on negatives" },
];

export default function CBTToolsScreen() {
    const insets = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const { theme } = useTheme();
    const scrollViewRef = useRef<ScrollView>(null);

    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [thought, setThought] = useState("");
    const [context, setContext] = useState("");
    const [currentMood, setCurrentMood] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleToolSelect = (toolId: string) => {
        if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setActiveTool(toolId);
        setResult(null);
    };

    const handleReframe = async () => {
        if (!thought.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(new URL("/api/ai/cbt-reframe", getApiUrl()).toString(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ thought, context }),
            });
            const data = await response.json();
            setResult(data.reframe);
        } catch (error) {
            console.error("Reframe error:", error);
            setResult("Unable to process your thought right now. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGrounding = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(new URL("/api/ai/grounding-technique", getApiUrl()).toString(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentMood, situation: context }),
            });
            const data = await response.json();
            setResult(data.technique);
        } catch (error) {
            console.error("Grounding error:", error);
            setResult("Unable to generate a grounding technique right now. Try the 5-4-3-2-1 technique: Notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderReframeTool = () => (
        <View style={styles.toolContent}>
            <ThemedText style={styles.toolInstructions}>
                Write the negative thought you'd like to reframe:
            </ThemedText>
            <TextInput
                style={[styles.thoughtInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                placeholder="e.g., I'm worthless, I always fail..."
                placeholderTextColor={theme.textSecondary}
                value={thought}
                onChangeText={setThought}
                multiline
                numberOfLines={3}
                testID="input-thought"
            />
            <TextInput
                style={[styles.contextInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                placeholder="Context (optional): What triggered this thought?"
                placeholderTextColor={theme.textSecondary}
                value={context}
                onChangeText={setContext}
                testID="input-context"
            />
            <Pressable
                style={[styles.actionButton, { backgroundColor: Colors.light.primary }]}
                onPress={handleReframe}
                disabled={isLoading || !thought.trim()}
                testID="button-reframe"
            >
                {isLoading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                ) : (
                    <>
                        <Feather name="refresh-cw" size={18} color="#FFF" />
                        <ThemedText style={styles.actionButtonText}>Reframe My Thought</ThemedText>
                    </>
                )}
            </Pressable>
        </View>
    );

    const renderGroundingTool = () => (
        <View style={styles.toolContent}>
            <ThemedText style={styles.toolInstructions}>
                Let's find a calming technique for you:
            </ThemedText>
            <TextInput
                style={[styles.contextInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                placeholder="How are you feeling right now? (e.g., anxious, overwhelmed)"
                placeholderTextColor={theme.textSecondary}
                value={currentMood}
                onChangeText={setCurrentMood}
                testID="input-mood"
            />
            <TextInput
                style={[styles.contextInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                placeholder="What's happening? (optional)"
                placeholderTextColor={theme.textSecondary}
                value={context}
                onChangeText={setContext}
                testID="input-situation"
            />
            <Pressable
                style={[styles.actionButton, { backgroundColor: Colors.light.secondary }]}
                onPress={handleGrounding}
                disabled={isLoading}
                testID="button-grounding"
            >
                {isLoading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                ) : (
                    <>
                        <Feather name="anchor" size={18} color="#FFF" />
                        <ThemedText style={styles.actionButtonText}>Get Grounding Exercise</ThemedText>
                    </>
                )}
            </Pressable>
        </View>
    );

    const renderPatternsTool = () => (
        <View style={styles.toolContent}>
            <ThemedText style={styles.toolInstructions}>
                Common cognitive distortions to watch for:
            </ThemedText>
            <View style={styles.patternsList}>
                {cognitiveDistortions.map((distortion) => (
                    <View key={distortion.id} style={[styles.patternCard, { backgroundColor: theme.backgroundSecondary }]}>
                        <ThemedText style={styles.patternTitle}>{distortion.label}</ThemedText>
                        <ThemedText style={[styles.patternDescription, { color: theme.textSecondary }]}>
                            {distortion.description}
                        </ThemedText>
                    </View>
                ))}
            </View>
        </View>
    );

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
                    <ThemedText style={styles.headerTitle}>CBT Tools</ThemedText>
                    <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                        Science-backed techniques for mental wellness
                    </ThemedText>
                </View>

                <View style={styles.toolsGrid}>
                    {cbtTools.map((tool) => (
                        <Pressable
                            key={tool.id}
                            style={[
                                styles.toolCard,
                                {
                                    backgroundColor: activeTool === tool.id ? Colors.light.cardBlue : theme.backgroundSecondary,
                                    borderColor: activeTool === tool.id ? Colors.light.primary : "transparent",
                                    borderWidth: activeTool === tool.id ? 2 : 0,
                                },
                            ]}
                            onPress={() => handleToolSelect(tool.id)}
                        >
                            <View style={[styles.toolIconContainer, { backgroundColor: Colors.light.primary + "20" }]}>
                                <Feather name={tool.icon as any} size={24} color={Colors.light.primary} />
                            </View>
                            <ThemedText style={styles.toolTitle}>{tool.title}</ThemedText>
                            <ThemedText style={[styles.toolDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                                {tool.description}
                            </ThemedText>
                        </Pressable>
                    ))}
                </View>

                {activeTool === "reframe" && renderReframeTool()}
                {activeTool === "grounding" && renderGroundingTool()}
                {activeTool === "patterns" && renderPatternsTool()}

                {result && (
                    <View style={[styles.resultCard, { backgroundColor: Colors.light.cardGreen }]}>
                        <View style={styles.resultHeader}>
                            <Feather name="check-circle" size={20} color={Colors.light.success} />
                            <ThemedText style={styles.resultTitle}>AI Response</ThemedText>
                        </View>
                        <ThemedText style={styles.resultText}>{result}</ThemedText>
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
    toolsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    toolCard: {
        width: "100%",
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
    },
    toolIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.md,
    },
    toolTitle: {
        fontSize: 17,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: Colors.light.text,
        marginBottom: Spacing.xs,
    },
    toolDescription: {
        fontSize: 13,
        fontFamily: "PlusJakartaSans_400Regular",
        lineHeight: 18,
    },
    toolContent: {
        marginBottom: Spacing.xl,
    },
    toolInstructions: {
        fontSize: 15,
        fontFamily: "PlusJakartaSans_500Medium",
        color: Colors.light.text,
        marginBottom: Spacing.md,
    },
    thoughtInput: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        fontSize: 15,
        fontFamily: "PlusJakartaSans_400Regular",
        minHeight: 100,
        textAlignVertical: "top",
        marginBottom: Spacing.md,
    },
    contextInput: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        fontSize: 15,
        fontFamily: "PlusJakartaSans_400Regular",
        marginBottom: Spacing.md,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
    },
    actionButtonText: {
        fontSize: 15,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: "#FFF",
    },
    patternsList: {
        gap: Spacing.md,
    },
    patternCard: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
    },
    patternTitle: {
        fontSize: 15,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: Colors.light.text,
        marginBottom: Spacing.xs,
    },
    patternDescription: {
        fontSize: 13,
        fontFamily: "PlusJakartaSans_400Regular",
    },
    resultCard: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        marginTop: Spacing.md,
    },
    resultHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    resultTitle: {
        fontSize: 17,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: Colors.light.text,
    },
    resultText: {
        fontSize: 14,
        fontFamily: "PlusJakartaSans_400Regular",
        color: Colors.light.text,
        lineHeight: 22,
    },
});
