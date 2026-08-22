import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  api,
  type AuthTokenResource,
  type AuthTokenCreateResource,
} from "@/lib/api";
import { isTokenExpired } from "@/lib/jwt";

export interface AuthState {
  user: AuthTokenResource | null;
  isAuthenticated: boolean;
  isExpired: boolean;
  loading: boolean;
  error: string | null;
}

const getStoredUser = (): {
  user: AuthTokenResource | null;
  isExpired: boolean;
} => {
  if (typeof window === "undefined") {
    return { user: null, isExpired: false };
  }

  try {
    const item = localStorage.getItem("user");
    if (!item) return { user: null, isExpired: false };

    const parsedUser: AuthTokenResource = JSON.parse(item);
    const token = (parsedUser as any).token || (parsedUser as any).access_token;

    if (token && isTokenExpired(token)) {
      return { user: null, isExpired: true };
    }

    return { user: parsedUser, isExpired: false };
  } catch {
    return { user: null, isExpired: false };
  }
};

const initialAuth = getStoredUser();

const initialState: AuthState = {
  user: initialAuth.user,
  isAuthenticated: Boolean(initialAuth.user),
  isExpired: initialAuth.isExpired,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: AuthTokenCreateResource, { rejectWithValue }) => {
    const { data, error } = await api.POST("/api/auth/token", {
      body: credentials,
    });

    if (error) {
      return rejectWithValue(
        typeof error === "string" ? error : "Authentication failed",
      );
    }

    return <AuthTokenResource>data;
  },
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isExpired = false;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setMustChangePassword: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.mustChangePassword = action.payload;
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isExpired = false;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<AuthTokenResource>) => {
          state.loading = false;
          state.user = action.payload;
          state.isAuthenticated = true;
          state.isExpired = false;

          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(action.payload));
          }
        },
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Invalid credentials";
      });
  },
});

export const { logout, clearAuthError, setMustChangePassword } =
  authSlice.actions;
export default authSlice.reducer;
