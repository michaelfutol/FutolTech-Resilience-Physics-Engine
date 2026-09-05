import type { GenesisVerificationState } from "./genesis";
import type {
  SmallHouseStructuralComponentInput,
  SmallHouseWindStage,
} from "./smallHouseWind";
import type { PrimarySupportLongitudinalAxis } from "./primarySupportMechanics";

export const FLOOR_RING_FRAME_READINESS_SCHEMA_VERSION = "0.1.0" as const;

export interface FloorRingFrameEndpointRoleInput {
  roleLabel: string;
  /**
   * Deliberately unavailable in schema v0.1.0. Physical joint coordinates
   * belong to a later connection-location contract and must not be inferred
   * from member centers or rendered box intersections.
   */
  jointCoordinateM: null;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export interface FloorRingFrameMemberReadinessInput {
  schemaVersion: typeof FLOOR_RING_FRAME_READINESS_SCHEMA_VERSION;
  memberComponentId: string;
  longitudinalAxis: PrimarySupportLongitudinalAxis;
  endA: FloorRingFrameEndpointRoleInput;
  endB: FloorRingFrameEndpointRoleInput;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export type FloorRingFrameMemberReadinessState =
  | "blocked_stage_before_floor_ring_frame"
  | "blocked_member_not_active"
  | "blocked_not_floor_ring_frame_member"
  | "review_ready";

export interface FloorRingFrameMemberReadinessResult {
  schemaVersion: typeof FLOOR_RING_FRAME_READINESS_SCHEMA_VERSION;
  evidenceLayer: "rpe_input_review";
  stage: SmallHouseWindStage;
  state: FloorRingFrameMemberReadinessState;
  canReview: boolean;
  globalFrameCalculationAvailable: false;
  structuralResult: "N/A";
  reason: string;
  member: SmallHouseStructuralComponentInput | null;
  longitudinalAxis: PrimarySupportLongitudinalAxis;
  endA: FloorRingFrameEndpointRoleInput;
  endB: FloorRingFrameEndpointRoleInput;
  jointCoordinates: {
    endA: null;
    endB: null;
  };
  mechanicalProperties: {
    elasticModulusPa: null;
    sectionAreaM2: null;
    principalSecondMoment1M4: null;
    principalSecondMoment2M4: null;
    strengthData: null;
  };
  loadTransferModel: null;
  provenance: {
    sourceNote: string;
    verificationState: GenesisVerificationState;
  };
}
