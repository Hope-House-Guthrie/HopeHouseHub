/**
 * House Display — Daily Affirmation selection (pure, no React/Redux).
 * Pin wins; otherwise rotate enabled items by interval buckets.
 * TV presentation only — do not put timers in the slice.
 */
import type { HouseDisplayAffirmation } from "./types";

/** Default rotate interval if missing/invalid (1 hour). */
export const DEFAULT_AFFIRMATION_ROTATE_MS = 60 * 60 * 1000;

/**
 * Enabled pool only, stable order = array order from Redux.
 */
export function getEnabledAffirmations(
  items: readonly HouseDisplayAffirmation[],
): HouseDisplayAffirmation[] {
  return items.filter((a) => a.enabled && a.text.trim().length > 0);
}

/**
 * Pick which affirmation the TV should show right now.
 *
 * Priority:
 * 1) pinned id if it exists, is enabled, and has text
 * 2) else rotate among enabled by floor(nowMs / rotateMs) % length
 * 3) else null (empty library / all disabled)
 *
 * nowMs and rotateMs are passed in so the helper stays pure/testable.
 */
export function selectAffirmationText(args: {
  affirmations: readonly HouseDisplayAffirmation[];
  pinnedAffirmationId: string | null;
  affirmationRotateMs: number;
  nowMs: number;
}): string | null {
  const { affirmations, pinnedAffirmationId, affirmationRotateMs, nowMs } =
    args;
  const enabled = getEnabledAffirmations(affirmations);

  if (pinnedAffirmationId != null && pinnedAffirmationId !== "") {
    const pinned = enabled.find((a) => a.id === pinnedAffirmationId);
    if (pinned) return pinned.text;
  }

  if (enabled.length === 0) return null;

  const ms =
    Number.isFinite(affirmationRotateMs) && affirmationRotateMs > 0
      ? affirmationRotateMs
      : DEFAULT_AFFIRMATION_ROTATE_MS;

  const bucket = Math.floor(nowMs / ms);
  const index = bucket % enabled.length;
  return enabled[index]!.text;
}
