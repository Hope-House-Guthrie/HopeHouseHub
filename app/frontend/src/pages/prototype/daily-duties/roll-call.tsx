/**
 * Daily Duties — Morning Roll Call (Phase 1)
 *
 * STATUS (branch: daily-duties) — leave 2026-08-18
 * DONE: Ph1 this page (UI label Morning Roll Call) · Ph2 Classes · Ph3 Rooms ·
 *   Ph4 Chore Check-Off
 * DONE elsewhere: Chore Library + Weekly Assign + day-of-week matrix (FE mock)
 * PARKED (hub-wide): disciplinary chores; auto week; History hub; backend;
 *   Class Library (catalog UI — not started in this pass)
 * BACKEND TODO: Active Clients master roster; optional SIO presence read-only;
 *   never auto-write Sign In/Out from Morning Roll Call corrections
 * DISPLAY: staff-facing name is Morning Roll Call; routes/files stay roll-call
 *
 * Staff workflow:
 * 1) Start Morning Roll Call
 * 2) Mark each client (one tap) — can disagree with Sign In/Out hint
 * 3) Review summary counts
 * 4) Confirm complete
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
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clientDisplayName,
  completeRollCall,
  discardOpenRollCall,
  setRollCallStatus,
  startRollCall,
  type PresenceHint,
  type RollCallStatus,
} from "@/store/slices/prototype/dailyDuties";

/** Status buttons shown on each row (not "unmarked") */
const MARK_STATUSES: RollCallStatus[] = [
  "present",
  "tardy",
  "absent",
  "excused",
  "signed_out",
];

function statusLabel(status: RollCallStatus): string {
  switch (status) {
    case "present":
      return "Present";
    case "tardy":
      return "Tardy";
    case "absent":
      return "Absent";
    case "excused":
      return "Excused";
    case "signed_out":
      return "Signed Out";
    default:
      return "Unmarked";
  }
}

/** SIO context only — Active Client is IN or OUT (no unknown). */
function hintLabel(hint: PresenceHint): string {
  return hint === "in" ? "Hint: IN" : "Hint: OUT";
}

function countColor(status: RollCallStatus): string {
  switch (status) {
    case "present":
      return "#e8f5e9";
    case "tardy":
      return "#fff8e1";
    case "absent":
      return "#ffebee";
    case "excused":
      return "#e3f2fd";
    case "signed_out":
      return "#f3e5f5";
    default:
      return "transparent";
  }
}

