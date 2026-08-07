import { Box, Typography } from "@mui/material";

export default function KitchenMenusPage() {
    return (
        <Box sx={{ p: 3}}>
          <Typography variant="h4" component="h1">
            Kitchen Menus
          </Typography>
          <Typography sx={{ mt: 2, opacity: 0.8 }}>
            Manager's Page - library and today&apos;s meals (coming next).
          </Typography>
        </Box>    
    );
}
