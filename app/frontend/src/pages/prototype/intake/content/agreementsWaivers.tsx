/**
 * Client-facing static Agreements & Waivers policy copy for the Intake
 * frontend prototype.
 *
 * index.tsx owns all initials TextFields, form state, and build/load/reset.
 * Display-only props supply intakeDate / participantName where legal text
 * already interpolates them. Not a CMS/backend source — wording changes
 * should be deliberate. Existing typos in copy are preserved until a
 * separate content-fix pass.
 */

import { Typography } from "@mui/material";

export function AgreementsWaiversTitle() {
  return (
    <Typography variant="h6" sx={{ fontWeight: 600 }}>
      Agreements & Waivers
    </Typography>
  );
}

export function AgreementChildSupportDhsCopy() {
  return (
    <>
    <Typography>
      At NHD/Hope House Guthrie, we make sure to comply with
      the rules and regulations set by Child Support Services
      and the Department of Human Services. We understand the
      importance of following these guidelines for the
      well-being and safety of our community.
    </Typography>
    </>
  );
}

export function AgreementMedicationResponsibilityCopy() {
  return (
    <>
    <Typography>
      We want to remind you that NHD/Hope House Guthrie cannot
      be held responsible for any instances of medication
      misuse, theft, or loss. It is important that you take
      additional measures to protect your medications and
      prioritize your safety and health. As a precaution, we
      will assign lockers to each client to ensure the safety
      of your medication.
    </Typography>
    </>
  );
}

export function AgreementVehicleTransportationCopy() {
  return (
    <>
    <Typography>
      All vehicles on NHD/Hope House Guthrie property are
      subject to search at any time. As a client, it is
      important to acknowledge and comply with this policy to
      ensure the safety and well-being of all individuals on
      the property. In addition, I understand that NHD/Hope
      House Guthrie and its clients are not responsible for
      any accident that may cause injury, property damage, or
      death due to transportation provided by the facility or
      by other clients. I fully accept any risks involved in
      transportation and agree to hold NHD/Hope House Guthrie
      and its clients harmless from any liability related to
      transportation. This agreement applies to myself and my
      children, if applicable. Thank you for prioritizing
      safety and health in all aspects of our stay at NHD/Hope
      House Guthrie.
    </Typography>
    </>
  );
}

export function AgreementPossessionsCopy() {
  return (
    <>
    <Typography>
      If you are separated from NHD/Hope House Guthrie for any
      reason, it is important to note that you have 48 hours
      (about 2 days) to remove your possessions from the
      property. Failure to do so within this time frame could
      result in your possessions becoming NHD/Hope House
      Guthrie property.
    </Typography>
    </>
  );
}

export function AgreementProgramGuidelinesCopy() {
  return (
    <>
    <Typography>
      You have agreed to follow all guidelines as a client of
      NHD/Hope House Guthrie's Life Transformation Program or
      Emergency Shelter Program. It's great to see that you
      are committed to your journey towards transformation and
      growth.
    </Typography>
    </>
  );
}

export function AgreementBackgroundTestingSearchCopy() {
  return (
    <>
    <Typography>
      I understand and consent to the performance of
      background checks, sharing information with law
      enforcement, drug and alcohol testing and search and
      seizure of property at the NHD/Hope House Guthrie.
    </Typography>
    </>
  );
}

export function AgreementInformationSharingCopy() {
  return (
    <>
    <Typography>
      Please be aware that any information shared between our
      agency and the relevant person or organization will be
      utilized exclusively to facilitate mutual planning
      services. Our goal is to ensure that both parties'
      benefit from this information exchange.
    </Typography>
    </>
  );
}

export function AgreementFacilityExpectationsCopy() {
  return (
    <>
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: 600, mb: 1 }}
    >
      Facility Bedroom & Utility Expectations
    </Typography>

    <Typography component="div">
      <ul>
        <li>Fans are not permitted in client bedrooms.</li>
        <li>
          TVs must be turned off whenever the client leaves
          their room.
        </li>
        <li>
          Bedroom lights must be turned off whenever the
          client leaves their room. Night lights and LED
          lights are permitted.
        </li>
        <li>
          Please report leaking faucets, toilets, or other
          water leaks to staff as soon as possible. Faucets
          that are difficult to shut off should also be
          reported.
        </li>
        <li>
          Food and soda are not permitted in client bedrooms
          to help prevent pests and maintain a clean living
          environment.
        </li>
        <li>
          TVs and regular bedroom lights must be turned off by
          12:00 a.m.
        </li>
      </ul>
    </Typography>

    <Typography>
      These guidelines are intended to help maintain a safe,
      clean, and comfortable living environment while
      conserving facility resources. By initialing below, the
      client confirms that these expectations have been
      reviewed and understood and agrees to follow them while
      staying at Hope House Guthrie.
    </Typography>
    </>
  );
}

