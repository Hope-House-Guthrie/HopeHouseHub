/**
 * Daily Duties — Room Inspections (Phase 3)
 *
 * STATUS (branch: daily-duties) — leave 2026-08-18
 * DONE (Phase 3 FE mock): walk rooms, notes, Review & Complete
 * DONE elsewhere: Ph1 Morning Roll Call + Ph2 · Ph4 · Chore Library + Weekly Assign + day matrix
 * PARKED (hub-wide): disciplinary chores; auto week; History hub; backend
 * RULES: client rooms only (Jack & Jill); no common-bath rows;
 *   never write Sign In/Out / Morning Roll Call / Class Attendance
 */

import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clientDisplayName,
  completeRoomInspection,
  discardOpenRoomInspection,
  setRoomInspectionNotes,
  setRoomInspectionStatus,
  startRoomInspection,
  toggleRoomInspectionItem,
  type InspectionRoom,
  type RoomInspectionItemKey,
  type RoomInspectionStatus,
} from "@/store/slices/prototype/dailyDuties";

const STATUS_BUTTONS: RoomInspectionStatus[] = [
  "pass",
  "needs_attention",
  "fail",
];

const ITEM_KEYS: RoomInspectionItemKey[] = [
  "beds",
  "floors",
  "trash",
  "personal_belongings",
  "bathroom",
  "other",
];

function todayYmdLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function statusLabel(status: RoomInspectionStatus): string {
  switch (status) {
    case "pass":
      return "Pass";
    case "needs_attention":
      return "Needs Attention";
    case "fail":
      return "Fail";
    default:
      return "Unmarked";
  }
}

function itemLabel(item: RoomInspectionItemKey): string {
  switch (item) {
    case "beds":
      return "Beds";
    case "floors":
      return "Floors";
    case "trash":
      return "Trash";
    case "personal_belongings":
      return "Belongings";
    case "bathroom":
      return "Bathroom";
    case "other":
      return "Other";
    default:
      return item;
  }
}

function statusColor(status: RoomInspectionStatus): string {
  switch (status) {
    case "pass":
      return "#e8f5e9";
    case "needs_attention":
      return "#fff8e1";
    case "fail":
      return "#ffebee";
    default:
      return "transparent";
  }
}

/** Jack & Jill partner name for UI hint, if any */
function jackJillHint(
  room: InspectionRoom,
  allRooms: InspectionRoom[],
): string | null {
  if (!room.sharedBathroomId) return null;
  const partner = allRooms.find(
    (r) =>
      r.id !== room.id && r.sharedBathroomId === room.sharedBathroomId,
  );
  if (!partner) return `Shared bath (${room.sharedBathroomId})`;
  return `Jack & Jill with ${partner.name}`;
}

