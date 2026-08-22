/**
 * ============================================================================
 * UA MANAGEMENT — living STATUS (leave this block for resume)
 * Branch: feature/random-ua-management (off develop)
 * Plan: ~/Desktop/Hope_House_Hub_Random_UA_System_Plan.docx
 * Updated: 2026-08-20
 * FE MOCK COMPLETE: Phases 0–8 (polish + handoff notes). Still no backend.
 * Resume here for dashboard widget / form→lastUaDate / live auth later.
 * ============================================================================
 * MODEL (TJ): sealed weekly pick — system chooses Mon–Fri day + 5 clients
 *   early; reveal ONLY on that day. Do not leak day/names before then.
 *
 * LAYOUT (admin management page)
 * - Random UAs Today first (revealed five at top for desk)
 * - Then Client UA list → Staff UA list → Pick Random Staff (under staff)
 * - DEV seal tools last (admin mock only)
 * - DEV mock role chips stay at top for demo only
 * - Handoff notes live in apiBoundaryNotes.ts only (not on-page Hub UI)
 *
 * ACCESS (product)
 * - Full /ua-management chrome → admin (ua-admin) only
 * - Revealed five + check-off → houseleader + staff + admin
 *   (real surface later = dashboard widget; mock previews desk here)
 * - viewer → no UA access (negative test)
 *
 * DONE (FE mock only — no backend)
 * - Ph0–7: tracker, seal, Today board, staff pool/pick, role gates
 * - Access cleanup (admin mgmt vs desk roles)
 * - Layout: client list first, staff + pick under it
 * - Ph8 polish: empty / <5 seal / no-active-staff messaging
 * - Ph8 handoff docs in apiBoundaryNotes.ts (not shown as Hub chrome)
 *
 * NOT BUILT YET (parked / later — beyond FE mock plan phases)
 * - Dashboard widget for Today desk (houseleader/staff)
 * - Backend: seal job, auth, audit, live Client feed, staff pool persist
 * - UA form hookup: submit done UA → update lastUaDate / tracker G-Y-R
 *   (Today “Mark done” is board-only; does NOT bump client last UA)
 * - Real Hub role strings (houseleader exact name TBD with Identity)
 * - Staff auto schedule (UI placeholder only)
 * - Final G/Y/R cutoffs + weight multipliers (OPEN POLICY with TJ)
 *
 * OPEN POLICY — see features/ua-management/apiBoundaryNotes.ts
 * - G/Y/R cutoffs, weights, seal time CT, dropout, same-day non-random,
 *   houseleader role string, void/reseal, auto staff schedule
 *
 * PARKED
 * - Old Mon20%→Fri100% daily lottery (removed from product model)
 * - Backend seal secrecy (do not trust FE-only hide)
 * ============================================================================
 */
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { MOCK_CLIENT_UA_ROWS } from "../../../features/prototype/ua-management/mockClients";
import {
  daysSinceUaDate,
  statusFromDaysSince,
} from "../../../features/prototype/ua-management/config";
import { buildSealedWeekClientDraw, SEALED_CLIENT_PICK_COUNT } from "../../../features/prototype/ua-management/weightedClientDraw";
import {
  asOfDateFrom,
  randomDayLabel,
  sealUiMode,
} from "../../../features/prototype/ua-management/sealReveal";
import {
  setRandomUaTodayCompletion,
  syncRandomUaTodayBoard,
} from "../../../features/prototype/ua-management/randomUaToday";
import {
  activeStaffUaMembers,
  addStaffUaMember,
  deactivateStaffUaMember,
  reactivateStaffUaMember,
} from "../../../features/prototype/ua-management/staffUaPool";
import type {
  ClientUaTrackerView,
  RandomUaTodayBoard,
  SealedWeekClientDraw,
  StaffUaPoolMember,
  StaffRandomPickResult,
  UaManagementRoleHint,
  UaRecencyStatus,
} from "../../../features/prototype/ua-management/types";
import {
  capabilitiesForRoles,
  DEFAULT_MOCK_UA_ROLES,
  MOCK_UA_ROLE_OPTIONS,
} from "../../../features/prototype/ua-management/accessPolicy";
import { MOCK_STAFF_UA_POOL } from "../../../features/prototype/ua-management/mockStaffPool";
import { pickRandomActiveStaff } from "../../../features/prototype/ua-management/staffRandomPick";

