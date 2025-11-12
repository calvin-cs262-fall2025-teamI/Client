import { useRouter } from "expo-router";
import { Calendar, Plus } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScheduleIndexScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#388E3C" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emptyState}>
          <Calendar color="#cbd5e1" size={64} />
          <Text style={styles.emptyStateTitle}>No Reservations Yet</Text>
          <Text style={styles.emptyStateText}>
            You do not have any parking reservations scheduled.
          </Text>

          <TouchableOpacity
            style={styles.requestButton}
            onPress={() => router.push("/user/(tabs)/schedule/reservation-request" as any)}
          >
            <Plus color="#fff" size={20} />
            <Text style={styles.requestButtonText}>Request New Spot</Text>
          </TouchableOpacity>
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
    backgroundColor: "#388E3C",
    padding: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  requestButton: {
    backgroundColor: "#388E3C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
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
});
