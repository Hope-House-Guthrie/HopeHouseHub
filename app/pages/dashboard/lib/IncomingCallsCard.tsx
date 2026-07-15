import React from 'react';
import { Card, CardContent, Box, Typography, Grid } from '@mui/material';
import { PhoneInTalk as PhoneIcon } from '@mui/icons-material';

interface IncomingCallsCardProps {
    today: number;
    week: number;
    month: number;
}

export default function IncomingCallsCard({ today, week, month }: IncomingCallsCardProps) {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color="textSecondary" variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        Incoming Calls
                    </Typography>
                    <PhoneIcon color="primary" />
                </Box>
                <Grid container spacing={1}>
                    <Grid size={4}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {today}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Today
                        </Typography>
                    </Grid>
                    <Grid size={4}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {week}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            This Week
                        </Typography>
                    </Grid>
                    <Grid size={4}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {month}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            This Month
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
