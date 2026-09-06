import test from "node:test";
import assert from "node:assert/strict";

import { SYNTHETIC_PHASE4_HOUSE } from "../src/data/smallHouseWind/syntheticPhase4House";
import { mapSmallHouseStructuralLoadCase } from "../src/lib/smallHouseWind/structuralLoadCaseAdapter";
import { assessSmallHouseStructuralModelReadiness } from "../src/lib/smallHouseWind/structuralModelReadiness";
import { mapSmallHouseSurfaceForceApplicationPoint } from "../src/lib/smallHouseWind/surfaceForceApplicationPoint";
import { calculateSmallHouseSurfaceForceMoment } from "../src/lib/smallHouseWind/surfaceForceMoment";
import { calculateSmallHouseSurfaceWindAction } from "../src/lib/smallHouseWind/surfaceWindAction";
import { materializeSmallHouseWindStage } from "../src/lib/smallHouseWind/systemContract";
import {
  SMALL_HOUSE_STRUCTURAL_LOAD_CASE_ADAPTER_SCHEMA_VERSION,
  type SmallHouseStructuralLoadCaseAdapterInput,
  type SmallHouseStructuralLoadCaseAdapterResult,
} from "../src/types/smallHouseStructuralLoadCaseAdapter";
import {
  SMALL_HOUSE_STRUCTURAL_MODEL_READINESS_SCHEMA_VERSION,
  type SmallHouseStructuralModelInput,
} from "../src/types/smallHouseStructuralModelReadiness";
import { SMALL_HOUSE_SURFACE_FORCE_APPLICATION_POINT_SCHEMA_VERSION } from "../src/types/smallHouseSurfaceForceApplicationPoint";
import { SMALL_HOUSE_SURFACE_FORCE_MOMENT_SCHEMA_VERSION } from "../src/types/smallHouseSurfaceForceMoment";
import { SMALL_HOUSE_SURFACE_WIND_ACTION_SCHEMA_VERSION } from "../src/types/smallHouseSurfaceWindAction";

function readyAdapter(): SmallHouseStructuralLoadCaseAdapterResult {
  const snapshot = materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, "walls");
  const action = calculateSmallHouseSurfaceWindAction(snapshot, {
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
  });
  const application = mapSmallHouseSurfaceForceApplicationPoint(snapshot, action, {
    schemaVersion: SMALL_HOUSE_SURFACE_FORCE_APPLICATION_POINT_SCHEMA_VERSION,
    surfaceComponentId: "synthetic-wall-north",
    applicationPointGlobalM: { x: 0.37, y: 1.23, z: -2.41 },
    sourceNote: "Synthetic caller-declared application point",
    verificationState: "unverified",
  });
  const moment = calculateSmallHouseSurfaceForceMoment(snapshot, application, {
    schemaVersion: SMALL_HOUSE_SURFACE_FORCE_MOMENT_SCHEMA_VERSION,
    surfaceComponentId: "synthetic-wall-north",
    referencePointGlobalM: { x: 0.1, y: 0.2, z: -2.0 },
    sourceNote: "Synthetic caller-declared moment reference",
    verificationState: "unverified",
  });
  const input: SmallHouseStructuralLoadCaseAdapterInput = {
    schemaVersion: SMALL_HOUSE_STRUCTURAL_LOAD_CASE_ADAPTER_SCHEMA_VERSION,
    surfaceComponentId: "synthetic-wall-north",
    loadCaseId: "LC-WIND-QA-001",
    solverNodeId: "NODE-WIND-NORTH-QA-001",
    solverNodeGlobalM: { x: 0.1, y: 0.2, z: -2.0 },
    coordinateBasis: "global_cartesian_xyz_m",
    sourceNote: "Synthetic solver-input mapping only",
    verificationState: "unverified",
  };
  return mapSmallHouseStructuralLoadCase(snapshot, application, moment, input);
}

