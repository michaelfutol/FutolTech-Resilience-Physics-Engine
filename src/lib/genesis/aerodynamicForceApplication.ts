import type { GenesisDebrisDynamicsGateResult } from "../../types/genesis";
import type {
  GenesisPostReleaseAerodynamicGateResult,
  GenesisPostReleaseAerodynamicResult,
} from "../../types/genesisAerodynamics";
import {
  GENESIS_FORCE_APPLICATION_SCHEMA_VERSION,
  type GenesisAerodynamicForceApplicationGateResult,
  type GenesisAerodynamicForceApplicationInput,
  type GenesisAerodynamicForceApplicationPlan,
} from "../../types/genesisForceApplication";

export function assessGenesisAerodynamicForceApplicationGate(
  dynamicsGate: GenesisDebrisDynamicsGateResult,
  aerodynamicGate: GenesisPostReleaseAerodynamicGateResult | null,
  aerodynamicResult: GenesisPostReleaseAerodynamicResult | null,
  input: GenesisAerodynamicForceApplicationInput,
): GenesisAerodynamicForceApplicationGateResult {
  const bodyId = input.bodyId.trim();
  const sourceNote = input.sourceNote.trim();
  const base = {
    schemaVersion: GENESIS_FORCE_APPLICATION_SCHEMA_VERSION,
    evidenceLayer: "rpe_simulation" as const,
    bodyId,
    provenance: {
      sourceNote,
      verificationState: input.verificationState,
    },
    upstream: {
      dynamicsState: dynamicsGate.state,
      aerodynamicGateState: aerodynamicGate?.state ?? "missing" as const,
      aerodynamicBodyId: aerodynamicResult?.bodyId ?? null,
    },
  };

  if (!input.enabled) {
    return {
      ...base,
      state: "blocked_not_enabled",
      canApply: false,
      reason: "Aerodynamic force application is disabled. Analytical aerodynamic output is never applied automatically.",
    };
  }

  if (!dynamicsGate.canSimulate || dynamicsGate.state !== "simulation_ready") {
    return {
      ...base,
      state: "blocked_dynamics_not_ready",
      canApply: false,
      reason: "Aerodynamic force application requires an upstream simulation_ready debris-dynamics gate.",
    };
  }

  if (
    !aerodynamicGate ||
    !aerodynamicGate.canCalculate ||
    aerodynamicGate.state !== "aerodynamic_ready" ||
    !aerodynamicResult
  ) {
    return {
      ...base,
      state: "blocked_aerodynamics_not_ready",
      canApply: false,
      reason: "Aerodynamic force application requires a completed aerodynamic_ready analytical result.",
    };
  }

  if (bodyId === "") {
    return {
      ...base,
      state: "blocked_body_id_missing",
      canApply: false,
      reason: "Explicit rigid-body identity is missing.",
    };
  }

  if (bodyId !== aerodynamicResult.bodyId) {
    return {
      ...base,
      state: "blocked_body_mismatch",
      canApply: false,
      reason: `Application body ${bodyId} does not match aerodynamic result body ${aerodynamicResult.bodyId}.`,
    };
  }

  if (sourceNote === "") {
    return {
      ...base,
      state: "blocked_source_note_missing",
      canApply: false,
      reason: "Force-application provenance/source note is missing.",
    };
  }

  return {
    ...base,
    state: "force_application_ready",
    canApply: true,
    reason: "Explicit opt-in, upstream simulation state, aerodynamic result, body identity, and provenance are complete. A non-executing force-application plan may be created.",
  };
}

export function createGenesisAerodynamicForceApplicationPlan(
  gate: GenesisAerodynamicForceApplicationGateResult,
  aerodynamicResult: GenesisPostReleaseAerodynamicResult,
): GenesisAerodynamicForceApplicationPlan {
  if (!gate.canApply || gate.state !== "force_application_ready") {
    throw new Error("Aerodynamic force-application plan requires a force_application_ready gate");
  }
  if (gate.bodyId !== aerodynamicResult.bodyId) {
    throw new Error("Aerodynamic force-application body identity mismatch");
  }

  return {
    schemaVersion: GENESIS_FORCE_APPLICATION_SCHEMA_VERSION,
    evidenceLayer: "rpe_simulation",
    bodyId: gate.bodyId,
    applicationMode: "center_of_mass_constant_force",
    startOffsetSeconds: 0,
    durationSeconds: aerodynamicResult.intervalSeconds,
    forceN: { ...aerodynamicResult.dragForceN },
    torqueNm: null,
    sourceAerodynamicResult: {
      schemaVersion: aerodynamicResult.schemaVersion,
      evidenceLayer: aerodynamicResult.evidenceLayer,
      relativeAirSpeedMps: aerodynamicResult.relativeAirSpeedMps,
      dragForceMagnitudeN: aerodynamicResult.dragForceMagnitudeN,
    },
    assumptions: {
      forceHeldConstantOverDeclaredInterval: true,
      applicationPoint: "center_of_mass",
      aerodynamicTorqueModeled: false,
    },
    provenance: gate.provenance,
  };
}
