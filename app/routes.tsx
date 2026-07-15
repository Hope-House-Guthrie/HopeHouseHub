import { type RouteObject } from "react-router";
import { type ReactNode } from "react";
import {
    Dashboard as DashboardIcon,
    People as AccountsIcon,
    PhoneCallback as IncomingCallsIcon,
    PermIdentity as ClientsIcon,
    Settings as SettingsIcon,
} from "@mui/icons-material";

import MainLayout from "./layouts/main";
import DashboardPage from "./pages/dashboard";
import AccountsPage from "./pages/accounts";
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
                path: "calls",
                element: <div>Incoming Calls Page</div>, 
                handle: {
                    title: "Incoming Calls",
                    icon: <IncomingCallsIcon />,
                    showInNavigation: true,
                },
            },
            {
                path: "clients",
                element: <div>Client Profiles Page</div>, 
                handle: {
                    title: "Client Profiles",
                    icon: <ClientsIcon />,
                    showInNavigation: true,
                },
            },
            {
                path: "accounts",
                element: <AccountsPage />,
                handle: {
                    title: "Manage Accounts",
                    icon: <AccountsIcon />,
                    showInNavigation: true,
                },
            },
            {
                path: "settings",
                element: <div>Settings Page</div>, 
                handle: {
                    title: "Settings",
                    icon: <SettingsIcon />,
                    showInNavigation: true,
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