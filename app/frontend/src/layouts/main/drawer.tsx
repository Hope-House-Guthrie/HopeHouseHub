import React, { useMemo } from "react";
import { Link, useLocation } from "react-router";
import { useSelector } from "react-redux";
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    useTheme,
} from "@mui/material";

import Logo from "@assets/hhg-logo.svg";
import { routesConfig, getGroupedNavigationItems } from "@/routes";
import type { RootState } from "@/store";

export interface MainDrawerProps {
    drawerWidth: number;
    drawerOpen: boolean;
    setDrawerOpen(value: boolean): void;
}

export const MainDrawer: React.FC<MainDrawerProps> = (props) => {
    const theme = useTheme();
    const location = useLocation();
    const { user } = useSelector((state: RootState) => state.auth);

    const navGroups = useMemo(
        () => getGroupedNavigationItems(routesConfig, user?.roles ?? []),
        [user?.roles]
    );

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

            <List disablePadding>
                {navGroups.map((group, groupIdx) => (
                    <Box key={group.groupName || `ungrouped-${groupIdx}`}>
                        {group.groupName && (
                            <ListSubheader
                                component="div"
                                sx={{
                                    lineHeight: "32px",
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    backgroundColor: "transparent",
                                    color: "text.secondary",
                                    pt: 1.5,
                                    pb: 0.5,
                                }}
                            >
                                {group.groupName}
                            </ListSubheader>
                        )}
                        {group.items.map((item) => {
                            const active = isSelected(item.path);

                            return (
                                <ListItem key={item.path} disablePadding>
                                    <ListItemButton
                                        component={Link}
                                        to={item.path}
                                        selected={active}
                                        onClick={() => props.setDrawerOpen(false)}
                                        sx={{
                                            "&.Mui-selected": {
                                                borderRight: `4px solid ${theme.palette.primary.main}`,
                                                backgroundColor: theme.palette.action.selected,
                                            },
                                        }}
                                    >
                                        {item.icon && (
                                            <ListItemIcon sx={{ color: active ? "primary.main" : "inherit" }}>
                                                {item.icon}
                                            </ListItemIcon>
                                        )}
                                        <ListItemText
                                            primary={item.title}
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
                    </Box>
                ))}
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