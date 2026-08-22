/**
 * ============================================================================
 * MAINTENANCE REQUESTS — living STATUS (authoritative for this feature)
 * Branch: feature/maintenance-requests (off develop)
 * Updated: 2026-08-22 — Phase 2 + free-text normalize on blur/submit
 * STOPPING POINT: Phase 2 complete (submit + optional area + text cleanup).
 *   Next = Phase 3 photos only after user approves. Do not auto-start Phase 3.
 * ============================================================================
 * MODEL
 * - Client submits one item per request (MR-YYYY-#### mock FE; BE later).
 * - Client-visible statuses: Submitted → … → Completed / Cancellation
 *   Requested / Closed - No Work Needed.
 * - Original request immutable; Add Information / cancel = timeline later.
 * - Locations seeded; staff catalog admin later. Specific Area/Room optional
 *   free text (helps locate; blank OK). Item free text later suggestions.
 * - Dup/recurring advisory only (parked Phase 6). No Mike UI in client v1.
 * - Confirm copy: submitted to queue — never claim Maintenance acknowledged.
 *
 * DONE — Phase 1 (commit 08d1ff3)
 * - features/maintenance-requests: types, config, devFixtures, api notes
 * - Redux slice + store register; route/nav Handyman
 * - Page shell New|My; one-item notice; DEV as-client + reset
 *
 * DONE — Phase 2
 * - SubmitMaintenanceRequestInput + mrNumber helper (MR-YYYY-####, Chicago year)
 * - slice submitMaintenanceRequest + DEV persist; timeline “submitted” event
 * - New Request form fields 1–7 (no photos)
 * - Specific Area / Room optional (not required; blank valid)
 * - Validation; Safety=No warning; Anything else Yes → notes
 * - Success alert: in queue, not acknowledged; form clear; count bumps
 * - saveDevMrPersisted restored in devFixtures
 * - Free-text cleanup (normalizeClientText): area, item, problem, notes
 *   on blur + submit — trim, spaces, accidental ALL CAPS, light punctuation
 *
 * NEXT
 * - Phase 3 photos when user approves (up to 3 optional)
 *
 * PARKED
 * - Photos (Ph3), My list/detail/timeline UI (Ph4), Add info + cancel (Ph5)
 * - Dup/recurring (Ph6), full DEV seed + Mike status sim (Ph7)
 * - Staff-on-behalf; location admin UI; backend/API; Open/Closed filters
 *
 * DEV NOTES
 * - import.meta.env.DEV only for as-client UI + localStorage
 * - Key: hhg-dev-maintenance-requests-v1 (DEV_MR_STORAGE_KEY)
 * - devFixtures.ts load/save/clear; Reset → Alex + empty requests
 * - Not security; removable for production
 *
 * PATHS
 * - pages/maintenance-requests/index.tsx     ← UI + this STATUS
 * - features/maintenance-requests/types.ts
 * - features/maintenance-requests/config.ts
 * - features/maintenance-requests/mrNumber.ts
 * - features/maintenance-requests/normalizeClientText.ts
 * - features/maintenance-requests/devFixtures.ts
 * - features/maintenance-requests/apiBoundaryNotes.ts
 * - store/slices/maintenanceRequests.ts
 * - routes.tsx → /maintenance-requests
 *
 * HARD LOCKS
 * - Client-side only; no Mike management UI this phase
 * - Single route /maintenance-requests
 * - America/Chicago for MR year + display when dates shown
 * - FE hide / DEV chips ≠ security
 * - Ignore removed old MaintenanceTicket model
 * - Confirmation must NOT say Maintenance acknowledged
 *
 * ============================================================================
 * Backend Handoff / Notes for TJ
 * ============================================================================
 * See features/maintenance-requests/apiBoundaryNotes.ts
 * Current: in-memory + DEV localStorage mock; no API.
 * Submit payload shape: SubmitMaintenanceRequestInput + server fills
 *   id, requestNumber, submittedAt, submitter, status=Submitted, timeline.
 * ============================================================================
 */

