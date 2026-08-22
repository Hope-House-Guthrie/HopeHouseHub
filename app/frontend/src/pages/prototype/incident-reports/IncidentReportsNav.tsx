/**
 * Shared sub-nav for Incident Reports area
 * New form | Pending | History
 */
import { Box, Button } from "@mui/material";
import { Link, useLocation } from "react-router";

const links = [
  { to: "/incident-reports", label: "New Report", end: true },
  { to: "/incident-reports/pending", label: "Pending", end: false },
  { to: "/incident-reports/history", label: "History", end: false },
] as const;

function isActive(pathname: string, to: string, end: boolean): boolean {
  if (end) {
    // Exact match so /incident-reports/pending does not highlight "New"
    return pathname === to || pathname === `${to}/`;
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function IncidentReportsNav() {
  const { pathname } = useLocation();

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
      {links.map((link) => {
        const active = isActive(pathname, link.to, link.end);
        return (
          <Button
            key={link.to}
            component={Link}
            to={link.to}
            variant={active ? "contained" : "outlined"}
            size="small"
          >
            {link.label}
          </Button>
        );
      })}
    </Box>
  );
}
