import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
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
  withDecay,
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
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [showLocationModal, setShowLocationModal] = useState(false);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const isPanning = useSharedValue(false);

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
    alert(`Successfully merged rows ${r1} and ${r2}!`);
    
    // Clear input fields after successful merge
    setMergeRow1("");
    setMergeRow2("");
  };

  const handleResetMerges = () => {
    setMergedAisles(new Set());
    alert("All row merges have been reset.");
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.5, Math.min(savedScale.value * e.scale, 5));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .minDistance(20) // Require 20px movement before triggering pan
    .onStart(() => {
      isPanning.value = true;
    })
    .onUpdate((e) => {
      const canvasWidth = lotWidth * baseScaleValue;
      const canvasHeight = lotHeight * baseScaleValue;
      const containerWidth = Platform.OS === 'web' ? 800 : 400;
      const containerHeight = 400;
      
      const scaledWidth = canvasWidth * scale.value;
      const scaledHeight = canvasHeight * scale.value;
      
      const maxTranslateX = Math.max(0, (scaledWidth - containerWidth) / 2);
      const maxTranslateY = Math.max(0, (scaledHeight - containerHeight) / 2);
      
      const newTranslateX = savedTranslateX.value + e.translationX;
      const newTranslateY = savedTranslateY.value + e.translationY;
      
      translateX.value = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
      translateY.value = Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY));
    })
    .onEnd((e) => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      
      const canvasWidth = lotWidth * baseScaleValue;
      const canvasHeight = lotHeight * baseScaleValue;
      const containerWidth = Platform.OS === 'web' ? 800 : 400;
      const containerHeight = 400;
      
      const scaledWidth = canvasWidth * scale.value;
      const scaledHeight = canvasHeight * scale.value;
      
      const maxTranslateX = Math.max(0, (scaledWidth - containerWidth) / 2);
      const maxTranslateY = Math.max(0, (scaledHeight - containerHeight) / 2);
      
      // Apply momentum with decay and clamp to final position
      translateX.value = withDecay({
        velocity: e.velocityX,
        clamp: [-maxTranslateX, maxTranslateX],
        deceleration: 0.998,
      }, (finished) => {
        if (finished) {
          savedTranslateX.value = translateX.value;
          isPanning.value = false;
        }
      });
      
      translateY.value = withDecay({
        velocity: e.velocityY,
        clamp: [-maxTranslateY, maxTranslateY],
        deceleration: 0.998,
      }, (finished) => {
        if (finished) {
          savedTranslateY.value = translateY.value;
        }
      });
    })
    .onFinalize(() => {
      isPanning.value = false;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const handleResetZoom = () => {
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value }
      ],
    };
  });

  // Generate spaces whenever row/col changes
  useEffect(() => {
    setIsGenerating(true);
    
    // Use setTimeout to defer generation, allowing UI to update
    const timer = setTimeout(() => {
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
      setIsGenerating(false);
    }, 100);

    return () => clearTimeout(timer);
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

  const handleSpacePress = (space: Space) => {
    // Only open editor if user wasn't panning
    if (!isPanning.value) {
      setEditingSpace(space);
    }
  };

  const getSpaceColor = (space: Space) => {
    if (space.status === "inactive") {
      return "#e5e7eb"; // greyed out if not schedulable
    }

    switch (space.type) {
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
            disabled={isGenerating}
          />
          <LabelInput
            label="Rows"
            value={rows}
            setValue={setRows}
            textType="numeric"
            maxValue={20}
            disabled={isGenerating}
          />
          <LabelInput
            label="Columns"
            value={cols}
            setValue={setCols}
            textType="numeric"
            maxValue={100}
            disabled={isGenerating}
          />
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <Pressable
              onPress={() => setShowLocationModal(true)}
              style={styles.locationButton}
              disabled={isGenerating}
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
            disabled={isGenerating}
            instantUpdate={true}
            maxValue={rowCount}
          />
          <LabelInput
            label="Second Row Number"
            value={mergeRow2}
            setValue={setMergeRow2}
            textType="numeric"
            disabled={isGenerating}
            instantUpdate={true}
            maxValue={rowCount}
          />
          <View style={styles.mergeButtons}>
            <View style={styles.buttonWrapper}>
              <Button
                title="Merge Rows"
                onPress={handleMergeRows}
                color="#388E3C"
                disabled={isGenerating}
              />
            </View>
            {mergedAisles.size > 0 && (
              <View style={styles.buttonWrapper}>
                <Button
                  title="Reset Merges"
                  onPress={handleResetMerges}
                  color="#dc2626"
                  disabled={isGenerating}
                />
              </View>
            )}
          </View>
          {mergedAisles.size > 0 && (
            <Text style={styles.mergedInfo}>
              Merged aisles: {Array.from(mergedAisles).sort((a, b) => a - b).map(r => `row ${r + 1} and ${r + 2}`).join(", ")}
            </Text>
          )}
        </View>

        {/* Zoom controls */}
        <View style={styles.controls}>
          <Text style={styles.sectionTitle}>Zoom Controls</Text>
          <Text style={styles.zoomLevel}>Pinch to zoom, drag to pan</Text>
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
            {isGenerating ? (
              <View style={styles.generatingContainer}>
                <Text style={styles.generatingText}>Generating parking lot...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.helperText}>
                  {Platform.OS === "web"
                    ? "Tap any space to edit. Use scrollbars to navigate."
                    : "Tap any space to edit. Pinch to zoom, drag to pan and scroll."}
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
                          <GestureDetector gesture={composedGesture}>
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
                                      onPress={() => handleSpacePress(s)}
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
                                      onPress={() => handleSpacePress(s)}
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
                          <GestureDetector gesture={composedGesture}>
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
                                      onPress={() => handleSpacePress(s)}
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
                                      onPress={() => handleSpacePress(s)}
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
              </>
            )}
          </View>
        )}

        <Legend />

        <View style={styles.buttonContainer}>
          <Button
            title="Save Parking Lot"
            onPress={handleSave}
            color="#388E3C"
            disabled={isGenerating}
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
                Edit space P{editingSpace.id} (row {editingSpace.row + 1}, col{" "}
                {editingSpace.col + 1})
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
  maxValue = 99,
  disabled = false,
  instantUpdate = false,
}: {
  label: string;
  value: string;
  setValue: (t: string) => void;
  textType?: "numeric" | "default";
  maxValue?: number;
  disabled?: boolean;
  instantUpdate?: boolean;
}) {
  const [tempValue, setTempValue] = useState(value);

  // Sync tempValue with value prop when it changes
  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleChange = (text: string) => {
    setTempValue(text);
    
    // If instant update is enabled, update parent immediately
    if (instantUpdate) {
      if (textType === "numeric") {
        // For numeric inputs, validate but update immediately
        const numValue = parseInt(text);
        
        // Allow empty string for clearing
        if (text === "") {
          setValue("");
          return;
        }
        
        // Only update if it's a valid number
        if (!isNaN(numValue)) {
          setValue(text);
        }
      } else {
        // For text inputs, update immediately
        setValue(text);
      }
    }
  };

  const handleSubmit = () => {
    if (disabled) return;
    
    // Skip submission if instant update is enabled
    if (instantUpdate) return;
    
    if (textType === "numeric") {
      const numValue = parseInt(tempValue);
      
      if (isNaN(numValue)) {
        Alert.alert("Invalid Input", "Please enter a valid number.");
        setTempValue(value);
        return;
      }

      if (numValue > maxValue) {
        Alert.alert(
          "Value Too Large",
          `The maximum value allowed is ${maxValue}. Please enter a smaller number.`
        );
        setTempValue(value);
        return;
      }

      if (numValue < 1) {
        Alert.alert("Invalid Input", "Please enter a value of at least 1.");
        setTempValue(value);
        return;
      }

      setValue(tempValue);
    } else {
      setValue(tempValue);
    }
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        value={tempValue}
        onChangeText={handleChange}
        keyboardType={textType === "numeric" ? "numeric" : "default"}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        maxLength={textType === "numeric" ? 3 : undefined}
        editable={!disabled}
      />
      {textType === "numeric" && (
        <Text style={styles.helperTextInput}>Max value: {maxValue}</Text>
      )}
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
  inputDisabled: {
    backgroundColor: "#e2e8f0",
    color: "#94a3b8",
  },
  helperTextInput: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
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
  generatingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  generatingText: {
    fontSize: 16,
    color: "#388E3C",
    fontWeight: "500",
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
