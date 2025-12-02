import { useFocusEffect, useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
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

interface Issue {
  id: number;
  message: string;
  timestamp: string;
  userName: string;
  spotNumber?: string;
  isRead: boolean;
}

interface ParkingLot {
  id: number;
  name: string;
  rows: number;
  cols: number;
  spaces: any[];
  merged_aisles: any[];
}

export default function LotManagerScreen() {
  const router = useRouter();
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  // Sample issues - in a real app, this would come from your backend
  const [issues, setIssues] = useState<Issue[]>([
    {
      id: 1,
      message: "There's a car parked in my assigned spot. The license plate is XYZ-789. Can someone help?",
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

  const unreadCount = issues.filter(issue => !issue.isRead).length;

  const API_URL = "https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net";

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
        let spaces = [];
        let merged_aisles = [];
        
        if (typeof lot.spaces === 'string') {
          try {
            spaces = JSON.parse(lot.spaces);
          } catch (e) {
            spaces = [];
          }
        } else if (Array.isArray(lot.spaces)) {
          spaces = lot.spaces;
        }
        
        if (typeof lot.merged_aisles === 'string') {
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
          merged_aisles
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
  const totalSpots = parkingLots.reduce((sum, lot) => sum + (lot.rows * lot.cols), 0);
  const occupiedSpots = 0; // TODO: Get from real occupancy data
  const availableSpots = totalSpots - occupiedSpots;

  //Color of numbers on admin dashboard based on value
  const getIssueColor = (count: number) => {
    if (count === 0) return "#4CAF50";
    if (count < 3) return "#FBC02D";
    return "#F44336";
  };

  const getOccupiedSpotsColor = (occupied: number, total: number) => {
    if (total === 0) return "#757575";
    const ratio = occupied / total;
    if (ratio < 0.5) return "#4CAF50";
    if (ratio < 0.8) return "#FBC02D";
    return "#F44336";
  };

  const getAvailableSpotsColor = (available: number, total: number) => {
    if (total === 0) return "#757575";
    const ratio = available / total;
    if (ratio > 0.5) return "#4CAF50";
    if (ratio > 0.2) return "#FBC02D";
    return "#F44336";
  };

  const getTotalSpotsColor = () => {
    return "#4CAF50";
  };

  // Create lot cards from actual data - NO MORE MOCK DATA
  const lots = parkingLots.map(lot => {
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

  const stats = [
    {
      title: "Total Spots",
      value: totalSpots.toString(),
      color: getTotalSpotsColor(),
    },
    {
      title: "Occupied",
      value: occupiedSpots.toString(),
      color: getOccupiedSpotsColor(occupiedSpots, totalSpots || 1),
    },
    {
      title: "Available",
      value: availableSpots.toString(),
      color: getAvailableSpotsColor(availableSpots, totalSpots || 1),
    },
    {
      title: "Unread Issues",
      value: unreadCount.toString(),
      color: getIssueColor(unreadCount),
    },
  ];

  const handleViewLotDetails = async (lot: any) => {
    try {
      // Fetch full lot data from backend
      const response = await fetch(`${API_URL}/api/parking-lots/${lot.id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch lot details");
      }
      
      const fullLotData = await response.json();
      
      // Parse JSONB fields from PostgreSQL
      let spaces = [];
      let merged_aisles = [];
      
      if (typeof fullLotData.spaces === 'string') {
        try {
          spaces = JSON.parse(fullLotData.spaces);
        } catch (e) {
          console.error('Error parsing spaces:', e);
          spaces = [];
        }
      } else if (Array.isArray(fullLotData.spaces)) {
        spaces = fullLotData.spaces;
      }
      
      if (typeof fullLotData.merged_aisles === 'string') {
        try {
          merged_aisles = JSON.parse(fullLotData.merged_aisles);
        } catch (e) {
          console.error('Error parsing merged_aisles:', e);
          merged_aisles = [];
        }
      } else if (Array.isArray(fullLotData.merged_aisles)) {
        merged_aisles = fullLotData.merged_aisles;
      }
      
      const parsedLot = {
        ...fullLotData,
        spaces,
        merged_aisles
      };
      
      router.push({
        pathname: "/admin/(tabs)/lot-manager/viewLotScreen" as any,
        params: { lotData: JSON.stringify(parsedLot) }
      });
    } catch (error) {
      console.error("Error fetching lot data:", error);
      Alert.alert("Error", "Could not load parking lot details");
    }
  };

  const handleOpenNotifications = () => {
    setIsNotificationModalVisible(true);
  };

  const handleCloseNotifications = () => {
    setIsNotificationModalVisible(false);
  };

  const handleMarkAsRead = (id: number) => {
    setIssues(prev =>
      prev.map(issue =>
        issue.id === id ? { ...issue, isRead: true } : issue
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setIssues(prev => prev.map(issue => ({ ...issue, isRead: true })));
  };

  const handleDeleteIssue = (id: number) => {
    setIssues(prev => prev.filter(issue => issue.id !== id));
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Are you sure you want to sign out?");
      if (confirmed) {
        logout();
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
              logout();
            },
            style: "destructive",
          },
        ]
      );
    }
  };

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

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parkmaster</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleOpenNotifications}
            style={styles.simpleBellButton}
          >
            <Bell color="#fff" size={20} />
            {unreadCount > 0 && <View style={styles.unreadDot} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/admin/(tabs)/lot-manager/createLotScreen" as any)}
          >
            <Text style={styles.createButtonText}>Create New Parking Lot</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => router.push("/admin/(tabs)/lot-manager/manage-lots" as any)}
          >
            <Text style={styles.manageButtonText}>Manage Parking Lots</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Parking Lots</Text>

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
          /* Lot Cards - Only Real Lots from Database */
          lots.map((lot) => (
            <View key={lot.id} style={styles.lotCard}>
              <View style={styles.lotHeader}>
                <Text style={styles.lotName}>{lot.name}</Text>
                <Text style={styles.lotStats}>
                  {lot.occupied}/{lot.total}
                </Text>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: lot.total > 0 ? `${(lot.occupied / lot.total) * 100}%` : '0%',
                        backgroundColor:
                          lot.total === 0 ? "#757575" :
                          ((lot.total - lot.occupied) / lot.total) > 0.5
                            ? "#4CAF50"
                            : ((lot.total - lot.occupied) / lot.total) > 0.2
                              ? "#FBC02D"
                              : "#F44336",
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Individual Parking Lot Details*/}
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
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleViewLotDetails(lot)}
                >
                  <Text style={styles.actionButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
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
                <TouchableOpacity
                  onPress={handleCloseNotifications}
                  style={styles.closeButton}
                >
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
                    style={[
                      styles.issueCard,
                      !issue.isRead && styles.issueCardUnread
                    ]}
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
                      <Text style={styles.issueTimestamp}>
                        {formatTimestamp(issue.timestamp)}
                      </Text>
                    </View>

                    <Text style={[
                      styles.issueMessage,
                      !issue.isRead && { color: "#0f172a", fontWeight: "700" }
                    ]}>{issue.message}</Text>

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
  header: {
    backgroundColor: "#388E3C",
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  simpleBellButton: {
    position: "relative",
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F44336",
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  container: {
    padding: 16
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    marginBottom: 12,
    backgroundColor: "#fff",
    elevation: 2,
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
  },
  actionContainer: {
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: "#388E3C",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  manageButton: {
    borderRadius: 10,
    padding: 16,
    borderColor: "#388E3C",
    borderWidth: 2,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  manageButtonText: {
    color: "#388E3C",
    fontSize: 16,
    fontWeight: "600",
  },
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
    alignItems: "center",
    marginBottom: 12,
  },
  lotName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  lotStats: {
    fontSize: 16,
    fontWeight: "600",
    color: "#388E3C",
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
  issueCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
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