/**
 * Walk-In Services — Redux slice (FE mock)
 *
 * Unit counts only; no PII. Totals = sum non-voided txns (never cumulative-only).
 * walk-in food box != kitchen_food_boxes. Kitchen Resources tab uses this slice too.
 *
 * STATUS (branch: walk-in-services) — leave 2026-08-16
 * DONE: categories/labels; recordServices; void/undoLast; Chicago day helpers;
 * sum day + prefix (month/year). Page + kitchen tab consume these — no new
 * kitchen reducers.
 * NEXT: backend persist + multi-device; optional who-recorded later.
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ---------------------------------------------------------------------------
// Categories — keep this exact order everywhere (UI, copy report, totals)
// ---------------------------------------------------------------------------

export const SERVICE_CATEGORIES = [
  "walk_in_meals",
  "walk_in_shower",
  "walk_in_clothing",
  "walk_in_hygiene",
  "walk_in_baby_items",
  "walk_in_laundry",
  "walk_in_food_box",
  "kitchen_food_boxes",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

/** Labels for UI + Copy Report (match house wording). */
export const SERVICE_CATEGORIES_LABELS: Record<ServiceCategory, string> = {
  walk_in_meals: "WALK-IN MEALS",
  walk_in_shower: "WALK-IN SHOWER",
  walk_in_clothing: "WALK-IN CLOTHING",
  walk_in_hygiene: "WALK-IN HYGIENE",
  walk_in_baby_items: "WALK-IN BABY ITEMS",
  walk_in_laundry: "WALK-IN LAUNDRY",
  walk_in_food_box: "WALK-IN FOOD BOX",
  kitchen_food_boxes: "KITCHEN FOOD BOXES",
};

/** Empty count map (all zeros). */
export function emptyCounts(): Record<ServiceCategory, number> {
  return {
    walk_in_meals: 0,
    walk_in_shower: 0,
    walk_in_clothing: 0,
    walk_in_hygiene: 0,
    walk_in_baby_items: 0,
    walk_in_laundry: 0,
    walk_in_food_box: 0,
    kitchen_food_boxes: 0,
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * One "Record Services" press (multi-service OK in one transaction).
 * Counts are service units, not every physical item inside a kit/box.
 */
export interface ServiceTransaction {
  id: string;
  /** ISO timestamp when staff hit Record */
  recordedAt: string;
  /**
   * Calendar day for reporting (YYYY-MM-DD).
   * Use America/Chicago so late-evening desk work stays on the house day.
   */
  serviceDate: string;
  /** Only categories with qty > 0 need to be present; zeros optional */
  counts: Partial<Record<ServiceCategory, number>>;
  /** Phase 2 corrections: void instead of deleting history */
  voided: boolean;
}

export interface WalkInServicesState {
  transactions: ServiceTransaction[];
}

const initialState: WalkInServicesState = {
  transactions: [],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** YYYY-MM-DD in America/Chicago for "today" buckets. */
export function chicagoServiceDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Drop zeros / negatives; keep integers only. */
function sanitizeCounts(
  input: Partial<Record<ServiceCategory, number>>,
): Partial<Record<ServiceCategory, number>> {
  const out: Partial<Record<ServiceCategory, number>> = {};
  for (const key of SERVICE_CATEGORIES) {
    const raw = input[key];
    if (typeof raw !== "number" || !Number.isFinite(raw)) continue;
    const n = Math.floor(raw);
    if (n > 0) out[key] = n;
  }
  return out;
}

export function countsHaveAny(
  counts: Partial<Record<ServiceCategory, number>>,
): boolean {
  return Object.values(counts).some((n) => typeof n === "number" && n > 0);
}

/**
 * Sum non-voided transactions for one serviceDate (YYYY-MM-DD).
 * Default date = Chicago "today". Used for live Today board.
 */
export function sumTotalsForServiceDate(
  transactions: ServiceTransaction[],
  serviceDate: string = chicagoServiceDate(),
): Record<ServiceCategory, number> {
  const totals = emptyCounts();
  for (const tx of transactions) {
    if (tx.voided) continue;
    if (tx.serviceDate !== serviceDate) continue;
    for (const key of SERVICE_CATEGORIES) {
      const n = tx.counts[key];
      if (typeof n === "number" && n > 0) {
        totals[key] += n;
      }
    }
  }
  return totals;
}

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

/** YYYY-MM in America/Chicago (month bucket for reports). */
export function chicagoYearMonth(now: Date = new Date()): string {
  return chicagoServiceDate(now).slice(0, 7);
}

/** YYYY in America.Chicago (year bucket for reports). */
export function chicagoYear(now: Date = new Date()): string {
  return chicagoServiceDate(now).slice(0, 4);
}

/**
 * Sum non-voided transactions whose serviceDate starts with prefix.
 * Use prefix "YYYY-MM" for a month, or "YYYY" for a full year.
 * Used by Phase 3 reporting + Copy Report (derived totals only).
 */
export function sumTotalsForServiceDatePrefix(
  transactions: ServiceTransaction[],
  prefix: string,
): Record<ServiceCategory, number> {
  const totals = emptyCounts();
  for (const tx of transactions) {
    if (tx.voided) continue;
    if (!tx.serviceDate.startsWith(prefix)) continue;
    for (const key of SERVICE_CATEGORIES) {
      const n = tx.counts[key];
      if (typeof n === "number" && n > 0) {
        totals[key] += n;
      }
    }
  }
  return totals;
}

export const walkInServicesSlice = createSlice({
  name: "walkInServices",
  initialState,
  reducers: {
    /**
     * Append one multi-service transaction, then UI resets local counters to 0.
     * Ignores empty payloads (all zeros).
     */
    recordServices: (
      state,
      action: PayloadAction<{
        counts: Partial<Record<ServiceCategory, number>>;
        /** Optional override for tests; default = now */
        recordedAt?: string;
      }>,
    ) => {
      const counts = sanitizeCounts(action.payload.counts);
      if (!countsHaveAny(counts)) return;

      const recordedAt = action.payload.recordedAt ?? new Date().toISOString();
      const serviceDate = chicagoServiceDate(new Date(recordedAt));

      state.transactions.push({
        id: crypto.randomUUID(),
        recordedAt,
        serviceDate,
        counts,
        voided: false,
      });
    },

    /** Mark one transaction voided (keeps history; totals skip it). */
    voidTransaction: (state, action: PayloadAction<string>) => {
      const tx = state.transactions.find((t) => t.id === action.payload);
      if (tx) tx.voided = true;
    },

    /**
     * Same-day desk fix: void the newest non-voided transaction.
     * No-op if none left.
     */
    undoLastTransaction: (state) => {
      for (let i = state.transactions.length - 1; i >= 0; i--) {
        const tx = state.transactions[i];
        if (tx && !tx.voided) {
          tx.voided = true;
          return;
        }
      }
    },
  },
});

export const { recordServices, voidTransaction, undoLastTransaction } =
  walkInServicesSlice.actions;
export default walkInServicesSlice.reducer;
