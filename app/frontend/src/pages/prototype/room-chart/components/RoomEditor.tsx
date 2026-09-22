/**
 * Side panel for the selected room: occupants, add person, add/remove beds.
 *
 * Remove Bed targets a specific vacant bed by Bed.id (not "first vacant").
 * Remove Person clears the occupant on that bed; the bed row and Bed.slot stay.
 * Lists beds sorted by slot for readability only.
 */

import {
  Box,
  Button,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import type { Room } from "../types/roomChart";
import { useMemo, useState } from "react";
import RemovePersonDialog from "./RemovePersonDialog";
import { compareBedsBySlot } from "../utils/nextLowestUnusedSlot";

interface RoomEditorProps {
  room: Room;
  side: "left" | "right";
  onClose: () => void;
  onAddPerson: (personName: string, program: string) => void;
  onAddBed: () => void;
  onRemoveBed: (bedId: string) => void;
  onRemovePerson: (bedId: string) => void;
}

export default function RoomEditor({
  room,
  side,
  onClose,
  onAddPerson,
  onAddBed,
  onRemoveBed,
  onRemovePerson,
}: RoomEditorProps) {
  const [addingPerson, setAddingPerson] = useState(false);
  const [personName, setPersonName] = useState("");
  const [program, setProgram] = useState("");
  const [personToRemove, setPersonToRemove] = useState<{
    bedId: string;
    name: string;
  } | null>(null);

  const bedsBySlot = useMemo(
    () => [...room.beds].sort(compareBedsBySlot),
    [room.beds],
  );

  const hasVacancy = room.beds.some((bed) => bed.status === "vacant");

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          width: 360,
          p: 2,
          flexShrink: 0,
          position: "fixed",
          top: 100,
          left: side === "left" ? 260 : "auto",
          right: side === "right" ? 24 : "auto",
          zIndex: 1200,
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {room.roomNumber ? `Room ${room.roomNumber}` : room.physicalName}

          <Button
            onClick={onClose}
            variant="contained"
            color="error"
            sx={{ minWidth: 20, width: 20, height: 20, p: 0, fontSize: 18 }}
          >
            x
          </Button>
        </DialogTitle>

        <DialogContent>
          {bedsBySlot.map((bed) => (
            <Box
              key={bed.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                py: 0.5,
              }}
            >
              <Typography>
                {bed.slot}: {bed.occupantName ?? "Vacant"}
                {bed.program ? ` • ${bed.program}` : ""}
              </Typography>

              <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                {bed.status === "occupied" && (
                  <Button
                    size="small"
                    onClick={() =>
                      setPersonToRemove({
                        bedId: bed.id,
                        name: bed.occupantName ?? "this person",
                      })
                    }
                  >
                    Remove
                  </Button>
                )}

                {/* Vacant only — occupied/unavailable never get Remove Bed. */}
                {bed.status === "vacant" && (
                  <Button size="small" onClick={() => onRemoveBed(bed.id)}>
                    Remove Bed
                  </Button>
                )}
              </Box>
            </Box>
          ))}

          {addingPerson && (
            <>
              <TextField
                fullWidth
                label="Person Name"
                size="small"
                value={personName}
                onChange={(event) => setPersonName(event.target.value)}
                sx={{ mt: 2 }}
              />

              <TextField
                select
                fullWidth
                label="Program"
                size="small"
                value={program}
                onChange={(event) => setProgram(event.target.value)}
                sx={{ mt: 2 }}
              >
                <MenuItem value="LTP" sx={{ color: "black" }}>
                  LTP
                </MenuItem>
                <MenuItem value="TEMP" sx={{ color: "black" }}>
                  TEMP
                </MenuItem>
                <MenuItem value="ADMIN" sx={{ color: "black" }}>
                  ADMIN
                </MenuItem>
                <MenuItem value="Child" sx={{ color: "black" }}>
                  CHILD
                </MenuItem>
              </TextField>

              <Button
                variant="contained"
                disabled={!personName.trim() || !program}
                sx={{ mt: 2 }}
                onClick={() => onAddPerson(personName, program)}
              >
                Save Person
              </Button>
            </>
          )}

          {!addingPerson && (
            <Button
              variant="contained"
              disabled={!hasVacancy}
              sx={{ mt: 2 }}
              onClick={() => setAddingPerson(true)}
            >
              Add Person
            </Button>
          )}

          <Button variant="outlined" sx={{ mt: 2, ml: 1 }} onClick={onAddBed}>
            Add Bed
          </Button>
        </DialogContent>
      </Paper>

      <RemovePersonDialog
        open={personToRemove !== null}
        personName={personToRemove?.name ?? ""}
        onCancel={() => setPersonToRemove(null)}
        onConfirm={() => {
          if (!personToRemove) return;

          onRemovePerson(personToRemove.bedId);
          setPersonToRemove(null);
        }}
      />
    </>
  );
}
