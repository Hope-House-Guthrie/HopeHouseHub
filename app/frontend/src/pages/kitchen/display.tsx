import { Box, Typography } from "@mui/material";

/**
 * Serving-line TV display (v1).
 * Hard-coded sample data only — no API yet.
 * Public fields only: meals + dinner time. No internal staff notes.
 */
const SAMPLE_MENU = {
  breakfast: "Cold cereal",
  lunch: "Sandwiches and leftovers",
  dinner: "Baked chicken, rice, and green beans",
  dinnerTime: "5:30 PM",
};

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
  const menu = SAMPLE_MENU;

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
        Hope House — Serving Line
      </Typography>

      <MealBlock label="Breakfast" body={menu.breakfast} />
      <MealBlock label="Lunch" body={menu.lunch} />
      <MealBlock label="Dinner" body={menu.dinner} />

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
          {menu.dinnerTime}
        </Typography>
      </Box>
    </Box>
  );
}