export function AgreementVolunteerReleaseCopy({
  intakeDate,
  participantName,
}: {
  intakeDate: string;
  participantName: string;
}) {
  return (
    <>
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: 600, mb: 1 }}
    >
      Volunteer Release and Waiver of Liability
    </Typography>

    <Typography>
      This Volunteer Release and Waiver of Liability (the
      "Release") is executed on {intakeDate} on behalf of{" "}
      {participantName}{" "}
      (the "Volunteer" same as Client). The Volunteer releases
      NHD/Hope House Guthrie (the "Nonprofit"), a nonprofit
      Community Service Club organized and existing under the
      laws of the United States as a Section 501(c)(3) tax
      exempt corporation, each of its directors, officers,
      employees, and agents.
    </Typography>

    <Typography sx={{ mt: 2 }}>
      I, the above named Volunteer, do hereby give my consent
      to participation in all activities of the Nonprofit. The
      Volunteer understands that the scope of the Volunteer's
      relationship with Nonprofit is limited to a volunteer
      position and that no compensation is expected in return
      for services provided by Volunteer; and that Nonprofit
      will not provide any benefits traditionally associated
      with employment to Volunteer.
    </Typography>

    <Typography sx={{ mt: 2 }}>
      The Volunteer desires that the Volunteer engage in
      activities related to serving or participating in the
      Nonprofit's activities as a player, participant or
      volunteer. The Volunteer is responsible for the
      Volunteer's own insurance coverage in the event of
      personal injury or illness as a result of participation
      in activities of the Nonprofit.
    </Typography>

    <Typography
      variant="subtitle2"
      sx={{ mt: 2, fontWeight: 600 }}
    >
      1. Waiver and Release
    </Typography>

    <Typography sx={{ mt: 1 }}>
      I release and forever discharge and hold harmless
      Nonprofit and its successors and assigns from any and
      all liability, claims, and demands of whatever kind or
      nature, either in law or in equity, which arise or may
      hereafter arise from the activities as a Volunteer with
      the Nonprofit, including claims arising out of
      negligence.
    </Typography>

    <Typography sx={{ mt: 1 }}>
      I understand and acknowledge that this Release
      Discharges Nonprofit from any liability or claim that I
      may have against Nonprofit with respect to bodily
      injury, personal injury, illness, death, or property
      damage that may result from the services the Volunteer
      provides to Nonprofit or occurring while Volunteer is
      providing volunteer services.
    </Typography>

    <Typography
      variant="subtitle2"
      sx={{ mt: 2, fontWeight: 600 }}
    >
      2. Insurance
    </Typography>

    <Typography sx={{ mt: 1 }}>
      I affirm that I am covered by primary medical insurance
      and understand that I am responsible for my medical
      bills if injury occurs. Further, I understand that
      Nonprofit does not assume any responsibility for or
      obligation to provide the Volunteer with financial or
      other assistance, including but not limited to medical,
      health or disability benefits or insurance of any nature
      in the event of the Volunteer's injury, illness, death
      or damage to his or her property.
    </Typography>

    <Typography sx={{ mt: 1 }}>
      I expressly waive any such claim for compensation or
      liability on the part of Nonprofit beyond what may be
      offered freely by Nonprofit in the event of such injury
      or medical expenses incurred by the Volunteer.
    </Typography>

    <Typography
      variant="subtitle2"
      sx={{ mt: 2, fontWeight: 600 }}
    >
      3. Assumption of Risk
    </Typography>

    <Typography sx={{ mt: 1 }}>
      I understand that the services provided by me to
      Nonprofit may include activities that are inherently
      dangerous to me, including but not limited to MACHINERY.
      I hereby expressly assume the risk of injury or harm to
      me from these activities and Release Nonprofit from all
      liability for injury, illness, death, or property damage
      resulting from the services I provide as a volunteer or
      occurring while I am participating in events.
    </Typography>

    <Typography
      variant="subtitle2"
      sx={{ mt: 2, fontWeight: 600 }}
    >
      4. Photographic Release
    </Typography>

    <Typography sx={{ mt: 1 }}>
      I, grant and convey to Nonprofit all right, title, and
      interests in any and all photographs, images, video or
      audio recordings of the Volunteer or his or her likeness
      or voice made by Nonprofit in connection with the
      Volunteer participating in Nonprofit events, including
      but not limited to, any royalties, proceeds, or other
      benefits derived from such photographs or recordings.
    </Typography>

    <Typography
      variant="subtitle2"
      sx={{ mt: 2, fontWeight: 600 }}
    >
      5. Medical Treatment
    </Typography>

    <Typography sx={{ mt: 1 }}>
      I, hereby release and forever discharge Nonprofit from
      any claim whatsoever which arises or may hereafter arise
      on account of any first-aid treatment or other medical
      services rendered in connection with an emergency during
      my tenure as a volunteer with Nonprofit. I give my
      consent for the Nonprofit to provide, administer, or
      obtain medical treatment for me.
    </Typography>

    <Typography
      variant="subtitle2"
      sx={{ mt: 2, fontWeight: 600 }}
    >
      6. Other
    </Typography>

    <Typography sx={{ mt: 1 }}>
      I, expressly agree that this Release is intended to be
      as broad and inclusive as permitted by the laws of the
      State of OKLAHOMA and that this Release shall be
      governed by and interpreted in accordance with the laws
      of the State of OKLAHOMA. I agree that in the event that
      any clause or provision of this Release is deemed
      invalid, the enforceability of the remaining provisions
      of this Release shall not be affected. By signing below,
      I, the above named Volunteer, express my understanding
      and intent to enter into this Release and Waiver of
      Liability knowingly and voluntarily.
    </Typography>
    </>
  );
}

