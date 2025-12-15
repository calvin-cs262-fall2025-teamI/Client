import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import AuthProvider from "../utils/authContext";
import { enGB, registerTranslation } from 'react-native-paper-dates'
import { SafeAreaView } from "react-native-safe-area-context";
registerTranslation('en-GB', enGB)

// Green and Yellow theme
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "rgb(56, 142, 60)", // Green #388E3C
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
    <GestureHandlerRootView >
       <SafeAreaView style={{ flex:1, backgroundColor: "#2E7D32" }} edges={["top"]}>
      <PaperProvider theme={theme}>
        <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />

        </Stack>
        </AuthProvider>
      </PaperProvider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}