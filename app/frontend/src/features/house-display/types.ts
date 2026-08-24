/**
 * House Display — shared types (FE mock)
 * Used by: store slice, TV page, manage page.
 * No React here.
 *
 * TV layout regions:
 * header → agenda timeline → upcoming → lower band
 * (affirmation | announcements + birthday)
 */

/** Static header placeholders until live clock/weather. */
export interface HouseDisplayHeader {
  /** Left identity text (logo image later). */
  identityLabel: string;
  /** Static clock string for layout only (e.g. "3:45 PM"). */
  clockText: string;
  /** Static date string (e.g. "Sun, Aug 23"). */
  dateText: string;
  /** Static weather string (e.g. "82° Clear"). */
  weatherText: string;
}

/**
 * Visible day-planner window on the TV (minutes from local midnight).
 * Event blocks are positioned as % of this span.
 */
export interface HouseDisplayTimelineWindow {
  /** Inclusive start, e.g. 7:00 AM → 420 */
  windowStartMin: number;
  /** Exclusive-ish end bound for layout, e.g. 9:00 PM → 1260 */
  windowEndMin: number;
}

/**
 * Visual state for one timeline block (derived at render time - not stored).
 * canceled always wins over time-based states
 */
export type HouseDisplayEventVisualState =
  | "upcoming"
  | "happening"
  | "past"
  | "canceled";

/**
 * One agenda block on today's proportional timeline.
 * This is a resolved occurrence for the board (not a recurring rule definition).
 * Duration = endMin - startMin (must be > 0).
 *
 * Cancel = keep on board with canceled: true (not the same as remove/delete).
 * Remove = omit from agendaItems entirely.
 */
export interface HouseDisplayAgendaItem {
  id: string;
  title: string;
  /** Minutes from midnight, e.g. 1:00 PM -> 780 */
  startMin: number;
  /** Minutes from midnight, e.g. 2:00 PM -> 840 */
  endMin: number;
  /**
   * Required. true = show in place as CANCELED; never "happening".
   * Normal occurrences use false.
   */
  canceled: boolean;
}

/** Thin "up next" strip item (static mock until derived from agenda + now). */
export interface HouseDisplayUpcomingItem {
  id: string;
  timeLabel: string;
  title: string;
}

/** One announcement line (rotation later). */
export interface HouseDisplayAnnouncement {
  id: string;
  text: string;
}

/** Birthday corner (calculations/effects later). */
export interface HouseDisplayBirthday {
  name: string;
  /** Human date label, e.g. "Thu, Aug 27". */
  dateLabel: string;
}

/**
 * Full client-only TV content tree.
 * Backend will populate this later.
 */
export interface HouseDisplayContent {
  header: HouseDisplayHeader;
  /** Day window for proportional agenda layout. */
  timeline: HouseDisplayTimelineWindow;
  /**
   * FE/DEV only: "current" minutes - from- midnight for the Past / Happening / Upcoming.
   * Temporary stand-in until live clock; keep aligned with header.clockText in seed.
   * Not a backend field long-term.
   */
  mockNowMin: number;
  agendaItems: HouseDisplayAgendaItem[];
  upcomingItems: HouseDisplayUpcomingItem[];
  affirmationText: string;
  announcements: HouseDisplayAnnouncement[];
  birthday: HouseDisplayBirthday;
}

export interface HouseDisplayState {
  content: HouseDisplayContent;
}
