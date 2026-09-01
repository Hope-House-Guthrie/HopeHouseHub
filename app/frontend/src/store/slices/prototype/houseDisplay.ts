/**
 * STATUS — House Display Redux slice (client-only FE mock)
 * Branch: feature/house-display
 *
 * DONE (S1):
 * - state.schedule = recurring + oneTime + exceptions (source of truth)
 * - content.agendaItems = resolveAgendaForDate(Chicago day, schedule)
 * - Hydrate schedule from DEV localStorage (fail-safe → INITIAL_SCHEDULE_SOURCES)
 * - cancelOccurrence / restoreOccurrence (explicit dateYmd; deterministic cancel ids)
 * - Persist sources only after mutators (not agendaItems)
 * - TV + manage read content; TV never reads schedule
 *
 * DONE (S2.2–S2.5):
 * - addRecurringClass (UI id; force active true)
 * - editRecurringClass (keep id + active; no exception changes)
 * - endRecurringClass (active false only; keep row; no exception changes)
 * - reinstateRecurringClass (active true; exact inverse of End; idempotent)
 * - Cancel/Restore = day exception only (series stays active)
 * - End Class ≠ Cancel ≠ Delete
 *
 * DONE (S2.5 partial):
 * - addOneTimeEvent / editOneTimeEvent (force active true + canceled false on add;
 *   edit keeps id/active/canceled)
 *
 * DONE (conflicts Stage B):
 * - exception kind "suppress" (Replace/Hide this date ≠ cancel)
 * - suppressRecurringOccurrence / unsuppressRecurringOccurrence
 *
 * DONE (Spotlight Content Phases 1–4 + Delete manage mutators):
 * - setSpotlightItemActive / moveSpotlightItem (no spotlight persist)
 * - addSpotlightFlyer (UI id + imageUrl; append sortOrder end; no persist;
 *   no base64/localStorage media — session Redux + bundled/@assets or object URL)
 * - removeSpotlightItem (drop by id any kind incl. seeds; renumber sortOrder 0..n-1;
 *   no persist; blob revoke stays in Manage handler for blob: imageUrl only)
 *
 * DONE (Daily Affirmations — FE prototype complete):
 * - content.affirmations[] + pinnedAffirmationId + affirmationRotateMs
 * - Reducers: add / edit / remove / pin / unpin / setAffirmationRotateMs
 * - edit enabled:false on pinned id clears pin; enable does not re-pin
 * - DEV hydrate/persist via schedulePersistence (same LS key; additive)
 * - persistScheduleSources always writes announcements + affirmation bundle
 * - affirmationText kept as TV empty-pool fallback string
 * - No live cross-tab sync; backend should own truth later
 *
 * DONE (Program / Class Graphics Manage — FE):
 * - content.programLogoImageOverrides + setProgramLogoImageOverride
 * - DEV hydrate/persist via schedulePersistence (stable URLs only; blob/data stripped)
 * - Schedule logoKey association unchanged
 *
 * DONE (Curfew Manage Ph1–7 COMPLETE — 2026-08-30; manage browser QA passed):
 * - Ph1: content.curfew clone of SEED_CURFEW_CONFIG
 * - Ph2: DEV LS sanitize/load/save curfew on same schedule key (whole-key)
 * - Ph3: syncAgenda + buildContent resolve via content.curfew
 * - Ph4: setCurfewWeeklyClose / setCurfewDateOverride / clearCurfewDateOverride
 * - Ph5–6: Manage Admin Curfew card (weekly + override + clear); canManageCurfew
 * - Ph7: TV timeline / closingPhase / systemSpotlight use content.curfew
 * - closeMin 1..1440 (1440 = end-of-day); true date overrides earlier/later OK
 * - Stages still derived from effective C; no four staff closing events
 * - Refresh Full Display after Manage (no live cross-tab)
 *
 * NOT YET:
 * - override exception UI, delete definition, ended-list conflict UI
 * - Spotlight Add Video / Edit / sound / pin / persist (Delete done — session-only)
 * - Affirmation storage/visibility rehydrate for open TV tabs
 * - Backend API / thunks
 * - Midnight re-resolve without refresh
 *
 * Who uses this:
 *   - manage.tsx  → Today cancel/restore; Add/Edit/End/Reinstate Recurring; One-Time; Spotlight; Affirmations; Curfew
 *   - index.tsx   → TV selects content only (affirmations via selectAffirmationText)
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  SystemSpotlightAssetKey,
  SystemSpotlightImageOverrides,
} from "../../../features/house-display/systemSpotlight";
import { SYSTEM_SPOTLIGHT_MANAGE_SLOTS } from "../../../features/house-display/systemSpotlight";
import type { ProgramLogoImageOverrides } from "../../../features/house-display/programLogos";
import {
  isHouseDisplayProgramLogoKey,
  PROGRAM_LOGO_MANAGE_SLOTS,
} from "../../../features/house-display/programLogos";
import type {
  HouseDisplayAffirmation,
  HouseDisplayAnnouncement,
  HouseDisplayContent,
  HouseDisplayState,
} from "../../../features/house-display/types";
import {
  SEED_CURFEW_CONFIG,
  cloneCurfewConfig,
  isValidCurfewCloseMin,
  timelineWindowForDate,
} from "../../../features/house-display/curfew";
import type { HouseDisplayCurfewConfig } from "../../../features/house-display/curfew";
import { getHopeHouseNow } from "../../../features/house-display/time";
// Relative paths: Bun hot sometimes fails @/ resolve on newly added feature files
import {
  resolveAgendaForDate,
  weekdayFromDateYmd,
} from "../../../features/house-display/resolveAgenda";
import { INITIAL_SCHEDULE_SOURCES } from "../../../features/house-display/scheduleSeed";
import type {
  HouseDisplayOneTimeEvent,
  HouseDisplayRecurringEvent,
  HouseDisplayScheduleSources,
  HouseDisplayWeekday,
} from "../../../features/house-display/scheduleTypes";
import {
  loadAffirmationPersist,
  loadAnnouncements,
  loadScheduleSources,
  loadSystemSpotlightImageOverrides,
  loadProgramLogoImageOverrides,
  loadCurfewConfig,
  saveScheduleSources,
  type HouseDisplayAffirmationPersist,
} from "../../../features/house-display/schedulePersistence";
// Bundled flyer/video URLs (Bun @assets). public/house-display/* is NOT served by dev-server.
// test-video.mp4 is local-only (gitignored) — DEV prototype asset, not production media.
import kiddosDonationUrl from "@assets/house-display/kiddos-donation.png";
import hopeChangesEverythingUrl from "@assets/house-display/hope-changes-everything.png";
import testVideoUrl from "@assets/house-display/test-video.mp4";

/** Occurrence payload from manage — dateYmd must be explicit (no clock in reducer). */
export type HouseDisplayOccurrenceActionPayload = {
  occurrenceId: string;
  /** America/Chicago calendar day YYYY-MM-DD */
  dateYmd: string;
};

