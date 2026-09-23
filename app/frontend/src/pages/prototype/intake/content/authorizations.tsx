/**
 * Static client-facing HMIS / ShareLink ROI authorization content for the
 * Intake frontend prototype.
 *
 * index.tsx owns authorization choice (hmisAuthorization), signature
 * (hmisSignature), signature date (hmisSignatureDate), SignatureCanvas, and
 * build/load/reset. This module is frontend static policy copy only — not a
 * CMS/backend source. Wording changes should be deliberate.
 */

import { Box, Typography } from "@mui/material";

export function AuthorizationsHmisRoiCopy() {
  return (
    <>
      <Box
        sx={{
          mt: 3,
          p: 2,
          bgcolor: "#C2E6F6",
          borderRadius: 1,
        }}
      >
        <Typography sx={{ fontWeight: 600 }}>
          Explain to Client
        </Typography>

        <Typography sx={{ mt: 1 }}>
          HMIS/ShareLink is a shared information system used by Hope
          House Guthrie and other service organizations to help
          coordinate services and keep you from having to provide
          the same information over and over.
        </Typography>

        <Typography sx={{ mt: 1 }}>
          If you choose Yes, Hope House Guthrie may enter and share
          information such as your name, contact information,
          employment, housing needs, services you receive, and
          certain health or support information with organizations
          helping provide services to you.
        </Typography>

        <Typography sx={{ mt: 1 }}>
          The purpose is to help organizations understand what
          services you need, determine eligibility, and work
          together to assist you. Your information is not being made
          public.
        </Typography>

        <Typography sx={{ mt: 1 }}>
          You may choose Yes or No. Choosing No does not prevent you
          from receiving services from Hope House Guthrie. If you
          choose Yes, you may later withdraw your authorization in
          writing, although that cannot undo information that was
          already shared.
        </Typography>

        <Typography sx={{ mt: 1 }}>
          The full authorization is below if you would like to
          review the details before making your decision.
        </Typography>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Authorization for Use or Disclosure of Protected Health
          Information
        </Typography>

        <Typography sx={{ mt: 0.5, fontWeight: 600 }}>
          HMIS / ShareLink Release of Information
        </Typography>
      </Box>

      <Typography sx={{ mt: 2, fontWeight: 600 }}>
        Purpose of Sharing
      </Typography>

      <Typography sx={{ mt: 0.5 }}>
        This authorization gives Neighborhood Hope Dealers, Inc.,
        dba Hope House Guthrie permission to share information
        contained in your ShareLink record with organizations using
        ShareLink and with other social service agencies that may
        assist you.
      </Typography>

      <Typography sx={{ mt: 1 }}>
        The purpose of sharing this information is to help determine
        services and eligibility, reduce the need to collect the
        same information repeatedly, and coordinate the delivery of
        services.
      </Typography>

      <Typography sx={{ mt: 2, fontWeight: 600 }}>
        Privacy & Your Rights
      </Typography>

      <Typography sx={{ mt: 0.5 }}>
        Information disclosed under this authorization may no longer
        be protected by certain federal or state privacy laws.
        Organizations participating in ShareLink agree to use the
        information only for the purpose described in this
        authorization.
      </Typography>

      <Typography sx={{ mt: 1 }}>
        You have the right to refuse this authorization. Refusing
        does not affect whether you can receive services from Hope
        House Guthrie or other ShareLink organizations.
      </Typography>

      <Typography sx={{ mt: 1 }}>
        You have the right to receive a copy of this authorization.
      </Typography>

      <Typography sx={{ mt: 2, fontWeight: 600 }}>
        Authorization Duration & Withdrawal
      </Typography>

      <Typography sx={{ mt: 0.5 }}>
        This authorization is valid for three years from the date
        you sign it, or until you obtain permanent housing and are
        no longer receiving support services, whichever is later.
      </Typography>

      <Typography sx={{ mt: 1 }}>
        You may withdraw this authorization at any time by
        submitting your request in writing. Withdrawing your
        authorization does not affect information that was already
        shared before your request was received.
      </Typography>

      <Typography sx={{ mt: 2, fontWeight: 600 }}>
        Who May Receive Your Information
      </Typography>

      <Typography sx={{ mt: 0.5 }}>
        Information may be shared with employees, contractors,
        consultants, and volunteers of organizations participating
        in ShareLink, as well as organizations that do not
        participate in ShareLink when they are assisting with
        services for you.
      </Typography>

      <Typography sx={{ mt: 1 }}>
        Additional organizations may become ShareLink participants
        in the future. You may request an updated list of
        participating organizations.
      </Typography>

      <Typography sx={{ mt: 2, fontWeight: 600 }}>
        Information That May Be Included
      </Typography>

      <Typography sx={{ mt: 0.5 }}>
        Information shared may include your name, address,
        employment, gender, age, and information about assistance or
        services you receive, including food, clothing, housing,
        financial assistance, medical or mental health conditions,
        substance abuse treatment, domestic violence, and other
        services received.
      </Typography>

      <Typography sx={{ mt: 1 }}>
        Certain substance abuse treatment records are specially
        protected under 42 CFR Part 2 and may require a separate,
        specific authorization before they can be disclosed.
      </Typography>

      <Typography sx={{ mt: 2, fontWeight: 600 }}>
        HMIS / Service Point
      </Typography>

      <Typography sx={{ mt: 0.5 }}>
        HMIS / Service Point is a statewide, internet-based shared
        management information system used to help coordinate
        services.
      </Typography>

      <Typography sx={{ mt: 1 }}>
        This authorization also allows your information to be
        entered into the HMIS Service Point system. Medical
        information will not be shared unless you give
        authorization.
      </Typography>
    </>
  );
}
