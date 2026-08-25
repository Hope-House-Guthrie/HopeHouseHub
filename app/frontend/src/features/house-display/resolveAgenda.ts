/**
 * STATUS — resolve schedule SOURCES → today's TV agenda (pure)
 * Branch: feature/house-display
 *
 * DONE: resolveAgendaForDate, cancel/override paths, stable seriesId:dateYmd ids,
 * keep overlaps, sort by startMin. No React/Redux.
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
* (defaults from dateYmd).
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

    if (kind === "cancel") {
      out.push({
        id: recurringOccurrenceId(series.id, dateYmd),
        title: series.title,
        startMin: series.startMin,
        endMin: series.endMin,
        canceled: true,
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
      });
      continue;
    }

    out.push({
      id: recurringOccurrenceId(series.id, dateYmd),
      title: series.title,
      startMin: series.startMin,
      endMin: series.endMin,
      canceled: false,
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
