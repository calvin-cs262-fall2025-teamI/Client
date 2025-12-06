import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Button, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
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

export default function CreateLotScreen() {
  const navigation = useNavigation();
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

  const baseScaleValue = Platform.OS === "web" ? 40 : 18;

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

    if (r1 - 1 < 0 || r1 - 1 >= rowCount || r2 - 1 < 0 || r2 - 1 >= rowCount) {
      alert(`Row numbers must be between 1 and ${rowCount}.`);
      return;
    }

    if (Math.abs(r1 - r2) !== 1) {
      alert("Rows must be adjacent to merge.");
      return;
    }

    const lowerRow = Math.min(r1 - 1, r2 - 1);
    setMergedAisles(prev => new Set(prev).add(lowerRow));
    setMergeRow1("");
    setMergeRow2("");
    alert(`Successfully merged rows ${r1} and ${r2}!`);
  };

  const handleResetMerges = () => {
    setMergedAisles(new Set());
    alert("All row merges have been reset.");
  };

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
        return "#FBC02D"; // Yellow to match theme
      case "handicapped":
        return "#00BFFF";
      case "authorized personnel":
        return "#FF4500";
      default:
        return "#fff";
    }
  };

  const API_URL = "https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net";

  const handleSave = async () => {
    if (!lotName.trim()) {
      alert("Please enter a lot name before saving.");
      return;
    }

    // Validate that we have rows and columns
    if (rowCount <= 0 || colCount <= 0) {
      alert("Please enter valid row and column numbers.");
      return;
    }

    const payload = {
      name: lotName,
      rows: rowCount,
      cols: colCount,
      spaces: JSON.stringify(spaces), // Convert to JSON string for PostgreSQL JSONB
      merged_aisles: JSON.stringify(Array.from(mergedAisles)) // Convert to JSON string for PostgreSQL JSONB
    };

    console.log("Saving parking lot to server:", payload);

    try {
      const response = await fetch(`${API_URL}/api/parking-lots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save lot");
      }

      const result = await response.json();
      console.log("Parking lot created successfully:", result);
      alert("Parking lot saved successfully!");
      navigation.goBack();
    } catch (err: any) {
      console.error("Error saving parking lot:", err);
      alert(err.message || "Could not save parking lot. Please try again.");
    }
  };

  return (
    <View>
      <Appbar.Header style={{ backgroundColor: "#388E3C" }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content title="Create Parking Lot" color="#fff" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
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
              <Button title="Merge Rows" onPress={handleMergeRows} color="#388E3C" />
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
            <Button title="Reset Zoom" onPress={handleResetZoom} color="#388E3C" />
          </View>
        </View>

        {/* Parking Lot Canvas - FIXED VERSION */}
        {rowCount > 0 && colCount > 0 && (
          <View style={styles.canvasSection}>
            <Text style={styles.sectionTitle}>Parking Lot Preview</Text>
            <Text style={styles.helperText}>
              {Platform.OS === 'web'
                ? 'Tap any space to change its type. Use scrollbars to navigate.'
                : 'Tap any space to change its type. Pinch to zoom, drag to scroll.'}
            </Text>

            <View style={styles.canvasWrapper}>
              {Platform.OS === 'web' ? (
                // Web version - use ScrollView with proper styling
                <View style={styles.webCanvasContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    scrollEnabled={true}
                    style={styles.horizontalScroll}
                    contentContainerStyle={{ flexGrow: 0 }}
                  >
                    <ScrollView
                      showsVerticalScrollIndicator={true}
                      scrollEnabled={true}
                      style={styles.verticalScroll}
                      contentContainerStyle={{ flexGrow: 0 }}
                    >
                      <GestureDetector gesture={pinchGesture}>
                        <Animated.View
                          style={[
                            {
                              width: lotWidth * baseScaleValue,
                              height: lotHeight * baseScaleValue,
                              minHeight: 200,
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
                                  onPress={() => setEditingSpace(s)}
                                />
                                <SvgText
                                  x={s.col * spaceWidth + spaceWidth / 2}
                                  y={getRowYPosition(s.row) + spaceDepth / 2}
                                  fill="#388E3C"
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
                  </ScrollView>
                </View>
              ) : (
                // Mobile version - use ScrollView with proper container
                <View style={styles.mobileCanvasContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={true}
                    style={styles.horizontalScroll}
                  >
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      scrollEnabled={true}
                      nestedScrollEnabled={true}
                      style={styles.verticalScroll}
                    >
                      <GestureDetector gesture={pinchGesture}>
                        <Animated.View
                          style={[
                            {
                              width: lotWidth * baseScaleValue,
                              height: lotHeight * baseScaleValue,
                              minHeight: 200,
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
                                  onPress={() => setEditingSpace(s)}
                                />
                                <SvgText
                                  x={s.col * spaceWidth + spaceWidth / 2}
                                  y={getRowYPosition(s.row) + spaceDepth / 2}
                                  fill="#388E3C"
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
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        )}

        <Legend />

        <View style={styles.buttonContainer}>
          <Button title="Save Parking Lot" onPress={handleSave} color="#388E3C" />
        </View>

        {editingSpace && (
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>
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
                    <Text style={styles.modalButtonText}>{type}</Text>
                  </Pressable>
                )
              )}
              <Pressable
                style={[styles.modalButton, { backgroundColor: "#757575" }]}
                onPress={() => setEditingSpace(null)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
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
    { type: "visitor", label: "Visitor", color: "#FBC02D" },
    { type: "handicapped", label: "Handicapped", color: "#00BFFF" },
    { type: "authorized personnel", label: "Authorized Personnel", color: "#FF4500" },
  ];

  return (
    <View style={styles.legendContainer}>
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
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 4, color: "#475569", fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#f9fafb",
  },
  canvasSection: {
    marginBottom: 20,
  },
  canvasWrapper: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: 'hidden',
  },
  webCanvasContainer: {
    height: 400,
    backgroundColor: "#fff",
  },
  mobileCanvasContainer: {
    height: 400,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  horizontalScroll: {
    flex: 1,
  },
  verticalScroll: {
    flex: 1,
  },
  helperText: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 12,
    textAlign: "center",
  },
  canvas: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  buttonContainer: { marginTop: 20, marginBottom: 100 },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    width: 280,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontWeight: "600",
    marginBottom: 16,
    fontSize: 16,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#388E3C",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 6,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    textTransform: "capitalize",
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
    color: "#388E3C",
    fontWeight: "500",
  },
  legendContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 12,
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderWidth: 2,
    marginRight: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 14,
    color: "#0f172a",
  },
  zoomLevel: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 8,
  },
});