function qaModel(): SmallHouseStructuralModelInput {
  return {
    schemaVersion: SMALL_HOUSE_STRUCTURAL_MODEL_READINESS_SCHEMA_VERSION,
    modelId: "MODEL-STATIC-QA-001",
    intendedSolver: "openseespy",
    analysisIntent: "linear_static_3d",
    coordinateBasis: "global_cartesian_xyz_m",
    unitSystem: "SI_N_m_Pa",
    nodes: [
      {
        id: "NODE-SUPPORT-QA-001",
        globalM: { x: 0.1, y: -2.8, z: -2.0 },
        restraints: {
          ux: "fixed",
          uy: "fixed",
          uz: "fixed",
          rx: "fixed",
          ry: "fixed",
          rz: "fixed",
        },
        sourceNote: "Synthetic fixed support node for software verification only",
        verificationState: "unverified",
      },
      {
        id: "NODE-WIND-NORTH-QA-001",
        globalM: { x: 0.1, y: 0.2, z: -2.0 },
        restraints: {
          ux: "free",
          uy: "free",
          uz: "free",
          rx: "free",
          ry: "free",
          rz: "free",
        },
        sourceNote: "Explicit mapped load node from accepted Phase 4 adapter evidence",
        verificationState: "unverified",
      },
    ],
    elements: [
      {
        id: "ELEM-QA-001",
        formulation: "elastic_beam_column_3d",
        nodeIId: "NODE-SUPPORT-QA-001",
        nodeJId: "NODE-WIND-NORTH-QA-001",
        localYDirectionGlobal: { x: 0, y: 0, z: 1 },
        properties: {
          materialId: "MAT-QA-ELASTIC-001",
          sectionId: "SEC-QA-001",
          areaM2: 0.01,
          elasticModulusPa: 10_000_000_000,
          shearModulusPa: 4_000_000_000,
          iyM4: 0.0001,
          izM4: 0.0001,
          torsionConstantM4: 0.00005,
          sourceNote: "Synthetic positive stiffness values for software verification only",
          verificationState: "unverified",
        },
        sourceNote: "Synthetic two-node elastic 3D member for readiness QA only",
        verificationState: "unverified",
      },
    ],
    loadCases: [
      {
        id: "LC-WIND-QA-001",
        sourceNote: "Explicit load-case identity required by accepted adapter evidence",
        verificationState: "unverified",
      },
    ],
    sourceNote: "Synthetic OpenSeesPy model-readiness fixture; not adopted Dignity geometry",
    verificationState: "unverified",
  };
}

test("explicit two-node model reaches solver_model_ready without creating solver response", () => {
  const adapter = readyAdapter();
  const model = qaModel();
  const result = assessSmallHouseStructuralModelReadiness(model, adapter);

  assert.equal(adapter.state, "mapping_ready");
  assert.equal(result.state, "solver_model_ready");
  assert.equal(result.canExecuteSolver, true);
  assert.equal(result.evidenceLayer, "solver_input_model_review");
  assert.equal(result.structuralResult, "N/A");
  assert.equal(result.solverExecuted, false);
  assert.equal(result.modelId, "MODEL-STATIC-QA-001");
  assert.equal(result.intendedSolver, "openseespy");
  assert.equal(result.analysisIntent, "linear_static_3d");
  assert.equal(result.nodes.length, 2);
  assert.equal(result.elements.length, 1);
  assert.equal(result.loadCases.length, 1);
  assert.deepEqual(result.acceptedMappedLoad, {
    loadCaseId: "LC-WIND-QA-001",
    solverNodeId: "NODE-WIND-NORTH-QA-001",
    solverNodeGlobalM: { x: 0.1, y: 0.2, z: -2.0 },
    forceVectorN: { x: 0, y: 0, z: -960 },
    momentVectorNm: { x: -988.8, y: 259.2, z: 0 },
  });
  assert.deepEqual(result.solverResponse, {
    reactions: null,
    displacementsM: null,
    rotationsRad: null,
    elementForces: null,
    baseShearN: null,
    connectionDemands: null,
    rackingResponse: null,
    capacityUtilization: null,
    passFail: null,
  });
  assert.match(result.reason, /solver-input readiness only/i);
  assert.match(result.reason, /no engineering solver has run/i);
});

test("all six node restraint DOFs must be explicit supported states", () => {
  const model = qaModel();
  model.nodes[0].restraints.rz = "locked" as never;
  assert.throws(
    () => assessSmallHouseStructuralModelReadiness(model, readyAdapter()),
    /restraints\.rz must be explicitly fixed or free/,
  );
});

test("duplicate node, element, and load-case IDs are rejected", () => {
  const duplicateNode = qaModel();
  duplicateNode.nodes.push(structuredClone(duplicateNode.nodes[0]));
  assert.throws(
    () => assessSmallHouseStructuralModelReadiness(duplicateNode, readyAdapter()),
    /Duplicate structural node ID/,
  );

  const duplicateElement = qaModel();
  duplicateElement.elements.push(structuredClone(duplicateElement.elements[0]));
  assert.throws(
    () => assessSmallHouseStructuralModelReadiness(duplicateElement, readyAdapter()),
    /Duplicate structural element ID/,
  );

  const duplicateLoadCase = qaModel();
  duplicateLoadCase.loadCases.push(structuredClone(duplicateLoadCase.loadCases[0]));
  assert.throws(
    () => assessSmallHouseStructuralModelReadiness(duplicateLoadCase, readyAdapter()),
    /Duplicate structural load-case ID/,
  );
});

