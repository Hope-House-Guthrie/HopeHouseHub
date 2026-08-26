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
 * DONE (S2.2 Add Class):
 * - Dialog fields: Class Name, Start/End time, Repeats On (Sun–Sat multi)
 * - Validate name/times/end>start/≥1 weekday; overlaps allowed
 * - UI id newRecurringClassId(); dispatch addRecurringClass + Chicago dateYmd
 * - Close/reset on success; DEV schedule persist via existing slice path
 *
 * DONE (S2.3 Edit Class UI):
 * - Shared Add/Edit dialog (classFormMode + editingClassId)
 * - Edit on Recurring Classes rows; prefill via formatMinToTimeInput
 * - validateRecurringClassForm; add keeps new id; edit dispatches editRecurringClass (keep id/active)
 *
 * DONE (S2.4 End Class):
 * - Confirm dialog on Recurring rows (separate from Add/Edit)
 * - endRecurringClass → series.active = false; row kept (not Delete)
 * - Immediate: drops off Today + future resolve (not CANCELED chip)
 * - Cancel (Today) = one-day exception only; series stays active
 * - No Reopen / Ended list / end-date fields (later if needed)
 *
 * NEXT: S2.5 one-time event forms (not started)
 *
 * NOT YET:
 * - one-time event forms
 * - Edit this occurrence (override exceptions)
 * - Reopen / Ended Classes archive UI
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
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { RootState } from "@/store";
// Relative: matches slice / Bun-safe house-display feature imports
import {
  formatRecurringDaysLabel,
  formatScheduleTimeRange,
} from "../../../features/house-display/scheduleFormat";
import {
  formatMinToTimeInput,
  newRecurringClassId,
  validateRecurringClassForm,
} from "../../../features/house-display/scheduleForm";
import type {
  HouseDisplayRecurringEvent,
  HouseDisplayWeekday,
} from "../../../features/house-display/scheduleTypes";
import { formatTimeLabel } from "../../../features/house-display/timeline";
import { getHopeHouseNow } from "../../../features/house-display/time";
import {
  addRecurringClass,
  cancelOccurrence,
  editRecurringClass,
  endRecurringClass,
  restoreOccurrence,
} from "../../../store/slices/prototype/houseDisplay";

/**
 * Open the presentation-only TV route in a new tab so Hub stays open.
 * noopener/noreferrer: do not give the TV tab a back-reference to Hub.
 */
function openFullDisplayPreview() {
  window.open("/house-display", "_blank", "noopener,noreferrer");
}

