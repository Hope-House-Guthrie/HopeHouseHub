import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useAppSelector } from "@/store/hooks";
import type { MenuItem } from "@/store/slices/kitchen";

/**
 * Serving-line TV display (v1).
 * Reads kitchen Redux store. Public fields only: meals, dinner time,
 * Daily Affirmations (store/code name: kennyisms / Kennyism).
 */

/** How long one unpinned affirmation stays before advancing (12 hours). */
const AFFIRMATION_ROTATE_MS = 12 * 60 * 60 * 1000;

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

export default function KitchenDisplayPage() {
  const menuItems = useAppSelector((state) => state.kitchen.menuItems);
  const breakfast = useAppSelector((state) => state.kitchen.breakfast);
  const lunch = useAppSelector((state) => state.kitchen.lunch);
  const dinner = useAppSelector((state) => state.kitchen.dinner);
  // Code/store: kennyisms. Guest-facing label: "Daily Affirmations".
  const kennyisms = useAppSelector((state) => state.kitchen.kennyisms);
  const pinnedKennyismId = useAppSelector(
    (state) => state.kitchen.pinnedKennyismId,
  );

  const nameById = (id: string) =>
    menuItems.find((m: MenuItem) => m.id === id)?.name ?? "Unknown item";

  const nameByLine = (meal: { itemIds: string[] }) => {
    if (meal.itemIds.length === 0) return "Not set";
    return meal.itemIds.map(nameById).join(", ");
  };

  const pinned = pinnedKennyismId
    ? kennyisms.find((k) => k.id === pinnedKennyismId)
    : undefined;

  // Wall-clock bucket (not a short setInterval counter): same quote for 12h,
  // survives refresh/HMR. Index only changes when the 12h window rolls.
  const [clockBucket, setClockBucket] = useState(
    () => Math.floor(Date.now() / AFFIRMATION_ROTATE_MS),
  );

  useEffect(() => {
    if (pinnedKennyismId || kennyisms.length <= 1) return;
    const tick = () => {
      setClockBucket(Math.floor(Date.now() / AFFIRMATION_ROTATE_MS));
    };
    tick();
    // Check once a minute whether the 12h bucket advanced (cheap + stable).
    const id = window.setInterval(tick, 60 * 1000);
    return () => window.clearInterval(id);
  }, [pinnedKennyismId, kennyisms.length]);

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
      <Typography
        variant="h3"
        component="h1"
        sx={{ fontWeight: 700, mb: 1 }}
      >
        Today&apos;s Menu
      </Typography>
      <Typography variant="h5" sx={{ mb: 6, opacity: 0.75 }}>
        Hope House Guthrie - Serving Line
      </Typography>

      <MealBlock label="Breakfast" body={nameByLine(breakfast)} />
      <MealBlock label="Lunch" body={nameByLine(lunch)} />
      <MealBlock label="Dinner" body={nameByLine(dinner)} />

      <Box
        sx={{
          mt: "auto",
          pt: 4,
          borderTop: "2px solid rgba(224, 225, 221, 0.25)",
        }}
      >
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

        {kennyismText ? (
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: "2px solid rgba(224, 225, 221, 0.25)",
            }}
          >
            {/* Daily Affirmations = kennyisms in Redux/code (Kennyism type). */}
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
