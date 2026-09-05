import type { GenesisVerificationState } from "./genesis";
import type {
  SmallHouseConnectionInput,
  SmallHouseStructuralComponentInput,
  SmallHouseWindStage,
} from "./smallHouseWind";

export const STORM_PROTECTION_TOPOLOGY_READINESS_SCHEMA_VERSION = "0.1.0" as const;

export interface StormProtectionTopologyReadinessInput {
  schemaVersion: typeof STORM_PROTECTION_TOPOLOGY_READINESS_SCHEMA_VERSION;
  restraintMemberId: string;
  /** Explicit connection IDs selected as the two restraint ends. No geometry inference is permitted. */
  endConnectionIds: readonly [string | null, string | null];
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export type StormProtectionTopologyReadinessState =
  | "blocked_stage_before_storm_protection"
  | "blocked_restraint_not_active"
  | "blocked_component_not_storm_protection_member"
  | "restraint_path_incomplete"
  | "blocked_connection_not_active"
  | "blocked_connection_not_incident_to_restraint"
  | "blocked_duplicate_connection"
  | "blocked_other_endpoint_not_active"
  | "blocked_same_other_endpoint_component"
  | "review_ready_topology";

export interface StormProtectionTopologyReadinessResult {
  schemaVersion: typeof STORM_PROTECTION_TOPOLOGY_READINESS_SCHEMA_VERSION;
  evidenceLayer: "rpe_input_review";
  stage: SmallHouseWindStage;
  state: StormProtectionTopologyReadinessState;
  canReviewTopology: boolean;
  stormProtectionMechanicsAvailable: false;
  structuralResult: "N/A";
  reason: string;
  restraintMember: SmallHouseStructuralComponentInput | null;
  /** Explicit active topology records incident to the selected restraint member. */
  incidentConnections: SmallHouseConnectionInput[];
  /** Caller-selected end records; absent ends remain null. */
  selectedEndConnections: readonly [
    SmallHouseConnectionInput | null,
    SmallHouseConnectionInput | null,
  ];
  /** Components at the opposite side of each selected connection. */
  otherEndpointComponents: readonly [
    SmallHouseStructuralComponentInput | null,
    SmallHouseStructuralComponentInput | null,
  ];
  topology: {
    explicitSelectedEndCount: number;
    distinctSelectedConnections: boolean;
    distinctOtherEndpointComponents: boolean;
    physicalAttachmentPointsKnown: false;
    inferredAttachmentPoints: readonly [null, null];
  };
  mechanics: {
    tensionN: null;
    preloadN: null;
    axialStiffnessNPerM: null;
    slackM: null;
    elongationM: null;
    windUpliftDemandN: null;
    restraintForceN: null;
    loadSharing: null;
    memberCapacityN: null;
    connectionCapacityN: null;
    utilization: null;
    passFail: null;
    wholeHouseImprovement: null;
  };
  provenance: {
    sourceNote: string;
    verificationState: GenesisVerificationState;
  };
}
