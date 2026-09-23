/**
 * Static Program Assignment policy content for the Intake frontend prototype.
 *
 * index.tsx owns clientProgram selection (radio) and OVN/LTP/TEMP initials
 * fields, plus build/load/reset. This module is frontend static client-facing
 * program copy only — not a CMS/backend source. Wording changes should be
 * deliberate.
 */

import { Box, Typography } from "@mui/material";

export function ProgramOvnCopy() {
  return (
    <>
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: 600, mb: 1 }}
    >
      Overnight Program (OVN)
    </Typography>

    <Typography>
      The Overnight Program is a short-term program of up to{" "}
      <strong>2 days</strong> that provides temporary shelter
      while Hope House staff and the client determine the most
      appropriate next steps.
    </Typography>

    <Typography sx={{ mt: 2 }}>
      During this time, the client's situation and needs will
      be reviewed. Based on the client's circumstances,
      program requirements, and availability, the client may
      have the opportunity to transition into another Hope
      House program.
    </Typography>

    <Typography sx={{ mt: 2 }}>
      Placement into another program is not guaranteed and
      will be determined based on individual circumstances and
      available program options.
    </Typography>
    </>
  );
}

export function ProgramLtpCopy() {
  return (
    <>
    {/* Life Transformation Program */}
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 1 }}
      >
        Life Transformation Program (LTP)
      </Typography>

      <Typography>
        The Life Transformation Program provides clients
        additional time and support to work toward goals such
        as independent housing, sobriety, resolving legal
        matters, employment, and other areas of personal
        stability.
      </Typography>

      {/* Orientation & Probation */}
      <Typography
        variant="subtitle2"
        sx={{ mt: 2, fontWeight: 600 }}
      >
        Orientation & Probation
      </Typography>

      <Typography component="div" sx={{ mt: 1 }}>
        <ul>
          <li>
            LTP clients typically enter the program with a
            positive UA (urine analysis), which places the
            client into a 90-day probationary period that
            includes a 30-day orientation.
          </li>
          <li>
            During the 30-day orientation, clients may not use
            media devices or have visitors and are limited to
            approved volunteer work.
          </li>
          <li>
            During the first 30 days of the program, LTP
            clients are required to remain on the Hope House
            Guthrie premises.
          </li>
          <li>
            LTP clients will receive a 30-day or 60-day
            evaluation, as determined by the Facility
            Director.
          </li>
        </ul>
      </Typography>

      {/* Goals & Services */}
      <Typography
        variant="subtitle2"
        sx={{ mt: 2, fontWeight: 600 }}
      >
        Goals & Services
      </Typography>

      <Typography component="div" sx={{ mt: 1 }}>
        <ul>
          <li>
            LTP client goals are reviewed and set every 60 to
            90 days, depending on the individual goal.
          </li>
          <li>
            LTP clients have access to resources for housing,
            counseling, employment, budgeting, and education.
          </li>
          <li>
            LTP clients are required to establish three
            personal goals and one counseling goal as part of
            their program plan.
          </li>
          <li>
            LTP clients will receive a resource packet to
            assist with accessing available services and
            community resources.
          </li>
        </ul>
      </Typography>

      {/* Testing & Accountability */}
      <Typography
        variant="subtitle2"
        sx={{ mt: 2, fontWeight: 600 }}
      >
        Testing & Accountability
      </Typography>

      <Typography component="div" sx={{ mt: 1 }}>
        <ul>
          <li>
            LTP clients are subject to random UAs (urine
            analyses) and random BAC testing. Clients must
            also complete a breathalyzer test each time they
            leave and return to the facility.
          </li>
        </ul>
      </Typography>

      {/* Daily Program Requirements */}
      <Typography
        variant="subtitle2"
        sx={{ mt: 2, fontWeight: 600 }}
      >
        Daily Program Requirements
      </Typography>

      <Typography component="div" sx={{ mt: 1 }}>
        <ul>
          <li>
            LTP clients are required to attend mandatory
            classes designed to support sobriety, goal
            achievement, and personal growth.
          </li>
          <li>
            After a three-day rest period, LTP clients are
            responsible for completing their assigned chore,
            unless they are participating in Drug Court.
          </li>
          <li>
            LTP clients are required to participate in
            assigned volunteer service as part of the program.
          </li>
          <li>
            LTP clients are required to attend mandatory
            classes Monday through Friday at 7:00 PM.
          </li>
          <li>
            LTP clients are required to attend roll call
            Monday through Friday at 8:00 AM and Saturday and
            Sunday at 10:00 AM.
          </li>
          <li>
            LTP clients are required to follow the Hope House
            Guthrie dress code and 3-foot rule, as explained
            by the Facility Director.
          </li>
          <li>
            LTP clients are responsible for taking the
            initiative to communicate with the Facility
            Director or Administration when they need
            resources, have questions, or have concerns.
          </li>
        </ul>
      </Typography>

      {/* Program Stay & Accountability */}
      <Typography
        variant="subtitle2"
        sx={{ mt: 2, fontWeight: 600 }}
      >
        Program Stay & Accountability
      </Typography>

      <Typography component="div" sx={{ mt: 1 }}>
        <ul>
          <li>
            LTP clients may stay at the facility for one to
            two years, at the discretion of the Facility
            Director.
          </li>
          <li>
            LTP clients are required to have an accountability
            partner during their 90-day probationary period,
            subject to Facility Director discretion.
          </li>
          <li>
            LTP clients are expected to understand and follow
            these program guidelines, with participation and
            progress evaluated by the Facility Director.
          </li>
        </ul>
      </Typography>

      {/* Scheduling, Passes & Visitation */}
      <Typography
        variant="subtitle2"
        sx={{ mt: 2, fontWeight: 600 }}
      >
        Scheduling, Passes & Visitation
      </Typography>

      <Typography component="div" sx={{ mt: 1 }}>
        <ul>
          <li>
            LTP clients must enter activities and appointments
            on the front desk calendars at least one week in
            advance.
          </li>
          <li>
            After completing the 30-day orientation, LTP
            clients are eligible for one 24-hour pass and one
            day pass each week.
          </li>
          <li>
            After six months in the program, the client's
            24-hour pass may be extended to a 48-hour pass.
          </li>
          <li>
            Before becoming eligible for a 12-hour or 24-hour
            pass, LTP clients must pass a drug screen and
            complete eight hours of administration-approved
            volunteer work.
          </li>
          <li>
            During the first 30 days, LTP clients may not have
            outside visitors. Children are an exception when
            an approved visitation request is in place.
          </li>
          <li>
            Visitors must call Hope House Guthrie at
            405-856-9058 to schedule a visit at least 24 hours
            in advance.
          </li>
          <li>
            Pass requests must be submitted at least 24 hours
            in advance.
          </li>
          <li>
            Before a pass can be approved, the client must
            arrange for their assigned chore to be covered.
          </li>
        </ul>
      </Typography>

      {/* Employment & Responsibilities */}
      <Typography
        variant="subtitle2"
        sx={{ mt: 2, fontWeight: 600 }}
      >
        Employment & Responsibilities
      </Typography>

      <Typography component="div" sx={{ mt: 1 }}>
        <ul>
          <li>
            Eligible LTP clients are required to obtain
            employment after completing the 30-day
            orientation, or earlier with Facility Director
            approval.
          </li>
          <li>
            After completing the 30-day orientation, LTP
            clients may obtain local employment, subject to
            Facility Director approval.
          </li>
          <li>
            LTP clients are responsible for arranging their
            own transportation to and from work.
          </li>
          <li>
            LTP clients must keep Administration informed of
            changes or updates related to employment,
            benefits, insurance, and other relevant
            circumstances.
          </li>
        </ul>
      </Typography>
    </>
  );
}

