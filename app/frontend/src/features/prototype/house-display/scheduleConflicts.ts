/**
 * STATUS — House Display schedule conflict detection (pure)
 * Branch: feature/house-display
 * Stage A+B: detect only — no UI. Suppress/cancel occurrences ≠ conflicts.
 *
 * Operates on schedule SOURCES (recurring + oneTime + exceptions),
 * not content.agendaItems. No React / Date.now / crypto.
 *
 * Overlap (half-open style endpoints):
 *   aStart < bEnd && aEnd > bStart
 * Touching ends (2:00–3:00 vs 1:00–2:00) = no conflict.
 */

import { weekdayFromDateYmd } from "./resolveAgenda";
import type {
  HouseDisplayOccurrenceException,
  HouseDisplayOneTimeEvent,
  HouseDisplayRecurringEvent,
  HouseDisplayScheduleSources,
  HouseDisplayWeekday,
} from "./scheduleTypes";

/** True when open intervals (start, end) overlap in minutes-from-midnight. */
export function timesOverlap(
  aStartMin: number,
  aEndMin: number,
  bStartMin: number,
  bEndMin: number,
): boolean {
  return aStartMin < bEndMin && aEndMin > bStartMin;
}

/** Shared weekdays between two sets (sorted unique 0–6). */
export function sharedWeekdays(
  a: readonly number[],
  b: readonly number[],
): HouseDisplayWeekday[] {
  const bSet = new Set<number>();
  for (const d of b) {
    if (Number.isInteger(d) && d >= 0 && d <= 6) bSet.add(d);
  }
  const out: HouseDisplayWeekday[] = [];
  const seen = new Set<number>();
  for (const d of a) {
    if (
      Number.isInteger(d) &&
      d >= 0 &&
      d <= 6 &&
      bSet.has(d) &&
      !seen.has(d)
    ) {
      seen.add(d);
      out.push(d as HouseDisplayWeekday);
    }
  }
  return out.sort((x, y) => x - y);
}

export type ScheduleConflictRecurring = {
  kind: "recurring";
  seriesId: string;
  title: string;
  startMin: number;
  endMin: number;
  /** Weekdays that collide (subset of existing series days). */
  weekdays: HouseDisplayWeekday[];
};

export type ScheduleConflictOneTime = {
  kind: "oneTime";
  eventId: string;
  title: string;
  /** Actual stored Chicago day of the one-time event. */
  dateYmd: string;
  startMin: number;
  endMin: number;
};

export type ScheduleConflict =
  | ScheduleConflictRecurring
  | ScheduleConflictOneTime;

export type RecurringConflictCandidate = {
  type: "recurring";
  startMin: number;
  endMin: number;
  daysOfWeek: readonly number[];
  /** America/Chicago calendar day YYYY-MM-DD being edited. */
  dateYmd: string;
  /** When editing, skip this series id. */
  excludeId?: string;
};

export type OneTimeConflictCandidate = {
  type: "oneTime";
  /** Candidate event day (Chicago YYYY-MM-DD). */
  dateYmd: string;
  startMin: number;
  endMin: number;
  /** When editing, skip this one-time id. */
  excludeId?: string;
};

export type ScheduleConflictCandidate =
  | RecurringConflictCandidate
  | OneTimeConflictCandidate;

/**
 * True if this recurring series has a cancel exception on dateYmd
 * (S1 Cancel this occurrence). Canceled occurrence ≠ conflict.
 */
export function hasCancelExceptionOnDate(
  exceptions: readonly HouseDisplayOccurrenceException[],
  seriesId: string,
  dateYmd: string,
): boolean {
  return exceptions.some(
    (e) =>
      e.kind === "cancel" &&
      e.seriesId === seriesId &&
      e.dateYmd === dateYmd,
  );
}

/**
 * True if Replace/Hide suppress exception exists for series on dateYmd.
 * Suppressed occurrence is omitted from agenda — ≠ conflict.
 */
export function hasSuppressExceptionOnDate(
  exceptions: readonly HouseDisplayOccurrenceException[],
  seriesId: string,
  dateYmd: string,
): boolean {
  return exceptions.some(
    (e) =>
      e.kind === "suppress" &&
      e.seriesId === seriesId &&
      e.dateYmd === dateYmd,
  );
}

/** Cancel or suppress → series does not occupy that date for conflict purposes. */
export function isRecurringOccurrenceAbsentOnDate(
  exceptions: readonly HouseDisplayOccurrenceException[],
  seriesId: string,
  dateYmd: string,
): boolean {
  return (
    hasCancelExceptionOnDate(exceptions, seriesId, dateYmd) ||
    hasSuppressExceptionOnDate(exceptions, seriesId, dateYmd)
  );
}

function isActiveRecurring(
  series: HouseDisplayRecurringEvent,
  excludeId?: string,
): boolean {
  if (!series.active) return false;
  if (excludeId && series.id === excludeId) return false;
  return true;
}

