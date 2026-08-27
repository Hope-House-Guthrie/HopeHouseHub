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
 * NOT YET:
 * - override exception UI, delete definition, ended-list conflict UI
 * - Backend API / thunks
 * - Midnight re-resolve without refresh
 *
 * Who uses this:
 *   - manage.tsx  → Today cancel/restore; Add/Edit/End/Reinstate Recurring; One-Time add/edit
 *   - index.tsx   → TV selects content only
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  HouseDisplayContent,
  HouseDisplayState,
} from "../../../features/house-display/types";
import { DEFAULT_TIMELINE_WINDOW } from "../../../features/house-display/timeline";
import { getHopeHouseNow } from "../../../features/house-display/time";
// Relative paths: Bun hot sometimes fails @/ resolve on newly added feature files
import { resolveAgendaForDate } from "../../../features/house-display/resolveAgenda";
import { INITIAL_SCHEDULE_SOURCES } from "../../../features/house-display/scheduleSeed";
import type {
  HouseDisplayOneTimeEvent,
  HouseDisplayRecurringEvent,
  HouseDisplayScheduleSources,
  HouseDisplayWeekday,
} from "../../../features/house-display/scheduleTypes";
import {
  loadScheduleSources,
  saveScheduleSources,
} from "../../../features/house-display/schedulePersistence";
// Bundled flyer URLs (Bun @assets). public/house-display/* is NOT served by dev-server.
import kiddosDonationUrl from "@assets/house-display/kiddos-donation.png";
import hopeChangesEverythingUrl from "@assets/house-display/hope-changes-everything.png";

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
  state.content.agendaItems = resolveAgendaForDate({
    dateYmd,
    sources: {
      recurring: state.schedule.recurring,
      oneTime: state.schedule.oneTime,
      exceptions: state.schedule.exceptions,
    },
  });
}

/**
 * DEV/prototype: persist sources only after schedule mutators.
 * Backend will replace this later — not a general app persistence layer.
 */
function persistScheduleSources(state: HouseDisplayState): void {
  saveScheduleSources({
    recurring: state.schedule.recurring,
    oneTime: state.schedule.oneTime,
    exceptions: state.schedule.exceptions,
  });
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

/**
 * Build TV content tree. agendaItems = resolve(Chicago dateKey, sources).
 * Spotlight / lower band still static seed for now.
 * getHopeHouseNow OK here for first paint only — not inside Cancel/Restore.
 */
function buildContent(
  schedule: HouseDisplayScheduleSources,
  dateYmd?: string,
): HouseDisplayContent {
  const ymd = dateYmd ?? getHopeHouseNow().dateKey;
  return {
    header: {
      identityLabel: "Hope House Guthrie",
      clockText: "3:45 PM",
      dateText: "Sun, Aug 23",
      weatherText: "82° Clear",
    },
    timeline: { ...DEFAULT_TIMELINE_WINDOW },
    agendaItems: resolveAgendaForDate({ dateYmd: ymd, sources: schedule }),
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
        active: false,
        pinMode: "none",
        title: "Test Video",
        subtitle: "",
        message: "",
        imageUrl: "",
        imageAlt: "",
        videoUrl: "house-display/test-VideoColorSpace.mp4",
        videoMimeType: "video/mp4",
        videoSoundEnabled: false,
      },
    ],
    // Still mock strip — not derived from agenda yet (known cleanup)
    upcomingItems: [
      { id: "u1", timeLabel: "3:30 PM", title: "House Meeting" },
      { id: "u2", timeLabel: "6:00 PM", title: "Main NA" },
      { id: "u3", timeLabel: "7:30 PM", title: "Quiet Hours prep" },
    ],
    affirmationText:
      "Progress, not perfection - show up for yourself and the house today.",
    announcements: [
      {
        id: "n1",
        text: "Kitchen closes at 8:00 PM. Please rinse dishes before then.",
      },
      {
        id: "n2",
        text: "House Meeting is mandatory - be in the living room by 3:25 PM.",
      },
    ],
    birthday: {
      name: "Alex M.",
      dateLabel: "Thu, Aug 27",
    },
  };
}

// Hydrate schedule SOURCES only. Invalid/missing localStorage → seed.
// agendaItems always come from resolve (never read from storage).
const persistedSchedule = loadScheduleSources();
const initialSchedule = cloneScheduleSources(
  persistedSchedule ?? INITIAL_SCHEDULE_SOURCES,
);

const initialState: HouseDisplayState = {
  schedule: initialSchedule,
  content: buildContent(initialSchedule),
};

export const houseDisplaySlice = createSlice({
  name: "houseDisplay",
  initialState,
  reducers: {
    /** Replace full TV content tree (rare). Prefer schedule mutators. */
    setContent: (state, action: PayloadAction<HouseDisplayContent>) => {
      state.content = action.payload;
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
      state.schedule.recurring[index] = {
        id: existing.id,
        active: existing.active,
        title,
        startMin,
        endMin,
        daysOfWeek: normalizedDays,
        location: location ?? existing.location,
        facilitator: newFacilitator,
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
  },
});

export const {
  setContent,
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
} = houseDisplaySlice.actions;
export default houseDisplaySlice.reducer;
