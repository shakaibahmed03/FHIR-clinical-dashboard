import { Condition, Observation, RiskFlag } from "../types/dashboard";

// --- Observation threshold rules (config array) ---

interface ObservationRule {
  code: string;
  label: string;
  check: (value: number) => RiskFlag | null;
}

const OBSERVATION_RULES: ObservationRule[] = [
  // Systolic Blood Pressure
  {
    code: "8480-6",
    label: "Systolic BP",
    check: (value) => {
      if (value > 140)
        return {
          type: "HIGH_BLOOD_PRESSURE",
          severity: "HIGH",
          message: `Systolic BP ${value} mmHg exceeds safe threshold (>140 mmHg)`,
        };
      if (value >= 120)
        return {
          type: "ELEVATED_BLOOD_PRESSURE",
          severity: "MEDIUM",
          message: `Systolic BP ${value} mmHg is elevated (120–140 mmHg)`,
        };
      return null;
    },
  },
  // Heart Rate
  {
    code: "8867-4",
    label: "Heart Rate",
    check: (value) => {
      if (value > 100)
        return {
          type: "HIGH_HEART_RATE",
          severity: "HIGH",
          message: `Heart rate ${value} bpm exceeds normal range (>100 bpm)`,
        };
      if (value < 60)
        return {
          type: "LOW_HEART_RATE",
          severity: "MEDIUM",
          message: `Heart rate ${value} bpm is below normal range (<60 bpm)`,
        };
      return null;
    },
  },
  // Oxygen Saturation
  {
    code: "2708-6",
    label: "O₂ Saturation",
    check: (value) => {
      if (value < 90)
        return {
          type: "CRITICAL_O2_SATURATION",
          severity: "HIGH",
          message: `O₂ saturation ${value}% is critically low (<90%)`,
        };
      if (value < 95)
        return {
          type: "LOW_O2_SATURATION",
          severity: "MEDIUM",
          message: `O₂ saturation ${value}% is below normal (<95%)`,
        };
      return null;
    },
  },
  // Body Temperature
  {
    code: "8310-5",
    label: "Body Temperature",
    check: (value) => {
      if (value > 38.5)
        return {
          type: "FEVER",
          severity: "MEDIUM",
          message: `Body temperature ${value}°C indicates fever (>38.5°C)`,
        };
      return null;
    },
  },
];

// --- Condition-based rules (active diagnosis flags) ---

interface ConditionRule {
  code: string;
  type: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  message: string;
}

const CONDITION_RULES: ConditionRule[] = [
  {
    code: "44054006",
    type: "DIABETES_TYPE_2",
    severity: "MEDIUM",
    message: "Active condition: Diabetes mellitus type 2",
  },
  {
    code: "73211009",
    type: "DIABETES",
    severity: "MEDIUM",
    message: "Active condition: Diabetes mellitus",
  },
  {
    code: "38341003",
    type: "HYPERTENSION",
    severity: "MEDIUM",
    message: "Active condition: Hypertension",
  },
  {
    code: "22298006",
    type: "MYOCARDIAL_INFARCTION",
    severity: "HIGH",
    message: "Active condition: Myocardial infarction (heart attack)",
  },
  {
    code: "13645005",
    type: "COPD",
    severity: "MEDIUM",
    message: "Active condition: Chronic obstructive pulmonary disease",
  },
];

// --- Evaluators ---

function checkObservations(observations: Observation[]): RiskFlag[] {
  const flags: RiskFlag[] = [];

  for (const obs of observations) {
    const rule = OBSERVATION_RULES.find((r) => r.code === obs.code);
    if (rule) {
      const flag = rule.check(obs.value);
      if (flag) flags.push(flag);
    }
  }

  return flags;
}

function checkConditions(conditions: Condition[]): RiskFlag[] {
  const flags: RiskFlag[] = [];

  for (const cond of conditions) {
    if (cond.status !== "active") continue;

    const rule = CONDITION_RULES.find((r) => r.code === cond.code);
    if (rule) {
      flags.push({
        type: rule.type,
        severity: rule.severity,
        message: rule.message,
      });
    }
  }

  return flags;
}

// --- Main export ---

export function evaluateRisk(
  conditions: Condition[],
  observations: Observation[]
): RiskFlag[] {
  return [...checkObservations(observations), ...checkConditions(conditions)];
}