/** Add series - full event (id set in UI); dateYmd for agenda re-resolve only. */
export type AddRecurringClassPayload = {
  event: HouseDisplayRecurringEvent;
  /** America/Chicago calendar day YYYY-MM-DD */
  dateYmd: string;
};

/**
 * Edit series fields only.
 * id identifies the row; active is NOT in the payload (reducer keeps existing active).
 * dateYmd = Chicago day for agenda re-resolve only.
 */
export type EditRecurringClassPayload = {
  id: string;
  title: string;
  startMin: number;
  endMin: number;
  daysOfWeek: HouseDisplayWeekday[];
  /** America/Chicago calendar day YYYY-MM-DD */
  dateYmd: string;
  /** Optional location (Living Room, Back House, etc.) */
  location?: string;
  /** Optional facilitator name (clear by passing empty string) */
  facilitator?: string;
  /**
   * Class Image / program logo for Spotlight takeover.
   * undefined = keep existing; null = clear; string = replace (catalog key).
   */
  logoKey?: string | null;
};

/** Set one Weekday's default close (1..1440). dateYmd = re-resolve day only. */
export type SetCurfewWeeklyClosePayload = {
  /** 0 = Sun ... 6 = Sat */
  weekday: number;
  closeMin: number;
  /** America/Chicago calendar day YYYY-MM-DD */
  dateYmd: string;
};

/**
 * Upsert one date override (true override: earlier or later than weekly OK).
 * One row per dateYmd — same date replaces prior row.
 * resolveDateYmd = Chicago day for agenda re-resolve only (often today).
 */
export type SetCurfewDateOverridePayload = {
  /** UI id, e.g. curfew-ovr-${crypto.randomUUID()} */
  id: string;
  /** Override calendar day YYYY-MM-DD */
  dateYmd: string;
  closeMin: number;
  note?: string;
  /** America/Chicago day for syncAgendaFromSchedule */
  resolveDateYmd: string;
};

/** Remove the override for one dateYmd (weekly default applies again). */
export type ClearCurfewDateOverridePayload = {
  /** Override calendar day YYYY-MM-DD to clear */
  dateYmd: string;
  /** America/Chicago day for agenda re-resolve only */
  resolveDateYmd: string;
};

/**
 * End Class / Reinstate Class - series stays in schedule.
 * End: active false; Reinstate: active true (exact inverse).
 * Not Cancel (day exception). Not Delete.
 * dateYmd = Chicago day for agenda re-resolve only.
 */
export type EndRecurringClassPayload = {
  id: string;
  /** America/Chicago calendar day YYYY-MM-DD */
  dateYmd: string;
};

/** Add one-time - full event (id set in UI); dateYmd = today resolve only. */
export type AddOneTimeEventPayload = {
  event: HouseDisplayOneTimeEvent;
  /** America/Chicago calendar day for agenda re-resolve (usually today). */
  dateYmd: string;
};

/**
 * Edit one-time fields only.
 * Keeps id / active / canceled. eventDateYmd = the event's day.
 * resolveDateYmd = Chicago day for agenda re-resolve (usually today).
 */
export type EditOneTimeEventPayload = {
  id: string;
  title: string;
  /** Event's Hope House civil day YYYY-MM-DD */
  eventDateYmd: string;
  startMin: number;
  endMin: number;
  /** America/Chicago day for agenda re-resolve */
  resolveDateYmd: string;
  /** Optional location — edit keeps existing location if not provided */
  location?: string;
  /** Optional facilitator name (clear by passing empty string) */
  facilitator?: string;
};

/** Deep-ish copy so seed arrays are not shared/mutated by accident. */
function cloneScheduleSources(
  sources: HouseDisplayScheduleSources,
): HouseDisplayScheduleSources {
  return {
    recurring: sources.recurring.map((r) => ({
      ...r,
      daysOfWeek: [...r.daysOfWeek],
    })),
    oneTime: sources.oneTime.map((o) => ({ ...o })),
    exceptions: sources.exceptions.map((e) => ({ ...e })),
  };
}

/** Deterministic cancel exception id. */
function cancelExceptionId(seriesId: string, dateYmd: string): string {
  return `cancel:${seriesId}:${dateYmd}`;
}

/** Deterministic suppress (Replace/Hide) exception id.
 * When sourceOneTimeEventId is provided, the ID is scoped to that one-time
 * event so multiple one-time events can independently suppress the same
 * recurring occurrence on the same date.
 */
function suppressExceptionId(
  seriesId: string,
  dateYmd: string,
  sourceOneTimeEventId?: string,
): string {
  if (sourceOneTimeEventId) {
    return `suppress:${sourceOneTimeEventId}:${seriesId}:${dateYmd}`;
  }
  return `suppress:${seriesId}:${dateYmd}`;
}

/**
 * Suppress one recurring series on one Chicago day (Replace/Hide).
 * Omits occurrence from agenda — not CANCELED chrome. Series stays active.
 */
export type SuppressRecurringOccurrencePayload = {
  seriesId: string;
  /** America/Chicago calendar day YYYY-MM-DD */
  dateYmd: string;
  /** One-time event that caused this suppression, if any.
   * When present, creates a per-source-event suppression exception so
   * multiple one-time events can independently suppress the same occurrence.
   * Staff-initiated suppress passes undefined (legacy singular behavior).
   */
  sourceOneTimeEventId?: string;
};

/**
 * Recurring TV ids are "seriesId:YYYY-MM-DD".
 * One-time ids have no colon (seed ids are kebab-case only).
 */
function parseRecurringOccurrenceId(
  occurrenceId: string,
): { seriesId: string; dateYmd: string } | null {
  const idx = occurrenceId.lastIndexOf(":");
  if (idx <= 0) return null;
  const seriesId = occurrenceId.slice(0, idx);
  const dateYmd = occurrenceId.slice(idx + 1);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateYmd)) return null;
  if (!seriesId) return null;
  return { seriesId, dateYmd };
}

/** Re-resolve TV agenda only — never rebuild spotlight from scratch here. */
function syncAgendaFromSchedule(
  state: HouseDisplayState,
  dateYmd: string,
): void {
  const weekday = weekdayFromDateYmd(dateYmd);
  // Board hours + closing stages: use content.curfew (Ph2 hydrate/persist bag).
  // TV index still seeds until a later phase — Manage mutators not this step.
  const curfewConfig = state.content.curfew;
  state.content.timeline = timelineWindowForDate({
    dateYmd,
    weekday,
    config: curfewConfig,
  });
  state.content.agendaItems = resolveAgendaForDate({
    dateYmd,
    weekday,
    sources: {
      recurring: state.schedule.recurring,
      oneTime: state.schedule.oneTime,
      exceptions: state.schedule.exceptions,
    },
    curfewConfig,
  });
}

