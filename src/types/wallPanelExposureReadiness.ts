import type { GenesisVerificationState } from "./genesis";
import type { PrimarySupportLongitudinalAxis } from "./primarySupportMechanics";
import type {
  SmallHouseStructuralComponentInput,
  SmallHouseWindStage,
} from "./smallHouseWind";

export const WALL_PANEL_EXPOSURE_READINESS_SCHEMA_VERSION = "0.1.0" as const;

export type WallPanelNormalAxis = PrimarySupportLongitudinalAxis;
export type WallPanelExposedFace = "positive_normal" | "negative_normal";
export type WallPanelExposureClass = "exterior" | "interior";

export interface WallPanelExposureReadinessInput {
  schemaVersion: typeof WALL_PANEL_EXPOSURE_READINESS_SCHEMA_VERSION;
  wallComponentId: string;
  panelNormalAxis: WallPanelNormalAxis;
  exposedFace: WallPanelExposedFace;
  exposureClass: WallPanelExposureClass;
  normalAxisSourceNote: string;
  normalAxisVerificationState: GenesisVerificationState;
  exposureSourceNote: string;
  exposureVerificationState: GenesisVerificationState;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export type WallPanelExposureReadinessState =
  | "blocked_stage_before_walls"
  | "blocked_wall_not_active"
  | "blocked_not_wall_panel"
  | "review_ready";

export interface WallPanelExposureReadinessResult {
  schemaVersion: typeof WALL_PANEL_EXPOSURE_READINESS_SCHEMA_VERSION;
  evidenceLayer: "rpe_input_review";
  stage: SmallHouseWindStage;
  state: WallPanelExposureReadinessState;
  canReview: boolean;
  windActionCalculationAvailable: false;
  structuralResult: "N/A";
  reason: string;
  wall: SmallHouseStructuralComponentInput | null;
  panelNormalAxis: WallPanelNormalAxis;
  exposedFace: WallPanelExposedFace;
  exposureClass: WallPanelExposureClass;
  /** Pure box-face geometry only; never an effective/tributary wind area. */
  geometricFaceAreaM2: number | null;
  effectiveWindAreaM2: null;
  aerodynamicInputs: {
    windVelocityMps: null;
    airDensityKgM3: null;
    externalPressureCoefficient: null;
    internalPressureCoefficient: null;
    netPressurePa: null;
  };
  mechanicalProperties: {
    elasticModulusPa: null;
    panelStiffness: null;
    strengthData: null;
    fastenerCapacity: null;
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
