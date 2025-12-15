import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, SectionList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Appbar, Button, Text } from "react-native-paper";
import { useGlobalData } from "@/utils/GlobalDataContext";

const GREEN = "#388E3C";

/* ============================
   ✅ TYPES
============================ */

interface RawSchedule {
  id: number;
  date: string;               // "2025-12-10"
  start_time: string;         // "8:00 AM"
  end_time: string;           // "9:00 AM"
  user_id: number;
  parking_lot: string;
  row: number;
  col: number;
  is_recurring?: boolean;
  recurring_days?: string[]; // ["2025-12-10T05:00:00.000Z", ...]
}

interface Schedule {
  id: number;
  user_id: number;
  parking_lot: string;
  row: number;
  col: number;
  startISO: string; // ✅ FULL ISO timestamp
  endISO: string;   // ✅ FULL ISO timestamp
}

type ScheduleSection = {
  title: string;
  key: string; // YYYY-MM-DD
  data: Schedule[];
};

/* ============================
   ✅ SAFE DATE & TIME HANDLING
============================ */

// ✅ Build Date safely from ("2025-12-10", "8:00 AM")
function buildDateTimeFromDateAndTime(dateKey: string, timeStr: string): Date | null {
  if (!dateKey || !timeStr) return null;

  const base = new Date(`${dateKey}T00:00:00`);
  if (isNaN(base.getTime())) return null;

  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  const result = new Date(base);
  result.setHours(hours, minutes, 0, 0);

  return isNaN(result.getTime()) ? null : result;
}

// ✅ Extract YYYY-MM-DD safely WITHOUT timezone shifts
function formatDateKeyFromISO(iso: string): string {
  return iso.split("T")[0];
}

// ✅ Proper "Today / Tomorrow / Date" labeling
function getDayLabelFromKey(dateKey: string): string {
  const todayKey = new Date().toISOString().split("T")[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = tomorrow.toISOString().split("T")[0];

  if (dateKey === todayKey) return "Today";
  if (dateKey === tomorrowKey) return "Tomorrow";

  const date = new Date(`${dateKey}T12:00:00`); // Noon avoids timezone bugs
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ✅ Proper time display
function formatTimeRange(startISO: string, endISO: string): string {
  const start = new Date(startISO);
  const end = new Date(endISO);

  return `${start.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })} → ${end.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

/* ============================
   ✅ GROUP BY DAY (DESCENDING)
============================ */

function groupSchedulesByDay(schedules: Schedule[]): ScheduleSection[] {
  const groups: Record<string, Schedule[]> = {};

  schedules.forEach((s) => {
    const key = formatDateKeyFromISO(s.startISO);
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });

  return Object.keys(groups)
    .sort((a, b) => (a > b ? 1 : -1)) // ✅ NEWEST DAY FIRST
    .map((key) => ({
      key,
      title: getDayLabelFromKey(key),
      data: groups[key].sort(
        (a, b) =>
          new Date(b.startISO).getTime() -
          new Date(a.startISO).getTime() // ✅ NEWEST FIRST PER DAY
      ),
    }));
}

/* ============================
   ✅ MAIN SCREEN
============================ */

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const { users } = useGlobalData();

  useEffect(() => {
    const getUserSchedules = async () => {
      try {
        const response = await fetch(
          "https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net/api/schedules"
        );
        const data: RawSchedule[] = await response.json();

        const normalized: Schedule[] = [];

        data.forEach((s) => {
          const baseDateKey = s.date.split("T")[0];

          const allDates = [
            baseDateKey,
            ...(s.recurring_days || []).map(formatDateKeyFromISO),
          ];

          allDates.forEach((dateKey) => {
            const startDateTime = buildDateTimeFromDateAndTime(dateKey, s.start_time);
            const endDateTime = buildDateTimeFromDateAndTime(dateKey, s.end_time);

            if (!startDateTime || !endDateTime) {
              console.log("❌ DROPPED INVALID OCCURRENCE:", s);
              return;
            }

            normalized.push({
              id: s.id,
              user_id: s.user_id,
              parking_lot: s.parking_lot,
              row: s.row,
              col: s.col,
              startISO: startDateTime.toISOString(),
              endISO: endDateTime.toISOString(),
            });
          });
        });

        setSchedules(normalized);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };

    getUserSchedules();
  }, []);

  const sections = useMemo(
    () => groupSchedulesByDay(schedules),
    [schedules]
  );

  const confirmDelete = (id: number) => {
    Alert.alert(
      "Delete Schedule",
      "Are you sure you want to delete this schedule and all its recurrences?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            setSchedules((prev) => prev.filter((s) => s.id !== id)),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        
        {/* ✅ HEADER */}
        <Appbar.Header style={{ backgroundColor: GREEN }}>
          <Appbar.Content
            title="Schedule"
            titleStyle={{ color: "#fff", fontWeight: "700" }}
          />
        </Appbar.Header>

        {/* ✅ CREATE BUTTON */}
        <Button
          mode="contained"
          style={styles.createButton}
          labelStyle={styles.createLabel}
          onPress={() =>
            router.push("/admin/(tabs)/schedule/create_schedule" as any)
          }
          buttonColor={GREEN}
        >
          Create New Schedule
        </Button>

        {/* ✅ GROUPED SCHEDULE LIST */}
        <SectionList
          sections={sections}
          keyExtractor={(item, index) =>
            `${item.id}-${item.startISO}-${index}`
          }
          stickySectionHeadersEnabled
          contentContainerStyle={{ paddingBottom: 40 }}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {section.title} ({section.data.length})
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.userName}>
                  {users.find((u) => Number(u.id) === item.user_id)?.name ||
                    "Unknown User"}
                </Text>
                <Button
                  compact
                  textColor="#D32F2F"
                  onPress={() => confirmDelete(item.id)}
                >
                  Delete
                </Button>
              </View>

              <Text style={styles.line}>
                🅿️ {item.parking_lot} — Row {item.row}, Col {item.col}
              </Text>

              <Text style={styles.line}>
                🕒 {formatTimeRange(item.startISO, item.endISO)}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No schedules found.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

/* ============================
   ✅ STYLES
============================ */

const styles = StyleSheet.create({
  createButton: {
    margin: 20,
    borderRadius: 10,
    paddingVertical: 4,
  },
  createLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionHeader: {
    backgroundColor: "#e8f5e9",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2e7d32",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
  },
  line: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#777",
  },
});
