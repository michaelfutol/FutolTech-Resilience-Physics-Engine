import test from "node:test";
import assert from "node:assert/strict";

import {
  createGenesisLiveSimulationEvidence,
  recordGenesisAerodynamicForceApplication,
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

const activeRecord = {
  bodyId: "genesis-panel-001",
  state: "active_full_step" as const,
  elapsedSeconds: 0,
  physicsStepSeconds: 1 / 60,
  activeDurationSeconds: 1 / 60,
  activeFractionOfPhysicsStep: 1,
  effectiveForceN: { x: 3, y: 0, z: 0 },
  expectedImpulseNs: { x: 0.05, y: 0, z: 0 },
  sourceNote: "Synthetic live aerodynamic force evidence fixture",
};

test("live aerodynamic force application appends rpe_simulation evidence immutably", () => {
  const before = createGenesisLiveSimulationEvidence(
    analyticalEvents,
    releaseReady,
    dynamicsReady,
  );
  const after = recordGenesisAerodynamicForceApplication(before, activeRecord);

  assert.equal(before.context.aerodynamicForceApplications.length, 0);
  assert.equal(after.context.aerodynamicForceApplications.length, 1);
  assert.equal(after.ledger.at(-1)?.eventType, "aerodynamic_force_application");
  assert.equal(after.ledger.at(-1)?.evidenceLayer, "rpe_simulation");
  assert.equal(after.ledger.at(-1)?.status, "active");
  assert.equal(after.ledger.at(-1)?.values.state, "active_full_step");
  assert.equal(after.ledger.at(-1)?.values.effectiveForceX_N, 3);
});

test("partial and complete force-window states remain explicit simulation evidence", () => {
  const base = createGenesisLiveSimulationEvidence(
    analyticalEvents,
    releaseReady,
    dynamicsReady,
  );
  const partial = recordGenesisAerodynamicForceApplication(base, {
    ...activeRecord,
    state: "active_partial_step",
    activeDurationSeconds: 0.005,
    activeFractionOfPhysicsStep: 0.3,
    effectiveForceN: { x: 0.9, y: 0, z: 0 },
    expectedImpulseNs: { x: 0.015, y: 0, z: 0 },
  });
  const complete = recordGenesisAerodynamicForceApplication(partial, {
    ...activeRecord,
    state: "complete",
    elapsedSeconds: 0.25,
    activeDurationSeconds: 0,
    activeFractionOfPhysicsStep: 0,
    effectiveForceN: null,
    expectedImpulseNs: { x: 0, y: 0, z: 0 },
  });

  const events = complete.ledger.filter(
    (event) => event.eventType === "aerodynamic_force_application",
  );
  assert.equal(events.length, 2);
  assert.equal(events[0]?.values.state, "active_partial_step");
  assert.equal(events[1]?.values.state, "complete");
  assert.equal(events[1]?.status, "complete");
});

test("force application evidence cannot bypass blocked simulation activation", () => {
  const blockedRelease: GenesisRigidBodyGateResult = {
    ...releaseReady,
    state: "blocked_mass_missing",
    canRelease: false,
    massKg: null,
  };
  const snapshot = createGenesisLiveSimulationEvidence(
    analyticalEvents,
    blockedRelease,
    dynamicsReady,
  );

  assert.throws(
    () => recordGenesisAerodynamicForceApplication(snapshot, activeRecord),
    /Cannot record live simulation observations before simulation activation/,
  );
});

test("force application evidence rejects anonymous body identity or provenance", () => {
  const snapshot = createGenesisLiveSimulationEvidence(
    analyticalEvents,
    releaseReady,
    dynamicsReady,
  );

  assert.throws(
    () =>
      recordGenesisAerodynamicForceApplication(snapshot, {
        ...activeRecord,
        bodyId: "   ",
      }),
    /bodyId must be non-empty/,
  );
  assert.throws(
    () =>
      recordGenesisAerodynamicForceApplication(snapshot, {
        ...activeRecord,
        sourceNote: "   ",
      }),
    /sourceNote must be non-empty/,
  );
});
