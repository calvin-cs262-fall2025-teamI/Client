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
import { useEffect } from "react";

export default function EditUser() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = (params?.id as string) || "1";

  // User state
  const [user, setUser] = useState<UserType | null>(null);

  // Get user data from API based on userId
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net/api/users/${userId}`);
        const data = await response.json();
        setUser(data);
        
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  // Modal states
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [deleteUserModalVisible, setDeleteUserModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleType | null>(null);

  // ============================================================================
  // PROFILE HANDLERS
  // ============================================================================

  const handleUpdateProfile = async (updates: {
    name: string;
    email: string;
    phone: string;
    department: string;
    avatar: string | null;
  }) => {
    if (!user) return;

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("name", updates.name);
      formData.append("email", updates.email);
      formData.append("phone", updates.phone);
      formData.append("role", user.role); // Include existing role
      formData.append("department", updates.department);
      formData.append("status", user.status || "active"); // Include existing status

      // Handle avatar upload
      if (updates.avatar && updates.avatar !== user.avatar) {
        // Check if it's a new local file (starts with file://)
        if (updates.avatar.startsWith("file://")) {
          // Extract file name and type from URI
          const uriParts = updates.avatar.split("/");
          const fileName = uriParts[uriParts.length - 1];
          const fileType = fileName.split(".").pop() || "jpg";
          
          // Create file object for upload
          const file = {
            uri: updates.avatar,
            type: `image/${fileType}`,
            name: fileName || `avatar_${Date.now()}.${fileType}`,
          } as any;
          
          formData.append("avatar", file);
          console.log("📤 Uploading new avatar:", fileName);
        } else {
          // If it's an existing URL, just send the URL
          formData.append("avatar", updates.avatar);
          console.log("📤 Keeping existing avatar URL");
        }
      } else if (user.avatar) {
        // Keep existing avatar
        formData.append("avatar", user.avatar);
        console.log("📤 No avatar change");
      }

      console.log("📤 Sending update for user:", user.id);

      const response = await fetch(
        `https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net/api/users/${user.id}`,
        {
          method: "PUT",
          headers: {
            // CRITICAL: Do NOT set Content-Type header
            // Let the browser set it with the multipart boundary
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server response:", response.status, errorText);
        
        let errorMessage = "Failed to update user";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const updatedUser = await response.json();
      
      // Update local state with the response
      setUser(updatedUser);
      
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to update profile. Please try again.");
      throw error; // Re-throw to let ProfileSection handle it
    }
  };

  // ============================================================================
  // VEHICLE HANDLERS
  // ============================================================================

  // const handleAddVehicle = () => {
  //   setEditingVehicle(null);
  //   setVehicleModalVisible(true);
  // };

  // const handleEditVehicle = (vehicle: VehicleType) => {
  //   setEditingVehicle(vehicle);
  //   setVehicleModalVisible(true);
  // };

  // const handleSaveVehicle = (vehicleData: Omit<VehicleType, "id">) => {
  //   if (editingVehicle) {
  //     // Update existing vehicle
  //     const updatedVehicles = user.vehicles.map((v) =>
  //       v.id === editingVehicle.id ? { ...editingVehicle, ...vehicleData } : v
  //     );
  //     setUser({ ...user, vehicles: updatedVehicles });
  //     Alert.alert("Success", "Vehicle updated successfully!");
  //   } else {
  //     // Add new vehicle
  //     const newVehicle: VehicleType = {
  //       id: (user.vehicles.length + 1).toString(),
  //       ...vehicleData,
  //     };
  //     setUser({ ...user, vehicles: [...user.vehicles, newVehicle] });
  //     Alert.alert("Success", "Vehicle added successfully!");
  //   }
  //   setVehicleModalVisible(false);
  //   setEditingVehicle(null);
  // };

  // const handleDeleteVehicle = (vehicleId: string) => {
  //   const updatedVehicles = user.vehicles.filter((v) => v.id !== vehicleId);
  //   setUser({ ...user, vehicles: updatedVehicles });
  //   Alert.alert("Success", "Vehicle deleted successfully!");
  // };

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
    
    } catch(error) {
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
        {user && <ProfileSection user={user} onUpdateProfile={handleUpdateProfile} />}
        
        {/* <VehiclesSection
          vehicles={user.vehicles}
          onAddVehicle={handleAddVehicle}
          onEditVehicle={handleEditVehicle}
          onDeleteVehicle={handleDeleteVehicle}
        /> */}
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
      {/* <VehicleModal
        visible={vehicleModalVisible}
        vehicle={editingVehicle}
        onClose={() => setVehicleModalVisible(false)}
        onSave={handleSaveVehicle}
      /> */}

      {/* Delete User Modal */}
     { user && (
      <DeleteUserModal
        visible={deleteUserModalVisible}
        userName={user.name}
        vehicleCount={3}
        onClose={() => setDeleteUserModalVisible(false)}
        onConfirm={() => handleDeleteUser(user.id)}
      />
     )}
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