function buildViews(): ClientUaTrackerView[] {
  return MOCK_CLIENT_UA_ROWS.map((row) => {
    const daysSinceLastUa = daysSinceUaDate(row.lastUaDate);
    const status = statusFromDaysSince(daysSinceLastUa);
    return { ...row, daysSinceLastUa, status };
  }).sort((a, b) => {
    // Never / oldest first so red/never stand out
    const da = a.daysSinceLastUa ?? 9999;
    const db = b.daysSinceLastUa ?? 9999;
    return db - da;
  });
}

function statusChipColor(
  status: UaRecencyStatus
): "success" | "warning" | "error" | "default" {
  if (status === "green") return "success";
  if (status === "yellow") return "warning";
  if (status === "red") return "error";
  return "default";
}

function statusLabel(status: UaRecencyStatus): string {
  if (status === "never") return "Never";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function UaManagementPage() {
  const rows = buildViews();

  // Phase 2/3 DEV: mock seal + simulated “today” for hide/reveal
  const [mockSeal, setMockSeal] = useState<SealedWeekClientDraw | null>(null);
  // YYYY-MM-DD — change this to jump before/on/after sealed randomDate
  const [simAsOfDate, setSimAsOfDate] = useState<string>(() => asOfDateFrom());

  // Phase 4: staff board (stable completion; cleared/rebuilt via sync)
  const [todayBoard, setTodayBoard] = useState<RandomUaTodayBoard | null>(null);

  // Phase 5: Staff UA Pool (mock local state - not Hub roles)
  const [staffPool, setStaffPool] = useState<StaffUaPoolMember[]>(() => [
    ...MOCK_STAFF_UA_POOL,
  ]);
  const [newStaffName, setNewStaffName] = useState("");

  // Phase 6: manual pick result (stable until pick again / clear) - NOT a day seal
  const [staffPick, setStaffPick] = useState<StaffRandomPickResult | null>(
    null
  );
  // Placeholder only - no automatic schedule in this phase
  const [staffAutoRandomEnabled, setStaffAutoRandomEnabled] = useState(false);

  // Phase 7: mock roles → FE gates only (not real auth)
  const [mockRoles, setMockRoles] = useState<UaManagementRoleHint[]>(() => [
    ...DEFAULT_MOCK_UA_ROLES,
  ]);

  const caps = useMemo(
    () => capabilitiesForRoles(mockRoles),
    [mockRoles]
  );

  const toggleMockRole = (role: UaManagementRoleHint) => {
    setMockRoles((prev) => {
      if (prev.includes(role)) {
        // Keep at least one role so the page doesn’t go fully blank
        if (prev.length === 1) return prev;
        return prev.filter((r) => r !== role);
      }
      return [...prev, role];
    });
  };

  const uiMode = useMemo(
    () => sealUiMode(mockSeal, simAsOfDate),
    [mockSeal, simAsOfDate]
  );

  // Keep board in sync with seal + sim day; preserve pending/done on same seal
  useEffect(() => {
    setTodayBoard((prev) =>
      syncRandomUaTodayBoard(mockSeal, simAsOfDate, prev)
    );
  }, [mockSeal, simAsOfDate]);

  const handleDevRedraw = () => {
    // Seal uses “now” for weight as-of; reveal uses simAsOfDate separately
    setMockSeal(buildSealedWeekClientDraw(MOCK_CLIENT_UA_ROWS));
  };

  const handleMarkDone = (clientId: string) => {
    setTodayBoard((prev) =>
      prev ? setRandomUaTodayCompletion(prev, clientId, "done") : prev
    );
  };

  const handleMarkPending = (clientId: string) => {
    setTodayBoard((prev) =>
      prev ? setRandomUaTodayCompletion(prev, clientId, "pending") : prev
    );
  };

  const handleAddStaff = () => {
    setStaffPool((prev) => addStaffUaMember(prev, newStaffName));
    setNewStaffName("");
  };

  const handleDeactivateStaff = (id: string) => {
    setStaffPool((prev) => deactivateStaffUaMember(prev, id));
  };

  const handleReactivateStaff = (id: string) => {
    setStaffPool((prev) => reactivateStaffUaMember(prev, id));
  };

  const handlePickRandomStaff = () => {
    const result = pickRandomActiveStaff(staffPool);
    if (!result) {
      // No active staff - clear any stale pick
      setStaffPick(null);
      return;
    }
    setStaffPick(result);
  };

  const handleClearStaffPick = () => {
    setStaffPick(null);
  };

  const pendingCount =
    todayBoard?.items.filter((i) => i.completion === "pending").length ?? 0;
  const doneCount =
    todayBoard?.items.filter((i) => i.completion === "done").length ?? 0;
  // Phase 8: edge counts for empty / under-target messaging
  const activeStaffCount = activeStaffUaMembers(staffPool).length;
  const sealClientCount = mockSeal?.clients.length ?? 0;
  const sealUnderTarget =
    mockSeal !== null && sealClientCount < SEALED_CLIENT_PICK_COUNT;

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h5" component="h1">
        UA Management
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Client UA recency tracker (mock). Green ≤ 14 days, yellow ≤ 30, else red.
        Tracker must not show the real upcoming sealed day/list.
      </Typography>

      {/* Phase 7 DEV — mock role simulator (always visible for demo) */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          DEV — Mock role gates (Phase 7)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          FE-only — not real Hub auth. Product: admin = full UA Management.
          Houseleader/staff = Random UAs Today see + check-off (dashboard later).
          Demo tip: stay admin → Redraw seal → flip to houseleader to preview
          the desk.
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            alignItems: "center",
          }}
        >
          {MOCK_UA_ROLE_OPTIONS.map((role) => {
            const on = mockRoles.includes(role);
            return (
              <Chip
                key={role}
                label={role}
                color={on ? "primary" : "default"}
                variant={on ? "filled" : "outlined"}
                onClick={() => toggleMockRole(role)}
                sx={{ cursor: "pointer" }}
              />
            );
          })}
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Active: {mockRoles.join(", ") || "(none)"} · mgmtPage=
          {String(caps.canAccessUaManagementPage)} · tracker=
          {String(caps.canViewTracker)} · today=
          {String(caps.canViewRandomUaToday)} · mark=
          {String(caps.canMarkRandomUaToday)} · pool=
          {String(caps.canManageStaffPool)} · pick=
          {String(caps.canPickRandomStaff)} · dev=
          {String(caps.canUseDevSealTools)}
        </Typography>
      </Paper>

      {/* Desk-only preview when not admin management (future dashboard) */}
      {!caps.canAccessUaManagementPage && caps.canViewRandomUaToday && (
        <Alert severity="info">
          Dashboard-style desk preview (houseleader/staff). Full UA Management
          tools stay admin-only. Real home for this list will be the dashboard.
        </Alert>
      )}

      {!caps.canAccessUaManagementPage && !caps.canViewRandomUaToday && (
        <Alert severity="warning">
          No UA access for current mock roles (e.g. viewer). Admin manages the
          page; houseleader/staff get Today check-off on the dashboard.
        </Alert>
      )}

      {/* Random UAs Today — desk for houseleader/staff/admin (dashboard later) */}
      {caps.canViewRandomUaToday && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Random UAs Today
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Revealed five for the sealed day only. Houseleaders and staff check
            off here (mock; dashboard later). Does not reroll names. UA form
            hookup later.
          </Typography>

          {!mockSeal && (
            <Alert severity="info">
              {caps.canUseDevSealTools
                ? "No sealed week yet. Use DEV redraw below to create a mock seal."
                : "No sealed week in this mock session yet. Flip to admin, Redraw mock sealed five, set sim today to reveal day, then return to houseleader/staff."}
            </Alert>
          )}

          {mockSeal && !todayBoard && (
            <Alert severity="info">
              No random UA day today (or seal still sealed). Nothing to list —
              day and names stay hidden until reveal day.
            </Alert>
          )}

          {todayBoard && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {randomDayLabel(todayBoard.randomDay)} ({todayBoard.randomDate})
                {" · "}
                {todayBoard.items.length} on list · {pendingCount} pending ·{" "}
                {doneCount} done
              </Typography>
              {todayBoard.items.length === 0 ? (
                <Alert severity="warning">
                  Revealed day but the sealed list is empty (no eligible clients
                  at seal time).
                </Alert>
              ) : null}
              {sealUnderTarget && todayBoard.items.length > 0 && (
                <Alert severity="warning">
                  Sealed list has {sealClientCount} client
                  {sealClientCount === 1 ? "" : "s"} (target{" "}
                  {SEALED_CLIENT_PICK_COUNT}). Fewer than five eligible at seal —
                  open policy.
                </Alert>
              )}
              {todayBoard.items.map((item) => (
                <Box
                  key={item.clientId}
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ minWidth: 140 }}>
                    {item.displayName}
                  </Typography>
                  <Chip
                    size="small"
                    label={statusLabel(item.statusAtSeal)}
                    color={statusChipColor(item.statusAtSeal)}
                    variant={
                      item.statusAtSeal === "never" ? "outlined" : "filled"
                    }
                  />
                  <Chip
                    size="small"
                    label={item.completion === "done" ? "Done" : "Pending"}
                    color={item.completion === "done" ? "success" : "default"}
                    variant={item.completion === "done" ? "filled" : "outlined"}
                  />
                  {caps.canMarkRandomUaToday &&
                    (item.completion === "pending" ? (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleMarkDone(item.clientId)}
                      >
                        Mark done
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleMarkPending(item.clientId)}
                      >
                        Undo done
                      </Button>
                    ))}
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      )}

      {/* Client list (admin management) — after Today desk */}
      {caps.canViewTracker && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Client UA list
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Recency tracker (mock). Green ≤ 14 days, yellow ≤ 30, else red. Does
            not show the sealed day or upcoming five.
          </Typography>
          {rows.length === 0 ? (
            <Alert severity="info">
              No clients in the mock list. Later this is the active Client-role
              feed.
            </Alert>
          ) : (
            <TableContainer>
              <Table size="small" aria-label="Client UA recency tracker">
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Last UA</TableCell>
                    <TableCell>Days since</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last type</TableCell>
                    <TableCell>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.displayName}</TableCell>
                      <TableCell>{row.lastUaDate ?? "—"}</TableCell>
                      <TableCell>
                        {row.daysSinceLastUa === null
                          ? "—"
                          : row.daysSinceLastUa}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={statusLabel(row.status)}
                          color={statusChipColor(row.status)}
                          variant={
                            row.status === "never" ? "outlined" : "filled"
                          }
                        />
                      </TableCell>
                      <TableCell>{row.lastUaType ?? "—"}</TableCell>
                      <TableCell>{row.lastUaReason ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* 2) Staff list + 3) Pick Random Staff directly under it (admin) */}
      {(caps.canManageStaffPool || caps.canPickRandomStaff) && (
        <Paper sx={{ p: 2 }}>
          {caps.canManageStaffPool && (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Staff UA list
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
                Paid staff eligible for staff random UA. Not Hub roles.
                Deactivate keeps the row for later history. Mock only.
              </Typography>

              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddStaff();
                }}
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "center",
                  mb: 1.5,
                }}
              >
                <TextField
                  label="Add staff name"
                  size="small"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  sx={{ minWidth: 200 }}
                />
                <Button type="submit" variant="contained" size="small">
                  Add
                </Button>
              </Box>

              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}
              >
                {staffPool.length === 0 ? (
                  <Alert severity="info">
                    Staff UA list is empty. Add a paid staff name above.
                  </Alert>
                ) : (
                  staffPool.map((m) => (
                    <Box
                      key={m.id}
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ minWidth: 180 }}>
                        {m.displayName}
                      </Typography>
                      <Chip
                        size="small"
                        label={m.active ? "Active" : "Inactive"}
                        color={m.active ? "success" : "default"}
                        variant={m.active ? "filled" : "outlined"}
                      />
                      {m.active ? (
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          onClick={() => handleDeactivateStaff(m.id)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleReactivateStaff(m.id)}
                        >
                          Reactivate
                        </Button>
                      )}
                    </Box>
                  ))
                )}
              </Box>
            </>
          )}

          {/* Pick sits directly under the staff list */}
          {caps.canPickRandomStaff && (
            <Box
              sx={{
                pt: caps.canManageStaffPool ? 2 : 0,
                borderTop: caps.canManageStaffPool
                  ? "1px solid"
                  : "none",
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Pick Random Staff
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
                Picks one active staff from the list above. Not a client weekday
                seal. Result stays until you pick again or clear. Auto mode is
                a placeholder only (no schedule yet).
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "center",
                  mb: 1.5,
                }}
              >
                <Button
                  variant="contained"
                  onClick={handlePickRandomStaff}
                  disabled={activeStaffCount === 0}
                >
                  Pick Random Staff
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClearStaffPick}
                  disabled={!staffPick}
                >
                  Clear Pick
                </Button>
                <FormControlLabel
                  control={
                    <Switch
                      checked={staffAutoRandomEnabled}
                      onChange={(e) =>
                        setStaffAutoRandomEnabled(e.target.checked)
                      }
                      size="small"
                    />
                  }
                  label="Automatic Staff Random UA (placeholder - no schedule)"
                />
              </Box>

              {activeStaffCount === 0 && (
                <Alert severity="warning" sx={{ mb: 1.5 }}>
                  No active staff in the pool. Activate or add someone before
                  picking.
                </Alert>
              )}

              {staffAutoRandomEnabled && (
                <Alert severity="info" sx={{ mb: 1.5 }}>
                  Auto is ON in the UI only. No timer or backend job runs yet -
                  policy later (placeholder only).
                </Alert>
              )}

              {/* Result only after pick — no empty “preview” under the button */}
              {staffPick && (
                <Alert severity="success">
                  Selected: <strong>{staffPick.displayName}</strong>
                  {" · "}
                  picked at {staffPick.pickedAt}
                </Alert>
              )}
            </Box>
          )}
        </Paper>
      )}

      {/* DEV / mock only — not the staff desk */}
      {caps.canUseDevSealTools && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            DEV — Mock sealed draw + reveal (Phase 3)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Redraw seals day + up to 5 clients. Sim “today” controls hide vs
            reveal. Hidden must not show day, date, or names. Not production
            desk.
          </Typography>

          {/* Simulated calendar “today” (date-only) */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <TextField
              label="Sim today (asOf)"
              type="date"
              size="small"
              value={simAsOfDate}
              onChange={(e) => setSimAsOfDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSimAsOfDate(asOfDateFrom())}
            >
              Reset sim to real today
            </Button>
            <Button variant="contained" onClick={handleDevRedraw}>
              Redraw mock sealed five
            </Button>
          </Box>

          {!mockSeal && (
            <Alert severity="info">No mock seal yet — click Redraw.</Alert>
          )}

          {mockSeal && sealUnderTarget && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              This seal has {sealClientCount} client
              {sealClientCount === 1 ? "" : "s"} (target{" "}
              {SEALED_CLIENT_PICK_COUNT}). Draw takes fewer when the pool is
              smaller.
            </Alert>
          )}

          {mockSeal && uiMode === "hidden" && (
            <Alert severity="warning">
              Seal is HIDDEN for sim today {simAsOfDate}. Day, randomDate, and
              client names are locked until reveal day (not shown here on
              purpose).
            </Alert>
          )}

          {/* Revealed: metadata only — names live in Random UAs Today at top */}
          {mockSeal && uiMode === "revealed" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Alert severity="success">
                Seal REVEALED for sim today {simAsOfDate}. Names show in Random
                UAs Today above (not re-listed here).
              </Alert>
              <Typography variant="body2" color="text.secondary">
                weekId: {mockSeal.weekId}
                {" · "}
                day: {randomDayLabel(mockSeal.randomDay)} ({mockSeal.randomDate})
                {" · "}
                sealed count: {mockSeal.clients.length}
                {sealUnderTarget
                  ? ` / ${SEALED_CLIENT_PICK_COUNT} target`
                  : ""}
              </Typography>
            </Box>
          )}
        </Paper>
      )}

    </Box>
  );
}
