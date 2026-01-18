import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#343232",
    textSecondary: "#7A7878",
    buttonText: "#FFFFFF",
    tabIconDefault: "#B3B3B4",
    tabIconSelected: "#9B65AA",
    link: "#9B65AA",
    primary: "#9B65AA",
    secondary: "#AFCCE1",
    accent: "#DA914A",
    warm: "#DCC3BB",
    emergency: "#E85D5D",
    success: "#7BB89E",
    border: "#E5E3E2",
    backgroundRoot: "#F2F1F0",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F8F7F6",
    backgroundTertiary: "#EDECEB",
  },
  dark: {
    text: "#F2F1F0",
    textSecondary: "#B3B3B4",
    buttonText: "#FFFFFF",
    tabIconDefault: "#7A7878",
    tabIconSelected: "#B98AC4",
    link: "#B98AC4",
    primary: "#B98AC4",
    secondary: "#AFCCE1",
    accent: "#DA914A",
    warm: "#DCC3BB",
    emergency: "#E85D5D",
    success: "#7BB89E",
    border: "#3D3B3B",
    backgroundRoot: "#1A1919",
    backgroundDefault: "#252323",
    backgroundSecondary: "#2F2D2D",
    backgroundTertiary: "#3A3838",
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
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "600" as const,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600" as const,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  h4: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600" as const,
    fontFamily: "PlusJakartaSans_600SemiBold",
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
    shadowColor: "#343232",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: "#343232",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  large: {
    shadowColor: "#343232",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "PlusJakartaSans_400Regular",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "PlusJakartaSans_400Regular",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "PlusJakartaSans_400Regular, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
