import { GENESIS_SCHEMA_VERSION } from "../../types/genesis";
import type {
  GenesisCollisionTargetContract,
  GenesisCollisionTargetInput,
} from "../../types/genesisCollisionTarget";

export const GENESIS_COLLISION_TARGET_USER_DATA_ROLE = "genesis_collision_target" as const;

export interface GenesisCollisionTargetUserData {
  rpeRole: typeof GENESIS_COLLISION_TARGET_USER_DATA_ROLE;
  rpeObjectId: string;
}

function assertFiniteVector(
  label: string,
  vector: { x: number; y: number; z: number },
): void {
  for (const [axis, value] of Object.entries(vector)) {
    if (!Number.isFinite(value)) {
      throw new Error(`${label}.${axis} must be finite`);
    }
  }
}

export function validateGenesisCollisionTargetInput(
  input: GenesisCollisionTargetInput,
): GenesisCollisionTargetContract {
  if (input.schemaVersion !== GENESIS_SCHEMA_VERSION) {
    throw new Error(`Unsupported Genesis collision-target schema version: ${input.schemaVersion}`);
  }
  if (input.id.trim() === "") {
    throw new Error("Collision target id must be non-empty");
  }
  if (input.sourceNote.trim() === "") {
    throw new Error("Collision target sourceNote must be non-empty");
  }
  if (!(["verified", "provisional", "unverified"] as const).includes(input.verificationState)) {
    throw new Error("Collision target verificationState is invalid");
  }
  if (input.shape !== "box") {
    throw new Error(`Unsupported collision target shape: ${String(input.shape)}`);
  }

  assertFiniteVector("centerM", input.centerM);
  assertFiniteVector("sizeM", input.sizeM);

  for (const [axis, value] of Object.entries(input.sizeM)) {
    if (value <= 0) {
      throw new Error(`sizeM.${axis} must be greater than zero`);
    }
  }

  return {
    schemaVersion: GENESIS_SCHEMA_VERSION,
    evidenceLayer: "rpe_simulation",
    objectId: input.id.trim(),
    shape: "box",
    centerM: { ...input.centerM },
    sizeM: { ...input.sizeM },
    provenance: {
      sourceNote: input.sourceNote.trim(),
      verificationState: input.verificationState,
    },
  };
}

export function createGenesisCollisionTargetUserData(
  target: GenesisCollisionTargetContract,
): GenesisCollisionTargetUserData {
  return {
    rpeRole: GENESIS_COLLISION_TARGET_USER_DATA_ROLE,
    rpeObjectId: target.objectId,
  };
}

export function resolveGenesisCollisionTargetObjectId(
  userData: unknown,
  expectedTarget: GenesisCollisionTargetContract | null,
): string | null {
  if (!expectedTarget || typeof userData !== "object" || userData === null) {
    return null;
  }

  const candidate = userData as Partial<GenesisCollisionTargetUserData>;
  if (
    candidate.rpeRole !== GENESIS_COLLISION_TARGET_USER_DATA_ROLE ||
    candidate.rpeObjectId !== expectedTarget.objectId
  ) {
    return null;
  }

  return expectedTarget.objectId;
}
