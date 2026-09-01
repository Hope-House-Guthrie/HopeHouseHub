/**
 * STATUS — House Display schedule display labels (pure)
 * Branch: feature/house-display
 *
 * Staff-facing weekday/time strings for manage (and later Add/Edit forms).
 * Not Daily Duties helpers — HD every-day is explicit [0..6], not [].
 */
import { formatTimeLabel } from "./timeline";
import type { HouseDisplayWeekday } from "./scheduleTypes";

/** Short labels 0=Sun … 6=Sat (matches JS getDay / scheduleTypes). */
export const HOUSE_DISPLAY_WEEKDAY_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

/**
 * Normalize weekday picks for display:
 * - integers in 0–6 only
 * - unique
 * - sorted ascending (calendar order, not seed array order)
 */
export function normalizeWeekdaysForDisplay(
  days: readonly number[],
): HouseDisplayWeekday[] {
  const uniq = [
    ...new Set(
      days.filter(
        (d): d is HouseDisplayWeekday =>
          Number.isInteger(d) && d >= 0 && d <= 6,
      ),
    ),
  ].sort((a, b) => a - b);
  return uniq;
}

/**
 * Human weekday line for a recurring series.
 * - empty after normalize → "" (no days stored; rare)
 * - all 7 days → "Every day"
 * - else "Mon, Thu" style
 */
export function formatRecurringDaysLabel(days: readonly number[]): string {
  const n = normalizeWeekdaysForDisplay(days);
  if (n.length === 0) return "";
  if (n.length === 7) return "Every day";
  return n.map((d) => HOUSE_DISPLAY_WEEKDAY_SHORT[d]).join(", ");
}

/**
 * Start–end range for manage lists (en dash matches Today's Schedule).
 * Storage stays numeric startMin/endMin.
 */
export function formatScheduleTimeRange(
  startMin: number,
  endMin: number,
): string {
  return `${formatTimeLabel(startMin)} – ${formatTimeLabel(endMin)}`;
}
