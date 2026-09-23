/**
 * Static SNAP Benefits Notice content for the Intake frontend prototype.
 *
 * Interactive fields (SNAP status display from form state, participant name,
 * acknowledgment date) stay in index.tsx. This module is frontend static
 * client-facing notice text only — not a CMS/backend source.
 *
 * Policy/notice wording changes should be reviewed deliberately.
 */

import { Typography } from "@mui/material";

/** Title, intro, and Important SNAP Benefits Information policy paragraphs. */
export function SnapNoticePolicyContent() {
  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        SNAP Benefits Notice
      </Typography>
      <Typography sx={{ mt: 2 }}>
        SNAP benefit information collected during intake will be used for this
        acknowledgment.
      </Typography>
      <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>
        Important SNAP Benefits Information
      </Typography>
      <Typography sx={{ mt: 1 }}>
        NHD/Hope House Guthrie does not take, hold, manage, or require access to
        any participant&apos;s Supplemental Nutrition Assistance Program (SNAP)
        benefits. All SNAP benefits remain the sole property and responsibility
        of the participant.
      </Typography>
      <Typography sx={{ mt: 2 }}>
        At this time, NHD/Hope House Guthrie is seeking guidance from the
        Oklahoma Department of Mental Health and Substance Abuse Services to
        become a provider-certified treatment center. Until formal certification
        is received, Hope House Guthrie will not act as an authorized
        representative for SNAP benefits.
      </Typography>
      <Typography sx={{ mt: 2 }}>
        Participation in this program is not dependent on SNAP benefit status,
        use, or non-use. No participant will be penalized, denied services, or
        treated differently for how they choose to use or manage their SNAP
        benefits, or for asking questions about their rights.
      </Typography>
    </>
  );
}

/** Acknowledgment section heading + static acknowledgment paragraph. */
export function SnapNoticeAcknowledgmentCopy() {
  return (
    <>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Participant Acknowledgment
      </Typography>

      <Typography sx={{ mt: 1 }}>
        I understand that NHD/Hope House Guthrie does not require access to my
        SNAP benefits and that I retain full control over my benefits.
      </Typography>
    </>
  );
}
