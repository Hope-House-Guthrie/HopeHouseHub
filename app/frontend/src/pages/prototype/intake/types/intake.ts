/**
 * Frontend Intake prototype record types.
 *
 * These describe in-memory Draft and Completed intake records used by the
 * Client Intake page workflow. They are NOT backend/API DTOs — a future
 * backend may map similar shapes to persistent storage.
 *
 * formData is the snapshot bridge between the page's many UI useState fields
 * and Draft/Completed list records (via buildIntakeData / loadIntakeData).
 *
 * IntakeFormData / LiveIntakeForm / createEmptyIntakeForm are the foundation
 * for a future single live-form object migration. Phase 5A-1 adds them only;
 * index.tsx still owns individual useState fields until a later phase.
 */

/** Snapshot of all intake form fields at save/complete time (136 fields). */
export type IntakeFormData = {
  firstName: string;
  middleName: string;
  lastName: string;
  preferredName: string;
  dateOfBirth: string;
  phoneNumber: string;
  ssnFirst: string;
  ssnMiddle: string;
  ssnLast: string;
  ssnStatus: string;
  veteranStatus: string;
  medicalAllergies: string;
  noMedicalAllergies: boolean;
  foodAllergies: string;
  noFoodAllergies: boolean;
  dietaryNeeds: string[];
  otherDietaryNeed: string;
  emergencyContactName: string;
  emergencyContactPhoneNumber: string;
  emergencyContactRelationship: string;
  roomNumber: string;
  medRoomLockerNumber: string;
  suicideWishDead: string;
  suicideBetterOffDead: string;
  suicideThoughts: string;
  suicideAttemptHistory: string;
  suicideAttemptHow: string;
  suicideAttemptWhen: string;
  suicideCurrentThoughts: string;
  suicideCurrentThoughtsDescription: string;
  outDate: string;
  hopeHouseNumber: string;
  hmisNumber: string;
  hasMinorChildren: string;
  minorChildren: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    ssnFirst: string;
    ssnMiddle: string;
    ssnLast: string;
  }[];
  gender: string;
  race: string[];
  ethnicity: string;
  household: string;
  domesticViolence: boolean;
  fosterCare: boolean;
  humanTrafficking: boolean;
  domesticViolenceDate: string;
  currentlyFleeing: string;
  firstTimeHomeless: string;
  totalTimesHomeless: string;
  priorLivingSituation: string;
  priorLivingStayLength: string;
  priorLivingStayUnit: string;
  homelessnessStartDate: string;
  homelessEpisodesPastThreeYears: string;
  homelessMonthsPastThreeYears: string;
  lastPlaceStayed: string;
  lastPlaceCity: string;
  lastPlaceCounty: string;
  lastPlaceState: string;

  currentlyEmployed: string;
  employerName: string;
  monthlyEmploymentIncome: string;
  hasOtherIncome: string;
  otherIncomeSources: string[];
  otherIncomeDescription: string;
  monthlyOtherIncome: string;
  highestEducationCompleted: string;
  schoolName: string;

  snapBenefits: string;
  snapLoadDay: string;
  snapAcknowledgmentDate: string;
  snapMonthlyAmount: string;
  soonerCareBenefits: string;
  soonerCarePlan: string;
  soonerCareId: string;
  medicaidBenefits: string;
  medicareBenefits: string;
  wicBenefits: string;
  tanfBenefits: string;
  employerInsurance: string;
  otherStateHealthInsurance: string;
  hasSavingsAccount: string;
  hasCheckingAccount: string;

  misdemeanorConviction: string;
  misdemeanorDetails: string;
  felonyConviction: string;
  felonyDetails: string;
  onProbation: string;
  onParole: string;
  hasArrestWarrants: string;
  hasUnpaidTickets: string;
  childSupportStatus: string;
  monthlyChildSupportAmount: string;
  owesLandlordMoney: string;
  landlordAmountOwed: string;
  owesUtilityMoney: string;
  utilityAmountOwed: string;
  hasEvictionHistory: string;
  hasPaidStorage: string;

  hasSubstanceUseConcerns: string;
  substancesUsed: string[];
  otherSubstance: string;
  substanceUseDetails: string;
  currentlyReceivingMedicalTreatment: string;
  medicalTreatmentDetails: string;
  healthSupportNeeds: string[];
  otherHealthSupportNeed: string;
  healthSupportDetails: Record<string, string>;
  socialFinancialSupport: string[];
  otherSocialFinancialSupport: string;
  childrenInSchoolOrChildcare: string;
  religiousSpiritualTraditions: string;

  childSupportDhsInitials: string;
  medicationResponsibilityInitials: string;
  vehicleTransportationInitials: string;
  possessionsInitials: string;
  programGuidelinesInitials: string;
  backgroundTestingSearchInitials: string;
  informationSharingInitials: string;
  facilityExpectationsInitials: string;
  volunteerWaiverInitials: string;
  confidentialityAgreementInitials: string;
  coEdAccountabilityInitials: string;
  dressForSuccessInitials: string;
  nondiscriminationInitials: string;
  lifeTransformationProgramInitials: string;
  overnightProgramInitials: string;

  clientProgram: string;
  temporaryShelterProgramInitials: string;

  covidVaccinated: string;
  covidVaccinationDate: string;
  covidVaccinationAppointmentDate: string;
  covidVaccinationProof: string;
  covidVaccinationProofFile: File | null;

  hmisAuthorization: string;
  hmisSignature: string;
  hmisSignatureDate: string;
  finalClientSignature: string;
  finalAdminSignature: string;
};

/**
 * Live page form model = formData snapshot fields + intakeDate.
 * intakeDate is draft top-level today (not inside formData).
 */