export default function RollCallPage() {
  const dispatch = useAppDispatch();
  const roster = useAppSelector((s) => s.dailyDuties.roster);
  const openRollCall = useAppSelector((s) => s.dailyDuties.openRollCall);
  const completedCount = useAppSelector(
    (s) => s.dailyDuties.completedRollCalls.length
  );

  const [reviewOpen, setReviewOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const sortedRoster = useMemo(
    () =>
      roster
        .slice()
        .sort((a, b) =>
          clientDisplayName(a).localeCompare(clientDisplayName(b))
        ),
    [roster]
  );

  const counts = useMemo(() => {
    const base: Record<RollCallStatus, number> = {
      unmarked: 0,
      present: 0,
      tardy: 0,
      absent: 0,
      excused: 0,
      signed_out: 0,
    };
    if (!openRollCall) return base;
    for (const mark of Object.values(openRollCall.marks)) {
      base[mark.status] += 1;
    }
    return base;
  }, [openRollCall]);

  const unmarkedCount = counts.unmarked;
  const allMarked =
    !!openRollCall && unmarkedCount === 0 && sortedRoster.length > 0;

  const handleStart = () => {
    setNotice(null);
    dispatch(startRollCall());
  };

  const handleMark = (clientId: string, status: RollCallStatus) => {
    dispatch(setRollCallStatus({ clientId, status }));
  };

  const handleOpenReview = () => {
    setReviewOpen(true);
  };

  const handleCloseReview = () => {
    setReviewOpen(false);
  };

  const handleConfirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(completeRollCall());
    setReviewOpen(false);
    setNotice("Morning Roll Call completed. Sign In/Out was not changed.");
  };

  const handleCloseDiscard = () => {
    setDiscardOpen(false);
  };

  const handleConfirmDiscard = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(discardOpenRollCall());
    setDiscardOpen(false);
    setNotice("Open Morning Roll Call discarded.");
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
          Morning Roll Call
        </Typography>
        <Button component={RouterLink} to="/daily-duties" variant="outlined">
          Back to Daily Duties
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary">
        Marks are staff decisions. Presence hints are context only and never
        auto-change Sign In/Out.
      </Typography>

      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      {/* Actions when no open session */}
      {!openRollCall && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Button variant="contained" onClick={handleStart}>
            Start Morning Roll Call
          </Button>
          <Typography variant="body2" color="text.secondary">
            Roster: {roster.length} · Completed sessions (this browser):{" "}
            {completedCount}
          </Typography>
        </Box>
      )}

      {/* Open session toolbar + summary strip */}
      {openRollCall && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography variant="subtitle1">
            In progress · {openRollCall.serviceDate}
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip
              label={`Present: ${counts.present}`}
              sx={{ bgcolor: countColor("present") }}
            />
            <Chip
              label={`Tardy: ${counts.tardy}`}
              sx={{ bgcolor: countColor("tardy") }}
            />
            <Chip
              label={`Absent: ${counts.absent}`}
              sx={{ bgcolor: countColor("absent") }}
            />
            <Chip
              label={`Excused: ${counts.excused}`}
              sx={{ bgcolor: countColor("excused") }}
            />
            <Chip
              label={`Signed Out: ${counts.signed_out}`}
              sx={{ bgcolor: countColor("signed_out") }}
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
              onClick={handleOpenReview}
              disabled={sortedRoster.length === 0}
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

          {!allMarked && (
            <Alert severity="info">
              {unmarkedCount} still unmarked. You can complete anyway after
              review if that matches the house process.
            </Alert>
          )}
        </Box>
      )}

      {/* Roster rows */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {sortedRoster.map((c) => {
          const markStatus = openRollCall?.marks[c.id]?.status ?? "unmarked";
          return (
            <Box
              key={c.id}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1,
                p: 1.5,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                bgcolor:
                  openRollCall && markStatus !== "unmarked"
                    ? countColor(markStatus)
                    : "background.paper",
              }}
            >
              <Box sx={{ flex: "1 1 160px", minWidth: 140 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {clientDisplayName(c)}
                </Typography>
                <Chip
                  size="small"
                  label={hintLabel(c.presenceHint)}
                  sx={{ mt: 0.5 }}
                />
              </Box>

              {openRollCall ? (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.75,
                    flex: "2 1 280px",
                  }}
                >
                  {MARK_STATUSES.map((status) => (
                    <Button
                      key={status}
                      size="small"
                      variant={markStatus === status ? "contained" : "outlined"}
                      onClick={() => handleMark(c.id, status)}
                      sx={{ minWidth: 88, py: 1 }}
                    >
                      {statusLabel(status)}
                    </Button>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Start Morning Roll Call to mark
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Review & Complete dialog */}
      <Dialog
        open={reviewOpen}
        onClose={handleCloseReview}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={handleConfirmComplete}>
          <DialogTitle>Morning Roll Call Summary</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 1 }}
          >
            <Typography variant="body2" color="text.secondary">
              Confirm before completing. This does not change Sign In/Out.
            </Typography>
            <Typography>Present: {counts.present}</Typography>
            <Typography>Tardy: {counts.tardy}</Typography>
            <Typography>Absent: {counts.absent}</Typography>
            <Typography>Excused: {counts.excused}</Typography>
            <Typography>Signed Out: {counts.signed_out}</Typography>
            <Typography>Unmarked: {counts.unmarked}</Typography>
            {unmarkedCount > 0 && (
              <Alert severity="warning">
                Some clients are still unmarked.
              </Alert>
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
          <DialogTitle>Discard open Morning Roll Call?</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              Marks will be lost. Nothing is saved to history.
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
