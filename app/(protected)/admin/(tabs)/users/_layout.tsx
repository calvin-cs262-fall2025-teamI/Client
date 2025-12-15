import React from "react";
import { Stack } from "expo-router";

export default function UsersLayout() {
  return (
     <Stack>
      <Stack.Screen name="user_list" options={{ headerShown: false }} />
      <Stack.Screen name="edit_user" options={{ headerShown: false }} />
    </Stack>
  );
}
