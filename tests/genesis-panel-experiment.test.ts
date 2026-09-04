import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateGenesisPanelExperiment,
  calculateRectangularPanelAreaM2,
} from "../src/lib/genesis/panelExperiment";
import { GENESIS_SCHEMA_VERSION } from "../src/types/genesis";

const wind = {
  schemaVersion: GENESIS_SCHEMA_VERSION,
  speedKph: 36,
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

test("panel experiment records geometry, wind action, and an unverified connection separately", () => {
  const result = calculateGenesisPanelExperiment(wind, panel, {
    id: "connection-001",
    capacityN: null,
    sourceNote: "capacity intentionally not supplied",
    verificationState: "unverified",
  });

  assert.equal(result.panel.exposedAreaM2, 3);
  assert.equal(result.wind.dynamicPressurePa, 60);
  assert.equal(result.wind.panelForceN, 180);
  assert.equal(result.connection.state, "unverified");
  assert.equal(result.experimentState, "unverified_connection");
  assert.equal(result.evidenceLayer, "rpe_analytical");
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
