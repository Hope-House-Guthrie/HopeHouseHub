/**
 * Daily Duties — Redux slice (FE mock)
 *
 * STATUS (branch: daily-duties) — leave 2026-08-18
 * DONE: Ph1 Morning Roll Call (display name) · Ph2 Classes · Ph3 Rooms ·
 *   Ph4 Chore Check-Off
 * DONE: Chore Library S1–5 FE mock
 *   - 28 paper chores (Chore + category); choreLibrary state
 *   - published rows: choreId + name snapshot; Check-Off marks include choreId
 *   - Library page: browse / Add / Edit / Archive (setChoreActive)
 *   - Weekly Assign: publish/remove; picker hides already-assigned (one person
 *     per choreId); multi different chores per client still OK
 * DONE: day-of-week matrix FE
 *   - [] = every day; 0=Sun…6=Sat only (never 7)
 *   - normalizeDaysOfWeek / formatDaysOfWeekLabel / WEEKDAY_SHORT
 *   - setPublishedChoreAssignmentDays syncs open Check-Off marks
 *   - seed assign-003 sample Mon/Wed/Fri [1,3,5]
 * DONE: Class Library FE (mandatoryClasses active/sortOrder; add/update/archive)
 * PARKED: disciplinary duties (separate); auto week gen; History hub;
 *   backend persist; multi-device
 * RULES: PresenceHint in|out only; duties never write Sign In/Out;
 *   Not Reported ≠ violation; no Start form (ensure by date);
 *   library edit does NOT rewrite published name / attendance snapshots
 * DISPLAY: Ph1 staff label = Morning Roll Call; internal ids stay rollCall*
 *
 * ---------------------------------------------------------------------------
 * BACKEND TODO / FUTURE INTEGRATION (do not remove):
 * - Active Clients = master roster (Intake/Discharge)
 * - Sign In/Out may supply read-only presence hints (IN / OUT)
 * - Staff Roll Call / Class Attendance must NEVER auto-write Sign In/Out
 * - Persist completed sessions; multi-device; real class catalog + rooms
 * - Room inspections = client rooms only (not house common bathrooms)
 * - Chore library + published weekly chores + daily check-off persist
 * ---------------------------------------------------------------------------
 */

import { AssignmentInd } from "@mui/icons-material";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ---------------------------------------------------------------------------
// Types — shared roster / presence
// ---------------------------------------------------------------------------

/** Draft Roll Call statuses — may change after we use the living UI */
export type RollCallStatus =
  | "unmarked"
  | "present"
  | "tardy"
  | "absent"
  | "excused"
  | "signed_out";

/**
 * Optional presence hint from Sign In/Out (read-only context).
 * Not the final Roll Call or Class Attendance decision.
 */
export type PresenceHint = "in" | "out";

/** One person on the active roster for Daily Duties */
export interface DailyDutiesClient {
  id: string;
  firstName: string;
  lastName: string;
  /** Read-only hint for staff; staff marks can disagree */
  presenceHint: PresenceHint;
}

/** One client's mark inside an open or completed roll call */
export interface RollCallMark {
  clientId: string;
  status: RollCallStatus;
}

export interface RollCallSession {
  id: string;
  /** House day YYYY-MM-DD (America/Chicago later) */
  serviceDate: string;
  /** clientId -> mark */
  marks: Record<string, RollCallMark>;
  /** open = in progress; complete = staff confirmed summary */
  sessionStatus: "open" | "complete";
  startedAt: string;
  completedAt: string;
}

// ---------------------------------------------------------------------------
// Types — mandatory class attendance (Phase 2)
// ---------------------------------------------------------------------------

/** Draft class attendance statuses — living UI may change these later */
export type ClassAttendanceStatus =
  | "unmarked"
  | "present"
  | "absent"
  | "excused";

/** One mock mandatory class (catalog editable via Class Library) */
export interface MandatoryClass {
  id: string;
  name: string;
  instructor: string;
  /** false = archived; hidden from Attendance Start picker */
  active: boolean;
  sortOrder: number;
}

/** One client's mark inside an open or completed class session */
export interface ClassAttendanceMark {
  clientId: string;
  status: ClassAttendanceStatus;
}

/**
 * One class attendance session.
 * Being in the building (SIO) does NOT prove class attendance.
 */
export interface ClassAttendanceSession {
  id: string;
  classId: string;
  className: string;
  instructor: string;
  /** House day YYYY-MM-DD */
  serviceDate: string;
  /** clientId -> mark */
  marks: Record<string, ClassAttendanceMark>;
  sessionStatus: "open" | "complete";
  startedAt: string;
  completedAt: string;
}

// ---------------------------------------------------------------------------
// Types — room inspections (Phase 3)
// ---------------------------------------------------------------------------

/** Overall result for one room in an inspection session */
export type RoomInspectionStatus =
  | "unmarked"
  | "pass"
  | "fail"
  | "needs_attention";

/** Checklist keys staff can flag during a room walk */
export type RoomInspectionItemKey =
  | "beds"
  | "floors"
  | "trash"
  | "personal_belongings"
  | "bathroom"
  | "other";

/**
 * Mock client room until facilities/backend owns rooms.
 * House common bathrooms are NOT inspection rows.
 * Most Hope House rooms are Jack & Jill (two rooms share one bath —
 * full bath or toilet+sink). Same sharedBathroomId on both rooms.
 */
