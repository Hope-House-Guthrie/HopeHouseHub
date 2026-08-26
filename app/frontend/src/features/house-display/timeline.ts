/**
 * House Display timeline math (pure, no React).
 * Proportional day-planner: event top/height as % of visible window.
 * NOW line geometry: nowLineLayout (hide outside window; no clamp lie).
 */

import type {
  HouseDisplayAgendaItem,
  HouseDisplayEventVisualState,
  HouseDisplayTimelineWindow,
} from "./types";

/** Default Hope House wall board: 7:00 AM – 9:00 PM (14h). */
export const DEFAULT_TIMELINE_WINDOW: HouseDisplayTimelineWindow = {
  windowStartMin: 7 * 60,
  windowEndMin: 21 * 60,
};

/** Clamp a number into [lo, hi]. */
export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/**
 * Derive TV visual state for one resolved occurrence.
 * canceled always wins — never "happening" while canceled.
 * Time rules use [startMin, endMin): at exact end → past.
 *
 * nowMin = minutes from Chicago midnight (from useHopeHouseNow / getHopeHouseNow).
 */
export function resolveEventVisualState(
  item: Pick<HouseDisplayAgendaItem, "startMin" | "endMin" | "canceled">,
  nowMin: number,
): HouseDisplayEventVisualState {
  if (item.canceled) return "canceled";
  if (nowMin < item.startMin) return "upcoming";
  if (nowMin < item.endMin) return "happening";
  return "past";
}

/**
 * Format minutes-from-midnight as a short 12h label (e.g. 780 → "1:00 PM").
 * Display only — storage stays numeric.
 */
export function formatTimeLabel(minFromMidnight: number): string {
  const normalized =
    ((Math.round(minFromMidnight) % (24 * 60)) + 24 * 60) % (24 * 60);
  let hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  hour24 = hour24 % 12;
  if (hour24 === 0) hour24 = 12;
  const mm = minute.toString().padStart(2, "0");
  return `${hour24}:${mm} ${ampm}`;
}

export function timelineSpanMin(window: HouseDisplayTimelineWindow): number {
  return Math.max(1, window.windowEndMin - window.windowStartMin);
}

/**
 * Convert absolute minutes-from-midnight into 0–100% down the track.
 * Values outside the window clamp to edges.
 */
export function minToPercent(
  minFromMidnight: number,
  window: HouseDisplayTimelineWindow,
): number {
  const span = timelineSpanMin(window);
  const raw = ((minFromMidnight - window.windowStartMin) / span) * 100;
  return clamp(raw, 0, 100);
}

/**
 * Proportional NOW marker on the day track.
 * Returns null when now is outside the visible window — do NOT clamp
 * to 0%/100% (that would fake 7:00 AM or 9:00 PM).
 * Inclusive start, exclusive end: [windowStartMin, windowEndMin).
 */
export function nowLineLayout(
  nowMin: number,
  window: HouseDisplayTimelineWindow,
): { topPct: number } | null {
  if (nowMin < window.windowStartMin || nowMin >= window.windowEndMin) {
    return null;
  }
  const span = timelineSpanMin(window);
  const topPct = ((nowMin - window.windowStartMin) / span) * 100;
  return { topPct };
}

export interface TimelineBlockLayout {
  id: string;
  title: string;
  startMin: number;
  endMin: number;
  /** CSS top as percent of track */
  topPct: number;
  /** CSS height as percent of track */
  heightPct: number;
  startLabel: string;
  endLabel: string;
  durationMin: number;
  /** Optional location metadata for display */
  location?: string;
  /** Optional facilitator metadata for display */
  facilitator?: string;
}

/**
 * Layout one event inside the window.
 * Clips to window; zero/negative duration after clip → null (skip).
 */
export function layoutAgendaItem(
  item: HouseDisplayAgendaItem,
  window: HouseDisplayTimelineWindow,
): TimelineBlockLayout | null {
  const start = clamp(
    item.startMin,
    window.windowStartMin,
    window.windowEndMin,
  );
  const end = clamp(item.endMin, window.windowStartMin, window.windowEndMin);
  if (end <= start) return null;

  const topPct = minToPercent(start, window);
  const bottomPct = minToPercent(end, window);
  const heightPct = Math.max(bottomPct - topPct, 0);
  if (heightPct <= 0) return null;

  return {
    id: item.id,
    title: item.title,
    startMin: item.startMin,
    endMin: item.endMin,
    topPct,
    heightPct,
    startLabel: formatTimeLabel(item.startMin),
    endLabel: formatTimeLabel(item.endMin),
    durationMin: item.endMin - item.startMin,
    location: item.location,
    facilitator: item.facilitator,
  };
}

export function layoutAgendaItems(
  items: HouseDisplayAgendaItem[],
  window: HouseDisplayTimelineWindow,
): TimelineBlockLayout[] {
  return items
    .map((item) => layoutAgendaItem(item, window))
    .filter((b): b is TimelineBlockLayout => b != null)
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
}

/** Hour tick marks (and labels) across the window. */
export interface TimelineHourMark {
  min: number;
  label: string;
  topPct: number;
}

export function hourMarks(
  window: HouseDisplayTimelineWindow,
): TimelineHourMark[] {
  const marks: TimelineHourMark[] = [];
  // First whole hour at or after window start
  let t = Math.ceil(window.windowStartMin / 60) * 60;
  if (t === window.windowStartMin) {
    // include start hour
  }
  // Always include window start if not on the hour? Prefer whole hours only.
  t = Math.ceil(window.windowStartMin / 60) * 60;
  for (; t <= window.windowEndMin; t += 60) {
    marks.push({
      min: t,
      label: formatTimeLabel(t),
      topPct: minToPercent(t, window),
    });
  }
  return marks;
}
