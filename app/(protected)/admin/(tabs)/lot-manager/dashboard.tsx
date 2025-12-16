/**
 * @file dashboard.tsx
 * @description Admin dashboard - main overview screen for parking lot management
 * @module app/(protected)/admin/(tabs)/lot-manager
 * 
 * This component serves as the central hub for parking lot administrators, providing:
 * - Real-time parking lot statistics and capacity overview
 * - Quick action buttons for common tasks
 * - List of all parking lots with individual statistics
 * - Issue reporting system (integrated with notification modal)
 * - Navigation to detailed lot views and management screens
 * 
 * Key Features:
 * - Dynamic statistics calculation from actual lot data
 * - Color-coded status indicators based on occupancy
 * - Pull-to-refresh data synchronization
 * - Issue management system with unread tracking
 * - Sign-out functionality
 */
import { headerStyles } from "@/utils/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { useAuth } from "../../../../../utils/authContext";

/**
 * Issue report structure
 * Represents user-submitted parking problems
 */
interface Issue {
  id: number;
  message: string;
  timestamp: string;
  userName: string;
  spotNumber?: string;
  isRead: boolean;
}

/**
 * Parking lot data structure from API
 * Contains lot configuration and space information
 */
interface ParkingLot {
  id: number;
  name: string;
  rows: number;
  cols: number;
  spaces: any[];
  merged_aisles: any[];
}

/**
 * LotManagerScreen Component
 * 
 * Main admin dashboard displaying parking lot overview and management options.
 * Fetches real-time data from the API and provides navigation to detailed views.
 * 
 * @component
 * @returns {JSX.Element} Admin dashboard interface
 * 
 * @example
 * ```tsx
 * // Accessed via tab navigation
 * <Tabs.Screen name="lot-manager" />
 * ```
 */
