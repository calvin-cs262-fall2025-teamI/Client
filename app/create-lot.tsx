import React, { useEffect, useState } from "react";
import { Button, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Rect, Text as SvgText } from "react-native-svg";


type SpaceType = "regular" | "visitor" | "handicapped" | "authorized personnel";

interface Space {
  id: number;
  row: number;
  col: number;
  type: SpaceType;
}

export default function CreateLotScreen() {
  const [rows, setRows] = useState("4");
  const [cols, setCols] = useState("10");
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [lotName, setLotName] = useState("");
  const [mergeRow1, setMergeRow1] = useState("");
  const [mergeRow2, setMergeRow2] = useState("");
  const [mergedAisles, setMergedAisles] = useState<Set<number>>(new Set());
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const baseScaleValue = Platform.OS === "web" ? 40 : 18; // smaller on mobile

  // Standard dimensions (meters)
  const spaceWidth = 2.5;
  const spaceDepth = 5;
  const aisleWidth = 6;
  const mergedAisleWidth = 0.1;


  const rowCount = parseInt(rows) || 0;
  const colCount = parseInt(cols) || 0;

  const getAisleWidth = (afterRow: number) => {
    return mergedAisles.has(afterRow) ? mergedAisleWidth : aisleWidth;
  };

  const calculateLotHeight = () => {
    let totalHeight = 0;
    for (let r = 0; r < rowCount; r++) {
      totalHeight += spaceDepth;
      if (r < rowCount - 1) {
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

  const lotWidth = colCount * spaceWidth;
  const lotHeight = calculateLotHeight();

  const handleMergeRows = () => {
    const r1 = parseInt(mergeRow1);
    const r2 = parseInt(mergeRow2);

    if (isNaN(r1) || isNaN(r2)) {
      alert("Please enter valid row numbers.");
      return;
    }

    if (r1 < 0 || r1 >= rowCount || r2 < 0 || r2 >= rowCount) {
      alert(`Row numbers must be between 0 and ${rowCount - 1}.`);
      return;
    }

    if (Math.abs(r1 - r2) !== 1) {
      alert("Rows must be adjacent to merge.");
      return;
    }

    const lowerRow = Math.min(r1, r2);
    setMergedAisles(prev => new Set(prev).add(lowerRow));
    setMergeRow1("");
    setMergeRow2("");
    alert(`Successfully merged rows ${r1} and ${r2}!`);
  };

  const handleResetMerges = () => {
    setMergedAisles(new Set());
    alert("All row merges have been reset.");
  };
  // Zoom in/out map
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
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Initialize spaces when rows/cols change
  useEffect(() => {
    let id = 1;
    const arr: Space[] = [];
    for (let r = 0; r < rowCount; r++) {
      for (let c = 0; c < colCount; c++) {
        arr.push({ id: id++, row: r, col: c, type: "regular" });
      }
    }
    setSpaces(arr);
  }, [rowCount, colCount]);

  const updateSpaceType = (id: number, type: SpaceType) => {
    setSpaces((prev) => prev.map((s) => (s.id === id ? { ...s, type } : s)));
  };

  const getSpaceColor = (type: SpaceType) => {
    switch (type) {
      case "visitor":
        return "#FFD700";
      case "handicapped":
        return "#00BFFF";
      case "authorized personnel":
        return "#FF4500";
      default:
        return "#fff";
    }
  };

  const handleSave = async () => {
    if (!lotName.trim()) {
      alert("Please enter a lot name before saving.");
      return;
    }

    const payload = {
      name: lotName,
      rows: rowCount,
      cols: colCount,
      spaces,
      mergedAisles: Array.from(mergedAisles)
    };
    try {
      const response = await fetch("http://localhost:3000/api/parking-lots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to save lot");
      alert("Parking lot saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Could not save parking lot");
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Parking Lot Maker</Text>
          <View style={styles.controls}>
            <LabelInput label="Lot Name" value={lotName} setValue={setLotName} textType="default" />
            <LabelInput label="Rows" value={rows} setValue={setRows} textType="numeric" />
            <LabelInput label="Columns" value={cols} setValue={setCols} textType="numeric" />
          </View>
          <View style={styles.controls}>
            <Text style={styles.sectionTitle}>Merge Adjacent Rows</Text>
            <LabelInput
              label="First Row Number"
              value={mergeRow1}
              setValue={setMergeRow1}
              textType="numeric"
            />
            <LabelInput
              label="Second Row Number"
              value={mergeRow2}
              setValue={setMergeRow2}
              textType="numeric"
            />
            <View style={styles.mergeButtons}>
              <View style={styles.buttonWrapper}>
                <Button title="Merge Rows" onPress={handleMergeRows} />
              </View>
              {mergedAisles.size > 0 && (
                <View style={styles.buttonWrapper}>
                  <Button title="Reset Merges" onPress={handleResetMerges} color="#dc2626" />
                </View>
              )}
            </View>
            {mergedAisles.size > 0 && (
              <Text style={styles.mergedInfo}>
                Merged aisles: {Array.from(mergedAisles).sort((a, b) => a - b).map(r => `After row ${r}`).join(", ")}
              </Text>
            )}
          </View>
          <View style={styles.controls}>
            <Text style={styles.sectionTitle}>Zoom Controls</Text>
            <Text style={styles.zoomLevel}>Pinch to zoom in/out</Text>
            <View style={styles.buttonWrapper}>
              <Button title="Reset Zoom" onPress={handleResetZoom} color="#0369a1" />
            </View>
          </View>
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
                  {/* Background */}
                  <Rect
                    x={0}
                    y={0}
                    width={lotWidth}
                    height={lotHeight}
                    fill="#e9f0f7"
                    stroke="#64748b"
                    strokeWidth={0.05}
                  />
                  {/* Spaces */}
                  {spaces.map((s) => (
                    <React.Fragment key={s.id}>
                      <Rect
                        x={s.col * spaceWidth}
                        y={getRowYPosition(s.row)}
                        width={spaceWidth}
                        height={spaceDepth}
                        fill={getSpaceColor(s.type)}
                        stroke="#0b486b"
                        strokeWidth={0.05}
                        onPress={() => setEditingSpace(s)}
                      />
                      <SvgText
                        x={s.col * spaceWidth + spaceWidth / 2}
                        y={getRowYPosition(s.row) + spaceDepth / 2}
                        fill="#0b486b"
                        fontSize={0.5}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        onPress={() => setEditingSpace(s)}
                      >
                        {`P${s.id}`}
                      </SvgText>
                    </React.Fragment>
                  ))}
                </Svg>
              </Animated.View>
            </GestureDetector>
          </ScrollView>
          <Legend />
          <View style={styles.buttonContainer}>
            <Button title="Save Parking Lot" onPress={handleSave} />
          </View>

          {/* Modal for editing space type */}
          {editingSpace && (
            <View style={styles.modalOverlay}>
              <View style={styles.modal}>
                <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                  Change type for space {editingSpace.id}
                </Text>
                {(["regular", "visitor", "handicapped", "authorized personnel"] as SpaceType[]).map(
                  (type) => (
                    <Pressable
                      key={type}
                      style={styles.modalButton}
                      onPress={() => {
                        updateSpaceType(editingSpace.id, type);
                        setEditingSpace(null);
                      }}
                    >
                      <Text style={{ color: "#fff" }}>{type}</Text>
                    </Pressable>
                  )
                )}
                <Pressable
                  style={[styles.modalButton, { backgroundColor: "#aaa" }]}
                  onPress={() => setEditingSpace(null)}
                >
                  <Text style={{ color: "#fff" }}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

function LabelInput({
  label,
  value,
  setValue,
  textType = "numeric",
}: {
  label: string;
  value: string;
  setValue: (t: string) => void;
  textType?: "numeric" | "default";
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        keyboardType={textType === "numeric" ? "numeric" : "default"}
      />
    </View>
  );
}

function Legend() {
  const legendItems: { type: SpaceType; label: string; color: string }[] = [
    { type: "regular", label: "Regular", color: "#fff" },
    { type: "visitor", label: "Visitor", color: "#FFD700" },
    { type: "handicapped", label: "Handicapped", color: "#00BFFF" },
    { type: "authorized personnel", label: "Authorized Personnel", color: "#FF4500" },
  ];

  return (
    <View style={styles.legendContainer}>
      {legendItems.map((item) => (
        <View key={item.type} style={styles.legendItem}>
          <View
            style={[styles.legendColor, { backgroundColor: item.color, borderColor: "#0b486b" }]}
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
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20, color: "#0f172a" },
  controls: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 4, color: "#475569" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
    backgroundColor: "#f9fafb",
  },
  canvas: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  buttonContainer: { marginTop: 20 },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: 200,
    alignItems: "center",
  },
  modalButton: {
    backgroundColor: "#0b486b",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginVertical: 4,
    width: "100%",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#0f172a",
  },
  mergeButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  buttonWrapper: {
    flex: 1,
  },
  mergedInfo: {
    marginTop: 12,
    fontSize: 13,
    color: "#059669",
    fontWeight: "500",
  },
  legendContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 12,
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  legendColor: {
    width: 18,
    height: 18,
    borderWidth: 1,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 13,
    color: "#0f172a",
  },
  zoomLevel: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 8,
  },
});
