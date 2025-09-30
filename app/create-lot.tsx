import React, { useEffect, useState } from "react";
import {
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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

  const scale = 40; // pixels per meter

  // Standard dimensions (meters)
  const spaceWidth = 2.5;
  const spaceDepth = 5;
  const aisleWidth = 6;

  const rowCount = parseInt(rows) || 0;
  const colCount = parseInt(cols) || 0;

  const lotWidth = colCount * spaceWidth;
  const lotHeight = rowCount * (spaceDepth + aisleWidth) - aisleWidth;

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
    const payload = { rows: rowCount, cols: colCount, spaces };
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Parking Lot Maker</Text>

        <View style={styles.controls}>
          <LabelInput label="Rows" value={rows} setValue={setRows} />
          <LabelInput label="Columns" value={cols} setValue={setCols} />
        </View>

        <ScrollView horizontal style={styles.canvas}>
          <View style={{ width: lotWidth * scale, height: lotHeight * scale }}>
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
              {/* Spaces */}
              {spaces.map((s) => (
                <React.Fragment key={s.id}>
                  <Rect
                    x={s.col * spaceWidth}
                    y={s.row * (spaceDepth + aisleWidth)}
                    width={spaceWidth}
                    height={spaceDepth}
                    fill={getSpaceColor(s.type)}
                    stroke="#0b486b"
                    strokeWidth={0.05}
                    onPress={() => setEditingSpace(s)}
                  />
                  <SvgText
                    x={s.col * spaceWidth + spaceWidth / 2}
                    y={s.row * (spaceDepth + aisleWidth) + spaceDepth / 2}
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
          </View>
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
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderWidth: 1,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 14,
    color: "#0f172a",
  },

});
