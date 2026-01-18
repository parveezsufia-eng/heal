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
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { ExploreStackParamList } from "@/navigation/ExploreStackNavigator";

type ExploreNavigationProp = NativeStackNavigationProp<ExploreStackParamList>;

const categories = [
  { id: "mentorship", icon: "users", label: "Mentorship", color: Colors.light.primary },
  { id: "guidance", icon: "compass", label: "Guidance", color: Colors.light.secondary },
  { id: "selfheal", icon: "heart", label: "Self Heal", color: Colors.light.accent },
];

const mentors = [
  {
    id: "1",
    name: "Dr. Sarah Mitchell",
    specialty: "Career Counseling",
    experience: "12 years",
    rating: 4.9,
    sessions: 450,
  },
  {
    id: "2",
    name: "Prof. James Chen",
    specialty: "Academic Stress",
    experience: "8 years",
    rating: 4.8,
    sessions: 320,
  },
  {
    id: "3",
    name: "Lisa Thompson",
    specialty: "Life Coaching",
    experience: "15 years",
    rating: 4.9,
    sessions: 680,
  },
];

const selfHealTools = [
  { id: "breathing", icon: "wind", label: "Breathing", color: Colors.light.secondary },
  { id: "mindtest", icon: "activity", label: "Mind Test", color: Colors.light.primary },
  { id: "diet", icon: "coffee", label: "Diet Plans", color: Colors.light.accent },
  { id: "audio", icon: "headphones", label: "Audio", color: Colors.light.success },
];

