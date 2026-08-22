import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/store/base-query";
import { type MealResource } from "@/lib/api";

export type MealKey = "breakfast" | "lunch" | "dinner";

export const mealsApi = createApi({
  reducerPath: "mealsApi",
  baseQuery: baseQuery(),
  tagTypes: ["Meal"],
  endpoints: (builder) => ({
    getMealByMeal: builder.query<MealResource, MealKey>({
      query: (meal) => ({ url: `/api/kitchen/meal/${meal}`, method: "GET" }),
      providesTags: (_result, _error, meal) => [{ type: "Meal", id: meal }],
    }),
    updateMeal: builder.mutation<
      MealResource,
      { meal: MealKey; data: Partial<MealResource> }
    >({
      query: ({ meal, data }) => ({
        url: `/api/kitchen/meal/${meal}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { meal }) => [
        { type: "Meal", id: meal },
      ],
    }),
    clearMeal: builder.mutation<MealResource, MealKey>({
      query: (meal) => ({
        url: `/api/kitchen/meal/${meal}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, meal) => [{ type: "Meal", id: meal }],
    }),
  }),
});

export const {
  useGetMealByMealQuery,
  useUpdateMealMutation,
  useClearMealMutation,
} = mealsApi;
