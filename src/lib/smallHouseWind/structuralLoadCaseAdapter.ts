import type { GenesisVector3, GenesisVerificationState } from "../../types/genesis";
import type { SmallHouseSurfaceForceApplicationPointResult } from "../../types/smallHouseSurfaceForceApplicationPoint";
import type { SmallHouseSurfaceForceMomentResult } from "../../types/smallHouseSurfaceForceMoment";
import {
  SMALL_HOUSE_STRUCTURAL_LOAD_CASE_ADAPTER_SCHEMA_VERSION,
  type SmallHouseStructuralCoordinateBasis,
  type SmallHouseStructuralLoadCaseAdapterInput,
  type SmallHouseStructuralLoadCaseAdapterResult,
} from "../../types/smallHouseStructuralLoadCaseAdapter";
import {
  SMALL_HOUSE_WIND_SCHEMA_VERSION,
  type SmallHouseWindStageSnapshot,
} from "../../types/smallHouseWind";

const VERIFICATION_STATES = new Set<GenesisVerificationState>([
  "verified",
  "provisional",
  "unverified",
]);
const COORDINATE_BASES = new Set<SmallHouseStructuralCoordinateBasis>([
  "global_cartesian_xyz_m",
]);
const NODE_REFERENCE_TOLERANCE_M = 1e-9;

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

