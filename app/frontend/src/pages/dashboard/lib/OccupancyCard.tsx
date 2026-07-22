import React from 'react';
import { Card, CardContent, Box, Typography, LinearProgress } from '@mui/material';
import { Hotel as BedIcon } from '@mui/icons-material';

interface OccupancyCategory {
    occupied: number;
    total: number;
}

interface OccupancyCardProps {
    men: OccupancyCategory;
    women: OccupancyCategory;
    overnight: OccupancyCategory;
}

export default function OccupancyCard({ men, women, overnight }: OccupancyCardProps) {
    const totalOccupied = men.occupied + women.occupied + overnight.occupied;
    const totalAvailable = men.total + women.total + overnight.total;
    const occupancyRate = totalAvailable > 0 ? (totalOccupied / totalAvailable) * 100 : 0;

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color="textSecondary" variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        Occupancy
                    </Typography>
                    <BedIcon color="primary" />
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {totalOccupied} <Typography component="span" variant="h5" color="textSecondary">/ {totalAvailable}</Typography>
                </Typography>
                
                <Box sx={{ width: '100%', mt: 1, mb: 1 }}>
                    <LinearProgress variant="determinate" value={occupancyRate} />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                        Men: <strong>{men.occupied}/{men.total}</strong>
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        Women: <strong>{women.occupied}/{women.total}</strong>
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        Overnight: <strong>{overnight.occupied}/{overnight.total}</strong>
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}
