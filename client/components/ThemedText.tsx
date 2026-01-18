import React from "react";
import { Text, StyleSheet, TextProps, TextStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography, Colors } from "@/constants/theme";

interface ThemedTextProps extends TextProps {
  type?: "h1" | "h2" | "h3" | "h4" | "body" | "small" | "link";
  style?: TextStyle | TextStyle[];
}

export function ThemedText({
  type = "body",
  style,
  children,
  ...props
}: ThemedTextProps) {
  const { theme } = useTheme();

  const getTypeStyle = (): TextStyle => {
    switch (type) {
      case "h1":
        return {
          fontSize: 32,
          lineHeight: 40,
          fontFamily: "PlayfairDisplay_400Regular",
          color: theme.text,
        };
      case "h2":
        return {
          fontSize: 26,
          lineHeight: 34,
          fontFamily: "PlayfairDisplay_400Regular",
          color: theme.text,
        };
      case "h3":
        return {
          fontSize: 20,
          lineHeight: 28,
          fontFamily: "PlayfairDisplay_400Regular",
          color: theme.text,
        };
      case "h4":
        return {
          fontSize: 17,
          lineHeight: 24,
          fontFamily: "PlusJakartaSans_500Medium",
          color: theme.text,
        };
      case "body":
        return {
          fontSize: 15,
          lineHeight: 22,
          fontFamily: "PlusJakartaSans_400Regular",
          color: theme.text,
        };
      case "small":
        return {
          fontSize: 13,
          lineHeight: 18,
          fontFamily: "PlusJakartaSans_400Regular",
          color: theme.text,
        };
      case "link":
        return {
          fontSize: 15,
          lineHeight: 22,
          fontFamily: "PlusJakartaSans_500Medium",
          color: theme.link,
        };
      default:
        return {
          fontSize: 15,
          lineHeight: 22,
          fontFamily: "PlusJakartaSans_400Regular",
          color: theme.text,
        };
    }
  };

  return (
    <Text style={[getTypeStyle(), style]} {...props}>
      {children}
    </Text>
  );
}
