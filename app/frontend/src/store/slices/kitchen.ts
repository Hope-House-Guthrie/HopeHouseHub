//change this to client side only and also change the data modle to kitchen menu
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { api, type Client } from "@/lib/api";

export { type Client };

export interface ClientState {
  clients: Client[];
  selectedClient: Client | null;
  loading: boolean;
  error: string | null;
}

const initialState: ClientState = {
  clients: [],
  selectedClient: null,
  loading: false,
  error: null,
};

export const fetchClients = createAsyncThunk(
  "clients/fetchAll",
  async (_, { rejectWithValue }) => {
    const { data, error } = await api.GET("/api/client");
    if (error) return rejectWithValue(error);
    return data;
  },
);

export const fetchClientById = createAsyncThunk(
  "clients/fetchById",
  async (id: string, { rejectWithValue }) => {
    const { data, error } = await api.GET("/api/client/{id}", {
      params: { path: { id } },
    });
    if (error) return rejectWithValue(error);
    return data;
  },
);

export const createClientThunk = createAsyncThunk(
  "clients/create",
  async (body: Omit<Client, "ID">, { rejectWithValue }) => {
    // Cast body as required by schema parameters
    const { data, error } = await api.POST("/api/client", {
      body: body as Client,
    });
    if (error) return rejectWithValue(error);
    return data;
  },
);

export const updateClient = createAsyncThunk(
  "clients/update",
  async (
    { id, resource }: { id: string; resource: Client },
    { rejectWithValue },
  ) => {
    const { error } = await api.PUT("/api/client/{id}", {
      params: { path: { id } },
      body: resource,
    });
    if (error) return rejectWithValue(error);
    return resource;
  },
);

export const deleteClient = createAsyncThunk(
  "clients/delete",
  async (id: string, { rejectWithValue }) => {
    const { error } = await api.DELETE("/api/client/{id}", {
      params: { path: { id } },
    });
    if (error) return rejectWithValue(error);
    return id;
  },
);

// --- Slice ---

export const clientSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    clearSelectedClient: (state) => {
      state.selectedClient = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchClients.fulfilled,
        (state, action: PayloadAction<Client[]>) => {
          state.loading = false;
          state.clients = action.payload;
        },
      )
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch clients";
      })
      // Fetch By Id
      .addCase(
        fetchClientById.fulfilled,
        (state, action: PayloadAction<Client | undefined>) => {
          state.selectedClient = action.payload ?? null;
        },
      )
      // Create
      .addCase(
        createClientThunk.fulfilled,
        (state, action: PayloadAction<Client>) => {
          state.clients.push(action.payload);
        },
      )
      // Update
      .addCase(
        updateClient.fulfilled,
        (state, action: PayloadAction<Client>) => {
          const index = state.clients.findIndex(
            (c) => c.id === action.payload.id,
          );
          if (index !== -1) {
            state.clients[index] = action.payload;
          }
          if (state.selectedClient?.id === action.payload.id) {
            state.selectedClient = action.payload;
          }
        },
      )
      // Delete
      .addCase(
        deleteClient.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.clients = state.clients.filter((c) => c.id !== action.payload);
          if (state.selectedClient?.id === action.payload) {
            state.selectedClient = null;
          }
        },
      );
  },
});

export const { clearSelectedClient } = clientSlice.actions;
export default clientSlice.reducer;
