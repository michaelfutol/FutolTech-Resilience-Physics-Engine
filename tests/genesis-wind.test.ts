import assert from "node:assert/strict";
import test from "node:test";

import {
  assessConnectionDemand,
  calculateAnalyticalPanelWind,
  calculateDynamicPressurePa,
  calculatePanelWindForceN,
  kphToMps,
} from "../src/lib/genesis/wind";
import { GENESIS_SCHEMA_VERSION } from "../src/types/genesis";

test("kphToMps performs an exact unit conversion without a hidden wind assumption", () => {
  assert.equal(kphToMps(36), 10);
  assert.equal(kphToMps(0), 0);
  assert.throws(() => kphToMps(-1), /greater than or equal to zero/);
});

test("dynamic pressure requires caller-supplied density", () => {
  assert.equal(calculateDynamicPressurePa(10, 1.2), 60);
  assert.throws(() => calculateDynamicPressurePa(10, 0), /greater than zero/);
});

test("panel wind force keeps area and pressure coefficient explicit", () => {
  assert.equal(calculatePanelWindForceN(60, 2, 1.5), 180);
  assert.equal(calculatePanelWindForceN(60, 2, -0.5), -60);
});

test("analytical result records the exact assumptions used including wind direction", () => {
  const result = calculateAnalyticalPanelWind(
    {
      schemaVersion: GENESIS_SCHEMA_VERSION,
      speedKph: 36,
      directionDegrees: 90,
      airDensityKgPerM3: 1.2,
      sourceNote: "test input only",
      verificationState: "unverified",
    },
    {
      id: "panel-test",
      exposedAreaM2: 2,
      pressureCoefficient: 1.5,
      sourceNote: "test input only",
      verificationState: "unverified",
    },
  );

  assert.deepEqual(result, {
    schemaVersion: GENESIS_SCHEMA_VERSION,
    evidenceLayer: "rpe_analytical",
    speedMps: 10,
    dynamicPressurePa: 60,
    panelForceN: 180,
    assumptions: {
      directionDegrees: 90,
      airDensityKgPerM3: 1.2,
      exposedAreaM2: 2,
      pressureCoefficient: 1.5,
    },
  });
});

test("analytical wind rejects a non-finite direction instead of silently normalizing it", () => {
  assert.throws(
    () =>
      calculateAnalyticalPanelWind(
        {
          schemaVersion: GENESIS_SCHEMA_VERSION,
          speedKph: 36,
          directionDegrees: Number.NaN,
          airDensityKgPerM3: 1.2,
          sourceNote: "test input only",
          verificationState: "unverified",
        },
        {
          id: "panel-test",
          exposedAreaM2: 2,
          pressureCoefficient: 1.5,
          sourceNote: "test input only",
          verificationState: "unverified",
        },
      ),
    /directionDegrees must be a finite number/,
  );
});

test("unknown connection capacity remains unverified instead of becoming a false PASS", () => {
  assert.deepEqual(
    assessConnectionDemand(180, {
      id: "connection-unknown",
      capacityN: null,
      sourceNote: "capacity not supplied",
      verificationState: "unverified",
    }),
    { demandN: 180, capacityN: null, state: "unverified" },
  );
});

test("known connection capacity is assessed deterministically", () => {
  const connection = {
    id: "connection-test",
    capacityN: 200,
    sourceNote: "synthetic test fixture only",
    verificationState: "unverified" as const,
  };

  assert.equal(assessConnectionDemand(180, connection).state, "within_capacity");
  assert.equal(assessConnectionDemand(220, connection).state, "exceeded");
});
