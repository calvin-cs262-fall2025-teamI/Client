// CLIENT/app/screens/admin/(tabs)/users/components/VehiclesSection.tsx
import { Car, Edit2, Plus, Trash2 } from "lucide-react-native";
import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface VehicleType {
  id: string;
  make: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
}

interface VehiclesSectionProps {
  vehicles: VehicleType[];
  onAddVehicle: () => void;
  onEditVehicle: (vehicle: VehicleType) => void;
  onDeleteVehicle: (vehicleId: string) => void;
}

export default function VehiclesSection({
  vehicles,
  onAddVehicle,
  onEditVehicle,
  onDeleteVehicle,
}: VehiclesSectionProps) {
  const handleDeleteVehicle = (vehicleId: string) => {
    Alert.alert(
      "Delete Vehicle",
      "Are you sure you want to delete this vehicle?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDeleteVehicle(vehicleId),
        },
      ]
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vehicles</Text>
        <TouchableOpacity onPress={onAddVehicle} style={styles.addVehicleButton}>
          <Plus color="#fff" size={18} />
          <Text style={styles.addVehicleButtonText}>Add Vehicle</Text>
        </TouchableOpacity>
      </View>

      {vehicles.length === 0 ? (
        <View style={styles.emptyVehicles}>
          <Car size={48} color="#cbd5e1" />
          <Text style={styles.emptyVehiclesText}>No vehicles added</Text>
          <Text style={styles.emptyVehiclesSubtext}>
            Add a vehicle to get started
          </Text>
        </View>
      ) : (
        <View style={styles.vehiclesList}>
          {vehicles.map((vehicle) => (
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
                  onPress={() => onEditVehicle(vehicle)}
                  style={styles.iconButton}
                >
                  <Edit2 color="#388E3C" size={18} />
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
  addVehicleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#388E3C",
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
    borderColor: "#388E3C",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleIcon: {
    backgroundColor: "#388E3C",
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
});