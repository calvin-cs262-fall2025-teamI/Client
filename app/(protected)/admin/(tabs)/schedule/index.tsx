import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  Pressable,
  Image,
} from "react-native";
import { Button, Text } from "react-native-paper";
import { useGlobalData } from "@/utils/GlobalDataContext";
import { headerStyles } from "@/utils/globalStyles";
import { LinearGradient } from "expo-linear-gradient";
import DateScheduleSection from "./components/DateScheduleSection";
import { Ionicons } from "@expo/vector-icons";
import { Plus } from "lucide-react-native";

const GREEN = "#388E3C";
const CHARCOAL = "#1F2937";
const MUTED = "#6B7280";
const BG = "#F8FAFC";
const CARD = "#FFFFFF";

/* ============================
   ✅ TYPES
============================ */

interface RawSchedule {
  id: number;
  date: string; // "2025-12-10T00:00:00.000Z"
  start_time: string; // "8:00 AM" OR "8:00 a.m."
  end_time: string; // "9:00 AM" OR "10:00 a.m."
  user_id: number;
  parking_lot: string;
  row: number;
  col: number;
  is_recurring?: boolean;
  recurring_days?: string[];
  location?: string;
}

type ScheduleOccurrence = {
  id: number;
  occurrenceId: string; // `${id}-${YYYY-MM-DD}`
  dateKey: string; // ✅ keep the day key for the modal
  user_id: number;
  parking_lot: string;
  row: number;
  col: number;
  startISO: string;
  endISO: string;
};

type DaySection = {
  key: string; // YYYY-MM-DD
  title: string; // Today / Tomorrow / Wed, Dec 10
  data: ScheduleOccurrence[];
};

type ScheduleUIItem = {
  id: string; // occurrenceId
  user_id: number;
  parking_lot: string;
  startLabel: string;
};

/* ============================
   ✅ DATE HELPERS
============================ */

function formatDateKeyFromISO(iso: string): string {
  return iso.split("T")[0];
}

// ✅ normalize "8:00 a.m." -> "8:00 AM"
function normalizeTimeString(timeStr: string): string {
  if (!timeStr) return "";
  return timeStr
    .normalize("NFKC")
    .replace(/[\u00A0\u202F]/g, " ")
    .replace(/\b(a\.?\s*m\.?)\b/i, "AM")
    .replace(/\b(p\.?\s*m\.?)\b/i, "PM")
    .replace(/\s+/g, " ")
    .trim();
}

