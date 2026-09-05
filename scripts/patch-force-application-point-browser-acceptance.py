from pathlib import Path


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected exactly one anchor, found {count}: {old[:180]!r}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


browser = Path("scripts/phase4-house-browser-acceptance.mjs")

replace_once(
    browser,
    '  schemaVersion: "0.13.0",\n',
    '  schemaVersion: "0.14.0",\n',
)

replace_once(
    browser,
    '    "Multi-surface wind loading only algebraically sums already-valid explicit single-surface global force vectors; the sum is not a support reaction, base shear, connection demand, racking demand, moment/torque, load-path distribution, CFD integration, code-compliance result, or adequacy verdict.",\n',
    '    "Multi-surface wind loading only algebraically sums already-valid explicit single-surface global force vectors; the sum is not a support reaction, base shear, connection demand, racking demand, moment/torque, load-path distribution, CFD integration, code-compliance result, or adequacy verdict.",\n    "Surface force application-point mapping attaches an accepted analytical force only to an explicit caller-declared global point. It does not infer center of pressure, panel centroid, joint, support, solver node, load path, moment/torque, reaction, or adequacy.",\n',
)

replace_once(
    browser,
    '  await waitForBodyText(page, "RPE_ANALYTICAL · VECTOR ALGEBRA ONLY · NON-CFD · NON-CODE-COMPLIANCE");\n',
    '  await waitForBodyText(page, "RPE_ANALYTICAL · VECTOR ALGEBRA ONLY · NON-CFD · NON-CODE-COMPLIANCE");\n  await waitForBodyText(page, "Explicit surface force application-point mapping");\n  await waitForBodyText(page, "RPE_ANALYTICAL · EXPLICIT MAPPING ONLY · NO MOMENT / NO REACTION");\n',
)

replace_once(
    browser,
    '  record.checks.multiSurfaceWindLoadSetVisible = true;\n',
    '  record.checks.multiSurfaceWindLoadSetVisible = true;\n  record.checks.surfaceForceApplicationPointMappingVisible = true;\n',
)

replace_once(
    browser,
    '  record.checks.multiSurfaceHandVectorSumVerified = true;\n  record.checks.multiSurfaceStructuralInterpretationUnavailable = true;\n\n  // Roof exposure readiness: rotated roof geometry + explicit local normal/exposed-face declaration only.\n',
    '  record.checks.multiSurfaceHandVectorSumVerified = true;\n  record.checks.multiSurfaceStructuralInterpretationUnavailable = true;\n\n  // Explicit caller-declared application point for the accepted north-wall analytical force.\n  await waitForBodyText(page, "Force application-point state: mapping_ready");\n  await waitForBodyText(page, "Application surface ID: synthetic-wall-north");\n  await waitForBodyText(page, "Source global force vector: (0.000, 0.000, -960.000) N");\n  await waitForBodyText(page, "Caller-declared global application point: (0.370, 1.230, -2.410) m");\n  await waitForBodyText(page, "APPLICATION POINT BASIS: CALLER_DECLARED_GLOBAL_POINT");\n  await waitForBodyText(page, "Rendered north-wall center: (0.000, 1.650, -2.250) m — GEOMETRY REFERENCE ONLY");\n  await waitForBodyText(page, "INFERRED APPLICATION POINT: NONE — PROHIBITED");\n  await waitForBodyText(page, "CENTER OF PRESSURE: N/A");\n  await waitForBodyText(page, "SOLVER NODE: N/A");\n  await waitForBodyText(page, "APPLICATION POINT ≠ CENTER OF PRESSURE / JOINT / SUPPORT / SOLVER NODE");\n  await waitForBodyText(page, "MOMENT remains N/A until a separate explicit reference-point/axis contract exists");\n  record.checks.surfaceForceApplicationPointExplicitGlobalPointVerified = true;\n  record.checks.surfaceForceApplicationPointNotRenderedCenter = true;\n  record.checks.surfaceForceApplicationPointPreservesForceVector = true;\n  record.checks.surfaceForceApplicationPointNoMomentOrStructuralMapping = true;\n\n  // Roof exposure readiness: rotated roof geometry + explicit local normal/exposed-face declaration only.\n',
)

replace_once(
    browser,
    '  await waitForBodyText(page, "Multi-surface load-set state: blocked_surface_action");\n  await waitForBodyTextAbsent(page, "Wall ID: synthetic-wall-north");\n',
    '  await waitForBodyText(page, "Multi-surface load-set state: blocked_surface_action");\n  await waitForBodyText(page, "Force application-point state: blocked_source_action");\n  await waitForBodyTextAbsent(page, "Wall ID: synthetic-wall-north");\n',
)

replace_once(
    browser,
    '  await waitForBodyTextAbsent(page, "Algebraic global force-vector sum: (480.000, 0.000, -960.000) N");\n  record.checks.wallReadinessBlockedBelowActivationStage = true;\n',
    '  await waitForBodyTextAbsent(page, "Algebraic global force-vector sum: (480.000, 0.000, -960.000) N");\n  await waitForBodyTextAbsent(page, "Caller-declared global application point: (0.370, 1.230, -2.410) m");\n  record.checks.wallReadinessBlockedBelowActivationStage = true;\n',
)

replace_once(
    browser,
    '  record.checks.multiSurfaceWindLoadSetBlockedBelowWallStage = true;\n',
    '  record.checks.multiSurfaceWindLoadSetBlockedBelowWallStage = true;\n  record.checks.surfaceForceApplicationPointBlockedBelowWallStage = true;\n',
)

replace_once(
    browser,
    '  await waitForBodyText(page, "Multi-surface load-set state: blocked_surface_action");\n  await waitForBodyText(page, "Connection location state: blocked_stage_before_connections");\n',
    '  await waitForBodyText(page, "Multi-surface load-set state: blocked_surface_action");\n  await waitForBodyText(page, "Force application-point state: blocked_source_action");\n  await waitForBodyText(page, "Connection location state: blocked_stage_before_connections");\n',
)
