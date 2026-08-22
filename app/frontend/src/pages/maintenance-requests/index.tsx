/**
 * ============================================================================
 * MAINTENANCE REQUESTS — living STATUS (authoritative for this feature)
 * Branch: feature/maintenance-requests (off develop)
 * Updated: 2026-08-22 — Phase 1 scaffold
 * STOPPING POINT: Phase 1 only. Wait for user test + approve before Phase 2.
 * ============================================================================
 * MODEL
 * - Client submits one item per request (MR-YYYY-#### mock FE; BE later).
 * - Client-visible statuses: Submitted → … → Completed / Cancellation
 *   Requested / Closed - No Work Needed.
 * - Original request immutable; Add Information / cancel = timeline later.
 * - Locations seeded; staff catalog admin later. Area/Item free text later.
 * - Dup/recurring advisory only (parked Phase 6). No Mike UI in client v1.
 *
 * DONE — Phase 1
 * - features/maintenance-requests: types, config, devFixtures shell, api notes
 * - Redux slice maintenanceRequests + store register
 * - Route /maintenance-requests + nav “Maintenance Requests” (Handyman)
 * - Page shell: New Request | My Requests placeholders
 * - One-item-per-request notice on New
 * - DEV foundation: as-client chips, DEV storage key/helpers, reset control
 * - Initial locations + categories + statuses in config
 *
 * NEXT — Phase 2 (not started)
 * - Working submit form (fields 1–7), mock MR#, confirm “in queue” (no ack claim)
 * - Safety = No client warning copy (config already has string)
 *
 * PARKED
 * - Photos (Ph3), My list/detail/timeline (Ph4), Add info + cancel (Ph5)
 * - Dup/recurring window (Ph6), full DEV seed + Mike status sim (Ph7)
 * - Staff-on-behalf submit; location Add/Rename/Archive UI; backend/API
 * - Open/Closed filters (closed stay in history)
 *
 * DEV NOTES
 * - import.meta.env.DEV only for as-client UI + localStorage
 * - Key: hhg-dev-maintenance-requests-v1 (config DEV_MR_STORAGE_KEY)
 * - File: features/maintenance-requests/devFixtures.ts
 * - Not security; removable for production
 * - Full multi-status fixture pack NOT in Phase 1
 *
 * PATHS
 * - pages/maintenance-requests/index.tsx     ← UI + this STATUS
 * - features/maintenance-requests/types.ts
 * - features/maintenance-requests/config.ts
 * - features/maintenance-requests/devFixtures.ts
 * - features/maintenance-requests/apiBoundaryNotes.ts
 * - store/slices/maintenanceRequests.ts
 * - routes.tsx → /maintenance-requests
 *
 * HARD LOCKS
 * - Client-side only this branch phase; no Mike management UI
 * - Single route /maintenance-requests
 * - America/Chicago for display when dates exist
 * - FE hide / DEV chips ≠ security
 * - Ignore removed old MaintenanceTicket model
 *
 * ============================================================================
 * Backend Handoff / Notes for TJ
 * ============================================================================
 * See features/maintenance-requests/apiBoundaryNotes.ts (authoritative short list).
 * Current: in-memory + DEV localStorage mock; no API.
 * ============================================================================
 */

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  resetDevMrState,
  setDevActiveClient,
} from "@/store/slices/maintenanceRequests";
import {
  DEV_MOCK_CLIENTS,
  DEV_MR_STORAGE_KEY,
  ONE_ITEM_PER_REQUEST_NOTICE,
  MAINTENANCE_CATEGORIES,
  INITIAL_MAINTENANCE_LOCATIONS,
  MAINTENANCE_REQUEST_STATUSES,
} from "@/features/maintenance-requests/config";
import type { MaintenanceRequestsView } from "@/features/maintenance-requests/types";

export default function MaintenanceRequestsPage() {
  const dispatch = useAppDispatch();
  const {
    activeDevClientId,
    activeDevClientName,
    locations,
    requests,
  } = useAppSelector((s) => s.maintenanceRequests);

  const [view, setView] = useState<MaintenanceRequestsView>("new");

  const isDev = import.meta.env.DEV;

  const activeLocationCount = useMemo(
    () => locations.filter((l) => !l.archived).length,
    [locations]
  );

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Page title */}
      <Typography variant="h4" component="h1">
        Maintenance Requests
      </Typography>

      {/* DEV foundation — as client + storage note (not production) */}
      {isDev && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderStyle: "dashed",
            borderColor: "warning.main",
            bgcolor: "warning.50",
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            DEV only — mock client (not real auth)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Switch who you are pretending to be. Persistence key:{" "}
            <code>{DEV_MR_STORAGE_KEY}</code>. Full seed pack / status sim =
            later phase.
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
            {DEV_MOCK_CLIENTS.map((c) => (
              <Chip
                key={c.id}
                label={c.displayName}
                color={c.id === activeDevClientId ? "primary" : "default"}
                variant={c.id === activeDevClientId ? "filled" : "outlined"}
                onClick={() => dispatch(setDevActiveClient(c.id))}
                clickable
              />
            ))}
          </Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Active: <strong>{activeDevClientName}</strong> ({activeDevClientId})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Catalog check: {activeLocationCount} locations ·{" "}
            {MAINTENANCE_CATEGORIES.length} categories ·{" "}
            {MAINTENANCE_REQUEST_STATUSES.length} statuses ·{" "}
            {requests.length} mock request(s) · seed names:{" "}
            {INITIAL_MAINTENANCE_LOCATIONS.length}
          </Typography>
          <Button
            type="button"
            size="small"
            variant="outlined"
            color="warning"
            onClick={() => {
              // Full DEV wipe: empty tickets/seq + force default client (Alex)
              dispatch(resetDevMrState());
              // Belt-and-suspenders if HMR left a stale reset reducer
              dispatch(setDevActiveClient("dev-client-alex"));
            }}
          >
            Reset DEV MR state
          </Button>
        </Paper>
      )}

      {/* New | My Requests */}
      <Tabs
        value={view}
        onChange={(_e, next: MaintenanceRequestsView) => setView(next)}
        aria-label="Maintenance Requests sections"
      >
        <Tab value="new" label="New Request" />
        <Tab value="mine" label="My Requests" />
      </Tabs>

      {view === "new" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Alert severity="info">{ONE_ITEM_PER_REQUEST_NOTICE}</Alert>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              New Request
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Form fields (location, area/room, item, category, safety,
              description, notes, photos) land in Phase 2+. This tab is a
              placeholder only.
            </Typography>
            {isDev && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Submit will use DEV client: {activeDevClientName}
              </Typography>
            )}
          </Paper>
        </Box>
      )}

      {view === "mine" && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            My Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            List, detail, status, and timeline come in a later phase. You will
            only see your own requests
            {isDev ? ` (DEV filter: ${activeDevClientName})` : ""}.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Mock tickets in store: {requests.length}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
