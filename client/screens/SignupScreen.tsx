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
import { HealLogo } from "@/components/HealLogo";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";

export default function SignupScreen() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        email: "",
        phoneNumber: "",
        name: "",
        age: "",
        sex: "",
        medicalHistory: "",
    });

    const { registerMutation } = useAuth();
    const navigation = useNavigation<any>();

    const handleSignup = async () => {
        const { username, password, email, name } = formData;
        if (!username || !password || !email || !name) return;

        try {
            await registerMutation.mutateAsync({
                ...formData,
                age: formData.age ? parseInt(formData.age) : undefined,
            } as any);
        } catch (error) {
            // Error is handled by mutation state
        }
    };

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <HealLogo size={80} />
                    <ThemedText type="h2" style={styles.title}>
                        Create your account
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Begin your journey to inner peace
                    </ThemedText>
                </View>

                <View style={styles.form}>
                    {/* Account Details Section */}
                    <ThemedText style={styles.sectionTitle}>Account Details</ThemedText>

                    <InputField
                        label="Username"
                        icon="user"
                        placeholder="Choose a username"
                        value={formData.username}
                        onChangeText={(v: string) => updateField("username", v)}
                        autoCapitalize="none"
                    />

                    <InputField
                        label="Email"
                        icon="mail"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChangeText={(v: string) => updateField("email", v)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <InputField
                        label="Password"
                        icon="lock"
                        placeholder="Min. 8 characters"
                        value={formData.password}
                        onChangeText={(v: string) => updateField("password", v)}
                        secureTextEntry
                    />

                    {/* Personal Information Section */}
                    <ThemedText style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Personal Information</ThemedText>

                    <InputField
                        label="Full Name"
                        icon="edit-3"
                        placeholder="How should we call you?"
                        value={formData.name}
                        onChangeText={(v: string) => updateField("name", v)}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: Spacing.sm }}>
                            <InputField
                                label="Age"
                                icon="calendar"
                                placeholder="Years"
                                value={formData.age}
                                onChangeText={(v: string) => updateField("age", v)}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                            <InputField
                                label="Sex"
                                icon="smile"
                                placeholder="e.g. Female"
                                value={formData.sex}
                                onChangeText={(v: string) => updateField("sex", v)}
                            />
                        </View>
                    </View>

                    <InputField
                        label="Phone Number"
                        icon="phone"
                        placeholder="+1 234 567 890"
                        value={formData.phoneNumber}
                        onChangeText={(v: string) => updateField("phoneNumber", v)}
                        keyboardType="phone-pad"
                    />

                    {/* Medical Profile Section */}
                    <ThemedText style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Medical Profile</ThemedText>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Medical History (Optional)</ThemedText>
                        <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Any relevant medical history to help our AI personalize your support..."
                                value={formData.medicalHistory}
                                onChangeText={(v: string) => updateField("medicalHistory", v)}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {registerMutation.isError && (
                        <ThemedText style={styles.errorText}>
                            {registerMutation.error?.message}
                        </ThemedText>
                    )}

                    <TouchableOpacity
                        style={[styles.button, registerMutation.isPending && styles.buttonDisabled]}
                        onPress={handleSignup}
                        disabled={registerMutation.isPending}
                    >
                        {registerMutation.isPending ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <ThemedText style={styles.buttonText}>Start My Journey</ThemedText>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <ThemedText>Already have an account? </ThemedText>
                        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                            <ThemedText style={styles.linkText}>Sign In</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function InputField({ label, icon, ...props }: any) {
    return (
        <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>{label}</ThemedText>
            <View style={styles.inputWrapper}>
                <Feather name={icon} size={18} color={Colors.light.primary} style={styles.inputIcon} />
                <TextInput style={styles.input} {...props} />
            </View>
        </View>
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
        paddingBottom: Spacing["2xl"],
    },
    header: {
        alignItems: "center",
        marginBottom: Spacing.xl,
        paddingTop: Spacing.xl,
    },
    title: {
        marginTop: Spacing.md,
        color: Colors.light.text,
        textAlign: "center",
    },
    subtitle: {
        marginTop: Spacing.xs,
        color: Colors.light.primary,
        opacity: 0.8,
        textAlign: "center",
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: "PlusJakartaSans_700Bold",
        color: Colors.light.primary,
        marginBottom: Spacing.md,
        opacity: 0.9,
    },
    form: {
        width: "100%",
    },
    inputGroup: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: 13,
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
        height: 52,
        borderWidth: 1,
        borderColor: "#E9ECEF",
    },
    textAreaWrapper: {
        height: 120,
        alignItems: "flex-start",
        paddingVertical: Spacing.sm,
    },
    inputIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontFamily: "PlusJakartaSans_400Regular",
        color: Colors.light.text,
    },
    textArea: {
        height: "100%",
    },
    row: {
        flexDirection: "row",
        width: "100%",
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
        marginTop: Spacing.md,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    linkText: {
        color: Colors.light.primary,
        fontFamily: "PlusJakartaSans_700Bold",
    },
});
