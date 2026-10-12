import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/store/base-query";
import {
  type VolunteerInquiryResource,
  type VolunteerInquiryIndexResource,
  type VolunteerInquiryPatchResource,
  type VolunteerInquirySort,
  type PagedResultVolunteerInquiryIndex,
} from "@/lib/api";

export {
  type VolunteerInquiryResource,
  type VolunteerInquiryIndexResource,
  type VolunteerInquiryPatchResource,
  type VolunteerInquirySort,
};

export interface VolunteerInquiryFilters {
  page: number;
  pageSize: number;
  sort: VolunteerInquirySort;
  descending: boolean;
  isArchived: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

const defaultFilters: Partial<VolunteerInquiryFilters> = {
  page: 1,
  pageSize: 20,
  sort: "Timestamp" as VolunteerInquirySort,
  descending: true,
  isArchived: false,
};

export const volunteerInquiryApi = createApi({
  reducerPath: "volunteerInquiryApi",
  baseQuery: baseQuery(),
  tagTypes: ["VolunteerInquiry"],
  endpoints: (builder) => ({
    getVolunteerInquiries: builder.query<
      PagedResultVolunteerInquiryIndex,
      Partial<VolunteerInquiryFilters> | void
    >({
      query: (filters) => ({
        url: "/api/volunteer-inquiry",
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
                type: "VolunteerInquiry" as const,
                id,
              })),
              { type: "VolunteerInquiry", id: "LIST" },
            ]
          : [{ type: "VolunteerInquiry", id: "LIST" }],
    }),

    getVolunteerInquiryById: builder.query<VolunteerInquiryResource, string>({
      query: (id) => ({
        url: `/api/volunteer-inquiry/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "VolunteerInquiry", id }],
    }),

    patchVolunteerInquiry: builder.mutation<
      void,
      { id: string; patch: VolunteerInquiryPatchResource }
    >({
      query: ({ id, patch }) => ({
        url: `/api/volunteer-inquiry/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "VolunteerInquiry", id },
        { type: "VolunteerInquiry", id: "LIST" },
      ],
    }),

    deleteVolunteerInquiry: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/volunteer-inquiry/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "VolunteerInquiry", id },
        { type: "VolunteerInquiry", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetVolunteerInquiriesQuery,
  useGetVolunteerInquiryByIdQuery,
  usePatchVolunteerInquiryMutation,
  useDeleteVolunteerInquiryMutation,
} = volunteerInquiryApi;
