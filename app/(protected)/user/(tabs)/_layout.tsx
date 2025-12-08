import { Tabs } from 'expo-router';
import { Icon } from 'react-native-paper';

export default function TabLayout() {
  const tabBarIcon = ({ color, size }: { color: string; size: number }, iconName: string) => (
    <Icon source={iconName} size={size} color={color} />
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#388E3C',
        tabBarInactiveTintColor: '#A0A0A0',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: (props) => tabBarIcon(props, 'view-grid'),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: (props) => tabBarIcon(props, 'calendar'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: (props) => tabBarIcon(props, 'account'),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: 'Help',
          tabBarIcon: (props) => tabBarIcon(props, 'help-circle'),
        }}
      />
    </Tabs>
  );
}