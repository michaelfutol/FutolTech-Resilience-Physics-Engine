import type { GenesisVerificationState } from "./genesis";
import type {
  SmallHouseConnectionInput,
  SmallHouseWindSpecimenInput,
} from "./smallHouseWind";

export const SMALL_HOUSE_CONTROLLED_AB_SCHEMA_VERSION = "0.1.0" as const;

export type SmallHouseControlledABState =
  | "controlled_input_difference"
  | "blocked_declared_change_not_satisfied"
  | "blocked_unrelated_input_difference";

export interface SmallHouseControlledABCaseInput {
  label: string;
  specimen: SmallHouseWindSpecimenInput;
}

export interface SmallHouseControlledABDeclaredChange {
  kind: "connection_record_added";
  connectionId: string;
}

export interface SmallHouseControlledABComparisonInput {
  schemaVersion: typeof SMALL_HOUSE_CONTROLLED_AB_SCHEMA_VERSION;
  caseA: SmallHouseControlledABCaseInput;
  caseB: SmallHouseControlledABCaseInput;
  declaredChange: SmallHouseControlledABDeclaredChange;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export interface SmallHouseControlledABInvariants {
  specimenMetadataUnchanged: boolean;
  envelopeUnchanged: boolean;
  componentRecordsUnchanged: boolean;
  componentGeometryUnchanged: boolean;
  existingConnectionRecordsUnchanged: boolean;
  onlyDeclaredConnectionAdded: boolean;
}

export interface SmallHouseControlledABComparisonResult {
  schemaVersion: typeof SMALL_HOUSE_CONTROLLED_AB_SCHEMA_VERSION;
  evidenceLayer: "rpe_input_review";
  state: SmallHouseControlledABState;
  canCompareControlledInputs: boolean;
  mechanicsAvailable: false;
  performanceComparisonAvailable: false;
  structuralResult: "N/A";
  caseA: {
    label: string;
    specimenId: string;
  };
  caseB: {
    label: string;
    specimenId: string;
  };
  declaredChange: SmallHouseControlledABDeclaredChange;
  observedDifference: {
    kind: "connection_record_added";
    connection: SmallHouseConnectionInput | null;
  };
  invariants: SmallHouseControlledABInvariants;
  performanceConclusion: null;
  sourceNote: string;
  verificationState: GenesisVerificationState;
  reason: string;
}
