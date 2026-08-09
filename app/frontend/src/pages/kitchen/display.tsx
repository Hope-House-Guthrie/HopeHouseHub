/**
 * KitchenDisplayPage — serving-line TV (read-only).
 *
 * Data flow:
 *   kitchen.ts (store)  →  this page SELECTs only  →  big TV UI
 *   menus.tsx writes the same store; guests never see menus.
 *
 * Shows: HHG logo, Central Time clock/date, Guthrie weather,
 * B/L/D foods, dinner time, Daily Affirmations (kennyisms).
 * Pin holds 12h from pinnedKennyismAt, then rotates (not forever).
 */

import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Logo from "@assets/hhg-logo.svg";
import { useAppSelector } from "@/store/hooks";
import type { MenuItem } from "@/store/slices/kitchen";

/** 12h: rotate step AND how long a staff pin holds on the TV. */
const AFFIRMATION_ROTATE_MS = 12 * 60 * 60 * 1000;

/** Hope House Guthrie — clock + weather always Central Time. */
const CENTRAL_TZ = "America/Chicago";
const GUTHRIE_LAT = 35.879;
const GUTHRIE_LON = -97.425;
const WEATHER_REFRESH_MS = 15 * 60 * 1000;

// ---------------------------------------------------------------------------
// Weather helpers (WMO weather_code → short label)
// ---------------------------------------------------------------------------

function weatherLabel(code: number | undefined): string {
  if (code == null || Number.isNaN(code)) return "—";
  if (code === 0) return "Clear";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "—";
}

// ---------------------------------------------------------------------------
// Presentational: one meal heading + food line
// ---------------------------------------------------------------------------

