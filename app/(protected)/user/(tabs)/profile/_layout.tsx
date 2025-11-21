import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="view_profile" options={{ headerShown: false }} />
      <Stack.Screen name="edit_profile" options={{ headerShown: false }} />
    </Stack>
  );
}
