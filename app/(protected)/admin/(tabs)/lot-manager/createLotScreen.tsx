import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Appbar } from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

type SpaceType =
  | "regular"
  | "visitor"
  | "handicapped"
  | "authorized personnel";

type SpaceStatus = "active" | "inactive";

interface Space {
  id: number;
  row: number;
  col: number;
  type: SpaceType;
  user_id?: string | null;
  status: SpaceStatus;
}

const API_URL =
  "https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net";

export default function CreateLotScreen() {
  const navigation = useNavigation();

  const [rows, setRows] = useState("4");
  const [cols, setCols] = useState("10");
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);

  const [editingUserId, setEditingUserId] = useState<string>("");
  const [editingStatus, setEditingStatus] = useState<SpaceStatus>("active");
  const [editingType, setEditingType] = useState<SpaceType>("regular");

  const [lotName, setLotName] = useState("");
  const [mergeRow1, setMergeRow1] = useState("");
  const [mergeRow2, setMergeRow2] = useState("");
  const [mergedAisles, setMergedAisles] = useState<Set<number>>(new Set());

  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [showLocationModal, setShowLocationModal] = useState(false);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const baseScaleValue = Platform.OS === "web" ? 40 : 18;

  // Predefined location options for parking lots
  const locations = [
    "Main Campus",
    "Venema Hall",
    "Zuidema Fieldhouse",
    "Central Plaza",
    "Visitor Parking",
  ];

  // Standard dimensions (meters)
  const spaceWidth = 2.5;
  const spaceDepth = 5;
  const aisleWidth = 6;
  const mergedAisleWidth = 0.1;

  const rowCount = parseInt(rows) || 0;
  const colCount = parseInt(cols) || 0;

  const getAisleWidth = (afterRow: number) =>
    mergedAisles.has(afterRow) ? mergedAisleWidth : aisleWidth;

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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Generate spaces whenever row/col changes
  useEffect(() => {
    let id = 1;
    const arr: Space[] = [];
    for (let r = 0; r < rowCount; r++) {
      for (let c = 0; c < colCount; c++) {
        arr.push({
          id: id++,
          row: r,
          col: c,
          type: "regular",
          user_id: null,
          status: "active",
        });
      }
    }
    setSpaces(arr);
  }, [rowCount, colCount]);

  // When opening the edit modal, sync local editing state
  useEffect(() => {
    if (editingSpace) {
      setEditingUserId(editingSpace.user_id ?? "");
      setEditingStatus(editingSpace.status);
      setEditingType(editingSpace.type);
    }
  }, [editingSpace]);

  const updateSpace = (id: number, updates: Partial<Space>) => {
    setSpaces((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const getSpaceColor = (space: Space) => {
    if (space.status === "inactive") {
      return "#e5e7eb"; // greyed out if not schedulable
    }

    switch (space.type) {
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

  const handleSave = async () => {
    if (!lotName.trim()) {
      alert("Please enter a lot name before saving.");
      return;
    }

    if (!selectedLocation) {
      alert("Please select a location for this parking lot.");
      return;
    }

    if (rowCount <= 0 || colCount <= 0) {
      alert("Please enter valid row and column numbers.");
      return;
    }

    const payload = {
      name: lotName,
      rows: rowCount,
      cols: colCount,
      location: selectedLocation,
      capacity: rowCount * colCount,
      spaces: JSON.stringify(spaces),
      merged_aisles: JSON.stringify(Array.from(mergedAisles)),
    };


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
    <SafeAreaView style={styles.safeArea}>
      <Appbar.Header style={{ backgroundColor: "#388E3C" }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content title="Create Parking Lot" color="#fff" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Lot details */}
        <View style={styles.controls}>
          <LabelInput
            label="Lot Name"
            value={lotName}
            setValue={setLotName}
            textType="default"
          />
          <LabelInput
            label="Rows"
            value={rows}
            setValue={setRows}
            textType="numeric"
          />
          <LabelInput
            label="Columns"
            value={cols}
            setValue={setCols}
            textType="numeric"
          />
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <Pressable
              onPress={() => setShowLocationModal(true)}
              style={styles.locationButton}
            >
              <Text style={styles.locationText}>
                {selectedLocation ? selectedLocation : "Select location"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Merge rows */}
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
              <Button
                title="Merge Rows"
                onPress={handleMergeRows}
                color="#388E3C"
              />
            </View>
            {mergedAisles.size > 0 && (
              <View style={styles.buttonWrapper}>
                <Button
                  title="Reset Merges"
                  onPress={handleResetMerges}
                  color="#dc2626"
                />
              </View>
            )}
          </View>
          {mergedAisles.size > 0 && (
            <Text style={styles.mergedInfo}>
              Merged aisles:{" "}
              {Array.from(mergedAisles)
                .sort((a, b) => a - b)
                .map((r) => `After row ${r}`)
                .join(", ")}
            </Text>
          )}
        </View>

        {/* Zoom controls */}
        <View style={styles.controls}>
          <Text style={styles.sectionTitle}>Zoom Controls</Text>
          <Text style={styles.zoomLevel}>Pinch to zoom in/out</Text>
          <View style={styles.buttonWrapper}>
            <Button
              title="Reset Zoom"
              onPress={handleResetZoom}
              color="#388E3C"
            />
          </View>
        </View>

        {/* Parking Lot Canvas */}
        {rowCount > 0 && colCount > 0 && (
          <View style={styles.canvasSection}>
            <Text style={styles.sectionTitle}>Parking Lot Preview</Text>
            <Text style={styles.helperText}>
              {Platform.OS === "web"
                ? "Tap any space to edit. Use scrollbars to navigate."
                : "Tap any space to edit. Pinch to zoom, drag to scroll."}
            </Text>

            <View style={styles.canvasWrapper}>
              {Platform.OS === "web" ? (
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
                            animatedStyle,
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
                                  fill={getSpaceColor(s)}
                                  stroke={
                                    s.status === "inactive"
                                      ? "#9ca3af"
                                      : "#388E3C"
                                  }
                                  strokeWidth={0.05}
                                  onPress={() => setEditingSpace(s)}
                                />
                                <SvgText
                                  x={s.col * spaceWidth + spaceWidth / 2}
                                  y={getRowYPosition(s.row) + spaceDepth / 2}
                                  fill={
                                    s.status === "inactive"
                                      ? "#6b7280"
                                      : "#388E3C"
                                  }
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
                            animatedStyle,
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
                                  fill={getSpaceColor(s)}
                                  stroke={
                                    s.status === "inactive"
                                      ? "#9ca3af"
                                      : "#388E3C"
                                  }
                                  strokeWidth={0.05}
                                  onPress={() => setEditingSpace(s)}
                                />
                                <SvgText
                                  x={s.col * spaceWidth + spaceWidth / 2}
                                  y={getRowYPosition(s.row) + spaceDepth / 2}
                                  fill={
                                    s.status === "inactive"
                                      ? "#6b7280"
                                      : "#388E3C"
                                  }
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
          <Button
            title="Save Parking Lot"
            onPress={handleSave}
            color="#388E3C"
          />
        </View>
      </ScrollView>

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Select Location</Text>

            {locations.map((loc) => (
              <Pressable
                key={loc}
                style={styles.modalButton}
                onPress={() => {
                  setSelectedLocation(loc);
                  setShowLocationModal(false);
                }}
              >
                <Text style={styles.modalButtonText}>{loc}</Text>
              </Pressable>
            ))}

            <Pressable
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => setShowLocationModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Edit Space Modal */}
      <Modal
        visible={!!editingSpace}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingSpace(null)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          {editingSpace && (
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>
                Edit space P{editingSpace.id} (row {editingSpace.row}, col{" "}
                {editingSpace.col})
              </Text>

              {/* Type selection */}
              {(
                [
                  "regular",
                  "visitor",
                  "handicapped",
                  "authorized personnel",
                ] as SpaceType[]
              ).map((type) => (
                <Pressable
                  key={type}
                  style={[
                    styles.modalButton,
                    editingType === type && { opacity: 0.7 },
                  ]}
                  onPress={() => setEditingType(type)}
                >
                  <Text style={styles.modalButtonText}>{type}</Text>
                </Pressable>
              ))}

              {/* User ID input */}
              <View style={[styles.inputGroup, { width: "100%", marginTop: 12 }]}>
                <Text style={styles.label}>Assigned User ID (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={editingUserId}
                  onChangeText={setEditingUserId}
                  placeholder="e.g. user_123 or email"
                />
              </View>

              {/* Status toggle */}
              <View style={[styles.inputGroup, { width: "100%", marginTop: 12 }]}>
                <Text style={styles.label}>Status for scheduling</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pressable
                    style={[
                      styles.modalButton,
                      { flex: 1 },
                      editingStatus === "active" && { opacity: 0.7 },
                    ]}
                    onPress={() => setEditingStatus("active")}
                  >
                    <Text style={styles.modalButtonText}>Active</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.modalButton,
                      { flex: 1, backgroundColor: "#6b7280" },
                      editingStatus === "inactive" && { opacity: 0.7 },
                    ]}
                    onPress={() => setEditingStatus("inactive")}
                  >
                    <Text style={styles.modalButtonText}>Inactive</Text>
                  </Pressable>
                </View>
              </View>

              {/* Save / Cancel */}
              <Pressable
                style={[styles.modalButton, { marginTop: 16 }]}
                onPress={() => {
                  updateSpace(editingSpace.id, {
                    type: editingType,
                    user_id: editingUserId.trim()
                      ? editingUserId.trim()
                      : null,
                    status: editingStatus,
                  });
                  setEditingSpace(null);
                }}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modalButton,
                  { backgroundColor: "#757575", marginTop: 8 },
                ]}
                onPress={() => setEditingSpace(null)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
    {
      type: "authorized personnel",
      label: "Authorized Personnel",
      color: "#FF4500",
    },
  ];

  return (
    <View style={styles.legendContainer}>
      {legendItems.map((item) => (
        <View key={item.type} style={styles.legendItem}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: item.color, borderColor: "#388E3C" },
            ]}
          />
          <Text style={styles.legendLabel}>{item.label}</Text>
        </View>
      ))}
      <View style={styles.legendItem}>
        <View
          style={[
            styles.legendColor,
            { backgroundColor: "#e5e7eb", borderColor: "#9ca3af" },
          ]}
        />
        <Text style={styles.legendLabel}>Inactive / Not schedulable</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f3f6f9" },
  container: { padding: 20, paddingBottom: 40 },
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
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: "#475569",
    fontWeight: "500",
  },
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
    overflow: "hidden",
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
  buttonContainer: { marginTop: 20, marginBottom: 40 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
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
  modalCancelButton: {
    backgroundColor: "#757575",
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
  locationButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f9fafb",
  },
  locationText: {
    fontSize: 14,
    color: "#0f172a",
  },
});