export default function RoomInspectionsPage() {
  const dispatch = useAppDispatch();
  const roster = useAppSelector((s) => s.dailyDuties.roster);
  const inspectionRooms = useAppSelector((s) => s.dailyDuties.inspectionRooms);
  const openSession = useAppSelector((s) => s.dailyDuties.openRoomInspection);
  const completedInspections = useAppSelector(
    (s) => s.dailyDuties.completedRoomInspections,
  );
  const completedCount = completedInspections.length;

  const [serviceDate, setServiceDate] = useState(() => todayYmdLocal());
  const [setupError, setSetupError] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  /** roomId -> last status attempt blocked for empty notes */
  const [statusErrorByRoom, setStatusErrorByRoom] = useState<
    Record<string, string>
  >({});
  /** which room cards are expanded (tablet: one or many) */
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const rosterById = useMemo(() => {
    const map: Record<string, (typeof roster)[number]> = {};
    for (const c of roster) {
      map[c.id] = c;
    }
    return map;
  }, [roster]);

  const sortedRooms = useMemo(
    () =>
      inspectionRooms.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [inspectionRooms],
  );

  const counts = useMemo(() => {
    const base: Record<RoomInspectionStatus, number> = {
      unmarked: 0,
      pass: 0,
      fail: 0,
      needs_attention: 0,
    };
    if (!openSession) return base;
    for (const row of Object.values(openSession.results)) {
      base[row.status] += 1;
    }
    return base;
  }, [openSession]);

  /** Fail / needs_attention rooms for review dialog notes preview */
  const issueRooms = useMemo(() => {
    if (!openSession) return [];
    return sortedRooms
      .map((room) => {
        const row = openSession.results[room.id];
        if (!row) return null;
        if (row.status !== "fail" && row.status !== "needs_attention") {
          return null;
        }
        return { room, row };
      })
      .filter(Boolean) as {
      room: InspectionRoom;
      row: (typeof openSession.results)[string];
    }[];
  }, [openSession, sortedRooms]);

  const lastCompleted = completedInspections[0] ?? null;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setSetupError(null);
    setStatusErrorByRoom({});
    setExpandedIds({});
    setReviewOpen(false);

    if (!serviceDate.trim()) {
      setSetupError("Pick a date.");
      return;
    }

    dispatch(startRoomInspection({ serviceDate: serviceDate.trim() }));
  };

  const handleCloseReview = () => {
    setReviewOpen(false);
  };

  const handleConfirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(completeRoomInspection());
    setReviewOpen(false);
    setStatusErrorByRoom({});
    setExpandedIds({});
    setNotice(
      "Room inspection completed. Sign In/Out was not changed.",
    );
  };

  const handleCloseDiscard = () => {
    setDiscardOpen(false);
  };

  const handleConfirmDiscard = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(discardOpenRoomInspection());
    setDiscardOpen(false);
    setReviewOpen(false);
    setStatusErrorByRoom({});
    setExpandedIds({});
    setNotice("Open room inspection discarded.");
  };

  const toggleExpanded = (roomId: string) => {
    setExpandedIds((prev) => ({ ...prev, [roomId]: !prev[roomId] }));
  };

  const handleStatus = (roomId: string, status: RoomInspectionStatus) => {
    if (!openSession) return;
    const row = openSession.results[roomId];
    const notes = row?.notes ?? "";

    if (
      (status === "fail" || status === "needs_attention") &&
      !notes.trim()
    ) {
      setStatusErrorByRoom((prev) => ({
        ...prev,
        [roomId]: "Add notes before Fail or Needs Attention.",
      }));
      setExpandedIds((prev) => ({ ...prev, [roomId]: true }));
      return;
    }

    setStatusErrorByRoom((prev) => {
      const next = { ...prev };
      delete next[roomId];
      return next;
    });
    dispatch(setRoomInspectionStatus({ roomId, status }));
  };

  const handleNotes = (roomId: string, notes: string) => {
    dispatch(setRoomInspectionNotes({ roomId, notes }));
    if (notes.trim()) {
      setStatusErrorByRoom((prev) => {
        const next = { ...prev };
        delete next[roomId];
        return next;
      });
    }
  };

  const handleToggleItem = (roomId: string, item: RoomInspectionItemKey) => {
    dispatch(toggleRoomInspectionItem({ roomId, item }));
  };

  const clientsLine = (room: InspectionRoom): string => {
    const names = room.clientIds
      .map((id) => rosterById[id])
      .filter(Boolean)
      .map((c) => clientDisplayName(c!));
    if (names.length === 0) return "No clients assigned";
    return names.join(" · ");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ flex: "1 1 auto" }}>
          Room Inspections
        </Typography>
        <Button component={RouterLink} to="/daily-duties" variant="outlined">
          Back to Daily Duties
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary">
        Walk client rooms (Jack &amp; Jill baths share between two rooms). House
        common bathrooms are not on this list. Does not change Sign In/Out.
      </Typography>

      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      {/* Setup when no open session */}
      {!openSession && (
        <Box
          component="form"
          onSubmit={handleStart}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxWidth: 480,
          }}
        >
          <TextField
            type="date"
            label="Inspection date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            fullWidth
            required
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />

          {setupError && <Alert severity="error">{setupError}</Alert>}

          {lastCompleted && (
            <Typography variant="body2" color="text.secondary">
              Last completed: {lastCompleted.serviceDate} ·{" "}
              {
                Object.values(lastCompleted.results).filter(
                  (r) => r.status === "fail",
                ).length
              }{" "}
              fail ·{" "}
              {
                Object.values(lastCompleted.results).filter(
                  (r) => r.status === "needs_attention",
                ).length
              }{" "}
              needs attention
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
            }}
          >
            <Button type="submit" variant="contained">
              Start Inspection
            </Button>
            <Typography variant="body2" color="text.secondary">
              Rooms: {inspectionRooms.length} · Completed sessions (this
              browser): {completedCount}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Open session */}
      {openSession && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography variant="subtitle1">
            In progress · {openSession.serviceDate}
          </Typography>

          {/* Counts */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip
              label={`Pass: ${counts.pass}`}
              sx={{ bgcolor: statusColor("pass") }}
            />
            <Chip
              label={`Needs Attention: ${counts.needs_attention}`}
              sx={{ bgcolor: statusColor("needs_attention") }}
            />
            <Chip
              label={`Fail: ${counts.fail}`}
              sx={{ bgcolor: statusColor("fail") }}
            />
            <Chip
              label={`Unmarked: ${counts.unmarked}`}
              color={counts.unmarked > 0 ? "warning" : "default"}
              variant={counts.unmarked > 0 ? "filled" : "outlined"}
            />
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Button
              variant="contained"
              onClick={() => setReviewOpen(true)}
              disabled={sortedRooms.length === 0}
            >
              Review &amp; Complete
            </Button>
            <Button
              variant="outlined"
              color="warning"
              onClick={() => setDiscardOpen(true)}
            >
              Discard
            </Button>
          </Box>

          {counts.unmarked > 0 && (
            <Alert severity="info">
              {counts.unmarked} room(s) still unmarked. You can complete
              anyway after review if that matches the house process.
            </Alert>
          )}

          {/* Room cards */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {sortedRooms.map((room) => {
              const result = openSession.results[room.id];
              const status: RoomInspectionStatus =
                result?.status ?? "unmarked";
              const notes = result?.notes ?? "";
              const flagged = result?.flaggedItems ?? [];
              const expanded = !!expandedIds[room.id] || status !== "unmarked";
              const jj = jackJillHint(room, inspectionRooms);
              const err = statusErrorByRoom[room.id];

              const itemKeys = ITEM_KEYS.filter(
                (k) => k !== "bathroom" || room.hasBathroom,
              );

              return (
                <Box
                  key={room.id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    p: 1.5,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor:
                      status !== "unmarked"
                        ? statusColor(status)
                        : "background.paper",
                  }}
                >
                  {/* Card header — tap to expand/collapse */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 1,
                      cursor: "pointer",
                    }}
                    onClick={() => toggleExpanded(room.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleExpanded(room.id);
                      }
                    }}
                  >
                    <Box sx={{ flex: "1 1 180px", minWidth: 140 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {room.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {clientsLine(room)}
                      </Typography>
                      {jj && (
                        <Typography variant="caption" color="text.secondary">
                          {jj}
                        </Typography>
                      )}
                    </Box>
                    <Chip size="small" label={statusLabel(status)} />
                    <Typography variant="body2" color="text.secondary">
                      {expanded ? "Hide" : "Open"}
                    </Typography>
                  </Box>

                  {expanded && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.25,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Overall status */}
                      <Box
                        sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}
                      >
                        {STATUS_BUTTONS.map((s) => (
                          <Button
                            key={s}
                            size="small"
                            variant={status === s ? "contained" : "outlined"}
                            onClick={() => handleStatus(room.id, s)}
                            sx={{ minWidth: 100, py: 1 }}
                          >
                            {statusLabel(s)}
                          </Button>
                        ))}
                      </Box>

                      {err && <Alert severity="warning">{err}</Alert>}

                      {/* Checklist flags */}
                      <Box
                        sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}
                      >
                        {itemKeys.map((item) => {
                          const on = flagged.includes(item);
                          return (
                            <Chip
                              key={item}
                              label={itemLabel(item)}
                              color={on ? "warning" : "default"}
                              variant={on ? "filled" : "outlined"}
                              onClick={() => handleToggleItem(room.id, item)}
                              sx={{ py: 2 }}
                            />
                          );
                        })}
                      </Box>

                      {/* Notes */}
                      <TextField
                        label="Notes"
                        value={notes}
                        onChange={(e) => handleNotes(room.id, e.target.value)}
                        multiline
                        minRows={2}
                        fullWidth
                        helperText="Required for Fail or Needs Attention"
                      />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Review & Complete dialog */}
      <Dialog
        open={reviewOpen}
        onClose={handleCloseReview}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={handleConfirmComplete}>
          <DialogTitle>Room Inspection Summary</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 1 }}
          >
            <Typography variant="body2" color="text.secondary">
              Confirm before completing. This does not change Sign In/Out.
            </Typography>
            <Typography>Pass: {counts.pass}</Typography>
            <Typography>Needs Attention: {counts.needs_attention}</Typography>
            <Typography>Fail: {counts.fail}</Typography>
            <Typography>Unmarked: {counts.unmarked}</Typography>

            {counts.unmarked > 0 && (
              <Alert severity="warning">
                Some rooms are still unmarked.
              </Alert>
            )}

            {issueRooms.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Issues documented
                </Typography>
                {issueRooms.map(({ room, row }) => (
                  <Box key={room.id} sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {room.name} — {statusLabel(row.status)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {row.notes.trim() || "(no notes)"}
                    </Typography>
                    {row.flaggedItems.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Flagged:{" "}
                        {row.flaggedItems.map(itemLabel).join(", ")}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={handleCloseReview}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Confirm Complete
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Discard dialog */}
      <Dialog
        open={discardOpen}
        onClose={handleCloseDiscard}
        fullWidth
        maxWidth="xs"
      >
        <Box component="form" onSubmit={handleConfirmDiscard}>
          <DialogTitle>Discard open room inspection?</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              Room marks will be lost. Nothing is saved to history.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={handleCloseDiscard}>
              Cancel
            </Button>
            <Button type="submit" color="warning" variant="contained">
              Discard
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
