import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import React, { useState } from "react";
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

interface Issue {
  id: number;
  message: string;
  timestamp: string;
  userName: string;
  spotNumber?: string;
  isRead: boolean;
}

export default function LotManagerScreen() {
  const router = useRouter();
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);

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

  // Default values and parking lots for testing/until data implemented
  const defaultStats = {
    totalSpots: 250,
    occupiedSpots: 180,
    availableSpots: 70,
  };

  const lots = [
    { id: 1, name: "North Lot", total: 100, occupied: 75 },
    { id: 2, name: "South Lot", total: 80, occupied: 60 },
    { id: 3, name: "East Lot", total: 70, occupied: 45 },
  ];


  //Color of numbers on admin dashboard based on value
  const getIssueColor = (count: number) => {
    if (count === 0) return "#4CAF50";
    if (count < 3) return "#FBC02D";
    return "#F44336";
  };

  const getOccupiedSpotsColor = (occupied: number, total: number) => {
    const ratio = occupied / total;
    if (ratio < 0.5) return "#4CAF50";
    if (ratio < 0.8) return "#FBC02D";
    return "#F44336"; // Red
  };

  const getAvailableSpotsColor = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.5) return "#4CAF50";
    if (ratio > 0.2) return "#FBC02D";
    return "#F44336";
  };

  const getTotalSpotsColor = () => {
    return "#4CAF50";
  }


  const stats = [
    {
      title: "Total Spots",
      value: defaultStats.totalSpots.toString(),
      color: getTotalSpotsColor(defaultStats.totalSpots),
    },
    {
      title: "Occupied",
      value: defaultStats.occupiedSpots.toString(),
      color: getOccupiedSpotsColor(defaultStats.occupiedSpots, defaultStats.totalSpots),
    },
    {
      title: "Available",
      value: defaultStats.availableSpots.toString(),
      color: getAvailableSpotsColor(defaultStats.availableSpots, defaultStats.totalSpots),
    },
    {
      title: "Unread Issues",
      value: unreadCount.toString(),
      color: getIssueColor(unreadCount),
    },
  ];

  /*
    const oldLots = [
      { id: 1, name: "North Lot", total: 100, occupied: 75, available: 25 },
      { id: 2, name: "South Lot", total: 80, occupied: 60, available: 20 },
      { id: 3, name: "East Lot", total: 70, occupied: 45, available: 25 },
    ];
  */

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
        router.push("/screens/auth/signInScreen");
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
              router.push("/screens/auth/signInScreen");
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
          <TouchableOpacity style={styles.createButton}>
            <Text style={styles.createButtonText}>Create New Parking Lot</Text>
          </TouchableOpacity>

        </View>

        <Text style={styles.sectionTitle}>Parking Lots</Text>

        {/* Lot Cards */}
        {lots.map((lot) => (
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
                      width: `${(lot.occupied / lot.total) * 100}%`,
                      backgroundColor: lot.occupied / lot.total > 0.8 ? "#F44336" : "#388E3C",
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.lotDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Available</Text>
                <Text style={[styles.detailValue, { color: "#4CAF50" }]}>{lot.available}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Occupied</Text>
                <Text style={[styles.detailValue, { color: "#FBC02D" }]}>{lot.occupied}</Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Manage</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  profileButton: {
    borderRadius: 10,
    padding: 16,
    borderColor: "#388E3C",
    borderWidth: 2,
    alignItems: "center",
  },
  profileButtonText: {
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