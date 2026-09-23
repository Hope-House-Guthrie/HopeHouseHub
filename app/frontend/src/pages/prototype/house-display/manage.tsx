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
 * DONE (Stage E2 one-time conflict UI):
 * - oneTimeAdd/Edit gates via findScheduleConflicts before dispatch
 * - Dialog lists recurring (checkbox End/Replace) + oneTime (read-only; no checkbox)
 * - Keep Both saves pending OT; Save & Replace Selected only selected recurring
 * - Recurring Add/Edit/Reinstate still filter to kind recurring only
 *
 * DONE (Spotlight Content Phase 1 — read-only UI):
 * - Spotlight Content card on /prototype/house-display (above Announcements)
 * - Selects content.spotlightItems; display sort by sortOrder then id
 * - Lists all items (active + inactive): title, kind, active, video sound chips
 * - Prototype actions: Add Flyer (Phase 4); Add Video / Edit still disabled
 *
 * DONE (Spotlight Content Phase 2 — Enable/Disable):
 * - setSpotlightItemActive({ id, active }) in houseDisplay slice (no spotlight persist yet)
 * - Manage Enable/Disable dispatches it; Active chip updates from Redux
 * - TV pool already filters active (getActiveSpotlightItems); no index.tsx change
 * - Full page reload resets spotlight to seed (expected until later persist/API)
 *
 * DONE (Spotlight Content Phase 3 — Move Up/Down, browser-tested):
 * - moveSpotlightItem({ id, direction }) full-list sortOrder swap + renumber 0..n-1
 * - Manage map index disables first Up / last Down; no persist; no index.tsx
 *
 * DONE (Spotlight Content Phase 4 — Add Flyer):
 * - addSpotlightFlyer in slice (UI id; append max sortOrder+1; kind flyer; pin none)
 * - Dialog: title, sample @assets catalog and/or session file→object URL, Active
 * - No base64; no localStorage media; no spotlight persist; no TV renderer change
 * - Full reload drops added flyers (seed rebuild)
 *
 * DONE (Spotlight Content Phase 5 — Delete item):
 * - removeSpotlightItem in slice (any kind incl. s1–s4 seeds; renumber 0..n-1; no persist)
 * - Manage Delete per row → handleDeleteSpotlightItem; no confirm dialog
 * - Session flyer blob: imageUrl revoked after dispatch; bundled/normal URLs never revoked
 * - Disable stays separate (no revoke); no spotlight localStorage; no TV changes
 * - Seed delete is session-only (reload may restore seeds)
 *
 * DONE (Daily Affirmations — FE prototype complete):
 * - Card after Spotlight Content, before Announcements
 * - Add / Edit / Remove / Enable / Disable / Pin / Unpin / rotate-interval Select
 * - Slice: addAffirmation, editAffirmation, removeAffirmation, pinAffirmation,
 *   unpinAffirmation, setAffirmationRotateMs + SEED_AFFIRMATIONS hydrate
 * - Pin wins on TV; disable of pinned id clears pin (row stays); enable does not re-pin
 * - DEV persist on same LS key as schedule/announcements (library + pin + rotateMs)
 * - Separate Full Display tab picks up changes after refresh (no live cross-tab sync)
 * - Legacy content.affirmationText = TV fallback when enabled pool empty
 * - Production backend should replace localStorage as source of truth later
 *
 * DONE (System Spotlight Graphics Manage — FE):
 * - Admin-only card after Announcements (hide if no ADMIN role)
 * - Nine catalog slots; thumbs via getSystemSpotlightImageWithOverrides
 * - Replace (file → blob: object URL) / Restore default; revoke prior blob per key
 * - setSystemSpotlightImageOverride; TV resolve uses content.systemSpotlightImageOverrides
 * - DEV LS: stable override URLs may persist (same schedule key); blob: / data: not persisted
 * - Refresh Full Display after Manage for cross-tab (no live sync)
 *
 * DONE (Program / Class Graphics Manage — FE):
 * - Admin-only card after System Spotlight Graphics (hide if no ADMIN role)
 * - PROGRAM_LOGO_MANAGE_SLOTS; thumbs via getProgramLogoImageWithOverrides
 * - Replace / Restore; setProgramLogoImageOverride; shared logoKey updates all classes
 * - Schedule stores logoKey only; Class Image preview uses effective art
 * - DEV LS: stable program override URLs may persist; blob: / data: stripped
 *
 * DONE (Curfew / House Closing Manage — FE Ph1–7 COMPLETE 2026-08-30; manage browser QA passed):
 * - Admin-only card after Announcements, before System Spotlight Graphics
 * - Weekly Sun–Sat + End of day (1440); date override upsert / list / Remove
 * - Today effective preview; reducers + DEV LS whole-key curfew; TV uses content.curfew
 * - Stages auto-derived from effective C (no four staff closing events)
 * - Refresh Full Display after Manage (no live cross-tab)
 *
 * NEXT (Spotlight Content): Add Video / Edit / pin / sound / persist — parked
 * (Delete done — session-only. Schedule Stage D/E may still appear elsewhere.)
 *
 * NOT YET:
 * - override exception UI, delete definition, ended-list conflict UI
 * - One-time Class Image Select (parked)
 * - Affirmation / system / program graphics / curfew live cross-tab rehydrate (refresh TV after Manage)
 * - Backend API / thunks / durable media storage / program catalog CRUD
 * - Midnight re-resolve without refresh
 *
 * PAIR:
 * - TV: pages/prototype/house-display/index.tsx → /house-display
 * - Manage (this file): → /prototype/house-display
 */
