import assert from "node:assert/strict";
import test from "node:test";

import { compareGenesisPanelCases } from "../src/lib/genesis/comparison";
import { GENESIS_SCHEMA_VERSION } from "../src/types/genesis";

const sharedWind = {
  schemaVersion: GENESIS_SCHEMA_VERSION,
  speedKph: 72,
  directionDegrees: 30,
  airDensityKgPerM3: 1.2,
  sourceNote: "shared synthetic hazard",
  verificationState: "unverified" as const,
};

test("A B comparison guarantees both cases use the same hazard definition", () => {
  const result = compareGenesisPanelCases(
    sharedWind,
    {
      label: "A0",
      panel: {
        id: "panel-a",
        widthM: 1,
        heightM: 2,
        pressureCoefficient: 1,
        sourceNote: "synthetic A",
        verificationState: "unverified",
      },
      connection: {
        id: "connection-a",
        capacityN: 500,
        sourceNote: "synthetic A",
        verificationState: "unverified",
      },
    },
    {
      label: "A1",
      panel: {
        id: "panel-b",
        widthM: 1,
        heightM: 2,
        pressureCoefficient: 1,
        sourceNote: "synthetic B",
        verificationState: "unverified",
      },
      connection: {
        id: "connection-b",
        capacityN: 1000,
        sourceNote: "synthetic B",
        verificationState: "unverified",
      },
    },
  );

  assert.equal(result.sharedWind.speedKph, 72);
  assert.equal(result.sharedWind.directionDegrees, 30);
  assert.equal(result.caseA.experiment.wind.dynamicPressurePa, result.caseB.experiment.wind.dynamicPressurePa);
  assert.equal(result.deltasBMinusA.panelForceN, 0);
  assert.equal(result.deltasBMinusA.capacityN, 500);
});

test("A B comparison exposes the signed B minus A structural-action delta", () => {
  const result = compareGenesisPanelCases(
    sharedWind,
    {
      label: "Baseline",
      panel: {
        id: "panel-a",
        widthM: 1,
        heightM: 1,
        pressureCoefficient: 1,
        sourceNote: "synthetic A",
        verificationState: "unverified",
      },
      connection: {
        id: "connection-a",
        capacityN: 100,
        sourceNote: "synthetic A",
        verificationState: "unverified",
      },
    },
    {
      label: "Candidate",
      panel: {
        id: "panel-b",
        widthM: 2,
        heightM: 1,
        pressureCoefficient: 1,
        sourceNote: "synthetic B",
        verificationState: "unverified",
      },
      connection: {
        id: "connection-b",
        capacityN: 250,
        sourceNote: "synthetic B",
        verificationState: "unverified",
      },
    },
  );

  assert.equal(result.caseA.experiment.wind.dynamicPressurePa, 240);
  assert.equal(result.caseA.experiment.wind.panelForceN, 240);
  assert.equal(result.caseB.experiment.wind.panelForceN, 480);
  assert.equal(result.deltasBMinusA.exposedAreaM2, 1);
  assert.equal(result.deltasBMinusA.panelForceN, 240);
  assert.equal(result.deltasBMinusA.demandN, 240);
  assert.equal(result.caseA.experiment.experimentState, "threshold_exceeded");
  assert.equal(result.caseB.experiment.experimentState, "threshold_exceeded");
});

test("capacity delta remains unknown when either case has no supplied capacity", () => {
  const result = compareGenesisPanelCases(
    sharedWind,
    {
      label: "Unknown baseline",
      panel: {
        id: "panel-a",
        widthM: 1,
        heightM: 1,
        pressureCoefficient: 1,
        sourceNote: "synthetic A",
        verificationState: "unverified",
      },
      connection: {
        id: "connection-a",
        capacityN: null,
        sourceNote: "unknown capacity",
        verificationState: "unverified",
      },
    },
    {
      label: "Known candidate",
      panel: {
        id: "panel-b",
        widthM: 1,
        heightM: 1,
        pressureCoefficient: 1,
        sourceNote: "synthetic B",
        verificationState: "unverified",
      },
      connection: {
        id: "connection-b",
        capacityN: 500,
        sourceNote: "synthetic B",
        verificationState: "unverified",
      },
    },
  );

  assert.equal(result.deltasBMinusA.capacityN, null);
  assert.equal(result.caseA.experiment.experimentState, "unverified_connection");
});

test("A B comparison rejects empty case labels", () => {
  assert.throws(
    () =>
      compareGenesisPanelCases(
        sharedWind,
        {
          label: " ",
          panel: {
            id: "panel-a",
            widthM: 1,
            heightM: 1,
            pressureCoefficient: 1,
            sourceNote: "synthetic A",
            verificationState: "unverified",
          },
          connection: {
            id: "connection-a",
            capacityN: 100,
            sourceNote: "synthetic A",
            verificationState: "unverified",
          },
        },
        {
          label: "B",
          panel: {
            id: "panel-b",
            widthM: 1,
            heightM: 1,
            pressureCoefficient: 1,
            sourceNote: "synthetic B",
            verificationState: "unverified",
          },
          connection: {
            id: "connection-b",
            capacityN: 100,
            sourceNote: "synthetic B",
            verificationState: "unverified",
          },
        },
      ),
    /label cannot be empty/,
  );
});
