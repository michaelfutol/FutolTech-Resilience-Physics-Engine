import assert from "node:assert/strict";
import test from "node:test";

import {
  assessGenesisPostReleaseAerodynamicGate,
  calculateGenesisPostReleaseAerodynamics,
} from "../src/lib/genesis/postReleaseAerodynamics";
import { GENESIS_SCHEMA_VERSION, type GenesisDebrisDynamicsGateResult } from "../src/types/genesis";
import type { GenesisPostReleaseAerodynamicInput } from "../src/types/genesisAerodynamics";

const readyDynamics: GenesisDebrisDynamicsGateResult = {
  schemaVersion: GENESIS_SCHEMA_VERSION,
  evidenceLayer: "rpe_simulation",
  state: "simulation_ready",
  canSimulate: true,
  gravityMps2: { x: 0, y: -9.81, z: 0 },
  initialLinearVelocityMps: { x: 0, y: 0, z: 0 },
  initialAngularVelocityRadPerSec: { x: 0, y: 0, z: 0 },
  reason: "Synthetic aerodynamic test fixture only",
  provenance: {
    dynamicsSourceNote: "Synthetic aerodynamic test fixture only",
    dynamicsVerificationState: "unverified",
  },
};

const blockedDynamics: GenesisDebrisDynamicsGateResult = {
  ...readyDynamics,
  state: "blocked_linear_velocity_missing",
  canSimulate: false,
  initialLinearVelocityMps: null,
};

function completeInput(): GenesisPostReleaseAerodynamicInput {
  return {
    bodyId: "synthetic-debris-001",
    intervalSeconds: 0.5,
    airDensityKgPerM3: 1,
    relativeAirVelocityMps: { x: 3, y: 4, z: 0 },
    projectedAreaM2: 2,
    dragCoefficient: 1.2,
    sourceNote: "Synthetic aerodynamic test fixture only",
    verificationState: "unverified",
  };
}

test("post-release aerodynamics remain blocked until debris dynamics are ready", () => {
  const gate = assessGenesisPostReleaseAerodynamicGate(blockedDynamics, completeInput());
  assert.equal(gate.state, "blocked_dynamics_not_ready");
  assert.equal(gate.canCalculate, false);
});

test("missing post-release inputs remain blocked instead of inheriting pre-release values", () => {
  const cases: Array<{
    mutate: (input: GenesisPostReleaseAerodynamicInput) => void;
    expectedState: string;
  }> = [
    { mutate: (input) => { input.bodyId = ""; }, expectedState: "blocked_body_id_missing" },
    { mutate: (input) => { input.sourceNote = ""; }, expectedState: "blocked_source_note_missing" },
    { mutate: (input) => { input.intervalSeconds = null; }, expectedState: "blocked_interval_missing" },
    { mutate: (input) => { input.airDensityKgPerM3 = null; }, expectedState: "blocked_air_density_missing" },
    {
      mutate: (input) => { input.relativeAirVelocityMps = null; },
      expectedState: "blocked_relative_air_velocity_missing",
    },
    { mutate: (input) => { input.projectedAreaM2 = null; }, expectedState: "blocked_projected_area_missing" },
    {
      mutate: (input) => { input.dragCoefficient = null; },
      expectedState: "blocked_drag_coefficient_missing",
    },
  ];

  for (const { mutate, expectedState } of cases) {
    const input = completeInput();
    mutate(input);
    const gate = assessGenesisPostReleaseAerodynamicGate(readyDynamics, input);
    assert.equal(gate.canCalculate, false);
    assert.equal(gate.state, expectedState);
  }
});

test("explicit zero relative airflow is valid and produces zero aerodynamic action", () => {
  const input = completeInput();
  input.relativeAirVelocityMps = { x: 0, y: 0, z: 0 };

  const gate = assessGenesisPostReleaseAerodynamicGate(readyDynamics, input);
  assert.equal(gate.state, "aerodynamic_ready");
  assert.equal(gate.canCalculate, true);

  const result = calculateGenesisPostReleaseAerodynamics(gate);
  assert.equal(result.relativeAirSpeedMps, 0);
  assert.equal(result.dynamicPressurePa, 0);
  assert.equal(result.dragForceMagnitudeN, 0);
  assert.deepEqual(result.dragForceN, { x: 0, y: 0, z: 0 });
  assert.deepEqual(result.constantForceImpulseNs, { x: 0, y: 0, z: 0 });
});

test("explicit post-release drag uses declared relative airflow and interval", () => {
  const gate = assessGenesisPostReleaseAerodynamicGate(readyDynamics, completeInput());
  assert.equal(gate.state, "aerodynamic_ready");

  const result = calculateGenesisPostReleaseAerodynamics(gate);
  assert.equal(result.evidenceLayer, "rpe_analytical");
  assert.equal(result.relativeAirSpeedMps, 5);
  assert.equal(result.dynamicPressurePa, 12.5);
  assert.equal(result.dragForceMagnitudeN, 30);
  assert.deepEqual(result.dragForceN, { x: 18, y: 24, z: 0 });
  assert.deepEqual(result.constantForceImpulseNs, { x: 9, y: 12, z: 0 });
  assert.equal(result.assumptions.relativeAirVelocityConvention, "air_relative_to_body");
  assert.equal(result.assumptions.forceHeldConstantOverInterval, true);
  assert.equal("panelForceN" in result, false);
});

test("force-to-impulse conversion cannot occur without an explicit positive interval", () => {
  const missingInterval = completeInput();
  missingInterval.intervalSeconds = null;
  const blocked = assessGenesisPostReleaseAerodynamicGate(readyDynamics, missingInterval);
  assert.throws(
    () => calculateGenesisPostReleaseAerodynamics(blocked),
    /aerodynamic_ready/,
  );

  const zeroInterval = completeInput();
  zeroInterval.intervalSeconds = 0;
  assert.throws(
    () => assessGenesisPostReleaseAerodynamicGate(readyDynamics, zeroInterval),
    /intervalSeconds must be greater than zero/,
  );
});

test("invalid physical inputs are rejected rather than normalized silently", () => {
  const negativeDensity = completeInput();
  negativeDensity.airDensityKgPerM3 = -1;
  assert.throws(
    () => assessGenesisPostReleaseAerodynamicGate(readyDynamics, negativeDensity),
    /airDensityKgPerM3 must be greater than zero/,
  );

  const zeroArea = completeInput();
  zeroArea.projectedAreaM2 = 0;
  assert.throws(
    () => assessGenesisPostReleaseAerodynamicGate(readyDynamics, zeroArea),
    /projectedAreaM2 must be greater than zero/,
  );

  const negativeCd = completeInput();
  negativeCd.dragCoefficient = -0.1;
  assert.throws(
    () => assessGenesisPostReleaseAerodynamicGate(readyDynamics, negativeCd),
    /dragCoefficient must be greater than or equal to zero/,
  );

  const nonFiniteVelocity = completeInput();
  nonFiniteVelocity.relativeAirVelocityMps = { x: Number.NaN, y: 0, z: 0 };
  assert.throws(
    () => assessGenesisPostReleaseAerodynamicGate(readyDynamics, nonFiniteVelocity),
    /relativeAirVelocityMps.x must be a finite number/,
  );
});
