import { RiskCategory, RiskLevel } from "@prisma/client";

/**
 * DPIA risk-scoring engine.
 *
 * Each screening factor contributes a weight to the overall DPIA score.
 * The total is capped at 100 and mapped to a risk level:
 *   0–30   → LOW
 *   31–60  → MEDIUM
 *   61–100 → HIGH
 *
 * The same weights are reused to seed the Risk Register: every triggered
 * factor becomes a Risk whose likelihood × impact equals its weight.
 */

export type ScoringInput = {
  specialCategoryData: boolean; // health / Art. 9 data
  biometricData: boolean; // biometric / genetic data
  internationalTransfers: boolean; // cross-border transfer
  automatedDecisionMaking: boolean;
  largeScale: boolean;
};

export type FactorDef = {
  key: RiskCategory;
  label: string;
  weight: number;
  /** plain-English risk statement used when generating the Risk Register */
  riskTitle: string;
  riskDescription: string;
  likelihood: number; // 1–5
  impact: number; // 1–5
};

export const RISK_FACTORS: Record<
  "specialCategoryData" | "biometricData" | "internationalTransfers" | "automatedDecisionMaking" | "largeScale",
  FactorDef
> = {
  specialCategoryData: {
    key: RiskCategory.HEALTH_DATA,
    label: "Health / special-category data",
    weight: 20,
    riskTitle: "Processing of special-category health data",
    riskDescription:
      "The project processes GDPR Art. 9 health data (symptoms, diagnoses, prescriptions, mental-health notes). Unauthorised disclosure could cause serious harm to data subjects.",
    likelihood: 4,
    impact: 5,
  },
  biometricData: {
    key: RiskCategory.BIOMETRIC_DATA,
    label: "Biometric data",
    weight: 25,
    riskTitle: "Processing of biometric / genetic data",
    riskDescription:
      "The project processes biometric or genetic identifiers, which are irreversible if breached and attract the highest sensitivity under GDPR Art. 9 and India's DPDP Act.",
    likelihood: 5,
    impact: 5,
  },
  internationalTransfers: {
    key: RiskCategory.CROSS_BORDER,
    label: "Cross-border transfer",
    weight: 15,
    riskTitle: "International / cross-border data transfer",
    riskDescription:
      "Personal data is transferred outside its country of origin (e.g. EU↔India, or to US-based processors), requiring GDPR Chapter V safeguards such as SCCs and a transfer risk assessment.",
    likelihood: 3,
    impact: 5,
  },
  automatedDecisionMaking: {
    key: RiskCategory.AUTOMATED_DECISION,
    label: "Automated decision-making",
    weight: 20,
    riskTitle: "Automated decision-making / profiling",
    riskDescription:
      "The project makes automated decisions or profiles individuals (GDPR Art. 22). Incorrect or opaque decisions could materially affect data subjects, especially in a health context.",
    likelihood: 4,
    impact: 5,
  },
  largeScale: {
    key: RiskCategory.LARGE_SCALE,
    label: "Large-scale processing",
    weight: 20,
    riskTitle: "Large-scale processing of personal data",
    riskDescription:
      "The project processes personal data at large scale (high volume of data subjects / records), amplifying the impact of any breach or misuse.",
    likelihood: 4,
    impact: 5,
  },
};

export const SCORE_THRESHOLDS = { lowMax: 30, mediumMax: 60 } as const;
export const MAX_SCORE = 100;

export function levelForScore(score: number): RiskLevel {
  if (score <= SCORE_THRESHOLDS.lowMax) return RiskLevel.LOW;
  if (score <= SCORE_THRESHOLDS.mediumMax) return RiskLevel.MEDIUM;
  return RiskLevel.HIGH;
}

/** Map a 1–25 register score to a risk level. */
export function levelForRiskScore(score: number): RiskLevel {
  if (score <= 8) return RiskLevel.LOW;
  if (score <= 15) return RiskLevel.MEDIUM;
  return RiskLevel.HIGH;
}

export type TriggeredFactor = FactorDef & { inputKey: keyof ScoringInput };

export type ScoreResult = {
  score: number;
  level: RiskLevel;
  triggered: TriggeredFactor[];
};

/** Evaluate the screening factors and return the overall DPIA score + triggered factors. */
export function scoreDpia(input: ScoringInput): ScoreResult {
  const triggered: TriggeredFactor[] = [];
  let raw = 0;

  (Object.keys(RISK_FACTORS) as (keyof typeof RISK_FACTORS)[]).forEach((k) => {
    if (input[k]) {
      raw += RISK_FACTORS[k].weight;
      triggered.push({ ...RISK_FACTORS[k], inputKey: k });
    }
  });

  const score = Math.min(raw, MAX_SCORE);
  return { score, level: levelForScore(score), triggered };
}

/** Build Risk Register rows (without persistence) from a scoring result. */
export function buildRisksFromScore(result: ScoreResult) {
  return result.triggered.map((f) => {
    const score = f.likelihood * f.impact;
    return {
      title: f.riskTitle,
      description: f.riskDescription,
      category: f.key,
      likelihood: f.likelihood,
      impact: f.impact,
      score,
      level: levelForRiskScore(score),
    };
  });
}
