/**
 * House Display timeline math (pure, no React).
 * Proportional day-planner: event top/height as % of visible window.
 * NOW line geometry: nowLineLayout (hide outside window; no clamp lie).
 * Day window follows Hope House weekday hours (not a fixed 7am–9pm board).
 */

import type {
  HouseDisplayAgendaItem,
  HouseDisplayEventVisualState,
  HouseDisplayTimelineWindow,
} from "./types";
import type { HouseDisplayWeekday } from "./scheduleTypes";

/**
 * Default fallback window (Mon–Thu shape): 8:00 AM – 10:00 PM.
 * Prefer timelineWindowForWeekday(weekday) for live TV / resolve.
 */
export const DEFAULT_TIMELINE_WINDOW: HouseDisplayTimelineWindow = {
  windowStartMin: 8 * 60,
  windowEndMin: 22 * 60,
};

/**
 * Hope House wall-board hours by Chicago weekday (0=Sun … 6=Sat).
 *
 * Start: Mon–Fri 8:00 AM; Sat–Sun 10:00 AM
 * End:   Sun–Thu 10:00 PM; Fri–Sat 11:00 PM
 *
 * → Mon–Thu 8–10p | Fri 8–11p | Sat 10a–11p | Sun 10a–10p
 */
export function timelineWindowForWeekday(
  weekday: HouseDisplayWeekday | number,
): HouseDisplayTimelineWindow {
  const d = Number(weekday);
  const isWeekendStart = d === 0 || d === 6; // Sun, Sat
  const isLateClose = d === 5 || d === 6; // Fri, Sat

  return {
    windowStartMin: isWeekendStart ? 10 * 60 : 8 * 60,
    windowEndMin: isLateClose ? 23 * 60 : 22 * 60,
  };
}

/** Roll Call length on the TV board (minutes). Opening marker only — not a long class. */
export const ROLL_CALL_DURATION_MIN = 10;

/**
 * Synthetic Roll Call occurrence for one Chicago day.
 * Starts at the displayed day open (same as timelineWindowForWeekday start).
 * Not a staff-managed series — generated for the board each resolve.
 * Callers should pass weekday (resolveAgenda always does).
 */
export function buildRollCallAgendaItem(
  dateYmd: string,
  weekday: HouseDisplayWeekday | number = 0,
): HouseDisplayAgendaItem {
  const window = timelineWindowForWeekday(weekday);
  const startMin = window.windowStartMin;
  return {
    id: `roll-call:${dateYmd}`,
    title: "Roll Call",
    startMin,
    endMin: startMin + ROLL_CALL_DURATION_MIN,
    canceled: false,
    sourceType: "oneTime",
    location: undefined,
    facilitator: undefined,
    logoKey: null,
  };
}

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
 * to 0%/100% (that would fake window open/close).
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
  /** Left position as percent (0 = full left edge) */
  leftPct: number;
  /** Width as percent of track (100 = full width) */
  widthPct: number;
  /** Column index (0-based) when events overlap */
  columnIndex: number;
  /** Total columns this event spans (always 1 in current implementation) */
  columnSpan: number;
  startLabel: string;
  endLabel: string;
  durationMin: number;
  /** Optional location metadata for display */
  location?: string;
  /** Optional facilitator metadata for display */
  facilitator?: string;
}

/**
 * Check if two time ranges overlap.
 * Events [aStart, aEnd) and [bStart, bEnd) overlap if:
 *   aStart < bEnd AND bStart < aEnd
 */
export function eventsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Prune ended events from a column's active list.
 * An event is "ended" relative to the current event if it ends at or before the current event starts.
 */
export function pruneEndedEvents(
  activeEvents: Array<{ startMin: number; endMin: number; id: string }>,
  currentEventStart: number,
): void {
  let i = 0;
  while (i < activeEvents.length) {
    if (activeEvents[i]!.endMin <= currentEventStart) {
      activeEvents.splice(i, 1);
    } else {
      i++;
    }
  }
}

/**
 * Assign columns to events to resolve time overlaps.
 * Uses a sweep-line approach:
 * - Each column tracks which events are currently active
 * - Before assigning, prune ended events from each column
 * - An event can go in column N if no active events in that column overlap with it
 */
export function assignColumns(
  events: Array<{ id: string; startMin: number; endMin: number }>,
): Map<string, { columnIndex: number; columnSpan: number }> {
  const assignments = new Map<string, { columnIndex: number; columnSpan: number }>();

  if (events.length === 0) {
    return assignments;
  }

  // Sort by start time, then end time, then id for deterministic ordering
  const sorted = [...events].sort((a, b) => {
    if (a.startMin !== b.startMin) return a.startMin - b.startMin;
    if (a.endMin !== b.endMin) return a.endMin - b.endMin;
    return a.id < b.id ? -1 : 1;
  });

  // columns[i] = array of active events in that column
  // Each entry: { startMin, endMin, id }
  const columns: Array<Array<{ startMin: number; endMin: number; id: string }>> = [];

  for (const event of sorted) {
    let assignedColumn = -1;

    // First, prune ended events from all columns (they can't cause overlap)
    for (let colIdx = 0; colIdx < columns.length; colIdx++) {
      const colEvents = columns[colIdx];
      if (colEvents) {
        pruneEndedEvents(colEvents, event.startMin);
      }
    }

    // Check each column to find one where this event doesn't overlap any active event
    for (let colIdx = 0; colIdx < columns.length; colIdx++) {
      const colEvents = columns[colIdx];
      if (!colEvents) continue;
      
      let hasConflict = false;

      for (const existing of colEvents) {
        // Check if event [event.startMin, event.endMin) overlaps with existing
        if (eventsOverlap(event.startMin, event.endMin, existing.startMin, existing.endMin)) {
          hasConflict = true;
          break;
        }
      }

      if (!hasConflict) {
        // This column is free - we can place the event here
        assignedColumn = colIdx;
        break;
      }
    }

    // No column available - create new one
    if (assignedColumn === -1) {
      assignedColumn = columns.length;
      columns[assignedColumn] = [];
    }

    // Add event to the column
    columns[assignedColumn]!.push({
      startMin: event.startMin,
      endMin: event.endMin,
      id: event.id,
    });

    // Record assignment
    assignments.set(event.id, {
      columnIndex: assignedColumn,
      columnSpan: 1,
    });
  }

  return assignments;
}

