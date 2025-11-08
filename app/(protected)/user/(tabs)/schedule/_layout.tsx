import { Stack } from "expo-router";
import React from "react";

export default function ScheduleLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="reservation-request" 
        options={{ headerShown: false }} 
      />
    </Stack>
  );
}