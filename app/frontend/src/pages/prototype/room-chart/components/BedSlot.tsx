/**
 * One bed row inside a RoomCard.
 *
 * Shows permanent Bed.slot plus occupant name (or "Vacant") and program.
 * Does not compute letters from list index.
 */

import { Box, Typography } from "@mui/material";

import type { Bed } from "../types/roomChart";

interface BedSlotsProps {
  bed: Bed;
  showDivider?: boolean;
}

export default function BedSlot({ bed, showDivider = false }: BedSlotsProps) {
  return (
    <Box
      sx={{
        width: "100%",
        py: 0.5,
        borderTop: showDivider ? 1 : 0,
        borderColor: "divider",
        textAlign: "center",
      }}
    >
      <Typography variant="body2">
        {bed.slot}: {bed.occupantName ?? "Vacant"}
      </Typography>

      {bed.program && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            lineHeight: 1.2,
            fontWeight: 600,
            color:
              bed.program === "LTP"
                ? "#ed6c02"
                : bed.program === "TEMP"
                  ? "#0d47a1"
                  : "text.secondary",
          }}
        >
          {bed.program}
        </Typography>
      )}
    </Box>
  );
}
