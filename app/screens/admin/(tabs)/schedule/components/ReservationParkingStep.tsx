import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Button, Switch } from 'react-native-paper';

interface ReservationParkingStepProps {
  reservationData: {
    date: string;
    startTime: string;
    endTime: string;
    recurring: boolean;
    repeatPattern: string;
    endDate: string;
    location: string;
    parkingLot: string;
    spot: string;
  };
  setReservationData: React.Dispatch<React.SetStateAction<ReservationParkingStepProps['reservationData']>>;
  onNext: () => void;
  onPrevious: () => void;
}

export default function ReservationParkingStep({
    reservationData,
    setReservationData,
    onNext,
    onPrevious,
}: ReservationParkingStepProps) {
  const [showParkingInfo, setShowParkingInfo] = useState(false);

  return (
    <ScrollView>
      {/* Reservation Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Reservation Details</Text>
        <Text style={styles.cardSubtitle}>Select date and time for your reservation</Text>

        <Text style={styles.label}>Select Date</Text>
        <TouchableOpacity style={styles.dateInput}>
          <Text>📅 {reservationData.date}</Text>
        </TouchableOpacity>

        <View style={styles.timeRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Start Time</Text>
            <TouchableOpacity style={styles.timeInput}>
              <Text>🕐 {reservationData.startTime}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>End Time</Text>
            <TouchableOpacity style={styles.timeInput}>
              <Text>🕐 {reservationData.endTime}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Recurring Reservation</Text>
            <Text style={styles.switchSubtext}>Enable to repeat this reservation</Text>
          </View>
          <Switch
            value={reservationData.recurring}
            onValueChange={(value) =>
              setReservationData({ ...reservationData, recurring: value })
            }
            color="#1b5e20"
          />
        </View>

        {reservationData.recurring && (
          <>
            <Text style={styles.label}>Repeat Pattern</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text>{reservationData.repeatPattern}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity style={styles.dateInput}>
              <Text>📅 {reservationData.endDate}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Parking Information Card */}
      <View style={[styles.card, { marginTop: 16 }]}>
        <Text style={styles.cardTitle}>Parking Information</Text>
        <Text style={styles.cardSubtitle}>Choose your parking location and spot</Text>

        <Text style={styles.label}>Location</Text>
        <TouchableOpacity style={styles.dropdown}>
          <Text>📍 {reservationData.location}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Parking Lot</Text>
        <TouchableOpacity style={styles.dropdown}>
          <Text>{reservationData.parkingLot}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Available Spot</Text>
        <TouchableOpacity style={styles.spotButton}>
          <Text>🅿️ {reservationData.spot} (Available)</Text>
        </TouchableOpacity>

       
      </View>

      {/* Navigation Buttons */}
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
          onPress={onNext}
          style={[styles.button, { flex: 1, marginLeft: 8 }]}
          buttonColor="#1b5e20"
        >
          Next
        </Button>
      </View>
    </ScrollView>
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  switchSubtext: {
    fontSize: 12,
    color: '#999',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  spotButton: {
    borderWidth: 1,
    borderColor: '#1b5e20',
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  checkButton: {
    borderColor: '#1b5e20',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },
  button: {
    flex: 1,
  },
});