import createClient, { type Middleware } from "openapi-fetch";
import type { paths, components } from "@backend";

export const api = createClient<paths>({ baseUrl: "/" });

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