const mindBoosters = [
  { id: "facts", icon: "zap", label: "Fun Facts" },
  { id: "riddles", icon: "help-circle", label: "Riddles" },
  { id: "stories", icon: "book-open", label: "Stories" },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<ExploreNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("mentorship");

  const handleCategoryPress = (categoryId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCategory(categoryId);
  };

  const handleMentorPress = (mentorId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("MentorDetail", { mentorId });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.md,
        paddingBottom: tabBarHeight + Spacing["5xl"],
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.searchContainer, { backgroundColor: theme.backgroundDefault }, Shadows.small]}>
        <Feather name="search" size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search mentors, resources..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.categoryButton,
              {
                backgroundColor:
                  selectedCategory === category.id
                    ? category.color
                    : theme.backgroundDefault,
              },
              selectedCategory === category.id && Shadows.small,
            ]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <Feather
              name={category.icon as any}
              size={18}
              color={selectedCategory === category.id ? "#FFF" : category.color}
            />
            <ThemedText
              type="small"
              style={[
                styles.categoryLabel,
                { color: selectedCategory === category.id ? "#FFF" : theme.text },
              ]}
            >
              {category.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {selectedCategory === "mentorship" ? (
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Expert Mentors
          </ThemedText>
          <View style={styles.mentorList}>
            {mentors.map((mentor) => (
              <Pressable key={mentor.id} onPress={() => handleMentorPress(mentor.id)}>
                <View style={[styles.mentorCard, { backgroundColor: theme.backgroundDefault }, Shadows.small]}>
                  <View style={styles.mentorHeader}>
                    <View style={[styles.mentorAvatar, { backgroundColor: Colors.light.warm + "40" }]}>
                      <Feather name="user" size={22} color={Colors.light.primary} />
                    </View>
                    <View style={styles.mentorInfo}>
                      <ThemedText type="h4">{mentor.name}</ThemedText>
                      <ThemedText type="small" style={{ color: theme.textSecondary }}>
                        {mentor.specialty}
                      </ThemedText>
                    </View>
                    <View style={[styles.ratingBadge, { backgroundColor: Colors.light.accent + "20" }]}>
                      <Feather name="star" size={12} color={Colors.light.accent} />
                      <ThemedText type="small" style={{ fontWeight: "600" }}>{mentor.rating}</ThemedText>
                    </View>
                  </View>
                  <View style={styles.mentorStats}>
                    <View style={styles.mentorStat}>
                      <Feather name="briefcase" size={14} color={theme.textSecondary} />
                      <ThemedText type="small" style={{ color: theme.textSecondary }}>
                        {mentor.experience}
                      </ThemedText>
                    </View>
                    <View style={styles.mentorStat}>
                      <Feather name="video" size={14} color={theme.textSecondary} />
                      <ThemedText type="small" style={{ color: theme.textSecondary }}>
                        {mentor.sessions} sessions
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {selectedCategory === "guidance" ? (
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Guidance Resources
          </ThemedText>
          <View style={styles.guidanceGrid}>
            <Pressable style={[styles.guidanceCard, { backgroundColor: Colors.light.primary + "12" }]}>
              <View style={[styles.guidanceIcon, { backgroundColor: Colors.light.primary }]}>
                <Feather name="briefcase" size={20} color="#FFF" />
              </View>
              <ThemedText type="h4">Career</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Resume, interviews
              </ThemedText>
            </Pressable>
            <Pressable style={[styles.guidanceCard, { backgroundColor: Colors.light.secondary + "12" }]}>
              <View style={[styles.guidanceIcon, { backgroundColor: Colors.light.secondary }]}>
                <Feather name="heart" size={20} color="#FFF" />
              </View>
              <ThemedText type="h4">Relationship</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Communication tips
              </ThemedText>
            </Pressable>
            <Pressable style={[styles.guidanceCard, { backgroundColor: Colors.light.accent + "12" }]}>
              <View style={[styles.guidanceIcon, { backgroundColor: Colors.light.accent }]}>
                <Feather name="dollar-sign" size={20} color="#FFF" />
              </View>
              <ThemedText type="h4">Financial</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Budgeting help
              </ThemedText>
            </Pressable>
            <Pressable style={[styles.guidanceCard, { backgroundColor: Colors.light.success + "12" }]}>
              <View style={[styles.guidanceIcon, { backgroundColor: Colors.light.success }]}>
                <Feather name="book" size={20} color="#FFF" />
              </View>
              <ThemedText type="h4">Academic</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Study planning
              </ThemedText>
            </Pressable>
          </View>
        </View>
      ) : null}

      {selectedCategory === "selfheal" ? (
        <>
          <View style={styles.section}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Wellness Tools
            </ThemedText>
            <View style={styles.toolsGrid}>
              {selfHealTools.map((tool) => (
                <Pressable
                  key={tool.id}
                  style={[styles.toolCard, { backgroundColor: theme.backgroundDefault }, Shadows.small]}
                >
                  <View style={[styles.toolIcon, { backgroundColor: tool.color + "15" }]}>
                    <Feather name={tool.icon as any} size={24} color={tool.color} />
                  </View>
                  <ThemedText type="small" style={styles.toolLabel}>
                    {tool.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Mind Boosters
            </ThemedText>
            <View style={styles.boosterRow}>
              {mindBoosters.map((booster) => (
                <Pressable
                  key={booster.id}
                  style={[styles.boosterCard, { backgroundColor: theme.backgroundDefault }, Shadows.small]}
                >
                  <View style={[styles.boosterIcon, { backgroundColor: Colors.light.warm + "30" }]}>
                    <Feather name={booster.icon as any} size={20} color={Colors.light.accent} />
                  </View>
                  <ThemedText type="small">{booster.label}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
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
  categoryContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  categoryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  categoryLabel: {
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  mentorList: {
    gap: Spacing.md,
  },
  mentorCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  mentorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
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
    marginLeft: Spacing.md,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  mentorStats: {
    flexDirection: "row",
    gap: Spacing.xl,
  },
  mentorStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  guidanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  guidanceCard: {
    width: "47%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  guidanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  toolCard: {
    width: "47%",
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  toolIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  toolLabel: {
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  boosterRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  boosterCard: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  boosterIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
