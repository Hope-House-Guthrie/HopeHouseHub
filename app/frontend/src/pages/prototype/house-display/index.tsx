/**
 * STATUS — House Display TV (live time + NOW + Spotlight + resolved agenda)
 * Branch: feature/house-display
 *
 * DONE:
 * - Full viewport, no Hub chrome (/house-display)
 * - Region shell: header, agenda, upcoming, lower band
 * - Proportional day-planner timeline (startMin/endMin → top/height %)
 * - Title-only blocks; hour ticks; canceled + live event states
 * - Agenda items = resolved TODAY from schedule sources (not hand-seeded a1–a5)
 * - House Spotlight right ~40%: card | flyer; pin priority; contain flyer
 * - Live America/Chicago clock/date via useHopeHouseNow (minute + visibility)
 * - NOW line on schedule (hidden outside day window); label in time gutter
 * - Spotlight auto-rotation every 15s (local index; pin pauses)
 * - Spotlight soft slide + crossfade ~750ms (dual local layers; ±30px; TV only)
 * - Overlap column layout for simultaneous events
 * - Daily Affirmation lower band: selectAffirmationText (pin → enabled rotate)
 *   + legacy affirmationText fallback when enabled pool empty; hopeNow tick
 * - Curfew Ph0–2: pure config/stages/phase; window end includes Final Break hour;
 *   derived closing agenda (system); Roll Call system (no class takeover);
 *   timeline paints only current closing stage as hairline (real times)
 * - Curfew Ph3 (revised): system Spotlight takeover (Roll Call + closing phases +
 *   Final Break + House Closed) with image registry + placeholder fallback;
 *   priority system > class/event > normal rotation; no full-width status banner
 * - System Spotlight Graphics: resolveSystemSpotlightState imageOverrides from
 *   content.systemSpotlightImageOverrides (Manage Replace/Restore; DEV LS may keep
 *   stable URLs only — blob:/data: session-only)
 * - Program / Class Graphics: active-event logos via getProgramLogoImageWithOverrides
 *   + content.programLogoImageOverrides (catalog defaults; Admin Manage overrides)
 * - Curfew Manage wire (Ph7, 2026-08-30): timelineWindowForDate + resolveClosingPhase +
 *   resolveSystemSpotlightState use content.curfew (not SEED); refresh after Manage
 * - Curfew Manage Ph1–7 COMPLETE (manage browser QA passed 2026-08-30)
 * - UP NEXT from live agendaItems + hopeNow.nowMin (max 3; canceled out;
 *   recurring/one-time/Roll Call/closing eligible; happening excluded;
 *   empty copy when none left; dead upcomingItems seed removed)
 * - Announcements: fixed region; static when fit; overflow → seamless
 *   bottom→top roll (duplicate list + gap; speed from content height)
 *
 * NOT YET:
 * - Weather API (header still uses seed weatherText)
 * - Spotlight manage forms / upload / backend (class/event Spotlight track)
 * - Fallback right-rail when Spotlight empty
 * - Half-hour ticks / themes
 * - Schedule day rollover from backend
 * - Affirmation / system / program graphics / curfew live cross-tab rehydrate (refresh after Manage)
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Box, keyframes, Typography, useMediaQuery } from "@mui/material";
import type { RootState } from "@/store";
import type {
  HouseDisplayEventVisualState,
  HouseDisplayAgendaItem,
  HouseDisplayAnnouncement,
} from "@/features/prototype/house-display/types";
import type { HouseDisplaySpotlightItem } from "@/features/prototype/house-display/types";

import {
  hourMarks,
  layoutAgendaItems,
  layoutClosingStageMarkers,
  nowLineLayout,
  resolveEventVisualState,
} from "@/features/prototype/house-display/timeline";
// Relative path: new helper file (HMR sometimes fails @/ resolve until full restart)
import {
  clampSpotlightRotateIndex,
  getActiveSpotlightItems,
  selectSpotlightItem,
  shouldRunSpotlightRotation,
  SPOTLIGHT_ROTATE_MS,
} from "@/features/prototype/house-display/spotlight";
import { selectAffirmationText } from "@/features/prototype/house-display/affirmations";
import {
  selectBirthdayView,
  type HouseDisplayBirthdayListItem,
} from "@/features/prototype/house-display/birthdays";
import { MOCK_HOUSE_DISPLAY_BIRTHDAY_PEOPLE } from "@/features/prototype/house-display/birthdayMock";
import {
  timelineWindowForDate,
  isSpotlightTakeoverAgendaItem,
  resolveClosingPhase,
  type HouseDisplayClosingPhase,
  type HouseDisplayClosingStageId,
} from "@/features/prototype/house-display/curfew";
import {
  resolveSystemSpotlightState,
  type SystemSpotlightState,
} from "@/features/prototype/house-display/systemSpotlight";
import { useHopeHouseNow } from "@/features/prototype/house-display/useHopeHouseNow";
// Program logos: catalog defaults + Admin overrides (content.programLogoImageOverrides).
import { getProgramLogoImageWithOverrides } from "@/features/prototype/house-display/programLogos";

/* ---- Agenda card content (centered single line) ----
 * Full-width: "Class Name | Location | Facilitator" (omit empty parts).
 * Narrow overlap (~half): "Class Name | Location"
 * Very narrow (~third+): Class Name only
 * No "Location:" / "Facilitator:" labels. Canceled chrome stays separate.
 */
/** widthPct at or below this → drop facilitator from the pipe line. */
const AGENDA_NARROW_WIDTH_PCT = 50;
/** widthPct at or below this → title only. */
const AGENDA_VERY_NARROW_WIDTH_PCT = 34;

/**
 * Shared TV section eyebrows (Today's schedule / Up next / Daily affirmation /
 * Announcements). Soft teal + tracking so regions share one label language.
 * Layout-only extras (mb, flex) stay on each call site.
 */
const SECTION_EYEBROW_SX = {
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color: "rgba(94, 234, 212, 0.9)",
  fontSize: "clamp(0.75rem, 1.2vw, 1.05rem)",
  lineHeight: 1.2,
  opacity: 1,
};

/**
 * Single centered schedule-block line for room-scale TV reading.
 * Parts join with " | " — never includes Location:/Facilitator: labels.
 */
function formatAgendaBlockLine(
  title: string,
  location: string | undefined,
  facilitator: string | undefined,
  widthPct: number,
): string {
  const name = title.trim() || "(Untitled)";
  const loc = location?.trim() ?? "";
  const fac = facilitator?.trim() ?? "";

  if (widthPct <= AGENDA_VERY_NARROW_WIDTH_PCT) {
    return name;
  }

  const parts: string[] = [name];
  if (loc) parts.push(loc);
  if (widthPct > AGENDA_NARROW_WIDTH_PCT && fac) {
    parts.push(fac);
  }
  return parts.join(" | ");
}

/**
 * Format an event start/end range into a human time label, e.g. "1:00 PM – 2:00 PM".
 */
function formatTimeRange(startMin: number, endMin: number): string {
  const fmt = (m: number) => {
    const h = Math.floor(m / 60);
    const mi = m % 60;
    const ampm = h < 12 ? "AM" : "PM";
    const hh = ((h + 11) % 12) + 1;
    return `${hh}:${mi.toString().padStart(2, "0")} ${ampm}`;
  };
  return `${fmt(startMin)} – ${fmt(endMin)}`;
}

/**
 * Derive currently-happening events from the SAME resolved agenda the schedule
 * uses (agendaItemsForToday), so the Spotlight takeover shares one source of
 * truth — recurring + one-time events both flow through, and cancellations/
 * suppressions are already excluded from the resolved agenda.
 *
 * System rows (Roll Call, closing stages) never enter takeover.
 * Time-boundary rule matches the schedule exactly: startMin <= nowMin < endMin.
 */
function useActiveEvents(
  agendaItems: HouseDisplayAgendaItem[],
  nowMin: number,
): HouseDisplayAgendaItem[] {
  return useMemo(
    () =>
      agendaItems.filter(
        (it) =>
          isSpotlightTakeoverAgendaItem(it) &&
          it.startMin <= nowMin &&
          nowMin < it.endMin,
      ),
    [agendaItems, nowMin],
  );
}

/** A normalized slide for the Spotlight region. */
type SpotlightSlide =
  | { kind: "spotlight"; id: string; item: HouseDisplaySpotlightItem }
  | { kind: "activeEvent"; id: string; event: HouseDisplayAgendaItem }
  | { kind: "system"; id: string; system: SystemSpotlightState };

