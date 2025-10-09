import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Button, Card, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const router = useRouter();

  const stats = [
    { title: "Total Spots", value: "250", color: "#388E3C" },
    { title: "Occupied", value: "180", color: "#FBC02D" },
    { title: "Available", value: "70", color: "#4CAF50" },
    { title: "Issues", value: "2", color: "#F44336" },
  ];

  const lots = [
    { id: 1, name: "North Lot", total: 100, occupied: 75, available: 25 },
    { id: 2, name: "South Lot", total: 80, occupied: 60, available: 20 },
    { id: 3, name: "East Lot", total: 70, occupied: 45, available: 25 },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Appbar.Header style={{ backgroundColor: "#388E3C" }}>
        <Appbar.Content title="Parkmaster" titleStyle={{ color: "#fff", fontWeight: "700" }} />
        <Appbar.Action icon="account" color="#fff" onPress={() => router.push("/client-home")} />
        <Appbar.Action icon="logout" color="#fff" onPress={() => router.push("/signin")} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <Card key={index} style={styles.statCard}>
              <Card.Content>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        <View style={styles.actionContainer}>
          <Button
            mode="contained"
            onPress={() => router.push("/create-lot")}
            style={styles.createButton}
            labelStyle={{ fontSize: 16, fontWeight: "600" }}
            buttonColor="#388E3C"
          >
            Create New Parking Lot
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push("/client-home")}
            style={styles.profileButton}
            labelStyle={{ fontSize: 16, fontWeight: "600", color: "#388E3C" }}
          >
            View Profile
          </Button>
        </View>

        <Text style={styles.sectionTitle}>Parking Lots</Text>

        {lots.map((lot) => (
          <Card key={lot.id} style={styles.lotCard}>
            <Card.Content>
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
                <Button mode="outlined" style={styles.actionButton} labelStyle={{ color: "#388E3C" }}>
                  View Details
                </Button>
                <Button mode="outlined" style={styles.actionButton} labelStyle={{ color: "#388E3C" }}>
                  Manage
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { padding: 16 },
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
  borderRadius: 10,
  paddingVertical: 4,
  marginBottom: 12,
},
profileButton: {
  borderRadius: 10,
  paddingVertical: 4,
  borderColor: "#388E3C",
  borderWidth: 2,
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
    borderRadius: 8,
  },
});