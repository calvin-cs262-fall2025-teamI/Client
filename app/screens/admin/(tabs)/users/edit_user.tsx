import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Car,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Appbar } from "react-native-paper";

// Define interfaces
interface VehicleType {
  id: string;
  make: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
}

interface UserType {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  department: string;
  avatar: string | null;
  vehicles: VehicleType[];
}

export default function EditUser() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = (params?.id as string) || "1";

  // Mock user data - in real app, fetch based on userId
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

  const [editingProfile, setEditingProfile] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleType | null>(
    null
  );
  const [vehicleForm, setVehicleForm] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
  });

  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    department: user.department,
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setUser({ ...user, avatar: result.assets[0].uri });
    }
  };

  const handleSaveProfile = () => {
    if (!profileForm.name.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }
    if (!profileForm.email.trim()) {
      Alert.alert("Error", "Please enter an email");
      return;
    }
    if (!profileForm.phone.trim()) {
      Alert.alert("Error", "Please enter a phone number");
      return;
    }

    setUser({
      ...user,
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      department: profileForm.department,
    });
    setEditingProfile(false);
    Alert.alert("Success", "Profile updated successfully!");
  };

  const handleCancelProfileEdit = () => {
    setProfileForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
    });
    setEditingProfile(false);
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setVehicleForm({
      make: "",
      model: "",
      year: "",
      color: "",
      licensePlate: "",
    });
    setModalVisible(true);
  };

  const handleEditVehicle = (vehicle: VehicleType) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      licensePlate: vehicle.licensePlate,
    });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setVehicleForm({
      make: "",
      model: "",
      year: "",
      color: "",
      licensePlate: "",
    });
    setEditingVehicle(null);
  };

  const handleSaveVehicle = () => {
    if (
      !vehicleForm.make.trim() ||
      !vehicleForm.model.trim() ||
      !vehicleForm.year.trim() ||
      !vehicleForm.licensePlate.trim()
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (editingVehicle) {
      // Update existing vehicle
      const updatedVehicles = user.vehicles.map((v) =>
        v.id === editingVehicle.id
          ? { ...editingVehicle, ...vehicleForm }
          : v
      );
      setUser({ ...user, vehicles: updatedVehicles });
      Alert.alert("Success", "Vehicle updated successfully!");
    } else {
      // Add new vehicle
      const newVehicle: VehicleType = {
        id: (user.vehicles.length + 1).toString(),
        ...vehicleForm,
      };
      setUser({ ...user, vehicles: [...user.vehicles, newVehicle] });
      Alert.alert("Success", "Vehicle added successfully!");
    }

    handleCloseModal();
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    Alert.alert(
      "Delete Vehicle",
      "Are you sure you want to delete this vehicle?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedVehicles = user.vehicles.filter(
              (v) => v.id !== vehicleId
            );
            setUser({ ...user, vehicles: updatedVehicles });
            Alert.alert("Success", "Vehicle deleted successfully!");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
       <Appbar.Header style={styles.header}>
        <Appbar.Content
          title="User Details"
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>


      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            {!editingProfile ? (
              <TouchableOpacity
                onPress={() => setEditingProfile(true)}
                style={styles.editButton}
              >
                <Edit2 color="#4CAF50" size={18} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity
                  onPress={handleCancelProfileEdit}
                  style={styles.cancelSmallButton}
                >
                  <Text style={styles.cancelSmallButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveProfile}
                  style={styles.saveSmallButton}
                >
                  <Save color="#fff" size={16} />
                  <Text style={styles.saveSmallButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.profileCard}>
            {/* Avatar */}
            <TouchableOpacity
              onPress={editingProfile ? pickImage : undefined}
              style={styles.avatarContainer}
            >
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarLarge} />
              ) : (
                <View style={styles.avatarPlaceholderLarge}>
                  <User size={48} color="#94a3b8" />
                </View>
              )}
              {editingProfile && (
                <View style={styles.avatarEditBadge}>
                  <Edit2 color="#fff" size={14} />
                </View>
              )}
            </TouchableOpacity>

            {/* Profile Fields */}
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.label}>Full Name</Text>
                {editingProfile ? (
                  <TextInput
                    style={styles.input}
                    value={profileForm.name}
                    onChangeText={(text) =>
                      setProfileForm({ ...profileForm, name: text })
                    }
                    placeholder="Enter full name"
                    placeholderTextColor="#94a3b8"
                  />
                ) : (
                  <Text style={styles.valueText}>{user.name}</Text>
                )}
              </View>

              <View style={styles.formColumn}>
                <Text style={styles.label}>Email Address</Text>
                {editingProfile ? (
                  <TextInput
                    style={styles.input}
                    value={profileForm.email}
                    onChangeText={(text) =>
                      setProfileForm({ ...profileForm, email: text })
                    }
                    placeholder="user@gmail.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                ) : (
                  <View style={styles.valueRow}>
                    <Mail size={16} color="#64748b" />
                    <Text style={styles.valueTextSmall}>{user.email}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.label}>Phone Number</Text>
                {editingProfile ? (
                  <TextInput
                    style={styles.input}
                    value={profileForm.phone}
                    onChangeText={(text) =>
                      setProfileForm({ ...profileForm, phone: text })
                    }
                    placeholder="+1 (555) 123-4567"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                  />
                ) : (
                  <View style={styles.valueRow}>
                    <Phone size={16} color="#64748b" />
                    <Text style={styles.valueTextSmall}>{user.phone}</Text>
                  </View>
                )}
              </View>

              <View style={styles.formColumn}>
                <Text style={styles.label}>Department</Text>
                {editingProfile ? (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.departmentScroll}
                  >
                    <View style={styles.roleContainerRow}>
                      {["Operations", "Finance", "HR", "IT", "Marketing"].map(
                        (dept) => (
                          <TouchableOpacity
                            key={dept}
                            style={[
                              styles.departmentButtonSmall,
                              profileForm.department === dept &&
                                styles.departmentButtonActive,
                            ]}
                            onPress={() =>
                              setProfileForm({ ...profileForm, department: dept })
                            }
                          >
                            <Text
                              style={[
                                styles.departmentButtonText,
                                profileForm.department === dept &&
                                  styles.departmentButtonTextActive,
                              ]}
                            >
                              {dept}
                            </Text>
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  </ScrollView>
                ) : (
                  <View style={styles.departmentTag}>
                    <Text style={styles.departmentTagText}>{user.department}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Role</Text>
              <View style={styles.roleTagDisplay}>
                <Text style={styles.roleTagText}>{user.role}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Vehicles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vehicles</Text>
            <TouchableOpacity
              onPress={handleAddVehicle}
              style={styles.addVehicleButton}
            >
              <Plus color="#fff" size={18} />
              <Text style={styles.addVehicleButtonText}>Add Vehicle</Text>
            </TouchableOpacity>
          </View>

          {user.vehicles.length === 0 ? (
            <View style={styles.emptyVehicles}>
              <Car size={48} color="#cbd5e1" />
              <Text style={styles.emptyVehiclesText}>No vehicles added</Text>
              <Text style={styles.emptyVehiclesSubtext}>
                Add a vehicle to get started
              </Text>
            </View>
          ) : (
            <View style={styles.vehiclesList}>
              {user.vehicles.map((vehicle) => (
                <View key={vehicle.id} style={styles.vehicleCard}>
                  <View style={styles.vehicleIcon}>
                    <Car color="#fff" size={24} />
                  </View>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleTitle}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </Text>
                    <Text style={styles.vehicleDetail}>
                      {vehicle.color} • {vehicle.licensePlate}
                    </Text>
                  </View>
                  <View style={styles.vehicleActions}>
                    <TouchableOpacity
                      onPress={() => handleEditVehicle(vehicle)}
                      style={styles.iconButton}
                    >
                      <Edit2 color="#4CAF50" size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteVehicle(vehicle.id)}
                      style={styles.iconButton}
                    >
                      <Trash2 color="#ef4444" size={18} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Vehicle Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={handleCloseModal}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
              </Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Make *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Toyota, Honda"
                  placeholderTextColor="#94a3b8"
                  value={vehicleForm.make}
                  onChangeText={(text) =>
                    setVehicleForm({ ...vehicleForm, make: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Model *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Camry, Civic"
                  placeholderTextColor="#94a3b8"
                  value={vehicleForm.model}
                  onChangeText={(text) =>
                    setVehicleForm({ ...vehicleForm, model: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Year *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 2022"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={vehicleForm.year}
                  onChangeText={(text) =>
                    setVehicleForm({ ...vehicleForm, year: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Color</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Silver, Blue"
                  placeholderTextColor="#94a3b8"
                  value={vehicleForm.color}
                  onChangeText={(text) =>
                    setVehicleForm({ ...vehicleForm, color: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>License Plate *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., ABC-1234"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="characters"
                  value={vehicleForm.licensePlate}
                  onChangeText={(text) =>
                    setVehicleForm({ ...vehicleForm, licensePlate: text })
                  }
                />
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Vehicle information is used for parking management and identification purposes.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSaveVehicle}
              >
                <Text style={styles.submitButtonText}>
                  {editingVehicle ? "Update" : "Add"} Vehicle
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  backButton: {
    padding: 4,
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
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  editButtonText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
  },
  cancelSmallButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  cancelSmallButtonText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "600",
  },
  saveSmallButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
  },
  saveSmallButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#4CAF50",
  },
  avatarPlaceholderLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: "#4CAF50",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  formColumn: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "#f9fafb",
  },
  valueText: {
    fontSize: 15,
    color: "#0f172a",
  },
  valueTextSmall: {
    fontSize: 13,
    color: "#0f172a",
    flex: 1,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  roleContainerRow: {
    flexDirection: "row",
    gap: 6,
  },
  departmentScroll: {
    flexGrow: 0,
  },
  departmentButton: {
    minWidth: "30%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  departmentButtonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  departmentButtonActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  departmentButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  departmentButtonTextActive: {
    color: "#fff",
  },
  departmentTag: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  departmentTagText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  roleTagDisplay: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  roleTagText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  addVehicleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addVehicleButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyVehicles: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyVehiclesText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#475569",
    marginTop: 12,
  },
  emptyVehiclesSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 4,
  },
  vehiclesList: {
    gap: 12,
  },
  vehicleCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4CAF50",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleIcon: {
    backgroundColor: "#4CAF50",
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  vehicleDetail: {
    fontSize: 14,
    color: "#64748b",
  },
  vehicleActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f8fafc",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  infoBox: {
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    marginTop: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});