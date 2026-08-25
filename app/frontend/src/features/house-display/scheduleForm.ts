/**
 * STATUS — House Display schedule form helpers (pure)
 * Branch: feature/house-display
 *
 * UI/form only: HTML time ↔ minutes-from-midnight, staff series ids.
 * Call newRecurringClassId in the page BEFORE dispatch — never inside reducers.
 * Not Daily Duties helpers. Does not touch resolve/seed.
 */

/**
 * Parse HTML / MUI TextField type="time" value → minutes from midnight.
 * Accepts "HH:mm" or "HH:mm:ss". Empty or out-of-range → null (invalid).
 */
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