/* ---- Active-event Spotlight logos ----
 * logoKey → effective art via programLogos.getProgramLogoImageWithOverrides
 * (bundled default + content.programLogoImageOverrides).
 * Keys live on schedule sources (never title-inferred). Shared programs
 * reuse one key (e.g. Men's/Women's/Main NA → "na").
 * Unknown/absent key = text-only Happening Now.
 */

function formatMinutesAsTime(totalMinutes: number): string {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hours12 = hours24 % 12 || 12;
  const period = hours24 >= 12 ? "PM" : "AM";

  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/** Resolve a logo asset URL for an agenda item, or undefined for text-only. */
function activeEventLogoSrc(
  ev: HouseDisplayAgendaItem,
  overrides?: Parameters<typeof getProgramLogoImageWithOverrides>[1],
): string | undefined {
  const url = getProgramLogoImageWithOverrides(ev.logoKey, overrides);
  return url == null ? undefined : url;
}

/** Format an agenda item into a Spotlight-style slide for active-event takeover. */
function agendaItemToSlide(ev: HouseDisplayAgendaItem): SpotlightSlide {
  return { kind: "activeEvent", id: ev.id, event: ev };
}

const birthdayShimmer = keyframes`
  0%, 100% {
    text-shadow: 0 0 0 rgba(255, 215, 64, 0);
  }

  50% {
    text-shadow:
      0 0 6px rgba(255, 215, 64, 0.35),
      0 0 12px rgba(255, 193, 7, 0.15);
  }`;

const birthdayNameGlow = keyframes`
  0%, 100% {
  text-shadow: 0 0 0 rgba(255, 215, 64, 0);
}
  
  50% {
    text-shadow:
      0 0 6px rgba(255, 215, 64, 0.35),
      0 0 12px rgba(255, 193, 7, 0.15);
  }`;

const birthdayConfetti = keyframes`
  0% {
    transform: translateY(-8px) rotate(0deg);
    opacity: 0;
  }
    
  15% {
    opacity: 0.9;
  }
    
  85% {
    opacity: 0.9;
  }
    
  100% {
    transform: translateY(70px) rotate(240deg);
    opacity: 0;
  };`;

/**
 * Birthday celebration balloons: enter fully below the box, exit fully above,
 * then loop. Opacity stays solid for the whole path — clipping is only from the
 * parent overflow:hidden (no mid-box fade-out).
 * Y travel uses per-balloon CSS vars (px), not % of the balloon element alone.
 */
const birthdayBalloonFloat = keyframes`
  0% {
    transform: translate3d(0, var(--hd-balloon-from, 80px), 0);
    opacity: 1;
  }
  100% {
    transform: translate3d(
      var(--hd-balloon-drift, 6px),
      var(--hd-balloon-to, -160px),
      0
    );
    opacity: 1;
  }
`;

/**
 * Birthday balloon fleet (~8): large on far L/R edges; medium/small in the
 * intermediate side lanes. edgePct is inset from that side only — keep max
 * ~18% so a clear center safe zone remains around title / name / date.
 * sizePx TV-readable: small 28–34 / medium 38–46 / large 48–58.
 * fromPx / toPx: full stack starts below box, ends above box top.
 * Delays/durations/from offsets staggered so heights differ at any moment.
 */
const BIRTHDAY_BALLOONS: readonly {
  side: "left" | "right";
  edgePct: number;
  sizePx: number;
  color: string;
  delay: string;
  duration: string;
  drift: string;
  /** translateY start (positive = below resting bottom:0). */
  fromPx: number;
  /** translateY end (negative = above box). */
  toPx: number;
  staticBottomPct: number;
}[] = [
  // --- Left lane (outer → intermediate) ---
  {
    side: "left",
    edgePct: 1.5,
    sizePx: 56,
    color: "#FF8A80",
    delay: "0s",
    duration: "12.2s",
    drift: "7px",
    fromPx: 118,
    toPx: -198,
    staticBottomPct: 14,
  },
  {
    side: "left",
    edgePct: 8,
    sizePx: 42,
    color: "#FFD54F",
    delay: "3.1s",
    duration: "14.0s",
    drift: "-5px",
    fromPx: 92,
    toPx: -178,
    staticBottomPct: 36,
  },
  {
    side: "left",
    edgePct: 13.5,
    sizePx: 30,
    color: "#82B1FF",
    delay: "1.4s",
    duration: "10.8s",
    drift: "9px",
    fromPx: 76,
    toPx: -166,
    staticBottomPct: 52,
  },
  {
    side: "left",
    edgePct: 17.5,
    sizePx: 36,
    color: "#A5D6A7",
    delay: "6.4s",
    duration: "13.1s",
    drift: "-4px",
    fromPx: 100,
    toPx: -184,
    staticBottomPct: 68,
  },
  // --- Right lane (outer → intermediate) ---
  {
    side: "right",
    edgePct: 1.5,
    sizePx: 54,
    color: "#CE93D8",
    delay: "0.7s",
    duration: "12.9s",
    drift: "-8px",
    fromPx: 120,
    toPx: -200,
    staticBottomPct: 18,
  },
  {
    side: "right",
    edgePct: 7.5,
    sizePx: 44,
    color: "#FFAB91",
    delay: "4.2s",
    duration: "11.4s",
    drift: "6px",
    fromPx: 88,
    toPx: -174,
    staticBottomPct: 42,
  },
  {
    side: "right",
    edgePct: 12.5,
    sizePx: 32,
    color: "#80CBC4",
    delay: "2.2s",
    duration: "13.6s",
    drift: "-7px",
    fromPx: 74,
    toPx: -164,
    staticBottomPct: 58,
  },
  {
    side: "right",
    edgePct: 17,
    sizePx: 38,
    color: "#F48FB1",
    delay: "7.5s",
    duration: "12.0s",
    drift: "5px",
    fromPx: 104,
    toPx: -186,
    staticBottomPct: 72,
  },
];

/** Gap between last announcement and the repeated copy (seamless loop). */
const ANNOUNCEMENT_ROLL_GAP_PX = 48;
/**
 * Constant scroll speed for overflow announcements (px/sec).
 * Duration = travel distance / this — longer lists take longer, same readability.
 */
const ANNOUNCEMENT_ROLL_PX_PER_SEC = 28;

/**
 * Seamless bottom→top roll when content taller than the fixed viewport.
 * Travel uses CSS var --hd-announcement-roll-to (negative px = first copy + gap).
 */
const announcementRollUp = keyframes`
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(0, var(--hd-announcement-roll-to, -1px), 0);
  }
`;

const announcementItemSx = {
  mb: 0.75,
  fontSize: "clamp(0.9rem, 1.4vw, 1.25rem)",
  lineHeight: 1.35,
} as const;

function AnnouncementLines({
  items,
  keyPrefix,
}: {
  items: HouseDisplayAnnouncement[];
  keyPrefix: string;
}) {
  return (
    <>
      {items.map((a) => (
        <Typography key={`${keyPrefix}${a.id}`} sx={announcementItemSx}>
          {a.text}
        </Typography>
      ))}
    </>
  );
}

/**
 * Announcements body inside the fixed lower-band region.
 * Heading stays outside (caller). Fits → static stack. Overflow → seamless
 * vertical roll (duplicate list + gap). prefers-reduced-motion → static clip.
 */
function AnnouncementsRollBody({
  announcements,
  reduceMotion,
}: {
  announcements: HouseDisplayAnnouncement[];
  reduceMotion: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const firstCopyRef = useRef<HTMLDivElement | null>(null);
  const [roll, setRoll] = useState<{
    distancePx: number;
    durationSec: number;
  } | null>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const firstCopy = firstCopyRef.current;
    if (!viewport || !firstCopy) return;

    const measure = () => {
      const viewH = viewport.clientHeight;
      const contentH = firstCopy.scrollHeight;
      if (reduceMotion || announcements.length === 0 || contentH <= viewH + 1) {
        setRoll(null);
        return;
      }
      const distancePx = contentH + ANNOUNCEMENT_ROLL_GAP_PX;
      const durationSec = Math.max(
        1,
        distancePx / ANNOUNCEMENT_ROLL_PX_PER_SEC,
      );
      setRoll({ distancePx, durationSec });
    };

    measure();

    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(viewport);
    ro.observe(firstCopy);
    return () => ro.disconnect();
  }, [announcements, reduceMotion]);

  return (
    <Box
      ref={viewportRef}
      sx={{
        flex: "1 1 auto",
        minHeight: 0,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        sx={
          roll
            ? {
                // Negative px: after one cycle, second copy sits where first began.
                ["--hd-announcement-roll-to" as string]: `-${roll.distancePx}px`,
                animation: `${announcementRollUp} ${roll.durationSec}s linear infinite`,
                willChange: "transform",
              }
            : undefined
        }
      >
        <Box ref={firstCopyRef}>
          <AnnouncementLines items={announcements} keyPrefix="a-" />
        </Box>
        {roll ? (
          <>
            <Box
              aria-hidden
              sx={{ height: ANNOUNCEMENT_ROLL_GAP_PX, flex: "0 0 auto" }}
            />
            <Box aria-hidden>
              <AnnouncementLines items={announcements} keyPrefix="b-" />
            </Box>
          </>
        ) : null}
      </Box>
    </Box>
  );
}

/** Short month labels for TV birthday rows (no year). Index 0 unused; 1=Jan. */
const BIRTHDAY_MONTH_SHORT = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Gap between first strip copy and repeat (seamless horizontal loop). */
const BIRTHDAY_MONTH_ROLL_GAP_PX = 48;
/** Horizontal scroll speed for overflowing month strip (px/sec). */
const BIRTHDAY_MONTH_ROLL_PX_PER_SEC = 32;

/**
 * Seamless leftward roll when month strip wider than fixed viewport.
 * Travel uses CSS var --hd-birthday-month-roll-to (negative px).
 */
const birthdayMonthRollLeft = keyframes`
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(var(--hd-birthday-month-roll-to, -1px), 0, 0);
  }
`;

function formatBirthdayMonthDay(item: HouseDisplayBirthdayListItem): string {
  const mon =
    BIRTHDAY_MONTH_SHORT[item.birthMonth] ?? String(item.birthMonth);
  return `${mon} ${item.birthDay}`;
}

/** One nowrap horizontal copy: 🎂 date · name • date · name … */
function BirthdayMonthStripLine({
  items,
  keyPrefix,
}: {
  items: readonly HouseDisplayBirthdayListItem[];
  keyPrefix: string;
}) {
  return (
    <Typography
      component="div"
      sx={{
        display: "inline-flex",
        flex: "0 0 auto",
        alignItems: "center",
        whiteSpace: "nowrap",
        fontSize: "clamp(0.8rem, 1.2vw, 1.05rem)",
        lineHeight: 1.35,
        opacity: 0.9,
      }}
    >
      <Box component="span" sx={{ mr: 0.75 }} aria-hidden>
        🎂
      </Box>
      {items.map((item, index) => (
        <Box component="span" key={`${keyPrefix}${item.id}`}>
          {index > 0 ? (
            <Box component="span" sx={{ mx: 1, opacity: 0.55 }}>
              •
            </Box>
          ) : null}
          {formatBirthdayMonthDay(item)}
          {" · "}
          {item.displayName}
        </Box>
      ))}
    </Typography>
  );
}

/**
 * Compact fixed-height Birthdays This Month strip under Announcements.
 * Fits → static one line. Overflow → seamless horizontal roll (own measure
 * state; not coupled to AnnouncementsRollBody). reduced-motion → static clip.
 */
function BirthdaysThisMonthRollBody({
  monthItems,
  reduceMotion,
}: {
  monthItems: readonly HouseDisplayBirthdayListItem[];
  reduceMotion: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const firstCopyRef = useRef<HTMLDivElement | null>(null);
  const [roll, setRoll] = useState<{
    distancePx: number;
    durationSec: number;
  } | null>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const firstCopy = firstCopyRef.current;
    if (!viewport || !firstCopy) return;

    const measure = () => {
      const viewW = viewport.clientWidth;
      const contentW = firstCopy.scrollWidth;
      if (reduceMotion || monthItems.length === 0 || contentW <= viewW + 1) {
        setRoll(null);
        return;
      }
      const distancePx = contentW + BIRTHDAY_MONTH_ROLL_GAP_PX;
      const durationSec = Math.max(
        1,
        distancePx / BIRTHDAY_MONTH_ROLL_PX_PER_SEC,
      );
      setRoll({ distancePx, durationSec });
    };

    measure();

    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(viewport);
    ro.observe(firstCopy);
    return () => ro.disconnect();
  }, [monthItems, reduceMotion]);

  if (monthItems.length === 0) {
    return (
      <Typography
        sx={{
          opacity: 0.7,
          fontSize: "clamp(0.8rem, 1.2vw, 1rem)",
          lineHeight: 1.35,
        }}
      >
        No birthdays this month
      </Typography>
    );
  }

  return (
    <Box
      ref={viewportRef}
      sx={{
        // Fixed compact footprint — never grow with roster length.
        flex: "0 0 auto",
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
        position: "relative",
        height: "1.45em",
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          flexDirection: "row",
          alignItems: "center",
          height: "100%",
          ...(roll
            ? {
                ["--hd-birthday-month-roll-to" as string]: `-${roll.distancePx}px`,
                animation: `${birthdayMonthRollLeft} ${roll.durationSec}s linear infinite`,
                willChange: "transform",
              }
            : undefined),
        }}
      >
        <Box ref={firstCopyRef} sx={{ display: "inline-flex", flex: "0 0 auto" }}>
          <BirthdayMonthStripLine items={monthItems} keyPrefix="bm-a-" />
        </Box>
        {roll ? (
          <>
            <Box
              aria-hidden
              sx={{
                width: BIRTHDAY_MONTH_ROLL_GAP_PX,
                flex: "0 0 auto",
                height: 1,
              }}
            />
            <Box
              aria-hidden
              sx={{ display: "inline-flex", flex: "0 0 auto" }}
            >
              <BirthdayMonthStripLine items={monthItems} keyPrefix="bm-b-" />
            </Box>
          </>
        ) : null}
      </Box>
    </Box>
  );
}

export default function HouseDisplayPage() {
  const content = useSelector((state: RootState) => state.houseDisplay.content);
  const {
    header,
    agendaItems,
    spotlightItems,
    affirmationText,
    affirmations,
    pinnedAffirmationId,
    affirmationRotateMs,
    announcements,
    birthday,
  } = content;

  /** One snapshot -> header clock/date, event states, NOW line. */
  const hopeNow = useHopeHouseNow();

  /**
   * Live Daily Affirmation: pin wins; else rotate enabled by staff interval.
   * Recomputes on hopeNow minute tick so long intervals still advance.
   * Falls back to legacy affirmationText if library yields null.
   */
  const liveAffirmationText = useMemo(() => {
    const selected = selectAffirmationText({
      affirmations: affirmations ?? [],
      pinnedAffirmationId: pinnedAffirmationId ?? null,
      affirmationRotateMs:
        typeof affirmationRotateMs === "number" && affirmationRotateMs > 0
          ? affirmationRotateMs
          : 60 * 60 * 1000,
      nowMs: hopeNow.instant.getTime(),
    });
    if (selected != null && selected.trim()) return selected;
    return affirmationText?.trim() ? affirmationText : "";
  }, [
    affirmations,
    pinnedAffirmationId,
    affirmationRotateMs,
    hopeNow.instant,
    affirmationText,
  ]);

  /**
   * Live day window: weekday open + effective curfew end for Chicago dateKey.
   * Uses content.curfew (weekly + date overrides from Manage / DEV LS).
   * Not stale Redux content.timeline alone.
   */
  const timeline = useMemo(
    () =>
      timelineWindowForDate({
        dateYmd: hopeNow.dateKey,
        config: content.curfew,
      }),
    [hopeNow.dateKey, content.curfew],
  );

  /**
   * Live birthday lists from mock client-shaped people + Chicago dateKey.
   * Not Redux / content.birthday. todayItems drives celebration gate;
   * monthItems + multi today rotating paiint come in later steps.
   */
  const birthdayView = useMemo(
    () =>
      selectBirthdayView({
        people: MOCK_HOUSE_DISPLAY_BIRTHDAY_PEOPLE,
        dateKey: hopeNow.dateKey,
      }),
    [hopeNow.dateKey],
  );

  const hasBirthdayToday = birthdayView.todayItems.length > 0;

  /** ~12s per celebrant when multiple share today; single person never advances. */
  const BIRTHDAY_TODAY_ROTATE_MS = 12_000;

  /** Local TV presentation index into birthdayView.todayItems (not Redux). */
  const [birthdayTodayRotateIndex, setBirthdayTodayRotateIndex] = useState(0);

  /** Roster fingerprint so date/people changes reset the loop safely. */
  const birthdayTodayIdsKey = birthdayView.todayItems
    .map((p) => p.id)
    .join("|");

  // Chicago day or today-roster change → restart at first sorted name.
  useEffect(() => {
    setBirthdayTodayRotateIndex(0);
  }, [hopeNow.dateKey, birthdayTodayIdsKey]);

  // Multi same-day only: advance one name at a time; single celebrant = no timer.
  useEffect(() => {
    const n = birthdayView.todayItems.length;
    if (n <= 1) return;

    const id = window.setInterval(() => {
      setBirthdayTodayRotateIndex((i) => (i + 1) % n);
    }, BIRTHDAY_TODAY_ROTATE_MS);

    return () => window.clearInterval(id);
  }, [
    birthdayTodayIdsKey,
    birthdayView.todayItems.length,
    BIRTHDAY_TODAY_ROTATE_MS,
  ]);

  /** Respect user OS reduced-motion preference (birthday confetti / shimmer). */
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const blocks = useMemo(
    () => layoutAgendaItems(agendaItems, timeline),
    [agendaItems, timeline],
  );

  /**
   * All derived closing markers (real times). TV only paints the *current* stage.
   * Before T-15 → nothing. During sequence → one hairline + one label.
   */
  const closingMarkers = useMemo(
    () => layoutClosingStageMarkers(agendaItems, timeline),
    [agendaItems, timeline],
  );

  const closingPhase: HouseDisplayClosingPhase = useMemo(
    () =>
      resolveClosingPhase({
        dateYmd: hopeNow.dateKey,
        nowMin: hopeNow.nowMin,
        config: content.curfew,
      }),
    [hopeNow.dateKey, hopeNow.nowMin, content.curfew],
  );

  /** Map phase → stage id for the single active closing visual. */
  const activeClosingStageId: HouseDisplayClosingStageId | null =
    closingPhase === "closing_t15"
      ? "t15"
      : closingPhase === "closing_t10"
        ? "t10"
        : closingPhase === "closing_t5"
          ? "t5"
          : closingPhase === "final_break"
            ? "finalBreak"
            : closingPhase === "house_closed"
              ? "closed"
              : null;

  const activeClosingMarker = useMemo(() => {
    if (activeClosingStageId == null) return null;
    return (
      closingMarkers.find((m) => m.closingStageId === activeClosingStageId) ??
      null
    );
  }, [closingMarkers, activeClosingStageId]);

  /** System Spotlight owner (Roll Call / closing / Final Break / House Closed). */
  const systemSpotlight = useMemo(
    () =>
      resolveSystemSpotlightState({
        dateYmd: hopeNow.dateKey,
        nowMin: hopeNow.nowMin,
        config: content.curfew,
        imageOverrides: content.systemSpotlightImageOverrides,
      }),
    [
      hopeNow.dateKey,
      hopeNow.nowMin,
      content.curfew,
      content.systemSpotlightImageOverrides,
    ],
  );

  /** Up Next: future non-canceled agenda only (incl. system). Max 3. */
  const nextAgendaItems = useMemo(
    () =>
      agendaItems
        .filter((item) => !item.canceled && item.startMin > hopeNow.nowMin)
        .sort((a, b) => {
          if (a.startMin !== b.startMin) return a.startMin - b.startMin;
          const byTitle = a.title.localeCompare(b.title);
          if (byTitle !== 0) return byTitle;
          return a.id.localeCompare(b.id);
        })
        .slice(0, 3),
    [agendaItems, hopeNow.nowMin],
  );

  const marks = useMemo(() => hourMarks(timeline), [timeline]);

  /** id → canceled flag from seed (layout blocks do not carry canceled yet). */
  const canceledById = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const item of agendaItems) {
      map.set(item.id, item.canceled);
    }
    return map;
  }, [agendaItems]);

  /**
   * Spotlight pool priority (TV only):
   * 1) hard system (Roll Call lead-in+, closing / Final Break / House Closed)
   * 2) staff class / one-time happening
   * 3) fallback system (Good Morning — only if no active class)
   * 4) normal Spotlight rotation
   * Good Morning never blocks an active class; closing/Roll Call still do.
   */
  const [rotateIndex, setRotateIndex] = useState(0);

  const activeSpotlight = useMemo(
    () => getActiveSpotlightItems(spotlightItems),
    [spotlightItems],
  );

  const activeEvents = useActiveEvents(agendaItems, hopeNow.nowMin);

  const hardSystemTakeover =
    systemSpotlight != null && systemSpotlight.priority === "hard";
  const fallbackSystem =
    systemSpotlight != null && systemSpotlight.priority === "fallback"
      ? systemSpotlight
      : null;
  const eventTakeover = !hardSystemTakeover && activeEvents.length > 0;
  const fallbackSystemTakeover =
    !hardSystemTakeover && !eventTakeover && fallbackSystem != null;
  const systemTakeover = hardSystemTakeover || fallbackSystemTakeover;
  const takeoverActive = systemTakeover || eventTakeover;

  const activeSlides: SpotlightSlide[] = useMemo(() => {
    if (hardSystemTakeover && systemSpotlight) {
      return [
        {
          kind: "system",
          id: systemSpotlight.id,
          system: systemSpotlight,
        },
      ];
    }
    if (eventTakeover) {
      return activeEvents.map(agendaItemToSlide);
    }
    if (fallbackSystemTakeover && fallbackSystem) {
      return [
        {
          kind: "system",
          id: fallbackSystem.id,
          system: fallbackSystem,
        },
      ];
    }
    return activeSpotlight.map((item) => ({
      kind: "spotlight" as const,
      id: item.id,
      item,
    }));
  }, [
    hardSystemTakeover,
    systemSpotlight,
    eventTakeover,
    activeEvents,
    fallbackSystemTakeover,
    fallbackSystem,
    activeSpotlight,
  ]);

  const activeSlidesKey = activeSlides.map((s) => s.id).join("|");
  const runRotation =
    !takeoverActive && shouldRunSpotlightRotation(spotlightItems);

  const slideCount = activeSlides.length;

  // Live values for video ended/error handlers (avoid stale closures; no render loop).
  const slideCountRef = useRef(slideCount);
  slideCountRef.current = slideCount;
  const takeoverActiveRef = useRef(takeoverActive);
  takeoverActiveRef.current = takeoverActive;

  useEffect(() => {
    setRotateIndex((i) => clampSpotlightRotateIndex(i, slideCount));
  }, [slideCount, activeSlidesKey]);

  /**
   * Rotation timer (Phase 3):
   * - Active-event takeover + multi events: keep ~15s advance (unchanged).
   * - Normal card/flyer: ~15s advance (unchanged).
   * - Normal video: NO 15s advance — video owns dwell until ended/error.
   * slideCount<=1: no timer (single item / single event stays put).
   */
  const normalCurrentKind =
    !takeoverActive && activeSpotlight[rotateIndex]
      ? activeSpotlight[rotateIndex].kind
      : null;
  const videoOwnsNormalDwell = normalCurrentKind === "video";

  useEffect(() => {
    if (slideCount <= 1) {
      return;
    }
    // Successful normal video owns Spotlight for natural duration.
    if (videoOwnsNormalDwell) {
      return;
    }
    const id = window.setInterval(() => {
      setRotateIndex((i) => clampSpotlightRotateIndex(i + 1, slideCount));
    }, SPOTLIGHT_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [slideCount, SPOTLIGHT_ROTATE_MS, videoOwnsNormalDwell]);

  /**
   * Broken normal video with empty/missing URL must not strand the pool.
   * Advance once; single-item broken pool stays (no tight loop).
   */
  useEffect(() => {
    if (takeoverActive) return;
    const item = activeSpotlight[rotateIndex];
    if (!item || item.kind !== "video") return;
    const url = typeof item.videoUrl === "string" ? item.videoUrl.trim() : "";
    if (url) return;
    if (activeSpotlight.length <= 1) return;
    setRotateIndex((i) =>
      clampSpotlightRotateIndex(i + 1, activeSpotlight.length),
    );
  }, [takeoverActive, rotateIndex, activeSpotlight]);

  // Resolve the currently-shown slide from the live pool + rotation index.
  // useMemo (identity-stable): the crossfade effect below depends on this
  // object, so it must not be a fresh object on every render.
  const spotlightSlide = useMemo<SpotlightSlide | null>(() => {
    if (activeSlides.length === 0) return null;
    return (
      activeSlides[
        clampSpotlightRotateIndex(rotateIndex, activeSlides.length)
      ] ?? null
    );
  }, [activeSlides, rotateIndex]);

  const nowMarker = useMemo(
    () => nowLineLayout(hopeNow.nowMin, timeline),
    [hopeNow.nowMin, timeline],
  );

  /** Soft horizontal slide + crossfade — TV presentation only; not Redux. */
  const SPOTLIGHT_FADE_MS = 750;
  /** Outgoing drifts left; incoming starts slightly right (not full off-screen). */
  const SPOTLIGHT_SLIDE_PX = 30;

  const [layerA, setLayerA] = useState<SpotlightSlide | null>(null);
  const [layerB, setLayerB] = useState<SpotlightSlide | null>(null);
  const [frontIsA, setFrontIsA] = useState(true);

  // Refs so the id-change effect always sees latest front without stale closures
  const frontIsARef = useRef(true);
  const layerARef = useRef<SpotlightSlide | null>(null);
  const layerBRef = useRef<SpotlightSlide | null>(null);
  // Per-layer <video> nodes (Phase 2+3): pause hidden/back video; front play
  // + fresh restart on new front entry; ended/error advance (Phase 3).
  const videoARef = useRef<HTMLVideoElement | null>(null);
  const videoBRef = useRef<HTMLVideoElement | null>(null);
  /** Last normal video id that was started as front — avoids rewinding on same-id layer refresh. */
  const lastFrontVideoIdRef = useRef<string | null>(null);

  useEffect(() => {
    frontIsARef.current = frontIsA;
  }, [frontIsA]);
  useEffect(() => {
    layerARef.current = layerA;
  }, [layerA]);
  useEffect(() => {
    layerBRef.current = layerB;
  }, [layerB]);

  /** Advance normal/event pool index by one (ended / error / skip). */
  const advanceRotateIndex = () => {
    setRotateIndex((i) =>
      clampSpotlightRotateIndex(i + 1, slideCountRef.current),
    );
  };

  /**
   * Video lifecycle for dual layers (Phase 2 + Phase 3 play failure + sound).
   * - Back/hidden layer: pause promptly (still may paint last frame during fade).
   * - Front video: restart from 0 only when a *new* video id becomes front
   *   (first show / return after takeover or other slides) — not on same-id
   *   layer object refresh (would rewind every minute otherwise).
   * - muted follows videoSoundEnabled; if audible play() is blocked (common
   *   autoplay policy), fall back to muted play so the slide still owns dwell.
   *   Only advance when play cannot start at all.
   * No setState except via advanceRotateIndex on hard failure — not on every frame.
   */
  useEffect(() => {
    const frontVideo = frontIsA ? videoARef.current : videoBRef.current;
    const backVideo = frontIsA ? videoBRef.current : videoARef.current;
    const frontSlide = frontIsA ? layerA : layerB;

    if (backVideo) {
      try {
        backVideo.pause();
      } catch {
        // Ignore pause failures on detached/broken media.
      }
    }

    const frontVideoId =
      frontSlide &&
      frontSlide.kind === "spotlight" &&
      frontSlide.item.kind === "video"
        ? frontSlide.id
        : null;

    if (
      !frontVideo ||
      !frontVideoId ||
      !frontSlide ||
      frontSlide.kind !== "spotlight"
    ) {
      lastFrontVideoIdRef.current = null;
      return;
    }

    const item = frontSlide.item;
    if (item.kind !== "video") {
      lastFrontVideoIdRef.current = null;
      return;
    }

    // Keep DOM muted flag in sync with item (React prop + imperative before play).
    const wantSound = Boolean(item.videoSoundEnabled);
    frontVideo.muted = !wantSound;

    if (lastFrontVideoIdRef.current !== frontVideoId) {
      lastFrontVideoIdRef.current = frontVideoId;
      try {
        frontVideo.currentTime = 0;
      } catch {
        // Some browsers throw if metadata not ready yet — play() still tried.
      }
    }

    const startedId = frontVideoId;
    void frontVideo.play().catch(() => {
      // Autoplay with sound is often blocked without a user gesture.
      // Fall back to muted playback so Spotlight is not skipped/stranded.
      if (takeoverActiveRef.current) return;
      if (lastFrontVideoIdRef.current !== startedId) return;

      if (!frontVideo.muted) {
        frontVideo.muted = true;
        void frontVideo.play().catch(() => {
          if (takeoverActiveRef.current) return;
          if (lastFrontVideoIdRef.current !== startedId) return;
          if (slideCountRef.current <= 1) return;
          advanceRotateIndex();
        });
        return;
      }

      if (slideCountRef.current <= 1) return;
      advanceRotateIndex();
    });
  }, [frontIsA, layerA, layerB]);

  /**
   * When selectSpotlightItem target changes:
   * - first paint / empty: snap (no fade-from-nothing)
   * - same id: refresh that layer's content
   * - new id: put next on the BACK layer, then flip which layer is opacity 1
   */
  useEffect(() => {
    const next = spotlightSlide;
    const isA = frontIsARef.current;
    const front = isA ? layerARef.current : layerBRef.current;

    if (next == null) {
      setLayerA(null);
      setLayerB(null);
      setFrontIsA(true);
      return;
    }

    if (front == null) {
      setLayerA(next);
      setLayerB(null);
      setFrontIsA(true);
      return;
    }

    if (front.id === next.id) {
      if (isA) setLayerA(next);
      else setLayerB(next);
      return;
    }

    if (isA) setLayerB(next);
    else setLayerA(next);

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setFrontIsA((v) => !v);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [spotlightSlide]);

  /** Render a Spotlight slide: normal item, active event, or system house state.
   * layer marks which dual-layer slot owns a video ref (Phase 2 pause/play). */
  function renderSpotlightSlide(slide: SpotlightSlide, layer: "a" | "b") {
    // System house state (Roll Call / closing / Final Break / House Closed)
    if (slide.kind === "system") {
      const sys = slide.system;
      const hasImage =
        typeof sys.imageUrl === "string" && sys.imageUrl.trim().length > 0;
      return (
        <Box
          role="status"
          aria-live="polite"
          sx={{
            flex: 1,
            minHeight: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
            gap: 1.5,
            textAlign: "center",
            bgcolor:
              sys.kind === "house_closed" || sys.kind === "house_closed_after"
                ? "rgba(48, 8, 20, 0.82)"
                : sys.kind === "final_break"
                  ? "rgba(30, 64, 175, 0.28)"
                  : sys.kind === "rollCall"
                    ? "rgba(6, 78, 59, 0.28)"
                    : "rgba(120, 53, 15, 0.28)",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontSize: "clamp(0.95rem, 1.5vw, 1.35rem)",
              lineHeight: 1.15,
              m: 0,
              opacity: 0.85,
            }}
          >
            House status
          </Typography>
          {hasImage ? (
            <Box
              sx={{
                flex: "0 0 auto",
                width: "100%",
                maxWidth: "min(56vh, 520px)",
                height: "clamp(110px, 28vh, 420px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src={sys.imageUrl!}
                alt={sys.title}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "center",
                  display: "block",
                }}
              />
            </Box>
          ) : (
            <Box
              aria-hidden
              sx={{
                width: "min(70%, 280px)",
                height: "clamp(72px, 12vh, 120px)",
                borderRadius: 2,
                border: "2px dashed rgba(224,225,221,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.75,
              }}
            >
              <Typography
                sx={{
                  fontSize: "clamp(0.7rem, 1.1vw, 0.95rem)",
                  fontWeight: 600,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  opacity: 0.7,
                }}
              >
                Graphic soon
              </Typography>
            </Box>
          )}
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "clamp(1.35rem, 2.8vw, 2.6rem)",
              lineHeight: 1.12,
              m: 0,
            }}
          >
            {sys.title}
          </Typography>
          {sys.subtitle ? (
            <Typography
              sx={{
                fontWeight: 600,
                opacity: 0.85,
                fontSize: "clamp(1rem, 1.7vw, 1.45rem)",
                m: 0,
              }}
            >
              {sys.subtitle}
            </Typography>
          ) : null}
        </Box>
      );
    }

    // Phase 1: active happening event takeover.
    if (slide.kind === "activeEvent") {
      const ev = slide.event;
      const logoSrc = activeEventLogoSrc(ev, content.programLogoImageOverrides);
      return (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
            gap: 1.5,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontSize: "clamp(1.1rem, 1.8vw, 1.6rem)",
              lineHeight: 1.15,
              m: 0,
              color: "#4ade80",
            }}
          >
            Happening now
          </Typography>
          {logoSrc ? (
            /* Responsive contained logo region: fixed-height, width-capped,
             * object-fit contain preserves each logo's natural aspect ratio
             * (tall DBSA, square NA, wide Tech Quest / I Matter) without
             * cropping or stretching, independent of the page background. */
            <Box
              sx={{
                flex: "0 0 auto",
                width: "100%",
                maxWidth: "min(56vh, 520px)",
                height: "clamp(110px, 26vh, 420px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src={logoSrc}
                alt={`${ev.title} logo`}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "center",
                  display: "block",
                }}
              />
            </Box>
          ) : null}
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "clamp(1.4rem, 2.8vw, 2.75rem)",
              lineHeight: 1.1,
              m: 0,
            }}
          >
            {ev.title}
          </Typography>
          <Typography
            sx={{
              fontWeight: 600,
              opacity: 0.85,
              fontSize: "clamp(1rem, 1.8vw, 1.6rem)",
              lineHeight: 1.25,
              m: 0,
            }}
          >
            {formatTimeRange(ev.startMin, ev.endMin)}
          </Typography>
          {ev.location ? (
            <Typography
              sx={{
                fontWeight: 600,
                opacity: 0.8,
                fontSize: "clamp(0.95rem, 1.5vw, 1.35rem)",
                m: 0,
              }}
            >
              {ev.location}
              {ev.facilitator ? ` • ${ev.facilitator}` : ""}
            </Typography>
          ) : ev.facilitator ? (
            <Typography
              sx={{
                fontWeight: 600,
                opacity: 0.8,
                fontSize: "clamp(0.95rem, 1.5vw, 1.35rem)",
                m: 0,
              }}
            >
              {ev.facilitator}
            </Typography>
          ) : null}
        </Box>
      );
    }

    if (slide.kind !== "spotlight") {
      return null;
    }

    const item = slide.item;
    if (item.kind === "flyer") {
      return (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* Blurred background copy */}
          <Box
            component="img"
            src={item.imageUrl}
            alt=""
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              filter: "blur(18px) brightness(0.45)",
              transform: "scale(1.08)",
            }}
          />

          {/* Full Flyer */}
          <Box
            component="img"
            src={item.imageUrl}
            alt={item.imageAlt || item.title}
            sx={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "center",
              display: "block",
            }}
          />
        </Box>
      );
    }

    /** Video Section — dwell owned by media (onEnded); 15s timer skipped while front. */
    if (item.kind === "video") {
      const isFrontLayer = () =>
        layer === "a" ? frontIsARef.current : !frontIsARef.current;

      /** Natural end or hard media error → next Spotlight item (not during takeover). */
      const finishOrSkipVideo = () => {
        if (takeoverActiveRef.current) return;
        if (!isFrontLayer()) return;
        if (slideCountRef.current <= 1) return;
        advanceRotateIndex();
      };

      return (
        <Box
          component="video"
          ref={(el: HTMLVideoElement | null) => {
            if (layer === "a") videoARef.current = el;
            else videoBRef.current = el;
          }}
          src={item.videoUrl}
          autoPlay
          playsInline
          muted={!item.videoSoundEnabled}
          controls={false}
          loop={false}
          onEnded={finishOrSkipVideo}
          onError={finishOrSkipVideo}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center",
            display: "block",
            bgcolor: "black",
          }}
        />
      );
    }

    {
      /*  Otherwise Render Card */
    }
    return (
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
          gap: 1.5,
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            fontSize: "clamp(1.4rem, 2.8vw, 2.75rem)",
            lineHeight: 1.1,
            m: 0,
          }}
        >
          {item.title}
        </Typography>
        {item.subtitle ? (
          <Typography
            sx={{
              fontWeight: 600,
              opacity: 0.85,
              fontSize: "clamp(1rem, 1.8vw, 1.6rem)",
              m: 0,
            }}
          >
            {item.subtitle}
          </Typography>
        ) : null}
        {item.message ? (
          <Typography
            sx={{
              fontWeight: 500,
              opacity: 0.9,
              fontSize: "clamp(1.05rem, 1.9vw, 1.75rem)",
              lineHeight: 1.35,
              m: 0,
              mt: 1,
            }}
          >
            {item.message}
          </Typography>
        ) : null}
      </Box>
    );
  }

  /**
   * Styles per visual state.
   * canceled: title left + CANCELED right on one line (not color-only).
   * happening: stronger border + left accent (not color alone).
   */
  function blockSxForState(state: HouseDisplayEventVisualState) {
    switch (state) {
      case "happening":
        return {
          bgcolor: "rgba(45, 212, 191, 0.16)",
          border: "1px solid rgba(94, 234, 212, 0.55)",
          borderLeft: "5px solid #5eead4",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
          opacity: 1,
          zIndex: 2,
        };
      case "past":
        return {
          bgcolor: "rgba(8, 17, 28, 0.38)",
          border: "1px solid rgba(224,225,221,0.12)",
          opacity: 0.42,
          zIndex: 1,
        };
      case "canceled":
        return {
          bgcolor: "rgba(248, 113, 113, 0.10)",
          border: "1.5px dashed rgba(248, 113, 113, 0.75)",
          opacity: 0.92,
          zIndex: 1,
        };
      case "upcoming":
      default:
        return {
          bgcolor: "rgba(14, 28, 44, 0.72)",
          border: "1px solid rgba(224,225,221,0.22)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
          opacity: 1,
          zIndex: 1,
        };
    }
  }

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        boxSizing: "border-box",
        background:
          "radial-gradient(120% 80% at 12% -10%, rgba(56, 189, 248, 0.16) 0%, transparent 55%), radial-gradient(90% 70% at 100% 110%, rgba(45, 212, 191, 0.10) 0%, transparent 50%), linear-gradient(165deg, #08111c 0%, #0d1b2a 42%, #132a40 100%)",
        color: "#e0e1dd",
        display: "flex",
        flexDirection: "column",
        p: { xs: 1.5, md: 2.5 },
        gap: { xs: 1, md: 1.5 },
      }}
    >
      {/* ---- 1. Header ~10–12% ---- */}
      <Box
        sx={{
          flex: "0 0 11%",
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: 2,
          border: "1px solid rgba(224,225,221,0.14)",
          bgcolor: "rgba(8, 17, 28, 0.42)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
          px: { xs: 1.5, md: 2 },
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "clamp(1.1rem, 2.2vw, 2rem)",
            letterSpacing: "0.03em",
            opacity: 0.92,
            lineHeight: 1.15,
          }}
        >
          {header.identityLabel}
        </Typography>
        <Box sx={{ textAlign: "right" }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "clamp(1.25rem, 2.5vw, 2.25rem)",
              letterSpacing: "0.04em",
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1.05,
            }}
          >
            {hopeNow.clockText}
          </Typography>
          <Typography
            sx={{
              opacity: 0.62,
              fontWeight: 500,
              letterSpacing: "0.02em",
              fontSize: "clamp(0.85rem, 1.4vw, 1.25rem)",
              lineHeight: 1.25,
              mt: 0.25,
            }}
          >
            {hopeNow.dateText} · {header.weatherText}
          </Typography>
        </Box>
      </Box>

      {/* ---- 2. Day agenda timeline ~50–55% height; schedule + Spotlight ---- */}
      <Box
        sx={{
          flex: "1 1 52%",
          minHeight: 0,
          display: "flex",
          flexDirection: "row",
          px: { xs: 1, md: 1.5 },
          pr: 0,
          gap: 0,
          borderRadius: 2,
          border: "1px solid rgba(224,225,221,0.14)",
          bgcolor: "rgba(8, 17, 28, 0.42)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
          overflow: "hidden",
        }}
      >
        {/* Schedule column ~60% width */}
        <Box
          sx={{
            flex: "1 1 0%",
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            sx={{
              ...SECTION_EYEBROW_SX,
              mb: 1,
              fontSize: "clamp(0.85rem, 1.35vw, 1.2rem)",
            }}
          >
            Today&apos;s schedule
          </Typography>

          {/* Track: time gutter + proportional event column */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              position: "relative",
            }}
          >
            {/* Hour gutter */}
            <Box
              sx={{
                flex: "0 0 clamp(3.5rem, 7vw, 5.5rem)",
                position: "relative",
                mr: 1,
              }}
            >
              {marks.map((m) => (
                <Typography
                  key={m.min}
                  sx={{
                    position: "absolute",
                    top: `${m.topPct}%`,
                    right: 0,
                    transform:
                      m.topPct <= 0
                        ? "translateY(0)"
                        : m.topPct >= 100
                          ? "translateY(-100%)"
                          : "translateY(-50%)",
                    fontSize: "clamp(0.65rem, 1.1vw, 0.95rem)",
                    opacity: 0.5,
                    fontWeight: 600,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "0.02em",
                  }}
                >
                  {m.label}
                </Typography>
              ))}
              {nowMarker != null ? (
                <Typography
                  sx={{
                    position: "absolute",
                    top: `${nowMarker.topPct}%`,
                    right: 0,
                    transform: "translateY(-50%)",
                    fontSize: "clamp(0.6rem, 1vw, 0.85rem)",
                    fontWeight: 800,
                    letterSpacing: 0.8,
                    lineHeight: 1,
                    color: "#fbbf24",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    zIndex: 3,
                  }}
                >
                  NOW
                </Typography>
              ) : null}
            </Box>

            {/* Event track */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                position: "relative",
                borderLeft: "2px solid rgba(94, 234, 212, 0.28)",
                background:
                  "linear-gradient(180deg, rgba(8, 17, 28, 0.28) 0%, rgba(8, 17, 28, 0.08) 100%)",
                borderRadius: "0 8px 8px 0",
              }}
            >
              {/* Hour grid lines */}
              {marks.map((m) => (
                <Box
                  key={`line-${m.min}`}
                  sx={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: `${m.topPct}%`,
                    borderTop: "1px solid rgba(224,225,221,0.09)",
                  }}
                />
              ))}

              {/* Closing: current-stage hairline on board only (banner is shell chrome above). */}
              {activeClosingMarker != null ? (
                <Box
                  key={`closing-line-${activeClosingMarker.id}`}
                  aria-hidden
                  sx={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: `${activeClosingMarker.topPct}%`,
                    borderTop: "2px dashed rgba(251, 191, 36, 0.65)",
                    zIndex: 2,
                    pointerEvents: "none",
                  }}
                />
              ) : null}

              {nowMarker != null ? (
                <Box
                  aria-hidden
                  sx={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: `${nowMarker.topPct}%`,
                    borderTop: "3px solid #fbbf24",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.35)",
                    zIndex: 3,
                    pointerEvents: "none",
                  }}
                />
              ) : null}

              {/* Event blocks — height ∝ duration; title only; visual states */}
              {blocks.map((b) => {
                const canceled = canceledById.get(b.id) ?? false;
                const visualState = resolveEventVisualState(
                  {
                    startMin: b.startMin,
                    endMin: b.endMin,
                    canceled,
                  },
                  hopeNow.nowMin,
                );

                const stateSx = blockSxForState(visualState);

                // Centered single line for room-scale TV; progressive simplify on narrow columns.
                const blockLine =
                  visualState === "canceled"
                    ? b.title
                    : formatAgendaBlockLine(
                        b.title,
                        b.location,
                        b.facilitator,
                        b.widthPct,
                      );

                return (
                  <Box
                    key={b.id}
                    sx={{
                      position: "absolute",
                      left: `${b.leftPct}%`,
                      width: `${b.widthPct}%`,
                      top: `${b.topPct}%`,
                      height: `${b.heightPct}%`,
                      // Proportional height stays true to duration; floor only enough
                      // for one readable line. Short markers (e.g. 10-min Roll Call)
                      // stay small — do not pad to look like 30–60 min blocks.
                      minHeight:
                        b.durationMin <= 10
                          ? 22
                          : b.durationMin <= 20
                            ? 28
                            : 36,
                      boxSizing: "border-box",
                      px: 1,
                      pt: 0.25,
                      pb: 0.1,
                      borderRadius: 1.25,
                      color: "#e0e1dd",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      alignItems: "stretch",
                      overflow: "hidden",
                      ...stateSx,
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        zIndex: 1,
                        width: "100%",
                        height: "100%",
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        overflow: "hidden",
                        boxSizing: "border-box",
                        px: 0.5,
                      }}
                    >
                      {visualState === "canceled" && (
                        <Typography
                          component="div"
                          sx={{
                            flex: "0 0 auto",
                            fontWeight: 800,
                            letterSpacing: 1.2,
                            textTransform: "uppercase",
                            fontSize: "clamp(0.7rem, 1.15vw, 1rem)",
                            lineHeight: 1.1,
                            m: 0,
                            color: "#fca5a5",
                            whiteSpace: "nowrap",
                          }}
                        >
                          CANCELED
                        </Typography>
                      )}
                      <Typography
                        component="div"
                        sx={{
                          fontWeight: 800,
                          fontSize: "clamp(0.85rem, 1.6vh, 1.9rem)",
                          lineHeight: 1.15,
                          m: 0,
                          maxWidth: "100%",
                          minWidth: 0,
                          // Prefer one centered line for room reading; clamp if overflow.
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textAlign: "center",
                          textDecoration:
                            visualState === "canceled"
                              ? "line-through"
                              : "none",
                          opacity: visualState === "canceled" ? 0.85 : 1,
                        }}
                      >
                        {blockLine}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* House Spotlight ~40% — one card or flyer; empty if none active */}
        <Box
          sx={{
            flex: "1 1 0%",
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            pl: { xs: 1, md: 2 },
          }}
        >
          {layerA == null && layerB == null ? null : (
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                borderRadius: 2,
                border: "1px solid rgba(224,225,221,0.18)",
                overflow: "hidden",
                bgcolor: "rgba(8, 17, 28, 0.55)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 28px rgba(0,0,0,0.28)",
              }}
            >
              {/* Stacked slides; outer chrome stays put. One-way soft slide: out left / in from right. */}
              <Box
                sx={{
                  position: "relative",
                  flex: 1,
                  minHeight: 0,
                  overflow: "hidden",
                }}
              >
                {layerA ? (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      opacity: frontIsA ? 1 : 0,
                      transform: frontIsA
                        ? "translateX(0)"
                        : `translateX(-${SPOTLIGHT_SLIDE_PX}px)`,
                      transition: `opacity ${SPOTLIGHT_FADE_MS}ms ease-in-out, transform ${SPOTLIGHT_FADE_MS}ms ease-in-out`,
                      willChange: "opacity, transform",
                      zIndex: frontIsA ? 2 : 1,
                      pointerEvents: frontIsA ? "auto" : "none",
                    }}
                  >
                    {renderSpotlightSlide(layerA, "a")}
                  </Box>
                ) : null}
                {layerB ? (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      opacity: frontIsA ? 0 : 1,
                      transform: frontIsA
                        ? `translateX(${SPOTLIGHT_SLIDE_PX}px)`
                        : "translateX(0)",
                      transition: `opacity ${SPOTLIGHT_FADE_MS}ms ease-in-out, transform ${SPOTLIGHT_FADE_MS}ms ease-in-out`,
                      willChange: "opacity, transform",
                      zIndex: frontIsA ? 1 : 2,
                      pointerEvents: frontIsA ? "none" : "auto",
                    }}
                  >
                    {renderSpotlightSlide(layerB, "b")}
                  </Box>
                ) : null}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* ---- 3. Upcoming highlights ~8–10% ---- */}
      <Box
        sx={{
          flex: "0 0 9%",
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderRadius: 2,
          border: "1px solid rgba(224,225,221,0.14)",
          bgcolor: "rgba(8, 17, 28, 0.42)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
          px: { xs: 1.5, md: 2 },
        }}
      >
        <Typography
          sx={{
            ...SECTION_EYEBROW_SX,
            flex: "0 0 auto",
          }}
        >
          Up next
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "nowrap",
            gap: 2,
            overflow: "hidden",
            alignItems: "center",
            minWidth: 0,
            flex: "1 1 auto",
          }}
        >
          {nextAgendaItems.length === 0 ? (
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "clamp(0.95rem, 1.0vw, 1.4rem)",
                whiteSpace: "nowrap",
                opacity: 0.65,
              }}
            >
              No more scheduled activities today
            </Typography>
          ) : (
            nextAgendaItems.map((item) => (
              <Typography
                key={item.id}
                sx={{
                  fontWeight: 600,
                  fontSize: "clamp(0.95rem, 1.0vw, 1.4rem)",
                  whiteSpace: "nowrap",
                }}
              >
                {formatMinutesAsTime(item.startMin)} - {item.title}
              </Typography>
            ))
          )}
        </Box>
      </Box>

      {/* ---- 4. Lower band: affirmation | announcements + birthday ---- */}
      <Box
        sx={{
          flex: "0 0 24%",
          minHeight: 0,
          display: "flex",
          gap: 2,
          borderRadius: 2,
          border: "1px solid rgba(224,225,221,0.14)",
          bgcolor: "rgba(8, 17, 28, 0.42)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
          px: { xs: 1.5, md: 2 },
          py: { xs: 1, md: 1.25 },
        }}
      >
        <Box
          sx={{
            flex: "1 1 55%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            pr: 1,
          }}
        >
          <Typography
            sx={{
              ...SECTION_EYEBROW_SX,
              mb: 1,
            }}
          >
            Daily affirmation
          </Typography>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "clamp(1.1rem, 2.2vw, 1.9rem)",
              lineHeight: 1.3,
            }}
          >
            {liveAffirmationText}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: "1 1 45%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            borderLeft: "1px solid rgba(224,225,221,0.15)",
            pl: 2,
          }}
        >
          <Box
            sx={{
              flex: "1 1 auto",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                ...SECTION_EYEBROW_SX,
                mb: 0.75,
                flex: "0 0 auto",
              }}
            >
              Announcements
            </Typography>
            <AnnouncementsRollBody
              announcements={announcements}
              reduceMotion={reduceMotion}
            />
          </Box>

          {hasBirthdayToday ? (
            <Box
              sx={{
                flex: "0 0 auto",
                pt: 0.5,
                pb: 0.75,
                px: 1,
                position: "relative",
                overflow: "hidden",
                borderRadius: 2,
                border: "1px solid rgba(255, 215, 0, 0.28)",
                background:
                  "linear-gradient(135deg, rgba(255, 193, 7, 0.08), rgba(255, 105, 180, 0.06))",
                // Same general footprint — fill box better, not half-width / not taller panel.
                minHeight: "5.75rem",
              }}
            >
              {/* Side balloons behind text (z0). Float bottom→top; static if reduced-motion. */}
              {BIRTHDAY_BALLOONS.map((b, index) => (
                <Box
                  key={`balloon-${b.side}-${index}`}
                  aria-hidden
                  sx={{
                    position: "absolute",
                    zIndex: 0,
                    pointerEvents: "none",
                    left: b.side === "left" ? `${b.edgePct}%` : "auto",
                    right: b.side === "right" ? `${b.edgePct}%` : "auto",
                    bottom: reduceMotion ? `${b.staticBottomPct}%` : 0,
                    width: b.sizePx,
                    // Full stack height so knot+string clip with the body.
                    height: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    ["--hd-balloon-drift" as string]: b.drift,
                    ["--hd-balloon-from" as string]: `${b.fromPx}px`,
                    ["--hd-balloon-to" as string]: `${b.toPx}px`,
                    animation: reduceMotion
                      ? "none"
                      : `${birthdayBalloonFloat} ${b.duration} linear ${b.delay} infinite`,
                    opacity: reduceMotion ? 0.55 : 1,
                    willChange: reduceMotion ? undefined : "transform",
                  }}
                >
                  {/* Balloon body only (ellipse — no rectangular chrome). */}
                  <Box
                    sx={{
                      width: b.sizePx,
                      height: b.sizePx * 1.15,
                      flex: "0 0 auto",
                      alignSelf: "center",
                      borderRadius: "50%",
                      background: `radial-gradient(circle at 30% 28%, rgba(255,255,255,0.55), ${b.color})`,
                      boxShadow: `inset -2px -3px 0 rgba(0,0,0,0.08)`,
                    }}
                  />
                  {/* Tiny knot only — CSS triangle, no filled block. */}
                  <Box
                    sx={{
                      width: 0,
                      height: 0,
                      flex: "0 0 auto",
                      alignSelf: "center",
                      borderLeft: `${Math.max(2, Math.round(b.sizePx * 0.06))}px solid transparent`,
                      borderRight: `${Math.max(2, Math.round(b.sizePx * 0.06))}px solid transparent`,
                      borderTop: `${Math.max(4, Math.round(b.sizePx * 0.1))}px solid ${b.color}`,
                      mt: "-1px",
                    }}
                  />
                  {/* Thin string only — 1px line, never a gray rectangle/weight. */}
                  <Box
                    sx={{
                      width: 0,
                      height: Math.round(b.sizePx * 0.55),
                      flex: "0 0 auto",
                      alignSelf: "center",
                      borderLeft: "1.5px solid rgba(224,225,221,0.55)",
                      backgroundColor: "transparent",
                      boxShadow: "none",
                      minWidth: 0,
                      maxWidth: 0,
                      overflow: "visible",
                    }}
                  />
                </Box>
              ))}

              {/* Confetti above balloons, below text */}
              {!reduceMotion &&
                [
                  { left: "8%", delay: "0s", duration: "3.4s" },
                  { left: "23%", delay: "1.1s", duration: "4.1s" },
                  { left: "42%", delay: "0.5s", duration: "3.7s" },
                  { left: "61%", delay: "1.7s", duration: "4.3s" },
                  { left: "78%", delay: "0.8s", duration: "3.5s" },
                  { left: "92%", delay: "2.1s", duration: "4s" },
                ].map((piece, index) => (
                  <Box
                    key={piece.left}
                    sx={{
                      position: "absolute",
                      zIndex: 1,
                      top: 0,
                      left: piece.left,
                      width: index % 2 === 0 ? 5 : 4,
                      height: index % 2 === 0 ? 9 : 7,
                      borderRadius: "2px",
                      backgroundColor:
                        index % 3 === 0
                          ? "#FFD740"
                          : index % 3 === 1
                            ? "#FF8A65"
                            : "#80CBC4",
                      opacity: 0,
                      pointerEvents: "none",
                      animation: `${birthdayConfetti} ${piece.duration} linear ${piece.delay} infinite`,
                    }}
                  />
                ))}

              {/* Centered celebration copy (z2). Open mid for future cake art. */}
              <Box
                sx={{
                  position: "relative",
                  zIndex: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  px: { xs: 4, md: 7 },
                  pt: 0.25,
                  pb: 0.25,
                  // Side gutters keep text clear of edge + intermediate balloons.
                  minHeight: "5.25rem",
                  justifyContent: "flex-start",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    opacity: 0.78,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    mb: 0.35,
                    fontSize: "clamp(0.72rem, 1.15vw, 0.95rem)",
                    animation: reduceMotion
                      ? "none"
                      : `${birthdayShimmer} 2.4s ease-in-out infinite`,
                  }}
                >
                  Happy Birthday!
                </Typography>

                {/* Reserved vertical beat for future cake (do not fill with extra copy). */}
                <Box
                  aria-hidden
                  sx={{
                    flex: "0 0 auto",
                    height: "0.55rem",
                    width: "100%",
                  }}
                />

                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "clamp(1.45rem, 2.8vw, 2.35rem)",
                    lineHeight: 1.15,
                    letterSpacing: "0.01em",
                    animation: reduceMotion
                      ? "none"
                      : `${birthdayNameGlow} 3.2s ease-in-out infinite`,
                  }}
                >
                  {/* Multi same-day: one name via birthdayTodayRotateIndex (~12s). */}
                  {birthdayView.todayItems[
                    birthdayView.todayItems.length === 0
                      ? 0
                      : ((birthdayTodayRotateIndex %
                          birthdayView.todayItems.length) +
                          birthdayView.todayItems.length) %
                        birthdayView.todayItems.length
                  ]?.displayName ?? ""}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.35,
                    opacity: 0.82,
                    fontSize: "clamp(0.85rem, 1.25vw, 1.15rem)",
                    fontWeight: 500,
                  }}
                >
                  {hopeNow.dateText}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                flex: "0 0 auto",
                pt: 0.5,
                minWidth: 0,
                // Cap vertical growth so Announcements keeps room above.
                maxHeight: "3.25rem",
                overflow: "hidden",
              }}
            >
              <Typography
                sx={{
                  ...SECTION_EYEBROW_SX,
                  mb: 0.5,
                }}
              >
                Birthdays This Month
              </Typography>
              <BirthdaysThisMonthRollBody
                monthItems={birthdayView.monthItems}
                reduceMotion={reduceMotion}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
