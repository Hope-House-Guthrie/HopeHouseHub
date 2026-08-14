import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PassStatus = "pending" | "approved" | "denied";

export type PassType = "12h" | "24h" | "48h";

export interface PassRequest {
  id: string;
  residentName: string;
  purpose: string;
  submittedAt: string;
  status: PassStatus;
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
}

// Updated type for updating a pass (includes id, excludes submittedAt and status from being overwritten)
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

// ---------------------------------------------------------------------------
// Slice with reducers
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
      action: PayloadAction<Omit<PassRequest, "id" | "submittedAt" | "status">>,
    ) => {
      state.requests.push({
        id: crypto.randomUUID(),
        submittedAt: new Date().toISOString(),
        status: "pending",
        ...action.payload,
      });
    },
    approvePassRequest: (state, action: PayloadAction<string>) => {
      const request = state.requests.find((r) => r.id === action.payload);
      if (request) request.status = "approved";
    },
    denyPassRequest: (
      state,
      action: PayloadAction<{ id: string; comment: string }>,
    ) => {
      const request = state.requests.find((r) => r.id === action.payload.id);
      if (request) {
        request.status = "denied";
        request.comment = action.payload.comment;
      }
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
  },
});

export const {
  addPassRequest,
  approvePassRequest,
  denyPassRequest,
  updatePassRequest,
} = passRequestSlice.actions;
export default passRequestSlice.reducer;
