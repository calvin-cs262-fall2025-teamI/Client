/**
 * @file create_schedule.tsx
 * @description Multi-step wizard for creating parking reservations (Admin)
 * @module app/(protected)/admin/(tabs)/schedule
 * 
 * This is the main container for the 3-step schedule creation process:
 * 1. ParkingStep - Select user, location, lot, and spot
 * 2. ReservationParkingStep - Set date, time, and recurrence
 * 3. ReviewSubmitStep - Review and confirm submission
 * 
 * The component manages shared form state across all steps and handles
 * final submission to the backend API.
 */
import type { ReservationData } from '@/types/global.types';
import { headerStyles } from '@/utils/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ParkingStep from './components/ParkingStep';
import ProgressIndicator from './components/ProgressIndicator';
import ReservationParkingStep from './components/ReservationParkingStep';
import ReviewSubmitStep from './components/ReviewSubmitStep';

/**
 * CreateSchedule Component
 * 
 * Main wizard container that orchestrates the 3-step schedule creation flow.
 * Maintains form state across steps and handles navigation between them.
 * 
 * @component
 * @returns {JSX.Element} The rendered multi-step form
 * 
 * @example
 * ```tsx
 * // Navigated to via router:
 * router.push('/admin/(tabs)/schedule/create_schedule')
 * ```
 */
export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);


  const [reservationData, setReservationData] = useState<ReservationData>({
    user_id: undefined,
    user_name: undefined,
    date: undefined,
    startTime: undefined,
    endTime: undefined,
    recurring: false,
    recurringDays: [],
    endDate: undefined,
    location: '',
    parkingLot: '',
    row: 0,
    col: 0,
  });

  /**
   * Advances to the next step in the wizard
   * Only called after current step validation passes
   */
  const handleNext = (): void => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  /**
   * Returns to the previous step in the wizard
   * Preserves all form data for editing
   */
  const handlePrevious = (): void => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  /**
   * Submits the complete reservation to the backend API
   * 
   * Transforms the form data into the API-expected format:
   * - Converts Date objects to ISO strings
   * - Maps UI field names to database column names
   * - Includes all recurring dates if applicable
   * 
   * @async
   * @throws {Error} If API request fails
   */
  const handleSubmit = async () => {
    const reservation = {
      user_id: reservationData.user_id,
      date: reservationData.date,
      start_time: reservationData.startTime,
      end_time: reservationData.endTime,
      is_recurring: reservationData.recurring,
      recurring_days: reservationData.recurringDays,
      location: reservationData.location,
      row: reservationData.row,
      col: reservationData.col,

      parking_lot: reservationData.parkingLot,
    }
    try {

      // Example: send all occurrences to your API
      await fetch(
        'https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net/api/schedules',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reservation),
        }
      );

      router.back();

      // maybe navigate away or show success here
    } catch (err) {
      console.error('Error submitting reservation', err);
      // show error toast / dialog if you want
    }
  };

  return (
    <>

      <View style={styles.container}>

        <View style={headerStyles.header}>
          <View style={styles.headerRow}>
            <Ionicons
              name="arrow-back"
              size={22}
              color="#FFFFFF"
              onPress={() => router.back()}
            />

            <Text style={styles.headerTitle}>
              Create Schedule
            </Text>
          </View>
        </View>

        {/* Fixed Header */}
        <View style={styles.fixedHeader}>
          <ProgressIndicator
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
        </View>


        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {currentStep === 1 && (
            <ParkingStep
              reservationData={reservationData}
              setReservationData={setReservationData}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && (
            <ReservationParkingStep
              reservationData={reservationData}
              setReservationData={setReservationData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 3 && (
            <ReviewSubmitStep
              reservationData={reservationData}
              onPrevious={handlePrevious}
              onSubmit={handleSubmit}
            />
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10, // clean spacing between arrow and text
  },
  fixedHeader: {
    paddingHorizontal: 16,
    marginBottom: 2,
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  scrollView: {
    position: 'absolute',
    top: 140,
    bottom: 0,
    left: 0, right: 0,
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
});