test("missing endpoints and zero-length elements are rejected", () => {
  const missing = qaModel();
  missing.elements[0].nodeJId = "NODE-NOT-DECLARED";
  assert.throws(
    () => assessSmallHouseStructuralModelReadiness(missing, readyAdapter()),
    /references a missing endpoint node/,
  );

  const zero = qaModel();
  zero.nodes[1].globalM = structuredClone(zero.nodes[0].globalM);
  assert.throws(
    () => assessSmallHouseStructuralModelReadiness(zero, readyAdapter()),
    /zero or degenerate length/,
  );
});

test("element orientation is explicit, unit length, and perpendicular to the element axis", () => {
  const nonUnit = qaModel();
  nonUnit.elements[0].localYDirectionGlobal = { x: 0, y: 0, z: 2 };
  assert.throws(
    () => assessSmallHouseStructuralModelReadiness(nonUnit, readyAdapter()),
    /must be an explicit unit vector/,
  );

  const parallel = qaModel();
  parallel.elements[0].localYDirectionGlobal = { x: 0, y: 1, z: 0 };
  assert.throws(
    () => assessSmallHouseStructuralModelReadiness(parallel, readyAdapter()),
    /must be perpendicular to the element axis/,
  );
});

test("all mechanics-driving elastic element properties must be positive finite explicit inputs", () => {
  for (const key of [
    "areaM2",
    "elasticModulusPa",
    "shearModulusPa",
    "iyM4",
    "izM4",
    "torsionConstantM4",
  ] as const) {
    const model = qaModel();
    model.elements[0].properties[key] = key === "areaM2" ? Number.NaN : 0;
    assert.throws(
      () => assessSmallHouseStructuralModelReadiness(model, readyAdapter()),
      new RegExp(`properties\\.${key} must be finite and greater than zero`),
    );
  }
});

test("accepted adapter node and load-case identities must exist exactly in the model", () => {
  const missingNode = qaModel();
  missingNode.nodes[1].id = "NODE-OTHER-001";
  missingNode.elements[0].nodeJId = "NODE-OTHER-001";
  const nodeResult = assessSmallHouseStructuralModelReadiness(missingNode, readyAdapter());
  assert.equal(nodeResult.state, "blocked_adapter_node_missing");
  assert.equal(nodeResult.canExecuteSolver, false);
  assert.equal(nodeResult.acceptedMappedLoad, null);

  const missingCase = qaModel();
  missingCase.loadCases[0].id = "LC-OTHER-001";
  const caseResult = assessSmallHouseStructuralModelReadiness(missingCase, readyAdapter());
  assert.equal(caseResult.state, "blocked_adapter_load_case_missing");
  assert.equal(caseResult.canExecuteSolver, false);
  assert.equal(caseResult.acceptedMappedLoad, null);
});

test("model node coordinate must match accepted mapped solver-node coordinate; nearest-node transfer is prohibited", () => {
  const model = qaModel();
  model.nodes[1].globalM.x += 0.001;
  const result = assessSmallHouseStructuralModelReadiness(model, readyAdapter());

  assert.equal(result.state, "blocked_adapter_node_coordinate_mismatch");
  assert.equal(result.canExecuteSolver, false);
  assert.equal(result.acceptedMappedLoad, null);
  assert.match(result.reason, /will not silently transfer nodal force\/moment evidence/i);
});

test("blocked adapter evidence cannot be promoted into solver model readiness", () => {
  const adapter = structuredClone(readyAdapter());
  adapter.state = "blocked_node_reference_mismatch";
  adapter.canMap = false;
  adapter.mappedNodalLoad = null;
  const result = assessSmallHouseStructuralModelReadiness(qaModel(), adapter);

  assert.equal(result.state, "blocked_adapter_evidence");
  assert.equal(result.canExecuteSolver, false);
  assert.equal(result.solverExecuted, false);
});

test("readiness result deep-copies model and mapped load inputs", () => {
  const model = qaModel();
  const adapter = readyAdapter();
  const result = assessSmallHouseStructuralModelReadiness(model, adapter);

  assert.notEqual(result.nodes, model.nodes);
  assert.notEqual(result.nodes[0].globalM, model.nodes[0].globalM);
  assert.notEqual(result.nodes[0].restraints, model.nodes[0].restraints);
  assert.notEqual(result.elements, model.elements);
  assert.notEqual(result.elements[0].properties, model.elements[0].properties);
  assert.notEqual(result.acceptedMappedLoad?.forceVectorN, adapter.mappedNodalLoad?.forceVectorN);

  model.nodes[0].globalM.x = 999;
  model.elements[0].properties.areaM2 = 999;
  if (adapter.mappedNodalLoad) adapter.mappedNodalLoad.forceVectorN.z = 999;

  assert.deepEqual(result.nodes[0].globalM, { x: 0.1, y: -2.8, z: -2.0 });
  assert.equal(result.elements[0].properties.areaM2, 0.01);
  assert.deepEqual(result.acceptedMappedLoad?.forceVectorN, { x: 0, y: 0, z: -960 });
});
