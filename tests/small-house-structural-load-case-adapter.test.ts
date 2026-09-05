import test from "node:test";
import assert from "node:assert/strict";

import { SYNTHETIC_PHASE4_HOUSE } from "../src/data/smallHouseWind/syntheticPhase4House";
import { mapSmallHouseStructuralLoadCase } from "../src/lib/smallHouseWind/structuralLoadCaseAdapter";
import { mapSmallHouseSurfaceForceApplicationPoint } from "../src/lib/smallHouseWind/surfaceForceApplicationPoint";
import { calculateSmallHouseSurfaceForceMoment } from "../src/lib/smallHouseWind/surfaceForceMoment";
import { calculateSmallHouseSurfaceWindAction } from "../src/lib/smallHouseWind/surfaceWindAction";
import { materializeSmallHouseWindStage } from "../src/lib/smallHouseWind/systemContract";
import {
  SMALL_HOUSE_STRUCTURAL_LOAD_CASE_ADAPTER_SCHEMA_VERSION,
  type SmallHouseStructuralLoadCaseAdapterInput,
} from "../src/types/smallHouseStructuralLoadCaseAdapter";
import {
  SMALL_HOUSE_SURFACE_FORCE_APPLICATION_POINT_SCHEMA_VERSION,
  type SmallHouseSurfaceForceApplicationPointInput,
} from "../src/types/smallHouseSurfaceForceApplicationPoint";
import {
  SMALL_HOUSE_SURFACE_FORCE_MOMENT_SCHEMA_VERSION,
  type SmallHouseSurfaceForceMomentInput,
} from "../src/types/smallHouseSurfaceForceMoment";
import {
  SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION,
  type SmallHouseSurfaceWindActionInput,
} from "../src/types/smallHouseSurfaceWindAction";
import type { SmallHouseWindSystemInput } from "../src/types/smallHouseWind";

function near(actual: number | null | undefined, expected: number, tolerance = 1e-9): void {
  assert.notEqual(actual, null);
  assert.notEqual(actual, undefined);
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `${actual} != ${expected}`);
}

function actionInput(): SmallHouseSurfaceWindActionInput {
  return {
    schemaVersion: SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION,
    surfaceComponentId: "synthetic-wall-north",
    surfaceNormalAxis: "local_z",
    airDensityKgPerM3: 1.2,
    windSpeedMps: 20,
    effectiveWindAreaM2: 5,
    signedPressureCoefficient: -0.8,
    globalActionDirection: { x: 0, y: 0, z: 2 },
    airDensitySourceNote: "Synthetic QA density",
    airDensityVerificationState: "unverified",
    windSpeedSourceNote: "Synthetic QA speed",
    windSpeedVerificationState: "unverified",
    effectiveAreaSourceNote: "Synthetic QA effective area",
    effectiveAreaVerificationState: "unverified",
    coefficientSourceNote: "Synthetic QA coefficient",
    coefficientVerificationState: "unverified",
    directionSourceNote: "Synthetic QA direction",
    directionVerificationState: "unverified",
    sourceNote: "Synthetic north-wall action",
    verificationState: "unverified",
  };
}

function applicationInput(): SmallHouseSurfaceForceApplicationPointInput {
  return {
    schemaVersion: SMALL_HOUSE_SURFACE_FORCE_APPLICATION_POINT_SCHEMA_VERSION,
    surfaceComponentId: "synthetic-wall-north",
    applicationPointGlobalM: { x: 0.37, y: 1.23, z: -2.41 },
    sourceNote: "Synthetic caller-declared application point",
    verificationState: "unverified",
  };
}

function momentInput(): SmallHouseSurfaceForceMomentInput {
  return {
    schemaVersion: SMALL_HOUSE_SURFACE_FORCE_MOMENT_SCHEMA_VERSION,
    surfaceComponentId: "synthetic-wall-north",
    referencePointGlobalM: { x: 0.1, y: 0.2, z: -2.0 },
    sourceNote: "Synthetic caller-declared moment reference",
    verificationState: "unverified",
  };
}

