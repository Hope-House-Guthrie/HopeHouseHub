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
 * DONE (S2.1: Recurring Classes list):
 * - Display-only sort (startMin, title); no Redux reorder
 * - scheduleFormat weekday + time-range labels
 *
 * DONE (S2.2 Add Class):
 * - Dialog fields: Class Name, Start/End time, Repeats On (Sun–Sat multi)
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
 * - Cancel (Today) = one-day exception only; series stays active
 *
 * DONE (S2.5 Reinstate Class):
 * - Ended Classes section lists inactive series (not in Recurring Classes)
 * - Reinstate button per ended row → confirm dialog
 * - reinstateRecurringClass → series.active = true (exact inverse of End)
 * - No duplicate created; same id/row; exceptions preserved
 *
 * DONE (S2.5 partial):
 * - addOneTimeEvent / editOneTimeEvent (force active true + canceled false on add; edit keeps id/active/canceled)
 *
 * DONE (Stage C):
 * - sourceType field on agenda items (recurring | oneTime)
 *
 * DONE (Stage B):
 * - exception kind "suppress" (Replace/Hide this date ≠ cancel)
 * - suppressRecurringOccurrence / unsuppressRecurringOccurrence
 *
 * NEXT: Stage D Conflict UI for Add/Edit Class
 *
 * NOT YET:
 * - manage One-Time UI / conflict UI (Stage C)
 * - override exception UI, delete definition, ended-list conflict UI
 * - Backend API / thunks
 * - Midnight re-resolve without refresh
 *
 * PAIR:
 * - TV: pages/prototype/house-display/index.tsx → /house-display
 * - Manage (this file): → /prototype/house-display
 */
