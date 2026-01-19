import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Platform, TextInput, Modal } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  category: string;
}

const initialTodos: Todo[] = [
  { id: "1", title: "Morning meditation - 10 minutes", completed: true, priority: "high", category: "Wellness" },
  { id: "2", title: "Take a walk outside", completed: false, priority: "medium", category: "Exercise" },
  { id: "3", title: "Journal entry for today", completed: false, priority: "high", category: "Wellness" },
  { id: "4", title: "Drink 8 glasses of water", completed: false, priority: "low", category: "Health" },
  { id: "5", title: "Practice deep breathing", completed: false, priority: "medium", category: "Wellness" },
];

const priorityColors = {
  low: Colors.light.success,
  medium: Colors.light.primary,
  high: Colors.light.emergency,
};

export default function TodoScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState<"low" | "medium" | "high">("medium");

  const toggleTodo = (id: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    );
  };

  const addTodo = () => {
    if (!newTodoTitle.trim()) return;
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: newTodoTitle.trim(),
      completed: false,
      priority: newTodoPriority,
      category: "Personal",
    };
    setTodos((prev) => [newTodo, ...prev]);
    setNewTodoTitle("");
    setShowAddModal(false);
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={{ paddingTop: headerHeight + Spacing.md, paddingBottom: tabBarHeight + Spacing["5xl"] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>My To-Do</ThemedText>
          <Pressable
            style={[styles.addButton, { backgroundColor: Colors.light.primary }]}
            onPress={() => setShowAddModal(true)}
            testID="button-add-todo"
          >
            <Feather name="plus" size={20} color="#FFF" />
          </Pressable>
        </View>

        <View style={[styles.progressCard, { backgroundColor: Colors.light.cardBlue }]}>
          <View style={styles.progressInfo}>
            <ThemedText style={styles.progressTitle}>Today's Progress</ThemedText>
            <ThemedText style={[styles.progressCount, { color: theme.textSecondary }]}>
              {completedCount} of {todos.length} tasks completed
            </ThemedText>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
            <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: Colors.light.primary }]} />
          </View>
        </View>

        <ThemedText style={styles.sectionTitle}>Tasks</ThemedText>
        {todos.map((todo) => (
          <Pressable key={todo.id} onPress={() => toggleTodo(todo.id)} testID={`todo-${todo.id}`}>
            <View style={[styles.todoCard, { backgroundColor: theme.backgroundSecondary }]}>
              <View
                style={[
                  styles.checkbox,
                  { borderColor: priorityColors[todo.priority] },
                  todo.completed && { backgroundColor: priorityColors[todo.priority] },
                ]}
              >
                {todo.completed ? <Feather name="check" size={14} color="#FFF" /> : null}
              </View>
              <View style={styles.todoContent}>
                <ThemedText
                  style={todo.completed 
                    ? [styles.todoTitle, styles.todoCompleted, { color: theme.textSecondary }]
                    : styles.todoTitle
                  }
                >
                  {todo.title}
                </ThemedText>
                <View style={styles.todoMeta}>
                  <View style={[styles.categoryBadge, { backgroundColor: Colors.light.cardPeach }]}>
                    <ThemedText style={styles.categoryText}>{todo.category}</ThemedText>
                  </View>
                  <View style={[styles.priorityDot, { backgroundColor: priorityColors[todo.priority] }]} />
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <ThemedText style={styles.modalTitle}>Add New Task</ThemedText>
              <Pressable onPress={() => setShowAddModal(false)} testID="button-close-add-todo">
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <ThemedText style={styles.inputLabel}>Task Title</ThemedText>
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
                placeholder="What do you need to do?"
                placeholderTextColor={theme.textSecondary}
                value={newTodoTitle}
                onChangeText={setNewTodoTitle}
                testID="input-todo-title"
              />

              <ThemedText style={styles.inputLabel}>Priority</ThemedText>
              <View style={styles.priorityOptions}>
                {(["low", "medium", "high"] as const).map((p) => (
                  <Pressable
                    key={p}
                    style={[
                      styles.priorityOption,
                      { backgroundColor: newTodoPriority === p ? priorityColors[p] : theme.backgroundSecondary },
                    ]}
                    onPress={() => setNewTodoPriority(p)}
                  >
                    <ThemedText style={[styles.priorityOptionText, { color: newTodoPriority === p ? "#FFF" : theme.text }]}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              <Pressable
                style={[styles.saveButton, { backgroundColor: Colors.light.primary }]}
                onPress={addTodo}
                testID="button-save-todo"
              >
                <Feather name="check" size={20} color="#FFF" />
                <ThemedText style={styles.saveButtonText}>Add Task</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainScroll: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  headerTitle: { fontSize: 28, fontFamily: "PlayfairDisplay_400Regular", color: Colors.light.text },
  addButton: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  progressCard: { marginHorizontal: Spacing.xl, padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.xl },
  progressInfo: { marginBottom: Spacing.md },
  progressTitle: { fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold", color: Colors.light.text },
  progressCount: { fontSize: 13, fontFamily: "PlusJakartaSans_400Regular", marginTop: Spacing.xs },
  progressBarBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 4 },
  sectionTitle: { fontSize: 18, fontFamily: "PlayfairDisplay_400Regular", color: Colors.light.text, paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  todoCard: { flexDirection: "row", alignItems: "center", marginHorizontal: Spacing.xl, padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, gap: Spacing.md },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  todoContent: { flex: 1 },
  todoTitle: { fontSize: 15, fontFamily: "PlusJakartaSans_500Medium", color: Colors.light.text },
  todoCompleted: { textDecorationLine: "line-through" as const },
  todoMeta: { flexDirection: "row", alignItems: "center", marginTop: Spacing.xs, gap: Spacing.sm },
  categoryBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  categoryText: { fontSize: 11, fontFamily: "PlusJakartaSans_500Medium", color: Colors.light.text },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  modalContainer: { flex: 1, justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, paddingBottom: Spacing["3xl"] },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: Spacing.lg, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontFamily: "PlusJakartaSans_600SemiBold", color: Colors.light.text },
  modalBody: { padding: Spacing.lg },
  inputLabel: { fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold", color: Colors.light.text, marginBottom: Spacing.sm },
  input: { height: 52, borderRadius: BorderRadius.md, borderWidth: 1, paddingHorizontal: Spacing.lg, fontSize: 15, fontFamily: "PlusJakartaSans_400Regular", marginBottom: Spacing.lg },
  priorityOptions: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.xl },
  priorityOption: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, alignItems: "center" },
  priorityOptionText: { fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold" },
  saveButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg },
  saveButtonText: { fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold", color: "#FFF" },
});