function adapterInput(
  overrides: Partial<SmallHouseStructuralLoadCaseAdapterInput> = {},
): SmallHouseStructuralLoadCaseAdapterInput {
  return {
    schemaVersion: SMALL_HOUSE_STRUCTURAL_LOAD_CASE_ADAPTER_SCHEMA_VERSION,
    surfaceComponentId: "synthetic-wall-north",
    loadCaseId: "LC-WIND-QA-001",
    solverNodeId: "NODE-WIND-NORTH-QA-001",
    solverNodeGlobalM: { x: 0.1, y: 0.2, z: -2.0 },
    coordinateBasis: "global_cartesian_xyz_m",
    sourceNote: "Synthetic solver-input mapping only",
    verificationState: "unverified",
    ...overrides,
  };
}

function readyFixture(specimen: SmallHouseWindSystemInput = SYNTHETIC_PHASE4_HOUSE) {
  const snapshot = materializeSmallHouseWindStage(specimen, "walls");
  const action = calculateSmallHouseSurfaceWindAction(snapshot, actionInput());
  const application = mapSmallHouseSurfaceForceApplicationPoint(
    snapshot,
    action,
    applicationInput(),
  );
  const moment = calculateSmallHouseSurfaceForceMoment(
    snapshot,
    application,
    momentInput(),
  );
  return { snapshot, action, application, moment };
}

test("ready analytical force and moment map to one explicit load case and solver node without creating solver response", () => {
  const { snapshot, application, moment } = readyFixture();
  const result = mapSmallHouseStructuralLoadCase(
    snapshot,
    application,
    moment,
    adapterInput(),
  );

  assert.equal(result.state, "mapping_ready");
  assert.equal(result.canMap, true);
  assert.equal(result.evidenceLayer, "solver_input_mapping");
  assert.equal(result.structuralResult, "N/A");
  assert.equal(result.surfaceComponentId, "synthetic-wall-north");
  assert.equal(result.loadCaseId, "LC-WIND-QA-001");
  assert.equal(result.solverNodeId, "NODE-WIND-NORTH-QA-001");
  assert.deepEqual(result.solverNodeGlobalM, { x: 0.1, y: 0.2, z: -2.0 });
  assert.equal(result.coordinateBasis, "global_cartesian_xyz_m");
  assert.deepEqual(result.sourceApplicationPointGlobalM, {
    x: 0.37,
    y: 1.23,
    z: -2.41,
  });
  near(result.sourceForceVectorN?.x, 0);
  near(result.sourceForceVectorN?.y, 0);
  near(result.sourceForceVectorN?.z, -960);
  near(result.sourceForceMomentVectorNm?.x, -988.8);
  near(result.sourceForceMomentVectorNm?.y, 259.2);
  near(result.sourceForceMomentVectorNm?.z, 0);
  near(result.mappedNodalLoad?.forceVectorN.z, -960);
  near(result.mappedNodalLoad?.momentVectorNm.x, -988.8);
  assert.deepEqual(result.solverResponse, {
    reactionsN: null,
    displacementsM: null,
    rotationsRad: null,
    memberForces: null,
    connectionDemands: null,
    baseShearN: null,
    rackingResponse: null,
    passFail: null,
  });
  assert.match(result.reason, /solver-input mapping only/i);
  assert.match(result.reason, /not a solver run/i);
});

test("solver node coordinate must match the explicit force-moment reference point", () => {
  const { snapshot, application, moment } = readyFixture();
  const result = mapSmallHouseStructuralLoadCase(
    snapshot,
    application,
    moment,
    adapterInput({ solverNodeGlobalM: { x: 0.1, y: 0.2, z: -1.99 } }),
  );

  assert.equal(result.state, "blocked_node_reference_mismatch");
  assert.equal(result.canMap, false);
  assert.equal(result.mappedNodalLoad, null);
  assert.equal(result.sourceForceVectorN, null);
  assert.match(result.reason, /will not attach a moment calculated about one point to a different solver node/i);
});

