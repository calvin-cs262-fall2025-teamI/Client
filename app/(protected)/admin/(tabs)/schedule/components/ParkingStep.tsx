import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import { validateName } from '../../../../../../utils/validationUtils';
import { useGlobalData } from '@/utils/GlobalDataContext';
import type { ReservationData } from '@/types/global.types';
import { ScrollView } from 'react-native-gesture-handler';

interface ParkingStepProps {
  reservationData: ReservationData;
  setReservationData: React.Dispatch<React.SetStateAction<ReservationData>>;
  onNext: () => void;
}

const GREEN = '#1b5e20';

// Static example data
const locationOptions = [
  { label: 'Main Campus', value: 'Main Campus' },
  { label: 'East Campus', value: 'East Campus' },
  { label: 'West Campus', value: 'West Campus' },
];

const lotsByLocation: Record<string, { label: string; value: string }[]> = {
  'Main Campus': [
    { label: 'Lot A', value: 'Lot A' },
    { label: 'Lot B', value: 'Lot B' },
    { label: 'Lot C', value: 'Lot C' },
  ],
  'East Campus': [
    { label: 'Lot D', value: 'Lot D' },
    { label: 'Lot E', value: 'Lot E' },
  ],
  'West Campus': [
    { label: 'Lot F', value: 'Lot F' },
    { label: 'Lot G', value: 'Lot G' },
  ],
};

const spotsByLot: Record<string, { label: string; value: string }[]> = {
  'Lot A': [
    { label: 'A1', value: 'A1' },
    { label: 'A2', value: 'A2' },
    { label: 'A3', value: 'A3' },
  ],
  'Lot B': [
    { label: 'B1', value: 'B1' },
    { label: 'B2', value: 'B2' },
  ],
  'Lot C': [
    { label: 'C1', value: 'C1' },
    { label: 'C2', value: 'C2' },
  ],
  'Lot D': [
    { label: 'D1', value: 'D1' },
    { label: 'D2', value: 'D2' },
  ],
  'Lot E': [{ label: 'E1', value: 'E1' }],
  'Lot F': [
    { label: 'F1', value: 'F1' },
    { label: 'F2', value: 'F2' },
  ],
  'Lot G': [{ label: 'G1', value: 'G1' }],
};

