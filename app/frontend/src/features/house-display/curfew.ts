/**
 * House Display — Curfew / House Closing (pure, no React/Redux).
 * Ph0–3 runtime pure engine locked; Manage Ph1–7 COMPLETE 2026-08-30.
 * Ph0–1: types, seed, effective close, stages, window end = curfew.
 * Ph2–3: agenda markers + TV phase / system Spotlight inputs.
 * Final Break: after curfew, last 15 min of that clock hour (e.g. 10:45–11:00).
 * canManageCurfew: Admin FE gate for Manage card.
 *
 * Product locks:
 * - End-of-day midnight close = 1440 (not 0).
 * - Stages derived from one effective close (not four staff events).
 * - Post-curfew: House Closed until :45 past the hour, Final Break :45–:00,
 *   then House Closed for the night (linger until next open).
 * - TV wording: "Final Break" only (no slang aliases).
 * - One date override per dateYmd (lookup here; replace/clear via reducers).
 * - Board does not auto-extend past curfew for late *staff* events; window may
 *   include Final Break hour for house-status markers only.
 */

import type { HouseDisplayWeekday } from "./scheduleTypes";
import { timelineWindowForWeekday } from "./timeline";
import type { HouseDisplayTimelineWindow, HouseDisplayAgendaItem } from "./types";

/**
 * Weekday 0-6 for a calendar YYYY-MM-DD (UTC noon civil day).
 * Kept local here to avoid import cycles with resolveAgenda.
 */
function weekdayFromDateYmdLocal(dateYmd: string): HouseDisplayWeekday {
  const parts = dateYmd.split("-").map(Number);
  const y = parts[0] ?? 0;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return utc.getUTCDay() as HouseDisplayWeekday;
}

/** Minutes from Chicago midnight. End-of-day midnight close = 1440 (not 0). */
export type HouseDisplayCurfewCloseMin = number;

/** Closing sequence step ids (derived from effective curfew). */
export type HouseDisplayClosingStageId =
  | "t15"
  | "t10"
  | "t5"
  | "closed"
  | "finalBreak";

/**
 * TV / banner phase for the closing sequence.
 * none = outside closing window (normal house program).
 */
export type HouseDisplayClosingPhase =
  | "none"
  | "closing_t15"
  | "closing_t10"
  | "closing_t5"
  | "house_closed"
  | "final_break";

/** One derived closing stage on a single Chicago date's minute axis. */
export interface HouseDisplayClosingStage {
  id: HouseDisplayClosingStageId;
  /** Phase this stage maps to while now is in [startMin, endMin). */
  phase: Exclude<HouseDisplayClosingPhase, "none">;
  title: string;
  /** Inclusive start, minutes from midnight on that dateYmd. */
  startMin: number;
  /**
   * Exclusive end on that date's axis.
   * closed uses endMin 1440 (remainder of calendar day on the board).
   */
  endMin: number;
}

/** Weekly default close times: index 0=Sun … 6=Sat. */
export type HouseDisplayWeeklyCurfew = {
  closeMinByWeekday: [
    HouseDisplayCurfewCloseMin,
    HouseDisplayCurfewCloseMin,
    HouseDisplayCurfewCloseMin,
    HouseDisplayCurfewCloseMin,
    HouseDisplayCurfewCloseMin,
    HouseDisplayCurfewCloseMin,
    HouseDisplayCurfewCloseMin,
  ];
};

/** One date-specific close (true override: may be earlier or later than weekly). */
export interface HouseDisplayCurfewDateOverride {
  id: string;
  /** Hope House calendar day YYYY-MM-DD (America/Chicago). */
  dateYmd: string;
  closeMin: HouseDisplayCurfewCloseMin;
  /** Optional staff note (reason for the date override). */
  note?: string;
}

/** Full curfew config bag (Redux / DEV persist later). */
export interface HouseDisplayCurfewConfig {
  weekly: HouseDisplayWeeklyCurfew;
  overrides: HouseDisplayCurfewDateOverride[];
}

