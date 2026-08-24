/**
 * STATUS — House Display TV (layout skeleton)
 * Branch: feature/house-display
 *
 * DONE:
 * - Full viewport, no Hub chrome (/house-display)
 * - Region shell: header, agenda, upcoming, lower band
 *   (affirmation | announcements + birthday)
 *
 * NOT YET:
 * - Live clock / weather API
 * - Now/past agenda logic, animations, themes
 * - Backend
 */
import { useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";
import type { RootState } from "@/store";

export default function HouseDisplayPage() {
  // Full content tree from FE mock seed (layout chunk).
  const content = useSelector((state: RootState) => state.houseDisplay.content);
  const {
    header,
    agendaItems,
    upcomingItems,
    affirmationText,
    announcements,
    birthday,
  } = content;

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

      {/* ---- 2. Day agenda ~50–55% (dominant) ---- */}
      <Box
        sx={{
          flex: "1 1 52%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          px: 1,
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
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
          }}
        >
          {agendaItems.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                alignItems: "baseline",
                gap: { xs: 2, md: 4 },
              }}
            >
              <Typography
                sx={{
                  flex: "0 0 auto",
                  minWidth: "clamp(5.5rem, 12vw, 9rem)",
                  fontWeight: 600,
                  opacity: 0.85,
                  fontSize: "clamp(1.1rem, 2.2vw, 2.1rem)",
                }}
              >
                {item.timeLabel}
              </Typography>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "clamp(1.35rem, 3vw, 2.75rem)",
                  lineHeight: 1.15,
                }}
              >
                {item.title}
              </Typography>
            </Box>
          ))}
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
        {/* Left: affirmation */}
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

        {/* Right: announcements stacked over birthday */}
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
