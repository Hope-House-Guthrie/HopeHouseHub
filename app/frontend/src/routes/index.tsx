import {
    Dashboard as DashboardIcon,
    PermIdentity as UsersIcon,
    Kitchen as KitchenIcon,
    AccessTime as PassRequestsIcon,
    Biotech as UAFormIcon,
    Folder as IncidentReportsIcon,
    RestaurantMenu as RestaurantMenuIcon,
} from "@mui/icons-material";

import type { NavigationNode } from "./navigation";
export * from "./navigation";

import ProtectedRoute from "@/components/protected-route";
import MainLayout from "@/layouts/main";
import DashboardPage from "@/pages/dashboard";
import UsersPage from "@/pages/users";
import KitchenDisplayPage from "@/pages/kitchen/display";
import KitchenMenusPage from "@/pages/kitchen/menus";
import KitchenResourcesPage from "@/pages/kitchen/kitchen-resources";
import PassRequestsPage from "@/pages/pass-request";
import UAFormPage from "@/pages/ua-form";
import IncidentReportsPage from "@/pages/incident-reports";
import LoginPage from "@/pages/login";
import LogoutPage from "@/pages/logout";
import PasswordPage from "@/pages/password";
import NotFoundPage from "@/pages/not-found";


export const routesConfig: NavigationNode[] = [
    {
        path: "/login",
        element: <LoginPage />,
        config: { title: "Sign In", showInNavigation: false },
    },
    {
        path: "/logout",
        element: <LogoutPage />,
        config: { title: "Sign Out", showInNavigation: false },
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/",
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <DashboardPage />,
                        config: {
                            title: "Dashboard",
                            icon: <DashboardIcon />,
                            showInNavigation: true,
                        },
                    },
                    {
                        path: "users",
                        element: <UsersPage />,
                        config: {
                            title: "Users",
                            icon: <UsersIcon />,
                            showInNavigation: true,
                            roles: ["ADMIN"],
                        },
                    },
                    {
                        path: "kitchen",
                        element: <KitchenDisplayPage />,
                        config: {
                            title: "Kitchen Display",
                            icon: <KitchenIcon />,
                            showInNavigation: true,
                            group: "Kitchen",
                            roles: ["ADMIN", "KITCHEN"],
                        },
                    },
                    {
                        path: "kitchen/menus",
                        element: <KitchenMenusPage />,
                        config: {
                            title: "Kitchen Menus",
                            icon: <RestaurantMenuIcon />,
                            showInNavigation: true,
                            group: "Kitchen",
                            roles: ["ADMIN", "KITCHEN"],
                        },
                    },
                    {
                        path: "kitchen/resources",
                        element: <KitchenResourcesPage />,
                        config: {
                            title: "Kitchen Resources",
                            icon: <RestaurantMenuIcon />,
                            showInNavigation: true,
                            group: "Kitchen",
                            roles: ["ADMIN", "KITCHEN"],
                        },
                    },
                    {
                        path: "pass-requests",
                        element: <PassRequestsPage />,
                        config: {
                            title: "Pass Requests",
                            icon: <PassRequestsIcon />,
                            showInNavigation: true,
                            roles: ["ADMIN", "CLIENT"],
                        },
                    },
                    {
                        path: "ua-form",
                        element: <UAFormPage />,
                        config: {
                            title: "UA Form",
                            icon: <UAFormIcon />,
                            showInNavigation: true,
                            roles: ["ADMIN", "CLIENT", "LEADER"],
                        },
                    },
                    {
                        path: "incident-reports",
                        element: <IncidentReportsPage />,
                        config: {
                            title: "Incident Reports",
                            icon: <IncidentReportsIcon />,
                            showInNavigation: true,
                            roles: ["ADMIN", "LEADER"],
                        },
                    },
                    {
                        path: "password",
                        element: <PasswordPage />,
                        config: { title: "Change Password", showInNavigation: false },
                    },
                    {
                        path: "*",
                        element: <NotFoundPage />,
                        config: { title: "Page Not Found", showInNavigation: false },
                    },
                ],
            },
        ],
    },
];