function MealBlock({ label, body }: { label: string; body: string }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h4"
        component="h2"
        sx={{ fontWeight: 700, letterSpacing: 1, mb: 1, opacity: 0.85 }}
      >
        {label}
      </Typography>
      <Typography variant="h3" component="p" sx={{ fontWeight: 500 }}>
        {body}
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function KitchenDisplayPage() {
  // --- Store (read-only): library + today's meals + affirmations ---
  const menuItems = useAppSelector((state) => state.kitchen.menuItems);
  const breakfast = useAppSelector((state) => state.kitchen.breakfast);
  const lunch = useAppSelector((state) => state.kitchen.lunch);
  const dinner = useAppSelector((state) => state.kitchen.dinner);
  // Code/store: kennyisms. Guest-facing label below: "Daily Affirmations".
  const kennyisms = useAppSelector((state) => state.kitchen.kennyisms);
  const pinnedKennyismId = useAppSelector(
    (state) => state.kitchen.pinnedKennyismId,
  );
  const pinnedKennyismAt = useAppSelector(
    (state) => state.kitchen.pinnedKennyismAt,
  );

  // --- Live clock (always America/Chicago — Central) ---
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const timeLabel = now.toLocaleTimeString("en-US", {
    timeZone: CENTRAL_TZ,
    hour: "numeric",
    minute: "2-digit",
  });
  const dateLabel = now.toLocaleDateString("en-US", {
    timeZone: CENTRAL_TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // --- Local weather (Guthrie OK via Open-Meteo, Central timezone) ---
  const [weatherTempF, setWeatherTempF] = useState<number | null>(null);
  const [weatherCode, setWeatherCode] = useState<number | undefined>(undefined);
  const [weatherError, setWeatherError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${GUTHRIE_LAT}&longitude=${GUTHRIE_LON}` +
          `&current=temperature_2m,weather_code` +
          `&temperature_unit=fahrenheit&timezone=America%2FChicago`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`weather ${res.status}`);
        const data = (await res.json()) as {
          current?: { temperature_2m?: number; weather_code?: number };
        };
        if (cancelled) return;
        setWeatherTempF(
          typeof data.current?.temperature_2m === "number"
            ? Math.round(data.current.temperature_2m)
            : null,
        );
        setWeatherCode(data.current?.weather_code);
        setWeatherError(false);
      } catch {
        if (!cancelled) setWeatherError(true);
      }
    };

    load();
    const id = window.setInterval(load, WEATHER_REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const weatherLine = weatherError
    ? "Weather unavailable"
    : weatherTempF != null
      ? `${weatherTempF}°F · ${weatherLabel(weatherCode)}`
      : "Weather…";

  // --- Helpers: turn meal itemIds into a single display string ---
  const nameById = (id: string) =>
    menuItems.find((m: MenuItem) => m.id === id)?.name ?? "Unknown item";

  const nameByLine = (meal: { itemIds: string[] }) => {
    if (meal.itemIds.length === 0) return "Not set";
    return meal.itemIds.map(nameById).join(", ");
  };

  // --- Daily Affirmations: pin holds 12h from pinnedKennyismAt; then rotate ---
  const pinStillActive =
    pinnedKennyismId != null &&
    pinnedKennyismAt != null &&
    Date.now() - pinnedKennyismAt < AFFIRMATION_ROTATE_MS;

  const pinned = pinStillActive
    ? kennyisms.find((k) => k.id === pinnedKennyismId)
    : undefined;

  // Wall-clock bucket (not a short setInterval counter): same quote for 12h,
  // survives refresh/HMR. Index only changes when the 12h window rolls.
  const [clockBucket, setClockBucket] = useState(
    () => Math.floor(Date.now() / AFFIRMATION_ROTATE_MS),
  );

  useEffect(() => {
    // No rotate timer while a fresh pin is holding, or only one quote.
    if (pinStillActive || kennyisms.length <= 1) return;
    const tick = () => {
      setClockBucket(Math.floor(Date.now() / AFFIRMATION_ROTATE_MS));
    };
    tick();
    // Check once a minute (pin expiry + 12h bucket).
    const id = window.setInterval(tick, 60 * 1000);
    return () => window.clearInterval(id);
  }, [pinStillActive, kennyisms.length]);

  const rotateIndex =
    kennyisms.length > 0 ? clockBucket % kennyisms.length : 0;

  const kennyismText =
    pinned?.text ??
    (kennyisms.length > 0 ? kennyisms[rotateIndex]?.text : "");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0d1b2a",
        color: "#e0e1dd",
        px: { xs: 3, md: 8 },
        py: { xs: 4, md: 6 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header: logo above titles (left) | Central time / date / weather (right) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 3,
          mb: 6,
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            flex: "1 1 auto",
            pr: 2,
            minWidth: { xs: 0, md: 220 },
            overflow: "visible",
          }}
        >

          {/* Full-color logo — no invert filter (that made a white box) */}
          <Box
            component="img"
            src={Logo}
            alt="Hope House Guthrie"
            sx={{
              height: { xs: 175, md: 225 },
              width: { xs: 175, md: 225 },
              objectFit: "contain",
              objectPosition: "left center",
              display: "block",
              flexShrink: 0,
              mb: 2,
            }}
          />
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontWeight: 700, mb: 0.5 }}
          >
            Today&apos;s Menu
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.75 }}>
            Hope House Guthrie - Serving Line
          </Typography>
        </Box>

        {/* Corner card: Central clock, date, local weather */}
        <Box
          sx={{
            textAlign: "right",
            px: 2.5,
            py: 2,
            borderRadius: 2,
            border: "2px solid rgba(224, 225, 221, 0.25)",
            bgcolor: "rgba(0, 0, 0, 0.2)",
            minWidth: { xs: "100%", sm: 200 },
          }}
        >
          <Typography
            variant="h2"
            component="p"
            sx={{ fontWeight: 700, lineHeight: 1.1 }}
          >
            {timeLabel}
          </Typography>
          <Typography variant="h3" sx={{ mt: 0.5, opacity: 0.9 }}>
            {dateLabel}
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, opacity: 0.85 }}>
            {weatherLine}
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 0.5, opacity: 0.55 }}
          >
            Guthrie, OK · Central
          </Typography>
        </Box>
      </Box>

      {/* Meal blocks: foods from store (same ids menus assigned) */}
      <MealBlock label="Breakfast" body={nameByLine(breakfast)} />
      <MealBlock label="Lunch" body={nameByLine(lunch)} />
      <MealBlock label="Dinner" body={nameByLine(dinner)} />

      {/* Footer: dinner serve time + Daily Affirmations */}
      <Box
        sx={{
          mt: "auto",
          pt: 4,
          borderTop: "2px solid rgba(224, 225, 221, 0.25)",
        }}
      >
        {/* Dinner time (from dinner.mealTime in store) */}
        <Typography
          variant="h4"
          component="h2"
          sx={{ fontWeight: 700, letterSpacing: 1, mb: 1, opacity: 0.85 }}
        >
          Dinner time
        </Typography>
        <Typography variant="h2" component="p" sx={{ fontWeight: 700 }}>
          {dinner.mealTime || "TBD"}
        </Typography>

        {/* Daily Affirmations = kennyisms in Redux/code (Kennyism type). */}
        {kennyismText ? (
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: "2px solid rgba(224, 225, 221, 0.25)",
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 700, letterSpacing: 1, mb: 1, opacity: 0.85 }}
            >
              Daily Affirmations
            </Typography>
            <Typography
              variant="h4"
              component="p"
              sx={{ fontWeight: 500, fontStyle: "italic" }}
            >
              {kennyismText}
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
