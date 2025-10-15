import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Plus,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Schedule {
  id: number;
  spotNumber: string;
  location: string;
  timeRange: string;
  date: string;
  isActive: boolean;
}

export default function ReservationRequestScreen() {
  const router = useRouter();
  
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: 1,
      spotNumber: "A-24",
      location: "Building A - Level 2",
      timeRange: "8:00 AM - 6:00 PM",
      date: "Today",
      isActive: true,
    },
    {
      id: 2,
      spotNumber: "B-12",
      location: "Building B - Level 1",
      timeRange: "8:00 AM - 5:00 PM",
      date: "Tomorrow",
      isActive: false,
    },
    {
      id: 3,
      spotNumber: "C-08",
      location: "Building C - Level 3",
      timeRange: "9:00 AM - 6:00 PM",
      date: "Oct 17, 2025",
      isActive: false,
    },
  ]);

  const handleRequestSpot = () => {
    // Navigate to a form or handle request spot logic
    console.log("Request new spot");
    // You can add navigation to a request form here
    // router.push("/request-form");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservations</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Request Spot Button */}
        <View style={styles.requestSection}>
          <TouchableOpacity
            style={styles.requestButton}
            onPress={handleRequestSpot}
          >
            <Plus color="#fff" size={24} />
            <Text style={styles.requestButtonText}>Request New Spot</Text>
          </TouchableOpacity>
          <Text style={styles.requestHint}>
            Reserve a parking spot for your next visit
          </Text>
        </View>

        {/* Your Reservations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Reservations</Text>
          <Text style={styles.sectionSubtitle}>
            Manage your current and upcoming parking reservations
          </Text>

          {schedules.length > 0 ? (
            schedules.map((schedule) => (
              <View
                key={schedule.id}
                style={[
                  styles.scheduleCard,
                  !schedule.isActive && styles.scheduleCardInactive,
                ]}
              >
                <View style={styles.scheduleLeft}>
                  <View
                    style={[
                      styles.scheduleIcon,
                      !schedule.isActive && styles.scheduleIconInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.scheduleIconText,
                        !schedule.isActive && styles.scheduleIconTextInactive,
                      ]}
                    >
                      {schedule.spotNumber}
                    </Text>
                  </View>
                  <View style={styles.scheduleInfo}>
                    <Text style={styles.scheduleTitle}>{schedule.location}</Text>
                    <View style={styles.scheduleDetail}>
                      <Clock color="#64748b" size={14} />
                      <Text style={styles.scheduleDetailText}>
                        {schedule.timeRange}
                      </Text>
                    </View>
                    <View style={styles.scheduleDetail}>
                      <Calendar color="#64748b" size={14} />
                      <Text style={styles.scheduleDetailText}>
                        {schedule.date}
                      </Text>
                    </View>
                  </View>
                </View>
                {schedule.isActive && (
                  <View style={styles.activeTag}>
                    <Text style={styles.activeTagText}>Active</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Calendar color="#cbd5e1" size={48} />
              <Text style={styles.emptyStateTitle}>No Reservations</Text>
              <Text style={styles.emptyStateText}>
                You do not have any parking reservations yet
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={handleRequestSpot}
              >
                <Text style={styles.emptyStateButtonText}>
                  Request Your First Spot
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MapPin color="#4CAF50" size={20} />
            <Text style={styles.infoTitle}>Reservation Tips</Text>
          </View>
          <Text style={styles.infoText}>
            • Request spots at least 24 hours in advance{"\n"}
            • Active reservations can be modified up to 2 hours before start time{"\n"}
            • Cancel unused reservations to help others{"\n"}
            • Arrive within 15 minutes of your start time
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#4CAF50",
    padding: 20,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  requestSection: {
    padding: 16,
    paddingTop: 24,
  },
  requestButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  requestHint: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 13,
    marginTop: 8,
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  scheduleCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#4CAF50",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleCardInactive: {
    borderColor: "#e2e8f0",
  },
  scheduleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  scheduleIcon: {
    backgroundColor: "#4CAF50",
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  scheduleIconInactive: {
    backgroundColor: "#f1f5f9",
  },
  scheduleIconText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  scheduleIconTextInactive: {
    color: "#64748b",
  },
  scheduleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 6,
  },
  scheduleDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  scheduleDetailText: {
    color: "#64748b",
    fontSize: 13,
  },
  activeTag: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeTagText: {
    color: "#78350f",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#f0fdf4",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#15803d",
  },
  infoText: {
    fontSize: 13,
    color: "#15803d",
    lineHeight: 20,
  },
});