import { useMemo, useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  resetDevMrState,
  setDevActiveClient,
  submitMaintenanceRequest,
} from "@/store/slices/maintenanceRequests";
import {
  DEV_MOCK_CLIENTS,
  DEV_MR_STORAGE_KEY,
  ONE_ITEM_PER_REQUEST_NOTICE,
  MAINTENANCE_CATEGORIES,
  INITIAL_MAINTENANCE_LOCATIONS,
  MAINTENANCE_REQUEST_STATUSES,
  SAFETY_UNSAFE_CLIENT_WARNING,
} from "@/features/maintenance-requests/config";
import type {
  MaintenanceCategory,
  MaintenanceRequestsView,
  SafetyUsableAnswer,
} from "@/features/maintenance-requests/types";
import { normalizeClientText } from "@/features/maintenance-requests/normalizeClientText";

export default function MaintenanceRequestsPage() {
  const dispatch = useAppDispatch();
  const { activeDevClientId, activeDevClientName, locations, requests } =
    useAppSelector((s) => s.maintenanceRequests);

  const [view, setView] = useState<MaintenanceRequestsView>("new");

  // --- New Request form (Phase 2; no photos yet) ---
  const [locationId, setLocationId] = useState("");
  const [areaOrRoom, setAreaOrRoom] = useState("");
  const [item, setItem] = useState("");
  const [category, setCategory] = useState<MaintenanceCategory | "">("");
  const [stillUsableSafely, setStillUsableSafely] = useState<
    SafetyUsableAnswer | ""
  >("");
  const [problemDescription, setProblemDescription] = useState("");
  const [hasAdditionalNotes, setHasAdditionalNotes] = useState<"yes" | "no">(
    "no"
  );
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  /** Set after successful submit — queue message only (not acknowledged). */
  const [submitConfirmation, setSubmitConfirmation] = useState<string | null>(
    null
  );

  const activeLocations = useMemo(
    () => locations.filter((l) => !l.archived),
    [locations]
  );

  const clearNewRequestForm = () => {
    setLocationId("");
    setAreaOrRoom("");
    setItem("");
    setCategory("");
    setStillUsableSafely("");
    setProblemDescription("");
    setHasAdditionalNotes("no");
    setAdditionalNotes("");
    setFormErrors([]);
  };

  /** Blur/submit free-text cleanup (formatting only). */
  const blurAreaOrRoom = () => {
    setAreaOrRoom((v) => normalizeClientText(v, "phrase"));
  };
  const blurItem = () => {
    setItem((v) => normalizeClientText(v, "phrase"));
  };
  const blurProblemDescription = () => {
    setProblemDescription((v) => normalizeClientText(v, "sentence"));
  };
  const blurAdditionalNotes = () => {
    setAdditionalNotes((v) => normalizeClientText(v, "sentence"));
  };

  const handleSubmitNewRequest = (e: FormEvent) => {
    e.preventDefault();
    setSubmitConfirmation(null);

    // Normalize free text before validate + dispatch (blur may have been skipped)
    const cleanArea = normalizeClientText(areaOrRoom, "phrase");
    const cleanItem = normalizeClientText(item, "phrase");
    const cleanProblem = normalizeClientText(problemDescription, "sentence");
    const cleanNotes =
      hasAdditionalNotes === "yes"
        ? normalizeClientText(additionalNotes, "sentence")
        : "";

    setAreaOrRoom(cleanArea);
    setItem(cleanItem);
    setProblemDescription(cleanProblem);
    if (hasAdditionalNotes === "yes") {
      setAdditionalNotes(cleanNotes);
    }

    const errors: string[] = [];
    if (!locationId) errors.push("Location is required.");
    if (!cleanItem.trim()) errors.push("Item is required.");
    if (!category) errors.push("Category is required.");
    if (!stillUsableSafely) {
      errors.push(
        "Please answer whether the area/item can still be used safely."
      );
    }
    if (!cleanProblem.trim()) {
      errors.push("Describe the problem is required.");
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]);

    dispatch(
      submitMaintenanceRequest({
        locationId,
        areaOrRoom: cleanArea,
        item: cleanItem,
        category: category as MaintenanceCategory,
        stillUsableSafely: stillUsableSafely as SafetyUsableAnswer,
        problemDescription: cleanProblem,
        hasAdditionalNotes: hasAdditionalNotes === "yes",
        additionalNotes:
          hasAdditionalNotes === "yes" ? cleanNotes || undefined : undefined,
      })
    );

    const nextCount = requests.length + 1;
    setSubmitConfirmation(
      `Your maintenance request was submitted to the queue (${nextCount} request(s) on file for testing). Maintenance has not acknowledged it yet. Check My Requests later for status.`
    );
    clearNewRequestForm();
  };

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
            {MAINTENANCE_REQUEST_STATUSES.length} statuses · {requests.length}{" "}
            mock request(s) · seed names: {INITIAL_MAINTENANCE_LOCATIONS.length}
          </Typography>
          <Button
            type="button"
            size="small"
            variant="outlined"
            color="warning"
            onClick={() => {
              dispatch(resetDevMrState());
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

          {submitConfirmation && (
            <Alert
              severity="success"
              onClose={() => setSubmitConfirmation(null)}
            >
              {submitConfirmation}
            </Alert>
          )}

          {formErrors.length > 0 && (
            <Alert severity="error">
              {formErrors.map((err) => (
                <div key={err}>{err}</div>
              ))}
            </Alert>
          )}

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              New Request
            </Typography>
            {isDev && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Submitting as DEV client: {activeDevClientName}
              </Typography>
            )}

            <Box
              component="form"
              id="mr-new-request-form"
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              onSubmit={handleSubmitNewRequest}
            >
              {/* 1. Location */}
              <TextField
                select
                required
                label="Location"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                fullWidth
              >
                <MenuItem value="">
                  <em>Select location</em>
                </MenuItem>
                {activeLocations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* 2. Specific Area / Room (optional) */}
              <TextField
                label="Specific Area / Room (optional)"
                value={areaOrRoom}
                onChange={(e) => setAreaOrRoom(e.target.value)}
                onBlur={blurAreaOrRoom}
                fullWidth
                helperText="Add a room number or more specific area only if it helps locate the problem."
              />

              {/* 3. Item */}
              <TextField
                required
                label="Item"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                onBlur={blurItem}
                fullWidth
              />

              {/* 4. Category */}
              <TextField
                select
                required
                label="Category"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as MaintenanceCategory | "")
                }
                fullWidth
              >
                <MenuItem value="">
                  <em>Select category</em>
                </MenuItem>
                {MAINTENANCE_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>

              {/* 5. Safety */}
              <FormControl required>
                <FormLabel id="mr-safety-label">
                  Can this area/item still be used safely?
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="mr-safety-label"
                  value={stillUsableSafely}
                  onChange={(e) =>
                    setStillUsableSafely(e.target.value as SafetyUsableAnswer)
                  }
                >
                  <FormControlLabel
                    value="Yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="No" control={<Radio />} label="No" />
                  <FormControlLabel
                    value="Not Sure"
                    control={<Radio />}
                    label="Not Sure"
                  />
                </RadioGroup>
                {stillUsableSafely === "No" && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    {SAFETY_UNSAFE_CLIENT_WARNING}
                  </Alert>
                )}
              </FormControl>

              {/* 6. Describe the problem */}
              <TextField
                required
                label="Describe the problem"
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                onBlur={blurProblemDescription}
                fullWidth
                multiline
                minRows={3}
              />

              {/* 7. Anything else */}
              <FormControl>
                <FormLabel id="mr-extra-label">
                  Anything else Maintenance should know?
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="mr-extra-label"
                  value={hasAdditionalNotes}
                  onChange={(e) =>
                    setHasAdditionalNotes(e.target.value as "yes" | "no")
                  }
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>

              {hasAdditionalNotes === "yes" && (
                <TextField
                  label="Additional notes (optional detail)"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  onBlur={blurAdditionalNotes}
                  fullWidth
                  multiline
                  minRows={2}
                />
              )}

              <FormHelperText>
                Photos come in a later phase. One item per request.
              </FormHelperText>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button type="submit" variant="contained">
                  Submit request
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => {
                    clearNewRequestForm();
                    setSubmitConfirmation(null);
                  }}
                >
                  Clear form
                </Button>
              </Box>
            </Box>
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
