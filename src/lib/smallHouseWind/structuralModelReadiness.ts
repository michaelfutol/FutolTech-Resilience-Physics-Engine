import type { GenesisVector3, GenesisVerificationState } from "../../types/genesis";
import type { SmallHouseStructuralLoadCaseAdapterResult } from "../../types/smallHouseStructuralLoadCaseAdapter";
import {
  SMALL_HOUSE_STRUCTURAL_MODEL_READINESS_SCHEMA_VERSION,
  type SmallHouseStructuralAnalysisIntent,
  type SmallHouseStructuralDofState,
  type SmallHouseStructuralElementInput,
  type SmallHouseStructuralLoadCaseInput,
  type SmallHouseStructuralModelInput,
  type SmallHouseStructuralModelReadinessResult,
  type SmallHouseStructuralNodeInput,
  type SmallHouseStructuralSolverTarget,
  type SmallHouseStructuralUnitSystem,
} from "../../types/smallHouseStructuralModelReadiness";

const VERIFICATION_STATES = new Set<GenesisVerificationState>([
  "verified",
  "provisional",
  "unverified",
]);
const DOF_STATES = new Set<SmallHouseStructuralDofState>(["fixed", "free"]);
const SOLVER_TARGETS = new Set<SmallHouseStructuralSolverTarget>(["openseespy"]);
const ANALYSIS_INTENTS = new Set<SmallHouseStructuralAnalysisIntent>(["linear_static_3d"]);
const UNIT_SYSTEMS = new Set<SmallHouseStructuralUnitSystem>(["SI_N_m_Pa"]);
const COORDINATE_TOLERANCE_M = 1e-9;
const VECTOR_TOLERANCE = 1e-9;
const LENGTH_TOLERANCE_M = 1e-12;

function requireText(name: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${name} must be non-empty`);
  return trimmed;
}

function validateVerificationState(name: string, value: GenesisVerificationState): void {
  if (!VERIFICATION_STATES.has(value)) {
    throw new Error(`${name} must be a supported verification state`);
  }
}

function finitePositive(name: string, value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be finite and greater than zero`);
  }
  return value;
}

function finitePoint(name: string, value: GenesisVector3): GenesisVector3 {
  for (const [axis, component] of Object.entries(value) as Array<
    [keyof GenesisVector3, number]
  >) {
    if (!Number.isFinite(component)) {
      throw new Error(`${name}.${axis} must be finite`);
    }
  }
  return { x: value.x, y: value.y, z: value.z };
}

function copyVector(value: GenesisVector3): GenesisVector3 {
  return { x: value.x, y: value.y, z: value.z };
}

function vectorSubtract(a: GenesisVector3, b: GenesisVector3): GenesisVector3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function magnitude(value: GenesisVector3): number {
  return Math.hypot(value.x, value.y, value.z);
}

