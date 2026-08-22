/**
 * Daily Duties — Chore Check-Off (Phase 4)
 *
 * STATUS (branch: daily-duties) — leave 2026-08-18
 * DONE (Phase 4 FE mock): auto list, multi-chore cards, Save day w/ leftovers
 * DONE: list from published assignments (choreId + name snapshot from library/assign)
 * DONE: day filter via assignmentAppliesOnDay (empty daysOfWeek = every day)
 * PARKED: disciplinary check-off; History hub UI
 * RULES: per chore separate; Not Reported ≠ violation; never write SIO; no Start button
 */

import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
  completeChoreCheckOff,
  ensureChoreCheckOffForDate,
  markAllChoresCompleted,
  resetOpenChoreCheckOff,
  setChoreCheckOffStatus,
  startChoreCheckOff,
  type ChoreCheckOffMark,
  type ChoreCheckOffStatus,
  type DailyDutiesClient,
  type PresenceHint,
} from "@/store/slices/prototype/dailyDuties";

function todayYmdLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function hintLabel(hint: PresenceHint): string {
  return hint === "in" ? "Hint: IN" : "Hint: OUT";
}

function statusBg(status: ChoreCheckOffStatus): string {
  return status === "completed" ? "#e8f5e9" : "transparent";
}

export default function ChoreCheckOffPage() {
  const dispatch = useAppDispatch();
  const roster = useAppSelector((s) => s.dailyDuties.roster);
  const openSession = useAppSelector((s) => s.dailyDuties.openChoreCheckOff);
  const completed = useAppSelector(
    (s) => s.dailyDuties.completedChoreCheckOffs,
  );
  const completedCount = completed.length;
  const lastCompleted = completed[0] ?? null;

  const [serviceDate, setServiceDate] = useState(() => todayYmdLocal());
  const [resetOpen, setResetOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Auto-open list for selected date — no Start form
  // Only re-runs when serviceDate changes (not when open becomes null after Save)
  useEffect(() => {
    const date = serviceDate.trim();
    if (!date) return;
    dispatch(ensureChoreCheckOffForDate({ serviceDate: date }));
  }, [dispatch, serviceDate]);

  const rosterById = useMemo(() => {
    const map: Record<string, DailyDutiesClient> = {};
    for (const c of roster) {
      map[c.id] = c;
    }
    return map;
  }, [roster]);

  const markCount = useMemo(() => {
    if (!openSession) return 0;
    return Object.keys(openSession.marks).length;
  }, [openSession]);

  const counts = useMemo(() => {
    let completedN = 0;
    let notReportedN = 0;
    if (openSession) {
      for (const row of Object.values(openSession.marks)) {
        if (row.status === "completed") completedN += 1;
        else notReportedN += 1;
      }
    }
    return { completedN, notReportedN, total: completedN + notReportedN };
  }, [openSession]);

  /** Still not reported — open session (review dialog) */
  const notReportedOpen = useMemo(() => {
    if (!openSession) return [] as ChoreCheckOffMark[];
    return Object.values(openSession.marks)
      .filter((m) => m.status === "not_reported")
      .slice()
      .sort((a, b) => {
        const na = rosterById[a.clientId]
          ? clientDisplayName(rosterById[a.clientId]!)
          : a.clientId;
        const nb = rosterById[b.clientId]
          ? clientDisplayName(rosterById[b.clientId]!)
          : b.clientId;
        const byName = na.localeCompare(nb);
        if (byName !== 0) return byName;
        return a.choreName.localeCompare(b.choreName);
      });
  }, [openSession, rosterById]);

  /** Still not reported — last saved day (post-complete summary) */
  const notReportedLastSaved = useMemo(() => {
    if (!lastCompleted) return [] as ChoreCheckOffMark[];
    return Object.values(lastCompleted.marks)
      .filter((m) => m.status === "not_reported")
      .slice()
      .sort((a, b) => a.choreName.localeCompare(b.choreName));
  }, [lastCompleted]);

  /** Clients who have ≥1 chore today, sorted by display name */
  const clientsWithMarks = useMemo(() => {
    if (!openSession) {
      return [] as {
        client: DailyDutiesClient;
        marks: ChoreCheckOffMark[];
      }[];
    }

    const byClient: Record<string, ChoreCheckOffMark[]> = {};
    for (const row of Object.values(openSession.marks)) {
      const list = byClient[row.clientId] ?? [];
      list.push(row);
      byClient[row.clientId] = list;
    }

    const rows: { client: DailyDutiesClient; marks: ChoreCheckOffMark[] }[] =
      [];
    for (const clientId of Object.keys(byClient)) {
      const client = rosterById[clientId];
      if (!client) continue;
      const marks = (byClient[clientId] ?? []).slice().sort((a, b) =>
        a.choreName.localeCompare(b.choreName),
      );
      rows.push({ client, marks });
    }

    rows.sort((a, b) =>
      clientDisplayName(a.client).localeCompare(clientDisplayName(b.client)),
    );
    return rows;
  }, [openSession, rosterById]);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clientsWithMarks;
    return clientsWithMarks.filter(({ client }) => {
      const name = clientDisplayName(client).toLowerCase();
      const full = `${client.firstName} ${client.lastName}`.toLowerCase();
      return name.includes(q) || full.includes(q);
    });
  }, [clientsWithMarks, search]);

  const handleCloseReset = () => {
    setResetOpen(false);
  };

  const handleConfirmReset = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(resetOpenChoreCheckOff());
    setResetOpen(false);
    setNotice("Today's checks reset to Not Reported.");
  };

  const handleCloseReview = () => {
    setReviewOpen(false);
  };

  const handleConfirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    const left = notReportedOpen.length;
    dispatch(completeChoreCheckOff());
    setReviewOpen(false);
    setSearch("");
    setNotice(
      left > 0
        ? `Day saved. ${left} chore(s) still Not Reported (see list below). Sign In/Out was not changed.`
        : "Day saved. All chores completed. Sign In/Out was not changed.",
    );
  };

  const handleWorkDayAgain = () => {
    setNotice(null);
    dispatch(startChoreCheckOff({ serviceDate: serviceDate.trim() }));
  };

  const handleMarkAll = () => {
    dispatch(markAllChoresCompleted());
    setNotice("All chores marked completed. Fix any that are still open.");
  };

  const handleSetStatus = (
    assignmentId: string,
    status: ChoreCheckOffStatus,
  ) => {
    dispatch(setChoreCheckOffStatus({ assignmentId, status }));
  };

  const nameForClientId = (clientId: string): string => {
    const c = rosterById[clientId];
    return c ? clientDisplayName(c) : clientId;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Button
        component={RouterLink}
        to="/daily-duties"
        sx={{ alignSelf: "flex-start" }}
      >
        Back to Daily Duties
      </Button>

      <Typography variant="h4" component="h1">
        Chore Check-Off
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Desk list from published assignments. Each chore is separate. Not
        Reported is not an automatic violation. Does not change Sign In/Out.
      </Typography>

      {notice ? (
        <Alert severity="success" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      ) : null}

      {/* Date + actions — no Start button */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "flex-end",
        }}
      >
        <TextField
          label="Service date"
          type="date"
          value={serviceDate}
          onChange={(e) => {
            setServiceDate(e.target.value);
            setNotice(null);
            setReviewOpen(false);
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 200 }}
        />
        {openSession ? (
          <>
            <Button
              type="button"
              variant="contained"
              color="primary"
              onClick={() => setReviewOpen(true)}
              disabled={markCount === 0}
            >
              Save day / Review
            </Button>
            <Button
              type="button"
              variant="contained"
              onClick={handleMarkAll}
              disabled={markCount === 0}
            >
              Mark all completed
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="warning"
              onClick={() => setResetOpen(true)}
            >
              Reset today&apos;s checks
            </Button>
          </>
        ) : (
          <Button type="button" variant="contained" onClick={handleWorkDayAgain}>
            Work this day again
          </Button>
        )}
      </Box>

      {openSession ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Chip label={`Open: ${openSession.serviceDate}`} color="primary" />
          <Chip label={`Total: ${counts.total}`} />
          <Chip
            label={`Completed: ${counts.completedN}`}
            sx={{ backgroundColor: "#e8f5e9" }}
          />
          <Chip
            label={`Not reported: ${counts.notReportedN}`}
            color={counts.notReportedN > 0 ? "warning" : "default"}
          />
        </Box>
      ) : (
        <Alert severity="info">
          No open list for this date.
          {lastCompleted
            ? ` Last saved: ${lastCompleted.serviceDate}.`
            : ""}{" "}
          Use &quot;Work this day again&quot; or change the date.
        </Alert>
      )}

      {/* After Save — who still had Not Reported on last saved day */}
      {!openSession && lastCompleted ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            p: 1.5,
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Saved day: {lastCompleted.serviceDate}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Not Reported is a desk signal only — not an automatic violation.
          </Typography>
          {notReportedLastSaved.length === 0 ? (
            <Alert severity="success">
              All chores were marked completed on that save.
            </Alert>
          ) : (
            <>
              <Alert severity="warning">
                {notReportedLastSaved.length} chore(s) still Not Reported on
                that save:
              </Alert>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {notReportedLastSaved.map((m) => (
                  <Typography
                    component="li"
                    variant="body2"
                    key={m.assignmentId}
                  >
                    {nameForClientId(m.clientId)} — {m.choreName}
                  </Typography>
                ))}
              </Box>
            </>
          )}
        </Box>
      ) : null}

      {openSession && markCount === 0 ? (
        <Alert severity="warning">
          No published chores apply for this day (mock). Check seed assignments.
        </Alert>
      ) : null}

      {openSession && counts.notReportedN > 0 ? (
        <Alert severity="info">
          {counts.notReportedN} chore(s) still Not Reported. You can Save day
          anyway — review will list who/what was left open.
        </Alert>
      ) : null}

      {openSession && markCount > 0 ? (
        <>
          <TextField
            label="Find client"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name…"
            sx={{ maxWidth: 360 }}
          />

          {filteredClients.length === 0 ? (
            <Alert severity="info">No clients match that search.</Alert>
          ) : null}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {filteredClients.map(({ client, marks }) => (
              <Card
                key={client.id}
                sx={{
                  borderLeft: 4,
                  borderColor: marks.every((m) => m.status === "completed")
                    ? "success.main"
                    : "divider",
                }}
              >
                <CardContent
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6" component="h2">
                      {clientDisplayName(client)}
                    </Typography>
                    <Chip
                      size="small"
                      label={hintLabel(client.presenceHint)}
                      variant="outlined"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {marks.length} chore{marks.length === 1 ? "" : "s"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {marks.map((mark) => (
                      <Box
                        key={mark.assignmentId}
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          alignItems: "center",
                          p: 1.5,
                          borderRadius: 1,
                          backgroundColor: statusBg(mark.status),
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ flex: "1 1 140px", fontWeight: 500 }}
                        >
                          {mark.choreName}
                        </Typography>
                        <Button
                          type="button"
                          size="large"
                          variant={
                            mark.status === "completed"
                              ? "contained"
                              : "outlined"
                          }
                          color="success"
                          onClick={() =>
                            handleSetStatus(mark.assignmentId, "completed")
                          }
                          sx={{ minHeight: 44 }}
                        >
                          Completed
                        </Button>
                        <Button
                          type="button"
                          size="large"
                          variant={
                            mark.status === "not_reported"
                              ? "contained"
                              : "outlined"
                          }
                          color="inherit"
                          onClick={() =>
                            handleSetStatus(mark.assignmentId, "not_reported")
                          }
                          sx={{ minHeight: 44 }}
                        >
                          Not Reported
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      ) : null}

      <Typography variant="body2" color="text.secondary">
        Completed days in memory: {completedCount}
        {lastCompleted ? ` · Last: ${lastCompleted.serviceDate}` : ""}
      </Typography>

      {/* Review & Complete — always allow confirm */}
      <Dialog open={reviewOpen} onClose={handleCloseReview} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleConfirmComplete}>
          <DialogTitle>Save chore day?</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
          >
            <Typography variant="body2">
              Date: <strong>{openSession?.serviceDate ?? serviceDate}</strong>
            </Typography>
            <Typography variant="body2">
              Completed: {counts.completedN} · Not reported:{" "}
              {counts.notReportedN} · Total: {counts.total}
            </Typography>
            {notReportedOpen.length > 0 ? (
              <>
                <Alert severity="warning">
                  {notReportedOpen.length} still Not Reported. You can save
                  anyway — this is not an automatic violation.
                </Alert>
                <Typography variant="subtitle2">Still not reported</Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  {notReportedOpen.map((m) => (
                    <Typography
                      component="li"
                      variant="body2"
                      key={m.assignmentId}
                    >
                      {nameForClientId(m.clientId)} — {m.choreName}
                    </Typography>
                  ))}
                </Box>
              </>
            ) : (
              <Alert severity="success">All chores marked completed.</Alert>
            )}
            <Typography variant="caption" color="text.secondary">
              Does not change Sign In/Out.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={handleCloseReview}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Confirm save day
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Reset dialog */}
      <Dialog open={resetOpen} onClose={handleCloseReset} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={handleConfirmReset}>
          <DialogTitle>Reset today&apos;s checks?</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              All chores go back to Not Reported for this open day. This does not
              undo an already-saved day.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={handleCloseReset}>
              Cancel
            </Button>
            <Button type="submit" color="warning" variant="contained">
              Reset checks
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
