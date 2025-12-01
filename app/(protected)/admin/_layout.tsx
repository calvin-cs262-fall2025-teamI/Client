import GlobalDataProvider from '@/utils/GlobalDataContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <GlobalDataProvider>
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
    </GlobalDataProvider>
  );
}
