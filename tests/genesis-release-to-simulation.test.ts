import assert from "node:assert/strict";
import test from "node:test";

import { calculateGenesisPanelExperiment } from "../src/lib/genesis/panelExperiment";
import { assessGenesisRigidBodyReleaseGate } from "../src/lib/genesis/rigidBodyGate";
import { assessGenesisDebrisDynamicsGate } from "../src/lib/genesis/debrisDynamicsGate";
import { GENESIS_SCHEMA_VERSION } from "../src/types/genesis";

function exceededExperiment() {
  return calculateGenesisPanelExperiment(
    {
      schemaVersion: GENESIS_SCHEMA_VERSION,
      speedKph: 36,
      directionDegrees: 0,
      airDensityKgPerM3: 2,
      sourceNote: "Synthetic integration fixture only",
      verificationState: "unverified",
    },
    {
      id: "synthetic-panel",
      widthM: 2,
      heightM: 2,
      pressureCoefficient: 1,
      sourceNote: "Synthetic integration fixture only",
      verificationState: "unverified",
    },
    {
      id: "synthetic-connection",
      capacityN: 100,
      sourceNote: "Synthetic integration fixture only",
      verificationState: "unverified",
    },
  );
}

test("Rapier activation remains blocked until analytical release and every explicit dynamics input are ready", () => {
  const experiment = exceededExperiment();

  const missingMassRelease = assessGenesisRigidBodyReleaseGate(experiment, {
    massKg: null,
    sourceNote: "Synthetic integration fixture only",
    verificationState: "unverified",
  });
  assert.equal(missingMassRelease.state, "blocked_mass_missing");
  assert.equal(missingMassRelease.canRelease, false);

  const release = assessGenesisRigidBodyReleaseGate(experiment, {
    massKg: 5,
    sourceNote: "Synthetic integration fixture only",
    verificationState: "unverified",
  });
  assert.equal(release.state, "release_ready");
  assert.equal(release.canRelease, true);

  const missingGravity = assessGenesisDebrisDynamicsGate(release, {
    gravityMps2: null,
    initialLinearVelocityMps: { x: 0, y: 0, z: 0 },
    initialAngularVelocityRadPerSec: { x: 0, y: 0, z: 0 },
    sourceNote: "Synthetic integration fixture only",
    verificationState: "unverified",
  });
  assert.equal(missingGravity.state, "blocked_gravity_missing");
  assert.equal(missingGravity.canSimulate, false);

  const ready = assessGenesisDebrisDynamicsGate(release, {
    gravityMps2: { x: 0, y: -1, z: 0 },
    initialLinearVelocityMps: { x: 0, y: 0, z: 0 },
    initialAngularVelocityRadPerSec: { x: 0, y: 0, z: 0 },
    sourceNote: "Synthetic integration fixture only",
    verificationState: "unverified",
  });
  assert.equal(ready.state, "simulation_ready");
  assert.equal(ready.canSimulate, true);
  assert.deepEqual(ready.initialLinearVelocityMps, { x: 0, y: 0, z: 0 });
  assert.deepEqual(ready.initialAngularVelocityRadPerSec, { x: 0, y: 0, z: 0 });
});
