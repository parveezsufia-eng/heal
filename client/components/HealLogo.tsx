import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Svg, { Path, G, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { ThemedText } from "./ThemedText";
import { Colors, Spacing } from "@/constants/theme";

interface HealLogoProps {
    size?: number;
    showTagline?: boolean;
    color?: string;
    style?: ViewStyle;
}

export function HealLogo({
    size = 40,
    showTagline = false,
    color = Colors.light.primary,
    style
}: HealLogoProps) {
    const scale = size / 100;

    return (
        <View style={[styles.container, style]}>
            <Svg width={size} height={size} viewBox="0 0 100 100">
                <Defs>
                    <LinearGradient id="lotusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
                        <Stop offset="100%" stopColor={color} stopOpacity="1" />
                    </LinearGradient>
                </Defs>
                <G transform="translate(50, 50)">
                    {/* Minimalist Lotus Petals */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                        <Path
                            key={angle}
                            d="M 0,0 C 15,-15 15,-35 0,-45 C -15,-35 -15,-15 0,0"
                            fill="url(#lotusGradient)"
                            transform={`rotate(${angle})`}
                            opacity={0.8 + (i % 2) * 0.2}
                        />
                    ))}
                    {/* Inner core - symbol of peace */}
                    <Circle cx="0" cy="0" r="8" fill="#FFF" opacity={0.6} />
                    <Circle cx="0" cy="0" r="4" fill={color} />
                </G>
            </Svg>

            {showTagline && (
                <View style={styles.taglineGrid}>
                    <ThemedText style={styles.brandName}>HEAL</ThemedText>
                    <ThemedText style={styles.tagline}>Your Journey to Inner Peace</ThemedText>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
    taglineGrid: {
        alignItems: "center",
        marginTop: Spacing.md,
    },
    brandName: {
        fontSize: 28,
        letterSpacing: 8,
        fontFamily: "PlusJakartaSans_800ExtraBold",
        color: Colors.light.text,
        marginBottom: 4,
    },
    tagline: {
        fontSize: 12,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        color: Colors.light.primary,
        fontFamily: "PlusJakartaSans_600SemiBold",
        opacity: 0.7,
    },
});
