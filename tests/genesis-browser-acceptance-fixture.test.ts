import assert from "node:assert/strict";
import test from "node:test";

import { calculateGenesisPanelExperiment } from "../src/lib/genesis/panelExperiment";
import { assessGenesisRigidBodyReleaseGate } from "../src/lib/genesis/rigidBodyGate";
import { assessGenesisDebrisDynamicsGate } from "../src/lib/genesis/debrisDynamicsGate";
import { validateGenesisCollisionTargetInput } from "../src/lib/genesis/collisionTarget";
import { GENESIS_SCHEMA_VERSION } from "../src/types/genesis";

/**
 * Synthetic browser-QA fixture only.
 *
 * These values are chosen to exercise the UI/runtime gates deterministically. They are not
 * adopted material, code, site, aerodynamic, connection, or physical-test properties.
 * This suite deliberately stops before claiming a Rapier collision: only a genuine live
 * onCollisionEnter callback may establish that simulation observation.
 */
const SYNTHETIC_QA = {
  speedKph: 36,
  directionDegrees: 0,
  airDensityKgPerM3: 1,
  panelWidthM: 1,
  panelHeightM: 1,
  pressureCoefficient: 1,
  connectionCapacityN: 1,
  panelMassKg: 1,
  gravityMps2: { x: 0, y: 0, z: 0 },
  initialLinearVelocityMps: { x: 1, y: 0, z: 0 },
  initialAngularVelocityRadPerSec: { x: 0, y: 0, z: 0 },
  targetId: "synthetic-browser-target-001",
  targetCenterM: { x: 0.5, y: 0.5, z: 0 },
  targetSizeM: { x: 0.2, y: 1, z: 1 },
} as const;

test("synthetic browser-QA fixture reaches release, dynamics, and target-validation gates without asserting collision evidence", () => {
  const experiment = calculateGenesisPanelExperiment(
    {
      schemaVersion: GENESIS_SCHEMA_VERSION,
      speedKph: SYNTHETIC_QA.speedKph,
      directionDegrees: SYNTHETIC_QA.directionDegrees,
      airDensityKgPerM3: SYNTHETIC_QA.airDensityKgPerM3,
      sourceNote: "Synthetic browser-QA fixture only",
      verificationState: "unverified",
    },
    {
      id: "genesis-panel-001",
      widthM: SYNTHETIC_QA.panelWidthM,
      heightM: SYNTHETIC_QA.panelHeightM,
      pressureCoefficient: SYNTHETIC_QA.pressureCoefficient,
      sourceNote: "Synthetic browser-QA fixture only",
      verificationState: "unverified",
    },
    {
      id: "genesis-connection-001",
      capacityN: SYNTHETIC_QA.connectionCapacityN,
      sourceNote: "Synthetic browser-QA fixture only",
      verificationState: "unverified",
    },
  );

  assert.equal(experiment.connection.state, "exceeded");
  assert.equal(experiment.wind.dynamicPressurePa, 50);
  assert.equal(experiment.wind.panelForceN, 50);

  const release = assessGenesisRigidBodyReleaseGate(experiment, {
    massKg: SYNTHETIC_QA.panelMassKg,
    sourceNote: "Synthetic browser-QA fixture only",
    verificationState: "unverified",
  });
  assert.equal(release.state, "release_ready");
  assert.equal(release.canRelease, true);

  const dynamics = assessGenesisDebrisDynamicsGate(release, {
    gravityMps2: SYNTHETIC_QA.gravityMps2,
    initialLinearVelocityMps: SYNTHETIC_QA.initialLinearVelocityMps,
    initialAngularVelocityRadPerSec: SYNTHETIC_QA.initialAngularVelocityRadPerSec,
    sourceNote: "Synthetic browser-QA fixture only",
    verificationState: "unverified",
  });
  assert.equal(dynamics.state, "simulation_ready");
  assert.equal(dynamics.canSimulate, true);

  const target = validateGenesisCollisionTargetInput({
    schemaVersion: GENESIS_SCHEMA_VERSION,
    id: SYNTHETIC_QA.targetId,
    shape: "box",
    centerM: SYNTHETIC_QA.targetCenterM,
    sizeM: SYNTHETIC_QA.targetSizeM,
    sourceNote: "Synthetic browser-QA fixture only",
    verificationState: "unverified",
  });

  assert.equal(target.objectId, SYNTHETIC_QA.targetId);
  assert.deepEqual(target.centerM, SYNTHETIC_QA.targetCenterM);
  assert.deepEqual(target.sizeM, SYNTHETIC_QA.targetSizeM);

  // Deliberately no collision assertion here. A collision is RPE simulation evidence and must
  // originate from the real Rapier callback in browser acceptance, not from fixture geometry.
});
