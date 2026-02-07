import React, { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { SunflowerLogo } from "@/components/SunflowerLogo";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";

export default function EditProfileScreen() {
    const { user, updateProfileMutation } = useAuth();
    const navigation = useNavigation();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        age: "",
        sex: "",
        medicalHistory: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
                age: user.age?.toString() || "",
                sex: user.sex || "",
                medicalHistory: user.medicalHistory || "",
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!formData.name || !formData.email) {
            Alert.alert("Error", "Name and Email are required.");
            return;
        }

        try {
            await updateProfileMutation.mutateAsync({
                ...formData,
                age: formData.age ? parseInt(formData.age) : undefined,
            } as any);
            Alert.alert("Success", "Profile updated successfully!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update profile.");
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
                    <SunflowerLogo size={50} />
                    <ThemedText type="h2" style={styles.title}>
                        Edit Profile
                    </ThemedText>
                </View>

                <View style={styles.form}>
                    <InputField
                        label="Full Name"
                        icon="user"
                        placeholder="Your name"
                        value={formData.name}
                        onChangeText={(v: string) => updateField("name", v)}
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
                        label="Phone Number"
                        icon="phone"
                        placeholder="Optional"
                        value={formData.phoneNumber}
                        onChangeText={(v: string) => updateField("phoneNumber", v)}
                        keyboardType="phone-pad"
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <InputField
                                label="Age"
                                icon="calendar"
                                placeholder="Years"
                                value={formData.age}
                                onChangeText={(v: string) => updateField("age", v)}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={{ width: Spacing.md }} />
                        <View style={{ flex: 1 }}>
                            <InputField
                                label="Sex"
                                icon="users"
                                placeholder="e.g. Female"
                                value={formData.sex}
                                onChangeText={(v: string) => updateField("sex", v)}
                            />
                        </View>
                    </View>

                    <InputField
                        label="Medical History"
                        icon="file-text"
                        placeholder="Any conditions or concerns..."
                        value={formData.medicalHistory}
                        onChangeText={(v: string) => updateField("medicalHistory", v)}
                        multiline
                        numberOfLines={4}
                    />

                    <TouchableOpacity
                        style={[styles.saveButton, Shadows.small]}
                        onPress={handleSave}
                        disabled={updateProfileMutation.isPending}
                    >
                        {updateProfileMutation.isPending ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                    >
                        <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function InputField({ label, icon, ...props }: any) {
    return (
        <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>{label}</ThemedText>
            <View style={styles.inputWrapper}>
                <Feather name={icon} size={18} color={Colors.light.primary} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholderTextColor={Colors.light.textSecondary}
                    {...props}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.backgroundRoot,
    },
    scrollContainer: {
        padding: Spacing.xl,
        paddingTop: Platform.OS === "ios" ? 60 : 40,
    },
    header: {
        alignItems: "center",
        marginBottom: Spacing["2xl"],
    },
    title: {
        marginTop: Spacing.md,
        color: Colors.light.text,
    },
    form: {
        gap: Spacing.lg,
    },
    inputContainer: {
        gap: Spacing.xs,
    },
    label: {
        fontSize: 14,
        fontFamily: "PlusJakartaSans_600SemiBold",
        color: Colors.light.textSecondary,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.light.backgroundDefault,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.light.border,
        paddingHorizontal: Spacing.md,
    },
    inputIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: Spacing.md,
        fontSize: 16,
        fontFamily: "PlusJakartaSans_400Regular",
        color: Colors.light.text,
    },
    row: {
        flexDirection: "row",
    },
    saveButton: {
        backgroundColor: Colors.light.primary,
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: "center",
        marginTop: Spacing.md,
    },
    saveButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontFamily: "PlusJakartaSans_600SemiBold",
    },
    cancelButton: {
        paddingVertical: Spacing.md,
        alignItems: "center",
    },
    cancelButtonText: {
        color: Colors.light.textSecondary,
        fontSize: 14,
        fontFamily: "PlusJakartaSans_500Medium",
    },
});