/** Sun–Thu 10:00 PM (1320), Fri–Sat 11:00 PM (1380). */
export const SEED_WEEKLY_CURFEW: HouseDisplayWeeklyCurfew = {
  closeMinByWeekday: [
    22 * 60, // Sun 10:00 PM
    22 * 60, // Mon
    22 * 60, // Tue
    22 * 60, // Wed
    22 * 60, // Thu
    23 * 60, // Fri 11:00 PM
    23 * 60, // Sat 11:00 PM
  ],
};

/** Seed config: weekly defaults, no date overrides. */
export const SEED_CURFEW_CONFIG: HouseDisplayCurfewConfig = {
  weekly: SEED_WEEKLY_CURFEW,
  overrides: [],
};

/**
 * Independent deep clone for Redux / content state.
 * Do not put SEED_CURFEW_CONFIG or SEED_WEEKLY_CURFEW on state by reference —
 * mutators must not mutate the exported seed weekly/overrides arrays.
 */
export function cloneCurfewConfig(
  config: HouseDisplayCurfewConfig,
): HouseDisplayCurfewConfig {
  const days = config.weekly.closeMinByWeekday;
  return {
    weekly: {
      closeMinByWeekday: [
        days[0],
        days[1],
        days[2],
        days[3],
        days[4],
        days[5],
        days[6],
      ],
    },
    overrides: config.overrides.map((o) => ({
      id: o.id,
      dateYmd: o.dateYmd,
      closeMin: o.closeMin,
      ...(o.note !== undefined ? { note: o.note } : {}),
    })),
  };
}

/** End-of-day midnight as minutes-from-midnight (not 0). */
export const CURFEW_END_OF_DAY_MIN = 24 * 60; // 1440

/**
 * Valid staff close time: finite integer in 1..1440.
 * 0 is rejected (ambiguous midnight — use 1440 for end of day).
 */
export function isValidCurfewCloseMin(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= CURFEW_END_OF_DAY_MIN
  );
}

/**
 * Add delta days to a YYYY-MM-DD string (UTC noon civil arithmetic).
 * Returns null if input is not a plausible YMD.
 */