export type LiveIntakeForm = IntakeFormData & {
  intakeDate: string;
};

/**
 * Fresh empty live form matching current useState / startNewIntake defaults.
 * Call per init/reset so arrays and records are new references.
 */
export function createEmptyIntakeForm(): LiveIntakeForm {
  return {
    intakeDate: "",
    firstName: "",
    middleName: "",
    lastName: "",
    preferredName: "",
    dateOfBirth: "",
    phoneNumber: "",
    ssnFirst: "",
    ssnMiddle: "",
    ssnLast: "",
    ssnStatus: "",
    veteranStatus: "",
    medicalAllergies: "",
    noMedicalAllergies: false,
    foodAllergies: "",
    noFoodAllergies: false,
    dietaryNeeds: [],
    otherDietaryNeed: "",
    emergencyContactName: "",
    emergencyContactPhoneNumber: "",
    emergencyContactRelationship: "",
    roomNumber: "",
    medRoomLockerNumber: "",
    suicideWishDead: "",
    suicideBetterOffDead: "",
    suicideThoughts: "",
    suicideAttemptHistory: "",
    suicideAttemptHow: "",
    suicideAttemptWhen: "",
    suicideCurrentThoughts: "",
    suicideCurrentThoughtsDescription: "",
    outDate: "",
    hopeHouseNumber: "",
    hmisNumber: "",
    hasMinorChildren: "",
    minorChildren: [],
    gender: "",
    race: [],
    ethnicity: "",
    household: "",
    domesticViolence: false,
    fosterCare: false,
    humanTrafficking: false,
    domesticViolenceDate: "",
    currentlyFleeing: "",
    firstTimeHomeless: "",
    totalTimesHomeless: "",
    priorLivingSituation: "",
    priorLivingStayLength: "",
    priorLivingStayUnit: "",
    homelessnessStartDate: "",
    homelessEpisodesPastThreeYears: "",
    homelessMonthsPastThreeYears: "",
    lastPlaceStayed: "",
    lastPlaceCity: "",
    lastPlaceCounty: "",
    lastPlaceState: "",

    currentlyEmployed: "",
    employerName: "",
    monthlyEmploymentIncome: "",
    hasOtherIncome: "",
    otherIncomeSources: [],
    otherIncomeDescription: "",
    monthlyOtherIncome: "",
    highestEducationCompleted: "",
    schoolName: "",

    snapBenefits: "",
    snapLoadDay: "",
    snapAcknowledgmentDate: "",
    snapMonthlyAmount: "",
    soonerCareBenefits: "",
    soonerCarePlan: "",
    soonerCareId: "",
    medicaidBenefits: "",
    medicareBenefits: "",
    wicBenefits: "",
    tanfBenefits: "",
    employerInsurance: "",
    otherStateHealthInsurance: "",
    hasSavingsAccount: "",
    hasCheckingAccount: "",

    misdemeanorConviction: "",
    misdemeanorDetails: "",
    felonyConviction: "",
    felonyDetails: "",
    onProbation: "",
    onParole: "",
    hasArrestWarrants: "",
    hasUnpaidTickets: "",
    childSupportStatus: "",
    monthlyChildSupportAmount: "",
    owesLandlordMoney: "",
    landlordAmountOwed: "",
    owesUtilityMoney: "",
    utilityAmountOwed: "",
    hasEvictionHistory: "",
    hasPaidStorage: "",

    hasSubstanceUseConcerns: "",
    substancesUsed: [],
    otherSubstance: "",
    substanceUseDetails: "",
    currentlyReceivingMedicalTreatment: "",
    medicalTreatmentDetails: "",
    healthSupportNeeds: [],
    otherHealthSupportNeed: "",
    healthSupportDetails: {},
    socialFinancialSupport: [],
    otherSocialFinancialSupport: "",
    childrenInSchoolOrChildcare: "",
    religiousSpiritualTraditions: "",

    childSupportDhsInitials: "",
    medicationResponsibilityInitials: "",
    vehicleTransportationInitials: "",
    possessionsInitials: "",
    programGuidelinesInitials: "",
    backgroundTestingSearchInitials: "",
    informationSharingInitials: "",
    facilityExpectationsInitials: "",
    volunteerWaiverInitials: "",
    confidentialityAgreementInitials: "",
    coEdAccountabilityInitials: "",
    dressForSuccessInitials: "",
    nondiscriminationInitials: "",
    lifeTransformationProgramInitials: "",
    overnightProgramInitials: "",

    clientProgram: "",
    temporaryShelterProgramInitials: "",

    covidVaccinated: "",
    covidVaccinationDate: "",
    covidVaccinationAppointmentDate: "",
    covidVaccinationProof: "",
    covidVaccinationProofFile: null,

    hmisAuthorization: "",
    hmisSignature: "",
    hmisSignatureDate: "",
    finalClientSignature: "",
    finalAdminSignature: "",
  };
}

export type IntakeDraft = {
  id: number;
  clientName: string;
  intakeDate: string;
  lastUpdated: string;
  startedBy: string;
  lastUpdatedBy: string;

  /** Snapshot of all intake form fields at save/complete time. */
  formData: IntakeFormData;
};

/** Completed intake plus review workflow metadata (frontend-only). */
export type CompletedIntake = IntakeDraft & {
  hopeHouseNumber: string;
  completedAt: string;
  completedBy: string;
  reviewedBy: string;
  reviewedAt: string;
  lastEditedBy: string;
  lastEditedAt: string;
  /** Frontend review workflow: pending staff review vs review finished. */
  reviewStatus: "Pending Review" | "Review Complete";
};
