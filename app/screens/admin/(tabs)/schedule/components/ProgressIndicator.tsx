import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressIndicatorProps {
  currentStep: number; // 1, 2, or 3
}

export default function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const steps = [
    { number: 1, label: 'User Info' },
    { number: 2, label: 'Reservation\n& Parking' },
    { number: 3, label: 'Review & Submit' },
  ];

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <View style={styles.stepContainer}>
            <View
              style={[
                styles.circle,
                currentStep >= step.number && styles.circleActive,
              ]}
            >
              <Text
                style={[
                  styles.circleText,
                  currentStep >= step.number && styles.circleTextActive,
                ]}
              >
                {step.number}
              </Text>
            </View>
            <Text style={styles.label}>{step.label}</Text>
          </View>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.line,
                currentStep > step.number && styles.lineActive,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  circleActive: {
    backgroundColor: '#1b5e20',
  },
  circleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  circleTextActive: {
    color: '#fff',
  },
  label: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  line: {
    height: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
    marginBottom: 24,
  },
  lineActive: {
    backgroundColor: '#1b5e20',
  },
});