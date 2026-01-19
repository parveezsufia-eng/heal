import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import JournalScreen from "@/screens/JournalScreen";
import JournalEntryScreen from "@/screens/JournalEntryScreen";
import HabitScreen from "@/screens/HabitScreen";
import FocusScreen from "@/screens/FocusScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type JournalStackParamList = {
  Journal: undefined;
  JournalEntry: { entryId?: string };
  Habit: undefined;
  Focus: undefined;
};

const Stack = createNativeStackNavigator<JournalStackParamList>();

export default function JournalStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Journal"
        component={JournalScreen}
        options={{
          headerTitle: "Journal",
        }}
      />
      <Stack.Screen
        name="JournalEntry"
        component={JournalEntryScreen}
        options={{
          headerTitle: "Entry",
        }}
      />
      <Stack.Screen
        name="Habit"
        component={HabitScreen}
        options={{
          headerTitle: "Habits",
        }}
      />
      <Stack.Screen
        name="Focus"
        component={FocusScreen}
        options={{
          headerTitle: "Focus",
        }}
      />
    </Stack.Navigator>
  );
}
