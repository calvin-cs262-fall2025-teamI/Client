// screens/user/EditProfile.tsx
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { Appbar } from "react-native-paper";

export default function EditProfile() {
  const router = useRouter();

  const handleSave = () => {
    // Save logic here
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
<Appbar.Header style={styles.header}>
  <Appbar.BackAction color="#fff" onPress={() => router.back()} />
  <Appbar.Content
    title="Edit Profile"
    titleStyle={styles.headerTitle}
  />
</Appbar.Header>

    <ScrollView style={styles.container}>

  


      {/* Form */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value="Sarah Johnson" />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput style={styles.input} value="sarah.johnson@company.com" />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} value="+1 (555) 123-4567" />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Department</Text>
        <TextInput style={styles.input} value="Operations" />
      </View>

      {/* Buttons */}
      <View style={styles.btnGroup}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 20 },
   header: {
    backgroundColor: "#388E3C",
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "700",
  },
  formGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    fontSize: 15,
    color: "#0f172a",
  },
  btnGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
  },
  cancelText: { color: "#475569", fontWeight: "600", fontSize: 16 },
  saveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