function validateCoordinateBasis(value: SmallHouseStructuralCoordinateBasis): void {
  if (!COORDINATE_BASES.has(value)) {
    throw new Error("input.coordinateBasis must be a supported structural coordinate basis");
  }
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

function samePoint(a: GenesisVector3, b: GenesisVector3): boolean {
  return (
    Math.abs(a.x - b.x) <= NODE_REFERENCE_TOLERANCE_M &&
    Math.abs(a.y - b.y) <= NODE_REFERENCE_TOLERANCE_M &&
    Math.abs(a.z - b.z) <= NODE_REFERENCE_TOLERANCE_M
  );
}

function solverResponse() {
  return {
    reactionsN: null,
    displacementsM: null,
    rotationsRad: null,
    memberForces: null,
    connectionDemands: null,
    baseShearN: null,
    rackingResponse: null,
    passFail: null,
  } as const;
}

function blockedResult(
  snapshot: SmallHouseWindStageSnapshot,
  input: SmallHouseStructuralLoadCaseAdapterInput,
  state: Exclude<SmallHouseStructuralLoadCaseAdapterResult["state"], "mapping_ready">,
  reason: string,
): SmallHouseStructuralLoadCaseAdapterResult {
  return {
    schemaVersion: SMALL_HOUSE_STRUCTURAL_LOAD_CASE_ADAPTER_SCHEMA_VERSION,
    evidenceLayer: "solver_input_mapping",
    stage: snapshot.stage,
    state,
    canMap: false,
    structuralResult: "N/A",
    reason,
    surfaceComponentId: input.surfaceComponentId || null,
    loadCaseId: input.loadCaseId || null,
    solverNodeId: input.solverNodeId || null,
    solverNodeGlobalM: null,
    coordinateBasis: null,
    sourceForceVectorN: null,
    sourceApplicationPointGlobalM: null,
    sourceForceMomentVectorNm: null,
    sourceMomentReferencePointGlobalM: null,
    mappedNodalLoad: null,
    solverResponse: solverResponse(),
    provenance: {
      sourceNote: input.sourceNote,
      verificationState: input.verificationState,
    },
  };
}

export function mapSmallHouseStructuralLoadCase(
  snapshot: SmallHouseWindStageSnapshot,
  applicationMapping: SmallHouseSurfaceForceApplicationPointResult,
  forceMoment: SmallHouseSurfaceForceMomentResult,
  input: SmallHouseStructuralLoadCaseAdapterInput,
): SmallHouseStructuralLoadCaseAdapterResult {
  if (snapshot.schemaVersion !== SMALL_HOUSE_WIND_SCHEMA_VERSION) {
    throw new Error(`Unsupported small-house wind schema version: ${String(snapshot.schemaVersion)}`);
  }
  if (input.schemaVersion !== SMALL_HOUSE_STRUCTURAL_LOAD_CASE_ADAPTER_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported structural load-case adapter schema version: ${String(input.schemaVersion)}`,
    );
  }

  const requestedSurfaceId = requireText("input.surfaceComponentId", input.surfaceComponentId);
  const loadCaseId = requireText("input.loadCaseId", input.loadCaseId);
  const solverNodeId = requireText("input.solverNodeId", input.solverNodeId);
  requireText("input.sourceNote", input.sourceNote);
  validateVerificationState("input.verificationState", input.verificationState);
  validateCoordinateBasis(input.coordinateBasis);
  const solverNodeGlobalM = finitePoint("input.solverNodeGlobalM", input.solverNodeGlobalM);

  if (
    applicationMapping.state !== "mapping_ready" ||
    !applicationMapping.canMap ||
    !applicationMapping.surfaceComponentId ||
    !applicationMapping.sourceForceVectorN ||
    !applicationMapping.applicationPointGlobalM
  ) {
    return blockedResult(
      snapshot,
      input,
      "blocked_application_mapping",
      "Structural load-case mapping requires an already-ready explicit surface force application-point mapping. A blocked analytical mapping cannot be promoted into solver input metadata.",
    );
  }

  if (
    forceMoment.state !== "analytical_ready" ||
    !forceMoment.canCalculate ||
    !forceMoment.surfaceComponentId ||
    !forceMoment.sourceForceVectorN ||
    !forceMoment.applicationPointGlobalM ||
    !forceMoment.referencePointGlobalM ||
    !forceMoment.forceMomentVectorNm
  ) {
    return blockedResult(
      snapshot,
      input,
      "blocked_moment_result",
      "Structural load-case mapping requires the ready ordinary-statics force moment about an explicit reference point. Missing moment evidence cannot be replaced by a node identity.",
    );
  }

  if (applicationMapping.stage !== snapshot.stage || forceMoment.stage !== snapshot.stage) {
    return blockedResult(
      snapshot,
      input,
      "blocked_source_snapshot_mismatch",
      "The analytical force/location/moment evidence belongs to a different staged snapshot. Stale evidence cannot be mapped into the current solver-input load case.",
    );
  }

  if (
    applicationMapping.surfaceComponentId !== requestedSurfaceId ||
    forceMoment.surfaceComponentId !== requestedSurfaceId
  ) {
    return blockedResult(
      snapshot,
      input,
      "blocked_surface_mismatch",
      "The caller-declared adapter surface ID must exactly match both the ready force application mapping and ready force-moment evidence.",
    );
  }

  const activeSurface = snapshot.components.find(
    (component) => component.id === requestedSurfaceId,
  );
  if (!activeSurface) {
    return blockedResult(
      snapshot,
      input,
      "blocked_application_mapping",
      "The mapped surface is not active in the current staged snapshot. No structural input mapping is retained for stale geometry.",
    );
  }

  if (!samePoint(forceMoment.referencePointGlobalM, solverNodeGlobalM)) {
    return blockedResult(
      snapshot,
      input,
      "blocked_node_reference_mismatch",
      "The explicit solver-node coordinate must coincide with the explicit reference point used to calculate the source force moment. RPE will not attach a moment calculated about one point to a different solver node or silently transfer the load.",
    );
  }

  const sourceForceVectorN = copyVector(applicationMapping.sourceForceVectorN);
  const sourceApplicationPointGlobalM = copyVector(
    applicationMapping.applicationPointGlobalM,
  );
  const sourceForceMomentVectorNm = copyVector(forceMoment.forceMomentVectorNm);
  const sourceMomentReferencePointGlobalM = copyVector(
    forceMoment.referencePointGlobalM,
  );

  return {
    schemaVersion: SMALL_HOUSE_STRUCTURAL_LOAD_CASE_ADAPTER_SCHEMA_VERSION,
    evidenceLayer: "solver_input_mapping",
    stage: snapshot.stage,
    state: "mapping_ready",
    canMap: true,
    structuralResult: "N/A",
    reason:
      "This record is solver-input mapping only. It preserves one accepted analytical force and its ordinary r×F moment about the explicitly declared solver-node coordinate under one caller-declared load-case/node identity. It is not a solver run and creates no reaction, displacement, member force, connection demand, racking response, base shear, or adequacy verdict.",
    surfaceComponentId: requestedSurfaceId,
    loadCaseId,
    solverNodeId,
    solverNodeGlobalM: copyVector(solverNodeGlobalM),
    coordinateBasis: input.coordinateBasis,
    sourceForceVectorN,
    sourceApplicationPointGlobalM,
    sourceForceMomentVectorNm,
    sourceMomentReferencePointGlobalM,
    mappedNodalLoad: {
      forceVectorN: copyVector(sourceForceVectorN),
      momentVectorNm: copyVector(sourceForceMomentVectorNm),
    },
    solverResponse: solverResponse(),
    provenance: {
      sourceNote: input.sourceNote,
      verificationState: input.verificationState,
    },
  };
}
