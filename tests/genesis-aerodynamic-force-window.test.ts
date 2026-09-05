import assert from "node:assert/strict";
import test from "node:test";

import { evaluateGenesisAerodynamicForceStep } from "../src/lib/genesis/aerodynamicForceWindow";
import {
  GENESIS_FORCE_APPLICATION_SCHEMA_VERSION,
  type GenesisAerodynamicForceApplicationPlan,
} from "../src/types/genesisForceApplication";

function plan(): GenesisAerodynamicForceApplicationPlan {
  return {
    schemaVersion: GENESIS_FORCE_APPLICATION_SCHEMA_VERSION,
    evidenceLayer: "rpe_simulation",
    bodyId: "synthetic-debris-001",
    applicationMode: "center_of_mass_constant_force",
    startOffsetSeconds: 0,
    durationSeconds: 0.25,
    forceN: { x: 3, y: -2, z: 1 },
    torqueNm: null,
    sourceAerodynamicResult: {
      schemaVersion: "0.1.0",
      evidenceLayer: "rpe_analytical",
      relativeAirSpeedMps: 2,
      dragForceMagnitudeN: Math.sqrt(14),
    },
    assumptions: {
      forceHeldConstantOverDeclaredInterval: true,
      applicationPoint: "center_of_mass",
      aerodynamicTorqueModeled: false,
    },
    provenance: {
      sourceNote: "Synthetic force-window scheduling fixture only",
      verificationState: "unverified",
    },
  };
}

test("full physics step preserves declared force", () => {
  const evaluation = evaluateGenesisAerodynamicForceStep(plan(), 0, 0.1);

  assert.equal(evaluation.state, "active_full_step");
  assert.equal(evaluation.shouldApplyForce, true);
  assert.equal(evaluation.activeDurationSeconds, 0.1);
  assert.equal(evaluation.activeFractionOfPhysicsStep, 1);
  assert.deepEqual(evaluation.effectiveForceN, { x: 3, y: -2, z: 1 });
  assert.deepEqual(evaluation.expectedImpulseNs, { x: 0.30000000000000004, y: -0.2, z: 0.1 });
});

test("partial terminal step scales effective force instead of extending the load window", () => {
  const evaluation = evaluateGenesisAerodynamicForceStep(plan(), 0.2, 0.1);

  assert.equal(evaluation.state, "active_partial_step");
  assert.equal(evaluation.shouldApplyForce, true);
  assert.ok(Math.abs(evaluation.activeDurationSeconds - 0.05) < 1e-12);
  assert.ok(Math.abs(evaluation.activeFractionOfPhysicsStep - 0.5) < 1e-12);
  assert.ok(evaluation.effectiveForceN);
  assert.ok(Math.abs(evaluation.effectiveForceN.x - 1.5) < 1e-12);
  assert.ok(Math.abs(evaluation.effectiveForceN.y + 1) < 1e-12);
  assert.ok(Math.abs(evaluation.effectiveForceN.z - 0.5) < 1e-12);
});

test("irregular final step preserves the declared total constant-force impulse", () => {
  const steps = [
    evaluateGenesisAerodynamicForceStep(plan(), 0, 0.1),
    evaluateGenesisAerodynamicForceStep(plan(), 0.1, 0.1),
    evaluateGenesisAerodynamicForceStep(plan(), 0.2, 0.1),
  ];

  const impulse = steps.reduce(
    (sum, step) => ({
      x: sum.x + step.expectedImpulseNs.x,
      y: sum.y + step.expectedImpulseNs.y,
      z: sum.z + step.expectedImpulseNs.z,
    }),
    { x: 0, y: 0, z: 0 },
  );

  assert.ok(Math.abs(impulse.x - 0.75) < 1e-12);
  assert.ok(Math.abs(impulse.y + 0.5) < 1e-12);
  assert.ok(Math.abs(impulse.z - 0.25) < 1e-12);
});

test("no force is scheduled after the explicit interval is complete", () => {
  const evaluation = evaluateGenesisAerodynamicForceStep(plan(), 0.25, 0.1);

  assert.equal(evaluation.state, "complete");
  assert.equal(evaluation.shouldApplyForce, false);
  assert.equal(evaluation.activeDurationSeconds, 0);
  assert.equal(evaluation.effectiveForceN, null);
  assert.deepEqual(evaluation.expectedImpulseNs, { x: 0, y: 0, z: 0 });
});

test("invalid time steps and non-finite plan force are rejected", () => {
  assert.throws(() => evaluateGenesisAerodynamicForceStep(plan(), -0.01, 0.1), /elapsedSeconds/);
  assert.throws(() => evaluateGenesisAerodynamicForceStep(plan(), 0, 0), /physicsStepSeconds/);
  assert.throws(
    () => evaluateGenesisAerodynamicForceStep({ ...plan(), forceN: { x: Number.NaN, y: 0, z: 0 } }, 0, 0.1),
    /plan.forceN.x/,
  );
});

test("scheduler remains simulation evidence and introduces no torque or pre-release force source", () => {
  const evaluation = evaluateGenesisAerodynamicForceStep(plan(), 0, 0.1);

  assert.equal(evaluation.evidenceLayer, "rpe_simulation");
  assert.equal("torqueNm" in evaluation, false);
  assert.equal("panelForceN" in evaluation, false);
  assert.equal("preReleaseImpulseNs" in evaluation, false);
});
