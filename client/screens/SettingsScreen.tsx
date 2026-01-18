import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Platform,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [notifications, setNotifications] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [moodCheckins, setMoodCheckins] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setter(value);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing["3xl"],
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Notifications
        </ThemedText>
        <Card style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.light.primary + "20" }]}>
                <Feather name="bell" size={18} color={Colors.light.primary} />
              </View>
              <View>
                <ThemedText type="body">Push Notifications</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Receive updates and reminders
                </ThemedText>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={(val) => handleToggle(setNotifications, val)}
              trackColor={{ false: theme.border, true: Colors.light.primary }}
              thumbColor="#FFF"
            />
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.light.secondary + "20" }]}>
                <Feather name="clock" size={18} color={Colors.light.secondary} />
              </View>
              <View>
                <ThemedText type="body">Daily Reminders</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Hydration, medication, sleep
                </ThemedText>
              </View>
            </View>
            <Switch
              value={dailyReminders}
              onValueChange={(val) => handleToggle(setDailyReminders, val)}
              trackColor={{ false: theme.border, true: Colors.light.primary }}
              thumbColor="#FFF"
            />
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.light.accent + "20" }]}>
                <Feather name="smile" size={18} color={Colors.light.accent} />
              </View>
              <View>
                <ThemedText type="body">Mood Check-ins</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  How are you feeling?
                </ThemedText>
              </View>
            </View>
            <Switch
              value={moodCheckins}
              onValueChange={(val) => handleToggle(setMoodCheckins, val)}
              trackColor={{ false: theme.border, true: Colors.light.primary }}
              thumbColor="#FFF"
            />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Appearance
        </ThemedText>
        <Card style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.light.primary + "20" }]}>
                <Feather name="moon" size={18} color={Colors.light.primary} />
              </View>
              <View>
                <ThemedText type="body">Dark Mode</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Easier on the eyes at night
                </ThemedText>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={(val) => handleToggle(setDarkMode, val)}
              trackColor={{ false: theme.border, true: Colors.light.primary }}
              thumbColor="#FFF"
            />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Privacy & Security
        </ThemedText>
        <Card style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <Pressable style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.light.secondary + "20" }]}>
                <Feather name="lock" size={18} color={Colors.light.secondary} />
              </View>
              <View>
                <ThemedText type="body">Change Journal PIN</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Update your journal security
                </ThemedText>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Pressable style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.light.accent + "20" }]}>
                <Feather name="shield" size={18} color={Colors.light.accent} />
              </View>
              <View>
                <ThemedText type="body">Privacy Policy</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  How we protect your data
                </ThemedText>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Pressable style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.light.success + "20" }]}>
                <Feather name="file-text" size={18} color={Colors.light.success} />
              </View>
              <View>
                <ThemedText type="body">Terms of Service</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Our service agreement
                </ThemedText>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Emergency Support
        </ThemedText>
        <Card style={[styles.card, { backgroundColor: Colors.light.emergency + "10" }]}>
          <Pressable 
            style={styles.settingRow}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
              Linking.openURL("tel:988");
            }}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.light.emergency }]}>
                <Feather name="phone-call" size={18} color="#FFF" />
              </View>
              <View>
                <ThemedText type="body" style={{ fontWeight: "600" }}>Crisis Helpline</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Call 988 - Available 24/7
                </ThemedText>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.light.emergency} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: Colors.light.emergency + "20" }]} />
          <Pressable 
            style={styles.settingRow}
            onPress={() => Linking.openURL("sms:741741?body=HOME")}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.light.emergency + "20" }]}>
                <Feather name="message-square" size={18} color={Colors.light.emergency} />
              </View>
              <View>
                <ThemedText type="body">Text Crisis Line</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Text HOME to 741741
                </ThemedText>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Support
        </ThemedText>
        <Card style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <Pressable style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.light.primary + "20" }]}>
                <Feather name="help-circle" size={18} color={Colors.light.primary} />
              </View>
              <View>
                <ThemedText type="body">Help Center</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  FAQs and guides
                </ThemedText>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Pressable style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.light.secondary + "20" }]}>
                <Feather name="message-circle" size={18} color={Colors.light.secondary} />
              </View>
              <View>
                <ThemedText type="body">Contact Support</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Get help from our team
                </ThemedText>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Pressable style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.light.accent + "20" }]}>
                <Feather name="star" size={18} color={Colors.light.accent} />
              </View>
              <View>
                <ThemedText type="body">Rate the App</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Share your feedback
                </ThemedText>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Account
        </ThemedText>
        <Card style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <Pressable style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.light.primary + "20" }]}>
                <Feather name="user" size={18} color={Colors.light.primary} />
              </View>
              <View>
                <ThemedText type="body">Edit Profile</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Update your information
                </ThemedText>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Pressable style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.light.emergency + "20" }]}>
                <Feather name="log-out" size={18} color={Colors.light.emergency} />
              </View>
              <View>
                <ThemedText type="body" style={{ color: Colors.light.emergency }}>
                  Sign Out
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Log out of your account
                </ThemedText>
              </View>
            </View>
          </Pressable>
        </Card>
      </View>

      <View style={styles.footer}>
        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
          Heal Here v1.0.0
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
          Made with care for your wellbeing
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    gap: Spacing.xs,
  },
});
