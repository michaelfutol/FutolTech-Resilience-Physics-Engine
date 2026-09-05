from pathlib import Path


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected exactly one anchor, found {count}: {old[:180]!r}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


component = Path("src/components/SmallHouseSurfaceWindActionPanel.tsx")

replace_once(
    component,
    'import { mapSmallHouseSurfaceForceApplicationPoint } from "@/lib/smallHouseWind/surfaceForceApplicationPoint";\n',
    'import { mapSmallHouseSurfaceForceApplicationPoint } from "@/lib/smallHouseWind/surfaceForceApplicationPoint";\nimport { calculateSmallHouseSurfaceForceMoment } from "@/lib/smallHouseWind/surfaceForceMoment";\n',
)

replace_once(
    component,
    'import {\n  SMALL_HOUSE_SURFACE_FORCE_APPLICATION_POINT_SCHEMA_VERSION,\n  type SmallHouseSurfaceForceApplicationPointInput,\n} from "@/types/smallHouseSurfaceForceApplicationPoint";\n',
    'import {\n  SMALL_HOUSE_SURFACE_FORCE_APPLICATION_POINT_SCHEMA_VERSION,\n  type SmallHouseSurfaceForceApplicationPointInput,\n} from "@/types/smallHouseSurfaceForceApplicationPoint";\nimport {\n  SMALL_HOUSE_SURFACE_FORCE_MOMENT_SCHEMA_VERSION,\n  type SmallHouseSurfaceForceMomentInput,\n} from "@/types/smallHouseSurfaceForceMoment";\n',
)

replace_once(
    component,
    'const QA_APPLICATION_POINT_INPUT: SmallHouseSurfaceForceApplicationPointInput = {\n  schemaVersion: SMALL_HOUSE_SURFACE_FORCE_APPLICATION_POINT_SCHEMA_VERSION,\n  surfaceComponentId: "synthetic-wall-north",\n  // Deliberately not the rendered north-wall center (0, 1.65, -2.25).\n  applicationPointGlobalM: { x: 0.37, y: 1.23, z: -2.41 },\n  sourceNote: "Synthetic caller-declared global force application point only",\n  verificationState: "unverified",\n};\n',
    'const QA_APPLICATION_POINT_INPUT: SmallHouseSurfaceForceApplicationPointInput = {\n  schemaVersion: SMALL_HOUSE_SURFACE_FORCE_APPLICATION_POINT_SCHEMA_VERSION,\n  surfaceComponentId: "synthetic-wall-north",\n  // Deliberately not the rendered north-wall center (0, 1.65, -2.25).\n  applicationPointGlobalM: { x: 0.37, y: 1.23, z: -2.41 },\n  sourceNote: "Synthetic caller-declared global force application point only",\n  verificationState: "unverified",\n};\n\nconst QA_FORCE_MOMENT_INPUT: SmallHouseSurfaceForceMomentInput = {\n  schemaVersion: SMALL_HOUSE_SURFACE_FORCE_MOMENT_SCHEMA_VERSION,\n  surfaceComponentId: "synthetic-wall-north",\n  // Explicit non-origin reference proves RPE does not silently assume global zero.\n  referencePointGlobalM: { x: 0.1, y: 0.2, z: -2.0 },\n  sourceNote: "Synthetic caller-declared global moment reference point only",\n  verificationState: "unverified",\n};\n',
)

replace_once(
    component,
    '  const applicationPointResult = useMemo(\n    () => mapSmallHouseSurfaceForceApplicationPoint(snapshot, result, QA_APPLICATION_POINT_INPUT),\n    [snapshot, result],\n  );\n',
    '  const applicationPointResult = useMemo(\n    () => mapSmallHouseSurfaceForceApplicationPoint(snapshot, result, QA_APPLICATION_POINT_INPUT),\n    [snapshot, result],\n  );\n  const forceMomentResult = useMemo(\n    () => calculateSmallHouseSurfaceForceMoment(snapshot, applicationPointResult, QA_FORCE_MOMENT_INPUT),\n    [snapshot, applicationPointResult],\n  );\n',
)

