/**
 * STATUS — initial confirmed recurring schedule seed (FE mock)
 * Branch: feature/house-display
 *
 * Managed records for resolveAgendaForDate — not TV hard-codes.
 * S2 Add/Edit/End Class will change schedule without editing this long-term.
 * No unconfirmed Tue 7–8 PM class. Wed Men's + Women's NA both kept.
 */

import type {
  HouseDisplayRecurringEvent,
  HouseDisplayScheduleSources,
} from "./scheduleTypes";

/** Confirmed recurring classes — all active. */
export const INITIAL_RECURRING_SCHEDULE: HouseDisplayRecurringEvent[] = [
  {
    id: "i-matter",
    title: "I Matter!",
    startMin: 10 * 60, // 10:00 AM
    endMin: 11 * 60, // 11:00 AM
    daysOfWeek: [2, 3, 4, 5], // Tue Wed Thu Fri
    active: true,
  },
  {
    id: "tech-quest",
    title: "Tech Quest",
    startMin: 13 * 60, // 1:00 PM
    endMin: 14 * 60, // 2:00 PM
    daysOfWeek: [2], // Tue
    active: true,
  },
  {
    id: "dbsa-wellness",
    title: "DBSA Wellness",
    startMin: 13 * 60, // 13:00 PM
    endMin: 14 * 60, // 14:00 PM
    daysOfWeek: [4], // Thu
    active: true,
  },
  {
    id: "dbsa-support",
    title: "DBSA Support",
    startMin: 13 * 60, // 13:00 PM
    endMin: 14 * 60, // 14:00 PM
    daysOfWeek: [5], // Fri
    active: true,
  },
  {
    id: "main-na",
    title: "Main NA — “The Living Room”",
    startMin: 19 * 60, // 7:00 PM
    endMin: 20 * 60, // 8:00 PM
    daysOfWeek: [1, 4], // Monday, Thursday
    active: true,
  },
  {
    id: "mens-na",
    title: "Men's NA",
    startMin: 19 * 60, // 7:00 PM
    endMin: 20 * 60, // 8:00 PM
    daysOfWeek: [3], // Wednesday
    active: true,
  },
  {
    id: "womens-na",
    title: "Women's NA",
    startMin: 19 * 60, // 7:00 PM
    endMin: 20 * 60, // 8:00 PM
    daysOfWeek: [3], // Wednesday
    active: true,
  },
  {
    id: "game-night",
    title: "Game Night",
    startMin: 19 * 60, // 7:00 PM
    endMin: 20 * 60, // 8:00 PM
    daysOfWeek: [5], // Friday
    active: true,
  },
];

/**
 * Full source bag for the slice (Step 4+).
 * oneTime / exceptions empty until S1 cancel UI / S2 one-time add.
 */
export const INITIAL_SCHEDULE_SOURCES: HouseDisplayScheduleSources = {
  recurring: INITIAL_RECURRING_SCHEDULE,
  oneTime: [],
  exceptions: [],
};
