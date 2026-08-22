/**
 * Vehicles — odometer helpers
 * FE complete 2026-08-22. Resume: pages/vehicles/index.tsx STATUS (authoritative).
 *
 * Pure math only:
 * - lastEndingMileage(trips, vehicleId) — odometer BASELINE for suggestions
 * - milesDriven(start, end) — null if invalid or end < start
 * - parseMileageInput(raw) — number or null
 *
 * Lower-mileage Save Anyway lives in the page Dialog, not here.
 * Exception trips stay in history but must NOT pull the baseline down.
 */
import type { TripRecord, VehicleId } from "./types";

/**
 * Odometer baseline for a vehicle (suggested trip start / maint prefill).
 *
 * Uses the highest ending mileage among NORMAL trips only
 * (endingMileage >= startingMileage). Lower-mileage exception trips
 * (end < start, Save Anyway) remain saved for audit but are ignored here
 * so they cannot lower the next suggested starting mileage.
 *
 * Empty history, or only exception trips → null (start field stays blank).
 */
export function lastEndingMileage(
  trips: TripRecord[],
  vehicleId: VehicleId
): number | null {
  let best: number | null = null;

  for (const t of trips) {
    if (t.vehicleId !== vehicleId) continue;
    // Skip lower-mileage exceptions — do not pull baseline down
    if (t.endingMileage < t.startingMileage) continue;
    if (!Number.isFinite(t.endingMileage)) continue;
    if (best === null || t.endingMileage > best) {
      best = t.endingMileage;
    }
  }

  return best;
}

/**
 * Miles driven from start/end odometer.
 * Returns null if either missing/invalid or end < start.
 */
export function milesDriven(
  startingMileage: number | null,
  endingMileage: number | null
): number | null {
  if (startingMileage === null || endingMileage === null) return null;
  if (!Number.isFinite(startingMileage) || !Number.isFinite(endingMileage)) {
    return null;
  }
  if (endingMileage < startingMileage) return null;
  return endingMileage - startingMileage;
}

/** Parse a number input string → number or null if empty/invalid. */
export function parseMileageInput(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return n;
}
