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
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Svg, { Path, Circle } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width, height } = Dimensions.get("window");

const onboardingData = [
  {
    id: "1",
    image: require("../assets/images/line_art_meditation_woman_illustration.png"),
    title: "Find Your\nInner Peace",
    subtitle: "Forget about life's stress and problems and learn to live a happy life",
  },
  {
    id: "2",
    image: require("../assets/images/line_art_supportive_hands_illustration.png"),
    title: "Connect With\nYourself",
    subtitle: "Take time to breathe, reflect, and discover your true potential",
  },
  {
    id: "3",
    image: require("../assets/images/line_art_yoga_prayer_pose_illustration.png"),
    title: "Start Your\nHealing Journey",
    subtitle: "Begin your path to wellness with guided meditation and support",
  },
];

type OnboardingNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DecorativeElements = () => (
  <View style={styles.decorativeContainer}>
    <View style={[styles.decorStar, { top: 80, left: 30 }]}>
      <Feather name="x" size={12} color="#E8B4B8" />
    </View>
    <View style={[styles.decorStar, { top: 120, right: 40 }]}>
      <Feather name="x" size={10} color="#AFCCE1" />
    </View>
    <View style={[styles.decorStar, { top: 200, left: 60 }]}>
      <Feather name="x" size={8} color="#C9A77C" />
    </View>
    <View style={[styles.decorDot, { top: 150, left: 20, backgroundColor: "#F5DED0" }]} />
    <View style={[styles.decorDot, { top: 100, right: 60, backgroundColor: "#AFCCE1" }]} />
    <View style={[styles.decorCurve, { top: 60, right: 20 }]}>
      <Svg width="60" height="60" viewBox="0 0 60 60">
        <Path d="M10 50 Q30 10 50 30" stroke="#F5DED0" strokeWidth="1" fill="none" />
      </Svg>
    </View>
  </View>
);

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

  const renderItem = ({ item, index }: { item: (typeof onboardingData)[0]; index: number }) => (
    <View style={[styles.slide, { width }]}>
      <View style={styles.illustrationContainer}>
        <Image
          source={item.image}
          style={styles.illustration}
          contentFit="contain"
          transition={300}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
      <DecorativeElements />
      
      <View style={[styles.skipContainer, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <ThemedText style={[styles.skipText, { color: theme.textSecondary }]}>
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
        style={styles.flatList}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing["3xl"] }]}>
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>
            {onboardingData[currentIndex].title}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            {onboardingData[currentIndex].subtitle}
          </ThemedText>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.pagination}>
            {onboardingData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === currentIndex
                        ? theme.text
                        : theme.border,
                    width: index === currentIndex ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>

          <Pressable
            style={[styles.nextButton, { borderColor: theme.text }]}
            onPress={handleNext}
          >
            <Feather name="chevron-right" size={24} color={theme.text} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorativeContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  decorStar: {
    position: "absolute",
  },
  decorDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  decorCurve: {
    position: "absolute",
  },
  skipContainer: {
    alignItems: "flex-end",
    paddingHorizontal: Spacing.xl,
    zIndex: 10,
  },
  skipButton: {
    padding: Spacing.sm,
  },
  skipText: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  flatList: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationContainer: {
    width: width,
    height: height * 0.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  illustration: {
    width: "100%",
    height: "100%",
  },
  footer: {
    paddingHorizontal: Spacing.xl,
  },
  textContainer: {
    marginBottom: Spacing["3xl"],
  },
  title: {
    fontSize: 36,
    lineHeight: 44,
    fontFamily: "PlayfairDisplay_400Regular",
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