/**
 * DEV/prototype: persist sources + announcements + affirmation bundle +
 * system Spotlight overrides + program logo overrides + curfew.
 * Backend will replace this later — not a general app persistence layer.
 * Always pass announcements + affirmations + both override maps + curfew
 * together so whole-key rewrite does not drop optional fields.
 */
function persistScheduleSources(state: HouseDisplayState): void {
  const affirmationPersist: HouseDisplayAffirmationPersist = {
    affirmations: state.content.affirmations,
    pinnedAffirmationId: state.content.pinnedAffirmationId,
    affirmationRotateMs: state.content.affirmationRotateMs,
  };
  saveScheduleSources(
    {
      recurring: state.schedule.recurring,
      oneTime: state.schedule.oneTime,
      exceptions: state.schedule.exceptions,
    },
    state.content.announcements,
    affirmationPersist,
    state.content.systemSpotlightImageOverrides,
    state.content.programLogoImageOverrides,
    state.content.curfew,
  );
}

/**
 * Real calendar YYYY-MM-DD (pure, TZ-independent). Same idea as
 * scheduleForm.parseDateInputToYmd — kept local so the slice does not
 * depend on form helpers.
 */
function isRealDateYmd(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return false;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const utc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return (
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day
  );
}

/** Unique 0-6 weekdays, sorted. Empty -> []. No Daily Duties empty=every-day rule. */
function normalizeRecurringWeekdays(
  days: readonly number[],
): HouseDisplayWeekday[] {
  return [
    ...new Set(
      days.filter(
        (d): d is HouseDisplayWeekday =>
          Number.isInteger(d) && d >= 0 && d <= 6,
      ),
    ),
  ].sort((a, b) => a - b);
}

/** Seed/mock announcements shown when DEV storage has none (ids n1, n2). */
const SEED_ANNOUNCEMENTS: HouseDisplayAnnouncement[] = [
  {
    id: "n1",
    text: "Kitchen closes at 8:00 PM. Please rinse dishes before then.",
  },
  {
    id: "n2",
    text: "House Meeting is mandatory - be in the living room by 3:25 PM.",
  },
];

/** Seed Daily Affirmation library when DEV storage has none (ids a1–a3). */
const SEED_AFFIRMATIONS: HouseDisplayAffirmation[] = [
  {
    id: "a1",
    text: "Progress, not perfection - show up for yourself and the house today.",
    enabled: true,
  },
  {
    id: "a2",
    text: "Love yourself enough to put yourself first.",
    enabled: true,
  },
  {
    id: "a3",
    text: "People do better when they know better.",
    enabled: true,
  },
];

/** Default staff rotate interval (1 hour) when storage has none/invalid. */
const SEED_AFFIRMATION_ROTATE_MS = 60 * 60 * 1000;

/**
 * Build TV content tree. agendaItems = resolve(Chicago dateKey, sources).
 * Spotlight still seed for now.
 * getHopeHouseNow OK here for first paint only — not inside Cancel/Restore.
 * announcements / affirmationPersist: stored when present, else seeds.
 */
function buildContent(
  schedule: HouseDisplayScheduleSources,
  dateYmd?: string,
  announcements: HouseDisplayAnnouncement[] = SEED_ANNOUNCEMENTS,
  affirmationPersist?: HouseDisplayAffirmationPersist | null,
  systemSpotlightImageOverrides: SystemSpotlightImageOverrides = {},
  programLogoImageOverrides: ProgramLogoImageOverrides = {},
  /**
   * Curfew bag for content.curfew. Always store an independent clone —
   * never SEED_CURFEW_CONFIG / SEED_WEEKLY_CURFEW by reference.
   * Ph1: callers omit → seed clone. Persist/wire state later.
   */
  curfew?: HouseDisplayCurfewConfig | null,
): HouseDisplayContent {
  const ymd = dateYmd ?? getHopeHouseNow().dateKey;
  const weekday = weekdayFromDateYmd(ymd);

  const affirmations = affirmationPersist?.affirmations ?? SEED_AFFIRMATIONS;
  let pinnedAffirmationId = affirmationPersist?.pinnedAffirmationId ?? null;
  // Drop stale pin ids that are not in the loaded library
  if (
    pinnedAffirmationId != null &&
    !affirmations.some((a) => a.id === pinnedAffirmationId)
  ) {
    pinnedAffirmationId = null;
  }
  const affirmationRotateMs =
    affirmationPersist != null &&
    typeof affirmationPersist.affirmationRotateMs === "number" &&
    Number.isFinite(affirmationPersist.affirmationRotateMs) &&
    affirmationPersist.affirmationRotateMs > 0
      ? affirmationPersist.affirmationRotateMs
      : SEED_AFFIRMATION_ROTATE_MS;

  // Independent clone suitable for Redux (never retain seed array refs).
  const curfewConfig = cloneCurfewConfig(curfew ?? SEED_CURFEW_CONFIG);

  return {
    header: {
      identityLabel: "Hope House Guthrie",
      clockText: "3:45 PM",
      dateText: "Sun, Aug 23",
      weatherText: "82° Clear",
    },
    timeline: timelineWindowForDate({
      dateYmd: ymd,
      weekday,
      // Same bag stored on content.curfew (clone above).
      config: curfewConfig,
    }),
    agendaItems: resolveAgendaForDate({
      dateYmd: ymd,
      weekday,
      sources: schedule,
      curfewConfig,
    }),
    spotlightItems: [
      {
        id: "s1",
        kind: "card",
        sortOrder: 0,
        active: true,
        pinMode: "none",
        title: "SUPER SATURDAY",
        subtitle: "Saturday, August 29",
        message: "Be ready by 9:00 AM.",
        imageUrl: "",
        imageAlt: "",
      },
      {
        id: "s2",
        kind: "flyer",
        sortOrder: 1,
        active: true,
        pinMode: "none",
        title: "KIDDOS",
        subtitle: "",
        message: "",
        imageUrl: kiddosDonationUrl,
        imageAlt: "KIDDOS donation flyer",
      },
      {
        id: "s3",
        kind: "flyer",
        sortOrder: 2,
        active: true,
        pinMode: "none",
        title: "Hope Changes Everything",
        subtitle: "",
        message: "",
        imageUrl: hopeChangesEverythingUrl,
        imageAlt: "Hope Changes Everything / Family Reunification flyer",
      },
      {
        id: "s4",
        kind: "video",
        sortOrder: 3,
        active: true,
        pinMode: "none",
        title: "Test Video",
        subtitle: "",
        message: "",
        imageUrl: "",
        imageAlt: "",
        videoUrl: testVideoUrl,
        videoMimeType: "video/mp4",
        videoSoundEnabled: true,
      },
    ],

    // Legacy single-string fallback for TV until library empty edge cases
    affirmationText:
      "Progress, not perfection - show up for yourself and the house today.",

    affirmations,
    pinnedAffirmationId,
    affirmationRotateMs,

    announcements,
    systemSpotlightImageOverrides,
    programLogoImageOverrides,
    curfew: curfewConfig,
    birthday: {
      name: "Alex M.",
      dateLabel: "Thu, Aug 27",
    },
  };
}

