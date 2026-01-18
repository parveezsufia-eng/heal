import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ExploreStackParamList } from "@/navigation/ExploreStackNavigator";

type MentorDetailRouteProp = RouteProp<ExploreStackParamList, "MentorDetail">;

const mentorData = {
  id: "1",
  name: "Dr. Sarah Mitchell",
  title: "Career Counseling Expert",
  experience: "12 years",
  rating: 4.9,
  reviews: 234,
  sessions: 450,
  bio: "Dr. Sarah Mitchell is a certified career counselor with over 12 years of experience helping professionals navigate career transitions, overcome workplace challenges, and achieve their professional goals. She specializes in resume optimization, interview preparation, and career path planning.",
  specialties: ["Career Guidance", "Interview Prep", "Resume Building", "Leadership Development"],
  education: [
    "Ph.D. in Organizational Psychology - Stanford University",
    "M.A. in Career Counseling - UCLA",
    "B.A. in Psychology - UC Berkeley",
  ],
  languages: ["English", "Spanish"],
  availability: "Mon-Fri: 9AM - 6PM PST",
  testimonials: [
    {
      id: "1",
      name: "John D.",
      rating: 5,
      text: "Dr. Mitchell helped me completely transform my resume and prepare for interviews. I landed my dream job within 2 months!",
    },
    {
      id: "2",
      name: "Emily R.",
      rating: 5,
      text: "Incredible mentor! Her insights on career development were invaluable. Highly recommend for anyone looking to advance their career.",
    },
  ],
};

export default function MentorDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const route = useRoute<MentorDetailRouteProp>();

  const handleBookSession = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing["3xl"],
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: Colors.light.primary + "30" }]}>
          <Feather name="user" size={48} color={Colors.light.primary} />
        </View>
        <ThemedText type="h2">{mentorData.name}</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          {mentorData.title}
        </ThemedText>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Feather name="star" size={16} color={Colors.light.accent} />
            <ThemedText type="h4">{mentorData.rating}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              ({mentorData.reviews} reviews)
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.stat}>
            <Feather name="briefcase" size={16} color={Colors.light.primary} />
            <ThemedText type="h4">{mentorData.experience}</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.stat}>
            <Feather name="video" size={16} color={Colors.light.secondary} />
            <ThemedText type="h4">{mentorData.sessions}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          About
        </ThemedText>
        <Card style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="body" style={{ lineHeight: 24 }}>
            {mentorData.bio}
          </ThemedText>
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Specialties
        </ThemedText>
        <View style={styles.specialtiesContainer}>
          {mentorData.specialties.map((specialty, index) => (
            <View
              key={index}
              style={[styles.specialtyTag, { backgroundColor: Colors.light.primary + "20" }]}
            >
              <ThemedText type="small" style={{ color: Colors.light.primary }}>
                {specialty}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Education
        </ThemedText>
        <Card style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          {mentorData.education.map((edu, index) => (
            <View key={index} style={styles.educationItem}>
              <Feather name="award" size={16} color={Colors.light.primary} />
              <ThemedText type="body" style={{ flex: 1 }}>
                {edu}
              </ThemedText>
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Availability
        </ThemedText>
        <Card style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.availabilityRow}>
            <Feather name="clock" size={18} color={Colors.light.primary} />
            <ThemedText type="body">{mentorData.availability}</ThemedText>
          </View>
          <View style={styles.availabilityRow}>
            <Feather name="globe" size={18} color={Colors.light.primary} />
            <ThemedText type="body">{mentorData.languages.join(", ")}</ThemedText>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Testimonials
        </ThemedText>
        {mentorData.testimonials.map((testimonial) => (
          <Card
            key={testimonial.id}
            style={[styles.testimonialCard, { backgroundColor: theme.backgroundDefault }]}
          >
            <View style={styles.testimonialHeader}>
              <View style={[styles.testimonialAvatar, { backgroundColor: Colors.light.secondary + "30" }]}>
                <Feather name="user" size={16} color={Colors.light.secondary} />
              </View>
              <View style={styles.testimonialInfo}>
                <ThemedText type="h4">{testimonial.name}</ThemedText>
                <View style={styles.ratingRow}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Feather key={i} name="star" size={12} color={Colors.light.accent} />
                  ))}
                </View>
              </View>
            </View>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              "{testimonial.text}"
            </ThemedText>
          </Card>
        ))}
      </View>

      <View style={styles.connectSection}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Connect
        </ThemedText>
        <View style={styles.connectButtons}>
          <Pressable style={[styles.connectButton, { backgroundColor: Colors.light.primary + "20" }]}>
            <Feather name="video" size={20} color={Colors.light.primary} />
            <ThemedText type="small" style={{ color: Colors.light.primary }}>
              Video Call
            </ThemedText>
          </Pressable>
          <Pressable style={[styles.connectButton, { backgroundColor: Colors.light.secondary + "20" }]}>
            <Feather name="phone" size={20} color={Colors.light.secondary} />
            <ThemedText type="small" style={{ color: Colors.light.secondary }}>
              Audio Call
            </ThemedText>
          </Pressable>
          <Pressable style={[styles.connectButton, { backgroundColor: Colors.light.accent + "20" }]}>
            <Feather name="message-circle" size={20} color={Colors.light.accent} />
            <ThemedText type="small" style={{ color: Colors.light.accent }}>
              Message
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <Button onPress={handleBookSession} style={styles.bookButton}>
        Book a Session
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.lg,
    gap: Spacing.lg,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 20,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  specialtiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  specialtyTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  educationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  testimonialCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  testimonialHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  testimonialAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  testimonialInfo: {
    marginLeft: Spacing.md,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 2,
  },
  connectSection: {
    marginBottom: Spacing.xl,
  },
  connectButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  connectButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  bookButton: {
    backgroundColor: Colors.light.primary,
    marginBottom: Spacing.xl,
  },
});
