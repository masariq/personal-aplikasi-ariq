import type { ISODate } from '../types';

/** Local date (not UTC) as YYYY-MM-DD. Avoids off-by-one from timezone shifts. */
export function toISODate(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): ISODate {
  return toISODate(new Date());
}

export function fromISODate(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDaysISO(iso: ISODate, days: number): ISODate {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Whole-day difference: b - a. Positive if b is after a. */
export function daysBetween(a: ISODate, b: ISODate): number {
  const MS = 24 * 60 * 60 * 1000;
  const da = fromISODate(a);
  const db = fromISODate(b);
  da.setHours(0, 0, 0, 0);
  db.setHours(0, 0, 0, 0);
  return Math.round((db.getTime() - da.getTime()) / MS);
}

export function isoNow(): string {
  return new Date().toISOString();
}

export function isSameDay(a: ISODate, b: ISODate): boolean {
  return a === b;
}

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function weekdayShort(iso: ISODate): string {
  return WEEKDAYS_SHORT[fromISODate(iso).getDay()];
}

export function weekdayLong(iso: ISODate): string {
  return WEEKDAYS_LONG[fromISODate(iso).getDay()];
}

export function monthShort(iso: ISODate): string {
  return MONTHS[fromISODate(iso).getMonth()];
}

export function dayOfMonth(iso: ISODate): number {
  return fromISODate(iso).getDate();
}

/** "Jul 21, 2026" */
export function formatDate(iso: ISODate): string {
  const d = fromISODate(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** "Mon, Jul 21" */
export function formatDateShort(iso: ISODate): string {
  const d = fromISODate(iso);
  return `${WEEKDAYS_SHORT[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** Start of the week (Sunday) for the given date. */
export function startOfWeek(iso: ISODate): ISODate {
  const d = fromISODate(iso);
  const day = d.getDay();
  return addDaysISO(iso, -day);
}

/** Returns the 7 ISO dates of the week containing `iso` (Sun..Sat). */
export function weekDates(iso: ISODate): ISODate[] {
  const start = startOfWeek(iso);
  return Array.from({ length: 7 }, (_, i) => addDaysISO(start, i));
}

/** Inclusive range of ISO dates from start, length n. */
export function dateRange(start: ISODate, n: number): ISODate[] {
  return Array.from({ length: n }, (_, i) => addDaysISO(start, i));
}

export function isFuture(iso: ISODate): boolean {
  return daysBetween(todayISO(), iso) > 0;
}

export function isToday(iso: ISODate): boolean {
  return iso === todayISO();
}
