import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="dashboard" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="view-parking-lots" 
        options={{ headerShown: false }} 
      />
    </Stack>
  );
}