// todo: decompose to components

import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { 
    Box, 
    useTheme
} from '@mui/material';

import MainHeader from "./header";
import MainDrawer from "./drawer";

const DRAWER_WIDTH = 200;

export const MainLayout: React.FC = () => {
    const theme = useTheme();
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        
            <MainHeader
                headerText="Hope House Hub"
                drawerWidth={DRAWER_WIDTH}
                drawerOpen={drawerOpen}
                setDrawerOpen={setDrawerOpen} />
            
            <MainDrawer
                drawerWidth={DRAWER_WIDTH}
                drawerOpen={drawerOpen}
                setDrawerOpen={setDrawerOpen} />
            
            {/* todo: `paddingTop` should be a variable / calc'd from the header height */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    backgroundColor: theme.palette.background.default,
                    paddingTop: '64px',
                }}>

                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;