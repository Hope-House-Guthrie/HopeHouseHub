import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PassStatus = "pending" | "approved" | "denied";

export type PassType = "12h" | "24h" | "48h";

/**
 * FUTURE notify workflow (portal / email / SMS).
 * not_sent → queued → sent | failed
 * BACKEND TODO: real delivery; do not mark sent until confirmed.
 */
export type ClientNotifyStatus = "not_sent" | "queued" | "sent" | "failed";

export interface PassRequest {
  id: string;
  residentName: string;
  purpose: string;
  submittedAt: string;
  status: PassStatus;
  /** Client note on submit and/or Administration deny reason */
  comment?: string;
  lastEditedAt?: string;
  passStart: string;
  passEnd: string;
  passType: PassType;
  clientName: string;
  visitorName: string;
  visitorPhone: string;
  canPassUA: "yes" | "no" | "idk";
  choreCovered: boolean;
  choreCoveredBy: string;
  onPremises: boolean;
  offPremises: boolean;

  // ----- Administration decision (Phase 1) -----
  /** Raw base64 PNG from SignatureCanvas (no data: prefix) — no client sig on Pass */
  adminSignature: string;
  /** YYYY-MM-DD */
  adminSignatureDate: string;
  /** When Administration approved/denied (ISO) */
  decidedAt: string;
  /**
   * FUTURE: staff display name from login.
   * Empty until auth exists.
   */
  decidedByName: string;
  /**
   * FUTURE: notify client of approve/deny result.
   * FE stub can flip to queued; BE sends for real.
   */
  clientNotifyStatus: ClientNotifyStatus;
  /**
   * FUTURE: notify Administration that a new pass was submitted.
   * FE does not implement push yet.
   */
  adminNotifyStatus: ClientNotifyStatus;
}

/** Edit pending pass details (client/staff correction) — does not decide */
export type PassRequestUpdateInput = {
  id: string;
  residentName: string;
  purpose: string;
  clientName: string;
  visitorName: string;
  visitorPhone: string;
  passStart: string;
  passEnd: string;
  passType: PassType;
  canPassUA: "yes" | "no" | "idk";
  choreCovered: boolean;
  choreCoveredBy: string;
  onPremises: boolean;
  offPremises: boolean;
  comment?: string;
};

/**
 * Administration decision payload.
 * Requires signature + date for BOTH approve and deny.
 * BACKEND TODO: PATCH /pass-requests/:id/decide
 */
export type PassDecideInput = {
  id: string;
  decision: "approved" | "denied";
  adminSignature: string;
  adminSignatureDate: string;
  /** Required when decision is denied */
  denyComment?: string;
  /** FUTURE: from logged-in Administration user */
  decidedByName?: string;
};

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const initialState = {
  requests: [] as PassRequest[],
};

export const passRequestSlice = createSlice({
  name: "passRequest",
  initialState,
  reducers: {
    addPassRequest: (
      state,
      action: PayloadAction<
        Omit<
          PassRequest,
          | "id"
          | "submittedAt"
          | "status"
          | "adminSignature"
          | "adminSignatureDate"
          | "decidedAt"
          | "decidedByName"
          | "clientNotifyStatus"
          | "adminNotifyStatus"
        >
      >,
    ) => {
      state.requests.push({
        id: crypto.randomUUID(),
        submittedAt: new Date().toISOString(),
        status: "pending",
        // Decision empty until Administration reviews
        adminSignature: "",
        adminSignatureDate: "",
        decidedAt: "",
        decidedByName: "",
        clientNotifyStatus: "not_sent",
        // FUTURE: would flip to queued when notify-admin API exists
        adminNotifyStatus: "not_sent",
        ...action.payload,
      });
    },

    /**
     * @deprecated Prefer decidePassRequest (requires Administration signature).
     * Kept so the page still typechecks until Step 5 rewires buttons.
     */
    approvePassRequest: (state, action: PayloadAction<string>) => {
      const request = state.requests.find((r) => r.id === action.payload);
      if (request && request.status === "pending") {
        request.status = "approved";
        request.decidedAt = new Date().toISOString();
      }
    },

    /**
     * @deprecated Prefer decidePassRequest (requires Administration signature).
     */
    denyPassRequest: (
      state,
      action: PayloadAction<{ id: string; comment: string }>,
    ) => {
      const request = state.requests.find((r) => r.id === action.payload.id);
      if (request && request.status === "pending") {
        request.status = "denied";
        request.comment = action.payload.comment;
        request.decidedAt = new Date().toISOString();
      }
    },

    /**
     * Administration approves or denies with signature + date.
     * Does not change pass details — review-only decision.
     */
    decidePassRequest: (state, action: PayloadAction<PassDecideInput>) => {
      const {
        id,
        decision,
        adminSignature,
        adminSignatureDate,
        denyComment,
        decidedByName,
      } = action.payload;
      const request = state.requests.find((r) => r.id === id);
      if (!request || request.status !== "pending") return;

      // Guard: signature required (page should validate first)
      if (!adminSignature?.trim() || !adminSignatureDate?.trim()) return;
      if (decision === "denied" && !denyComment?.trim()) return;

      request.status = decision;
      request.adminSignature = adminSignature;
      request.adminSignatureDate = adminSignatureDate;
      request.decidedAt = new Date().toISOString();
      request.decidedByName = decidedByName?.trim() || "";
      if (decision === "denied" && denyComment !== undefined) {
        request.comment = denyComment.trim();
      }
      // FUTURE: queue client notify on decision (BE sends result)
      request.clientNotifyStatus = "queued";
    },

    updatePassRequest: (
      state,
      action: PayloadAction<PassRequestUpdateInput>,
    ) => {
      const request = state.requests.find((r) => r.id === action.payload.id);
      if (request) {
        request.residentName = action.payload.residentName;
        request.purpose = action.payload.purpose;
        request.clientName = action.payload.clientName;
        request.visitorName = action.payload.visitorName;
        request.visitorPhone = action.payload.visitorPhone;
        request.passStart = action.payload.passStart;
        request.passEnd = action.payload.passEnd;
        request.passType = action.payload.passType;
        request.canPassUA = action.payload.canPassUA;
        request.choreCovered = action.payload.choreCovered;
        request.choreCoveredBy = action.payload.choreCoveredBy;
        request.onPremises = action.payload.onPremises;
        request.offPremises = action.payload.offPremises;
        request.lastEditedAt = new Date().toISOString();
        if (action.payload.comment !== undefined) {
          request.comment = action.payload.comment;
        }
      }
    },

    /** FE stub — mark client result notify queued (no real message yet) */
    queueClientPassNotify: (state, action: PayloadAction<{ id: string }>) => {
      const request = state.requests.find((r) => r.id === action.payload.id);
      if (!request) return;
      if (
        request.clientNotifyStatus === "sent" ||
        request.clientNotifyStatus === "queued"
      ) {
        return;
      }
      request.clientNotifyStatus = "queued";
    },
  },
});

export const {
  addPassRequest,
  approvePassRequest,
  denyPassRequest,
  decidePassRequest,
  updatePassRequest,
  queueClientPassNotify,
} = passRequestSlice.actions;

export default passRequestSlice.reducer;
