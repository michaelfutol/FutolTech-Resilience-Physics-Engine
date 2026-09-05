from pathlib import Path


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected exactly one anchor, found {count}: {old[:200]!r}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


component = Path("src/components/SmallHouseSurfaceWindActionPanel.tsx")

replace_once(
    component,
    'import { calculateSmallHouseMultiSurfaceWindLoadSet } from "@/lib/smallHouseWind/multiSurfaceWindLoadSet";\n',
    'import { calculateSmallHouseMultiSurfaceWindLoadSet } from "@/lib/smallHouseWind/multiSurfaceWindLoadSet";\nimport { mapSmallHouseStructuralLoadCase } from "@/lib/smallHouseWind/structuralLoadCaseAdapter";\n',
)

replace_once(
    component,
    'import {\n  SMALL_HOUSE_MULTI_SURFACE_WIND_LOAD_SET_SCHEMA_VERSION,\n  type SmallHouseMultiSurfaceWindLoadSetInput,\n} from "@/types/smallHouseMultiSurfaceWindLoadSet";\n',
    'import {\n  SMALL_HOUSE_MULTI_SURFACE_WIND_LOAD_SET_SCHEMA_VERSION,\n  type SmallHouseMultiSurfaceWindLoadSetInput,\n} from "@/types/smallHouseMultiSurfaceWindLoadSet";\nimport {\n  SMALL_HOUSE_STRUCTURAL_LOAD_CASE_ADAPTER_SCHEMA_VERSION,\n  type SmallHouseStructuralLoadCaseAdapterInput,\n} from "@/types/smallHouseStructuralLoadCaseAdapter";\n',
)

replace_once(
    component,
    'const QA_FORCE_MOMENT_INPUT: SmallHouseSurfaceForceMomentInput = {\n  schemaVersion: SMALL_HOUSE_SURFACE_FORCE_MOMENT_SCHEMA_VERSION,\n  surfaceComponentId: "synthetic-wall-north",\n  // Explicit non-origin reference proves RPE does not silently assume global zero.\n  referencePointGlobalM: { x: 0.1, y: 0.2, z: -2.0 },\n  sourceNote: "Synthetic caller-declared global moment reference point only",\n  verificationState: "unverified",\n};\n',
    'const QA_FORCE_MOMENT_INPUT: SmallHouseSurfaceForceMomentInput = {\n  schemaVersion: SMALL_HOUSE_SURFACE_FORCE_MOMENT_SCHEMA_VERSION,\n  surfaceComponentId: "synthetic-wall-north",\n  // Explicit non-origin reference proves RPE does not silently assume global zero.\n  referencePointGlobalM: { x: 0.1, y: 0.2, z: -2.0 },\n  sourceNote: "Synthetic caller-declared global moment reference point only",\n  verificationState: "unverified",\n};\n\nconst QA_STRUCTURAL_ADAPTER_INPUT: SmallHouseStructuralLoadCaseAdapterInput = {\n  schemaVersion: SMALL_HOUSE_STRUCTURAL_LOAD_CASE_ADAPTER_SCHEMA_VERSION,\n  surfaceComponentId: "synthetic-wall-north",\n  loadCaseId: "LC-WIND-QA-001",\n  solverNodeId: "NODE-WIND-NORTH-QA-001",\n  // Must coincide with the explicit force-moment reference point.\n  solverNodeGlobalM: { x: 0.1, y: 0.2, z: -2.0 },\n  coordinateBasis: "global_cartesian_xyz_m",\n  sourceNote: "Synthetic structural solver-input mapping only; no solver execution",\n  verificationState: "unverified",\n};\n',
)

