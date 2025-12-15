import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { Text } from "react-native-paper";

type ScheduleItem = {
  id: number | string;
  user_id: number | string;
  parking_lot: string;
  startLabel: string;
};

type UserInfo = {
  name: string;
  avatarUri?: string | null;
};

type Props = {
  dateLabel: string;
  count: number;
  items: ScheduleItem[];
  expanded: boolean;
  onToggle: () => void;
  getUser: (userId: number | string) => UserInfo;
  onItemPress?: (item: ScheduleItem) => void;
};

const CHARCOAL = "#1F2937";
const MUTED = "#6B7280";
const GREEN = "#388E3C";

export default function DateScheduleSection({
  dateLabel,
  count,
  items,
  expanded,
  onToggle,
  getUser,
  onItemPress,
}: Props) {
  return (
    <View style={styles.group}>
      {/* Header (part of the group surface) */}
      <Pressable onPress={onToggle} style={styles.header} hitSlop={8}>
        <View style={styles.headerLeft}>
          <Text style={styles.date} numberOfLines={1}>
            {dateLabel}
          </Text>

          <View style={styles.pill}>
            <Text style={styles.pillText}>{count}</Text>
          </View>
        </View>

        <Text style={styles.chevron}>{expanded ? "▾" : "▸"}</Text>
      </Pressable>

      {/* Items (visually nested inside this date group) */}
      {expanded && (
        <View style={styles.items}>
          {items.map((item, idx) => {
            const user = getUser(item.user_id);
            const initial = (user.name?.[0] ?? "?").toUpperCase();

            return (
              <Pressable
                key={`${item.id}`}
                onPress={() => onItemPress?.(item)}
                style={[styles.row, idx === items.length - 1 && styles.rowLast]}
                android_ripple={{ color: "rgba(0,0,0,0.05)" }}
              >
                {/* Avatar */}
                {user.avatarUri ? (
                  <Image source={{ uri: user.avatarUri }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>{initial}</Text>
                  </View>
                )}

                {/* Text */}
                <View style={styles.rowText}>
                  <Text style={styles.name} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {item.startLabel} · {item.parking_lot}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ✅ One surface per date group (prevents "separate cards" feeling)
  group: {
    marginTop: 10,
    marginHorizontal: 12,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.08)",
    overflow: "hidden", // makes header + rows feel connected
  },

  // Header: clearly the group heading
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "rgba(17,24,39,0.04)", // subtle cap to show "this is the heading"
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  date: {
    fontSize: 22, // ✅ stronger heading
    fontWeight: "900",
    color: CHARCOAL,
    letterSpacing: 0.2,
  },
  pill: {
    minWidth: 30,
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "rgba(56,142,60,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "900",
    color: GREEN,
  },
  chevron: {
    fontSize: 20,
    color: MUTED,
  },

  // Items container: no gaps, rows share the same surface
  items: {
    backgroundColor: "#FFFFFF",
  },

  // Row: nested + separated by dividers (not separate cards)
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(17,24,39,0.10)",
  },
  rowLast: {
    // keep clean end (optional, but nice)
  },

  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: "#E5E7EB",
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: "rgba(56,142,60,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontSize: 16,
    fontWeight: "900",
    color: GREEN,
  },

  rowText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: "900",
    color: CHARCOAL,
  },
  meta: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "600",
    color: MUTED,
  },
});
