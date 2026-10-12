import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/store/base-query";
import {
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

const defaultFilters: Partial<ClientInquiryFilters> = {
  page: 1,
  pageSize: 20,
  sort: "Timestamp" as ClientInquirySort,
  descending: true,
  isArchived: false,
};

export const clientInquiryApi = createApi({
  reducerPath: "clientInquiryApi",
  baseQuery: baseQuery(),
  tagTypes: ["ClientInquiry"],
  endpoints: (builder) => ({
    getClientInquiries: builder.query<
      PagedResultClientInquiryIndex,
      Partial<ClientInquiryFilters> | void
    >({
      query: (filters) => ({
        url: "/api/client-inquiry",
        method: "GET",
        params: {
          ...defaultFilters,
          ...filters,
        },
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map(({ id }) => ({
                type: "ClientInquiry" as const,
                id,
              })),
              { type: "ClientInquiry", id: "LIST" },
            ]
          : [{ type: "ClientInquiry", id: "LIST" }],
    }),

    getClientInquiryById: builder.query<ClientInquiryResource, string>({
      query: (id) => ({
        url: `/api/client-inquiry/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "ClientInquiry", id }],
    }),

    patchClientInquiry: builder.mutation<
      void,
      { id: string; patch: ClientInquiryPatchResource }
    >({
      query: ({ id, patch }) => ({
        url: `/api/client-inquiry/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ClientInquiry", id },
        { type: "ClientInquiry", id: "LIST" },
      ],
    }),

    deleteClientInquiry: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/client-inquiry/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "ClientInquiry", id },
        { type: "ClientInquiry", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetClientInquiriesQuery,
  useGetClientInquiryByIdQuery,
  usePatchClientInquiryMutation,
  useDeleteClientInquiryMutation,
} = clientInquiryApi;
