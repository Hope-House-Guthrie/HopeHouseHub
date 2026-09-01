/**
 * House Display - Spotlight selection (pure, no React).
 * Right ~40% region: one item at a time.
 * pin wins; else ordered active list + presentation rotateIndex.
 * Timer/fade live on the TV page only — not here.
 */

import type { HouseDisplaySpotlightItem } from "./types";

/** pinned ⇔ pinMode !== "none" */
export function isSpotlightPinned(item: HouseDisplaySpotlightItem): boolean {
  return item.pinMode !== "none";
}

/**
 * Active items only, sorted by sortOrder then id.
 * Used for normal rotation order and pin tie-break.
 */
export function getActiveSpotlightItems(
  items: HouseDisplaySpotlightItem[],
): HouseDisplaySpotlightItem[] {
  return items
    .filter((i) => i.active)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
}

/**
 * Pick the single Spotlight item the TV should show.
 *
 * Priority 1: first active pinned (by sortOrder / id).
 * Priority 2: active non-pinned at rotateIndex % length.
 * Priority 3: null (empty region; no fallback content yet).
 *
 * rotateIndex is TV/local presentation only — ignored when anything is pinned.
 * Multiple pinned (bad admin state): first by sort wins; still only one shown.
 */
export function selectSpotlightItem(
  items: HouseDisplaySpotlightItem[],
  rotateIndex: number = 0,
): HouseDisplaySpotlightItem | null {
  const active = getActiveSpotlightItems(items);
  if (active.length === 0) return null;

  const pinned = active.filter(isSpotlightPinned);
  if (pinned.length > 0) return pinned[0] ?? null;

  const n = active.length;
  const i = ((rotateIndex % n) + n) % n;
  return active[i] ?? null;
}

/** 15s between Spotlight slides when rotating (TV presentation only). */
export const SPOTLIGHT_ROTATE_MS = 15_000;

/**
 * True if any active item is pinned (pinMode !== "none").
 * When true, TV must stop the interval and must not advance rotateIndex.
 */
export function hasActiveSpotlightPin(
  items: HouseDisplaySpotlightItem[],
): boolean {
  return getActiveSpotlightItems(items).some(isSpotlightPinned);
}

/**
 * Active items that participate in normal rotation (not pinned).
 * When nothing is pinned, this is the full active list (same order as sortOrder).
 * When something is pinned, rotation pool is unused for display (pin owns region)
 * but this helper stays available for length checks if needed.
 */
export function getSpotlightRotationPool(
  items: HouseDisplaySpotlightItem[],
): HouseDisplaySpotlightItem[] {
  return getActiveSpotlightItems(items).filter((i) => !isSpotlightPinned(i));
}

/**
 * Keep rotateIndex valid when the active list shrinks/grows.
 * empty -> 0; otherwise index modlo length (always in range).
 */
export function clampSpotlightRotateIndex(
  rotateIndex: number,
  itemCount: number,
): number {
  if (itemCount <= 0) return 0;
  const n = itemCount;
  return ((rotateIndex % n) + n) % n;
}

/**
 * Should the TV run a rotation interval?
 * Need at least 2 rotatable items and no active pin.
 */
export function shouldRunSpotlightRotation(
  items: HouseDisplaySpotlightItem[],
): boolean {
  if (hasActiveSpotlightPin(items)) return false;
  return getActiveSpotlightItems(items).length > 1;
}