replace_once(
    component,
    '        <div className="mt-2 text-slate-500">{applicationPointResult.reason}</div>\n      </div>\n    </div>\n  );\n}\n',
    '        <div className="mt-2 text-slate-500">{applicationPointResult.reason}</div>\n      </div>\n\n      <div className="mt-4 font-semibold text-fuchsia-200">Explicit force moment about declared reference point</div>\n      <div className="mt-1 rounded border border-fuchsia-900/70 bg-fuchsia-950/30 px-2 py-1 text-[10px] font-semibold tracking-wide text-fuchsia-200">\n        RPE_ANALYTICAL · ORDINARY STATICS r×F · NOT AERODYNAMIC TORQUE\n      </div>\n      <p className="mt-2 text-[10px] text-slate-500">\n        This gate calculates only the moment of the already-mapped analytical force about an explicit caller-declared global reference point. No origin, support, joint, solver node, center of pressure, or aerodynamic couple is inferred.\n      </p>\n\n      <div className="mt-3 rounded border border-fuchsia-950 bg-slate-900/60 p-2 text-[10px] text-slate-300">\n        <div>Force-moment state: <strong>{forceMomentResult.state}</strong></div>\n        <div>Evidence layer: <strong>{forceMomentResult.evidenceLayer}</strong></div>\n        <div>Structural result: <strong>{forceMomentResult.structuralResult}</strong></div>\n\n        {forceMomentResult.state === "analytical_ready" ? (\n          <>\n            <div className="mt-3 font-semibold text-slate-200">Explicit statics inputs</div>\n            <div>Moment surface ID: <strong>{forceMomentResult.surfaceComponentId}</strong></div>\n            <div>Source force vector F: <strong>{vector(forceMomentResult.sourceForceVectorN)} N</strong></div>\n            <div>Application point r_app: <strong>{vector(forceMomentResult.applicationPointGlobalM)} m</strong></div>\n            <div>Caller-declared reference point r_ref: <strong>{vector(forceMomentResult.referencePointGlobalM)} m</strong></div>\n            <div>Lever arm r = r_app − r_ref: <strong>{vector(forceMomentResult.leverArmGlobalM)} m</strong></div>\n\n            <div className="mt-3 font-semibold text-slate-200">Ordinary force moment</div>\n            <div>M_ref = r × F: <strong>{vector(forceMomentResult.forceMomentVectorNm)} N·m</strong></div>\n            <div>|M_ref|: <strong>{scalar(forceMomentResult.forceMomentMagnitudeNm, 3)} N·m</strong></div>\n            <div>Moment basis: <strong>{forceMomentResult.momentBasis}</strong></div>\n            <div>AERODYNAMIC TORQUE / FREE COUPLE: <strong>N/A</strong></div>\n\n            <div className="mt-3 font-semibold text-slate-200">Structural interpretation still unavailable</div>\n            <div>REACTION: <strong>N/A</strong></div>\n            <div>BASE SHEAR: <strong>N/A</strong></div>\n            <div>UPLIFT REACTION: <strong>N/A</strong></div>\n            <div>SLIDING REACTION: <strong>N/A</strong></div>\n            <div>RACKING DEMAND: <strong>N/A</strong></div>\n            <div>CONNECTION DEMAND: <strong>N/A</strong></div>\n            <div>LOAD-PATH DISTRIBUTION: <strong>N/A</strong></div>\n            <div>PASS/FAIL: <strong>N/A</strong></div>\n\n            <div className="mt-3 font-semibold text-amber-300">\n              FORCE MOMENT r×F ≠ AERODYNAMIC TORQUE / SUPPORT MOMENT / SOLVER RESPONSE. The reference point is caller declared; global origin is not assumed.\n            </div>\n          </>\n        ) : (\n          <div className="mt-2 text-amber-300">\n            Force moment unavailable because the explicit source force/application-point mapping is not ready in this staged snapshot. No stale moment is retained.\n          </div>\n        )}\n\n        <div className="mt-2 text-slate-500">{forceMomentResult.reason}</div>\n      </div>\n    </div>\n  );\n}\n',
)

browser = Path("scripts/phase4-house-browser-acceptance.mjs")

replace_once(browser, '  schemaVersion: "0.14.0",\n', '  schemaVersion: "0.15.0",\n')

replace_once(
    browser,
    '    "Surface force application-point mapping attaches an accepted analytical force only to an explicit caller-declared global point. It does not infer center of pressure, panel centroid, joint, support, solver node, load path, moment/torque, reaction, or adequacy.",\n',
    '    "Surface force application-point mapping attaches an accepted analytical force only to an explicit caller-declared global point. It does not infer center of pressure, panel centroid, joint, support, solver node, load path, moment/torque, reaction, or adequacy.",\n    "Surface force moment is ordinary statics r×F about an explicit caller-declared global reference point only. It is not aerodynamic torque/free couple, support moment, reaction, load-path distribution, solver response, or adequacy evidence.",\n',
)

