export const GENESIS_SCHEMA_VERSION = "0.1.0" as const;

export type GenesisEvidenceLayer =
  | "manual_code"
  | "solver"
  | "rpe_analytical"
  | "rpe_simulation"
  | "physical_test";

export type GenesisVerificationState = "verified" | "provisional" | "unverified";

export interface GenesisWindInput {
  schemaVersion: typeof GENESIS_SCHEMA_VERSION;
  speedKph: number;
  airDensityKgPerM3: number;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export interface GenesisPanelInput {
  id: string;
  exposedAreaM2: number;
  pressureCoefficient: number;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export interface GenesisConnectionInput {
  id: string;
  capacityN: number | null;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export interface GenesisAnalyticalWindResult {
  schemaVersion: typeof GENESIS_SCHEMA_VERSION;
  evidenceLayer: "rpe_analytical";
  speedMps: number;
  dynamicPressurePa: number;
  panelForceN: number;
  assumptions: {
    airDensityKgPerM3: number;
    exposedAreaM2: number;
    pressureCoefficient: number;
  };
}

export interface GenesisNullHouseResult {
  schemaVersion: typeof GENESIS_SCHEMA_VERSION;
  evidenceLayer: "rpe_simulation";
  structuralResult: "N/A";
  reason: "no_physical_specimen";
}

export interface GenesisConnectionAssessment {
  demandN: number;
  capacityN: number | null;
  state: "unverified" | "within_capacity" | "exceeded";
}
