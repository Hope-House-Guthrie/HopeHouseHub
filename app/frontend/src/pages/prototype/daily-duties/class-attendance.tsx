/**
 * Daily Duties — Mandatory Class Attendance (Phase 2)
 *
 * STATUS (branch: daily-duties) — leave 2026-08-18
 * DONE (Phase 2 FE mock): class + date, marks, All Present, Review & Complete
 * DONE: Class Library catalog; Start picker = active classes only
 * DONE elsewhere: Ph1 Morning Roll Call · Ph3 · Ph4 · Chore Library + Weekly Assign + day matrix
 * PARKED (hub-wide): disciplinary chores; auto week; History hub; backend
 * BACKEND TODO: real class catalog + Active Clients roster; never auto-write SIO
 *
 * Staff workflow:
 * 1) Select class + date → Start
 * 2) Optional All Present, then fix exceptions
 * 3) Review summary counts
 * 4) Confirm complete
 */

import { useEffect, useMemo, useState } from "react";
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
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clientDisplayName,
  completeClassAttendance,
  discardOpenClassAttendance,
  markAllClassPresent,
  setClassAttendanceStatus,
  startClassAttendance,
  type ClassAttendanceStatus,
  type PresenceHint,
} from "@/store/slices/prototype/dailyDuties";

/** Status buttons shown on each row (not "unmarked") */
const MARK_STATUSES: ClassAttendanceStatus[] = [
  "present",
  "absent",
  "excused",
];

function statusLabel(status: ClassAttendanceStatus): string {
  switch (status) {
    case "present":
      return "Present";
    case "absent":
      return "Absent";
    case "excused":
      return "Excused";
    default:
      return "Unmarked";
  }
}

/** SIO context only — Active Client is IN or OUT (no unknown). */
function hintLabel(hint: PresenceHint): string {
  return hint === "in" ? "Hint: IN" : "Hint: OUT";
}

function countColor(status: ClassAttendanceStatus): string {
  switch (status) {
    case "present":
      return "#e8f5e9";
    case "absent":
      return "#ffebee";
    case "excused":
      return "#e3f2fd";
    default:
      return "transparent";
  }
}

