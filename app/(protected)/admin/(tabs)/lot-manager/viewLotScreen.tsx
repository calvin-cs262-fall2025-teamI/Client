import { headerStyles } from "@/utils/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Appbar } from "react-native-paper";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

type SpaceType = "regular" | "visitor" | "handicapped" | "authorized personnel";

interface Space {
  id: number;
  row: number;
  col: number;
  type: SpaceType;
}

interface ParkingLot {
  id: number;
  name: string;
  rows: number;
  cols: number;
  spaces: Space[];
  merged_aisles: number[];
}

export default function ViewLotScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [lotName, setLotName] = useState("");
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(10);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [mergedAisles, setMergedAisles] = useState<Set<number>>(new Set());
  const [isFullScreen, setIsFullScreen] = useState(false);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const baseScaleValue = Platform.OS === "web" ? 40 : 18;

  // Standard dimensions (meters)
  const spaceWidth = 2.5;
  const spaceDepth = 5;
  const aisleWidth = 6;
  const mergedAisleWidth = 0.1;

  // Load lot data
  useEffect(() => {
    if (params.lotData) {
      try {
        const lot: ParkingLot = JSON.parse(params.lotData as string);
        console.log("Loading lot for viewing:", lot);

        setLotName(lot.name);
        setRows(lot.rows);
        setCols(lot.cols);

        if (lot.spaces && Array.isArray(lot.spaces) && lot.spaces.length > 0) {
          setSpaces(lot.spaces);
        } else {
          generateDefaultSpaces(lot.rows, lot.cols);
        }

        if (lot.merged_aisles && Array.isArray(lot.merged_aisles)) {
          setMergedAisles(new Set(lot.merged_aisles));
        }
      } catch (error) {
        console.error("Error parsing lot data:", error);
      }
    }
  }, [params.lotData]);

  const generateDefaultSpaces = (numRows: number, numCols: number) => {
    let id = 1;
    const arr: Space[] = [];
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        arr.push({ id: id++, row: r, col: c, type: "regular" });
      }
    }
    setSpaces(arr);
  };

  const getAisleWidth = (afterRow: number) => {
    return mergedAisles.has(afterRow) ? mergedAisleWidth : aisleWidth;
  };

  const calculateLotHeight = () => {
    let totalHeight = 0;
    for (let r = 0; r < rows; r++) {
      totalHeight += spaceDepth;
      if (r < rows - 1) {
        totalHeight += getAisleWidth(r);
      }
    }
    return totalHeight;
  };

  const getRowYPosition = (row: number) => {
    let y = 0;
    for (let r = 0; r < row; r++) {
      y += spaceDepth + getAisleWidth(r);
    }
    return y;
  };

  const lotWidth = cols * spaceWidth;
  const lotHeight = calculateLotHeight();

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const handleResetZoom = () => {
    scale.value = withSpring(1);
    savedScale.value = 1;
  };

  const handleZoomIn = () => {
    const newScale = Math.min(savedScale.value * 1.3, 5);
    scale.value = withSpring(newScale);
    savedScale.value = newScale;
  };

  const handleZoomOut = () => {
    const newScale = Math.max(savedScale.value * 0.7, 0.5);
    scale.value = withSpring(newScale);
    savedScale.value = newScale;
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const getSpaceColor = (type: SpaceType) => {
    switch (type) {
      case "visitor":
        return "#FBC02D";
      case "handicapped":
        return "#00BFFF";
      case "authorized personnel":
        return "#FF4500";
      default:
        return "#fff";
    }
  };

  const getSpaceTypeCount = (type: SpaceType) => {
    return spaces.filter(s => s.type === type).length;
  };

  const renderParkingLot = () => (
    <ScrollView horizontal style={styles.canvas}>
      <GestureDetector gesture={pinchGesture}>
        <Animated.View
          style={[
            {
              width: lotWidth * baseScaleValue,
              height: lotHeight * baseScaleValue,
            },
            animatedStyle
          ]}
        >
          <Svg
            viewBox={`0 0 ${lotWidth} ${lotHeight}`}
            width={lotWidth * baseScaleValue}
            height={lotHeight * baseScaleValue}
          >
            <Rect
              x={0}
              y={0}
              width={lotWidth}
              height={lotHeight}
              fill="#e9f0f7"
              stroke="#64748b"
              strokeWidth={0.05}
            />
            {spaces.map((s) => (
              <React.Fragment key={s.id}>
                <Rect
                  x={s.col * spaceWidth}
                  y={getRowYPosition(s.row)}
                  width={spaceWidth}
                  height={spaceDepth}
                  fill={getSpaceColor(s.type)}
                  stroke="#388E3C"
                  strokeWidth={0.05}
                />
                <SvgText
                  x={s.col * spaceWidth + spaceWidth / 2}
                  y={getRowYPosition(s.row) + spaceDepth / 2}
                  fill="#388E3C"
                  fontSize={0.5}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {`P${s.id}`}
                </SvgText>
              </React.Fragment>
            ))}
          </Svg>
        </Animated.View>
      </GestureDetector>
    </ScrollView>
  );

  return (
    <View style={styles.safeArea}>
    

        <View style={headerStyles.header}>
                    <View style ={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                       <Ionicons
            name="arrow-back"
            size={22}
            color="#FFFFFF"
            onPress={() => router.back()}
          />
                      <Text style={headerStyles.headerTitle}>View Parking Lot</Text>
                      <Appbar.Action
          icon={() => <Maximize2 color="#fff" size={20} />}
          onPress={() => setIsFullScreen(true)}
          color="#fff"
        />
                      
                    </View>
                  </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Lot Information Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{lotName}</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Dimensions</Text>
              <Text style={styles.infoValue}>{rows} × {cols}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Total Spaces</Text>
              <Text style={styles.infoValue}>{rows * cols}</Text>
            </View>
          </View>

          {mergedAisles.size > 0 && (
            <View style={styles.mergedAislesInfo}>
              <Text style={styles.mergedAislesText}>
                🔗 Merged aisles: {Array.from(mergedAisles).sort((a, b) => a - b).map(r => `After row ${r}`).join(", ")}
              </Text>
            </View>
          )}
        </View>

        {/* Space Type Statistics */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Space Distribution</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statColor, { backgroundColor: "#fff", borderColor: "#388E3C", borderWidth: 2 }]} />
              <Text style={styles.statLabel}>Regular</Text>
              <Text style={styles.statValue}>{getSpaceTypeCount("regular")}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statColor, { backgroundColor: "#FBC02D" }]} />
              <Text style={styles.statLabel}>Visitor</Text>
              <Text style={styles.statValue}>{getSpaceTypeCount("visitor")}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statColor, { backgroundColor: "#00BFFF" }]} />
              <Text style={styles.statLabel}>Handicapped</Text>
              <Text style={styles.statValue}>{getSpaceTypeCount("handicapped")}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statColor, { backgroundColor: "#FF4500" }]} />
              <Text style={styles.statLabel}>Authorized</Text>
              <Text style={styles.statValue}>{getSpaceTypeCount("authorized personnel")}</Text>
            </View>
          </View>
        </View>

        {/* Zoom Controls */}
        <View style={styles.controls}>
          <Text style={styles.sectionTitle}>Zoom Controls</Text>
          <View style={styles.zoomButtonsRow}>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
              <ZoomOut color="#388E3C" size={20} />
              <Text style={styles.zoomButtonText}>Zoom Out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={handleResetZoom}>
              <RotateCcw color="#388E3C" size={20} />
              <Text style={styles.zoomButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
              <ZoomIn color="#388E3C" size={20} />
              <Text style={styles.zoomButtonText}>Zoom In</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.zoomHint}>Pinch to zoom • Drag to pan</Text>
        </View>

        {/* Parking Lot Visualization */}
        <View style={styles.canvasWrapper}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={styles.sectionTitle}>Parking Lot Layout</Text>

            <TouchableOpacity
              onPress={() => setIsFullScreen(true)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                backgroundColor: "#388E3C",
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>View in Fullscreen</Text>
            </TouchableOpacity>
          </View>

          {renderParkingLot()}
        </View>

        {/* Legend */}
        <Legend />
      </ScrollView>

      {/* Full Screen Modal */}
      <Modal
        visible={isFullScreen}
        animationType="slide"
        onRequestClose={() => setIsFullScreen(false)}
      >
        <View style={styles.fullScreenContainer}>
          <View style={styles.fullScreenHeader}>
            <Text style={styles.fullScreenTitle}>{lotName}</Text>
            <View style={styles.fullScreenControls}>
              <TouchableOpacity style={styles.fullScreenButton} onPress={handleZoomOut}>
                <ZoomOut color="#fff" size={20} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.fullScreenButton} onPress={handleResetZoom}>
                <RotateCcw color="#fff" size={20} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.fullScreenButton} onPress={handleZoomIn}>
                <ZoomIn color="#fff" size={20} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fullScreenButton, styles.closeButton]}
                onPress={() => setIsFullScreen(false)}
              >
                <Minimize2 color="#fff" size={20} />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            horizontal={false}
            bounces={false}
          >
            {renderParkingLot()}
          </ScrollView>
          <View style={styles.fullScreenLegend}>
            <Legend compact />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Legend({ compact = false }: { compact?: boolean }) {
  const legendItems: { type: SpaceType; label: string; color: string }[] = [
    { type: "regular", label: "Regular", color: "#fff" },
    { type: "visitor", label: "Visitor", color: "#FBC02D" },
    { type: "handicapped", label: "Handicapped", color: "#00BFFF" },
    { type: "authorized personnel", label: "Authorized Personnel", color: "#FF4500" },
  ];

  if (compact) {
    return (
      <View style={styles.legendContainerCompact}>
        {legendItems.map((item) => (
          <View key={item.type} style={styles.legendItemCompact}>
            <View
              style={[styles.legendColorCompact, { backgroundColor: item.color, borderColor: "#388E3C" }]}
            />
            <Text style={styles.legendLabelCompact}>{item.label}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.legendContainer}>
      <Text style={styles.sectionTitle}>Legend</Text>
      {legendItems.map((item) => (
        <View key={item.type} style={styles.legendItem}>
          <View
            style={[styles.legendColor, { backgroundColor: item.color, borderColor: "#388E3C" }]}
          />
          <Text style={styles.legendLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f3f6f9" },
  container: { padding: 20 },
  infoCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#388E3C",
  },
  mergedAislesInfo: {
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
  },
  mergedAislesText: {
    fontSize: 13,
    color: "#15803d",
    fontWeight: "500",
    textAlign: "center",
  },
  statsCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
  },
  statColor: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginBottom: 8,
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
  controls: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#0f172a",
  },
  zoomButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  zoomButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 12,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#388E3C",
  },
  zoomButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#388E3C",
  },
  zoomHint: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  canvasWrapper: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  canvas: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginTop: 8,
  },
  legendContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  legendColor: {
    width: 24,
    height: 24,
    borderWidth: 2,
    marginRight: 12,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "500",
  },

  // Full Screen Styles
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#1e293b",
  },
  fullScreenHeader: {
    backgroundColor: "#388E3C",
    padding: 16,
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fullScreenTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  fullScreenControls: {
    flexDirection: "row",
    gap: 8,
  },
  fullScreenButton: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  closeButton: {
    backgroundColor: "rgba(239, 68, 68, 0.3)",
  },
  fullScreenContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e293b",
  },
  fullScreenLegend: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 12,
  },
  legendContainerCompact: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  legendItemCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendColorCompact: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderRadius: 3,
  },
  legendLabelCompact: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
});