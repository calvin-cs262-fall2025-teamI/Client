import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ProgressIndicatorProps {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

const CHARCOAL = "#1F2937";
const MUTED = "#4B5563";
const TRACK = "#E5E7EB";
const GREEN = "#388E3C";

// background tint you were using (#f5f5f0)
const FADE_BG_SOLID = "rgba(245,245,240,1)";
const FADE_BG_CLEAR = "rgba(245,245,240,0)";

export default function ProgressIndicator({
  currentStep,
  setCurrentStep,
}: ProgressIndicatorProps) {
  const steps = [
    { number: 1, label: "Parking" },
    { number: 2, label: "Reservation" },
    { number: 3, label: "Review" },
  ];

  return (
    <View style={styles.wrap}>
      {/* Steps */}
      <View style={styles.container}>
        {steps.map((step, index) => {
          const active = currentStep >= step.number;
          const done = currentStep > step.number;

          return (
            <React.Fragment key={step.number}>
              <Pressable
                onPress={() => setCurrentStep(step.number)}
                style={styles.stepContainer}
                hitSlop={10}
              >
                <View style={[styles.circle, active && styles.circleActive]}>
                  <Text style={[styles.circleText, active && styles.circleTextActive]}>
                    {step.number}
                  </Text>
                </View>

                <Text style={[styles.label, active && styles.labelActive]}>
                  {step.label}
                </Text>
              </Pressable>

              {index < steps.length - 1 && (
                <View style={styles.lineWrap}>
                  <View style={[styles.line, done && styles.lineActive]} />
                </View>
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Fade overlay (TOP solid → BOTTOM transparent) */}
      <LinearGradient
        colors={[FADE_BG_SOLID, FADE_BG_CLEAR]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
        style={styles.fadeOverlay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // ✅ Wrapper that holds content + overlay
  wrap: {
    position: "relative",
    backgroundColor: "transparent",
    paddingTop: 8,
    paddingBottom: 6,
  },

  // ✅ Your row of steps
  container: {
    flexDirection: "row",
    backgroundColor: "#f5f5f0",  
    alignItems: "center",
    paddingHorizontal: 16,
  },

  stepContainer: {
    alignItems: "center",
    minWidth: 86, // a bit wider so labels feel less cramped
  },

  circle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: TRACK,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  circleActive: {
    backgroundColor: CHARCOAL, // ✅ charcoal inner bg
  },

  circleText: {
    fontSize: 18,
    fontWeight: "900",
    color: MUTED,
  },

  circleTextActive: {
    color: "#FFFFFF",
  },

  label: {
    fontSize: 15,
    fontWeight: "800",
    color: MUTED, // ✅ better than light gray
    textAlign: "center",
  },

  labelActive: {
    color: CHARCOAL,
  },

  lineWrap: {
    flex: 1,
    alignItems: "center",
  },

  line: {
    height: 3,
    width: "100%", // ✅ long line
    backgroundColor: TRACK,
    borderRadius: 999,
    marginBottom: 30, // aligns with label baseline
  },

  lineActive: {
    backgroundColor: GREEN,
  },

  // ✅ Overlay that fades EVERYTHING under it
  fadeOverlay: {
    position: "absolute",
    top: 81,
    zIndex: -1,
    left: 0,
    right: 0,
    height: 40, // tweak: 24–40 depending how strong you want the fade
  },
});