replace_once(
    component,
    '  const forceMomentResult = useMemo(\n    () => calculateSmallHouseSurfaceForceMoment(snapshot, applicationPointResult, QA_FORCE_MOMENT_INPUT),\n    [snapshot, applicationPointResult],\n  );\n',
    '  const forceMomentResult = useMemo(\n    () => calculateSmallHouseSurfaceForceMoment(snapshot, applicationPointResult, QA_FORCE_MOMENT_INPUT),\n    [snapshot, applicationPointResult],\n  );\n  const structuralAdapterResult = useMemo(\n    () => mapSmallHouseStructuralLoadCase(\n      snapshot,\n      applicationPointResult,\n      forceMomentResult,\n      QA_STRUCTURAL_ADAPTER_INPUT,\n    ),\n    [snapshot, applicationPointResult, forceMomentResult],\n  );\n',
)

replace_once(
    component,
    '        <div className="mt-2 text-slate-500">{forceMomentResult.reason}</div>\n      </div>\n    </div>\n  );\n}\n',
    '        <div className="mt-2 text-slate-500">{forceMomentResult.reason}</div>\n      </div>\n\n      <div className="mt-4 font-semibold text-emerald-200">Explicit structural load-case / solver-node mapping</div>\n      <div className="mt-1 rounded border border-emerald-900/70 bg-emerald-950/30 px-2 py-1 text-[10px] font-semibold tracking-wide text-emerald-200">\n        SOLVER_INPUT_MAPPING · EXPLICIT NODE/LOAD CASE ONLY · NO SOLVER RESPONSE\n      </div>\n      <p className="mt-2 text-[10px] text-slate-500">\n        This gate translates already-accepted analytical force and ordinary r×F moment evidence into one explicit solver-input nodal-load record. The solver node and load case are caller declared. Node proximity, rendered geometry, and nearest-node selection are prohibited.\n      </p>\n\n      <div className="mt-3 rounded border border-emerald-950 bg-slate-900/60 p-2 text-[10px] text-slate-300">\n        <div>Structural load-case mapping state: <strong>{structuralAdapterResult.state}</strong></div>\n        <div>Evidence layer: <strong>{structuralAdapterResult.evidenceLayer}</strong></div>\n        <div>Structural result: <strong>{structuralAdapterResult.structuralResult}</strong></div>\n\n        {structuralAdapterResult.state === "mapping_ready" ? (\n          <>\n            <div className="mt-3 font-semibold text-slate-200">Explicit solver-input identity</div>\n            <div>Adapter surface ID: <strong>{structuralAdapterResult.surfaceComponentId}</strong></div>\n            <div>Load-case ID: <strong>{structuralAdapterResult.loadCaseId}</strong></div>\n            <div>Solver-node ID: <strong>{structuralAdapterResult.solverNodeId}</strong></div>\n            <div>Solver-node global point: <strong>{vector(structuralAdapterResult.solverNodeGlobalM)} m</strong></div>\n            <div>Coordinate basis: <strong>{structuralAdapterResult.coordinateBasis}</strong></div>\n            <div>Source application point: <strong>{vector(structuralAdapterResult.sourceApplicationPointGlobalM)} m</strong></div>\n            <div>Source moment reference point: <strong>{vector(structuralAdapterResult.sourceMomentReferencePointGlobalM)} m</strong></div>\n            <div>NODE COORDINATE = MOMENT REFERENCE POINT: <strong>YES</strong></div>\n            <div>NEAREST NODE INFERENCE: <strong>NONE — PROHIBITED</strong></div>\n\n            <div className="mt-3 font-semibold text-slate-200">Mapped nodal load input</div>\n            <div>Mapped nodal force: <strong>{vector(structuralAdapterResult.mappedNodalLoad?.forceVectorN ?? null)} N</strong></div>\n            <div>Mapped nodal moment: <strong>{vector(structuralAdapterResult.mappedNodalLoad?.momentVectorNm ?? null)} N·m</strong></div>\n\n            <div className="mt-3 font-semibold text-slate-200">Solver response deliberately unavailable</div>\n            <div>SOLVER EXECUTED: <strong>NO</strong></div>\n            <div>REACTIONS: <strong>N/A</strong></div>\n            <div>DISPLACEMENTS: <strong>N/A</strong></div>\n            <div>ROTATIONS: <strong>N/A</strong></div>\n            <div>MEMBER FORCES: <strong>N/A</strong></div>\n            <div>CONNECTION DEMANDS: <strong>N/A</strong></div>\n            <div>BASE SHEAR: <strong>N/A</strong></div>\n            <div>RACKING RESPONSE: <strong>N/A</strong></div>\n            <div>PASS/FAIL: <strong>N/A</strong></div>\n\n            <div className="mt-3 font-semibold text-amber-300">\n              SOLVER INPUT MAPPING ≠ SOLVER RESULT. No reaction, displacement, member force, connection demand, racking response, base shear, or adequacy exists until an explicit structural model is validated and an engineering solver is actually executed.\n            </div>\n          </>\n        ) : (\n          <div className="mt-2 text-amber-300">\n            Structural solver-input mapping unavailable because its source analytical force/application/moment evidence is not ready or the explicit node/reference contract is inconsistent. No stale nodal load is retained.\n          </div>\n        )}\n\n        <div className="mt-2 text-slate-500">{structuralAdapterResult.reason}</div>\n      </div>\n    </div>\n  );\n}\n',
)

