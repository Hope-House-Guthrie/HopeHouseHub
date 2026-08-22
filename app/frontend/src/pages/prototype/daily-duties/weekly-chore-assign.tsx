/**
 * Daily Duties — Weekly Chore Assign
 *
 * STATUS (branch: daily-duties) — leave 2026-08-18
 * DONE: client + available library chore → published row; list + remove;
 *   multi-chore per client OK
 * DONE: picker hides chores already assigned to anyone (one person per chore;
 *   Remove returns chore to available list); store enforces unique choreId
 * DONE: day-of-week matrix — Assign toggles + list chips + Edit days dialog
 *   (setPublishedChoreAssignmentDays; all on = every day / store [])
 * PARKED: auto week gen; disciplinary duties
 * RULES: snapshot choreName at assign; inactive library not assignable;
 *   never write SIO
 */

import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addPublishedChoreAssignment,
  clientDisplayName,
  formatDaysOfWeekLabel,
  normalizeDaysOfWeek,
  removePublishedChoreAssignment,
  setPublishedChoreAssignmentDays,
  WEEKDAY_SHORT,
  type PublishedChoreAssignment,
} from "@/store/slices/prototype/dailyDuties";

export default function WeeklyChoreAssignPage() {
  const dispatch = useAppDispatch();
  const roster = useAppSelector((s) => s.dailyDuties.roster);
  const choreLibrary = useAppSelector((s) => s.dailyDuties.choreLibrary);
  const published = useAppSelector(
    (s) => s.dailyDuties.publishedChoreAssignments,
  );

  const [clientId, setClientId] = useState("");
  const [choreId, setChoreId] = useState("");
  /** Toggle which days run; all seven on = every day ([] in store). */
  const [selectedDays, setSelectedDays] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6,
  ]);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] =
    useState<PublishedChoreAssignment | null>(null);
  const [editDaysTarget, setEditDaysTarget] =
    useState<PublishedChoreAssignment | null>(null);
  /** Days while Edit dialog is open (all seven = every day). */
  const [editDays, setEditDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const activeChores = useMemo(
    () =>
      choreLibrary
        .filter((c) => c.active)
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [choreLibrary],
  );

  /** choreIds already on the published week (any client) */
  const assignedChoreIds = useMemo(() => {
    const ids = new Set<string>();
    for (const a of published) {
      ids.add(a.choreId);
    }
    return ids;
  }, [published]);

  /**
   * Picker list: active + not yet given to anyone this week.
   * After Assign, chore disappears until Remove frees it.
   */
  const availableChores = useMemo(
    () => activeChores.filter((c) => !assignedChoreIds.has(c.id)),
    [activeChores, assignedChoreIds],
  );

  const sortedRoster = useMemo(
    () =>
      roster
        .slice()
        .sort((a, b) =>
          clientDisplayName(a).localeCompare(clientDisplayName(b)),
        ),
    [roster],
  );

  const rosterById = useMemo(() => {
    const m = new Map(roster.map((c) => [c.id, c]));
    return m;
  }, [roster]);

  /** Client-grouped assignment list for desk scanning */
  const grouped = useMemo(() => {
    const map = new Map<string, PublishedChoreAssignment[]>();
    for (const a of published) {
      const list = map.get(a.clientId) ?? [];
      list.push(a);
      map.set(a.clientId, list);
    }
    const entries = [...map.entries()].sort(([idA], [idB]) => {
      const ca = rosterById.get(idA);
      const cb = rosterById.get(idB);
      const na = ca ? clientDisplayName(ca) : idA;
      const nb = cb ? clientDisplayName(cb) : idB;
      return na.localeCompare(nb);
    });
    return entries;
  }, [published, rosterById]);

  const toggleAssignDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const setAllAssignDays = () => {
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!clientId || !choreId) {
      setError("Pick a client and an available chore.");
      return;
    }

    const chore = availableChores.find((c) => c.id === choreId);
    const client = rosterById.get(clientId);
    if (!chore || !client) {
      setError("Client or chore not available (may already be assigned).");
      setChoreId("");
      return;
    }

    // Global: one published row per library chore (any client)
    if (assignedChoreIds.has(choreId)) {
      setError("That chore is already assigned to someone this week.");
      setChoreId("");
      return;
    }

    const daysOfWeek = normalizeDaysOfWeek(selectedDays);

    dispatch(
      addPublishedChoreAssignment({
        clientId,
        choreId,
        daysOfWeek,
      }),
    );
    setNotice(
      `Assigned: ${clientDisplayName(client)} — ${chore.name} (${formatDaysOfWeekLabel(daysOfWeek)})`,
    );
    setChoreId("");
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const handleCloseRemove = () => {
    setRemoveTarget(null);
  };

  const handleConfirmRemove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!removeTarget) return;
    dispatch(
      removePublishedChoreAssignment({ assignmentId: removeTarget.id }),
    );
    setNotice(`Removed assignment: ${removeTarget.choreName}`);
    handleCloseRemove();
  };

  const openEditDays = (a: PublishedChoreAssignment) => {
    setEditDaysTarget(a);
    // [] in store = every day → show all seven checked
    setEditDays(
      a.daysOfWeek.length === 0 ? [0, 1, 2, 3, 4, 5, 6] : [...a.daysOfWeek],
    );
    setError(null);
    setNotice(null);
  };

  const handleCloseEditDays = () => {
    setEditDaysTarget(null);
    setEditDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const toggleEditDay = (day: number) => {
    setEditDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const setAllEditDays = () => {
    setEditDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const handleSaveEditDays = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDaysTarget) return;
    const daysOfWeek = normalizeDaysOfWeek(editDays);
    dispatch(
      setPublishedChoreAssignmentDays({
        assignmentId: editDaysTarget.id,
        daysOfWeek,
      }),
    );
    setNotice(
      `Days updated: ${editDaysTarget.choreName} (${formatDaysOfWeekLabel(daysOfWeek)})`,
    );
    handleCloseEditDays();
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
          Weekly Chore Assign
        </Typography>
        <Button
          component={RouterLink}
          to="/daily-duties/chore-library"
          variant="outlined"
        >
          Chore Library
        </Button>
        <Button component={RouterLink} to="/daily-duties" variant="outlined">
          Back to Daily Duties
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary">
        Publish who has which library chore. Desk Check-Off reads this list.
        Pick days below (all on = every day). Edit days on any published row.
        Not disciplinary.
      </Typography>

      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}
      {error && (
        <Alert severity="warning" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Assign form */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Assign chore
          </Typography>
          <Box
            component="form"
            onSubmit={handleAssign}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "flex-start",
            }}
          >
            <TextField
              select
              label="Client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              sx={{ minWidth: 200, flex: "1 1 200px" }}
              required
            >
              <MenuItem value="">
                <em>Select client</em>
              </MenuItem>
              {sortedRoster.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {clientDisplayName(c)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Available chore"
              value={choreId}
              onChange={(e) => setChoreId(e.target.value)}
              sx={{ minWidth: 280, flex: "2 1 280px" }}
              required
              disabled={availableChores.length === 0}
              helperText={
                availableChores.length === 0
                  ? "All active chores are assigned — remove one to free a slot"
                  : `${availableChores.length} left (already assigned hidden)`
              }
            >
              <MenuItem value="">
                <em>Select chore</em>
              </MenuItem>
              {availableChores.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Day-of-week toggles (all on = every day → store []) */}
            <Box
              sx={{
                flex: "1 1 100%",
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Days
                </Typography>
                <Button type="button" size="small" onClick={setAllAssignDays}>
                  Every day
                </Button>
                <Typography variant="caption" color="text.secondary">
                  {formatDaysOfWeekLabel(selectedDays)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {WEEKDAY_SHORT.map((label, day) => (
                  <FormControlLabel
                    key={label}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedDays.includes(day)}
                        onChange={() => toggleAssignDay(day)}
                      />
                    }
                    label={label}
                  />
                ))}
              </Box>
            </Box>

            <Button
              type="submit"
              variant="contained"
              sx={{ alignSelf: "center" }}
              disabled={!clientId || !choreId}
            >
              Assign
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        <Chip label={`Published rows: ${published.length}`} />
        <Chip
          label={`${availableChores.length} unassigned`}
          variant="outlined"
          color={availableChores.length === 0 ? "default" : "success"}
        />
        <Chip
          label="Days: all on = every day; Edit on each row"
          variant="outlined"
          color="info"
        />
        <Button
          component={RouterLink}
          to="/daily-duties/chore-check-off"
          size="small"
          variant="text"
        >
          Open Check-Off
        </Button>
      </Box>

      {/* Current published list */}
      <Typography variant="h6" component="h2">
        Current published assignments
      </Typography>

      {grouped.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No assignments yet. Assign above, or restore seed by refreshing the
          page (FE mock memory).
        </Typography>
      )}

      {grouped.map(([cid, rows]) => {
        const client = rosterById.get(cid);
        const title = client ? clientDisplayName(client) : cid;
        return (
          <Card key={cid} variant="outlined">
            <CardContent
              sx={{ display: "flex", flexDirection: "column", gap: 1 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {title}
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  ({rows.length} chore{rows.length === 1 ? "" : "s"})
                </Typography>
              </Typography>
              {rows.map((a) => (
                <Box
                  key={a.id}
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 1,
                    p: 1,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ flex: "1 1 200px" }}>
                    {a.choreName}
                  </Typography>
                  <Chip
                    size="small"
                    label={formatDaysOfWeekLabel(a.daysOfWeek)}
                    variant="outlined"
                    color={a.daysOfWeek.length === 0 ? "default" : "primary"}
                  />
                  <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    onClick={() => openEditDays(a)}
                  >
                    Edit days
                  </Button>
                  <Button
                    size="small"
                    color="warning"
                    variant="outlined"
                    onClick={() => setRemoveTarget(a)}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Remove confirm */}
      <Dialog
        open={!!removeTarget}
        onClose={handleCloseRemove}
        fullWidth
        maxWidth="xs"
      >
        <Box component="form" onSubmit={handleConfirmRemove}>
          <DialogTitle>Remove assignment?</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              {removeTarget?.choreName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Library chore stays. Only this client&apos;s published row is
              removed. Open check-off mark drops if present.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={handleCloseRemove}>
              Cancel
            </Button>
            <Button type="submit" color="warning" variant="contained">
              Remove
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Edit days */}
      <Dialog
        open={!!editDaysTarget}
        onClose={handleCloseEditDays}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={handleSaveEditDays}>
          <DialogTitle>Edit days</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {editDaysTarget?.choreName}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1,
                mb: 1,
              }}
            >
              <Button type="button" size="small" onClick={setAllEditDays}>
                Every day
              </Button>
              <Typography variant="caption" color="text.secondary">
                {formatDaysOfWeekLabel(editDays)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {WEEKDAY_SHORT.map((label, day) => (
                <FormControlLabel
                  key={label}
                  control={
                    <Checkbox
                      size="small"
                      checked={editDays.includes(day)}
                      onChange={() => toggleEditDay(day)}
                    />
                  }
                  label={label}
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={handleCloseEditDays}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Save days
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
