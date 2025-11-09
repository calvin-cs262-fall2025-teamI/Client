import { Stack } from 'expo-router';
import { View } from 'lucide-react-native';
import { Text } from 'react-native';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="view_profile" options={{ headerShown: false }} />
      <Stack.Screen name="edit_profile" options={{ headerShown: false }} />
    </Stack>
  );
}
