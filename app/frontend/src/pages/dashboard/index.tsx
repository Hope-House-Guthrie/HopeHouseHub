import React from 'react';
import { Box, Grid, Typography } from '@mui/material';

import ResidentsCard from './lib/ResidentsCard';
import OccupancyCard from './lib/OccupancyCard';
import UaTestsCard from './lib/UaTestsCard';
import IncomingCallsCard from './lib/IncomingCallsCard';

const DASHBOARD_DATA = {
    residents: {
        adults: 98,
        kids: 26,
    },
    beds: {
        men: { occupied: 65, total: 80 },
        women: { occupied: 45, total: 60 },
        overnight: { occupied: 12, total: 15 },
    },
    uaTests: {
        completed: 18,
        remaining: 7,
    },
    calls: {
        today: 14,
        week: 82,
        month: 342,
    },
};

export default function Dashboard() {
    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
                <ResidentsCard 
                    adults={DASHBOARD_DATA.residents.adults} 
                    kids={DASHBOARD_DATA.residents.kids} 
                />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <OccupancyCard 
                    men={DASHBOARD_DATA.beds.men} 
                    women={DASHBOARD_DATA.beds.women} 
                    overnight={DASHBOARD_DATA.beds.overnight} 
                />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <UaTestsCard 
                    completed={DASHBOARD_DATA.uaTests.completed} 
                    remaining={DASHBOARD_DATA.uaTests.remaining} 
                />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <IncomingCallsCard 
                    today={DASHBOARD_DATA.calls.today} 
                    week={DASHBOARD_DATA.calls.week} 
                    month={DASHBOARD_DATA.calls.month} 
                />
            </Grid>
        </Grid>
    );
}
