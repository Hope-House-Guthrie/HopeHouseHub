/**
 * UA Management — recency config/helpers
 * FE mock Phases 1–2 DONE (thresholds + weights). Phases 0–8 FE mock complete 2026-08-20.
 * Resume: pages/ua-management/index.tsx STATUS + Desktop plan.
 */
// MOCK / open decision — not final house policy.
// Plan: keep clients under ~30 days; exact bands TBD.
import type {
  UaRecencyThresholds,
  UaRecencyStatus,
  UaClientWeightMultipliers,
} from "./types";

export const UA_RECENCY_THRESHOLDS: UaRecencyThresholds = {
  greenMaxDays: 14,
  yellowMaxDays: 30,
};

/**
 * MOCK client draw weights (phase 2) - not final policy.
 * Green still eligible; yellow/red/never heavier so overdue get pulled more often.
 * Tune these numbers in one place while testing redraws.
 */
export const UA_CLIENT_WEIGHT_MULTIPLIERS: UaClientWeightMultipliers = {
  green: 1,
  yellow: 2,
  red: 4,
  never: 5,
};

/** Look up weight for a status; unknown -> 1. */
export function weightForStatus(
  status: UaRecencyStatus,
  multipliers: UaClientWeightMultipliers = UA_CLIENT_WEIGHT_MULTIPLIERS,
): number {
  const w = multipliers[status];
  return typeof w === "number" && w > 0 ? w : 1;
}

/**
 * Pure helper: days since last UA from a YYYY_MM_DD string (local calender days).
 * null lastUaDate -> null days / status "never".
 */
export function daysSinceUaDate(
  lastUaDate: string | null,
  asOf: Date = new Date(),
): number | null {
  if (!lastUaDate) return null;
  const [y, m, d] = lastUaDate.split("-").map(Number);
  if (!y || !m || !d) return null;
  const then = new Date(y, m - 1, d);
  const today = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate());
  const ms = today.getTime() - then.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function statusFromDaysSince(
  daysSince: number | null,
  thresholds: UaRecencyThresholds = UA_RECENCY_THRESHOLDS,
): UaRecencyStatus {
  if (daysSince === null) return "never";
  if (daysSince <= thresholds.greenMaxDays) return "green";
  if (daysSince <= thresholds.yellowMaxDays) return "yellow";
  return "red";
}
