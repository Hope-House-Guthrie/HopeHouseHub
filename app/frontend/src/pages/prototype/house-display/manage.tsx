/**
 * STATUS — House Display management (Hub chrome)
 * Branch: feature/house-display
 *
 * DONE:
 * - Management shell under MainLayout at /prototype/house-display
 * - View Full Display opens /house-display in a new tab (TV preview)
 * - Read-only "On TV now" summary from houseDisplay layout seed
 *
 * NOT IN THIS CHUNK:
 * - Live clock / weather API / animations on the TV route
 * - Add/edit/remove/schedule content controls
 * - Backend
 *
 * PAIR:
 * - TV (no chrome): pages/prototype/house-display/index.tsx → /house-display
 * - Manage (this file): → /prototype/house-display
 */
import { useSelector } from "react-redux";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { RootState } from "@/store";

/**
 * Open the presentation-only TV route in a new tab so Hub stays open.
 * noopener/noreferrer: do not give the TV tab a back-reference to Hub.
 */
function openFullDisplayPreview() {
  window.open("/house-display", "_blank", "noopener,noreferrer");
}

export default function HouseDisplayManagePage() {
  const content = useSelector(
    (state: RootState) => state.houseDisplay.content
  );
  const { header, agendaItems, affirmationText, birthday } = content;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h4" component="h1">
        House Display
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Staff management for the house TV display. Content controls come in
        later phases. Use View Full Display to preview exactly what the
        full-screen TV route shows (no Hub header or drawer).
      </Typography>

      <Card sx={{ maxWidth: 560 }}>
        <CardContent
          sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
        >
          <Typography variant="h6">TV preview</Typography>
          <Typography variant="body2" color="text.secondary">
            Opens /house-display in a new tab — presentation only.
          </Typography>
          <Button
            type="button"
            variant="contained"
            startIcon={<OpenInNewIcon />}
            onClick={openFullDisplayPreview}
            sx={{ alignSelf: "flex-start" }}
          >
            View Full Display
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ maxWidth: 560 }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="h6">On TV now (read-only)</Typography>
          <Typography variant="body2" color="text.secondary">
            Same Redux seed the TV page reads. Edit UI is a later phase.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Identity:</strong> {header.identityLabel}
          </Typography>
          <Typography variant="body2">
            <strong>Agenda items:</strong> {agendaItems.length}
          </Typography>
          <Typography variant="body2">
            <strong>Timeline window:</strong> 7:00 AM – 9:00 PM (proportional)
          </Typography>
          <Typography variant="body2">
            <strong>Affirmation:</strong> {affirmationText}
          </Typography>
          <Typography variant="body2">
            <strong>Birthday:</strong> {birthday.name} ({birthday.dateLabel})
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ maxWidth: 560 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Content controls
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Placeholder — add, edit, remove, schedule, and control display
            content in a later phase. Nothing to configure yet.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
