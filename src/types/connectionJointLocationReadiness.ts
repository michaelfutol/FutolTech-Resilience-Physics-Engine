import type { GenesisVector3, GenesisVerificationState } from "./genesis";
import type {
  SmallHouseConnectionInput,
  SmallHouseStructuralComponentInput,
  SmallHouseWindStage,
} from "./smallHouseWind";

export const CONNECTION_JOINT_LOCATION_READINESS_SCHEMA_VERSION = "0.1.0" as const;

export interface ConnectionJointLocationReadinessInput {
  schemaVersion: typeof CONNECTION_JOINT_LOCATION_READINESS_SCHEMA_VERSION;
  connectionId: string;
  /**
   * Explicit caller-declared global joint point in metres.
   * null means the physical joint location is still unknown.
   */
  jointPointM: GenesisVector3 | null;
  jointPointSourceNote: string | null;
  jointPointVerificationState: GenesisVerificationState | null;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export type ConnectionJointLocationReadinessState =
  | "blocked_stage_before_connections"
  | "blocked_connection_not_active"
  | "blocked_endpoint_not_active"
  | "location_unknown"
  | "review_ready";

export interface ConnectionJointLocationReadinessResult {
  schemaVersion: typeof CONNECTION_JOINT_LOCATION_READINESS_SCHEMA_VERSION;
  evidenceLayer: "rpe_input_review";
  stage: SmallHouseWindStage;
  state: ConnectionJointLocationReadinessState;
  canReviewLocation: boolean;
  connectionMechanicsAvailable: false;
  structuralResult: "N/A";
  reason: string;
  connection: SmallHouseConnectionInput | null;
  fromComponent: SmallHouseStructuralComponentInput | null;
  toComponent: SmallHouseStructuralComponentInput | null;
  jointPointM: GenesisVector3 | null;
  /** Permanently null in schema v0.1.0: no midpoint/intersection inference is allowed. */
  inferredJointPointM: null;
  coordinateBasis: "caller_declared_global_point" | "unknown";
  connectorGeometry: {
    path: null;
    axis: null;
    shape: null;
    bearingAreaM2: null;
  };
  mechanics: {
    stiffness: null;
    slip: null;
    fastenerType: null;
    fastenerCount: null;
    weldSize: null;
    weldLengthM: null;
    demandN: null;
    capacityAssessmentN: null;
    utilization: null;
    passFail: null;
    loadTransferModel: null;
  };
  provenance: {
    jointPointSourceNote: string | null;
    jointPointVerificationState: GenesisVerificationState | null;
    sourceNote: string;
    verificationState: GenesisVerificationState;
  };
}