browser = Path("scripts/phase4-house-browser-acceptance.mjs")
replace_once(browser, '  schemaVersion: "0.15.0",\n', '  schemaVersion: "0.16.0",\n')

replace_once(
    browser,
    '    "Surface force moment is ordinary statics r×F about an explicit caller-declared global reference point only. It is not aerodynamic torque/free couple, support moment, reaction, load-path distribution, solver response, or adequacy evidence.",\n',
    '    "Surface force moment is ordinary statics r×F about an explicit caller-declared global reference point only. It is not aerodynamic torque/free couple, support moment, reaction, load-path distribution, solver response, or adequacy evidence.",\n    "Structural load-case/solver-node adapter is solver-input mapping only: load-case ID, node ID, and node coordinate are explicit; mapped force/moment preserve accepted analytical evidence; no solver execution or structural response is implied.",\n',
)

replace_once(
    browser,
    '  await waitForBodyText(page, "RPE_ANALYTICAL · ORDINARY STATICS r×F · NOT AERODYNAMIC TORQUE");\n',
    '  await waitForBodyText(page, "RPE_ANALYTICAL · ORDINARY STATICS r×F · NOT AERODYNAMIC TORQUE");\n  await waitForBodyText(page, "Explicit structural load-case / solver-node mapping");\n  await waitForBodyText(page, "SOLVER_INPUT_MAPPING · EXPLICIT NODE/LOAD CASE ONLY · NO SOLVER RESPONSE");\n',
)

replace_once(
    browser,
    '  record.checks.surfaceForceMomentVisible = true;\n',
    '  record.checks.surfaceForceMomentVisible = true;\n  record.checks.structuralLoadCaseAdapterVisible = true;\n',
)

