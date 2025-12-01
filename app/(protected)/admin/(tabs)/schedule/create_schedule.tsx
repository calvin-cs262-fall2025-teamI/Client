import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar } from 'react-native-paper';
import ProgressIndicator from './components/ProgressIndicator';
import ReservationParkingStep from './components/ReservationParkingStep';
import ReviewSubmitStep from './components/ReviewSubmitStep';
import type { ReservationData } from '@/types/global.types';
import ParkingStep from './components/ParkingStep';

interface UserData {
  name: string;
  role: 'employee' | 'admin';
}


export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  
  const [reservationData, setReservationData] = useState<ReservationData>({
    user_id: undefined,
    name: undefined,
    date: new Date('October 22nd, 2025'),
    startTime: '09:00',
    endTime: '17:00',
    recurring: false,
    repeatPattern: 'Weekly',
    endDate: new Date('October 31st, 2025'),
    location: '',
    parkingLot: '',
    spot: '',
  });

  const handleNext = (): void => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = (): void => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (): void => {
    router.back();
};

  return (
    <>
      
      <View style={styles.container}>
         <Appbar.Header style={{ backgroundColor: "#388E3C" }}>
                <Appbar.Content title="Create a new Schedule" titleStyle={{ color: "#fff", fontWeight: "700" }} />
              
              </Appbar.Header>
        {/* Fixed Header */}
        <View style={styles.fixedHeader}>
       
          
          <ProgressIndicator currentStep={currentStep} setCurrentStep={setCurrentStep} />
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
  fixedHeader: {
    backgroundColor: '#f5f5f0',
    paddingHorizontal: 16,
    marginBottom: 2,
    paddingTop: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
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
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
});