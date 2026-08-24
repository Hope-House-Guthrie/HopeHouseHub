/**
 * House Display — Hope House wall time (pure, no React).
 * All display clock/date/nowMin use America/Chicago explicitly.
 * Instant comes from the caller (usually useHopeHouseNow); do not
 * scatter bare getHours() / local TZ on the TV page.
 */

/** Hope House Guthrie — never rely on the mini PC OS timezone alone. */
export const HOPE_HOUSE_TZ = "America/Chicago";

/** One snapshot of "now" for header + agenda states + NOW line. */
export interface HopeHouseNow {
  /** Source instant (device clock). */
  instant: Date;
  /** Minutes from Chicago midnight (0-1439 typical). */
  nowMin: number;
  /** 12h clock, no seconds - e.g. "3:47 PM". */
  clockText: string;
  /** TV-friendly date - e.g. "Monday, August 24". */
  dateText: string;
  /** Chicago calendar day YYYY-MM-DD (midnight / later features). */
  dateKey: string;
}

/**
 * Read hour (0-23) and minute in Hope House TZ via Intl parts.
 * Avoids Date#getHours() (browser local TZ).
 */
export function getChicagoHourMinute(instant: Date): {
  hour24: number;
  minute: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: HOPE_HOUSE_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);

  let hour24 = 0;
  let minute = 0;
  for (const p of parts) {
    if (p.type === "hour") hour24 = Number(p.value);
    if (p.type === "minute") minute = Number(p.value);
  }
  return { hour24, minute };
}

/** Minutes from Chicago midnight for agenda math. */
export function getChicagoNowMin(instant: Date): number {
  const { hour24, minute } = getChicagoHourMinute(instant);
  return hour24 * 60 + minute;
}

/** e.g. "3:47 PM" - no seconds. */
export function formatHopeHouseClock(instant: Date): string {
  return instant.toLocaleTimeString("en-US", {
    timeZone: HOPE_HOUSE_TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** e.g. "Monday, August 24". */
export function formatHopeHouseDate(instant: Date): string {
  return instant.toLocaleDateString("en-US", {
    timeZone: HOPE_HOUSE_TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Chicago calendar day as YYYY-MM-DD. */
export function formatHopeHouseDateKey(instant: Date): string {
  // en-CA gives ISO-like YYYY-MM-DD with timezine option
  return instant.toLocaleDateString("en-CA", {
    timeZone: HOPE_HOUSE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Build the single authoritative Hope House "now" snapshot.
 * Pass the same Date the TV tick holds - do not call new Date()
 * separately for clock vs nowMin on the page.
 */
export function getHopeHouseNow(instant: Date = new Date()): HopeHouseNow {
  return {
    instant,
    nowMin: getChicagoNowMin(instant),
    clockText: formatHopeHouseClock(instant),
    dateText: formatHopeHouseDate(instant),
    dateKey: formatHopeHouseDateKey(instant),
  };
}
