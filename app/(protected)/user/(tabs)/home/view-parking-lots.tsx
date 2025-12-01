import { useRouter } from "expo-router";
import { ArrowLeft, MapPin, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
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

const API_URL = "https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net";

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
  id: number;
  user_id: number;
  parking_lot_id: number;
  space_id: number;
  start_time: string;
  end_time: string;
  status: string;
  user_name?: string;
}

interface ParkingLot {
  id: number;
  name: string;
  rows: number;
  cols: number;
  spaces: Space[];
  merged_aisles: number[];
  totalSpots: number;
  availableSpots: number;
  occupiedSpots: number;
}

export default function ViewParkingLotsScreen() {
  const router = useRouter();
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Fetch parking lots and reservations from server
  useEffect(() => {
    fetchParkingData();
  }, []);

  const fetchParkingData = async () => {
    try {
      setLoading(true);
      
      // Fetch parking lots and reservations in parallel
      const [lotsResponse, reservationsResponse] = await Promise.all([
        fetch(`${API_URL}/api/parking-lots`),
        fetch(`${API_URL}/api/reservations`)
      ]);
      
      if (!lotsResponse.ok) {
        throw new Error("Failed to fetch parking lots");
      }

      const lotsData = await lotsResponse.json();
      
      // Handle reservations - might not exist yet in your backend
      let reservationsData: Reservation[] = [];
      if (reservationsResponse.ok) {
        reservationsData = await reservationsResponse.json();
        setReservations(reservationsData);
      } else {
        console.log("Reservations endpoint not available, using empty array");
      }

      
      // Parse and process parking lots
      const processedLots = lotsData.map((lot: any) => {
        // Parse JSONB fields from PostgreSQL
        let spaces = [];
        let merged_aisles = [];
        
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

        // Apply reservation status to spaces
        const spacesWithStatus = spaces.map((space: any) => {
          // Find active reservation for this space in this lot
          const reservation = reservationsData.find(
            (r) => 
              r.space_id === space.id && 
              r.parking_lot_id === lot.id &&
              r.status === 'active' &&
              isTimeInReservationRange(r.start_time, r.end_time)
          );

          let status: SpaceStatus = "available";
          let occupiedBy: string | undefined;
          let occupiedUntil: string | undefined;

          if (reservation) {
            status = "occupied";
            occupiedBy = reservation.user_name || `User ${reservation.user_id}`;
            // Extract time from datetime string (format: HH:MM)
            occupiedUntil = new Date(reservation.end_time).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
          }

          return {
            ...space,
            status,
            occupiedBy,
            occupiedUntil,
          };
        });

        const totalSpots = lot.rows * lot.cols;
        const occupiedSpots = spacesWithStatus.filter((s: Space) => s.status === "occupied").length;
        const availableSpots = totalSpots - occupiedSpots;

        return {
          id: lot.id,
          name: lot.name,
          rows: lot.rows,
          cols: lot.cols,
          spaces: spacesWithStatus,
          merged_aisles: merged_aisles,
          totalSpots,
          availableSpots,
          occupiedSpots,
        };
      });
      
      setParkingLots(processedLots);
    } catch (error) {
      console.error("Error fetching parking data:", error);
      Alert.alert("Error", "Could not load parking data from server");
    } finally {
      setLoading(false);
    }
  };

  // Check if current time is within reservation time (for datetime strings from database)
  const isTimeInReservationRange = (startTime: string, endTime: string): boolean => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    return now >= start && now <= end;
  };

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
  const mergedAisleWidth = 0.1;
  const baseScaleValue = 25;

  const getAisleWidth = (afterRow: number, mergedAisles: number[]) => {
    return mergedAisles.includes(afterRow) ? mergedAisleWidth : aisleWidth;
  };

  const calculateLotHeight = (rows: number, mergedAisles: number[]): number => {
    let totalHeight = 0;
    for (let r = 0; r < rows; r++) {
      totalHeight += spaceDepth;
      if (r < rows - 1) {
        totalHeight += getAisleWidth(r, mergedAisles);
      }
    }
    return totalHeight;
  };

  const getRowYPosition = (row: number, mergedAisles: number[]): number => {
    let y = 0;
    for (let r = 0; r < row; r++) {
      y += spaceDepth + getAisleWidth(r, mergedAisles);
    }
    return y;
  };

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

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading parking lots...</Text>
            </View>
          ) : parkingLots.length === 0 ? (
            <View style={styles.emptyState}>
              <MapPin color="#cbd5e1" size={64} />
              <Text style={styles.emptyStateTitle}>No Parking Lots</Text>
              <Text style={styles.emptyStateText}>
                No parking lots are currently available
              </Text>
            </View>
          ) : (
            parkingLots.map((lot) => (
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
            ))
          )}
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
                      height: calculateLotHeight(selectedLot.rows, selectedLot.merged_aisles) * baseScaleValue,
                    }}
                  >
                    <Svg
                      viewBox={`0 0 ${selectedLot.cols * spaceWidth} ${calculateLotHeight(
                        selectedLot.rows,
                        selectedLot.merged_aisles
                      )}`}
                      width={selectedLot.cols * spaceWidth * baseScaleValue}
                      height={calculateLotHeight(selectedLot.rows, selectedLot.merged_aisles) * baseScaleValue}
                    >
                      <Rect
                        x={0}
                        y={0}
                        width={selectedLot.cols * spaceWidth}
                        height={calculateLotHeight(selectedLot.rows, selectedLot.merged_aisles)}
                        fill="#e9f0f7"
                        stroke="#64748b"
                        strokeWidth={0.05}
                      />
                      {selectedLot.spaces.map((space) => (
                        <React.Fragment key={space.id}>
                          <Rect
                            x={space.col * spaceWidth}
                            y={getRowYPosition(space.row, selectedLot.merged_aisles)}
                            width={spaceWidth}
                            height={spaceDepth}
                            fill={getSpaceColor(space)}
                            stroke="#1a1a1a"
                            strokeWidth={0.08}
                          />
                          <SvgText
                            x={space.col * spaceWidth + spaceWidth / 2}
                            y={getRowYPosition(space.row, selectedLot.merged_aisles) + spaceDepth / 2}
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
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
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