import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  ScrollView,
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
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { TherapistStackParamList } from "@/navigation/TherapistStackNavigator";

type TherapistNavigationProp = NativeStackNavigationProp<TherapistStackParamList>;

const counselingTypes = [
  "All",
  "Family",
  "Relationship",
  "Burnout",
  "Academic",
  "Teenage",
  "Adult",
  "Corporate",
];

interface Therapist {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  experience: string;
  rating: number;
  reviews: number;
  sessionsCompleted: number;
  priceRange: string;
  available: boolean;
  languages: string[];
}

const therapists: Therapist[] = [
  {
    id: "1",
    name: "Dr. Emily Watson",
    title: "Clinical Psychologist",
    specialties: ["Anxiety", "Depression", "Relationship"],
    experience: "15 years",
    rating: 4.9,
    reviews: 234,
    sessionsCompleted: 1250,
    priceRange: "$80-120",
    available: true,
    languages: ["English", "Spanish"],
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    title: "Licensed Counselor",
    specialties: ["Burnout", "Corporate", "Stress"],
    experience: "10 years",
    rating: 4.8,
    reviews: 189,
    sessionsCompleted: 890,
    priceRange: "$70-100",
    available: true,
    languages: ["English", "Mandarin"],
  },
  {
    id: "3",
    name: "Dr. Sarah Johnson",
    title: "Family Therapist",
    specialties: ["Family", "Teenage", "Parenting"],
    experience: "12 years",
    rating: 4.9,
    reviews: 312,
    sessionsCompleted: 1450,
    priceRange: "$90-130",
    available: false,
    languages: ["English"],
  },
  {
    id: "4",
    name: "Dr. David Miller",
    title: "Psychiatrist",
    specialties: ["Academic", "Anxiety", "Adult"],
    experience: "20 years",
    rating: 4.7,
    reviews: 445,
    sessionsCompleted: 2100,
    priceRange: "$100-150",
    available: true,
    languages: ["English", "French"],
  },
];

export default function TherapistScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<TherapistNavigationProp>();
  const [selectedType, setSelectedType] = useState("All");

  const handleTypePress = (type: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedType(type);
  };

  const handleTherapistPress = (therapistId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("TherapistDetail", { therapistId });
  };

  const filteredTherapists =
    selectedType === "All"
      ? therapists
      : therapists.filter((t) =>
          t.specialties.some((s) => s.toLowerCase().includes(selectedType.toLowerCase()))
        );

  const renderTherapist = ({ item }: { item: Therapist }) => (
    <Pressable onPress={() => handleTherapistPress(item.id)}>
      <Card style={[styles.therapistCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.therapistHeader}>
          <View style={[styles.avatar, { backgroundColor: Colors.light.primary + "30" }]}>
            <Feather name="user" size={28} color={Colors.light.primary} />
          </View>
          <View style={styles.therapistInfo}>
            <View style={styles.nameRow}>
              <ThemedText type="h4">{item.name}</ThemedText>
              {item.available ? (
                <View style={[styles.availableBadge, { backgroundColor: Colors.light.success + "30" }]}>
                  <View style={[styles.availableDot, { backgroundColor: Colors.light.success }]} />
                  <ThemedText type="small" style={{ color: Colors.light.success }}>
                    Available
                  </ThemedText>
                </View>
              ) : null}
            </View>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {item.title}
            </ThemedText>
          </View>
        </View>

        <View style={styles.specialtiesContainer}>
          {item.specialties.slice(0, 3).map((specialty, index) => (
            <View
              key={index}
              style={[styles.specialtyTag, { backgroundColor: Colors.light.secondary + "20" }]}
            >
              <ThemedText type="small" style={{ color: Colors.light.secondary }}>
                {specialty}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Feather name="star" size={14} color={Colors.light.accent} />
            <ThemedText type="small">{item.rating}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              ({item.reviews})
            </ThemedText>
          </View>
          <View style={styles.stat}>
            <Feather name="briefcase" size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {item.experience}
            </ThemedText>
          </View>
          <View style={styles.stat}>
            <Feather name="video" size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {item.sessionsCompleted}
            </ThemedText>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <ThemedText type="h4" style={{ color: Colors.light.primary }}>
            {item.priceRange}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            per session
          </ThemedText>
        </View>

        <Button
          onPress={() => handleTherapistPress(item.id)}
          style={[
            styles.bookButton,
            { backgroundColor: item.available ? Colors.light.primary : theme.backgroundSecondary },
          ]}
          disabled={!item.available}
        >
          {item.available ? "Book Session" : "Currently Unavailable"}
        </Button>
      </Card>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.typesContainer,
          { paddingTop: headerHeight + Spacing.lg },
        ]}
      >
        {counselingTypes.map((type) => (
          <Pressable
            key={type}
            style={[
              styles.typeChip,
              {
                backgroundColor:
                  selectedType === type ? Colors.light.primary : theme.backgroundDefault,
              },
            ]}
            onPress={() => handleTypePress(type)}
          >
            <ThemedText
              type="small"
              style={[
                styles.typeLabel,
                selectedType === type && { color: "#FFF" },
              ]}
            >
              {type}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filteredTherapists}
        renderItem={renderTherapist}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingBottom: tabBarHeight + Spacing["5xl"],
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  typesContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  typeChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  typeLabel: {
    fontWeight: "600",
  },
  therapistCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  therapistHeader: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  therapistInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  specialtiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  specialtyTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.xl,
    marginBottom: Spacing.md,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  bookButton: {
    marginTop: Spacing.sm,
  },
});
