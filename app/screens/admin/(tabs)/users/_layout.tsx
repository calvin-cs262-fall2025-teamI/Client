import React from "react";
import { Stack } from "expo-router";
import { View, Text } from "react-native";
import { Appbar, Button, Card } from "react-native-paper";

export default function UsersLayout() {
  return (
     <Stack>
      <Stack.Screen name="user_list" options={{ headerShown: false }} />
      <Stack.Screen name="edit_user" options={{ headerShown: false }} />
    </Stack>
  );
}
