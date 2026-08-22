/**
 * UA Management — weighted client draw + Random UA Day (mock/FE only).
 * Phases 2–3 DONE. Stopping point 2026-08-20.
 * Hide/reveal: sealReveal.ts | UI: pages/ua-management
 * Not the backend seal job. Resume: page STATUS + Desktop plan.
 */
import {
  daysSinceUaDate,
  statusFromDaysSince,
  weightForStatus,
  UA_CLIENT_WEIGHT_MULTIPLIERS,
  UA_RECENCY_THRESHOLDS,
} from "./config";
import type {
  ClientUaTrackerRow,
  RandomUaWeekday,
  SealedClientPick,
  SealedWeekClientDraw,
  UaClientWeightMultipliers,
  UaRecencyThresholds,
} from "./types";

/** How many unique clients the weekly sealed client list targets. */
export const SEALED_CLIENT_PICK_COUNT = 5;

/** Fair Mon–Fri order for day draw (equal odds). */
export const RANDOM_UA_WEEKDAYS: RandomUaWeekday[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
];

const WEEKDAY_TO_JS_DAY: Record<RandomUaWeekday, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
};

export interface BuildSealedWeekClientDrawOptions {
  /** Defaults to "now" local. Used for days-since / status / weights / week. */
  asOf?: Date;
  /** Override MOCK multipliers while testing. */
  multipliers?: UaClientWeightMultipliers;
  /** Override G/Y/R cutoffs while testing. */
  thresholds?: UaRecencyThresholds;
  /** Inject RNG for tests; default Math.random (0 <= n < 1). */
  random?: () => number;
  /** Optional weekId; default mock-<timestamp>. */
  weekId?: string;
  /** Force Random UA Day (DEV/tests). Otherwise fair Mon–Fri draw. */
  randomDay?: RandomUaWeekday;
}

/** Local calendar YYYY-MM-DD from a Date. */
export function toDateOnlyLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Monday 00:00 local of the calendar week that contains `d`. */
export function startOfWeekMondayLocal(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const jsDay = x.getDay(); // 0 Sun … 6 Sat
  const offsetFromMon = jsDay === 0 ? -6 : 1 - jsDay;
  x.setDate(x.getDate() + offsetFromMon);
  return x;
}

/** YYYY-MM-DD for a Mon–Fri weekday in the week of `asOf`. */
export function dateForWeekdayInWeekOf(
  asOf: Date,
  weekday: RandomUaWeekday,
): string {
  const monday = startOfWeekMondayLocal(asOf);
  const jsDay = WEEKDAY_TO_JS_DAY[weekday];
  const target = new Date(monday);
  target.setDate(monday.getDate() + (jsDay - 1));
  return toDateOnlyLocal(target);
}

/** Fair pick of one Mon–Fri day. */
export function pickRandomUaWeekday(
  random: () => number = Math.random,
): RandomUaWeekday {
  const idx = Math.floor(random() * RANDOM_UA_WEEKDAYS.length);
  const clamped = Math.min(Math.max(idx, 0), RANDOM_UA_WEEKDAYS.length - 1);
  return RANDOM_UA_WEEKDAYS[clamped]!;
}

/**
 * Weighted sample without replacement.
 * pool items each have weight > 0. Returns up to `count` items.
 */
function pickWeightedWithoutReplacement<T>(
  pool: { item: T; weight: number }[],
  count: number,
  random: () => number,
): T[] {
  const remaining = pool
    .filter((p) => p.weight > 0)
    .map((p) => ({ ...p }));
  const picked: T[] = [];

  while (picked.length < count && remaining.length > 0) {
    const total = remaining.reduce((sum, p) => sum + p.weight, 0);
    if (total <= 0) break;

    let r = random() * total;
    let idx = 0;
    for (; idx < remaining.length; idx++) {
      const entry = remaining[idx]!;
      r -= entry.weight;
      if (r < 0) break;
    }
    if (idx >= remaining.length) idx = remaining.length - 1;

    const chosen = remaining[idx]!;
    picked.push(chosen.item);
    remaining.splice(idx, 1);
  }

  return picked;
}

/**
 * Build a sealed weekly draw: up to 5 clients + Random UA Day (Mon–Fri).
 * - Status/weights from lastUaDate as of `asOf` (default now).
 * - Day is fair Mon–Fri unless options.randomDay is set.
 * - randomDate = that weekday in the local week containing asOf.
 */
export function buildSealedWeekClientDraw(
  rows: ClientUaTrackerRow[],
  options: BuildSealedWeekClientDrawOptions = {},
): SealedWeekClientDraw {
  const asOf = options.asOf ?? new Date();
  const multipliers = options.multipliers ?? UA_CLIENT_WEIGHT_MULTIPLIERS;
  const thresholds = options.thresholds ?? UA_RECENCY_THRESHOLDS;
  const random = options.random ?? Math.random;

  const asOfDate = toDateOnlyLocal(asOf);
  const sealedAt = new Date().toISOString();
  const weekId = options.weekId ?? `mock-${sealedAt}`;

  const randomDay = options.randomDay ?? pickRandomUaWeekday(random);
  const randomDate = dateForWeekdayInWeekOf(asOf, randomDay);

  const pool = rows.map((row) => {
    const daysSinceAtSeal = daysSinceUaDate(row.lastUaDate, asOf);
    const statusAtSeal = statusFromDaysSince(daysSinceAtSeal, thresholds);
    const pick: SealedClientPick = {
      clientId: row.id,
      displayName: row.displayName,
      statusAtSeal,
      daysSinceAtSeal,
    };
    return {
      item: pick,
      weight: weightForStatus(statusAtSeal, multipliers),
    };
  });

  const clients = pickWeightedWithoutReplacement(
    pool,
    SEALED_CLIENT_PICK_COUNT,
    random,
  );
  const clientIds = clients.map((c) => c.clientId);

  return {
    weekId,
    sealedAt,
    asOfDate,
    randomDay,
    randomDate,
    clientIds,
    clients,
  };
}