function buildDateTimeFromDateAndTime(dateKey: string, timeStr: string): Date | null {
  if (!dateKey || !timeStr) return null;

  const base = new Date(`${dateKey}T00:00:00`);
  if (isNaN(base.getTime())) return null;

  const clean = normalizeTimeString(timeStr);
  const match = clean.match(/(\d+):(\d+)\s*(AM|PM)/i);
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

function getDayLabelFromKey(dateKey: string): string {
  const todayKey = new Date().toISOString().split("T")[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = tomorrow.toISOString().split("T")[0];

  if (dateKey === todayKey) return "Today";
  if (dateKey === tomorrowKey) return "Tomorrow";

  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTimeRange(startISO: string, endISO: string): string {
  const start = new Date(startISO);
  const end = new Date(endISO);

  return `${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}–${end.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

/* ============================
   ✅ NORMALIZE / GROUP
============================ */

function expandToOccurrences(s: RawSchedule): ScheduleOccurrence[] {
  const baseKey = formatDateKeyFromISO(s.date);

  const allKeys = Array.from(
    new Set([baseKey, ...(s.recurring_days ?? []).map(formatDateKeyFromISO)])
  ).sort();

  const out: ScheduleOccurrence[] = [];

  for (const dateKey of allKeys) {
    const start = buildDateTimeFromDateAndTime(dateKey, s.start_time);
    const end = buildDateTimeFromDateAndTime(dateKey, s.end_time);
    if (!start || !end) continue;

    out.push({
      id: s.id,
      occurrenceId: `${s.id}-${dateKey}`,
      dateKey,
      user_id: s.user_id,
      parking_lot: s.parking_lot,
      row: s.row,
      col: s.col,
      startISO: start.toISOString(),
      endISO: end.toISOString(),
    });
  }

  return out;
}

function groupOccurrencesByDay(all: ScheduleOccurrence[]): DaySection[] {
  const groups: Record<string, ScheduleOccurrence[]> = {};

  for (const occ of all) {
    const key = formatDateKeyFromISO(occ.startISO);
    (groups[key] ||= []).push(occ);
  }

  return Object.keys(groups)
    .sort((a, b) => (a > b ? 1 : -1)) // oldest -> newest
    .map((key) => ({
      key,
      title: getDayLabelFromKey(key),
      data: groups[key].sort(
        (a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime()
      ),
    }));
}

function toUIItems(items: ScheduleOccurrence[]): ScheduleUIItem[] {
  return items.map((x) => ({
    id: x.occurrenceId,
    user_id: x.user_id,
    parking_lot: x.parking_lot,
    startLabel: formatTimeRange(x.startISO, x.endISO),
  }));
}

/* ============================
   ✅ MAIN SCREEN
============================ */

export default function SchedulePage() {
  const [raw, setRaw] = useState<RawSchedule[]>([]);
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<ScheduleOccurrence | null>(null);
  const { users } = useGlobalData();

  const CTA_HEIGHT = 56;

  // ✅ IMPORTANT FIX: fetch ONCE (not on [raw])
  useEffect(() => {
    const getUserSchedules = async () => {
      try {
        const response = await fetch(
          "https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net/api/schedules"
        );
        const data: RawSchedule[] = await response.json();
        setRaw(data);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };

    getUserSchedules();
  }, [raw]);

  const sections = useMemo(() => {
    const occurrences = raw.flatMap(expandToOccurrences);
    return groupOccurrencesByDay(occurrences);
  }, [raw]);

  useEffect(() => {
    if (sections.length === 0) return;
    setOpenKeys((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      return { [sections[0].key]: true };
    });
  }, [sections]);

  const toggleSection = (key: string) => {
    setOpenKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getUser = (userId: number | string) => {
    const u = users.find((x) => Number(x.id) === Number(userId));
    return {
      name: (u as any)?.name ?? "Unknown User",
      avatarUri:
        (u as any)?.avatar 
    };
  };

  const deleteSchedule = async (scheduleId: number) => {
    try {
      // ✅ call backend delete (adjust if your route differs)
      const res = await fetch(
        `https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net/api/schedules/${scheduleId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Delete failed");
      }

      // ✅ update UI
      setRaw((prev) => prev.filter((s) => s.id !== scheduleId));
      setSelected(null);
    } catch (e) {
      console.error("Delete error:", e);
      Alert.alert("Could not delete", "Please try again.");
    }
  };

  const confirmDeleteFromModal = (scheduleId: number) => {
    Alert.alert(
      "Delete Schedule",
      "Delete this schedule and all its recurrences?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteSchedule(scheduleId) },
      ]
    );
  };

  // helper: find the occurrence from occurrenceId
  const findOccurrence = (occurrenceId: string): ScheduleOccurrence | null => {
    const all = raw.flatMap(expandToOccurrences);
    return all.find((x) => x.occurrenceId === occurrenceId) ?? null;
  };

  const selectedUser = selected ? getUser(selected.user_id) : null;
  const selectedRawSchedule = selected
    ? raw.find((x) => x.id === selected.id)
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={headerStyles.header}>
        <View>
          <Text style={headerStyles.headerTitle}>Schedule</Text>
          <Text style={headerStyles.headerSubtitle}>Upcoming Parking Schedule</Text>
        </View>
      </View>

      {/* ✅ DATE SECTIONS */}
      <ScrollView contentContainerStyle={{ paddingBottom: CTA_HEIGHT + 120 }}>
        {sections.map((section) => (
          <DateScheduleSection
            key={section.key}
            dateLabel={section.title}
            count={section.data.length}
            items={toUIItems(section.data)}
            expanded={!!openKeys[section.key]}
            onToggle={() => toggleSection(section.key)}
            getUser={getUser}
            onItemPress={(item) => {
              const occ = findOccurrence(String(item.id));
              if (occ) setSelected(occ);
            }}
          />
        ))}
      </ScrollView>

      {/* ✅ DETAILS MODAL */}
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSelected(null)} />

        <View style={styles.sheetWrap}>
          <View style={styles.sheet}>
            {/* Header row */}
            <View style={styles.sheetTop}>
              <Text style={styles.sheetTitle}>Schedule Details</Text>
              <Pressable onPress={() => setSelected(null)} hitSlop={10}>
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>

            {/* User */}
            {selected && selectedUser && (
              <View style={styles.userRow}>
                {selectedUser.avatarUri ? (
                  <Image source={{ uri: selectedUser.avatarUri }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>
                      {(selectedUser.name?.[0] ?? "?").toUpperCase()}
                    </Text>
                  </View>
                )}

                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {selectedUser.name}
                  </Text>
                  <Text style={styles.userSub} numberOfLines={1}>
                    User ID: {selected.user_id}
                  </Text>
                </View>
              </View>
            )}

            {/* Info blocks */}
            {selected && (
              <View style={{ gap: 10 }}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>
                    {getDayLabelFromKey(selected.dateKey)} · {selected.dateKey}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Time</Text>
                  <Text style={styles.infoValue}>{formatTimeRange(selected.startISO, selected.endISO)}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Parking</Text>
                  <Text style={styles.infoValue}>
                    {selected.parking_lot} · Row {selected.row}, Col {selected.col}
                  </Text>
                </View>

                {selectedRawSchedule?.location ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>{selectedRawSchedule.location}</Text>
                  </View>
                ) : null}

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Recurring</Text>
                  <Text style={styles.infoValue}>
                    {selectedRawSchedule?.is_recurring ? "Yes" : "No"}
                    {selectedRawSchedule?.is_recurring && selectedRawSchedule?.recurring_days?.length
                      ? ` · ${selectedRawSchedule.recurring_days.length} dates`
                      : ""}
                  </Text>
                </View>
              </View>
            )}

            {/* Actions */}
            {selected && (
              <View style={styles.actions}>
                <Button
                  mode="outlined"
                  onPress={() => setSelected(null)}
                  textColor={CHARCOAL}
                  style={styles.actionBtn}
                >
                  Close
                </Button>

                <Button
                  mode="contained"
                  buttonColor="#D32F2F"
                  onPress={() => confirmDeleteFromModal(selected.id)}
                  style={styles.actionBtn}
                >
                  Delete Schedule
                </Button>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ✅ STICKY CTA */}
      <View style={[styles.stickyCta]}>
        <LinearGradient
          colors={["rgba(252,252,252,1)", "rgba(252,252,252,0)"]}
          locations={[0, 1]}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.ctaBackground}
          pointerEvents="none"
        />

      <Button
  mode="contained"
  icon={({ size, color }) => <Plus size={size} color={color} />}
  buttonColor="#388E3C"
  style={styles.stickyBtn}
  contentStyle={{ height: CTA_HEIGHT }}
  labelStyle={styles.stickyLabel}
>
  Add New User
</Button>


      </View>
    </View>
  );
}

/* ============================
   ✅ STYLES
============================ */

const styles = StyleSheet.create({
  stickyCta: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  ctaBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  stickyBtn: {
    borderRadius: 14,
  },
  
  stickyLabel: {
    fontSize: 16,
    fontWeight: "700",
  },

  // Modal
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  sheetWrap: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 12,
  },
  sheet: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  sheetTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: CHARCOAL,
  },
  close: {
    fontSize: 18,
    fontWeight: "900",
    color: MUTED,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E5E7EB",
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(56,142,60,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontSize: 18,
    fontWeight: "900",
    color: GREEN,
  },
  userName: {
    fontSize: 16,
    fontWeight: "900",
    color: CHARCOAL,
  },
  userSub: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "700",
    color: MUTED,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: MUTED,
    width: 90,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: CHARCOAL,
    textAlign: "right",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
  },
});
