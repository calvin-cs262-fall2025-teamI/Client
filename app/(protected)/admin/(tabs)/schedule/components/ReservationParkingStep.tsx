import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Button, Switch } from 'react-native-paper';
import { DatePickerInput, TimePickerModal } from 'react-native-paper-dates';
import type { ReservationData } from '@/types/global.types';  

interface ReservationParkingStepProps {
  reservationData: ReservationData;
  setReservationData: React.Dispatch<
    React.SetStateAction<ReservationParkingStepProps['reservationData']>
  >;
  onNext: () => void;
  onPrevious: () => void;
}

const GREEN = '#1b5e20';

// ---------- helpers ----------

// make sure we only give DatePickerInput a *real* Date or undefined
const toSafeDate = (value: unknown): Date | undefined => {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }
  return undefined;
};

// build a display string from hours/minutes
const formatTime = (hours: number, minutes: number): string => {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// if you ever want to derive hours/minutes from a saved string like "08:30 AM"
const parseTimeOrDefault = (
  timeStr: string | undefined,
  fallback: { hours: number; minutes: number }
): { hours: number; minutes: number } => {
  if (!timeStr) return fallback;

  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return fallback;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (isNaN(hours) || isNaN(minutes)) return fallback;

  return { hours, minutes };
};

// ---------- recurring dates helper ----------

const buildWeeklyRecurringDates = (
  start?: Date,
  end?: Date
): Date[] => {
  if (!start || !end) return [];
  if (end < start) return [];

  const dates: Date[] = [];
  const current = new Date(start);

  // zero out time portion so comparison is cleaner
  current.setHours(0, 0, 0, 0);
  const endCopy = new Date(end);
  endCopy.setHours(0, 0, 0, 0);

  while (current <= endCopy) {
    dates.push(new Date(current)); // push a copy
    current.setDate(current.getDate() + 7); // weekly
  }

  return dates;
};

export default function ReservationParkingStep({
  reservationData,
  setReservationData,
  onNext,
  onPrevious,
}: ReservationParkingStepProps) {
  const [startVisible, setStartVisible] = useState(false);
  const [endVisible, setEndVisible] = useState(false);

  // local numeric state only for TimePickerModal initial values
  const [startTimeState, setStartTimeState] = useState<{ hours: number; minutes: number }>(
    parseTimeOrDefault(reservationData.startTime, { hours: 8, minutes: 0 })
  );
  const [endTimeState, setEndTimeState] = useState<{ hours: number; minutes: number }>(
    parseTimeOrDefault(reservationData.endTime, { hours: 9, minutes: 0 })
  );

  const isRservationDetailsComplete = 
    !!reservationData.date &&
    !!reservationData.startTime &&
    !!reservationData.endTime;

  // ---- date handlers ----
  const handleDateChange = useCallback(
    (d: Date | undefined) => {
      const safe = toSafeDate(d);
      setReservationData(prev => ({ ...prev, date: safe }));
    },
    [setReservationData]
  );

  const handleEndDateChange = useCallback(
    (d: Date | undefined) => {
      const safe = toSafeDate(d);
      setReservationData(prev => ({ ...prev, endDate: safe }));
    },
    [setReservationData]
  );

  // ---- time handlers ----
  const onConfirmStartTime = useCallback(
    ({ hours, minutes }: { hours: number; minutes: number }) => {
      setStartVisible(false);
      const safeHours = isNaN(hours) ? 8 : hours;
      const safeMinutes = isNaN(minutes) ? 0 : minutes;

      setStartTimeState({ hours: safeHours, minutes: safeMinutes });

      const formatted = formatTime(safeHours, safeMinutes);
      setReservationData(prev => ({ ...prev, startTime: formatted }));
    },
    [setReservationData]
  );

  const onConfirmEndTime = useCallback(
    ({ hours, minutes }: { hours: number; minutes: number }) => {
      setEndVisible(false);
      const safeHours = isNaN(hours) ? 9 : hours;
      const safeMinutes = isNaN(minutes) ? 0 : minutes;

      setEndTimeState({ hours: safeHours, minutes: safeMinutes });

      const formatted = formatTime(safeHours, safeMinutes);
      setReservationData(prev => ({ ...prev, endTime: formatted }));
    },
    [setReservationData]
  );

  const { hours: startHours, minutes: startMinutes } = startTimeState;
  const { hours: endHours, minutes: endMinutes } = endTimeState;

  // safe dates for the pickers (protects against bad data coming from parent / API)
  const safeReservationDate = toSafeDate(reservationData.date);
  const safeEndDate = toSafeDate(reservationData.endDate);

  // ---- recurring dates (weekly) ----
  const recurringDates = useMemo(
    () =>
      reservationData.recurring
        ? buildWeeklyRecurringDates(safeReservationDate, safeEndDate)
        : [],
    [reservationData.recurring, safeReservationDate, safeEndDate]
  );

  useEffect(() => {
    if (reservationData.recurring) {
      setReservationData(prev => ({
        ...prev,
        recurringDays: recurringDates.map(d => d.toISOString()),
      }));
    }

  }, [recurringDates, reservationData.recurring, setReservationData]);

  return (
    <ScrollView
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="always"
      contentContainerStyle={styles.scrollContent}
    >
      {/* Reservation Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Reservation Details</Text>
        <Text style={styles.cardSubtitle}>
          Select date and time for your reservation
        </Text>

        {/* DATE */}
        <Text style={styles.label}>Reservation Date</Text>
        <View style={styles.datePickerWrapper}>
          <DatePickerInput
            locale="en-GB"
            label="Select Date"
            value={safeReservationDate}
            onChange={handleDateChange}
            inputMode="start"
            underlineColor="transparent"
            style={styles.datePickerInput}
          />
        </View>

        {/* TIME */}
        <View className="timeRow" style={styles.timeRow}>
          <View style={styles.timeColumn}>
            <Text style={styles.label}>Start Time</Text>
            <TouchableOpacity
              style={styles.timeInput}
              onPress={() => setStartVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.timeText}>
                🕐 {reservationData.startTime || 'Select start time'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeColumn}>
            <Text style={styles.label}>End Time</Text>
            <TouchableOpacity
              style={styles.timeInput}
              onPress={() => setEndVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.timeText}>
                🕐 {reservationData.endTime || 'Select end time'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RECURRING TOGGLE */}
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Recurring Reservation</Text>
            <Text style={styles.switchSubtext}>
              Repeat this reservation every week
            </Text>
          </View>
          <Switch
            value={reservationData.recurring}
            onValueChange={value =>
              setReservationData(prev => ({ ...prev, recurring: value }))
            }
            color={GREEN}
          />
        </View>

        {/* RECURRING OPTIONS */}
        {reservationData.recurring && (
          <>
            <Text style={styles.label}>End Date</Text>
            <View style={styles.datePickerWrapper}>
              <DatePickerInput
                locale="en-GB"
                label="Select End Date"
                value={safeEndDate}
                onChange={handleEndDateChange}
                inputMode="start"
                underlineColor="transparent"
                style={styles.datePickerInput}
              />
            </View>

            {/* RECURRING DATES SUMMARY */}
            {recurringDates.length > 0 && (
              <View style={styles.recurringSummary}>
                <Text style={styles.recurringSummaryTitle}>
                  Recurring Days
                </Text>
                {recurringDates.map(d => (
                  <Text
                    key={d.toISOString()}
                    style={styles.recurringSummaryText}
                  >
                    • {d.toDateString()}
                  </Text>
                ))}
              </View>
            )}
          </>
        )}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.buttonRow}>
        <Button
          mode="outlined"
          onPress={onPrevious}
          style={[styles.button, { marginRight: 8 }]}
          textColor={GREEN}
        >
          Previous
        </Button>
        <Button
          mode="contained"
          onPress={onNext}
          style={[styles.button, { marginLeft: 8 }]}
          buttonColor={GREEN}
          disabled={!isRservationDetailsComplete}
        >
          Next
        </Button>
      </View>

      {/* TIME PICKER MODALS */}
      <TimePickerModal
        visible={startVisible}
        onDismiss={() => setStartVisible(false)}
        onConfirm={onConfirmStartTime}
        hours={startHours}
        minutes={startMinutes}
        label="Select start time"
        cancelLabel="Cancel"
        confirmLabel="OK"
      />
      <TimePickerModal
        visible={endVisible}
        onDismiss={() => setEndVisible(false)}
        onConfirm={onConfirmEndTime}
        hours={endHours}
        minutes={endMinutes}
        label="Select end time"
        cancelLabel="Cancel"
        confirmLabel="OK"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
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
  datePickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 2,
    marginBottom: 16,
  },
  datePickerInput: {
    backgroundColor: '#fff',
  },
  timeRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeColumn: {
    flex: 1,
    marginRight: 8,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
  },
  timeText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
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
    borderColor: GREEN,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  checkButton: {
    borderColor: GREEN,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
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
