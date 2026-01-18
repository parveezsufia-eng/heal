import React, { useState } from "react";
import { View, StyleSheet, Pressable, Linking, Modal, TextInput, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.5,
  stiffness: 150,
};

export function FloatingButtons() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; message: string }[]>([
    { role: "ai", message: "Hello! I'm here to support you. How are you feeling today?" },
  ]);

  const emergencyScale = useSharedValue(1);
  const chatScale = useSharedValue(1);

  const emergencyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emergencyScale.value }],
  }));

  const chatAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: chatScale.value }],
  }));

  const handleEmergencyPress = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    setShowEmergencyModal(true);
  };

  const handleChatPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowChatModal(true);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    setChatHistory((prev) => [...prev, { role: "user", message: chatMessage }]);
    const userMessage = chatMessage;
    setChatMessage("");

    setTimeout(() => {
      const responses = [
        "I understand how you're feeling. Remember, it's okay to take things one step at a time.",
        "Thank you for sharing that with me. Your feelings are valid.",
        "I'm here for you. Would you like to try a breathing exercise?",
        "That sounds challenging. Remember to be kind to yourself.",
        "It takes courage to express your feelings. I'm proud of you.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setChatHistory((prev) => [...prev, { role: "ai", message: randomResponse }]);
    }, 1000);
  };

  const callHelpline = () => {
    Linking.openURL("tel:988");
  };

  return (
    <>
      <View style={[styles.container, { bottom: insets.bottom + 100 }]}>
        <AnimatedPressable
          style={[
            styles.emergencyButton,
            { backgroundColor: Colors.light.emergency },
            Shadows.medium,
            emergencyAnimatedStyle,
          ]}
          onPress={handleEmergencyPress}
          onPressIn={() => {
            emergencyScale.value = withSpring(0.9, springConfig);
          }}
          onPressOut={() => {
            emergencyScale.value = withSpring(1, springConfig);
          }}
        >
          <Feather name="phone" size={20} color="#FFF" />
        </AnimatedPressable>

        <AnimatedPressable
          style={[
            styles.chatButton,
            { backgroundColor: Colors.light.primary },
            Shadows.medium,
            chatAnimatedStyle,
          ]}
          onPress={handleChatPress}
          onPressIn={() => {
            chatScale.value = withSpring(0.9, springConfig);
          }}
          onPressOut={() => {
            chatScale.value = withSpring(1, springConfig);
          }}
        >
          <Feather name="message-circle" size={24} color="#FFF" />
        </AnimatedPressable>
      </View>

      <Modal
        visible={showEmergencyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmergencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.emergencyModalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.emergencyHeader}>
              <View style={[styles.emergencyIconContainer, { backgroundColor: Colors.light.emergency + "20" }]}>
                <Feather name="alert-circle" size={32} color={Colors.light.emergency} />
              </View>
              <ThemedText type="h2" style={styles.emergencyTitle}>
                Emergency Support
              </ThemedText>
              <ThemedText type="body" style={[styles.emergencySubtitle, { color: theme.textSecondary }]}>
                You're not alone. Help is available.
              </ThemedText>
            </View>

            <Pressable
              style={[styles.helplineButton, { backgroundColor: Colors.light.emergency }]}
              onPress={callHelpline}
            >
              <Feather name="phone-call" size={20} color="#FFF" />
              <ThemedText style={styles.helplineText}>Call 988 Suicide & Crisis Lifeline</ThemedText>
            </Pressable>

            <View style={styles.emergencyOptions}>
              <Pressable style={[styles.emergencyOption, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name="message-square" size={20} color={Colors.light.primary} />
                <ThemedText type="small">Text HOME to 741741</ThemedText>
              </Pressable>
              <Pressable style={[styles.emergencyOption, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name="globe" size={20} color={Colors.light.primary} />
                <ThemedText type="small">International Resources</ThemedText>
              </Pressable>
            </View>

            <Pressable
              style={[styles.closeButton, { borderColor: theme.border }]}
              onPress={() => setShowEmergencyModal(false)}
            >
              <ThemedText>Close</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showChatModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChatModal(false)}
      >
        <View style={styles.chatModalContainer}>
          <View style={[styles.chatModalContent, { backgroundColor: theme.backgroundRoot }]}>
            <View style={[styles.chatHeader, { backgroundColor: Colors.light.primary }]}>
              <View style={styles.chatHeaderLeft}>
                <View style={styles.chatAvatar}>
                  <Feather name="heart" size={20} color={Colors.light.primary} />
                </View>
                <View>
                  <ThemedText style={styles.chatHeaderTitle}>Heal Here Assistant</ThemedText>
                  <ThemedText style={styles.chatHeaderSubtitle}>Always here for you</ThemedText>
                </View>
              </View>
              <Pressable onPress={() => setShowChatModal(false)}>
                <Feather name="x" size={24} color="#FFF" />
              </Pressable>
            </View>

            <View style={styles.chatMessages}>
              {chatHistory.map((chat, index) => (
                <View
                  key={index}
                  style={[
                    styles.chatBubble,
                    chat.role === "user"
                      ? [styles.userBubble, { backgroundColor: Colors.light.primary }]
                      : [styles.aiBubble, { backgroundColor: theme.backgroundDefault }],
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.chatBubbleText,
                      chat.role === "user" && { color: "#FFF" },
                    ]}
                  >
                    {chat.message}
                  </ThemedText>
                </View>
              ))}
            </View>

            <View style={[styles.chatInputContainer, { backgroundColor: theme.backgroundDefault }]}>
              <TextInput
                style={[styles.chatInput, { color: theme.text }]}
                placeholder="Type your message..."
                placeholderTextColor={theme.textSecondary}
                value={chatMessage}
                onChangeText={setChatMessage}
                onSubmitEditing={handleSendMessage}
              />
              <Pressable
                style={[styles.sendButton, { backgroundColor: Colors.light.primary }]}
                onPress={handleSendMessage}
              >
                <Feather name="send" size={18} color="#FFF" />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: Spacing.lg,
    gap: Spacing.md,
    zIndex: 1000,
  },
  emergencyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  chatButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  emergencyModalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: BorderRadius.xl,
    padding: Spacing["2xl"],
  },
  emergencyHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  emergencyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  emergencyTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emergencySubtitle: {
    textAlign: "center",
  },
  helplineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  helplineText: {
    color: "#FFF",
    fontWeight: "600",
  },
  emergencyOptions: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  emergencyOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  closeButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  chatModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  chatModalContent: {
    height: "85%",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  chatHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  chatHeaderTitle: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  chatHeaderSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  chatMessages: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  chatBubble: {
    maxWidth: "80%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: Spacing.xs,
  },
  aiBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: Spacing.xs,
  },
  chatBubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  chatInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: Spacing.lg,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.05)",
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
