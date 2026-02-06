import React from "react";
import { View, StyleSheet } from "react-native";
import { SunflowerLogo } from "./SunflowerLogo";
import { ThemedText } from "./ThemedText";
import { Colors, Spacing } from "@/constants/theme";

interface HeaderTitleProps {
  title: string;
}

export function HeaderTitle({ title }: HeaderTitleProps) {
  return (
    <View style={styles.container}>
      <SunflowerLogo size={28} />
      <ThemedText style={styles.title}>{title}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
    color: Colors.light.primary,
    marginLeft: Spacing.sm,
  },
});
