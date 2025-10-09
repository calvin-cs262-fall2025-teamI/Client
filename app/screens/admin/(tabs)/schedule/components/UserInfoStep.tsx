import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Menu, Text } from 'react-native-paper';

type UserRole = 'employee' | 'admin';

interface UserInfoStepProps {
  userData: {
    name: string;
    role: UserRole;
  };
  setUserData: React.Dispatch<React.SetStateAction<{
    name: string;
    role: UserRole;
  }>>;
  onNext: () => void;
}

export default function UserInfoStep({ userData, setUserData, onNext }: UserInfoStepProps) {
  const [visible, setVisible] = useState(false);

  const employees = [
    'John Smith',
    'Sarah Johnson',
    'Michael Brown',
    'Emily Davis',
    'David Wilson',
    'Jessica Martinez',
  ];

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const selectEmployee = (name: string) => {
    setUserData({ ...userData, name });
    closeMenu();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>User Information</Text>
      <Text style={styles.cardSubtitle}>Enter your name and select your role</Text>


      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <TextInput
            label="Select Employee"
            mode="outlined"
            value={userData.name}
            onPressIn={openMenu}
            editable={false}
            right={<TextInput.Icon icon="menu-down" />}
            style={styles.input}
            outlineColor="#ddd"
            activeOutlineColor="#1b5e20"
          />
        }
        contentStyle={styles.menuContent}
      >
        {employees.map((employee) => (
          <Menu.Item
            key={employee}
            onPress={() => selectEmployee(employee)}
            title={employee}
            style={[
              styles.menuItem,
              userData.name === employee && styles.selectedMenuItem,
            ]}
            titleStyle={{
              fontWeight: userData.name === employee ? 'bold' : 'normal',
              color: userData.name === employee ? '#1b5e20' : '#333',
            }}
          />
        ))}
      </Menu>

      <Text style={styles.label}>User Role</Text>
      <View style={styles.roleContainer}>
        {['employee', 'admin'].map((role) => (
          <Button
            key={role}
            mode={userData.role === role ? 'contained' : 'outlined'}
            onPress={() => setUserData({ ...userData, role: role as UserRole })}
            style={styles.roleButton}
            buttonColor={userData.role === role ? '#1b5e20' : '#fff'}
            textColor={userData.role === role ? '#fff' : '#1b5e20'}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Button>
        ))}
      </View>

      <Button
        mode="contained"
        onPress={onNext}
        style={styles.nextButton}
        buttonColor="#1b5e20"
      >
        Next
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  menuContent: {
    backgroundColor: '#fff',
    maxHeight: 300,
    borderRadius: 8,
  },
  menuItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  selectedMenuItem: {
    backgroundColor: '#e0f2f1',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    borderRadius: 6,
  },
  nextButton: {
    marginTop: 8,
  },
});
