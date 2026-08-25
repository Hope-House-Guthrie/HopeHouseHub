/**
 * STATUS — House Display schedule form helpers (pure)
 * Branch: feature/house-display
 *
 * UI/form only: HTML time ↔ minutes-from-midnight, staff series ids.
 * Call newRecurringClassId in the page BEFORE dispatch — never inside reducers.
 * validateRecurringClassForm shared by Add/Edit UI (S2.3).
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
