import createClient from "openapi-fetch";
import type { paths } from "@backend";

export const api = createClient<paths>({ baseUrl: "/" });

export type Client =
  paths["/api/client"]["get"]["responses"]["200"]["content"]["application/json"][number];
