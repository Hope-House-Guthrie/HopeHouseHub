import {
  Dashboard as DashboardIcon,
  PermIdentity as UsersIcon,
  Kitchen as KitchenIcon,
  AccessTime as PassRequestsIcon,
  Biotech as UAFormIcon,
  Folder as IncidentReportsIcon,
  RestaurantMenu as RestaurantMenuIcon,
  VolunteerActivism as WalkInServicesIcon,
  DirectionsCar as VehiclesIcon,
  AssignmentInd as DailyDutiesIcon,
  NotificationImportant as FriendlyRemindersIcon,
  History as HistoryIcon,
  PendingActions as PendingActionsIcon,
  Science as UaManagementIcon,
  RestaurantMenu as MealsIcon,
  Fastfood as MenuItemsIcon,
  FormatQuote as KennyismsIcon,
  RestaurantMenu as KitchenMenusIcon,
  MenuBook as KitchenResourcesIcon,
  Tv as HouseDisplayIcon,
  Description as BoardReportsIcon,
} from "@mui/icons-material";

import type { NavigationNode } from "./navigation";
export * from "./navigation";

import ProtectedRoute from "@/components/protected-route";
import MainLayout from "@/layouts/main";
import DashboardPage from "@/pages/dashboard";
import UsersPage from "@/pages/users";
import KitchenDisplayPage from "@/pages/prototype/kitchen/display";
import KitchenMenusPage from "@/pages/prototype/kitchen/menus";
import KitchenResourcesPage from "@/pages/prototype/kitchen/kitchen-resources";
import PassRequestsPage from "@/pages/prototype/pass-request";
import UAFormPage from "@/pages/prototype/ua-form";
import IncidentReportsPage from "@/pages/prototype/incident-reports";
import KitchenMealsPage from "@/pages/kitchen/meals";
import KitchenMenuItemsPage from "@/pages/kitchen/menu-items";
import KitchenKennyismsPage from "@/pages/kitchen/kennyisms";
import LoginPage from "@/pages/login";
import LogoutPage from "@/pages/logout";
import PasswordPage from "@/pages/password";
import NotFoundPage from "@/pages/not-found";
import WalkInServicesPage from "@/pages/prototype/walk-in-services";
import VehiclesPage from "@/pages/prototype/vehicles";
import DailyDutiesPage from "@/pages/prototype/daily-duties";
import RollCallPage from "@/pages/prototype/daily-duties/roll-call";
import ClassAttendancePage from "@/pages/prototype/daily-duties/class-attendance";
import RoomInspectionsPage from "@/pages/prototype/daily-duties/room-inspections";
import ChoreCheckOffPage from "@/pages/prototype/daily-duties/chore-check-off";
import ChoreLibraryPage from "@/pages/prototype/daily-duties/chore-library";
import WeeklyChoreAssignPage from "@/pages/prototype/daily-duties/weekly-chore-assign";
import ClassLibraryPage from "@/pages/prototype/daily-duties/class-library";
import FriendlyRemindersPage from "@/pages/prototype/friendly-reminders";
import IncidentReportsPendingPage from "@/pages/prototype/incident-reports/pending";
import IncidentReportsHistoryPage from "@/pages/prototype/incident-reports/history";
import UaManagementPage from "@/pages/prototype/ua-management";
import HouseDisplayPage from "@/pages/prototype/house-display";
import HouseDisplayManagePage from "@/pages/prototype/house-display/manage";
import BoardReportsPage from "@/pages/prototype/board-reports";
import BrentBoardReportPage from "@/pages/prototype/board-reports/brent";
import TJBoardReportPage from "@/pages/prototype/board-reports/tj";

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
        path: "/house-display",
        element: <HouseDisplayPage />,
        handle: {
          title: "House Display",
          showInNavigation: false,
          roles: ["PROTOTYPE"],
        },
      },
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
            path: "kitchen/meals",
            element: <KitchenMealsPage />,
            config: {
              title: "Meals",
              icon: <MealsIcon />,
              showInNavigation: true,
              group: "Kitchen Preview",
              roles: ["PREVIEW"],
            },
          },
          {
            path: "kitchen/menu-items",
            element: <KitchenMenuItemsPage />,
            config: {
              title: "Menu Items",
              icon: <MenuItemsIcon />,
              showInNavigation: true,
              group: "Kitchen Preview",
              roles: ["PREVIEW"],
            },
          },
          {
            path: "kitchen/kennyisms",
            element: <KitchenKennyismsPage />,
            config: {
              title: "Kennyisms",
              icon: <KennyismsIcon />,
              showInNavigation: true,
              group: "Kitchen Preview",
              roles: ["PREVIEW"],
            },
          },
          {
            path: "prototype/kitchen/display",
            element: <KitchenDisplayPage />,
            config: {
              title: "Kitchen Display",
              icon: <KitchenIcon />,
              showInNavigation: true,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/kitchen/menus",
            element: <KitchenMenusPage />,
            config: {
              title: "Kitchen Menus",
              icon: <KitchenMenusIcon />,
              showInNavigation: true,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/kitchen/resources",
            element: <KitchenResourcesPage />,
            config: {
              title: "Kitchen Resources",
              icon: <KitchenResourcesIcon />,
              showInNavigation: true,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/pass-requests",
            element: <PassRequestsPage />,
            config: {
              title: "Pass Requests",
              icon: <PassRequestsIcon />,
              showInNavigation: true,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/ua-form",
            element: <UAFormPage />,
            config: {
              title: "UA Form",
              icon: <UAFormIcon />,
              showInNavigation: true,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/incident-reports",
            element: <IncidentReportsPage />,
            config: {
              title: "Incident Reports",
              icon: <IncidentReportsIcon />,
              showInNavigation: true,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/walk-in-services",
            element: <WalkInServicesPage />,
            handle: {
              title: "Walk-In Services",
              icon: <WalkInServicesIcon />,
              showInNavigation: true,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/vehicles",
            element: <VehiclesPage />,
            handle: {
              title: "Vehicles",
              icon: <VehiclesIcon />,
              showInNavigation: true,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/daily-duties",
            element: <DailyDutiesPage />,
            handle: {
              title: "Daily Duties",
              icon: <DailyDutiesIcon />,
              showInNavigation: true,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/daily-duties/roll-call",
            element: <RollCallPage />,
            handle: {
              title: "Morning Roll Call",
              showInNavigation: false,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/daily-duties/class-attendance",
            element: <ClassAttendancePage />,
            handle: {
              title: "Class Attendance",
              showInNavigation: false,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/daily-duties/class-library",
            element: <ClassLibraryPage />,
            handle: {
              title: "Class Library",
              showInNavigation: false,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/daily-duties/room-inspections",
            element: <RoomInspectionsPage />,
            handle: {
              title: "Room Inspections",
              showInNavigation: false,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/daily-duties/chore-check-off",
            element: <ChoreCheckOffPage />,
            handle: {
              title: "Chore Check-Off",
              showInNavigation: false,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/daily-duties/chore-library",
            element: <ChoreLibraryPage />,
            handle: {
              title: "Chore Library",
              showInNavigation: false,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/daily-duties/weekly-chore-assign",
            element: <WeeklyChoreAssignPage />,
            handle: {
              title: "Weekly Chore Assign",
              showInNavigation: false,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/friendly-reminders",
            element: <FriendlyRemindersPage />,
            handle: {
              title: "Friendly Reminders",
              icon: <FriendlyRemindersIcon />,
              showInNavigation: true,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/incident-reports/pending",
            element: <IncidentReportsPendingPage />,
            handle: {
              title: "IR Pending",
              icon: <PendingActionsIcon />,
              showInNavigation: false,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/incident-reports/history",
            element: <IncidentReportsHistoryPage />,
            handle: {
              title: "IR History",
              icon: <HistoryIcon />,
              showInNavigation: false,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/ua-management",
            element: <UaManagementPage />,
            handle: {
              title: "UA Management",
              icon: <UaManagementIcon />,
              showInNavigation: true,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            // Management (Hub chrome). TV kiosk stays at /house-display outside MainLayout.
            path: "prototype/house-display",
            element: <HouseDisplayManagePage />,
            // handle → ProtectedRoute roles + header title
            handle: {
              title: "House Display",
              icon: <HouseDisplayIcon />,
              showInNavigation: true,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
            // config → drawer nav (getGroupedNavigationItems reads config only)
            config: {
              title: "House Display",
              icon: <HouseDisplayIcon />,
              showInNavigation: true,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/board-reports",
            element: <BoardReportsPage />,
            handle: {
              title: "Board Reports",
              icon: <BoardReportsIcon />,
              showInNavigation: true,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
            config: {
              title: "Board Reports",
              icon: <BoardReportsIcon />,
              showInNavigation: true,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/board-reports/brent",
            element: <BrentBoardReportPage />,
            handle: {
              title: "Brent IT Report",
              showInNavigation: false,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
          {
            path: "prototype/board-reports/tj",
            element: <TJBoardReportPage />,
            handle: {
              title: "TJ IT Report",
              showInNavigation: false,
              group: "Prototype",
              roles: ["PROTOTYPE"],
            },
          },
        ],
      },
    ],
  },
];
