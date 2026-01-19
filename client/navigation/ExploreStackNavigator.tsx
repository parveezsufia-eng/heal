import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ExploreScreen from "@/screens/ExploreScreen";
import MentorDetailScreen from "@/screens/MentorDetailScreen";
import MusicPlayerScreen from "@/screens/MusicPlayerScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type ExploreStackParamList = {
  Explore: undefined;
  MentorDetail: { mentorId: string };
  MusicPlayer: {
    title: string;
    artist: string;
    youtubeId: string;
    thumbnail?: string;
    type: "podcast" | "music" | "audio";
  };
};

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          headerTitle: "Explore",
        }}
      />
      <Stack.Screen
        name="MentorDetail"
        component={MentorDetailScreen}
        options={{
          headerTitle: "Mentor Profile",
        }}
      />
      <Stack.Screen
        name="MusicPlayer"
        component={MusicPlayerScreen}
        options={{
          headerTitle: "Now Playing",
        }}
      />
    </Stack.Navigator>
  );
}
