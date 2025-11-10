// CLIENT/app/screens/admin/(tabs)/users/edit_user.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar } from "react-native-paper";
import DeleteUserModal from "./components/DeleteUserModal";
import ProfileSection from "./components/ProfileSection";
import VehicleModal from "./components/VehicleModal";
import VehiclesSection from "./components/VehicleSection";
import { UserType, VehicleType } from "../../../../types/admin.types";


export default function EditUser() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = (params?.id as string) || "1";

  // User state
  const [user, setUser] = useState<UserType>({
    id: userId,
    name: "John Smith",
    email: "john.smith@gmail.com",
    phone: "+1 (555) 123-4567",
    role: "admin",
    status: "active",
    department: "IT",
    avatar: null,
    vehicles: [
      {
        id: "1",
        make: "Toyota",
        model: "Camry",
        year: "2022",
        color: "Silver",
        licensePlate: "ABC-1234",
      },
      {
        id: "2",
        make: "Honda",
        model: "Civic",
        year: "2021",
        color: "Blue",
        licensePlate: "XYZ-5678",
      },
    ],
  });

  // Modal states
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [deleteUserModalVisible, setDeleteUserModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleType | null>(null);

  // ============================================================================
  // PROFILE HANDLERS
  // ============================================================================

  const handleUpdateProfile = (updates: {
    name: string;
    email: string;
    phone: string;
    department: string;
    avatar: string | null;
  }) => {
    setUser({ ...user, ...updates });
  };

  // ============================================================================
  // VEHICLE HANDLERS
  // ============================================================================

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setVehicleModalVisible(true);
  };

  const handleEditVehicle = (vehicle: VehicleType) => {
    setEditingVehicle(vehicle);
    setVehicleModalVisible(true);
  };

  const handleSaveVehicle = (vehicleData: Omit<VehicleType, "id">) => {
    if (editingVehicle) {
      // Update existing vehicle
      const updatedVehicles = user.vehicles.map((v) =>
        v.id === editingVehicle.id ? { ...editingVehicle, ...vehicleData } : v
      );
      setUser({ ...user, vehicles: updatedVehicles });
      Alert.alert("Success", "Vehicle updated successfully!");
    } else {
      // Add new vehicle
      const newVehicle: VehicleType = {
        id: (user.vehicles.length + 1).toString(),
        ...vehicleData,
      };
      setUser({ ...user, vehicles: [...user.vehicles, newVehicle] });
      Alert.alert("Success", "Vehicle added successfully!");
    }
    setVehicleModalVisible(false);
    setEditingVehicle(null);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    const updatedVehicles = user.vehicles.filter((v) => v.id !== vehicleId);
    setUser({ ...user, vehicles: updatedVehicles });
    Alert.alert("Success", "Vehicle deleted successfully!");
  };

  // ============================================================================
  // USER DELETION HANDLERS
  // ============================================================================

  const handleOpenDeleteUserModal = () => {
    setDeleteUserModalVisible(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net/api/users/${userId}`, {
        method: 'DELETE',
      });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }

    setDeleteUserModalVisible(false);

       Alert.alert("Success", "User deleted successfully!", [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
    
    }catch(error){
      Alert.alert("Error", "Failed to delete user");
    }

 
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="User Details" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <ProfileSection user={user} onUpdateProfile={handleUpdateProfile} />
        
        <VehiclesSection
          vehicles={user.vehicles}
          onAddVehicle={handleAddVehicle}
          onEditVehicle={handleEditVehicle}
          onDeleteVehicle={handleDeleteVehicle}
        />
      </ScrollView>

      {/* Delete User Button */}
      <TouchableOpacity
        onPress={handleOpenDeleteUserModal}
        style={styles.deleteUserButton}
      >
        <Trash2 color="#fff" size={18} />
        <Text style={styles.deleteUserButtonText}>Delete User</Text>
      </TouchableOpacity>

      {/* Vehicle Modal */}
      <VehicleModal
        visible={vehicleModalVisible}
        vehicle={editingVehicle}
        onClose={() => setVehicleModalVisible(false)}
        onSave={handleSaveVehicle}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        visible={deleteUserModalVisible}
        userName={user.name}
        vehicleCount={user.vehicles.length}
        onClose={() => setDeleteUserModalVisible(false)}
        onConfirm={() => handleDeleteUser(user.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#388E3C",
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  deleteUserButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ef4444",
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteUserButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});