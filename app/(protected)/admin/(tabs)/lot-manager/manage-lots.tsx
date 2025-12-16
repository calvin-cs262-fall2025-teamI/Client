import { headerStyles } from "@/utils/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Edit2, MapPin, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net";

/**
 * Represents a single parking space in the lot
 * @interface Space
 * @property {number} id - Unique identifier for the space
 * @property {number} row - Row index (0-based)
 * @property {number} col - Column index (0-based)
 * @property {"regular" | "visitor" | "handicapped" | "authorized personnel"} type - Type of parking space
 */
interface Space {
  id: number;
  row: number;
  col: number;
  type: "regular" | "visitor" | "handicapped" | "authorized personnel";
}

/**
 * Represents a complete parking lot structure
 * @interface ParkingLot
 * @property {number} id - Unique identifier for the parking lot
 * @property {string} name - Display name of the parking lot
 * @property {number} rows - Number of rows in the lot
 * @property {number} cols - Number of columns in the lot
 * @property {Space[]} spaces - Array of all parking spaces with their configurations
 * @property {number[]} merged_aisles - Array of row indices where aisles have been merged
 * @property {string} [created_at] - ISO timestamp of creation
 * @property {string} [updated_at] - ISO timestamp of last update
 */
interface ParkingLot {
  id: number;
  name: string;
  rows: number;
  cols: number;
  spaces: Space[];
  merged_aisles: number[];
  created_at?: string;
  updated_at?: string;
}

/**
 * ManageLotsScreen - Administrative screen for managing parking lots
 * 
 * This component provides a comprehensive interface for administrators to:
 * - View all parking lots in a list format
 * - See detailed statistics for each lot (total spaces, space type breakdown)
 * - Edit existing parking lot configurations
 * - Delete parking lots with confirmation
 * - Pull to refresh the parking lot list
 * 
 * @component
 * @returns {JSX.Element} The rendered manage lots screen
 * 
 * @example
 * ```tsx
 * // Navigate to manage lots screen
 * <TouchableOpacity onPress={() => router.push('/admin/manage-lots')}>
 *   <Text>Manage Parking Lots</Text>
 * </TouchableOpacity>
 * ```
 */
