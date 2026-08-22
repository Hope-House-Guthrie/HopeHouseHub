/**
 * UA Management — mock client UA rows (Phase 1).
 * MOCK ONLY. Stopping point 2026-08-20. Resume: page STATUS + Desktop plan.
 */
// MOCK DATA ONLY — replace later with active Client-role users from API.
// Swap these names/dates when you have a real current list.
import type { ClientUaTrackerRow } from "./types";

/** Build YYYY-MM-DD for N local calendar days before today (stable mock helper). */
function daysAgo(n: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const MOCK_CLIENT_UA_ROWS: ClientUaTrackerRow[] = [
  {
    id: "mock-c01",
    displayName: "Alex Mock",
    lastUaDate: daysAgo(3),
    lastUaType: "random",
  },
  {
    id: "mock-c02",
    displayName: "Blake Mock",
    lastUaDate: daysAgo(10),
    lastUaType: "scheduled",
  },
  {
    id: "mock-c03",
    displayName: "Casey Mock",
    lastUaDate: daysAgo(18),
    lastUaType: "random",
  },
  {
    id: "mock-c04",
    displayName: "Drew Mock",
    lastUaDate: daysAgo(28),
    lastUaType: "suspicion",
  },
  {
    id: "mock-c05",
    displayName: "Eden Mock",
    lastUaDate: daysAgo(35),
    lastUaType: "scheduled",
  },
  {
    id: "mock-c06",
    displayName: "Fin Mock",
    lastUaDate: daysAgo(45),
    lastUaType: "other",
    lastUaReason: "intake follow-up",
  },
  {
    id: "mock-c07",
    displayName: "Gray Mock",
    lastUaDate: null,
    lastUaType: null,
  },
  {
    id: "mock-c08",
    displayName: "Harper Mock",
    lastUaDate: daysAgo(1),
    lastUaType: "random",
  },
  {
    id: "mock-c09",
    displayName: "Indie Mock",
    lastUaDate: daysAgo(22),
    lastUaType: "scheduled",
  },
  {
    id: "mock-c10",
    displayName: "Jules Mock",
    lastUaDate: daysAgo(60),
    lastUaType: "random",
  },
];
