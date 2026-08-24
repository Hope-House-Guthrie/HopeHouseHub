/**
 * House Display — shared types (FE mock)
 * Used by: store slice, TV page, manage page.
 * No React here.
 *
 * TV layout regions (later):
 * header → agenda → upcoming → lower band
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

/** One agenda row (mock; now/past logic yet). */
export interface HouseDisplayAgendaItem {
  id: string;
  /** Display time only, e.g. "8:00 AM" */
  timeLabel: string;
  title: string;
}

/** Thin "up next" strip item (static mock). */
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

/** Birthday corner (calculations/effect later). */
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
  agendaItems: HouseDisplayAgendaItem[];
  upcomingItems: HouseDisplayUpcomingItem[];
  affirmationText: string;
  announcements: HouseDisplayAnnouncement[];
  birthday: HouseDisplayBirthday;
}

export interface HouseDisplayState {
  content: HouseDisplayContent;
}
