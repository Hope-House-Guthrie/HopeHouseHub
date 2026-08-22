/**
 * Daily Duties — landing
 *
 * STATUS (branch: daily-duties) — leave 2026-08-18
 * DONE: Ph1–4 desk (Morning Roll Call, Classes, Rooms, Chore Check-Off)
 * DONE: Chore Library + Weekly Assign (S1–5); hide already-assigned from picker
 * DONE: day-of-week matrix (assign toggles + Edit days; Check-Off filters by day)
 * DONE: Morning Roll Call display rename (route/files stay roll-call)
 * DONE: Class Library (catalog Add/Edit/Archive; Attendance active-only picker)
 * LIVE tiles: roll-call · class-attendance · class-library · room-inspections ·
 *   chore-check-off · chore-library · weekly-chore-assign
 * PARKED: disciplinary duties; auto week; History; backend
 * RULES: FE-only; never write Sign In/Out from these workflows
 */

import { Link as RouterLink } from "react-router";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";

export default function DailyDutiesPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h4" component="h1">
        Daily Duties
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Everyday house workflows. Live: Morning Roll Call, Classes, Class
        Library, Room Inspections, Chore Check-Off, Chore Library, Weekly Chore
        Assign.
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Card sx={{ minWidth: 260, flex: "1 1 260px" }}>
          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
          >
            <Typography variant="h6">Morning Roll Call</Typography>
            <Typography variant="body2" color="text.secondary">
              Morning house count. Staff decision can differ from Sign In/Out.
            </Typography>
            <Button
              component={RouterLink}
              to="/daily-duties/roll-call"
              variant="contained"
              sx={{ alignSelf: "flex-start" }}
            >
              Open Morning Roll Call
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 260, flex: "1 1 260px" }}>
          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
          >
            <Typography variant="h6">Mandatory Classes</Typography>
            <Typography variant="body2" color="text.secondary">
              Class attendance. In the building does not prove in class.
            </Typography>
            <Button
              component={RouterLink}
              to="/daily-duties/class-attendance"
              variant="contained"
              sx={{ alignSelf: "flex-start" }}
            >
              Open Class Attendance
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 260, flex: "1 1 260px" }}>
          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
          >
            <Typography variant="h6">Class Library</Typography>
            <Typography variant="body2" color="text.secondary">
              Catalog: add, edit, archive mandatory classes for Attendance.
            </Typography>
            <Button
              component={RouterLink}
              to="/daily-duties/class-library"
              variant="contained"
              sx={{ alignSelf: "flex-start" }}
            >
              Open Class Library
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 260, flex: "1 1 260px" }}>
          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
          >
            <Typography variant="h6">Room Inspections</Typography>
            <Typography variant="body2" color="text.secondary">
              Walk client rooms. Jack &amp; Jill baths; not common bathrooms.
            </Typography>
            <Button
              component={RouterLink}
              to="/daily-duties/room-inspections"
              variant="contained"
              sx={{ alignSelf: "flex-start" }}
            >
              Open Room Inspections
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 260, flex: "1 1 260px" }}>
          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
          >
            <Typography variant="h6">Chore Check-Off</Typography>
            <Typography variant="body2" color="text.secondary">
              Daily check-off from published assignments. Each chore separate.
            </Typography>
            <Button
              component={RouterLink}
              to="/daily-duties/chore-check-off"
              variant="contained"
              sx={{ alignSelf: "flex-start" }}
            >
              Open Chore Check-Off
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 260, flex: "1 1 260px" }}>
          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
          >
            <Typography variant="h6">Chore Library</Typography>
            <Typography variant="body2" color="text.secondary">
              Catalog: add, edit, archive house chores by category.
            </Typography>
            <Button
              component={RouterLink}
              to="/daily-duties/chore-library"
              variant="contained"
              sx={{ alignSelf: "flex-start" }}
            >
              Open Chore Library
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 260, flex: "1 1 260px" }}>
          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
          >
            <Typography variant="h6">Weekly Chore Assign</Typography>
            <Typography variant="body2" color="text.secondary">
              Publish who has which chore. Feeds daily Check-Off.
            </Typography>
            <Button
              component={RouterLink}
              to="/daily-duties/weekly-chore-assign"
              variant="contained"
              sx={{ alignSelf: "flex-start" }}
            >
              Open Weekly Assign
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
