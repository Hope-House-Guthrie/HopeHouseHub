import { Link as RouterLink } from "react-router";
import { Box, Button, Chip, Divider, Paper, Typography } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import hopeHouseLogo from "../../../../assets/hhg-logo.svg";

export default function BrentBoardReportPage() {
  return (
    <Box
      sx={{
        maxWidth: 1000,
        mx: "auto",
        pb: 4,
        "@media print": {
          maxWidth: "none",
          pb: 0,
        },
      }}
    >
      <Box
        sx={{
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
              pt: 0,
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

              <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
                Hope House Hub
              </Typography>

              <Typography variant="h5" sx={{ mt: 0.5 }}>
                Operations &amp; Frontend Development
              </Typography>

              <Typography sx={{ mt: 1.5, opacity: 0.9 }}>
                Submitted by: <strong>Brent</strong>
              </Typography>

              <Typography sx={{ opacity: 0.9 }}>
                Board Meeting: September 1, 2026
              </Typography>

              <Typography sx={{ opacity: 0.9 }}>
                Reporting Period: May 24 – September 1, 2026
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
            p: { xs: 3, md: 5 },
            display: "flex",
            flexDirection: "column",
            gap: 3,
            "@media print": {
              p: 0,
              pt: 3,
            },
          }}
        >
          {/* Hope House Hub */}
          <Box>
            <Typography
              variant="h5"
              component="h2"
              sx={{ mb: 1.5, fontWeight: 700 }}
            >
              Hope House Hub
            </Typography>

            <Typography paragraph>
              The Hope House Hub is being developed as a central location for
              many of the operational processes and information used throughout
              Hope House.
            </Typography>

            <Typography paragraph>
              The goal is larger than simply replacing paper forms with
              electronic versions. The Hub is being designed so information
              entered in one area can become useful throughout the organization,
              while staff only have access to information appropriate to their
              roles.
            </Typography>

            <Typography paragraph>
              This can include everything from intakes, UAs, passes, incident
              reports, roll call, class attendance, room inspections, chores,
              and maintenance requests to bed availability, upcoming birthdays,
              class schedules, and what is being served for dinner.
            </Typography>

            <Typography sx={{ mb: 0 }}>
              The Hub is currently in active development and uses mock
              information rather than live client data.
            </Typography>
          </Box>

          <Divider />

          {/* How It Started */}
          <Box>
            <Typography
              variant="h5"
              component="h2"
              sx={{ mb: 1.5, fontWeight: 700 }}
            >
              How It Started
            </Typography>

            <Typography paragraph>
              The project began taking shape on <strong>May 24, 2026.</strong>
            </Typography>

            <Typography paragraph>
              I had wanted a better way to bring Hope House&apos;s separate
              processes and information together. During a conversation with TJ
              that day, he told me:
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                px: 3,
                py: 2.5,
                my: 2.5,
                textAlign: "center",
                bgcolor: "action.hover",
              }}
            >
              <Typography
                variant="h5"
                component="blockquote"
                sx={{ m: 0, fontWeight: 600 }}
              >
                “I can help you make this better.”
              </Typography>
            </Paper>

            <Typography paragraph>
              I asked him how, and that was when I learned about his
              approximately 20 years of software engineering experience. That
              conversation became the starting point for what is now the Hope
              House Hub.
            </Typography>

            <Typography paragraph>
              Our different backgrounds have become an important part of the
              project. My experience with Hope House&apos;s day-to-day
              operations helps identify how our processes actually work and
              translate those needs into frontend workflows and prototypes. TJ
              brings the software engineering experience and technical knowledge
              needed to build the foundation behind them.
            </Typography>

            <Typography sx={{ fontWeight: 600 }}>
              Together, we are approaching the project from both sides: how Hope
              House needs the system to work and how the technology can be built
              to support it.
            </Typography>
          </Box>

          <Divider />

          {/* Development Progress */}
          <Box>
            <Typography
              variant="h5"
              component="h2"
              sx={{ mb: 1.5, fontWeight: 700 }}
            >
              Development Progress
            </Typography>

            <Typography paragraph>
              A substantial number of Hope House processes have already been
              translated into frontend prototypes, including:
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: 1.25,
                mb: 2.5,
              }}
            >
              {[
                "UA documentation and workflows",
                "Pass requests",
                "Incident reporting",
                "Roll call and class attendance",
                "Room inspections and chores",
                "Client sign-in/sign-out",
                "Vehicle and mileage tracking",
                "Walk-in service tracking",
                "Maintenance tracking and requests",
              ].map((item) => (
                <Paper
                  key={item}
                  variant="outlined"
                  sx={{
                    px: 2,
                    py: 1.25,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item}
                  </Typography>
                </Paper>
              ))}
            </Box>

            <Typography paragraph>
              The purpose of prototyping is not simply to recreate a paper form
              on a screen. It gives us an opportunity to determine what
              information the Hub can already know, what staff actually need to
              enter, what can be handled automatically, and what needs to happen
              after a process is completed.
            </Typography>

            <Typography sx={{ mb: 0 }}>
              House Leaders have already completed sample Pass Request and UA
              workflows and provided feedback on their feel, flow, and
              usability.
            </Typography>
          </Box>

          <Divider />

          {/* Connected Information */}
          <Box>
            <Typography
              variant="h5"
              component="h2"
              sx={{ mb: 1.5, fontWeight: 700 }}
            >
              Connected Information
            </Typography>

            <Typography paragraph>
              One of the larger goals of the Hub is to reduce duplicate work by
              allowing appropriate information to be used across different
              areas.
            </Typography>

            <Typography paragraph>
              For example, Kenny requested an easier way for the kitchen to keep
              track of current client birthdays. The goal is for information
              already collected during intake to automatically populate an
              upcoming birthday calendar for the kitchen. Relevant dietary
              information can work in the same way.
            </Typography>

            <Typography paragraph>
              That same concept can eventually connect intake information with
              the client roster, bed availability, roll call, classes, passes,
              UAs, chores, and other appropriate areas.
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                px: 3,
                py: 2.5,
                mt: 2,
                textAlign: "center",
                bgcolor: "action.hover",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Enter information where it belongs, then make it available where
                it is needed.
              </Typography>
            </Paper>
          </Box>

          <Divider />

          {/* House & Kitchen Displays */}
          <Box>
            <Typography
              variant="h5"
              component="h2"
              sx={{ mb: 1.5, fontWeight: 700 }}
            >
              House &amp; Kitchen Displays
            </Typography>

            <Typography paragraph>
              Two donated mini PCs, along with two installed 50-inch televisions
              and wall mounts, are being used to create dedicated Kitchen and
              House Displays.
            </Typography>

            <Typography paragraph>
              The Kitchen Display is being developed around menu and kitchen
              information. The House Display is being developed for classes,
              activities, announcements, reminders, birthdays, recognition, and
              other time-sensitive house information.
            </Typography>

            <Typography sx={{ mb: 0 }}>
              The goal is for these displays to eventually receive their
              information directly from the Hub rather than requiring staff to
              separately maintain what appears on each television.
            </Typography>
          </Box>

          <Divider />

          {/* Current Development & Next Steps */}
          <Box>
            <Typography
              variant="h5"
              component="h2"
              sx={{ mb: 1.5, fontWeight: 700 }}
            >
              Current Development &amp; Next Steps
            </Typography>

            <Typography paragraph>
              Current development includes the House Display, Kitchen Display,
              and Maintenance Request system while existing frontend workflows
              continue moving toward backend integration.
            </Typography>

            <Typography paragraph>
              The Hub will be introduced in stages rather than attempting to
              replace every current process at once. Individual functions can
              move into operational use as they are connected, tested, and
              ready.
            </Typography>

            <Typography paragraph>
              In a little over three months, the Hope House Hub has progressed
              from an idea into a growing collection of working operational
              prototypes, installed display infrastructure, and early staff
              testing.
            </Typography>

            <Typography paragraph>
              There is still significant work ahead, but the direction remains
              simple:
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                px: 3,
                py: 2.5,
                my: 2,
                bgcolor: "action.hover",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, textAlign: "center" }}
              >
                Build one central system around the way Hope House actually
                works and make the right information available to the right
                people when they need it.
              </Typography>
            </Paper>

            <Box
              sx={{
                textAlign: "center",
                mt: 3,
                "@media print": {
                  breakBefore: "page",
                  pageBreakBefore: "always",
                  minHeight: "8.5in",
                  mt: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  px: 4,
                },
              }}
            >
              <Box
                component="img"
                src={hopeHouseLogo}
                alt="Hope House Guthrie"
                sx={{
                  display: "none",
                  "@media print": {
                    display: "block",
                    width: 150,
                    height: "auto",
                    mb: 4,
                  },
                }}
              />

              <Typography
                sx={{
                  "@media print": {
                    fontSize: "1.1rem",
                    mb: 1.5,
                  },
                }}
              >
                And it started with five words:
              </Typography>

              <Typography
                variant="h4"
                component="p"
                sx={{
                  mt: 1,
                  mb: 0,
                  fontWeight: 700,
                  "@media print": {
                    mt: 0,
                    fontSize: "2rem",
                    lineHeight: 1.3,
                    maxWidth: 650,
                  },
                }}
              >
                “I can help you make this better.”
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
