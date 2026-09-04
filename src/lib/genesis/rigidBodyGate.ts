import {
  GENESIS_SCHEMA_VERSION,
  type GenesisPanelExperimentResult,
  type GenesisRigidBodyGateResult,
  type GenesisRigidBodyInput,
} from "../../types/genesis";

function validateMassKg(massKg: number | null): number | null {
  if (massKg === null) return null;
  if (!Number.isFinite(massKg) || massKg <= 0) {
    throw new Error("massKg must be a finite number greater than zero when supplied");
  }
  return massKg;
}

export function assessGenesisRigidBodyReleaseGate(
  experiment: GenesisPanelExperimentResult,
  rigidBody: GenesisRigidBodyInput,
): GenesisRigidBodyGateResult {
  const massKg = validateMassKg(rigidBody.massKg);
  const base = {
    schemaVersion: GENESIS_SCHEMA_VERSION,
    evidenceLayer: "rpe_simulation" as const,
    massKg,
    demandN: experiment.connection.demandN,
    capacityN: experiment.connection.capacityN,
    provenance: {
      rigidBodySourceNote: rigidBody.sourceNote,
      rigidBodyVerificationState: rigidBody.verificationState,
    },
  };

  if (experiment.connection.capacityN === null) {
    return {
      ...base,
      state: "blocked_unverified_capacity",
      canRelease: false,
      reason:
        "Connection capacity is not supplied; rigid-body release is blocked rather than inferred.",
    };
  }

  if (experiment.connection.state === "within_capacity") {
    return {
      ...base,
      state: "attached_within_capacity",
      canRelease: false,
      reason:
        "Analytical connection demand does not exceed the supplied capacity, so the panel remains attached.",
    };
  }

  if (massKg === null) {
    return {
      ...base,
      state: "blocked_mass_missing",
      canRelease: false,
      reason:
        "Analytical threshold is exceeded, but panel mass is not supplied; dynamic rigid-body simulation is blocked.",
    };
  }

  return {
    ...base,
    state: "release_ready",
    canRelease: true,
    reason:
      "Analytical threshold is exceeded and explicit panel mass is available; rigid-body release may be simulated as a separate evidence layer.",
  };
}
