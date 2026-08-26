/**
 * STATUS — schedule SOURCE models (admin / resolve input)
 * Branch: feature/house-display
 *
 * Recurring / one-time / exceptions only. Not TV paint types.
 * Pipeline: sources → resolveAgendaForDate → HouseDisplayAgendaItem[] → TV
 */

/** 0 = Sunday ... 6 = Saturday */
export type HouseDisplayWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Recurring class/program definition (series).
 * active false = End Class (no future occurrences); series row kept for history.
 * Cancel-one-day is NOT this field - use occurrence exceptions.
 */
export interface HouseDisplayRecurringEvent {
  id: string;
  title: string;
  /** Minutes from midnight, e.g. 1:00 PM -> 780 */
  startMin: number;
  /** Minutes from midnight; must be > startMin */
  endMin: number;
  /**
   * One or more weekdays this class runs.
   * "Every day" UI later = [0,1,2,3,4,5,6] stored explicitly.
   */
  daysOfWeek: HouseDisplayWeekday[];
  /**
   * true = generate occurrences on matching days.
   * false = End Class (staff wording); do not generate.
   */
  active: boolean;
  /** Optional location where the event takes place (Living Room, Back House, etc.) */
  location?: string;
  /** Optional facilitator name for this event */
  facilitator?: string;
}

/**
 * Single-day schedule item (guest speaker, special meeting, etc.).
 * Not a series. Cancel today = canceled true on this row (not an exception).
 */
export interface HouseDisplayOneTimeEvent {
  id: string;
  title: string;
  /** Hope House calendar day YYYY-MM-DD (America/Chicago). */
  dateYmd: string;
  startMin: number;
  endMin: number;
  /** false = hidden from resolve (parked / soft off). */
  active: boolean;
  /** true = show on TV that day with CANCELED treatment. */
  canceled: boolean;
  /** Optional location where the event takes place */
  location?: string;
  /** Optional facilitator name for this event */
  facilitator?: string;
}

/**
 * Exception against one recurring series on one Chicago date.
 * cancel = this day only CANCELED on TV (still visible).
 * suppress = Replace/Hide for this date — omit occurrence entirely (not CANCELED).
 * override = edit-this-occurrence later (fields optional; unused in s1 UI).
 * Never End Class / Delete series.
 */
export type HouseDisplayExceptionKind = "cancel" | "suppress" | "override";

export interface HouseDisplayOccurrenceException {
  id: string;
  /** Recurring series this exception applies to */
  seriesId: string;
  /** Hope House calendar day YYYY-MM-DD */
  dateYmd: string;
  kind: HouseDisplayExceptionKind;
  /** override only (S3); ignore for cancel/suppress */
  title?: string;
  startMin?: number;
  endMin?: number;
  /**
   * One-time event that caused this suppression, if any.
   * Enables safe removal when that source event is later edited.
   * Staff cancel/manual suppress entries leave this undefined.
   */
  sourceOneTimeEventId?: string;
}

/**
 * Full schedule source bag (Redux / future API).
 * Resolver reads this; TV does not.
 */
export interface HouseDisplayScheduleSources {
  recurring: HouseDisplayRecurringEvent[];
  oneTime: HouseDisplayOneTimeEvent[];
  exceptions: HouseDisplayOccurrenceException[];
}
