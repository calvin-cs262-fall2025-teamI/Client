import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Plus,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Schedule {
  id: number;
  spotNumber: string;
  location: string;
  timeRange: string;
  date: string;
  isActive: boolean;
}

interface ReservationForm {
  startTime: string;
  endTime: string;
  parkingLot: string;
  date: string;
  isRecurring: boolean;
  recurringDays: string[];
}

export default function ReservationRequestScreen() {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const [formData, setFormData] = useState<ReservationForm>({
    startTime: "",
    endTime: "",
    parkingLot: "",
    date: "",
    isRecurring: false,
    recurringDays: [],
  });

  const [schedules] = useState<Schedule[]>([
    {
      id: 1,
      spotNumber: "A-24",
      location: "Building A - Level 2",
      timeRange: "8:00 AM - 6:00 PM",
      date: "Today",
      isActive: true,
    },
    {
      id: 2,
      spotNumber: "B-12",
      location: "Building B - Level 1",
      timeRange: "8:00 AM - 5:00 PM",
      date: "Tomorrow",
      isActive: false,
    },
    {
      id: 3,
      spotNumber: "C-08",
      location: "Building C - Level 3",
      timeRange: "9:00 AM - 6:00 PM",
      date: "Oct 17, 2025",
      isActive: false,
    },
  ]);

  const parkingLots = [
    "Lot A - Building A",
    "Lot B - Building B",
    "Lot C - Building C",
    "Lot D - Main Entrance",
  ];

  const daysOfWeek = [
    { id: "mon", label: "Mon" },
    { id: "tue", label: "Tue" },
    { id: "wed", label: "Wed" },
    { id: "thu", label: "Thu" },
    { id: "fri", label: "Fri" },
    { id: "sat", label: "Sat" },
    { id: "sun", label: "Sun" },
  ];

  const handleRequestSpot = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setFormData({
      startTime: "",
      endTime: "",
      parkingLot: "",
      date: "",
      isRecurring: false,
      recurringDays: [],
    });
  };

  const toggleDay = (dayId: string) => {
    setFormData(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(dayId)
        ? prev.recurringDays.filter(d => d !== dayId)
        : [...prev.recurringDays, dayId]
    }));
  };

  const handleSubmitRequest = () => {
    if (!formData.startTime.trim()) {
      Alert.alert("Error", "Please enter a start time");
      return;
    }
    if (!formData.endTime.trim()) {
      Alert.alert("Error", "Please enter an end time");
      return;
    }
    if (!formData.parkingLot) {
      Alert.alert("Error", "Please select a parking lot");
      return;
    }
    if (!formData.date.trim()) {
      Alert.alert("Error", "Please select a date");
      return;
    }
    if (formData.isRecurring && formData.recurringDays.length === 0) {
      Alert.alert("Error", "Please select at least one day for recurring reservation");
      return;
    }

    console.log("Reservation request:", formData);
    
    Alert.alert(
      "Success", 
      formData.isRecurring 
        ? `Recurring reservation requested for ${formData.recurringDays.join(", ")}`
        : "Reservation requested successfully"
    );
    
    handleCloseModal();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservations</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.requestSection}>
          <TouchableOpacity
            style={styles.requestButton}
            onPress={handleRequestSpot}
          >
            <Plus color="#fff" size={24} />
            <Text style={styles.requestButtonText}>Request New Spot</Text>
          </TouchableOpacity>
          <Text style={styles.requestHint}>
            Reserve a parking spot for your next visit
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Reservations</Text>
          <Text style={styles.sectionSubtitle}>
            Manage your current and upcoming parking reservations
          </Text>

          {schedules.length > 0 ? (
            schedules.map((schedule) => (
              <View
                key={schedule.id}
                style={[
                  styles.scheduleCard,
                  !schedule.isActive && styles.scheduleCardInactive,
                ]}
              >
                <View style={styles.scheduleLeft}>
                  <View
                    style={[
                      styles.scheduleIcon,
                      !schedule.isActive && styles.scheduleIconInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.scheduleIconText,
                        !schedule.isActive && styles.scheduleIconTextInactive,
                      ]}
                    >
                      {schedule.spotNumber}
                    </Text>
                  </View>
                  <View style={styles.scheduleInfo}>
                    <Text style={styles.scheduleTitle}>{schedule.location}</Text>
                    <View style={styles.scheduleDetail}>
                      <Clock color="#64748b" size={14} />
                      <Text style={styles.scheduleDetailText}>
                        {schedule.timeRange}
                      </Text>
                    </View>
                    <View style={styles.scheduleDetail}>
                      <Calendar color="#64748b" size={14} />
                      <Text style={styles.scheduleDetailText}>
                        {schedule.date}
                      </Text>
                    </View>
                  </View>
                </View>
                {schedule.isActive && (
                  <View style={styles.activeTag}>
                    <Text style={styles.activeTagText}>Active</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Calendar color="#cbd5e1" size={48} />
              <Text style={styles.emptyStateTitle}>No Reservations</Text>
              <Text style={styles.emptyStateText}>
                You do not have any parking reservations yet
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={handleRequestSpot}
              >
                <Text style={styles.emptyStateButtonText}>
                  Request Your First Spot
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MapPin color="#4CAF50" size={20} />
            <Text style={styles.infoTitle}>Reservation Tips</Text>
          </View>
          <Text style={styles.infoText}>
            • Request spots at least 24 hours in advance{"\n"}
            • Active reservations can be modified up to 2 hours before start time{"\n"}
            • Cancel unused reservations to help others{"\n"}
            • Arrive within 15 minutes of your start time
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Parking Spot</Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formGroup}>
                <Text style={styles.label}>Date *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor="#94a3b8"
                  value={formData.date}
                  onChangeText={(text) =>
                    setFormData({ ...formData, date: text })
                  }
                />
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeInputGroup}>
                  <Text style={styles.label}>Start Time *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="9:00 AM"
                    placeholderTextColor="#94a3b8"
                    value={formData.startTime}
                    onChangeText={(text) =>
                      setFormData({ ...formData, startTime: text })
                    }
                  />
                </View>
                <View style={styles.timeInputGroup}>
                  <Text style={styles.label}>End Time *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="5:00 PM"
                    placeholderTextColor="#94a3b8"
                    value={formData.endTime}
                    onChangeText={(text) =>
                      setFormData({ ...formData, endTime: text })
                    }
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Parking Lot *</Text>
                <View style={styles.pickerContainer}>
                  {parkingLots.map((lot) => (
                    <TouchableOpacity
                      key={lot}
                      style={[
                        styles.lotOption,
                        formData.parkingLot === lot && styles.lotOptionSelected
                      ]}
                      onPress={() => setFormData({ ...formData, parkingLot: lot })}
                    >
                      <View style={[
                        styles.radioButton,
                        formData.parkingLot === lot && styles.radioButtonSelected
                      ]}>
                        {formData.parkingLot === lot && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                      <Text style={[
                        styles.lotOptionText,
                        formData.parkingLot === lot && styles.lotOptionTextSelected
                      ]}>
                        {lot}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.recurringSection}>
                <TouchableOpacity
                  style={styles.recurringToggle}
                  onPress={() =>
                    setFormData({ ...formData, isRecurring: !formData.isRecurring })
                  }
                >
                  <View style={styles.recurringToggleLeft}>
                    <Text style={styles.recurringLabel}>Recurring Weekly</Text>
                    <Text style={styles.recurringSubtext}>
                      Repeat this reservation every week
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.switch,
                      formData.isRecurring && styles.switchActive
                    ]}
                  >
                    <View
                      style={[
                        styles.switchThumb,
                        formData.isRecurring && styles.switchThumbActive
                      ]}
                    />
                  </View>
                </TouchableOpacity>

                {formData.isRecurring && (
                  <View style={styles.daysContainer}>
                    <Text style={styles.daysLabel}>Select Days *</Text>
                    <View style={styles.daysGrid}>
                      {daysOfWeek.map((day) => (
                        <TouchableOpacity
                          key={day.id}
                          style={[
                            styles.dayButton,
                            formData.recurringDays.includes(day.id) && styles.dayButtonSelected
                          ]}
                          onPress={() => toggleDay(day.id)}
                        >
                          <Text
                            style={[
                              styles.dayButtonText,
                              formData.recurringDays.includes(day.id) && styles.dayButtonTextSelected
                            ]}
                          >
                            {day.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.modalInfoBox}>
                <Text style={styles.modalInfoText}>
                  {formData.isRecurring
                    ? "Your reservation will repeat weekly on the selected days until cancelled."
                    : "Reservations can be made up to 30 days in advance."}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitRequest}
              >
                <Text style={styles.submitButtonText}>Submit Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#4CAF50",
    padding: 20,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  requestSection: {
    padding: 16,
    paddingTop: 24,
  },
  requestButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  requestHint: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 13,
    marginTop: 8,
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  scheduleCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#4CAF50",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleCardInactive: {
    borderColor: "#e2e8f0",
  },
  scheduleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  scheduleIcon: {
    backgroundColor: "#4CAF50",
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  scheduleIconInactive: {
    backgroundColor: "#f1f5f9",
  },
  scheduleIconText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  scheduleIconTextInactive: {
    color: "#64748b",
  },
  scheduleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 6,
  },
  scheduleDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  scheduleDetailText: {
    color: "#64748b",
    fontSize: 13,
  },
  activeTag: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeTagText: {
    color: "#78350f",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#f0fdf4",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#15803d",
  },
  infoText: {
    fontSize: 13,
    color: "#15803d",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "#f9fafb",
  },
  timeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  timeInputGroup: {
    flex: 1,
  },
  pickerContainer: {
    gap: 8,
  },
  lotOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  lotOptionSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#f0fdf4",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: "#4CAF50",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
  },
  lotOptionText: {
    fontSize: 15,
    color: "#475569",
  },
  lotOptionTextSelected: {
    color: "#0f172a",
    fontWeight: "600",
  },
  recurringSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  recurringToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  recurringToggleLeft: {
    flex: 1,
  },
  recurringLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 2,
  },
  recurringSubtext: {
    fontSize: 12,
    color: "#64748b",
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#cbd5e1",
    padding: 2,
    justifyContent: "center",
  },
  switchActive: {
    backgroundColor: "#4CAF50",
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    transform: [{ translateX: 22 }],
  },
  daysContainer: {
    marginTop: 16,
  },
  daysLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },
  daysGrid: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  dayButtonSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  dayButtonTextSelected: {
    color: "#fff",
  },
  modalInfoBox: {
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    marginTop: 8,
  },
  modalInfoText: {
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});