import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width } = Dimensions.get("window");

const onboardingData = [
  {
    id: "1",
    image: require("../assets/images/meditation_onboarding_illustration.png"),
    title: "Your Safe Space",
    subtitle: "A peaceful sanctuary for your mental wellness journey. Take a breath, you're in the right place.",
  },
  {
    id: "2",
    image: require("../assets/images/support_hands_onboarding_illustration.png"),
    title: "Always Supported",
    subtitle: "Connect with caring professionals and an AI companion that's here for you 24/7.",
  },
  {
    id: "3",
    image: require("../assets/images/growth_onboarding_illustration.png"),
    title: "Grow Together",
    subtitle: "Track your progress, celebrate small wins, and watch yourself bloom.",
  },
];

type OnboardingNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<OnboardingNavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace("Main");
    }
  };

  const handleSkip = () => {
    navigation.replace("Main");
  };

  const renderItem = ({ item }: { item: (typeof onboardingData)[0] }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.imageContainer, { backgroundColor: Colors.light.warm + "30" }]}>
        <Image
          source={item.image}
          style={styles.image}
          contentFit="contain"
          transition={300}
        />
      </View>
      <View style={styles.textContainer}>
        <ThemedText type="h1" style={styles.title}>
          {item.title}
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          {item.subtitle}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <ThemedText style={[styles.logoText, { color: Colors.light.primary }]}>
            Heal Here
          </ThemedText>
        </View>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Skip
          </ThemedText>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentIndex
                      ? Colors.light.primary
                      : theme.border,
                  width: index === currentIndex ? 28 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Button onPress={handleNext} style={styles.button}>
          {currentIndex === onboardingData.length - 1 ? "Get Started" : "Continue"}
        </Button>
      </View>
    </View>
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
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: Spacing.sm,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  skipButton: {
    padding: Spacing.sm,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: BorderRadius["2xl"],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  image: {
    width: "80%",
    height: "80%",
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing["2xl"],
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    backgroundColor: Colors.light.primary,
  },
});
