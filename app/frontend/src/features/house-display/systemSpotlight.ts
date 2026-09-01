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

/**
 * Manage UI order for System Spotlight Graphics (staff labels).
 * Timing still uses kinds in systemSpotlightCore - this list is display/catalog only.
 * Do not reorder without product OK; T-5 A/B are two slots, one stage.
 */
export interface SystemSpotlightManageSlot {
  assetKey: SystemSpotlightAssetKey;
  /** Staff-facing label on Management */
  label: string;
}

export const SYSTEM_SPOTLIGHT_MANAGE_SLOTS: readonly SystemSpotlightManageSlot[] =
  [
    { assetKey: "good-morning", label: "Good Morning" },
    { assetKey: "roll-call", label: "Roll Call" },
    { assetKey: "closing-begins", label: "T-15" },
    { assetKey: "everyone-inside", label: "T-10" },
    { assetKey: "in-your-rooms", label: "T-5 A" },
    { assetKey: "in-your-rooms-v2", label: "T-5 B" },
    { assetKey: "house-closed", label: "House Closed" },
    { assetKey: "final-break", label: "Final Break" },
    { assetKey: "final-break-over", label: "Final Break Over" },
  ] as const;

/**
 * Hub role required to see/change System Spotlight Graphics on Manage.
 * FE hide only - backend must enforce later. Matches route role token "ADMIN".
 */
export const SYSTEM_SPOTLIGHT_GRAPHICS_MANAGE_ROLES: readonly string[] = [
  "ADMIN",
];

/** True when the signed-in user may manage system Spotlight art. */
export function canManageSystemSpotlightGraphics(
  userRoles: readonly string[] | null | undefined,
): boolean {
  if (userRoles == null || userRoles.length === 0) return false;
  return SYSTEM_SPOTLIGHT_GRAPHICS_MANAGE_ROLES.some((required) =>
    userRoles.includes(required),
  );
}

/**
 * Optional per-slot image URL overrides from Management (Admin).
 * Missing key -> keep bundled SYSTEM_SPOTLIGHT_IMAGES default.
 * Values are URL strings only (https / path / blob: session) — never base64 long-term.
 * DEV localStorage may keep stable URLs; blob: and data: are stripped on persist.
 */
export type SystemSpotlightImageOverrides = Partial<
  Record<SystemSpotlightAssetKey, string>
>;

/**
 * Resolve one slot image: non-empty override wins, else bundled default.
 * Used by Manage thumbs and TV resolve (imageOverrides).
 */
export function getSystemSpotlightImageWithOverrides(
  key: SystemSpotlightAssetKey,
  overrides?: SystemSpotlightImageOverrides | null,
): string | null {
  const raw = overrides?.[key];

  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.trim();
  }

  return getSystemSpotlightImage(key);
}

export function getSystemSpotlightImage(
  key: SystemSpotlightAssetKey,
): string | null {
  const url = SYSTEM_SPOTLIGHT_IMAGES[key];
  return typeof url === "string" && url.trim().length > 0 ? url : null;
}

/** TV entry: resolve active system Spotlight (bundled map + optional overrides). */
export function resolveSystemSpotlightState(args: {
  dateYmd: string;
  nowMin: number;
  config?: HouseDisplayCurfewConfig;
  weekday?: HouseDisplayWeekday | number;
  /** Admin Manage overrides; omit/empty -> bundled defaults only. */
  imageOverrides?: SystemSpotlightImageOverrides | null;
}): SystemSpotlightState | null {
  return resolveSystemSpotlightStateWithImages({
    ...args,
    getImage: (key) =>
      getSystemSpotlightImageWithOverrides(key, args.imageOverrides),
  });
}
