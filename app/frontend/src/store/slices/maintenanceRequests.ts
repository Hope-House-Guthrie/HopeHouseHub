/**
 * Maintenance Requests — Redux slice (client FE mock)
 *
 * Phase 1: catalog + DEV client identity + empty requests list.
 * Submit / timeline / cancel reducers come in later phases.
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
} from "@/features/maintenance-requests/types";

// ============================================================================
// State
// ============================================================================

export interface MaintenanceRequestsState {
  /** Seeded locations (active + archived later) */
  locations: MaintenanceLocation[];
  /** Client tickets (empty until submit phase) */
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
        saveDevMrPersisted({
          version: 1,
          activeDevClientId: state.activeDevClientId,
          requests: state.requests,
          mrSeq: state.mrSeq,
        });
      }
    },

    /**
     * DEV only: reset requests/seq and active mock client to Alex (first default).
     * Full seed pack lives in a later phase.
     * Uses literal default ids so reset never depends on array lookup quirks.
     */
    resetDevMrState: (state) => {
      // Hard default = first DEV mock client (Alex) — must match config DEV_MOCK_CLIENTS[0]
      const defaultId = "dev-client-alex";
      const defaultName = "Alex (DEV Client)";
      const client = resolveDevClient(defaultId);

      state.requests = [];
      state.mrSeq = 0;
      state.activeDevClientId = client.id;
      state.activeDevClientName = client.displayName || defaultName;
      state.locations = buildInitialLocationCatalog();

      if (import.meta.env.DEV) {
        // Clear first so a failed/partial write cannot leave the previous client
        clearDevMrPersisted();
        saveDevMrPersisted(defaultDevPersisted(defaultId));
      }
    },
  },
});

export const { setDevActiveClient, resetDevMrState } =
  maintenanceRequestsSlice.actions;
export default maintenanceRequestsSlice.reducer;
