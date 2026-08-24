/**
 * House Display - Spotlight selection (pure, no React).
 * Right ~40% region: one item at a time.
 * pin wins; else ordered active lists + presentation rotateIndex.
 * No timers / day-rollover here.
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
