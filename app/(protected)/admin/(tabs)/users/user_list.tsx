import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Mail, Phone, Plus, Search, User, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar } from "react-native-paper";
import {
  validateEmail,
  validateName,
  validatePhoneNumber,
  ValidationErrors,
} from '../../../../utils/validationUtils';

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
    password: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>([]);

  
  // Get Users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net/api/users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [users]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    
    // Validate field on blur
    let validation;
    switch (field) {
      case "name":
        validation = validateName(formData.name);
        break;
      case "email":
        validation = validateEmail(formData.email);
        break;
      case "phone":
        validation = validatePhoneNumber(formData.phone);
        break;
      default:
        return;
    }
    
    if (!validation.isValid) {
      setErrors({ ...errors, [field]: validation.error || "" });
    }
  };

  const handleAddUser = async () => {
    // Mark all fields as touched
    const allTouched = {
      name: true,
      email: true,
      phone: true,
      role: true,
      department: true,
      password: true,
    };
    setTouched(allTouched);

    // Validate all fields
    const validationErrors: ValidationErrors = {};

    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
      validationErrors.name = nameValidation.error!;
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      validationErrors.email = emailValidation.error!;
    }

    const phoneValidation = validatePhoneNumber(formData.phone);
    if (!phoneValidation.isValid) {
      validationErrors.phone = phoneValidation.error!;
    }

    if (!formData.role) {
      validationErrors.role = "Role is required";
    }

    if (!formData.department) {
      validationErrors.department = "Department is required";
    }

    if (!formData.password || formData.password.length < 8) {
      validationErrors.password = "Password must be at least 8 characters";
    }

    // If there are errors, set them and show alert
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Alert.alert("Validation Error", "Please fix all errors before submitting");
      return;
    }

    try {
      setIsSubmitting(true);

      // ============================================================
      // FIXED: Use FormData instead of JSON
      // ============================================================
      const formDataToSend = new FormData();
      
      // Add all text fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("role", formData.role);
      formDataToSend.append("department", formData.department);
      formDataToSend.append("status", "active");

      // Add avatar if selected
      if (avatar) {
        // Extract file information
        const uriParts = avatar.split("/");
        const fileName = uriParts[uriParts.length - 1];
        const fileType = fileName.split(".").pop() || "jpg";
        
        // Create file object for upload
        const file = {
          uri: avatar,
          type: `image/${fileType}`,
          name: fileName || `avatar_${Date.now()}.${fileType}`,
        } as any;
        
        formDataToSend.append("avatar", file);
        console.log("📤 Uploading avatar:", fileName);
      }

      // Make POST request with FormData
      const response = await fetch('https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net/api/users', {
        method: 'POST',
        headers: {
          // ⚠️ CRITICAL: Do NOT set Content-Type header!
          // Let the browser set it automatically with the boundary
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409) {
          Alert.alert("Error", "A user with this email already exists");
        } else {
          Alert.alert("Error", data.message || "Failed to create user");
        }
        return;
      }

      console.log("✅ User created successfully:", data);

      // Create user object from server response
      const newUser: UserType = {
        id: data.id.toString(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        status: data.status,
        department: data.department,
        avatar: data.avatar,
      };

      // Update local state
      setUsers([...users, newUser]);

      // Reset form and close modal
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "",
        department: "",
        password: "",
      });
      setAvatar(null);
      setErrors({});
      setTouched({});
      setModalVisible(false);

      Alert.alert("Success", `${newUser.name} has been added successfully!`);
    } catch (error) {
      console.error('❌ Error adding user:', error);
      Alert.alert("Error", "Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      department: "",
      password: "",
    });
    setAvatar(null);
    setErrors({});
    setTouched({});
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
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Users" titleStyle={styles.headerTitle} />
      </Appbar.Header>

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

      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
        >
          <Plus color="#fff" size={20} />
          <Text style={styles.addButtonText}>Add New User</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.scheduleCard}
            onPress={() => router.push(`/admin/users/edit_user?id=${item.id}`)}
          >
            <View style={styles.scheduleIcon}>
              {item.avatar ? (
                <Image
                  source={{ uri: item.avatar }}
                  style={styles.userAvatar}
                />
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
                  <Text style={styles.departmentTagText}>
                    {item.department}
                  </Text>
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
                disabled={isSubmitting}
              >
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <TouchableOpacity
                onPress={pickImage}
                style={styles.avatarUpload}
                disabled={isSubmitting}
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

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Full Name *
                  {touched.name && errors.name && (
                    <Text style={styles.required}> - {errors.name}</Text>
                  )}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    touched.name && errors.name && styles.inputError,
                  ]}
                  placeholder="Enter full name"
                  placeholderTextColor="#94a3b8"
                  value={formData.name}
                  onChangeText={(text) => handleFieldChange("name", text)}
                  onBlur={() => handleFieldBlur("name")}
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Email Address *
                  {touched.email && errors.email && (
                    <Text style={styles.required}> - {errors.email}</Text>
                  )}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    touched.email && errors.email && styles.inputError,
                  ]}
                  placeholder="user@parkmaster.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => handleFieldChange("email", text)}
                  onBlur={() => handleFieldBlur("email")}
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Password *
                  {touched.password && errors.password && (
                    <Text style={styles.required}> - {errors.password}</Text>
                  )}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    touched.password && errors.password && styles.inputError,
                  ]}
                  placeholder="Enter password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(text) => handleFieldChange("password", text)}
                  onBlur={() => handleFieldBlur("password")}
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Phone Number *
                  {touched.phone && errors.phone && (
                    <Text style={styles.required}> - {errors.phone}</Text>
                  )}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    touched.phone && errors.phone && styles.inputError,
                  ]}
                  placeholder="+1 (555) 123-4567"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) => handleFieldChange("phone", text)}
                  onBlur={() => handleFieldBlur("phone")}
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Role *
                  {touched.role && errors.role && (
                    <Text style={styles.required}> - {errors.role}</Text>
                  )}
                </Text>
                <View style={styles.roleContainer}>
                  {["user", "admin"].map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleButton,
                        formData.role === role && styles.roleButtonActive,
                      ]}
                      onPress={() => {
                        handleFieldChange("role", role);
                        setTouched({ ...touched, role: true });
                      }}
                      disabled={isSubmitting}
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
                <Text style={styles.label}>
                  Department *
                  {touched.department && errors.department && (
                    <Text style={styles.required}> - {errors.department}</Text>
                  )}
                </Text>
                <View style={styles.roleContainer}>
                  {["Operations", "Finance", "HR", "IT", "Marketing"].map(
                    (dept) => (
                      <TouchableOpacity
                        key={dept}
                        style={[
                          styles.departmentButton,
                          formData.department === dept &&
                            styles.roleButtonActive,
                        ]}
                        onPress={() => {
                          handleFieldChange("department", dept);
                          setTouched({ ...touched, department: true });
                        }}
                        disabled={isSubmitting}
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
                    )
                  )}
                </View>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  All fields marked with * are required. Please ensure all
                  information is accurate.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseModal}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isSubmitting && styles.submitButtonDisabled,
                ]}
                onPress={handleAddUser}
                disabled={isSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? "Adding..." : "Add User"}
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
    backgroundColor: "#388E3C",
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
    borderColor: "#388E3C",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleIcon: {
    backgroundColor: "#388E3C",
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
  roleTag: {
    backgroundColor: "#388E3C",
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
    borderColor: "#388E3C",
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
    color: "#388E3C",
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
  required: {
    color: "#F44336",
    fontSize: 12,
    fontWeight: "500",
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
  inputError: {
    borderColor: "#F44336",
    borderWidth: 2,
    backgroundColor: "#fef2f2",
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
    backgroundColor: "#388E3C",
    borderColor: "#388E3C",
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
    backgroundColor: "#388E3C",
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});