/** Local calendar day YYYY-MM-DD for the date input default */
function todayYmdLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ClassAttendancePage() {
  const dispatch = useAppDispatch();
  const roster = useAppSelector((s) => s.dailyDuties.roster);
  const mandatoryClasses = useAppSelector(
    (s) => s.dailyDuties.mandatoryClasses
  );
  const openSession = useAppSelector((s) => s.dailyDuties.openClassAttendance);
  const completedCount = useAppSelector(
    (s) => s.dailyDuties.completedClassAttendances.length
  );

  // Setup form (only used when no open session)
  const [classId, setClassId] = useState("");
  const [serviceDate, setServiceDate] = useState(() => todayYmdLocal());
  const [setupError, setSetupError] = useState<string | null>(null);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  /** Active catalog only — archived classes hidden from Start */
  const activeClasses = useMemo(
    () =>
      mandatoryClasses
        .filter((c) => c.active)
        .slice()
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
        ),
    [mandatoryClasses],
  );

  // Keep classId on an active class when catalog changes
  useEffect(() => {
    if (activeClasses.length === 0) {
      setClassId("");
      return;
    }
    const first = activeClasses[0];
    if (first && !activeClasses.some((c) => c.id === classId)) {
      setClassId(first.id);
    }
  }, [activeClasses, classId]);

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
    const base: Record<ClassAttendanceStatus, number> = {
      unmarked: 0,
      present: 0,
      absent: 0,
      excused: 0,
    };
    if (!openSession) return base;
    for (const mark of Object.values(openSession.marks)) {
      base[mark.status] += 1;
    }
    return base;
  }, [openSession]);

  const unmarkedCount = counts.unmarked;
  const allMarked =
    !!openSession && unmarkedCount === 0 && sortedRoster.length > 0;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setSetupError(null);

    if (!classId.trim()) {
      setSetupError(
        activeClasses.length === 0
          ? "No active classes — open Class Library."
          : "Pick a class.",
      );
      return;
    }
    if (!serviceDate.trim()) {
      setSetupError("Pick a date.");
      return;
    }

    dispatch(
      startClassAttendance({
        classId: classId.trim(),
        serviceDate: serviceDate.trim(),
      })
    );
  };

  const handleMark = (clientId: string, status: ClassAttendanceStatus) => {
    dispatch(setClassAttendanceStatus({ clientId, status }));
  };

  const handleAllPresent = () => {
    dispatch(markAllClassPresent());
  };

  const handleCloseReview = () => {
    setReviewOpen(false);
  };

  const handleConfirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(completeClassAttendance());
    setReviewOpen(false);
    setNotice(
      "Class attendance completed. Sign In/Out was not changed."
    );
  };

  const handleCloseDiscard = () => {
    setDiscardOpen(false);
  };

  const handleConfirmDiscard = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(discardOpenClassAttendance());
    setDiscardOpen(false);
    setNotice("Open class attendance discarded.");
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
          Mandatory Class Attendance
        </Typography>
        <Button component={RouterLink} to="/daily-duties" variant="outlined">
          Back to Daily Duties
        </Button>
        <Button
          component={RouterLink}
          to="/daily-duties/class-library"
          variant="outlined"
        >
          Class Library
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary">
        Being inside the building does not prove class attendance. Presence
        hints are context only and never auto-change Sign In/Out.
      </Typography>

      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      {/* Setup: class + date when no open session */}
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
            select
            label="Class"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            fullWidth
            required
            disabled={activeClasses.length === 0}
            helperText={
              activeClasses.length === 0
                ? "No active classes — open Class Library"
                : undefined
            }
          >
            {activeClasses.length === 0 && (
              <MenuItem value="">
                <em>No active classes</em>
              </MenuItem>
            )}
            {activeClasses.map((cls) => (
              <MenuItem key={cls.id} value={cls.id}>
                {cls.name}
                {cls.instructor.trim() ? ` — ${cls.instructor}` : ""}
              </MenuItem>
            ))}
          </TextField>

          {/* date-only (not datetime-local) for class day */}
          <TextField
            type="date"
            label="Class date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            fullWidth
            required
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />

          {setupError && <Alert severity="error">{setupError}</Alert>}

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={activeClasses.length === 0 || !classId}
            >
              Start Attendance
            </Button>
            <Typography variant="body2" color="text.secondary">
              Roster: {roster.length} · Completed sessions (this browser):{" "}
              {completedCount}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Open session toolbar + summary strip */}
      {openSession && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography variant="subtitle1">
            In progress · {openSession.className} · {openSession.instructor} ·{" "}
            {openSession.serviceDate}
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip
              label={`Present: ${counts.present}`}
              sx={{ bgcolor: countColor("present") }}
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
              label={`Unmarked: ${counts.unmarked}`}
              color={counts.unmarked > 0 ? "warning" : "default"}
              variant={counts.unmarked > 0 ? "filled" : "outlined"}
            />
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Button variant="outlined" onClick={handleAllPresent}>
              All Present
            </Button>
            <Button
              variant="contained"
              onClick={() => setReviewOpen(true)}
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
          const markStatus =
            openSession?.marks[c.id]?.status ?? "unmarked";
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
                  openSession && markStatus !== "unmarked"
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

              {openSession ? (
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
                      variant={
                        markStatus === status ? "contained" : "outlined"
                      }
                      onClick={() => handleMark(c.id, status)}
                      sx={{ minWidth: 88, py: 1 }}
                    >
                      {statusLabel(status)}
                    </Button>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Start attendance to mark
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
          <DialogTitle>Class Attendance Summary</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 1 }}
          >
            <Typography variant="body2" color="text.secondary">
              Confirm before completing. This does not change Sign In/Out.
            </Typography>
            {openSession && (
              <Typography>
                {openSession.className} · {openSession.instructor} ·{" "}
                {openSession.serviceDate}
              </Typography>
            )}
            <Typography>Present: {counts.present}</Typography>
            <Typography>Absent: {counts.absent}</Typography>
            <Typography>Excused: {counts.excused}</Typography>
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
          <DialogTitle>Discard open class attendance?</DialogTitle>
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
