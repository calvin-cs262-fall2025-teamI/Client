import { useRouter } from "expo-router";
import { ArrowLeft, MapPin, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

type SpaceType = "regular" | "visitor" | "handicapped" | "authorized personnel";
type SpaceStatus = "available" | "occupied";

interface Space {
  id: number;
  row: number;
  col: number;
  type: SpaceType;
  status: SpaceStatus;
  occupiedBy?: string;
  occupiedUntil?: string;
}

interface Reservation {
  spaceId: number;
  userName: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  lotId: number;
}

interface ParkingLot {
  id: number;
  name: string;
  rows: number;
  cols: number;
  spaces: Space[];
  totalSpots: number;
  availableSpots: number;
  occupiedSpots: number;
}

// Mock reservation data - in production, this comes from Azure
const mockReservations: Reservation[] = [
  // North Lot reservations
  { spaceId: 3, userName: "John Smith", startTime: "08:00", endTime: "17:00", lotId: 1 },
  { spaceId: 7, userName: "Sarah Johnson", startTime: "09:00", endTime: "15:00", lotId: 1 },
  { spaceId: 12, userName: "Mike Davis", startTime: "07:30", endTime: "16:00", lotId: 1 },
  
  // South Lot reservations
  { spaceId: 5, userName: "Emily Chen", startTime: "10:00", endTime: "18:00", lotId: 2 },
  { spaceId: 15, userName: "David Wilson", startTime: "08:30", endTime: "14:30", lotId: 2 },
  
  // East Lot reservations
  { spaceId: 8, userName: "Lisa Brown", startTime: "09:00", endTime: "17:30", lotId: 3 },
];

export default function ViewParkingLotsScreen() {
  const router = useRouter();
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Check if current time is within reservation time
  const isTimeInRange = (startTime: string, endTime: string): boolean => {
    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = startTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;

    const [endHour, endMin] = endTime.split(':').map(Number);
    const endMinutes = endHour * 60 + endMin;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  function generateLotWithReservations(
    lotId: number,
    name: string,
    rows: number,
    cols: number
  ): ParkingLot {
    const spaces: Space[] = [];
    let id = 1;
    let occupiedCount = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Assign space types (mostly regular, some special)
        let type: SpaceType = "regular";
        if (id % 8 === 0) type = "visitor";
        else if (id % 12 === 0) type = "handicapped";
        else if (id % 15 === 0) type = "authorized personnel";

        // Check if this space has a reservation for current time
        const reservation = mockReservations.find(
          (r) => r.spaceId === id && r.lotId === lotId
        );

        let status: SpaceStatus = "available";
        let occupiedBy: string | undefined;
        let occupiedUntil: string | undefined;

        if (reservation && isTimeInRange(reservation.startTime, reservation.endTime)) {
          status = "occupied";
          occupiedBy = reservation.userName;
          occupiedUntil = reservation.endTime;
          occupiedCount++;
        }

        spaces.push({
          id: id++,
          row: r,
          col: c,
          type,
          status,
          occupiedBy,
          occupiedUntil,
        });
      }
    }

    const totalSpots = rows * cols;
    const availableSpots = totalSpots - occupiedCount;

    return {
      id: lotId,
      name,
      rows,
      cols,
      spaces,
      totalSpots,
      availableSpots,
      occupiedSpots: occupiedCount,
    };
  }

  // Generate parking lots with time-based occupancy
  const parkingLots = React.useMemo(() => {
    return [
      generateLotWithReservations(1, "North Lot", 3, 8),
      generateLotWithReservations(2, "South Lot", 4, 6),
      generateLotWithReservations(3, "East Lot", 2, 10),
    ];
  }, [currentTime]);

  const handleViewLot = (lot: ParkingLot) => {
    setSelectedLot(lot);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedLot(null);
  };

  const getSpaceColor = (space: Space) => {
    if (space.status === "occupied") {
      return "#ef4444"; // Red for occupied
    }

    switch (space.type) {
      case "visitor":
        return "#FBC02D"; // Yellow
      case "handicapped":
        return "#00BFFF"; // Blue
      case "authorized personnel":
        return "#FF4500"; // Orange
      default:
        return "#388E3C"; // Green for available regular
    }
  };

  const spaceWidth = 2.5;
  const spaceDepth = 5;
  const aisleWidth = 6;
  const baseScaleValue = 25;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#388E3C" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Parking Lots</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Time Display */}
        <View style={styles.timeCard}>
          <Text style={styles.timeLabel}>Current Time</Text>
          <Text style={styles.timeValue}>
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
          <Text style={styles.timeHint}>Availability updates in real-time</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Parking Lots</Text>
          <Text style={styles.sectionSubtitle}>
            View real-time parking availability
          </Text>

          {parkingLots.map((lot) => (
            <View key={lot.id} style={styles.lotCard}>
              <View style={styles.lotHeader}>
                <View style={styles.lotHeaderLeft}>
                  <MapPin color="#388E3C" size={20} />
                  <Text style={styles.lotName}>{lot.name}</Text>
                </View>
                <View style={styles.lotStats}>
                  <Text style={styles.availableText}>
                    {lot.availableSpots} Available
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total</Text>
                  <Text style={styles.statValue}>{lot.totalSpots}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Available</Text>
                  <Text style={[styles.statValue, { color: "#388E3C" }]}>
                    {lot.availableSpots}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Occupied</Text>
                  <Text style={[styles.statValue, { color: "#ef4444" }]}>
                    {lot.occupiedSpots}
                  </Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(lot.occupiedSpots / lot.totalSpots) * 100}%`,
                        backgroundColor:
                          lot.occupiedSpots / lot.totalSpots > 0.8
                            ? "#ef4444"
                            : "#FBC02D",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round((lot.occupiedSpots / lot.totalSpots) * 100)}% Full
                </Text>
              </View>

              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleViewLot(lot)}
              >
                <Text style={styles.viewButtonText}>View Lot Layout</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendGrid}>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: "#388E3C" }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: "#ef4444" }]} />
              <Text style={styles.legendText}>Occupied</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: "#FBC02D" }]} />
              <Text style={styles.legendText}>Visitor</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: "#00BFFF" }]} />
              <Text style={styles.legendText}>Handicapped</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: "#FF4500" }]} />
              <Text style={styles.legendText}>Authorized</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Lot Detail Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedLot?.name} Layout
              </Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            {selectedLot && (
              <ScrollView 
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.lotInfo}>
                  <Text style={styles.lotInfoText}>
                    Total: {selectedLot.totalSpots} spots
                  </Text>
                  <Text style={styles.lotInfoText}>
                    Available: {selectedLot.availableSpots} | Occupied:{" "}
                    {selectedLot.occupiedSpots}
                  </Text>
                </View>

                <ScrollView horizontal style={styles.svgContainer}>
                  <View
                    style={{
                      width: selectedLot.cols * spaceWidth * baseScaleValue,
                      height: calculateLotHeight(selectedLot.rows) * baseScaleValue,
                    }}
                  >
                    <Svg
                      viewBox={`0 0 ${selectedLot.cols * spaceWidth} ${calculateLotHeight(
                        selectedLot.rows
                      )}`}
                      width={selectedLot.cols * spaceWidth * baseScaleValue}
                      height={calculateLotHeight(selectedLot.rows) * baseScaleValue}
                    >
                      <Rect
                        x={0}
                        y={0}
                        width={selectedLot.cols * spaceWidth}
                        height={calculateLotHeight(selectedLot.rows)}
                        fill="#e9f0f7"
                        stroke="#64748b"
                        strokeWidth={0.05}
                      />
                      {selectedLot.spaces.map((space) => (
                        <React.Fragment key={space.id}>
                          <Rect
                            x={space.col * spaceWidth}
                            y={getRowYPosition(space.row)}
                            width={spaceWidth}
                            height={spaceDepth}
                            fill={getSpaceColor(space)}
                            stroke="#1a1a1a"
                            strokeWidth={0.08}
                          />
                          <SvgText
                            x={space.col * spaceWidth + spaceWidth / 2}
                            y={getRowYPosition(space.row) + spaceDepth / 2}
                            fill="#fff"
                            fontSize={0.6}
                            fontWeight="bold"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                          >
                            {space.status === "occupied" ? "X" : `P${space.id}`}
                          </SvgText>
                        </React.Fragment>
                      ))}
                    </Svg>
                  </View>
                </ScrollView>

                {/* Show occupied spaces info */}
                {selectedLot.spaces.filter(s => s.status === "occupied").length > 0 && (
                  <View style={styles.occupiedInfoCard}>
                    <Text style={styles.occupiedInfoTitle}>Currently Occupied Spots</Text>
                    {selectedLot.spaces
                      .filter(s => s.status === "occupied")
                      .map(space => (
                        <View key={space.id} style={styles.occupiedItem}>
                          <Text style={styles.occupiedSpot}>P{space.id}</Text>
                          <View style={styles.occupiedDetails}>
                            <Text style={styles.occupiedUser}>{space.occupiedBy}</Text>
                            <Text style={styles.occupiedTime}>Until {space.occupiedUntil}</Text>
                          </View>
                        </View>
                      ))}
                  </View>
                )}

                <View style={styles.modalLegend}>
                  <Text style={styles.modalLegendTitle}>Parking Space Legend</Text>
                  <View style={styles.legendGrid}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendBox, { backgroundColor: "#388E3C" }]} />
                      <Text style={styles.legendText}>Available</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendBox, { backgroundColor: "#ef4444" }]} />
                      <Text style={styles.legendText}>Occupied</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendBox, { backgroundColor: "#FBC02D" }]} />
                      <Text style={styles.legendText}>Visitor</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendBox, { backgroundColor: "#00BFFF" }]} />
                      <Text style={styles.legendText}>Handicapped</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendBox, { backgroundColor: "#FF4500" }]} />
                      <Text style={styles.legendText}>Authorized</Text>
                    </View>
                  </View>
                  <Text style={styles.legendNote}>
                    Note: Occupied spots show as red regardless of type
                  </Text>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Helper functions remain the same
function calculateLotHeight(rows: number): number {
  const spaceDepth = 5;
  const aisleWidth = 6;
  let totalHeight = 0;
  
  for (let r = 0; r < rows; r++) {
    totalHeight += spaceDepth;
    if (r < rows - 1) {
      totalHeight += aisleWidth;
    }
  }
  
  return totalHeight;
}

function getRowYPosition(row: number): number {
  const spaceDepth = 5;
  const aisleWidth = 6;
  let y = 0;
  
  for (let r = 0; r < row; r++) {
    y += spaceDepth + aisleWidth;
  }
  
  return y;
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
  timeCard: {
    backgroundColor: "#388E3C",
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 12,
    color: "#d1fae5",
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  timeHint: {
    fontSize: 11,
    color: "#d1fae5",
  },
  section: {
    padding: 16,
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
  lotCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  lotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  lotHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  lotName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  lotStats: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  availableText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#15803d",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginBottom: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  viewButton: {
    backgroundColor: "#388E3C",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  legendCard: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 16,
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  legendText: {
    fontSize: 13,
    color: "#475569",
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
  },
  lotInfo: {
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  lotInfoText: {
    fontSize: 14,
    color: "#15803d",
    fontWeight: "500",
    marginBottom: 4,
  },
  svgContainer: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
  },
  modalLegend: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
  },
  modalLegendTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },
  legendNote: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 8,
    fontStyle: "italic",
  },
  occupiedInfoCard: {
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#fbbf24",
  },
  occupiedInfoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#78350f",
    marginBottom: 8,
  },
  occupiedItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#fde68a",
  },
  occupiedSpot: {
    fontSize: 14,
    fontWeight: "700",
    color: "#78350f",
    width: 40,
  },
  occupiedDetails: {
    flex: 1,
  },
  occupiedUser: {
    fontSize: 13,
    fontWeight: "600",
    color: "#78350f",
  },
  occupiedTime: {
    fontSize: 11,
    color: "#92400e",
    marginTop: 2,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  closeModalButton: {
    backgroundColor: "#388E3C",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  closeModalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});