import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
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
  newSpotlightVideoId,
  validateAddSpotlightVideoForm,
} from "../../../features/house-display/scheduleForm";
import {
  formatMinToTimeInput,
  parseTimeInputToMin,
  parseDateInputToYmd,
  newAffirmationId,
  newAnnouncementId,
  newRecurringClassId,
  newOneTimeEventId,
  newSpotlightFlyerId,
  validateRecurringClassForm,
  validateOneTimeEventForm,
  validateAddSpotlightFlyerForm,
} from "../../../features/house-display/scheduleForm";
import {
  canManageCurfew,
  CURFEW_END_OF_DAY_MIN,
  findCurfewOverrideForDate,
  formatCurfewCloseLabel,
  isValidCurfewCloseMin,
  resolveEffectiveCurfewMin,
  SEED_WEEKLY_CURFEW,
} from "../../../features/house-display/curfew";
import { timelineWindowForWeekday } from "../../../features/house-display/timeline";
import { SPOTLIGHT_FLYER_PROTOTYPE_ASSETS } from "../../../features/house-display/spotlightFlyerPrototype";
import {
  findProgramLogoOption,
  HOUSE_DISPLAY_PROGRAM_LOGO_OPTIONS,
  isHouseDisplayProgramLogoKey,
  PROGRAM_LOGO_MANAGE_SLOTS,
  canManageProgramLogoGraphics,
  getProgramLogoImageWithOverrides,
} from "../../../features/house-display/programLogos";
import {
  SYSTEM_SPOTLIGHT_MANAGE_SLOTS,
  canManageSystemSpotlightGraphics,
  getSystemSpotlightImageWithOverrides,
} from "../../../features/house-display/systemSpotlight";
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
  addAnnouncement,
  addAffirmation,
  addOneTimeEvent,
  addRecurringClass,
  addSpotlightFlyer,
  addSpotlightVideo,
  setSystemSpotlightImageOverride,
  setProgramLogoImageOverride,
  setCurfewWeeklyClose,
  setCurfewDateOverride,
  clearCurfewDateOverride,
  cancelOccurrence,
  editAffirmation,
  editOneTimeEvent,
  editRecurringClass,
  endRecurringClass,
  moveSpotlightItem,
  pinAffirmation,
  reinstateRecurringClass,
  removeAffirmation,
  removeAnnouncement,
  removeSpotlightItem,
  restoreOccurrence,
  setAffirmationRotateMs,
  setSpotlightItemActive,
  suppressRecurringOccurrence,
  unpinAffirmation,
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
  const announcements = useSelector(
    (state: RootState) => state.houseDisplay.content.announcements,
  );
  const affirmations = useSelector(
    (state: RootState) => state.houseDisplay.content.affirmations,
  );
  const pinnedAffirmationId = useSelector(
    (state: RootState) => state.houseDisplay.content.pinnedAffirmationId,
  );
  const affirmationRotateMs = useSelector(
    (state: RootState) => state.houseDisplay.content.affirmationRotateMs,
  );
  const spotlightItems = useSelector(
    (state: RootState) => state.houseDisplay.content.spotlightItems,
  );
  const systemSpotlightImageOverrides = useSelector(
    (state: RootState) =>
      state.houseDisplay.content.systemSpotlightImageOverrides,
  );
  const programLogoImageOverrides = useSelector(
    (state: RootState) => state.houseDisplay.content.programLogoImageOverrides,
  );
  const curfew = useSelector(
    (state: RootState) => state.houseDisplay.content.curfew,
  );
  /** Hub auth roles - System Spotlight + Program Graphics + Curfew are Admin-only (FE hide). */
  const authUserRoles = useSelector(
    (state: RootState) => state.auth.user?.roles ?? [],
  );
  const canManageSystemSpotlight =
    canManageSystemSpotlightGraphics(authUserRoles);
  const canManageProgramLogos = canManageProgramLogoGraphics(authUserRoles);
  const canManageHouseCurfew = canManageCurfew(authUserRoles);

  // --- Add Class dialog ---
  const [addClassOpen, setAddClassOpen] = useState(false);
  /** "add" = new series; "edit" = existing series (id in editingClassId) */
  const [classFormMode, setClassFormMode] = useState<"add" | "edit">("add");
  /** Set only in edit mode; null in add mode */
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [addTitle, setAddTitle] = useState("");
  const [addMeetingTopic, setAddMeetingTopic] = useState("");
  const [addStartTime, setAddStartTime] = useState(""); // "HH:mm"
  const [addEndTime, setAddEndTime] = useState("");
  /** Weekday numbers 0=Sun … 6=Sat (empty ≠ every day) */
  const [addDays, setAddDays] = useState<number[]>([]);
  const [addError, setAddError] = useState("");
  const [addLocation, setAddLocation] = useState<string>("Living Room");
  const [addFacilitator, setAddFacilitator] = useState<string>("");
  /**
   * Class Image catalog key for Spotlight takeover.
   * "" = None (no logo). Values match programLogos logoKey catalog.
   */
  const [addLogoKey, setAddLogoKey] = useState<string>("");

  // Track if end time was manually set (to avoid overwriting on start change)
  const addClassEndTimeManuallySet = useRef(false);
  const addOneTimeEndTimeManuallySet = useRef(false);

  // --- One-Time Event dialog state ---
  const [oneTimeFormMode, setOneTimeFormMode] = useState<"add" | "edit">("add");
  const [editingOneTimeId, setEditingOneTimeId] = useState<string | null>(null);
  const [addOneTimeOpen, setAddOneTimeOpen] = useState(false);
  const [addOneTimeTitle, setAddOneTimeTitle] = useState("");
  const [addOneTimeMeetingTopic, setAddOneTimeMeetingTopic] = useState("");
  const [addOneTimeDate, setAddOneTimeDate] = useState<string>(""); // YYYY-MM-DD
  const [addOneTimeStartTime, setAddOneTimeStartTime] = useState("");
  const [addOneTimeEndTime, setAddOneTimeEndTime] = useState("");
  const [addOneTimeLocation, setAddOneTimeLocation] =
    useState<string>("Living Room");
  const [addOneTimeFacilitator, setAddOneTimeFacilitator] =
    useState<string>("");
  const [addOneTimeError, setAddOneTimeError] = useState("");

  // --- Announcements state ---
  const [newAnnouncementText, setNewAnnouncementText] = useState("");
  const [addAnnouncementError, setAddAnnouncementError] = useState("");

  // --- Curfew / House Closing (Admin) ---
  const [curfewOverrideDate, setCurfewOverrideDate] = useState("");
  const [curfewOverrideTime, setCurfewOverrideTime] = useState("");
  const [curfewOverrideEndOfDay, setCurfewOverrideEndOfDay] = useState(false);
  const [curfewOverrideNote, setCurfewOverrideNote] = useState("");
  const [curfewOverrideError, setCurfewOverrideError] = useState("");
  const [curfewWeeklyError, setCurfewWeeklyError] = useState("");

  // --- Affirmations state (list + add/edit/pin/enable + rotate interval) ---
  const [newAffirmationText, setNewAffirmationText] = useState("");
  const [addAffirmationError, setAddAffirmationError] = useState("");
  const [editingAffirmationId, setEditingAffirmationId] = useState<
    string | null
  >(null);
  const [editingAffirmationText, setEditingAffirmationText] = useState("");
  const [editAffirmationError, setEditAffirmationError] = useState("");

  // --- Add Flyer dialog (Spotlight Content Phase 4) ---
  const [addFlyerOpen, setAddFlyerOpen] = useState(false);
  const [addFlyerTitle, setAddFlyerTitle] = useState("");
  /** Catalog key from SPOTLIGHT_FLYER_PROTOTYPE_ASSETS, or "". */
  const [addFlyerSampleKey, setAddFlyerSampleKey] = useState("");
  /** Session-only object URL from file pick; "" when unused. Not base64. */
  const [addFlyerObjectUrl, setAddFlyerObjectUrl] = useState("");
  const [addFlyerFileName, setAddFlyerFileName] = useState("");
  const [addFlyerActive, setAddFlyerActive] = useState(true);
  const [addFlyerError, setAddFlyerError] = useState("");
  const addFlyerFileInputRef = useRef<HTMLInputElement | null>(null);
  /** Shared file picker for System Spotlight Graphics replace (Admin). */
  const systemSpotlightFileInputRef = useRef<HTMLInputElement | null>(null);
  /**
   * Which assetKey the next file pick applies to (ref avoids stale state on change).
   */
  const systemSpotlightReplaceKeyRef = useRef<string | null>(null);
  /**
   * blob: URLs we created per key — revoke when replaced/cleared.
   * Do not revoke bundled @assets URLs.
   */
  const systemSpotlightBlobByKeyRef = useRef<Record<string, string>>({});
  /** Shared file picker for Program / Class Graphics replace (Admin). */
  const programLogoFileInputRef = useRef<HTMLInputElement | null>(null);
  const programLogoReplaceKeyRef = useRef<string | null>(null);
  const programLogoBlobByKeyRef = useRef<Record<string, string>>({});
  /** Track object URL for revoke on replace/cancel (not after successful save). */
  const addFlyerObjectUrlRef = useRef("");

  // --- Add Video dialog (Spotlight Content Phase 5) ---
  const [addVideoOpen, setAddVideoOpen] = useState(false);
  const [addVideoTitle, setAddVideoTitle] = useState("");
  /** Session-only object URL from file pick; "" when unused. Not base64. */
  const [addVideoObjectUrl, setAddVideoObjectUrl] = useState("");
  const [addVideoFileName, setAddVideoFileName] = useState("");
  /** Captured from file.type on pick. */
  const [addVideoMimeType, setAddVideoMimeType] = useState("video/mp4");
  const [addVideoActive, setAddVideoActive] = useState(true);
  const [addVideoSoundEnabled, setAddVideoSoundEnabled] = useState(true);
  const [addVideoError, setAddVideoError] = useState("");
  const addVideoFileInputRef = useRef<HTMLInputElement | null>(null);
  /** Track object URL for revoke on cancel/replace (not after successful save). */
  const addVideoObjectUrlRef = useRef("");

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
    setAddMeetingTopic("");
    setAddStartTime("");
    setAddEndTime("");
    setAddDays([]);
    setAddError("");
    setAddLocation("Living Room");
    setAddFacilitator("");
    setAddLogoKey("");
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
    setAddOneTimeMeetingTopic("");
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
    setAddOneTimeMeetingTopic(event.meetingTopic ?? "");
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

  // --- Announcement handlers ---
  const handleAddAnnouncementSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = newAnnouncementText.trim();
    if (!text) {
      setAddAnnouncementError("Announcement text is required.");
      return;
    }
    dispatch(
      addAnnouncement({
        id: newAnnouncementId(),
        text,
      }),
    );
    setNewAnnouncementText("");
    setAddAnnouncementError("");
  };

  const handleRemoveAnnouncement = (announcementId: string) => {
    dispatch(removeAnnouncement({ id: announcementId }));
  };

  /**
   * Parse UI close time → closeMin (1..1440).
   * End-of-day checkbox → 1440. type=time "00:00" alone is rejected (use End of day).
   */
  const parseCurfewCloseFromUi = (
    timeValue: string,
    endOfDay: boolean,
  ): number | null => {
    if (endOfDay) return CURFEW_END_OF_DAY_MIN;
    const min = parseTimeInputToMin(timeValue);
    if (min == null) return null;
    if (min === 0) return null;
    if (!isValidCurfewCloseMin(min)) return null;
    return min;
  };

  /** Soft floor: leave room for T-15 (openMin + 15). */
  const minAllowedCloseForWeekday = (weekday: number): number => {
    const openMin = timelineWindowForWeekday(
      weekday as HouseDisplayWeekday,
    ).windowStartMin;
    return openMin + 15;
  };

  const handleCurfewWeeklyTimeChange = (weekday: number, timeValue: string) => {
    setCurfewWeeklyError("");
    const closeMin = parseCurfewCloseFromUi(timeValue, false);
    if (closeMin == null) {
      setCurfewWeeklyError(
        "Enter a valid close time, or use End of day (not 12:00 AM on the clock).",
      );
      return;
    }
    if (closeMin < minAllowedCloseForWeekday(weekday)) {
      setCurfewWeeklyError(
        "Close time must leave room for the T-15 stage after house open.",
      );
      return;
    }
    const resolveYmd = getHopeHouseNow().dateKey;
    dispatch(
      setCurfewWeeklyClose({
        weekday,
        closeMin,
        dateYmd: resolveYmd,
      }),
    );
  };

  const handleCurfewWeeklyEndOfDay = (weekday: number, checked: boolean) => {
    setCurfewWeeklyError("");
    const resolveYmd = getHopeHouseNow().dateKey;
    // Check → 1440. Uncheck → seed weekly default (Sun–Thu 22:00, Fri–Sat 23:00).
    const closeMin = checked
      ? CURFEW_END_OF_DAY_MIN
      : SEED_WEEKLY_CURFEW.closeMinByWeekday[weekday as HouseDisplayWeekday];
    dispatch(
      setCurfewWeeklyClose({
        weekday,
        closeMin,
        dateYmd: resolveYmd,
      }),
    );
  };

  const handleCurfewOverrideSubmit = (e: FormEvent) => {
    e.preventDefault();
    setCurfewOverrideError("");

    const dateYmd = parseDateInputToYmd(curfewOverrideDate);
    if (dateYmd == null) {
      setCurfewOverrideError("Choose a valid override date.");
      return;
    }

    const closeMin = parseCurfewCloseFromUi(
      curfewOverrideTime,
      curfewOverrideEndOfDay,
    );
    if (closeMin == null) {
      setCurfewOverrideError(
        "Enter a valid close time, or check End of day (12:00 AM).",
      );
      return;
    }

    // Soft floor uses that date's weekday open.
    const parts = dateYmd.split("-").map(Number);
    const y = parts[0] ?? 0;
    const m = parts[1] ?? 1;
    const d = parts[2] ?? 1;
    const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const weekday = utc.getUTCDay();
    if (closeMin < minAllowedCloseForWeekday(weekday)) {
      setCurfewOverrideError(
        "Close time must leave room for the T-15 stage after house open.",
      );
      return;
    }

    const resolveYmd = getHopeHouseNow().dateKey;
    const existing = findCurfewOverrideForDate(curfew.overrides, dateYmd);
    const id =
      existing?.id ??
      `curfew-ovr-${
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now())
      }`;

    dispatch(
      setCurfewDateOverride({
        id,
        dateYmd,
        closeMin,
        note: curfewOverrideNote.trim() || undefined,
        resolveDateYmd: resolveYmd,
      }),
    );

    setCurfewOverrideDate("");
    setCurfewOverrideTime("");
    setCurfewOverrideEndOfDay(false);
    setCurfewOverrideNote("");
    setCurfewOverrideError("");
  };

  const handleClearCurfewOverride = (overrideDateYmd: string) => {
    dispatch(
      clearCurfewDateOverride({
        dateYmd: overrideDateYmd,
        resolveDateYmd: getHopeHouseNow().dateKey,
      }),
    );
  };

  // Display helpers for weekly row time field (1440 → end-of-day UI, not 00:00)
  const weeklyCloseIsEndOfDay = (weekday: number): boolean =>
    curfew.weekly.closeMinByWeekday[weekday] === CURFEW_END_OF_DAY_MIN;

  const weeklyCloseTimeInputValue = (weekday: number): string => {
    const min = curfew.weekly.closeMinByWeekday[weekday];
    if (!isValidCurfewCloseMin(min) || min === CURFEW_END_OF_DAY_MIN) return "";
    return formatMinToTimeInput(min);
  };

  // --- Affirmation handlers (add/edit/remove/pin/enable/rotate) ---
  const handleAddAffirmationSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = newAffirmationText.trim();
    if (!text) {
      setAddAffirmationError("Affirmation text is required.");
      return;
    }
    dispatch(
      addAffirmation({
        id: newAffirmationId(),
        text,
        enabled: true,
      }),
    );
    setNewAffirmationText("");
    setAddAffirmationError("");
  };

  const handleRemoveAffirmation = (affirmationId: string) => {
    dispatch(removeAffirmation({ id: affirmationId }));
  };

  const handlePinAffirmation = (affirmationId: string) => {
    dispatch(pinAffirmation({ id: affirmationId }));
  };

  const handleUnpinAffirmation = () => {
    dispatch(unpinAffirmation());
  };

  /**
   * Soft on/off for rotation pool via editAffirmation({ enabled }).
   * Disable keeps the row; reducer clears pin if this id was pinned.
   * Enable does not re-pin.
   */
  const handleSetAffirmationEnabled = (
    affirmationId: string,
    enabled: boolean,
  ) => {
    dispatch(
      editAffirmation({
        id: affirmationId,
        enabled,
      }),
    );
  };

  const handleAffirmationRotateMsChange = (ms: number) => {
    dispatch(setAffirmationRotateMs({ ms }));
  };

  const handleStartEditAffirmation = (id: string, text: string) => {
    setEditingAffirmationId(id);
    setEditingAffirmationText(text);
    setEditAffirmationError("");
  };

  const handleCancelEditAffirmation = () => {
    setEditingAffirmationId(null);
    setEditingAffirmationText("");
    setEditAffirmationError("");
  };

  const handleSaveEditAffirmation = () => {
    if (!editingAffirmationId) return;
    const text = editingAffirmationText.trim();
    if (!text) {
      setEditAffirmationError("Affirmation text is required.");
      return;
    }
    dispatch(
      editAffirmation({
        id: editingAffirmationId,
        text,
      }),
    );
    handleCancelEditAffirmation();
  };

  /** Drop pending file object URL without touching Redux (cancel / re-pick). */
  const revokePendingFlyerObjectUrl = () => {
    const url = addFlyerObjectUrlRef.current;
    if (url) {
      URL.revokeObjectURL(url);
      addFlyerObjectUrlRef.current = "";
    }
    setAddFlyerObjectUrl("");
    setAddFlyerFileName("");
    if (addFlyerFileInputRef.current) {
      addFlyerFileInputRef.current.value = "";
    }
  };

  const resetAddFlyerForm = () => {
    setAddFlyerTitle("");
    setAddFlyerSampleKey("");
    setAddFlyerActive(true);
    setAddFlyerError("");
    revokePendingFlyerObjectUrl();
  };

  const handleOpenAddFlyer = () => {
    resetAddFlyerForm();
    setAddFlyerOpen(true);
  };

  const handleCloseAddFlyer = () => {
    setAddFlyerOpen(false);
    resetAddFlyerForm();
  };

  const handleAddFlyerSampleChange = (key: string) => {
    setAddFlyerSampleKey(key);
    setAddFlyerError("");
    // Sample takes priority over a prior file pick for clarity.
    if (key) {
      revokePendingFlyerObjectUrl();
      const asset = SPOTLIGHT_FLYER_PROTOTYPE_ASSETS.find((a) => a.key === key);
      if (asset && !addFlyerTitle.trim()) {
        setAddFlyerTitle(asset.defaultTitle);
      }
    }
  };

  const handleAddFlyerFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAddFlyerError("");
    if (!file) {
      revokePendingFlyerObjectUrl();
      return;
    }
    if (!file.type.startsWith("image/")) {
      revokePendingFlyerObjectUrl();
      setAddFlyerError("Please choose an image file (PNG, JPG, etc.).");
      return;
    }
    // New pick replaces prior object URL; sample cleared so file is the source.
    revokePendingFlyerObjectUrl();
    setAddFlyerSampleKey("");
    const url = URL.createObjectURL(file);
    addFlyerObjectUrlRef.current = url;
    setAddFlyerObjectUrl(url);
    setAddFlyerFileName(file.name);
    if (!addFlyerTitle.trim()) {
      const base = file.name.replace(/\.[^.]+$/, "").trim();
      if (base) setAddFlyerTitle(base);
    }
  };

  const handleSystemSpotlightReplaceClick = (assetKey: string) => {
    systemSpotlightReplaceKeyRef.current = assetKey;
    systemSpotlightFileInputRef.current?.click();
  };

  const handleSystemSpotlightFileChange = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const assetKey = systemSpotlightReplaceKeyRef.current;
    const file = e.target.files?.[0] ?? null;
    // Allow re-picking the same file name later.
    e.target.value = "";
    systemSpotlightReplaceKeyRef.current = null;

    if (!assetKey || !file) return;
    if (!file.type.startsWith("image/")) return;

    const prevBlob = systemSpotlightBlobByKeyRef.current[assetKey];
    if (prevBlob) {
      URL.revokeObjectURL(prevBlob);
      delete systemSpotlightBlobByKeyRef.current[assetKey];
    }

    const url = URL.createObjectURL(file);
    systemSpotlightBlobByKeyRef.current[assetKey] = url;

    dispatch(
      setSystemSpotlightImageOverride({
        assetKey,
        imageUrl: url,
      }),
    );
  };

  const handleSystemSpotlightRestoreDefault = (assetKey: string) => {
    const prevBlob = systemSpotlightBlobByKeyRef.current[assetKey];
    if (prevBlob) {
      URL.revokeObjectURL(prevBlob);
      delete systemSpotlightBlobByKeyRef.current[assetKey];
    }
    dispatch(
      setSystemSpotlightImageOverride({
        assetKey,
        imageUrl: null,
      }),
    );
  };

  const handleProgramLogoReplaceClick = (logoKey: string) => {
    programLogoReplaceKeyRef.current = logoKey;
    programLogoFileInputRef.current?.click();
  };

  const handleProgramLogoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const logoKey = programLogoReplaceKeyRef.current;
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    programLogoReplaceKeyRef.current = null;

    if (!logoKey || !file) return;
    if (!file.type.startsWith("image/")) return;

    const prevBlob = programLogoBlobByKeyRef.current[logoKey];
    if (prevBlob) {
      URL.revokeObjectURL(prevBlob);
      delete programLogoBlobByKeyRef.current[logoKey];
    }

    const url = URL.createObjectURL(file);
    programLogoBlobByKeyRef.current[logoKey] = url;

    dispatch(
      setProgramLogoImageOverride({
        logoKey,
        imageUrl: url,
      }),
    );
  };

  const handleProgramLogoRestoreDefault = (logoKey: string) => {
    const prevBlob = programLogoBlobByKeyRef.current[logoKey];
    if (prevBlob) {
      URL.revokeObjectURL(prevBlob);
      delete programLogoBlobByKeyRef.current[logoKey];
    }
    dispatch(
      setProgramLogoImageOverride({
        logoKey,
        imageUrl: null,
      }),
    );
  };

  const handleAddFlyerSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAddFlyerError("");

    const sample = SPOTLIGHT_FLYER_PROTOTYPE_ASSETS.find(
      (a) => a.key === addFlyerSampleKey,
    );
    // File object URL wins if present; else bundled sample URL.
    const imageUrl = addFlyerObjectUrl || sample?.imageUrl || "";
    const imageAlt =
      (sample && !addFlyerObjectUrl ? sample.imageAlt : "") ||
      addFlyerTitle.trim() ||
      addFlyerFileName ||
      "Flyer";

    const validated = validateAddSpotlightFlyerForm({
      title: addFlyerTitle,
      imageUrl,
    });
    if (!validated.ok) {
      setAddFlyerError(validated.error);
      return;
    }

    dispatch(
      addSpotlightFlyer({
        id: newSpotlightFlyerId(),
        title: validated.title,
        imageUrl: validated.imageUrl,
        imageAlt,
        active: addFlyerActive,
      }),
    );

    // Keep object URL alive in Redux for this session — do not revoke on save.
    addFlyerObjectUrlRef.current = "";
    setAddFlyerObjectUrl("");
    setAddFlyerFileName("");
    if (addFlyerFileInputRef.current) {
      addFlyerFileInputRef.current.value = "";
    }
    setAddFlyerOpen(false);
    setAddFlyerTitle("");
    setAddFlyerSampleKey("");
    setAddFlyerActive(true);
    setAddFlyerError("");
  };

  // --- Add Video handlers (Spotlight Content Phase 5) ---
  const revokePendingVideoObjectUrl = () => {
    const url = addVideoObjectUrlRef.current;
    if (url) {
      URL.revokeObjectURL(url);
      addVideoObjectUrlRef.current = "";
    }
    setAddVideoObjectUrl("");
    setAddVideoFileName("");
    setAddVideoMimeType("video/mp4");
    if (addVideoFileInputRef.current) {
      addVideoFileInputRef.current.value = "";
    }
  };

  const resetAddVideoForm = () => {
    setAddVideoTitle("");
    setAddVideoActive(true);
    setAddVideoSoundEnabled(true);
    setAddVideoError("");
    revokePendingVideoObjectUrl();
  };

  const handleOpenAddVideo = () => {
    resetAddVideoForm();
    setAddVideoOpen(true);
  };

  const handleCloseAddVideo = () => {
    setAddVideoOpen(false);
    resetAddVideoForm();
  };

  const handleAddVideoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAddVideoError("");
    if (!file) {
      revokePendingVideoObjectUrl();
      return;
    }
    if (!file.type.startsWith("video/")) {
      revokePendingVideoObjectUrl();
      setAddVideoError("Please choose a video file (MP4, WebM, etc.).");
      return;
    }
    // New pick replaces prior object URL
    revokePendingVideoObjectUrl();
    const url = URL.createObjectURL(file);
    addVideoObjectUrlRef.current = url;
    setAddVideoObjectUrl(url);
    setAddVideoFileName(file.name);
    setAddVideoMimeType(file.type || "video/mp4");
    if (!addVideoTitle.trim()) {
      const base = file.name.replace(/\.[^.]+$/, "").trim();
      if (base) setAddVideoTitle(base);
    }
  };

  const handleAddVideoSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAddVideoError("");

    const validated = validateAddSpotlightVideoForm({
      title: addVideoTitle,
      videoUrl: addVideoObjectUrl,
      videoMimeType: addVideoMimeType,
      videoSoundEnabled: addVideoSoundEnabled,
    });
    if (!validated.ok) {
      setAddVideoError(validated.error);
      return;
    }

    dispatch(
      addSpotlightVideo({
        id: newSpotlightVideoId(),
        title: validated.title,
        videoUrl: validated.videoUrl,
        videoMimeType: validated.videoMimeType,
        videoSoundEnabled: validated.videoSoundEnabled,
        active: addVideoActive,
      }),
    );

    // Keep object URL alive in Redux for this session — do not revoke on save.
    addVideoObjectUrlRef.current = "";
    setAddVideoObjectUrl("");
    setAddVideoFileName("");
    setAddVideoMimeType("video/mp4");
    if (addVideoFileInputRef.current) {
      addVideoFileInputRef.current.value = "";
    }
    setAddVideoOpen(false);
    setAddVideoTitle("");
    setAddVideoActive(true);
    setAddVideoSoundEnabled(true);
    setAddVideoError("");
  };

  const handleDeleteSpotlightItem = (id: string) => {
    const item = spotlightItems.find((s) => s.id === id);
    const imageUrl =
      item && typeof item.imageUrl === "string" ? item.imageUrl : "";

    dispatch(removeSpotlightItem({ id }));

    // Session file flyer only - never revoke bundled assets or normal URLs.
    // Disable must not call this path.
    if (imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }
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
          meetingTopic: addOneTimeMeetingTopic.trim()
            ? addOneTimeMeetingTopic.trim()
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
          meetingTopic: addOneTimeMeetingTopic.trim()
            ? addOneTimeMeetingTopic.trim()
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
            meetingTopic: addOneTimeMeetingTopic.trim()
              ? addOneTimeMeetingTopic.trim()
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
    setAddMeetingTopic(series.meetingTopic ?? "");
    setAddStartTime(formatMinToTimeInput(series.startMin));
    setAddEndTime(formatMinToTimeInput(series.endMin));
    setAddDays([...series.daysOfWeek].sort((a, b) => a - b));
    setAddLocation(series.location ?? "Living Room");
    setAddFacilitator(series.facilitator ?? "");
    // Prefill Class Image from series logoKey when it is a known catalog key.
    const existingKey =
      typeof series.logoKey === "string" ? series.logoKey.trim() : "";
    setAddLogoKey(
      existingKey && isHouseDisplayProgramLogoKey(existingKey)
        ? existingKey
        : "",
    );
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
        const selectedIds = new Set(endingExistingClasses.map((e) => e.id));
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
          meetingTopic: ev.meetingTopic ?? "",
          // Form always sends explicit logoKey (string | null) for Class Image.
          logoKey: ev.logoKey ?? null,
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
          meetingTopic: (event as any).meetingTopic ?? "",
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
    if (
      originalSaveKind === "oneTimeAdd" ||
      originalSaveKind === "oneTimeEdit"
    ) {
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
        meetingTopic?: string;
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
            meetingTopic: ot.meetingTopic,
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
        meetingTopic?: string;
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
          meetingTopic: ot.meetingTopic ?? "",
        }),
      );
    } else if (pendingSaveKind === "edit") {
      // Keep Both on Edit Class must UPDATE the series — not addRecurringClass
      // (duplicate id is a no-op and would drop logoKey / field changes).
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
          meetingTopic: ev.meetingTopic ?? "",
          logoKey: ev.logoKey ?? null,
        }),
      );
    } else {
      // pendingSaveKind === "add" (and any other non-edit recurring save)
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
    // Mirror handleSaveWithSelectedEnds: one-time pending closes OT form;
    // recurring pending closes Add Class; reinstate leaves forms alone.
    if (
      originalSaveKind === "oneTimeAdd" ||
      originalSaveKind === "oneTimeEdit"
    ) {
      handleCloseAddOneTimeEvent();
    } else if (originalSaveKind !== "reinstate") {
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

    // Class Image: "" in UI = None → null on series (clear / no logo).
    const logoKeyForSave = addLogoKey.trim() ? addLogoKey.trim() : null;

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
      meetingTopic: addMeetingTopic.trim() ? addMeetingTopic.trim() : undefined,
      logoKey: logoKeyForSave,
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
            meetingTopic: addMeetingTopic.trim() ? addMeetingTopic.trim() : "",
            logoKey: logoKeyForSave,
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

  // Display-only: all Spotlight items (active + inactive), TV sort order -> never mutate Redux
  const spotlightItemsForManage = useMemo(() => {
    return spotlightItems.slice().sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.id.localeCompare(b.id);
    });
  }, [spotlightItems]);

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
                // Friendly Class Image label only — never raw logoKey in the list.
                const classImageOption = findProgramLogoOption(series.logoKey);
                const classImageLabel = classImageOption
                  ? classImageOption.label
                  : "None";
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
                        <Chip
                          size="small"
                          label={`Class Image: ${classImageLabel}`}
                          variant="outlined"
                          color={classImageOption ? "secondary" : "default"}
                        />
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
                    label="Meeting Topic"
                    value={addMeetingTopic}
                    onChange={(e) => setAddMeetingTopic(e.target.value)}
                    fullWidth
                    slotProps={{
                      input: {
                        "aria-label": "Meeting topic",
                      },
                      htmlInput: { maxLength: 120 },
                    }}
                    helperText="Optional — e.g. Dealing With Triggers"
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
                    label="Chair / Facilitator"
                    value={addFacilitator}
                    onChange={(e) => setAddFacilitator(e.target.value)}
                    fullWidth
                    slotProps={{
                      input: { "aria-label": "Chair or facilitator name" },
                    }}
                  />
                  <FormControl fullWidth>
                    <InputLabel id="add-class-image-label">
                      Class Image
                    </InputLabel>
                    <Select
                      labelId="add-class-image-label"
                      label="Class Image"
                      value={addLogoKey}
                      onChange={(e) => setAddLogoKey(String(e.target.value))}
                      inputProps={{ "aria-label": "Class image" }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {HOUSE_DISPLAY_PROGRAM_LOGO_OPTIONS.map((opt) => (
                        <MenuItem key={opt.key} value={opt.key}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {findProgramLogoOption(addLogoKey) ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.75,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Preview (shown on Full Display only while the class is
                        happening — not on the schedule timeline)
                      </Typography>
                      <Box
                        component="img"
                        src={
                          getProgramLogoImageWithOverrides(
                            addLogoKey,
                            programLogoImageOverrides,
                          ) ?? findProgramLogoOption(addLogoKey)!.imageUrl
                        }
                        alt={`${findProgramLogoOption(addLogoKey)!.label} class image`}
                        sx={{
                          maxWidth: 200,
                          maxHeight: 120,
                          objectFit: "contain",
                          objectPosition: "center",
                          borderRadius: 1,
                          bgcolor: "grey.100",
                          alignSelf: "flex-start",
                        }}
                      />
                    </Box>
                  ) : null}
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
                    ? "This one-time event overlaps other schedule items on its date. Recurring rows can be checked so Save & Replace Selected hides only those occurrences that day. Other one-time events are listed for awareness only (not replaced). Keep Both saves without changing existing items."
                    : "The class you are adding/editing conflicts with existing classes:"}
              </Typography>
              <Stack divider={<Divider flexItem />} spacing={1}>
                {pendingConflicts.map((conflict) => {
                  // Recurring conflicts: selectable End / Replace (unchanged Stage D/E2).
                  if (conflict.kind === "recurring") {
                    const isChecked = endingExistingClasses.some(
                      (e) => e.id === conflict.seriesId,
                    );
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
                            {formatScheduleTimeRange(
                              conflict.startMin,
                              conflict.endMin,
                            )}{" "}
                            on{" "}
                            {conflict.weekdays
                              .map((d) => formatRecurringDaysLabel([d]))
                              .join(", ")}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  }

                  // One-time conflicts: informational only (E2). No checkbox —
                  // never end/delete/suppress another one-time from this dialog.
                  if (conflict.kind === "oneTime") {
                    return (
                      <Box
                        key={conflict.eventId}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                          pl: 0.5,
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {conflict.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            One-time · {conflict.dateYmd} ·{" "}
                            {formatScheduleTimeRange(
                              conflict.startMin,
                              conflict.endMin,
                            )}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            Listed for awareness — not replaced by this dialog.
                          </Typography>
                        </Box>
                      </Box>
                    );
                  }

                  return null;
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

      {/* Spotlight Content - list + Enable/Move + Add Flyer (Ph1–4) */}
      <Card sx={{ maxWidth: 720 }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="h6">Spotlight Content</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Flyers and videos shown in the Spotlight area when no scheduled
              event is currently taking over the display.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Button
              type="button"
              variant="contained"
              onClick={handleOpenAddFlyer}
            >
              + Add Flyer
            </Button>
            <Button
              type="button"
              variant="contained"
              onClick={handleOpenAddVideo}
            >
              + Add Video
            </Button>
          </Box>

          <Divider />

          {spotlightItemsForManage.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No Spotlight content is configured yet.
            </Typography>
          ) : (
            <Stack divider={<Divider flexItem />} spacing={0}>
              {spotlightItemsForManage.map((item, index) => {
                const kindLabel =
                  item.kind === "flyer"
                    ? "Flyer"
                    : item.kind === "video"
                      ? "Video"
                      : "Card";

                const activeLabel = item.active ? "Active" : "Inactive";

                const soundLabel =
                  item.kind === "video"
                    ? item.videoSoundEnabled
                      ? "Sound On"
                      : "Sound Off"
                    : null;

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
                    <Box sx={{ minWidth: 0, flex: "1 1 200px" }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item.title || "(Untitled)"}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.75,
                          mt: 0.75,
                        }}
                      >
                        <Chip size="small" label={kindLabel} />
                        <Chip
                          size="small"
                          label={activeLabel}
                          color={item.active ? "success" : "default"}
                          variant={item.active ? "filled" : "outlined"}
                        />
                        {soundLabel ? (
                          <Chip
                            size="small"
                            label={soundLabel}
                            variant="outlined"
                          />
                        ) : null}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        flex: "0 0 auto",
                      }}
                    >
                      <Button
                        type="button"
                        size="small"
                        onClick={() => {
                          dispatch(
                            setSpotlightItemActive({
                              id: item.id,
                              active: !item.active,
                            }),
                          );
                        }}
                      >
                        {item.active ? "Disable" : "Enable"}
                      </Button>

                      {item.active ? (
                        <Button type="button" size="small" disabled>
                          Edit
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        size="small"
                        disabled={index === 0}
                        onClick={() => {
                          dispatch(
                            moveSpotlightItem({
                              id: item.id,
                              direction: "up",
                            }),
                          );
                        }}
                      >
                        Move Up
                      </Button>
                      <Button
                        type="button"
                        size="small"
                        disabled={index === spotlightItemsForManage.length - 1}
                        onClick={() => {
                          dispatch(
                            moveSpotlightItem({
                              id: item.id,
                              direction: "down",
                            }),
                          );
                        }}
                      >
                        Move Down
                      </Button>
                      <Button
                        type="button"
                        size="small"
                        color="error"
                        onClick={() => handleDeleteSpotlightItem(item.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Add Flyer dialog — Spotlight Content Phase 4 */}
      <Dialog
        open={addFlyerOpen}
        onClose={handleCloseAddFlyer}
        maxWidth="sm"
        fullWidth
      >
        <Box component="form" onSubmit={handleAddFlyerSubmit}>
          <DialogTitle>Add Flyer</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Prototype only. Sample flyers use bundled Hope House images.
                Choosing a file uses a temporary browser URL for this session —
                full page reload clears added Spotlight items (no persist yet).
                No image bytes are saved to localStorage.
              </Typography>
              <TextField
                label="Flyer name"
                value={addFlyerTitle}
                onChange={(e) => {
                  setAddFlyerTitle(e.target.value);
                  if (addFlyerError) setAddFlyerError("");
                }}
                required
                fullWidth
                slotProps={{ input: { "aria-label": "Flyer name" } }}
              />
              <FormControl fullWidth>
                <InputLabel id="add-flyer-sample-label">
                  Sample flyer image
                </InputLabel>
                <Select
                  labelId="add-flyer-sample-label"
                  label="Sample flyer image"
                  value={addFlyerSampleKey}
                  onChange={(e) =>
                    handleAddFlyerSampleChange(String(e.target.value))
                  }
                  inputProps={{ "aria-label": "Sample flyer image" }}
                >
                  <MenuItem value="">
                    <em>None — use a file instead</em>
                  </MenuItem>
                  {SPOTLIGHT_FLYER_PROTOTYPE_ASSETS.map((asset) => (
                    <MenuItem key={asset.key} value={asset.key}>
                      {asset.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box>
                <Button
                  type="button"
                  variant="outlined"
                  component="label"
                  sx={{ mr: 1 }}
                >
                  Choose image file
                  <input
                    ref={addFlyerFileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleAddFlyerFileChange}
                  />
                </Button>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: "inline" }}
                >
                  {addFlyerFileName
                    ? addFlyerFileName
                    : "Optional session-only pick"}
                </Typography>
              </Box>
              {(addFlyerObjectUrl ||
                SPOTLIGHT_FLYER_PROTOTYPE_ASSETS.find(
                  (a) => a.key === addFlyerSampleKey,
                )?.imageUrl) && (
                <Box
                  component="img"
                  src={
                    addFlyerObjectUrl ||
                    SPOTLIGHT_FLYER_PROTOTYPE_ASSETS.find(
                      (a) => a.key === addFlyerSampleKey,
                    )!.imageUrl
                  }
                  alt="Flyer preview"
                  sx={{
                    maxWidth: "100%",
                    maxHeight: 200,
                    objectFit: "contain",
                    borderRadius: 1,
                    bgcolor: "grey.100",
                  }}
                />
              )}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={addFlyerActive}
                    onChange={(e) => setAddFlyerActive(e.target.checked)}
                    slotProps={{
                      input: { "aria-label": "Active on TV when saved" },
                    }}
                  />
                }
                label="Active on TV when saved"
              />
              {addFlyerError ? (
                <Typography variant="body2" color="error">
                  {addFlyerError}
                </Typography>
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={handleCloseAddFlyer}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Add Flyer
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Add Video dialog — Spotlight Content Phase 5 */}
      <Dialog
        open={addVideoOpen}
        onClose={handleCloseAddVideo}
        maxWidth="sm"
        fullWidth
      >
        <Box component="form" onSubmit={handleAddVideoSubmit}>
          <DialogTitle>Add Video</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Video name"
                value={addVideoTitle}
                onChange={(e) => {
                  setAddVideoTitle(e.target.value);
                  if (addVideoError) setAddVideoError("");
                }}
                required
                fullWidth
                slotProps={{ input: { "aria-label": "Video name" } }}
              />
              <Button
                type="button"
                variant="outlined"
                component="label"
                sx={{ mr: 1 }}
              >
                Choose video file
                <input
                  ref={addVideoFileInputRef}
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={handleAddVideoFileChange}
                />
              </Button>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: "inline" }}
              >
                {addVideoFileName ? addVideoFileName : "Choose a video file"}
              </Typography>
              {addVideoObjectUrl && (
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    Preview
                  </Typography>
                  <video
                    src={addVideoObjectUrl}
                    controls
                    autoPlay={false}
                    muted
                    loop
                    style={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      objectFit: "contain",
                      borderRadius: 1,
                      backgroundColor: "rgba(0,0,0,0.1)",
                    }}
                  />
                </Box>
              )}
              <TextField
                label="Video MIME type"
                value={addVideoMimeType}
                fullWidth
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                  htmlInput: {
                    "aria-label": "Video MIME type",
                  },
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={addVideoActive}
                    onChange={(e) => setAddVideoActive(e.target.checked)}
                    slotProps={{
                      input: { "aria-label": "Active on TV when saved" },
                    }}
                  />
                }
                label="Active on TV when saved"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={addVideoSoundEnabled}
                    onChange={(e) => setAddVideoSoundEnabled(e.target.checked)}
                    slotProps={{
                      input: { "aria-label": "Sound enabled" },
                    }}
                  />
                }
                label="Sound enabled"
              />
              {addVideoError ? (
                <Typography variant="body2" color="error">
                  {addVideoError}
                </Typography>
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={handleCloseAddVideo}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Add Video
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Daily Affirmations — manage library (TV lower band) */}
      <Card sx={{ maxWidth: 720 }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="h6">Daily Affirmations</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Library for the TV lower-band Daily affirmation. Pin holds one
              line until Unpin. Otherwise Full Display rotates enabled lines by
              the interval below. Disable keeps a row out of rotation without
              deleting it. Changes save in this browser (DEV); refresh the Full
              Display tab to see them (no live cross-tab sync yet).
            </Typography>
          </Box>

          <FormControl sx={{ maxWidth: 320 }} size="small">
            <InputLabel id="affirmation-rotate-ms-label">
              Auto-rotate interval
            </InputLabel>
            <Select
              labelId="affirmation-rotate-ms-label"
              label="Auto-rotate interval"
              value={affirmationRotateMs}
              onChange={(e) => {
                const ms = Number(e.target.value);
                if (!Number.isFinite(ms) || ms <= 0) return;
                handleAffirmationRotateMsChange(ms);
              }}
              inputProps={{ "aria-label": "Auto-rotate interval" }}
            >
              <MenuItem value={15 * 60 * 1000}>15 minutes</MenuItem>
              <MenuItem value={30 * 60 * 1000}>30 minutes</MenuItem>
              <MenuItem value={60 * 60 * 1000}>1 hour</MenuItem>
              <MenuItem value={2 * 60 * 60 * 1000}>2 hours</MenuItem>
              <MenuItem value={6 * 60 * 60 * 1000}>6 hours</MenuItem>
              <MenuItem value={12 * 60 * 60 * 1000}>12 hours</MenuItem>
            </Select>
          </FormControl>

          <Divider />

          <Box
            component="form"
            onSubmit={handleAddAffirmationSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 1 }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <TextField
                label="New affirmation"
                value={newAffirmationText}
                onChange={(e) => {
                  setNewAffirmationText(e.target.value);
                  if (addAffirmationError) {
                    setAddAffirmationError("");
                  }
                }}
                fullWidth
                slotProps={{ input: { "aria-label": "New affirmation" } }}
                sx={{ flex: "1 1 240px", minWidth: 0 }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ flex: "0 0 auto" }}
              >
                Add Affirmation
              </Button>
            </Box>
            {addAffirmationError ? (
              <Typography variant="body2" color="error">
                {addAffirmationError}
              </Typography>
            ) : null}
          </Box>

          {affirmations.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No affirmations in the library yet.
            </Typography>
          ) : (
            <Stack divider={<Divider flexItem />} spacing={0}>
              {affirmations.map((item) => (
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
                  <Box sx={{ minWidth: 0, flex: "1 1 200px" }}>
                    {editingAffirmationId === item.id ? (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <TextField
                          label="Edit affirmation"
                          value={editingAffirmationText}
                          onChange={(e) => {
                            setEditingAffirmationText(e.target.value);
                            if (editAffirmationError) {
                              setEditAffirmationError("");
                            }
                          }}
                          fullWidth
                          multiline
                          minRows={2}
                          slotProps={{
                            input: { "aria-label": "Edit affirmation" },
                          }}
                        />
                        {editAffirmationError ? (
                          <Typography variant="body2" color="error">
                            {editAffirmationError}
                          </Typography>
                        ) : null}
                      </Box>
                    ) : (
                      <>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, minWidth: 0 }}
                        >
                          {item.text}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.75,
                            mt: 0.75,
                          }}
                        >
                          <Chip
                            size="small"
                            label={item.enabled ? "Enabled" : "Disabled"}
                            color={item.enabled ? "success" : "default"}
                            variant="outlined"
                          />
                          {pinnedAffirmationId === item.id ? (
                            <Chip
                              size="small"
                              label="Pinned"
                              color="primary"
                              variant="filled"
                            />
                          ) : null}
                        </Box>
                      </>
                    )}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      flex: "0 0 auto",
                    }}
                  >
                    {editingAffirmationId === item.id ? (
                      <>
                        <Button
                          type="button"
                          size="small"
                          variant="contained"
                          onClick={handleSaveEditAffirmation}
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="small"
                          variant="text"
                          onClick={handleCancelEditAffirmation}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          size="small"
                          variant="text"
                          onClick={() =>
                            handleStartEditAffirmation(item.id, item.text)
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            handleSetAffirmationEnabled(item.id, !item.enabled)
                          }
                        >
                          {item.enabled ? "Disable" : "Enable"}
                        </Button>
                        {pinnedAffirmationId === item.id ? (
                          <Button
                            type="button"
                            size="small"
                            variant="outlined"
                            onClick={handleUnpinAffirmation}
                          >
                            Unpin
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="small"
                            variant="outlined"
                            disabled={!item.enabled}
                            onClick={() => handlePinAffirmation(item.id)}
                          >
                            Pin
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="small"
                          variant="text"
                          color="error"
                          onClick={() => handleRemoveAffirmation(item.id)}
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Announcements */}
      <Card sx={{ maxWidth: 720 }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="h6">Announcements</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Lines shown in the TV lower band. Refresh the Full Display to see
              changes.
            </Typography>
          </Box>

          <Divider />

          <Box
            component="form"
            onSubmit={handleAddAnnouncementSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 1 }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <TextField
                label="New announcement"
                value={newAnnouncementText}
                onChange={(e) => {
                  setNewAnnouncementText(e.target.value);
                  if (addAnnouncementError) {
                    setAddAnnouncementError("");
                  }
                }}
                fullWidth
                slotProps={{ input: { "aria-label": "New announcement" } }}
                sx={{ flex: "1 1 240px", minWidth: 0 }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ flex: "0 0 auto" }}
              >
                Add Announcement
              </Button>
            </Box>
            {addAnnouncementError ? (
              <Typography variant="body2" color="error">
                {addAnnouncementError}
              </Typography>
            ) : null}
          </Box>

          {announcements.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No announcements are currently displayed.
            </Typography>
          ) : (
            <Stack divider={<Divider flexItem />} spacing={0}>
              {announcements.map((announcement) => (
                <Box
                  key={announcement.id}
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                    py: 1.5,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 500, minWidth: 0, flex: "1 1 auto" }}
                  >
                    {announcement.text}
                  </Typography>
                  <Button
                    type="button"
                    size="small"
                    variant="text"
                    color="error"
                    onClick={() => handleRemoveAnnouncement(announcement.id)}
                    sx={{ flex: "0 0 auto" }}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Curfew / House Closing — Admin-only (hide if no permission) */}
      {canManageHouseCurfew ? (
        <Card sx={{ maxWidth: 720 }}>
          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Box>
              <Typography variant="h6">Curfew / House Closing</Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Weekly defaults and one date override per day. Closing stages
                (T-15 → Final Break) are derived from the effective close —
                staff never enter four closing events. End of day = 12:00 AM
                midnight on that calendar day (1440), not clock 0. Refresh Full
                Display after changes (no live cross-tab sync).
              </Typography>
            </Box>

            <Divider />

            {/* Today effective preview */}
            {(() => {
              const todayYmd = hopeNow.dateKey;
              const effective = resolveEffectiveCurfewMin({
                dateYmd: todayYmd,
                config: curfew,
              });
              const todayOvr = findCurfewOverrideForDate(
                curfew.overrides,
                todayYmd,
              );
              return (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Today&apos;s effective close
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurfewCloseLabel(effective)}
                    {todayOvr ? " (date override)" : " (weekly default)"}
                    {todayOvr?.note ? ` — ${todayOvr.note}` : ""}
                  </Typography>
                </Box>
              );
            })()}

            <Divider />

            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Weekly defaults
            </Typography>
            {curfewWeeklyError ? (
              <Typography variant="body2" color="error">
                {curfewWeeklyError}
              </Typography>
            ) : null}
            <Stack spacing={1.5}>
              {ADD_CLASS_WEEKDAY_OPTIONS.map((day) => {
                const closeMin = curfew.weekly.closeMinByWeekday[day.value];
                const endOfDay = weeklyCloseIsEndOfDay(day.value);
                return (
                  <Box
                    key={`curfew-weekly-${day.value}`}
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ width: 40, fontWeight: 600, flex: "0 0 auto" }}
                    >
                      {day.label}
                    </Typography>
                    <TextField
                      type="time"
                      size="small"
                      label="Close"
                      value={weeklyCloseTimeInputValue(day.value)}
                      disabled={endOfDay}
                      onChange={(e) =>
                        handleCurfewWeeklyTimeChange(day.value, e.target.value)
                      }
                      slotProps={{
                        inputLabel: { shrink: true },
                        htmlInput: {
                          "aria-label": `${day.label} curfew close time`,
                        },
                      }}
                      sx={{ width: 140 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={endOfDay}
                          onChange={(e) =>
                            handleCurfewWeeklyEndOfDay(
                              day.value,
                              e.target.checked,
                            )
                          }
                          slotProps={{
                            input: {
                              "aria-label": `${day.label} end of day curfew`,
                            },
                          }}
                        />
                      }
                      label="End of day (12:00 AM)"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {isValidCurfewCloseMin(closeMin)
                        ? formatCurfewCloseLabel(closeMin)
                        : "—"}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>

            <Divider />

            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Date override
            </Typography>
            <Typography variant="body2" color="text.secondary">
              One override per date. May be earlier or later than weekly. Saving
              the same date replaces the previous override.
            </Typography>

            <Box
              component="form"
              onSubmit={handleCurfewOverrideSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  gap: 1.5,
                }}
              >
                <TextField
                  type="date"
                  size="small"
                  label="Date"
                  value={curfewOverrideDate}
                  onChange={(e) => setCurfewOverrideDate(e.target.value)}
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { "aria-label": "Curfew override date" },
                  }}
                  sx={{ width: 170 }}
                />
                <TextField
                  type="time"
                  size="small"
                  label="Close"
                  value={curfewOverrideTime}
                  disabled={curfewOverrideEndOfDay}
                  onChange={(e) => setCurfewOverrideTime(e.target.value)}
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { "aria-label": "Curfew override close time" },
                  }}
                  sx={{ width: 140 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={curfewOverrideEndOfDay}
                      onChange={(e) => {
                        setCurfewOverrideEndOfDay(e.target.checked);
                        if (e.target.checked) setCurfewOverrideTime("");
                      }}
                      slotProps={{
                        input: {
                          "aria-label": "Curfew override end of day",
                        },
                      }}
                    />
                  }
                  label="End of day"
                />
              </Box>
              <TextField
                size="small"
                label="Note (optional)"
                value={curfewOverrideNote}
                onChange={(e) => setCurfewOverrideNote(e.target.value)}
                fullWidth
                slotProps={{
                  htmlInput: { "aria-label": "Curfew override note" },
                }}
              />
              {curfewOverrideError ? (
                <Typography variant="body2" color="error">
                  {curfewOverrideError}
                </Typography>
              ) : null}
              <Box>
                <Button type="submit" variant="contained" size="small">
                  Save override
                </Button>
              </Box>
            </Box>

            {curfew.overrides.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No date overrides.
              </Typography>
            ) : (
              <Stack divider={<Divider flexItem />} spacing={0}>
                {[...curfew.overrides]
                  .slice()
                  .sort((a, b) => a.dateYmd.localeCompare(b.dateYmd))
                  .map((ovr) => {
                    const wd = (() => {
                      const p = ovr.dateYmd.split("-").map(Number);
                      const u = new Date(
                        Date.UTC(
                          p[0] ?? 0,
                          (p[1] ?? 1) - 1,
                          p[2] ?? 1,
                          12,
                          0,
                          0,
                        ),
                      );
                      return u.getUTCDay() as HouseDisplayWeekday;
                    })();
                    const weeklyMin = curfew.weekly.closeMinByWeekday[wd] ?? 0;
                    const earlier =
                      isValidCurfewCloseMin(ovr.closeMin) &&
                      isValidCurfewCloseMin(weeklyMin) &&
                      ovr.closeMin < weeklyMin;
                    const later =
                      isValidCurfewCloseMin(ovr.closeMin) &&
                      isValidCurfewCloseMin(weeklyMin) &&
                      ovr.closeMin > weeklyMin;
                    return (
                      <Box
                        key={ovr.id}
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1.5,
                          py: 1.5,
                        }}
                      >
                        <Box sx={{ minWidth: 0, flex: "1 1 auto" }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {ovr.dateYmd} —{" "}
                            {formatCurfewCloseLabel(ovr.closeMin)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Weekly default: {formatCurfewCloseLabel(weeklyMin)}
                            {ovr.note ? ` · ${ovr.note}` : ""}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                              mt: 0.5,
                            }}
                          >
                            <Chip
                              size="small"
                              label="overrides weekly"
                              variant="outlined"
                            />
                            {earlier ? (
                              <Chip
                                size="small"
                                label="earlier than weekly"
                                color="warning"
                                variant="outlined"
                              />
                            ) : null}
                            {later ? (
                              <Chip
                                size="small"
                                label="later than weekly"
                                variant="outlined"
                              />
                            ) : null}
                          </Box>
                        </Box>
                        <Button
                          type="button"
                          size="small"
                          variant="text"
                          color="error"
                          onClick={() => handleClearCurfewOverride(ovr.dateYmd)}
                          sx={{ flex: "0 0 auto" }}
                        >
                          Remove
                        </Button>
                      </Box>
                    );
                  })}
              </Stack>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* System Spotlight Graphics — Admin-only (hide if no permission) */}
      {canManageSystemSpotlight ? (
        <Card sx={{ maxWidth: 720 }}>
          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <input
              ref={systemSpotlightFileInputRef}
              type="file"
              accept="image/*"
              hidden
              aria-label="Replace system Spotlight graphic"
              onChange={handleSystemSpotlightFileChange}
            />
            <Box>
              <Typography variant="h6">System Spotlight Graphics</Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                House-status art for Good Morning, Roll Call, closing stages,
                and Final Break. Admin only. File Replace uses a session blob:
                URL (not written to DEV localStorage). Stable override URLs may
                persist in DEV storage; data: is rejected. Timing is unchanged.
                Refresh Full Display after changes (no live cross-tab sync).
              </Typography>
            </Box>

            <Divider />

            <Stack divider={<Divider flexItem />} spacing={0}>
              {SYSTEM_SPOTLIGHT_MANAGE_SLOTS.map((slot) => {
                const imageUrl = getSystemSpotlightImageWithOverrides(
                  slot.assetKey,
                  systemSpotlightImageOverrides,
                );
                const hasImage =
                  typeof imageUrl === "string" && imageUrl.trim().length > 0;
                const hasOverride = Boolean(
                  systemSpotlightImageOverrides[slot.assetKey]?.trim(),
                );
                return (
                  <Box
                    key={slot.assetKey}
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 1.5,
                      py: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 96,
                        height: 54,
                        flex: "0 0 auto",
                        borderRadius: 1,
                        overflow: "hidden",
                        bgcolor: "action.hover",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {hasImage ? (
                        <Box
                          component="img"
                          src={imageUrl}
                          alt=""
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No art
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: "1 1 160px" }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {slot.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {slot.assetKey}
                        {hasOverride ? " · custom" : " · default"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                        flex: "0 0 auto",
                      }}
                    >
                      <Button
                        type="button"
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          handleSystemSpotlightReplaceClick(slot.assetKey)
                        }
                      >
                        Replace
                      </Button>
                      <Button
                        type="button"
                        size="small"
                        variant="text"
                        disabled={!hasOverride}
                        onClick={() =>
                          handleSystemSpotlightRestoreDefault(slot.assetKey)
                        }
                      >
                        Restore default
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {/* Program / Class Graphics — Admin-only (hide if no permission) */}
      {canManageProgramLogos ? (
        <Card sx={{ maxWidth: 720 }}>
          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <input
              ref={programLogoFileInputRef}
              type="file"
              accept="image/*"
              hidden
              aria-label="Replace program class graphic"
              onChange={handleProgramLogoFileChange}
            />
            <Box>
              <Typography variant="h6">Program / Class Graphics</Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Program logos for Happening Now when a class or event uses that
                Class Image key. Shared keys (for example NA) update every class
                with that key. Admin only. File Replace uses a session blob: URL
                (not written to DEV localStorage). Stable override URLs may
                persist in DEV storage; data: is rejected. Schedule still stores
                logoKey only. Refresh Full Display after changes (no live
                cross-tab sync).
              </Typography>
            </Box>

            <Divider />

            <Stack divider={<Divider flexItem />} spacing={0}>
              {PROGRAM_LOGO_MANAGE_SLOTS.map((slot) => {
                const imageUrl = getProgramLogoImageWithOverrides(
                  slot.logoKey,
                  programLogoImageOverrides,
                );
                const hasImage =
                  typeof imageUrl === "string" && imageUrl.trim().length > 0;
                const hasOverride = Boolean(
                  programLogoImageOverrides[slot.logoKey]?.trim(),
                );
                return (
                  <Box
                    key={slot.logoKey}
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 1.5,
                      py: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 96,
                        height: 54,
                        flex: "0 0 auto",
                        borderRadius: 1,
                        overflow: "hidden",
                        bgcolor: "action.hover",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {hasImage ? (
                        <Box
                          component="img"
                          src={imageUrl}
                          alt=""
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No art
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: "1 1 160px" }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {slot.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {slot.logoKey}
                        {hasOverride ? " · custom" : " · default"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                        flex: "0 0 auto",
                      }}
                    >
                      <Button
                        type="button"
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          handleProgramLogoReplaceClick(slot.logoKey)
                        }
                      >
                        Replace
                      </Button>
                      <Button
                        type="button"
                        size="small"
                        variant="text"
                        disabled={!hasOverride}
                        onClick={() =>
                          handleProgramLogoRestoreDefault(slot.logoKey)
                        }
                      >
                        Restore default
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      ) : null}

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
                label="Meeting Topic"
                value={addOneTimeMeetingTopic}
                onChange={(e) => setAddOneTimeMeetingTopic(e.target.value)}
                fullWidth
                slotProps={{
                  input: { "aria-label": "Meeting topic" },
                  htmlInput: { maxLength: 120 },
                }}
                helperText="Optional — e.g. Dealing With Triggers"
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
                label="Chair / Facilitator"
                value={addOneTimeFacilitator}
                onChange={(e) => setAddOneTimeFacilitator(e.target.value)}
                fullWidth
                slotProps={{
                  input: { "aria-label": "Chair or facilitator name" },
                }}
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