/**
 * Layout one event inside the window.
 * Clips to window; zero/negative duration after clip → null (skip).
 */
export function layoutAgendaItem(
  item: HouseDisplayAgendaItem,
  window: HouseDisplayTimelineWindow,
  columnIndex: number = 0,
  columnSpan: number = 1,
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

  // Calculate left and width based on column assignment
  const leftPct = (columnIndex / columnSpan) * 100;
  const widthPct = (1 / columnSpan) * 100;

  return {
    id: item.id,
    title: item.title,
    startMin: item.startMin,
    endMin: item.endMin,
    topPct,
    heightPct,
    leftPct,
    widthPct,
    columnIndex,
    columnSpan,
    startLabel: formatTimeLabel(item.startMin),
    endLabel: formatTimeLabel(item.endMin),
    durationMin: item.endMin - item.startMin,
    location: item.location,
    facilitator: item.facilitator,
  };
}

/**
 * Layout all agenda items with column-based overlap resolution.
 * Events that overlap get placed in different columns and share width.
 */
export function layoutAgendaItems(
  items: HouseDisplayAgendaItem[],
  window: HouseDisplayTimelineWindow,
): TimelineBlockLayout[] {
  // First, create basic layout objects (without column info)
  const basicLayouts: TimelineBlockLayout[] = [];

  for (const item of items) {
    const start = clamp(item.startMin, window.windowStartMin, window.windowEndMin);
    const end = clamp(item.endMin, window.windowStartMin, window.windowEndMin);
    if (end <= start) continue;

    const topPct = minToPercent(start, window);
    const bottomPct = minToPercent(end, window);
    const heightPct = Math.max(bottomPct - topPct, 0);
    if (heightPct <= 0) continue;

    basicLayouts.push({
      id: item.id,
      title: item.title,
      startMin: item.startMin,
      endMin: item.endMin,
      topPct,
      heightPct,
      leftPct: 0,
      widthPct: 100,
      columnIndex: 0,
      columnSpan: 1,
      startLabel: formatTimeLabel(item.startMin),
      endLabel: formatTimeLabel(item.endMin),
      durationMin: item.endMin - item.startMin,
      location: item.location,
      facilitator: item.facilitator,
    });
  }

  // Sort by start time, then end time, then id
  basicLayouts.sort((a, b) => {
    if (a.startMin !== b.startMin) return a.startMin - b.startMin;
    if (a.endMin !== b.endMin) return a.endMin - b.endMin;
    return a.id < b.id ? -1 : 1;
  });

  // If no items, return early
  if (basicLayouts.length === 0) {
    return [];
  }

  // Assign columns to resolve overlaps
  const events = basicLayouts.map((l) => ({
    id: l.id,
    startMin: l.startMin,
    endMin: l.endMin,
  }));

  const assignments = assignColumns(events);

  // Apply column assignments first (preserve existing semantics).
  for (const layout of basicLayouts) {
    const assignment = assignments.get(layout.id);
    if (assignment) {
      layout.columnIndex = assignment.columnIndex;
      layout.columnSpan = assignment.columnSpan;
    }
  }

  // Group connected overlap clusters (transitive overlaps, so A–B–C where B
  // bridges A and C forms one cluster). Width/left then use each cluster's own
  // column count — not a single day-global total — so unrelated overlap
  // clusters elsewhere in the day never shrink one another.
  const clusterOf = new Map<string, number>();
  let clusterCount = 0;
  for (const seed of basicLayouts) {
    if (clusterOf.has(seed.id)) continue;
    const queue = [seed];
    clusterOf.set(seed.id, clusterCount);
    while (queue.length > 0) {
      const cur = queue.shift()!;
      for (const other of basicLayouts) {
        if (clusterOf.has(other.id)) continue;
        if (
          eventsOverlap(
            cur.startMin,
            cur.endMin,
            other.startMin,
            other.endMin,
          )
        ) {
          clusterOf.set(other.id, clusterCount);
          queue.push(other);
        }
      }
    }
    clusterCount++;
  }

  // Required columns per cluster = max assigned column + 1. The sweep gives
  // every mutually-overlapping event a distinct column and creates columns
  // contiguously from 0, so all columns 0..max are used within one cluster.
  const clusterColumns = new Map<number, number>();
  for (const layout of basicLayouts) {
    const c = clusterOf.get(layout.id)!;
    clusterColumns.set(c, Math.max(clusterColumns.get(c) ?? 0, layout.columnIndex + 1));
  }

  // Calculate left and width from the local cluster column count.
  for (const layout of basicLayouts) {
    const cols = clusterColumns.get(clusterOf.get(layout.id)!)!;
    layout.leftPct = (layout.columnIndex / cols) * 100;
    layout.widthPct = (1 / cols) * 100;
  }

  return basicLayouts;
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