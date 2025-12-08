// utils/reservationSchedule.ts

import type { ReservationData } from '@/types/global.types';

type RepeatPattern = 'none' | 'daily' | 'weekly';

export interface ReservationOccurrence {
  user_id: string;
  parking_lot: string;   // or parking_lot_id if you have it
  spot_id: number;
  starts_at: string;     // ISO datetime
  ends_at: string;       // ISO datetime
}

/** Strip time from a Date (00:00 of that day) */
const stripTime = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);

/** Add days to a Date */
const addDays = (d: Date, days: number) => {
  const copy = new Date(d.getTime());
  copy.setDate(copy.getDate() + days);
  return copy;
};

/** Parse "08:30 AM" or "17:00" etc. */
const parseTime = (timeStr: string): { hours: number; minutes: number } => {
  // basic regex: 08:30, 8:30, 08:30 AM, etc.
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return { hours: 8, minutes: 0 };

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const ampm = match[3]?.toUpperCase();

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
};

/** Combine a date (Y-M-D) with a time string into a Date */
const combineDateAndTime = (date: Date, timeStr: string): Date => {
  const { hours, minutes } = parseTime(timeStr);
  const base = stripTime(date);
  base.setHours(hours, minutes, 0, 0);
  return base;
};

export function buildScheduleFromReservation(
  rd: ReservationData
): ReservationOccurrence[] {
  if (!rd.date) throw new Error('Reservation date is required');
  if (!rd.startTime || !rd.endTime) {
    throw new Error('Start and end time are required');
  }
  if (!rd.user_id) throw new Error('user_id is required');
  if (!rd.spot) throw new Error('spot (space id) is required');
  if (!rd.parkingLot) throw new Error('parkingLot is required');

  const pattern: RepeatPattern = rd.recurring
    ? (rd.repeatPattern as RepeatPattern) || 'daily'
    : 'none';

  const baseDate = stripTime(rd.date as Date);

  const firstStart = combineDateAndTime(baseDate, rd.startTime);
  const firstEnd = combineDateAndTime(baseDate, rd.endTime);

  const occurrences: ReservationOccurrence[] = [];

  const pushOccurrence = (start: Date, end: Date) => {
    occurrences.push({
      user_id: rd.user_id!,
      parking_lot: rd.parkingLot,
      spot_id: Number(rd.spot),
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
    });
  };

  // no recurrence → single reservation
  if (pattern === 'none') {
    pushOccurrence(firstStart, firstEnd);
    return occurrences;
  }

  // recurring → need an endDate
  const endDate = rd.endDate ? stripTime(rd.endDate as Date) : baseDate;
  // treat endDate as inclusive (until end of that day)
  const endLimit = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
    23,
    59,
    59,
    999
  );

  let currentStart = firstStart;
  let currentEnd = firstEnd;

  while (currentStart <= endLimit) {
    pushOccurrence(currentStart, currentEnd);

    if (pattern === 'daily') {
      currentStart = addDays(currentStart, 1);
      currentEnd = addDays(currentEnd, 1);
    } else if (pattern === 'weekly') {
      currentStart = addDays(currentStart, 7);
      currentEnd = addDays(currentEnd, 7);
    } else {
      // fallback: just in case
      break;
    }
  }

  return occurrences;
}
