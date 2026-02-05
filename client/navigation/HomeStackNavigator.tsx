import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import CBTToolsScreen from "@/screens/CBTToolsScreen";
import MoodAnalyticsScreen from "@/screens/MoodAnalyticsScreen";
import ConsultationAdvisorScreen from "@/screens/ConsultationAdvisorScreen";
import RoutineCoachScreen from "@/screens/RoutineCoachScreen";
import LearningPathsScreen from "@/screens/LearningPathsScreen";
import DailyAffirmationsScreen from "@/screens/DailyAffirmationsScreen";
import ProgressDashboardScreen from "@/screens/ProgressDashboardScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type HomeStackParamList = {
  Home: undefined;
  CBTTools: undefined;
  MoodAnalytics: undefined;
  ConsultationAdvisor: undefined;
  RoutineCoach: undefined;
  LearningPaths: undefined;
  DailyAffirmations: undefined;
  ProgressDashboard: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Heal Here" />,
        }}
      />
      <Stack.Screen
        name="CBTTools"
        component={CBTToolsScreen}
        options={{
          headerTitle: "CBT Tools",
        }}
      />
      <Stack.Screen
        name="MoodAnalytics"
        component={MoodAnalyticsScreen}
        options={{
          headerTitle: "Mood Analytics",
        }}
      />
      <Stack.Screen
        name="ConsultationAdvisor"
        component={ConsultationAdvisorScreen}
        options={{
          headerTitle: "Consultation Advisor",
        }}
      />
      <Stack.Screen
        name="RoutineCoach"
        component={RoutineCoachScreen}
        options={{
          headerTitle: "Routine Coach",
        }}
      />
      <Stack.Screen
        name="LearningPaths"
        component={LearningPathsScreen}
        options={{
          headerTitle: "Learning Paths",
        }}
      />
      <Stack.Screen
        name="DailyAffirmations"
        component={DailyAffirmationsScreen}
        options={{
          headerTitle: "Daily Affirmations",
        }}
      />
      <Stack.Screen
        name="ProgressDashboard"
        component={ProgressDashboardScreen}
        options={{
          headerTitle: "Transformation Progress",
        }}
      />
    </Stack.Navigator>
  );
}

