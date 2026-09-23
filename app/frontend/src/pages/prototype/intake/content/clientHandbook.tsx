/**
 * Static Client Handbook content for the Intake frontend prototype.
 *
 * Separated from Intake workflow/form state: index.tsx owns handbook tab
 * selection (`activeHandbookTab`) and section navigation. This module is
 * frontend static policy text only (not a CMS/backend source).
 *
 * Client-facing wording changes should be reviewed deliberately.
 */

import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

/** Tab id + label pairs — keep ids aligned with handbookContentByTab keys. */
export const handbookTabs: ReadonlyArray<readonly [string, string]> = [
  ["getting-started", "Getting Started"],
  ["passes-conduct", "Passes & House Conduct"],
  ["responsibilities", "Responsibilities & Daily Life"],
  ["community-rules", "Personal & Community Rules"],
  ["safety", "Dress, Transportation & Safety"],
  ["counseling", "Counseling"],
] as const;

export const handbookContentByTab: Record<string, ReactNode> = {
  "getting-started": (
    <Box sx={{ mt: 3 }}>

                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Getting Started
                      </Typography>

                      {/* 30-Day Rule */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          1. 30-Day Orientation
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Clients enrolled in the Life Transformation Program
                          (LTP) must remain on Hope House Guthrie premises
                          during their first 30 days. This orientation
                          requirement applies to LTP clients only.
                        </Typography>
                      </Box>

                      {/* Personal Cell Phone Policy */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          2. Personal Cell Phone Policy
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          LTP clients may not use personal cell phones during
                          their 30-day orientation. Drug Court participants are
                          exempt from this rule.
                        </Typography>
                      </Box>

                      {/* Client Cost-Sharing Contribution */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          3. Client Cost-Sharing Contribution
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Clients who are employed or have a verifiable source
                          of income at intake are responsible for a $75 monthly
                          Client Cost-Sharing Contribution. If a client becomes
                          employed after intake, the contribution begins one
                          month after their hire date.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          This contribution is for housing only and is not a fee
                          for services, meals, or program participation.
                        </Typography>

                        <Typography sx={{ mt: 1 }}>
                          Payment is due in the exact amount on the 1st of each
                          month. Payments received after the 1st may be subject
                          to a $15 late fee, for a total amount due of $90.
                        </Typography>
                      </Box>

                      {/* COVID-19 Vaccination */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          4. COVID-19 Vaccination
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          COVID-19 vaccination is required. Clients who are not
                          vaccinated before admission will be given a date by
                          Administration to receive their vaccination.
                        </Typography>

                        <Typography sx={{ mt: 1 }}>
                          Free vaccinations with insurance are available at
                          Wal-Mart and the Logan County Health Department. If
                          you need insurance, we can get you to the Logan County
                          Health Department, where they can help you get signed
                          up.
                        </Typography>
                      </Box>

                      {/* Employment Requirement */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          5. Employment Requirement
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          All eligible clients are required to obtain employment
                          after completing their 30-day orientation, unless
                          Administration approves them to begin working sooner.
                        </Typography>

                        <Typography sx={{ mt: 1 }}>
                          Clients are responsible for arranging and paying for
                          their own transportation to and from work.
                        </Typography>
                      </Box>

                      {/* Local Employment */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          6. Local Employment
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          LTP clients may work locally after completing their
                          30-day orientation with approval from Administration.
                          Drug Court participants are exempt and able to start
                          work right away.
                        </Typography>
                      </Box>

                      {/* Visitors During Orientation */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          7. Visitors During Orientation
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          LTP clients may not have outside visitors during their
                          first 30 days.
                        </Typography>

                        <Typography sx={{ mt: 1 }}>
                          Children may visit if an approved visitation request
                          is submitted at least 24 hours in advance.
                        </Typography>
                      </Box>

                      {/* Care Packages */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          8. Care Packages
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Clients may receive one care package per week with
                          prior notification.
                        </Typography>
                      </Box>
    </Box>
  ),
  "passes-conduct": (
    <Box sx={{ mt: 3 }}>

                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Passes & House Conduct
                      </Typography>

                      {/* Passes & Visitation */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          9. Passes & Visitation
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          After completing the 30-day orientation, LTP clients
                          are eligible for one 12-hour pass each week and one
                          24-hour pass each month. After six months in the
                          program, the monthly 24-hour pass may be extended to
                          48 hours with Administration approval.
                        </Typography>

                        <Typography sx={{ mt: 1 }}>
                          TEMP clients must submit a pass request if they will
                          be away from Hope House Guthrie for more than 12
                          hours. LTP clients must submit a day pass request if
                          they will be away for more than 4 hours. Passes must
                          be approved before leaving.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Before an LTP client is eligible for a 12-hour or
                          24-hour pass, they must pass a drug screen and have
                          completed 8 Administration-approved volunteer hours.
                          Incomplete or incorrectly completed pass requests will
                          be denied.
                        </Typography>
                      </Box>

                      {/* Outside Food & Kitchen Use */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          10. Outside Food & Kitchen Use
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Clients who order outside food must notify the front
                          desk.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Clients may use the toaster and microwave for personal
                          use. Personal cooking in the kitchen is not allowed.
                          Questions about kitchen use should be directed to a
                          House Leader or Administration.
                        </Typography>
                      </Box>

                      {/* House Cell Phone */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          11. House Cell Phone
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Hope House Guthrie cell phone is primarily used for
                          Hope House Guthrie business and incoming calls.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Clients in their 30-day orientation may sign out the
                          house cell phone to make personal calls. Personal
                          calls are limited to 15 minutes, and the client must
                          remain in the common area while using the phone.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          The 15-minute limit does not apply to necessary calls
                          involving benefits, insurance, SNAP, medical care,
                          employment, legal matters, or other important
                          services. Clients may remain on these calls as long as
                          reasonably necessary to complete their business.
                        </Typography>
                      </Box>

                      {/* Staff-Only Areas & Client Rooms */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          12. Staff-Only Areas & Client Rooms
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Clients may not enter Staff Only areas without
                          permission from Leadership.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Clients must receive approval from Leadership before
                          entering another client's room. This helps Leadership
                          know where clients are and protects everyone from
                          misunderstandings involving personal belongings,
                          missing items, or other concerns.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          When visiting another client's room, the door must
                          remain open. Clients may not enter another client's
                          room when that client is not present unless
                          specifically authorized by Leadership.
                        </Typography>
                      </Box>

                      {/* Conduct */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          13. Conduct
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Physical or verbal assaults toward clients, staff,
                          volunteers, or visitors will result in immediate
                          expulsion from Hope House Guthrie.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Profanity and vulgar language are not allowed. Clients
                          are expected to comply with administration requests
                          and program guidelines. Failure to do so is considered
                          insubordination.
                        </Typography>
                      </Box>

                      {/* Bars & Casinos */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          14. Bars & Casinos
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Clients participating in the Emergency/Temporary
                          Shelter Program or Life Transformation Program are not
                          permitted to visit bars or casinos.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          This includes entering the premises, remaining
                          on-site, or participating in activities associated
                          with bars or casinos.
                        </Typography>
                      </Box>
    </Box>
  ),
  "responsibilities": (
    <Box sx={{ mt: 3 }}>

                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Responsibilities & Daily Life
                      </Typography>
                      {/* Community Service & Housework */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          15. Community Service & Housework
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          All community service, chores, or housework assigned
                          to TEMP or LTP clients is mandatory and must be
                          completed as directed.
                        </Typography>
                      </Box>

                      {/* Transportation */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          16. Transportation
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Clients are responsible for arranging their own
                          transportation to appointments, meetings, work, and
                          other activities.
                        </Typography>

                        <Typography sx={{ mt: 1 }}>
                          If transportation assistance from Hope House Guthrie
                          is needed, the request must be added to the Daily
                          Activities calendar at least one week in advance.
                        </Typography>

                        <Typography sx={{ mt: 1 }}>
                          Eligible clients may also use SoonerRide for
                          transportation to qualifying appointments. Rides can
                          be scheduled by phone at 877-404-4500, through the
                          Modivcare app, or online at
                          https://member.modivcare.com/en/login.
                        </Typography>
                      </Box>

                      {/* SSI/SSDI */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          17. SSI/SSDI
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Clients who enter Hope House Guthrie without an active
                          or pending SSI/SSDI case supported by documentation
                          may not begin a new SSI/SSDI application in place of
                          seeking employment.
                        </Typography>
                      </Box>

                      {/* Roll Call */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          18. Roll Call
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Roll Call is mandatory for all clients.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Roll Call takes place at 8:00 AM Monday thru Friday
                          and 10:00 AM Saturday and Sunday.
                        </Typography>
                      </Box>

                      {/* Curfew */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          19. Curfew
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Curfew is 10:00 PM Sunday through Thursday and 11:00
                          PM Friday and Saturday.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          A 15-minute warning will be given before curfew. At
                          curfew, TV must be turned off, lights turned out, and
                          common areas shut down.
                        </Typography>
                      </Box>

                      {/* Laundry */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          20. Laundry
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Hope House Guthrie provides each client with two
                          laundry detergent pods and two dryer sheets per week.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Laundry schedules are posted on the laundry room doors
                          and must be followed.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Clients who have an income are responsible for
                          purchasing their own basic personal essentials like
                          laundry detergent, hygiene, toilet paper.
                        </Typography>
                      </Box>

                      {/* Room Inspections */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          21. Room Inspections
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Administration may conduct random room inspections.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Client rooms and bathrooms must be kept clean and free
                          of clutter. This includes dresser drawers, desk, and
                          other personal storage areas.
                        </Typography>
                      </Box>

                      {/* Chain of Command */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          22. Chain of Command
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Clients are expected to follow Hope House Guthries
                          Chain of Command when they have a question, concern,
                          or problem.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Begin with your House Leader. If the issue is not
                          resolved, speak with administration which goes the
                          Senior House Leader and then Administrator.
                        </Typography>
                      </Box>
    </Box>
  ),
  "community-rules": (
    <Box sx={{ mt: 3 }}>

                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Personal & Community
                      </Typography>

                      {/* Pets */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          23. Pets
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Hope House Guthrie does not accept pets, including
                          emotional support animals (ESAs) or service animals.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Animals that were already residing at Hope House
                          Guthrie before this policy went into effect may have
                          been grandfathered in and are not considered an
                          exception for new admissions.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          This is an administrative decision.
                        </Typography>
                      </Box>

                      {/* Loaning Money */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          24. Loaning Money
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Clients are strongly discouraged from loaning,
                          borrowing, or exchanging money with other clients.
                          Financial arrangements between clients can create
                          conflicts, misunderstandings, or pressure between
                          individuals.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          If money or property is given as a genuine gift, it
                          must be given freely with no expectation of repayment,
                          favors, services, or anything else in return.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Hope House Guthrie is not responsible for money or
                          property loaned, borrowed, exchanged, or given between
                          clients.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Cash, checks, money orders and other valuables should
                          be secured in your assigned locker when available.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          A personal financial budget will also be required
                          during your first evaluation.
                        </Typography>
                      </Box>

                      {/* Client Relationships */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          25. Client Relationships
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Neighborhood Hope Dealers, Inc., dba Hope House
                          Guthrie, does not allow personal or sexual
                          relationships between clients during the program,
                          regardless of sex.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Clients should speak with Administration about the
                          3-Foot Rule.
                        </Typography>
                      </Box>

                      {/* Maintenance Tools */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          26. Maintenance Tools
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Clients must receive prior authorization from
                          Administration or the Maintenance Manager before using
                          any tools in the maintenance room.
                        </Typography>
                      </Box>

                      {/* Super Saturday */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          27. Super Saturday
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          The first Saturday of every month is Hope House
                          Guthrie's Super Saturday. No visitation or pass
                          requests will be approved before 2:00 PM.
                        </Typography>
                      </Box>

                      {/* Intake Waivers */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          28. Intake Waivers
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Clients must follow all waivers they initialed and
                          signed during intake.
                        </Typography>
                        <Typography sx={{ mt: 0.5 }}>
                          This is an administrative decision.
                        </Typography>
                      </Box>

                      {/* Personal Belongings */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          29. Personal Belongings
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Clients may not keep an excessive amount of clothing
                          or personal belongings at Hope House Guthrie.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Clients may have no more than 8 changes of personal
                          clothing, excluding work uniforms.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          If a client's room contains excessive belongings, they
                          may be required to obtain a storage unit and reduce
                          the amount of property kept at Hope House Guthrie.
                        </Typography>
                      </Box>

                      {/* Children */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          30. Children
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Visiting children must be supervised by an adult
                          family member at all times.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Children living at Hope House Guthrie must be
                          supervised by their parent.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Running inside the facility is prohibited.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Children must be in bed by 8:30 PM each day.
                        </Typography>
                      </Box>

                      {/* Shoes */}
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          31. Shoes
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Shoes must be worn at all times while in the common
                          areas of the facility.
                        </Typography>
                      </Box>
    </Box>
  ),
  "safety": (
    <Box sx={{ mt: 3 }}>

                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Dress, Transportation & Safety
                      </Typography>

                      {/* Dress for Success */}
                      <Box sx={{ mt: 3 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          32. Dress for Success
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          The Dress for Success policy is in effect Monday
                          through Friday, from 8:45 AM to 5:00 PM.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Clothing must be neat, modest, and appropriate.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Exposed undergarments are not permitted.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          For questions regarding the dress code, please speak
                          with Administration.
                        </Typography>
                      </Box>

                      {/* Transportation Assistance */}
                      <Box sx={{ mt: 3 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          33. Transportation Assistance
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Hope House Guthrie may provide transportation
                          assistance for appointments, employment, and other
                          program-related activities when available.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          When transportation is provided, clients may be asked
                          to make a voluntary cost-sharing contribution to help
                          offset vehicle operating expenses such as fuel and
                          maintenance.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          This contribution is not a fee for services and is not
                          required as a condition of participation in housing,
                          meals, or program services.
                        </Typography>
                      </Box>

                      {/* Prohibited Substances */}
                      <Box sx={{ mt: 3 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          34. Prohibited Substances
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Medical marijuana cards, CBD products, Kratom,
                          Suboxone, Subutex, and Methadone are not recognized or
                          permitted.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          This is an administrative decision.
                        </Typography>
                      </Box>

                      {/* Medication Procedures */}
                      <Box sx={{ mt: 3 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          35. Medication Procedures
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Clients must complete their medication sheet each time
                          they receive their medications.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Active clients may not keep prescription or
                          over-the-counter medications in their rooms. All
                          client medications must be stored and handled
                          according to Hope House Guthrie's medication
                          procedures.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          Neighborhood Hope Dealers, Inc., dba Hope House
                          Guthrie, reserves the right to conduct medication
                          checks whenever deemed necessary.
                        </Typography>
                      </Box>

                      {/* Misuse of Products */}
                      <Box sx={{ mt: 3 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          36. Misuse of Products
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          Anyone caught or suspected of using products for
                          inhalation or for purposes other than their intended
                          use will be asked to vacate the premises.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          This policy is intended to promote a safe environment
                          for everyone.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          All visitors are expected to follow this policy and
                          use products only as intended.
                        </Typography>
                      </Box>
    </Box>
  ),
  "counseling": (
    <Box sx={{ mt: 3 }}>

                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Counseling
                      </Typography>

                      {/* Counseling */}
                      <Box sx={{ mt: 3 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          37. Counseling
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          All clients are required to attend all scheduled
                          counseling sessions.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          All clients are required to complete a minimum of 8
                          counseling sessions with an approved counselor or
                          behavioral health provider. Local options include
                          Beacon of Hope, NorthCare and Logan Community Services
                          (LCS), but clients may use another provider with
                          approval.
                        </Typography>
                      </Box>

                      {/* Client Acknowledgment */}
                      <Box sx={{ mt: 3 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          Client Acknowledgment
                        </Typography>

                        <Typography sx={{ mt: 0.5 }}>
                          I acknowledge that I have received a copy of the
                          Neighborhood Hope Dealers, Inc., dba Hope House
                          Guthrie Client Handbook & Program Guidelines.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          I have read, or have had these guidelines explained to
                          me, and I understand that I am responsible for
                          following all program rules, policies, and
                          expectations.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          I understand that failure to comply with these
                          guidelines may result in disciplinary action, up to
                          and including discharge from the program.
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          I further acknowledge that I have been given the
                          opportunity to ask questions regarding these
                          guidelines and that all questions have been answered
                          to my satisfaction.
                        </Typography>
                      </Box>
    </Box>
  ),
};

/** Render static handbook body for the selected tab id (empty if unknown). */
export function renderHandbookTabContent(tabId: string): ReactNode {
  return handbookContentByTab[tabId] ?? null;
}
