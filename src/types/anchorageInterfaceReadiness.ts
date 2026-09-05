import type { GenesisVerificationState } from "./genesis";
import type {
  SmallHouseConnectionInput,
  SmallHouseStructuralComponentInput,
  SmallHouseWindStage,
} from "./smallHouseWind";

export const ANCHORAGE_INTERFACE_READINESS_SCHEMA_VERSION = "0.1.0" as const;

export interface AnchorageInterfaceReadinessInput {
  schemaVersion: typeof ANCHORAGE_INTERFACE_READINESS_SCHEMA_VERSION;
  anchorId: string;
  /** Explicit active topology record connecting the anchor marker to its intended support. */
  attachmentConnectionId: string | null;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export type AnchorageInterfaceReadinessState =
  | "blocked_stage_before_anchorage"
  | "blocked_anchor_not_active"
  | "blocked_component_not_anchor"
  | "interface_incomplete"
  | "blocked_connection_not_active"
  | "blocked_connection_not_incident_to_anchor"
  | "blocked_other_endpoint_not_support"
  | "review_ready_interface";

export interface AnchorageInterfaceReadinessResult {
  schemaVersion: typeof ANCHORAGE_INTERFACE_READINESS_SCHEMA_VERSION;
  evidenceLayer: "rpe_input_review";
  stage: SmallHouseWindStage;
  state: AnchorageInterfaceReadinessState;
  canReviewInterface: boolean;
  anchorageMechanicsAvailable: false;
  structuralResult: "N/A";
  reason: string;
  anchor: SmallHouseStructuralComponentInput | null;
  attachmentConnection: SmallHouseConnectionInput | null;
  support: SmallHouseStructuralComponentInput | null;
  topology: {
    explicitAttachmentConnection: boolean;
    physicalAttachmentPointKnown: false;
    inferredAttachmentPointM: null;
  };
  declaredUnknowns: {
    materialId: string | null;
    massKg: number | null;
    topologyCapacityN: number | null;
  };
  mechanics: {
    boltOrRodType: null;
    boltDiameterM: null;
    embedmentLengthM: null;
    basePlateGeometry: null;
    weldOrFastenerDetails: null;
    pedestalGeometry: null;
    footingGeometry: null;
    concreteStrengthPa: null;
    soilModel: null;
    soilBearingPa: null;
    interfaceFrictionCoefficient: null;
    pulloutModel: null;
    breakoutModel: null;
    upliftReactionN: null;
    shearReactionN: null;
    slidingResistanceN: null;
    overturningResistanceNm: null;
    demandN: null;
    capacityN: null;
    utilization: null;
    passFail: null;
  };
  provenance: {
    sourceNote: string;
    verificationState: GenesisVerificationState;
  };
}
