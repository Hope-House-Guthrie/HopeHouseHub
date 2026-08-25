/**
 * STATUS — House Display management (Hub chrome)
 * Branch: feature/house-display
 * Route: /prototype/house-display
 *
 * DONE (S1 schedule):
 * - Management shell under MainLayout (staff control surface, not debug dump)
 * - View Full Display → /house-display (new tab)
 * - Today's Schedule from resolved content.agendaItems
 * - Cancel / Restore one occurrence (explicit Chicago dateYmd)
 * - Schedule sources in Redux + DEV localStorage hydrate (hhg-dev-house-display-schedule-v1)
 * - Pure resolveAgendaForDate; confirmed recurring seed; TV contract unchanged
 *
 * DONE (S2.1):
 * - Recurring Classes list (active series only) from schedule.recurring
 * - Display-only sort (startMin, title); no Redux reorder
 * - scheduleFormat weekday + time-range labels
 *
 * NOT YET (S2.2+):
 * - Add / Edit / End Class, one-time event forms
 * - Edit this occurrence (override exceptions)
 * - Spotlight management / flyer upload
 * - UP NEXT derived from agenda (TV known cleanup)
 * - Backend persistence (replaces localStorage)
 * - Live cross-tab sync (refresh Full Display after cancel is OK for S1)
 *
 * PAIR:
 * - TV: pages/prototype/house-display/index.tsx → /house-display
 * - Manage (this file): → /prototype/house-display
 */
