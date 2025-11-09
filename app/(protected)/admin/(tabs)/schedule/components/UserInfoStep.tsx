// CLIENT/app/screens/admin/(tabs)/schedule/components/UserInfoStep.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Menu, Text } from 'react-native-paper';
import { validateName } from '../../../../../utils/validationUtils';

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
  const [nameError, setNameError] = useState('');
  const [touched, setTouched] = useState(false);

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
    setTouched(true);
    
    // Validate selected name
    const validation = validateName(name);
    if (!validation.isValid) {
      setNameError(validation.error || '');
    } else {
      setNameError('');
    }
    
    closeMenu();
  };

  const handleNext = () => {
    setTouched(true);
    
    // Validate name before proceeding
    const validation = validateName(userData.name);
    if (!validation.isValid) {
      setNameError(validation.error || '');
      Alert.alert('Validation Error', validation.error || 'Please select a valid employee');
      return;
    }

    // Check if role is selected
    if (!userData.role) {
      Alert.alert('Validation Error', 'Please select a user role');
      return;
    }

    // Clear error and proceed
    setNameError('');
    onNext();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>User Information</Text>
      <Text style={styles.cardSubtitle}>Select employee and role to continue</Text>

      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <View>
            <TextInput
              label="Select Employee *"
              mode="outlined"
              value={userData.name}
              onPressIn={openMenu}
              editable={false}
              right={<TextInput.Icon icon="menu-down" />}
              style={styles.input}
              outlineColor={touched && nameError ? "#F44336" : "#ddd"}
              activeOutlineColor={touched && nameError ? "#F44336" : "#1b5e20"}
              error={touched && !!nameError}
            />
            {touched && nameError && (
              <Text style={styles.errorText}>{nameError}</Text>
            )}
          </View>
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

      <Text style={styles.label}>User Role *</Text>
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

      {userData.name && userData.role && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            ✓ Selected: <Text style={styles.summaryBold}>{userData.name}</Text> as{' '}
            <Text style={styles.summaryBold}>{userData.role}</Text>
          </Text>
        </View>
      )}

      <Button
        mode="contained"
        onPress={handleNext}
        style={styles.nextButton}
        buttonColor="#1b5e20"
        disabled={!userData.name || !userData.role}
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
    marginBottom: 4,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
    marginLeft: 4,
    fontWeight: '500',
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
  summaryBox: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac',
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
  },
  summaryBold: {
    fontWeight: '700',
    color: '#15803d',
  },
  nextButton: {
    marginTop: 8,
  },
});