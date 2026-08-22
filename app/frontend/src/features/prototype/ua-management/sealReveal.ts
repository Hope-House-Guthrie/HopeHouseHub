/**
 * UA Management — Phase 3 seal hide / reveal helpers (mock/FE only).
 * Stopping point 2026-08-20. Backend will own real seal + auth later.
 * Resume: page STATUS header.
 */
import { RANDOM_UA_WEEKDAY_LABELS } from "./types";
import type { RandomUaWeekday, SealedWeekClientDraw } from "./types";
import { toDateOnlyLocal } from "./weightedClientDraw";

/** Parse YYYY-MM-DD as local calendar Date (noon-safe via y/m/d parts). */
export function parseDateOnlyLocal(dateOnly: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || !mo || !d) return null;
  return new Date(y, mo - 1, d);
}

/**
 * True when asOfDate (YYYY-MM-DD) is on or after the sealed randomDate.
 * Same calendar day = revealed. Before that day = hidden.
 */
export function isSealRevealed(
  seal: SealedWeekClientDraw,
  asOfDate: string,
): boolean {
  // String compare works for ISO date-only YYYY-MM-DD
  return asOfDate >= seal.randomDate;
}

/** Label for sealed weekday (e.g. "Wednesday"). */
export function randomDayLabel(day: RandomUaWeekday): string {
  return RANDOM_UA_WEEKDAY_LABELS[day] ?? day;
}

/**
 * What the DEV/admin mock UI may show.
 * - hidden: no day name, no date, no client names
 * - revealed: full seal fields OK for mock display
 */
export type SealUiMode = "hidden" | "revealed";

export function sealUiMode(
  seal: SealedWeekClientDraw | null,
  asOfDate: string,
): SealUiMode {
  if (!seal) return "hidden";
  return isSealRevealed(seal, asOfDate) ? "revealed" : "hidden";
}

/** Today as local YYYY-MM-DD (or from a Date you pass — DEV sim). */
export function asOfDateFrom(d: Date = new Date()): string {
  return toDateOnlyLocal(d);
}
