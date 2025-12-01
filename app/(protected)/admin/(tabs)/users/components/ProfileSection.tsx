// CLIENT/app/screens/admin/(tabs)/users/components/ProfileSection.tsx
import * as ImagePicker from "expo-image-picker";
import { Edit2, Mail, Phone, Save, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  validateEmail,
  validateName,
  validatePhoneNumber,
  ValidationErrors,
} from "../../../../../../utils/validationUtils";

interface ProfileSectionProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    department: string;
    avatar: string | null;
  };
  onUpdateProfile: (updates: {
    name: string;
    email: string;
    phone: string;
    department: string;
    avatar: string | null;
  }) => void;
}

export default function ProfileSection({ user, onUpdateProfile }: ProfileSectionProps) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    department: user.department,
  });
  const [avatar, setAvatar] = useState(user.avatar);
  const [profileErrors, setProfileErrors] = useState<ValidationErrors>({});
  const [profileTouched, setProfileTouched] = useState<{ [key: string]: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);

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

  const handleProfileFieldChange = (field: string, value: string) => {
    setProfileForm({ ...profileForm, [field]: value });
    if (profileErrors[field]) {
      const newErrors = { ...profileErrors };
      delete newErrors[field];
      setProfileErrors(newErrors);
    }
  };

  const handleProfileFieldBlur = (field: string) => {
    setProfileTouched({ ...profileTouched, [field]: true });

    let validation;
    switch (field) {
      case "name":
        validation = validateName(profileForm.name);
        break;
      case "email":
        validation = validateEmail(profileForm.email);
        break;
      case "phone":
        validation = validatePhoneNumber(profileForm.phone);
        break;
      default:
        return;
    }

    if (!validation.isValid) {
      setProfileErrors({ ...profileErrors, [field]: validation.error || "" });
    }
  };

  const handleSaveProfile = async () => {
    const errors: ValidationErrors = {};

    const nameValidation = validateName(profileForm.name);
    if (!nameValidation.isValid) errors.name = nameValidation.error!;

    const emailValidation = validateEmail(profileForm.email);
    if (!emailValidation.isValid) errors.email = emailValidation.error!;

    const phoneValidation = validatePhoneNumber(profileForm.phone);
    if (!phoneValidation.isValid) errors.phone = phoneValidation.error!;

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      setProfileTouched({ name: true, email: true, phone: true });
      Alert.alert("Validation Error", "Please fix all errors before saving");
      return;
    }

    try {
      setIsSaving(true);
      
      // Call the onUpdateProfile callback with the updated data
      await onUpdateProfile({
        ...profileForm,
        avatar,
      });
      
      setEditingProfile(false);
      setProfileErrors({});
      setProfileTouched({});
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelProfileEdit = () => {
    setProfileForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
    });
    setAvatar(user.avatar);
    setEditingProfile(false);
    setProfileErrors({});
    setProfileTouched({});
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        {!editingProfile ? (
          <TouchableOpacity
            onPress={() => setEditingProfile(true)}
            style={styles.editButton}
          >
            <Edit2 color="#388E3C" size={18} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity
              onPress={handleCancelProfileEdit}
              style={styles.cancelSmallButton}
              disabled={isSaving}
            >
              <Text style={styles.cancelSmallButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveProfile}
              style={[styles.saveSmallButton, isSaving && styles.saveSmallButtonDisabled]}
              disabled={isSaving}
            >
              <Save color="#fff" size={16} />
              <Text style={styles.saveSmallButtonText}>
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.profileCard}>
        {/* Avatar */}
        <TouchableOpacity
          onPress={editingProfile ? pickImage : undefined}
          style={styles.avatarContainer}
          disabled={isSaving}
        >
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarLarge} />
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
            <Text style={styles.label}>
              Full Name
              {profileTouched.name && profileErrors.name && (
                <Text style={styles.errorInline}> - {profileErrors.name}</Text>
              )}
            </Text>
            {editingProfile ? (
              <TextInput
                style={[
                  styles.input,
                  profileTouched.name && profileErrors.name && styles.inputError,
                ]}
                value={profileForm.name}
                onChangeText={(text) => handleProfileFieldChange("name", text)}
                onBlur={() => handleProfileFieldBlur("name")}
                placeholder="Enter full name"
                placeholderTextColor="#94a3b8"
                editable={!isSaving}
              />
            ) : (
              <Text style={styles.valueText}>{user.name}</Text>
            )}
          </View>

          <View style={styles.formColumn}>
            <Text style={styles.label}>
              Email Address
              {profileTouched.email && profileErrors.email && (
                <Text style={styles.errorInline}> - {profileErrors.email}</Text>
              )}
            </Text>
            {editingProfile ? (
              <TextInput
                style={[
                  styles.input,
                  profileTouched.email && profileErrors.email && styles.inputError,
                ]}
                value={profileForm.email}
                onChangeText={(text) => handleProfileFieldChange("email", text)}
                onBlur={() => handleProfileFieldBlur("email")}
                placeholder="user@gmail.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSaving}
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
            <Text style={styles.label}>
              Phone Number
              {profileTouched.phone && profileErrors.phone && (
                <Text style={styles.errorInline}> - {profileErrors.phone}</Text>
              )}
            </Text>
            {editingProfile ? (
              <TextInput
                style={[
                  styles.input,
                  profileTouched.phone && profileErrors.phone && styles.inputError,
                ]}
                value={profileForm.phone}
                onChangeText={(text) => handleProfileFieldChange("phone", text)}
                onBlur={() => handleProfileFieldBlur("phone")}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                editable={!isSaving}
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
                  {["Operations", "Finance", "HR", "IT", "Marketing"].map((dept) => (
                    <TouchableOpacity
                      key={dept}
                      style={[
                        styles.departmentButtonSmall,
                        profileForm.department === dept && styles.departmentButtonActive,
                      ]}
                      onPress={() =>
                        setProfileForm({ ...profileForm, department: dept })
                      }
                      disabled={isSaving}
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
                  ))}
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
  );
}

const styles = StyleSheet.create({
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
    borderColor: "#388E3C",
  },
  editButtonText: {
    color: "#388E3C",
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
    backgroundColor: "#388E3C",
  },
  saveSmallButtonDisabled: {
    backgroundColor: "#94a3b8",
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
    borderColor: "#388E3C",
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
    backgroundColor: "#388E3C",
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
  errorInline: {
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
  roleContainerRow: {
    flexDirection: "row",
    gap: 6,
  },
  departmentScroll: {
    flexGrow: 0,
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
    backgroundColor: "#388E3C",
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
});