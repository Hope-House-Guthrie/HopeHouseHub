import React from "react";
import { Link, useLocation } from "react-router";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme } from "@mui/material";

import Logo from "@assets/hhg-logo.svg";
import { routesConfig, type AppRouteObject } from "@/routes";

export interface MainDrawerProps {
    drawerWidth: number;
    drawerOpen: boolean;
    setDrawerOpen(value: boolean): void;
}

export const MainDrawer: React.FC<MainDrawerProps> = (props) => {
    const theme = useTheme();
    const location = useLocation();

    // Dynamically retrieve navigation routes from the routesConfig structure
    const mainLayoutRoute = routesConfig.find((r) => r.path === "/");
    const navigationItems: AppRouteObject[] = mainLayoutRoute?.children 
        ? mainLayoutRoute.children.filter((child) => child.handle?.showInNavigation)
        : [];

    const isSelected = (path: string) => {
        if (path === "/") {
            return location.pathname === "/";
        }
        return location.pathname.startsWith(path);
    };

    const drawerContent = (
        <Box>
            <Box
                component="img"
                src={Logo}
                alt="HHG Logo"
                sx={{
                    display: "flex",
                    padding: 3,
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                }}
            />
        
            <List>
                {navigationItems.map((item) => {
                    // Reconstruct path relative to the root layout
                    const absolutePath = item.index ? "/" : `/${item.path}`;
                    const active = isSelected(absolutePath);

                    return (
                        <ListItem key={absolutePath} disablePadding>
                            <ListItemButton 
                                component={Link}
                                to={absolutePath}
                                selected={active}
                                onClick={() => props.setDrawerOpen(false)}
                                sx={{
                                    "&.Mui-selected": {
                                        borderRight: `4px solid ${theme.palette.primary.main}`,
                                        backgroundColor: theme.palette.action.selected,
                                    },
                                }}
                            >
                                {item.handle?.icon && (
                                    <ListItemIcon sx={{ color: active ? "primary.main" : "inherit" }}>
                                        {item.handle.icon}
                                    </ListItemIcon>
                                )}
                                <ListItemText 
                                    primary={item.handle?.title} 
                                    slotProps={{
                                        primary: {
                                            variant: "body2",
                                            sx: {
                                                fontWeight: active ? 600 : 400,
                                            },
                                        },
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );

    return (
        <Box component="nav" sx={{ width: { md: props.drawerWidth }, flexShrink: { md: 0 } }}>
            <Drawer
                variant="temporary"
                open={props.drawerOpen}
                onClose={() => props.setDrawerOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": { boxSizing: "border-box", width: props.drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>
            
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", md: "block" },
                    "& .MuiDrawer-paper": { 
                        boxSizing: "border-box", 
                        width: props.drawerWidth,
                        borderRight: `1px solid ${theme.palette.divider}`,
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default MainDrawer;