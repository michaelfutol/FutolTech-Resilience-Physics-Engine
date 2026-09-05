import type { GenesisVerificationState } from "./genesis";
import type { PrimarySupportLongitudinalAxis } from "./primarySupportMechanics";
import type {
  SmallHouseStructuralComponentInput,
  SmallHouseWindStage,
} from "./smallHouseWind";

export const ROOF_PANEL_EXPOSURE_READINESS_SCHEMA_VERSION = "0.1.0" as const;

export type RoofPanelNormalAxis = PrimarySupportLongitudinalAxis;
export type RoofPanelExposedFace = "positive_normal" | "negative_normal";
export type RoofPanelExposureClass = "exterior" | "interior";

export interface RoofPanelExposureReadinessInput {
  schemaVersion: typeof ROOF_PANEL_EXPOSURE_READINESS_SCHEMA_VERSION;
  roofComponentId: string;
  panelNormalAxis: RoofPanelNormalAxis;
  exposedFace: RoofPanelExposedFace;
  exposureClass: RoofPanelExposureClass;
  normalAxisSourceNote: string;
  normalAxisVerificationState: GenesisVerificationState;
  exposureSourceNote: string;
  exposureVerificationState: GenesisVerificationState;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export type RoofPanelExposureReadinessState =
  | "blocked_stage_before_roof"
  | "blocked_roof_not_active"
  | "blocked_not_roof_panel"
  | "review_ready";

export interface RoofPanelExposureReadinessResult {
  schemaVersion: typeof ROOF_PANEL_EXPOSURE_READINESS_SCHEMA_VERSION;
  evidenceLayer: "rpe_input_review";
  stage: SmallHouseWindStage;
  state: RoofPanelExposureReadinessState;
  canReview: boolean;
  upliftCalculationAvailable: false;
  structuralResult: "N/A";
  reason: string;
  roof: SmallHouseStructuralComponentInput | null;
  panelNormalAxis: RoofPanelNormalAxis;
  exposedFace: RoofPanelExposedFace;
  exposureClass: RoofPanelExposureClass;
  geometricFaceAreaM2: number | null;
  effectiveWindAreaM2: null;
  roofZone: null;
  aerodynamicInputs: {
    windVelocityMps: null;
    airDensityKgM3: null;
    externalPressureCoefficient: null;
    internalPressureCoefficient: null;
    netPressurePa: null;
    upliftForceN: null;
  };
  mechanicalProperties: {
    panelStiffness: null;
    strengthData: null;
    connectionDemandN: null;
    connectionCapacityN: null;
  };
  provenance: {
    normalAxisSourceNote: string;
    normalAxisVerificationState: GenesisVerificationState;
    exposureSourceNote: string;
    exposureVerificationState: GenesisVerificationState;
    sourceNote: string;
    verificationState: GenesisVerificationState;
  };
}
