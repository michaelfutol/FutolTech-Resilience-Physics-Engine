import type { GenesisVerificationState } from "./genesis";
import type {
  SmallHouseConnectionInput,
  SmallHouseStructuralComponentInput,
  SmallHouseWindStage,
} from "./smallHouseWind";

export const BRACING_TOPOLOGY_READINESS_SCHEMA_VERSION = "0.1.0" as const;

export interface BracingTopologyReadinessInput {
  schemaVersion: typeof BRACING_TOPOLOGY_READINESS_SCHEMA_VERSION;
  braceId: string;
  /** Explicit connection IDs selected as the two brace ends. No geometry inference is permitted. */
  endConnectionIds: readonly [string | null, string | null];
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export type BracingTopologyReadinessState =
  | "blocked_stage_before_bracing"
  | "blocked_brace_not_active"
  | "blocked_component_not_brace"
  | "load_path_incomplete"
  | "blocked_connection_not_active"
  | "blocked_connection_not_incident_to_brace"
  | "blocked_duplicate_connection"
  | "blocked_other_endpoint_not_active"
  | "review_ready_topology";

export interface BracingTopologyReadinessResult {
  schemaVersion: typeof BRACING_TOPOLOGY_READINESS_SCHEMA_VERSION;
  evidenceLayer: "rpe_input_review";
  stage: SmallHouseWindStage;
  state: BracingTopologyReadinessState;
  canReviewTopology: boolean;
  bracingMechanicsAvailable: false;
  structuralResult: "N/A";
  reason: string;
  brace: SmallHouseStructuralComponentInput | null;
  /** Explicit active topology records incident to the selected brace. */
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
    physicalJointLocationsKnown: false;
    inferredJointLocations: readonly [null, null];
  };
  mechanics: {
    axialForceN: null;
    tensionCompressionState: null;
    axialStiffnessNPerM: null;
    effectiveLengthM: null;
    slendernessRatio: null;
    bucklingModel: null;
    rackingContribution: null;
    demandN: null;
    capacityN: null;
    utilization: null;
    passFail: null;
    loadPathAdequacy: null;
  };
  provenance: {
    sourceNote: string;
    verificationState: GenesisVerificationState;
  };
}
