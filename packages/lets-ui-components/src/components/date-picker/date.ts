// Calendar arithmetic for the Date Picker. Every date here is a local
// midnight: `new Date('2026-01-16')` parses as UTC and lands on the 15th in any
// timezone west of Greenwich, so ISO strings go through `parseISODate` instead.

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseISODate(value: string | null | undefined): Date | null {
  const match = ISO_DATE.exec(value?.trim() ?? '');
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  // Rejects dates the constructor would roll over, like 2026-02-30.
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : null;
}

export interface DateRange {
  start: Date;
  end: Date;
}

// A range travels as an ISO 8601 interval, `start/end`, so it fits the same
// single `value` string — and the single `FormData` entry — as one date.
export function parseISORange(
  value: string | null | undefined
): DateRange | null {
  const parts = (value ?? '').split('/');
  if (parts.length !== 2) return null;
  const start = parseISODate(parts[0]);
  const end = parseISODate(parts[1]);
  return start && end && start <= end ? { start, end } : null;
}

export function toISORange({ start, end }: DateRange): string {
  return `${toISODate(start)}/${toISODate(end)}`;
}

export function toISODate(date: Date): string {
  const pad = (n: number, width = 2) => String(n).padStart(width, '0');
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

// Keeps the day of the month where it can and clamps it where it cannot:
// one month after January 31 is the last day of February, not March 3.
export function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0
  ).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function startOfWeek(date: Date, firstDayOfWeek: number): Date {
  const offset = (date.getDay() - firstDayOfWeek + 7) % 7;
  return addDays(date, -offset);
}

export function isOutOfRange(
  date: Date,
  min: Date | null,
  max: Date | null
): boolean {
  return (!!min && date < min) || (!!max && date > max);
}

export function clampDate(date: Date, min: Date | null, max: Date | null) {
  if (min && date < min) return min;
  if (max && date > max) return max;
  return date;
}

// The weeks that cover the month, each starting on `firstDayOfWeek`. Only as
// many rows as the month needs — four to six — padded with the neighbouring
// months' days so every row is full. `minWeeks` adds trailing rows, so months
// shown side by side line up.
export function monthWeeks(
  month: Date,
  firstDayOfWeek: number,
  minWeeks = 0
): Date[][] {
  const first = startOfWeek(startOfMonth(month), firstDayOfWeek);
  const last = endOfMonth(month);
  const weeks: Date[][] = [];
  for (
    let start = first;
    start <= last || weeks.length < minWeeks;
    start = addDays(start, 7)
  ) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(start, i)));
  }
  return weeks;
}
