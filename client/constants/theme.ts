import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#2D2D2D",
    textSecondary: "#8B8B8B",
    buttonText: "#FFFFFF",
    tabIconDefault: "#C4C4C4",
    tabIconSelected: "#2D2D2D",
    link: "#C9A77C",
    primary: "#C9A77C",
    secondary: "#AFCCE1",
    accent: "#F5DED0",
    warm: "#FFFFFF",
    peach: "#F5E6DC",
    emergency: "#E85D5D",
    success: "#9FD8CB",
    border: "#EFEFEF",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F8F8F8",
    backgroundTertiary: "#F5F5F5",
    cardBlue: "#E8F4FA",
    cardPeach: "#FDF3ED",
    cardGreen: "#EDF7F4",
    softBlue: "#5B9BD5",
  },
  dark: {
    text: "#F5F5F5",
    textSecondary: "#A0A0A0",
    buttonText: "#FFFFFF",
    tabIconDefault: "#666666",
    tabIconSelected: "#F5F5F5",
    link: "#D4B896",
    primary: "#D4B896",
    secondary: "#AFCCE1",
    accent: "#F5DED0",
    warm: "#2A2520",
    peach: "#3D3530",
    emergency: "#E85D5D",
    success: "#9FD8CB",
    border: "#333333",
    backgroundRoot: "#1A1A1A",
    backgroundDefault: "#222222",
    backgroundSecondary: "#2A2A2A",
    backgroundTertiary: "#333333",
    cardBlue: "#1E2A30",
    cardPeach: "#2A2420",
    cardGreen: "#1E2A25",
    softBlue: "#5B9BD5",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
  inputHeight: 52,
  buttonHeight: 56,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "400" as const,
    fontFamily: "PlayfairDisplay_400Regular",
  },
  h2: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "400" as const,
    fontFamily: "PlayfairDisplay_400Regular",
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "400" as const,
    fontFamily: "PlayfairDisplay_400Regular",
  },
  h4: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "500" as const,
    fontFamily: "PlusJakartaSans_500Medium",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400" as const,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400" as const,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  link: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500" as const,
    fontFamily: "PlusJakartaSans_500Medium",
  },
};

export const Shadows = {
  small: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  medium: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  large: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "PlusJakartaSans_400Regular",
    serif: "PlayfairDisplay_400Regular",
  },
  default: {
    sans: "PlusJakartaSans_400Regular",
    serif: "PlayfairDisplay_400Regular",
  },
  web: {
    sans: "PlusJakartaSans_400Regular, system-ui, sans-serif",
    serif: "PlayfairDisplay_400Regular, Georgia, serif",
  },
});
