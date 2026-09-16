import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Tab,
  TableBody,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import SignatureCanvas from "../../../components/SignatureCanvas";

const intakeSections = [
  { id: "client-information", label: "Client Information" },
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

type IntakeDraft = {
  id: number;
  clientName: string;
  intakeDate: string;
  lastUpdated: string;
  formData: {
    firstName: string;
    middleName: string;
    lastName: string;
    preferredName: string;
    dateOfBirth: string;
    phoneNumber: string;
    ssnFirst: string;
    ssnMiddle: string;
    ssnLast: string;
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
};

type CompletedIntake = IntakeDraft & {
  hopeHouseNumber: string;
  completedAt: string;
  reviewStatus: "Pending Review" | "Review Complete";
};

export default function IntakePage() {
  // ---------------------------------------------------------------------------
  // Workflow / Draft State
  // ---------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState(0);
  const [activeDraftId, setActiveDraftId] = useState<number | null>(null);
  const [draftIntakes, setDraftIntakes] = useState<IntakeDraft[]>([]);
  const [activeCompletedIntakeId, setActiveCompletedIntakeId] = useState<
    number | null
  >(null);
  const [completedIntakes, setCompletedIntakes] = useState<CompletedIntake[]>(
    [],
  );
  const [activeIntakeSection, setActiveIntakeSection] =
    useState("client-information");
  const [activeHandbookTab, setActiveHandbookTab] = useState("getting-started");

  // ---------------------------------------------------------------------------
  // Client Information
  // ---------------------------------------------------------------------------
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [intakeDate, setIntakeDate] = useState("");
  const [outDate, setOutDate] = useState("");
  const [hopeHouseNumber, setHopeHouseNumber] = useState("");
  const [hmisNumber, setHmisNumber] = useState("");
  const [ssnFirst, setSsnFirst] = useState("");
  const [ssnMiddle, setSsnMiddle] = useState("");
  const [ssnLast, setSsnLast] = useState("");
  const [veteranStatus, setVeteranStatus] = useState("");
  const [medicalAllergies, setMedicalAllergies] = useState("");
  const [noMedicalAllergies, setNoMedicalAllergies] = useState(false);
  const [foodAllergies, setFoodAllergies] = useState("");
  const [noFoodAllergies, setNoFoodAllergies] = useState(false);
  const [dietaryNeeds, setDietaryNeeds] = useState<string[]>([]);
  const [otherDietaryNeed, setOtherDietaryNeed] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhoneNumber, setEmergencyContactPhoneNumber] =
    useState("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] =
    useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [medRoomLockerNumber, setMedRoomLockerNumber] = useState("");

  // ---------------------------------------------------------------------------
  // Household / Family / HMIS Demographics
  // ---------------------------------------------------------------------------

  const [hasMinorChildren, setHasMinorChildren] = useState("");
  const [minorChildren, setMinorChildren] = useState<
    {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      ssnFirst: string;
      ssnMiddle: string;
      ssnLast: string;
    }[]
  >([]);
  const [gender, setGender] = useState("");
  const [race, setRace] = useState<string[]>([]);
  const [ethnicity, setEthnicity] = useState("");
  const [household, setHousehold] = useState("");
  const [domesticViolence, setDomesticViolence] = useState(false);
  const [fosterCare, setFosterCare] = useState(false);
  const [humanTrafficking, setHumanTrafficking] = useState(false);
  const [domesticViolenceDate, setDomesticViolenceDate] = useState("");
  const [currentlyFleeing, setCurrentlyFleeing] = useState("");

  // ---------------------------------------------------------------------------
  // Homelessness
  // ---------------------------------------------------------------------------

  const [firstTimeHomeless, setFirstTimeHomeless] = useState("");
  const [totalTimesHomeless, setTotalTimesHomeless] = useState("");
  const [priorLivingSituation, setPriorLivingSituation] = useState("");
  const [priorLivingStayLength, setPriorLivingStayLength] = useState("");
  const [priorLivingStayUnit, setPriorLivingStayUnit] = useState("");
  const [homelessnessStartDate, setHomelessnessStartDate] = useState("");
  const [homelessEpisodesPastThreeYears, setHomelessEpisodesPastThreeYears] =
    useState("");
  const [homelessMonthsPastThreeYears, setHomelessMonthsPastThreeYears] =
    useState("");
  const [lastPlaceStayed, setLastPlaceStayed] = useState("");
  const [lastPlaceCity, setLastPlaceCity] = useState("");
  const [lastPlaceCounty, setLastPlaceCounty] = useState("");
  const [lastPlaceState, setLastPlaceState] = useState("");

  // ---------------------------------------------------------------------------
  // Employment / Income / Education
  // ---------------------------------------------------------------------------

  const [currentlyEmployed, setCurrentlyEmployed] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [monthlyEmploymentIncome, setMonthlyEmploymentIncome] = useState("");
  const [hasOtherIncome, setHasOtherIncome] = useState("");
  const [otherIncomeSources, setOtherIncomeSources] = useState<string[]>([]);
  const [otherIncomeDescription, setOtherIncomeDescription] = useState("");
  const [monthlyOtherIncome, setMonthlyOtherIncome] = useState("");
  const [highestEducationCompleted, setHighestEducationCompleted] =
    useState("");
  const [schoolName, setSchoolName] = useState("");

  // ---------------------------------------------------------------------------
  // Benefits / Insurance
  // ---------------------------------------------------------------------------

  const [snapBenefits, setSnapBenefits] = useState("");
  const [snapLoadDay, setSnapLoadDay] = useState("");
  const [snapAcknowledgmentDate, setSnapAcknowledgmentDate] = useState("");
  const [snapMonthlyAmount, setSnapMonthlyAmount] = useState("");
  const [soonerCareBenefits, setSoonerCareBenefits] = useState("");
  const [soonerCarePlan, setSoonerCarePlan] = useState("");
  const [soonerCareId, setSoonerCareId] = useState("");
  const [medicaidBenefits, setMedicaidBenefits] = useState("");
  const [medicareBenefits, setMedicareBenefits] = useState("");
  const [wicBenefits, setWicBenefits] = useState("");
  const [tanfBenefits, setTanfBenefits] = useState("");
  const [employerInsurance, setEmployerInsurance] = useState("");
  const [otherStateHealthInsurance, setOtherStateHealthInsurance] =
    useState("");
  const [hasSavingsAccount, setHasSavingsAccount] = useState("");
  const [hasCheckingAccount, setHasCheckingAccount] = useState("");

  // ---------------------------------------------------------------------------
  // Legal / Housing
  // ---------------------------------------------------------------------------

  const [misdemeanorConviction, setMisdemeanorConviction] = useState("");
  const [misdemeanorDetails, setMisdemeanorDetails] = useState("");
  const [felonyConviction, setFelonyConviction] = useState("");
  const [felonyDetails, setFelonyDetails] = useState("");
  const [onProbation, setOnProbation] = useState("");
  const [onParole, setOnParole] = useState("");
  const [hasArrestWarrants, setHasArrestWarrants] = useState("");
  const [hasUnpaidTickets, setHasUnpaidTickets] = useState("");
  const [childSupportStatus, setChildSupportStatus] = useState("");
  const [monthlyChildSupportAmount, setMonthlyChildSupportAmount] =
    useState("");
  const [owesLandlordMoney, setOwesLandlordMoney] = useState("");
  const [landlordAmountOwed, setLandlordAmountOwed] = useState("");
  const [owesUtilityMoney, setOwesUtilityMoney] = useState("");
  const [utilityAmountOwed, setUtilityAmountOwed] = useState("");
  const [hasEvictionHistory, setHasEvictionHistory] = useState("");
  const [hasPaidStorage, setHasPaidStorage] = useState("");

  // ---------------------------------------------------------------------------
  // Health / Support
  // ---------------------------------------------------------------------------

  const [hasSubstanceUseConcerns, setHasSubstanceUseConcerns] = useState("");
  const [substancesUsed, setSubstancesUsed] = useState<string[]>([]);
  const [otherSubstance, setOtherSubstance] = useState("");
  const [substanceUseDetails, setSubstanceUseDetails] = useState("");
  const [
    currentlyReceivingMedicalTreatment,
    setCurrentlyReceivingMedicalTreatment,
  ] = useState("");
  const [medicalTreatmentDetails, setMedicalTreatmentDetails] = useState("");
  const [healthSupportNeeds, setHealthSupportNeeds] = useState<string[]>([]);
  const [otherHealthSupportNeed, setOtherHealthSupportNeed] = useState("");
  const [healthSupportDetails, setHealthSupportDetails] = useState<
    Record<string, string>
  >({});
  const [socialFinancialSupport, setSocialFinancialSupport] = useState<
    string[]
  >([]);
  const [otherSocialFinancialSupport, setOtherSocialFinancialSupport] =
    useState("");
  const [childrenInSchoolOrChildcare, setChildrenInSchoolOrChildcare] =
    useState("");
  const [religiousSpiritualTraditions, setReligiousSpiritualTraditions] =
    useState("");

  // ---------------------------------------------------------------------------
  // Agreements / Waivers
  // ---------------------------------------------------------------------------

  const [childSupportDhsInitials, setChildSupportDhsInitials] = useState("");
  const [
    medicationResponsibilityInitials,
    setMedicationResponsibilityInitials,
  ] = useState("");
  const [vehicleTransportationInitials, setVehicleTransportationInitials] =
    useState("");
  const [possessionsInitials, setPossessionsInitials] = useState("");
  const [programGuidelinesInitials, setProgramGuidelinesInitials] =
    useState("");
  const [backgroundTestingSearchInitials, setBackgroundTestingSearchInitials] =
    useState("");
  const [informationSharingInitials, setInformationSharingInitials] =
    useState("");
  const [facilityExpectationsInitials, setFacilityExpectationsInitials] =
    useState("");
  const [volunteerWaiverInitials, setVolunteerWaiverInitials] = useState("");
  const [
    confidentialityAgreementInitials,
    setConfidentialityAgreementInitials,
  ] = useState("");
  const [coEdAccountabilityInitials, setCoEdAccountabilityInitials] =
    useState("");
  const [dressForSuccessInitials, setDressForSuccessInitials] = useState("");
  const [nondiscriminationInitials, setNondiscriminationInitials] =
    useState("");

  // ---------------------------------------------------------------------------
  // Program Assignment
  // ---------------------------------------------------------------------------

  const [
    lifeTransformationProgramInitials,
    setLifeTransformationProgramInitials,
  ] = useState("");
  const [clientProgram, setClientProgram] = useState("");
  const [temporaryShelterProgramInitials, setTemporaryShelterProgramInitials] =
    useState("");

  // ---------------------------------------------------------------------------
  // COVID / Health
  // ---------------------------------------------------------------------------

  const [covidVaccinated, setCovidVaccinated] = useState("");
  const [covidVaccinationDate, setCovidVaccinationDate] = useState("");
  const [covidVaccinationAppointmentDate, setCovidVaccinationAppointmentDate] =
    useState("");
  const [covidVaccinationProof, setCovidVaccinationProof] = useState("");
  const [covidVaccinationProofFile, setCovidVaccinationProofFile] =
    useState<File | null>(null);

  // ---------------------------------------------------------------------------
  // HMIS Authorization
  // ---------------------------------------------------------------------------

  const [hmisAuthorization, setHmisAuthorization] = useState("");
  const [hmisSignature, setHmisSignature] = useState("");
  const [hmisSignatureDate, setHmisSignatureDate] = useState("");

  // ---------------------------------------------------------------------------
  // Final Review
  // ---------------------------------------------------------------------------

  const [finalClientSignature, setFinalClientSignature] = useState("");
  const [finalAdminSignature, setFinalAdminSignature] = useState("");

  const startNewIntake = () => {
    setActiveDraftId(null);
    setActiveIntakeSection("client-information");
    setActiveHandbookTab("getting-started");
    setDateOfBirth("");
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setPreferredName("");
    setPhoneNumber("");
    setIntakeDate("");
    setOutDate("");
    setHopeHouseNumber("");
    setHmisNumber("");
    setSsnFirst("");
    setSsnMiddle("");
    setSsnLast("");
    setVeteranStatus("");
    setMedicalAllergies("");
    setNoMedicalAllergies(false);
    setFoodAllergies("");
    setNoFoodAllergies(false);
    setDietaryNeeds([]);
    setOtherDietaryNeed("");
    setEmergencyContactName("");
    setEmergencyContactPhoneNumber("");
    setEmergencyContactRelationship("");
    setRoomNumber("");
    setMedRoomLockerNumber("");
    setHasMinorChildren("");
    setMinorChildren([]);
    setGender("");
    setRace([]);
    setEthnicity("");
    setHousehold("");
    setDomesticViolence(false);
    setFosterCare(false);
    setHumanTrafficking(false);
    setDomesticViolenceDate("");
    setCurrentlyFleeing("");
    setFirstTimeHomeless("");
    setTotalTimesHomeless("");
    setPriorLivingSituation("");
    setPriorLivingStayLength("");
    setPriorLivingStayUnit("");
    setHomelessnessStartDate("");
    setHomelessEpisodesPastThreeYears("");
    setHomelessMonthsPastThreeYears("");
    setLastPlaceStayed("");
    setLastPlaceCity("");
    setLastPlaceCounty("");
    setLastPlaceState("");
    setCurrentlyEmployed("");
    setEmployerName("");
    setMonthlyEmploymentIncome("");
    setHasOtherIncome("");
    setOtherIncomeSources([]);
    setOtherIncomeDescription("");
    setMonthlyOtherIncome("");
    setHighestEducationCompleted("");
    setSchoolName("");
    setSnapBenefits("");
    setSnapLoadDay("");
    setSnapAcknowledgmentDate("");
    setSnapMonthlyAmount("");
    setSoonerCareBenefits("");
    setSoonerCarePlan("");
    setSoonerCareId("");
    setMedicaidBenefits("");
    setMedicareBenefits("");
    setWicBenefits("");
    setTanfBenefits("");
    setEmployerInsurance("");
    setOtherStateHealthInsurance("");
    setHasSavingsAccount("");
    setHasCheckingAccount("");
    setMisdemeanorConviction("");
    setMisdemeanorDetails("");
    setFelonyConviction("");
    setFelonyDetails("");
    setOnProbation("");
    setOnParole("");
    setHasArrestWarrants("");
    setHasUnpaidTickets("");
    setChildSupportStatus("");
    setMonthlyChildSupportAmount("");
    setOwesLandlordMoney("");
    setLandlordAmountOwed("");
    setOwesUtilityMoney("");
    setUtilityAmountOwed("");
    setHasEvictionHistory("");
    setHasPaidStorage("");
    setHasSubstanceUseConcerns("");
    setSubstancesUsed([]);
    setOtherSubstance("");
    setSubstanceUseDetails("");
    setCurrentlyReceivingMedicalTreatment("");
    setMedicalTreatmentDetails("");
    setHealthSupportNeeds([]);
    setHealthSupportDetails({});
    setOtherHealthSupportNeed("");
    setSocialFinancialSupport([]);
    setOtherSocialFinancialSupport("");
    setChildrenInSchoolOrChildcare("");
    setReligiousSpiritualTraditions("");
    setChildSupportDhsInitials("");
    setMedicationResponsibilityInitials("");
    setVehicleTransportationInitials("");
    setPossessionsInitials("");
    setProgramGuidelinesInitials("");
    setBackgroundTestingSearchInitials("");
    setInformationSharingInitials("");
    setFacilityExpectationsInitials("");
    setVolunteerWaiverInitials("");
    setConfidentialityAgreementInitials("");
    setCoEdAccountabilityInitials("");
    setDressForSuccessInitials("");
    setNondiscriminationInitials("");
    setLifeTransformationProgramInitials("");
    setClientProgram("");
    setTemporaryShelterProgramInitials("");
    setCovidVaccinated("");
    setCovidVaccinationDate("");
    setCovidVaccinationAppointmentDate("");
    setCovidVaccinationProof("");
    setCovidVaccinationProofFile(null);
    setHmisAuthorization("");
    setHmisSignature("");
    setHmisSignatureDate("");
    setFinalClientSignature("");
    setFinalAdminSignature("");
  };

  const buildIntakeData = () => {
    return {
      clientName: `${firstName} ${middleName} ${lastName}`
        .replace(/\s+/g, " ")
        .trim(),
      intakeDate,
      lastUpdated: new Date().toLocaleString(),
      formData: {
        firstName,
        middleName,
        lastName,
        preferredName,
        dateOfBirth,
        phoneNumber,
        ssnFirst,
        ssnMiddle,
        ssnLast,
        veteranStatus,
        medicalAllergies,
        noMedicalAllergies,
        foodAllergies,
        noFoodAllergies,
        dietaryNeeds,
        otherDietaryNeed,
        emergencyContactName,
        emergencyContactPhoneNumber,
        emergencyContactRelationship,
        roomNumber,
        medRoomLockerNumber,
        outDate,
        hopeHouseNumber,
        hmisNumber,
        hasMinorChildren,
        minorChildren,
        gender,
        race,
        ethnicity,
        household,
        domesticViolence,
        fosterCare,
        humanTrafficking,
        domesticViolenceDate,
        currentlyFleeing,
        firstTimeHomeless,
        totalTimesHomeless,
        priorLivingSituation,
        priorLivingStayLength,
        priorLivingStayUnit,
        homelessnessStartDate,
        homelessEpisodesPastThreeYears,
        homelessMonthsPastThreeYears,
        lastPlaceStayed,
        lastPlaceCity,
        lastPlaceCounty,
        lastPlaceState,

        currentlyEmployed,
        employerName,
        monthlyEmploymentIncome,
        hasOtherIncome,
        otherIncomeSources,
        otherIncomeDescription,
        monthlyOtherIncome,
        highestEducationCompleted,
        schoolName,

        snapBenefits,
        snapLoadDay,
        snapAcknowledgmentDate,
        snapMonthlyAmount,
        soonerCareBenefits,
        soonerCarePlan,
        soonerCareId,
        medicaidBenefits,
        medicareBenefits,
        wicBenefits,
        tanfBenefits,
        employerInsurance,
        otherStateHealthInsurance,
        hasSavingsAccount,
        hasCheckingAccount,

        misdemeanorConviction,
        misdemeanorDetails,
        felonyConviction,
        felonyDetails,
        onProbation,
        onParole,
        hasArrestWarrants,
        hasUnpaidTickets,
        childSupportStatus,
        monthlyChildSupportAmount,
        owesLandlordMoney,
        landlordAmountOwed,
        owesUtilityMoney,
        utilityAmountOwed,
        hasEvictionHistory,
        hasPaidStorage,

        hasSubstanceUseConcerns,
        substancesUsed,
        otherSubstance,
        substanceUseDetails,
        currentlyReceivingMedicalTreatment,
        medicalTreatmentDetails,
        healthSupportNeeds,
        otherHealthSupportNeed,
        healthSupportDetails,
        socialFinancialSupport,
        otherSocialFinancialSupport,
        childrenInSchoolOrChildcare,
        religiousSpiritualTraditions,

        childSupportDhsInitials,
        medicationResponsibilityInitials,
        vehicleTransportationInitials,
        possessionsInitials,
        programGuidelinesInitials,
        backgroundTestingSearchInitials,
        informationSharingInitials,
        facilityExpectationsInitials,
        volunteerWaiverInitials,
        confidentialityAgreementInitials,
        coEdAccountabilityInitials,
        dressForSuccessInitials,
        nondiscriminationInitials,
        lifeTransformationProgramInitials,

        clientProgram,
        temporaryShelterProgramInitials,

        covidVaccinated,
        covidVaccinationDate,
        covidVaccinationAppointmentDate,
        covidVaccinationProof,
        covidVaccinationProofFile,

        hmisAuthorization,
        hmisSignature,
        hmisSignatureDate,
        finalClientSignature,
        finalAdminSignature,
      },
    };
  };

  const loadIntakeData = (intake: IntakeDraft) => {
    setFirstName(intake.formData.firstName);
    setMiddleName(intake.formData.middleName);
    setLastName(intake.formData.lastName);
    setPreferredName(intake.formData.preferredName);
    setDateOfBirth(intake.formData.dateOfBirth);
    setPhoneNumber(intake.formData.phoneNumber);
    setSsnFirst(intake.formData.ssnFirst);
    setSsnMiddle(intake.formData.ssnMiddle);
    setSsnLast(intake.formData.ssnLast);
    setVeteranStatus(intake.formData.veteranStatus);
    setMedicalAllergies(intake.formData.medicalAllergies);
    setNoMedicalAllergies(intake.formData.noMedicalAllergies);
    setFoodAllergies(intake.formData.foodAllergies);
    setNoFoodAllergies(intake.formData.noFoodAllergies);
    setDietaryNeeds(intake.formData.dietaryNeeds);
    setOtherDietaryNeed(intake.formData.otherDietaryNeed);
    setEmergencyContactName(intake.formData.emergencyContactName);
    setEmergencyContactPhoneNumber(intake.formData.emergencyContactPhoneNumber);
    setEmergencyContactRelationship(
      intake.formData.emergencyContactRelationship,
    );
    setRoomNumber(intake.formData.roomNumber);
    setMedRoomLockerNumber(intake.formData.medRoomLockerNumber);
    setOutDate(intake.formData.outDate);
    setHopeHouseNumber(intake.formData.hopeHouseNumber);
    setHmisNumber(intake.formData.hmisNumber);
    setHasMinorChildren(intake.formData.hasMinorChildren);
    setMinorChildren(intake.formData.minorChildren);
    setGender(intake.formData.gender);
    setRace(intake.formData.race);
    setEthnicity(intake.formData.ethnicity);
    setHousehold(intake.formData.household);
    setDomesticViolence(intake.formData.domesticViolence);
    setFosterCare(intake.formData.fosterCare);
    setHumanTrafficking(intake.formData.humanTrafficking);
    setDomesticViolenceDate(intake.formData.domesticViolenceDate);
    setCurrentlyFleeing(intake.formData.currentlyFleeing);
    setFirstTimeHomeless(intake.formData.firstTimeHomeless);
    setTotalTimesHomeless(intake.formData.totalTimesHomeless);
    setPriorLivingSituation(intake.formData.priorLivingSituation);
    setPriorLivingStayLength(intake.formData.priorLivingStayLength);
    setPriorLivingStayUnit(intake.formData.priorLivingStayUnit);
    setHomelessnessStartDate(intake.formData.homelessnessStartDate);
    setHomelessEpisodesPastThreeYears(
      intake.formData.homelessEpisodesPastThreeYears,
    );
    setHomelessMonthsPastThreeYears(
      intake.formData.homelessMonthsPastThreeYears,
    );
    setLastPlaceStayed(intake.formData.lastPlaceStayed);
    setLastPlaceCity(intake.formData.lastPlaceCity);
    setLastPlaceCounty(intake.formData.lastPlaceCounty);
    setLastPlaceState(intake.formData.lastPlaceState);
    setCurrentlyEmployed(intake.formData.currentlyEmployed);
    setEmployerName(intake.formData.employerName);
    setMonthlyEmploymentIncome(intake.formData.monthlyEmploymentIncome);
    setHasOtherIncome(intake.formData.hasOtherIncome);
    setOtherIncomeSources(intake.formData.otherIncomeSources);
    setOtherIncomeDescription(intake.formData.otherIncomeDescription);
    setMonthlyOtherIncome(intake.formData.monthlyOtherIncome);
    setHighestEducationCompleted(intake.formData.highestEducationCompleted);
    setSchoolName(intake.formData.schoolName);
    setSnapBenefits(intake.formData.snapBenefits);
    setSnapLoadDay(intake.formData.snapLoadDay);
    setSnapAcknowledgmentDate(intake.formData.snapAcknowledgmentDate);
    setSnapMonthlyAmount(intake.formData.snapMonthlyAmount);
    setSoonerCareBenefits(intake.formData.soonerCareBenefits);
    setSoonerCarePlan(intake.formData.soonerCarePlan);
    setSoonerCareId(intake.formData.soonerCareId);
    setMedicaidBenefits(intake.formData.medicaidBenefits);
    setMedicareBenefits(intake.formData.medicareBenefits);
    setWicBenefits(intake.formData.wicBenefits);
    setTanfBenefits(intake.formData.tanfBenefits);
    setEmployerInsurance(intake.formData.employerInsurance);
    setOtherStateHealthInsurance(intake.formData.otherStateHealthInsurance);
    setHasSavingsAccount(intake.formData.hasSavingsAccount);
    setHasCheckingAccount(intake.formData.hasCheckingAccount);
    setMisdemeanorConviction(intake.formData.misdemeanorConviction);
    setMisdemeanorDetails(intake.formData.misdemeanorDetails);
    setFelonyConviction(intake.formData.felonyConviction);
    setFelonyDetails(intake.formData.felonyDetails);
    setOnProbation(intake.formData.onProbation);
    setOnParole(intake.formData.onParole);
    setHasArrestWarrants(intake.formData.hasArrestWarrants);
    setHasUnpaidTickets(intake.formData.hasUnpaidTickets);
    setChildSupportStatus(intake.formData.childSupportStatus);
    setMonthlyChildSupportAmount(intake.formData.monthlyChildSupportAmount);
    setOwesLandlordMoney(intake.formData.owesLandlordMoney);
    setLandlordAmountOwed(intake.formData.landlordAmountOwed);
    setOwesUtilityMoney(intake.formData.owesUtilityMoney);
    setUtilityAmountOwed(intake.formData.utilityAmountOwed);
    setHasEvictionHistory(intake.formData.hasEvictionHistory);
    setHasPaidStorage(intake.formData.hasPaidStorage);
    setHasSubstanceUseConcerns(intake.formData.hasSubstanceUseConcerns);
    setSubstancesUsed(intake.formData.substancesUsed);
    setOtherSubstance(intake.formData.otherSubstance);
    setSubstanceUseDetails(intake.formData.substanceUseDetails);
    setCurrentlyReceivingMedicalTreatment(
      intake.formData.currentlyReceivingMedicalTreatment,
    );
    setMedicalTreatmentDetails(intake.formData.medicalTreatmentDetails);
    setHealthSupportNeeds(intake.formData.healthSupportNeeds);
    setOtherHealthSupportNeed(intake.formData.otherHealthSupportNeed);
    setHealthSupportDetails(intake.formData.healthSupportDetails);
    setSocialFinancialSupport(intake.formData.socialFinancialSupport);
    setOtherSocialFinancialSupport(intake.formData.otherSocialFinancialSupport);
    setChildrenInSchoolOrChildcare(intake.formData.childrenInSchoolOrChildcare);
    setReligiousSpiritualTraditions(
      intake.formData.religiousSpiritualTraditions,
    );
    setChildSupportDhsInitials(intake.formData.childSupportDhsInitials);
    setMedicationResponsibilityInitials(
      intake.formData.medicationResponsibilityInitials,
    );
    setVehicleTransportationInitials(
      intake.formData.vehicleTransportationInitials,
    );
    setPossessionsInitials(intake.formData.possessionsInitials);
    setProgramGuidelinesInitials(intake.formData.programGuidelinesInitials);
    setBackgroundTestingSearchInitials(
      intake.formData.backgroundTestingSearchInitials,
    );
    setInformationSharingInitials(intake.formData.informationSharingInitials);
    setFacilityExpectationsInitials(
      intake.formData.facilityExpectationsInitials,
    );
    setVolunteerWaiverInitials(intake.formData.volunteerWaiverInitials);
    setConfidentialityAgreementInitials(
      intake.formData.confidentialityAgreementInitials,
    );
    setCoEdAccountabilityInitials(intake.formData.coEdAccountabilityInitials);
    setDressForSuccessInitials(intake.formData.dressForSuccessInitials);
    setNondiscriminationInitials(intake.formData.nondiscriminationInitials);
    setLifeTransformationProgramInitials(
      intake.formData.lifeTransformationProgramInitials,
    );
    setClientProgram(intake.formData.clientProgram);
    setTemporaryShelterProgramInitials(
      intake.formData.temporaryShelterProgramInitials,
    );
    setCovidVaccinated(intake.formData.covidVaccinated);
    setCovidVaccinationDate(intake.formData.covidVaccinationDate);
    setCovidVaccinationAppointmentDate(
      intake.formData.covidVaccinationAppointmentDate,
    );
    setCovidVaccinationProof(intake.formData.covidVaccinationProof);
    setCovidVaccinationProofFile(intake.formData.covidVaccinationProofFile);
    setHmisAuthorization(intake.formData.hmisAuthorization);
    setHmisSignature(intake.formData.hmisSignature);
    setHmisSignatureDate(intake.formData.hmisSignatureDate);
    setFinalClientSignature(intake.formData.finalClientSignature);
    setFinalAdminSignature(intake.formData.finalAdminSignature);
    setIntakeDate(intake.intakeDate);
  };

  const completeIntake = () => {
    const nextHopeHouseNumber = `HH-${new Date().getFullYear()}-${String(completedIntakes.length + 1).padStart(4, "0")}`;
    const completedAt = new Date().toISOString();
    const intakeData = buildIntakeData();
    const completedIntake: CompletedIntake = {
      id: Date.now(),
      ...intakeData,
      hopeHouseNumber: nextHopeHouseNumber,
      completedAt,
      reviewStatus: "Pending Review",
      formData: {
        ...intakeData.formData,
        hopeHouseNumber: nextHopeHouseNumber,
      },
    };

    setCompletedIntakes([...completedIntakes, completedIntake]);

    if (activeDraftId !== null) {
      setDraftIntakes(
        draftIntakes.filter((draft) => draft.id !== activeDraftId),
      );
    }

    startNewIntake();
    setActiveTab(2);
  };

  // ---------------------------------------------------------------------------
  // Client Age Calculation (primary client DOB → disabled Age field)
  // ---------------------------------------------------------------------------
  const age = (() => {
    if (!dateOfBirth) return "";

    const today = new Date();
    const birthDate = new Date(`${dateOfBirth}T00:00:00`);

    let calculatedAge = today.getFullYear() - birthDate.getFullYear();

    const birthdayHasPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());

    if (!birthdayHasPassed) {
      calculatedAge--;
    }

    return calculatedAge;
  })();

  // ---------------------------------------------------------------------------
  // Minor Child Helpers (update one field; age from child DOB)
  // ---------------------------------------------------------------------------
  const updateMinorChild = (
    index: number,
    field:
      | "firstName"
      | "lastName"
      | "dateOfBirth"
      | "ssnFirst"
      | "ssnMiddle"
      | "ssnLast",
    value: string,
  ) => {
    setMinorChildren((current) =>
      current.map((child, childIndex) =>
        childIndex === index ? { ...child, [field]: value } : child,
      ),
    );
  };

  const calculateAge = (birthDateValue: string) => {
    if (!birthDateValue) return "";

    const today = new Date();
    const birthDate = new Date(`${birthDateValue}T00:00:00`);

    let calculatedAge = today.getFullYear() - birthDate.getFullYear();

    const birthdayHasPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());

    if (!birthdayHasPassed) {
      calculatedAge--;
    }

    return calculatedAge;
  };

  return (
    <Box
      sx={{
        // Intake text +~2px; hierarchy kept (h6 > subtitle > body)
        "& .MuiTypography-body1": {
          fontSize: (t) => `calc(${t.typography.body1.fontSize} + 2px)`,
        },
        "& .MuiTypography-body2": {
          fontSize: (t) => `calc(${t.typography.body2.fontSize} + 2px)`,
        },
        "& .MuiTypography-subtitle1": {
          fontSize: (t) => `calc(${t.typography.subtitle1.fontSize} + 2px)`,
        },
        "& .MuiTypography-subtitle2": {
          fontSize: (t) => `calc(${t.typography.subtitle2.fontSize} + 2px)`,
        },
        "& .MuiTypography-h6": {
          fontSize: (t) => `calc(${t.typography.h6.fontSize} + 2px)`,
        },
        "& .MuiFormControlLabel-label": {
          fontSize: (t) => `calc(${t.typography.body1.fontSize} + 2px)`,
        },
        "& .MuiInputLabel-root": {
          fontSize: (t) => `calc(${t.typography.body1.fontSize} + 2px)`,
        },
        "& .MuiInputBase-input": {
          fontSize: (t) => `calc(${t.typography.body1.fontSize} + 2px)`,
        },
        "& .MuiSelect-select": {
          fontSize: (t) => `calc(${t.typography.body1.fontSize} + 2px)`,
        },
        "& .MuiTab-root": {
          fontSize: (t) => `calc(${t.typography.button.fontSize} + 2px)`,
        },
      }}
    >
      <Typography variant="h6">Client Intake</Typography>

      {/* ------------------------------------------------------------------ */}
      {/* Intake Tabs — New / Draft / Completed                               */}
      {/* ------------------------------------------------------------------ */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
      >
        <Tab label="New Intake" />
        <Tab label="Draft Intakes" />
        <Tab label="Completed Intakes" />
      </Tabs>

      {activeTab === 0 && (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              mt: 2,
            }}
          >
            <Button variant="outlined" onClick={startNewIntake}>
              Start New Intake
            </Button>

            <Button
              variant="contained"
              onClick={() => {
                const draftData = buildIntakeData();

                if (activeDraftId !== null) {
                  setDraftIntakes(
                    draftIntakes.map((draft) =>
                      draft.id === activeDraftId
                        ? { ...draft, ...draftData }
                        : draft,
                    ),
                  );
                } else {
                  const newDraftId = Date.now();

                  setDraftIntakes([
                    ...draftIntakes,
                    {
                      id: newDraftId,
                      ...draftData,
                    },
                  ]);

                  setActiveDraftId(newDraftId);
                }

                startNewIntake();
              }}
            >
              Save Draft
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 3,
              mt: 3,
              alignItems: "flex-start",
            }}
          >
            {/* Intake Section Navigation */}
            <Paper sx={{ mb: 3, p: 1 }}>
              <List disablePadding>
                {intakeSections.map((section) => (
                  <ListItemButton
                    key={section.id}
                    selected={activeIntakeSection === section.id}
                    onClick={() => setActiveIntakeSection(section.id)}
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "#0072BC",
                        color: "white",
                      },
                    }}
                  >
                    <ListItemText primary={section.label} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              {activeIntakeSection === "client-information" && (
                <Paper sx={{ mt: 3, p: 3 }}>
                  {/* -------------------------------------------------------------- */}
                  {/* Client Information                                            */}
                  {/* -------------------------------------------------------------- */}

                  <Box
                    sx={{
                      backgroundColor: "#D3ECF8",
                      border: "9px solid #93C9E2",
                      borderRadius: 1,
                      p: 2,
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        textAlign: "center",
                        fontWeight: 500,
                        color: "rgba(54, 75, 112, 0.55)",
                      }}
                    >
                      ADMINISTRATION USE ONLY
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, minmax(120px, 1fr))",
                        gap: 2,
                        width: "100%",
                        maxWidth: 1100,
                        margin: "32px auto 0",
                      }}
                    >
                      <TextField
                        label="IN DATE"
                        type="date"
                        value={intakeDate}
                        onChange={(event) => setIntakeDate(event.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#FFFFFF",
                          },
                        }}
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                      />

                      <TextField
                        label="OUT DATE"
                        type="date"
                        value={outDate}
                        onChange={(event) => setOutDate(event.target.value)}
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#FFFFFF",
                          },
                        }}
                      />

                      <TextField
                        label="PROGRAM"
                        value={clientProgram}
                        slotProps={{
                          input: {
                            readOnly: true,
                          },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#FFFFFF",
                          },
                        }}
                      />

                      <TextField
                        label="HOPE HOUSE #"
                        value={hopeHouseNumber}
                        slotProps={{
                          input: {
                            readOnly: true,
                          },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#FFFFFF",
                          },
                        }}
                      />

                      <TextField
                        label="HMIS #"
                        value={hmisNumber}
                        onChange={(event) => setHmisNumber(event.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#FFFFFF",
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  <Typography variant="h6">Client Information</Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <TextField
                      label="First Name"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                    />

                    <TextField
                      label="Middle Name"
                      value={middleName}
                      onChange={(event) => setMiddleName(event.target.value)}
                    />

                    <TextField
                      label="Last Name"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                    />

                    <TextField
                      label="Preferred Name"
                      value={preferredName}
                      onChange={(event) => setPreferredName(event.target.value)}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <TextField
                      label="Date of Birth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(event) => setDateOfBirth(event.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />

                    <TextField label="Age" value={age} disabled />

                    <TextField
                      label="Phone Number"
                      value={phoneNumber}
                      onChange={(event) => {
                        const digits = event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);

                        let formatted = digits;

                        if (digits.length > 6) {
                          formatted = `${digits.slice(0, 3)}-${digits.slice(
                            3,
                            6,
                          )}-${digits.slice(6)}`;
                        } else if (digits.length > 3) {
                          formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
                        }

                        setPhoneNumber(formatted);
                      }}
                    />

                    <TextField
                      label="Intake Date"
                      type="date"
                      value={intakeDate}
                      onChange={(event) => setIntakeDate(event.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 4,
                      alignItems: "flex-start",
                    }}
                  >
                    {/* ------------------------------------------------------------ */}
                    {/* Social Security Number                                      */}
                    {/* ------------------------------------------------------------ */}
                    <Box>
                      <Typography sx={{ mt: 1 }}>
                        Social Security Number
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <TextField
                          value={ssnFirst}
                          onChange={(event) =>
                            setSsnFirst(event.target.value.replace(/\D/g, ""))
                          }
                          slotProps={{ htmlInput: { maxLength: 3 } }}
                          sx={{ width: 80 }}
                        />

                        <Typography>-</Typography>

                        <TextField
                          value={ssnMiddle}
                          onChange={(event) =>
                            setSsnMiddle(event.target.value.replace(/\D/g, ""))
                          }
                          slotProps={{ htmlInput: { maxLength: 2 } }}
                          sx={{ width: 70 }}
                        />

                        <Typography>-</Typography>

                        <TextField
                          value={ssnLast}
                          onChange={(event) =>
                            setSsnLast(event.target.value.replace(/\D/g, ""))
                          }
                          slotProps={{ htmlInput: { maxLength: 4 } }}
                          sx={{ width: 70 }}
                        />
                      </Box>
                    </Box>

                    {/* ------------------------------------------------------------ */}
                    {/* Veteran Status                                              */}
                    {/* ------------------------------------------------------------ */}
                    <FormControl sx={{ mt: 1 }}>
                      <Typography>Veteran Status</Typography>

                      <RadioGroup
                        row
                        value={veteranStatus}
                        onChange={(event) =>
                          setVeteranStatus(event.target.value)
                        }
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* ------------------------------------------------------------ */}
                    {/* Medical Allergies                                           */}
                    {/* ------------------------------------------------------------ */}
                    <Box sx={{ mt: 1 }}>
                      <Typography>Medical Allergies</Typography>

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={noMedicalAllergies}
                            onChange={(event) => {
                              setNoMedicalAllergies(event.target.checked);

                              if (event.target.checked) {
                                setMedicalAllergies("");
                              }
                            }}
                          />
                        }
                        label="No Known Medical Allergies"
                      />

                      <TextField
                        sx={{ width: 300 }}
                        label="List Medical Allergies"
                        multiline
                        minRows={2}
                        value={medicalAllergies}
                        onChange={(event) =>
                          setMedicalAllergies(event.target.value)
                        }
                        disabled={noMedicalAllergies}
                      />
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 4,
                      alignItems: "flex-start",
                    }}
                  >
                    {/* ------------------------------------------------------------ */}
                    {/* Food Allergies                                              */}
                    {/* ------------------------------------------------------------ */}
                    <Box sx={{ mt: 1 }}>
                      <Typography>Food Allergies</Typography>

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={noFoodAllergies}
                            onChange={(event) => {
                              setNoFoodAllergies(event.target.checked);

                              if (event.target.checked) {
                                setFoodAllergies("");
                              }
                            }}
                          />
                        }
                        label="No Known Food Allergies"
                      />

                      <TextField
                        label="List Food Allergies"
                        multiline
                        minRows={2}
                        value={foodAllergies}
                        onChange={(event) =>
                          setFoodAllergies(event.target.value)
                        }
                        disabled={noFoodAllergies}
                        sx={{ width: 300 }}
                      />
                    </Box>

                    {/* ------------------------------------------------------------ */}
                    {/* Dietary Needs / Restrictions                                */}
                    {/* ------------------------------------------------------------ */}
                    <Box sx={{ mt: 1 }}>
                      <Typography>Dietary Needs / Restrictions</Typography>

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={dietaryNeeds.includes("none")}
                            onChange={(event) => {
                              if (event.target.checked) {
                                setDietaryNeeds(["none"]);
                                setOtherDietaryNeed("");
                              } else {
                                setDietaryNeeds([]);
                              }
                            }}
                          />
                        }
                        label="No Special Dietary Needs"
                      />

                      {(
                        [
                          ["no-pork", "No Pork"],
                          ["no-beef", "No Beef"],
                          ["vegetarian", "Vegetarian"],
                          ["vegan", "Vegan"],
                          ["dairy-free", "Dairy-Free"],
                          ["gluten-free", "Gluten-Free"],
                          ["diabetic", "Diabetic / Carb-Conscious"],
                          ["low-sodium", "Low Sodium"],
                          [
                            "religious-cultural",
                            "Religious / Cultural Restriction",
                          ],
                          ["other", "Other"],
                        ] as [string, string][]
                      ).map(([value, label]) => (
                        <FormControlLabel
                          key={value}
                          control={
                            <Checkbox
                              checked={dietaryNeeds.includes(value)}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  setDietaryNeeds((current) => [
                                    ...current.filter(
                                      (item) => item !== "none",
                                    ),
                                    value,
                                  ]);
                                } else {
                                  setDietaryNeeds((current) =>
                                    current.filter((item) => item !== value),
                                  );

                                  if (value === "other") {
                                    setOtherDietaryNeed("");
                                  }
                                }
                              }}
                            />
                          }
                          label={label}
                        />
                      ))}

                      {dietaryNeeds.includes("other") && (
                        <TextField
                          label="Other Dietary Need / Restriction"
                          multiline
                          minRows={2}
                          value={otherDietaryNeed}
                          onChange={(event) =>
                            setOtherDietaryNeed(event.target.value)
                          }
                          sx={{ width: 300, mt: 1 }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* -------------------------------------------------------------- */}
                  {/* Emergency Contact                                             */}
                  {/* -------------------------------------------------------------- */}
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    Emergency Contact
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <TextField
                      label="Emergency Contact Name"
                      value={emergencyContactName}
                      onChange={(event) =>
                        setEmergencyContactName(event.target.value)
                      }
                    />

                    <TextField
                      label="Phone Number"
                      value={emergencyContactPhoneNumber}
                      onChange={(event) => {
                        const digits = event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);

                        let formatted = digits;

                        if (digits.length > 6) {
                          formatted = `${digits.slice(0, 3)}-${digits.slice(
                            3,
                            6,
                          )}-${digits.slice(6)}`;
                        } else if (digits.length > 3) {
                          formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
                        }

                        setEmergencyContactPhoneNumber(formatted);
                      }}
                    />

                    <TextField
                      label="Relationship"
                      value={emergencyContactRelationship}
                      onChange={(event) =>
                        setEmergencyContactRelationship(event.target.value)
                      }
                    />
                  </Box>

                  {/* -------------------------------------------------------------- */}
                  {/* Room & Medication Assignment                                  */}
                  {/* -------------------------------------------------------------- */}
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    Room & Medication Assignment
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <TextField
                      label="Room Assignment"
                      value={roomNumber}
                      onChange={(event) => setRoomNumber(event.target.value)}
                      placeholder="Example: 6S - A"
                    />

                    <TextField
                      label="Medication Room Locker Number"
                      value={medRoomLockerNumber}
                      onChange={(event) =>
                        setMedRoomLockerNumber(event.target.value)
                      }
                    />
                  </Box>
                </Paper>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* Household / Family Information                                  */}
              {/* ---------------------------------------------------------------- */}
              {activeIntakeSection === "household-family" && (
                <Paper sx={{ mt: 2, p: 3 }}>
                  <Typography variant="h6">
                    Household / Family Information
                  </Typography>

                  <FormControl sx={{ mt: 2 }}>
                    <Typography>
                      Does the client have minor children?
                    </Typography>

                    <RadioGroup
                      row
                      value={hasMinorChildren}
                      onChange={(event) =>
                        setHasMinorChildren(event.target.value)
                      }
                    >
                      <FormControlLabel
                        value="yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>

                  {/* -------------------------------------------------------------- */}
                  {/* Minor Children (shown when hasMinorChildren === "yes")        */}
                  {/* -------------------------------------------------------------- */}
                  {hasMinorChildren === "yes" && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1">
                        Minor Children
                      </Typography>

                      <Button
                        variant="outlined"
                        onClick={() =>
                          setMinorChildren((current) => [
                            ...current,
                            {
                              firstName: "",
                              lastName: "",
                              dateOfBirth: "",
                              ssnFirst: "",
                              ssnMiddle: "",
                              ssnLast: "",
                            },
                          ])
                        }
                      >
                        Add Child
                      </Button>
                      {minorChildren.map((child, index) => (
                        <Box key={index} sx={{ mt: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography variant="subtitle2">
                              Child {index + 1}
                            </Typography>

                            <Button
                              size="small"
                              color="error"
                              onClick={() =>
                                setMinorChildren((current) =>
                                  current.filter(
                                    (_, childIndex) => childIndex !== index,
                                  ),
                                )
                              }
                            >
                              Remove
                            </Button>
                          </Box>

                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr 1fr 0.5fr",
                              gap: 2,
                            }}
                          >
                            <TextField
                              label="First Name"
                              value={child.firstName}
                              onChange={(event) =>
                                updateMinorChild(
                                  index,
                                  "firstName",
                                  event.target.value,
                                )
                              }
                            />

                            <TextField
                              label="Last Name"
                              value={child.lastName}
                              onChange={(event) =>
                                updateMinorChild(
                                  index,
                                  "lastName",
                                  event.target.value,
                                )
                              }
                            />

                            <TextField
                              label="Date of Birth"
                              type="date"
                              value={child.dateOfBirth}
                              onChange={(event) =>
                                updateMinorChild(
                                  index,
                                  "dateOfBirth",
                                  event.target.value,
                                )
                              }
                              slotProps={{ inputLabel: { shrink: true } }}
                            />
                            <TextField
                              label="Age"
                              value={calculateAge(child.dateOfBirth)}
                              disabled
                            />
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              mt: 2,
                              alignItems: "center",
                            }}
                          >
                            <Typography>SSN</Typography>

                            <TextField
                              value={child.ssnFirst}
                              onChange={(event) =>
                                updateMinorChild(
                                  index,
                                  "ssnFirst",
                                  event.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 3),
                                )
                              }
                              slotProps={{
                                htmlInput: {
                                  maxLength: 3,
                                  inputMode: "numeric",
                                  style: { width: "3ch" },
                                },
                              }}
                            />

                            <Typography>-</Typography>

                            <TextField
                              value={child.ssnMiddle}
                              onChange={(event) =>
                                updateMinorChild(
                                  index,
                                  "ssnMiddle",
                                  event.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 2),
                                )
                              }
                              slotProps={{
                                htmlInput: {
                                  maxLength: 2,
                                  inputMode: "numeric",
                                  style: { width: "2ch" },
                                },
                              }}
                            />

                            <Typography>-</Typography>

                            <TextField
                              value={child.ssnLast}
                              onChange={(event) =>
                                updateMinorChild(
                                  index,
                                  "ssnLast",
                                  event.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 4),
                                )
                              }
                              slotProps={{
                                htmlInput: {
                                  maxLength: 4,
                                  inputMode: "numeric",
                                  style: { width: "4ch" },
                                },
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              )}

              {/* HMIS / Demographics */}
              {activeIntakeSection === "hmis-demographics" && (
                <Paper sx={{ mt: 2, p: 3 }}>
                  <Typography variant="h6">HMIS / Demographics</Typography>

                  {/* Gender */}
                  <Box
                    sx={{
                      mt: 2,
                      pb: 2,
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Gender
                    </Typography>

                    <FormControl>
                      <RadioGroup
                        row
                        value={gender}
                        onChange={(event) => setGender(event.target.value)}
                      >
                        <FormControlLabel
                          value="female"
                          control={<Radio />}
                          label="Female"
                        />
                        <FormControlLabel
                          value="male"
                          control={<Radio />}
                          label="Male"
                        />
                        <FormControlLabel
                          value="transgender"
                          control={<Radio />}
                          label="Transgender"
                        />
                        <FormControlLabel
                          value="nonBinary"
                          control={<Radio />}
                          label="Non-Binary"
                        />
                        <FormControlLabel
                          value="questioning"
                          control={<Radio />}
                          label="Questioning"
                        />
                        <FormControlLabel
                          value="differentIdentity"
                          control={<Radio />}
                          label="Different Identity"
                        />
                        <FormControlLabel
                          value="clientDoesntKnow"
                          control={<Radio />}
                          label="Client Doesn't Know"
                        />
                        <FormControlLabel
                          value="clientPrefersNotToAnswer"
                          control={<Radio />}
                          label="Client Prefers Not to Answer"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  {/* Race */}
                  <Box
                    sx={{
                      py: 2,
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Race
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {(
                        [
                          [
                            "americanIndianAlaskaNative",
                            "American Indian, Alaska Native, or Indigenous",
                          ],
                          ["asian", "Asian or Asian American"],
                          [
                            "blackAfricanAmerican",
                            "Black, African American, or African",
                          ],
                          [
                            "nativeHawaiianPacificIslander",
                            "Native Hawaiian or Pacific Islander",
                          ],
                          ["white", "White"],
                          [
                            "middleEasternNorthAfrican",
                            "Middle Eastern or North African",
                          ],
                          ["clientDoesntKnow", "Client Doesn't Know"],
                          [
                            "clientPrefersNotToAnswer",
                            "Client Prefers Not to Answer",
                          ],
                        ] as [string, string][]
                      ).map(([value, label]) => (
                        <FormControlLabel
                          key={value}
                          control={
                            <Checkbox
                              checked={race.includes(value)}
                              onChange={(event) =>
                                setRace((current) =>
                                  event.target.checked
                                    ? [...current, value]
                                    : current.filter((item) => item !== value),
                                )
                              }
                            />
                          }
                          label={label}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Ethnicity + Household Type */}
                  <Box
                    sx={{
                      py: 2,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 4,
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Ethnicity
                      </Typography>

                      <FormControl>
                        <RadioGroup
                          value={ethnicity}
                          onChange={(event) => setEthnicity(event.target.value)}
                        >
                          <FormControlLabel
                            value="hispanicLatinaeo"
                            control={<Radio />}
                            label="Hispanic/Latina/e/o"
                          />
                          <FormControlLabel
                            value="notHispanicLatinaeo"
                            control={<Radio />}
                            label="Not Hispanic/Latina/e/o"
                          />
                          <FormControlLabel
                            value="clientDoesntKnow"
                            control={<Radio />}
                            label="Client Doesn't Know"
                          />
                          <FormControlLabel
                            value="clientPrefersNotToAnswer"
                            control={<Radio />}
                            label="Client Prefers Not to Answer"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Box>

                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Household Type
                      </Typography>

                      <FormControl>
                        <RadioGroup
                          value={household}
                          onChange={(event) => setHousehold(event.target.value)}
                        >
                          <FormControlLabel
                            value="singleAdult"
                            control={<Radio />}
                            label="Single Adult"
                          />
                          <FormControlLabel
                            value="adultWithChildren"
                            control={<Radio />}
                            label="Adult with Children"
                          />
                          <FormControlLabel
                            value="multipleAdults"
                            control={<Radio />}
                            label="Multiple Adults"
                          />
                          <FormControlLabel
                            value="multipleAdultsWithChildren"
                            control={<Radio />}
                            label="Multiple Adults with Children"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Box>
                  </Box>

                  {/* Special Circumstances */}
                  <Box sx={{ pt: 2 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Special Circumstances
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={domesticViolence}
                            onChange={(event) =>
                              setDomesticViolence(event.target.checked)
                            }
                          />
                        }
                        label="Domestic Violence"
                      />

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={fosterCare}
                            onChange={(event) =>
                              setFosterCare(event.target.checked)
                            }
                          />
                        }
                        label="Foster Care"
                      />

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={humanTrafficking}
                            onChange={(event) =>
                              setHumanTrafficking(event.target.checked)
                            }
                          />
                        }
                        label="Human Trafficking"
                      />
                    </Box>

                    {domesticViolence && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 2,
                          bgcolor: "action.hover",
                          borderRadius: 1,
                        }}
                      >
                        <Box sx={{ gridColumn: "1 / -1" }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600 }}
                          >
                            Domestic Violence Details
                          </Typography>
                        </Box>

                        <TextField
                          label="Approximate Date of Most Recent Occurrence"
                          type="date"
                          value={domesticViolenceDate}
                          onChange={(event) =>
                            setDomesticViolenceDate(event.target.value)
                          }
                          slotProps={{ inputLabel: { shrink: true } }}
                        />

                        <FormControl>
                          <Typography>Currently Fleeing?</Typography>

                          <RadioGroup
                            row
                            value={currentlyFleeing}
                            onChange={(event) =>
                              setCurrentlyFleeing(event.target.value)
                            }
                          >
                            <FormControlLabel
                              value="yes"
                              control={<Radio />}
                              label="Yes"
                            />
                            <FormControlLabel
                              value="no"
                              control={<Radio />}
                              label="No"
                            />
                          </RadioGroup>
                        </FormControl>
                      </Box>
                    )}
                  </Box>
                </Paper>
              )}

              {activeIntakeSection === "homelessness" && (
                <Paper sx={{ mt: 2, p: 3 }}>
                  {/* -------------------------------------------------------------- */}
                  {/* Homelessness / Prior Living Situation                         */}
                  {/* -------------------------------------------------------------- */}
                  <Typography variant="h6">
                    Homelessness / Prior Living Situation
                  </Typography>

                  <FormControl sx={{ mt: 2, display: "block", width: "100%" }}>
                    <Typography>
                      Is this the client's first time experiencing homelessness?
                    </Typography>

                    <RadioGroup
                      row
                      value={firstTimeHomeless}
                      onChange={(event) =>
                        setFirstTimeHomeless(event.target.value)
                      }
                    >
                      <FormControlLabel
                        value="yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>

                  {firstTimeHomeless === "no" && (
                    <Box sx={{ mt: 2, width: "100%" }}>
                      <TextField
                        fullWidth
                        sx={{ maxWidth: 560, display: "block" }}
                        label="How many times has the client experienced homelessness in total?"
                        type="number"
                        value={totalTimesHomeless}
                        onChange={(event) =>
                          setTotalTimesHomeless(event.target.value)
                        }
                        slotProps={{
                          htmlInput: {
                            min: 1,
                          },
                        }}
                      />
                    </Box>
                  )}

                  {/* Prior Living Situation */}
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Prior Living Situation
                    </Typography>

                    <TextField
                      fullWidth
                      label="Where was the client living before coming to Hope House Guthrie?"
                      value={priorLivingSituation}
                      onChange={(event) =>
                        setPriorLivingSituation(event.target.value)
                      }
                    />

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                        mt: 2,
                        maxWidth: 520,
                      }}
                    >
                      <TextField
                        label="Length of Stay"
                        type="number"
                        value={priorLivingStayLength}
                        onChange={(event) =>
                          setPriorLivingStayLength(event.target.value)
                        }
                        slotProps={{
                          htmlInput: {
                            min: 0,
                          },
                        }}
                      />

                      <FormControl fullWidth>
                        <InputLabel id="prior-living-stay-unit-label">
                          Unit
                        </InputLabel>
                        <Select
                          labelId="prior-living-stay-unit-label"
                          label="Unit"
                          value={priorLivingStayUnit}
                          onChange={(event) =>
                            setPriorLivingStayUnit(event.target.value)
                          }
                        >
                          <MenuItem value="days">Days</MenuItem>
                          <MenuItem value="weeks">Weeks</MenuItem>
                          <MenuItem value="months">Months</MenuItem>
                          <MenuItem value="years">Years</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>

                  <TextField
                    sx={{ mt: 3, minWidth: 360, maxWidth: 560, width: "100%" }}
                    label="Approximate Start of Current Homeless Episode"
                    type="date"
                    value={homelessnessStartDate}
                    onChange={(event) =>
                      setHomelessnessStartDate(event.target.value)
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                  />

                  {/* Homelessness in the Past 3 Years */}
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Homelessness in the Past 3 Years
                    </Typography>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                        maxWidth: 650,
                      }}
                    >
                      <TextField
                        label="Number of Homeless Episodes"
                        type="number"
                        value={homelessEpisodesPastThreeYears}
                        onChange={(event) =>
                          setHomelessEpisodesPastThreeYears(event.target.value)
                        }
                        slotProps={{
                          htmlInput: {
                            min: 0,
                          },
                        }}
                      />

                      <TextField
                        label="Total Months Homeless"
                        type="number"
                        value={homelessMonthsPastThreeYears}
                        onChange={(event) =>
                          setHomelessMonthsPastThreeYears(event.target.value)
                        }
                        slotProps={{
                          htmlInput: {
                            min: 0,
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Last Place Stayed Before Hope House Guthrie */}
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Last Place Stayed Before Hope House Guthrie
                    </Typography>

                    <TextField
                      fullWidth
                      label="Place / Facility / Address"
                      value={lastPlaceStayed}
                      onChange={(event) =>
                        setLastPlaceStayed(event.target.value)
                      }
                    />

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 2,
                        mt: 2,
                      }}
                    >
                      <TextField
                        label="City"
                        value={lastPlaceCity}
                        onChange={(event) =>
                          setLastPlaceCity(event.target.value)
                        }
                      />

                      <TextField
                        label="County"
                        value={lastPlaceCounty}
                        onChange={(event) =>
                          setLastPlaceCounty(event.target.value)
                        }
                      />

                      <TextField
                        label="State"
                        value={lastPlaceState}
                        onChange={(event) =>
                          setLastPlaceState(event.target.value)
                        }
                      />
                    </Box>
                  </Box>
                </Paper>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* Employment, Income & Education                                   */}
              {/* ---------------------------------------------------------------- */}
              {activeIntakeSection === "employment-income" && (
                <Paper sx={{ mt: 2, p: 3 }}>
                  <Typography variant="h6">
                    Employment, Income & Education
                  </Typography>

                  {/* Employment */}
                  <FormControl sx={{ mt: 2, display: "block" }}>
                    <Typography>Is the client currently employed?</Typography>

                    <RadioGroup
                      row
                      value={currentlyEmployed}
                      onChange={(event) =>
                        setCurrentlyEmployed(event.target.value)
                      }
                    >
                      <FormControlLabel
                        value="yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>

                  {currentlyEmployed === "yes" && (
                    <Box
                      sx={{
                        mt: 1,
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr",
                        gap: 2,
                      }}
                    >
                      <TextField
                        label="Employer"
                        value={employerName}
                        onChange={(event) =>
                          setEmployerName(event.target.value)
                        }
                        fullWidth
                      />

                      <TextField
                        label="Monthly Employment Income"
                        value={monthlyEmploymentIncome}
                        onChange={(event) =>
                          setMonthlyEmploymentIncome(event.target.value)
                        }
                        type="number"
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          },
                          htmlInput: { min: 0 },
                        }}
                        fullWidth
                      />
                    </Box>
                  )}

                  {/* Other Income */}
                  <FormControl sx={{ mt: 2, display: "block" }}>
                    <Typography>
                      Does the client have any other source of income?
                    </Typography>

                    <RadioGroup
                      row
                      value={hasOtherIncome}
                      onChange={(event) =>
                        setHasOtherIncome(event.target.value)
                      }
                    >
                      <FormControlLabel
                        value="yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>

                  {hasOtherIncome === "yes" && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2">
                        Other Income Source
                      </Typography>

                      {[
                        "Disability",
                        "SSI / SSDI",
                        "Veteran Benefits",
                        "Retirement",
                        "Child Support",
                        "Other",
                      ].map((source) => (
                        <FormControlLabel
                          key={source}
                          control={
                            <Checkbox
                              checked={otherIncomeSources.includes(source)}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  setOtherIncomeSources((current) => [
                                    ...current,
                                    source,
                                  ]);
                                } else {
                                  setOtherIncomeSources((current) =>
                                    current.filter((item) => item !== source),
                                  );
                                }
                              }}
                            />
                          }
                          label={source}
                        />
                      ))}

                      {otherIncomeSources.includes("Other") && (
                        <TextField
                          label="Other Income Source"
                          value={otherIncomeDescription}
                          onChange={(event) =>
                            setOtherIncomeDescription(event.target.value)
                          }
                          fullWidth
                          sx={{ mt: 2 }}
                        />
                      )}

                      <TextField
                        label="Total Monthly Other Income"
                        value={monthlyOtherIncome}
                        onChange={(event) =>
                          setMonthlyOtherIncome(event.target.value)
                        }
                        type="number"
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          },
                          htmlInput: { min: 0 },
                        }}
                        fullWidth
                        sx={{ mt: 2, maxWidth: 400 }}
                      />
                    </Box>
                  )}

                  {/* Education */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Education
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      mt: 1,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 2,
                    }}
                  >
                    <TextField
                      select
                      label="Highest Level of Education Completed"
                      value={highestEducationCompleted}
                      onChange={(event) =>
                        setHighestEducationCompleted(event.target.value)
                      }
                      fullWidth
                    >
                      <MenuItem value="">Select...</MenuItem>
                      <MenuItem value="less-than-9th">
                        Less than 9th Grade
                      </MenuItem>
                      <MenuItem value="9th-11th">9th–11th Grade</MenuItem>
                      <MenuItem value="high-school">
                        High School Diploma
                      </MenuItem>
                      <MenuItem value="ged">
                        GED / High School Equivalency
                      </MenuItem>
                      <MenuItem value="some-college">Some College</MenuItem>
                      <MenuItem value="associate">Associate Degree</MenuItem>
                      <MenuItem value="bachelor">Bachelor's Degree</MenuItem>
                      <MenuItem value="master">Master's Degree</MenuItem>
                      <MenuItem value="doctoral">
                        Doctoral / Professional Degree
                      </MenuItem>
                      <MenuItem value="trade">
                        Trade / Vocational Certificate
                      </MenuItem>
                      <MenuItem value="unknown">Client Doesn't Know</MenuItem>
                      <MenuItem value="declined">
                        Client Prefers Not to Answer
                      </MenuItem>
                    </TextField>

                    <TextField
                      label="School / Institution"
                      value={schoolName}
                      onChange={(event) => setSchoolName(event.target.value)}
                      fullWidth
                    />
                  </Box>
                </Paper>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* Benefits & Insurance                                             */}
              {/* ---------------------------------------------------------------- */}
              {activeIntakeSection === "benefits-insurance" && (
                <Paper sx={{ mt: 2, p: 3 }}>
                  <Typography variant="h6">Benefits & Insurance</Typography>

                  {/* SoonerCare | SNAP — 2-col on sm+, 1-col on narrow */}
                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      columnGap: 3,
                      rowGap: 2,
                    }}
                  >
                    {/* SoonerCare */}
                    <Box>
                      <FormControl sx={{ display: "block", width: "100%" }}>
                        <Typography>
                          Does the client receive SoonerCare benefits?
                        </Typography>

                        <RadioGroup
                          row
                          value={soonerCareBenefits}
                          onChange={(event) =>
                            setSoonerCareBenefits(event.target.value)
                          }
                        >
                          <FormControlLabel
                            value="yes"
                            control={<Radio />}
                            label="Yes"
                          />
                          <FormControlLabel
                            value="no"
                            control={<Radio />}
                            label="No"
                          />
                        </RadioGroup>
                      </FormControl>
                      {soonerCareBenefits === "yes" && (
                        <Box
                          sx={{
                            mt: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            width: "100%",
                          }}
                        >
                          <TextField
                            select
                            label="SoonerCare Plan"
                            value={soonerCarePlan}
                            onChange={(event) =>
                              setSoonerCarePlan(event.target.value)
                            }
                            fullWidth
                          >
                            <MenuItem value="Oklahoma Complete">
                              Oklahoma Complete
                            </MenuItem>
                            <MenuItem value="Aetna">Aetna</MenuItem>
                            <MenuItem value="Humana">Humana</MenuItem>
                          </TextField>
                          <TextField
                            label="Member Number"
                            value={soonerCareId}
                            onChange={(event) =>
                              setSoonerCareId(event.target.value)
                            }
                            fullWidth
                          />
                        </Box>
                      )}
                    </Box>

                    {/* SNAP */}
                    <Box>
                      <FormControl sx={{ display: "block", width: "100%" }}>
                        <Typography>
                          Does the client receive SNAP benefits?
                        </Typography>

                        <RadioGroup
                          row
                          value={snapBenefits}
                          onChange={(event) =>
                            setSnapBenefits(event.target.value)
                          }
                        >
                          <FormControlLabel
                            value="yes"
                            control={<Radio />}
                            label="Yes"
                          />
                          <FormControlLabel
                            value="no"
                            control={<Radio />}
                            label="No"
                          />
                        </RadioGroup>
                      </FormControl>
                      {snapBenefits === "yes" && (
                        <Box
                          sx={{
                            mt: 1,
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <TextField
                            label="Day SNAP Benefits Load"
                            value={snapLoadDay}
                            onChange={(event) =>
                              setSnapLoadDay(event.target.value)
                            }
                            type="number"
                            slotProps={{
                              htmlInput: { min: 1, max: 31 },
                            }}
                            fullWidth
                          />
                          <TextField
                            label="Monthly SNAP Amount"
                            value={snapMonthlyAmount}
                            onChange={(event) =>
                              setSnapMonthlyAmount(event.target.value)
                            }
                            type="number"
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    $
                                  </InputAdornment>
                                ),
                              },
                              htmlInput: { min: 0 },
                            }}
                            fullWidth
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Simple Yes/No pairs — 2-col on sm+, 1-col on narrow */}
                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      columnGap: 3,
                      rowGap: 2,
                    }}
                  >
                    {/* Medicaid */}
                    <FormControl sx={{ display: "block", width: "100%" }}>
                      <Typography>Does the client receive Medicaid?</Typography>

                      <RadioGroup
                        row
                        value={medicaidBenefits}
                        onChange={(event) =>
                          setMedicaidBenefits(event.target.value)
                        }
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Medicare */}
                    <FormControl sx={{ display: "block", width: "100%" }}>
                      <Typography>Does the client receive Medicare?</Typography>

                      <RadioGroup
                        row
                        value={medicareBenefits}
                        onChange={(event) =>
                          setMedicareBenefits(event.target.value)
                        }
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* WIC */}
                    <FormControl sx={{ display: "block", width: "100%" }}>
                      <Typography>
                        Does the client receive WIC benefits?
                      </Typography>

                      <RadioGroup
                        row
                        value={wicBenefits}
                        onChange={(event) => setWicBenefits(event.target.value)}
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* TANF */}
                    <FormControl sx={{ display: "block", width: "100%" }}>
                      <Typography>
                        Does the client receive TANF benefits?
                      </Typography>

                      <RadioGroup
                        row
                        value={tanfBenefits}
                        onChange={(event) =>
                          setTanfBenefits(event.target.value)
                        }
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Employer Health Insurance */}
                    <FormControl sx={{ display: "block", width: "100%" }}>
                      <Typography>
                        Does the client have employer-provided health insurance?
                      </Typography>

                      <RadioGroup
                        row
                        value={employerInsurance}
                        onChange={(event) =>
                          setEmployerInsurance(event.target.value)
                        }
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Other State Health Insurance */}
                    <FormControl sx={{ display: "block", width: "100%" }}>
                      <Typography>
                        Does the client have other state health insurance?
                      </Typography>

                      <RadioGroup
                        row
                        value={otherStateHealthInsurance}
                        onChange={(event) =>
                          setOtherStateHealthInsurance(event.target.value)
                        }
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  {/* Financial Accounts */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Financial Accounts
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      columnGap: 3,
                      rowGap: 2,
                    }}
                  >
                    {/* Savings Account */}
                    <FormControl sx={{ display: "block", width: "100%" }}>
                      <Typography>
                        Does the client have a savings account?
                      </Typography>

                      <RadioGroup
                        row
                        value={hasSavingsAccount}
                        onChange={(event) =>
                          setHasSavingsAccount(event.target.value)
                        }
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Checking Account */}
                    <FormControl sx={{ display: "block", width: "100%" }}>
                      <Typography>
                        Does the client have a checking account?
                      </Typography>

                      <RadioGroup
                        row
                        value={hasCheckingAccount}
                        onChange={(event) =>
                          setHasCheckingAccount(event.target.value)
                        }
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Paper>
              )}

              {activeIntakeSection === "legal-housing" && (
                <Paper sx={{ mt: 2, p: 3 }}>
                  {/* ---------------------------------------------------------------- */}
                  {/* Legal & Housing History                                          */}
                  {/* ---------------------------------------------------------------- */}
                  <Typography variant="h6">Legal & Housing History</Typography>

                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 2, fontWeight: 600 }}
                  >
                    Legal Information
                  </Typography>
                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 3,
                    }}
                  >
                    {/* Misdemeanor */}
                    <Box>
                      <FormControl>
                        <Typography>
                          Have you ever been convicted of a misdemeanor?
                        </Typography>
                        <RadioGroup
                          row
                          value={misdemeanorConviction}
                          onChange={(e) =>
                            setMisdemeanorConviction(e.target.value)
                          }
                        >
                          <FormControlLabel
                            value="yes"
                            control={<Radio />}
                            label="Yes"
                          />
                          <FormControlLabel
                            value="no"
                            control={<Radio />}
                            label="No"
                          />
                        </RadioGroup>
                      </FormControl>

                      {misdemeanorConviction === "yes" && (
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          label="What was the misdemeanor conviction for?"
                          value={misdemeanorDetails}
                          onChange={(e) =>
                            setMisdemeanorDetails(e.target.value)
                          }
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>

                    {/* Felony */}
                    <Box>
                      <FormControl>
                        <Typography>
                          Have you ever been convicted of a felony?
                        </Typography>
                        <RadioGroup
                          row
                          value={felonyConviction}
                          onChange={(e) => setFelonyConviction(e.target.value)}
                        >
                          <FormControlLabel
                            value="yes"
                            control={<Radio />}
                            label="Yes"
                          />
                          <FormControlLabel
                            value="no"
                            control={<Radio />}
                            label="No"
                          />
                        </RadioGroup>
                      </FormControl>

                      {felonyConviction === "yes" && (
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          label="What was the felony conviction for?"
                          value={felonyDetails}
                          onChange={(e) => setFelonyDetails(e.target.value)}
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 3,
                    }}
                  >
                    {/* Probation */}
                    <FormControl>
                      <Typography>Are you currently on probation?</Typography>
                      <RadioGroup
                        row
                        value={onProbation}
                        onChange={(e) => setOnProbation(e.target.value)}
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Parole */}
                    <FormControl>
                      <Typography>Are you currently on parole?</Typography>
                      <RadioGroup
                        row
                        value={onParole}
                        onChange={(e) => setOnParole(e.target.value)}
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 3,
                    }}
                  >
                    {/* Arrest Warrants */}
                    <FormControl>
                      <Typography>
                        Do you currently have any warrants for your arrest?
                      </Typography>
                      <RadioGroup
                        row
                        value={hasArrestWarrants}
                        onChange={(e) => setHasArrestWarrants(e.target.value)}
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Unpaid Tickets */}
                    <FormControl>
                      <Typography>
                        Do you currently have any tickets that need to be paid?
                      </Typography>
                      <RadioGroup
                        row
                        value={hasUnpaidTickets}
                        onChange={(e) => setHasUnpaidTickets(e.target.value)}
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  {/* Child Support */}
                  <Box sx={{ mt: 2 }}>
                    <FormControl>
                      <Typography>
                        What is your current child support status?
                      </Typography>
                      <RadioGroup
                        row
                        value={childSupportStatus}
                        onChange={(e) => setChildSupportStatus(e.target.value)}
                      >
                        <FormControlLabel
                          value="paying"
                          control={<Radio />}
                          label="Paying"
                        />
                        <FormControlLabel
                          value="receiving"
                          control={<Radio />}
                          label="Receiving"
                        />
                        <FormControlLabel
                          value="both"
                          control={<Radio />}
                          label="Both"
                        />
                        <FormControlLabel
                          value="neither"
                          control={<Radio />}
                          label="Neither"
                        />
                      </RadioGroup>
                    </FormControl>

                    {(childSupportStatus === "paying" ||
                      childSupportStatus === "receiving" ||
                      childSupportStatus === "both") && (
                      <TextField
                        label="Monthly Child Support Amount"
                        value={monthlyChildSupportAmount}
                        onChange={(e) =>
                          setMonthlyChildSupportAmount(e.target.value)
                        }
                        sx={{ mt: 1, maxWidth: 320 }}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  </Box>

                  {/* ---------------------------------------------------------------- */}
                  {/* Housing History                                                  */}
                  {/* ---------------------------------------------------------------- */}
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 3, fontWeight: 600 }}
                  >
                    Housing History
                  </Typography>
                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 3,
                    }}
                  >
                    {/* Landlord Debt */}
                    <Box>
                      <FormControl>
                        <Typography>
                          Do you owe any money to a landlord due to breaking a
                          lease?
                        </Typography>
                        <RadioGroup
                          row
                          value={owesLandlordMoney}
                          onChange={(e) => setOwesLandlordMoney(e.target.value)}
                        >
                          <FormControlLabel
                            value="yes"
                            control={<Radio />}
                            label="Yes"
                          />
                          <FormControlLabel
                            value="no"
                            control={<Radio />}
                            label="No"
                          />
                        </RadioGroup>
                      </FormControl>

                      {owesLandlordMoney === "yes" && (
                        <TextField
                          label="Amount Owed"
                          value={landlordAmountOwed}
                          onChange={(e) =>
                            setLandlordAmountOwed(e.target.value)
                          }
                          sx={{ mt: 1, ml: 2, maxWidth: 320 }}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  $
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      )}
                    </Box>

                    {/* Utility Debt */}
                    <Box>
                      <FormControl>
                        <Typography>
                          Do you owe any money to a utility company?
                        </Typography>
                        <RadioGroup
                          row
                          value={owesUtilityMoney}
                          onChange={(e) => setOwesUtilityMoney(e.target.value)}
                        >
                          <FormControlLabel
                            value="yes"
                            control={<Radio />}
                            label="Yes"
                          />
                          <FormControlLabel
                            value="no"
                            control={<Radio />}
                            label="No"
                          />
                        </RadioGroup>
                      </FormControl>

                      {owesUtilityMoney === "yes" && (
                        <TextField
                          label="Amount Owed"
                          value={utilityAmountOwed}
                          onChange={(e) => setUtilityAmountOwed(e.target.value)}
                          sx={{ mt: 1, ml: 2, maxWidth: 320 }}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  $
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 3,
                    }}
                  >
                    {/* Eviction History */}
                    <FormControl>
                      <Typography>
                        Have you ever had an eviction notice?
                      </Typography>
                      <RadioGroup
                        row
                        value={hasEvictionHistory}
                        onChange={(e) => setHasEvictionHistory(e.target.value)}
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Paid Storage */}
                    <FormControl>
                      <Typography>
                        Are you currently paying for a storage unit?
                      </Typography>
                      <RadioGroup
                        row
                        value={hasPaidStorage}
                        onChange={(e) => setHasPaidStorage(e.target.value)}
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Paper>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* Health, Substance Use & Support                                   */}
              {/* ---------------------------------------------------------------- */}
              {activeIntakeSection === "health-support" && (
                <Paper sx={{ p: 3, mt: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Health, Substance Use & Support
                  </Typography>

                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 2, fontWeight: 600 }}
                  >
                    Substance Use
                  </Typography>

                  <FormControl sx={{ mt: 2 }}>
                    <Typography>
                      Do you have any current or past substance use concerns?
                    </Typography>
                    <RadioGroup
                      row
                      value={hasSubstanceUseConcerns}
                      onChange={(e) =>
                        setHasSubstanceUseConcerns(e.target.value)
                      }
                    >
                      <FormControlLabel
                        value="yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>
                  {hasSubstanceUseConcerns === "yes" && (
                    <Box sx={{ mb: 2 }}>
                      <Typography sx={{ mb: 1 }}>
                        Select all substances that apply:
                      </Typography>

                      {[
                        "Alcohol",
                        "Methamphetamine",
                        "Cocaine / Crack Cocaine",
                        "Marijuana / Cannabis",
                        "Opioids / Heroin",
                        "Prescription Opioids",
                        "Fentanyl",
                        "Benzodiazepines",
                        "Prescription Stimulants",
                        "Hallucinogens",
                        "Inhalants",
                        "Other",
                      ].map((substance) => (
                        <FormControlLabel
                          key={substance}
                          control={
                            <Checkbox
                              checked={substancesUsed.includes(substance)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSubstancesUsed([
                                    ...substancesUsed,
                                    substance,
                                  ]);
                                } else {
                                  setSubstancesUsed(
                                    substancesUsed.filter(
                                      (item) => item !== substance,
                                    ),
                                  );
                                }
                              }}
                            />
                          }
                          label={substance}
                        />
                      ))}

                      {substancesUsed.includes("Other") && (
                        <TextField
                          fullWidth
                          label="Other Substance"
                          value={otherSubstance}
                          onChange={(e) => setOtherSubstance(e.target.value)}
                          sx={{ mt: 1 }}
                        />
                      )}

                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        label="Substance Use Details (Optional)"
                        value={substanceUseDetails}
                        onChange={(e) => setSubstanceUseDetails(e.target.value)}
                        sx={{ mt: 2 }}
                      />
                    </Box>
                  )}
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 3, fontWeight: 600 }}
                  >
                    Medical & Health
                  </Typography>

                  <FormControl sx={{ mt: 2 }}>
                    <Typography>
                      Are you currently receiving treatment for a medical
                      condition?
                    </Typography>
                    <RadioGroup
                      row
                      value={currentlyReceivingMedicalTreatment}
                      onChange={(e) =>
                        setCurrentlyReceivingMedicalTreatment(e.target.value)
                      }
                    >
                      <FormControlLabel
                        value="yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>
                  {currentlyReceivingMedicalTreatment === "yes" && (
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="Medical Condition / Treatment Details"
                      value={medicalTreatmentDetails}
                      onChange={(e) =>
                        setMedicalTreatmentDetails(e.target.value)
                      }
                      sx={{ mt: 1 }}
                    />
                  )}
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 3, fontWeight: 600 }}
                  >
                    Health / Support Needs
                  </Typography>

                  <Typography sx={{ mt: 1, mb: 1 }}>
                    Select all that apply:
                  </Typography>

                  {[
                    "Behavioral",
                    "Physical Disability",
                    "Medical / Health",
                    "Mental Health",
                    "Developmental",
                    "Other",
                    "None",
                  ].map((need) => (
                    <FormControlLabel
                      key={need}
                      control={
                        <Checkbox
                          checked={healthSupportNeeds.includes(need)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (need === "None") {
                                setHealthSupportNeeds(["None"]);
                              } else {
                                setHealthSupportNeeds([
                                  ...healthSupportNeeds.filter(
                                    (item) => item !== "None",
                                  ),
                                  need,
                                ]);
                              }
                            } else {
                              setHealthSupportNeeds(
                                healthSupportNeeds.filter(
                                  (item) => item !== need,
                                ),
                              );
                            }
                          }}
                        />
                      }
                      label={need}
                    />
                  ))}
                  {healthSupportNeeds.includes("Other") && (
                    <TextField
                      fullWidth
                      label="Other Health / Support Need"
                      value={otherHealthSupportNeed}
                      onChange={(e) =>
                        setOtherHealthSupportNeed(e.target.value)
                      }
                      sx={{ mt: 1 }}
                    />
                  )}
                  {healthSupportNeeds
                    .filter((need) => need !== "Other" && need !== "None")
                    .map((need) => (
                      <TextField
                        key={need}
                        fullWidth
                        multiline
                        minRows={2}
                        label={`${need} Details (Optional)`}
                        value={healthSupportDetails[need] || ""}
                        onChange={(e) =>
                          setHealthSupportDetails({
                            ...healthSupportDetails,
                            [need]: e.target.value,
                          })
                        }
                        sx={{ mt: 2 }}
                      />
                    ))}
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 3, fontWeight: 600 }}
                  >
                    Social & Financial Support
                  </Typography>

                  <Typography sx={{ mt: 1 }}>
                    What social and financial support do you currently have?
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 0.5, mb: 1 }}>
                    Select all that apply. Support may include yourself, people
                    in your life, or organizations/services you can rely on.
                  </Typography>

                  {[
                    "Self",
                    "Family",
                    "Friends",
                    "Partner / Spouse",
                    "Church / Faith Community",
                    "Case Manager / Social Worker",
                    "Counselor / Therapist",
                    "Probation / Drug Court",
                    "Community Organization",
                    "Other",
                    "None",
                  ].map((support) => (
                    <FormControlLabel
                      key={support}
                      control={
                        <Checkbox
                          checked={socialFinancialSupport.includes(support)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (support === "None") {
                                setSocialFinancialSupport(["None"]);
                              } else {
                                setSocialFinancialSupport([
                                  ...socialFinancialSupport.filter(
                                    (item) => item !== "None",
                                  ),
                                  support,
                                ]);
                              }
                            } else {
                              setSocialFinancialSupport(
                                socialFinancialSupport.filter(
                                  (item) => item !== support,
                                ),
                              );
                            }
                          }}
                        />
                      }
                      label={support}
                    />
                  ))}
                  {socialFinancialSupport.includes("Other") && (
                    <TextField
                      fullWidth
                      label="Other Social / Financial Support"
                      value={otherSocialFinancialSupport}
                      onChange={(e) =>
                        setOtherSocialFinancialSupport(e.target.value)
                      }
                      sx={{ mt: 1 }}
                    />
                  )}
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 3, fontWeight: 600 }}
                  >
                    Children / School & Childcare
                  </Typography>

                  <FormControl sx={{ mt: 1 }}>
                    <Typography>
                      Are any of your children currently enrolled in childcare
                      or school?
                    </Typography>
                    <RadioGroup
                      row
                      value={childrenInSchoolOrChildcare}
                      onChange={(e) =>
                        setChildrenInSchoolOrChildcare(e.target.value)
                      }
                    >
                      <FormControlLabel
                        value="yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio />}
                        label="No"
                      />
                      <FormControlLabel
                        value="not-applicable"
                        control={<Radio />}
                        label="Not Applicable"
                      />
                    </RadioGroup>
                  </FormControl>
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 3, fontWeight: 600 }}
                  >
                    Religious / Spiritual Traditions
                  </Typography>

                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Religious / Spiritual Traditions (Optional)"
                    value={religiousSpiritualTraditions}
                    onChange={(e) =>
                      setReligiousSpiritualTraditions(e.target.value)
                    }
                    sx={{ mt: 1 }}
                  />
                </Paper>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* Agreements & Waivers                                             */}
              {/* ---------------------------------------------------------------- */}
              {activeIntakeSection === "agreements-waivers" && (
                <>
                  <Paper sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Agreements & Waivers
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <Typography>
                        At NHD/Hope House Guthrie, we make sure to comply with
                        the rules and regulations set by Child Support Services
                        and the Department of Human Services. We understand the
                        importance of following these guidelines for the
                        well-being and safety of our community.
                      </Typography>

                      <TextField
                        label="Client Initials"
                        value={childSupportDhsInitials}
                        onChange={(e) =>
                          setChildSupportDhsInitials(e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                    <Box sx={{ mt: 3 }}>
                      <Typography>
                        We want to remind you that NHD/Hope House Guthrie cannot
                        be held responsible for any instances of medication
                        misuse, theft, or loss. It is important that you take
                        additional measures to protect your medications and
                        prioritize your safety and health. As a precaution, we
                        will assign lockers to each client to ensure the safety
                        of your medication.
                      </Typography>

                      <TextField
                        label="Client Initials"
                        value={medicationResponsibilityInitials}
                        onChange={(e) =>
                          setMedicationResponsibilityInitials(e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                    <Box sx={{ mt: 3 }}>
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

                      <TextField
                        label="Client Initials"
                        value={vehicleTransportationInitials}
                        onChange={(e) =>
                          setVehicleTransportationInitials(e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                    <Box sx={{ mt: 3 }}>
                      <Typography>
                        If you are separated from NHD/Hope House Guthrie for any
                        reason, it is important to note that you have 48 hours
                        (about 2 days) to remove your possessions from the
                        property. Failure to do so within this time frame could
                        result in your possessions becoming NHD/Hope House
                        Guthrie property.
                      </Typography>

                      <TextField
                        label="Client Initials"
                        value={possessionsInitials}
                        onChange={(e) => setPossessionsInitials(e.target.value)}
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                    <Box sx={{ mt: 3 }}>
                      <Typography>
                        You have agreed to follow all guidelines as a client of
                        NHD/Hope House Guthrie's Life Transformation Program or
                        Emergency Shelter Program. It's great to see that you
                        are committed to your journey towards transformation and
                        growth.
                      </Typography>

                      <TextField
                        label="Client Initials"
                        value={programGuidelinesInitials}
                        onChange={(e) =>
                          setProgramGuidelinesInitials(e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                    <Box sx={{ mt: 3 }}>
                      <Typography>
                        I understand and consent to the performance of
                        background checks, sharing information with law
                        enforcement, drug and alcohol testing and search and
                        seizure of property at the NHD/Hope House Guthrie.
                      </Typography>

                      <TextField
                        label="Client Initials"
                        value={backgroundTestingSearchInitials}
                        onChange={(e) =>
                          setBackgroundTestingSearchInitials(e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                    <Box sx={{ mt: 3 }}>
                      <Typography>
                        Please be aware that any information shared between our
                        agency and the relevant person or organization will be
                        utilized exclusively to facilitate mutual planning
                        services. Our goal is to ensure that both parties'
                        benefit from this information exchange.
                      </Typography>

                      <TextField
                        label="Client Initials"
                        value={informationSharingInitials}
                        onChange={(e) =>
                          setInformationSharingInitials(e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>

                    {/* Facility Bedroom & Utility Expectations */}
                    <Box sx={{ mt: 3 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Facility Bedroom & Utility Excectations
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
                        clean, and comfortable living enviroment while
                        conserving facility resources. By initialing below, the
                        client confirms that these expectations have been
                        reviewed and understood and agrees to follow them while
                        staying at Hope HOuse Guthrie.
                      </Typography>

                      <TextField
                        label="Clieent Initials"
                        value={facilityExpectationsInitials}
                        onChange={(e) =>
                          setFacilityExpectationsInitials(e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>

                    {/* Volunteer Release and Waiver of Liability */}
                    <Box sx={{ mt: 3 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Volunteer Release and Waiver of Liability
                      </Typography>

                      <Typography>
                        This Volunteer Release and Waiver of Liability (the
                        "Release") is executed on {intakeDate} on behalf of{" "}
                        {[firstName, middleName, lastName]
                          .filter(Boolean)
                          .join(" ")}{" "}
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
                      <TextField
                        label="Client Initials"
                        value={volunteerWaiverInitials}
                        onChange={(e) =>
                          setVolunteerWaiverInitials(e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>

                    {/* Confidentiality Agreement */}
                    <Box sx={{ mt: 3 }}>
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

                      <TextField
                        label="Client Initials"
                        value={confidentialityAgreementInitials}
                        onChange={(e) =>
                          setConfidentialityAgreementInitials(e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>

                    {/* Co-Ed Accountability Policy */}
                    <Box sx={{ mt: 3 }}>
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
                      <TextField
                        label="Client Initials"
                        value={coEdAccountabilityInitials}
                        onChange={(e) =>
                          setCoEdAccountabilityInitials(e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>

                    {/* Dress for Success */}
                    <Box sx={{ mt: 3 }}>
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

                      <TextField
                        label="Client Initials"
                        value={dressForSuccessInitials}
                        onChange={(e) =>
                          setDressForSuccessInitials(e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>

                    {/* Nondiscrimination and Equal Opportunity Statement */}
                    <Box sx={{ mt: 3 }}>
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

                      <TextField
                        label="Client Initials"
                        value={nondiscriminationInitials}
                        onChange={(e) =>
                          setNondiscriminationInitials(e.target.value)
                        }
                        sx={{ mt: 2, maxWidth: 200 }}
                      />
                    </Box>
                  </Paper>
                </>
              )}

              {activeIntakeSection === "program-assignment" && (
                <Paper sx={{ p: 3, mt: 3 }}>
                  {/* Program Assignment */}
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Program Assignment
                    </Typography>

                    <FormControl>
                      <Typography sx={{ mb: 1 }}>
                        Which program is the client entering?
                      </Typography>

                      <RadioGroup
                        value={clientProgram}
                        onChange={(e) => setClientProgram(e.target.value)}
                      >
                        <FormControlLabel
                          value="LTP"
                          control={<Radio />}
                          label="Life Transformation Program (LTP)"
                        />
                        <FormControlLabel
                          value="TEMP"
                          control={<Radio />}
                          label="Emergency Temporary Shelter (TEMP)"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  {clientProgram === "LTP" && (
                    <>
                      {/* Life Transformation Program */}
                      <Box sx={{ mt: 3 }}>
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

                        <TextField
                          label="Client Initials"
                          value={lifeTransformationProgramInitials}
                          onChange={(e) =>
                            setLifeTransformationProgramInitials(e.target.value)
                          }
                          sx={{ mt: 2, maxWidth: 200 }}
                        />
                      </Box>
                    </>
                  )}

                  {clientProgram === "TEMP" && (
                    <>
                      {/* Emergency Temporary Shelter Program */}
                      <Box sx={{ mt: 3 }}>
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

                        <TextField
                          label="Client Initials"
                          value={temporaryShelterProgramInitials}
                          onChange={(e) =>
                            setTemporaryShelterProgramInitials(e.target.value)
                          }
                          sx={{ mt: 2, maxWidth: 200 }}
                        />
                      </Box>
                    </>
                  )}
                </Paper>
              )}

              {activeIntakeSection === "covid-health" && (
                <Paper sx={{ p: 3, mt: 3 }}>
                  {/* COVID-19 Health & Safety Information */}
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      COVID-19 Health & Safety Information
                    </Typography>

                    <Typography>
                      Public health requirements and recommended precautions
                      related to COVID-19 may be updated over time. Hope House
                      Guthrie reserves the right to implement reasonable health
                      and safety measures as needed to protect clients, staff,
                      volunteers, and visitors.
                    </Typography>

                    <Typography sx={{ mt: 2, fontWeight: 600 }}>
                      Have you received a COVID-19 vaccination?
                    </Typography>

                    <RadioGroup
                      row
                      value={covidVaccinated}
                      onChange={(e) => setCovidVaccinated(e.target.value)}
                    >
                      <FormControlLabel
                        value="Yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="No"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>

                    {covidVaccinated === "Yes" && (
                      <TextField
                        label="Approximate Vaccination Date"
                        type="date"
                        value={covidVaccinationDate}
                        onChange={(e) =>
                          setCovidVaccinationDate(e.target.value)
                        }
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                        sx={{ mt: 1, width: 220, maxWidth: "100%" }}
                      />
                    )}

                    {covidVaccinated === "No" && (
                      <TextField
                        label="Vaccination Appointment Date"
                        type="date"
                        value={covidVaccinationAppointmentDate}
                        onChange={(e) =>
                          setCovidVaccinationAppointmentDate(e.target.value)
                        }
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                        sx={{ mt: 1, width: 220, maxWidth: "100%" }}
                      />
                    )}

                    <Typography sx={{ mt: 2, fontWeight: 600 }}>
                      Was proof of COVID-19 vaccination provided?
                    </Typography>

                    <RadioGroup
                      row
                      value={covidVaccinationProof}
                      onChange={(e) => setCovidVaccinationProof(e.target.value)}
                    >
                      <FormControlLabel
                        value="Yes"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="No"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>

                    {covidVaccinationProof === "Yes" && (
                      <Box sx={{ mt: 1 }}>
                        <Button variant="outlined" component="label">
                          Attach Proof of Vaccination
                          <input
                            type="file"
                            hidden
                            accept="image/*,.pdf"
                            onChange={(e) =>
                              setCovidVaccinationProofFile(
                                e.target.files?.[0] ?? null,
                              )
                            }
                          />
                        </Button>

                        {covidVaccinationProofFile && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Selected: {covidVaccinationProofFile.name}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </Paper>
              )}

              {activeIntakeSection === "snap-notice" && (
                <Paper sx={{ p: 3, mt: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    SNAP Benefits Notice
                  </Typography>
                  <Typography sx={{ mt: 2 }}>
                    SNAP benefit information collected during intake will be
                    used for this acknowledgment.
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 2, fontWeight: 600 }}
                  >
                    Important SNAP Benefits Information
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    NHD/Hope House Guthrie does not take, hold, manage, or
                    require access to any participant&apos;s Supplemental
                    Nutrition Assistance Program (SNAP) benefits. All SNAP
                    benefits remain the sole property and responsibility of the
                    participant.
                  </Typography>
                  <Typography sx={{ mt: 2 }}>
                    At this time, NHD/Hope House Guthrie is seeking guidance
                    from the Oklahoma Department of Mental Health and Substance
                    Abuse Services to become a provider-certified treatment
                    center. Until formal certification is received, Hope House
                    Guthrie will not act as an authorized representative for
                    SNAP benefits.
                  </Typography>
                  <Typography sx={{ mt: 2 }}>
                    Participation in this program is not dependent on SNAP
                    benefit status, use, or non-use. No participant will be
                    penalized, denied services, or treated differently for how
                    they choose to use or manage their SNAP benefits, or for
                    asking questions about their rights.
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      SNAP Status
                    </Typography>

                    <Typography sx={{ mt: 1 }}>
                      {snapBenefits === "Yes"
                        ? "Receives SNAP"
                        : snapBenefits === "No"
                          ? "Does Not Receive SNAP"
                          : "SNAP status has not been entered."}
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Participant Acknowledgment
                      </Typography>

                      <Typography sx={{ mt: 1 }}>
                        I understand that NHD/Hope House Guthrie does not
                        require access to my SNAP benefits and that I retain
                        full control over my benefits.
                      </Typography>
                      <Typography sx={{ mt: 2 }}>
                        <strong>Participant Name:</strong>{" "}
                        {[firstName, middleName, lastName]
                          .filter(Boolean)
                          .join(" ") || "Not entered"}
                      </Typography>
                      <TextField
                        label="Acknowledgment Date"
                        type="date"
                        value={snapAcknowledgmentDate}
                        onChange={(e) =>
                          setSnapAcknowledgmentDate(e.target.value)
                        }
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                        sx={{ mt: 2, width: 220, maxWidth: "100%" }}
                      />
                    </Box>
                  </Box>
                </Paper>
              )}

              {/* Client Handbook */}
              {activeIntakeSection === "client-handbook" && (
                <Paper sx={{ p: 3, mt: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Client Handbook
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 1.5,
                      mt: 2,
                    }}
                  >
                    {[
                      ["getting-started", "Getting Started"],
                      ["passes-conduct", "Passes & House Conduct"],
                      ["responsibilities", "Responsibilities & Daily Life"],
                      ["community-rules", "Personal & Community Rules"],
                      ["safety", "Dress, Transportation & Safety"],
                      ["counseling", "Counseling"],
                    ].map(([id, label]) => (
                      <Button
                        key={id}
                        variant={
                          activeHandbookTab === id ? "contained" : "outlined"
                        }
                        onClick={() => setActiveHandbookTab(id ?? "")}
                      >
                        {label}
                      </Button>
                    ))}
                  </Box>

                  {/* Getting Started - Client Handbook */}
                  {activeHandbookTab === "getting-started" && (
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
                  )}

                  {/* Passes & House Conduct */}
                  {activeHandbookTab === "passes-conduct" && (
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
                  )}

                  {/* Responsibilities & Daily Life */}
                  {activeHandbookTab === "responsibilities" && (
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
                  )}

                  {/* Personal & Community Rules */}
                  {activeHandbookTab === "community-rules" && (
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
                  )}

                  {/* Dress, Transportation & Safety */}
                  {activeHandbookTab === "safety" && (
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
                  )}

                  {/* Counseling */}
                  {activeHandbookTab === "counseling" && (
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
                  )}
                </Paper>
              )}

              {/* Authorizations */}
              {activeIntakeSection === "authorizations" && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Authorizations
                  </Typography>

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

                  <Box sx={{ mt: 3 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      Do you authorize the HMIS / ShareLink Release of
                      Information?
                    </Typography>

                    <RadioGroup
                      value={hmisAuthorization}
                      onChange={(event) =>
                        setHmisAuthorization(event.target.value)
                      }
                      sx={{ mt: 1 }}
                    >
                      <FormControlLabel
                        value="accepted"
                        control={<Radio />}
                        label="YES - ACCEPTED"
                      />

                      <FormControlLabel
                        value="denied"
                        control={<Radio />}
                        label="NO - DENIED"
                      />
                    </RadioGroup>

                    <Typography sx={{ fontWeight: 600, mb: 1 }}>
                      Client Signature
                    </Typography>

                    <SignatureCanvas
                      onSignatureChange={setHmisSignature}
                      width={500}
                      height={100}
                      showLabel={false}
                    />
                    <Typography sx={{ mt: 2, fontWeight: 600 }}>
                      Date
                    </Typography>

                    <TextField
                      type="date"
                      value={hmisSignatureDate}
                      onChange={(event) =>
                        setHmisSignatureDate(event.target.value)
                      }
                      onFocus={() => {
                        if (!hmisSignatureDate) {
                          setHmisSignatureDate(
                            new Date().toLocaleDateString("en-CA"),
                          );
                        }
                      }}
                      sx={{ mt: 1, width: 220 }}
                    />
                  </Box>
                </Paper>
              )}

              {/* Final Review */}
              {activeIntakeSection === "final-review" && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Final Review
                  </Typography>

                  <Typography sx={{ mt: 2, fontWeight: 600 }}>
                    Final Intake Acknowledgment
                  </Typography>

                  <Typography sx={{ mt: 0.5 }}>
                    By signing below, you acknowledge that you have received
                    full clarification of all information contained in this
                    intake application and agree to comply with its terms and
                    conditions.
                  </Typography>

                  <Typography sx={{ mt: 1 }}>
                    You understand that you may request a copy of your client
                    file by completing and submitting the required request form
                    (Form 48 ETA).
                  </Typography>

                  <Typography sx={{ mt: 2, fontWeight: 600 }}>
                    Nondiscrimination
                  </Typography>

                  <Typography sx={{ mt: 0.5 }}>
                    Neighborhood Hope Dealers, Inc., dba Hope House Guthrie,
                    does not discriminate on the basis of race, color, religion,
                    sex, national origin, age, disability, or any other
                    protected status.
                  </Typography>

                  <Typography sx={{ mt: 2, fontWeight: 600 }}>
                    Program Services & Housing Contribution
                  </Typography>

                  <Typography sx={{ mt: 0.5 }}>
                    All services provided by Neighborhood Hope Dealers, Inc.,
                    dba Hope House Guthrie, are provided at no cost to the
                    client.
                  </Typography>

                  <Typography sx={{ mt: 1 }}>
                    Clients may choose to make a voluntary contribution toward
                    housing expenses. Any housing contribution is voluntary and
                    is not required as a condition of receiving services.
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    <Typography sx={{ fontWeight: 600, mt: 1 }}>
                      Client Signature
                    </Typography>

                    <SignatureCanvas
                      onSignatureChange={setFinalClientSignature}
                      width={500}
                      height={100}
                      showLabel={false}
                    />
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography sx={{ fontWeight: 600, mt: 1 }}>
                      Administration Signature
                    </Typography>

                    <SignatureCanvas
                      onSignatureChange={setFinalAdminSignature}
                      width={500}
                      height={100}
                      showLabel={false}
                    />
                  </Box>
                  <Box
                    sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button variant="contained" onClick={completeIntake}>
                      Complete Intake
                    </Button>
                  </Box>
                </Paper>
              )}
            </Box>
          </Box>
        </>
      )}

      {activeTab === 1 && (
        <Paper sx={{ mt: 2, p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Draft Intakes
          </Typography>

          {draftIntakes.length === 0 && (
            <Typography sx={{ mt: 1 }}>No draft intakes.</Typography>
          )}

          {draftIntakes.map((draft) => (
            <Paper key={draft.id} variant="outlined" sx={{ mt: 2, p: 3 }}>
              <Typography sx={{ fontWeight: 600 }}>
                {draft.clientName || "Unnamed Client"}
              </Typography>

              <Typography variant="body2">
                Intake Date: {draft.intakeDate || "Not entered"}
              </Typography>

              <Typography variant="body2">
                Last Updated: {draft.lastUpdated}
              </Typography>

              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => {
                  setActiveDraftId(draft.id);
                  loadIntakeData(draft);
                  setActiveTab(0);
                }}
              >
                Open Intake
              </Button>
            </Paper>
          ))}
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper sx={{ mt: 2, p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Completed Intakes
          </Typography>

          {completedIntakes.length === 0 && (
            <Typography sx={{ mt: 1 }}>No completed intakes.</Typography>
          )}

          {completedIntakes.map((intake) => (
            <Paper key={intake.id} variant="outlined" sx={{ mt: 2, p: 3 }}>
              <Typography sx={{ fontWeight: 600 }}>
                {intake.clientName || "Unnamed Client"}
                <Typography variant="body2">
                  Hope House #: {intake.hopeHouseNumber}
                </Typography>
                <Typography variant="body2">
                  Program: {intake.formData.clientProgram || "Not assigned"}
                </Typography>
                <Typography variant="body2">
                  Review Status: {intake.reviewStatus}
                </Typography>
                <Typography variant="body2">
                  Completed: {new Date(intake.completedAt).toLocaleString()}
                </Typography>
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    setActiveCompletedIntakeId(intake.id);
                    loadIntakeData(intake);
                    setActiveTab(0);
                  }}
                >
                  Open for Review
                </Button>
              </Typography>
            </Paper>
          ))}
        </Paper>
      )}
    </Box>
  );
}