/** Labels for Add Class "Repeats On" - values match HouseDisplayWeekday. */
const ADD_CLASS_WEEKDAY_OPTIONS: {
  value: HouseDisplayWeekday;
  label: string;
}[] = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

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

  // --- Add Class dialog ---
  const [addClassOpen, setAddClassOpen] = useState(false);
  /** "add" = new series; "edit" = existing series (id in editingClassId) */
  const [classFormMode, setClassFormMode] = useState<"add" | "edit">("add");
  /** Set only in edit mode; null in add mode */
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [addTitle, setAddTitle] = useState("");
  const [addStartTime, setAddStartTime] = useState(""); // "HH:mm"
  const [addEndTime, setAddEndTime] = useState("");
  /** Weekday numbers 0=Sun … 6=Sat (empty ≠ every day) */
  const [addDays, setAddDays] = useState<number[]>([]);
  const [addError, setAddError] = useState("");

  const resetAddClassForm = () => {
    setClassFormMode("add");
    setEditingClassId(null);
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

  /** Toggle one weekday in addDays; keep sorted 0-6 for stable UI/save. */
  const toggleAddDay = (day: HouseDisplayWeekday) => {
    setAddDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }
      return [...prev, day].sort((a, b) => a - b);
    });
  };

  const handleCloseAddClass = () => {
    setAddClassOpen(false);
    resetAddClassForm();
  };

  // --- End Class confirm (separate from Add/Edit dialog) ---
  /** Series waiting on End confirm; null when dialog closed */
  const [endingClass, setEndingClass] =
    useState<HouseDisplayRecurringEvent | null>(null);

  const handleOpenEndClass = (series: HouseDisplayRecurringEvent) => {
    setEndingClass(series);
  };

  const handleCloseEndClass = () => {
    setEndingClass(null);
  };

  /** Condirm End Class - active false via reducer; then close dialog. */
  const handleConfirmEndClass = () => {
    if (!endingClass) return;

    dispatch(
      endRecurringClass({
        id: endingClass.id,
        dateYmd: hopeNow.dateKey,
      }),
    );

    handleCloseEndClass();
  };

  /** Prefill shared dialog from an active series (edit path). Does not call reset. */
  const handleOpenEditClass = (series: HouseDisplayRecurringEvent) => {
    setClassFormMode("edit");
    setEditingClassId(series.id);
    setAddTitle(series.title);
    setAddStartTime(formatMinToTimeInput(series.startMin));
    setAddEndTime(formatMinToTimeInput(series.endMin));
    setAddDays([...series.daysOfWeek].sort((a, b) => a - b));
    setAddError("");
    setAddClassOpen(true);
  };

  /**
   * Shared Add/Edit submit.
   * Add: UI generates id + active true. Edit: existing id; reducer keeps active.
   */
  const handleAddClassSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAddError("");

    const validated = validateRecurringClassForm({
      title: addTitle,
      startTime: addStartTime,
      endTime: addEndTime,
      days: addDays,
    });
    if (!validated.ok) {
      setAddError(validated.error);
      return;
    }

    const { title, startMin, endMin, daysOfWeek } = validated;
    const submitDateYmd = hopeNow.dateKey;

    if (classFormMode === "edit") {
      if (!editingClassId) {
        setAddError("Missing class id for edit.");
        return;
      }
      dispatch(
        editRecurringClass({
          id: editingClassId,
          title,
          startMin,
          endMin,
          daysOfWeek,
          dateYmd: submitDateYmd,
        }),
      );
    } else {
      const event: HouseDisplayRecurringEvent = {
        id: newRecurringClassId(),
        title,
        startMin,
        endMin,
        daysOfWeek,
        active: true,
      };
      dispatch(
        addRecurringClass({
          event,
          dateYmd: submitDateYmd,
        }),
      );
    }

    handleCloseAddClass();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography variant="h4" component="h1">
          House Display
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage what the house TV shows. Start with today&apos;s class schedule
          — cancel or restore a single day without changing the weekly class
          list.
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
              <Box component="span" sx={{ mx: 1, opacity: 0.5 }} aria-hidden>
                ·
              </Box>
              Hope House day {dateYmd}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
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
              Add, edit, or end a class when the weekly schedule changes. End
              Class sets the series inactive (record kept) and drops today plus
              future days — not the same as Cancel on Today&apos;s Schedule,
              which only cancels one day.
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
                    <Box
                      sx={{
                        mt: 1,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      <Button
                        type="button"
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenEditClass(series)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="small"
                        variant="outlined"
                        color="warning"
                        onClick={() => handleOpenEndClass(series)}
                      >
                        End Class
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Shared Add / Edit Class dialog */}
      <Dialog
        open={addClassOpen}
        onClose={handleCloseAddClass}
        maxWidth="sm"
        fullWidth
      >
        <Box component="form" onSubmit={handleAddClassSubmit}>
          <DialogTitle>
            {classFormMode === "edit" ? "Edit Class" : "Add Class"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Class Name"
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                required
                fullWidth
                autoFocus
                autoComplete="off"
              />

              <TextField
                label="Start Time"
                type="time"
                value={addStartTime}
                onChange={(e) => setAddStartTime(e.target.value)}
                required
                fullWidth
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { step: 60 },
                }}
              />

              <TextField
                label="End Time"
                type="time"
                value={addEndTime}
                onChange={(e) => setAddEndTime(e.target.value)}
                required
                fullWidth
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { step: 60 },
                }}
              />

              <Box>
                <Typography
                  variant="subtitle2"
                  component="div"
                  sx={{ mb: 0.5, fontWeight: 600 }}
                >
                  Repeats On
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 1 }}
                >
                  Select at least one day. Empty is not every day.
                </Typography>
                <FormGroup row sx={{ gap: 0.5 }}>
                  {ADD_CLASS_WEEKDAY_OPTIONS.map(({ value, label }) => (
                    <FormControlLabel
                      key={value}
                      control={
                        <Checkbox
                          checked={addDays.includes(value)}
                          onChange={() => toggleAddDay(value)}
                          size="small"
                          slotProps={{
                            input: {
                              "aria-label": `Repeats on ${label}`,
                            },
                          }}
                        />
                      }
                      label={label}
                    />
                  ))}
                </FormGroup>
              </Box>

              {addError ? (
                <Typography variant="body2" color="error">
                  {addError}
                </Typography>
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={handleCloseAddClass}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {classFormMode === "edit" ? "Save Changes" : "Add Class"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* End Class confirm — separate from Add/Edit; dispatch in a later step */}
      <Dialog
        open={endingClass !== null}
        onClose={handleCloseEndClass}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>End Class</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 1 }}>
            End{" "}
            <Box component="span" sx={{ fontWeight: 600 }}>
              {endingClass?.title ?? "this class"}
            </Box>
            ?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Ending removes it from today&apos;s schedule and all future days on
            the house display. The class record is kept (not deleted).
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This is different from Cancel on Today&apos;s Schedule, which only
            cancels one day&apos;s occurrence and leaves the weekly class
            active.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={handleCloseEndClass}>
            Cancel
          </Button>
          <Button
            type="button" 
            variant="contained" 
            color="warning"
            onClick={handleConfirmEndClass}
          >
            End Class
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
