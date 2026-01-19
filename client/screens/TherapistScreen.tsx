import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { TherapistStackParamList } from "@/navigation/TherapistStackNavigator";

type TherapistNavigationProp = NativeStackNavigationProp<TherapistStackParamList>;

const mentalHealthIssues = [
  { id: "anxiety", label: "Anxiety", icon: "activity" },
  { id: "depression", label: "Depression", icon: "cloud-rain" },
  { id: "stress", label: "Stress", icon: "zap" },
  { id: "burnout", label: "Burnout", icon: "battery" },
  { id: "insomnia", label: "Insomnia", icon: "moon" },
  { id: "adhd", label: "ADHD", icon: "target" },
  { id: "ptsd", label: "PTSD", icon: "shield" },
  { id: "ocd", label: "OCD", icon: "repeat" },
  { id: "eating", label: "Eating Disorders", icon: "heart" },
  { id: "addiction", label: "Addiction", icon: "link" },
  { id: "grief", label: "Grief & Loss", icon: "sunset" },
  { id: "trauma", label: "Trauma", icon: "alert-circle" },
  { id: "family", label: "Family Issues", icon: "users" },
  { id: "relationship", label: "Relationship", icon: "heart" },
  { id: "anger", label: "Anger Management", icon: "thermometer" },
  { id: "selfesteem", label: "Self-Esteem", icon: "star" },
  { id: "study", label: "Study Pressure", icon: "book" },
  { id: "work", label: "Work Stress", icon: "briefcase" },
  { id: "social", label: "Social Anxiety", icon: "users" },
  { id: "panic", label: "Panic Attacks", icon: "alert-triangle" },
  { id: "phobias", label: "Phobias", icon: "eye-off" },
  { id: "bipolar", label: "Bipolar Disorder", icon: "trending-up" },
  { id: "loneliness", label: "Loneliness", icon: "user" },
  { id: "identity", label: "Identity Issues", icon: "compass" },
];

interface Therapist {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  rating: number;
  reviews: number;
  price: string;
  available: boolean;
}

const therapists: Therapist[] = [
  { id: "1", name: "Dr. Emily Watson", title: "Clinical Psychologist", specialties: ["Anxiety", "Depression", "PTSD"], rating: 4.9, reviews: 234, price: "$80", available: true },
  { id: "2", name: "Dr. Michael Chen", title: "Licensed Counselor", specialties: ["Stress", "Burnout", "Work Stress"], rating: 4.8, reviews: 189, price: "$70", available: true },
  { id: "3", name: "Dr. Sarah Johnson", title: "Family Therapist", specialties: ["Family Issues", "Relationship"], rating: 4.9, reviews: 312, price: "$90", available: false },
  { id: "4", name: "Dr. James Miller", title: "Addiction Specialist", specialties: ["Addiction", "Trauma", "Grief & Loss"], rating: 4.7, reviews: 156, price: "$85", available: true },
  { id: "5", name: "Dr. Lisa Park", title: "Child Psychologist", specialties: ["ADHD", "Study Pressure", "Social Anxiety"], rating: 4.9, reviews: 278, price: "$95", available: true },
  { id: "6", name: "Dr. Robert Davis", title: "Sleep Specialist", specialties: ["Insomnia", "Anxiety", "Stress"], rating: 4.6, reviews: 145, price: "$75", available: true },
];