export interface InspectionRoom {
  id: string;
  name: string;
  /** Client ids from dailyDuties.roster assigned to this room */
  clientIds: string[];
  /**
   * true = this room card can flag bathroom (in-room or shared Jack & Jill).
   * false = no bath tied to this room (rare in mock).
   */
  hasBathroom: boolean;
  /**
   * Jack & Jill pair key. Same id on both rooms that share the bath.
   * null = private / none (not a house common bath row).
   */
  sharedBathroomId: string | null;
}

/** One room's recorded result inside a session */
export interface RoomInspectionResult {
  roomId: string;
  status: RoomInspectionStatus;
  /** Item keys currently flagged as needing attention */
  flaggedItems: RoomInspectionItemKey[];
  /** Explains fail / needs_attention (optional on pass) */
  notes: string;
}

/**
 * One house room-inspection session for a service date.
 * Does not write Sign In/Out, Roll Call, or Class Attendance.
 */
export interface RoomInspectionSession {
  id: string;
  /** House day YYYY-MM-DD */
  serviceDate: string;
  /** roomId -> result */
  results: Record<string, RoomInspectionResult>;
  sessionStatus: "open" | "complete";
  startedAt: string;
  completedAt: string;
}

// ---------------------------------------------------------------------------
// Types — chore library (definitions; editable later via staff UI)
// ---------------------------------------------------------------------------

/**
 * House paper groups. Stable string unions for filters / future Add form.
 * Disciplinary duties are NOT in this catalog (separate later).
 */
export type ChoreCategory =
  | "kitchen_dining"
  | "hallways_common"
  | "laundry"
  | "rooms_organization"
  | "front_desk_doors"
  | "outside_porch"
  | "general_everyone";

/**
 * One reusable chore definition (library row).
 * Edit name/category here for future weeks; old assignments keep their snapshot name.
 * active=false = archive (hide from new assigns later; keep row for history links).
 */
export interface Chore {
  id: string;
  /** Full paper text / description (may include due times) */
  name: string;
  category: ChoreCategory;
  /** false = archived / not offered for new weekly assigns */
  active: boolean;
  /** Display order from paper list (1–28 starting set) */
  sortOrder: number;
}

// ---------------------------------------------------------------------------
// Types — daily chore check-off (Phase 4)
// ---------------------------------------------------------------------------

/** Per-assignment mark on a daily check-off list */
export type ChoreCheckOffStatus = "not_reported" | "completed";

/**
 * One published weekly assignment row (mock until Weekly Chore Builder).
 * House rule for mock: once assigned, chore is daily until the plan changes.
 * daysOfWeek: empty [] = every day (preferred). Optional 0=Sun … 6=Sat if ever needed.
 * Never use 7 — JS getDay is 0–6 only.
 *
 * choreId links to Chore library; choreName is a snapshot at assign time
 * so desk/history stay stable if the library name is edited later.
 */
export interface PublishedChoreAssignment {
  id: string;
  clientId: string;
  /** Library chore id (chore-lib-NNN) */
  choreId: string;
  /** Snapshot of library name at assign time (desk + history display) */
  choreName: string;
  daysOfWeek: number[];
}

/** One assignment's mark inside an open or completed daily list */
export interface ChoreCheckOffMark {
  assignmentId: string;
  clientId: string;
  /** Library id when known (from published assignment) */
  choreId: string;
  /** Snapshot name from assignment (not live library lookup) */
  choreName: string;
  status: ChoreCheckOffStatus;
}

/**
 * One desk day of chore check-off.
 * Does not write Sign In/Out or other Daily Duties sessions.
 */
export interface ChoreCheckOffSession {
  id: string;
  /** House day YYYY-MM-DD */
  serviceDate: string;
  /** assignmentId -> mark (assignments that apply that day; empty daysOfWeek = daily) */
  marks: Record<string, ChoreCheckOffMark>;
  sessionStatus: "open" | "complete";
  startedAt: string;
  completedAt: string;
}