import { useMemo, useRef, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  capitalize,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
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
  newOneTimeEventId,
  validateRecurringClassForm,
  validateOneTimeEventForm,
} from "../../../features/house-display/scheduleForm";
import type {
  HouseDisplayOneTimeEvent,
  HouseDisplayRecurringEvent,
  HouseDisplayWeekday,
  HouseDisplayScheduleSources,
} from "../../../features/house-display/scheduleTypes";
import type { HouseDisplayAgendaSourceType } from "../../../features/house-display/types";
import { formatTimeLabel } from "../../../features/house-display/timeline";
import { getHopeHouseNow } from "../../../features/house-display/time";
import {
  addOneTimeEvent,
  addRecurringClass,
  cancelOccurrence,
  editOneTimeEvent,
  editRecurringClass,
  endRecurringClass,
  reinstateRecurringClass,
  restoreOccurrence,
  suppressRecurringOccurrence,
  unsuppressRecurringOccurrence,
} from "../../../store/slices/prototype/houseDisplay";
import {
  type ScheduleConflict,
  findScheduleConflicts,
  type ScheduleConflictCandidate,
  type OneTimeConflictCandidate,
} from "../../../features/house-display/scheduleConflicts";
import type { HouseDisplayOccurrenceException } from "../../../features/house-display/scheduleTypes";

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
  const oneTime = useSelector(
    (state: RootState) => state.houseDisplay.schedule.oneTime,
  );
  const exceptions = useSelector(
    (state: RootState) => state.houseDisplay.schedule.exceptions,
  );
  const scheduleSources = useSelector(
    (state: RootState) => state.houseDisplay.schedule,
  );

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
  const [addLocation, setAddLocation] = useState<string>("Living Room");
  const [addFacilitator, setAddFacilitator] = useState<string>("");

  // Track if end time was manually set (to avoid overwriting on start change)
  const addClassEndTimeManuallySet = useRef(false);
  const addOneTimeEndTimeManuallySet = useRef(false);

  // --- One-Time Event dialog state ---
  const [oneTimeFormMode, setOneTimeFormMode] = useState<"add" | "edit">("add");
  const [editingOneTimeId, setEditingOneTimeId] = useState<string | null>(null);
  const [addOneTimeOpen, setAddOneTimeOpen] = useState(false);
  const [addOneTimeTitle, setAddOneTimeTitle] = useState("");
  const [addOneTimeDate, setAddOneTimeDate] = useState<string>(""); // YYYY-MM-DD
  const [addOneTimeStartTime, setAddOneTimeStartTime] = useState("");
  const [addOneTimeEndTime, setAddOneTimeEndTime] = useState("");
  const [addOneTimeLocation, setAddOneTimeLocation] =
    useState<string>("Living Room");
  const [addOneTimeFacilitator, setAddOneTimeFacilitator] =
    useState<string>("");
  const [addOneTimeError, setAddOneTimeError] = useState("");

  // --- Conflict Dialog state ---
  const [pendingClassData, setPendingClassData] = useState<
    | {
        event: HouseDisplayRecurringEvent;
        candidate: ScheduleConflictCandidate;
      }
    | {
        event: {
          title: string;
          dateYmd: string;
          startMin: number;
          endMin: number;
          location?: string;
          facilitator?: string;
        };
        candidate: ScheduleConflictCandidate;
      }
    | null
  >(null);
  const [pendingConflicts, setPendingConflicts] = useState<ScheduleConflict[]>(
    [],
  );
  const [endingExistingClasses, setEndingExistingClasses] = useState<
    HouseDisplayRecurringEvent[]
  >([]);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  /** Shared conflict reconciliation: how to save the pending class. */
  const [pendingSaveKind, setPendingSaveKind] = useState<
    "add" | "edit" | "reinstate" | "oneTimeAdd" | "oneTimeEdit"
  >("add");

  const resetAddClassForm = () => {
    setClassFormMode("add");
    setEditingClassId(null);
    setAddTitle("");
    setAddStartTime("");
    setAddEndTime("");
    setAddDays([]);
    setAddError("");
    setAddLocation("Living Room");
    setAddFacilitator("");
    addClassEndTimeManuallySet.current = false;
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

  // --- One-Time Event handlers ---
  const resetAddOneTimeForm = () => {
    setOneTimeFormMode("add");
    setEditingOneTimeId(null);
    setAddOneTimeTitle("");
    setAddOneTimeDate(hopeNow.dateKey);
    setAddOneTimeStartTime("");
    setAddOneTimeEndTime("");
    setAddOneTimeLocation("Living Room");
    setAddOneTimeFacilitator("");
    setAddOneTimeError("");
    addOneTimeEndTimeManuallySet.current = false;
  };

  const handleOpenAddOneTimeEvent = () => {
    resetAddOneTimeForm();
    setAddOneTimeOpen(true);
  };

  const handleOpenEditOneTimeEvent = (event: HouseDisplayOneTimeEvent) => {
    setOneTimeFormMode("edit");
    setEditingOneTimeId(event.id);
    setAddOneTimeTitle(event.title);
    setAddOneTimeDate(event.dateYmd);
    setAddOneTimeStartTime(formatMinToTimeInput(event.startMin));
    setAddOneTimeEndTime(formatMinToTimeInput(event.endMin));
    setAddOneTimeLocation(event.location ?? "Living Room");
    setAddOneTimeFacilitator(event.facilitator ?? "");
    setAddOneTimeError("");
    // Mark end time as manually set for edit mode
    addOneTimeEndTimeManuallySet.current = true;
    setAddOneTimeOpen(true);
  };

  // --- Helpers for managing suppressions ---
  /** Find all suppress exceptions for a given one-time event ID */
  const findSuppressionsForOneTime = (oneTimeEventId: string) => {
    return exceptions.filter(
      (e) => e.kind === "suppress" && e.sourceOneTimeEventId === oneTimeEventId,
    );
  };

  /** Clear all suppressions associated with a one-time event */
  const clearSuppressionsForOneTime = (oneTimeEventId: string) => {
    const toRemove = findSuppressionsForOneTime(oneTimeEventId);
    for (const ex of toRemove) {
      dispatch(
        unsuppressRecurringOccurrence({
          seriesId: ex.seriesId,
          dateYmd: ex.dateYmd,
          sourceOneTimeEventId: oneTimeEventId,
        }),
      );
    }
  };

  // Helper: add 1 hour to time string (24-hour rollover)
  const addOneHourToTime = (time: string): string => {
    if (!time) return time;
    const [hoursStr, minutesStr] = time.split(":");
    if (!hoursStr || !minutesStr) return time;
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    if (isNaN(hours) || isNaN(minutes)) return time;
    // Allow rollover past midnight (e.g., 23:30 -> 00:30)
    const newHours = hours >= 24 ? hours - 24 : hours + 1;
    return `${newHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  // Capitalize title: title case, preserving acronyms (SCSU, NA, etc.) and proper names (McGalliard)
  const capitalizeTitle = (text: string): string => {
    if (!text) return text;
    // Split on spaces, capitalize first letter of each word, lowercase rest
    return text
      .split(/(\s+)/)
      .map((part) => {
        if (part.trim().length === 0) return part;
        const firstChar = part.charAt(0);
        const capitalizedFirst = /[a-zA-Z]/.test(firstChar)
          ? firstChar.toUpperCase()
          : firstChar;
        return capitalizedFirst + part.slice(1);
      })
      .join("");
  };

  const handleCloseAddOneTimeEvent = () => {
    setAddOneTimeOpen(false);
    resetAddOneTimeForm();
  };

  const handleAddOneTimeEventSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAddOneTimeError("");

    const validated = validateOneTimeEventForm({
      title: addOneTimeTitle,
      dateYmd: addOneTimeDate,
      startTime: addOneTimeStartTime,
      endTime: addOneTimeEndTime,
    });

    if (!validated.ok) {
      setAddOneTimeError(validated.error);
      return;
    }

    const { title, dateYmd, startMin, endMin } = validated;

    // Stage E: detect conflicts before dispatching.
    const oneTimeCandidate: OneTimeConflictCandidate = {
      type: "oneTime",
      dateYmd,
      startMin,
      endMin,
      excludeId:
        oneTimeFormMode === "edit" && editingOneTimeId
          ? editingOneTimeId
          : undefined,
    };

    const otConflicts = findScheduleConflicts({
      sources: scheduleSources,
      candidate: oneTimeCandidate,
    });

    if (otConflicts.length > 0) {
      setPendingClassData({
        event: {
          title: capitalizeTitle(title),
          dateYmd,
          startMin,
          endMin,
          location: addOneTimeLocation || undefined,
          facilitator: addOneTimeFacilitator
            ? capitalizeTitle(addOneTimeFacilitator)
            : undefined,
        },
        candidate: oneTimeCandidate,
      });
      setPendingConflicts(otConflicts);
      setEndingExistingClasses([]);
      setPendingSaveKind(
        oneTimeFormMode == "edit" ? "oneTimeEdit" : "oneTimeAdd",
      );
      setConflictDialogOpen(true);
      return;
    }

    if (oneTimeFormMode === "edit" && editingOneTimeId) {
      // EDIT MODE: update existing event.
      // This confirmed save replaces nothing (no conflicts on the new date),
      // so release any prior suppressions owned by this one-time event and let
      // those recurring occurrences return. Confirmed save only — not on cancel.
      clearSuppressionsForOneTime(editingOneTimeId);
      dispatch(
        editOneTimeEvent({
          id: editingOneTimeId,
          title: capitalizeTitle(title),
          eventDateYmd: dateYmd,
          startMin,
          endMin,
          resolveDateYmd: hopeNow.dateKey,
          location: addOneTimeLocation || undefined,
          facilitator: addOneTimeFacilitator
            ? capitalizeTitle(addOneTimeFacilitator)
            : "",
        }),
      );
    } else {
      // ADD MODE: create new event
      dispatch(
        addOneTimeEvent({
          event: {
            id: newOneTimeEventId(),
            title: capitalizeTitle(title),
            dateYmd,
            startMin,
            endMin,
            location: addOneTimeLocation || undefined,
            facilitator: addOneTimeFacilitator
              ? capitalizeTitle(addOneTimeFacilitator)
              : undefined,
            active: true,
            canceled: false,
          },
          dateYmd: hopeNow.dateKey,
        }),
      );
    }

    handleCloseAddOneTimeEvent();
  };

  // --- Cancel/Restore for one-time events ---
  const handleCancelOneTimeOccurrence = (eventId: string) => {
    const event = oneTime.find((o) => o.id === eventId);
    if (event) {
      dispatch(
        cancelOccurrence({
          occurrenceId: eventId,
          dateYmd: event.dateYmd,
        }),
      );
    }
  };

  const handleRestoreOneTimeOccurrence = (eventId: string) => {
    const event = oneTime.find((o) => o.id === eventId);
    if (event?.canceled) {
      dispatch(
        restoreOccurrence({
          occurrenceId: eventId,
          dateYmd: event.dateYmd,
        }),
      );
    }
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

  /** Confirm End Class - active false via reducer; then close dialog. */
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

  // --- Reinstate Class confirm (exact inverse of End) ---
  /** Series waiting on Reinstate confirm; null when dialog closed */
  const [reinstatingClass, setReinstatingClass] =
    useState<HouseDisplayRecurringEvent | null>(null);

  const handleOpenReinstate = (series: HouseDisplayRecurringEvent) => {
    setReinstatingClass(series);
  };

  const handleCloseReinstate = () => {
    setReinstatingClass(null);
  };

  /**
   * Confirm Reinstate.
   * Runs the shared conflict check BEFORE changing state. If the class's
   * existing schedule conflicts with other active classes, the existing
   * conflict dialog opens (Keep Both / End Selected). Otherwise reinstate
   * immediately. Reuses the Stage D conflict architecture — no new system.
   */
  const handleConfirmReinstate = () => {
    if (!reinstatingClass) return;
    const series = reinstatingClass;

    const candidate: ScheduleConflictCandidate = {
      type: "recurring",
      startMin: series.startMin,
      endMin: series.endMin,
      daysOfWeek: series.daysOfWeek,
      dateYmd: hopeNow.dateKey,
    };

    const conflicts = findScheduleConflicts({
      sources: scheduleSources,
      candidate,
    });
    // Filter to recurring only (one-time conflicts handled in Stage E).
    const recurringConflicts = conflicts.filter((c) => c.kind === "recurring");

    // Close the confirm dialog either way once Reinstate is confirmed.
    handleCloseReinstate();

    if (recurringConflicts.length === 0) {
      dispatch(
        reinstateRecurringClass({
          id: series.id,
          dateYmd: hopeNow.dateKey,
        }),
      );
      return;
    }

    // Conflicts → reuse the shared conflict dialog with the pending class.
    setPendingSaveKind("reinstate");
    setPendingClassData({
      event: { ...series, active: true },
      candidate,
    });
    setPendingConflicts(recurringConflicts);
    setEndingExistingClasses([]);
    setConflictDialogOpen(true);
  };

  /** Prefill shared dialog from an active series (edit path). Does not call reset. */
  const handleOpenEditClass = (series: HouseDisplayRecurringEvent) => {
    setClassFormMode("edit");
    setEditingClassId(series.id);
    setAddTitle(series.title);
    setAddStartTime(formatMinToTimeInput(series.startMin));
    setAddEndTime(formatMinToTimeInput(series.endMin));
    setAddDays([...series.daysOfWeek].sort((a, b) => a - b));
    setAddLocation(series.location ?? "Living Room");
    setAddFacilitator(series.facilitator ?? "");
    setAddError("");
    addClassEndTimeManuallySet.current = false;
    setAddClassOpen(true);
  };

  /** Select which recurring conflicts to End. */
  const handleSelectConflictToKill = (seriesId: string) => {
    setEndingExistingClasses((prev) => {
      if (prev.some((e) => e.id === seriesId)) {
        return prev.filter((e) => e.id !== seriesId);
      }
      const existing = scheduleSources.recurring.find((r) => r.id === seriesId);
      if (!existing) return prev;
      return [...prev, existing];
    });
  };

  /** Save both the pending class and selected ends, then close dialog. */
  const handleSaveWithSelectedEnds = () => {
    if (!pendingClassData) return;
    const { event } = pendingClassData;
    const isEdit = pendingSaveKind === "edit";
    const sourceOneTimeEventId =
      pendingSaveKind === "oneTimeAdd"
        ? newOneTimeEventId()
        : pendingSaveKind === "oneTimeEdit"
          ? editingOneTimeId!
          : undefined;

    // Resolve selected recurring conflicts.
    if (pendingSaveKind === "oneTimeAdd" || pendingSaveKind === "oneTimeEdit") {
      if (pendingSaveKind === "oneTimeEdit") {
        // Replace Selected (edit): reconcile source-owned suppressions.
        // Remove prior suppressions owned by this one-time event that are no
        // longer part of the newly-selected set on this date, then (below) add
        // the newly-selected occurrences. No endRecurringClass is used.
        const newDateYmd = (event as any).dateYmd;
        const selectedIds = new Set(
          endingExistingClasses.map((e) => e.id),
        );
        for (const ex of findSuppressionsForOneTime(sourceOneTimeEventId!)) {
          if (!(selectedIds.has(ex.seriesId) && ex.dateYmd === newDateYmd)) {
            dispatch(
              unsuppressRecurringOccurrence({
                seriesId: ex.seriesId,
                dateYmd: ex.dateYmd,
                sourceOneTimeEventId,
              }),
            );
          }
        }
      }
      for (const ec of endingExistingClasses) {
        dispatch(
          suppressRecurringOccurrence({
            seriesId: ec.id,
            dateYmd: (event as any).dateYmd,
            sourceOneTimeEventId,
          }),
        );
      }
    } else {
      for (const ec of endingExistingClasses) {
        dispatch(
          endRecurringClass({
            id: ec.id,
            dateYmd: hopeNow.dateKey,
          }),
        );
      }
    }

    // Then save the pending class / reinstate it
    if (pendingSaveKind === "reinstate") {
      const ev = event as HouseDisplayRecurringEvent;
      dispatch(
        reinstateRecurringClass({
          id: ev.id,
          dateYmd: hopeNow.dateKey,
        }),
      );
    } else if (pendingSaveKind === "edit") {
      const ev = event as HouseDisplayRecurringEvent;
      dispatch(
        editRecurringClass({
          id: ev.id,
          title: ev.title,
          startMin: ev.startMin,
          endMin: ev.endMin,
          daysOfWeek: ev.daysOfWeek,
          dateYmd: hopeNow.dateKey,
          location: ev.location,
          facilitator: ev.facilitator,
        }),
      );
    } else if (pendingSaveKind === "oneTimeAdd") {
      dispatch(
        addOneTimeEvent({
          event: {
            ...(event as any),
            id: sourceOneTimeEventId!,
            active: true,
            canceled: false,
          },
          dateYmd: hopeNow.dateKey,
        }),
      );
    } else if (pendingSaveKind === "oneTimeEdit") {
      dispatch(
        editOneTimeEvent({
          id: sourceOneTimeEventId!,
          title: (event as any).title,
          eventDateYmd: (event as any).dateYmd,
          startMin: (event as any).startMin,
          endMin: (event as any).endMin,
          resolveDateYmd: hopeNow.dateKey,
          location: event.location,
          facilitator: (event as any).facilitator ?? "",
        }),
      );
    } else if (pendingSaveKind === "add") {
      dispatch(
        addRecurringClass({
          event: event as HouseDisplayRecurringEvent,
          dateYmd: hopeNow.dateKey,
        }),
      );
    }

    const originalSaveKind = pendingSaveKind;
    setPendingClassData(null);
    setPendingConflicts([]);
    setEndingExistingClasses([]);
    setPendingSaveKind("add");
    setConflictDialogOpen(false);
    if (originalSaveKind === "oneTimeAdd" || originalSaveKind === "oneTimeEdit") {
      handleCloseAddOneTimeEvent();
    } else if (originalSaveKind !== "reinstate") {
      handleCloseAddClass();
    }
  };

  /** Cancel conflict resolution → close dialog, return to form. */
  const handleCancelConflictDialog = () => {
    const originalSaveKind = pendingSaveKind;
    setPendingClassData(null);
    setPendingConflicts([]);
    setEndingExistingClasses([]);
    setPendingSaveKind("add");
    setConflictDialogOpen(false);
    // Keep form open with values intact (reinstate: class stays ended)
  };

  /** Keep Both (save anyway) → close dialog, save. */
  const handleKeepBoth = () => {
    if (!pendingClassData) return;
    const { event } = pendingClassData;

    if (pendingSaveKind === "reinstate") {
      const ev = event as HouseDisplayRecurringEvent;
      dispatch(
        reinstateRecurringClass({
          id: ev.id,
          dateYmd: hopeNow.dateKey,
        }),
      );
    } else if (pendingSaveKind === "oneTimeAdd") {
      const ot = event as {
        title: string;
        dateYmd: string;
        startMin: number;
        endMin: number;
        location?: string;
        facilitator?: string;
      };
      dispatch(
        addOneTimeEvent({
          event: {
            id: newOneTimeEventId(),
            title: ot.title,
            dateYmd: ot.dateYmd,
            startMin: ot.startMin,
            endMin: ot.endMin,
            location: ot.location,
            facilitator: ot.facilitator,
            active: true,
            canceled: false,
          },
          dateYmd: hopeNow.dateKey,
        }),
      );
    } else if (pendingSaveKind === "oneTimeEdit") {
      // Keep Both: this confirmed save replaces nothing for this one-time
      // event, so release prior source-owned suppressions and let those
      // recurring occurrences return. No new suppressions are added here.
      clearSuppressionsForOneTime(editingOneTimeId!);
      const ot = event as {
        title: string;
        dateYmd: string;
        startMin: number;
        endMin: number;
        location?: string;
        facilitator?: string;
      };
      dispatch(
        editOneTimeEvent({
          id: editingOneTimeId!,
          title: ot.title,
          eventDateYmd: ot.dateYmd,
          startMin: ot.startMin,
          endMin: ot.endMin,
          resolveDateYmd: hopeNow.dateKey,
          location: ot.location,
          facilitator: ot.facilitator ?? "",
        }),
      );
    } else {
      dispatch(
        addRecurringClass({
          event: event as HouseDisplayRecurringEvent,
          dateYmd: hopeNow.dateKey,
        }),
      );
    }

    const originalSaveKind = pendingSaveKind;
    setPendingClassData(null);
    setPendingConflicts([]);
    setEndingExistingClasses([]);
    setPendingSaveKind("add");
    setConflictDialogOpen(false);
    if (pendingSaveKind !== "reinstate") {
      handleCloseAddClass();
    }
  };

  /**
   * Shared Add/Edit submit.
   * Add: UI generates id + active true. Edit: existing id; reducer keeps active.
   * Stage D: detect conflicts before dispatch.
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

    // Build pending event with proper id for add vs edit
    const isEdit = editingClassId !== null;
    const event: HouseDisplayRecurringEvent = {
      id: isEdit ? editingClassId! : newRecurringClassId(),
      title: capitalizeTitle(title),
      startMin,
      endMin,
      daysOfWeek,
      active: true,
      location: addLocation,
      facilitator: capitalizeTitle(addFacilitator),
    };

    // Build candidate for conflict detection
    const candidate: ScheduleConflictCandidate = {
      type: "recurring",
      startMin,
      endMin,
      daysOfWeek,
      dateYmd: hopeNow.dateKey,
      excludeId: isEdit ? editingClassId : undefined,
    };

    // Check for conflicts
    const conflicts = findScheduleConflicts({
      sources: scheduleSources,
      candidate,
    });

    // Filter to recurring only (one-time conflicts handled in Stage E)
    const recurringConflicts = conflicts.filter((c) => c.kind === "recurring");

    if (recurringConflicts.length === 0) {
      // No conflicts → save directly
      if (isEdit) {
        dispatch(
          editRecurringClass({
            id: event.id,
            title: event.title,
            startMin: event.startMin,
            endMin: event.endMin,
            daysOfWeek: event.daysOfWeek,
            dateYmd: submitDateYmd,
            location: addLocation,
            facilitator: addFacilitator ? capitalizeTitle(addFacilitator) : "",
          }),
        );
      } else {
        dispatch(addRecurringClass({ event, dateYmd: submitDateYmd }));
      }
      handleCloseAddClass();
      return;
    }

    // Open conflict dialog
    setPendingSaveKind(isEdit ? "edit" : "add");
    setPendingClassData({ event, candidate });
    setPendingConflicts(recurringConflicts);
    setEndingExistingClasses([]);
    setConflictDialogOpen(true);
  };

  // Display-only: active recurring classes, sorted for staff scan — never mutate Redux arrays
  const activeRecurringClasses = useMemo(() => {
    return recurring
      .filter((series) => series.active)
      .slice()
      .sort((a, b) => {
        if (a.startMin !== b.startMin) return a.startMin - b.startMin;
        return a.title.localeCompare(b.title);
      });
  }, [recurring]);

  // Display-only: ended (inactive) recurring classes, sorted for staff scan
  const endedRecurringClasses = useMemo(() => {
    return recurring
      .filter((series) => !series.active)
      .slice()
      .sort((a, b) => {
        if (a.startMin !== b.startMin) return a.startMin - b.startMin;
        return a.title.localeCompare(b.title);
      });
  }, [recurring]);

  // Display-only: active one-time events, sorted for staff scan
  const activeOneTimeEvents = useMemo(() => {
    return oneTime
      .filter((event) => event.active)
      .slice()
      .sort((a, b) => {
        if (a.dateYmd !== b.dateYmd) return a.dateYmd.localeCompare(b.dateYmd);
        if (a.startMin !== b.startMin) return a.startMin - b.startMin;
        return a.title.localeCompare(b.title);
      });
  }, [oneTime]);

  // Hope House calendar day for labels + Cancel/Restore payloads (not browser TZ alone)
  const hopeNow = getHopeHouseNow();
  const dateYmd = hopeNow.dateKey;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography variant="h4" component="h1">
          House Display
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage what the house TV shows. Start with today&apos;s class schedule
          — cancel or restore a single occurrence. Add/Edit handles next.
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
            Prototype note: content changes save in this browser for the mock; a
            future backend will replace that.
          </Typography>
        </CardContent>
      </Card>

      {/* Today&apos;s Schedule */}
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
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
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
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Recurring Classes */}
      <Card sx={{ maxWidth: 720 }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="h6">Recurring Classes</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Weekly schedule; active (blue) generate today&apos;s TV agenda.
              End Class hides future occurrences; Cancel removes today only.
            </Typography>
          </Box>

          <Divider />

          {activeRecurringClasses.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No active classes.
            </Typography>
          ) : (
            <Stack divider={<Divider flexItem />} spacing={0}>
              {activeRecurringClasses.map((series) => {
                const timeRange = formatScheduleTimeRange(
                  series.startMin,
                  series.endMin,
                );
                return (
                  <Box
                    key={series.id}
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
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          {timeRange}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {series.title}
                        </Typography>
                        <Chip
                          size="small"
                          label={formatRecurringDaysLabel(series.daysOfWeek)}
                          variant="outlined"
                        />
                        {series.location ? (
                          <Chip
                            size="small"
                            label={series.location}
                            variant="outlined"
                            color="info"
                          />
                        ) : null}
                        {series.facilitator ? (
                          <Chip
                            size="small"
                            label={`Facilitator: ${series.facilitator}`}
                            variant="outlined"
                          />
                        ) : null}
                        <Button
                          type="button"
                          size="small"
                          variant="text"
                          onClick={() => handleOpenEditClass(series)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="small"
                          variant="text"
                          color="error"
                          onClick={() => handleOpenEndClass(series)}
                        >
                          End
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}

          <Button
            type="button"
            variant="contained"
            onClick={handleOpenAddClass}
          >
            Add Class
          </Button>

      {/* Add/Edit Class dialog */}
      <Dialog open={addClassOpen} onClose={handleCloseAddClass}>
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
                slotProps={{ input: { "aria-label": "Class name" } }}
              />
              <TextField
                label="Start Time"
                type="time"
                value={addStartTime}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setAddStartTime(newStart);
                  // Auto-default End Time to 1 hour after Start, if not manually set
                  if (!addClassEndTimeManuallySet.current && newStart) {
                    setAddEndTime(addOneHourToTime(newStart));
                  }
                }}
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
                onChange={(e) => {
                  setAddEndTime(e.target.value ?? "");
                  addClassEndTimeManuallySet.current = true;
                }}
                required
                fullWidth
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { step: 60 },
                }}
              />
              <FormGroup>
                <Typography variant="subtitle2">Repeats On</Typography>
                {ADD_CLASS_WEEKDAY_OPTIONS.map((opt) => (
                  <FormControlLabel
                    key={opt.value}
                    control={
                      <Checkbox
                        checked={addDays.includes(opt.value)}
                        onChange={() => toggleAddDay(opt.value)}
                        slotProps={{
                          input: { "aria-label": opt.label },
                        }}
                      />
                    }
                    label={opt.label}
                  />
                ))}
              </FormGroup>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={addLocation}
                  label="Location"
                  onChange={(e) => setAddLocation(e.target.value as string)}
                >
                  <MenuItem value="">No specific location</MenuItem>
                  <MenuItem value="Living Room">Living Room</MenuItem>
                  <MenuItem value="Large Dining Room">
                    Large Dining Room
                  </MenuItem>
                  <MenuItem value="Back House">Back House</MenuItem>
                  <MenuItem value="Computer Lab">Computer Lab</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Facilitator"
                value={addFacilitator}
                onChange={(e) => setAddFacilitator(e.target.value)}
                fullWidth
                slotProps={{ input: { "aria-label": "Facilitator name" } }}
              />
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
              {classFormMode === "edit" ? "Save" : "Add"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

          {/* Conflict Dialog */}
          <Dialog
            open={conflictDialogOpen}
            onClose={handleCancelConflictDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {pendingSaveKind === "oneTimeAdd" ||
              pendingSaveKind === "oneTimeEdit"
                ? "One-Time Event Conflict"
                : "Schedule Conflict"}
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {pendingSaveKind === "reinstate"
                  ? "Reinstating this class conflicts with existing classes:"
                  : pendingSaveKind === "oneTimeAdd" ||
                    pendingSaveKind === "oneTimeEdit"
                    ? "This one-time event conflicts with recurring classes on its date. Keep Both keeps everything; Save & Replace Selected hides only the selected recurring occurrence(s) for that day."
                    : "The class you are adding/editing conflicts with existing classes:"}
              </Typography>
              <Stack divider={<Divider flexItem />} spacing={1}>
                {pendingConflicts.map((conflict) => {
                  if (conflict.kind !== "recurring") return null;
                  const isChecked = endingExistingClasses.some(
                    (e) => e.id === conflict.seriesId,
                  );
                  const recurring = conflict as any;
                  return (
                    <Box
                      key={conflict.seriesId}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Checkbox
                        checked={isChecked}
                        onChange={() =>
                          handleSelectConflictToKill(conflict.seriesId)
                        }
                        aria-label={
                          pendingSaveKind === "oneTimeAdd" ||
                          pendingSaveKind === "oneTimeEdit"
                            ? `Replace ${conflict.title}`
                            : `End ${conflict.title}`
                        }
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {conflict.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {conflict.startMin}–{conflict.endMin} on{" "}
                          {recurring.weekdays
                            .map((d: number) => formatRecurringDaysLabel([d]))
                            .join(", ")}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelConflictDialog}>Cancel</Button>
              <Button onClick={handleKeepBoth}>Keep Both</Button>
              <Button
                variant="contained"
                disabled={
                  pendingSaveKind === "oneTimeAdd" ||
                  pendingSaveKind === "oneTimeEdit"
                    ? endingExistingClasses.length === 0
                    : false
                }
                onClick={handleSaveWithSelectedEnds}
              >
                {pendingSaveKind === "reinstate"
                  ? "Reinstate (End Selected Conflicts)"
                  : pendingSaveKind === "oneTimeAdd" ||
                      pendingSaveKind === "oneTimeEdit"
                    ? "Save & Replace Selected"
                    : "Save (End Selected Conflicts)"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* End Class confirm */}
          <Dialog open={endingClass !== null} onClose={handleCloseEndClass}>
            <DialogTitle>End Class</DialogTitle>
            <DialogContent>
              <Typography>
                End {endingClass?.title}? It will not appear on future TV dates,
                but the class definition is preserved.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEndClass}>Cancel</Button>
              <Button color="error" onClick={handleConfirmEndClass}>
                End Class
              </Button>
            </DialogActions>
          </Dialog>
          {/* Reinstate Class confirm */}
          <Dialog
            open={reinstatingClass !== null}
            onClose={handleCloseReinstate}
          >
            <DialogTitle>Reinstate Class</DialogTitle>
            <DialogContent>
              <Typography sx={{ mb: 1 }}>
                Reinstate {reinstatingClass?.title}?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This class will return to its recurring schedule for future
                scheduled occurrences.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseReinstate}>Cancel</Button>
              <Button
                color="primary"
                variant="contained"
                onClick={handleConfirmReinstate}
              >
                Reinstate
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>

      {/* One-Time Events */}
      <Card sx={{ maxWidth: 720 }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="h6">One-Time Events</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Special events scheduled for a specific Hope House calendar day.
            </Typography>
          </Box>

          <Divider />

          <Button
            type="button"
            variant="contained"
            onClick={handleOpenAddOneTimeEvent}
          >
            Add One-Time Event
          </Button>

          {activeOneTimeEvents.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No active one-time events.
            </Typography>
          ) : (
            <Stack divider={<Divider flexItem />} spacing={0}>
              {activeOneTimeEvents.map((event) => {
                const timeRange = formatScheduleTimeRange(
                  event.startMin,
                  event.endMin,
                );
                return (
                  <Box
                    key={event.id}
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
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          {timeRange}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {event.title}
                        </Typography>
                        {event.canceled ? (
                          <Chip
                            size="small"
                            label="CANCELED"
                            color="error"
                            variant="outlined"
                          />
                        ) : null}
                        {event.location ? (
                          <Chip
                            size="small"
                            label={event.location}
                            variant="outlined"
                            color="info"
                          />
                        ) : null}
                        {event.facilitator ? (
                          <Chip
                            size="small"
                            label={`Facilitator: ${event.facilitator}`}
                            variant="outlined"
                          />
                        ) : null}
                        <Button
                          type="button"
                          size="small"
                          variant="text"
                          onClick={() => handleOpenEditOneTimeEvent(event)}
                        >
                          Edit
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Add One-Time Event dialog */}
      <Dialog
        open={addOneTimeOpen}
        onClose={handleCloseAddOneTimeEvent}
        maxWidth="sm"
        fullWidth
      >
        <Box component="form" onSubmit={handleAddOneTimeEventSubmit}>
          <DialogTitle>
            {oneTimeFormMode === "edit"
              ? "Edit One-Time Event"
              : "Add One-Time Event"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Event Name"
                value={addOneTimeTitle}
                onChange={(e) => setAddOneTimeTitle(e.target.value)}
                required
                fullWidth
                slotProps={{ input: { "aria-label": "Event name" } }}
              />
              <TextField
                label="Date"
                type="date"
                value={addOneTimeDate}
                onChange={(e) => setAddOneTimeDate(e.target.value)}
                required
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Start Time"
                type="time"
                value={addOneTimeStartTime}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setAddOneTimeStartTime(newStart);
                  // Auto-default End Time to 1 hour after Start, if not manually set
                  if (!addOneTimeEndTimeManuallySet.current && newStart) {
                    setAddOneTimeEndTime(addOneHourToTime(newStart));
                  }
                }}
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
                value={addOneTimeEndTime}
                onChange={(e) => {
                  setAddOneTimeEndTime(e.target.value ?? "");
                  addOneTimeEndTimeManuallySet.current = true;
                }}
                required
                fullWidth
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { step: 60 },
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={addOneTimeLocation}
                  label="Location"
                  onChange={(e) =>
                    setAddOneTimeLocation(e.target.value as string)
                  }
                >
                  <MenuItem value="">No specific location</MenuItem>
                  <MenuItem value="Living Room">Living Room</MenuItem>
                  <MenuItem value="Large Dining Room">
                    Large Dining Room
                  </MenuItem>
                  <MenuItem value="Small Dining Room">
                    Small Dining Room
                  </MenuItem>
                  <MenuItem value="Back House">Back House</MenuItem>
                  <MenuItem value="Computer Lab">Computer Lab</MenuItem>
                  <MenuItem value="Kitchen">Kitchen</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Facilitator"
                value={addOneTimeFacilitator}
                onChange={(e) => setAddOneTimeFacilitator(e.target.value)}
                fullWidth
                slotProps={{ input: { "aria-label": "Facilitator name" } }}
              />
              {addOneTimeError ? (
                <Typography variant="body2" color="error">
                  {addOneTimeError}
                </Typography>
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={handleCloseAddOneTimeEvent}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {oneTimeFormMode === "edit" ? "Save" : "Add"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