test("changing only explicit load-case and node identities changes adapter metadata but not analytical source values", () => {
  const { snapshot, application, moment } = readyFixture();
  const a = mapSmallHouseStructuralLoadCase(
    snapshot,
    application,
    moment,
    adapterInput(),
  );
  const b = mapSmallHouseStructuralLoadCase(
    snapshot,
    application,
    moment,
    adapterInput({ loadCaseId: "LC-WIND-QA-002", solverNodeId: "NODE-EXPLICIT-002" }),
  );

  assert.equal(a.state, "mapping_ready");
  assert.equal(b.state, "mapping_ready");
  assert.notEqual(a.loadCaseId, b.loadCaseId);
  assert.notEqual(a.solverNodeId, b.solverNodeId);
  assert.deepEqual(a.sourceForceVectorN, b.sourceForceVectorN);
  assert.deepEqual(a.sourceApplicationPointGlobalM, b.sourceApplicationPointGlobalM);
  assert.deepEqual(a.sourceForceMomentVectorNm, b.sourceForceMomentVectorNm);
  assert.deepEqual(a.mappedNodalLoad, b.mappedNodalLoad);
});

test("rendered geometry drift cannot select or move the explicit solver node", () => {
  const moved = structuredClone(SYNTHETIC_PHASE4_HOUSE);
  const wall = moved.components.find((component) => component.id === "synthetic-wall-north");
  assert.ok(wall);
  wall.geometry.center.x = 88;
  wall.geometry.center.y = -42;
  wall.geometry.center.z = 17;

  const base = readyFixture();
  const drifted = readyFixture(moved);
  const baseResult = mapSmallHouseStructuralLoadCase(
    base.snapshot,
    base.application,
    base.moment,
    adapterInput(),
  );
  const driftedResult = mapSmallHouseStructuralLoadCase(
    drifted.snapshot,
    drifted.application,
    drifted.moment,
    adapterInput(),
  );

  assert.equal(baseResult.state, "mapping_ready");
  assert.equal(driftedResult.state, "mapping_ready");
  assert.equal(driftedResult.solverNodeId, "NODE-WIND-NORTH-QA-001");
  assert.deepEqual(driftedResult.solverNodeGlobalM, { x: 0.1, y: 0.2, z: -2.0 });
  assert.deepEqual(driftedResult.mappedNodalLoad, baseResult.mappedNodalLoad);
});

test("stale analytical evidence from another staged snapshot is blocked", () => {
  const ready = readyFixture();
  const roofSnapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "roof");
  const result = mapSmallHouseStructuralLoadCase(
    roofSnapshot,
    ready.application,
    ready.moment,
    adapterInput(),
  );

  assert.equal(result.state, "blocked_source_snapshot_mismatch");
  assert.equal(result.canMap, false);
  assert.equal(result.mappedNodalLoad, null);
});

test("blocked force mapping or blocked moment evidence cannot be promoted into solver input", () => {
  const floorSnapshot = materializeSmallHouseWindStage(
    SYNTHETIC_PHASE4_HOUSE,
    "floor_ring_frame",
  );
  const blockedAction = calculateSmallHouseSurfaceWindAction(floorSnapshot, actionInput());
  const blockedApplication = mapSmallHouseSurfaceForceApplicationPoint(
    floorSnapshot,
    blockedAction,
    applicationInput(),
  );
  const blockedMoment = calculateSmallHouseSurfaceForceMoment(
    floorSnapshot,
    blockedApplication,
    momentInput(),
  );
  const result = mapSmallHouseStructuralLoadCase(
    floorSnapshot,
    blockedApplication,
    blockedMoment,
    adapterInput(),
  );

  assert.equal(blockedApplication.state, "blocked_source_action");
  assert.equal(blockedMoment.state, "blocked_source_mapping");
  assert.equal(result.state, "blocked_application_mapping");
  assert.equal(result.mappedNodalLoad, null);
});

