/**
 * STATUS — House Display schedule form helpers (pure)
 * Branch: feature/house-display
 *
 * UI/form only: HTML time ↔ minutes-from-midnight, staff ids, form validate.
 * Call newRecurringClassId / newOneTimeEventId in the page BEFORE dispatch —
 * never inside reducers.
 * validateRecurringClassForm (S2.3); validateOneTimeEventForm (S2.5).
 * Not Daily Duties helpers. Does not touch resolve/seed.
 */

/**
 * Parse HTML / MUI TextField type="time" value → minutes from midnight.
 * Accepts "HH:mm" or "HH:mm:ss". Empty or out-of-range → null (invalid).
 */
import type { HouseDisplayWeekday } from "./scheduleTypes";

export function parseTimeInputToMin(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(trimmed);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return hour * 60 + minute;
}

/**
 * Minutes from midnight → "HH:mm" for type="time" inputs (Edit later / defaults).
 * Storage in Redux stays numeric startMin/endMin.
 */
export function formatMinToTimeInput(minFromMidnight: number): string {
  const dayMins = 24 * 60;
  const normalized =
    ((Math.round(minFromMidnight) % dayMins) + dayMins) % dayMins;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

/**
 * Stable unique id for a staff-created recurring series.
 * Prefix makes DEV tooling obvious vs seed ids like "i-matter".
 * UUID has hyphens only (no ":") so occurrence ids stay `${seriesId}:${dateYmd}`.
 */
export function newRecurringClassId(): string {
  return `class-${crypto.randomUUID()}`;
}

/** Raw fields from Add/Edit Class dialog (HTML time strings + weekday ints). */
export type ValidateRecurringClassFormInput = {
  title: string;
  startTime: string;
  endTime: string;
  days: readonly number[];
};

export type ValidateRecurringClassFormResult =
  | { ok: false; error: string }
  | {
      ok: true;
      title: string;
      startMin: number;
      endMin: number;
      daysOfWeek: HouseDisplayWeekday[];
    };

/**
 * Shared Add/Edit Class validation - pure; no React/Redux.
 * Messages and check order match S2.2 manage handleAddClassSubmit.
 * Empty days ≠ every day (HD rule). Does not set id or active.
 */
export function validateRecurringClassForm(
  input: ValidateRecurringClassFormInput,
): ValidateRecurringClassFormResult {
  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Class name is required." };
  }

  const startMin = parseTimeInputToMin(input.startTime);
  if (startMin == null) {
    return { ok: false, error: "Start time is required." };
  }

  const endMin = parseTimeInputToMin(input.endTime);
  if (endMin == null) {
    return { ok: false, error: "End time is required." };
  }

  if (endMin <= startMin) {
    return { ok: false, error: "End time must be later than start time." };
  }

  // Unique sorted 0-6 only (same idea as slice normalize; empty stay invalid)
  const daysOfWeek = [
    ...new Set(
      input.days.filter(
        (d): d is HouseDisplayWeekday =>
          Number.isInteger(d) && d >= 0 && d <= 6,
      ),
    ),
  ].sort((a, b) => a - b);

  if (daysOfWeek.length === 0) {
    return {
      ok: false,
      error: "Select at least one day. Empty is not every day.",
    };
  }

  return { ok: true, title, startMin, endMin, daysOfWeek };
}

/**
 * Staff-created one-time event id.
 * Prefix once- vs class- / seed kebab. UUID hyphens only (no ":") so
 * cancel/restore never treats it as recurring ${seriesId}:${dateYmd}.
 * UI only - never call inside reducers.
 */
export function newOneTimeEventId(): string {
  return `once-${crypto.randomUUID()}`;
}

/** Raw fields from Add/Edit One-Time dialog (date + HTML times). */
export type ValidateOneTimeEventFormInput = {
  title: string;
  /** Chicago civil day YYYY-MM-DD from type="date" */
  dateYmd: string;
  startTime: string;
  endTime: string;
};

export type ValidateOneTimeEventFormResult =
  | { ok: false; error: string }
  | {
      ok: true;
      title: string;
      dateYmd: string;
      startMin: number;
      endMin: number;
    };

/**
 * Real calendar YYYY-MM-DD only (pure, TZ-independent).
 * Rejects regex-shaped fakes like 2026-02-30.
 */
export function parseDateInputToYmd(value: string): string | null {
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  // UTC noon construct → read back Y-M-D; mismatch = invalid civil date
  const utc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }

  return trimmed;
}

/**
 * Shared Add/Edit One-Time validation — pure; no React/Redux.
 * Order: title → date → start → end → end > start.
 * Does not set id, active, or canceled.
 */
export function validateOneTimeEventForm(
  input: ValidateOneTimeEventFormInput,
): ValidateOneTimeEventFormResult {
  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Event name is required." };
  }

  const dateYmd = parseDateInputToYmd(input.dateYmd);
  if (dateYmd == null) {
    return { ok: false, error: "Date is required." };
  }

  const startMin = parseTimeInputToMin(input.startTime);
  if (startMin == null) {
    return { ok: false, error: "Start time is required." };
  }
  const endMin = parseTimeInputToMin(input.endTime);
  if (endMin == null) {
    return { ok: false, error: "End time is required." };
  }
  if (endMin <= startMin) {
    return { ok: false, error: "End time must be later than start time." };
  }

  return { ok: true, title, dateYmd, startMin, endMin };
}
