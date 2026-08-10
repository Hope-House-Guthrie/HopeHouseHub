import { type RouteObject } from "react-router";
import { type ReactNode } from "react";
import {
    Dashboard as DashboardIcon,
    //People as AccountsIcon,
    //PhoneCallback as IncomingCallsIcon,
    PermIdentity as ClientsIcon,
    //Settings as SettingsIcon,
    Kitchen as KitchenIcon,
} from "@mui/icons-material";

import MainLayout from "./layouts/main";
import DashboardPage from "./pages/dashboard";
import ClientsPage from "./pages/clients";
import KitchenDisplayPage from "./pages/kitchen/display";
import KitchenMenusPage from "./pages/kitchen/menus";
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
//import AccountsPage from "./pages/accounts";
import NotFoundPage from "./pages/not-found";
import KitchenResourcesPage from "./pages/kitchen/kitchen-resources";

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
                path: "clients",
                element: <ClientsPage />,
                handle: {
                    title: "Clients",
                    icon: <ClientsIcon />,
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