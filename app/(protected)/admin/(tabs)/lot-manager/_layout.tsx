// app/(protected)/admin/(tabs)/lot-manager/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="createLotScreen" options={{ headerShown: false }} />
      <Stack.Screen name="manage-lots" options={{ headerShown: false }} />
      <Stack.Screen name="editLotScreen" options={{ headerShown: false }} />
      <Stack.Screen name="viewLotScreen" options={{ headerShown: false }} />
    </Stack>
  );
}