export function ProgramTempCopy() {
  return (
    <>
    {/* Emergency Temporary Shelter Program */}
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 1 }}
      >
        Emergency Temporary Shelter Program (TEMP)
      </Typography>

      <Typography>
        The Emergency Temporary Shelter Program is designed to
        help clients work toward a quicker transition into
        independent housing. TEMP clients typically enter the
        program after producing a negative UA (urine
        analysis).
      </Typography>

      {/* Evaluation & Goals */}
      <Typography
        variant="subtitle2"
        sx={{ mt: 2, fontWeight: 600 }}
      >
        Evaluation & Goals
      </Typography>

      <Typography component="div" sx={{ mt: 1 }}>
        <ul>
          <li>
            TEMP clients are evaluated every 30 days to review
            goal progress and determine whether an extension
            may be considered at the 90-day exit date.
          </li>
          <li>
            TEMP client goals are established during the
            intake process and/or the client's first
            evaluation.
          </li>
          <li>
            TEMP clients are expected to be transparent,
            proactive, and communicative regarding their
            established goals.
          </li>
          <li>
            TEMP clients must demonstrate progress toward
            their goals each month to be considered for an
            extension of their stay.
          </li>
        </ul>
      </Typography>

      {/* Program Schedule & Participation */}
      <Typography
        variant="subtitle2"
        sx={{ mt: 2, fontWeight: 600 }}
      >
        Program Schedule & Participation
      </Typography>

      <Typography component="div" sx={{ mt: 1 }}>
        <ul>
          <li>
            TEMP clients are expected to follow program
            guidelines and participate in required activities
            when their work schedule permits. Clients may be
            excused from mandatory classes when their work
            schedule prevents attendance.
          </li>
          <li>
            TEMP clients have a more flexible schedule to
            support employment, saving money, and making
            progress toward their goals and independent
            housing.
          </li>
        </ul>
      </Typography>

      {/* Testing & Accountability */}
      <Typography
        variant="subtitle2"
        sx={{ mt: 2, fontWeight: 600 }}
      >
        Testing & Accountability
      </Typography>

      <Typography component="div" sx={{ mt: 1 }}>
        <ul>
          <li>
            TEMP clients are subject to random UAs (urine
            analyses) and random BAC testing. Clients must
            also complete a breathalyzer test each time they
            leave and return to the facility.
          </li>
          <li>
            TEMP clients are not required to have an
            accountability partner when leaving the premises.
          </li>
        </ul>
      </Typography>

      {/* Resources & Services */}
      <Typography
        variant="subtitle2"
        sx={{ mt: 2, fontWeight: 600 }}
      >
        Resources & Services
      </Typography>

      <Typography component="div" sx={{ mt: 1 }}>
        <ul>
          <li>
            TEMP clients have access to resources for housing,
            counseling, employment, budgeting, and education.
          </li>
        </ul>
      </Typography>

      {/* Scheduling & Passes */}
      <Typography
        variant="subtitle2"
        sx={{ mt: 2, fontWeight: 600 }}
      >
        Scheduling & Passes
      </Typography>

      <Typography component="div" sx={{ mt: 1 }}>
        <ul>
          <li>
            TEMP clients must enter activities and
            appointments on the front desk calendars at least
            one week in advance.
          </li>
          <li>
            TEMP clients must complete a day pass when they
            expect to be away from the facility for 12 hours
            or more.
          </li>
          <li>
            TEMP pass requests must be submitted at least 24
            hours in advance.
          </li>
          <li>
            TEMP clients must ensure their assigned chore is
            covered before a pass can be approved.
          </li>
        </ul>
      </Typography>

      {/* Daily Program Requirements */}
      <Typography
        variant="subtitle2"
        sx={{ mt: 2, fontWeight: 600 }}
      >
        Daily Program Requirements
      </Typography>

      <Typography component="div" sx={{ mt: 1 }}>
        <ul>
          <li>
            TEMP clients are responsible for completing their
            assigned chore beginning the day after entering
            the program.
          </li>
          <li>
            TEMP clients are required to participate in
            assigned volunteer service as part of the program.
          </li>
          <li>
            TEMP clients are required to attend mandatory
            classes Monday through Friday at 7:00 PM when
            their work schedule permits.
          </li>
          <li>
            TEMP clients are required to attend morning roll
            call Monday through Friday at 8:00 AM and Saturday
            and Sunday at 10:00 AM when their work schedule
            permits.
          </li>
          <li>
            TEMP clients are required to follow the Dress for
            Success policy and maintain the 3-foot rule.
          </li>
          <li>
            TEMP clients are expected to take initiative in
            communicating with the Facility Director or
            Administration regarding available resources,
            questions, and concerns.
          </li>
        </ul>
      </Typography>

      {/* Program Stay & Evaluation */}
      <Typography
        variant="subtitle2"
        sx={{ mt: 2, fontWeight: 600 }}
      >
        Program Stay & Evaluation
      </Typography>

      <Typography component="div" sx={{ mt: 1 }}>
        <ul>
          <li>
            TEMP clients are expected to exit the Emergency
            Temporary Shelter Program within 90 days.
          </li>
          <li>
            TEMP clients receive a 30-day evaluation as
            determined by the Facility Director.
          </li>
          <li>
            TEMP clients are expected to understand and follow
            the Emergency Temporary Shelter Program
            guidelines. Client participation and progress are
            evaluated by the Facility Director.
          </li>
          <li>
            TEMP clients are expected to establish three
            goals, with at least one goal focused on
            counseling.
          </li>
          <li>
            TEMP clients receive a resource packet to assist
            with working toward their established goals.
          </li>
          <li>
            TEMP clients are responsible for keeping
            Administration updated regarding employment,
            benefits, insurance, and other relevant changes.
          </li>
        </ul>
      </Typography>
    </>
  );
}

