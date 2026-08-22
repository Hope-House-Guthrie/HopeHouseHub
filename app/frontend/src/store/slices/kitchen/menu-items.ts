import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/store/base-query";
import { type MenuItemResource } from "@/lib/api";

export type MenuItemCategory = "main" | "side" | "salad" | "bread" | "other";

export const menuItemsApi = createApi({
  reducerPath: "menuItemsApi",
  baseQuery: baseQuery(),
  tagTypes: ["MenuItem"],
  endpoints: (builder) => ({
    getMenuItems: builder.query<MenuItemResource[], void>({
      query: () => ({ url: "/api/kitchen/menu-item", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "MenuItem" as const, id })),
              { type: "MenuItem", id: "LIST" },
            ]
          : [{ type: "MenuItem", id: "LIST" }],
    }),
    searchMenuItems: builder.query<MenuItemResource[], string>({
      query: (term) => ({
        url: `/api/kitchen/menu-item/search`,
        method: "GET",
        params: { q: term },
      }),
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: "MenuItem" as const, id }))
          : [],
    }),
    addMenuItem: builder.mutation<MenuItemResource, Partial<MenuItemResource>>({
      query: (body) => ({
        url: "/api/kitchen/menu-item",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "MenuItem", id: "LIST" }],
    }),
    updateMenuItem: builder.mutation<
      MenuItemResource,
      Pick<MenuItemResource, "id"> & Partial<MenuItemResource>
    >({
      query: ({ id, ...body }) => ({
        url: `/api/kitchen/menu-item/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "MenuItem", id }],
    }),
    removeMenuItem: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/api/kitchen/menu-item/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "MenuItem", id },
        { type: "MenuItem", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetMenuItemsQuery,
  useSearchMenuItemsQuery,
  useLazySearchMenuItemsQuery,
  useAddMenuItemMutation,
  useUpdateMenuItemMutation,
  useRemoveMenuItemMutation,
} = menuItemsApi;
