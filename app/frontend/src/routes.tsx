import { type RouteObject } from "react-router";
import { type ReactNode } from "react";
import {
    Dashboard as DashboardIcon,
    PermIdentity as UsersIcon,
    Kitchen as KitchenIcon,
    AccessTime as PassRequestsIcon,
    Biotech as UAFormIcon,
    Folder as IncidentReportsIcon,
    RestaurantMenu as RestaurantMenuIcon,
} from "@mui/icons-material";

import MainLayout from "./layouts/main";
import DashboardPage from "./pages/dashboard";
import UsersPage from "./pages/users";
import KitchenDisplayPage from "./pages/kitchen/display";
import KitchenMenusPage from "./pages/kitchen/menus";
import KitchenResourcesPage from "./pages/kitchen/kitchen-resources";
import PassRequestsPage from "./pages/pass-request";
import UAFormPage from "./pages/ua-form";
import IncidentReportsPage from "./pages/incident-reports";
import LoginPage from "./pages/login";
import LogoutPage from "./pages/logout";
import PasswordPage from "./pages/password";
import NotFoundPage from "./pages/not-found";

export interface AppRouteHandle {
    title: string;
    icon?: ReactNode;
    showInNavigation?: boolean;
}

export type AppRouteObject = RouteObject & {
    handle?: AppRouteHandle;
    children?: AppRouteObject[];
};

export const routesConfig: AppRouteObject[] = [
    {
        path: "/login",
        element: <LoginPage />,
        handle: {
            title: "Sign In",
            showInNavigation: false,
        },
    },
    {
        path: "/logout",
        element: <LogoutPage />,
        handle: {
            title: "Sign Out",
            showInNavigation: false,
        },
    },
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <DashboardPage />,
                handle: {
                    title: "Dashboard",
                    icon: <DashboardIcon />,
                    showInNavigation: true,
                },
            },
            {
                path: "users",
                element: <UsersPage />,
                handle: {
                    title: "Users",
                    icon: <UsersIcon />,
                    showInNavigation: true,
                },
            },
            {
                path: "kitchen",
                element: <KitchenDisplayPage />,
                handle: {
                    title: "Kitchen Display",
                    icon: <KitchenIcon />,
                    showInNavigation: true,
                },
            },
            {
                path: "kitchen/menus",
                element: <KitchenMenusPage />,
                handle: {
                    title: "Kitchen Menus",
                    icon: <RestaurantMenuIcon />,
                    showInNavigation: true,
                },
            },
            {
                path: "kitchen/resources",
                element: <KitchenResourcesPage />,
                handle: {
                    title: "Kitchen Resources",
                    icon: <RestaurantMenuIcon />,
                    showInNavigation: true,
                },
            },
            {
                path: "pass-requests",
                element: <PassRequestsPage />,
                handle: {
                    title: "Pass Requests",
                    icon: <PassRequestsIcon />,
                    showInNavigation: true,
                },
            },
            {
                path: "ua-form",
                element: <UAFormPage />,
                handle: {
                    title: "UA Form",
                    icon: <UAFormIcon />,
                    showInNavigation: true,
                },
            },
            {
                path: "incident-reports",
                element: <IncidentReportsPage />,
                handle: {
                    title: "Incident Reports",
                    icon: <IncidentReportsIcon />,
                    showInNavigation: true,
                },
            },
            {
                path: "/password",
                element: <PasswordPage />,
                handle: {
                    title: "Change Password",
                    showInNavigation: false,
                },
            },
            {
                path: "*",
                element: <NotFoundPage />,
                handle: {
                    title: "Page Not Found",
                    showInNavigation: false,
                },
            },
        ],
    },
];