export default function LotManagerScreen() {
  const router = useRouter();
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  /**
   * Sample issue data for demonstration
   */
  const [issues, setIssues] = useState<Issue[]>([
    {
      id: 1,
      message:
        "There's a car parked in my assigned spot. The license plate is XYZ-789. Can someone help?",
      timestamp: "2025-10-11T10:30:00",
      userName: "John",
      spotNumber: "A-24",
      isRead: false,
    },
    {
      id: 2,
      message: "The parking gate is not opening properly. I've been waiting for 10 minutes.",
      timestamp: "2025-10-11T09:15:00",
      userName: "Sarah",
      spotNumber: "B-12",
      isRead: false,
    },
    {
      id: 3,
      message: "Light is out in Section C, Level 3. It's very dark in the evening.",
      timestamp: "2025-10-10T18:45:00",
      userName: "Mike",
      spotNumber: "C-45",
      isRead: true,
    },
  ]);

  const unreadCount = issues.filter((issue) => !issue.isRead).length;

  const API_URL =
    "https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net";

  // Fetch parking lots from API on mount
  useEffect(() => {
    fetchParkingLots();
  }, []);

  // Refresh data when screen comes into focus using useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      fetchParkingLots();
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  /**
   * Fetches and parses parking lot data from API
   * 
   * Handles JSON parsing for PostgreSQL JSONB fields:
   * - Spaces array (can be JSON string or array)
   * - Merged aisles array (can be JSON string or array)
   * 
   * @async
   */
  const fetchParkingLots = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/parking-lots`);

      if (!response.ok) {
        throw new Error("Failed to fetch parking lots");
      }

      const data = await response.json();

      // Parse JSONB fields from PostgreSQL
      const parsedLots = data.map((lot: any) => {
        let spaces: any[] = [];
        let merged_aisles: any[] = [];

        if (typeof lot.spaces === "string") {
          try {
            spaces = JSON.parse(lot.spaces);
          } catch (e) {
            spaces = [];
          }
        } else if (Array.isArray(lot.spaces)) {
          spaces = lot.spaces;
        }

        if (typeof lot.merged_aisles === "string") {
          try {
            merged_aisles = JSON.parse(lot.merged_aisles);
          } catch (e) {
            merged_aisles = [];
          }
        } else if (Array.isArray(lot.merged_aisles)) {
          merged_aisles = lot.merged_aisles;
        }

        return {
          id: lot.id,
          name: lot.name,
          rows: lot.rows,
          cols: lot.cols,
          spaces,
          merged_aisles,
        };
      });

      setParkingLots(parsedLots);
    } catch (error) {
      console.error("Error fetching parking lots:", error);
      Alert.alert("Error", "Could not load parking lots from server");
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from actual parking lots
  const totalSpots = parkingLots.reduce((sum, lot) => sum + lot.rows * lot.cols, 0);
  const occupiedSpots = 0; // TODO: Get from real occupancy data
  const availableSpots = totalSpots - occupiedSpots;

  /**
 * Determines color for occupied spots indicator
 * Based on occupancy percentage:
 * - Green: < 50% occupied (healthy capacity)
 * - Yellow: 50-80% occupied (moderate capacity)
 * - Red: > 80% occupied (near capacity)
 * 
 * @param occupied - Number of occupied spots
 * @param total - Total capacity
 * @returns Hex color code
 */
  const getOccupiedSpotsColor = (occupied: number, total: number) => {
    if (total === 0) return "#757575";
    const ratio = occupied / total;
    if (ratio < 0.5) return "#4CAF50";
    if (ratio < 0.8) return "#FBC02D";
    return "#F44336";
  };

  /**
 * Determines color for available spots indicator
 * Inverse of occupied spots logic:
 * - Green: > 50% available (plenty of space)
 * - Yellow: 20-50% available (moderate availability)
 * - Red: < 20% available (low availability)
 * 
 * @param available - Number of available spots
 * @param total - Total capacity
 * @returns Hex color code
 */
  const getAvailableSpotsColor = (available: number, total: number) => {
    if (total === 0) return "#757575";
    const ratio = available / total;
    if (ratio > 0.5) return "#4CAF50";
    if (ratio > 0.2) return "#FBC02D";
    return "#F44336";
  };

  // Create lot cards from actual data - NO MORE MOCK DATA
  const lots = parkingLots.map((lot) => {
    const total = lot.rows * lot.cols;
    const occupied = 0; // TODO: Get from real occupancy data
    let available = total - occupied;

    if (available < 0) {
      available = 0;
    } else if (available > total) {
      available = total;
    }

    return {
      id: lot.id,
      name: lot.name,
      total,
      occupied,
      available,
      occupiedColor: getOccupiedSpotsColor(occupied, total),
      availableColor: getAvailableSpotsColor(available, total),
    };
  });

  /**
   * Navigates to detailed lot view
   * Fetches full lot data before navigation
   * 
   * @param lot - Lot card data with basic info
   * @async
   */
  const handleViewLotDetails = async (lot: any) => {
    try {
      const response = await fetch(`${API_URL}/api/parking-lots/${lot.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch lot details");
      }

      const fullLotData = await response.json();

      // Parse JSONB fields from PostgreSQL
      let spaces: any[] = [];
      let merged_aisles: any[] = [];

      if (typeof fullLotData.spaces === "string") {
        try {
          spaces = JSON.parse(fullLotData.spaces);
        } catch (e) {
          console.error("Error parsing spaces:", e);
          spaces = [];
        }
      } else if (Array.isArray(fullLotData.spaces)) {
        spaces = fullLotData.spaces;
      }

      if (typeof fullLotData.merged_aisles === "string") {
        try {
          merged_aisles = JSON.parse(fullLotData.merged_aisles);
        } catch (e) {
          console.error("Error parsing merged_aisles:", e);
          merged_aisles = [];
        }
      } else if (Array.isArray(fullLotData.merged_aisles)) {
        merged_aisles = fullLotData.merged_aisles;
      }

      const parsedLot = {
        ...fullLotData,
        spaces,
        merged_aisles,
      };

      router.push({
        pathname: "/admin/(tabs)/lot-manager/viewLotScreen" as any,
        params: { lotData: JSON.stringify(parsedLot) },
      });
    } catch (error) {
      console.error("Error fetching lot data:", error);
      Alert.alert("Error", "Could not load parking lot details");
    }
  };

  const handleCloseNotifications = () => {
    setIsNotificationModalVisible(false);
  };

  /**
   * Marks an issue as read
   * @param id - Issue ID to mark
   */
  const handleMarkAsRead = (id: number) => {
    setIssues((prev) => prev.map((issue) => (issue.id === id ? { ...issue, isRead: true } : issue)));
  };

  /**
   * Marks all issues as read
   */
  const handleMarkAllAsRead = () => {
    setIssues((prev) => prev.map((issue) => ({ ...issue, isRead: true })));
  };

  /**
   * Deletes an issue from the list
   * @param id - Issue ID to delete
   */
  const handleDeleteIssue = (id: number) => {
    setIssues((prev) => prev.filter((issue) => issue.id !== id));
  };

  /**
   * Handles user sign out with confirmation
   * Platform-specific confirmation dialog
   */
  const handleSignOut = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to sign out?");
      if (confirmed) logout();
    } else {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          onPress: () => logout(),
          style: "destructive",
        },
      ]);
    }
  };

  /**
   * Formats timestamp into human-readable relative time
   * Examples: "5 min ago", "2h ago", "Yesterday", "3 days ago"
   * 
   * @param timestamp - ISO timestamp string
   * @returns Formatted relative time string
   */
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} min ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days === 1) {
      return "Yesterday";
    } else {
      return `${days} days ago`;
    }
  };

  /**
   * Generates human-readable status label for lot occupancy
   * 
   * @param occupied - Number of occupied spots
   * @param total - Total capacity
   * @returns Status string ("Empty", "Low", "Busy", "Near full")
   */
  const getLotStatus = (occupied: number, total: number) => {
    if (total === 0) return "No capacity";
    const ratio = occupied / total;
    if (occupied === 0) return "Empty";
    if (ratio < 0.5) return "Low";
    if (ratio < 0.8) return "Busy";
    return "Near full";
  };


  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      {/* Header */}
      <View style={headerStyles.header}>
        <View style={{ flex: 1 }}>
          <Text style={headerStyles.headerTitle}>Parkmaster</Text>
          <Text style={headerStyles.headerSubtitle}>Administration Dashboard</Text>
        </View>

        {/* Right actions */}
        <TouchableOpacity
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          style={styles.headerIconButton}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>


      <ScrollView contentContainerStyle={styles.container}>
        {/* System Overview Cards */}
        <Text style={styles.sectionHeader}>Overview</Text>
        <View style={styles.statsGrid}>
          {/* 1) Total Capacity */}
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalSpots}</Text>
            <Text style={styles.statLabel}>Total Capacity</Text>
          </View>

          {/* 2) Available */}
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{availableSpots}</Text>
            <Text style={styles.statLabel}>Available Spots</Text>
          </View>

          {/* 3) Occupied */}
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{occupiedSpots}</Text>
            <Text style={styles.statLabel}>Occupied Spots</Text>
          </View>

          {/* 4) Open Issues (charcoal + yellow) */}
          <View style={[styles.statCard, styles.issueStatCard]}>
            <Text style={styles.issueStatNumber}>{unreadCount}</Text>
            <Text style={styles.issueStatLabel}>Open Issues</Text>
          </View>
        </View>

        {/* Action Buttons (text left, icon right) */}
        <View style={styles.actionContainer}>
          <Text style={styles.sectionHeader}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/admin/(tabs)/lot-manager/createLotScreen" as any)}
            activeOpacity={0.85}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.createButtonText}>Create Parking Lot</Text>
              <Ionicons name="add-outline" size={22} color="#fff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => router.push("/admin/(tabs)/lot-manager/manage-lots" as any)}
            activeOpacity={0.85}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.manageButtonText}>Manage Lots</Text>
              <Ionicons name="layers-outline" size={22} color="#388E3C" />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>Parking Lots</Text>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading parking lots...</Text>
          </View>
        ) : lots.length === 0 ? (
          <View style={styles.emptyLotsContainer}>
            <Text style={styles.emptyLotsText}>No parking lots created yet</Text>
            <Text style={styles.emptyLotsSubtext}>Create your first parking lot to get started</Text>
          </View>
        ) : (
          lots.map((lot) => (
            <TouchableOpacity
              key={lot.id}
              style={styles.lotCard}
              activeOpacity={0.9}
              onPress={() => handleViewLotDetails(lot)}
            >

              <View style={styles.lotHeader}>
                <Text style={styles.lotName}>{lot.name}</Text>
                <Text style={styles.lotStats}>
                  {lot.occupied}/{lot.total} • {getLotStatus(lot.occupied, lot.total)}
                </Text>

              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: lot.total > 0 ? `${(lot.occupied / lot.total) * 100}%` : "0%",
                        backgroundColor:
                          lot.total === 0
                            ? "#757575"
                            : (lot.total - lot.occupied) / lot.total > 0.5
                              ? "#4CAF50"
                              : (lot.total - lot.occupied) / lot.total > 0.2
                                ? "#FBC02D"
                                : "#F44336",
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Individual Parking Lot Details */}
              <View style={styles.lotDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Available</Text>
                  <Text style={[styles.detailValue, { color: lot.availableColor }]}>{lot.available}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Occupied</Text>
                  <Text style={[styles.detailValue, { color: lot.occupiedColor }]}>{lot.occupied}</Text>
                </View>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleViewLotDetails(lot)}>
                  <Text style={styles.actionButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}



      </ScrollView>

      {/* Notifications Modal */}
      <Modal
        visible={isNotificationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseNotifications}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Issue Reports</Text>
              <View style={styles.modalHeaderActions}>
                {unreadCount > 0 && (
                  <TouchableOpacity onPress={handleMarkAllAsRead}>
                    <Text style={styles.markAllReadText}>Mark all read</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleCloseNotifications} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.notificationList}>
              {issues.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No issue reports</Text>
                </View>
              ) : (
                issues.map((issue) => (
                  <View
                    key={issue.id}
                    style={[styles.issueCard, !issue.isRead && styles.issueCardUnread]}
                  >
                    <View style={styles.issueHeader}>
                      <View style={styles.issueUserInfo}>
                        <Text style={styles.issueUserName}>{issue.userName}</Text>
                        {issue.spotNumber && (
                          <View style={styles.spotBadge}>
                            <Text style={styles.spotBadgeText}>Spot {issue.spotNumber}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.issueTimestamp}>{formatTimestamp(issue.timestamp)}</Text>
                    </View>

                    <Text
                      style={[
                        styles.issueMessage,
                        !issue.isRead && { color: "#0f172a", fontWeight: "700" },
                      ]}
                    >
                      {issue.message}
                    </Text>

                    <View style={styles.issueActions}>
                      {!issue.isRead && (
                        <TouchableOpacity
                          onPress={() => handleMarkAsRead(issue.id)}
                          style={styles.markReadButton}
                        >
                          <Text style={styles.markReadButtonText}>Mark as read</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => handleDeleteIssue(issue.id)}
                        style={styles.deleteIssueButton}
                      >
                        <Text style={styles.deleteIssueButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  // --- System Overview Cards ---
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16, // tightened (was 12)
  },

  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2e7d32",
  },

  statLabel: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },

  // Stats-only issue card (renamed to avoid conflict with modal issueCard)
  issueStatCard: {
    backgroundColor: "#1f2937",
  },

  issueStatNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fbbf24",
  },

  issueStatLabel: {
    marginTop: 4,
    fontSize: 13,
    color: "#fbbf24",
  },

  // --- Action Buttons ---
  actionContainer: {
    marginBottom: 24, // tightened (was 24)
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  createButton: {
    backgroundColor: "#388E3C",
    borderRadius: 12,          // slightly rounder = confidence
    padding: 16,
    paddingHorizontal: 18,
    minHeight: 52,
    marginBottom: 12,

    // ADD THESE
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },


  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700", // was 600
    flex: 1,
  },

  sectionHeader: {
    fontSize: 22,        // was 20 → stronger anchor
    fontWeight: "800",   // was 700 → more authority
    color: "#374151",
    marginBottom: 16,
  },


  manageButton: {
    borderRadius: 10,
    padding: 16,
    paddingHorizontal: 18,
    borderColor: "#388E3C",
    borderWidth: 2, backgroundColor: "#f8fafc", // very light neutral
    minHeight: 52,
  },

  manageButtonText: {
    color: "#388E3C",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },

  // --- Section Title ---
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },

  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#757575",
  },

  emptyLotsContainer: {
    padding: 40,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 16,
  },
  emptyLotsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptyLotsSubtext: {
    fontSize: 14,
    color: "#757575",
  },

  lotCard: {
    marginBottom: 16,
    backgroundColor: "#fff",
    elevation: 2,
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // instead of center
    marginBottom: 12,
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 10,
  },

  lotName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  lotStats: {
    fontSize: 14,          // slightly smaller so it fits
    fontWeight: "600",
    color: "#388E3C",
    maxWidth: "55%",       // prevents crowding
    textAlign: "right",
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  lotDetails: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  detailItem: {
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 24,
    fontWeight: "700",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderColor: "#388E3C",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#388E3C",
    fontWeight: "600",
  },

  // --- Modal / Issues ---
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
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  modalHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  markAllReadText: {
    fontSize: 14,
    color: "#388E3C",
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#757575",
  },
  notificationList: {
    padding: 16,
    maxHeight: 500,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#757575",
  },

  // NOTE: this "issueCard" is for the MODAL list items (kept intact)
  issueCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  issueCardUnread: {
    backgroundColor: "#f0f9ff",
    borderColor: "#388E3C",
    borderLeftWidth: 4,
  },
  issueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  issueUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  issueUserName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  spotBadge: {
    backgroundColor: "#388E3C",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  spotBadgeText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  issueTimestamp: {
    fontSize: 12,
    color: "#757575",
  },
  issueMessage: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  issueActions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  markReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#388E3C",
    borderRadius: 6,
  },
  markReadButtonText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
  },
  deleteIssueButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  deleteIssueButtonText: {
    fontSize: 13,
    color: "#F44336",
    fontWeight: "600",
  },
});
