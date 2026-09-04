import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGenesisEvidenceLog,
  calculateGenesisPanelExperiment,
  calculateRectangularPanelAreaM2,
} from "../src/lib/genesis/panelExperiment";
import { GENESIS_SCHEMA_VERSION } from "../src/types/genesis";

const wind = {
  schemaVersion: GENESIS_SCHEMA_VERSION,
  speedKph: 36,
  directionDegrees: 0,
  airDensityKgPerM3: 1.2,
  sourceNote: "synthetic test fixture",
  verificationState: "unverified" as const,
};

const panel = {
  id: "genesis-panel-001",
  widthM: 2,
  heightM: 1.5,
  pressureCoefficient: 1,
  sourceNote: "synthetic test fixture",
  verificationState: "unverified" as const,
};

test("rectangular panel area is explicit and rejects missing geometry assumptions", () => {
  assert.equal(calculateRectangularPanelAreaM2(2, 1.5), 3);
  assert.throws(() => calculateRectangularPanelAreaM2(0, 1.5), /greater than zero/);
  assert.throws(() => calculateRectangularPanelAreaM2(2, -1), /greater than zero/);
});

test("panel experiment records geometry, wind action, provenance, and an unverified connection separately", () => {
  const result = calculateGenesisPanelExperiment(wind, panel, {
    id: "connection-001",
    capacityN: null,
    sourceNote: "capacity intentionally not supplied",
    verificationState: "unverified",
  });

  assert.equal(result.panel.exposedAreaM2, 3);
  assert.equal(result.wind.dynamicPressurePa, 60);
  assert.equal(result.wind.panelForceN, 180);
  assert.equal(result.wind.assumptions.directionDegrees, 0);
  assert.equal(result.connection.state, "unverified");
  assert.equal(result.experimentState, "unverified_connection");
  assert.equal(result.evidenceLayer, "rpe_analytical");
  assert.equal(result.provenance.windSourceNote, "synthetic test fixture");
  assert.equal(
    result.provenance.connectionSourceNote,
    "capacity intentionally not supplied",
  );
});

test("panel experiment exposes threshold exceedance without simulating detachment", () => {
  const result = calculateGenesisPanelExperiment(wind, panel, {
    id: "connection-001",
    capacityN: 150,
    sourceNote: "synthetic threshold fixture",
    verificationState: "unverified",
  });

  assert.deepEqual(result.connection, {
    demandN: 180,
    capacityN: 150,
    state: "exceeded",
  });
  assert.equal(result.experimentState, "threshold_exceeded");
});

test("panel experiment remains within capacity when demand does not exceed the supplied threshold", () => {
  const result = calculateGenesisPanelExperiment(wind, panel, {
    id: "connection-001",
    capacityN: 180,
    sourceNote: "synthetic threshold fixture",
    verificationState: "unverified",
  });

  assert.equal(result.connection.state, "within_capacity");
  assert.equal(result.experimentState, "within_capacity");
});

test("evidence log is deterministic and blocks release when capacity is unknown", () => {
  const experiment = calculateGenesisPanelExperiment(wind, panel, {
    id: "connection-001",
    capacityN: null,
    sourceNote: "capacity intentionally not supplied",
    verificationState: "unverified",
  });
  const log = buildGenesisEvidenceLog(experiment);

  assert.deepEqual(
    log.map((event) => [event.sequence, event.eventType, event.status]),
    [
      [1, "wind_input", "recorded"],
      [2, "dynamic_pressure", "recorded"],
      [3, "panel_force", "recorded"],
      [4, "connection_assessment", "unverified"],
      [5, "release_gate", "blocked"],
    ],
  );
  assert.equal(log[0].values.directionDegrees, 0);
  assert.match(log[4].message, /capacity is unverified/i);
});

test("threshold exceedance is logged but release remains blocked until rigid-body physics exists", () => {
  const experiment = calculateGenesisPanelExperiment(wind, panel, {
    id: "connection-001",
    capacityN: 150,
    sourceNote: "synthetic threshold fixture",
    verificationState: "unverified",
  });
  const log = buildGenesisEvidenceLog(experiment);

  assert.equal(log[3].status, "threshold_exceeded");
  assert.equal(log[4].status, "blocked");
  assert.match(log[4].message, /not simulated/i);
});
