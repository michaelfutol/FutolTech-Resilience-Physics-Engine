import test from "node:test";
import assert from "node:assert/strict";

import {
  createGenesisLiveSimulationEvidence,
  recordGenesisRapierCollisionEnter,
} from "../src/lib/genesis/liveSimulationEvidence";
import type {
  GenesisDebrisDynamicsGateResult,
  GenesisEvidenceEvent,
  GenesisRigidBodyGateResult,
} from "../src/types/genesis";

const analyticalEvents: GenesisEvidenceEvent[] = [
  {
    sequence: 1,
    eventType: "wind_input",
    evidenceLayer: "rpe_analytical",
    status: "recorded",
    message: "synthetic fixture",
    values: {},
    sourceNotes: ["synthetic fixture"],
  },
];

const releaseReady: GenesisRigidBodyGateResult = {
  schemaVersion: "0.1.0",
  evidenceLayer: "rpe_simulation",
  state: "release_ready",
  canRelease: true,
  massKg: 1,
  demandN: 2,
  capacityN: 1,
  reason: "synthetic fixture ready",
  provenance: {
    rigidBodySourceNote: "synthetic fixture",
    rigidBodyVerificationState: "unverified",
  },
};

const dynamicsReady: GenesisDebrisDynamicsGateResult = {
  schemaVersion: "0.1.0",
  evidenceLayer: "rpe_simulation",
  state: "simulation_ready",
  canSimulate: true,
  gravityMps2: { x: 0, y: 0, z: 0 },
  initialLinearVelocityMps: { x: 0, y: 0, z: 0 },
  initialAngularVelocityRadPerSec: { x: 0, y: 0, z: 0 },
  reason: "synthetic fixture ready",
  provenance: {
    dynamicsSourceNote: "synthetic fixture",
    dynamicsVerificationState: "unverified",
  },
};

test("live evidence starts with an explicit simulation activation record", () => {
  const snapshot = createGenesisLiveSimulationEvidence(
    analyticalEvents,
    releaseReady,
    dynamicsReady,
  );

  assert.equal(snapshot.context.collisions.length, 0);
  assert.equal(snapshot.ledger.at(-1)?.eventType, "simulation_activation");
  assert.equal(snapshot.ledger.at(-1)?.status, "active");
});

test("Rapier collision-enter appends an observation without mutating prior snapshot", () => {
  const before = createGenesisLiveSimulationEvidence(
    analyticalEvents,
    releaseReady,
    dynamicsReady,
  );
  const after = recordGenesisRapierCollisionEnter(before, {
    panelId: "panel-fixture",
    otherObjectId: "explicit-object-fixture",
    sourceNote: "Rapier onCollisionEnter synthetic callback fixture",
  });

  assert.equal(before.context.collisions.length, 0);
  assert.equal(after.context.collisions.length, 1);
  assert.equal(after.ledger.at(-1)?.eventType, "collision_enter");
  assert.equal(after.ledger.at(-1)?.evidenceLayer, "rpe_simulation");
  assert.match(after.ledger.at(-1)?.message ?? "", /No impact force, energy, damage, or material response is inferred/);
});

test("live collision bridge preserves the upstream activation gate", () => {
  const blockedRelease: GenesisRigidBodyGateResult = {
    ...releaseReady,
    state: "blocked_mass_missing",
    canRelease: false,
    massKg: null,
    reason: "synthetic fixture blocked",
  };
  const snapshot = createGenesisLiveSimulationEvidence(
    analyticalEvents,
    blockedRelease,
    dynamicsReady,
  );

  assert.equal(snapshot.ledger.at(-1)?.status, "blocked");
  assert.throws(
    () =>
      recordGenesisRapierCollisionEnter(snapshot, {
        panelId: "panel-fixture",
        otherObjectId: null,
        sourceNote: "synthetic callback fixture",
      }),
    /Cannot record a collision before simulation activation/,
  );
});

test("live collision bridge rejects empty event identity/provenance through the ledger contract", () => {
  const snapshot = createGenesisLiveSimulationEvidence(
    analyticalEvents,
    releaseReady,
    dynamicsReady,
  );

  assert.throws(
    () =>
      recordGenesisRapierCollisionEnter(snapshot, {
        panelId: "   ",
        otherObjectId: null,
        sourceNote: "synthetic callback fixture",
      }),
    /panelId must be non-empty/,
  );

  assert.throws(
    () =>
      recordGenesisRapierCollisionEnter(snapshot, {
        panelId: "panel-fixture",
        otherObjectId: null,
        sourceNote: "   ",
      }),
    /sourceNote must be non-empty/,
  );
});
