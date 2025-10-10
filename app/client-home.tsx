import { Bell, Calendar, Clock, Eye, Home, MapPin, MessageSquare, Navigation, Search, User } from "lucide-react-native"
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function ClientHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a7f5a" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Parkmaster</Text>
          <Text style={styles.headerSubtitle}>Welcome back, Genny</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Search color="#fff" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Bell color="#fff" size={24} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Assigned Spot Card */}
        <View style={styles.assignedCard}>
          <View style={styles.assignedHeader}>
            <Text style={styles.assignedLabel}>Assigned Spot</Text>
            <View style={styles.activeTag}>
              <Text style={styles.activeTagText}>Active</Text>
            </View>
          </View>
          <Text style={styles.spotNumber}>A-24</Text>
          <View style={styles.spotDetail}>
            <MapPin color="#fff" size={18} />
            <Text style={styles.spotDetailText}>Building A - Level 2, Section North</Text>
          </View>
          <View style={styles.spotDetail}>
            <Clock color="#fff" size={18} />
            <Text style={styles.spotDetailText}>Valid until 6:00 PM today</Text>
          </View>
          <TouchableOpacity style={styles.directionsButton}>
            <Navigation color="#1a7f5a" size={20} />
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Your Schedule Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Schedule</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Active Schedule Item */}
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleIcon}>
              <Text style={styles.scheduleIconText}>A-24</Text>
            </View>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleTitle}>Building A - Level 2</Text>
              <View style={styles.scheduleTime}>
                <Clock color="#64748b" size={14} />
                <Text style={styles.scheduleTimeText}>8:00 AM - 6:00 PM</Text>
              </View>
            </View>
            <View style={styles.activeTagSmall}>
              <Text style={styles.activeTagText}>Active</Text>
            </View>
          </View>

          {/* Upcoming Schedule Item */}
          <View style={[styles.scheduleCard, styles.scheduleCardInactive]}>
            <View style={styles.scheduleIconInactive}>
              <Text style={styles.scheduleIconTextInactive}>B-12</Text>
            </View>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleTitle}>Building B - Level 1</Text>
              <View style={styles.scheduleTime}>
                <Clock color="#64748b" size={14} />
                <Text style={styles.scheduleTimeText}>Tomorrow, 8:00 AM</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonPrimary]}>
              <Calendar color="#fff" size={24} />
              <Text style={styles.actionButtonTextPrimary}>Request Spot</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Eye color="#1a7f5a" size={24} />
              <Text style={styles.actionButtonText}>See Spot</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MapPin color="#1a7f5a" size={24} />
              <Text style={styles.actionButtonText}>Find Parking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MessageSquare color="#1a7f5a" size={24} />
              <Text style={styles.actionButtonText}>Report Issue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Home color="#1a7f5a" size={24} />
          <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Calendar color="#64748b" size={24} />
          <Text style={styles.navText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MapPin color="#64748b" size={24} />
          <Text style={styles.navText}>Find Parking</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <User color="#64748b" size={24} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#1a7f5a",
    padding: 20,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#d1fae5",
    fontSize: 14,
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fbbf24",
  },
  content: {
    flex: 1,
  },
  assignedCard: {
    backgroundColor: "#1a7f5a",
    margin: 16,
    marginTop: -8,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  assignedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  assignedLabel: {
    color: "#d1fae5",
    fontSize: 14,
  },
  activeTag: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeTagText: {
    color: "#78350f",
    fontSize: 12,
    fontWeight: "600",
  },
  spotNumber: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "700",
    marginBottom: 12,
  },
  spotDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  spotDetailText: {
    color: "#fff",
    fontSize: 14,
  },
  directionsButton: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  directionsButtonText: {
    color: "#1a7f5a",
    fontSize: 16,
    fontWeight: "600",
  },
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
  viewAllText: {
    color: "#1a7f5a",
    fontSize: 14,
    fontWeight: "600",
  },
  scheduleCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1a7f5a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleCardInactive: {
    borderColor: "#e2e8f0",
  },
  scheduleIcon: {
    backgroundColor: "#1a7f5a",
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  scheduleIconText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  scheduleIconInactive: {
    backgroundColor: "#f1f5f9",
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  scheduleIconTextInactive: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "700",
  },
  scheduleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  scheduleTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scheduleTimeText: {
    color: "#64748b",
    fontSize: 13,
  },
  activeTagSmall: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    backgroundColor: "#fff",
    flex: 1,
    minWidth: "47%",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonPrimary: {
    backgroundColor: "#1a7f5a",
    borderColor: "#1a7f5a",
  },
  actionButtonText: {
    color: "#1a7f5a",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  actionButtonTextPrimary: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  bottomNav: {
    backgroundColor: "#fff",
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  navText: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
  },
  navTextActive: {
    color: "#1a7f5a",
    fontWeight: "600",
  },
})