replace_once(
    browser,
    '  await waitForBodyText(page, "RPE_ANALYTICAL · EXPLICIT MAPPING ONLY · NO MOMENT / NO REACTION");\n',
    '  await waitForBodyText(page, "RPE_ANALYTICAL · EXPLICIT MAPPING ONLY · NO MOMENT / NO REACTION");\n  await waitForBodyText(page, "Explicit force moment about declared reference point");\n  await waitForBodyText(page, "RPE_ANALYTICAL · ORDINARY STATICS r×F · NOT AERODYNAMIC TORQUE");\n',
)

replace_once(
    browser,
    '  record.checks.surfaceForceApplicationPointMappingVisible = true;\n',
    '  record.checks.surfaceForceApplicationPointMappingVisible = true;\n  record.checks.surfaceForceMomentVisible = true;\n',
)

replace_once(
    browser,
    '  record.checks.surfaceForceApplicationPointNoMomentOrStructuralMapping = true;\n\n  // Roof exposure readiness: rotated roof geometry + explicit local normal/exposed-face declaration only.\n',
    '  record.checks.surfaceForceApplicationPointNoMomentOrStructuralMapping = true;\n\n  // Ordinary statics force moment about one explicit non-origin caller-declared reference point.\n  await waitForBodyText(page, "Force-moment state: analytical_ready");\n  await waitForBodyText(page, "Moment surface ID: synthetic-wall-north");\n  await waitForBodyText(page, "Source force vector F: (0.000, 0.000, -960.000) N");\n  await waitForBodyText(page, "Application point r_app: (0.370, 1.230, -2.410) m");\n  await waitForBodyText(page, "Caller-declared reference point r_ref: (0.100, 0.200, -2.000) m");\n  await waitForBodyText(page, "Lever arm r = r_app − r_ref: (0.270, 1.030, -0.410) m");\n  await waitForBodyText(page, "M_ref = r × F: (-988.800, 259.200, 0.000) N·m");\n  await waitForBodyText(page, "|M_ref|: 1022.208 N·m");\n  await waitForBodyText(page, "Moment basis: force_moment_about_caller_declared_global_reference_point");\n  await waitForBodyText(page, "AERODYNAMIC TORQUE / FREE COUPLE: N/A");\n  await waitForBodyText(page, "FORCE MOMENT r×F ≠ AERODYNAMIC TORQUE / SUPPORT MOMENT / SOLVER RESPONSE");\n  record.checks.surfaceForceMomentHandCheckVerified = true;\n  record.checks.surfaceForceMomentExplicitReferenceVerified = true;\n  record.checks.surfaceForceMomentAerodynamicTorqueUnavailable = true;\n  record.checks.surfaceForceMomentStructuralResponseUnavailable = true;\n\n  // Roof exposure readiness: rotated roof geometry + explicit local normal/exposed-face declaration only.\n',
)

replace_once(
    browser,
    '  await waitForBodyText(page, "Force application-point state: blocked_source_action");\n  await waitForBodyTextAbsent(page, "Wall ID: synthetic-wall-north");\n',
    '  await waitForBodyText(page, "Force application-point state: blocked_source_action");\n  await waitForBodyText(page, "Force-moment state: blocked_source_mapping");\n  await waitForBodyTextAbsent(page, "Wall ID: synthetic-wall-north");\n',
)

replace_once(
    browser,
    '  await waitForBodyTextAbsent(page, "Caller-declared global application point: (0.370, 1.230, -2.410) m");\n  record.checks.wallReadinessBlockedBelowActivationStage = true;\n',
    '  await waitForBodyTextAbsent(page, "Caller-declared global application point: (0.370, 1.230, -2.410) m");\n  await waitForBodyTextAbsent(page, "M_ref = r × F: (-988.800, 259.200, 0.000) N·m");\n  record.checks.wallReadinessBlockedBelowActivationStage = true;\n',
)

replace_once(
    browser,
    '  record.checks.surfaceForceApplicationPointBlockedBelowWallStage = true;\n',
    '  record.checks.surfaceForceApplicationPointBlockedBelowWallStage = true;\n  record.checks.surfaceForceMomentBlockedBelowWallStage = true;\n',
)

replace_once(
    browser,
    '  await waitForBodyText(page, "Force application-point state: blocked_source_action");\n  await waitForBodyText(page, "Connection location state: blocked_stage_before_connections");\n',
    '  await waitForBodyText(page, "Force application-point state: blocked_source_action");\n  await waitForBodyText(page, "Force-moment state: blocked_source_mapping");\n  await waitForBodyText(page, "Connection location state: blocked_stage_before_connections");\n',
)
