import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  api,
  type ClientInquiryResource,
  type ClientInquiryIndexResource,
  type ClientInquiryPatchResource,
  type ClientInquirySort,
  type PagedResultClientInquiryIndex,
} from "@/lib/api";

export {
  type ClientInquiryResource,
  type ClientInquiryIndexResource,
  type ClientInquiryPatchResource,
  type ClientInquirySort,
};

export interface ClientInquiryFilters {
  page: number;
  pageSize: number;
  sort: ClientInquirySort;
  descending: boolean;
  isArchived: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface ClientInquiryState {
  items: ClientInquiryIndexResource[];
  totalCount: number;
  selectedInquiry: ClientInquiryResource | null;
  filters: ClientInquiryFilters;
  loading: boolean;
  error: string | null;
}

const initialFilters: ClientInquiryFilters = {
  page: 1,
  pageSize: 20,
  sort: "Timestamp" as ClientInquirySort,
  descending: true,
  isArchived: false,
};

const initialState: ClientInquiryState = {
  items: [],
  totalCount: 0,
  selectedInquiry: null,
  filters: initialFilters,
  loading: false,
  error: null,
};

export const fetchClientInquiries = createAsyncThunk(
  "clientInquiries/fetchAll",
  async (
    filters: Partial<ClientInquiryFilters> | undefined,
    { getState, rejectWithValue },
  ) => {
    const state = (getState() as { clientInquiries: ClientInquiryState })
      .clientInquiries;
    const queryParams = { ...state.filters, ...filters };

    const { data, error } = await api.GET("/api/client-inquiry", {
      params: {
        query: queryParams,
      },
    });

    if (error || !data)
      return rejectWithValue(error ?? "Failed to fetch client inquiries");
    return {
      data: data as PagedResultClientInquiryIndex,
      filters: queryParams,
    };
  },
);

export const fetchClientInquiryById = createAsyncThunk(
  "clientInquiries/fetchById",
  async (id: string, { rejectWithValue }) => {
    const { data, error } = await api.GET("/api/client-inquiry/{id}", {
      params: { path: { id } },
    });

    if (error || !data)
      return rejectWithValue(error ?? "Client inquiry not found");
    return data as ClientInquiryResource;
  },
);

export const patchClientInquiry = createAsyncThunk(
  "clientInquiries/patch",
  async (
    { id, patch }: { id: string; patch: ClientInquiryPatchResource },
    { rejectWithValue },
  ) => {
    const { error } = await api.PATCH("/api/client-inquiry/{id}", {
      params: { path: { id } },
      body: patch,
    });

    if (error)
      return rejectWithValue(error ?? "Failed to update client inquiry");
    return { id, patch };
  },
);

export const deleteClientInquiry = createAsyncThunk(
  "clientInquiries/delete",
  async (id: string, { rejectWithValue }) => {
    const { error } = await api.DELETE("/api/client-inquiry/{id}", {
      params: { path: { id } },
    });

    if (error)
      return rejectWithValue(error ?? "Failed to delete client inquiry");
    return id;
  },
);

export const clientInquirySlice = createSlice({
  name: "clientInquiries",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<ClientInquiryFilters>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
    },
    clearSelectedInquiry: (state) => {
      state.selectedInquiry = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Inquiries
      .addCase(fetchClientInquiries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientInquiries.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data.items ?? [];
        state.totalCount = action.payload.data.totalCount ?? 0;
        state.filters = action.payload.filters;
      })
      .addCase(fetchClientInquiries.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to fetch client inquiries";
      })

      // Fetch Inquiry By Id
      .addCase(fetchClientInquiryById.fulfilled, (state, action) => {
        state.selectedInquiry = action.payload;
      })

      // Patch Inquiry
      .addCase(patchClientInquiry.fulfilled, (state, action) => {
        // Remove item from active view if archive state changed
        state.items = state.items.filter(
          (item) => item.id !== action.payload.id,
        );
        if (state.selectedInquiry?.id === action.payload.id) {
          state.selectedInquiry.isArchived =
            action.payload.patch.isArchived ?? state.selectedInquiry.isArchived;
        }
      })

      // Delete Inquiry
      .addCase(deleteClientInquiry.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedInquiry?.id === action.payload) {
          state.selectedInquiry = null;
        }
      });
  },
});

export const { setFilters, resetFilters, clearSelectedInquiry } =
  clientInquirySlice.actions;
export default clientInquirySlice.reducer;
