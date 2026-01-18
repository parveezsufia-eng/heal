import React, { useState } from "react";
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
import { TherapistStackParamList } from "@/navigation/TherapistStackNavigator";

type TherapistDetailRouteProp = RouteProp<TherapistStackParamList, "TherapistDetail">;

const therapistData = {
  id: "1",
  name: "Dr. Emily Watson",
  title: "Clinical Psychologist",
  specialties: ["Anxiety", "Depression", "Relationship", "Trauma"],
  experience: "15 years",
  rating: 4.9,
  reviews: 234,
  sessionsCompleted: 1250,
  priceRange: "$80-120",
  available: true,
  languages: ["English", "Spanish"],
  bio: "Dr. Emily Watson is a licensed clinical psychologist with over 15 years of experience in helping individuals navigate life's challenges. She specializes in anxiety disorders, depression, relationship issues, and trauma recovery. Her approach combines cognitive-behavioral therapy with mindfulness techniques to help clients develop lasting coping strategies.",
  education: [
    "Ph.D. Clinical Psychology - Harvard University",
    "M.A. Psychology - Columbia University",
    "B.A. Psychology - NYU",
  ],
  certifications: [
    "Licensed Clinical Psychologist (NY, CA)",
    "Certified Cognitive Behavioral Therapist",
    "EMDR Certified Practitioner",
  ],
  sessionPackages: [
    { id: "1", name: "Single Session", price: "$100", duration: "50 min" },
    { id: "2", name: "4 Session Package", price: "$360", duration: "4x 50 min", savings: "Save 10%" },
    { id: "3", name: "8 Session Package", price: "$640", duration: "8x 50 min", savings: "Save 20%" },
  ],
  testimonials: [
    {
      id: "1",
      name: "Anonymous",
      rating: 5,
      text: "Dr. Watson helped me work through my anxiety in ways I never thought possible. Her compassionate approach made me feel safe to open up.",
      date: "2 weeks ago",
    },
    {
      id: "2",
      name: "Sarah M.",
      rating: 5,
      text: "After struggling with depression for years, I finally found a therapist who truly understands. Dr. Watson is incredibly insightful and supportive.",
      date: "1 month ago",
    },
    {
      id: "3",
      name: "Michael K.",
      rating: 5,
      text: "The best therapist I've ever worked with. She's helped transform my relationship with myself and others.",
      date: "2 months ago",
    },
  ],
};

