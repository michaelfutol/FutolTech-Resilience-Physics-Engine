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

export interface GenesisRectangularPanelInput {
  id: string;
  widthM: number;
  heightM: number;
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

export type GenesisPanelExperimentState =
  | "unverified_connection"
  | "within_capacity"
  | "threshold_exceeded";

export interface GenesisPanelExperimentResult {
  schemaVersion: typeof GENESIS_SCHEMA_VERSION;
  evidenceLayer: "rpe_analytical";
  panel: {
    id: string;
    widthM: number;
    heightM: number;
    exposedAreaM2: number;
    pressureCoefficient: number;
  };
  wind: GenesisAnalyticalWindResult;
  connection: GenesisConnectionAssessment;
  experimentState: GenesisPanelExperimentState;
  provenance: {
    windSourceNote: string;
    panelSourceNote: string;
    connectionSourceNote: string;
    windVerificationState: GenesisVerificationState;
    panelVerificationState: GenesisVerificationState;
    connectionVerificationState: GenesisVerificationState;
  };
}

export type GenesisEvidenceEventType =
  | "wind_input"
  | "dynamic_pressure"
  | "panel_force"
  | "connection_assessment"
  | "release_gate";

export type GenesisEvidenceEventStatus =
  | "recorded"
  | "unverified"
  | "within_capacity"
  | "threshold_exceeded"
  | "not_triggered"
  | "blocked";

export interface GenesisEvidenceEvent {
  sequence: number;
  eventType: GenesisEvidenceEventType;
  evidenceLayer: "rpe_analytical";
  status: GenesisEvidenceEventStatus;
  message: string;
  values: Record<string, number | string | null>;
  sourceNotes: string[];
}
