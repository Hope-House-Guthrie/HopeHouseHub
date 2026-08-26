/**
 * House Display — shared types (FE mock)
 * Used by: store slice, TV page, manage page.
 * No React here.
 *
 * TV layout regions:
 * header → agenda timeline → upcoming → lower band
 * (affirmation | announcements + birthday)
 *
 * Schedule SOURCES live on HouseDisplayState.schedule (see scheduleTypes).
 * TV only paints content.agendaItems (resolved occurrences for the day).
 * S1: cancel one day via exceptions; S2: Add/Edit/End Class on sources.
 */

import type { HouseDisplayScheduleSources } from "./scheduleTypes";

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
 * Resolved arrival for one agenda block (derived from schedule sources).
 * sourceType distinguishes recurring class vs one-time event.
 */
export type HouseDisplayAgendaSourceType = "recurring" | "oneTime";

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
  /** Explicit source identity (recurring series or one-time event). */
  sourceType: HouseDisplayAgendaSourceType;
  /** Optional location where the event takes place */
  location?: string;
  /** Optional facilitator name for this event */
  facilitator?: string;
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

/** Spotlight slide kind for the right ~40% House Spotlight region. */
export type HouseDisplaySpotlightKind = "card" | "flyer";

/**
 * Pin policy for one Spotlight item.
 * "none" = not pinned (normal rotation pool later).
 * Non-"none" = owns the region (Priority 1). Real day-rollover / unpin later.
 * pinMode is the only pin flag - do not add a separate pinned boolean.
 */
export type HouseDisplaySpotlightPinMode =
  | "none"
  | "end_of_today"
  | "until_unpinned";

/**
 * One House Spotlight item (TV shows at most one at a time).
 * card = Hub text layout; flyer = full-image with object-fit contain.
 * Empty strings are fine for fields the kind does not use.
 */
export interface HouseDisplaySpotlightItem {
  id: string;
  kind: HouseDisplaySpotlightKind;
  /** Lower sorts first in normal order / pin tie-break. */
  sortOrder: number;
  /** false = stored but not in the display pool. */
  active: boolean;
  /**
   * Pin ownership + future expiration flavor.
   * pinned ⇔ pinMode !== "none"
   */
  pinMode: HouseDisplaySpotlightPinMode;
  /** Card title; flyer may reuse as label/alt fallback. */
  title: string;
  /** Card subtitle/date line; "" when unused. */
  subtitle: string;
  /** Card body message; "" when unused. */
  message: string;
  /** Flyer public path or URL; "" for cards. */
  imageUrl: string;
  /** Flyer alt text; "" ok - UI may fall back to title. */
  imageAlt: string;
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
  /** Right ~40% House Spotlight slides (one shown at a time on TV). */
  spotlightItems: HouseDisplaySpotlightItem[];
  upcomingItems: HouseDisplayUpcomingItem[];
  affirmationText: string;
  announcements: HouseDisplayAnnouncement[];
  birthday: HouseDisplayBirthday;
}

export interface HouseDisplayState {
  /**
   * Schedule SOURCE of truth (admin / resolve input).
   * TV must not read this — only content.agendaItems.
   */
  schedule: HouseDisplayScheduleSources;
  content: HouseDisplayContent;
}
