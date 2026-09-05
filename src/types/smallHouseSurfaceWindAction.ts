import type {
  GenesisVector3,
  GenesisVerificationState,
} from "./genesis";
import type { PrimarySupportLongitudinalAxis } from "./primarySupportMechanics";
import type {
  SmallHouseStructuralComponentInput,
  SmallHouseWindStage,
} from "./smallHouseWind";

export const SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION = "0.1.0" as const;

export type SmallHouseSurfaceNormalAxis = PrimarySupportLongitudinalAxis;

export interface SmallHouseSurfaceWindActionInput {
  schemaVersion: typeof SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION;
  surfaceComponentId: string;
  surfaceNormalAxis: SmallHouseSurfaceNormalAxis;
  airDensityKgPerM3: number;
  windSpeedMps: number;
  effectiveWindAreaM2: number;
  /**
   * Explicit signed coefficient for this deliberately narrow analytical action.
   * RPE does not derive this value from code zones, wind direction, or geometry.
   */
  signedPressureCoefficient: number;
  /**
   * Explicit global direction for positive scalar action. RPE normalizes it
   * deterministically but never derives it from rendered panel geometry here.
   */
  globalActionDirection: GenesisVector3;
  airDensitySourceNote: string;
  airDensityVerificationState: GenesisVerificationState;
  windSpeedSourceNote: string;
  windSpeedVerificationState: GenesisVerificationState;
  effectiveAreaSourceNote: string;
  effectiveAreaVerificationState: GenesisVerificationState;
  coefficientSourceNote: string;
  coefficientVerificationState: GenesisVerificationState;
  directionSourceNote: string;
  directionVerificationState: GenesisVerificationState;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export type SmallHouseSurfaceWindActionState =
  | "blocked_stage_before_walls"
  | "blocked_surface_not_active"
  | "blocked_not_wall_or_roof_panel"
  | "analytical_ready";

export interface SmallHouseSurfaceWindActionResult {
  schemaVersion: typeof SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION;
  evidenceLayer: "rpe_analytical";
  stage: SmallHouseWindStage;
  state: SmallHouseSurfaceWindActionState;
  canCalculate: boolean;
  structuralResult: "N/A";
  reason: string;
  surface: SmallHouseStructuralComponentInput | null;
  surfaceNormalAxis: SmallHouseSurfaceNormalAxis;
  /** Pure declared-box geometry only; never substituted for effective area. */
  geometricFaceAreaM2: number | null;
  effectiveWindAreaM2: number | null;
  airDensityKgPerM3: number | null;
  windSpeedMps: number | null;
  signedPressureCoefficient: number | null;
  dynamicPressurePa: number | null;
  signedSurfacePressurePa: number | null;
  scalarSurfaceForceN: number | null;
  normalizedGlobalActionDirection: GenesisVector3 | null;
  globalForceVectorN: GenesisVector3 | null;
  downstreamMechanics: {
    connectionDemandN: null;
    connectionCapacityAssessment: null;
    supportReactionsN: null;
    upliftReactionN: null;
    slidingReactionN: null;
    rackingIndicator: null;
    passFail: null;
  };
  provenance: {
    airDensitySourceNote: string;
    airDensityVerificationState: GenesisVerificationState;
    windSpeedSourceNote: string;
    windSpeedVerificationState: GenesisVerificationState;
    effectiveAreaSourceNote: string;
    effectiveAreaVerificationState: GenesisVerificationState;
    coefficientSourceNote: string;
    coefficientVerificationState: GenesisVerificationState;
    directionSourceNote: string;
    directionVerificationState: GenesisVerificationState;
    sourceNote: string;
    verificationState: GenesisVerificationState;
  };
}
