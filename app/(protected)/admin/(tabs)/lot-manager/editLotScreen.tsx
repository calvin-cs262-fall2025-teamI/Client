import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Button, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Appbar } from "react-native-paper";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

const API_URL = "https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net";

/**
 * Available parking space types
 * @typedef {"regular" | "visitor" | "handicapped" | "authorized personnel"} SpaceType
 */
type SpaceType = "regular" | "visitor" | "handicapped" | "authorized personnel";

/**
 * Represents a single parking space in the lot
 * @interface Space
 * @property {number} id - Unique identifier for the space
 * @property {number} row - Row index (0-based)
 * @property {number} col - Column index (0-based)
 * @property {SpaceType} type - Type of parking space
 */
interface Space {
  id: number;
  row: number;
  col: number;
  type: SpaceType;
}

/**
 * Represents a complete parking lot structure
 * @interface ParkingLot
 * @property {number} id - Unique identifier for the parking lot
 * @property {string} name - Display name of the parking lot
 * @property {number} rows - Number of rows in the lot
 * @property {number} cols - Number of columns in the lot
 * @property {Space[]} spaces - Array of all parking spaces
 * @property {number[]} merged_aisles - Array of row indices where aisles are merged
 */
interface ParkingLot {
  id: number;
  name: string;
  rows: number;
  cols: number;
  spaces: Space[];
  merged_aisles: number[];
}

/**
 * EditLotScreen - Screen for editing existing parking lot configurations
 * 
 * This component allows administrators to modify parking lot layouts including:
 * - Changing lot dimensions (rows and columns)
 * - Updating individual space types
 * - Merging adjacent rows to remove aisles
 * - Visual editing with zoom and pan capabilities
 * 
 * @component
 * @returns {JSX.Element} The rendered edit lot screen
 * 
 * @example
 * ```tsx
 * // Navigate with lot data
 * router.push({
 *   pathname: '/edit-lot',
 *   params: { lotData: JSON.stringify(parkingLotObject) }
 * });
 * ```
 */
