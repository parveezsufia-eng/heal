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
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { TherapistStackParamList } from "@/navigation/TherapistStackNavigator";

type TherapistNavigationProp = NativeStackNavigationProp<TherapistStackParamList>;

const counselingTypes = ["All", "Family", "Relationship", "Burnout", "Academic", "Teenage", "Corporate"];

interface Therapist {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  experience: string;
  rating: number;
  reviews: number;
  price: string;
  available: boolean;
}

const therapists: Therapist[] = [
  { id: "1", name: "Dr. Emily Watson", title: "Clinical Psychologist", specialties: ["Anxiety", "Depression"], experience: "15 years", rating: 4.9, reviews: 234, price: "$80-120", available: true },
  { id: "2", name: "Dr. Michael Chen", title: "Licensed Counselor", specialties: ["Burnout", "Corporate"], experience: "10 years", rating: 4.8, reviews: 189, price: "$70-100", available: true },
  { id: "3", name: "Dr. Sarah Johnson", title: "Family Therapist", specialties: ["Family", "Teenage"], experience: "12 years", rating: 4.9, reviews: 312, price: "$90-130", available: false },
  { id: "4", name: "Dr. David Miller", title: "Psychiatrist", specialties: ["Academic", "Anxiety"], experience: "20 years", rating: 4.7, reviews: 445, price: "$100-150", available: true },
];

export default function TherapistScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<TherapistNavigationProp>();
  const [selectedType, setSelectedType] = useState("All");

  const handleTypePress = (type: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedType(type);
  };

  const handleTherapistPress = (therapistId: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("TherapistDetail", { therapistId });
  };

  const filteredTherapists = selectedType === "All" ? therapists : therapists.filter((t) => t.specialties.some((s) => s.toLowerCase().includes(selectedType.toLowerCase())));

  const renderTherapist = ({ item }: { item: Therapist }) => (
    <Pressable onPress={() => handleTherapistPress(item.id)}>
      <View style={[styles.therapistCard, { backgroundColor: theme.backgroundDefault }, Shadows.small]}>
        <View style={styles.therapistHeader}>
          <View style={[styles.avatar, { backgroundColor: Colors.light.warm + "40" }]}>
            <Feather name="user" size={26} color={Colors.light.primary} />
          </View>
          <View style={styles.therapistInfo}>
            <View style={styles.nameRow}>
              <ThemedText type="h4">{item.name}</ThemedText>
              {item.available ? (
                <View style={[styles.availableBadge, { backgroundColor: Colors.light.success + "20" }]}>
                  <View style={[styles.availableDot, { backgroundColor: Colors.light.success }]} />
                </View>
              ) : null}
            </View>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>{item.title}</ThemedText>
          </View>
        </View>
        <View style={styles.specialtiesContainer}>
          {item.specialties.map((specialty, index) => (
            <View key={index} style={[styles.specialtyTag, { backgroundColor: Colors.light.secondary + "15" }]}>
              <ThemedText type="small" style={{ color: Colors.light.secondary, fontWeight: "500" }}>{specialty}</ThemedText>
            </View>
          ))}
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Feather name="star" size={14} color={Colors.light.accent} />
            <ThemedText type="small" style={{ fontWeight: "600" }}>{item.rating}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>({item.reviews})</ThemedText>
          </View>
          <View style={styles.stat}>
            <Feather name="briefcase" size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>{item.experience}</ThemedText>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View>
            <ThemedText type="h4" style={{ color: Colors.light.primary }}>{item.price}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>per session</ThemedText>
          </View>
          <Pressable style={[styles.bookBtn, { backgroundColor: item.available ? Colors.light.primary : theme.border }]} disabled={!item.available}>
            <ThemedText type="small" style={{ color: item.available ? "#FFF" : theme.textSecondary, fontWeight: "600" }}>
              {item.available ? "Book" : "Unavailable"}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.typesContainer, { paddingTop: headerHeight + Spacing.md }]}>
        {counselingTypes.map((type) => (
          <Pressable key={type} style={[styles.typeChip, { backgroundColor: selectedType === type ? Colors.light.primary : theme.backgroundDefault }]} onPress={() => handleTypePress(type)}>
            <ThemedText type="small" style={[styles.typeLabel, { color: selectedType === type ? "#FFF" : theme.text }]}>{type}</ThemedText>
          </Pressable>
        ))}
      </ScrollView>
      <FlatList data={filteredTherapists} renderItem={renderTherapist} keyExtractor={(item) => item.id} contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: tabBarHeight + Spacing["5xl"] }} scrollIndicatorInsets={{ bottom: insets.bottom }} showsVerticalScrollIndicator={false} ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  typesContainer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, gap: Spacing.sm },
  typeChip: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, marginRight: Spacing.sm },
  typeLabel: { fontWeight: "600", fontFamily: "PlusJakartaSans_600SemiBold" },
  therapistCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg },
  therapistHeader: { flexDirection: "row", marginBottom: Spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  therapistInfo: { flex: 1, marginLeft: Spacing.md, justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  availableBadge: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  availableDot: { width: 8, height: 8, borderRadius: 4 },
  specialtiesContainer: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing.md },
  specialtyTag: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm },
  statsRow: { flexDirection: "row", gap: Spacing.xl, marginBottom: Spacing.md },
  stat: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bookBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.lg },
});