export function AgreementConfidentialityCopy({
  intakeDate,
}: {
  intakeDate: string;
}) {
  return (
    <>
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: 600, mb: 1 }}
    >
      Confidentiality Agreement
    </Typography>

    <Typography>
      This Confidentiality Agreement ("Agreement") is entered
      into as of {intakeDate}, by and between NHD/Hope House
      Guthrie, a 501(c)(3) non-profit organization.
    </Typography>

    <Typography
      variant="subtitle2"
      sx={{ mt: 2, fontWeight: 600 }}
    >
      1. Definition of Confidential Information
    </Typography>

    <Typography sx={{ mt: 1 }}>
      For the purposes of this Agreement, "Confidential
      Information" shall mean any information or material that
      is proprietary to the Organization, including but not
      limited to, business plans, financial information, donor
      lists, strategic plans, and any other information marked
      as confidential.
    </Typography>

    <Typography
      variant="subtitle2"
      sx={{ mt: 2, fontWeight: 600 }}
    >
      2. Obligations of Recipient
    </Typography>

    <Typography sx={{ mt: 1 }}>
      Recipient agrees to hold all Confidential Information in
      strict confidence and to take all reasonable precautions
      to protect such Confidential Information. Recipient
      shall not disclose, reproduce, or use the Confidential
      Information for any purpose other than as expressly
      authorized by the Organization.
    </Typography>

    <Typography
      variant="subtitle2"
      sx={{ mt: 2, fontWeight: 600 }}
    >
      3. Exceptions
    </Typography>

    <Typography sx={{ mt: 1 }}>
      The obligations set forth in this Agreement shall not
      apply to any information that (a) is or becomes publicly
      known through no wrongful act of the Recipient, (b) is
      rightfully received by the Recipient from a third party
      without restriction, (c) is independently developed by
      the Recipient without reference to the Organization's
      Confidential Information, or (d) is required to be
      disclosed by law.
    </Typography>

    <Typography
      variant="subtitle2"
      sx={{ mt: 2, fontWeight: 600 }}
    >
      4. Term
    </Typography>

    <Typography sx={{ mt: 1 }}>
      This Agreement shall be effective as of {intakeDate}{" "}
      until the exit date of the client and any minor
      children.
    </Typography>

    <Typography
      variant="subtitle2"
      sx={{ mt: 2, fontWeight: 600 }}
    >
      5. Governing Law
    </Typography>

    <Typography sx={{ mt: 1 }}>
      This Agreement shall be governed by and construed in
      accordance with the laws of the state of OKLAHOMA,
      without giving effect to any choice of law or conflict
      of law provisions.
    </Typography>
    </>
  );
}

