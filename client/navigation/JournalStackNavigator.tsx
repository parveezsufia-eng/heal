import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import JournalScreen from "@/screens/JournalScreen";
import JournalEntryScreen from "@/screens/JournalEntryScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type JournalStackParamList = {
  Journal: undefined;
  JournalEntry: { entryId?: string };
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
    </Stack.Navigator>
  );
}
