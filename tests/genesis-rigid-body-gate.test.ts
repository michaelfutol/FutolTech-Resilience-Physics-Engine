import assert from "node:assert/strict";
import test from "node:test";

import { calculateGenesisPanelExperiment } from "../src/lib/genesis/panelExperiment";
import { assessGenesisRigidBodyReleaseGate } from "../src/lib/genesis/rigidBodyGate";
import { GENESIS_SCHEMA_VERSION } from "../src/types/genesis";

const wind = {
  schemaVersion: GENESIS_SCHEMA_VERSION,
  speedKph: 36,
  directionDegrees: 0,
  airDensityKgPerM3: 1.2,
  sourceNote: "synthetic wind",
  verificationState: "unverified" as const,
};

const panel = {
  id: "panel-001",
  widthM: 2,
  heightM: 1.5,
  pressureCoefficient: 1,
  sourceNote: "synthetic panel",
  verificationState: "unverified" as const,
};

function experimentWithCapacity(capacityN: number | null) {
  return calculateGenesisPanelExperiment(wind, panel, {
    id: "connection-001",
    capacityN,
    sourceNote: capacityN === null ? "capacity unknown" : "synthetic capacity",
    verificationState: "unverified",
  });
}

test("unknown capacity blocks rigid-body release even when mass is known", () => {
  const gate = assessGenesisRigidBodyReleaseGate(experimentWithCapacity(null), {
    massKg: 5,
    sourceNote: "measured fixture mass",
    verificationState: "provisional",
  });

  assert.equal(gate.state, "blocked_unverified_capacity");
  assert.equal(gate.canRelease, false);
  assert.equal(gate.massKg, 5);
});

test("within-capacity analytical result remains attached", () => {
  const gate = assessGenesisRigidBodyReleaseGate(experimentWithCapacity(200), {
    massKg: 5,
    sourceNote: "measured fixture mass",
    verificationState: "provisional",
  });

  assert.equal(gate.demandN, 180);
  assert.equal(gate.capacityN, 200);
  assert.equal(gate.state, "attached_within_capacity");
  assert.equal(gate.canRelease, false);
});

test("threshold exceedance still blocks dynamics when panel mass is missing", () => {
  const gate = assessGenesisRigidBodyReleaseGate(experimentWithCapacity(150), {
    massKg: null,
    sourceNote: "mass not supplied",
    verificationState: "unverified",
  });

  assert.equal(gate.state, "blocked_mass_missing");
  assert.equal(gate.canRelease, false);
});

test("threshold exceedance plus explicit mass opens the simulation release gate", () => {
  const gate = assessGenesisRigidBodyReleaseGate(experimentWithCapacity(150), {
    massKg: 5,
    sourceNote: "measured fixture mass",
    verificationState: "provisional",
  });

  assert.equal(gate.state, "release_ready");
  assert.equal(gate.canRelease, true);
  assert.equal(gate.evidenceLayer, "rpe_simulation");
});

test("invalid mass is rejected instead of normalized or guessed", () => {
  assert.throws(
    () =>
      assessGenesisRigidBodyReleaseGate(experimentWithCapacity(150), {
        massKg: 0,
        sourceNote: "invalid fixture",
        verificationState: "unverified",
      }),
    /greater than zero/,
  );
});
