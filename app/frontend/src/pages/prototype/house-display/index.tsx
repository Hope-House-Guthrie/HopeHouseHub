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
} from "@/features/house-display/types";
import type { HouseDisplaySpotlightItem } from "../../../features/house-display/types";

import {
  hourMarks,
  layoutAgendaItems,
  layoutClosingStageMarkers,
  nowLineLayout,
  resolveEventVisualState,
} from "@/features/house-display/timeline";
// Relative path: new helper file (HMR sometimes fails @/ resolve until full restart)
import {
  clampSpotlightRotateIndex,
  getActiveSpotlightItems,
  selectSpotlightItem,
  shouldRunSpotlightRotation,
  SPOTLIGHT_ROTATE_MS,
} from "../../../features/house-display/spotlight";
import { selectAffirmationText } from "../../../features/house-display/affirmations";
import {
  timelineWindowForDate,
  isSpotlightTakeoverAgendaItem,
  resolveClosingPhase,
  type HouseDisplayClosingPhase,
  type HouseDisplayClosingStageId,
} from "../../../features/house-display/curfew";
import {
  resolveSystemSpotlightState,
  type SystemSpotlightState,
} from "../../../features/house-display/systemSpotlight";
import { useHopeHouseNow } from "../../../features/house-display/useHopeHouseNow";
// Program logos: catalog defaults + Admin overrides (content.programLogoImageOverrides).
import { getProgramLogoImageWithOverrides } from "../../../features/house-display/programLogos";

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
      if (
        reduceMotion ||
        announcements.length === 0 ||
        contentH <= viewH + 1
      ) {
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

  const hasBirthdayToday = Boolean(birthday?.name?.trim());

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
              sys.kind === "house_closed"
                ? "rgba(127, 29, 29, 0.35)"
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
      const logoSrc = activeEventLogoSrc(
        ev,
        content.programLogoImageOverrides,
      );
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
          bgcolor: "rgba(94, 234, 212, 0.18)",
          border: "2px solid rgba(94, 234, 212, 0.85)",
          borderLeft: "6px solid #5eead4",
          opacity: 1,
          zIndex: 2,
        };
      case "past":
        return {
          bgcolor: "rgba(224,225,221,0.08)",
          border: "1px solid rgba(224,225,221,0.2)",
          opacity: 0.45,
          zIndex: 1,
        };
      case "canceled":
        return {
          bgcolor: "rgba(248, 113, 113, 0.12)",
          border: "2px dashed rgba(248, 113, 113, 0.9)",
          opacity: 0.95,
          zIndex: 1,
        };
      case "upcoming":
      default:
        return {
          bgcolor: "rgba(224,225,221,0.16)",
          border: "1px solid rgba(224,225,221,0.35)",
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
        bgcolor: "#0d1b2a",
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
          borderBottom: "1px solid rgba(224,225,221,0.2)",
          px: 1,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "clamp(1.1rem, 2.2vw, 2rem)",
          }}
        >
          {header.identityLabel}
        </Typography>
        <Box sx={{ textAlign: "right" }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "clamp(1.25rem, 2.5vw, 2.25rem)",
            }}
          >
            {hopeNow.clockText}
          </Typography>
          <Typography
            sx={{ opacity: 0.8, fontSize: "clamp(0.85rem, 1.4vw, 1.25rem)" }}
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
          px: 1,
          gap: 0,
        }}
      >
        {/* Schedule column ~60% width */}
        <Box
          sx={{
            flex: "0 0 50%",
            maxWidth: "50%",
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              letterSpacing: 1,
              mb: 1,
              opacity: 0.75,
              fontSize: "clamp(0.9rem, 1.5vw, 1.35rem)",
              textTransform: "uppercase",
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
                    transform: "translateY(-50%)",
                    fontSize: "clamp(0.65rem, 1.1vw, 0.95rem)",
                    opacity: 0.55,
                    fontWeight: 600,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
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
                borderLeft: "2px solid rgba(224,225,221,0.25)",
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
                    borderTop: "1px solid rgba(224,225,221,0.12)",
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
                      borderRadius: 1,
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
            flex: "0 0 50%",
            maxWidth: "50%",
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
                border: "1px solid rgba(224,225,221,0.25)",
                overflow: "hidden",
                bgcolor: "rgba(0,0,0,0.25)",
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
          px: 1,
          borderTop: "1px solid rgba(224,225,221,0.15)",
          borderBottom: "1px solid rgba(224,225,221,0.15)",
        }}
      >
        <Typography
          sx={{
            flex: "0 0 auto",
            fontWeight: 700,
            opacity: 0.7,
            textTransform: "uppercase",
            fontSize: "clamp(0.75rem, 1.2vw, 1.1rem)",
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
          px: 1,
          pt: 0.5,
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
              fontWeight: 700,
              opacity: 0.7,
              textTransform: "uppercase",
              mb: 1,
              fontSize: "clamp(0.75rem, 1.2vw, 1.05rem)",
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
                fontWeight: 700,
                opacity: 0.7,
                textTransform: "uppercase",
                mb: 0.75,
                fontSize: "clamp(0.75rem, 1.2vw, 1.05rem)",
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
                position: "relative",
                overflow: "hidden",
                borderRadius: 2,
                border: "1px solid rgba(255, 215, 0, 0.28)",
                background:
                  "linear-gradient(135deg, rgba(255, 193, 7, 0.08), rgba(255, 105, 180, 0.06))",
              }}
            >
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
              <Typography
                sx={{
                  fontWeight: 700,
                  opacity: 0.7,
                  textTransform: "uppercase",
                  mb: 0.5,
                  fontSize: "clamp(0.7rem, 1.1vw, 0.95rem)",
                  animation: reduceMotion
                    ? "none"
                    : `${birthdayShimmer} 2.4s ease-in-out infinite`,
                }}
              >
                🎂 Happy Birthday!
              </Typography>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "clamp(1rem, 1.8vw, 1.5rem)",
                  animation: reduceMotion
                    ? "none"
                    : `${birthdayNameGlow} 3.2s ease-in-out infinite`,
                }}
              >
                {birthday.name}
              </Typography>
              <Typography
                sx={{
                  opacity: 0.8,
                  fontSize: "clamp(0.85rem, 1.3vw, 1.15rem)",
                }}
              >
                {birthday.dateLabel}
              </Typography>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