replace_once(
    browser,
    '  record.checks.surfaceForceMomentAerodynamicTorqueUnavailable = true;\n  record.checks.surfaceForceMomentStructuralResponseUnavailable = true;\n\n  // Roof exposure readiness: rotated roof geometry + explicit local normal/exposed-face declaration only.\n',
    '  record.checks.surfaceForceMomentAerodynamicTorqueUnavailable = true;\n  record.checks.surfaceForceMomentStructuralResponseUnavailable = true;\n\n  // Explicit solver-input mapping only: no structural solver has been executed.\n  await waitForBodyText(page, "Structural load-case mapping state: mapping_ready");\n  await waitForBodyText(page, "Evidence layer: solver_input_mapping");\n  await waitForBodyText(page, "Adapter surface ID: synthetic-wall-north");\n  await waitForBodyText(page, "Load-case ID: LC-WIND-QA-001");\n  await waitForBodyText(page, "Solver-node ID: NODE-WIND-NORTH-QA-001");\n  await waitForBodyText(page, "Solver-node global point: (0.100, 0.200, -2.000) m");\n  await waitForBodyText(page, "Coordinate basis: global_cartesian_xyz_m");\n  await waitForBodyText(page, "Source application point: (0.370, 1.230, -2.410) m");\n  await waitForBodyText(page, "Source moment reference point: (0.100, 0.200, -2.000) m");\n  await waitForBodyText(page, "NODE COORDINATE = MOMENT REFERENCE POINT: YES");\n  await waitForBodyText(page, "NEAREST NODE INFERENCE: NONE — PROHIBITED");\n  await waitForBodyText(page, "Mapped nodal force: (0.000, 0.000, -960.000) N");\n  await waitForBodyText(page, "Mapped nodal moment: (-988.800, 259.200, 0.000) N·m");\n  await waitForBodyText(page, "SOLVER EXECUTED: NO");\n  await waitForBodyText(page, "REACTIONS: N/A");\n  await waitForBodyText(page, "DISPLACEMENTS: N/A");\n  await waitForBodyText(page, "ROTATIONS: N/A");\n  await waitForBodyText(page, "MEMBER FORCES: N/A");\n  await waitForBodyText(page, "CONNECTION DEMANDS: N/A");\n  await waitForBodyText(page, "RACKING RESPONSE: N/A");\n  await waitForBodyText(page, "SOLVER INPUT MAPPING ≠ SOLVER RESULT");\n  record.checks.structuralLoadCaseExplicitIdentityVerified = true;\n  record.checks.structuralLoadCaseNodeMatchesMomentReference = true;\n  record.checks.structuralLoadCasePreservesForceMoment = true;\n  record.checks.structuralLoadCaseNoSolverResponse = true;\n\n  // Roof exposure readiness: rotated roof geometry + explicit local normal/exposed-face declaration only.\n',
)

replace_once(
    browser,
    '  await waitForBodyText(page, "Force-moment state: blocked_source_mapping");\n  await waitForBodyTextAbsent(page, "Wall ID: synthetic-wall-north");\n',
    '  await waitForBodyText(page, "Force-moment state: blocked_source_mapping");\n  await waitForBodyText(page, "Structural load-case mapping state: blocked_application_mapping");\n  await waitForBodyTextAbsent(page, "Wall ID: synthetic-wall-north");\n',
)

replace_once(
    browser,
    '  await waitForBodyTextAbsent(page, "M_ref = r × F: (-988.800, 259.200, 0.000) N·m");\n  record.checks.wallReadinessBlockedBelowActivationStage = true;\n',
    '  await waitForBodyTextAbsent(page, "M_ref = r × F: (-988.800, 259.200, 0.000) N·m");\n  await waitForBodyTextAbsent(page, "Mapped nodal force: (0.000, 0.000, -960.000) N");\n  await waitForBodyTextAbsent(page, "Mapped nodal moment: (-988.800, 259.200, 0.000) N·m");\n  record.checks.wallReadinessBlockedBelowActivationStage = true;\n',
)

replace_once(
    browser,
    '  record.checks.surfaceForceMomentBlockedBelowWallStage = true;\n',
    '  record.checks.surfaceForceMomentBlockedBelowWallStage = true;\n  record.checks.structuralLoadCaseAdapterBlockedBelowWallStage = true;\n',
)

replace_once(
    browser,
    '  await waitForBodyText(page, "Force-moment state: blocked_source_mapping");\n  await waitForBodyText(page, "Connection location state: blocked_stage_before_connections");\n',
    '  await waitForBodyText(page, "Force-moment state: blocked_source_mapping");\n  await waitForBodyText(page, "Structural load-case mapping state: blocked_application_mapping");\n  await waitForBodyText(page, "Connection location state: blocked_stage_before_connections");\n',
)