function isActiveNonCanceledOneTime(
  event: HouseDisplayOneTimeEvent,
  excludeId?: string,
): boolean {
  if (!event.active) return false;
  if (event.canceled) return false;
  if (excludeId && event.id === excludeId) return false;
  return true;
}

/**
 * Find schedule conflicts for a recurring or one-time candidate
 * against full schedule sources.
 */
export function findScheduleConflicts(args: {
  sources: HouseDisplayScheduleSources;
  candidate: ScheduleConflictCandidate;
}): ScheduleConflict[] {
  const { sources, candidate } = args;
  const out: ScheduleConflict[] = [];

  if (candidate.type === "recurring") {
    collectRecurringVsRecurring(sources, candidate, out);
    collectRecurringVsOneTime(sources, candidate, out);
  } else {
    collectOneTimeVsRecurring(sources, candidate, out);
    collectOneTimeVsOneTime(sources, candidate, out);
  }

  return out;
}

function collectRecurringVsRecurring(
  sources: HouseDisplayScheduleSources,
  candidate: RecurringConflictCandidate,
  out: ScheduleConflict[],
): void {
  for (const series of sources.recurring) {
    if (!isActiveRecurring(series, candidate.excludeId)) continue;
    if (
      !timesOverlap(
        candidate.startMin,
        candidate.endMin,
        series.startMin,
        series.endMin,
      )
    ) {
      continue;
    }

    // Weekdays that collide
    const weekdays = sharedWeekdays(candidate.daysOfWeek, series.daysOfWeek);
    if (weekdays.length === 0) continue;

    // Check one specific date: the date the staff is editing on
    // If that date has cancel or suppress on the existing series, not a conflict
    if (
      isRecurringOccurrenceAbsentOnDate(
        sources.exceptions,
        series.id,
        candidate.dateYmd,
      )
    ) {
      continue;
    }

    out.push({
      kind: "recurring",
      seriesId: series.id,
      title: series.title,
      startMin: series.startMin,
      endMin: series.endMin,
      weekdays,
    });
  }
}

function collectRecurringVsOneTime(
  sources: HouseDisplayScheduleSources,
  candidate: RecurringConflictCandidate,
  out: ScheduleConflict[],
): void {
  const candidateDays = new Set(
    sharedWeekdays(candidate.daysOfWeek, candidate.daysOfWeek),
  );

  for (const event of sources.oneTime) {
    if (!isActiveNonCanceledOneTime(event)) continue;
    // Stored one-time only — no invented future expansion
    const eventWeekday = weekdayFromDateYmd(event.dateYmd);
    if (!candidateDays.has(eventWeekday)) continue;
    if (
      !timesOverlap(
        candidate.startMin,
        candidate.endMin,
        event.startMin,
        event.endMin,
      )
    ) {
      continue;
    }

    out.push({
      kind: "oneTime",
      eventId: event.id,
      title: event.title,
      dateYmd: event.dateYmd,
      startMin: event.startMin,
      endMin: event.endMin,
    });
  }
}

function collectOneTimeVsRecurring(
  sources: HouseDisplayScheduleSources,
  candidate: OneTimeConflictCandidate,
  out: ScheduleConflict[],
): void {
  const weekday = weekdayFromDateYmd(candidate.dateYmd);

  for (const series of sources.recurring) {
    if (!isActiveRecurring(series)) continue;
    if (!series.daysOfWeek.includes(weekday)) continue;
    // Canceled or suppressed occurrence that day does not block
    if (
      isRecurringOccurrenceAbsentOnDate(
        sources.exceptions,
        series.id,
        candidate.dateYmd,
      )
    ) {
      continue;
    }
    if (
      !timesOverlap(
        candidate.startMin,
        candidate.endMin,
        series.startMin,
        series.endMin,
      )
    ) {
      continue;
    }

    out.push({
      kind: "recurring",
      seriesId: series.id,
      title: series.title,
      startMin: series.startMin,
      endMin: series.endMin,
      weekdays: [weekday],
    });
  }
}

function collectOneTimeVsOneTime(
  sources: HouseDisplayScheduleSources,
  candidate: OneTimeConflictCandidate,
  out: ScheduleConflict[],
): void {
  for (const event of sources.oneTime) {
    if (!isActiveNonCanceledOneTime(event, candidate.excludeId)) continue;
    if (event.dateYmd !== candidate.dateYmd) continue;
    if (
      !timesOverlap(
        candidate.startMin,
        candidate.endMin,
        event.startMin,
        event.endMin,
      )
    ) {
      continue;
    }

    out.push({
      kind: "oneTime",
      eventId: event.id,
      title: event.title,
      dateYmd: event.dateYmd,
      startMin: event.startMin,
      endMin: event.endMin,
    });
  }
}
