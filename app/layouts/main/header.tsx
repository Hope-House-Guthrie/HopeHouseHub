import { AppBar, IconButton, Toolbar, Typography, useTheme } from "@mui/material";
import { Menu as MenuIcon } from '@mui/icons-material';

export interface MainHeaderProps {
    headerText: string | undefined;
    drawerWidth: number;
    drawerOpen: boolean;
    setDrawerOpen(value: boolean): void;
}

export const MainHeader: React.FC<MainHeaderProps> = (props) => {
    const theme = useTheme();
    
    return (
        <AppBar
            position="fixed"
            sx={{
                width: { md: `calc(100% - ${props.drawerWidth}px)` },
                ml: { md: `${props.drawerWidth}px` },
                boxShadow: 'none',
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary
            }}>
            <Toolbar>
                <IconButton
                    color="inherit"
                    edge="start"
                    onClick={() => props.setDrawerOpen(!props.drawerOpen)}
                    sx={{ mr: 2, display: { md: 'none' } }}>
                    <MenuIcon />
                </IconButton>
                
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
                    {props.headerText}
                </Typography>
            </Toolbar>
        </AppBar>
    );
};

export default MainHeader;