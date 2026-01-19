import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

const moods = [
  { id: "happy", icon: "smile", label: "Happy" },
  { id: "calm", icon: "coffee", label: "Calm" },
  { id: "neutral", icon: "meh", label: "Okay" },
  { id: "sad", icon: "frown", label: "Sad" },
  { id: "anxious", icon: "alert-circle", label: "Anxious" },
];

const goalCards = [
  {
    id: "breathing",
    title: "Breathing",
    sessions: "7 sessions",
    duration: "8-10 Minutes",
    image: require("../assets/images/line_art_breathing_faces_illustration.png"),
    bgColor: Colors.light.cardBlue,
  },
  {
    id: "meditation",
    title: "Meditation",
    sessions: "5 sessions",
    duration: "10-15 Minutes",
    image: require("../assets/images/line_art_supportive_hands_illustration.png"),
    bgColor: Colors.light.cardPeach,
  },
];

const dailyTasks = [
  { id: "1", text: "Morning meditation", completed: true, time: "8:00 AM" },
  { id: "2", text: "Breathing exercise", completed: false, time: "12:00 PM" },
  { id: "3", text: "Evening journaling", completed: false, time: "8:00 PM" },
];

const dailyHabits = [
  { id: "1", name: "Meditation", icon: "sun", completed: true, streak: 7 },
  { id: "2", name: "Exercise", icon: "activity", completed: false, streak: 5 },
  { id: "3", name: "Read", icon: "book", completed: true, streak: 12 },
  { id: "4", name: "Water", icon: "droplet", completed: false, streak: 3 },
];

const mentalHealthConditions = [
  { id: "anxiety", label: "Anxiety", icon: "activity" },
  { id: "depression", label: "Depression", icon: "cloud-rain" },
  { id: "stress", label: "Stress", icon: "zap" },
  { id: "insomnia", label: "Insomnia", icon: "moon" },
  { id: "fatigue", label: "Fatigue", icon: "battery" },
];

interface MealEntry {
  id: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  calories: number;
  time: string;
  completed: boolean;
  prescribedBy?: string;
}

const initialMealPlan: MealEntry[] = [
  { id: "1", mealType: "breakfast", name: "Oatmeal with Berries", calories: 320, time: "8:00 AM", completed: false, prescribedBy: "Dr. Smith" },
  { id: "2", mealType: "snack", name: "Greek Yogurt & Almonds", calories: 180, time: "10:30 AM", completed: false, prescribedBy: "Dr. Smith" },
  { id: "3", mealType: "lunch", name: "Grilled Salmon Salad", calories: 450, time: "1:00 PM", completed: false, prescribedBy: "Dr. Smith" },
  { id: "4", mealType: "snack", name: "Apple & Peanut Butter", calories: 200, time: "4:00 PM", completed: false },
  { id: "5", mealType: "dinner", name: "Quinoa Buddha Bowl", calories: 520, time: "7:00 PM", completed: false, prescribedBy: "Dr. Smith" },
];

const mealTypeIcons: Record<string, string> = {
  breakfast: "sunrise",
  lunch: "sun",
  dinner: "moon",
  snack: "coffee",
};

const mealTypeColors: Record<string, string> = {
  breakfast: Colors.light.cardPeach,
  lunch: Colors.light.cardBlue,
  dinner: Colors.light.cardGreen,
  snack: Colors.light.secondary + "20",
};

