import React from 'react';
import { Card, CardContent, Box, Typography, Divider } from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';

interface ResidentsCardProps {
    adults: number;
    kids: number;
}

export default function ResidentsCard({ adults, kids }: ResidentsCardProps) {
    const total = adults + kids;

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color="textSecondary" variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        Residents
                    </Typography>
                    <PeopleIcon color="primary" />
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {total}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                        Adults: <strong>{adults}</strong>
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Kids: <strong>{kids}</strong>
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}
