import React from "react";
import { Stack } from "expo-router";
import { View, Text } from "react-native";
import { Appbar, Button, Card } from "react-native-paper";
import { StatusBar } from "react-native";
export default function ScheduleLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="create_schedule" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}