export default function ManageLotsScreen() {
  const router = useRouter();
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParkingLots();
  }, []);

  /**
   * Fetches all parking lots from the API
   * 
   * Handles parsing of JSONB fields from PostgreSQL database.
   * Safely parses spaces and merged_aisles fields which may come
   * as strings or already-parsed arrays from the backend.
   * 
   * @async
   * @function fetchParkingLots
   * @returns {Promise<void>}
   * @throws {Error} If the API request fails or data parsing fails
   * 
   * @example
   * ```tsx
   * // Manually refresh the lot list
   * await fetchParkingLots();
   * ```
   */
  const fetchParkingLots = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/parking-lots`);

      if (!response.ok) {
        throw new Error("Failed to fetch parking lots");
      }

      const data = await response.json();

      // Parse JSONB fields from PostgreSQL - handle both string and already-parsed arrays
      const parsedLots = data.map((lot: any) => {
        let spaces = [];
        let merged_aisles = [];

        // Handle spaces
        if (typeof lot.spaces === 'string') {
          try {
            spaces = JSON.parse(lot.spaces);
          } catch (e) {
            console.error('Error parsing spaces:', e);
            spaces = [];
          }
        } else if (Array.isArray(lot.spaces)) {
          spaces = lot.spaces;
        }

        // Handle merged_aisles
        if (typeof lot.merged_aisles === 'string') {
          try {
            merged_aisles = JSON.parse(lot.merged_aisles);
          } catch (e) {
            console.error('Error parsing merged_aisles:', e);
            merged_aisles = [];
          }
        } else if (Array.isArray(lot.merged_aisles)) {
          merged_aisles = lot.merged_aisles;
        }

        return {
          ...lot,
          spaces,
          merged_aisles
        };
      });

      setParkingLots(parsedLots);
    } catch (error) {
      console.error("Error fetching parking lots:", error);
      Alert.alert(
        "Error",
        "Could not load parking lots. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigates to the edit screen for a specific parking lot
   * Passes the complete lot data as a parameter
   * 
   * @function handleEditLot
   * @param {ParkingLot} lot - The parking lot to edit
   * @returns {void}
   * 
   * @example
   * ```tsx
   * <TouchableOpacity onPress={() => handleEditLot(selectedLot)}>
   *   <Text>Edit Lot</Text>
   * </TouchableOpacity>
   * ```
   */
  const handleEditLot = (lot: ParkingLot) => {
    // Navigate to edit screen with lot data
    router.push({
      pathname: "/admin/(tabs)/lot-manager/editLotScreen" as any,
      params: {
        lotId: lot.id.toString(),
        lotData: JSON.stringify(lot),
      },
    });
  };

  /**
   * Deletes a parking lot after user confirmation
   * 
   * Displays platform-appropriate confirmation dialog:
   * - Web: Uses native browser confirm dialog
   * - Mobile: Uses React Native Alert with Cancel/Delete options
   * 
   * After successful deletion, refreshes the parking lot list.
   * 
   * @async
   * @function handleDeleteLot
   * @param {ParkingLot} lot - The parking lot to delete
   * @returns {void}
   * @throws {Error} If the delete API request fails
   * 
   * @example
   * ```tsx
   * <TouchableOpacity onPress={() => handleDeleteLot(selectedLot)}>
   *   <Text>Delete Lot</Text>
   * </TouchableOpacity>
   * ```
   */
  const handleDeleteLot = (lot: ParkingLot) => {
    const confirmDelete = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/parking-lots/${lot.id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete parking lot");
        }

        Alert.alert("Success", `${lot.name} has been deleted`);
        fetchParkingLots(); // Refresh the list
      } catch (error) {
        console.error("Error deleting parking lot:", error);
        Alert.alert("Error", "Could not delete parking lot");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm(`Are you sure you want to delete ${lot.name}?`)) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        "Delete Parking Lot",
        `Are you sure you want to delete ${lot.name}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: confirmDelete,
          },
        ]
      );
    }
  };

  /**
   * Counts the number of spaces of a specific type in a parking lot
   * 
   * @function getSpaceTypeCount
   * @param {ParkingLot} lot - The parking lot to analyze
   * @param {"regular" | "visitor" | "handicapped" | "authorized personnel"} type - The space type to count
   * @returns {number} The number of spaces of the specified type
   * 
   * @example
   * ```tsx
   * const visitorCount = getSpaceTypeCount(lot, "visitor");
   * console.log(`Visitor spaces: ${visitorCount}`);
   * ```
   */
  const getSpaceTypeCount = (
    lot: ParkingLot,
    type: "regular" | "visitor" | "handicapped" | "authorized personnel"
  ) => {
    if (!lot.spaces || !Array.isArray(lot.spaces)) return 0;
    return lot.spaces.filter((space) => space.type === type).length;
  };

  /**
   * Calculates the total number of parking spaces in a lot
   * Based on rows × columns grid dimensions
   * 
   * @function getTotalSpaces
   * @param {ParkingLot} lot - The parking lot to calculate for
   * @returns {number} Total number of spaces (rows × cols)
   * 
   * @example
   * ```tsx
   * const total = getTotalSpaces(lot);
   * console.log(`Total capacity: ${total} spaces`);
   * ```
   */
  const getTotalSpaces = (lot: ParkingLot) => {
    return lot.rows * lot.cols;
  };

  /**
   * Renders a single parking lot card in the list
   * 
   * Displays:
   * - Lot name and dimensions
   * - Statistics breakdown (total, regular, visitor, handicapped spaces)
   * - Merged aisle information (if applicable)
   * - Edit and Delete action buttons
   * 
   * @function renderLotCard
   * @param {Object} params - Render parameters
   * @param {ParkingLot} params.item - The parking lot to render
   * @returns {JSX.Element} The rendered lot card component
   */
  const renderLotCard = ({ item: lot }: { item: ParkingLot }) => (
    <View style={styles.lotCard}>
      <View style={styles.lotHeader}>
        <View style={styles.lotHeaderLeft}>
          <MapPin color="#388E3C" size={24} />
          <View style={styles.lotHeaderText}>
            <Text style={styles.lotName}>{lot.name}</Text>
            <Text style={styles.lotDimensions}>
              {lot.rows} rows × {lot.cols} columns
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.lotStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Spaces</Text>
          <Text style={styles.statValue}>{getTotalSpaces(lot)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Regular</Text>
          <Text style={[styles.statValue, { color: "#388E3C" }]}>
            {getSpaceTypeCount(lot, "regular")}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Visitor</Text>
          <Text style={[styles.statValue, { color: "#FBC02D" }]}>
            {getSpaceTypeCount(lot, "visitor")}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Handicapped</Text>
          <Text style={[styles.statValue, { color: "#00BFFF" }]}>
            {getSpaceTypeCount(lot, "handicapped")}
          </Text>
        </View>
      </View>

      {lot.merged_aisles && lot.merged_aisles.length > 0 && (
        <View style={styles.mergedAislesInfo}>
          <Text style={styles.mergedAislesText}>
            Merged aisles: {lot.merged_aisles.map(r => `After row ${r}`).join(", ")}
          </Text>
        </View>
      )}

      <View style={styles.lotActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditLot(lot)}
        >
          <Edit2 color="#388E3C" size={18} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteLot(lot)}
        >
          <Trash2 color="#ef4444" size={18} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
        <View style={headerStyles.header}>
                    <View style ={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                       <Ionicons
            name="arrow-back"
            size={22}
            color="#FFFFFF"
            onPress={() => router.back()}
          />
                      <Text style={headerStyles.headerTitle}>Manage Parking Lots</Text>
                      
                    </View>
                  </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading parking lots...</Text>
        </View>
      ) : parkingLots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MapPin color="#cbd5e1" size={64} />
          <Text style={styles.emptyTitle}>No Parking Lots</Text>
          <Text style={styles.emptyText}>
            Create your first parking lot to get started
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() =>
              router.push("/admin/(tabs)/lot-manager/createLotScreen" as any)
            }
          >
            <Text style={styles.createButtonText}>Create Parking Lot</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={parkingLots}
          renderItem={renderLotCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={fetchParkingLots}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f6f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: "#388E3C",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
  },
  lotCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  lotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  lotHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lotHeaderText: {
    flex: 1,
  },
  lotName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  lotDimensions: {
    fontSize: 14,
    color: "#64748b",
  },
  lotStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginBottom: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  mergedAislesInfo: {
    backgroundColor: "#f0fdf4",
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  mergedAislesText: {
    fontSize: 12,
    color: "#15803d",
    fontWeight: "500",
  },
  lotActions: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#388E3C",
    backgroundColor: "#fff",
  },
  editButtonText: {
    color: "#388E3C",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },
  deleteButtonText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "600",
  },
});