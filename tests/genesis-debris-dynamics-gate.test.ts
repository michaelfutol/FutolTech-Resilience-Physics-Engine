import assert from "node:assert/strict";
import test from "node:test";

import { assessGenesisDebrisDynamicsGate } from "../src/lib/genesis/debrisDynamicsGate";
import { calculateGenesisPanelExperiment } from "../src/lib/genesis/panelExperiment";
import { assessGenesisRigidBodyReleaseGate } from "../src/lib/genesis/rigidBodyGate";
import { GENESIS_SCHEMA_VERSION } from "../src/types/genesis";

const wind = {
  schemaVersion: GENESIS_SCHEMA_VERSION,
  speedKph: 36,
  directionDegrees: 0,
  airDensityKgPerM3: 1.2,
  sourceNote: "synthetic wind fixture",
  verificationState: "unverified" as const,
};

const panel = {
  id: "panel-001",
  widthM: 2,
  heightM: 1.5,
  pressureCoefficient: 1,
  sourceNote: "synthetic panel fixture",
  verificationState: "unverified" as const,
};

function releaseGate(capacityN: number | null, massKg: number | null) {
  const experiment = calculateGenesisPanelExperiment(wind, panel, {
    id: "connection-001",
    capacityN,
    sourceNote: "synthetic connection fixture",
    verificationState: "unverified",
  });

  return assessGenesisRigidBodyReleaseGate(experiment, {
    massKg,
    sourceNote: "synthetic rigid-body fixture",
    verificationState: "unverified",
  });
}

const explicitZeroInitialConditions = {
  gravityMps2: { x: 0, y: 0, z: 0 },
  initialLinearVelocityMps: { x: 0, y: 0, z: 0 },
  initialAngularVelocityRadPerSec: { x: 0, y: 0, z: 0 },
  sourceNote: "synthetic explicit initial-condition fixture",
  verificationState: "unverified" as const,
};

test("debris dynamics cannot bypass an unresolved analytical release gate", () => {
  const result = assessGenesisDebrisDynamicsGate(
    releaseGate(null, 5),
    explicitZeroInitialConditions,
  );

  assert.equal(result.state, "blocked_release_not_ready");
  assert.equal(result.canSimulate, false);
});

test("release-ready state still blocks when gravity is not explicit", () => {
  const result = assessGenesisDebrisDynamicsGate(releaseGate(150, 5), {
    ...explicitZeroInitialConditions,
    gravityMps2: null,
  });

  assert.equal(result.state, "blocked_gravity_missing");
  assert.equal(result.canSimulate, false);
});

test("release-ready state still blocks when linear velocity is not explicit", () => {
  const result = assessGenesisDebrisDynamicsGate(releaseGate(150, 5), {
    ...explicitZeroInitialConditions,
    initialLinearVelocityMps: null,
  });

  assert.equal(result.state, "blocked_linear_velocity_missing");
  assert.equal(result.canSimulate, false);
});

test("release-ready state still blocks when angular velocity is not explicit", () => {
  const result = assessGenesisDebrisDynamicsGate(releaseGate(150, 5), {
    ...explicitZeroInitialConditions,
    initialAngularVelocityRadPerSec: null,
  });

  assert.equal(result.state, "blocked_angular_velocity_missing");
  assert.equal(result.canSimulate, false);
});

test("explicit zero vectors are accepted because zero is supplied rather than assumed", () => {
  const result = assessGenesisDebrisDynamicsGate(
    releaseGate(150, 5),
    explicitZeroInitialConditions,
  );

  assert.equal(result.state, "simulation_ready");
  assert.equal(result.canSimulate, true);
  assert.equal(result.evidenceLayer, "rpe_simulation");
  assert.deepEqual(result.gravityMps2, { x: 0, y: 0, z: 0 });
});

test("non-finite vector components are rejected instead of normalized", () => {
  assert.throws(
    () =>
      assessGenesisDebrisDynamicsGate(releaseGate(150, 5), {
        ...explicitZeroInitialConditions,
        gravityMps2: { x: Number.NaN, y: 0, z: 0 },
      }),
    /gravityMps2.x must be a finite number/,
  );
});