const dietRecipes: Record<string, Array<{ id: string; name: string; benefit: string; ingredients: string; time: string; color: string }>> = {
  anxiety: [
    { id: "1", name: "Chamomile Oatmeal Bowl", benefit: "Calms nervous system", ingredients: "Oats, chamomile, honey, almonds", time: "15 min", color: Colors.light.cardPeach },
    { id: "2", name: "Salmon Avocado Salad", benefit: "Omega-3 for brain health", ingredients: "Salmon, avocado, spinach, lemon", time: "20 min", color: Colors.light.cardBlue },
    { id: "3", name: "Banana Walnut Smoothie", benefit: "Magnesium & B vitamins", ingredients: "Banana, walnuts, yogurt, honey", time: "5 min", color: Colors.light.cardGreen },
  ],
  depression: [
    { id: "1", name: "Dark Chocolate Berry Bowl", benefit: "Boosts serotonin", ingredients: "Dark chocolate, berries, granola", time: "10 min", color: Colors.light.cardPeach },
    { id: "2", name: "Turkey Quinoa Bowl", benefit: "Tryptophan for mood", ingredients: "Turkey, quinoa, vegetables", time: "25 min", color: Colors.light.cardBlue },
    { id: "3", name: "Spinach Egg Scramble", benefit: "Folate & protein", ingredients: "Eggs, spinach, tomatoes, feta", time: "12 min", color: Colors.light.cardGreen },
  ],
  stress: [
    { id: "1", name: "Green Tea Matcha Latte", benefit: "L-theanine relaxation", ingredients: "Matcha, almond milk, honey", time: "5 min", color: Colors.light.cardGreen },
    { id: "2", name: "Blueberry Yogurt Parfait", benefit: "Antioxidants & probiotics", ingredients: "Yogurt, blueberries, granola", time: "8 min", color: Colors.light.cardBlue },
    { id: "3", name: "Citrus Kale Salad", benefit: "Vitamin C for cortisol", ingredients: "Kale, oranges, almonds, olive oil", time: "15 min", color: Colors.light.cardPeach },
  ],
  insomnia: [
    { id: "1", name: "Warm Milk & Honey", benefit: "Natural sleep aid", ingredients: "Warm milk, honey, cinnamon", time: "5 min", color: Colors.light.cardPeach },
    { id: "2", name: "Cherry Almond Smoothie", benefit: "Melatonin boost", ingredients: "Cherries, almonds, milk, vanilla", time: "5 min", color: Colors.light.cardBlue },
    { id: "3", name: "Banana Peanut Toast", benefit: "Magnesium & tryptophan", ingredients: "Whole grain bread, banana, peanut butter", time: "5 min", color: Colors.light.cardGreen },
  ],
  fatigue: [
    { id: "1", name: "Iron-Rich Lentil Soup", benefit: "Energy from iron", ingredients: "Lentils, spinach, tomatoes, spices", time: "30 min", color: Colors.light.cardPeach },
    { id: "2", name: "Citrus Energy Salad", benefit: "Vitamin C & B12", ingredients: "Oranges, chicken, quinoa, greens", time: "20 min", color: Colors.light.cardBlue },
    { id: "3", name: "Chia Seed Pudding", benefit: "Sustained energy", ingredients: "Chia seeds, coconut milk, berries", time: "10 min", color: Colors.light.cardGreen },
  ],
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [tasks, setTasks] = useState(dailyTasks);
  const [habits, setHabits] = useState(dailyHabits);
  const [selectedCondition, setSelectedCondition] = useState("anxiety");
  const [mealPlan, setMealPlan] = useState<MealEntry[]>(initialMealPlan);
  
  // AI Chat state
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; message: string }[]>([
    { role: "ai", message: "Hi there! I'm your AI Companion from Heal Here. I'm here to listen and support you. How are you feeling today?" },
  ]);
  const chatScrollViewRef = useRef<ScrollView>(null);

  const handleMoodSelect = (moodId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedMood(moodId);
  };

  const toggleTask = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const toggleHabit = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setHabits(prev =>
      prev.map(habit =>
        habit.id === id
          ? { ...habit, completed: !habit.completed, streak: habit.completed ? habit.streak - 1 : habit.streak + 1 }
          : habit
      )
    );
  };

  const completedHabits = habits.filter(h => h.completed).length;

  const handleConditionSelect = (conditionId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCondition(conditionId);
  };

  const currentRecipes = dietRecipes[selectedCondition] || dietRecipes.anxiety;

  const toggleMeal = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setMealPlan(prev =>
      prev.map(meal =>
        meal.id === id ? { ...meal, completed: !meal.completed } : meal
      )
    );
  };

  const completedMeals = mealPlan.filter(m => m.completed).length;
  const totalCalories = mealPlan.reduce((acc, m) => acc + m.calories, 0);
  const consumedCalories = mealPlan.filter(m => m.completed).reduce((acc, m) => acc + m.calories, 0);

  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good Morning" : today.getHours() < 17 ? "Good Afternoon" : "Good Evening";

  const handleOpenChat = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowChatModal(true);
  };

  const handleSendChatMessage = async () => {
    if (!chatMessage.trim() || isLoadingChat) return;
    
    const userMessage = chatMessage.trim();
    setChatMessage("");
    setChatHistory((prev) => [...prev, { role: "user", message: userMessage }]);
    setIsLoadingChat(true);

    setTimeout(() => {
      chatScrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const apiUrl = new URL("/api/chat", getApiUrl());
      const response = await fetch(apiUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history: chatHistory,
        }),
      });

      const data = await response.json();
      const aiMessage = data.message || "I'm here to listen. Could you tell me more?";
      setChatHistory((prev) => [...prev, { role: "ai", message: aiMessage }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", message: "I'm having trouble connecting right now. Please try again in a moment." },
      ]);
    } finally {
      setIsLoadingChat(false);
      setTimeout(() => {
        chatScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: tabBarHeight + Spacing["5xl"],
          paddingHorizontal: Spacing.xl,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchRow}>
          <Pressable style={[styles.searchBar, { borderColor: theme.border }]}>
            <Feather name="cpu" size={18} color={Colors.light.primary} />
            <ThemedText style={[styles.searchPlaceholder, { color: theme.textSecondary }]}>
              Ask AI anything...
            </ThemedText>
            <Feather name="search" size={18} color={theme.textSecondary} />
          </Pressable>
          <Pressable 
            style={styles.chatButton}
            onPress={handleOpenChat}
            testID="button-open-chat"
          >
            <Feather name="message-circle" size={20} color="#FFF" />
          </Pressable>
        </View>

        <View style={styles.header}>
          <View>
            <ThemedText style={styles.greeting}>{greeting}</ThemedText>
            <ThemedText style={styles.headerTitle}>
              Ready to start{"\n"}your goals?
            </ThemedText>
          </View>
        </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>How are you feeling?</ThemedText>
        <View style={styles.moodRow}>
          {moods.map((mood) => (
            <Pressable
              key={mood.id}
              style={[
                styles.moodButton,
                selectedMood === mood.id && styles.moodButtonSelected,
              ]}
              onPress={() => handleMoodSelect(mood.id)}
            >
              <Feather
                name={mood.icon as any}
                size={24}
                color={selectedMood === mood.id ? Colors.light.primary : theme.textSecondary}
              />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Habit Tracker</ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            {completedHabits}/{habits.length} done
          </ThemedText>
        </View>
        <View style={styles.habitsRow}>
          {habits.map((habit) => (
            <Pressable
              key={habit.id}
              style={[
                styles.habitItem,
                { backgroundColor: habit.completed ? Colors.light.primary + "15" : theme.backgroundSecondary },
              ]}
              onPress={() => toggleHabit(habit.id)}
            >
              <View
                style={[
                  styles.habitCheckbox,
                  {
                    backgroundColor: habit.completed ? Colors.light.primary : "transparent",
                    borderColor: habit.completed ? Colors.light.primary : theme.border,
                  },
                ]}
              >
                {habit.completed ? <Feather name="check" size={12} color="#FFF" /> : null}
              </View>
              <Feather name={habit.icon as any} size={18} color={habit.completed ? Colors.light.primary : theme.textSecondary} />
              <ThemedText style={[styles.habitName, { color: habit.completed ? Colors.light.primary : theme.text }]}>
                {habit.name}
              </ThemedText>
              <View style={styles.streakBadge}>
                <Feather name="zap" size={10} color={Colors.light.primary} />
                <ThemedText style={styles.streakText}>{habit.streak}</ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Meal Tracker</ThemedText>
          <View style={styles.mealProgress}>
            <ThemedText style={[styles.mealProgressText, { color: theme.textSecondary }]}>
              {completedMeals}/{mealPlan.length} meals
            </ThemedText>
          </View>
        </View>
        
        <View style={[styles.calorieCard, { backgroundColor: Colors.light.cardGreen }]}>
          <View style={styles.calorieInfo}>
            <ThemedText style={styles.calorieLabel}>Daily Intake</ThemedText>
            <ThemedText style={styles.calorieValue}>{consumedCalories} / {totalCalories} kcal</ThemedText>
          </View>
          <View style={styles.calorieBarContainer}>
            <View style={[styles.calorieBar, { backgroundColor: theme.border }]}>
              <View 
                style={[
                  styles.calorieBarFill, 
                  { 
                    backgroundColor: Colors.light.primary, 
                    width: `${Math.min((consumedCalories / totalCalories) * 100, 100)}%` 
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        <View style={styles.mealList}>
          {mealPlan.map((meal) => (
            <Pressable 
              key={meal.id} 
              style={[styles.mealCard, { backgroundColor: mealTypeColors[meal.mealType] }]}
              onPress={() => toggleMeal(meal.id)}
            >
              <View style={styles.mealIconContainer}>
                <Feather name={mealTypeIcons[meal.mealType] as any} size={20} color={Colors.light.primary} />
              </View>
              <View style={styles.mealInfo}>
                <View style={styles.mealHeader}>
                  <ThemedText style={styles.mealName}>{meal.name}</ThemedText>
                  {meal.prescribedBy ? (
                    <View style={styles.prescribedBadge}>
                      <Feather name="user-check" size={10} color={Colors.light.primary} />
                      <ThemedText style={styles.prescribedText}>{meal.prescribedBy}</ThemedText>
                    </View>
                  ) : null}
                </View>
                <View style={styles.mealMeta}>
                  <ThemedText style={[styles.mealTime, { color: theme.textSecondary }]}>{meal.time}</ThemedText>
                  <ThemedText style={[styles.mealCalories, { color: Colors.light.primary }]}>{meal.calories} kcal</ThemedText>
                </View>
              </View>
              <View
                style={[
                  styles.mealCheckbox,
                  {
                    backgroundColor: meal.completed ? Colors.light.primary : "transparent",
                    borderColor: meal.completed ? Colors.light.primary : theme.border,
                  },
                ]}
              >
                {meal.completed ? <Feather name="check" size={14} color="#FFF" /> : null}
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Daily Goals</ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            1/5 selected
          </ThemedText>
        </View>
        <View style={styles.goalsGrid}>
          {goalCards.map((goal) => (
            <Pressable key={goal.id} style={[styles.goalCard, { backgroundColor: goal.bgColor }]}>
              <Image source={goal.image} style={styles.goalImage} contentFit="contain" />
              <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
              <View style={styles.goalMeta}>
                <ThemedText style={[styles.goalMetaText, { color: theme.textSecondary }]}>
                  {goal.sessions}
                </ThemedText>
                <ThemedText style={[styles.goalMetaText, { color: theme.textSecondary }]}>
                  {goal.duration}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Today's Schedule</ThemedText>
        <View style={styles.taskList}>
          {tasks.map((task) => (
            <Pressable
              key={task.id}
              style={[styles.taskItem, { backgroundColor: theme.backgroundSecondary }]}
              onPress={() => toggleTask(task.id)}
            >
              <View
                style={[
                  styles.taskCheckbox,
                  {
                    backgroundColor: task.completed ? Colors.light.primary : "transparent",
                    borderColor: task.completed ? Colors.light.primary : theme.border,
                  },
                ]}
              >
                {task.completed ? <Feather name="check" size={12} color="#FFF" /> : null}
              </View>
              <View style={styles.taskContent}>
                <ThemedText
                  style={[
                    styles.taskText,
                    task.completed ? { textDecorationLine: "line-through" as const, color: theme.textSecondary } : {},
                  ]}
                >
                  {task.text}
                </ThemedText>
                <ThemedText style={[styles.taskTime, { color: theme.textSecondary }]}>
                  {task.time}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.featureCard, { backgroundColor: Colors.light.cardPeach }]}>
          <Image
            source={require("../assets/images/line_art_yoga_prayer_pose_illustration.png")}
            style={styles.featureImage}
            contentFit="contain"
          />
          <View style={styles.featureContent}>
            <ThemedText style={styles.featureTitle}>Breath In</ThemedText>
            <ThemedText style={[styles.featureDescription, { color: theme.textSecondary }]}>
              A 5-minute intro to breathing energy to heal and bring positivity
            </ThemedText>
            <Pressable style={[styles.startButton, { backgroundColor: Colors.light.primary }]}>
              <ThemedText style={styles.startButtonText}>Start</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Diet & Nutrition</ThemedText>
          <Feather name="heart" size={18} color={Colors.light.primary} />
        </View>
        <ThemedText style={[styles.dietSubtitle, { color: theme.textSecondary }]}>
          Healthy recipes for your mental wellness
        </ThemedText>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.conditionScrollContainer}
        >
          {mentalHealthConditions.map((condition) => (
            <Pressable
              key={condition.id}
              style={[
                styles.conditionPill,
                selectedCondition === condition.id ? styles.conditionPillSelected : { backgroundColor: theme.backgroundSecondary },
              ]}
              onPress={() => handleConditionSelect(condition.id)}
            >
              <Feather
                name={condition.icon as any}
                size={14}
                color={selectedCondition === condition.id ? "#FFF" : Colors.light.primary}
              />
              <ThemedText
                style={[
                  styles.conditionText,
                  selectedCondition === condition.id ? styles.conditionTextSelected : {},
                ]}
              >
                {condition.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.recipeList}>
          {currentRecipes.map((recipe) => (
            <Pressable key={recipe.id} style={[styles.recipeCard, { backgroundColor: recipe.color }]}>
              <View style={styles.recipeIconContainer}>
                <Feather name="coffee" size={24} color={Colors.light.primary} />
              </View>
              <View style={styles.recipeContent}>
                <ThemedText style={styles.recipeName}>{recipe.name}</ThemedText>
                <ThemedText style={[styles.recipeBenefit, { color: Colors.light.primary }]}>
                  {recipe.benefit}
                </ThemedText>
                <ThemedText style={[styles.recipeIngredients, { color: theme.textSecondary }]} numberOfLines={1}>
                  {recipe.ingredients}
                </ThemedText>
              </View>
              <View style={styles.recipeTime}>
                <Feather name="clock" size={12} color={theme.textSecondary} />
                <ThemedText style={[styles.recipeTimeText, { color: theme.textSecondary }]}>
                  {recipe.time}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
      </ScrollView>

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
              <Pressable onPress={() => setShowChatModal(false)} style={styles.chatCloseButton} testID="button-close-chat">
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView 
              ref={chatScrollViewRef}
              style={styles.chatMessages} 
              contentContainerStyle={styles.chatMessagesContent}
              onContentSizeChange={() => chatScrollViewRef.current?.scrollToEnd({ animated: true })}
            >
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
              {isLoadingChat ? (
                <View style={[styles.chatBubble, styles.aiBubble, { backgroundColor: Colors.light.cardPeach }]}>
                  <View style={styles.typingIndicator}>
                    <View style={[styles.typingDot, { backgroundColor: theme.textSecondary }]} />
                    <View style={[styles.typingDot, { backgroundColor: theme.textSecondary }]} />
                    <View style={[styles.typingDot, { backgroundColor: theme.textSecondary }]} />
                  </View>
                </View>
              ) : null}
            </ScrollView>

            <View style={[styles.chatInputContainer, { backgroundColor: theme.backgroundDefault, borderTopColor: theme.border }]}>
              <TextInput
                style={[styles.chatInput, { color: theme.text, backgroundColor: theme.backgroundSecondary }]}
                placeholder="Type your message..."
                placeholderTextColor={theme.textSecondary}
                value={chatMessage}
                onChangeText={setChatMessage}
                onSubmitEditing={handleSendChatMessage}
                editable={!isLoadingChat}
                testID="input-chat-message"
              />
              <Pressable
                style={[styles.sendButton, { backgroundColor: isLoadingChat ? theme.textSecondary : Colors.light.text }]}
                onPress={handleSendChatMessage}
                disabled={isLoadingChat}
                testID="button-send-chat"
              >
                {isLoadingChat ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Feather name="send" size={16} color="#FFF" />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    backgroundColor: "transparent",
    gap: Spacing.sm,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  chatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.text,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    marginBottom: Spacing["2xl"],
  },
  greeting: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: "PlayfairDisplay_400Regular",
    color: Colors.light.text,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_400Regular",
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moodButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  moodButtonSelected: {
    backgroundColor: Colors.light.primary + "20",
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  habitsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  habitItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  habitCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  habitName: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_500Medium",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  streakText: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.light.primary,
  },
  goalsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  goalCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    height: 200,
  },
  goalImage: {
    width: "100%",
    height: 100,
    marginBottom: Spacing.sm,
  },
  goalTitle: {
    fontSize: 17,
    fontFamily: "PlayfairDisplay_400Regular",
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  goalMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  goalMetaText: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  taskList: {
    gap: Spacing.sm,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  taskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  taskContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskText: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_400Regular",
    color: Colors.light.text,
  },
  taskTime: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  featureCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
  },
  featureImage: {
    width: 100,
    height: 120,
  },
  featureContent: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  featureTitle: {
    fontSize: 22,
    fontFamily: "PlayfairDisplay_400Regular",
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  featureDescription: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  startButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignSelf: "flex-start",
  },
  startButtonText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#FFFFFF",
  },
  dietSubtitle: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
    marginBottom: Spacing.md,
  },
  conditionScrollContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  conditionPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  conditionPillSelected: {
    backgroundColor: Colors.light.primary,
  },
  conditionText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_500Medium",
    color: Colors.light.text,
  },
  conditionTextSelected: {
    color: "#FFFFFF",
  },
  recipeList: {
    gap: Spacing.sm,
  },
  recipeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  recipeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  recipeContent: {
    flex: 1,
  },
  recipeName: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.light.text,
    marginBottom: 2,
  },
  recipeBenefit: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_500Medium",
    marginBottom: 2,
  },
  recipeIngredients: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  recipeTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  recipeTimeText: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  mealProgress: {
    flexDirection: "row",
    alignItems: "center",
  },
  mealProgressText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  calorieCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  calorieInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  calorieLabel: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_500Medium",
    color: Colors.light.text,
  },
  calorieValue: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
    color: Colors.light.text,
  },
  calorieBarContainer: {
    marginTop: Spacing.xs,
  },
  calorieBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  calorieBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  mealList: {
    gap: Spacing.sm,
  },
  mealCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  mealIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  mealInfo: {
    flex: 1,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: 2,
  },
  mealName: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.light.text,
  },
  prescribedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary + "20",
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 2,
  },
  prescribedText: {
    fontSize: 9,
    fontFamily: "PlusJakartaSans_500Medium",
    color: Colors.light.primary,
  },
  mealMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  mealTime: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  mealCalories: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  mealCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
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
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
});
