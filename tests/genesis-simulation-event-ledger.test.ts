import test from "node:test";
import assert from "node:assert/strict";

import { buildGenesisOrderedEventLedger } from "../src/lib/genesis/simulationEventLedger";
import type { GenesisDebrisDynamicsGateResult, GenesisEvidenceEvent, GenesisRigidBodyGateResult } from "../src/types/genesis";

const analytical: GenesisEvidenceEvent[] = [
  { sequence: 1, eventType: "wind_input", evidenceLayer: "rpe_analytical", status: "recorded", message: "fixture", values: {}, sourceNotes: ["fixture"] },
  { sequence: 2, eventType: "release_gate", evidenceLayer: "rpe_analytical", status: "threshold_exceeded", message: "fixture", values: {}, sourceNotes: ["fixture"] },
];

const releaseReady: GenesisRigidBodyGateResult = {
  schemaVersion: "0.1.0",
  evidenceLayer: "rpe_simulation",
  state: "release_ready",
  canRelease: true,
  massKg: 1,
  demandN: 2,
  capacityN: 1,
  reason: "fixture ready",
  provenance: { rigidBodySourceNote: "synthetic fixture", rigidBodyVerificationState: "unverified" },
};

const dynamicsReady: GenesisDebrisDynamicsGateResult = {
  schemaVersion: "0.1.0",
  evidenceLayer: "rpe_simulation",
  state: "simulation_ready",
  canSimulate: true,
  gravityMps2: { x: 0, y: 0, z: 0 },
  initialLinearVelocityMps: { x: 0, y: 0, z: 0 },
  initialAngularVelocityRadPerSec: { x: 0, y: 0, z: 0 },
  reason: "fixture ready",
  provenance: { dynamicsSourceNote: "synthetic fixture", dynamicsVerificationState: "unverified" },
};

test("ordered ledger preserves analytical and simulation evidence boundaries", () => {
  const ledger = buildGenesisOrderedEventLedger(analytical, releaseReady, dynamicsReady, [
    { panelId: "panel-fixture", otherObjectId: null, sourceNote: "Rapier collision callback fixture" },
  ]);

  assert.deepEqual(ledger.map((event) => event.sequence), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(ledger.map((event) => event.evidenceLayer), [
    "rpe_analytical",
    "rpe_analytical",
    "rpe_simulation",
    "rpe_simulation",
    "rpe_simulation",
    "rpe_simulation",
  ]);
  assert.equal(ledger[4].eventType, "simulation_activation");
  assert.equal(ledger[5].eventType, "collision_enter");
  assert.match(ledger[5].message, /No impact force, energy, damage, or material response is inferred/);
});

test("collision records cannot precede simulation activation", () => {
  const blockedRelease: GenesisRigidBodyGateResult = {
    ...releaseReady,
    state: "blocked_mass_missing",
    canRelease: false,
    massKg: null,
    reason: "fixture blocked",
  };

  assert.throws(
    () => buildGenesisOrderedEventLedger(analytical, blockedRelease, dynamicsReady, [
      { panelId: "panel-fixture", otherObjectId: "target-fixture", sourceNote: "synthetic fixture" },
    ]),
    /Cannot record a collision before simulation activation/,
  );
});

test("blocked ledger remains reviewable without collision records", () => {
  const blockedDynamics: GenesisDebrisDynamicsGateResult = {
    ...dynamicsReady,
    state: "blocked_gravity_missing",
    canSimulate: false,
    gravityMps2: null,
    reason: "fixture blocked",
  };

  const ledger = buildGenesisOrderedEventLedger(analytical, releaseReady, blockedDynamics);
  assert.equal(ledger.at(-1)?.eventType, "simulation_activation");
  assert.equal(ledger.at(-1)?.status, "blocked");
});
