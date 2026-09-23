/**
 * Left-navigation section order and labels for Client Intake.
 *
 * Section `id` values must stay aligned with the section-rendering branches
 * in index.tsx (`activeIntakeSection === "…"`). Do not rename ids without
 * updating those branches.
 */

export const intakeSections = [
  { id: "client-information", label: "Client Information" },
  { id: "suicide-risk-screening", label: "Suicide Risk Screening" },
  { id: "household-family", label: "Household / Family" },
  { id: "hmis-demographics", label: "HMIS / Demographics" },
  { id: "homelessness", label: "Homelessness / Prior Living" },
  { id: "employment-income", label: "Employment, Income & Education" },
  { id: "benefits-insurance", label: "Benefits & Insurance" },
  { id: "legal-housing", label: "Legal & Housing History" },
  { id: "health-support", label: "Health, Substance Use & Support" },
  { id: "agreements-waivers", label: "Agreements & Waivers" },
  { id: "program-assignment", label: "Program Assignment" },
  { id: "covid-health", label: "COVID-19 Health & Safety" },
  { id: "snap-notice", label: "SNAP Benefits Notice" },
  { id: "client-handbook", label: "Client Handbook" },
  { id: "authorizations", label: "Authorizations" },
  { id: "final-review", label: "Final Review" },
];