export default function EditLotScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [lotName, setLotName] = useState("");
  const [rows, setRows] = useState("4");
  const [cols, setCols] = useState("10");
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [mergeRow1, setMergeRow1] = useState("");
  const [mergeRow2, setMergeRow2] = useState("");
  const [mergedAisles, setMergedAisles] = useState<Set<number>>(new Set());
  const [lotId, setLotId] = useState<number | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

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

  // Load existing lot data ONCE
  useEffect(() => {
    if (params.lotData && !dataLoaded) {
      try {
        const lot: ParkingLot = JSON.parse(params.lotData as string);
        console.log("Loading lot data:", lot);

        setLotId(lot.id);
        setLotName(lot.name);
        setRows(lot.rows.toString());
        setCols(lot.cols.toString());

        // Load spaces with their types
        if (lot.spaces && Array.isArray(lot.spaces) && lot.spaces.length > 0) {
          setSpaces(lot.spaces);
        } else {
          // Generate default spaces if none exist
          generateDefaultSpaces(lot.rows, lot.cols);
        }

        // Load merged aisles
        if (lot.merged_aisles && Array.isArray(lot.merged_aisles)) {
          setMergedAisles(new Set(lot.merged_aisles));
        }

        setDataLoaded(true);
      } catch (error) {
        console.error("Error parsing lot data:", error);
        Alert.alert("Error", "Failed to load parking lot data");
      }
    }
  }, [params.lotData, dataLoaded]);

  /**
 * Generates default parking spaces for a given grid size
 * All spaces are initialized as "regular" type
 * 
 * @function generateDefaultSpaces
 * @param {number} numRows - Number of rows to generate
 * @param {number} numCols - Number of columns to generate
 * @returns {void}
 */
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

  /**
   * Effect to load existing parking lot data on component mount
   * Parses lot data from route params and initializes state
   * Only runs once when data is first loaded
   */
  // Update spaces when dimensions change (only after initial load)
  useEffect(() => {
    if (!dataLoaded) return;

    let id = 1;
    const arr: Space[] = [];
    for (let r = 0; r < rowCount; r++) {
      for (let c = 0; c < colCount; c++) {
        // Try to preserve existing space type
        const existingSpace = spaces.find(s => s.row === r && s.col === c);
        const type = existingSpace?.type || "regular";
        arr.push({ id: id++, row: r, col: c, type });
      }
    }
    setSpaces(arr);
  }, [rowCount, colCount, dataLoaded]);

  /**
   * Gets the aisle width after a specific row
   * Returns merged width if the aisle has been merged, standard width otherwise
   * 
   * @function getAisleWidth
   * @param {number} afterRow - The row index to check after
   * @returns {number} The width of the aisle in meters
   */
  const getAisleWidth = (afterRow: number) => {
    return mergedAisles.has(afterRow) ? mergedAisleWidth : aisleWidth;
  };

  /**
   * Calculates the total height of the parking lot
   * Accounts for all rows and aisles (both standard and merged)
   * 
   * @function calculateLotHeight
   * @returns {number} Total height in meters
   */
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

  /**
   * Calculates the Y position for a given row
   * Takes into account all previous rows and their aisles
   * 
   * @function getRowYPosition
   * @param {number} row - The row index to calculate position for
   * @returns {number} Y coordinate in meters
   */
  const getRowYPosition = (row: number) => {
    let y = 0;
    for (let r = 0; r < row; r++) {
      y += spaceDepth + getAisleWidth(r);
    }
    return y;
  };

  const lotWidth = colCount * spaceWidth;
  const lotHeight = calculateLotHeight();

  /**
   * Merges two adjacent rows by removing the aisle between them
   * Validates that rows are adjacent and within valid range
   * 
   * @function handleMergeRows
   * @returns {void}
   * 
   * @example
   * ```tsx
   * // Merge rows 2 and 3
   * setMergeRow1("2");
   * setMergeRow2("3");
   * handleMergeRows();
   * ```
   */
  const handleMergeRows = () => {
    const r1 = parseInt(mergeRow1);
    const r2 = parseInt(mergeRow2);

    if (isNaN(r1) || isNaN(r2)) {
      Alert.alert("Error", "Please enter valid row numbers.");
      return;
    }

    if (r1 < 0 || r1 >= rowCount || r2 < 0 || r2 >= rowCount) {
      Alert.alert("Error", `Row numbers must be between 0 and ${rowCount - 1}.`);
      return;
    }

    if (Math.abs(r1 - r2) !== 1) {
      Alert.alert("Error", "Rows must be adjacent to merge.");
      return;
    }

    const lowerRow = Math.min(r1, r2);
    setMergedAisles(prev => new Set(prev).add(lowerRow));
    setMergeRow1("");
    setMergeRow2("");
    Alert.alert("Success", `Successfully merged rows ${r1} and ${r2}!`);
  };

  const handleResetMerges = () => {
    setMergedAisles(new Set());
    Alert.alert("Success", "All row merges have been reset.");
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  /**
 * Resets the zoom level to default (1x)
 * Animates the transition with a spring animation
 * 
 * @function handleResetZoom
 * @returns {void}
 */
  const handleResetZoom = () => {
    scale.value = withSpring(1);
    savedScale.value = 1;
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  /**
   * Updates the type of a specific parking space
   * 
   * @function updateSpaceType
   * @param {number} id - The ID of the space to update
   * @param {SpaceType} type - The new type to assign
   * @returns {void}
   */
  const updateSpaceType = (id: number, type: SpaceType) => {
    setSpaces((prev) => prev.map((s) => (s.id === id ? { ...s, type } : s)));
  };

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

  /**
   * Saves the updated parking lot configuration to the server
   * Validates lot name and ID before saving
   * Makes PUT request to update existing lot
   * 
   * @async
   * @function handleSave
   * @returns {Promise<void>}
   * @throws {Error} If the API request fails
   * 
   * @example
   * ```tsx
   * <Button title="Save Changes" onPress={handleSave} />
   * ```
   */
  const handleSave = async () => {
    if (!lotName.trim()) {
      Alert.alert("Error", "Please enter a lot name before saving.");
      return;
    }

    if (!lotId) {
      Alert.alert("Error", "Lot ID not found.");
      return;
    }

    const payload = {
      name: lotName,
      rows: rowCount,
      cols: colCount,
      spaces: JSON.stringify(spaces),
      merged_aisles: JSON.stringify(Array.from(mergedAisles))
    };

    try {
      const response = await fetch(`${API_URL}/api/parking-lots/${lotId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update lot");
      }

      Alert.alert("Success", "Parking lot updated successfully!");
      router.back();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Could not update parking lot.");
    }
  };

  return (
    <View style={styles.safeArea}>
      <Appbar.Header style={{ backgroundColor: "#388E3C" }}>
        <Appbar.Content title="Edit Parking Lot" titleStyle={{ color: "#fff" }} />
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

        <Legend />

        <View style={styles.buttonContainer}>
          <Button title="Save Changes" onPress={handleSave} color="#388E3C" />
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
  canvas: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  buttonContainer: { marginTop: 20, marginBottom: 40 },
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