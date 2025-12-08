import { Stack } from "expo-router";
import React from "react";

export default function ScheduleLayout() {
  return (
    <Stack>
      {/* Make reservation-request the index (default) screen */}
      <Stack.Screen 
        name="reservation-request" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="empty-state" 
        options={{ headerShown: false }} 
      />
    </Stack>
  );
}