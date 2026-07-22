import React from 'react';
import { Card, CardContent, Box, Typography, Grid } from '@mui/material';
import { CheckCircleOutlined as UaIcon } from '@mui/icons-material';

interface UaTestsCardProps {
    completed: number;
    remaining: number;
}

export default function UaTestsCard({ completed, remaining }: UaTestsCardProps) {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color="textSecondary" variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        UA Tests Today
                    </Typography>
                    <UaIcon color="primary" />
                </Box>
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {completed}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Completed
                        </Typography>
                    </Grid>
                    <Grid size={6}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {remaining}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Remaining
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
