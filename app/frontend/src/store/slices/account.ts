import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { api, type AccountPasswordResource } from "@/lib/api";
import { setMustChangePassword } from "@/store/slices/auth";

export interface AccountState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: AccountState = {
  loading: false,
  success: false,
  error: null,
};

function parseApiError(error: unknown): string {
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object") return "Failed to update password";

  const errObj = error as Record<string, unknown>;

  // Handle ASP.NET ValidationProblemDetails / ModelState error dictionary
  if (errObj.errors && typeof errObj.errors === "object") {
    const errorDict = errObj.errors as Record<string, string[]>;
    const messages = Object.values(errorDict).flat();
    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  if (typeof errObj.detail === "string") return errObj.detail;
  if (typeof errObj.title === "string") return errObj.title;

  return "Failed to update password";
}

export const changePassword = createAsyncThunk(
  "account/changePassword",
  async (payload: AccountPasswordResource, { dispatch, rejectWithValue }) => {
    const { error } = await api.PUT("/api/account/password", {
      body: payload,
    });

    if (error) {
      return rejectWithValue(parseApiError(error));
    }

    dispatch(setMustChangePassword(false));

    return true;
  },
);

export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    resetAccountState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
    clearAccountError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = (action.payload as string) || "Failed to update password";
      });
  },
});

export const { resetAccountState, clearAccountError } = accountSlice.actions;
export default accountSlice.reducer;
