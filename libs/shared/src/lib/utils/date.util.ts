import { differenceInCalendarDays, format, isBefore, isAfter, parseISO, startOfDay } from 'date-fns';

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  return Math.max(0, differenceInCalendarDays(checkOut, checkIn));
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function dateRangeOverlaps(
  [startA, endA]: [Date, Date],
  [startB, endB]: [Date, Date]
): boolean {
  return isBefore(startA, endB) && isAfter(endA, startB);
}

export function isFutureDate(date: Date): boolean {
  return isAfter(startOfDay(date), startOfDay(new Date()));
}

export function generateDateRange(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  while (!isAfter(current, end)) {
    dates.push(toISODateString(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}
