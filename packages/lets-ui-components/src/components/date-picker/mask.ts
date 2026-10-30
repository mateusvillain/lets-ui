// The input mask of a typed date. The order of the fields and the marks
// between them come from the locale — `31/12/2026` in Brazil, `12/31/2026` in
// the United States, `2026/12/31` in Japan — and only digits are typed: the
// marks are filled in as the digits arrive.

import { parseISODate } from './date.js';

export type MaskField = 'day' | 'month' | 'year';
export type MaskSegment =
  | { field: MaskField; length: number }
  | { literal: string };

const FIELD_LENGTH: Record<MaskField, number> = { day: 2, month: 2, year: 4 };
const FIELD_LETTER: Record<MaskField, string> = {
  day: 'd',
  month: 'm',
  year: 'y',
};
// Right-to-left locales wrap their marks in direction marks, which would
// otherwise be typed over as if they were characters.
const BIDI_MARKS = /[\u200e\u200f\u061c]/g;
// A slash or a hyphen gets a space on each side, `16 / 01 / 2026`, so the
// fields read apart. Dots and the marks that already carry a space stay as the
// locale writes them.
const SPACED_MARK = /^[/-]$/;
const ISO_MASK: MaskSegment[] = [
  { field: 'year', length: 4 },
  { literal: ' - ' },
  { field: 'month', length: 2 },
  { literal: ' - ' },
  { field: 'day', length: 2 },
];

// `formatter` must give two-digit days and months, a numeric year and Latin
// digits, so every field has a fixed width.
export function dateMask(formatter: Intl.DateTimeFormat): MaskSegment[] {
  const segments: MaskSegment[] = [];
  for (const part of formatter.formatToParts(new Date(2026, 11, 31))) {
    if (part.type === 'day' || part.type === 'month' || part.type === 'year') {
      segments.push({ field: part.type, length: FIELD_LENGTH[part.type] });
    } else if (part.type === 'literal' && segments.length) {
      const literal = part.value.replace(BIDI_MARKS, '');
      if (literal) {
        segments.push({
          literal: SPACED_MARK.test(literal) ? ` ${literal} ` : literal,
        });
      }
    }
  }
  // A trailing mark, like the period a Korean date ends with, stands between
  // the date and nothing.
  while (segments.length && 'literal' in segments[segments.length - 1]) {
    segments.pop();
  }
  const fields = segments.filter((s) => 'field' in s).length;
  return fields === 3 ? segments : ISO_MASK;
}

// Two dates, one after the other, for a range.
export function rangeMask(mask: MaskSegment[]): MaskSegment[] {
  return [...mask, { literal: ' – ' }, ...mask];
}

export function maskCapacity(mask: MaskSegment[]): number {
  return mask.reduce((sum, s) => sum + ('field' in s ? s.length : 0), 0);
}

// `DD/MM/YYYY`, for the placeholder.
export function maskPattern(mask: MaskSegment[]): string {
  return mask
    .map((s) =>
      'field' in s ? FIELD_LETTER[s.field].repeat(s.length) : s.literal
    )
    .join('');
}

// Lays the digits over the mask. A mark is written only once a digit follows
// it, so deleting the last digit of a field never leaves the caret stuck
// behind a mark that writes itself back.
export function applyMask(digits: string, mask: MaskSegment[]): string {
  let text = '';
  let pending = '';
  let i = 0;
  for (const segment of mask) {
    if (i >= digits.length) break;
    if ('literal' in segment) {
      pending += segment.literal;
      continue;
    }
    text += pending + digits.slice(i, i + segment.length);
    pending = '';
    i += segment.length;
  }
  return text;
}

// The digits that spell `dates` in the mask, the inverse of `readMask`.
export function maskDigits(dates: Date[], mask: MaskSegment[]): string {
  let digits = '';
  let index = 0;
  let seen = 0;
  for (const segment of mask) {
    if ('literal' in segment) continue;
    const date = dates[index];
    const value =
      segment.field === 'day'
        ? date.getDate()
        : segment.field === 'month'
          ? date.getMonth() + 1
          : date.getFullYear();
    digits += String(value).padStart(segment.length, '0');
    if (++seen % 3 === 0) index++;
  }
  return digits;
}

// The dates a full set of digits spells, or null when one does not exist,
// like February 30.
export function readMask(digits: string, mask: MaskSegment[]): Date[] | null {
  const dates: Date[] = [];
  let parts: Partial<Record<MaskField, string>> = {};
  let i = 0;
  for (const segment of mask) {
    if ('literal' in segment) continue;
    parts[segment.field] = digits.slice(i, (i += segment.length));
    if (parts.day && parts.month && parts.year) {
      const date = parseISODate(`${parts.year}-${parts.month}-${parts.day}`);
      if (!date) return null;
      dates.push(date);
      parts = {};
    }
  }
  return dates;
}

// The position just after the `count`-th digit of `text`.
export function caretAfterDigits(text: string, count: number): number {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < text.length; i++) {
    if (/\d/.test(text[i]) && ++seen === count) return i + 1;
  }
  return text.length;
}
