import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

interface ReviewSubmitStepProps {
  userData: {
    name: string;
    role: 'employee' | 'admin';
  };
  reservationData: {
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    parkingLot: string;
    spot: string;
    recurring: boolean;
    repeatPattern: string;
    endDate: string;
  };
  onPrevious: () => void;
  onSubmit: () => void;
}

export default function ReviewSubmitStep({
  userData,
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
          <Text style={styles.infoValue}>{userData.name}</Text>
          <Text style={styles.infoSubvalue}>{userData.role}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.icon}>📅</Text>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Date</Text>
          <Text style={styles.infoValue}>{reservationData.date}</Text>
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
          <Text style={styles.infoValue}>{reservationData.parkingLot} - {reservationData.spot}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.icon}>🔄</Text>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Recurring</Text>
          <Text style={styles.infoValue}>{reservationData.repeatPattern}</Text>
          <Text style={styles.infoSubvalue}>Until {reservationData.endDate}</Text>
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
});