import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Path, G } from "react-native-svg";
import { Colors } from "@/constants/theme";

interface SunflowerLogoProps {
    size?: number;
    showTagline?: boolean;
}

export function SunflowerLogo({ size = 40, showTagline = false }: SunflowerLogoProps) {
    const petalsColor = "#FFD700"; // Golden yellow
    const centerColor = "#5D4037"; // Soft brown

    return (
        <View style={styles.container}>
            <Svg width={size} height={size} viewBox="0 0 100 100">
                <G transform="translate(50, 50)">
                    {/* Stylized minimalist petals */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                        <Path
                            key={angle}
                            d="M 0,-15 C 10,-30 10,-45 0,-50 C -10,-45 -10,-30 0,-15"
                            fill={petalsColor}
                            transform={`rotate(${angle})`}
                        />
                    ))}
                    {/* Center of the sunflower */}
                    <Circle cx="0" cy="0" r="15" fill={centerColor} />
                    {/* Small minimalist seeds/texture */}
                    <Circle cx="-4" cy="-4" r="1.5" fill="#FFFFFF40" />
                    <Circle cx="4" cy="4" r="1.5" fill="#FFFFFF40" />
                    <Circle cx="4" cy="-4" r="1.5" fill="#FFFFFF40" />
                    <Circle cx="-4" cy="4" r="1.5" fill="#FFFFFF40" />
                </G>
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
});
