// CLIENT/app/screens/admin/(tabs)/users/components/VehicleModal.tsx
import { X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  formatLicensePlate,
  validateLicensePlate,
  validateVehicleColor,
  validateVehicleMake,
  validateVehicleModel,
  validateVehicleYear,
  ValidationErrors,
} from "../../../../../../utils/validationUtils";

interface VehicleType {
  id: string;
  make: string;
  model: string;
  year: string;
  color: string;
  license_plate: string;
}

interface VehicleModalProps {
  visible: boolean;
  vehicle: VehicleType | null;
  onClose: () => void;
  onSave: (vehicle: Omit<VehicleType, "id">) => void;
}

export default function VehicleModal({
  visible,
  vehicle,
  onClose,
  onSave,
}: VehicleModalProps) {
  const [vehicleForm, setVehicleForm] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    license_plate: "",
  });

  const [vehicleErrors, setVehicleErrors] = useState<ValidationErrors>({});
  const [vehicleTouched, setVehicleTouched] = useState<{
    [key: string]: boolean;
  }>({});

  // Update form when vehicle prop changes
  useEffect(() => {
    if (vehicle) {
      setVehicleForm({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        license_plate: vehicle.license_plate,
      });
    } else {
      setVehicleForm({
        make: "",
        model: "",
        year: "",
        color: "",
        license_plate: "",
      });
    }
    setVehicleErrors({});
    setVehicleTouched({});
  }, [vehicle, visible]);

  const handleVehicleFieldChange = (field: string, value: string) => {
    setVehicleForm({ ...vehicleForm, [field]: value });
    if (vehicleErrors[field]) {
      const newErrors = { ...vehicleErrors };
      delete newErrors[field];
      setVehicleErrors(newErrors);
    }
  };

  const handleVehicleFieldBlur = (field: string) => {
    setVehicleTouched({ ...vehicleTouched, [field]: true });

    let validation;
    switch (field) {
      case "make":
        validation = validateVehicleMake(vehicleForm.make);
        break;
      case "model":
        validation = validateVehicleModel(vehicleForm.model);
        break;
      case "year":
        validation = validateVehicleYear(vehicleForm.year);
        break;
      case "color":
        validation = validateVehicleColor(vehicleForm.color);
        break;
      case "license_plate":
        validation = validateLicensePlate(vehicleForm.license_plate);
        break;
      default:
        return;
    }

    if (!validation.isValid) {
      setVehicleErrors({ ...vehicleErrors, [field]: validation.error || "" });
    }
  };

  const handleSaveVehicle = () => {
    const errors: ValidationErrors = {};

    const makeValidation = validateVehicleMake(vehicleForm.make);
    if (!makeValidation.isValid) errors.make = makeValidation.error!;

    const modelValidation = validateVehicleModel(vehicleForm.model);
    if (!modelValidation.isValid) errors.model = modelValidation.error!;

    const yearValidation = validateVehicleYear(vehicleForm.year);
    if (!yearValidation.isValid) errors.year = yearValidation.error!;

    const colorValidation = validateVehicleColor(vehicleForm.color);
    if (!colorValidation.isValid) errors.color = colorValidation.error!;

    const plateValidation = validateLicensePlate(vehicleForm.license_plate);
    if (!plateValidation.isValid) errors.license_plate = plateValidation.error!;

    if (Object.keys(errors).length > 0) {
      setVehicleErrors(errors);
      setVehicleTouched({
        make: true,
        model: true,
        year: true,
        color: true,
        licensePlate: true,
      });
      Alert.alert("Validation Error", "Please fix all errors before saving");
      return;
    }

    const formattedVehicle = {
      ...vehicleForm,
      license_plate: formatLicensePlate(vehicleForm.license_plate ),
    };

    onSave(formattedVehicle);
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {vehicle ? "Edit Vehicle" : "Add New Vehicle"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color="#64748b" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Make *
                {vehicleTouched.make && vehicleErrors.make && (
                  <Text style={styles.errorInline}> - {vehicleErrors.make}</Text>
                )}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  vehicleTouched.make && vehicleErrors.make && styles.inputError,
                ]}
                placeholder="e.g., Toyota, Honda"
                placeholderTextColor="#94a3b8"
                value={vehicleForm.make}
                onChangeText={(text) => handleVehicleFieldChange("make", text)}
                onBlur={() => handleVehicleFieldBlur("make")}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Model *
                {vehicleTouched.model && vehicleErrors.model && (
                  <Text style={styles.errorInline}> - {vehicleErrors.model}</Text>
                )}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  vehicleTouched.model && vehicleErrors.model && styles.inputError,
                ]}
                placeholder="e.g., Camry, Civic"
                placeholderTextColor="#94a3b8"
                value={vehicleForm.model}
                onChangeText={(text) => handleVehicleFieldChange("model", text)}
                onBlur={() => handleVehicleFieldBlur("model")}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Year *
                {vehicleTouched.year && vehicleErrors.year && (
                  <Text style={styles.errorInline}> - {vehicleErrors.year}</Text>
                )}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  vehicleTouched.year && vehicleErrors.year && styles.inputError,
                ]}
                placeholder="e.g., 2022"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={vehicleForm.year}
                onChangeText={(text) => handleVehicleFieldChange("year", text)}
                onBlur={() => handleVehicleFieldBlur("year")}
                maxLength={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Color *
                {vehicleTouched.color && vehicleErrors.color && (
                  <Text style={styles.errorInline}> - {vehicleErrors.color}</Text>
                )}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  vehicleTouched.color && vehicleErrors.color && styles.inputError,
                ]}
                placeholder="e.g., Silver, Blue"
                placeholderTextColor="#94a3b8"
                value={vehicleForm.color}
                onChangeText={(text) => handleVehicleFieldChange("color", text)}
                onBlur={() => handleVehicleFieldBlur("color")}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                License Plate *
                {vehicleTouched.licensePlate && vehicleErrors.licensePlate && (
                  <Text style={styles.errorInline}>
                    {" "}
                    - {vehicleErrors.licensePlate}
                  </Text>
                )}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  vehicleTouched.licensePlate &&
                    vehicleErrors.licensePlate &&
                    styles.inputError,
                ]}
                placeholder="e.g., ABC-1234"
                placeholderTextColor="#94a3b8"
                autoCapitalize="characters"
                value={vehicleForm.license_plate}
                onChangeText={(text) =>
                  handleVehicleFieldChange("license_plate", text)
                }
                onBlur={() => handleVehicleFieldBlur("license_plate")}
              />
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                All fields marked with * are required. Vehicle information is used
                for parking management and identification purposes.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSaveVehicle}
            >
              <Text style={styles.submitButtonText}>
                {vehicle ? "Update" : "Add"} Vehicle
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 20,
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
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});