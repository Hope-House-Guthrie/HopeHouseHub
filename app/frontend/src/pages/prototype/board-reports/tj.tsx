import { Link as RouterLink } from "react-router";
import { Box, Button, Chip, Divider, Paper, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import hopeHouseLogo from "../../../../assets/hhg-logo.svg";

export default function TJBoardReportPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Screen controls */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 1000,
          mx: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 2,
          "@media print": {
            display: "none",
          },
        }}
      >
        <Button
          component={RouterLink}
          to="/prototype/board-reports"
          startIcon={<ArrowBackIcon />}
        >
          Back to Board Reports
        </Button>

        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
        >
          Print Report
        </Button>
      </Box>

      <Paper
        elevation={2}
        sx={{
          overflow: "hidden",
          maxWidth: 1000,
          width: "100%",
          mx: "auto",
          "@media print": {
            boxShadow: "none",
          },
        }}
      >
        {/* Report header */}
        <Box
          sx={{
            px: { xs: 3, md: 5 },
            py: { xs: 3, md: 4 },
            bgcolor: "primary.main",
            color: "primary.contrastText",
            "@media print": {
              bgcolor: "transparent",
              color: "text.primary",
              px: 0,
              py: 0,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column-reverse", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 4,
            }}
          >
            <Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  "@media print": {
                    fontSize: "1.75rem",
                    lineHeight: 1.1,
                  },
                }}
              >
                Hope House Hub
              </Typography>

              <Typography variant="h5" sx={{ mt: 0.5 }}>
                Quarterly IT Report
              </Typography>

              <Typography sx={{ mt: 1.5, opacity: 0.9 }}>
                Submitted by: <strong>TJ</strong>
              </Typography>

              <Typography sx={{ opacity: 0.9 }}>
                Board Meeting: September 1, 2026
              </Typography>
            </Box>

            <Box
              component="img"
              src={hopeHouseLogo}
              alt="Hope House Guthrie"
              sx={{
                width: { xs: 130, sm: 165 },
                height: "auto",
                flexShrink: 0,
              }}
            />
          </Box>
        </Box>

        {/* Report body */}
        <Box
          sx={{
            px: { xs: 3, md: 5 },
            py: { xs: 3, md: 4 },
            "@media print": {
              px: 0,
              "& .MuiTypography-root": {
                lineHeight: 1.5,
              },
            },
          }}
        >
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
            Hope House Guthrie: Quarterly IT Report
          </Typography>

          <Typography sx={{ mt: 2, lineHeight: 1.75 }}>
            Over the past quarter, the Information Technology initiative focused
            on establishing core digital infrastructure, digitizing resident
            operations, expanding network capacity, and securing foundational
            nonprofit software grants. These efforts transition Hope House
            Guthrie away from manual paper-based tracking while lowering
            long-term operating costs through vendor grant programs.
          </Typography>

          <Divider
            sx={{
              my: 3,
              "@media print": {
                my: 1.5,
              },
            }}
          />

          <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
            1. Line-of-Business Application: Hope House Hub
          </Typography>

          <Typography sx={{ mt: 1.5, lineHeight: 1.75 }}>
            Development began on the Hope House Hub, a custom line-of-business
            and resident success application designed to replace paper processes
            and deliver on-demand digital resources to residents.
          </Typography>

          <Typography
            variant="h6"
            component="h3"
            sx={{
              mt: 3,
              mb: 1.5,
              fontWeight: 700,
              "@media print": {
                mt: 1.5,
                mb: 0.75,
              },
            }}
          >
            Current Progress &amp; Key Features
          </Typography>

          <Box component="ul" sx={{ mt: 0, pl: 3 }}>
            <Box component="li" sx={{ mb: 1.5 }}>
              <Typography sx={{ lineHeight: 1.7 }}>
                <strong>User &amp; Access Management:</strong> Implemented
                secure user account management with role-based access controls
                to protect sensitive administrative and resident data.
              </Typography>
            </Box>

            <Box component="li" sx={{ mb: 1.5 }}>
              <Typography sx={{ lineHeight: 1.7 }}>
                <strong>Prototyping:</strong> Built dynamic prototype screens to
                demonstrate upcoming administrative and resident-facing
                workflows for stakeholder evaluation.
              </Typography>
            </Box>

            <Box component="li" sx={{ mb: 1.5 }}>
              <Typography sx={{ lineHeight: 1.7 }}>
                <strong>Information Display System:</strong> Deployed two
                donated mini PCs connected to new mounted displays in key
                operational zones:
              </Typography>

              <Box component="ul" sx={{ mt: 1, pl: 3 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography sx={{ lineHeight: 1.7 }}>
                    <strong>Kitchen Service Line Display:</strong> Will be
                    configured to broadcast daily menus and daily affirmations.
                  </Typography>
                </Box>

                <Box component="li">
                  <Typography sx={{ lineHeight: 1.7 }}>
                    <strong>Common Area Display:</strong> Will be configured to
                    show class schedules, educational videos, and community
                    announcements.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Typography
            variant="h6"
            component="h3"
            sx={{
              mt: 3,
              mb: 1.5,
              fontWeight: 700,
              "@media print": {
                mt: 1.5,
                mb: 0.75,
              },
            }}
          >
            Infrastructure &amp; Hosting Architecture
          </Typography>

          <Typography sx={{ lineHeight: 1.75 }}>
            To balance security, local performance, and cloud availability, a
            hybrid deployment architecture was established:
          </Typography>

          <Box component="ul" sx={{ mt: 1.5, pl: 3 }}>
            <Box component="li" sx={{ mb: 1.5 }}>
              <Typography sx={{ lineHeight: 1.7 }}>
                <strong>Hybrid Servers:</strong> Provisioned one on-site server
                and one Microsoft Azure cloud instance.
              </Typography>
            </Box>

            <Box component="li">
              <Typography sx={{ lineHeight: 1.7 }}>
                <strong>Network Static IPs:</strong> Migrated the business
                internet package to dedicated static IP addresses, establishing
                the fixed network routing required to support secure hybrid
                on-premise to cloud communication.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
            2. Infrastructure, Cloud Services &amp; Grants
          </Typography>

          <Typography
            variant="h6"
            component="h3"
            sx={{ mt: 3, mb: 1.5, fontWeight: 700 }}
          >
            Software Grants &amp; Financial Savings
          </Typography>

          <Box component="ul" sx={{ mt: 0, pl: 3 }}>
            <Box component="li" sx={{ mb: 1.5 }}>
              <Typography sx={{ lineHeight: 1.7 }}>
                <strong>Microsoft Azure for Nonprofits:</strong> Applied for and
                officially awarded the Azure grant, offsetting cloud hosting
                costs for the Hope House Hub infrastructure.
              </Typography>
            </Box>

            <Box component="li">
              <Typography sx={{ lineHeight: 1.7 }}>
                <strong>Google for Nonprofits:</strong> Successfully awarded
                access to Google Workspace, enabling cloud-based professional
                email addresses and collaboration tools.
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="h6"
            component="h3"
            sx={{ mt: 3, mb: 1.5, fontWeight: 700 }}
          >
            Web Presence &amp; Digital Intake
          </Typography>

          <Box component="ul" sx={{ mt: 0, pl: 3 }}>
            <Box component="li" sx={{ mb: 1.5 }}>
              <Typography sx={{ lineHeight: 1.7 }}>
                <strong>Domain &amp; Site Recovery:</strong> Successfully
                restored access to the lost Wix domain and hosting account (led
                by Frankie).
              </Typography>
            </Box>

            <Box component="li" sx={{ mb: 1.5 }}>
              <Typography sx={{ lineHeight: 1.7 }}>
                <strong>Website Redesign:</strong> Initiated a near-term project
                to redesign and update content across the public-facing website
                to improve community outreach and donor engagement.
              </Typography>
            </Box>

            <Box component="li">
              <Typography sx={{ lineHeight: 1.7 }}>
                <strong>Automated Inquiry Tracking:</strong> Designed and
                deployed a digital form that logs incoming phone inquiries and
                sends automated notifications to staff, streamlining incoming
                lead management.
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="h6"
            component="h3"
            sx={{ mt: 3, mb: 1.5, fontWeight: 700 }}
          >
            Facility Network Enhancements
          </Typography>

          <Box component="ul" sx={{ mt: 0, pl: 3 }}>
            <Box component="li" sx={{ mb: 1.5 }}>
              <Typography sx={{ lineHeight: 1.7 }}>
                <strong>Wired Connectivity:</strong> Hand-ran donated RJ45
                Ethernet cabling to hardwire staff workstations, significantly
                reducing local Wi-Fi congestion and enhancing network stability
                for administrative operations.
              </Typography>
            </Box>

            <Box component="li">
              <Typography sx={{ lineHeight: 1.7 }}>
                <strong>Wireless Coverage:</strong> Added and configured a new
                wireless access point to expand the Wi-Fi coverage radius across
                the facility.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
