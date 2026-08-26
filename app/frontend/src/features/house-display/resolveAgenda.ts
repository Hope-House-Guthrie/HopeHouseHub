/**
 * STATUS — resolve schedule SOURCES → today's TV agenda (pure)
 * Branch: feature/house-display
 *
 * DONE: resolveAgendaForDate, cancel/suppress/override paths,
 * stable seriesId:dateYmd ids, keep overlaps, sort by startMin.
 * No React/Redux.
 *
 * Recurring exception precedence (first match wins):
 * 1) !active series → skip
 * 2) weekday mismatch → skip
 * 3) suppress → omit entirely (Replace/Hide this date)
 * 4) cancel → occurrence with canceled: true
 * 5) override → patched fields, canceled false
 * 6) else normal occurrence
 */

import type { HouseDisplayAgendaItem } from "./types";
import type {
  HouseDisplayExceptionKind,
  HouseDisplayOccurrenceException,
  HouseDisplayOneTimeEvent,
  HouseDisplayRecurringEvent,
  HouseDisplayScheduleSources,
  HouseDisplayWeekday,
} from "./scheduleTypes";

/** Stable TV/manage id for one series occurrence on one Chicago day. */
export function recurringOccurrenceId(
  seriesId: string,
  dateYmd: string,
): string {
  return `${seriesId}:${dateYmd}`;
}

/**
 * Weekday 0-6 for a calendar YYYY-MM-DD.
 * Uses UTC date parts of that YMD only - not browser local TZ.
 * (Civil weekday of the date string; matches Hope House dateKey days.)
 */
export function weekdayFromDateYmd(dateYmd: string): HouseDisplayWeekday {
  const parts = dateYmd.split("-").map(Number);
  const y = parts[0] ?? 0;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  // Noon UTC avoids any odd midnight edge; day-of-week is the YMD's weekday.
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return utc.getUTCDay() as HouseDisplayWeekday;
}

function findException(
  exceptions: HouseDisplayOccurrenceException[],
  seriesId: string,
  dateYmd: string,
): HouseDisplayOccurrenceException | undefined {
  return exceptions.find(
    (e) => e.seriesId === seriesId && e.dateYmd === dateYmd,
  );
}

/**
 * Resolve all sources for one Hope House calendar day → TV agenda items.
 * Caller supplies dateYmd (usually HopeHouseNow.dateKey) and optional weekday
 * (defaults from dateYmd). sourceType added for explicit source identity.
 */
export function resolveAgendaForDate(args: {
  dateYmd: string;
  weekday?: HouseDisplayWeekday;
  sources: HouseDisplayScheduleSources;
}): HouseDisplayAgendaItem[] {
  const { dateYmd, sources } = args;
  const weekday = args.weekday ?? weekdayFromDateYmd(dateYmd);
  const out: HouseDisplayAgendaItem[] = [];

  for (const series of sources.recurring) {
    if (!series.active) continue;
    if (!series.daysOfWeek.includes(weekday)) continue;

    const ex = findException(sources.exceptions, series.id, dateYmd);
    const kind: HouseDisplayExceptionKind | undefined = ex?.kind;

    // Replace/Hide this date — omit entirely (not CANCELED chrome)
    if (kind === "suppress") {
      continue;
    }

    if (kind === "cancel") {
      out.push({
        id: recurringOccurrenceId(series.id, dateYmd),
        title: series.title,
        startMin: series.startMin,
        endMin: series.endMin,
        canceled: true,
        sourceType: "recurring",
        location: series.location,
        facilitator: series.facilitator,
      });
      continue;
    }

    if (kind === "override" && ex) {
      out.push({
        id: recurringOccurrenceId(series.id, dateYmd),
        title: ex.title ?? series.title,
        startMin: ex.startMin ?? series.startMin,
        endMin: ex.endMin ?? series.endMin,
        canceled: false,
        sourceType: "recurring",
        location: series.location,
        facilitator: series.facilitator,
      });
      continue;
    }

    out.push({
      id: recurringOccurrenceId(series.id, dateYmd),
      title: series.title,
      startMin: series.startMin,
      endMin: series.endMin,
      canceled: false,
      sourceType: "recurring",
      location: series.location,
      facilitator: series.facilitator,
    });
  }

  for (const item of sources.oneTime) {
    if (!item.active) continue;
    if (item.dateYmd !== dateYmd) continue;
    out.push({
      id: item.id,
      title: item.title,
      startMin: item.startMin,
      endMin: item.endMin,
      canceled: item.canceled,
      sourceType: "oneTime",
      location: item.location,
      facilitator: item.facilitator,
    });
  }

  out.sort((a, b) => {
    if (a.startMin !== b.startMin) return a.startMin - b.startMin;
    const byTitle = a.title.localeCompare(b.title);
    if (byTitle !== 0) return byTitle;
    return a.id.localeCompare(b.id);
  });

  return out;
}

/** Convenience: same as resolveAgendaForDate with a flat source bag. */
export function resolveAgendaForDateFromLists(
  dateYmd: string,
  recurring: HouseDisplayRecurringEvent[],
  oneTime: HouseDisplayOneTimeEvent[],
  exceptions: HouseDisplayOccurrenceException[],
  weekday?: HouseDisplayWeekday,
): HouseDisplayAgendaItem[] {
  return resolveAgendaForDate({
    dateYmd,
    weekday,
    sources: { recurring, oneTime, exceptions },
  });
}
