/**
 * Kitchen Resources Page
 * Combined view for birthdays, dietary needs, and staff notes
 */

import { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import { useAppSelector } from "@/store/hooks";

// Birthday Calendar Component
function BirthdayCalendar() {
  const { residents } = useAppSelector((state) => state.residents);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  const birthdaysInMonth = residents.filter((r) => {
    const birthDate = new Date(r.birthday);
    return birthDate.getMonth() === month;
  });

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <button onClick={handlePrevMonth}>‹</button>
        <Typography variant="h5" component="h2">
          {currentMonth.toLocaleString("default", { month: "long" })}{" "}
          {year} Birthday Calendar
        </Typography>
        <button onClick={handleNextMonth}>›</button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 1,
        }}
      >
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
          (day) => (
            <Typography
              key={day}
              variant="subtitle2"
              sx={{ fontWeight: "bold", textAlign: "center" }}
            >
              {day}
            </Typography>
          )
        )}

        {/* Empty cells before month starts */}
        {Array.from(
          { length: new Date(year, month, 1).getDay() },
          (_, i) => (
            <Box
              key={`empty-${i}`}
              sx={{
                height: 60,
                border: "1px solid #e0e0e0",
                borderRadius: 1,
              }}
            />
          )
        )}

        {/* Calendar days */}
        {Array.from({ length: daysInMonth }, (_, day) => {
          const dayNum = day + 1;
          const residentWithBirthday = birthdaysInMonth.find((r) => {
            const bDate = new Date(r.birthday);
            return bDate.getDate() === dayNum;
          });

          const isToday = todayMonth === month && todayDay === dayNum;

          return (
            <Box
              key={dayNum}
              sx={{
                height: 60,
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                p: 1,
                position: "relative",
                bgcolor: isToday ? "primary.light" : "background.paper",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {dayNum}
              </Typography>
              {residentWithBirthday && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 20,
                    left: 2,
                    right: 2,
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "10px",
                      color: "primary.main",
                      display: "block",
                      textAlign: "center",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {residentWithBirthday.name}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      <Typography variant="body2" sx={{ mt: 2 }}>
        {birthdaysInMonth.length === 0
          ? "No birthdays this month"
          : `${birthdaysInMonth.length} resident(s) have birthdays this month`}
      </Typography>
    </Box>
  );
}

// Dietary Needs Component
function DietaryNeeds() {
  const { residents } = useAppSelector((state) => state.residents);

  const residentsWithDietary = residents.filter(
    (resident) =>
      resident.dietaryTypes.length > 0 ||
      resident.dietaryRestrictions.length > 0
  );

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Dietary Needs & Restrictions
      </Typography>

      {residentsWithDietary.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No dietary restrictions on file
        </Typography>
      ) : (
        residentsWithDietary.map((resident) => {
          return (
            <Box
              key={resident.id}
              sx={{
                mb: 2,
                p: 2,
                border: "1px solid #e0e0e0",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                {resident.name}
              </Typography>

              {resident.dietaryTypes.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Types:
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      mt: 0.5,
                    }}
                  >
                    {resident.dietaryTypes.map((type) => (
                      <Box
                        key={type}
                        sx={{
                          px: 1,
                          py: 0.25,
                          bgcolor: "action.hover",
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="caption" sx={{ fontSize: "12px" }}>
                          {type.replace("-", " ")}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {resident.dietaryRestrictions.length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Restrictions:
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {resident.dietaryRestrictions.map((restriction) => {
                      const isAllergy = restriction.type === "allergy";
                      const isCritical =
                        restriction.severity === "critical";
                      const isSevere = restriction.severity === "severe";

                      return (
                        <Box
                          key={restriction.id}
                          sx={{
                            mb: 0.5,
                            p: 0.5,
                            bgcolor: isAllergy ? "#ffebee" : "#fff3e0",
                            borderRadius: 1,
                            borderLeft: isCritical
                              ? "4px solid #d32f2f"
                              : isSevere
                              ? "3px solid #f57c00"
                              : "2px solid #ffa000",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: isAllergy ? "bold" : "normal",
                              color: isAllergy
                                ? "error.main"
                                : isCritical
                                ? "error.dark"
                                : "warning.main",
                              fontSize: "12px",
                            }}
                          >
                            {restriction.name}
                            {isCritical && " (Critical - Medical Alert!)"}
                            {isSevere && " (Severe)"}
                            {isAllergy && " [ALLERGY]"}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>
          );
        })
      )}
    </Box>
  );
}

// Staff Notes Component
function StaffNotes() {
  const { staffNote } = useAppSelector((state) => state.ops);

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Staff Notes
      </Typography>

      {staffNote ? (
        <Paper
          sx={{
            p: 2,
            bgcolor: "action.hover",
            borderLeft: "4px solid #1976d2",
          }}
        >
          <Typography variant="body1">{staffNote}</Typography>
        </Paper>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No active staff notes
        </Typography>
      )}
    </Box>
  );
}

// Main Page Component
export default function KitchenResources() {
  const [tabValue, setTabValue] = useState(0);

  const handleChangeTab = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Kitchen Resources
      </Typography>

      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={tabValue}
          onChange={handleChangeTab}
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Tab label="Birthday Calendar" />
          <Tab label="Dietary Needs" />
          <Tab label="Staff Notes" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && <BirthdayCalendar />}
          {tabValue === 1 && <DietaryNeeds />}
          {tabValue === 2 && <StaffNotes />}
        </Box>
      </Paper>
    </Box>
  );
}