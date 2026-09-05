import assert from "node:assert/strict";
import test from "node:test";

import {
  assessGenesisPostReleaseAerodynamicGate,
  calculateGenesisPostReleaseAerodynamics,
} from "../src/lib/genesis/postReleaseAerodynamics";
import {
  assessGenesisAerodynamicForceApplicationGate,
  createGenesisAerodynamicForceApplicationPlan,
} from "../src/lib/genesis/aerodynamicForceApplication";
import { GENESIS_SCHEMA_VERSION, type GenesisDebrisDynamicsGateResult } from "../src/types/genesis";
import type { GenesisPostReleaseAerodynamicInput } from "../src/types/genesisAerodynamics";

const readyDynamics: GenesisDebrisDynamicsGateResult = {
  schemaVersion: GENESIS_SCHEMA_VERSION,
  evidenceLayer: "rpe_simulation",
  state: "simulation_ready",
  canSimulate: true,
  gravityMps2: { x: 0, y: 0, z: 0 },
  initialLinearVelocityMps: { x: 0, y: 0, z: 0 },
  initialAngularVelocityRadPerSec: { x: 0, y: 0, z: 0 },
  reason: "Synthetic force-application fixture only",
  provenance: {
    dynamicsSourceNote: "Synthetic force-application fixture only",
    dynamicsVerificationState: "unverified",
  },
};

const blockedDynamics: GenesisDebrisDynamicsGateResult = {
  ...readyDynamics,
  state: "blocked_gravity_missing",
  canSimulate: false,
  gravityMps2: null,
};

function aeroInput(): GenesisPostReleaseAerodynamicInput {
  return {
    bodyId: "synthetic-debris-001",
    intervalSeconds: 0.25,
    airDensityKgPerM3: 1,
    relativeAirVelocityMps: { x: 2, y: 0, z: 0 },
    projectedAreaM2: 1.5,
    dragCoefficient: 1,
    sourceNote: "Synthetic force-application fixture only",
    verificationState: "unverified",
  };
}

function readyAero() {
  const gate = assessGenesisPostReleaseAerodynamicGate(readyDynamics, aeroInput());
  return {
    gate,
    result: calculateGenesisPostReleaseAerodynamics(gate),
  };
}

test("force application is opt-in and never automatic", () => {
  const { gate: aeroGate, result } = readyAero();
  const applicationGate = assessGenesisAerodynamicForceApplicationGate(
    readyDynamics,
    aeroGate,
    result,
    {
      enabled: false,
      bodyId: result.bodyId,
      sourceNote: "Synthetic force-application fixture only",
      verificationState: "unverified",
    },
  );

  assert.equal(applicationGate.state, "blocked_not_enabled");
  assert.equal(applicationGate.canApply, false);
});

test("force application is blocked when simulation dynamics are not ready", () => {
  const { gate: aeroGate, result } = readyAero();
  const applicationGate = assessGenesisAerodynamicForceApplicationGate(
    blockedDynamics,
    aeroGate,
    result,
    {
      enabled: true,
      bodyId: result.bodyId,
      sourceNote: "Synthetic force-application fixture only",
      verificationState: "unverified",
    },
  );

  assert.equal(applicationGate.state, "blocked_dynamics_not_ready");
});

test("force application is blocked without an aerodynamic-ready result", () => {
  const applicationGate = assessGenesisAerodynamicForceApplicationGate(
    readyDynamics,
    null,
    null,
    {
      enabled: true,
      bodyId: "synthetic-debris-001",
      sourceNote: "Synthetic force-application fixture only",
      verificationState: "unverified",
    },
  );

  assert.equal(applicationGate.state, "blocked_aerodynamics_not_ready");
});

test("body identity mismatch blocks application", () => {
  const { gate: aeroGate, result } = readyAero();
  const applicationGate = assessGenesisAerodynamicForceApplicationGate(
    readyDynamics,
    aeroGate,
    result,
    {
      enabled: true,
      bodyId: "different-body",
      sourceNote: "Synthetic force-application fixture only",
      verificationState: "unverified",
    },
  );

  assert.equal(applicationGate.state, "blocked_body_mismatch");
  assert.equal(applicationGate.canApply, false);
});

test("ready plan preserves explicit force and duration but models no aerodynamic torque", () => {
  const { gate: aeroGate, result } = readyAero();
  const applicationGate = assessGenesisAerodynamicForceApplicationGate(
    readyDynamics,
    aeroGate,
    result,
    {
      enabled: true,
      bodyId: result.bodyId,
      sourceNote: "Synthetic force-application fixture only",
      verificationState: "unverified",
    },
  );

  assert.equal(applicationGate.state, "force_application_ready");
  assert.equal(applicationGate.canApply, true);

  const plan = createGenesisAerodynamicForceApplicationPlan(applicationGate, result);
  assert.equal(plan.evidenceLayer, "rpe_simulation");
  assert.equal(plan.applicationMode, "center_of_mass_constant_force");
  assert.equal(plan.startOffsetSeconds, 0);
  assert.equal(plan.durationSeconds, result.intervalSeconds);
  assert.deepEqual(plan.forceN, result.dragForceN);
  assert.equal(plan.torqueNm, null);
  assert.equal(plan.assumptions.applicationPoint, "center_of_mass");
  assert.equal(plan.assumptions.aerodynamicTorqueModeled, false);
  assert.equal("panelForceN" in plan, false);
  assert.equal("impulseNs" in plan, false);
});

test("plan creation refuses blocked gate and later identity mismatch", () => {
  const { gate: aeroGate, result } = readyAero();
  const blocked = assessGenesisAerodynamicForceApplicationGate(
    readyDynamics,
    aeroGate,
    result,
    {
      enabled: false,
      bodyId: result.bodyId,
      sourceNote: "Synthetic force-application fixture only",
      verificationState: "unverified",
    },
  );
  assert.throws(
    () => createGenesisAerodynamicForceApplicationPlan(blocked, result),
    /force_application_ready/,
  );

  const ready = assessGenesisAerodynamicForceApplicationGate(
    readyDynamics,
    aeroGate,
    result,
    {
      enabled: true,
      bodyId: result.bodyId,
      sourceNote: "Synthetic force-application fixture only",
      verificationState: "unverified",
    },
  );
  assert.throws(
    () => createGenesisAerodynamicForceApplicationPlan(ready, { ...result, bodyId: "changed-body" }),
    /identity mismatch/,
  );
});
