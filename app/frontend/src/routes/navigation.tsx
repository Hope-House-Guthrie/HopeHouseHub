import { type ReactNode } from "react";
import type { RouteObject } from "react-router";

export type NavigationNode = RouteObject & {
    config?: NavigationConfig;
    children?: NavigationNode[];
};

export interface NavigationConfig {
    title: string;
    icon?: ReactNode;
    showInNavigation?: boolean;
    group?: string;
    roles?: string[];
}

export interface NavigationItem {
    path: string;
    title: string;
    icon?: ReactNode;
    group?: string;
    roles?: string[];
}

export interface NavigationGroup {
    groupName: string | null;
    items: NavigationItem[];
}

export function hasRequiredRole(userRoles: string[] = [], requiredRoles?: string[]): boolean {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.some((role) => userRoles.includes(role));
}

export function getGroupedNavigationItems(
    routes: NavigationNode[],
    userRoles: string[] = [],
    basePath = ""
): NavigationGroup[] {
    const rawItems: NavigationItem[] = [];

    const extractItems = (nodes: NavigationNode[], currentBase = "") => {
        for (const route of nodes) {
            let currentPath = currentBase;
            if (route.index) {
                currentPath = currentBase || "/";
            } else if (route.path) {
                currentPath = route.path.startsWith("/")
                    ? route.path
                    : `${currentBase}/${route.path}`.replace(/\/+/g, "/");
            }

            if (route.config?.showInNavigation && route.config.title) {
                if (hasRequiredRole(userRoles, route.config.roles)) {
                    rawItems.push({
                        path: currentPath,
                        title: route.config.title,
                        icon: route.config.icon,
                        group: route.config.group,
                        roles: route.config.roles,
                    });
                }
            }

            if (route.children) {
                extractItems(route.children, currentPath);
            }
        }
    };

    extractItems(routes, basePath);

    const groupsMap = new Map<string | null, NavigationItem[]>();

    for (const item of rawItems) {
        const groupName = item.group || null;
        if (!groupsMap.has(groupName)) {
            groupsMap.set(groupName, []);
        }
        groupsMap.get(groupName)!.push(item);
    }

    const groups: NavigationGroup[] = [];

    if (groupsMap.has(null)) {
        groups.push({
            groupName: null,
            items: groupsMap.get(null)!,
        });
        groupsMap.delete(null);
    }

    for (const [groupName, items] of groupsMap.entries()) {
        groups.push({
            groupName,
            items,
        });
    }

    return groups;
}