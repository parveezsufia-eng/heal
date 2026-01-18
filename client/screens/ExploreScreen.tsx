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
    image: null,
  },
  {
    id: "2",
    name: "Prof. James Chen",
    specialty: "Academic Stress",
    experience: "8 years",
    rating: 4.8,
    sessions: 320,
    image: null,
  },
  {
    id: "3",
    name: "Lisa Thompson",
    specialty: "Life Coaching",
    experience: "15 years",
    rating: 4.9,
    sessions: 680,
    image: null,
  },
];

const selfHealTools = [
  { id: "breathing", icon: "wind", label: "Breathing Bubble", color: Colors.light.primary },
  { id: "mindtest", icon: "brain", label: "Mind Testing", color: Colors.light.secondary },
  { id: "diet", icon: "coffee", label: "Diet Plans", color: Colors.light.accent },
  { id: "audio", icon: "headphones", label: "Mindful Audio", color: Colors.light.success },
];

const mindBoosters = [
  { id: "facts", icon: "zap", label: "Fun Facts", description: "Interesting mental health facts" },
  { id: "riddles", icon: "help-circle", label: "Riddles", description: "Brain teasers for focus" },
  { id: "stories", icon: "book-open", label: "Stories", description: "Inspiring wellness stories" },
];

const healthContent = [
  { id: "vlogs", icon: "video", label: "Wellness Vlogs" },
  { id: "podcasts", icon: "mic", label: "Podcasts" },
  { id: "exercises", icon: "activity", label: "Exercises" },
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
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing["5xl"],
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.searchContainer, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="search" size={20} color={theme.textSecondary} />
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
            ]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <Feather
              name={category.icon as any}
              size={20}
              color={selectedCategory === category.id ? "#FFF" : theme.text}
            />
            <ThemedText
              type="small"
              style={[
                styles.categoryLabel,
                selectedCategory === category.id && { color: "#FFF" },
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
          <ThemedText type="body" style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Get personalized guidance from experienced professionals
          </ThemedText>
          <View style={styles.mentorList}>
            {mentors.map((mentor) => (
              <Pressable
                key={mentor.id}
                onPress={() => handleMentorPress(mentor.id)}
              >
                <Card style={[styles.mentorCard, { backgroundColor: theme.backgroundDefault }]}>
                  <View style={styles.mentorHeader}>
                    <View style={[styles.mentorAvatar, { backgroundColor: Colors.light.primary + "30" }]}>
                      <Feather name="user" size={24} color={Colors.light.primary} />
                    </View>
                    <View style={styles.mentorInfo}>
                      <ThemedText type="h4">{mentor.name}</ThemedText>
                      <ThemedText type="small" style={{ color: theme.textSecondary }}>
                        {mentor.specialty}
                      </ThemedText>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Feather name="star" size={12} color={Colors.light.accent} />
                      <ThemedText type="small">{mentor.rating}</ThemedText>
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
                </Card>
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
            <Card style={[styles.guidanceCard, { backgroundColor: Colors.light.primary + "15" }]}>
              <View style={[styles.guidanceIcon, { backgroundColor: Colors.light.primary }]}>
                <Feather name="briefcase" size={20} color="#FFF" />
              </View>
              <ThemedText type="h4">Career Guidance</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Resume help, interview prep, job suggestions
              </ThemedText>
            </Card>
            <Card style={[styles.guidanceCard, { backgroundColor: Colors.light.secondary + "15" }]}>
              <View style={[styles.guidanceIcon, { backgroundColor: Colors.light.secondary }]}>
                <Feather name="heart" size={20} color="#FFF" />
              </View>
              <ThemedText type="h4">Relationship Advice</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Conflict resolution, communication tips
              </ThemedText>
            </Card>
            <Card style={[styles.guidanceCard, { backgroundColor: Colors.light.accent + "15" }]}>
              <View style={[styles.guidanceIcon, { backgroundColor: Colors.light.accent }]}>
                <Feather name="dollar-sign" size={20} color="#FFF" />
              </View>
              <ThemedText type="h4">Financial Wellness</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Budgeting templates, spending analysis
              </ThemedText>
            </Card>
            <Card style={[styles.guidanceCard, { backgroundColor: Colors.light.success + "15" }]}>
              <View style={[styles.guidanceIcon, { backgroundColor: Colors.light.success }]}>
                <Feather name="book" size={20} color="#FFF" />
              </View>
              <ThemedText type="h4">Academic Support</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Study planning, exam stress management
              </ThemedText>
            </Card>
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
                <Pressable key={tool.id} style={[styles.toolCard, { backgroundColor: theme.backgroundDefault }]}>
                  <View style={[styles.toolIcon, { backgroundColor: tool.color + "20" }]}>
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
            <View style={styles.boosterList}>
              {mindBoosters.map((booster) => (
                <Pressable
                  key={booster.id}
                  style={[styles.boosterCard, { backgroundColor: theme.backgroundDefault }]}
                >
                  <View style={[styles.boosterIcon, { backgroundColor: Colors.light.primary + "20" }]}>
                    <Feather name={booster.icon as any} size={20} color={Colors.light.primary} />
                  </View>
                  <View style={styles.boosterInfo}>
                    <ThemedText type="h4">{booster.label}</ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      {booster.description}
                    </ThemedText>
                  </View>
                  <Feather name="chevron-right" size={20} color={theme.textSecondary} />
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Health Content
            </ThemedText>
            <View style={styles.contentRow}>
              {healthContent.map((content) => (
                <Pressable
                  key={content.id}
                  style={[styles.contentCard, { backgroundColor: theme.backgroundDefault }]}
                >
                  <View style={[styles.contentIcon, { backgroundColor: Colors.light.secondary + "20" }]}>
                    <Feather name={content.icon as any} size={24} color={Colors.light.secondary} />
                  </View>
                  <ThemedText type="small">{content.label}</ThemedText>
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
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
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
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  categoryLabel: {
    fontWeight: "600",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    marginBottom: Spacing.lg,
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
    backgroundColor: Colors.light.accent + "20",
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
    gap: Spacing.md,
  },
  guidanceCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  guidanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
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
    marginBottom: Spacing.md,
  },
  toolLabel: {
    textAlign: "center",
    fontWeight: "600",
  },
  boosterList: {
    gap: Spacing.sm,
  },
  boosterCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  boosterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  boosterInfo: {
    flex: 1,
  },
  contentRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  contentCard: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  contentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