export function AgreementCoEdAccountabilityCopy() {
  return (
    <>
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: 600, mb: 1 }}
    >
      Co-Ed Accountability Policy
    </Typography>

    <Typography>
      To maintain a safe, respectful, and structured
      environment, all clients and House Leaders are expected
      to follow the Co-Ed Accountability Policy for off-site
      activities.
    </Typography>

    <Typography component="div" sx={{ mt: 1 }}>
      <ul>
        <li>
          Co-Ed outings are only permitted when accompanied by
          two approved House Leaders and with approval from
          administrative staff.
        </li>
        <li>
          Administrative staff may deny a Co-Ed outing even
          when two House Leaders are available.
        </li>
        <li>
          Approval for a Co-Ed outing will depend on the
          specific situation and the client's past behavior.
        </li>
        <li>
          Clients and House Leaders may not leave the premises
          as a Co-Ed group unless two approved House Leaders
          are present for the entire outing.
        </li>
        <li>
          House Leaders are responsible for maintaining
          accountability and must remain with the group for
          the entire outing.
        </li>
        <li>
          Everyone participating in the outing must leave
          together, remain together, and return together.
        </li>
      </ul>
    </Typography>
    <Typography sx={{ mt: 2 }}>
      This policy applies to all clients and House Leaders.
      Administrative staff are exempt. The policy applies to
      all off-site activities, regardless of length or
      purpose.
    </Typography>
    <Typography sx={{ mt: 2 }}>
      Failure to follow this policy is considered a serious
      violation and may result in immediate disciplinary
      action, up to and including dismissal from the program
      or facility.
    </Typography>
    <Typography sx={{ mt: 2 }}>
      This policy is intended to promote accountability,
      safety, and mutual respect within the Hope House Guthrie
      community.
    </Typography>
    </>
  );
}

export function AgreementDressForSuccessCopy() {
  return (
    <>
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: 600, mb: 1 }}
    >
      Dress for Success
    </Typography>

    <Typography>
      The Hope House Guthrie dress code is intended to
      maintain a clean, appropriate, and professional
      appearance within our community. Our appearance reflects
      both ourselves and Hope House Guthrie and should be
      respectful to clients, staff, donors, visitors, and the
      community.
    </Typography>

    <Typography sx={{ mt: 1 }}>
      This dress code applies to all individuals residing at
      Hope House Guthrie.
    </Typography>

    <Typography component="div" sx={{ mt: 1 }}>
      <ul>
        <li>
          Business casual attire is required Monday through
          Friday from 8:45 a.m. to 5:00 p.m. unless the day's
          activities or work responsibilities require
          different clothing.
        </li>
        <li>
          Clothing must be clean and in good condition,
          without holes, tears, or excessive signs of wear.
          Clients are expected to maintain a clean,
          well-groomed appearance.
        </li>
        <li>Good personal hygiene must be maintained.</li>
        <li>
          Clothing with offensive or inappropriate words,
          images, or designs is not permitted. This includes
          vulgar, racist, sexist, or drug-related content.
        </li>
        <li>
          Tank tops, tube tops, and spaghetti straps are not
          permitted.
        </li>
        <li>
          Pants and shorts must be worn appropriately and may
          not sag. A belt should be worn when needed.
        </li>
        <li>
          Clothing must not be excessively revealing. Shorts
          may not be more than four inches above the knee.
        </li>
        <li>
          Gym shorts, spandex shorts, slides, Crocs,
          flip-flops, pajama or sweatpants, and bathrobes or
          gowns are not permitted during business hours.
        </li>
        <li>
          Clients may have up to eight sets of personal
          clothing. Work-related clothing does not count
          toward this limit.
        </li>
      </ul>
    </Typography>

    <Typography
      variant="subtitle2"
      sx={{ mt: 2, fontWeight: 600 }}
    >
      Dress Code Violations
    </Typography>

    <Typography sx={{ mt: 1 }}>
      Facility Directors and House Leaders will monitor
      compliance with the dress code and will notify clients
      when a violation occurs. Clients are expected to correct
      the issue immediately, which may include returning to
      their bedroom to change clothing.
    </Typography>

    <Typography sx={{ mt: 1 }}>
      Repeated violations, or violations with serious
      consequences, may result in disciplinary action, up to
      and including dismissal from the facility.
    </Typography>
    </>
  );
}

export function AgreementNondiscriminationCopy() {
  return (
    <>
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: 600, mb: 1 }}
    >
      Nondiscrimination and Equal Opportunity Statement
    </Typography>

    <Typography>
      Neighborhood Hope Dealers, Inc. dba Hope House Guthrie
      provides services without discrimination. Assistance is
      not denied on the basis of race, color, national origin,
      religion, sex, age, familial status, disability, marital
      status, veteran status, or any other characteristic
      protected under applicable federal, state, or local law.
    </Typography>

    <Typography sx={{ mt: 1 }}>
      Hope House Guthrie is an equal opportunity provider and
      employer and operates as a nonprofit 501(c)(3)
      organization. Eligibility for services is determined
      based on program criteria and availability.
    </Typography>
    </>
  );
}

