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

export interface AuthState {
  user: AuthTokenResource | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialUser = (() => {
  if (typeof window === "undefined") return null;

  try {
    const item = localStorage.getItem("user");
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
})();

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: Boolean(initialUser),
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
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<AuthTokenResource>) => {
          state.loading = false;
          state.user = action.payload;
          state.isAuthenticated = true;

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
