/**
 * STATUS — DEV/prototype schedule SOURCE localStorage only
 * Branch: feature/house-display
 * Key: hhg-dev-house-display-schedule-v1
 *
 * Persists recurring + oneTime + exceptions + announcement lines (optional)
 * + affirmation library/pin/rotateMs (optional, additive)
 * + system Spotlight image overrides (optional, additive)
 * + program logo image overrides (optional, additive).
 * Never agendaItems / full content tree. Fail-safe load → null (caller uses seed).
 *
 * Image overrides (system + program): sanitize drops blank, data:, and blob:
 * values so only stable URLs (https / same-origin paths) may persist in DEV
 * localStorage. Backend replaces this later.
 */
import type { HouseDisplayScheduleSources } from "./scheduleTypes";
import type {
  HouseDisplayAffirmation,
  HouseDisplayAnnouncement,
} from "./types";
import type {
  SystemSpotlightAssetKey,
  SystemSpotlightImageOverrides,
} from "./systemSpotlight";
import { SYSTEM_SPOTLIGHT_MANAGE_SLOTS } from "./systemSpotlight";
import type {
  HouseDisplayProgramLogoKey,
  ProgramLogoImageOverrides,
} from "./programLogos";
import { PROGRAM_LOGO_MANAGE_SLOTS } from "./programLogos";

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
 * bundle + optional system Spotlight image overrides + optional program logo
 * image overrides (not resolved agenda / full content tree). Optional fields
 * are additive so older payloads stay valid - no storage key bump.
 * Swallows errors so a full disk / private mode cannot crash the UI.
 *
 * IMPORTANT: this replaces the whole LS JSON. Callers that persist schedule
 * must pass current announcements, affirmation bundle, system Spotlight
 * overrides, AND program logo overrides when those features are in use
 * (slice persistScheduleSources does that), or those keys drop.
 */
export function saveScheduleSources(
  sources: HouseDisplayScheduleSources,
  announcements?: HouseDisplayAnnouncement[],
  affirmationPersist?: HouseDisplayAffirmationPersist,
  systemSpotlightImageOverrides?: SystemSpotlightImageOverrides | null,
  programLogoImageOverrides?: ProgramLogoImageOverrides | null,
): void {
  try {
    if (typeof localStorage === "undefined") return;

    const payload: HouseDisplayScheduleSources & {
      announcements?: HouseDisplayAnnouncement[];
      affirmations?: HouseDisplayAffirmation[];
      pinnedAffirmationId?: string | null;
      affirmationRotateMs?: number;
      systemSpotlightImageOverrides?: SystemSpotlightImageOverrides;
      programLogoImageOverrides?: ProgramLogoImageOverrides;
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
    if (systemSpotlightImageOverrides) {
      payload.systemSpotlightImageOverrides =
        sanitizeSystemSpotlightImageOverrides(systemSpotlightImageOverrides);
    }
    if (programLogoImageOverrides) {
      payload.programLogoImageOverrides = sanitizeProgramLogoImageOverrides(
        programLogoImageOverrides,
      );
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

const SYSTEM_SPOTLIGHT_KEY_SET = new Set<string>(
  SYSTEM_SPOTLIGHT_MANAGE_SLOTS.map((slot) => slot.assetKey),
);

/**
 * Drop blank, data:, and blob: values. Only stable URLs go into DEV storage.
 * File-picker object URLs stay in Redux for the session and are never written.
 */
export function sanitizeSystemSpotlightImageOverrides(
  raw: unknown,
): SystemSpotlightImageOverrides {
  if (raw == null || typeof raw !== "object") return {};

  const out: SystemSpotlightImageOverrides = {};

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!SYSTEM_SPOTLIGHT_KEY_SET.has(key)) continue;
    if (typeof value !== "string") continue;

    const url = value.trim();

    if (!url) continue;
    if (url.startsWith("data:") || url.startsWith("blob:")) continue;

    out[key as SystemSpotlightAssetKey] = url;
  }

  return out;
}

/**
 * Read system Spotlight image overrides from the same DEV storage key.
 * Returns null when absent (caller uses {}). Always re-sanitizes so blob:/data:
 * never hydrate even if an older payload somehow stored them.
 */
export function loadSystemSpotlightImageOverrides(): SystemSpotlightImageOverrides | null {
  try {
    if (typeof localStorage === "undefined") return null;

    const raw = localStorage.getItem(HOUSE_DISPLAY_SCHEDULE_STORAGE_KEY);
    if (raw == null || raw === "") return null;

    const parsed: unknown = JSON.parse(raw);
    if (parsed == null || typeof parsed !== "object") return null;

    const field = (parsed as Record<string, unknown>)
      .systemSpotlightImageOverrides;

    if (field == null) return null;

    const cleaned = sanitizeSystemSpotlightImageOverrides(field);
    return cleaned;
  } catch {
    return null;
  }
}

const PROGRAM_LOGO_KEY_SET = new Set<string>(
  PROGRAM_LOGO_MANAGE_SLOTS.map((slot) => slot.logoKey),
);

/**
 * Drop blank, data:, and blob: values. Only stable URLs go into DEV storage.
 * File-picker object URLs stay in Redux for the session and are never written.
 */
export function sanitizeProgramLogoImageOverrides(
  raw: unknown,
): ProgramLogoImageOverrides {
  if (raw == null || typeof raw !== "object") return {};

  const out: ProgramLogoImageOverrides = {};

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!PROGRAM_LOGO_KEY_SET.has(key)) continue;
    if (typeof value !== "string") continue;

    const url = value.trim();

    if (!url) continue;
    if (url.startsWith("data:") || url.startsWith("blob:")) continue;

    out[key as HouseDisplayProgramLogoKey] = url;
  }

  return out;
}

/**
 * Read program logo image overrides from the same DEV storage key.
 * Returns null when absent (caller uses {}). Always re-sanitizes so blob:/data:
 * never hydrate even if an older payload somehow stored them.
 */
export function loadProgramLogoImageOverrides(): ProgramLogoImageOverrides | null {
  try {
    if (typeof localStorage === "undefined") return null;

    const raw = localStorage.getItem(HOUSE_DISPLAY_SCHEDULE_STORAGE_KEY);
    if (raw == null || raw === "") return null;

    const parsed: unknown = JSON.parse(raw);
    if (parsed == null || typeof parsed !== "object") return null;

    const field = (parsed as Record<string, unknown>).programLogoImageOverrides;

    if (field == null) return null;

    return sanitizeProgramLogoImageOverrides(field);
  } catch {
    return null;
  }
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
