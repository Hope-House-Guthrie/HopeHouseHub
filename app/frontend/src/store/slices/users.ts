import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  api,
  type UserResource,
  type UserCreateResource,
  type UserUpdateResource,
  type UserPasswordResource,
  type RoleResource,
} from "@/lib/api";

export {
  type UserResource,
  type UserCreateResource,
  type UserUpdateResource,
  type UserPasswordResource,
  type RoleResource,
};

export interface UserState {
  users: UserResource[];
  roles: RoleResource[];
  selectedUser: UserResource | null;
  latestGeneratedPassword: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  roles: [],
  selectedUser: null,
  latestGeneratedPassword: null,
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    const { data, error } = await api.GET("/api/user");
    if (error || !data) return rejectWithValue(error ?? "No data returned");
    return data;
  },
);

export const fetchRoles = createAsyncThunk(
  "users/fetchRoles",
  async (_, { rejectWithValue }) => {
    const { data, error } = await api.GET("/api/role");
    if (error || !data) return rejectWithValue(error ?? "No data returned");
    return data;
  },
);

export const fetchUserById = createAsyncThunk(
  "users/fetchById",
  async (id: string, { rejectWithValue }) => {
    const { data, error } = await api.GET("/api/user/{id}", {
      params: { path: { id } },
    });
    if (error || !data) return rejectWithValue(error ?? "User not found");
    return data;
  },
);

export const createUserThunk = createAsyncThunk(
  "users/create",
  async (body: UserCreateResource, { rejectWithValue }) => {
    const { data, error } = await api.POST("/api/user", { body });
    if (error || !data)
      return rejectWithValue(error ?? "Failed to create user");
    return data;
  },
);

export const updateUser = createAsyncThunk(
  "users/update",
  async (
    { id, resource }: { id: string; resource: UserUpdateResource },
    { rejectWithValue },
  ) => {
    const { data, error } = await api.PUT("/api/user/{id}", {
      params: { path: { id } },
      body: resource,
    });
    if (error || !data)
      return rejectWithValue(error ?? "Failed to update user");
    return data;
  },
);

export const resetUserPassword = createAsyncThunk(
  "users/resetPassword",
  async (id: string, { rejectWithValue }) => {
    const { data, error } = await api.DELETE("/api/user/{id}/password", {
      params: { path: { id } },
    });
    if (error || !data)
      return rejectWithValue(error ?? "Failed to reset password");
    return data;
  },
);

// --- Slice ---

export const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearGeneratedPassword: (state) => {
      state.latestGeneratedPassword = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload ?? [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch users";
      })

      // Fetch Roles
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.roles = action.payload ?? [];
      })

      // Fetch User By Id
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload ?? null;
      })

      // Create User
      .addCase(createUserThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.users.push(action.payload);
          if (action.payload.temporaryPassword) {
            state.latestGeneratedPassword = action.payload.temporaryPassword;
          }
        }
      })

      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload;

        const index = state.users.findIndex((u) => u.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }

        if (state.selectedUser?.id === updatedUser.id) {
          state.selectedUser = updatedUser;
        }
      })

      // Reset Password
      .addCase(resetUserPassword.fulfilled, (state, action) => {
        if (action.payload?.temporaryPassword) {
          state.latestGeneratedPassword = action.payload.temporaryPassword;
        }
      });
  },
});

export const { clearSelectedUser, clearGeneratedPassword } = userSlice.actions;
export default userSlice.reducer;