export interface DailyDutiesState {
  /** Mock active roster until Active Clients owns this */
  roster: DailyDutiesClient[];
  /** Current open roll call, if any */
  openRollCall: RollCallSession | null;
  /** Completed roll calls (History comes later) */
  completedRollCalls: RollCallSession[];
  /** Mock class catalog until backend owns this */
  mandatoryClasses: MandatoryClass[];
  /** Current open class attendance session, if any */
  openClassAttendance: ClassAttendanceSession | null;
  /** Completed class sessions (History UI later) */
  completedClassAttendances: ClassAttendanceSession[];
  /** Mock client rooms only (no common-bath catalog rows) */
  inspectionRooms: InspectionRoom[];
  /** Current open house inspection, if any */
  openRoomInspection: RoomInspectionSession | null;
  /** Completed inspections (full History UI later) */
  completedRoomInspections: RoomInspectionSession[];
  /**
   * House chore catalog (definitions). Not the same as who is assigned this week.
   * Staff Add/Edit/Disable later; check-off still reads publishedChoreAssignments.
   */
  choreLibrary: Chore[];
  /** Mock published week plan until Weekly Chore Builder owns this */
  publishedChoreAssignments: PublishedChoreAssignment[];
  /** Current open daily chore list, if any */
  openChoreCheckOff: ChoreCheckOffSession | null;
  /** Completed daily lists (full History UI later) */
  completedChoreCheckOffs: ChoreCheckOffSession[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function clientDisplayName(c: DailyDutiesClient): string {
  return `${c.lastName}, ${c.firstName}`;
}

/** Staff-facing label for a chore library category */
export function choreCategoryLabel(category: ChoreCategory): string {
  switch (category) {
    case "kitchen_dining":
      return "Kitchen / Dining";
    case "hallways_common":
      return "Hallways / Common Areas";
    case "laundry":
      return "Laundry";
    case "rooms_organization":
      return "Rooms / Organization";
    case "front_desk_doors":
      return "Front Desk / Doors";
    case "outside_porch":
      return "Outside / Porch";
    case "general_everyone":
      return "General / Everyone";
    default:
      return category;
  }
}

/** Category sections in paper order for library UI */
export const CHORE_CATEGORY_ORDER: ChoreCategory[] = [
  "kitchen_dining",
  "hallways_common",
  "laundry",
  "rooms_organization",
  "front_desk_doors",
  "outside_porch",
  "general_everyone",
];

function todayYmdLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Local weekday 0=Sun … 6=Sat from YYYY-MM-DD (no UTC parse trap). */
export function weekdayFromYmd(ymd: string): number {
  const parts = ymd.split("-").map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  return new Date(y, m - 1, d).getDay();
}

/** Short labels 0=Sun … 6=Sat (JS getDay order). Never use day 7. */
export const WEEKDAY_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

/**
 * Normalize staff day picks:
 * - unique ints in 0–6 only
 * - sorted ascending
 * - all 7 days → [] (every-day house default)
 * - empty input → [] (every day; UI should prefer explicit All)
 */
export function normalizeDaysOfWeek(days: number[]): number[] {
  const uniq = [
    ...new Set(days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)),
  ].sort((a, b) => a - b);
  if (uniq.length === 0 || uniq.length === 7) return [];
  return uniq;
}

/** Desk label: "Every day" or "Mon, Wed, Fri" */
export function formatDaysOfWeekLabel(days: number[]): string {
  const n = normalizeDaysOfWeek(days);
  if (n.length === 0) return "Every day";
  return n.map((d) => WEEKDAY_SHORT[d]).join(", ");
}

/** True if this published assignment applies on the house calendar day. */
export function assignmentAppliesOnDay(
  a: PublishedChoreAssignment,
  ymd: string,
): boolean {
  // Empty daysOfWeek = every day (house default for assigned chores)
  if (!a.daysOfWeek.length) return true;
  return a.daysOfWeek.includes(weekdayFromYmd(ymd));
}

// ---------------------------------------------------------------------------
// Seed data (fake / local test only)
// ---------------------------------------------------------------------------

const seedRoster: DailyDutiesClient[] = [
  {
    id: "dd-001",
    firstName: "Alex",
    lastName: "Rivera",
    presenceHint: "in",
  },
  {
    id: "dd-002",
    firstName: "Jordan",
    lastName: "Lee",
    presenceHint: "in",
  },
  {
    id: "dd-003",
    firstName: "Sam",
    lastName: "Patel",
    presenceHint: "out",
  },
  {
    id: "dd-004",
    firstName: "Brent",
    lastName: "McGalliard",
    presenceHint: "in",
  },
  {
    id: "dd-005",
    firstName: "TJ",
    lastName: "Stewart",
    presenceHint: "out",
  },
  {
    id: "dd-006",
    firstName: "Elisha",
    lastName: "Baker",
    presenceHint: "in",
  },
];

const seedMandatoryClasses: MandatoryClass[] = [
  {
    id: "class-001",
    name: "Life Skills",
    instructor: "Staff A",
    active: true,
    sortOrder: 1,
  },
  {
    id: "class-002",
    name: "Relapse Prevention",
    instructor: "Staff B",
    active: true,
    sortOrder: 2,
  },
  {
    id: "class-003",
    name: "House Meeting",
    instructor: "Staff C",
    active: true,
    sortOrder: 3,
  },
];

/**
 * Client rooms only — no common/house bathroom rows.
 * Pairs share Jack & Jill baths (full or toilet+sink).
 */
const seedInspectionRooms: InspectionRoom[] = [
  {
    id: "room-101",
    name: "Room 101",
    clientIds: ["dd-001", "dd-002"],
    hasBathroom: true,
    // Jack & Jill with 102 — full bath
    sharedBathroomId: "jj-bath-a",
  },
  {
    id: "room-102",
    name: "Room 102",
    clientIds: ["dd-003"],
    hasBathroom: true,
    sharedBathroomId: "jj-bath-a",
  },
  {
    id: "room-103",
    name: "Room 103",
    clientIds: ["dd-004", "dd-005"],
    hasBathroom: true,
    // Jack & Jill with 104 — toilet + sink
    sharedBathroomId: "jj-bath-b",
  },
  {
    id: "room-104",
    name: "Room 104",
    clientIds: ["dd-006"],
    hasBathroom: true,
    sharedBathroomId: "jj-bath-b",
  },
];

/**
 * Starting house chore library from paper Weekly Chore List (names stripped of clients).
 * Not hard-coded forever — Add/Edit/Disable UI comes later.
 * Disciplinary duties intentionally omitted (separate later).
 * ids chore-lib-001 … chore-lib-028 stay stable for future assignment links.
 */
const seedChoreLibrary: Chore[] = [
  // Kitchen / Dining
  {
    id: "chore-lib-001",
    name: "Kitchen open 7:00 AM / Breakfast SLA (Service Line Area)",
    category: "kitchen_dining",
    active: true,
    sortOrder: 1,
  },
  {
    id: "chore-lib-002",
    name: "Sweep & mop main dining room by 9:30 PM",
    category: "kitchen_dining",
    active: true,
    sortOrder: 2,
  },
  {
    id: "chore-lib-003",
    name: "Sweep & mop small dining room by 9:30 PM / Clean and wipe microwave and cabinet area",
    category: "kitchen_dining",
    active: true,
    sortOrder: 3,
  },
  {
    id: "chore-lib-004",
    name: "Sweep & mop small dining room by 9:30 AM / Clean and wipe microwave and cabinet area",
    category: "kitchen_dining",
    active: true,
    sortOrder: 4,
  },
  {
    id: "chore-lib-005",
    name: "Sweep & mop main dining room by 9:30 AM / Clean and wipe microwave and cabinet area",
    category: "kitchen_dining",
    active: true,
    sortOrder: 5,
  },
  {
    id: "chore-lib-006",
    name: "Morning dishes by 9:30 AM",
    category: "kitchen_dining",
    active: true,
    sortOrder: 6,
  },
  {
    id: "chore-lib-007",
    name: "Afternoon dishes by 1:00 PM & SLA area (Service Line Area)",
    category: "kitchen_dining",
    active: true,
    sortOrder: 7,
  },
  {
    id: "chore-lib-008",
    name: "Kitchen close down (SLA, sweep/mop, trash) by 6:30 PM",
    category: "kitchen_dining",
    active: true,
    sortOrder: 8,
  },
  {
    id: "chore-lib-009",
    name: "Clean coffee maker & decanters daily",
    category: "kitchen_dining",
    active: true,
    sortOrder: 9,
  },
  {
    id: "chore-lib-010",
    name: "Dinner server",
    category: "kitchen_dining",
    active: true,
    sortOrder: 10,
  },
  {
    id: "chore-lib-011",
    name: "Wipe tables after lunch & dinner",
    category: "kitchen_dining",
    active: true,
    sortOrder: 11,
  },
  // Hallways / Common Areas
  {
    id: "chore-lib-012",
    name: "Sweep & mop living room by 9:30 PM",
    category: "hallways_common",
    active: true,
    sortOrder: 12,
  },
  {
    id: "chore-lib-013",
    name: "West hall sweep & mop by 9:30 PM",
    category: "hallways_common",
    active: true,
    sortOrder: 13,
  },
  {
    id: "chore-lib-014",
    name: "East hall sweep & mop by 9:30 PM",
    category: "hallways_common",
    active: true,
    sortOrder: 14,
  },
  {
    id: "chore-lib-015",
    name: "South hall sweep & mop by 9:30 PM",
    category: "hallways_common",
    active: true,
    sortOrder: 15,
  },
  {
    id: "chore-lib-016",
    name: "Sweep & mop front lobby by 9:30 PM",
    category: "hallways_common",
    active: true,
    sortOrder: 16,
  },
  // Laundry
  {
    id: "chore-lib-017",
    name: "West laundry room sweep & mop daily",
    category: "laundry",
    active: true,
    sortOrder: 17,
  },
  {
    id: "chore-lib-018",
    name: "East laundry room sweep & mop daily",
    category: "laundry",
    active: true,
    sortOrder: 18,
  },
  // Rooms / Organization
  {
    id: "chore-lib-019",
    name: "Clean & organize baby room daily",
    category: "rooms_organization",
    active: true,
    sortOrder: 19,
  },
  {
    id: "chore-lib-020",
    name: "Clothing room: organize & process weekly",
    category: "rooms_organization",
    active: true,
    sortOrder: 20,
  },
  {
    id: "chore-lib-021",
    name: "Guest bathroom daily — make sure there is toilet paper & paper towels",
    category: "rooms_organization",
    active: true,
    sortOrder: 21,
  },
  // Front Desk / Doors
  {
    id: "chore-lib-022",
    name: "Help Desk / Sweep & mop & dust daily by 9:30 PM",
    category: "front_desk_doors",
    active: true,
    sortOrder: 22,
  },
  {
    id: "chore-lib-023",
    name: "Front & back door windows by 9:30 AM & 9:30 PM",
    category: "front_desk_doors",
    active: true,
    sortOrder: 23,
  },
  // Outside / Porch
  {
    id: "chore-lib-024",
    name: "Empty butt cans; wipe down tables — Front Porch",
    category: "outside_porch",
    active: true,
    sortOrder: 24,
  },
  {
    id: "chore-lib-025",
    name: "Empty butt cans; wipe down tables — Back Porch",
    category: "outside_porch",
    active: true,
    sortOrder: 25,
  },
  // General / Everyone
  {
    id: "chore-lib-026",
    name: "Empty all trash inside/outside",
    category: "general_everyone",
    active: true,
    sortOrder: 26,
  },
  {
    id: "chore-lib-027",
    name: "Everyone cleans their microwaves and toaster",
    category: "general_everyone",
    active: true,
    sortOrder: 27,
  },
  {
    id: "chore-lib-028",
    name: "Clean up after yourself and your children",
    category: "general_everyone",
    active: true,
    sortOrder: 28,
  },
];

/**
 * Mock "already published" week — links to chore library (choreId + name snapshot).
 * Only roster ids dd-001 … dd-006. Some clients have 2 chores (multi independent).
 * Default mock rows: daysOfWeek []. One sample (assign-003) is Mon/Wed/Fri.
 * Not the full 28 — desk mock sample until Weekly Builder assigns for real.
 * choreName must match library name at seed time (snapshot, not live join).
 */
const seedPublishedChoreAssignments: PublishedChoreAssignment[] = [
  {
    id: "assign-001",
    clientId: "dd-001",
    choreId: "chore-lib-001",
    choreName: "Kitchen open 7:00 AM / Breakfast SLA (Service Line Area)",
    daysOfWeek: [],
  },
  {
    id: "assign-002",
    clientId: "dd-001",
    choreId: "chore-lib-006",
    choreName: "Morning dishes by 9:30 AM",
    daysOfWeek: [],
  },
  {
    id: "assign-003",
    clientId: "dd-002",
    choreId: "chore-lib-007",
    choreName: "Afternoon dishes by 1:00 PM & SLA area (Service Line Area)",
    daysOfWeek: [1, 3, 5],
  },
  {
    id: "assign-004",
    clientId: "dd-003",
    choreId: "chore-lib-013",
    choreName: "West hall sweep & mop by 9:30 PM",
    daysOfWeek: [],
  },
  {
    id: "assign-005",
    clientId: "dd-003",
    choreId: "chore-lib-014",
    choreName: "East hall sweep & mop by 9:30 PM",
    daysOfWeek: [],
  },
  {
    id: "assign-006",
    clientId: "dd-004",
    choreId: "chore-lib-017",
    choreName: "West laundry room sweep & mop daily",
    daysOfWeek: [],
  },
  {
    id: "assign-007",
    clientId: "dd-005",
    choreId: "chore-lib-012",
    choreName: "Sweep & mop living room by 9:30 PM",
    daysOfWeek: [],
  },
  {
    id: "assign-008",
    clientId: "dd-006",
    choreId: "chore-lib-024",
    choreName: "Empty butt cans; wipe down tables — Front Porch",
    daysOfWeek: [],
  },
  {
    id: "assign-009",
    clientId: "dd-006",
    choreId: "chore-lib-021",
    choreName:
      "Guest bathroom daily — make sure there is toilet paper & paper towels",
    daysOfWeek: [],
  },
];

const initialState: DailyDutiesState = {
  roster: seedRoster,
  openRollCall: null,
  completedRollCalls: [],
  mandatoryClasses: seedMandatoryClasses,
  openClassAttendance: null,
  completedClassAttendances: [],
  inspectionRooms: seedInspectionRooms,
  openRoomInspection: null,
  completedRoomInspections: [],
  choreLibrary: seedChoreLibrary,
  publishedChoreAssignments: seedPublishedChoreAssignments,
  openChoreCheckOff: null,
  completedChoreCheckOffs: [],
};

/** Build not_reported marks for published assignments that apply on ymd. */
function buildChoreMarksForDate(
  assignments: PublishedChoreAssignment[],
  ymd: string,
): Record<string, ChoreCheckOffMark> {
  const marks: Record<string, ChoreCheckOffMark> = {};
  for (const a of assignments) {
    if (!assignmentAppliesOnDay(a, ymd)) continue;
    marks[a.id] = {
      assignmentId: a.id,
      clientId: a.clientId,
      choreId: a.choreId,
      choreName: a.choreName,
      status: "not_reported",
    };
  }
  return marks;
}

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

export const dailyDutiesSlice = createSlice({
  name: "dailyDuties",
  initialState,
  reducers: {
    /**
     * Start a new open roll call from current roster.
     * All marks begin unmarked. Does not touch Sign In/Out.
     */
    startRollCall: (state) => {
      if (state.openRollCall) return;

      const marks: Record<string, RollCallMark> = {};
      for (const c of state.roster) {
        marks[c.id] = { clientId: c.id, status: "unmarked" };
      }

      state.openRollCall = {
        id: crypto.randomUUID(),
        serviceDate: todayYmdLocal(),
        marks,
        sessionStatus: "open",
        startedAt: new Date().toISOString(),
        completedAt: "",
      };
    },

    /** Set one client's Roll Call status (staff override of any hint). */
    setRollCallStatus: (
      state,
      action: PayloadAction<{ clientId: string; status: RollCallStatus }>,
    ) => {
      const session = state.openRollCall;
      if (!session || session.sessionStatus !== "open") return;
      const row = session.marks[action.payload.clientId];
      if (!row) return;
      row.status = action.payload.status;
    },

    /**
     * Confirm and close the open roll call after staff review.
     * Keeps a copy in completedRollCalls. Does not write Sign In/Out.
     */
    completeRollCall: (state) => {
      const session = state.openRollCall;
      if (!session || session.sessionStatus !== "open") return;

      session.sessionStatus = "complete";
      session.completedAt = new Date().toISOString();
      state.completedRollCalls.unshift({
        ...session,
        marks: { ...session.marks },
      });
      state.openRollCall = null;
    },

    /** Drop the open roll call without saving (start over). */
    discardOpenRollCall: (state) => {
      state.openRollCall = null;
    },

    /**
     * Start class attendance for one class + date.
     * Full mock roster for v1. Does not touch Sign In/Out.
     */
    startClassAttendance: (
      state,
      action: PayloadAction<{ classId: string; serviceDate: string }>,
    ) => {
      if (state.openClassAttendance) return;

      const cls = state.mandatoryClasses.find(
        (c) => c.id === action.payload.classId,
      );
      if (!cls || !cls.active) return;

      const date = action.payload.serviceDate.trim();
      if (!date) return;

      const marks: Record<string, ClassAttendanceMark> = {};
      for (const client of state.roster) {
        marks[client.id] = { clientId: client.id, status: "unmarked" };
      }

      state.openClassAttendance = {
        id: crypto.randomUUID(),
        classId: cls.id,
        className: cls.name,
        instructor: cls.instructor,
        serviceDate: date,
        marks,
        sessionStatus: "open",
        startedAt: new Date().toISOString(),
        completedAt: "",
      };
    },

    /** Set one client's class attendance status (staff decision). */
    setClassAttendanceStatus: (
      state,
      action: PayloadAction<{
        clientId: string;
        status: ClassAttendanceStatus;
      }>,
    ) => {
      const session = state.openClassAttendance;
      if (!session || session.sessionStatus !== "open") return;
      const row = session.marks[action.payload.clientId];
      if (!row) return;
      row.status = action.payload.status;
    },

    /** Bulk: mark everyone present; staff fixes exceptions after. */
    markAllClassPresent: (state) => {
      const session = state.openClassAttendance;
      if (!session || session.sessionStatus !== "open") return;
      for (const clientId of Object.keys(session.marks)) {
        const row = session.marks[clientId];
        if (!row) continue;
        row.status = "present";
      }
    },

    /**
     * Confirm and close open class attendance after review.
     * Does not write Sign In/Out.
     */
    completeClassAttendance: (state) => {
      const session = state.openClassAttendance;
      if (!session || session.sessionStatus !== "open") return;

      session.sessionStatus = "complete";
      session.completedAt = new Date().toISOString();
      state.completedClassAttendances.unshift({
        ...session,
        marks: { ...session.marks },
      });
      state.openClassAttendance = null;
    },

    /** Drop open class session without saving. */
    discardOpenClassAttendance: (state) => {
      state.openClassAttendance = null;
    },

    /**
     * Start a house room-inspection session for a service date.
     * One result shell per client room. Does not touch SIO / Roll Call / Class.
     */
    startRoomInspection: (
      state,
      action: PayloadAction<{ serviceDate: string }>,
    ) => {
      if (state.openRoomInspection) return;

      const date = action.payload.serviceDate.trim();
      if (!date) return;

      const results: Record<string, RoomInspectionResult> = {};
      for (const room of state.inspectionRooms) {
        results[room.id] = {
          roomId: room.id,
          status: "unmarked",
          flaggedItems: [],
          notes: "",
        };
      }

      state.openRoomInspection = {
        id: crypto.randomUUID(),
        serviceDate: date,
        results,
        sessionStatus: "open",
        startedAt: new Date().toISOString(),
        completedAt: "",
      };
    },

    /**
     * Set overall room status. Fail / needs_attention require non-empty notes.
     */
    setRoomInspectionStatus: (
      state,
      action: PayloadAction<{
        roomId: string;
        status: RoomInspectionStatus;
      }>,
    ) => {
      const session = state.openRoomInspection;
      if (!session || session.sessionStatus !== "open") return;

      const row = session.results[action.payload.roomId];
      if (!row) return;

      const next = action.payload.status;
      if (
        (next === "fail" || next === "needs_attention") &&
        !row.notes.trim()
      ) {
        return;
      }

      row.status = next;
    },

    setRoomInspectionNotes: (
      state,
      action: PayloadAction<{ roomId: string; notes: string }>,
    ) => {
      const session = state.openRoomInspection;
      if (!session || session.sessionStatus !== "open") return;

      const row = session.results[action.payload.roomId];
      if (!row) return;

      row.notes = action.payload.notes;
    },

    /**
     * Toggle a checklist item on a room.
     * Bathroom ignored if room.hasBathroom is false.
     */
    toggleRoomInspectionItem: (
      state,
      action: PayloadAction<{
        roomId: string;
        item: RoomInspectionItemKey;
      }>,
    ) => {
      const session = state.openRoomInspection;
      if (!session || session.sessionStatus !== "open") return;

      const room = state.inspectionRooms.find(
        (r) => r.id === action.payload.roomId,
      );
      if (!room) return;
      if (action.payload.item === "bathroom" && !room.hasBathroom) return;

      const row = session.results[action.payload.roomId];
      if (!row) return;

      const item = action.payload.item;
      const idx = row.flaggedItems.indexOf(item);
      if (idx >= 0) {
        row.flaggedItems.splice(idx, 1);
      } else {
        row.flaggedItems.push(item);
      }
    },

    /**
     * Confirm and close open inspection. Does not write SIO.
     */
    completeRoomInspection: (state) => {
      const session = state.openRoomInspection;
      if (!session || session.sessionStatus !== "open") return;

      session.sessionStatus = "complete";
      session.completedAt = new Date().toISOString();
      state.completedRoomInspections.unshift({
        ...session,
        results: { ...session.results },
      });
      state.openRoomInspection = null;
    },

    /** Drop open inspection without saving. */
    discardOpenRoomInspection: (state) => {
      state.openRoomInspection = null;
    },

    // -------------------------------------------------------------------------
    // Phase 4 — daily chore check-off (does not write SIO / other DD sessions)
    // -------------------------------------------------------------------------

    /**
     * Primary open path (no Start UI).
     * Same date open → no-op. Other-date open → auto-save to completed, then open new.
     * No open → create open list for date from published assignments.
     */
    ensureChoreCheckOffForDate: (
      state,
      action: PayloadAction<{ serviceDate: string }>,
    ) => {
      const date = action.payload.serviceDate.trim();
      if (!date) return;

      const open = state.openChoreCheckOff;
      if (open && open.sessionStatus === "open" && open.serviceDate === date) {
        return;
      }

      // Switching days: keep partial Not Reported as completed history signal
      if (open && open.sessionStatus === "open") {
        open.sessionStatus = "complete";
        open.completedAt = new Date().toISOString();
        state.completedChoreCheckOffs.unshift({
          ...open,
          marks: { ...open.marks },
        });
        state.openChoreCheckOff = null;
      }

      state.openChoreCheckOff = {
        id: crypto.randomUUID(),
        serviceDate: date,
        marks: buildChoreMarksForDate(state.publishedChoreAssignments, date),
        sessionStatus: "open",
        startedAt: new Date().toISOString(),
        completedAt: "",
      };
    },

    /**
     * Secondary: "Work this day again" after Save day (open is null).
     * No-op if an open list already exists.
     */
    startChoreCheckOff: (
      state,
      action: PayloadAction<{ serviceDate: string }>,
    ) => {
      if (state.openChoreCheckOff) return;

      const date = action.payload.serviceDate.trim();
      if (!date) return;

      state.openChoreCheckOff = {
        id: crypto.randomUUID(),
        serviceDate: date,
        marks: buildChoreMarksForDate(state.publishedChoreAssignments, date),
        sessionStatus: "open",
        startedAt: new Date().toISOString(),
        completedAt: "",
      };
    },

    /** Set one assignment Completed or Not Reported (independent of other chores). */
    setChoreCheckOffStatus: (
      state,
      action: PayloadAction<{
        assignmentId: string;
        status: ChoreCheckOffStatus;
      }>,
    ) => {
      const session = state.openChoreCheckOff;
      if (!session || session.sessionStatus !== "open") return;

      const row = session.marks[action.payload.assignmentId];
      if (!row) return;

      row.status = action.payload.status;
    },

    /** Bulk: every open mark → completed. */
    markAllChoresCompleted: (state) => {
      const session = state.openChoreCheckOff;
      if (!session || session.sessionStatus !== "open") return;

      for (const assignmentId of Object.keys(session.marks)) {
        const row = session.marks[assignmentId];
        if (!row) continue;
        row.status = "completed";
      }
    },

    /**
     * Save day to history. Allowed with leftover not_reported (who did not report).
     * Does not write Sign In/Out.
     */
    completeChoreCheckOff: (state) => {
      const session = state.openChoreCheckOff;
      if (!session || session.sessionStatus !== "open") return;

      session.sessionStatus = "complete";
      session.completedAt = new Date().toISOString();
      state.completedChoreCheckOffs.unshift({
        ...session,
        marks: { ...session.marks },
      });
      state.openChoreCheckOff = null;
    },

    /**
     * Reset today's checks: same date + assignment set, all back to not_reported.
     */
    resetOpenChoreCheckOff: (state) => {
      const session = state.openChoreCheckOff;
      if (!session || session.sessionStatus !== "open") return;

      session.marks = buildChoreMarksForDate(
        state.publishedChoreAssignments,
        session.serviceDate,
      );
    },

    // -------------------------------------------------------------------------
    // Chore library CRUD (definitions only — not disciplinary)
    // -------------------------------------------------------------------------

    /** Add a new active library chore (FE mock). */
    addChore: (
      state,
      action: PayloadAction<{
        name: string;
        category: ChoreCategory;
        sortOrder?: number;
      }>,
    ) => {
      const name = action.payload.name.trim();
      if (!name) return;

      const maxOrder = state.choreLibrary.reduce(
        (m, c) => Math.max(m, c.sortOrder),
        0,
      );
      const sortOrder =
        typeof action.payload.sortOrder === "number"
          ? action.payload.sortOrder
          : maxOrder + 1;

      state.choreLibrary.push({
        id: `chore-lib-${crypto.randomUUID()}`,
        name,
        category: action.payload.category,
        active: true,
        sortOrder,
      });
    },

    /**
     * Edit library name/category/sortOrder.
     * Does NOT rewrite published assignment snapshots (history stability).
     */
    updateChore: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        category: ChoreCategory;
        sortOrder: number;
      }>,
    ) => {
      const row = state.choreLibrary.find((c) => c.id === action.payload.id);
      if (!row) return;
      const name = action.payload.name.trim();
      if (!name) return;
      row.name = name;
      row.category = action.payload.category;
      row.sortOrder = action.payload.sortOrder;
    },

    /**
     * Archive / restore. inactive = hidden from new weekly assigns.
     * Prefer this over hard delete so old assignment choreIds still resolve.
     */
    setChoreActive: (
      state,
      action: PayloadAction<{ id: string; active: boolean }>,
    ) => {
      const row = state.choreLibrary.find((c) => c.id === action.payload.id);
      if (!row) return;
      row.active = action.payload.active;
    },

    // -------------------------------------------------------------------------
    // Class library CRUD (definitions only — attendance snapshots separate)
    // -------------------------------------------------------------------------

    /** Add a new active mandatory class (FE mock). */
    addMandatoryClass: (
      state,
      action: PayloadAction<{
        name: string;
        instructor?: string;
        sortOrder?: number;
      }>,
    ) => {
      const name = action.payload.name.trim();
      if (!name) return;

      const maxOrder = state.mandatoryClasses.reduce(
        (m, c) => Math.max(m, c.sortOrder),
        0,
      );
      const sortOrder =
        typeof action.payload.sortOrder === "number"
          ? action.payload.sortOrder
          : maxOrder + 1;

      state.mandatoryClasses.push({
        id: `class-${crypto.randomUUID()}`,
        name,
        instructor: (action.payload.instructor ?? "").trim(),
        active: true,
        sortOrder,
      });
    },

    /**
     * Edit catalog name/instructor/sortOrder.
     * Does NOT rewrite open/completed attendance session snapshots.
     */
    updateMandatoryClass: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        instructor: string;
        sortOrder: number;
      }>,
    ) => {
      const row = state.mandatoryClasses.find(
        (c) => c.id === action.payload.id,
      );
      if (!row) return;
      const name = action.payload.name.trim();
      if (!name) return;
      row.name = name;
      row.instructor = action.payload.instructor.trim();
      row.sortOrder = action.payload.sortOrder;
    },

    /**
     * Archive / restore. inactive = hidden from Attendance Start picker.
     * Open attendance sessions are left alone until complete/discard.
     */
    setMandatoryClassActive: (
      state,
      action: PayloadAction<{ id: string; active: boolean }>,
    ) => {
      const row = state.mandatoryClasses.find(
        (c) => c.id === action.payload.id,
      );
      if (!row) return;
      row.active = action.payload.active;
    },

    // -------------------------------------------------------------------------
    // Published weekly assignments (who has which library chore)
    // -------------------------------------------------------------------------

    /**
     * Assign an active library chore to a roster client.
     * Snapshots choreName at assign time. daysOfWeek defaults to every day [].
     * If a desk check-off is open for a day that applies, adds a not_reported mark.
     */
    addPublishedChoreAssignment: (
      state,
      action: PayloadAction<{
        clientId: string;
        choreId: string;
        daysOfWeek?: number[];
      }>,
    ) => {
      const clientId = action.payload.clientId.trim();
      const choreId = action.payload.choreId.trim();
      if (!clientId || !choreId) return;

      const client = state.roster.find((c) => c.id === clientId);
      if (!client) return;

      const chore = state.choreLibrary.find((c) => c.id === choreId);
      if (!chore || !chore.active) return;

      // One person per library chore on the published week (any client).
      // Multi-chore clients still OK via different choreIds.
      const alreadyTaken = state.publishedChoreAssignments.some(
        (a) => a.choreId === choreId,
      );
      if (alreadyTaken) return;

      const daysOfWeek = action.payload.daysOfWeek ?? [];
      const assignment: PublishedChoreAssignment = {
        id: `assign-${crypto.randomUUID()}`,
        clientId,
        choreId: chore.id,
        choreName: chore.name,
        daysOfWeek,
      };
      state.publishedChoreAssignments.push(assignment);

      const open = state.openChoreCheckOff;
      if (
        open &&
        open.sessionStatus === "open" &&
        assignmentAppliesOnDay(assignment, open.serviceDate)
      ) {
        open.marks[assignment.id] = {
          assignmentId: assignment.id,
          clientId: assignment.clientId,
          choreId: assignment.choreId,
          choreName: assignment.choreName,
          status: "not_reported",
        };
      }
    },

    /**
     * Remove one published assignment. Drops open check-off mark if present.
     * Does not delete the library chore definition.
     */
    removePublishedChoreAssignment: (
      state,
      action: PayloadAction<{ assignmentId: string }>,
    ) => {
      const id = action.payload.assignmentId;
      state.publishedChoreAssignments = state.publishedChoreAssignments.filter(
        (a) => a.id !== id,
      );
      const open = state.openChoreCheckOff;
      if (open && open.marks[id]) {
        delete open.marks[id];
      }
    },

    /**
     * Set which weekdays a published assignment runs.
     * normalizeDaysOfWeek: [] = every day; 0=Sun … 6=Sat only.
     * Sync open check-off: add not_reported if day applies; drop mark if not.
     * Does not rewrite completed check-off history. Never touches SIO.
     */
    setPublishedChoreAssignmentDays: (
      state,
      action: PayloadAction<{ assignmentId: string; daysOfWeek: number[] }>,
    ) => {
      const row = state.publishedChoreAssignments.find(
        (a) => a.id === action.payload.assignmentId,
      );
      if (!row) return;

      row.daysOfWeek = normalizeDaysOfWeek(action.payload.daysOfWeek);

      const open = state.openChoreCheckOff;
      if (!open || open.sessionStatus !== "open") return;

      if (assignmentAppliesOnDay(row, open.serviceDate)) {
        if (!open.marks[row.id]) {
          open.marks[row.id] = {
            assignmentId: row.id,
            clientId: row.clientId,
            choreId: row.choreId,
            choreName: row.choreName,
            status: "not_reported",
          };
        }
      } else if (open.marks[row.id]) {
        delete open.marks[row.id];
      }
    },
  },
});

export const {
  startRollCall,
  setRollCallStatus,
  completeRollCall,
  discardOpenRollCall,
  startClassAttendance,
  setClassAttendanceStatus,
  markAllClassPresent,
  completeClassAttendance,
  discardOpenClassAttendance,
  startRoomInspection,
  setRoomInspectionStatus,
  setRoomInspectionNotes,
  toggleRoomInspectionItem,
  completeRoomInspection,
  discardOpenRoomInspection,
  ensureChoreCheckOffForDate,
  startChoreCheckOff,
  setChoreCheckOffStatus,
  markAllChoresCompleted,
  completeChoreCheckOff,
  resetOpenChoreCheckOff,
  addChore,
  updateChore,
  setChoreActive,
  addMandatoryClass,
  updateMandatoryClass,
  setMandatoryClassActive,
  addPublishedChoreAssignment,
  removePublishedChoreAssignment,
  setPublishedChoreAssignmentDays,
} = dailyDutiesSlice.actions;

export default dailyDutiesSlice.reducer;