export default function ParkingStep({
  reservationData,
  setReservationData,
  onNext,
}: ParkingStepProps) {
  const { users } = useGlobalData();

  const [userFocus, setUserFocus] = useState(false);
  const [locationFocus, setLocationFocus] = useState(false);
  const [lotFocus, setLotFocus] = useState(false);
  const [spotFocus, setSpotFocus] = useState(false);

  const [nameError, setNameError] = useState('');
  const [touched, setTouched] = useState(false);

  const userOptions =
    users && users.length > 0
      ? users.map(u => ({ id: u.id, label: u.name, value: u.name }))
      : [];

  const lotOptions = useMemo(() => {
    if (!reservationData.location) return [];
    return lotsByLocation[reservationData.location] || [];
  }, [reservationData.location]);

  const spotOptions = useMemo(() => {
    if (!reservationData.parkingLot) return [];
    return spotsByLot[reservationData.parkingLot] || [];
  }, [reservationData.parkingLot]);

  const isFormComplete =
    !!reservationData.name &&
    !!reservationData.location &&
    !!reservationData.parkingLot &&
    !!reservationData.spot;

  const handleNext = () => {
    setTouched(true);

    if (!isFormComplete) {
      return;
    }

    const validation = validateName(reservationData.name || '');
    if (!validation.isValid) {
      setNameError(validation.error || '');
      return;
    }

    setNameError('');
    onNext();
  };

  return (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Parking</Text>
          <Text style={styles.cardSubtitle}>
            Select the desired parking spot to be reserved
          </Text>

          {/* User dropdown */}
          <View style={[styles.dropdownContainer, { zIndex: 400 }]}>
            <Text style={styles.fieldLabel}>User</Text>
            <Dropdown
              style={[
                styles.dropdown,
                userFocus && { borderColor: GREEN, borderWidth: 1 },
              ]}
              containerStyle={styles.dropdownMenu}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={userOptions}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!userFocus ? 'Select user of your choice' : '...'}
              searchPlaceholder="Search user..."
              value={reservationData.name}
              onFocus={() => setUserFocus(true)}
              onBlur={() => setUserFocus(false)}
              dropdownPosition="auto"
              flatListProps={{ nestedScrollEnabled: true }}
              onChange={item => {
                setReservationData(prev => ({ ...prev, user_id: item.id, name: item.value }));
                setUserFocus(false);
                setTouched(true);
                setNameError('');
              }}
            />
            {touched && nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}
          </View>

          {/* Location Dropdown */}
          <View style={[styles.dropdownContainer, { zIndex: 300 }]}>
            <Text style={styles.fieldLabel}>Location</Text>
            <Dropdown
              style={[
                styles.dropdown,
                locationFocus && { borderColor: GREEN, borderWidth: 1 },
              ]}
              containerStyle={styles.dropdownMenu}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={locationOptions}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!locationFocus ? 'Select location' : '...'}
              searchPlaceholder="Search location..."
              value={reservationData.location}
              onFocus={() => setLocationFocus(true)}
              onBlur={() => setLocationFocus(false)}
              dropdownPosition="auto"
              flatListProps={{ nestedScrollEnabled: true }}
              onChange={item => {
                setReservationData(prev => ({
                  ...prev,
                  location: item.value,
                  parkingLot: '',
                  spot: '',
                }));
                setLocationFocus(false);
                setTouched(true);
              }}
            />
          </View>

          {/* Parking Lot Dropdown */}
          <View style={[styles.dropdownContainer, { zIndex: 200 }]}>
            <Text style={styles.fieldLabel}>Parking Lot</Text>
            <Dropdown
              style={[
                styles.dropdown,
                lotFocus && { borderColor: GREEN, borderWidth: 1 },
              ]}
              containerStyle={styles.dropdownMenu}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={lotOptions}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={
                !reservationData.location
                  ? 'Select location first'
                  : !lotFocus
                  ? 'Select parking lot'
                  : '...'
              }
              searchPlaceholder="Search lot..."
              value={reservationData.parkingLot}
              onFocus={() => setLotFocus(true)}
              onBlur={() => setLotFocus(false)}
              dropdownPosition="auto"
              flatListProps={{ nestedScrollEnabled: true }}
              disable={!reservationData.location}
              onChange={item => {
                setReservationData(prev => ({
                  ...prev,
                  parkingLot: item.value,
                  spot: '',
                }));
                setLotFocus(false);
                setTouched(true);
              }}
            />
          </View>

          {/* Available Spot Dropdown */}
          <View style={[styles.dropdownContainer, { zIndex: 100 }]}>
            <Text style={styles.fieldLabel}>Available Spot</Text>
            <Dropdown
              style={[
                styles.dropdown,
                spotFocus && { borderColor: GREEN, borderWidth: 1 },
              ]}
              containerStyle={styles.dropdownMenu}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={spotOptions}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={
                !reservationData.parkingLot
                  ? 'Select parking lot first'
                  : !spotFocus
                  ? 'Select available spot'
                  : '...'
              }
              searchPlaceholder="Search spot..."
              value={reservationData.spot}
              onFocus={() => setSpotFocus(true)}
              onBlur={() => setSpotFocus(false)}
              dropdownPosition="auto"
              flatListProps={{ nestedScrollEnabled: true }}
              disable={!reservationData.parkingLot}
              onChange={item => {
                setReservationData(prev => ({
                  ...prev,
                  spot: item.value,
                }));
                setSpotFocus(false);
                setTouched(true);
              }}
            />
          </View>

          {/* Summary */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Selection Summary</Text>
            <Text style={styles.summaryText}>
              👤 User: {reservationData.name || '-'}
            </Text>
            <Text style={styles.summaryText}>
              📍 Location: {reservationData.location || '-'}
            </Text>
            <Text style={styles.summaryText}>
              🅿️ Lot: {reservationData.parkingLot || '-'}
            </Text>
            <Text style={styles.summaryText}>
              🔢 Spot: {reservationData.spot || '-'}
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.nextButton}
            buttonColor={GREEN}
            disabled={!isFormComplete}
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
    marginBottom: 24,
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
  dropdownContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  dropdown: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 0.7,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  dropdownMenu: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    elevation: 8,
    zIndex: 9999,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  iconStyle: {
    width: 18,
    height: 18,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 10,
    marginLeft: 4,
    fontWeight: '500',
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    color: '#333',
  },
  summaryText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  nextButton: {
    marginTop: 8,
  },
});