import { useMemo, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { RootState } from "@/store";
// Relative: matches slice / Bun-safe house-display feature imports
import {
  formatRecurringDaysLabel,
  formatScheduleTimeRange,
} from "../../../features/house-display/scheduleFormat";
import { formatTimeLabel } from "../../../features/house-display/timeline";
import { getHopeHouseNow } from "../../../features/house-display/time";
import {
  cancelOccurrence,
  restoreOccurrence,
} from "../../../store/slices/prototype/houseDisplay";

/**
 * Open the presentation-only TV route in a new tab so Hub stays open.
 * noopener/noreferrer: do not give the TV tab a back-reference to Hub.
 */
function openFullDisplayPreview() {
  window.open("/house-display", "_blank", "noopener,noreferrer");
}

export default function HouseDisplayManagePage() {
  const dispatch = useDispatch();
  const agendaItems = useSelector(
    (state: RootState) => state.houseDisplay.content.agendaItems,
  );
  const recurring = useSelector(
    (state: RootState) => state.houseDisplay.schedule.recurring,
  );

  // Display-only: active series, sorted for staff scan — never mutate Redux arrays
  const activeRecurringClasses = useMemo(() => {
    return recurring
      .filter((series) => series.active)
      .slice()
      .sort((a, b) => {
        if (a.startMin !== b.startMin) return a.startMin - b.startMin;
        return a.title.localeCompare(b.title);
      });
  }, [recurring]);

  // Hope House calendar day for labels + Cancel/Restore payloads (not browser TZ alone)
  const hopeNow = getHopeHouseNow();
  const dateYmd = hopeNow.dateKey;

  // --- Add Class dialog (shell Step 3; fields/dispatch Step 4) ---
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addStartTime, setAddStartTime] = useState(""); // "HH:mm" later
  const [addEndTime, setAddEndTime] = useState("");
  /** Weekday numbers 0=Sun … 6=Sat (empty until Step 4 toggles) */
  const [addDays, setAddDays] = useState<number[]>([]);
  const [addError, setAddError] = useState("");

  const resetAddClassForm = () => {
    setAddTitle("");
    setAddStartTime("");
    setAddEndTime("");
    setAddDays([]);
    setAddError("");
  };

  const handleOpenAddClass = () => {
    resetAddClassForm();
    setAddClassOpen(true);
  };

  const handleCloseAddClass = () => {
    setAddClassOpen(false);
    resetAddClassForm();
  };

  /** Step 3: Enter / Add must not dispatch. Step 4 fills validation + dispatch. */
  const handleAddClassSubmit = (e: FormEvent) => {
    e.preventDefault();
    // no-op until Step 4
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography variant="h4" component="h1">
          House Display
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage what the house TV shows. Start with today&apos;s class
          schedule — cancel or restore a single day without changing the
          weekly class list.
        </Typography>
      </Box>

      {/* TV preview */}
      <Card sx={{ maxWidth: 720 }}>
        <CardContent
          sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
        >
          <Typography variant="h6">Full Display</Typography>
          <Typography variant="body2" color="text.secondary">
            Opens the TV screen in a new tab (no Hub header or drawer).
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
          <Typography variant="caption" color="text.secondary">
            Prototype note: after Cancel or Restore, refresh the Full Display
            tab to see the update. Schedule changes are saved in this browser
            for the mock; a future backend will replace that.
          </Typography>
        </CardContent>
      </Card>

      {/* Today's Schedule — primary ops control */}
      <Card sx={{ maxWidth: 720 }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="h6">Today&apos;s Schedule</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {hopeNow.dateText}
              <Box
                component="span"
                sx={{ mx: 1, opacity: 0.5 }}
                aria-hidden
              >
                ·
              </Box>
              Hope House day {dateYmd}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Cancel applies to this day only. The weekly class definition stays
              active for future days. Restore removes today&apos;s cancellation.
            </Typography>
          </Box>

          <Divider />

          {agendaItems.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No classes scheduled for today.
            </Typography>
          ) : (
            <Stack divider={<Divider flexItem />} spacing={0}>
              {agendaItems.map((item) => {
                const timeRange = `${formatTimeLabel(item.startMin)} – ${formatTimeLabel(item.endMin)}`;
                return (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1.5,
                      py: 1.5,
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: "1 1 220px" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        {timeRange}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: 1,
                          mt: 0.25,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            textDecoration: item.canceled
                              ? "line-through"
                              : "none",
                            opacity: item.canceled ? 0.85 : 1,
                          }}
                        >
                          {item.title}
                        </Typography>
                        {item.canceled ? (
                          <Chip
                            size="small"
                            label="CANCELED"
                            color="error"
                            variant="outlined"
                          />
                        ) : null}
                      </Box>
                    </Box>

                    {item.canceled ? (
                      <Button
                        type="button"
                        variant="outlined"
                        color="primary"
                        onClick={() =>
                          dispatch(
                            restoreOccurrence({
                              occurrenceId: item.id,
                              dateYmd,
                            }),
                          )
                        }
                      >
                        Restore
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outlined"
                        color="warning"
                        onClick={() =>
                          dispatch(
                            cancelOccurrence({
                              occurrenceId: item.id,
                              dateYmd,
                            }),
                          )
                        }
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Recurring Classes — series definitions (not today's occurrences) */}
      <Card sx={{ maxWidth: 720 }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="h6">Recurring Classes</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Weekly class list the house runs on matching days. This is the
              series definition — not today&apos;s cancel/restore list.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Add a class here when the weekly schedule changes. Edit and End
              Class come later. Ending stops future days without deleting the
              record.
            </Typography>
            <Box sx={{ mt: 1.5 }}>
              <Button
                type="button"
                variant="contained"
                onClick={handleOpenAddClass}
              >
                Add Class
              </Button>
            </Box>
          </Box>

          <Divider />

          {activeRecurringClasses.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No active recurring classes.
            </Typography>
          ) : (
            <Stack divider={<Divider flexItem />} spacing={0}>
              {activeRecurringClasses.map((series) => {
                const daysLabel = formatRecurringDaysLabel(series.daysOfWeek);
                const timeRange = formatScheduleTimeRange(
                  series.startMin,
                  series.endMin,
                );
                return (
                  <Box
                    key={series.id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.25,
                      py: 1.5,
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {series.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {daysLabel}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      {timeRange}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Add Class dialog — shell only (fields + dispatch in Step 4) */}
      <Dialog
        open={addClassOpen}
        onClose={handleCloseAddClass}
        maxWidth="sm"
        fullWidth
      >
        <Box component="form" onSubmit={handleAddClassSubmit}>
          <DialogTitle>Add Class</DialogTitle>
          <DialogContent>
            {/* Step 4: Class Name, Start/End time, Repeats On */}
            {addError ? (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {addError}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Class details go here next.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={handleCloseAddClass}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Add Class
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
