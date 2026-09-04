import type { GenesisVector3, GenesisVerificationState } from "./genesis";
import { GENESIS_SCHEMA_VERSION } from "./genesis";

export type GenesisCollisionTargetShape = "box";

export interface GenesisCollisionTargetInput {
  schemaVersion: typeof GENESIS_SCHEMA_VERSION;
  id: string;
  shape: GenesisCollisionTargetShape;
  centerM: GenesisVector3;
  sizeM: GenesisVector3;
  sourceNote: string;
  verificationState: GenesisVerificationState;
}

export interface GenesisCollisionTargetContract {
  schemaVersion: typeof GENESIS_SCHEMA_VERSION;
  evidenceLayer: "rpe_simulation";
  objectId: string;
  shape: GenesisCollisionTargetShape;
  centerM: GenesisVector3;
  sizeM: GenesisVector3;
  provenance: {
    sourceNote: string;
    verificationState: GenesisVerificationState;
  };
}
