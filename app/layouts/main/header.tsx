import React, { useState } from "react";
import { useMatches } from "react-router";
import { 
    AppBar, 
    Box, 
    IconButton, 
    Toolbar, 
    Typography, 
    useTheme, 
    Menu, 
    MenuItem, 
    Avatar, 
    Button, 
    ListItemIcon 
} from "@mui/material";
import { 
    Menu as MenuIcon, 
    Logout as LogoutIcon, 
    KeyboardArrowDown as ArrowDownIcon 
} from "@mui/icons-material";
import { type AppRouteHandle } from "@/routes";

export interface MainHeaderProps {
    drawerWidth: number;
    drawerOpen: boolean;
    setDrawerOpen(value: boolean): void;
}

export const MainHeader: React.FC<MainHeaderProps> = (props) => {
    const theme = useTheme();
    const matches = useMatches();
    
    // State to manage the anchor element for the dropdown menu
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);

    // Placeholder data representing the currently authenticated user
    const placeholderUser = {
        firstName: "Jane",
        lastName: "Doe",
        initials: "JD"
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleSignOut = () => {
        // Implement authentication termination logic here
        handleMenuClose();
    };
    
    // Find deepest matched route containing custom handle metadata
    const currentMatch = [...matches].reverse().find(
        (match) => match.handle && (match.handle as AppRouteHandle).title
    );
    
    const handle = currentMatch ? (currentMatch.handle as AppRouteHandle) : null;
    const headerTitle = handle?.title ?? "Hope House Hub";
    const headerIcon = handle?.icon ?? null;
    
    return (
        <AppBar
            position="fixed"
            sx={{
                width: { md: `calc(100% - ${props.drawerWidth}px)` },
                ml: { md: `${props.drawerWidth}px` },
                boxShadow: "none",
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    edge="start"
                    onClick={() => props.setDrawerOpen(!props.drawerOpen)}
                    sx={{ mr: 2, display: { md: "none" } }}
                >
                    <MenuIcon />
                </IconButton>
                
                {headerIcon && (
                    <Box sx={{ display: "flex", alignItems: "center", mr: 1.5, color: "text.secondary" }}>
                        {headerIcon}
                    </Box>
                )}
                
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
                    {headerTitle}
                </Typography>

                {/* Flex Spacer to push subsequent elements to the far right */}
                <Box sx={{ flexGrow: 1 }} />

                {/* Interactive User Dropdown Trigger */}
                <Button
                    color="inherit"
                    onClick={handleMenuOpen}
                    endIcon={<ArrowDownIcon />}
                    sx={{ 
                        textTransform: "none", 
                        borderRadius: 2,
                        px: 1.5,
                        color: "text.primary"
                    }}
                >
                    <Avatar 
                        sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 1, 
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText
                        }}
                    >
                        {placeholderUser.initials}
                    </Avatar>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            fontWeight: 500,
                            display: { xs: "none", sm: "block" } 
                        }}
                    >
                        {placeholderUser.firstName} {placeholderUser.lastName}
                    </Typography>
                </Button>

                {/* Dropdown Menu Component */}
                <Menu
                    anchorEl={anchorEl}
                    open={isMenuOpen}
                    onClose={handleMenuClose}
                    onClick={handleMenuClose}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    slotProps={{
                        paper: {
                            elevation: 0,
                            sx: {
                                overflow: "visible",
                                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.12))",
                                border: `1px solid ${theme.palette.divider}`,
                                mt: 1.5,
                                "&::before": {
                                    content: '""',
                                    display: "block",
                                    position: "absolute",
                                    top: 0,
                                    right: 14,
                                    width: 10,
                                    height: 10,
                                    bgcolor: "background.paper",
                                    transform: "translateY(-50%) rotate(45deg)",
                                    zIndex: 0,
                                    borderLeft: `1px solid ${theme.palette.divider}`,
                                    borderTop: `1px solid ${theme.palette.divider}`,
                                },
                            },
                        }
                    }}
                >
                    <MenuItem onClick={handleSignOut} sx={{ py: 1, px: 2 }}>
                        <ListItemIcon sx={{ minWidth: "36px !important" }}>
                            <LogoutIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <Typography variant="body2" color="error.main" sx={{ fontWeight: 500 }}>
                            Sign out
                        </Typography>
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default MainHeader;