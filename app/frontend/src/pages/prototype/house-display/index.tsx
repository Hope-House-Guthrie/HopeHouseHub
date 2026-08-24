/**
 * STATUS — House Display TV (layout + event visual states + House Spotlight)
 * Branch: feature/house-display
 *
 * DONE:
 * - Full viewport, no Hub chrome (/house-display)
 * - Region shell: header, agenda, upcoming, lower band
 * - Proportional day-planner timeline (startMin/endMin → top/height %)
 * - Title-only blocks; hour ticks; static seed
 * - Event visual states from mockNowMin + canceled (FE/DEV clock stand-in)
 * - House Spotlight right ~40%: one item (card | flyer); pin priority; contain flyer
 *
 * NOT YET:
 * - Live clock / weather API (replaces mockNowMin)
 * - Horizontal NOW indicator line
 * - Spotlight auto-rotation / timers / animations
 * - Spotlight manage forms / upload / backend
 * - Fallback right-rail when Spotlight empty
 * - Overlap columns / themes
 */
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";
import type { RootState } from "@/store";
import type { HouseDisplayEventVisualState } from "@/features/house-display/types";
import {
  hourMarks,
  layoutAgendaItems,
  resolveEventVisualState,
} from "@/features/house-display/timeline";
// Relative path: new helper file (HMR sometimes fails @/ resolve until full restart)
import { selectSpotlightItem } from "../../../features/house-display/spotlight";

export default function HouseDisplayPage() {
  const content = useSelector((state: RootState) => state.houseDisplay.content);
  const {
    header,
    timeline,
    mockNowMin,
    agendaItems,
    spotlightItems,
    upcomingItems,
    affirmationText,
    announcements,
    birthday,
  } = content;

  const blocks = useMemo(
    () => layoutAgendaItems(agendaItems, timeline),
    [agendaItems, timeline]
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
   * One Spotlight at a time. rotateIndex stays 0 until we add a timer.
   * Seed: s2 flyer pinMode until_unpinned → pin wins over Super Saturday card.
   */
  const spotlightItem = useMemo(
    () => selectSpotlightItem(spotlightItems, 0),
    [spotlightItems]
  );

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
            {header.clockText}
          </Typography>
          <Typography
            sx={{ opacity: 0.8, fontSize: "clamp(0.85rem, 1.4vw, 1.25rem)" }}
          >
            {header.dateText} · {header.weatherText}
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
            flex: "0 0 60%",
            maxWidth: "60%",
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

              {/* Event blocks — height ∝ duration; title only; visual states */}
              {blocks.map((b) => {
                const canceled = canceledById.get(b.id) ?? false;
                const visualState = resolveEventVisualState(
                  {
                    startMin: b.startMin,
                    endMin: b.endMin,
                    canceled,
                  },
                  mockNowMin
                );

                const stateSx = blockSxForState(visualState);

                return (
                  <Box
                    key={b.id}
                    sx={{
                      position: "absolute",
                      left: 8,
                      right: 8,
                      top: `${b.topPct}%`,
                      height: `${b.heightPct}%`,
                      // One title line must fit even on 30-min slots (track ~ half viewport)
                      minHeight: 36,
                      boxSizing: "border-box",
                      px: 1,
                      pt: 0.5,
                      pb: 0.25,
                      borderRadius: 1,
                      color: "#e0e1dd",
                      // Content stays top-anchored (tall blocks); one row: title left, CANCELED right
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
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        gap: 1,
                        width: "100%",
                        minWidth: 0,
                        // Single line — do not grow block height
                        flex: "0 0 auto",
                      }}
                    >
                      <Typography
                        component="div"
                        sx={{
                          fontWeight: visualState === "happening" ? 800 : 700,
                          fontSize: "clamp(0.8rem, 1.35vw, 1.25rem)",
                          lineHeight: 1.15,
                          m: 0,
                          // Shrink/ellipsis before the CANCELED badge when tight
                          flex: "1 1 auto",
                          minWidth: 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textAlign: "left",
                          textDecoration:
                            visualState === "canceled" ? "line-through" : "none",
                          opacity: visualState === "canceled" ? 0.85 : 1,
                        }}
                      >
                        {b.title}
                      </Typography>
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
            flex: "0 0 40%",
            maxWidth: "40%",
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            pl: { xs: 1, md: 2 },
          }}
        >
          {spotlightItem == null ? null : (
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
              {spotlightItem.kind === "flyer" ? (
                <Box
                  component="img"
                  src={spotlightItem.imageUrl}
                  alt={spotlightItem.imageAlt || spotlightItem.title}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "center",
                    display: "block",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
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
                    {spotlightItem.title}
                  </Typography>
                  {spotlightItem.subtitle ? (
                    <Typography
                      sx={{
                        fontWeight: 600,
                        opacity: 0.85,
                        fontSize: "clamp(1rem, 1.8vw, 1.6rem)",
                        m: 0,
                      }}
                    >
                      {spotlightItem.subtitle}
                    </Typography>
                  ) : null}
                  {spotlightItem.message ? (
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
                      {spotlightItem.message}
                    </Typography>
                  ) : null}
                </Box>
              )}
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
          {upcomingItems.map((item) => (
            <Typography
              key={item.id}
              sx={{
                fontWeight: 600,
                fontSize: "clamp(0.95rem, 1.6vw, 1.4rem)",
                whiteSpace: "nowrap",
              }}
            >
              {item.timeLabel} — {item.title}
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
            {affirmationText}
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

          <Box sx={{ flex: "0 0 auto", pt: 0.5 }}>
            <Typography
              sx={{
                fontWeight: 700,
                opacity: 0.7,
                textTransform: "uppercase",
                mb: 0.5,
                fontSize: "clamp(0.7rem, 1.1vw, 0.95rem)",
              }}
            >
              Birthday
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "clamp(1rem, 1.8vw, 1.5rem)",
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
        </Box>
      </Box>
    </Box>
  );
}
