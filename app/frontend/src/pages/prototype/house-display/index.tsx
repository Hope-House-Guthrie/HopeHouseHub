/**
* STATUS — House Display TV (presentation only)
* Branch: feature/house-display
*
* DONE:
* - Full-viewport page outside MainLayout (/house-display)
* - Reads headline/subtext from houseDisplay Redux slice (FE mock seed)
*
* NOT IN THIS CHUNK:
* - Clock, weather, agenda, motion, day-part themes
* - Edit UI (see manage.tsx)
* - Backend
*
* Pair: manage at /prototype/house-display (Hub chrome)
*/
import { useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";
import type { RootState } from "@/store";

export default function HouseDisplayPage() {
  const { headline, subtext } = useSelector(
    (state: RootState) => state.houseDisplay.content
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        bgcolor: "#0d1b2a",
        color: "#e0e1dd",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 4,
        boxSizing: "border-box",
      }}
    >
      <Typography
        variant="h2"
        component="h1"
        sx={{ fontWeight: 700, textAlign: "center", mb: 2 }}
      >
        {headline}
      </Typography>
      <Typography
        variant="h5"
        component="p"
        sx={{ opacity: 0.75, textAlign: "center", maxWidth: 720 }}
      >
        {subtext}
      </Typography>
    </Box>
  );
}
