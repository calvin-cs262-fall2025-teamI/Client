import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

type SpaceType = "regular" | "visitor" | "handicapped";

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

  const spaceWidth = 2.5;
  const spaceDepth = 5;
  const aisleWidth = 6;

  const rowCount = parseInt(rows) || 0;
  const colCount = parseInt(cols) || 0;

  const lotWidth = colCount * spaceWidth;
  const lotHeight = rowCount * (spaceDepth + aisleWidth) - aisleWidth;

  const screenWidth = Dimensions.get("window").width - 40;
  const screenHeight = Dimensions.get("window").height - 200;
  const scaleX = screenWidth / lotWidth;
  const scaleY = screenHeight / lotHeight;
  const scale = Math.min(scaleX, scaleY, 15);

  // Initialize spaces whenever rows/cols change
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

  const handleChangeSpaceType = (space: Space) => {
    Alert.alert(
      "Select Space Type",
      `Change type for space ${space.id}`,
      [
        { text: "Regular", onPress: () => updateSpaceType(space.id, "regular") },
        { text: "Visitor", onPress: () => updateSpaceType(space.id, "visitor") },
        { text: "Handicapped", onPress: () => updateSpaceType(space.id, "handicapped") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const updateSpaceType = (id: number, type: SpaceType) => {
    setSpaces((prev) => prev.map((s) => (s.id === id ? { ...s, type } : s)));
  };

  const getSpaceColor = (type: SpaceType) => {
    switch (type) {
      case "visitor":
        return "#FFD700";
      case "handicapped":
        return "#00BFFF";
      default:
        return "#fff";
    }
  };

  const handleSave = async () => {
    const payload = { rows: rowCount, cols: colCount, spaces };
    try {
      const response = await fetch("http://localhost:3000/api/parking-lots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to save lot");
      Alert.alert("Success", "Parking lot saved successfully!");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not save parking lot");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Parking Lot Maker</Text>

        <View style={styles.controls}>
          <LabelInput label="Rows" value={rows} setValue={setRows} />
          <LabelInput label="Columns" value={cols} setValue={setCols} />
        </View>

        <View style={styles.canvas}>
          <ScrollView horizontal contentContainerStyle={{ width: lotWidth * scale }}>
            <ScrollView contentContainerStyle={{ height: lotHeight * scale }}>
              <Svg
                viewBox={`0 0 ${lotWidth} ${lotHeight}`}
                width={lotWidth * scale}
                height={lotHeight * scale}
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

                {/* Parking Spaces */}
                {spaces.map((s) => {
                  const x = s.col * spaceWidth;
                  const y = s.row * (spaceDepth + aisleWidth);
                  return (
                    <React.Fragment key={s.id}>
                      <Rect
                        x={x}
                        y={y}
                        width={spaceWidth}
                        height={spaceDepth}
                        fill={getSpaceColor(s.type)}
                        stroke="#0b486b"
                        strokeWidth={0.05}
                        onPress={() => handleChangeSpaceType(s)}
                      />
                      <SvgText
                        x={x + spaceWidth / 2}
                        y={y + spaceDepth / 2}
                        fill="#0b486b"
                        fontSize={0.6}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                      >
                        {`${s.type === "regular" ? "P" : s.type[0].toUpperCase()}${s.id}`}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
              </Svg>
            </ScrollView>
          </ScrollView>
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Legend:</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendColor, { backgroundColor: "#fff", borderWidth: 1 }]} />
            <Text style={styles.legendLabel}>Regular</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendColor, { backgroundColor: "#FFD700" }]} />
            <Text style={styles.legendLabel}>Visitor</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendColor, { backgroundColor: "#00BFFF" }]} />
            <Text style={styles.legendLabel}>Handicapped</Text>
          </View>
        </View>

        {/* Save button */}
        <View style={styles.buttonContainer}>
          <Button title="Save Parking Lot" onPress={handleSave} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LabelInput({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (t: string) => void;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
      />
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
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: { marginTop: 20 },
  legendContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  legendTitle: { fontWeight: "700", marginBottom: 8, color: "#0f172a" },
  legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  legendColor: { width: 20, height: 20, marginRight: 8, borderColor: "#0b486b" },
  legendLabel: { fontSize: 14, color: "#475569" },
});
