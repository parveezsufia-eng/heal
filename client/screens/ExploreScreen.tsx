import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ExploreStackParamList } from "@/navigation/ExploreStackNavigator";

type ExploreNavigationProp = NativeStackNavigationProp<ExploreStackParamList>;

const categories = [
  { id: "all", label: "All" },
  { id: "mentorship", label: "Mentorship" },
  { id: "guidance", label: "Guidance" },
  { id: "selfheal", label: "Self Heal" },
];

const sessionCards = [
  {
    id: "breathing",
    title: "Breathing",
    sessions: "7 sessions",
    duration: "8-10 Minutes",
    image: require("../assets/images/line_art_breathing_faces_illustration.png"),
    bgColor: Colors.light.cardBlue,
  },
  {
    id: "meditation",
    title: "Meditation",
    sessions: "5 sessions",
    duration: "10-15 Minutes",
    image: require("../assets/images/line_art_supportive_hands_illustration.png"),
    bgColor: Colors.light.cardPeach,
  },
  {
    id: "yoga",
    title: "Yoga",
    sessions: "8 sessions",
    duration: "15-20 Minutes",
    image: require("../assets/images/line_art_yoga_prayer_pose_illustration.png"),
    bgColor: Colors.light.cardGreen,
  },
  {
    id: "mindfulness",
    title: "Mindfulness",
    sessions: "6 sessions",
    duration: "5-10 Minutes",
    image: require("../assets/images/line_art_meditation_woman_illustration.png"),
    bgColor: Colors.light.cardBlue,
  },
];

const mentors = [
  { id: "1", name: "Dr. Sarah", specialty: "Anxiety & Stress", rating: 4.9 },
  { id: "2", name: "Dr. Michael", specialty: "Depression", rating: 4.8 },
  { id: "3", name: "Lisa T.", specialty: "Relationships", rating: 4.9 },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<ExploreNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleCategoryPress = (categoryId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCategory(categoryId);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.md,
        paddingBottom: tabBarHeight + Spacing["5xl"],
        paddingHorizontal: Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Explore</ThemedText>
        <Pressable style={styles.searchButton}>
          <Feather name="search" size={22} color={theme.text} />
        </Pressable>
      </View>

      <View style={[styles.searchBar, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather name="search" size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search sessions, mentors..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.categoryPill,
              selectedCategory === category.id && styles.categoryPillSelected,
            ]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <ThemedText
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextSelected,
              ]}
            >
              {category.label}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Popular Sessions</ThemedText>
        <View style={styles.cardsGrid}>
          {sessionCards.map((card) => (
            <Pressable
              key={card.id}
              style={[styles.sessionCard, { backgroundColor: card.bgColor }]}
            >
              <Image source={card.image} style={styles.cardImage} contentFit="contain" />
              <ThemedText style={styles.cardTitle}>{card.title}</ThemedText>
              <View style={styles.cardMeta}>
                <ThemedText style={[styles.cardMetaText, { color: theme.textSecondary }]}>
                  {card.sessions}
                </ThemedText>
                <ThemedText style={[styles.cardMetaText, { color: theme.textSecondary }]}>
                  {card.duration}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Top Mentors</ThemedText>
          <Pressable>
            <ThemedText style={[styles.seeAllText, { color: Colors.light.primary }]}>
              See all
            </ThemedText>
          </Pressable>
        </View>
        <View style={styles.mentorList}>
          {mentors.map((mentor) => (
            <Pressable
              key={mentor.id}
              style={[styles.mentorCard, { backgroundColor: theme.backgroundSecondary }]}
              onPress={() => navigation.navigate("MentorDetail", { mentorId: mentor.id })}
            >
              <View style={[styles.mentorAvatar, { backgroundColor: Colors.light.cardPeach }]}>
                <Feather name="user" size={20} color={Colors.light.primary} />
              </View>
              <View style={styles.mentorInfo}>
                <ThemedText style={styles.mentorName}>{mentor.name}</ThemedText>
                <ThemedText style={[styles.mentorSpecialty, { color: theme.textSecondary }]}>
                  {mentor.specialty}
                </ThemedText>
              </View>
              <View style={styles.ratingContainer}>
                <Feather name="star" size={14} color={Colors.light.primary} />
                <ThemedText style={styles.ratingText}>{mentor.rating}</ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "PlayfairDisplay_400Regular",
    color: Colors.light.text,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  categoriesContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  categoryPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.backgroundSecondary,
    marginRight: Spacing.sm,
  },
  categoryPillSelected: {
    backgroundColor: Colors.light.text,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_500Medium",
    color: Colors.light.text,
  },
  categoryTextSelected: {
    color: "#FFFFFF",
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_400Regular",
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_500Medium",
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  sessionCard: {
    width: "47%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    minHeight: 180,
  },
  cardImage: {
    width: "100%",
    height: 80,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: "PlayfairDisplay_400Regular",
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardMetaText: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  mentorList: {
    gap: Spacing.sm,
  },
  mentorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  mentorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_500Medium",
    color: Colors.light.text,
    marginBottom: 2,
  },
  mentorSpecialty: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.light.text,
  },
});
