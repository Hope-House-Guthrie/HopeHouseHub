/**
 * Room Chart prototype page.
 *
 * Owns the in-memory hall/room/bed state and coordinates the room editor.
 * Prototype only: state is initialized from seed data and resets on refresh
 * (no backend/persistence yet).
 *
 * FUTURE: shared persistence + Intake assignment should store Bed.id while
 * staff see codes from formatBedAssignmentCode (e.g. "6S - A").
 */

import { Stack, Typography } from "@mui/material";

import HallSection from "./components/HallSection";
import { roomChartHalls } from "./data/roomChartData";
import { useState } from "react";
import type { Room } from "./types/roomChart";
import RoomEditor from "./components/RoomEditor";
import {
  compareBedsBySlot,
  nextLowestUnusedSlot,
} from "./utils/nextLowestUnusedSlot";

export default function RoomChartPages() {
  // ---------------------------------------------------------------------------
  // Room selection / editor state
  // ---------------------------------------------------------------------------
  const [halls, setHalls] = useState(roomChartHalls);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editorSide, setEditorSide] = useState<"left" | "right">("right");

  // Always read the room from live halls so the editor sees latest beds/occupants.
  const currentSelectedRoom = selectedRoom
    ? (halls
        .flatMap((hall) => hall.rooms)
        .find((room) => room.id === selectedRoom.id) ?? null)
    : null;

  const handleRoomClick = (room: Room, roomCenterX: number) => {
    setSelectedRoom(room);

    const screenCenter = window.innerWidth / 2;

    setEditorSide(roomCenterX > screenCenter ? "left" : "right");
  };

  // ---------------------------------------------------------------------------
  // Occupant management
  // ---------------------------------------------------------------------------

  // Fills the vacant bed with the lowest permanent Bed.slot (A before B, etc.).
  // Array order is ignored; Bed.id/slot of the chosen bed are unchanged.
  const handleAddPerson = (personName: string, program: string) => {
    if (!selectedRoom) return;
    setHalls((currentHalls) =>
      currentHalls.map((hall) => ({
        ...hall,
        rooms: hall.rooms.map((room) =>
          room.id === selectedRoom.id
            ? {
                ...room,
                beds: (() => {
                  const vacantBeds = room.beds.filter(
                    (bed) => bed.status === "vacant",
                  );
                  if (vacantBeds.length === 0) {
                    return room.beds;
                  }

                  const target = [...vacantBeds].sort(compareBedsBySlot)[0];
                  if (!target) {
                    return room.beds;
                  }

                  return room.beds.map((bed) =>
                    bed.id === target.id
                      ? {
                          ...bed,
                          status: "occupied" as const,
                          occupantName: personName,
                          program,
                        }
                      : bed,
                  );
                })(),
              }
            : room,
        ),
      })),
    );

    setSelectedRoom(null);
  };

  // ---------------------------------------------------------------------------
  // Bed management
  // ---------------------------------------------------------------------------

  // New vacant bed gets the lowest unused permanent slot (A–Z). Existing slots unchanged.
  const handleAddBed = () => {
    if (!selectedRoom) return;

    setHalls((currentHalls) =>
      currentHalls.map((hall) => ({
        ...hall,
        rooms: hall.rooms.map((room) => {
          if (room.id !== selectedRoom.id) {
            return room;
          }

          const slot = nextLowestUnusedSlot(room.beds.map((bed) => bed.slot));

          return {
            ...room,
            beds: [
              ...room.beds,
              {
                // TODO: replace timestamp ids when backend/persistence lands.
                id: `${room.id}-${Date.now()}`,
                label: "Vacant",
                slot,
                status: "vacant" as const,
              },
            ],
          };
        }),
      })),
    );
  };

  // Removes one vacant bed by Bed.id. Never renumbers remaining Bed.slot values.
  const handleRemoveBed = (bedId: string) => {
    if (!selectedRoom) return;

    setHalls((currentHalls) =>
      currentHalls.map((hall) => ({
        ...hall,
        rooms: hall.rooms.map((room) => {
          if (room.id !== selectedRoom.id) {
            return room;
          }

          const target = room.beds.find((bed) => bed.id === bedId);
          // Only vacant beds may be removed; never occupied/unavailable; never renumber slots.
          if (!target || target.status !== "vacant") {
            return room;
          }

          return {
            ...room,
            beds: room.beds.filter((bed) => bed.id !== bedId),
          };
        }),
      })),
    );
  };

  // ---------------------------------------------------------------------------
  // Occupant management (continued)
  // ---------------------------------------------------------------------------

  // Clears occupant only; physical bed row and Bed.slot remain.
  const handleRemovePerson = (bedId: string) => {
    if (!selectedRoom) return;

    setHalls((currentHalls) =>
      currentHalls.map((hall) => ({
        ...hall,
        rooms: hall.rooms.map((room) =>
          room.id === selectedRoom.id
            ? {
                ...room,
                beds: room.beds.map((bed) =>
                  bed.id === bedId
                    ? {
                        ...bed,
                        status: "vacant" as const,
                        occupantName: undefined,
                        program: undefined,
                      }
                    : bed,
                ),
              }
            : room,
        ),
      })),
    );
  };

  // ---------------------------------------------------------------------------
  // Page rendering
  // ---------------------------------------------------------------------------

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Room Chart</Typography>

      {halls.map((hall) => (
        <HallSection key={hall.id} hall={hall} onRoomClick={handleRoomClick} />
      ))}

      {currentSelectedRoom && (
        <RoomEditor
          room={currentSelectedRoom}
          side={editorSide}
          onClose={() => setSelectedRoom(null)}
          onAddPerson={handleAddPerson}
          onAddBed={handleAddBed}
          onRemoveBed={handleRemoveBed}
          onRemovePerson={handleRemovePerson}
        />
      )}
    </Stack>
  );
}
