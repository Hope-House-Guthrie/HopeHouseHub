/**
 * STATUS — DEV/prototype schedule SOURCE localStorage only
 * Branch: feature/house-display
 * Key: hhg-dev-house-display-schedule-v1
 *
 * Persists recurring + oneTime + exceptions. Never agendaItems.
 * Fail-safe load → null (caller uses seed). Backend replaces this later.
 */
import type { HouseDisplayScheduleSources } from "./scheduleTypes";

/** Versioned key - bump suffix if the JSON shape changes incompatibly. */
export const HOUSE_DISPLAY_SCHEDULE_STORAGE_KEY =
  "hhg-dev-house-display-schedule-v1";

/**
 * Read schedule sources from localStorage.
 * Returns null on missing data, non-browser env, or any parse/shape failure.
 * Caller must fall back to INITIAL_SCHEDULE_SOURCES when null.
 */
export function loadScheduleSources(): HouseDisplayScheduleSources | null {
  try {
    if (typeof localStorage === "undefined") return null;

    const raw = localStorage.getItem(HOUSE_DISPLAY_SCHEDULE_STORAGE_KEY);
    if (raw == null || raw === "") return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isScheduleSources(parsed)) return null;

    return parsed;
  } catch {
    // Malformed JSON, SecurityError, etc. - never break House Display boot.
    return null;
  }
}

/**
 * Write schedule sources only (not resolved agenda / full content tree).
 * Swallows errors so a full disk / private mode cannot crash the UI.
 */
export function saveScheduleSources(
  sources: HouseDisplayScheduleSources,
): void {
  try {
    if (typeof localStorage === "undefined") return;

    const payload: HouseDisplayScheduleSources = {
      recurring: sources.recurring,
      oneTime: sources.oneTime,
      exceptions: sources.exceptions,
    };
    localStorage.setItem(
      HOUSE_DISPLAY_SCHEDULE_STORAGE_KEY,
      JSON.stringify(payload),
    );
  } catch {
    // QuotaExceededError, SecurityError, etc. - ignore for prototype.
  }
}

/** Optional DEV helper later ( reset to seed). Not required for S1 UI. */
export function clearScheduleSources(): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(HOUSE_DISPLAY_SCHEDULE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Light runtime shape check - not a full schema validator. */
function isScheduleSources(
  value: unknown,
): value is HouseDisplayScheduleSources {
  if (value == null || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.recurring) &&
    Array.isArray(v.oneTime) &&
    Array.isArray(v.exceptions)
  );
}
