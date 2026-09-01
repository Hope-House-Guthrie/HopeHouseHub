import { Link as RouterLink } from "react-router";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";

export default function BoardReportsPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" component="h1">
          Board Reports
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ mt: 0.5 }}>
          September 2026 Board Meeting
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 1, maxWidth: 760 }}
        >
          Information Technology reports covering the development and
          continued progress of the Hope House Hub.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Card sx={{ minWidth: 280, flex: "1 1 320px" }}>
          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
          >
            <Box>
              <Chip label="IT Specialist" size="small" sx={{ mb: 1 }} />
              <Typography variant="h5">Brent</Typography>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Hope House Hub frontend development, operational workflows,
              prototypes, staff feedback, and display development.
            </Typography>

            <Button
              component={RouterLink}
              to="/prototype/board-reports/brent"
              variant="contained"
              sx={{ alignSelf: "flex-start" }}
            >
              View Brent&apos;s Report
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 280, flex: "1 1 320px" }}>
          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
          >
            <Box>
              <Chip label="IT Specialist" size="small" sx={{ mb: 1 }} />
              <Typography variant="h5">TJ</Typography>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Hope House Hub engineering, technical foundation,
              infrastructure, and continued system development.
            </Typography>

            <Button
              component={RouterLink}
              to="/prototype/board-reports/tj"
              variant="contained"
              sx={{ alignSelf: "flex-start" }}
            >
              View TJ&apos;s Report
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}