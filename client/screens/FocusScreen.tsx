import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

const focusModes = [
  { id: "pomodoro", name: "Pomodoro", duration: 25, icon: "clock" },
  { id: "deep", name: "Deep Focus", duration: 50, icon: "target" },
  { id: "short", name: "Quick Session", duration: 10, icon: "zap" },
  { id: "custom", name: "Custom", duration: 30, icon: "settings" },
];

export default function FocusScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const [selectedMode, setSelectedMode] = useState(focusModes[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(selectedMode.duration * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState(3);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setSessionsCompleted((prev) => prev + 1);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleModeSelect = (mode: typeof focusModes[0]) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedMode(mode);
    setTimeLeft(mode.duration * 60);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsRunning(false);
    setTimeLeft(selectedMode.duration * 60);
  };

  const progress = 1 - timeLeft / (selectedMode.duration * 60);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.content, { paddingTop: headerHeight + Spacing.xl }]}>
        <ThemedText style={styles.headerTitle}>Focus Timer</ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Stay focused and productive
        </ThemedText>

        <View style={styles.timerSection}>
          <View style={[styles.timerCircle, { borderColor: Colors.light.primary + "30" }]}>
            <View
              style={[
                styles.timerProgress,
                {
                  borderColor: Colors.light.primary,
                  transform: [{ rotate: `${progress * 360}deg` }],
                },
              ]}
            />
            <View style={styles.timerInner}>
              <ThemedText style={styles.timerText}>{formatTime(timeLeft)}</ThemedText>
              <ThemedText style={[styles.timerLabel, { color: theme.textSecondary }]}>
                {selectedMode.name}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable
            style={[styles.controlButton, { backgroundColor: theme.backgroundSecondary }]}
            onPress={resetTimer}
          >
            <Feather name="refresh-cw" size={24} color={theme.text} />
          </Pressable>
          <Pressable
            style={[styles.playButton, { backgroundColor: Colors.light.primary }]}
            onPress={toggleTimer}
          >
            <Feather name={isRunning ? "pause" : "play"} size={32} color="#FFF" />
          </Pressable>
          <Pressable
            style={[styles.controlButton, { backgroundColor: theme.backgroundSecondary }]}
            onPress={() => setTimeLeft((prev) => Math.max(0, prev - 60))}
          >
            <Feather name="skip-forward" size={24} color={theme.text} />
          </Pressable>
        </View>

        <View style={styles.modesSection}>
          <ThemedText style={styles.sectionTitle}>Focus Modes</ThemedText>
          <View style={styles.modesGrid}>
            {focusModes.map((mode) => (
              <Pressable
                key={mode.id}
                style={[
                  styles.modeCard,
                  {
                    backgroundColor:
                      selectedMode.id === mode.id
                        ? Colors.light.primary
                        : theme.backgroundSecondary,
                  },
                ]}
                onPress={() => handleModeSelect(mode)}
              >
                <Feather
                  name={mode.icon as any}
                  size={20}
                  color={selectedMode.id === mode.id ? "#FFF" : Colors.light.primary}
                />
                <ThemedText
                  style={[
                    styles.modeName,
                    { color: selectedMode.id === mode.id ? "#FFF" : theme.text },
                  ]}
                >
                  {mode.name}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.modeDuration,
                    {
                      color:
                        selectedMode.id === mode.id ? "#FFF" : theme.textSecondary,
                    },
                  ]}
                >
                  {mode.duration} min
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.statsCard, { backgroundColor: Colors.light.cardBlue }]}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{sessionsCompleted}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Sessions Today
            </ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {sessionsCompleted * selectedMode.duration}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Minutes Focused
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "PlayfairDisplay_400Regular",
    color: Colors.light.text,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_400Regular",
    textAlign: "center",
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  timerSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  timerProgress: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 8,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
  },
  timerInner: {
    alignItems: "center",
  },
  timerText: {
    fontSize: 48,
    fontFamily: "PlusJakartaSans_700Bold",
    color: Colors.light.text,
  },
  timerLabel: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_400Regular",
    marginTop: Spacing.xs,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  modesSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_400Regular",
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  modesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  modeCard: {
    width: "48%",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  modeName: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_500Medium",
    marginTop: Spacing.xs,
  },
  modeDuration: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  statsCard: {
    flexDirection: "row",
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontFamily: "PlusJakartaSans_700Bold",
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_400Regular",
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: Spacing.lg,
  },
});
