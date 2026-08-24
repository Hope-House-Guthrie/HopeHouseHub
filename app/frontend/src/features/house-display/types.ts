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
 * One agenda block on the proportional timeline.
 * Duration = endMin - startMin (must be > 0).
 */
export interface HouseDisplayAgendaItem {
  id: string;
  title: string;
  /** Minutes from midnight, e.g. 1:00 PM → 780 */
  startMin: number;
  /** Minutes from midnight, e.g. 2:00 PM → 840 */
  endMin: number;
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
  agendaItems: HouseDisplayAgendaItem[];
  upcomingItems: HouseDisplayUpcomingItem[];
  affirmationText: string;
  announcements: HouseDisplayAnnouncement[];
  birthday: HouseDisplayBirthday;
}

export interface HouseDisplayState {
  content: HouseDisplayContent;
}