export default function TherapistDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const route = useRoute<TherapistDetailRouteProp>();
  const [selectedPackage, setSelectedPackage] = useState<string>("1");

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
        {therapistData.available ? (
          <View style={[styles.availableBadge, { backgroundColor: Colors.light.success + "30" }]}>
            <View style={[styles.availableDot, { backgroundColor: Colors.light.success }]} />
            <ThemedText type="small" style={{ color: Colors.light.success }}>
              Available Now
            </ThemedText>
          </View>
        ) : null}
        <ThemedText type="h2">{therapistData.name}</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          {therapistData.title}
        </ThemedText>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Feather name="star" size={18} color={Colors.light.accent} />
            <ThemedText type="h4">{therapistData.rating}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Rating
            </ThemedText>
          </View>
          <View style={styles.statBox}>
            <Feather name="message-square" size={18} color={Colors.light.secondary} />
            <ThemedText type="h4">{therapistData.reviews}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Reviews
            </ThemedText>
          </View>
          <View style={styles.statBox}>
            <Feather name="video" size={18} color={Colors.light.primary} />
            <ThemedText type="h4">{therapistData.sessionsCompleted}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Sessions
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          About
        </ThemedText>
        <Card style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="body" style={{ lineHeight: 24 }}>
            {therapistData.bio}
          </ThemedText>
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Specialties
        </ThemedText>
        <View style={styles.tagsContainer}>
          {therapistData.specialties.map((specialty, index) => (
            <View
              key={index}
              style={[styles.tag, { backgroundColor: Colors.light.secondary + "20" }]}
            >
              <ThemedText type="small" style={{ color: Colors.light.secondary }}>
                {specialty}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Education & Certifications
        </ThemedText>
        <Card style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h4" style={styles.subSectionTitle}>
            Education
          </ThemedText>
          {therapistData.education.map((edu, index) => (
            <View key={index} style={styles.listItem}>
              <Feather name="award" size={14} color={Colors.light.primary} />
              <ThemedText type="body" style={{ flex: 1 }}>
                {edu}
              </ThemedText>
            </View>
          ))}
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ThemedText type="h4" style={styles.subSectionTitle}>
            Certifications
          </ThemedText>
          {therapistData.certifications.map((cert, index) => (
            <View key={index} style={styles.listItem}>
              <Feather name="check-circle" size={14} color={Colors.light.success} />
              <ThemedText type="body" style={{ flex: 1 }}>
                {cert}
              </ThemedText>
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Session Packages
        </ThemedText>
        {therapistData.sessionPackages.map((pkg) => (
          <Pressable
            key={pkg.id}
            style={[
              styles.packageCard,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor:
                  selectedPackage === pkg.id ? Colors.light.primary : "transparent",
              },
            ]}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setSelectedPackage(pkg.id);
            }}
          >
            <View style={styles.packageHeader}>
              <View
                style={[
                  styles.radioButton,
                  {
                    borderColor:
                      selectedPackage === pkg.id ? Colors.light.primary : theme.border,
                  },
                ]}
              >
                {selectedPackage === pkg.id ? (
                  <View style={[styles.radioFill, { backgroundColor: Colors.light.primary }]} />
                ) : null}
              </View>
              <View style={styles.packageInfo}>
                <ThemedText type="h4">{pkg.name}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {pkg.duration}
                </ThemedText>
              </View>
              <View style={styles.packagePrice}>
                <ThemedText type="h3" style={{ color: Colors.light.primary }}>
                  {pkg.price}
                </ThemedText>
                {pkg.savings ? (
                  <View style={[styles.savingsBadge, { backgroundColor: Colors.light.success + "20" }]}>
                    <ThemedText type="small" style={{ color: Colors.light.success }}>
                      {pkg.savings}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="h3">Reviews</ThemedText>
          <View style={styles.overallRating}>
            <Feather name="star" size={16} color={Colors.light.accent} />
            <ThemedText type="h4">{therapistData.rating}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              ({therapistData.reviews})
            </ThemedText>
          </View>
        </View>
        {therapistData.testimonials.map((testimonial) => (
          <Card
            key={testimonial.id}
            style={[styles.reviewCard, { backgroundColor: theme.backgroundDefault }]}
          >
            <View style={styles.reviewHeader}>
              <View style={[styles.reviewAvatar, { backgroundColor: Colors.light.secondary + "30" }]}>
                <Feather name="user" size={14} color={Colors.light.secondary} />
              </View>
              <View style={styles.reviewInfo}>
                <ThemedText type="h4">{testimonial.name}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {testimonial.date}
                </ThemedText>
              </View>
              <View style={styles.ratingRow}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Feather key={i} name="star" size={12} color={Colors.light.accent} />
                ))}
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
          Ways to Connect
        </ThemedText>
        <View style={styles.connectButtons}>
          <Pressable style={[styles.connectButton, { backgroundColor: Colors.light.primary + "20" }]}>
            <Feather name="video" size={24} color={Colors.light.primary} />
            <ThemedText type="small" style={{ color: Colors.light.primary }}>
              Video
            </ThemedText>
          </Pressable>
          <Pressable style={[styles.connectButton, { backgroundColor: Colors.light.secondary + "20" }]}>
            <Feather name="phone" size={24} color={Colors.light.secondary} />
            <ThemedText type="small" style={{ color: Colors.light.secondary }}>
              Audio
            </ThemedText>
          </Pressable>
          <Pressable style={[styles.connectButton, { backgroundColor: Colors.light.accent + "20" }]}>
            <Feather name="message-circle" size={24} color={Colors.light.accent} />
            <ThemedText type="small" style={{ color: Colors.light.accent }}>
              Chat
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <Button onPress={handleBookSession} style={styles.bookButton}>
        Book Session
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
    marginBottom: Spacing.md,
  },
  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: Spacing.xl,
    gap: Spacing.lg,
  },
  statBox: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  overallRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  subSectionTitle: {
    marginBottom: Spacing.sm,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  packageCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
  },
  packageHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioFill: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  packageInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  packagePrice: {
    alignItems: "flex-end",
  },
  savingsBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginTop: Spacing.xs,
  },
  reviewCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewInfo: {
    flex: 1,
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
