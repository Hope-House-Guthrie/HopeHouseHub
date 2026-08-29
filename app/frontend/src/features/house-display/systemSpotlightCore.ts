/**
 * House Display — system Spotlight pure resolve (no asset imports).
 * Image URLs come from getSystemSpotlightImage (wired in systemSpotlight.ts).
 */

import type { HouseDisplayWeekday } from "./scheduleTypes";
import {
  SEED_CURFEW_CONFIG,
  closingPhaseBannerTitle,
  finalBreakRangeForClose,
  resolveClosingPhase,
  resolveDayOpenMin,
  resolveEffectiveCurfewMin,
  type HouseDisplayClosingPhase,
  type HouseDisplayCurfewConfig,
} from "./curfew";
import { ROLL_CALL_DURATION_MIN } from "./timeline";

/** 5:00 AM — Good Morning starts; overnight post-break art ends. */
export const GOOD_MORNING_START_MIN = 5 * 60;

/** System Spotlight begins this many minutes before board Roll Call. */
export const ROLL_CALL_SPOTLIGHT_LEAD_MIN = 5;

/** Alternate T-5 graphics every N minutes within the T-5 stage. */
export const T5_ART_ROTATE_MIN = 1;

export type SystemSpotlightKind =
  | "goodMorning"
  | "rollCall"
  | "closing_t15"
  | "closing_t10"
  | "closing_t5"
  | "house_closed"
  | "final_break"
  | "house_closed_after";

/** Stable asset keys (Management can target these later). */
export type SystemSpotlightAssetKey =
  | "good-morning"
  | "roll-call"
  | "closing-begins"
  | "everyone-inside"
  | "in-your-rooms"
  | "in-your-rooms-v2"
  | "house-closed"
  | "final-break"
  | "final-break-over";

export interface SystemSpotlightState {
  kind: SystemSpotlightKind;
  /** Stable id for crossfade / dual-layer identity (includes T-5 art variant). */
  id: string;
  title: string;
  subtitle?: string;
  assetKey: SystemSpotlightAssetKey;
  /**
   * Bundled image URL when art exists.
   * null → TV renders text/placeholder fallback (no broken img).
   */
  imageUrl: string | null;
  /**
   * hard: wins over active class/event (Roll Call lead-in+, closing sequence).
   * fallback: only when no active class/event (Good Morning morning filler).
   */
  priority: "hard" | "fallback";
}

export type SystemSpotlightImageGetter = (
  key: SystemSpotlightAssetKey,
) => string | null | undefined;

const KIND_TITLE: Record<SystemSpotlightKind, string> = {
  goodMorning: "Good morning",
  rollCall: "Roll Call",
  closing_t15: "Closing begins — shutdown sequence",
  closing_t10: "Everyone should be inside",
  closing_t5: "Everyone should be in their rooms",
  house_closed: "House closed",
  final_break: "Final Break",
  house_closed_after: "House closed",
};

function weekdayFromDateYmdLocal(dateYmd: string): HouseDisplayWeekday {
  const parts = dateYmd.split("-").map(Number);
  const y = parts[0] ?? 0;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return utc.getUTCDay() as HouseDisplayWeekday;
}

function resolveOpenMin(
  dateYmd: string,
  weekday?: HouseDisplayWeekday | number,
): number {
  return resolveDayOpenMin(weekday ?? weekdayFromDateYmdLocal(dateYmd));
}

export function defaultAssetKeyForKind(
  kind: SystemSpotlightKind,
): SystemSpotlightAssetKey {
  switch (kind) {
    case "goodMorning":
      return "good-morning";
    case "rollCall":
      return "roll-call";
    case "closing_t15":
      return "closing-begins";
    case "closing_t10":
      return "everyone-inside";
    case "closing_t5":
      return "in-your-rooms";
    case "house_closed":
      return "house-closed";
    case "final_break":
      return "final-break";
    case "house_closed_after":
      return "final-break-over";
  }
}

/**
 * Pick T-5 art variant for the same system state (not a second schedule stage).
 * Alternates every T5_ART_ROTATE_MIN minutes while in T-5.
 */
export function pickT5AssetKey(nowMin: number): SystemSpotlightAssetKey {
  const slot = Math.floor(nowMin / T5_ART_ROTATE_MIN);
  return slot % 2 === 0 ? "in-your-rooms" : "in-your-rooms-v2";
}

function buildState(args: {
  kind: SystemSpotlightKind;
  dateYmd: string;
  getImage: SystemSpotlightImageGetter;
  assetKey?: SystemSpotlightAssetKey;
  subtitle?: string;
  titleOverride?: string;
  idSuffix?: string;
}): SystemSpotlightState {
  const assetKey = args.assetKey ?? defaultAssetKeyForKind(args.kind);
  const raw = args.getImage(assetKey);
  const imageUrl =
    typeof raw === "string" && raw.trim().length > 0 ? raw : null;
  const idBase = `system:${args.kind}:${args.dateYmd}`;
  // Good Morning is morning filler only — never blocks an active class/event.
  const priority: "hard" | "fallback" =
    args.kind === "goodMorning" ? "fallback" : "hard";
  return {
    kind: args.kind,
    id: args.idSuffix ? `${idBase}:${args.idSuffix}` : idBase,
    title: args.titleOverride ?? KIND_TITLE[args.kind],
    subtitle: args.subtitle,
    assetKey,
    imageUrl,
    priority,
  };
}

