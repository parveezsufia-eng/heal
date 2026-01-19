import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ExploreStackParamList } from "@/navigation/ExploreStackNavigator";

type MusicPlayerRouteProp = RouteProp<ExploreStackParamList, "MusicPlayer">;

export default function MusicPlayerScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const route = useRoute<MusicPlayerRouteProp>();
  const { title, artist, youtubeId, thumbnail, type } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayOnYouTube = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
    const youtubeAppUrl = `youtube://www.youtube.com/watch?v=${youtubeId}`;
    
    try {
      const canOpenApp = await Linking.canOpenURL(youtubeAppUrl);
      if (canOpenApp) {
        await Linking.openURL(youtubeAppUrl);
      } else {
        await Linking.openURL(youtubeUrl);
      }
    } catch (error) {
      await Linking.openURL(youtubeUrl);
    }
  };

  const togglePlay = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsPlaying(!isPlaying);
    handlePlayOnYouTube();
  };

  const getTypeIcon = () => {
    switch (type) {
      case "podcast": return "mic";
      case "music": return "music";
      case "audio": return "headphones";
      default: return "play-circle";
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "podcast": return Colors.light.cardBlue;
      case "music": return Colors.light.cardPeach;
      case "audio": return Colors.light.cardGreen;
      default: return Colors.light.cardBlue;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.content, { paddingTop: headerHeight + Spacing.xl }]}>
        <View style={[styles.artworkContainer, { backgroundColor: getTypeColor() }]}>
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={styles.artwork} contentFit="cover" />
          ) : (
            <Feather name={getTypeIcon()} size={80} color={Colors.light.primary} />
          )}
        </View>

        <View style={styles.infoSection}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={[styles.artist, { color: theme.textSecondary }]}>{artist}</ThemedText>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor() }]}>
            <Feather name={getTypeIcon()} size={14} color={Colors.light.primary} />
            <ThemedText style={styles.typeText}>{type}</ThemedText>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View style={[styles.progressFill, { backgroundColor: Colors.light.primary, width: "0%" }]} />
          </View>
          <View style={styles.timeRow}>
            <ThemedText style={[styles.timeText, { color: theme.textSecondary }]}>0:00</ThemedText>
            <ThemedText style={[styles.timeText, { color: theme.textSecondary }]}>--:--</ThemedText>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable style={styles.controlButton}>
            <Feather name="shuffle" size={24} color={theme.textSecondary} />
          </Pressable>
          <Pressable style={styles.controlButton}>
            <Feather name="skip-back" size={28} color={theme.text} />
          </Pressable>
          <Pressable style={[styles.playButton, { backgroundColor: Colors.light.primary }]} onPress={togglePlay}>
            <Feather name="play" size={36} color="#FFF" />
          </Pressable>
          <Pressable style={styles.controlButton}>
            <Feather name="skip-forward" size={28} color={theme.text} />
          </Pressable>
          <Pressable style={styles.controlButton}>
            <Feather name="repeat" size={24} color={theme.textSecondary} />
          </Pressable>
        </View>

        <Pressable 
          style={[styles.youtubeButton, { backgroundColor: "#FF0000" }]}
          onPress={handlePlayOnYouTube}
        >
          <Feather name="youtube" size={20} color="#FFF" />
          <ThemedText style={styles.youtubeButtonText}>Play on YouTube</ThemedText>
        </Pressable>

        <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
          Tap the button above to open this content on YouTube
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  artworkContainer: {
    width: 280,
    height: 280,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
    overflow: "hidden",
  },
  artwork: {
    width: "100%",
    height: "100%",
  },
  infoSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 24,
    fontFamily: "PlayfairDisplay_400Regular",
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  artist: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_400Regular",
    marginBottom: Spacing.md,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  typeText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_500Medium",
    color: Colors.light.primary,
    textTransform: "capitalize",
  },
  progressContainer: {
    width: "100%",
    marginBottom: Spacing.xl,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  controlButton: {
    padding: Spacing.sm,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  youtubeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  youtubeButtonText: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#FFF",
  },
  hint: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_400Regular",
    textAlign: "center",
    marginTop: Spacing.md,
  },
});
