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
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { TherapistStackParamList } from "@/navigation/TherapistStackNavigator";

type TherapistNavigationProp = NativeStackNavigationProp<TherapistStackParamList>;

const counselingTypes = ["All", "Anxiety", "Depression", "Relationship", "Stress", "Burnout"];

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
  { id: "1", name: "Dr. Emily Watson", title: "Clinical Psychologist", specialties: ["Anxiety", "Depression"], rating: 4.9, reviews: 234, price: "$80", available: true },
  { id: "2", name: "Dr. Michael Chen", title: "Licensed Counselor", specialties: ["Stress", "Burnout"], rating: 4.8, reviews: 189, price: "$70", available: true },
  { id: "3", name: "Dr. Sarah Johnson", title: "Family Therapist", specialties: ["Relationship"], rating: 4.9, reviews: 312, price: "$90", available: false },
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

  const filteredTherapists = selectedType === "All"
    ? therapists
    : therapists.filter((t) => t.specialties.some((s) => s === selectedType));

  const renderTherapist = ({ item }: { item: Therapist }) => (
    <Pressable onPress={() => navigation.navigate("TherapistDetail", { therapistId: item.id })}>
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
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: headerHeight + Spacing.md }]}>
        <ThemedText style={styles.headerTitle}>Find Therapist</ThemedText>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typesContainer}
      >
        {counselingTypes.map((type) => (
          <Pressable
            key={type}
            style={[
              styles.typePill,
              selectedType === type && styles.typePillSelected,
            ]}
            onPress={() => handleTypePress(type)}
          >
            <ThemedText
              style={[
                styles.typeText,
                selectedType === type && styles.typeTextSelected,
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
          paddingHorizontal: Spacing.xl,
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
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  headerTitle: { fontSize: 28, fontFamily: "PlayfairDisplay_400Regular", color: Colors.light.text },
  typesContainer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, gap: Spacing.sm },
  typePill: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.light.backgroundSecondary, marginRight: Spacing.sm },
  typePillSelected: { backgroundColor: Colors.light.text },
  typeText: { fontSize: 14, fontFamily: "PlusJakartaSans_500Medium", color: Colors.light.text },
  typeTextSelected: { color: "#FFFFFF" },
  therapistCard: { padding: Spacing.lg, borderRadius: BorderRadius.xl },
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
