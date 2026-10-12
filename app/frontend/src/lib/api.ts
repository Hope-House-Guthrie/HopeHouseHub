import createClient, { type Middleware } from "openapi-fetch";
import type { paths, components } from "@backend";

const API_BASE_URL = process.env.H3_BACKEND_ORIGIN || "http://localhost:3002";

export const api = createClient<paths>({ baseUrl: API_BASE_URL });

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    if (typeof window !== "undefined") {
      const userRaw = localStorage.getItem("user");
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          const token = user?.token || user?.accessToken;

          if (token) {
            request.headers.set("Authorization", `Bearer ${token}`);
          }
        } catch {
          // Ignore JSON parse error if storage is corrupt
        }
      }
    }
    return request;
  },
};

api.use(authMiddleware);

export type AuthTokenResource = components["schemas"]["AuthTokenResource"];

export type AuthTokenCreateResource =
  components["schemas"]["AuthTokenCreateResource"];

export type AccountPasswordResource =
  components["schemas"]["AccountPasswordResource"];

export type UserResource = components["schemas"]["UserResource"];

export type UserCreateResource = components["schemas"]["UserCreateResource"];

export type UserUpdateResource = components["schemas"]["UserUpdateResource"];

export type UserPasswordResource =
  components["schemas"]["UserPasswordResource"];

export type RoleResource = components["schemas"]["RoleResource"];

export type KennyismResource = components["schemas"]["KennyismResource"];

export type KennyismCreateResource =
  components["schemas"]["KennyismCreateResource"];

export type MenuItemResource = components["schemas"]["MenuItemResource"];

export type MenuItemCreateResource =
  components["schemas"]["MenuItemCreateResource"];

export type MenuItemUpdateResource =
  components["schemas"]["MenuItemUpdateResource"];

export type MealResource = components["schemas"]["MealResource"];

export type MealUpdateResource = components["schemas"]["MealUpdateResource"];

// client inquiries
export type ClientInquiryResource = components["schemas"]["ClientInquiry"];
export type ClientInquiryIndexResource =
  components["schemas"]["ClientInquiryIndex"];
export type ClientInquiryPatchResource =
  components["schemas"]["ClientInquiryPatch"];
export type ClientInquirySort = components["schemas"]["ClientInquirySort"];
export type PagedResultClientInquiryIndex =
  components["schemas"]["PagedResultOfClientInquiryIndex"];

// volunteer inquiries
export type VolunteerInquiryResource =
  components["schemas"]["VolunteerInquiry"];
export type VolunteerInquiryIndexResource =
  components["schemas"]["VolunteerInquiryIndex"];
export type VolunteerInquiryPatchResource =
  components["schemas"]["VolunteerInquiryPatch"];
export type VolunteerInquirySort =
  components["schemas"]["VolunteerInquirySort"];
export type PagedResultVolunteerInquiryIndex =
  components["schemas"]["PagedResultOfVolunteerInquiryIndex"];