function dot(a: GenesisVector3, b: GenesisVector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function samePoint(a: GenesisVector3, b: GenesisVector3): boolean {
  return (
    Math.abs(a.x - b.x) <= COORDINATE_TOLERANCE_M &&
    Math.abs(a.y - b.y) <= COORDINATE_TOLERANCE_M &&
    Math.abs(a.z - b.z) <= COORDINATE_TOLERANCE_M
  );
}

function copyNode(node: SmallHouseStructuralNodeInput): SmallHouseStructuralNodeInput {
  return {
    ...node,
    globalM: copyVector(node.globalM),
    restraints: { ...node.restraints },
  };
}

function copyElement(element: SmallHouseStructuralElementInput): SmallHouseStructuralElementInput {
  return {
    ...element,
    localYDirectionGlobal: copyVector(element.localYDirectionGlobal),
    properties: { ...element.properties },
  };
}

function copyLoadCase(loadCase: SmallHouseStructuralLoadCaseInput): SmallHouseStructuralLoadCaseInput {
  return { ...loadCase };
}

function solverResponse() {
  return {
    reactions: null,
    displacementsM: null,
    rotationsRad: null,
    elementForces: null,
    baseShearN: null,
    connectionDemands: null,
    rackingResponse: null,
    capacityUtilization: null,
    passFail: null,
  } as const;
}

function validateModel(model: SmallHouseStructuralModelInput): void {
  if (model.schemaVersion !== SMALL_HOUSE_STRUCTURAL_MODEL_READINESS_SCHEMA_VERSION) {
    throw new Error(`Unsupported structural model readiness schema version: ${String(model.schemaVersion)}`);
  }

  requireText("model.modelId", model.modelId);
  requireText("model.sourceNote", model.sourceNote);
  validateVerificationState("model.verificationState", model.verificationState);

  if (!SOLVER_TARGETS.has(model.intendedSolver)) {
    throw new Error("model.intendedSolver must be a supported solver target");
  }
  if (!ANALYSIS_INTENTS.has(model.analysisIntent)) {
    throw new Error("model.analysisIntent must be a supported analysis intent");
  }
  if (model.coordinateBasis !== "global_cartesian_xyz_m") {
    throw new Error("model.coordinateBasis must be global_cartesian_xyz_m");
  }
  if (!UNIT_SYSTEMS.has(model.unitSystem)) {
    throw new Error("model.unitSystem must be a supported explicit unit system");
  }
  if (model.nodes.length < 2) {
    throw new Error("model.nodes must contain at least two explicit nodes");
  }
  if (model.elements.length < 1) {
    throw new Error("model.elements must contain at least one explicit element");
  }
  if (model.loadCases.length < 1) {
    throw new Error("model.loadCases must contain at least one explicit load case");
  }

  const nodeIds = new Set<string>();
  const nodesById = new Map<string, SmallHouseStructuralNodeInput>();
  for (const [index, node] of model.nodes.entries()) {
    const id = requireText(`model.nodes[${index}].id`, node.id);
    if (nodeIds.has(id)) throw new Error(`Duplicate structural node ID: ${id}`);
    nodeIds.add(id);
    finitePoint(`model.nodes[${index}].globalM`, node.globalM);
    requireText(`model.nodes[${index}].sourceNote`, node.sourceNote);
    validateVerificationState(`model.nodes[${index}].verificationState`, node.verificationState);
    for (const dof of ["ux", "uy", "uz", "rx", "ry", "rz"] as const) {
      if (!DOF_STATES.has(node.restraints[dof])) {
        throw new Error(`model.nodes[${index}].restraints.${dof} must be explicitly fixed or free`);
      }
    }
    nodesById.set(id, node);
  }

  const elementIds = new Set<string>();
  for (const [index, element] of model.elements.entries()) {
    const id = requireText(`model.elements[${index}].id`, element.id);
    if (elementIds.has(id)) throw new Error(`Duplicate structural element ID: ${id}`);
    elementIds.add(id);
    if (element.formulation !== "elastic_beam_column_3d") {
      throw new Error(`model.elements[${index}].formulation must be elastic_beam_column_3d`);
    }
    const nodeIId = requireText(`model.elements[${index}].nodeIId`, element.nodeIId);
    const nodeJId = requireText(`model.elements[${index}].nodeJId`, element.nodeJId);
    if (nodeIId === nodeJId) {
      throw new Error(`model.elements[${index}] must connect two distinct node IDs`);
    }
    const nodeI = nodesById.get(nodeIId);
    const nodeJ = nodesById.get(nodeJId);
    if (!nodeI || !nodeJ) {
      throw new Error(`model.elements[${index}] references a missing endpoint node`);
    }

    const axis = vectorSubtract(nodeJ.globalM, nodeI.globalM);
    const axisLength = magnitude(axis);
    if (!Number.isFinite(axisLength) || axisLength <= LENGTH_TOLERANCE_M) {
      throw new Error(`model.elements[${index}] has zero or degenerate length`);
    }

    const localY = finitePoint(
      `model.elements[${index}].localYDirectionGlobal`,
      element.localYDirectionGlobal,
    );
    const localYMagnitude = magnitude(localY);
    if (Math.abs(localYMagnitude - 1) > VECTOR_TOLERANCE) {
      throw new Error(`model.elements[${index}].localYDirectionGlobal must be an explicit unit vector`);
    }
    const axisUnit = {
      x: axis.x / axisLength,
      y: axis.y / axisLength,
      z: axis.z / axisLength,
    };
    if (Math.abs(dot(axisUnit, localY)) > VECTOR_TOLERANCE) {
      throw new Error(`model.elements[${index}].localYDirectionGlobal must be perpendicular to the element axis`);
    }

    requireText(`model.elements[${index}].sourceNote`, element.sourceNote);
    validateVerificationState(
      `model.elements[${index}].verificationState`,
      element.verificationState,
    );

    const props = element.properties;
    requireText(`model.elements[${index}].properties.materialId`, props.materialId);
    requireText(`model.elements[${index}].properties.sectionId`, props.sectionId);
    finitePositive(`model.elements[${index}].properties.areaM2`, props.areaM2);
    finitePositive(`model.elements[${index}].properties.elasticModulusPa`, props.elasticModulusPa);
    finitePositive(`model.elements[${index}].properties.shearModulusPa`, props.shearModulusPa);
    finitePositive(`model.elements[${index}].properties.iyM4`, props.iyM4);
    finitePositive(`model.elements[${index}].properties.izM4`, props.izM4);
    finitePositive(`model.elements[${index}].properties.torsionConstantM4`, props.torsionConstantM4);
    requireText(`model.elements[${index}].properties.sourceNote`, props.sourceNote);
    validateVerificationState(
      `model.elements[${index}].properties.verificationState`,
      props.verificationState,
    );
  }

  const loadCaseIds = new Set<string>();
  for (const [index, loadCase] of model.loadCases.entries()) {
    const id = requireText(`model.loadCases[${index}].id`, loadCase.id);
    if (loadCaseIds.has(id)) throw new Error(`Duplicate structural load-case ID: ${id}`);
    loadCaseIds.add(id);
    requireText(`model.loadCases[${index}].sourceNote`, loadCase.sourceNote);
    validateVerificationState(
      `model.loadCases[${index}].verificationState`,
      loadCase.verificationState,
    );
  }
}

function blockedResult(
  model: SmallHouseStructuralModelInput,
  state: Exclude<SmallHouseStructuralModelReadinessResult["state"], "solver_model_ready">,
  reason: string,
): SmallHouseStructuralModelReadinessResult {
  return {
    schemaVersion: SMALL_HOUSE_STRUCTURAL_MODEL_READINESS_SCHEMA_VERSION,
    evidenceLayer: "solver_input_model_review",
    state,
    canExecuteSolver: false,
    structuralResult: "N/A",
    solverExecuted: false,
    reason,
    modelId: model.modelId || null,
    intendedSolver: model.intendedSolver || null,
    analysisIntent: model.analysisIntent || null,
    coordinateBasis: model.coordinateBasis === "global_cartesian_xyz_m" ? model.coordinateBasis : null,
    unitSystem: model.unitSystem || null,
    nodes: [],
    elements: [],
    loadCases: [],
    acceptedMappedLoad: null,
    sourceAdapterEvidence: null,
    solverResponse: solverResponse(),
    provenance: {
      sourceNote: model.sourceNote,
      verificationState: model.verificationState,
    },
  };
}

export function assessSmallHouseStructuralModelReadiness(
  model: SmallHouseStructuralModelInput,
  adapter: SmallHouseStructuralLoadCaseAdapterResult,
): SmallHouseStructuralModelReadinessResult {
  validateModel(model);

  if (
    adapter.state !== "mapping_ready" ||
    !adapter.canMap ||
    adapter.evidenceLayer !== "solver_input_mapping" ||
    !adapter.loadCaseId ||
    !adapter.solverNodeId ||
    !adapter.solverNodeGlobalM ||
    !adapter.mappedNodalLoad
  ) {
    return blockedResult(
      model,
      "blocked_adapter_evidence",
      "Structural model readiness requires an already-ready explicit solver-input load-case/node mapping. Blocked or stale adapter evidence cannot be promoted into a solver model.",
    );
  }

  const solverNode = model.nodes.find((node) => node.id === adapter.solverNodeId);
  if (!solverNode) {
    return blockedResult(
      model,
      "blocked_adapter_node_missing",
      "The explicit solver node named by the accepted load mapping does not exist in the structural model. RPE will not select a nearest node or infer one from scene geometry.",
    );
  }

  if (!model.loadCases.some((loadCase) => loadCase.id === adapter.loadCaseId)) {
    return blockedResult(
      model,
      "blocked_adapter_load_case_missing",
      "The explicit load-case identity named by the accepted load mapping does not exist in the structural model. RPE will not create a load case implicitly.",
    );
  }

  if (!samePoint(solverNode.globalM, adapter.solverNodeGlobalM)) {
    return blockedResult(
      model,
      "blocked_adapter_node_coordinate_mismatch",
      "The structural model node coordinate must exactly match the already-accepted explicit solver-node coordinate. RPE will not silently transfer nodal force/moment evidence between coordinates.",
    );
  }

  const acceptedMappedLoad = {
    loadCaseId: adapter.loadCaseId,
    solverNodeId: adapter.solverNodeId,
    solverNodeGlobalM: copyVector(adapter.solverNodeGlobalM),
    forceVectorN: copyVector(adapter.mappedNodalLoad.forceVectorN),
    momentVectorNm: copyVector(adapter.mappedNodalLoad.momentVectorNm),
  };

  return {
    schemaVersion: SMALL_HOUSE_STRUCTURAL_MODEL_READINESS_SCHEMA_VERSION,
    evidenceLayer: "solver_input_model_review",
    state: "solver_model_ready",
    canExecuteSolver: true,
    structuralResult: "N/A",
    solverExecuted: false,
    reason:
      "The synthetic structural model is explicit enough for a future OpenSeesPy translation/execution gate: node coordinates and all six restraint DOFs are declared, element connectivity/orientation/stiffness properties are explicit, units and coordinate basis are fixed, and the accepted mapped nodal load matches an existing node/load case. This is solver-input readiness only; no engineering solver has run and no structural response or adequacy exists yet.",
    modelId: model.modelId,
    intendedSolver: model.intendedSolver,
    analysisIntent: model.analysisIntent,
    coordinateBasis: model.coordinateBasis,
    unitSystem: model.unitSystem,
    nodes: model.nodes.map(copyNode),
    elements: model.elements.map(copyElement),
    loadCases: model.loadCases.map(copyLoadCase),
    acceptedMappedLoad,
    sourceAdapterEvidence: {
      schemaVersion: adapter.schemaVersion,
      evidenceLayer: adapter.evidenceLayer,
      surfaceComponentId: adapter.surfaceComponentId,
      loadCaseId: adapter.loadCaseId,
      solverNodeId: adapter.solverNodeId,
    },
    solverResponse: solverResponse(),
    provenance: {
      sourceNote: model.sourceNote,
      verificationState: model.verificationState,
    },
  };
}
