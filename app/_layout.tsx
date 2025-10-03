import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme, PaperProvider } from "react-native-paper";

// Green and Yellow theme
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "rgb(56, 142, 60)", // Green
    primaryContainer: "rgb(200, 230, 201)",
    secondary: "rgb(251, 192, 45)", // Yellow
    secondaryContainer: "rgb(255, 243, 224)",
    tertiary: "rgb(76, 175, 80)",
    background: "rgb(252, 252, 252)",
  },
  roundness: 10,
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" options={{ title: "Home" }} />
          <Stack.Screen name="signin" options={{ title: "Sign In" }} />
          <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />
          <Stack.Screen name="create-lot" options={{ title: "Create Lot" }} />
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}