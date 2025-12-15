import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Mail, Phone, Plus, Search, User, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { useGlobalData } from "@/utils/GlobalDataContext";
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
import { LinearGradient } from "expo-linear-gradient";
import {
  validateEmail,
  validateName,
  validatePhoneNumber,
  ValidationErrors,
} from "../../../../../utils/validationUtils";
import { UserType } from "../../../../../types/global.types";
import { headerStyles } from "@/utils/globalStyles";

const GREEN = "#388E3C";
const CHARCOAL = "#1F2937";
const MUTED = "#4B5563";
const BG = "#F8FAFC";
const CARD = "#FFFFFF";
const BORDER = "rgba(15,23,42,0.08)";

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
  const { users, setUsers } = useGlobalData();

  const CTA_HEIGHT = 56;

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
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
    if ((errors as any)[field]) {
      const newErrors = { ...errors } as any;
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });

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
    if (!nameValidation.isValid) validationErrors.name = nameValidation.error!;

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) validationErrors.email = emailValidation.error!;

    const phoneValidation = validatePhoneNumber(formData.phone);
    if (!phoneValidation.isValid) validationErrors.phone = phoneValidation.error!;

    if (!formData.role) validationErrors.role = "Role is required";
    if (!formData.department) validationErrors.department = "Department is required";
    if (!formData.password || formData.password.length < 8) {
      validationErrors.password = "Password must be at least 8 characters";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Alert.alert("Validation Error", "Please fix all errors before submitting");
      return;
    }

    try {
      setIsSubmitting(true);

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("role", formData.role);
      formDataToSend.append("department", formData.department);
      formDataToSend.append("status", "active");

      if (avatar) {
        const uriParts = avatar.split("/");
        const fileName = uriParts[uriParts.length - 1];
        const fileType = fileName.split(".").pop() || "jpg";

        const file = {
          uri: avatar,
          type: `image/${fileType}`,
          name: fileName || `avatar_${Date.now()}.${fileType}`,
        } as any;

        formDataToSend.append("avatar", file);
      }

      const response = await fetch(
        "https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net/api/users",
        {
          method: "POST",
          headers: {
            // Do NOT set Content-Type here (FormData boundary)
          },
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          Alert.alert("Error", "A user with this email already exists");
        } else {
          Alert.alert("Error", data.message || "Failed to create user");
        }
        return;
      }

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

      setUsers((prevUsers) => [...prevUsers, newUser]);

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
      console.error("❌ Error adding user:", error);
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

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.phone.toLowerCase().includes(q)
    );
  }, [search, users]);

  return (
    <View style={styles.container}>
      <View style={headerStyles.header}>
        <View>
          <Text style={headerStyles.headerTitle}>Users</Text>
          <Text style={headerStyles.headerSubtitle}>Manage user accounts and information</Text>
        </View>
      </View>
      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Search color={MUTED} size={18} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search by name, email, or phone…"
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: CTA_HEIGHT + 110 }]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userCard}
            activeOpacity={0.85}
            onPress={() => router.push(`/admin/users/edit_user?id=${item.id}`)}
          >
            <View style={styles.avatarWrap}>
              {item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <User color={CHARCOAL} size={22} />
                </View>
              )}
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {item.name}
              </Text>

              <View style={styles.metaRow}>
                <Phone size={14} color={MUTED} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {item.phone}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Mail size={14} color={MUTED} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {item.email}
                </Text>
              </View>

              <View style={styles.tagRow}>
                <View style={styles.tagRole}>
                  <Text style={styles.tagRoleText}>{item.role}</Text>
                </View>
                <View style={styles.tagDept}>
                  <Text style={styles.tagDeptText}>{item.department}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <User size={46} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No users found</Text>
            <Text style={styles.emptySub}>Try a different search.</Text>
          </View>
        }
      />

      {/* ✅ Sticky Add New (bottom) */}
      <View style={styles.stickyCta}>
        <LinearGradient
          colors={["rgba(248,250,252,1)", "rgba(248,250,252,0)"]}
          locations={[0, 1]}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.ctaFade}
          pointerEvents="none"
        />

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addBtn}
          activeOpacity={0.9}
        >
          <Plus color="#fff" size={20} />
          <Text style={styles.addBtnText}>Add New User</Text>
        </TouchableOpacity>
      </View>

      {/* Add User Modal */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={handleCloseModal}>
        {/* Backdrop */}
        <Pressable style={styles.modalOverlay} onPress={handleCloseModal} />

        {/* Sheet */}
        <View style={styles.sheetWrap}>
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetKicker}>Users</Text>
                <Text style={styles.sheetTitle}>Add new user</Text>
              </View>

              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton} disabled={isSubmitting}>
                <X color={MUTED} size={22} />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <ScrollView style={styles.sheetBody} contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
              {/* Avatar */}
              <TouchableOpacity onPress={pickImage} style={styles.avatarUpload} disabled={isSubmitting} activeOpacity={0.9}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <User size={34} color="#94A3B8" />
                  </View>
                )}
                <Text style={styles.uploadText}>{avatar ? "Change avatar" : "Upload avatar"}</Text>
              </TouchableOpacity>

              {/* Inputs */}
              <Field
                label="Full name"
                required
                value={formData.name}
                placeholder="Enter full name"
                error={touched.name ? errors.name : undefined}
                onChangeText={(t) => handleFieldChange("name", t)}
                onBlur={() => handleFieldBlur("name")}
                editable={!isSubmitting}
              />

              <Field
                label="Email"
                required
                value={formData.email}
                placeholder="user@parkmaster.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={touched.email ? errors.email : undefined}
                onChangeText={(t) => handleFieldChange("email", t)}
                onBlur={() => handleFieldBlur("email")}
                editable={!isSubmitting}
              />

              <Field
                label="Password"
                required
                value={formData.password}
                placeholder="At least 8 characters"
                secureTextEntry
                error={touched.password ? errors.password : undefined}
                onChangeText={(t) => handleFieldChange("password", t)}
                onBlur={() => setTouched({ ...touched, password: true })}
                editable={!isSubmitting}
              />

              <Field
                label="Phone"
                required
                value={formData.phone}
                placeholder="+1 (555) 123-4567"
                keyboardType="phone-pad"
                error={touched.phone ? errors.phone : undefined}
                onChangeText={(t) => handleFieldChange("phone", t)}
                onBlur={() => handleFieldBlur("phone")}
                editable={!isSubmitting}
              />

              {/* Role */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Role <Text style={styles.star}>*</Text>
                </Text>

                {!!(touched.role && errors.role) && <Text style={styles.errorText}>{errors.role}</Text>}

                <View style={styles.pillsRow}>
                  {["user", "admin"].map((role) => {
                    const active = formData.role === role;
                    return (
                      <TouchableOpacity
                        key={role}
                        style={[styles.pillBtn, active && styles.pillBtnActive]}
                        onPress={() => {
                          handleFieldChange("role", role);
                          setTouched({ ...touched, role: true });
                        }}
                        disabled={isSubmitting}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.pillText, active && styles.pillTextActive]}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Department */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Department <Text style={styles.star}>*</Text>
                </Text>

                {!!(touched.department && errors.department) && (
                  <Text style={styles.errorText}>{errors.department}</Text>
                )}

                <View style={styles.pillsRow}>
                  {["Operations", "Finance", "HR", "IT", "Marketing"].map((dept) => {
                    const active = formData.department === dept;
                    return (
                      <TouchableOpacity
                        key={dept}
                        style={[styles.pillBtn, active && styles.pillBtnActive]}
                        onPress={() => {
                          handleFieldChange("department", dept);
                          setTouched({ ...touched, department: true });
                        }}
                        disabled={isSubmitting}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.pillText, active && styles.pillTextActive]}>{dept}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <Text style={styles.helper}>
                Fields marked with <Text style={{ fontWeight: "900" }}>*</Text> are required.
              </Text>
            </ScrollView>

            {/* Footer */}
            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseModal}
                disabled={isSubmitting}
                activeOpacity={0.9}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleAddUser}
                disabled={isSubmitting}
                activeOpacity={0.9}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? "Adding…" : "Add User"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* -----------------------------
   Small “Field” helper
----------------------------- */
function Field(props: {
  label: string;
  required?: boolean;
  value: string;
  placeholder: string;
  onChangeText: (t: string) => void;
  onBlur?: () => void;
  error?: string;
  editable?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  secureTextEntry?: boolean;
}) {
  const {
    label,
    required,
    value,
    placeholder,
    onChangeText,
    onBlur,
    error,
    editable = true,
    keyboardType,
    autoCapitalize,
    secureTextEntry,
  } = props;

  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>
        {label} {required ? <Text style={styles.star}>*</Text> : null}
      </Text>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={[styles.input, !!error && styles.inputError, !editable && styles.inputDisabled]}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        editable={editable}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

/* -----------------------------
   Styles
----------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  header: { backgroundColor: GREEN },
  headerTitle: { color: "#fff", fontWeight: "900" },

  searchContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: "700", color: CHARCOAL },

  listContent: { paddingHorizontal: 16, paddingTop: 4 },

  userCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },

  avatarWrap: { width: 52, height: 52 },
  userAvatar: { width: 52, height: 52, borderRadius: 14, backgroundColor: "#E5E7EB" },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(31,41,55,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 16, fontWeight: "900", color: CHARCOAL },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  metaText: { fontSize: 13, fontWeight: "700", color: MUTED, flex: 1 },

  tagRow: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  tagRole: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(56,142,60,0.14)",
  },
  tagRoleText: { fontSize: 12, fontWeight: "900", color: GREEN, textTransform: "capitalize" },
  tagDept: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(31,41,55,0.10)",
  },
  tagDeptText: { fontSize: 12, fontWeight: "900", color: CHARCOAL },

  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 70 },
  emptyTitle: { marginTop: 12, fontSize: 18, fontWeight: "900", color: MUTED },
  emptySub: { marginTop: 4, fontSize: 14, fontWeight: "700", color: "#94A3B8" },

  /* Sticky CTA */
  stickyCta: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  ctaFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
  },
  addBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: GREEN,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  addBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },

  /* Modal */
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.40)",
  },
  sheetWrap: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: CARD,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    maxHeight: "92%",
  },

  sheetHeader: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  sheetKicker: {
    fontSize: 12,
    fontWeight: "900",
    color: MUTED,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  sheetTitle: { marginTop: 2, fontSize: 20, fontWeight: "900", color: CHARCOAL },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },

  sheetBody: { paddingHorizontal: 18, paddingTop: 14 },

  avatarUpload: { alignItems: "center", marginBottom: 18 },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "rgba(56,142,60,0.35)",
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  uploadText: { marginTop: 10, color: GREEN, fontWeight: "900", fontSize: 14 },

  formGroup: { marginTop: 12 },
  label: { fontSize: 13, fontWeight: "900", color: CHARCOAL, marginBottom: 8 },
  star: { color: "#DC2626" },
  errorText: { fontSize: 12, fontWeight: "800", color: "#DC2626", marginBottom: 8 },

  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "800",
    color: CHARCOAL,
    backgroundColor: "#F9FAFB",
  },
  inputError: { borderColor: "rgba(220,38,38,0.55)", backgroundColor: "rgba(254,242,242,1)" },
  inputDisabled: { opacity: 0.7 },

  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pillBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
  },
  pillBtnActive: { backgroundColor: CHARCOAL, borderColor: CHARCOAL },
  pillText: { fontSize: 13, fontWeight: "900", color: MUTED },
  pillTextActive: { color: "#fff" },

  helper: { marginTop: 14, marginBottom: 10, fontSize: 13, fontWeight: "700", color: MUTED },

  sheetFooter: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: CARD,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD,
  },
  cancelButtonText: { fontSize: 15, fontWeight: "900", color: CHARCOAL },

  submitButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { fontSize: 15, fontWeight: "900", color: "#fff" },
});
