import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api',
  }),
  tagTypes: ['Account'],
  endpoints: (builder) => ({
    getAccounts: builder.query<Account[], void>({
      query: () => '/account',
      providesTags: ['Account'],
    }),
  }),
});

export const { useGetAccountsQuery } = api;

export interface Account {
  username: string;
  domainOrMachine: string;
  isAdmin: boolean;
  displayName: string;
}