/**
 * Maintenance Requests — Redux slice (client FE mock)
 *
 * Phase 1: catalog + DEV client identity.
 * Phase 2: submitMaintenanceRequest (client create).
 *
 * ---------------------------------------------------------------------------
 * BACKEND TODO / FUTURE INTEGRATION
 * - Replace DEV client with auth user id + display name
 * - Persist requests server-side; drop DEV localStorage
 * - Authoritative MR numbers and location ids
 * - Staff-only status mutations (not client)
 * See features/maintenance-requests/apiBoundaryNotes.ts
 * ---------------------------------------------------------------------------
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  buildInitialLocationCatalog,
  DEV_MOCK_CLIENTS,
  MAX_MOCK_CLIENTS,
} from "@/features/maintenance-requests/config";
import {
  clearDevMrPersisted,
  defaultDevPersisted,
  loadDevMrPersisted,
  saveDevMrPersisted,
} from "@/features/maintenance-requests/devFixtures";
import type {
  DevMockClient,
  MaintenanceLocation,
  MaintenanceRequest,
  SubmitMaintenanceRequestInput,
} from "@/features/maintenance-requests/types";
import {
  chicagoYearNow,
  formatMaintenanceRequestNumber,
} from "@/features/maintenance-requests/mrNumber";

// ============================================================================
// State
// ============================================================================

export interface MaintenanceRequestsState {
  /** Seeded locations (active + archived later) */
  locations: MaintenanceLocation[];
  /** Client tickets */
  requests: MaintenanceRequest[];
  /** Mock sequence for MR-YYYY-#### (FE only) */
  mrSeq: number;
  /**
   * DEV “as client” identity for testing.
   * Production: ignore; use auth.user instead.
   */
  activeDevClientId: string;
  activeDevClientName: string;
}

function resolveDevClient(id: string): DevMockClient {
  return (
    DEV_MOCK_CLIENTS.find((c) => c.id === id) ??
    DEV_MOCK_CLIENTS[0] ?? {
      id: "dev-client-alex",
      displayName: "Alex (DEV Client)",
    }
  );
}

function buildInitialState(): MaintenanceRequestsState {
  const locations = buildInitialLocationCatalog();
  const fallbackClient = resolveDevClient(DEV_MOCK_CLIENTS[0]?.id ?? "");

  // DEV-only rehydrate so hard refresh keeps chosen mock client (and later tickets)
  if (import.meta.env.DEV) {
    const saved = loadDevMrPersisted();
    if (saved) {
      const client = resolveDevClient(saved.activeDevClientId);
      return {
        locations,
        requests: saved.requests ?? [],
        mrSeq: typeof saved.mrSeq === "number" ? saved.mrSeq : 0,
        activeDevClientId: client.id,
        activeDevClientName: client.displayName,
      };
    }
  }

  return {
    locations,
    requests: [],
    mrSeq: 0,
    activeDevClientId: fallbackClient.id,
    activeDevClientName: fallbackClient.displayName,
  };
}

const initialState: MaintenanceRequestsState = buildInitialState();

/** DEV-only: write current slice fields used by localStorage mock. */
function persistDevMrState(state: MaintenanceRequestsState): void {
  if (!import.meta.env.DEV) return;
  saveDevMrPersisted({
    version: 1,
    activeDevClientId: state.activeDevClientId,
    requests: state.requests,
    mrSeq: state.mrSeq,
  });
}

// ============================================================================
// Slice
// ============================================================================

export const maintenanceRequestsSlice = createSlice({
  name: "maintenanceRequests",
  initialState,
  reducers: {
    /**
     * DEV only: switch mock client for My Requests filtering later.
     * UI must not expose this control when !import.meta.env.DEV.
     */
    setDevActiveClient: (state, action: PayloadAction<string>) => {
      const client = resolveDevClient(action.payload);
      state.activeDevClientId = client.id;
      state.activeDevClientName = client.displayName;

      if (import.meta.env.DEV) {
        persistDevMrState(state);
      }
    },

    /**
     * DEV only: reset requests/seq and active mock client to Alex (first default).
     * Full seed pack lives in a later phase.
     */
    resetDevMrState: (state) => {
      const defaultId = "dev-client-alex";
      const defaultName = "Alex (DEV Client)";
      const client = resolveDevClient(defaultId);

      state.requests = [];
      state.mrSeq = 0;
      state.activeDevClientId = client.id;
      state.activeDevClientName = client.displayName || defaultName;
      state.locations = buildInitialLocationCatalog();

      if (import.meta.env.DEV) {
        clearDevMrPersisted();
        saveDevMrPersisted(defaultDevPersisted(defaultId));
      }
    },

    /**
     * Client submit (Phase 2). Builds full MaintenanceRequest.
     * Does not validate UI — page validates before dispatch.
     * BACKEND: POST; server assigns id + MR# + submittedAt + submitter.
     */
    submitMaintenanceRequest: (
      state,
      action: PayloadAction<SubmitMaintenanceRequestInput>,
    ) => {
      const input = action.payload;
      const location = state.locations.find((l) => l.id === input.locationId);
      const locationName = location?.name ?? "Unknown location";
      const submittedAt = new Date().toISOString();

      state.mrSeq += 1;
      const year = chicagoYearNow();
      const requestNumber = formatMaintenanceRequestNumber(year, state.mrSeq);

      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `mr-${submittedAt}-${state.mrSeq}`;

      const notes =
        input.hasAdditionalNotes && input.additionalNotes
          ? input.additionalNotes.trim()
          : undefined;

      const timelineEvent = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `tl-${submittedAt}`,
        kind: "submitted" as const,
        at: submittedAt,
        summary: "Request submitted to Maintenance queue",
        status: "Submitted" as const,
        actorLabel: state.activeDevClientName,
      };

      const request: MaintenanceRequest = {
        id,
        requestNumber,
        status: "Submitted",
        submittedByClientId: state.activeDevClientId,
        submittedByDisplayName: state.activeDevClientName,
        submittedAt,
        locationId: input.locationId,
        locationName,
        areaOrRoom: input.areaOrRoom.trim(),
        item: input.item.trim(),
        category: input.category,
        stillUsableSafely: input.stillUsableSafely,
        problemDescription: input.problemDescription.trim(),
        hasAdditionalNotes: Boolean(input.hasAdditionalNotes && notes),
        additionalNotes: notes,
        photos: (input.photos ?? []).slice(0, MAX_MAINTENANCE_PHOTOS),
        timeline: [timelineEvent],
      };

      state.requests.unshift(request);
      persistDevMrState(state);
    },
  },
});

export const { setDevActiveClient, resetDevMrState, submitMaintenanceRequest } =
  maintenanceRequestsSlice.actions;
export default maintenanceRequestsSlice.reducer;
