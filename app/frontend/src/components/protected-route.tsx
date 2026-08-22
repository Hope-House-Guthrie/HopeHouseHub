import { Navigate, Outlet, useLocation, useMatches } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { hasRequiredRole, type AppRouteHandle } from "@/routes";

export default function ProtectedRoute() {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const location = useLocation();
    const matches = useMatches();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const currentMatch = matches[matches.length - 1];
    const routeHandle = currentMatch?.handle as AppRouteHandle | undefined;

    if (routeHandle?.roles && !hasRequiredRole(user?.roles ?? [], routeHandle.roles)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}