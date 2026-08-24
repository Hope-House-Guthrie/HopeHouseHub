/**
 * House Display - shared types (FE mock)
 * Used by: store slice, TV page, manage page.
 * No React here.
 */

/** Client-only display copy until backend exists. */
export interface HouseDisplayContent {
  /** Large centerd line on the TV route. */
  headline: string;
  /**Secondary line under the headlines. */
  subtext: string;
}

export interface HouseDisplayState {
  content: HouseDisplayContent;
}
