import React, { useState } from "react";
import { View, StyleSheet, Pressable, Linking, Modal, TextInput, Platform, ScrollView } from "react-native";
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
    { role: "ai", message: "Hi there! I'm here to support you. How are you feeling today?" },
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
        "I understand. It's completely valid to feel that way. Would you like to talk more about it?",
        "Thank you for sharing. Remember, every step you take towards wellness matters.",
        "I'm here to listen. Take your time, there's no rush.",
        "That sounds challenging. Would you like me to suggest some calming techniques?",
        "Your feelings are important. Let's work through this together.",
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
          testID="button-emergency"
          accessibilityLabel="Emergency button"
          style={[
            styles.emergencyButton,
            { backgroundColor: Colors.light.emergency },
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
          <Feather name="phone" size={16} color="#FFF" />
        </AnimatedPressable>

        <AnimatedPressable
          testID="button-chat"
          accessibilityLabel="AI Chat button"
          style={[
            styles.chatButton,
            { backgroundColor: Colors.light.text, borderColor: theme.border },
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
          <Feather name="message-circle" size={22} color="#FFF" />
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
              <View style={[styles.emergencyIconContainer, { backgroundColor: Colors.light.emergency + "15" }]}>
                <Feather name="heart" size={32} color={Colors.light.emergency} />
              </View>
              <ThemedText type="h2" style={styles.emergencyTitle}>
                You're Not Alone
              </ThemedText>
              <ThemedText type="body" style={[styles.emergencySubtitle, { color: theme.textSecondary }]}>
                Help is available 24/7. Reach out now.
              </ThemedText>
            </View>

            <Pressable
              style={[styles.helplineButton, { backgroundColor: Colors.light.emergency }]}
              onPress={callHelpline}
            >
              <Feather name="phone-call" size={20} color="#FFF" />
              <ThemedText style={styles.helplineText}>Call 988 Crisis Lifeline</ThemedText>
            </Pressable>

            <View style={styles.emergencyOptions}>
              <Pressable style={[styles.emergencyOption, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name="message-square" size={18} color={Colors.light.primary} />
                <ThemedText type="small">Text HOME to 741741</ThemedText>
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
            <View style={[styles.chatHeader, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
              <View style={styles.chatHeaderLeft}>
                <View style={[styles.chatAvatar, { backgroundColor: Colors.light.cardPeach }]}>
                  <Feather name="heart" size={18} color={Colors.light.primary} />
                </View>
                <View>
                  <ThemedText style={styles.chatHeaderTitle}>AI Companion</ThemedText>
                  <ThemedText style={[styles.chatHeaderSubtitle, { color: theme.textSecondary }]}>
                    Always here for you
                  </ThemedText>
                </View>
              </View>
              <Pressable onPress={() => setShowChatModal(false)} style={styles.chatCloseButton}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.chatMessages} contentContainerStyle={styles.chatMessagesContent}>
              {chatHistory.map((chat, index) => (
                <View
                  key={index}
                  style={[
                    styles.chatBubble,
                    chat.role === "user"
                      ? [styles.userBubble, { backgroundColor: Colors.light.text }]
                      : [styles.aiBubble, { backgroundColor: Colors.light.cardPeach }],
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.chatBubbleText,
                      { color: chat.role === "user" ? "#FFF" : theme.text },
                    ]}
                  >
                    {chat.message}
                  </ThemedText>
                </View>
              ))}
            </ScrollView>

            <View style={[styles.chatInputContainer, { backgroundColor: theme.backgroundDefault, borderTopColor: theme.border }]}>
              <TextInput
                style={[styles.chatInput, { color: theme.text, backgroundColor: theme.backgroundSecondary }]}
                placeholder="Type your message..."
                placeholderTextColor={theme.textSecondary}
                value={chatMessage}
                onChangeText={setChatMessage}
                onSubmitEditing={handleSendMessage}
              />
              <Pressable
                style={[styles.sendButton, { backgroundColor: Colors.light.text }]}
                onPress={handleSendMessage}
              >
                <Feather name="send" size={16} color="#FFF" />
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
    right: Spacing.xl,
    gap: Spacing.sm,
    zIndex: 1000,
  },
  emergencyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  chatButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
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
    width: 72,
    height: 72,
    borderRadius: 36,
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
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  helplineText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
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
    borderRadius: BorderRadius.lg,
  },
  chatModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  chatModalContent: {
    height: "90%",
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
    borderBottomWidth: 1,
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
    alignItems: "center",
    justifyContent: "center",
  },
  chatHeaderTitle: {
    fontWeight: "600",
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  chatHeaderSubtitle: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  chatCloseButton: {
    padding: Spacing.xs,
  },
  chatMessages: {
    flex: 1,
  },
  chatMessagesContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  chatBubble: {
    maxWidth: "80%",
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
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
    fontFamily: "PlusJakartaSans_400Regular",
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
  },
  chatInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    fontSize: 15,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
