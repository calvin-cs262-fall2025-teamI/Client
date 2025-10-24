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
import { Plus, Search, User, Mail, Phone, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Appbar } from "react-native-paper";

// Define User interface
interface UserType {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  department: string;
  avatar: string | null;
}

export default function UserList() {
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
  });

  const router = useRouter();

  // Convert users to state so it can be updated
  const [users, setUsers] = useState<UserType[]>([
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@parkmaster.com",
      phone: "+1 (555) 123-4567",
      role: "admin",
      status: "active",
      department: "IT",
      avatar: null,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.j@parkmaster.com",
      phone: "+1 (555) 234-5678",
      role: "client",
      status: "active",
      department: "Finance",
      avatar: null,
    },
    {
      id: "3",
      name: "Mike Davis",
      email: "mike.davis@parkmaster.com",
      phone: "+1 (555) 345-6789",
      role: "client",
      status: "active",
      department: "Operations",
      avatar: null,
    },
  ]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  // Function to handle adding a new user
  const handleAddUser = () => {
    // Validate form data
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert("Error", "Please enter an email");
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert("Error", "Please enter a phone number");
      return;
    }
    if (!formData.role) {
      Alert.alert("Error", "Please select a role");
      return;
    }
    if (!formData.department) {
      Alert.alert("Error", "Please select a department");
      return;
    }

    // Create new user object
    const newUser: UserType = {
      id: (users.length + 1).toString(), // Generate new ID
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: "active",
      department: formData.department,
      avatar: avatar,
    };

    // Add new user to the list
    setUsers([...users, newUser]);

    // Reset form and close modal
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      department: "",
    });
    setAvatar(null);
    setModalVisible(false);

    // Show success message
    Alert.alert("Success", `${newUser.name} has been added successfully!`);
  };

  // Function to reset form when modal is closed
  const handleCloseModal = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      department: "",
    });
    setAvatar(null);
    setModalVisible(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Simple App Header */}
    <Appbar.Header style={styles.header}>
        <Appbar.Content
          title="Users"
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>


      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Search color="#64748b" size={18} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search users..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Add User Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
        >
          <Plus color="#fff" size={20} />
          <Text style={styles.addButtonText}>Add New User</Text>
        </TouchableOpacity>
      </View>

      {/* User List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.scheduleCard}
            onPress={() => router.push(`/screens/admin/(tabs)/users/edit_user?id=${item.id}`)}
          >
            <View style={styles.scheduleIcon}>
              {item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
              ) : (
                <User color="#fff" size={24} />
              )}
            </View>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleTitle}>{item.name}</Text>
              <View style={styles.scheduleTime}>
                <Phone size={14} color="#64748b" />
                <Text style={styles.scheduleTimeText}>{item.phone}</Text>
              </View>
              <View style={styles.scheduleTime}>
                <Mail size={14} color="#64748b" />
                <Text style={styles.scheduleTimeText}>{item.email}</Text>
              </View>
              <View style={styles.tagRow}>
                <View style={[styles.activeTagSmall, styles.roleTag]}>
                  <Text style={styles.roleTagText}>{item.role}</Text>
                </View>
                <View style={[styles.activeTagSmall, styles.departmentTag]}>
                  <Text style={styles.departmentTagText}>{item.department}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <User size={48} color="#cbd5e1" />
            <Text style={styles.emptyStateText}>No users found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search criteria
            </Text>
          </View>
        }
      />

      {/* Add User Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCloseModal}>
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New User</Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Avatar Upload */}
              <TouchableOpacity
                onPress={pickImage}
                style={styles.avatarUpload}
              >
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <User size={36} color="#94a3b8" />
                  </View>
                )}
                <Text style={styles.uploadText}>Upload Avatar</Text>
              </TouchableOpacity>

              {/* Form Fields */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter full name"
                  placeholderTextColor="#94a3b8"
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="user@parkmaster.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+1 (555) 123-4567"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phone: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Role *</Text>
                <View style={styles.roleContainer}>
                  {["client", "admin"].map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleButton,
                        formData.role === role && styles.roleButtonActive,
                      ]}
                      onPress={() => setFormData({ ...formData, role })}
                    >
                      <Text
                        style={[
                          styles.roleButtonText,
                          formData.role === role && styles.roleButtonTextActive,
                        ]}
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Department *</Text>
                <View style={styles.roleContainer}>
                  {["Operations", "Finance", "HR", "IT", "Marketing"].map((dept) => (
                    <TouchableOpacity
                      key={dept}
                      style={[
                        styles.departmentButton,
                        formData.department === dept && styles.roleButtonActive,
                      ]}
                      onPress={() => setFormData({ ...formData, department: dept })}
                    >
                      <Text
                        style={[
                          styles.roleButtonText,
                          formData.department === dept &&
                            styles.roleButtonTextActive,
                        ]}
                      >
                        {dept}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  New users will receive a welcome email with login credentials
                  and onboarding instructions.
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
                onPress={handleAddUser}
              >
                <Text style={styles.submitButtonText}>Add User</Text>
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
  header: {
    backgroundColor: "#388E3C",
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "700",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
  },
  addButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
  scheduleIcon: {
    backgroundColor: "#4CAF50",
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 8,
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
    marginBottom: 6,
  },
  scheduleTimeText: {
    color: "#64748b",
    fontSize: 13,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  activeTagSmall: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeTagText: {
    color: "#78350f",
    fontSize: 12,
    fontWeight: "600",
  },
  roleTag: {
    backgroundColor: "#4CAF50",
  },
  roleTagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  departmentTag: {
    backgroundColor: "#fbbf24",
    borderRadius: 10,
  },
  departmentTagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#475569",
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 4,
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
  avatarUpload: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#4CAF50",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  uploadText: {
    color: "#4CAF50",
    fontWeight: "600",
    marginTop: 12,
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 20,
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
  roleContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  roleButton: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  roleButtonTextActive: {
    color: "#fff",
  },
  departmentButton: {
    minWidth: "30%",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    alignItems: "center",
    marginBottom: 8,
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