// Hydrate schedule SOURCES only. Invalid/missing localStorage → seed.
// agendaItems always come from resolve (never read from storage).
// Announcements + affirmations + image overrides + curfew hydrate from the same DEV key.
const persistedSchedule = loadScheduleSources();
const initialSchedule = cloneScheduleSources(
  persistedSchedule ?? INITIAL_SCHEDULE_SOURCES,
);
const persistedAnnouncements = loadAnnouncements();
const persistedAffirmations = loadAffirmationPersist();
const persistedSystemSpotlightImageOverrides =
  loadSystemSpotlightImageOverrides();
const persistedProgramLogoImageOverrides = loadProgramLogoImageOverrides();
const persistedCurfew = loadCurfewConfig();

const initialState: HouseDisplayState = {
  schedule: initialSchedule,
  content: buildContent(
    initialSchedule,
    undefined,
    persistedAnnouncements ?? SEED_ANNOUNCEMENTS,
    persistedAffirmations,
    persistedSystemSpotlightImageOverrides ?? {},
    persistedProgramLogoImageOverrides ?? {},
    persistedCurfew,
  ),
};

const SYSTEM_SPOTLIGHT_ASSET_KEY_SET = new Set<string>(
  SYSTEM_SPOTLIGHT_MANAGE_SLOTS.map((s) => s.assetKey),
);

function isSystemSpotlightAssetKey(
  value: string,
): value is SystemSpotlightAssetKey {
  return SYSTEM_SPOTLIGHT_ASSET_KEY_SET.has(value);
}

const PROGRAM_LOGO_KEY_SET = new Set<string>(
  PROGRAM_LOGO_MANAGE_SLOTS.map((s) => s.logoKey),
);

function isProgramLogoKey(value: string): boolean {
  return PROGRAM_LOGO_KEY_SET.has(value) && isHouseDisplayProgramLogoKey(value);
}

