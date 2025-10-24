import { useRouter } from "expo-router";
import {
  Bell,
  Calendar,
  Car,
  Clock,
  Home,
  LogOut,
  MapPin,
  MessageSquare,
  Navigation,
  Search,
  User,
  X
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


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

interface Issue {
  id: number;
  message: string;
  timestamp: string;
  userName: string;
  spotNumber?: string;
}

export default function ClientHomeScreen() {
  const router = useRouter();
  const [isVehicleModalVisible, setIsVehicleModalVisible] = useState(false);
  const [isIssueModalVisible, setIsIssueModalVisible] = useState(false);
  const [issueMessage, setIssueMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
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

  const [formData, setFormData] = useState<FormData>({
    licensePlate: "",
    make: "",
    model: "",
    year: "",
    color: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Update current time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Are you sure you want to sign out?");
      if (confirmed) {
        router.push("/screens/auth/signInScreen");
      }
    } else {
      Alert.alert(
        "Sign Out",
        "Are you sure you want to sign out?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Sign Out",
            onPress: () => {
              router.push("/screens/auth/signInScreen");
            },
            style: "destructive",
          },
        ]
      );
    }
  };

  const handleOpenModal = (vehicle?: Vehicle | null) => {
    if (vehicle) {
      setFormData(vehicle);
      setEditingId(vehicle.id);
      setIsEditing(true);
    } else {
      setFormData({
        licensePlate: "",
        make: "",
        model: "",
        year: "",
        color: "",
      });
      setIsEditing(false);
      setEditingId(null);
    }
    setIsVehicleModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsVehicleModalVisible(false);
    setFormData({
      licensePlate: "",
      make: "",
      model: "",
      year: "",
      color: "",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleOpenIssueModal = () => {
    setIsIssueModalVisible(true);
    setIssueMessage("");
  };

  const handleCloseIssueModal = () => {
    setIsIssueModalVisible(false);
    setIssueMessage("");
  };

  const handleSubmitIssue = () => {
    if (!issueMessage.trim()) {
      Alert.alert("Error", "Please describe the issue");
      return;
    }

    const currentTimeStamp = new Date();
    const newIssue: Issue = {
      id: Date.now(),
      message: issueMessage,
      timestamp: currentTimeStamp.toISOString(),
      userName: "John",
      spotNumber: "A-24",
    };

    try {
      const existingIssuesJson = (global as any).parkingIssues || '[]';
      const existingIssues = JSON.parse(existingIssuesJson);
      
      const issueForAdmin = {
        ...newIssue,
        isRead: false
      };
      existingIssues.push(issueForAdmin);
      
      (global as any).parkingIssues = JSON.stringify(existingIssues);
      
      console.log("Issue submitted successfully:", issueForAdmin);
      console.log("Total issues now:", existingIssues.length);
    } catch (error) {
      console.error("Error storing issue:", error);
    }
    
    const formattedTime = currentTimeStamp.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    Alert.alert("Success", `Your issue has been reported at ${formattedTime}`);
    handleCloseIssueModal();
  };

  const handleSaveVehicle = () => {
    if (
      !formData.licensePlate.trim() ||
      !formData.make.trim() ||
      !formData.model.trim() ||
      !formData.year.trim() ||
      !formData.color.trim()
    ) {
      Alert.alert("Error", "Please fill in all vehicle information");
      return;
    }

    if (isEditing && editingId) {
      setVehicles((prev) =>
        prev.map((v) => (v.id === editingId ? { ...formData, id: editingId } : v))
      );
      Alert.alert("Success", "Vehicle updated successfully");
    } else {
      const newVehicle = {
        ...formData,
        id: Math.random(),
      };
      setVehicles((prev) => [...prev, newVehicle]);
      Alert.alert("Success", "Vehicle added successfully");
    }

    handleCloseModal();
  };

  const handleDeleteVehicle = (id: number) => {
    const confirmDeletion = () => {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      if (Platform.OS === 'web') {
        alert("Vehicle deleted");
      } else {
        Alert.alert("Success", "Vehicle deleted");
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Are you sure you want to delete this vehicle?");
      if (confirmed) {
        confirmDeletion();
      }
    } else {
      Alert.alert(
        "Delete Vehicle",
        "Are you sure you want to delete this vehicle?",
        [
          {
            text: "Cancel",
            onPress: () => {},
            style: "cancel",
          },
          {
            text: "Delete",
            onPress: () => {
              confirmDeletion();
            },
            style: "destructive",
          },
        ]
      );
    }
  };

  
  const handleNavigateHome = () => {
    
    console.log("Already on home");
  };

  const handleNavigateSchedule = () => {
    router.push("/screens/user/(tabs)/schedule");
  };

  const handleNavigateFindParking = () => {
    
    Alert.alert("Coming Soon", "Find Parking feature is coming soon!");
  };

  const handleNavigateProfile = () => {
    router.push("/screens/user/(tabs)/profile" as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Parkmaster</Text>
          <Text style={styles.headerSubtitle}>Welcome back, John</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Search color="#fff" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Bell color="#fff" size={24} />
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSignOut}>
            <LogOut color="#fff" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Assigned Spot Card */}
        <View style={styles.assignedCard}>
          <View style={styles.assignedHeader}>
            <Text style={styles.assignedLabel}>Your Assigned Spot</Text>
            <View style={styles.activeTag}>
              <Text style={styles.activeTagText}>Active</Text>
            </View>
          </View>
          <Text style={styles.spotNumber}>A-24</Text>
          <View style={styles.spotDetail}>
            <MapPin color="#fff" size={18} />
            <Text style={styles.spotDetailText}>
              Building A - Level 2, Section North
            </Text>
          </View>
          <View style={styles.spotDetail}>
            <Clock color="#fff" size={18} />
            <Text style={styles.spotDetailText}>Valid until 6:00 PM today</Text>
          </View>
          <TouchableOpacity style={styles.directionsButton}>
            <Navigation color="#4CAF50" size={20} />
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Vehicle Information Section */}
        <View style={styles.section}>
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
                    <Car color="#4CAF50" size={24} />
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
                    <Text style={styles.vehicleDetailValue}>{vehicle.color}</Text>
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
                <Text style={styles.addVehicleButtonText}>Add Your First Vehicle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Your Schedule Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Schedule</Text>
            <TouchableOpacity onPress={handleNavigateSchedule}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Active Schedule Item */}
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleIcon}>
              <Text style={styles.scheduleIconText}>A-24</Text>
            </View>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleTitle}>Building A - Level 2</Text>
              <View style={styles.scheduleTime}>
                <Clock color="#64748b" size={14} />
                <Text style={styles.scheduleTimeText}>8:00 AM - 6:00 PM</Text>
              </View>
            </View>
            <View style={styles.activeTagSmall}>
              <Text style={styles.activeTagText}>Active</Text>
            </View>
          </View>

          {/* Upcoming Schedule Item */}
          <View style={[styles.scheduleCard, styles.scheduleCardInactive]}>
            <View style={styles.scheduleIconInactive}>
              <Text style={styles.scheduleIconTextInactive}>B-12</Text>
            </View>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleTitle}>Building B - Level 1</Text>
              <View style={styles.scheduleTime}>
                <Clock color="#64748b" size={14} />
                <Text style={styles.scheduleTimeText}>Tomorrow, 8:00 AM</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support and Feedback</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonFullWidth]}
              onPress={handleOpenIssueModal}
            >
              <MessageSquare color="#4CAF50" size={24} />
              <Text style={styles.actionButtonText}>Report Issue</Text>
            </TouchableOpacity>
          </View>
        </View>
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

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>License Plate *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., ABC-123"
                  placeholderTextColor="#94a3b8"
                  value={formData.licensePlate}
                  onChangeText={(text) =>
                    setFormData({ ...formData, licensePlate: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Make *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Toyota"
                  placeholderTextColor="#94a3b8"
                  value={formData.make}
                  onChangeText={(text) => setFormData({ ...formData, make: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Model *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Camry"
                  placeholderTextColor="#94a3b8"
                  value={formData.model}
                  onChangeText={(text) =>
                    setFormData({ ...formData, model: text })
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
                  value={formData.year}
                  onChangeText={(text) => setFormData({ ...formData, year: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Color *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Silver"
                  placeholderTextColor="#94a3b8"
                  value={formData.color}
                  onChangeText={(text) =>
                    setFormData({ ...formData, color: text })
                  }
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

      {/* Report Issue Modal */}
      <Modal
        visible={isIssueModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseIssueModal}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={handleCloseIssueModal}
            style={styles.modalOverlay}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Report an Issue</Text>
                  <TouchableOpacity
                    onPress={handleCloseIssueModal}
                    style={styles.closeButton}
                  >
                    <X color="#64748b" size={24} />
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  style={styles.modalBody}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {/* Current Time Display */}
                  <View style={styles.timeDisplay}>
                    <Clock color="#4CAF50" size={16} />
                    <Text style={styles.timeText}>
                      {currentTime.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      })}
                    </Text>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Describe the Issue *</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Please describe the problem you're experiencing..."
                      placeholderTextColor="#94a3b8"
                      value={issueMessage}
                      onChangeText={setIssueMessage}
                      multiline
                      numberOfLines={6}
                      textAlignVertical="top"
                      returnKeyType="done"
                      blurOnSubmit={true}
                      onSubmitEditing={handleSubmitIssue}
                    />
                  </View>

                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      Your report will be sent to the parking lot manager for immediate attention.
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCloseIssueModal}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmitIssue}
                  >
                    <Text style={styles.submitButtonText}>Submit Report</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#4CAF50",
    padding: 20,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#d1fae5",
    fontSize: 14,
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fbbf24",
  },
  content: {
    flex: 1,
  },
  assignedCard: {
    backgroundColor: "#4CAF50",
    margin: 16,
    marginTop: -8,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  assignedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  assignedLabel: {
    color: "#d1fae5",
    fontSize: 14,
  },
  activeTag: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeTagText: {
    color: "#78350f",
    fontSize: 12,
    fontWeight: "600",
  },
  spotNumber: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "700",
    marginBottom: 12,
  },
  spotDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  spotDetailText: {
    color: "#fff",
    fontSize: 14,
  },
  directionsButton: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  directionsButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
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
  viewAllText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
  },
  addButtonText: {
    color: "#4CAF50",
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
    backgroundColor: "#4CAF50",
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
    backgroundColor: "#4CAF50",
    borderRadius: 8,
  },
  addVehicleButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  scheduleCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
  scheduleCardInactive: {
    borderColor: "#e2e8f0",
  },
  scheduleIcon: {
    backgroundColor: "#4CAF50",
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  scheduleIconText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  scheduleIconInactive: {
    backgroundColor: "#f1f5f9",
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  scheduleIconTextInactive: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "700",
  },
  scheduleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  scheduleTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scheduleTimeText: {
    color: "#64748b",
    fontSize: 13,
  },
  activeTagSmall: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    backgroundColor: "#fff",
    flex: 1,
    minWidth: "47%",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonFullWidth: {
    minWidth: "100%",
  },
  actionButtonPrimary: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  actionButtonText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  actionButtonTextPrimary: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  bottomNav: {
    backgroundColor: "#fff",
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  navText: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
  },
  navTextActive: {
    color: "#4CAF50",
    fontWeight: "600",
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
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  timeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  timeText: {
    fontSize: 14,
    color: "#15803d",
    fontWeight: "600",
  },
  infoBox: {
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
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