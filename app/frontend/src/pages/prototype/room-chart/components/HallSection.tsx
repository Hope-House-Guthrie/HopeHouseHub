/**
 * One hall band on the Room Chart: top rooms, corridor label, bottom rooms.
 *
 * Presentation/layout only — does not own or mutate room/bed state.
 * Room click is forwarded to the page for editor selection.
 */

import { Box, Stack, Typography } from "@mui/material";

import type { Hall, Room } from "../types/roomChart";
import RoomCard from "./RoomCard";

interface HallSectionProps {
  hall: Hall;
  onRoomClick: (room: Room, roomCenterX: number) => void;
}

export default function HallSection({ hall, onRoomClick }: HallSectionProps) {
  const topRooms = hall.rooms
    .filter((room) => room.side === "top")
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const bottomRooms = hall.rooms
    .filter((room) => room.side === "bottom")
    .sort((a, b) => b.displayOrder - a.displayOrder);

  return (
    <Stack
      spacing={1.5}
      sx={{
        width: "100%",
        mb: 3,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 188px)",
          gap: 1,
          overflowX: "auto",
          pb: 0.5,
        }}
      >
        {topRooms.map((room) => (
          <RoomCard key={room.id} room={room} onClick={onRoomClick} />
        ))}
      </Box>

      <Box
        sx={{
          width: "1575px",
          height: 70,
          borderTop: 2,
          borderBottom: 2,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{
            width: "100%",
            textAlign: "center",
            fontSize: "1.6rem",
            fontWeight: 700,
            letterSpacing: "0.35em",
          }}
        >
          {hall.name.toUpperCase()}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 188px)",
          gap: 1,
          overflowX: "auto",
          pt: 0.5,
        }}
      >
        {bottomRooms.map((room) => (
          <RoomCard key={room.id} room={room} onClick={onRoomClick} />
        ))}
      </Box>

      <Box
        sx={{
          width: "1575px",
          height: 6,
          bgcolor: "divider",
          mx: "auto",
          mt: 2,
        }}
      />
    </Stack>
  );
}