export default function TherapistScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<TherapistNavigationProp>();
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleIssuePress = (issueLabel: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIssues((prev) =>
      prev.includes(issueLabel)
        ? prev.filter((i) => i !== issueLabel)
        : [...prev, issueLabel]
    );
  };

  const clearFilters = () => {
    setSelectedIssues([]);
    setSearchQuery("");
  };

  const filteredIssues = mentalHealthIssues.filter((issue) =>
    issue.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTherapists = selectedIssues.length === 0
    ? therapists
    : therapists.filter((t) =>
        t.specialties.some((s) => selectedIssues.includes(s))
      );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={{ paddingTop: headerHeight + Spacing.md, paddingBottom: tabBarHeight + Spacing["5xl"] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Find Therapist</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Select your concerns to find the right support
          </ThemedText>
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="search" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search issues..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {(searchQuery.length > 0 || selectedIssues.length > 0) ? (
              <Pressable onPress={clearFilters}>
                <Feather name="x" size={18} color={theme.textSecondary} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {selectedIssues.length > 0 ? (
          <View style={styles.selectedContainer}>
            <ThemedText style={[styles.selectedLabel, { color: theme.textSecondary }]}>
              Selected ({selectedIssues.length})
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectedRow}>
              {selectedIssues.map((issue) => (
                <Pressable
                  key={issue}
                  style={[styles.selectedChip, { backgroundColor: Colors.light.primary }]}
                  onPress={() => handleIssuePress(issue)}
                >
                  <ThemedText style={styles.selectedChipText}>{issue}</ThemedText>
                  <Feather name="x" size={14} color="#FFF" />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.issuesSection}>
          <ThemedText style={styles.sectionTitle}>What are you experiencing?</ThemedText>
          <View style={styles.issuesGrid}>
            {filteredIssues.map((issue) => {
              const isSelected = selectedIssues.includes(issue.label);
              return (
                <Pressable
                  key={issue.id}
                  style={[
                    styles.issueChip,
                    { backgroundColor: isSelected ? Colors.light.primary : theme.backgroundSecondary },
                  ]}
                  onPress={() => handleIssuePress(issue.label)}
                >
                  <Feather
                    name={issue.icon as any}
                    size={16}
                    color={isSelected ? "#FFF" : Colors.light.primary}
                  />
                  <ThemedText
                    style={[
                      styles.issueChipText,
                      { color: isSelected ? "#FFF" : theme.text },
                    ]}
                  >
                    {issue.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.therapistsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recommended Therapists</ThemedText>
            <ThemedText style={[styles.resultCount, { color: theme.textSecondary }]}>
              {filteredTherapists.length} found
            </ThemedText>
          </View>
          {filteredTherapists.map((item) => (
            <Pressable key={item.id} onPress={() => navigation.navigate("TherapistDetail", { therapistId: item.id })}>
              <View style={[styles.therapistCard, { backgroundColor: theme.backgroundSecondary }]}>
                <View style={styles.therapistHeader}>
                  <View style={[styles.avatar, { backgroundColor: Colors.light.cardPeach }]}>
                    <Feather name="user" size={24} color={Colors.light.primary} />
                  </View>
                  <View style={styles.therapistInfo}>
                    <View style={styles.nameRow}>
                      <ThemedText style={styles.therapistName}>{item.name}</ThemedText>
                      {item.available ? (
                        <View style={[styles.availableDot, { backgroundColor: Colors.light.success }]} />
                      ) : null}
                    </View>
                    <ThemedText style={[styles.therapistTitle, { color: theme.textSecondary }]}>
                      {item.title}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.specialtiesRow}>
                  {item.specialties.map((specialty, index) => (
                    <View key={index} style={[styles.specialtyTag, { backgroundColor: Colors.light.cardBlue }]}>
                      <ThemedText style={styles.specialtyText}>{specialty}</ThemedText>
                    </View>
                  ))}
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.ratingRow}>
                    <Feather name="star" size={14} color={Colors.light.primary} />
                    <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
                    <ThemedText style={[styles.reviewsText, { color: theme.textSecondary }]}>
                      ({item.reviews} reviews)
                    </ThemedText>
                  </View>
                  <View style={styles.priceRow}>
                    <ThemedText style={styles.priceText}>{item.price}</ThemedText>
                    <ThemedText style={[styles.priceLabel, { color: theme.textSecondary }]}>/session</ThemedText>
                  </View>
                </View>
                <Pressable
                  style={[
                    styles.bookButton,
                    { backgroundColor: item.available ? Colors.light.primary : theme.border },
                  ]}
                  disabled={!item.available}
                >
                  <ThemedText style={[styles.bookButtonText, { color: item.available ? "#FFF" : theme.textSecondary }]}>
                    {item.available ? "Book Session" : "Unavailable"}
                  </ThemedText>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainScroll: { flex: 1 },
  header: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  headerTitle: { fontSize: 28, fontFamily: "PlayfairDisplay_400Regular", color: Colors.light.text },
  headerSubtitle: { fontSize: 14, fontFamily: "PlusJakartaSans_400Regular", marginTop: Spacing.xs },
  searchContainer: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  searchBox: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.lg, borderWidth: 1, gap: Spacing.sm },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "PlusJakartaSans_400Regular", paddingVertical: Spacing.xs },
  selectedContainer: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  selectedLabel: { fontSize: 12, fontFamily: "PlusJakartaSans_500Medium", marginBottom: Spacing.sm },
  selectedRow: { gap: Spacing.sm },
  selectedChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, gap: Spacing.xs },
  selectedChipText: { fontSize: 13, fontFamily: "PlusJakartaSans_500Medium", color: "#FFF" },
  issuesSection: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  sectionTitle: { fontSize: 18, fontFamily: "PlayfairDisplay_400Regular", marginBottom: Spacing.md, color: Colors.light.text },
  issuesGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  issueChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.lg, gap: Spacing.xs },
  issueChipText: { fontSize: 13, fontFamily: "PlusJakartaSans_500Medium" },
  therapistsSection: { paddingHorizontal: Spacing.xl },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md },
  resultCount: { fontSize: 13, fontFamily: "PlusJakartaSans_400Regular" },
  therapistCard: { padding: Spacing.lg, borderRadius: BorderRadius.xl, marginBottom: Spacing.md },
  therapistHeader: { flexDirection: "row", marginBottom: Spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  therapistInfo: { flex: 1, marginLeft: Spacing.md, justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  therapistName: { fontSize: 17, fontFamily: "PlusJakartaSans_600SemiBold", color: Colors.light.text },
  therapistTitle: { fontSize: 13, fontFamily: "PlusJakartaSans_400Regular" },
  availableDot: { width: 8, height: 8, borderRadius: 4 },
  specialtiesRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.md },
  specialtyTag: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm },
  specialtyText: { fontSize: 12, fontFamily: "PlusJakartaSans_500Medium", color: Colors.light.secondary },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  ratingText: { fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold", color: Colors.light.text },
  reviewsText: { fontSize: 13, fontFamily: "PlusJakartaSans_400Regular" },
  priceRow: { flexDirection: "row", alignItems: "baseline" },
  priceText: { fontSize: 18, fontFamily: "PlusJakartaSans_700Bold", color: Colors.light.text },
  priceLabel: { fontSize: 12, fontFamily: "PlusJakartaSans_400Regular" },
  bookButton: { paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, alignItems: "center" },
  bookButtonText: { fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold" },
});
