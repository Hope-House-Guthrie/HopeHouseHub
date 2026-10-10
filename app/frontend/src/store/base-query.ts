import { type BaseQueryFn } from "@reduxjs/toolkit/query";
import { api } from "@/lib/api";

const API_BASE_URL = process.env.H3_BACKEND_ORIGIN || "http://localhost:3002";

export interface ApiFetchArgs {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, unknown>;
}

export const baseQuery =
  (): BaseQueryFn<ApiFetchArgs, unknown, { status?: number; data?: unknown }> =>
  async ({ url, method = "GET", body, params }) => {
    try {
      const httpMethod = method.toLowerCase();

      const initOptions: Record<string, unknown> = {
        baseUrl: API_BASE_URL,
      };
      if (body !== undefined) {
        initOptions.body = body;
      }
      if (params) {
        initOptions.params = { query: params };
      }

      const fullUrl = `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;

      console.log(fullUrl);

      const { data, error, response } = (await api.request(
        httpMethod as never,
        fullUrl as never,
        initOptions as never,
      )) as { data?: unknown; error?: unknown; response: Response };

      if (error) {
        return {
          error: {
            status: response?.status,
            data: error,
          },
        };
      }

      return { data };
    } catch (err: unknown) {
      return {
        error: {
          status: 500,
          data: err instanceof Error ? err.message : "Network or Client Error",
        },
      };
    }
  };
