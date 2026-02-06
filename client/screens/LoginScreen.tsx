import React, { useState } from "react";
import {
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { SunflowerLogo } from "@/components/SunflowerLogo";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";

export default function LoginScreen() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { loginMutation } = useAuth();
    const navigation = useNavigation<any>();

    const handleLogin = async () => {
        if (!username || !password) return;
        try {
            await loginMutation.mutateAsync({ username, password });
        } catch (error) {
            // Error is handled by mutation state
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <SunflowerLogo size={80} />
                    <ThemedText type="h1" style={styles.title}>
                        Welcome Back
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Continue your journey to light
                    </ThemedText>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Username</ThemedText>
                        <View style={styles.inputWrapper}>
                            <Feather name="user" size={20} color={Colors.light.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your username"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Password</ThemedText>
                        <View style={styles.inputWrapper}>
                            <Feather name="lock" size={20} color={Colors.light.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    {loginMutation.isError && (
                        <ThemedText style={styles.errorText}>
                            {loginMutation.error?.message}
                        </ThemedText>
                    )}

                    <TouchableOpacity
                        style={[styles.button, loginMutation.isPending && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loginMutation.isPending}
                    >
                        {loginMutation.isPending ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <ThemedText style={styles.buttonText}>Sign In</ThemedText>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <ThemedText>Don't have an account? </ThemedText>
                        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                            <ThemedText style={styles.linkText}>Sign Up</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scrollContainer: {
        flexGrow: 1,
        padding: Spacing.xl,
        justifyContent: "center",
    },
    header: {
        alignItems: "center",
        marginBottom: Spacing["2xl"],
    },
    title: {
        marginTop: Spacing.lg,
        color: Colors.light.text,
        textAlign: "center",
    },
    subtitle: {
        marginTop: Spacing.xs,
        color: Colors.light.primary,
        opacity: 0.8,
    },
    form: {
        width: "100%",
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: 14,
        fontFamily: "PlusJakartaSans_600SemiBold",
        marginBottom: Spacing.xs,
        color: Colors.light.text,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        height: 56,
        borderWidth: 1,
        borderColor: "#E9ECEF",
    },
    inputIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontFamily: "PlusJakartaSans_400Regular",
        color: Colors.light.text,
    },
    button: {
        backgroundColor: Colors.light.primary,
        height: 56,
        borderRadius: BorderRadius.lg,
        justifyContent: "center",
        alignItems: "center",
        marginTop: Spacing.xl,
        ...Shadows.medium,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontFamily: "PlusJakartaSans_700Bold",
    },
    errorText: {
        color: "#E63946",
        fontSize: 14,
        textAlign: "center",
        marginBottom: Spacing.md,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: Spacing.xl,
    },
    linkText: {
        color: Colors.light.primary,
        fontFamily: "PlusJakartaSans_700Bold",
    },
});
