import { useRouter } from "expo-router";
import {
  Briefcase,
  Car,
  Edit3,
  IdCard,
  LogOut,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar } from "react-native-paper";

interface Vehicle {
  id: number;
  licensePlate: string;
  make: string;
  model: string;
  year: string;
  color: string;
}

interface FormData {
  licensePlate: string;
  make: string;
  model: string;
  year: string;
  color: string;
}

const INITIAL_FORM_DATA: FormData = {
  licensePlate: "",
  make: "",
  model: "",
  year: "",
  color: "",
};

export default function ProfileScreen() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isVehicleModalVisible, setIsVehicleModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 1,
      licensePlate: "ABC-123",
      make: "Toyota",
      model: "Camry",
      year: "2022",
      color: "Silver",
    },
  ]);

  const handleEdit = () => {
    router.push("/user/(tabs)/profile/edit_profile" as any);
  };

  const handleSignOut = () => {
    const confirmSignOut = () => {
      router.push("/signIn");
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to sign out?")) {
        confirmSignOut();
      }
    } else {
      Alert.alert(
        "Sign Out",
        "Are you sure you want to sign out?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign Out", style: "destructive", onPress: confirmSignOut },
        ]
      );
    }
  };

  const handleOpenModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setFormData({
        licensePlate: vehicle.licensePlate,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
      });
      setEditingId(vehicle.id);
      setIsEditing(true);
    } else {
      setFormData(INITIAL_FORM_DATA);
      setIsEditing(false);
      setEditingId(null);
    }
    setIsVehicleModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsVehicleModalVisible(false);
    setFormData(INITIAL_FORM_DATA);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleDeleteVehicle = (id: number) => {
    const confirmDeletion = () => {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      if (Platform.OS === "web") {
        alert("Vehicle deleted successfully");
      } else {
        Alert.alert("Success", "Vehicle deleted successfully");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to delete this vehicle?")) {
        confirmDeletion();
      }
    } else {
      Alert.alert(
        "Delete Vehicle",
        "Are you sure you want to delete this vehicle?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: confirmDeletion },
        ]
      );
    }
  };

  const handleSaveVehicle = () => {
    const { licensePlate, make, model, year, color } = formData;

    // Validate all fields
    if (!licensePlate.trim() || !make.trim() || !model.trim() || !year.trim() || !color.trim()) {
      const message = "Please fill in all vehicle information";
      if (Platform.OS === "web") {
        alert(message);
      } else {
        Alert.alert("Error", message);
      }
      return;
    }

    // Validate year is a valid number
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      const message = "Please enter a valid year";
      if (Platform.OS === "web") {
        alert(message);
      } else {
        Alert.alert("Error", message);
      }
      return;
    }

    if (isEditing && editingId !== null) {
      // Update existing vehicle
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === editingId ? { ...formData, id: editingId } : v
        )
      );
      const message = "Vehicle updated successfully";
      if (Platform.OS === "web") {
        alert(message);
      } else {
        Alert.alert("Success", message);
      }
    } else {
      // Add new vehicle
      const newVehicle: Vehicle = {
        ...formData,
        id: Date.now(), // Use timestamp for unique ID
      };
      setVehicles((prev) => [...prev, newVehicle]);
      const message = "Vehicle added successfully";
      if (Platform.OS === "web") {
        alert(message);
      } else {
        Alert.alert("Success", message);
      }
    }

    handleCloseModal();
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content
          title="Profile"
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.avatarPlaceholder}>
            <User size={48} color="#388E3C" />
          </View>
          <View style={styles.profileHeader}>
            <Text style={styles.name}>Sarah Johnson</Text>
            <View style={styles.tagContainer}>
              <Text style={styles.tag}>Staff</Text>
              <Text style={styles.tag}>Operations</Text>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.infoRow}>
            <Mail size={18} color="#64748b" />
            <Text style={styles.infoText}>sarah.johnson@company.com</Text>
          </View>
          <View style={styles.infoRow}>
            <Phone size={18} color="#64748b" />
            <Text style={styles.infoText}>+1 (555) 123-4567</Text>
          </View>
          <View style={styles.infoRow}>
            <IdCard size={18} color="#64748b" />
            <Text style={styles.infoText}>EMP-45821</Text>
          </View>
          <View style={styles.infoRow}>
            <Briefcase size={18} color="#64748b" />
            <Text style={styles.infoText}>Operations</Text>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
            <Edit3 size={16} color="#fff" />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Vehicles Section */}
        <View style={styles.vehiclesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Vehicles</Text>
            <TouchableOpacity onPress={() => handleOpenModal()}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {vehicles.length > 0 ? (
            vehicles.map((vehicle) => (
              <View key={vehicle.id} style={styles.vehicleCard}>
                <View style={styles.vehicleCardHeader}>
                  <View style={styles.vehicleIconContainer}>
                    <Car color="#388E3C" size={24} />
                  </View>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleTitle}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </Text>
                    <Text style={styles.vehicleSubtitle}>
                      {vehicle.licensePlate}
                    </Text>
                  </View>
                </View>
                <View style={styles.vehicleDetails}>
                  <View style={styles.vehicleDetailItem}>
                    <Text style={styles.vehicleDetailLabel}>Color</Text>
                    <Text style={styles.vehicleDetailValue}>
                      {vehicle.color}
                    </Text>
                  </View>
                </View>
                <View style={styles.vehicleActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleOpenModal(vehicle)}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteVehicle(vehicle.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Car color="#cbd5e1" size={40} />
              <Text style={styles.emptyStateText}>No vehicles added yet</Text>
              <TouchableOpacity
                style={styles.addVehicleButton}
                onPress={() => handleOpenModal()}
              >
                <Text style={styles.addVehicleButtonText}>
                  Add Your First Vehicle
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleSignOut}>
          <LogOut size={16} color="#475569" />
          <Text style={styles.actionText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Vehicle Modal */}
      <Modal
        visible={isVehicleModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? "Edit Vehicle" : "Add Vehicle"}
              </Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formGroup}>
                <Text style={styles.label}>License Plate *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., ABC-123"
                  placeholderTextColor="#94a3b8"
                  value={formData.licensePlate}
                  onChangeText={(text) => handleInputChange("licensePlate", text)}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Make *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Toyota"
                  placeholderTextColor="#94a3b8"
                  value={formData.make}
                  onChangeText={(text) => handleInputChange("make", text)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Model *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Camry"
                  placeholderTextColor="#94a3b8"
                  value={formData.model}
                  onChangeText={(text) => handleInputChange("model", text)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Year *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 2022"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={formData.year}
                  onChangeText={(text) => handleInputChange("year", text)}
                  maxLength={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Color *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Silver"
                  placeholderTextColor="#94a3b8"
                  value={formData.color}
                  onChangeText={(text) => handleInputChange("color", text)}
                />
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
                  {isEditing ? "Update Vehicle" : "Add Vehicle"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ecfdf5",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  tagContainer: {
    flexDirection: "row",
    marginTop: 4,
    gap: 8,
  },
  tag: {
    fontSize: 12,
    backgroundColor: "#f1f5f9",
    color: "#0f172a",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#334155",
  },
  editBtn: {
    marginTop: 12,
    backgroundColor: "#388E3C",
    flexDirection: "row",
    gap: 6,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  editBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  vehiclesSection: {
    marginBottom: 20,
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
  addButtonText: {
    color: "#388E3C",
    fontSize: 14,
    fontWeight: "600",
  },
  vehicleCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  vehicleIconContainer: {
    backgroundColor: "#f0fdf4",
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  vehicleSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  vehicleDetails: {
    flexDirection: "row",
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  vehicleDetailItem: {
    flex: 1,
  },
  vehicleDetailLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  vehicleDetailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  vehicleActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#388E3C",
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  deleteButtonText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 8,
  },
  addVehicleButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#388E3C",
    borderRadius: 8,
  },
  addVehicleButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
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
  formGroup: {
    marginBottom: 16,
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
    backgroundColor: "#388E3C",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});