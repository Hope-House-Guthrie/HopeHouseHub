/**
 * STATUS — DEV/prototype schedule SOURCE localStorage only
 * Branch: feature/house-display
 * Key: hhg-dev-house-display-schedule-v1
 *
 * Persists recurring + oneTime + exceptions + announcement lines (optional)
 * + affirmation library/pin/rotateMs (optional, additive).
 * Never agendaItems. Fail-safe load → null (caller uses seed). Backend
 * replaces this later.
 */
import type { HouseDisplayScheduleSources } from "./scheduleTypes";
import type {
  HouseDisplayAffirmation,
  HouseDisplayAnnouncement,
} from "./types";

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
 * Read announcement lines from the same DEV storage key.
 * Returns null when absent/invalid (caller falls back to seed) — the field is
 * additive/optional, so pre-announcement payloads load unchanged.
 */
export function loadAnnouncements(): HouseDisplayAnnouncement[] | null {
  try {
    if (typeof localStorage === "undefined") return null;

    const raw = localStorage.getItem(HOUSE_DISPLAY_SCHEDULE_STORAGE_KEY);
    if (raw == null || raw === "") return null;

    const parsed: unknown = JSON.parse(raw);
    if (parsed == null || typeof parsed !== "object") return null;

    const storedAnnouncements = (parsed as Record<string, unknown>)
      .announcements;
    if (!isAnnouncementList(storedAnnouncements)) return null;

    return storedAnnouncements;
  } catch {
    // Malformed JSON, SecurityError, etc. - never break House Display boot.
    return null;
  }
}

/**
 * Write schedule sources + optional announcement lines + optional affirmation
 * bundle (not resolved agenda / full content tree). Optional fields are
 * additive so older payloads stay valid — no storage key bump.
 * Swallows errors so a full disk / private mode cannot crash the UI.
 *
 * IMPORTANT: this replaces the whole LS JSON. Callers that persist schedule
 * must pass current announcements AND affirmation bundle when those features
 * are in use (slice persistScheduleSources does that), or those keys drop.
 */
export function saveScheduleSources(
  sources: HouseDisplayScheduleSources,
  announcements?: HouseDisplayAnnouncement[],
  affirmationPersist?: HouseDisplayAffirmationPersist,
): void {
  try {
    if (typeof localStorage === "undefined") return;

    const payload: HouseDisplayScheduleSources & {
      announcements?: HouseDisplayAnnouncement[];
      affirmations?: HouseDisplayAffirmation[];
      pinnedAffirmationId?: string | null;
      affirmationRotateMs?: number;
    } = {
      recurring: sources.recurring,
      oneTime: sources.oneTime,
      exceptions: sources.exceptions,
    };
    if (announcements) {
      payload.announcements = announcements;
    }
    if (affirmationPersist) {
      payload.affirmations = affirmationPersist.affirmations;
      payload.pinnedAffirmationId = affirmationPersist.pinnedAffirmationId;
      payload.affirmationRotateMs = affirmationPersist.affirmationRotateMs;
    }
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

/** Light runtime shape check for stored announcement lines ({id, text}). */
function isAnnouncementList(
  value: unknown,
): value is HouseDisplayAnnouncement[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      item != null &&
      typeof item === "object" &&
      typeof (item as Record<string, unknown>).id === "string" &&
      typeof (item as Record<string, unknown>).text === "string",
  );
}

/** DEV persist bundle for Daily Affirmations (same LS key; optional/additive). */
export type HouseDisplayAffirmationPersist = {
  affirmations: HouseDisplayAffirmation[];
  pinnedAffirmationId: string | null;
  affirmationRotateMs: number;
};

/** Light runtime shape check for stored affirmation rows ({id, text, enabled}). */
function isAffirmationList(value: unknown): value is HouseDisplayAffirmation[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      item != null &&
      typeof item === "object" &&
      typeof (item as Record<string, unknown>).id === "string" &&
      typeof (item as Record<string, unknown>).text === "string" &&
      typeof (item as Record<string, unknown>).enabled === "boolean",
  );
}

/**
 * Read affirmation library + pin + rotateMs from the same DEV storage key.
 * Returns null when absent/invalid (caller falls back to seed) — additive so
 * pre-affirmation payloads load unchanged. No key bump.
 */
export function loadAffirmationPersist(): HouseDisplayAffirmationPersist | null {
  try {
    if (typeof localStorage === "undefined") return null;

    const raw = localStorage.getItem(HOUSE_DISPLAY_SCHEDULE_STORAGE_KEY);
    if (raw == null || raw === "") return null;

    const parsed: unknown = JSON.parse(raw);
    if (parsed == null || typeof parsed !== "object") return null;

    const obj = parsed as Record<string, unknown>;
    if (!isAffirmationList(obj.affirmations)) return null;

    // pin: missing → null; null → null; string → string; other → invalid bundle
    const pinnedRaw = obj.pinnedAffirmationId;
    let pinnedAffirmationId: string | null;
    if (pinnedRaw === undefined || pinnedRaw === null) {
      pinnedAffirmationId = null;
    } else if (typeof pinnedRaw === "string") {
      pinnedAffirmationId = pinnedRaw;
    } else {
      return null;
    }

    const rotateRaw = obj.affirmationRotateMs;
    if (
      typeof rotateRaw !== "number" ||
      !Number.isFinite(rotateRaw) ||
      rotateRaw <= 0
    ) {
      return null;
    }

    return {
      affirmations: obj.affirmations,
      pinnedAffirmationId,
      affirmationRotateMs: rotateRaw,
    };
  } catch {
    return null;
  }
}
