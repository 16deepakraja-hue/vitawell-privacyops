/**
 * Seed data for VitaWell PrivacyOps — Phase 1: Data Mapping.
 *
 * Every record below is taken directly from the
 * "VitaWell Health Technologies — Company Case Study" document.
 * VitaWell is a fictional HealthTech/telemedicine SaaS operating in
 * India and the EU, subject to both UK/EU GDPR and India's DPDP Act 2023.
 */

import { PrismaClient, RiskLevel, DataType } from "@prisma/client";
import { scoreDpia, buildRisksFromScore } from "../src/lib/risk-engine";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding VitaWell data map…");

  // Clean slate (order respects relations).
  await prisma.mitigationAction.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.dPIA.deleteMany();
  await prisma.retentionSchedule.deleteMany();
  await prisma.processingActivity.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.system.deleteMany();
  await prisma.dataCategory.deleteMany();
  await prisma.dataSubject.deleteMany();

  // -------------------------------------------------------------------------
  // §3 Data Subjects
  // -------------------------------------------------------------------------
  const subjects = await Promise.all(
    [
      {
        category: "Patients / end users",
        examples: "B2C app users in India and the EU",
        notes: "Include vulnerable individuals (ill, anxious, mental-health users)",
        isVulnerable: true,
      },
      {
        category: "Doctors & wellness coaches",
        examples: "Practitioners delivering consultations",
        notes: "Many are contractors; they are data subjects and create patient data",
        isVulnerable: false,
      },
      {
        category: "Corporate client employees",
        examples: "Employees enrolled by their employer",
        notes: "Employer–employee power imbalance adds sensitivity",
        isVulnerable: false,
      },
      {
        category: "Corporate client contacts",
        examples: "HR admins, B2B buyers",
        notes: "Business-contact data",
        isVulnerable: false,
      },
      {
        category: "VitaWell employees",
        examples: "Internal staff",
        notes: "Payroll, HR data",
        isVulnerable: false,
      },
      {
        category: "Job applicants",
        examples: "Candidates via careers portal",
        notes: "Short-retention recruitment data",
        isVulnerable: false,
      },
      {
        category: "Website visitors / prospects",
        examples: "Marketing leads, cookie subjects",
        notes: "Online identifiers",
        isVulnerable: false,
      },
    ].map((data) => prisma.dataSubject.create({ data }))
  );
  const subj = Object.fromEntries(subjects.map((s) => [s.category, s]));

  // -------------------------------------------------------------------------
  // §4 Personal Data Collected
  // -------------------------------------------------------------------------
  const categories = await Promise.all(
    [
      {
        name: "Identity & contact data",
        type: DataType.ORDINARY,
        examples: "Name, email, phone, date of birth, gender, address, emergency contact",
        collected: true,
      },
      {
        name: "Account & device data",
        type: DataType.ORDINARY,
        examples: "IP address, app-usage data, device identifiers, appointment history",
        collected: true,
      },
      {
        name: "Payment data",
        type: DataType.ORDINARY,
        examples: "Payment card token, billing details",
        collected: true,
      },
      {
        name: "Health data",
        type: DataType.SPECIAL,
        examples:
          "Symptoms, diagnoses, prescriptions, lab results, mental-health coaching notes (GDPR Art. 9; sensitive under DPDP & Indian SPDI norms)",
        collected: true,
      },
      {
        name: "Government identifiers",
        type: DataType.GOV_ID,
        examples: "Aadhaar / PAN / passport for KYC (highly sensitive in India)",
        collected: true,
      },
      {
        name: "Biometric / genetic data",
        type: DataType.BIOMETRIC,
        examples: "Not currently collected — explicitly confirmed during mapping",
        collected: false,
      },
    ].map((data) => prisma.dataCategory.create({ data }))
  );
  const cat = Object.fromEntries(categories.map((c) => [c.name, c]));

  // -------------------------------------------------------------------------
  // §7 Internal Systems
  // -------------------------------------------------------------------------
  const systems = await Promise.all(
    [
      { name: "App backend", purpose: "Core application", dataHeld: "Identity, account, usage" },
      {
        name: "EHR / clinical records system",
        purpose: "Store consultation records",
        dataHeld: "Health data (special category)",
      },
      { name: "Payment service", purpose: "Process payments", dataHeld: "Payment tokens, billing" },
      { name: "CRM", purpose: "Customer/B2B management", dataHeld: "Contact, account details" },
      {
        name: "Marketing automation",
        purpose: "Campaigns",
        dataHeld: "Prospect, consent data",
      },
      {
        name: "Support desk",
        purpose: "Customer tickets",
        dataHeld: "Contact, issue, incidental health info",
      },
      {
        name: "Product analytics",
        purpose: "Usage measurement",
        dataHeld: "Device, behaviour (pseudonymised)",
      },
      { name: "Data warehouse", purpose: "Reporting / BI", dataHeld: "Aggregated data" },
      {
        name: "HRIS / payroll",
        purpose: "Employee management",
        dataHeld: "Employee personal & financial data",
      },
      { name: "Recruitment portal (ATS)", purpose: "Hiring", dataHeld: "Applicant data" },
    ].map((data) => prisma.system.create({ data }))
  );
  const sys = Object.fromEntries(systems.map((s) => [s.name, s]));

  // -------------------------------------------------------------------------
  // §8 Third-Party Vendors / Processors
  // -------------------------------------------------------------------------
  const vendors = await Promise.all(
    [
      {
        name: "AWS",
        role: "Cloud hosting (sub-processor)",
        location: "India + EU regions",
        dataShared: "All hosted data",
        hasDPA: true,
        transferSafeguard: "EU data in Frankfurt; India data in Mumbai (data residency control)",
      },
      {
        name: "Stripe",
        role: "Payments (EU users)",
        location: "US/EU",
        dataShared: "Payment data",
        hasDPA: true,
        transferSafeguard: "SCCs + EU-US Data Privacy Framework",
      },
      {
        name: "Razorpay",
        role: "Payments (India users)",
        location: "India",
        dataShared: "Payment data",
        hasDPA: true,
        transferSafeguard: null,
      },
      {
        name: "Twilio",
        role: "Video consultations & SMS/OTP",
        location: "US",
        dataShared: "Health-context (video), phone",
        hasDPA: true,
        transferSafeguard: "SCCs + EU-US Data Privacy Framework",
      },
      {
        name: "SendGrid",
        role: "Transactional + marketing email",
        location: "US",
        dataShared: "Name, email",
        hasDPA: true,
        transferSafeguard: "SCCs + EU-US Data Privacy Framework",
      },
      {
        name: "Zendesk",
        role: "Customer support tickets",
        location: "US/EU",
        dataShared: "Contact, issue data",
        hasDPA: true,
        transferSafeguard: "SCCs + EU-US Data Privacy Framework",
      },
      {
        name: "Mixpanel",
        role: "Product analytics",
        location: "US",
        dataShared: "Pseudonymized usage",
        hasDPA: true,
        transferSafeguard: "SCCs + EU-US Data Privacy Framework",
      },
      {
        name: "Greenhouse",
        role: "Recruitment ATS",
        location: "US",
        dataShared: "Applicant data",
        hasDPA: true,
        transferSafeguard: "SCCs + EU-US Data Privacy Framework",
      },
      {
        name: "Diagnostic-lab partner",
        role: "Lab-test fulfilment",
        location: "India",
        dataShared: "Patient + test data",
        hasDPA: true,
        transferSafeguard: null,
      },
    ].map((data) => prisma.vendor.create({ data }))
  );
  const ven = Object.fromEntries(vendors.map((v) => [v.name, v]));

  // -------------------------------------------------------------------------
  // §5 Business Processes + §9 Purposes & Legal Bases + §10 Cross-border
  // Each activity wires up its data subjects, categories, vendors and systems.
  // -------------------------------------------------------------------------
  const activities: {
    name: string;
    description: string;
    purpose: string;
    gdprLegalBasis: string;
    art9Condition?: string;
    dpdpBasis: string;
    riskLevel: RiskLevel;
    crossBorder: boolean;
    subjects: string[];
    cats: string[];
    vendors: string[];
    systems: string[];
  }[] = [
    {
      name: "Patient registration & onboarding",
      description: "Account creation, identity capture and KYC for new users.",
      purpose: "Establish a user account and verify identity",
      gdprLegalBasis: "Contract (Art. 6(1)(b))",
      dpdpBasis: "Consent",
      riskLevel: RiskLevel.MEDIUM,
      crossBorder: true,
      subjects: ["Patients / end users"],
      cats: ["Identity & contact data", "Account & device data", "Government identifiers"],
      vendors: ["AWS"],
      systems: ["App backend"],
    },
    {
      name: "Teleconsultation & clinical care",
      description:
        "The highest-risk process: video consultations, clinical notes and e-prescriptions. Special-category data + large scale + vulnerable subjects + new tech + cross-border = DPIA-triggering flagship.",
      purpose: "Provide teleconsultation and issue/fulfil prescriptions",
      gdprLegalBasis: "Contract (Art. 6(1)(b))",
      art9Condition: "Provision of healthcare (Art. 9(2)(h)) + explicit consent",
      dpdpBasis: "Consent",
      riskLevel: RiskLevel.HIGH,
      crossBorder: true,
      subjects: ["Patients / end users", "Doctors & wellness coaches"],
      cats: ["Identity & contact data", "Health data"],
      vendors: ["Twilio", "AWS", "Diagnostic-lab partner"],
      systems: ["EHR / clinical records system", "App backend"],
    },
    {
      name: "AI symptom checker",
      description: "Automated symptom assessment using health inputs from users.",
      purpose: "Provide AI-assisted symptom guidance",
      gdprLegalBasis: "Contract (Art. 6(1)(b))",
      art9Condition: "Provision of healthcare (Art. 9(2)(h)) + explicit consent",
      dpdpBasis: "Consent",
      riskLevel: RiskLevel.HIGH,
      crossBorder: true,
      subjects: ["Patients / end users"],
      cats: ["Health data", "Account & device data"],
      vendors: ["AWS"],
      systems: ["App backend", "Product analytics"],
    },
    {
      name: "Payments & billing",
      description: "Charging users and corporate clients for consultations and plans.",
      purpose: "Process payments",
      gdprLegalBasis: "Contract / Legal obligation",
      dpdpBasis: "Consent / legitimate use",
      riskLevel: RiskLevel.MEDIUM,
      crossBorder: true,
      subjects: ["Patients / end users", "Corporate client contacts"],
      cats: ["Payment data", "Identity & contact data"],
      vendors: ["Stripe", "Razorpay"],
      systems: ["Payment service"],
    },
    {
      name: "Corporate wellness program administration (B2B)",
      description: "Bulk enrolment of employees and aggregated, anonymized wellness reporting.",
      purpose: "Administer employer wellness plans",
      gdprLegalBasis: "Contract (with employer)",
      dpdpBasis: "Consent",
      riskLevel: RiskLevel.MEDIUM,
      crossBorder: true,
      subjects: ["Corporate client employees", "Corporate client contacts"],
      cats: ["Identity & contact data", "Account & device data"],
      vendors: ["AWS"],
      systems: ["CRM", "App backend"],
    },
    {
      name: "Marketing & communications",
      description: "Email campaigns and website lead capture via forms and cookies.",
      purpose: "Send marketing communications",
      gdprLegalBasis: "Consent (Art. 6(1)(a))",
      dpdpBasis: "Consent",
      riskLevel: RiskLevel.LOW,
      crossBorder: true,
      subjects: ["Website visitors / prospects", "Corporate client contacts"],
      cats: ["Identity & contact data", "Account & device data"],
      vendors: ["SendGrid"],
      systems: ["Marketing automation", "CRM"],
    },
    {
      name: "Customer support",
      description: "Handling user tickets via support chat and email.",
      purpose: "Provide customer support",
      gdprLegalBasis: "Legitimate interests (Art. 6(1)(f))",
      dpdpBasis: "Legitimate use",
      riskLevel: RiskLevel.MEDIUM,
      crossBorder: true,
      subjects: ["Patients / end users", "Corporate client contacts"],
      cats: ["Identity & contact data", "Health data"],
      vendors: ["Zendesk"],
      systems: ["Support desk"],
    },
    {
      name: "Product analytics & improvement",
      description: "Measuring usage with pseudonymized analytics to improve the product.",
      purpose: "Measure and improve the product",
      gdprLegalBasis: "Legitimate interests / Consent (cookies)",
      dpdpBasis: "Consent",
      riskLevel: RiskLevel.LOW,
      crossBorder: true,
      subjects: ["Patients / end users", "Website visitors / prospects"],
      cats: ["Account & device data"],
      vendors: ["Mixpanel"],
      systems: ["Product analytics", "Data warehouse"],
    },
    {
      name: "Recruitment & HR / employee management",
      description: "Hiring via the careers portal and managing employee records and payroll.",
      purpose: "Recruit and manage employees",
      gdprLegalBasis: "Legal obligation (Art. 6(1)(c)) + Contract",
      dpdpBasis: "Legal obligation",
      riskLevel: RiskLevel.MEDIUM,
      crossBorder: true,
      subjects: ["Job applicants", "VitaWell employees"],
      cats: ["Identity & contact data", "Government identifiers"],
      vendors: ["Greenhouse"],
      systems: ["Recruitment portal (ATS)", "HRIS / payroll"],
    },
  ];

  for (const a of activities) {
    await prisma.processingActivity.create({
      data: {
        name: a.name,
        description: a.description,
        purpose: a.purpose,
        gdprLegalBasis: a.gdprLegalBasis,
        art9Condition: a.art9Condition ?? null,
        dpdpBasis: a.dpdpBasis,
        riskLevel: a.riskLevel,
        crossBorder: a.crossBorder,
        dataSubjects: { connect: a.subjects.map((s) => ({ id: subj[s].id })) },
        dataCategories: { connect: a.cats.map((c) => ({ id: cat[c].id })) },
        vendors: { connect: a.vendors.map((v) => ({ id: ven[v].id })) },
        systems: { connect: a.systems.map((s) => ({ id: sys[s].id })) },
      },
    });
  }

  // -------------------------------------------------------------------------
  // §11 Retention Periods
  // -------------------------------------------------------------------------
  const retention: { dataType: string; period: string; driver: string; category?: string }[] = [
    {
      dataType: "Clinical / medical records",
      period: "3 years post last consultation (longer if local clinical-establishment rules require)",
      driver: "Medical-record law",
      category: "Health data",
    },
    {
      dataType: "Payment / invoice records",
      period: "8 years",
      driver: "Indian tax / Companies Act",
      category: "Payment data",
    },
    {
      dataType: "Marketing contact + consent",
      period: "Until consent withdrawn (proof retained)",
      driver: "Consent law",
      category: "Identity & contact data",
    },
    {
      dataType: "Support tickets",
      period: "24 months",
      driver: "Internal policy",
    },
    {
      dataType: "Inactive account data",
      period: "Deleted/anonymized after 24 months inactivity",
      driver: "Minimisation",
      category: "Account & device data",
    },
    {
      dataType: "Rejected job-applicant data",
      period: "6–12 months",
      driver: "Internal policy / consent",
    },
    {
      dataType: "Employee records",
      period: "Employment duration + statutory period",
      driver: "Labour law",
    },
  ];

  for (const r of retention) {
    await prisma.retentionSchedule.create({
      data: {
        dataType: r.dataType,
        period: r.period,
        driver: r.driver,
        dataCategoryId: r.category ? cat[r.category].id : null,
      },
    });
  }

  // -------------------------------------------------------------------------
  // Phase 2 — Sample DPIAs (based on the VitaWell case study)
  // -------------------------------------------------------------------------
  type DpiaSeed = {
    projectName: string;
    purpose: string;
    businessOwner: string;
    status: "DRAFT" | "IN_REVIEW" | "APPROVED" | "REJECTED";
    specialCategoryData: boolean;
    internationalTransfers: boolean;
    automatedDecisionMaking: boolean;
    largeScale: boolean;
    biometricData: boolean;
    subjects: string[];
    cats: string[];
    vendors: string[];
    /** mitigations keyed by RiskCategory to attach after risks are generated */
    mitigations?: { category: string; description: string; owner: string; status?: "OPEN" | "IN_PROGRESS" | "COMPLETED" }[];
  };

  const dpiaSeeds: DpiaSeed[] = [
    {
      projectName: "Teleconsultation & AI Clinical Triage Platform",
      purpose:
        "Deliver video doctor consultations with AI symptom triage and e-prescriptions for patients in India and the EU — VitaWell's highest-risk flagship process.",
      businessOwner: "Head of Clinical Operations",
      status: "IN_REVIEW",
      specialCategoryData: true,
      internationalTransfers: true,
      automatedDecisionMaking: true,
      largeScale: true,
      biometricData: false,
      subjects: ["Patients / end users", "Doctors & wellness coaches"],
      cats: ["Identity & contact data", "Health data"],
      vendors: ["Twilio", "AWS", "Diagnostic-lab partner"],
      mitigations: [
        {
          category: "HEALTH_DATA",
          description: "Encrypt clinical records at rest (AES-256) and restrict EHR access to the treating clinician via RBAC.",
          owner: "CISO",
          status: "IN_PROGRESS",
        },
        {
          category: "CROSS_BORDER",
          description: "Execute SCCs + EU-US DPF with Twilio and complete a transfer risk assessment (Schrems II).",
          owner: "DPO",
          status: "OPEN",
        },
        {
          category: "AUTOMATED_DECISION",
          description: "Add human-in-the-loop review so the AI symptom checker only assists — never finalises — a diagnosis.",
          owner: "Head of Product",
          status: "OPEN",
        },
        {
          category: "LARGE_SCALE",
          description: "Apply data minimisation and 3-year clinical retention with automated purge jobs.",
          owner: "Data Engineering Lead",
          status: "COMPLETED",
        },
      ],
    },
    {
      projectName: "Corporate Wellness Program (B2B)",
      purpose:
        "Administer employer-sponsored wellness plans, bulk-enrol employees, and provide aggregated, anonymized wellness reporting to corporate clients.",
      businessOwner: "VP of Corporate Partnerships",
      status: "APPROVED",
      specialCategoryData: true,
      internationalTransfers: true,
      automatedDecisionMaking: false,
      largeScale: false,
      biometricData: false,
      subjects: ["Corporate client employees", "Corporate client contacts"],
      cats: ["Identity & contact data", "Health data"],
      vendors: ["AWS"],
      mitigations: [
        {
          category: "HEALTH_DATA",
          description: "Ensure employers only ever receive aggregated, non-identifiable wellness metrics — never individual health data.",
          owner: "DPO",
          status: "COMPLETED",
        },
      ],
    },
    {
      projectName: "Marketing & Website Analytics",
      purpose:
        "Run email campaigns and measure website usage with pseudonymized analytics to acquire and engage prospects.",
      businessOwner: "Head of Growth",
      status: "DRAFT",
      specialCategoryData: false,
      internationalTransfers: true,
      automatedDecisionMaking: false,
      largeScale: false,
      biometricData: false,
      subjects: ["Website visitors / prospects", "Corporate client contacts"],
      cats: ["Identity & contact data", "Account & device data"],
      vendors: ["SendGrid", "Mixpanel"],
    },
  ];

  for (const d of dpiaSeeds) {
    const scoring = scoreDpia({
      specialCategoryData: d.specialCategoryData,
      biometricData: d.biometricData,
      internationalTransfers: d.internationalTransfers,
      automatedDecisionMaking: d.automatedDecisionMaking,
      largeScale: d.largeScale,
    });
    const risks = buildRisksFromScore(scoring);

    const dpia = await prisma.dPIA.create({
      data: {
        projectName: d.projectName,
        purpose: d.purpose,
        businessOwner: d.businessOwner,
        status: d.status,
        specialCategoryData: d.specialCategoryData,
        internationalTransfers: d.internationalTransfers,
        automatedDecisionMaking: d.automatedDecisionMaking,
        largeScale: d.largeScale,
        riskScore: scoring.score,
        riskLevel: scoring.level,
        dataSubjects: { connect: d.subjects.map((s) => ({ id: subj[s].id })) },
        dataCategories: { connect: d.cats.map((c) => ({ id: cat[c].id })) },
        vendors: { connect: d.vendors.map((v) => ({ id: ven[v].id })) },
        risks: { create: risks },
      },
      include: { risks: true },
    });

    // Attach sample mitigations to the matching generated risks.
    for (const m of d.mitigations ?? []) {
      const risk = dpia.risks.find((r) => r.category === m.category);
      if (risk) {
        await prisma.mitigationAction.create({
          data: {
            riskId: risk.id,
            description: m.description,
            owner: m.owner,
            status: m.status ?? "OPEN",
          },
        });
      }
    }
  }

  console.log(
    `Seeded: ${subjects.length} subjects, ${categories.length} categories, ${systems.length} systems, ${vendors.length} vendors, ${activities.length} activities, ${retention.length} retention rules, ${dpiaSeeds.length} DPIAs.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
