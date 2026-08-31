/**
 * House Display - birthday source + pure TV view select (no React/Redux).
 * HD consumes client-shaped people; does not own birthday CRUD or storage.
 * Match month/day from Hope House Chicago dateKey only - never bare local Date.
 * TV-facing rows: id + displayName + month/day only (no birth year, no age).
 */

/** Client-shaped birthday source row (mock now; intake/cirrent-client later). */
export interface HouseDisplayBirthdayPerson {
  id: string;
  displayName: string;
  /** Calendar month 1-12 (not JS 0-11) */
  birthMonth: number;
  /** Calendar day 1-31 */
  birthDay: number;
}

/**
 * One row safe to paint on TV (no year/age).
 * monthItems and todayItems share this shape for simple list rendering.
 */
export interface HouseDisplayBirthdayListItem {
  id: string;
  displayName: string;
  birthMonth: number;
  birthDay: number;
}

/** Derived view only - never store this on Redux / HouseDisplayContent. */
export interface HouseDisplayBirthdayView {
  monthItems: HouseDisplayBirthdayListItem[];
  todayItems: HouseDisplayBirthdayListItem[];
}

/** Chicago civil month/day from YYYY-MM-DD dateKey. Invalid -> null. */
export function monthDayFromDateKey(
  dateKey: string,
): { month: number; day: number } | null {
  const parts = dateKey.split("-");
  if (parts.length !== 3) return null;
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }
  return { month, day };
}

function isValidPerson(p: HouseDisplayBirthdayPerson): boolean {
  return (
    typeof p.id === "string" &&
    p.id.trim().length > 0 &&
    typeof p.displayName === "string" &&
    p.displayName.trim().length > 0 &&
    Number.isInteger(p.birthMonth) &&
    p.birthMonth >= 1 &&
    p.birthMonth <= 12 &&
    Number.isInteger(p.birthDay) &&
    p.birthDay >= 1 &&
    p.birthDay <= 31
  );
}

function toListItem(
  p: HouseDisplayBirthdayPerson,
): HouseDisplayBirthdayListItem {
  return {
    id: p.id,
    displayName: p.displayName.trim(),
    birthMonth: p.birthMonth,
    birthDay: p.birthDay,
  };
}

/** day ASC, then displayName ASC (deterministic). */
function compareMonthItem(
  a: HouseDisplayBirthdayListItem,
  b: HouseDisplayBirthdayListItem,
): number {
  if (a.birthDay !== b.birthDay) return a.birthDay - b.birthDay;
  return a.displayName.localeCompare(b.displayName);
}

/** Same calendar day: displayName ASC only. */
function compareTodayItem(
  a: HouseDisplayBirthdayListItem,
  b: HouseDisplayBirthdayListItem,
): number {
  return a.displayName.localeCompare(b.displayName);
}

/**
 * Build monthly + today lists from people + Hope House dateKey (YYYY-MM-DD).
 * todayItems ⊆ monthItems by definition when dateKey is valid.
 * Invalid dateKey -> both lists empty (caller keeps UI quiet).
 */
export function selectBirthdayView(args: {
  people: readonly HouseDisplayBirthdayPerson[];
  dateKey: string;
}): HouseDisplayBirthdayView {
  const { people, dateKey } = args;
  const md = monthDayFromDateKey(dateKey);
  if (md == null) {
    return { monthItems: [], todayItems: [] };
  }

  const monthItems: HouseDisplayBirthdayListItem[] = [];
  const todayItems: HouseDisplayBirthdayListItem[] = [];

  for (const person of people) {
    if (!isValidPerson(person)) continue;
    if (person.birthMonth !== md.month) continue;

    const item = toListItem(person);
    monthItems.push(item);
    if (person.birthDay === md.day) todayItems.push(item);
  }

  monthItems.sort(compareMonthItem);
  todayItems.sort(compareTodayItem);

  return { monthItems, todayItems };
}