export function addDaysToDateYmd(dateYmd: string, deltaDays: number): string | null {
  const parts = dateYmd.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (
    y == null ||
    m == null ||
    d == null ||
    !Number.isFinite(y) ||
    !Number.isFinite(m) ||
    !Number.isFinite(d)
  ) {
    return null;
  }
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  if (Number.isNaN(utc.getTime())) return null;
  utc.setUTCDate(utc.getUTCDate() + deltaDays);
  const yy = utc.getUTCFullYear();
  const mm = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utc.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * Override for one date if present and valid (first match).
 * Callers that enforce one-per-date replace do that at write time.
 */
export function findCurfewOverrideForDate(
  overrides: readonly HouseDisplayCurfewDateOverride[],
  dateYmd: string,
): HouseDisplayCurfewDateOverride | null {
  const hit = overrides.find((o) => o.dateYmd === dateYmd);
  if (!hit) return null;
  if (!isValidCurfewCloseMin(hit.closeMin)) return null;
  return hit;
}

/**
 * Effective house close minutes for one Chicago date.
 * Date override wins; else weekly default for that weekday.
 * Invalid config falls back to SEED weekly for that weekday.
 */
export function resolveEffectiveCurfewMin(args: {
  dateYmd: string;
  config: HouseDisplayCurfewConfig;
  /** Optional; defaults from dateYmd. */
  weekday?: HouseDisplayWeekday | number;
}): number {
  const { dateYmd, config } = args;
  const weekday = (args.weekday ?? weekdayFromDateYmdLocal(dateYmd)) as HouseDisplayWeekday;
  const dayIndex = Number(weekday);

  const override = findCurfewOverrideForDate(config.overrides ?? [], dateYmd);
  if (override) return override.closeMin;

  const weekly = config.weekly?.closeMinByWeekday;
  const fromWeekly =
    weekly && dayIndex >= 0 && dayIndex <= 6 ? weekly[dayIndex] : undefined;
  if (isValidCurfewCloseMin(fromWeekly)) return fromWeekly;

  const seed = SEED_WEEKLY_CURFEW.closeMinByWeekday[dayIndex as HouseDisplayWeekday];
  return isValidCurfewCloseMin(seed) ? seed : 22 * 60;
}

/**
 * Board / day open minutes for a weekday (same as timeline window start).
 */
export function resolveDayOpenMin(weekday: HouseDisplayWeekday | number): number {
  return timelineWindowForWeekday(weekday).windowStartMin;
}

/** Board length of the legacy short closed marker (minutes). Prefer finalBreakRange. */
export const CLOSED_STAGE_BOARD_MIN = 5;

/**
 * Final Break window for one effective close.
 * Examples (on-hour curfew):
 * - 10:00 PM (1320) → House Closed 1320–1365, Final Break 1365–1380
 * - 11:00 PM (1380) → House Closed 1380–1425, Final Break 1425–1440
 *
 * Rule: final 15 minutes of the clock hour that starts at floor(close/60)*60
 * (for typical on-hour closes, hour start === close).
 * Returns null if no same-day Final Break fits after close.
 */
export function finalBreakRangeForClose(closeMin: number): {
  startMin: number;
  endMin: number;
} | null {
  if (!isValidCurfewCloseMin(closeMin)) return null;
  if (closeMin >= CURFEW_END_OF_DAY_MIN) return null;

  const hourStart =
    Math.floor(Math.min(closeMin, CURFEW_END_OF_DAY_MIN - 1) / 60) * 60;
  let fbStart = hourStart + 45;
  let fbEnd = Math.min(hourStart + 60, CURFEW_END_OF_DAY_MIN);
  if (fbEnd <= fbStart) return null;
  // Curfew at/after the hour's :45 → Final Break is remainder of hour after close
  if (closeMin >= fbEnd) return null;
  if (closeMin > fbStart) fbStart = closeMin;
  if (fbEnd <= fbStart) return null;
  return { startMin: fbStart, endMin: fbEnd };
}

/**
 * Visible day-planner window for one Chicago date.
 * - Start: weekday open hours
 * - End: end of Final Break hour when present (close + up to 60), else curfew
 *   so post-curfew house status markers fit. Not a general late-event extend.
 */
export function timelineWindowForDate(args: {
  dateYmd: string;
  config?: HouseDisplayCurfewConfig;
  weekday?: HouseDisplayWeekday | number;
}): HouseDisplayTimelineWindow {
  const weekday = args.weekday ?? weekdayFromDateYmdLocal(args.dateYmd);
  const config = args.config ?? SEED_CURFEW_CONFIG;
  const windowStartMin = resolveDayOpenMin(weekday);
  const closeMin = resolveEffectiveCurfewMin({
    dateYmd: args.dateYmd,
    config,
    weekday,
  });
  const fb = finalBreakRangeForClose(closeMin);
  let windowEndMin = fb ? fb.endMin : closeMin;
  if (windowEndMin <= windowStartMin) {
    windowEndMin = windowStartMin + 60;
  }
  return { windowStartMin, windowEndMin };
}

/**
 * Derive closing stages from one effective close.
 * Pre-curfew: T-15, T-10, T-5.
 * Post-curfew: House Closed until Final Break start, then Final Break (:45–hour end).
 * After Final Break: house_closed is phase-only (linger), not a third board row.
 */
export function deriveClosingStages(args: {
  closeMin: number;
  openMin: number;
}): HouseDisplayClosingStage[] {
  const closeMin = args.closeMin;
  const openMin = args.openMin;
  if (!isValidCurfewCloseMin(closeMin)) return [];
  if (typeof openMin !== "number" || !Number.isFinite(openMin)) return [];

  const stages: HouseDisplayClosingStage[] = [];

  const pushIfOnBoard = (
    id: HouseDisplayClosingStageId,
    phase: Exclude<HouseDisplayClosingPhase, "none">,
    title: string,
    startMin: number,
    endMin: number,
  ) => {
    if (startMin < openMin) return;
    if (endMin <= startMin) return;
    stages.push({ id, phase, title, startMin, endMin });
  };

  pushIfOnBoard(
    "t15",
    "closing_t15",
    "Closing begins — shutdown sequence",
    closeMin - 15,
    closeMin - 10,
  );
  pushIfOnBoard(
    "t10",
    "closing_t10",
    "Everyone should be inside",
    closeMin - 10,
    closeMin - 5,
  );
  pushIfOnBoard(
    "t5",
    "closing_t5",
    "Everyone should be in their rooms",
    closeMin - 5,
    closeMin,
  );

  const fb = finalBreakRangeForClose(closeMin);
  if (fb && closeMin >= openMin) {
    // House Closed from curfew until Final Break
    if (fb.startMin > closeMin) {
      pushIfOnBoard(
        "closed",
        "house_closed",
        "House closed",
        closeMin,
        fb.startMin,
      );
    }
    pushIfOnBoard(
      "finalBreak",
      "final_break",
      "Final Break",
      fb.startMin,
      fb.endMin,
    );
  } else if (closeMin >= openMin && closeMin < CURFEW_END_OF_DAY_MIN) {
    // No Final Break window (edge): short closed marker at curfew
    const closedEnd = Math.min(
      CURFEW_END_OF_DAY_MIN,
      closeMin + CLOSED_STAGE_BOARD_MIN,
    );
    if (closedEnd > closeMin) {
      pushIfOnBoard("closed", "house_closed", "House closed", closeMin, closedEnd);
    }
  }

  return stages;
}

/**
 * Convenience: stages for a concrete date using config + open from weekday hours.
 */
export function deriveClosingStagesForDate(args: {
  dateYmd: string;
  config: HouseDisplayCurfewConfig;
  weekday?: HouseDisplayWeekday | number;
}): HouseDisplayClosingStage[] {
  const weekday = args.weekday ?? weekdayFromDateYmdLocal(args.dateYmd);
  const closeMin = resolveEffectiveCurfewMin({
    dateYmd: args.dateYmd,
    config: args.config,
    weekday,
  });
  const openMin = resolveDayOpenMin(weekday);
  return deriveClosingStages({ closeMin, openMin });
}

/**
 * Synthetic agenda rows for closing stages on one date (not staff schedule rows).
 * ids: closing:${dateYmd}:t15|t10|t5|closed
 */
export function buildClosingAgendaItems(args: {
  dateYmd: string;
  config?: HouseDisplayCurfewConfig;
  weekday?: HouseDisplayWeekday | number;
}): HouseDisplayAgendaItem[] {
  const config = args.config ?? SEED_CURFEW_CONFIG;
  const stages = deriveClosingStagesForDate({
    dateYmd: args.dateYmd,
    config,
    weekday: args.weekday,
  });
  return stages.map((stage) => ({
    id: `closing:${args.dateYmd}:${stage.id}`,
    title: stage.title,
    startMin: stage.startMin,
    endMin: stage.endMin,
    canceled: false,
    sourceType: "system" as const,
    systemKind: "closingStage" as const,
    closingStageId: stage.id,
    location: undefined,
    facilitator: undefined,
    logoKey: null,
  }));
}

/**
 * True when an agenda item should drive active-event Spotlight takeover.
 * System rows (Roll Call, closing) never take over.
 */
export function isSpotlightTakeoverAgendaItem(
  item: Pick<HouseDisplayAgendaItem, "sourceType" | "canceled">,
): boolean {
  if (item.canceled) return false;
  if (item.sourceType === "system") return false;
  return item.sourceType === "recurring" || item.sourceType === "oneTime";
}

/**
 * Derived closing-stage row (board paints as timed marker, not a class bar).
 */
export function isClosingStageAgendaItem(
  item: Pick<HouseDisplayAgendaItem, "sourceType" | "systemKind">,
): boolean {
  return item.sourceType === "system" && item.systemKind === "closingStage";
}

/**
 * Current closing / house-status phase for TV banner.
 *
 * Same calendar day (C = effective curfew):
 * - before T-15 (after open) → none
 * - [C-15,C-10) t15 · [C-10,C-5) t10 · [C-5,C) t5
 * - [C, FB start) house_closed
 * - [FB start, FB end) final_break  (e.g. 10:45–11:00 after 10pm curfew)
 * - [FB end, next open) house_closed (rest of night + early-morning linger)
 *
 * Early morning before open: house_closed (previous night’s close).
 */
export function resolveClosingPhase(args: {
  dateYmd: string;
  nowMin: number;
  config: HouseDisplayCurfewConfig;
  weekday?: HouseDisplayWeekday | number;
}): HouseDisplayClosingPhase {
  const { dateYmd, config } = args;
  const nowMin = args.nowMin;
  if (typeof nowMin !== "number" || !Number.isFinite(nowMin)) return "none";

  const weekday = args.weekday ?? weekdayFromDateYmdLocal(dateYmd);
  const openMin = resolveDayOpenMin(weekday);
  const closeMin = resolveEffectiveCurfewMin({ dateYmd, config, weekday });
  const fb = finalBreakRangeForClose(closeMin);

  // Early morning: closed linger until open (from previous day's curfew).
  if (nowMin < openMin) {
    const prevYmd = addDaysToDateYmd(dateYmd, -1);
    if (prevYmd == null) return "house_closed";
    const prevClose = resolveEffectiveCurfewMin({
      dateYmd: prevYmd,
      config,
    });
    if (isValidCurfewCloseMin(prevClose)) return "house_closed";
    return "none";
  }

  if (nowMin < closeMin - 15) return "none";
  if (nowMin < closeMin - 10) return "closing_t15";
  if (nowMin < closeMin - 5) return "closing_t10";
  if (nowMin < closeMin) return "closing_t5";

  // Post-curfew same day
  if (fb) {
    if (nowMin < fb.startMin) return "house_closed";
    if (nowMin < fb.endMin) return "final_break";
    return "house_closed";
  }
  return "house_closed";
}

/**
 * Display label for a close time. 1440 → end-of-day midnight wording.
 * Other values: 12h clock from minutes-from-midnight (0–1439 style).
 */
export function formatCurfewCloseLabel(closeMin: number): string {
  if (!isValidCurfewCloseMin(closeMin)) return "";
  if (closeMin === CURFEW_END_OF_DAY_MIN) return "12:00 AM (end of day)";

  const hour24 = Math.floor(closeMin / 60);
  const minute = closeMin % 60;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  const mm = minute.toString().padStart(2, "0");
  return `${hour12}:${mm} ${ampm}`;
}

/**
 * Admin-only FE gate for Curfew / House Closing Manage card.
 * Matches route role token "ADMIN". FE hide ≠ security — backend later.
 */
export const CURFEW_MANAGE_ROLES: readonly string[] = ["ADMIN"];

/** True when the signed-in user may manage house curfew config. */
export function canManageCurfew(
  userRoles: readonly string[] | null | undefined,
): boolean {
  if (userRoles == null || userRoles.length === 0) return false;
  return CURFEW_MANAGE_ROLES.some((required) => userRoles.includes(required));
}

/**
 * Map phase → staff-facing banner title (graphics later).
 */
export function closingPhaseBannerTitle(phase: HouseDisplayClosingPhase): string {
  switch (phase) {
    case "closing_t15":
      return "Closing begins — shutdown sequence";
    case "closing_t10":
      return "Everyone should be inside";
    case "closing_t5":
      return "Everyone should be in their rooms";
    case "final_break":
      return "Final Break";
    case "house_closed":
      return "House closed";
    case "none":
    default:
      return "";
  }
}
