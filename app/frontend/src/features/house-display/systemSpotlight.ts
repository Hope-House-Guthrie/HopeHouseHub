/**
 * House Display — system Spotlight assets + public resolve API.
 *
 * Central image registry lives here (only file that imports system PNGs).
 * Pure timing/priority: systemSpotlightCore.ts
 * TV uses resolveSystemSpotlightState — does not import asset paths.
 */

import goodMorningUrl from "@assets/house-display/system/good-morning.png";
import rollCallUrl from "@assets/house-display/system/roll-call.png";
import t15Url from "@assets/house-display/system/t-15.png";
import t10Url from "@assets/house-display/system/t-10.png";
import t5Url from "@assets/house-display/system/t-5.png";
import t5v2Url from "@assets/house-display/system/t-5v2.png";
import houseClosedUrl from "@assets/house-display/system/house-closed.png";
import finalBreakUrl from "@assets/house-display/system/final-break.png";
import finalBreakOverUrl from "@assets/house-display/system/final-break-over.png";

import type { HouseDisplayWeekday } from "./scheduleTypes";
import type { HouseDisplayCurfewConfig } from "./curfew";
import {
  resolveSystemSpotlightStateWithImages,
  type SystemSpotlightAssetKey,
  type SystemSpotlightState,
} from "./systemSpotlightCore";

export type {
  SystemSpotlightKind,
  SystemSpotlightAssetKey,
  SystemSpotlightState,
} from "./systemSpotlightCore";

export {
  GOOD_MORNING_START_MIN,
  ROLL_CALL_SPOTLIGHT_LEAD_MIN,
  T5_ART_ROTATE_MIN,
  pickT5AssetKey,
  defaultAssetKeyForKind,
  isSystemSpotlightActive,
  resolveSystemSpotlightStateWithImages,
} from "./systemSpotlightCore";

/**
 * Central system image map — only place that imports system PNGs.
 * Future Management replace can override values without touching TV JSX.
 */
export const SYSTEM_SPOTLIGHT_IMAGES: Record<SystemSpotlightAssetKey, string> =
  {
    "good-morning": goodMorningUrl,
    "roll-call": rollCallUrl,
    "closing-begins": t15Url,
    "everyone-inside": t10Url,
    "in-your-rooms": t5Url,
    "in-your-rooms-v2": t5v2Url,
    "house-closed": houseClosedUrl,
    "final-break": finalBreakUrl,
    "final-break-over": finalBreakOverUrl,
  };

export function getSystemSpotlightImage(
  key: SystemSpotlightAssetKey,
): string | null {
  const url = SYSTEM_SPOTLIGHT_IMAGES[key];
  return typeof url === "string" && url.trim().length > 0 ? url : null;
}

/** TV entry: resolve active system Spotlight using bundled art map. */
export function resolveSystemSpotlightState(args: {
  dateYmd: string;
  nowMin: number;
  config?: HouseDisplayCurfewConfig;
  weekday?: HouseDisplayWeekday | number;
}): SystemSpotlightState | null {
  return resolveSystemSpotlightStateWithImages({
    ...args,
    getImage: getSystemSpotlightImage,
  });
}
