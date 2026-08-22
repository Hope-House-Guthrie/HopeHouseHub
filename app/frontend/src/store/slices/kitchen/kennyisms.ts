import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/store/base-query";

import { type KennyismResource } from "@/lib/api";

export const kennyismsApi = createApi({
  reducerPath: "kennyismsApi",
  baseQuery: baseQuery(),
  tagTypes: ["Kennyism"],
  endpoints: (builder) => ({
    getKennyisms: builder.query<KennyismResource[], void>({
      query: () => ({ url: "/api/kitchen/kennyism", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Kennyism" as const, id })),
              { type: "Kennyism", id: "LIST" },
            ]
          : [{ type: "Kennyism", id: "LIST" }],
    }),
    searchKennyisms: builder.query<KennyismResource[], string>({
      query: (term) => ({
        url: `/api/kitchen/kennyism/search`,
        method: "GET",
        params: { q: term },
      }),
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: "Kennyism" as const, id }))
          : [],
    }),
    addKennyism: builder.mutation<
      KennyismResource,
      Omit<KennyismResource, "id">
    >({
      query: (body) => ({
        url: "/api/kitchen/kennyism",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Kennyism", id: "LIST" }],
    }),
    removeKennyism: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/api/kitchen/kennyism/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Kennyism", id },
        { type: "Kennyism", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetKennyismsQuery,
  useSearchKennyismsQuery,
  useLazySearchKennyismsQuery,
  useAddKennyismMutation,
  useRemoveKennyismMutation,
} = kennyismsApi;
