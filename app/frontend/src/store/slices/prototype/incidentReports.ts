/**
 * Incident Reports Redux Slice
 * 
 * Purpose: Manages incident report state for the Hope House Hub
 * 
 * Fields map to the paper Incident Report form:
 * - Client name: Can be multiple clients per incident
 * - Date and time: When the incident occurred
 * - Location: Where the incident happened
 * - Description: Injury/incident reason
 * - Witness info: Contact information for witnesses
 * - Medical attention: First aid, ambulance, 911
 * - Emergency services: Police, Fire, EMS responders
 * - Follow-up: Notes for follow-up actions
 * - Signatures: Admin signature, client signatures
 * 
 * BACKEND TODO / FUTURE INTEGRATION
 * - Generate guaranteed unique Incident Numbers
 * - Store incident records
 * - Associate one Incident # with multiple clients
 * - Store witness information
 * - Store responder information
 * - Store signatures
 * - Handle Unable/Refused to Sign authorization
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ============================================================================
// Types
// ============================================================================

// Client information - supports multiple clients per incident
export interface Client {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  relationship: string; // e.g., "Primary" | "Secondary"
  signature?: string; // Base64 PNG
  signatureDate?: string;
  unableOrRefusedToSign?: boolean;
  unableOrRefusedReason?: string;
}

// Witness information
export interface Witness {
  id: string;
  name: string;
  relationship: "Client" | "Staff" | "Volunteer" | "Other";
  phone?: string;
  email?: string;
}

// Emergency service responder
export interface Responder {
  id: string;
  service: "Police" | "Fire Department" | "EMS / Ambulance" | "Other";
  name?: string;
  badgeId?: string;
  agency?: string;
  unit?: string;
}

// Medical attention details
export interface MedicalAttention {
  needed: boolean;
  firstAidGiven: boolean;
  called911: boolean;
  ambulanceCalled: boolean;
  transported: boolean;
  firstAidProvider?: string;
  medicalNotes?: string;
}

// Incident types
export type IncidentType =
  | "Injury"
  | "Client Conflict"
  | "Rule / Policy Violation"
  | "Property Damage"
  | "Medical"
  | "Behavioral"
  | "Safety / Security"
  | "Accident"
  | "Other";

// Follow-up details
export interface FollowUp {
  requiresFollowUp: boolean;
  notes?: string;
  scheduledDate?: string;
}

// Main Incident Report interface
export interface IncidentReport {
  id: string;
  incidentNumber: string; // e.g., "IR-2025-0243"
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  primaryClientId?: string;
  clients: Client[];
  incidentType: IncidentType;
  description: string;
  witnesses: Witness[];
  emergencyServices: string[]; // ["Police", "EMS / Ambulance"]
  responders: Responder[];
  medicalAttention: MedicalAttention;
  followUp: FollowUp;
  adminSignature?: string;
  adminSignatureDate?: string;
  status:
    | "draft"
    | "pending"
    | "awaitingSignature"
    | "awaitingAdmin"
    | "followUpNeeded"
    | "complete"
    | "closed";
  submittedAt: string;
}

// ============================================================================
// Helper: Generate mock Incident Number
// ============================================================================

let incidentCounter = 1000;

const generateIncidentNumber = (): string => {
  const year = new Date().getFullYear();
  incidentCounter += 1;
  const padded = String(incidentCounter).padStart(4, "0");
  return `IR-${year}-${padded}`;
};

// ============================================================================
// Initial State
// ============================================================================

const createInitialClient = (): Client => ({
  id: crypto.randomUUID(),
  firstName: "",
  middleName: null,
  lastName: "",
  relationship: "Primary",
});

const createInitialWitness = (): Witness => ({
  id: crypto.randomUUID(),
  name: "",
  relationship: "Client",
  phone: "",
  email: "",
});

const createInitialResponder = (): Responder => ({
  id: crypto.randomUUID(),
  service: "Police",
  name: "",
  badgeId: "",
  agency: "",
  unit: "",
});

const createInitialState = (): IncidentReport => ({
  id: crypto.randomUUID(),
  incidentNumber: generateIncidentNumber(),
  date: "",
  time: "",
  location: "",
  clients: [createInitialClient()],
  incidentType: "Other",
  description: "",
  witnesses: [],
  emergencyServices: [],
  responders: [],
  medicalAttention: {
    needed: false,
    firstAidGiven: false,
    called911: false,
    ambulanceCalled: false,
    transported: false,
    firstAidProvider: "",
    medicalNotes: "",
  },
  followUp: {
    requiresFollowUp: false,
    notes: "",
  },
  adminSignature: "",
  adminSignatureDate: "",
  status: "draft",
  submittedAt: new Date().toISOString(),
});

// ============================================================================
// Redux Slice
// ============================================================================

export const incidentReportsSlice = createSlice({
  name: "incidentReports",
  initialState: {
    reports: [] as IncidentReport[],
    pendingReport: null as IncidentReport | null,
    archivedReports: [] as IncidentReport[],
  },
  reducers: {
    initializeNewReport: (state) => {
      state.pendingReport = createInitialState();
    },
    resetPendingReport: (state) => {
      state.pendingReport = createInitialState();
    },
    updateDate: (state, action: PayloadAction<string>) => {
      if (state.pendingReport) {
        state.pendingReport.date = action.payload;
      }
    },
    updateTime: (state, action: PayloadAction<string>) => {
      if (state.pendingReport) {
        state.pendingReport.time = action.payload;
      }
    },
    updateLocation: (state, action: PayloadAction<string>) => {
      if (state.pendingReport) {
        state.pendingReport.location = action.payload;
      }
    },
    updateIncidentType: (state, action: PayloadAction<IncidentType>) => {
      if (state.pendingReport) {
        state.pendingReport.incidentType = action.payload;
      }
    },
    updateDescription: (state, action: PayloadAction<string>) => {
      if (state.pendingReport) {
        state.pendingReport.description = action.payload;
      }
    },
    addClient: (state) => {
      if (state.pendingReport) {
        const newClient = createInitialClient();
        newClient.relationship = "Secondary";
        state.pendingReport.clients.push(newClient);
      }
    },
    removeClient: (state, action: PayloadAction<string>) => {
      if (state.pendingReport && state.pendingReport.clients.length > 1) {
        const filtered = state.pendingReport.clients.filter(
          (c) => c.id !== action.payload
        );
        if (filtered.length > 0) {
          state.pendingReport.clients = filtered;
          // Update first client to Primary
          state.pendingReport.clients[0]!.relationship = "Primary";
        }
      }
    },
    updateClient: (
      state,
      action: PayloadAction<{
        clientId: string;
        updates: Partial<Client>;
      }>
    ) => {
      if (state.pendingReport) {
        const client = state.pendingReport.clients.find(
          (c) => c.id === action.payload.clientId
        );
        if (client) {
          Object.assign(client, action.payload.updates);
        }
      }
    },
    addWitness: (state) => {
      if (state.pendingReport) {
        state.pendingReport.witnesses.push(createInitialWitness());
      }
    },
    removeWitness: (state, action: PayloadAction<string>) => {
      if (state.pendingReport) {
        state.pendingReport.witnesses = state.pendingReport.witnesses.filter(
          (w) => w.id !== action.payload
        );
      }
    },
    updateWitness: (
      state,
      action: PayloadAction<{
        witnessId: string;
        updates: Partial<Witness>;
      }>
    ) => {
      if (state.pendingReport) {
        const witness = state.pendingReport.witnesses.find(
          (w) => w.id === action.payload.witnessId
        );
        if (witness) {
          Object.assign(witness, action.payload.updates);
        }
      }
    },
    addEmergencyService: (state, action: PayloadAction<string>) => {
      if (state.pendingReport && !state.pendingReport.emergencyServices.includes(action.payload)) {
        state.pendingReport.emergencyServices.push(action.payload);
      }
    },
    removeEmergencyService: (state, action: PayloadAction<string>) => {
      if (state.pendingReport) {
        state.pendingReport.emergencyServices = state.pendingReport.emergencyServices.filter(
          (s) => s !== action.payload
        );
        // Also remove associated responders
        state.pendingReport.responders = state.pendingReport.responders.filter(
          (r) => r.service !== action.payload
        );
      }
    },
    addResponder: (state) => {
      if (state.pendingReport) {
        state.pendingReport.responders.push(createInitialResponder());
      }
    },
    removeResponder: (state, action: PayloadAction<string>) => {
      if (state.pendingReport) {
        state.pendingReport.responders = state.pendingReport.responders.filter(
          (r) => r.id !== action.payload
        );
      }
    },
    updateResponder: (
      state,
      action: PayloadAction<{
        responderId: string;
        updates: Partial<Responder>;
      }>
    ) => {
      if (state.pendingReport) {
        const responder = state.pendingReport.responders.find(
          (r) => r.id === action.payload.responderId
        );
        if (responder) {
          Object.assign(responder, action.payload.updates);
        }
      }
    },
    updateMedicalAttention: (
      state,
      action: PayloadAction<Partial<MedicalAttention>>
    ) => {
      if (state.pendingReport) {
        Object.assign(state.pendingReport.medicalAttention, action.payload);
      }
    },
    updateFollowUp: (
      state,
      action: PayloadAction<{
        requiresFollowUp: boolean;
        notes?: string;
      }>
    ) => {
      if (state.pendingReport) {
        state.pendingReport.followUp.requiresFollowUp = action.payload.requiresFollowUp;
        if (action.payload.notes !== undefined) {
          state.pendingReport.followUp.notes = action.payload.notes;
        }
      }
    },
    updateClientSignature: (
      state,
      action: PayloadAction<{
        clientId: string;
        signature: string;
        date: string;
      }>
    ) => {
      if (state.pendingReport) {
        const client = state.pendingReport.clients.find(
          (c) => c.id === action.payload.clientId
        );
        if (client) {
          client.signature = action.payload.signature;
          client.signatureDate = action.payload.date;
        }
      }
    },
    markClientUnableOrRefused: (
      state,
      action: PayloadAction<{
        clientId: string;
        unableOrRefused: boolean;
        reason?: string;
      }>
    ) => {
      if (state.pendingReport) {
        const client = state.pendingReport.clients.find(
          (c) => c.id === action.payload.clientId
        );
        if (client) {
          client.unableOrRefusedToSign = action.payload.unableOrRefused;
          if (action.payload.reason !== undefined) {
            client.unableOrRefusedReason = action.payload.reason;
          }
        }
      }
    },
    updateAdminSignature: (
      state,
      action: PayloadAction<{
        signature: string;
        date: string;
      }>
    ) => {
      if (state.pendingReport) {
        state.pendingReport.adminSignature = action.payload.signature;
        state.pendingReport.adminSignatureDate = action.payload.date;
      }
    },
    submitReport: (state) => {
      if (state.pendingReport) {
        // Mock status so Pending can show *why* it is still open
        const report = state.pendingReport;
        const clientNeedsSig = report.clients.some(
          (c) => !c.signature && !c.unableOrRefusedToSign
        );
        if (clientNeedsSig) {
          report.status = "awaitingSignature";
        } else if (!report.adminSignature) {
          report.status = "awaitingAdmin";
        } else if (report.followUp.requiresFollowUp) {
          report.status = "followUpNeeded";
        } else {
          report.status = "pending";
        }
        // Deep-ish copy so later edits to a resumed draft do not mutate the list row oddly
        state.reports.push(JSON.parse(JSON.stringify(report)) as IncidentReport);
        state.pendingReport = null;
      }
    },
    /**
     * Pull a submitted report back into the form for more signatures / edits.
     * Removes it from reports[] so a later submit does not duplicate the id.
     */
    resumeReport: (state, action: PayloadAction<string>) => {
      const index = state.reports.findIndex((r) => r.id === action.payload);
      if (index === -1) return;
      const [report] = state.reports.splice(index, 1);
      if (report) {
        state.pendingReport = JSON.parse(JSON.stringify(report)) as IncidentReport;
      }
    },
    /** Mark one report complete (or follow-up needed) by id */
    completeReportById: (state, action: PayloadAction<string>) => {
      const report = state.reports.find((r) => r.id === action.payload);
      if (!report) return;
      if (report.followUp.requiresFollowUp) {
        report.status = "followUpNeeded";
      } else {
        report.status = "complete";
      }
    },
    /** @deprecated prefer completeReportById — kept so old imports do not break */
    completeReport: (state) => {
      const lastReport = state.reports[state.reports.length - 1];
      if (lastReport) {
        lastReport.status = lastReport.followUp.requiresFollowUp
          ? "followUpNeeded"
          : "complete";
      }
    },
    archiveReport: (state, action: PayloadAction<string>) => {
      // Can archive from active reports OR already-complete rows still in reports[]
      const report = state.reports.find((r) => r.id === action.payload);
      if (report) {
        state.reports = state.reports.filter((r) => r.id !== action.payload);
        report.status = "closed";
        state.archivedReports.push(report);
        return;
      }
      // Also allow closing something already flagged complete sitting only in reports
    },
    setFollowUpNeeded: (state, action: PayloadAction<{ notes: string }>) => {
      const lastReport = state.reports[state.reports.length - 1];
      if (lastReport) {
        lastReport.status = "followUpNeeded";
        lastReport.followUp = {
          ...lastReport.followUp,
          requiresFollowUp: true,
          notes: action.payload.notes,
        };
      }
    },
    setFollowUpNeededById: (
      state,
      action: PayloadAction<{ id: string; notes?: string }>
    ) => {
      const report = state.reports.find((r) => r.id === action.payload.id);
      if (!report) return;
      report.status = "followUpNeeded";
      report.followUp = {
        ...report.followUp,
        requiresFollowUp: true,
        notes: action.payload.notes ?? report.followUp.notes ?? "",
      };
    },
  },
});

// ============================================================================
// Export Actions
// ============================================================================

export const {
  initializeNewReport,
  resetPendingReport,
  updateDate,
  updateTime,
  updateLocation,
  updateIncidentType,
  updateDescription,
  addClient,
  removeClient,
  updateClient,
  addWitness,
  removeWitness,
  updateWitness,
  addEmergencyService,
  removeEmergencyService,
  addResponder,
  removeResponder,
  updateResponder,
  updateMedicalAttention,
  updateFollowUp,
  updateClientSignature,
  markClientUnableOrRefused,
  updateAdminSignature,
  submitReport,
  resumeReport,
  completeReportById,
  completeReport,
  archiveReport,
  setFollowUpNeeded,
  setFollowUpNeededById,
} = incidentReportsSlice.actions;

export default incidentReportsSlice.reducer;