/**
 * Map closing phase → system kind, splitting House Closed pre- vs post–Final Break.
 * Pre-break: house-closed. Post-break (and overnight until 5am): final-break-over.
 */
function kindFromClosingPhase(args: {
  phase: HouseDisplayClosingPhase;
  dateYmd: string;
  nowMin: number;
  config: HouseDisplayCurfewConfig;
  weekday?: HouseDisplayWeekday | number;
}): SystemSpotlightKind | null {
  const { phase, dateYmd, nowMin, config, weekday } = args;
  switch (phase) {
    case "closing_t15":
      return "closing_t15";
    case "closing_t10":
      return "closing_t10";
    case "closing_t5":
      return "closing_t5";
    case "final_break":
      return "final_break";
    case "house_closed": {
      const closeMin = resolveEffectiveCurfewMin({ dateYmd, config, weekday });
      const fb = finalBreakRangeForClose(closeMin);
      if (fb && nowMin >= fb.endMin) return "house_closed_after";
      const openMin = resolveOpenMin(dateYmd, weekday);
      if (nowMin < openMin) return "house_closed_after";
      return "house_closed";
    }
    case "none":
    default:
      return null;
  }
}

/**
 * Resolve which system state (if any) owns Spotlight right now.
 *
 * Order:
 * 1) Good Morning [5:00 AM, Roll Call start − 5)
 * 2) Roll Call Spotlight [Roll Call start − 5, Roll Call end)
 * 3) Overnight before 5am → post–Final Break art
 * 4) Closing / Final Break / House Closed (pre or post) via resolveClosingPhase
 * 5) null → normal / class Spotlight
 */
export function resolveSystemSpotlightStateWithImages(args: {
  dateYmd: string;
  nowMin: number;
  config?: HouseDisplayCurfewConfig;
  weekday?: HouseDisplayWeekday | number;
  getImage: SystemSpotlightImageGetter;
}): SystemSpotlightState | null {
  const { dateYmd, nowMin, getImage } = args;
  if (typeof nowMin !== "number" || !Number.isFinite(nowMin)) return null;

  const config = args.config ?? SEED_CURFEW_CONFIG;
  const weekday = args.weekday ?? weekdayFromDateYmdLocal(dateYmd);
  const openMin = resolveOpenMin(dateYmd, weekday);
  const rollCallEnd = openMin + ROLL_CALL_DURATION_MIN;
  const rollCallSpotlightStart = openMin - ROLL_CALL_SPOTLIGHT_LEAD_MIN;

  if (nowMin >= GOOD_MORNING_START_MIN && nowMin < rollCallSpotlightStart) {
    return buildState({
      kind: "goodMorning",
      dateYmd,
      getImage,
      subtitle: "Hope House",
    });
  }

  if (nowMin >= rollCallSpotlightStart && nowMin < rollCallEnd) {
    return buildState({
      kind: "rollCall",
      dateYmd,
      getImage,
      subtitle: "House open",
    });
  }

  if (nowMin < GOOD_MORNING_START_MIN) {
    const phaseEarly = resolveClosingPhase({
      dateYmd,
      nowMin,
      config,
      weekday,
    });
    if (phaseEarly === "final_break") {
      return buildState({
        kind: "final_break",
        dateYmd,
        getImage,
        titleOverride: closingPhaseBannerTitle("final_break"),
      });
    }
    if (phaseEarly === "house_closed") {
      return buildState({
        kind: "house_closed_after",
        dateYmd,
        getImage,
        titleOverride: "House closed",
      });
    }
  }

  const phase = resolveClosingPhase({
    dateYmd,
    nowMin,
    config,
    weekday,
  });
  const kind = kindFromClosingPhase({
    phase,
    dateYmd,
    nowMin,
    config,
    weekday,
  });
  if (kind == null) return null;

  if (kind === "closing_t5") {
    const assetKey = pickT5AssetKey(nowMin);
    return buildState({
      kind,
      dateYmd,
      getImage,
      assetKey,
      titleOverride: closingPhaseBannerTitle("closing_t5"),
      idSuffix: assetKey,
    });
  }

  const titleFromPhase =
    phase !== "none" ? closingPhaseBannerTitle(phase) : undefined;
  return buildState({
    kind,
    dateYmd,
    getImage,
    titleOverride:
      kind === "house_closed_after"
        ? "House closed"
        : titleFromPhase || undefined,
  });
}

export function isSystemSpotlightActive(
  state: SystemSpotlightState | null | undefined,
): boolean {
  return state != null;
}
