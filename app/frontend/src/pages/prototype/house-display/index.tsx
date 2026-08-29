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
*
* NOT YET:
* - Weather API (header still uses seed weatherText)
* - UP NEXT strip still static mock (does not follow resolved agenda) — cleanup
* - Spotlight manage forms / upload / backend
* - Fallback right-rail when Spotlight empty
* - Half-hour ticks / themes
* - Schedule day rollover from backend
* - Affirmation live cross-tab rehydrate (refresh after Manage changes)
*/
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Box, keyframes, Typography, useMediaQuery } from "@mui/material";
import type { RootState } from "@/store";
import type {
  HouseDisplayEventVisualState,
  HouseDisplayAgendaItem,
} from "@/features/house-display/types";
import type { HouseDisplaySpotlightItem } from "../../../features/house-display/types";

import {
  hourMarks,
  layoutAgendaItems,
  nowLineLayout,
  resolveEventVisualState,
  timelineWindowForWeekday,
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
import { weekdayFromDateYmd } from "../../../features/house-display/resolveAgenda";
import { useHopeHouseNow } from "../../../features/house-display/useHopeHouseNow";
// Program logos for active-event Spotlight (bundled @assets, same as flyers).
import techQuestLogoUrl from "@assets/house-display/logos/tech-quest.png";
import iMatterLogoUrl from "@assets/house-display/logos/i-matter.png";
import dbsaLogoUrl from "@assets/house-display/logos/dbsa.png";
import naLogoUrl from "@assets/house-display/logos/na.jpeg";
import gameNightLogoUrl from "@assets/house-display/logos/game-night.png";

/* ---- One-time event perimeter glow (visual prototype) ----
 * Tunable knobs for browser testing. The glow is drawn with an SVG path
 * (stroke-dashoffset travel) inside the card, so it follows the rounded card
 * perimeter on both full-width and narrowed/50-50 overlap cards.
 */
/** Full animation cycle time (ms) for the traveling highlight. */
const ONE_TIME_GLOW_DURATION_MS = 6000;
/** Highlight travel dash length in viewBox units (10 = ~1%). */
const ONE_TIME_GLOW_DASH = 34;
/** Rounded-rect stroke thickness (viewBox units) for the traveling highlight. */
const ONE_TIME_GLOW_STROKE = 2;
/** Rounded-rect stroke thickness for the faint static perimeter glow. */
const ONE_TIME_GLOW_HALO_STROKE = 1;
/** Traveling highlight color (soft teal-ish accent on the dark track). */
const ONE_TIME_GLOW_COLOR = "rgba(103, 232, 249, 0.95)";
/** Faint static perimeter glow color. */
const ONE_TIME_GLOW_HALO_COLOR = "rgba(103, 232, 249, 0.35)";

/** Stroke path length of the rounded-rect overlay (viewBox units). */
const ONE_TIME_GLOW_PERIMETER = 2 * (94 + 94); // 4 * side of the inset rect

/** Fixed keyframes rule name (referenced by style strings, so it must be stable). */
const ONE_TIME_GLOW_ANIM_NAME = "oneTimePerimeterTravel";

/**
 * The @keyframes rule itself. Injected once via a <style> tag so it is always
 * present in the DOM (emotion only auto-injects keyframes used in sx/css).
 * Linear travel = smooth, no flashing/pulse. Offset goes negative to advance.
 */
const ONE_TIME_GLOW_CSS = `@keyframes ${ONE_TIME_GLOW_ANIM_NAME} {
  from { stroke-dashoffset: 0; }
  to   { stroke-dashoffset: -${ONE_TIME_GLOW_PERIMETER}; }
}`;

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
 * Time-boundary rule matches the schedule exactly: startMin <= nowMin < endMin.
 */
function useActiveEvents(
  agendaItems: HouseDisplayAgendaItem[],
  nowMin: number,
): HouseDisplayAgendaItem[] {
  return useMemo(
    () =>
      agendaItems.filter(
        (it) => it.startMin <= nowMin && nowMin < it.endMin,
      ),
    [agendaItems, nowMin],
  );
}

/** A normalized slide for the Spotlight region. */
type SpotlightSlide =
  | { kind: "spotlight"; id: string; item: HouseDisplaySpotlightItem }
  | { kind: "activeEvent"; id: string; event: HouseDisplayAgendaItem };

/* ---- Active-event Spotlight logos (Phase 2) ----
 * Explicit logoKey → bundled asset map. Keys are assigned on the schedule
 * source (never inferred from titles); shared programs reuse one key
 * (e.g. Men's/Women's/Main NA → "na"). Unknown/absent key = text-only card.
 */
const ACTIVE_EVENT_LOGOS: Record<string, string> = {
  "tech-quest": techQuestLogoUrl,
  "i-matter": iMatterLogoUrl,
  "dbsa": dbsaLogoUrl,
  "na": naLogoUrl,
  "game-night": gameNightLogoUrl,
};

function formatMinutesAsTime(totalMinutes: number): string {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hours12 = hours24 % 12 || 12;
  const period = hours24 >= 12 ? "PM" : "AM";

  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/** Resolve a logo asset URL for an agenda item, or undefined for text-only. */
function activeEventLogoSrc(ev: HouseDisplayAgendaItem): string | undefined {
  if (!ev.logoKey) return undefined;
  return ACTIVE_EVENT_LOGOS[ev.logoKey];
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
  };`

export default function HouseDisplayPage() {
  const content = useSelector((state: RootState) => state.houseDisplay.content);
  const {
    header,
    agendaItems,
    spotlightItems,
    upcomingItems,
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
   * Live day window from Chicago weekday (not stale Redux seed 7–9p).
   * Mon–Thu 8a–10p · Fri 8a–11p · Sat 10a–11p · Sun 10a–10p
   */
  const timeline = useMemo(
    () => timelineWindowForWeekday(weekdayFromDateYmd(hopeNow.dateKey)),
    [hopeNow.dateKey],
  );

  const hasBirthdayToday = Boolean(birthday?.name?.trim());

  /** Respect user OS reduced-motion preference (static glow instead of travel). */
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const blocks = useMemo(
    () => layoutAgendaItems(agendaItems, timeline),
    [agendaItems, timeline]
  );
  const nextAgendaItems = useMemo(
    () =>
      agendaItems
      .filter((item) => !item.canceled && item.startMin > hopeNow.nowMin)
      .sort((a, b) => a.startMin - b.startMin)
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

  /** id → source identity ("recurring" | "oneTime") from resolved agenda. */
  const sourceTypeById = useMemo(() => {
    const map = new Map<string, "recurring" | "oneTime">();
    for (const item of agendaItems) {
      map.set(item.id, item.sourceType);
    }
    return map;
  }, [agendaItems]);

    /**
   * Spotlight rotation = TV presentation only (not Redux).
   * - pin owns region via selectSpotlightItem; timer off while pinned
   * - no timer for 0 or 1 active item
   * - clamp index when the active list changes
   * - clearInterval on cleanup so index does not advance while pinned
   * - fade is separate dual-layer state below
   *
   * Phase 1 overlay: when the resolved agenda has >=1 currently-happening event
   * (startMin <= nowMin < endMin, excluding canceled/suppressed since the agenda
   * already omits those), the Spotlight region temporarily rotates between the
   * active EVENTS instead of the normal Spotlight slides. When zero active events
   * remain, normal Spotlight rotation resumes (preserving its prior index).
   */
  const [rotateIndex, setRotateIndex] = useState(0);

  const activeSpotlight = useMemo(
    () => getActiveSpotlightItems(spotlightItems),
    [spotlightItems],
  );

  // Active happening events, derived from the SAME resolved agenda the schedule
  // uses (one source of truth: recurring + one-time included, canceled/suppressed
  // excluded by resolution).
  const activeEvents = useActiveEvents(agendaItems, hopeNow.nowMin);

  // Phase 1 priority: active events take over Spotlight entirely.
  const takeoverActive = activeEvents.length > 0;

  // Active Spotlight slide pool: either active events (when any) or normal
  // rotation pool (when none). A single index + single interval drives both.
    const activeSlides: SpotlightSlide[] = useMemo(
    () =>
      takeoverActive
        ? activeEvents.map(agendaItemToSlide)
        : activeSpotlight.map((item) => ({ kind: "spotlight", id: item.id, item })),
    [takeoverActive, activeEvents, activeSpotlight],
  );

  const activeSlidesKey = activeSlides.map((s) => s.id).join("|");
  const runRotation = !takeoverActive && shouldRunSpotlightRotation(spotlightItems);

  // Clamp the index to whichever pool is live so rotation stays in range.
  const slideCount = takeoverActive ? activeEvents.length : activeSpotlight.length;

  // Live values for video ended/error handlers (avoid stale closures; no render loop).
  const slideCountRef = useRef(slideCount);
  slideCountRef.current = slideCount;
  const takeoverActiveRef = useRef(takeoverActive);
  takeoverActiveRef.current = takeoverActive;

  useEffect(() => {
    setRotateIndex((i) =>
      clampSpotlightRotateIndex(i, slideCount),
    );
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
    if (takeoverActive) {
      const ev = activeEvents[rotateIndex];
      return ev ? agendaItemToSlide(ev) : null;
    }
    const item = activeSpotlight[rotateIndex];
    return item ? { kind: "spotlight", id: item.id, item } : null;
  }, [takeoverActive, activeEvents, activeSpotlight, rotateIndex]);

  const nowMarker = useMemo(
    () => nowLineLayout(hopeNow.nowMin, timeline),
    [hopeNow.nowMin, timeline]
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

    if (!frontVideo || !frontVideoId || !frontSlide || frontSlide.kind !== "spotlight") {
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

  /** Render a Spotlight slide: either a normal item (flyer/video/card) or an
   * active happening event (text-only "HAPPENING NOW" card).
   * layer marks which dual-layer slot owns a video ref (Phase 2 pause/play). */
  function renderSpotlightSlide(
    slide: SpotlightSlide,
    layer: "a" | "b",
  ) {
    // Phase 1: active happening event takeover.
    if (slide.kind === "activeEvent") {
      const ev = slide.event;
      const logoSrc = activeEventLogoSrc(ev);
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
    
    {/*  Otherwise Render Card */}
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
      {/* Inject the one-time glow keyframes once (stable name used by style strings). */}
      <style>{ONE_TIME_GLOW_CSS}</style>
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

      {/* ---- 2. Day agenda timeline ~50–55% height; ~60% width + empty right reserve ---- */}
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
                  hopeNow.nowMin
                );

                const stateSx = blockSxForState(visualState);
                const isOneTime = sourceTypeById.get(b.id) === "oneTime";

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
                    {isOneTime ? (
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          pointerEvents: "none",
                          borderRadius: 1,
                          overflow: "hidden",
                          zIndex: 0,
                        }}
                      >
                        <svg
                          width="100%"
                          height="100%"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          style={{ display: "block" }}
                          aria-hidden="true"
                        >
                          {/* Faint static perimeter glow — card still looks special
                              even when the brighter highlight has moved on. */}
                          <rect
                            x="1"
                            y="1"
                            width="98"
                            height="98"
                            rx="3"
                            fill="none"
                            stroke={ONE_TIME_GLOW_HALO_COLOR}
                            strokeWidth={ONE_TIME_GLOW_HALO_STROKE}
                            vectorEffect="non-scaling-stroke"
                          />
                          {reduceMotion ? (
                            /* Reduced motion: static full illuminated rim (no travel). */
                            <rect
                              x="3"
                              y="3"
                              width="94"
                              height="94"
                              rx="2.5"
                              fill="none"
                              stroke={ONE_TIME_GLOW_COLOR}
                              strokeWidth={ONE_TIME_GLOW_STROKE}
                              strokeDasharray={`${ONE_TIME_GLOW_PERIMETER} 0`}
                            />
                          ) : (
                            /* Traveling illuminated highlight around the perimeter. */
                            <rect
                              x="3"
                              y="3"
                              width="94"
                              height="94"
                              rx="2.5"
                              fill="none"
                              stroke={ONE_TIME_GLOW_COLOR}
                              strokeWidth={ONE_TIME_GLOW_STROKE}
                              strokeLinecap="round"
                              strokeDasharray={`${ONE_TIME_GLOW_DASH} ${ONE_TIME_GLOW_PERIMETER - ONE_TIME_GLOW_DASH}`}
                              style={{
                                animation: `${ONE_TIME_GLOW_ANIM_NAME} ${ONE_TIME_GLOW_DURATION_MS}ms linear infinite`,
                                willChange: "stroke-dashoffset",
                              }}
                            />
                          )}
                        </svg>
                      </Box>
                    ) : null}
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
          }}
        >
          {nextAgendaItems.map((item) => (
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
          ))}
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
          <Box sx={{ flex: "1 1 auto", minHeight: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                opacity: 0.7,
                textTransform: "uppercase",
                mb: 0.75,
                fontSize: "clamp(0.75rem, 1.2vw, 1.05rem)",
              }}
            >
              Announcements
            </Typography>
            {announcements.map((a) => (
              <Typography
                key={a.id}
                sx={{
                  mb: 0.75,
                  fontSize: "clamp(0.9rem, 1.4vw, 1.25rem)",
                  lineHeight: 1.35,
                }}
              >
                {a.text}
              </Typography>
            ))}
          </Box>

            {hasBirthdayToday ? (
          <Box sx={{
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