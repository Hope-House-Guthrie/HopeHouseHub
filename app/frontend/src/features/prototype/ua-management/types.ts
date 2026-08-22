/**
 * UA Management — types
 * FE mock Phases 1–8 DONE (2026-08-20).
 * Resume: pages/ua-management/index.tsx STATUS + Desktop plan.
 */

/** Green / yellow / red (or never tested). Thresholds live in config.ts */
export type UaRecencyStatus = "green" | "yellow" | "red" | "never";

/** Optional last UA flavor for display only (Phase 1). */
export type UaLastType =
  | "random"
  | "scheduled"
  | "suspicion"
  | "intake"
  | "other"
  | null;

/**
 * One row on the client UA tracker.
 * id stays stable for lists/keys; later backend can use the same shape.
 */
export interface ClientUaTrackerRow {
  id: string;
  displayName: string;
  /** ISO date-only YYYY-MM-DD, or null if never UA'd */
  lastUaDate: string | null;
  lastUaType?: UaLastType;
  lastUaReason?: string | null;
}

/** Derived fields for UI (computed client-side from lastUaDate + config). */
export interface ClientUaTrackerView extends ClientUaTrackerRow {
  daysSinceLastUa: number | null;
  status: UaRecencyStatus;
}

/** Centralized day cutoffs — mock/policy placeholders until finalized. */
export interface UaRecencyThresholds {
  /** daysSince <= greenMaxDays → green */
  greenMaxDays: number;
  /** daysSince <= yellowMaxDays → yellow; above → red */
  yellowMaxDays: number;
}

/**
 * MOCK weight multipliers by recency status (Phase 2).
 * Higher = more likely in the weighted draw. Not final house policy.
 */
export interface UaClientWeightMultipliers {
  green: number;
  yellow: number;
  red: number;
  never: number;
}

/** One client frozen into a sealed weekly draw (status snapshot at seal/as-of). */
export interface SealedClientPick {
  clientId: string;
  displayName: string;
  statusAtSeal: UaRecencyStatus;
  daysSinceAtSeal: number | null;
}

/** Monday - Friday only (Random UA Day). Sat/Sun never. */
export type RandomUaWeekday = "mon" | "tue" | "wed" | "thu" | "fri";

/** Display labels for Random UA Day (DEV / later UI). */
export const RANDOM_UA_WEEKDAY_LABELS: Record<RandomUaWeekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
};

/**
 * Sealed weekly draw (Phase 2 clients + Phase 3 day).
 * Production: server-persisted; here mock/in-memory only.
 * HIde randomDay / randomDate / clients from normal UI until reveal day.
 */
export interface SealedWeekClientDraw {
  /** Stable-ish week key for this mock seal (e.g. 2026-W34 or mock-...) */
  weekId: string;
  /** ISO datetime when this mock seal was created */
  sealedAt: string;
  /** YYYY_MM_DD "as-of" used for days-since / status / weights */
  asOfDate: string;
  /** Sealed Random UA Day (Mon-Fri). Do not show before reveal. */
  randomDay: RandomUaWeekday;
  /** Calendar YYYY-MM-DD for that weekday in the sealed week. */
  randomDate: string;
  /** Exactly five when pool allows; may be fewer if not enough clients */
  clientIds: string[];
  /** Same five (or fewer), with display snapshot at seal */
  clients: SealedClientPick[];
}

/**Completion on the reveal-day list (FE mock until form wires in). */
export type RandomUaTodayStatus = "pending" | "done";

/**
 * One person on "Random UA's Today".
 * Built from the sealed five only after reveal; never invent new names.
 */
export interface RandomUaTodayItem {
  clientId: string;
  displayName: string;
  /** Snapshot fromseal (not live tracker) */
  statusAtSeal: UaRecencyStatus;
  daysSinceAtSeal: number | null;
  /** ISO datetime when marked done; null if still pending */
  completedAt: string | null;
  completion: RandomUaTodayStatus;
}

/**
 * Staff-facing today board for one week seal (revealed only).
 * weekId + randomDate tie completed state so redraw starts clean.
 */
export interface RandomUaTodayBoard {
  weekId: string;
  randomDate: string;
  randomDay: RandomUaWeekday;
  items: RandomUaTodayItem[];
}

/**
 * One person in the Staff UA eligibility pool.
 * Paid staff only — do NOT derive from kitchen/admin Hub roles.
 * Deactivate instead of delete so history can stay attached later.
 */
export interface StaffUaPoolMember {
  id: string;
  displayName: string;
  /** Eligible for staff random pick when true */
  active: boolean;
  /** ISO datetime when added to the pool (mock) */
  addedAt: string;
  /** ISO datetime of last deactivate; null if never or currently active */
  deactivatedAt: string | null;
}

/**
 * Result of “Pick Random Staff” (FE mock).
 * Stable in page state until user picks again or clears.
 * Not tied to client Random UA Day.
 */
export interface StaffRandomPickResult {
  /** Pool member id */
  staffId: string;
  displayName: string;
  /** ISO datetime when the button was pressed */
  pickedAt: string;
}

// ---------------------------------------------------------------------------
// Phase 7 — FE access capabilities (mock gates; backend enforces later)
// ---------------------------------------------------------------------------

/**
 * Normalized role names for UA Management mock gates.
 * Product:
 * - admin / ua-admin → full UA Management page
 * - houseleader / staff → Random UAs Today see + check-off (dashboard later)
 * - viewer → no UA access (mock negative test)
 * Match Hub roleNormalizedNames when real auth wires in.
 */
export type UaManagementRoleHint =
  | "admin"
  | "ua-admin"
  | "houseleader"
  | "staff"
  | "viewer";

/**
 * What the UI may show for the current mock session.
 * Real nav: /ua-management admin-only; Today desk on dashboard for floor roles.
 */
export interface UaManagementCapabilities {
  /** Full management route/chrome (admin). Desk roles use dashboard later. */
  canAccessUaManagementPage: boolean;
  /** Client recency tracker table (admin management) */
  canViewTracker: boolean;
  /** Revealed Random UAs Today list (admin + houseleader + staff) */
  canViewRandomUaToday: boolean;
  /** Mark pending/done on today list (same desk roles) */
  canMarkRandomUaToday: boolean;
  /** Staff UA Pool add/deactivate/reactivate (admin) */
  canManageStaffPool: boolean;
  /** Pick Random Staff button (admin) */
  canPickRandomStaff: boolean;
  /** DEV seal redraw + sim today (admin only; never floor default) */
  canUseDevSealTools: boolean;
}
