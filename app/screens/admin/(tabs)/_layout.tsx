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
        tabBarActiveTintColor: '#388E3C',         // this affects the *label* color
        tabBarInactiveTintColor: '#A0A0A0',
        
      }}
    >
      <Tabs.Screen
        name="lot-manager"
        options={{
          title: 'Lot Manager',
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
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: (props) => tabBarIcon(props, 'account-group'), // better icon for group
        }}
      />
    </Tabs>
  );
}
