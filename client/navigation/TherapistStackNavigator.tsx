import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TherapistScreen from "@/screens/TherapistScreen";
import TherapistDetailScreen from "@/screens/TherapistDetailScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type TherapistStackParamList = {
  Therapist: undefined;
  TherapistDetail: { therapistId: string };
};

const Stack = createNativeStackNavigator<TherapistStackParamList>();

export default function TherapistStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Therapist"
        component={TherapistScreen}
        options={{
          headerTitle: "Therapists",
        }}
      />
      <Stack.Screen
        name="TherapistDetail"
        component={TherapistDetailScreen}
        options={{
          headerTitle: "Profile",
        }}
      />
    </Stack.Navigator>
  );
}
