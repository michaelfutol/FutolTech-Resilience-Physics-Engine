import {
  GENESIS_SCHEMA_VERSION,
  type GenesisDebrisDynamicsGateResult,
  type GenesisDebrisDynamicsInput,
  type GenesisRigidBodyGateResult,
  type GenesisVector3,
} from "../../types/genesis";

function validateVector(name: string, vector: GenesisVector3 | null): GenesisVector3 | null {
  if (vector === null) return null;

  for (const [axis, value] of Object.entries(vector)) {
    if (!Number.isFinite(value)) {
      throw new Error(`${name}.${axis} must be a finite number when supplied`);
    }
  }

  return vector;
}

export function assessGenesisDebrisDynamicsGate(
  releaseGate: GenesisRigidBodyGateResult,
  dynamics: GenesisDebrisDynamicsInput,
): GenesisDebrisDynamicsGateResult {
  const gravityMps2 = validateVector("gravityMps2", dynamics.gravityMps2);
  const initialLinearVelocityMps = validateVector(
    "initialLinearVelocityMps",
    dynamics.initialLinearVelocityMps,
  );
  const initialAngularVelocityRadPerSec = validateVector(
    "initialAngularVelocityRadPerSec",
    dynamics.initialAngularVelocityRadPerSec,
  );

  const base = {
    schemaVersion: GENESIS_SCHEMA_VERSION,
    evidenceLayer: "rpe_simulation" as const,
    gravityMps2,
    initialLinearVelocityMps,
    initialAngularVelocityRadPerSec,
    provenance: {
      dynamicsSourceNote: dynamics.sourceNote,
      dynamicsVerificationState: dynamics.verificationState,
    },
  };

  if (!releaseGate.canRelease || releaseGate.state !== "release_ready") {
    return {
      ...base,
      state: "blocked_release_not_ready",
      canSimulate: false,
      reason:
        "Rigid-body release is not ready; debris dynamics remain blocked rather than bypassing the analytical release gate.",
    };
  }

  if (gravityMps2 === null) {
    return {
      ...base,
      state: "blocked_gravity_missing",
      canSimulate: false,
      reason:
        "Gravity vector is not supplied; RPE will not invent a debris acceleration field.",
    };
  }

  if (initialLinearVelocityMps === null) {
    return {
      ...base,
      state: "blocked_linear_velocity_missing",
      canSimulate: false,
      reason:
        "Initial linear velocity is not supplied; RPE will not invent a launch impulse or release velocity.",
    };
  }

  if (initialAngularVelocityRadPerSec === null) {
    return {
      ...base,
      state: "blocked_angular_velocity_missing",
      canSimulate: false,
      reason:
        "Initial angular velocity is not supplied; RPE will not invent debris spin.",
    };
  }

  return {
    ...base,
    state: "simulation_ready",
    canSimulate: true,
    reason:
      "Analytical release is ready and all rigid-body initial-condition vectors are explicit; Rapier may consume these values as a separate RPE simulation layer.",
  };
}