test("surface identity must match both ready analytical source records", () => {
  const { snapshot, application, moment } = readyFixture();
  const result = mapSmallHouseStructuralLoadCase(
    snapshot,
    application,
    moment,
    adapterInput({ surfaceComponentId: "synthetic-wall-east" }),
  );

  assert.equal(result.state, "blocked_surface_mismatch");
  assert.equal(result.canMap, false);
});

test("load-case ID, node ID, node coordinates, basis, provenance, and verification are explicit validated inputs", () => {
  const { snapshot, application, moment } = readyFixture();

  assert.throws(
    () =>
      mapSmallHouseStructuralLoadCase(
        snapshot,
        application,
        moment,
        adapterInput({ loadCaseId: "" }),
      ),
    /loadCaseId must be non-empty/,
  );
  assert.throws(
    () =>
      mapSmallHouseStructuralLoadCase(
        snapshot,
        application,
        moment,
        adapterInput({ solverNodeId: "" }),
      ),
    /solverNodeId must be non-empty/,
  );

  for (const [axis, value] of [
    ["x", Number.NaN],
    ["y", Number.POSITIVE_INFINITY],
    ["z", Number.NEGATIVE_INFINITY],
  ] as const) {
    const input = adapterInput();
    input.solverNodeGlobalM[axis] = value;
    assert.throws(
      () => mapSmallHouseStructuralLoadCase(snapshot, application, moment, input),
      new RegExp(`solverNodeGlobalM\\.${axis} must be finite`),
    );
  }

  assert.throws(
    () =>
      mapSmallHouseStructuralLoadCase(
        snapshot,
        application,
        moment,
        adapterInput({ coordinateBasis: "local_scene_axes" as never }),
      ),
    /supported structural coordinate basis/,
  );
  assert.throws(
    () =>
      mapSmallHouseStructuralLoadCase(
        snapshot,
        application,
        moment,
        adapterInput({ sourceNote: "" }),
      ),
    /sourceNote must be non-empty/,
  );
  assert.throws(
    () =>
      mapSmallHouseStructuralLoadCase(
        snapshot,
        application,
        moment,
        adapterInput({ verificationState: "assumed_verified" as never }),
      ),
    /supported verification state/,
  );
});

test("adapter result copies node and load vectors rather than aliasing caller or source objects", () => {
  const { snapshot, application, moment } = readyFixture();
  const input = adapterInput();
  const result = mapSmallHouseStructuralLoadCase(snapshot, application, moment, input);

  assert.notEqual(result.solverNodeGlobalM, input.solverNodeGlobalM);
  assert.notEqual(result.sourceForceVectorN, application.sourceForceVectorN);
  assert.notEqual(result.sourceApplicationPointGlobalM, application.applicationPointGlobalM);
  assert.notEqual(result.sourceForceMomentVectorNm, moment.forceMomentVectorNm);
  assert.notEqual(result.mappedNodalLoad?.forceVectorN, result.sourceForceVectorN);
  assert.notEqual(result.mappedNodalLoad?.momentVectorNm, result.sourceForceMomentVectorNm);

  input.solverNodeGlobalM.x = 999;
  if (application.sourceForceVectorN) application.sourceForceVectorN.z = 999;
  if (moment.forceMomentVectorNm) moment.forceMomentVectorNm.x = 999;

  assert.deepEqual(result.solverNodeGlobalM, { x: 0.1, y: 0.2, z: -2.0 });
  near(result.mappedNodalLoad?.forceVectorN.z, -960);
  near(result.mappedNodalLoad?.momentVectorNm.x, -988.8);
});