export const houseDisplaySlice = createSlice({
  name: "houseDisplay",
  initialState,
  reducers: {
    /** Replace full TV content tree (rare). Prefer schedule mutators. */
    setContent: (state, action: PayloadAction<HouseDisplayContent>) => {
      state.content = action.payload;
    },

    /**
     * Add one staff-created announcement line (TV lower band).
     * UI generates id via newAnnouncementId() BEFORE dispatch — no
     * clock/random here. Trimmed text required; duplicate id is a no-op.
     * Persists via the shared DEV storage path.
     */
    addAnnouncement: (
      state,
      action: PayloadAction<HouseDisplayAnnouncement>,
    ) => {
      const rawId = action.payload.id;
      const rawText = action.payload.text;
      const id = typeof rawId === "string" ? rawId.trim() : "";
      const text = typeof rawText === "string" ? rawText.trim() : "";
      if (!id || !text) return;

      const duplicate = state.content.announcements.some((a) => a.id === id);
      if (duplicate) return;

      state.content.announcements.push({ id, text });
      persistScheduleSources(state);
    },

    /**
     * Remove one announcement line by id. Idempotent — missing id is a
     * no-op. Persists via the shared DEV storage path.
     */
    removeAnnouncement: (state, action: PayloadAction<{ id: string }>) => {
      const rawId = action.payload.id;
      const id = typeof rawId === "string" ? rawId.trim() : "";
      if (!id) return;

      state.content.announcements = state.content.announcements.filter(
        (a) => a.id !== id,
      );
      persistScheduleSources(state);
    },

    /**
     * Add one Daily Affirmation to the library.
     * UI generates id BEFORE dispatch - no clock/random here.
     * Trimmed text required; duplicate id is a no-op.
     * Does not change pin or rotateMs. DEV persist via shared path.
     */
    addAffirmation: (state, action: PayloadAction<HouseDisplayAffirmation>) => {
      const rawId = action.payload.id;
      const rawText = action.payload.text;
      const id = typeof rawId === "string" ? rawId.trim() : "";
      const text = typeof rawText === "string" ? rawText.trim() : "";
      if (!id || !text) return;

      const duplicate = state.content.affirmations.some((a) => a.id === id);
      if (duplicate) return;

      const enabled =
        typeof action.payload.enabled === "boolean"
          ? action.payload.enabled
          : true;

      state.content.affirmations.push({ id, text, enabled });
      persistScheduleSources(state);
    },

    /**
     * Edit one Daily Affirmation by id (text and/or enabled).
     * Unknown id = no-op. Empty trimmed text = no-op (keeps old row).
     * Disabling the currently pinned id clears the pin (row stays in library).
     * Enabling does not re-pin. DEV persist via shared path.
     */
    editAffirmation: (
      state,
      action: PayloadAction<{
        id: string;
        text?: string;
        enabled?: boolean;
      }>,
    ) => {
      const rawId = action.payload.id;
      const id = typeof rawId === "string" ? rawId.trim() : "";
      if (!id) return;

      const item = state.content.affirmations.find((a) => a.id === id);
      if (!item) return;

      let changed = false;

      if (typeof action.payload.text === "string") {
        const text = action.payload.text.trim();
        if (!text) return;
        if (item.text !== text) {
          item.text = text;
          changed = true;
        }
      }

      if (typeof action.payload.enabled === "boolean") {
        if (item.enabled !== action.payload.enabled) {
          item.enabled = action.payload.enabled;
          changed = true;
          // Disabled pin must not keep owning TV — clear pin, keep row
          if (
            action.payload.enabled === false &&
            state.content.pinnedAffirmationId === id
          ) {
            state.content.pinnedAffirmationId = null;
          }
        }
      }

      if (changed) {
        persistScheduleSources(state);
      }
    },

    /**
     * Remove one Daily Affirmation by id. Idempotent - missing id is a no-op.
     * If the removed id was pinned, clear the pin so TV returns to rotation.
     * Does not change rotateMs. DEV persist via shared path.
     */
    removeAffirmation: (state, action: PayloadAction<{ id: string }>) => {
      const rawId = action.payload.id;
      const id = typeof rawId === "string" ? rawId.trim() : "";
      if (!id) return;

      const before = state.content.affirmations.length;
      state.content.affirmations = state.content.affirmations.filter(
        (a) => a.id !== id,
      );
      if (state.content.affirmations.length === before) return;

      if (state.content.pinnedAffirmationId === id) {
        state.content.pinnedAffirmationId = null;
      }
      persistScheduleSources(state);
    },

    /**
     * Pin one Daily Affirmation by id (at most one pin).
     * Must exist, be enabled, and have non-empty text — else no-op.
     * Replaces any previous pin. Stays pinned until unpin (no 12h expiry).
     * DEV persist via shared path.
     */
    pinAffirmation: (state, action: PayloadAction<{ id: string }>) => {
      const rawId = action.payload.id;
      const id = typeof rawId === "string" ? rawId.trim() : "";
      if (!id) return;

      const item = state.content.affirmations.find((a) => a.id === id);
      if (!item) return;
      if (!item.enabled) return;
      if (!item.text.trim()) return;

      if (state.content.pinnedAffirmationId === id) return;

      state.content.pinnedAffirmationId = id;
      persistScheduleSources(state);
    },

    /**
     * Clear the pinned Daily Affirmation (resume auto-rotation).
     * Idempotent if already null. DEV persist via shared path.
     */
    unpinAffirmation: (state) => {
      if (state.content.pinnedAffirmationId == null) return;
      state.content.pinnedAffirmationId = null;
      persistScheduleSources(state);
    },

    /**
     * Staff-set auto-rotate interval for Daily Affirmations (ms).
     * Must be a finite number > 0. Invalid values = no-op.
     * Does not change pin or the library list. DEV persist via shared path.
     */
    setAffirmationRotateMs: (state, action: PayloadAction<{ ms: number }>) => {
      const ms = action.payload.ms;
      if (typeof ms !== "number" || !Number.isFinite(ms) || ms <= 0) return;
      if (state.content.affirmationRotateMs === ms) return;
      state.content.affirmationRotateMs = ms;
      persistScheduleSources(state);
    },

    /**
     * Set one Spotlight item active/inactive by id (Manage Enable/Disable).
     * TV pool uses active only (getActiveSpotlightItems). Unknown id = no-op.
     * Idempotent. Does not touch sortOrder, media fields, schedule, or storage.
     * Backend/API will replace this client mock later.
     */
    setSpotlightItemActive: (
      state,
      action: PayloadAction<{ id: string; active: boolean }>,
    ) => {
      const rawId = action.payload.id;
      const id = typeof rawId === "string" ? rawId.trim() : "";
      if (!id) return;

      const item = state.content.spotlightItems.find((s) => s.id === id);
      if (!item) return;

      item.active = action.payload.active;
    },

    /**
     * Move one Spotlight item one position up/down in Manage order.
     * Order = full list sorted by sortOrder then id (active + inactive).
     * Swaps with neighbor, then renumbers sortOrder 0..n-1 (heals dups/gaps).
     * First+up / last+down / unknown id = no-op. No persist. No media/active/pin changes.
     * Backend/API will replace this client mock later.
     */
    moveSpotlightItem: (
      state,
      action: PayloadAction<{ id: string; direction: "up" | "down" }>,
    ) => {
      const rawId = action.payload.id;
      const id = typeof rawId === "string" ? rawId.trim() : "";
      if (!id) return;

      const direction = action.payload.direction;
      if (direction !== "up" && direction !== "down") return;

      const ordered = state.content.spotlightItems.slice().sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.id.localeCompare(b.id);
      });

      const index = ordered.findIndex((s) => s.id === id);
      if (index < 0) return;

      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= ordered.length) return;

      const tmp = ordered[index]!;
      ordered[index] = ordered[swapWith]!;
      ordered[swapWith] = tmp;

      ordered.forEach((item, i) => {
        item.sortOrder = i;
      });
    },

    /**
     * Add one staff-created Spotlight flyer (Manage + Add Flyer).
     * UI generates id via newSpotlightFlyerId() BEFORE dispatch — no clock/random here.
     * Appends at end of order (max sortOrder + 1). Forces kind flyer + pinMode none.
     * Empty subtitle/message/video fields. Duplicate/blank id or blank imageUrl = no-op.
     * Does NOT persist (spotlight not on schedule localStorage). No base64 storage.
     * Backend/API + real media URLs will replace this client mock later.
     */
    addSpotlightFlyer: (
      state,
      action: PayloadAction<{
        id: string;
        title: string;
        imageUrl: string;
        imageAlt?: string;
        active?: boolean;
      }>,
    ) => {
      const rawId = action.payload.id;
      const id = typeof rawId === "string" ? rawId.trim() : "";
      if (!id) return;

      const title =
        typeof action.payload.title === "string"
          ? action.payload.title.trim()
          : "";
      if (!title) return;

      const imageUrl =
        typeof action.payload.imageUrl === "string"
          ? action.payload.imageUrl.trim()
          : "";
      if (!imageUrl) return;

      const duplicate = state.content.spotlightItems.some((s) => s.id === id);
      if (duplicate) return;

      const imageAltRaw = action.payload.imageAlt;
      const imageAlt =
        typeof imageAltRaw === "string" && imageAltRaw.trim()
          ? imageAltRaw.trim()
          : title;

      const active =
        typeof action.payload.active === "boolean"
          ? action.payload.active
          : true;

      let maxOrder = -1;
      for (const item of state.content.spotlightItems) {
        if (item.sortOrder > maxOrder) maxOrder = item.sortOrder;
      }

      state.content.spotlightItems.push({
        id,
        kind: "flyer",
        sortOrder: maxOrder + 1,
        active,
        pinMode: "none",
        title,
        subtitle: "",
        message: "",
        imageUrl,
        imageAlt,
        videoUrl: "",
        videoMimeType: "",
        videoSoundEnabled: false,
      });
    },

    /**
     * Remove one Spotlight item by id (Manage Delete).
     * Drops from content.spotlightItems entirely (all kinds, including seeds).
     * Remaining items renumbered sortOrder 0..n-1 (stable order before delete).
     * Unknown/blank id = no-op. Does NOT persist (no spotlight localStorage).
     * Does not revoke blob URLs - Manage handler owns revoke for session flyer blob: only.
     * Backend/API will replace this client mock later.
     */
    removeSpotlightItem: (state, action: PayloadAction<{ id: string }>) => {
      const rawId = action.payload.id;
      const id = typeof rawId === "string" ? rawId.trim() : "";
      if (!id) return;

      const before = state.content.spotlightItems;
      const next = before.filter((s) => s.id !== id);
      if (next.length === before.length) return;

      const ordered = next.slice().sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.id.localeCompare(b.id);
      });
      ordered.forEach((item, i) => {
        item.sortOrder = i;
      });

      state.content.spotlightItems = ordered;
    },

    /**
     * Cancel one occurrence for an explicit Chicago dateYmd.
     * Recurring → exception kind cancel (series unchanged).
     * One-time → row.canceled = true.
     * Idempotent. No clock/random in this reducer.
     */
    cancelOccurrence: (
      state,
      action: PayloadAction<HouseDisplayOccurrenceActionPayload>,
    ) => {
      const { occurrenceId, dateYmd } = action.payload;
      if (!occurrenceId || !dateYmd) return;

      const recurringRef = parseRecurringOccurrenceId(occurrenceId);
      if (recurringRef) {
        const seriesId = recurringRef.seriesId;
        const exId = cancelExceptionId(seriesId, dateYmd);
        const already = state.schedule.exceptions.some(
          (e) =>
            e.id === exId ||
            (e.kind === "cancel" &&
              e.seriesId === seriesId &&
              e.dateYmd === dateYmd),
        );
        if (!already) {
          state.schedule.exceptions.push({
            id: exId,
            seriesId,
            dateYmd,
            kind: "cancel",
          });
        }
      } else {
        const one = state.schedule.oneTime.find((o) => o.id === occurrenceId);
        if (one) {
          one.canceled = true;
        }
      }

      syncAgendaFromSchedule(state, dateYmd);
      persistScheduleSources(state);
    },

    /**
     * Restore one occurrence for an explicit Chicago dateYmd.
     * Recurring → remove that day's cancel exception only.
     * One-time → canceled = false.
     * No clock/random in this reducer.
     */
    restoreOccurrence: (
      state,
      action: PayloadAction<HouseDisplayOccurrenceActionPayload>,
    ) => {
      const { occurrenceId, dateYmd } = action.payload;
      if (!occurrenceId || !dateYmd) return;

      const recurringRef = parseRecurringOccurrenceId(occurrenceId);
      if (recurringRef) {
        const seriesId = recurringRef.seriesId;
        state.schedule.exceptions = state.schedule.exceptions.filter((e) => {
          if (e.kind !== "cancel") return true;
          if (e.seriesId !== seriesId) return true;
          if (e.dateYmd !== dateYmd) return true;
          return false;
        });
      } else {
        const one = state.schedule.oneTime.find((o) => o.id === occurrenceId);
        if (one) {
          one.canceled = false;
        }
      }

      syncAgendaFromSchedule(state, dateYmd);
      persistScheduleSources(state);
    },
    /**
     * Add one recurring series definition.
     * UI supplies full event (including id) + explicit dateYmd.
     * No clock/random/id generation here. Overlaps allowed.
     */
    addRecurringClass: (
      state,
      action: PayloadAction<AddRecurringClassPayload>,
    ) => {
      const { event, dateYmd } = action.payload;
      if (!event || !dateYmd) return;

      const id = typeof event.id === "string" ? event.id.trim() : "";
      if (!id) return;

      const title = typeof event.title === "string" ? event.title.trim() : "";
      if (!title) return;

      const daysOfWeek = normalizeRecurringWeekdays(event.daysOfWeek ?? []);
      if (daysOfWeek.length === 0) return;

      const startMin = event.startMin;
      const endMin = event.endMin;
      if (!Number.isInteger(startMin) || !Number.isInteger(endMin)) return;
      if (endMin <= startMin) return;

      // Duplicate id — no-op (do not replace existing series)
      if (state.schedule.recurring.some((r) => r.id === id)) return;

      state.schedule.recurring.push({
        id,
        title,
        startMin,
        endMin,
        daysOfWeek,
        active: true,
        location: event.location,
        facilitator: event.facilitator,
        // Catalog logoKey from Manage Class Image (optional).
        logoKey:
          typeof event.logoKey === "string" && event.logoKey.trim()
            ? event.logoKey.trim()
            : event.logoKey === null
              ? null
              : undefined,
      });

      syncAgendaFromSchedule(state, dateYmd);
      persistScheduleSources(state);
    },
    /**
     * Edit one existing recurring series (definition, not one occurrence).
     * Keeps id + active. Does not touch exceptions. Overlaps allowed.
     * No clock/random/id generation.
     */
    editRecurringClass: (
      state,
      action: PayloadAction<EditRecurringClassPayload>,
    ) => {
      const {
        id: rawId,
        title: rawTitle,
        startMin,
        endMin,
        daysOfWeek,
        dateYmd,
        location,
        facilitator,
        logoKey: logoKeyPayload,
      } = action.payload;
      if (!dateYmd) return;

      const id = typeof rawId === "string" ? rawId.trim() : "";
      if (!id) return;

      const index = state.schedule.recurring.findIndex((r) => r.id === id);
      if (index < 0) return;

      const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
      if (!title) return;

      const normalizedDays = normalizeRecurringWeekdays(daysOfWeek ?? []);
      if (normalizedDays.length === 0) return;

      if (!Number.isInteger(startMin) || !Number.isInteger(endMin)) return;
      if (endMin <= startMin) return;

      const existing = state.schedule.recurring[index];
      if (!existing) return;
      // For facilitator: undefined means keep existing, "" means clear
      const newFacilitator =
        typeof facilitator === "string" ? facilitator : existing.facilitator;
      // logoKey: undefined = keep; null = clear; non-empty string = replace
      let nextLogoKey = existing.logoKey;
      if (logoKeyPayload === null) {
        nextLogoKey = null;
      } else if (typeof logoKeyPayload === "string") {
        const trimmed = logoKeyPayload.trim();
        nextLogoKey = trimmed ? trimmed : null;
      }
      state.schedule.recurring[index] = {
        id: existing.id,
        active: existing.active,
        title,
        startMin,
        endMin,
        daysOfWeek: normalizedDays,
        location: location ?? existing.location,
        facilitator: newFacilitator,
        logoKey: nextLogoKey,
      };

      syncAgendaFromSchedule(state, dateYmd);
      persistScheduleSources(state);
    },
    /**
     * End Class: set active false. Keep id/title/times/days.
     * Does not touch exceptions. Not Delete.
     * Unknown id = no-op. Already inactive = idempotent (still sync+persist).
     * No clock/random/id generation.
     */
    endRecurringClass: (
      state,
      action: PayloadAction<EndRecurringClassPayload>,
    ) => {
      const { id: rawId, dateYmd } = action.payload;
      if (!dateYmd) return;

      const id = typeof rawId === "string" ? rawId.trim() : "";
      if (!id) return;

      const existing = state.schedule.recurring.find((r) => r.id === id);
      if (!existing) return;

      existing.active = false;

      syncAgendaFromSchedule(state, dateYmd);
      persistScheduleSources(state);
    },
    /**
     * Reinstate an ended recurring class — exact inverse of endRecurringClass.
     * active false → true. All other fields (id/title/times/days/location/
     * facilitator) untouched. No exception changes.
     * Unknown id = no-op. Already active = idempotent (still sync+persist).
     * No clock/random/id generation. Reinstating does NOT create a duplicate
     * — the row already exists in state.schedule.recurring.
     */
    reinstateRecurringClass: (
      state,
      action: PayloadAction<EndRecurringClassPayload>,
    ) => {
      const { id: rawId, dateYmd } = action.payload;
      if (!dateYmd) return;

      const id = typeof rawId === "string" ? rawId.trim() : "";
      if (!id) return;

      const existing = state.schedule.recurring.find((r) => r.id === id);
      if (!existing) return;

      existing.active = true;

      syncAgendaFromSchedule(state, dateYmd);
      persistScheduleSources(state);
    },
    /**
     * Add one one-time event (single Chicago dateYmd).
     * UI supplies full event including id. Force active true, canceled false.
     * payload.dateYmd = agenda re-resolve day (usually today), not only event day.
     * No clock/random/id generation. Overlaps allowed. No exception/recurring changes.
     */
    addOneTimeEvent: (state, action: PayloadAction<AddOneTimeEventPayload>) => {
      const { event, dateYmd: resolveDateYmd } = action.payload;
      if (!event || !resolveDateYmd || !isRealDateYmd(resolveDateYmd)) return;

      const id = typeof event.id === "string" ? event.id.trim() : "";
      if (!id) return;

      const title = typeof event.title === "string" ? event.title.trim() : "";
      if (!title) return;

      const eventDateRaw =
        typeof event.dateYmd === "string" ? event.dateYmd.trim() : "";
      if (!isRealDateYmd(eventDateRaw)) return;

      const startMin = event.startMin;
      const endMin = event.endMin;
      if (!Number.isInteger(startMin) || !Number.isInteger(endMin)) return;
      if (endMin <= startMin) return;

      // Duplicate id — no-op (do not replace)
      if (state.schedule.oneTime.some((o) => o.id === id)) return;

      state.schedule.oneTime.push({
        id,
        title,
        dateYmd: eventDateRaw,
        startMin,
        endMin,
        active: true,
        canceled: false,
        location: event.location,
        facilitator: event.facilitator,
      });

      syncAgendaFromSchedule(state, resolveDateYmd);
      persistScheduleSources(state);
    },
    /**
     * Edit one one-time event fields only.
     * Keeps id / active / canceled. Does not touch exceptions or recurring.
     * resolveDateYmd = agenda re-resolve day (usually today).
     * No clock/random/id generation. Overlaps allowed.
     */
    editOneTimeEvent: (
      state,
      action: PayloadAction<EditOneTimeEventPayload>,
    ) => {
      const {
        id: rawId,
        title: rawTitle,
        eventDateYmd,
        startMin,
        endMin,
        resolveDateYmd,
        location,
        facilitator,
      } = action.payload;
      if (!resolveDateYmd || !isRealDateYmd(resolveDateYmd)) return;

      const id = typeof rawId === "string" ? rawId.trim() : "";
      if (!id) return;

      const index = state.schedule.oneTime.findIndex((o) => o.id === id);
      if (index < 0) return;

      const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
      if (!title) return;

      const eventDateRaw =
        typeof eventDateYmd === "string" ? eventDateYmd.trim() : "";
      if (!isRealDateYmd(eventDateRaw)) return;

      if (!Number.isInteger(startMin) || !Number.isInteger(endMin)) return;
      if (endMin <= startMin) return;

      const existing = state.schedule.oneTime[index];
      if (!existing) return;

      // For facilitator: undefined means keep existing, "" means clear
      const newFacilitator =
        typeof facilitator === "string" ? facilitator : existing.facilitator;
      state.schedule.oneTime[index] = {
        id: existing.id,
        active: existing.active,
        canceled: existing.canceled,
        title,
        dateYmd: eventDateRaw,
        startMin,
        endMin,
        location: location ?? existing.location,
        facilitator: newFacilitator,
        logoKey: existing.logoKey,
      };

      syncAgendaFromSchedule(state, resolveDateYmd);
      persistScheduleSources(state);
    },
    /**
     * Replace/Hide: suppress one recurring occurrence on an explicit Chicago day.
     * kind "suppress" — omit from agenda (not CANCELED). Series stays active.
     * Deterministic id. Idempotent. Does not remove cancel exceptions if present
     * (resolver prefers suppress over cancel if both exist).
     * No clock/random. No series field changes.
     */
    suppressRecurringOccurrence: (
      state,
      action: PayloadAction<SuppressRecurringOccurrencePayload>,
    ) => {
      const {
        seriesId: rawSeriesId,
        dateYmd,
        sourceOneTimeEventId,
      } = action.payload;

      if (!dateYmd) return;

      const seriesId =
        typeof rawSeriesId === "string" ? rawSeriesId.trim() : "";
      if (!seriesId) return;

      // Series must exist and be active? Allow suppress even if inactive for
      // safety — still no-op if missing series is OK for future restore.
      const series = state.schedule.recurring.find((r) => r.id === seriesId);
      if (!series) return;

      const exId = suppressExceptionId(seriesId, dateYmd, sourceOneTimeEventId);

      const already = state.schedule.exceptions.some(
        (e) =>
          e.id === exId ||
          (e.kind === "suppress" &&
            e.seriesId === seriesId &&
            e.dateYmd === dateYmd &&
            e.sourceOneTimeEventId === sourceOneTimeEventId),
      );

      if (!already) {
        state.schedule.exceptions.push({
          id: exId,
          seriesId,
          dateYmd,
          kind: "suppress",
          sourceOneTimeEventId,
        });
      }

      syncAgendaFromSchedule(state, dateYmd);
      persistScheduleSources(state);
    },
    /**
     * Remove suppress (Replace/Hide) for one series on one Chicago day.
     * Does not touch cancel/override. Series unchanged.
     */
    unsuppressRecurringOccurrence: (
      state,
      action: PayloadAction<SuppressRecurringOccurrencePayload>,
    ) => {
      const {
        seriesId: rawSeriesId,
        dateYmd,
        sourceOneTimeEventId,
      } = action.payload;

      if (!dateYmd) return;

      const seriesId =
        typeof rawSeriesId === "string" ? rawSeriesId.trim() : "";
      if (!seriesId) return;

      state.schedule.exceptions = state.schedule.exceptions.filter((e) => {
        if (e.kind !== "suppress") return true;
        if (e.seriesId !== seriesId) return true;
        if (e.dateYmd !== dateYmd) return true;

        if (sourceOneTimeEventId) {
          return e.sourceOneTimeEventId !== sourceOneTimeEventId;
        }

        // Legacy/manual behavior: remove only an unowned suppression.
        // Do not remove suppressions belonging to one-time events.
        return e.sourceOneTimeEventId !== undefined;
      });

      syncAgendaFromSchedule(state, dateYmd);
      persistScheduleSources(state);
    },
    /**
     * Admin Manage: set or clear one system Spotlight graphic override.
     * imageUrl non-empty string -> store trimmed URL for that assetKey.
     * imageUrl null or blank -> remove override(bundled default agin).
     * Rejects unknown assetKey and data: URLs.
     * No DEV localStorage media yet - session Redux only until later.
     */
    setSystemSpotlightImageOverride: (
      state,
      action: PayloadAction<{
        assetKey: string;
        imageUrl: string | null;
      }>,
    ) => {
      const rawKey =
        typeof action.payload.assetKey === "string"
          ? action.payload.assetKey.trim()
          : "";
      if (!rawKey || !isSystemSpotlightAssetKey(rawKey)) return;

      const rawUrl = action.payload.imageUrl;
      if (
        rawUrl == null ||
        (typeof rawUrl === "string" && rawUrl.trim() === "")
      ) {
        if (!(rawKey in state.content.systemSpotlightImageOverrides)) return;

        const next = { ...state.content.systemSpotlightImageOverrides };
        delete next[rawKey];
        state.content.systemSpotlightImageOverrides = next;
        persistScheduleSources(state);
        return;
      }

      if (typeof rawUrl !== "string") return;

      const imageUrl = rawUrl.trim();
      if (!imageUrl) return;
      if (imageUrl.startsWith("data:")) return;

      const prev = state.content.systemSpotlightImageOverrides[rawKey];
      if (prev === imageUrl) return;

      state.content.systemSpotlightImageOverrides[rawKey] = imageUrl;
      persistScheduleSources(state);
    },
    /**
     * Admin Manage: set or clear one program/class logo graphic override.
     * imageUrl non-empty string -> store trimmed URL for that logoKey.
     * imageUrl null or blank -> remove override (bundled default again).
     * Rejects unknown logoKey and data: URLs.
     * Schedule rows keep logoKey slugs only — art lives on this map.
     * DEV LS may keep stable URLs via sanitize; blob: session-only.
     */
    setProgramLogoImageOverride: (
      state,
      action: PayloadAction<{
        logoKey: string;
        imageUrl: string | null;
      }>,
    ) => {
      const rawKey =
        typeof action.payload.logoKey === "string"
          ? action.payload.logoKey.trim()
          : "";
      if (!rawKey || !isProgramLogoKey(rawKey)) return;

      const rawUrl = action.payload.imageUrl;
      if (
        rawUrl == null ||
        (typeof rawUrl === "string" && rawUrl.trim() === "")
      ) {
        if (!(rawKey in state.content.programLogoImageOverrides)) return;

        const next = { ...state.content.programLogoImageOverrides };
        delete next[rawKey as keyof typeof next];
        state.content.programLogoImageOverrides = next;
        persistScheduleSources(state);
        return;
      }

      if (typeof rawUrl !== "string") return;

      const imageUrl = rawUrl.trim();
      if (!imageUrl) return;
      if (imageUrl.startsWith("data:")) return;

      const prev =
        state.content.programLogoImageOverrides[
          rawKey as keyof typeof state.content.programLogoImageOverrides
        ];
      if (prev === imageUrl) return;

      state.content.programLogoImageOverrides[
        rawKey as keyof typeof state.content.programLogoImageOverrides
      ] = imageUrl;
      persistScheduleSources(state);
    },
    /**
     * Admin Manage: set one weekly curfew close (Sun=0…Sat=6).
     * closeMin integer 1..1440 (1440 = end-of-day). Rejects 0 / invalid weekday.
     * dateYmd only re-resolves today’s agenda/timeline; does not invent overrides.
     */
    setCurfewWeeklyClose: (
      state,
      action: PayloadAction<SetCurfewWeeklyClosePayload>,
    ) => {
      const weekday = action.payload.weekday;
      const closeMin = action.payload.closeMin;
      const dateYmd = action.payload.dateYmd;

      if (
        typeof weekday !== "number" ||
        !Number.isInteger(weekday) ||
        weekday < 0 ||
        weekday > 6
      ) {
        return;
      }
      if (!isValidCurfewCloseMin(closeMin)) return;
      if (!isRealDateYmd(dateYmd)) return;

      const days = state.content.curfew.weekly.closeMinByWeekday;
      if (days[weekday] === closeMin) return;

      // New 7-tuple so we never mutate a shared seed array by accident.
      state.content.curfew.weekly.closeMinByWeekday = [
        days[0],
        days[1],
        days[2],
        days[3],
        days[4],
        days[5],
        days[6],
      ];
      state.content.curfew.weekly.closeMinByWeekday[weekday] = closeMin;

      syncAgendaFromSchedule(state, dateYmd);
      persistScheduleSources(state);
    },
    /**
     * Admin Manage: upsert one curfew date override.
     * Replaces any existing row with the same dateYmd (one per day).
     * closeMin 1..1440; 0 rejected. resolveDateYmd re-syncs board only.
     */
    setCurfewDateOverride: (
      state,
      action: PayloadAction<SetCurfewDateOverridePayload>,
    ) => {
      const rawId = action.payload.id;
      const dateYmd = action.payload.dateYmd;
      const closeMin = action.payload.closeMin;
      const resolveDateYmd = action.payload.resolveDateYmd;

      if (typeof rawId !== "string" || rawId.trim() === "") return;
      if (!isRealDateYmd(dateYmd)) return;
      if (!isValidCurfewCloseMin(closeMin)) return;
      if (!isRealDateYmd(resolveDateYmd)) return;

      const id = rawId.trim();
      const nextRow: {
        id: string;
        dateYmd: string;
        closeMin: number;
        note?: string;
      } = {
        id,
        dateYmd: dateYmd.trim(),
        closeMin,
      };

      const noteRaw = action.payload.note;
      if (typeof noteRaw === "string" && noteRaw.trim() !== "") {
        nextRow.note = noteRaw.trim();
      }

      const ymd = nextRow.dateYmd;
      const others = state.content.curfew.overrides.filter(
        (o) => o.dateYmd !== ymd,
      );
      state.content.curfew.overrides = [...others, nextRow];

      syncAgendaFromSchedule(state, resolveDateYmd);
      persistScheduleSources(state);
    },
    /**
     * Admin Manage: remove date override for one dateYmd.
     * That day falls back to weekly close. resolveDateYmd re-syncs board only.
     */
    clearCurfewDateOverride: (
      state,
      action: PayloadAction<ClearCurfewDateOverridePayload>,
    ) => {
      const dateYmd = action.payload.dateYmd;
      const resolveDateYmd = action.payload.resolveDateYmd;

      if (!isRealDateYmd(dateYmd)) return;
      if (!isRealDateYmd(resolveDateYmd)) return;

      const ymd = dateYmd.trim();
      const prev = state.content.curfew.overrides;
      const next = prev.filter((o) => o.dateYmd !== ymd);
      if (next.length === prev.length) return;

      state.content.curfew.overrides = next;
      syncAgendaFromSchedule(state, resolveDateYmd);
      persistScheduleSources(state);
    },
  },
});

export const {
  setContent,
  addAnnouncement,
  removeAnnouncement,
  addAffirmation,
  editAffirmation,
  removeAffirmation,
  pinAffirmation,
  unpinAffirmation,
  setAffirmationRotateMs,
  setSpotlightItemActive,
  moveSpotlightItem,
  addSpotlightFlyer,
  removeSpotlightItem,
  cancelOccurrence,
  restoreOccurrence,
  addRecurringClass,
  editRecurringClass,
  endRecurringClass,
  reinstateRecurringClass,
  addOneTimeEvent,
  editOneTimeEvent,
  suppressRecurringOccurrence,
  unsuppressRecurringOccurrence,
  setSystemSpotlightImageOverride,
  setProgramLogoImageOverride,
  setCurfewWeeklyClose,
  setCurfewDateOverride,
  clearCurfewDateOverride,
} = houseDisplaySlice.actions;
export default houseDisplaySlice.reducer;
