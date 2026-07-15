import { Link, useLocation } from 'react-router';
import {
    Dashboard as DashboardIcon,
    History as HistoryIcon,
    EmojiEvents as AwardsIcon,
    Settings as SettingsIcon,
    People as AccountsIcon,
} from '@mui/icons-material';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material';

import Logo from "@assets/hhg-logo.png";

const menuItems = [
    { path: '/', text: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/accounts', text: 'Accounts', icon: <AccountsIcon/> },
    { path: '/history', text: 'History', icon: <HistoryIcon /> },
    { path: '/awards', text: 'Awards', icon: <AwardsIcon /> },
    { path: '/settings', text: 'Settings', icon: <SettingsIcon /> },
];

export interface MainDrawerProps {
    drawerWidth: number;
    drawerOpen: boolean;
    setDrawerOpen(value: boolean): void;
}

export const MainDrawer: React.FC<MainDrawerProps> = (props) => {
    const theme = useTheme();
    const location = useLocation();

    const isSelected = (path: string) => {
    if (path === '/') {
        return location.pathname === '/';
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
                display: 'flex',
                padding: 1,
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain", 
            }} />
        
            <List>
            {menuItems.map((item) => {
                const active = isSelected(item.path);

                return (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton 
                            component={Link}
                            to={item.path}
                            selected={active}
                            onClick={() => props.setDrawerOpen(false)}
                            sx={{
                                '&.Mui-selected': {
                                    borderRight: `4px solid ${theme.palette.primary.main}`,
                                    backgroundColor: theme.palette.action.selected,
                                }
                            }}>
                                <ListItemIcon sx={{ color: active ? 'primary.main' : 'inherit' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={item.text} 
                                    slotProps={{
                                        primary: {
                                            variant: 'body2',
                                            sx: {
                                                fontWeight: active ? 600 : 400,
                                            }
                                        }
                                    }} />
                            </ListItemButton>
                    </ListItem>
                );
            })}
            </List>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { md: props.drawerWidth }, flexShrink: { md: 0 } }}>
       
            <Drawer
                variant="temporary"
                open={props.drawerOpen}
                onClose={() => props.setDrawerOpen(false)}
                ModalProps={{ keepMounted: true }} // Better mobile performance
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: props.drawerWidth },
                }}>
                {drawerContent}
            </Drawer>
            
            {/* Desktop View Persistent Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: props.drawerWidth,
                        borderRight: `1px solid ${theme.palette.divider}`
                    },
                }}
                open>
            {drawerContent}
            </Drawer>
        </Box>
    );
}

export default MainDrawer;