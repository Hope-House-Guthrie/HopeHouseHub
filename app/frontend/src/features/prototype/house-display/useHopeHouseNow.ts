/**
 * House Display — single live Hope House "now" for the TV page.
 * Minute-aligned tick + visibilitychange resync after sleep/throttle.
 * Returns one snapshot: header clock/date, agenda nowMin, NOW line.
 */

import { useEffect, useState } from "react";
import { getHopeHouseNow, type HopeHouseNow } from "./time";

/** Ms until the next clock minute boundary (device clock). */
function msUntilNextMinute(fromMs: number = Date.now()): number {
  const ms = fromMs % 60_000;
  // At exact boundary, wait a full minute (avoid 0 → tight loop)
  return ms === 0 ? 60_000 : 60_000 - ms;
}

/**
 * Authoritative Hope House now for House Display TV.
 * Do not also call getHopeHouseNow() separately on the page for header vs states.
 */
export function useHopeHouseNow(): HopeHouseNow {
  const [snapshot, setSnapshot] = useState<HopeHouseNow>(() =>
    getHopeHouseNow(new Date())
  );

  useEffect(() => {
    let intervalId: number | undefined;
    let timeoutId: number | undefined;

    const tick = () => {
      setSnapshot(getHopeHouseNow(new Date()));
    };

    const startMinuteInterval = () => {
      if (intervalId != null) {
        window.clearInterval(intervalId);
      }
      intervalId = window.setInterval(tick, 60_000);
    };

    // Align first cadence to the next minute, then every 60s
    timeoutId = window.setTimeout(() => {
      tick();
      startMinuteInterval();
    }, msUntilNextMinute());

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        tick();
        // Re-align after wake (interval may have drifted / been throttled)
        if (timeoutId != null) {
          window.clearTimeout(timeoutId);
        }
        if (intervalId != null) {
          window.clearInterval(intervalId);
          intervalId = undefined;
        }
        timeoutId = window.setTimeout(() => {
          tick();
          startMinuteInterval();
        }, msUntilNextMinute());
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timeoutId != null) window.clearTimeout(timeoutId);
      if (intervalId != null) window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return snapshot;
}
