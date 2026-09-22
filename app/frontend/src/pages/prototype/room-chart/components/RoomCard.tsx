/**
 * Single room tile on the hall map.
 *
 * Renders outside room number (hall-facing) and inside beds.
 * Sorts a COPY of beds by permanent Bed.slot for display — does not mutate
 * room.beds. A room with only slot B still shows B (never renumbered to A).
 */

import { Box, Paper, Stack, Typography } from "@mui/material";

import type { Room } from "../types/roomChart";
import BedSlot from "./BedSlot";
import { useMemo } from "react";
import { compareBedsBySlot } from "../utils/nextLowestUnusedSlot";

interface RoomCardProps {
  room: Room;
  onClick: (room: Room, roomCenterX: number) => void;
}

export default function RoomCard({ room, onClick }: RoomCardProps) {
  // Numbered physical rooms: label stays OUTSIDE the box, facing the hall.
  const outsideNumber =
    room.roomNumber != null ? `Room ${room.roomNumber}` : null;

  // Named rooms keep physicalName inside; special current use stays inside.
  // Never put the room number inside the box.
  const insideLabel = room.currentUseLabel ?? room.physicalName ?? null;

  // Invisible stand-in keeps Paper boxes level with numbered neighbors.
  // Same caption metrics; never a real/fake room number for named rooms.
  const outsideLabelText = outsideNumber ?? "Room 00";
  const outsideLabelVisible = outsideNumber != null;

  // Display order only; source room.beds array order is unchanged.
  const bedsBySlot = useMemo(
    () => [...room.beds].sort(compareBedsBySlot),
    [room.beds],
  );

  return (
    <Box
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        onClick(room, rect.left + rect.width / 2);
      }}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Bottom-side: hall-facing label ABOVE the box (spacer if unnamed). */}
      {room.side === "bottom" && (
        <Typography
          variant="caption"
          aria-hidden={!outsideLabelVisible}
          sx={{
            fontWeight: 700,
            mb: 0.5,
            visibility: outsideLabelVisible ? "visible" : "hidden",
          }}
        >
          {outsideLabelText}
        </Typography>
      )}

      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          minWidth: 140,
          minHeight: 90,
        }}
      >
        <Stack
          spacing={0.5}
          sx={{
            minHeight: 66,
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {insideLabel != null && (
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {insideLabel}
            </Typography>
          )}
          {bedsBySlot.map((bed, index) => (
            <BedSlot key={bed.id} bed={bed} showDivider={index > 0} />
          ))}
        </Stack>
      </Paper>

      {/* Top-side: hall-facing label BELOW the box (spacer if unnamed). */}
      {room.side === "top" && (
        <Typography
          variant="caption"
          aria-hidden={!outsideLabelVisible}
          sx={{
            fontWeight: 700,
            mt: 0.5,
            visibility: outsideLabelVisible ? "visible" : "hidden",
          }}
        >
          {outsideLabelText}
        </Typography>
      )}
    </Box>
  );
}
