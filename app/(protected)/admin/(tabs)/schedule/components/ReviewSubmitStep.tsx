import React from 'react';
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import type { ReservationData } from '@/types/global.types';

interface ReviewSubmitStepProps {
 
  reservationData: ReservationData;

  onPrevious: () => void;
  onSubmit: () => void;
}

export default function ReviewSubmitStep({
  reservationData,
  onPrevious,
  onSubmit,
}: ReviewSubmitStepProps) {


  
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Review Your Reservation</Text>
      <Text style={styles.cardSubtitle}>Please review all details before submitting</Text>

      <View style={styles.infoRow}>
        <Text style={styles.icon}>👤</Text>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Employee</Text>
          <Text style={styles.infoValue}>{reservationData.user_name}</Text>
        </View>
      </View>

      

      <View style={styles.infoRow}>
        <Text style={styles.icon}>🕐</Text>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Time</Text>
          <Text style={styles.infoValue}>
            {reservationData.startTime} - {reservationData.endTime}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.icon}>📍</Text>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Location</Text>
          <Text style={styles.infoValue}>{reservationData.location}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.icon}>🅿️</Text>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Parking</Text>
          <Text style={styles.infoValue}>{reservationData.parkingLot} - {`Row: ${reservationData.row}, Col: ${reservationData.col}`}</Text>
        </View>
      </View>

            <View style={styles.infoRow}>
              <Text style={styles.icon}>🔄</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Recurring</Text>
                 {reservationData.recurringDays.length > 0 ? (
                              <View style={styles.recurringSummary}>
                                <Text style={styles.recurringSummaryTitle}>
                                  Recurring Days
                                </Text>
                                {reservationData.recurringDays.map(d => (
                                  <Text
                                    key={d}
                                    style={styles.recurringSummaryText}
                                  >
                                    • {new Date(d).toDateString()}
                                  </Text>
                                ))}
                              </View>
                            ) : (
                              <Text style={styles.infoValue}>No recurring days selected</Text>
                            )}
              </View>
            </View>

      <View style={styles.buttonRow}>
        <Button
          mode="outlined"
          onPress={onPrevious}
          style={[styles.button, { flex: 1, marginRight: 8 }]}
          textColor="#1b5e20"
        >
          Previous
        </Button>
        <Button
          mode="contained"
          onPress={onSubmit}
          style={[styles.button, { flex: 2, marginLeft: 8 }]}
          buttonColor="#1b5e20"
        >
          Submit Reservation
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  icon: {
    fontSize: 24,
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  infoSubvalue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
  recurringSummary: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  recurringSummaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
    color: '#333',
  },
  recurringSummaryText: {
    fontSize: 13,
    color: '#555',
  },
});