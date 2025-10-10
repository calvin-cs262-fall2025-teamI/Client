import React from "react";
import { Stack } from "expo-router";
import { View, Text } from "react-native";
import { Appbar, Button, Card } from "react-native-paper";

export default function ScheduleLayout() {
  return (
    <View>
          <Appbar.Header style={{ backgroundColor: "#388E3C" }}>
                <Appbar.Content title="Schedule" titleStyle={{ color: "#fff", fontWeight: "700" }} />
              
              </Appbar.Header>
        </View>
  );
}
