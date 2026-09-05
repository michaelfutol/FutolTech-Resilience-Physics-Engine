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
    '  schemaVersion: "0.12.0",\n',
    '  schemaVersion: "0.13.0",\n',
)

replace_once(
    browser,
    '    "Single-surface wind action is RPE_ANALYTICAL only: density, speed, effective area, signed coefficient, and global action direction are explicit QA inputs; it is NON-CFD, NON-CODE-COMPLIANCE, and does not create connection demand, reactions, racking, PASS/FAIL, or whole-house performance evidence.",\n',
    '    "Single-surface wind action is RPE_ANALYTICAL only: density, speed, effective area, signed coefficient, and global action direction are explicit QA inputs; it is NON-CFD, NON-CODE-COMPLIANCE, and does not create connection demand, reactions, racking, PASS/FAIL, or whole-house performance evidence.",\n    "Multi-surface wind loading only algebraically sums already-valid explicit single-surface global force vectors; the sum is not a support reaction, base shear, connection demand, racking demand, moment/torque, load-path distribution, CFD integration, code-compliance result, or adequacy verdict.",\n',
)

replace_once(
    browser,
    '  await waitForBodyText(page, "Analytical surface wind action");\n  await waitForBodyText(page, "RPE_ANALYTICAL · NON-CFD · NON-CODE-COMPLIANCE");\n',
    '  await waitForBodyText(page, "Analytical surface wind action");\n  await waitForBodyText(page, "RPE_ANALYTICAL · NON-CFD · NON-CODE-COMPLIANCE");\n  await waitForBodyText(page, "Controlled multi-surface analytical load set");\n  await waitForBodyText(page, "RPE_ANALYTICAL · VECTOR ALGEBRA ONLY · NON-CFD · NON-CODE-COMPLIANCE");\n',
)

replace_once(
    browser,
    '  record.checks.surfaceWindActionPanelVisible = true;\n',
    '  record.checks.surfaceWindActionPanelVisible = true;\n  record.checks.multiSurfaceWindLoadSetVisible = true;\n',
)

replace_once(
    browser,
    '  record.checks.surfaceWindActionDownstreamMechanicsUnavailable = true;\n\n  // Roof exposure readiness: rotated roof geometry + explicit local normal/exposed-face declaration only.\n',
    '  record.checks.surfaceWindActionDownstreamMechanicsUnavailable = true;\n\n  // Controlled two-wall analytical vector aggregation. This is vector algebra only, not structural distribution.\n  await waitForBodyText(page, "Multi-surface load-set state: analytical_ready");\n  await waitForBodyText(page, "Load-set surface ID: synthetic-wall-east");\n  await waitForBodyText(page, "Surface global force vector: (480.000, 0.000, 0.000) N");\n  await waitForBodyText(page, "Load-set surface ID: synthetic-wall-north");\n  await waitForBodyText(page, "Surface global force vector: (0.000, 0.000, -960.000) N");\n  await waitForBodyText(page, "Algebraic global force-vector sum: (480.000, 0.000, -960.000) N");\n  await waitForBodyText(page, "Resultant vector magnitude: 1073.313 N");\n  await waitForBodyText(page, "REACTION: N/A");\n  await waitForBodyText(page, "BASE SHEAR: N/A");\n  await waitForBodyText(page, "UPLIFT REACTION: N/A");\n  await waitForBodyText(page, "SLIDING REACTION: N/A");\n  await waitForBodyText(page, "RACKING DEMAND: N/A");\n  await waitForBodyText(page, "CONNECTION DEMAND: N/A");\n  await waitForBodyText(page, "MOMENT/TORQUE: N/A");\n  await waitForBodyText(page, "LOAD-PATH DISTRIBUTION: N/A");\n  await waitForBodyText(page, "PASS/FAIL: N/A");\n  await waitForBodyText(page, "VECTOR SUM ≠ REACTION / BASE SHEAR / STRUCTURAL DEMAND");\n  record.checks.multiSurfaceHandVectorSumVerified = true;\n  record.checks.multiSurfaceStructuralInterpretationUnavailable = true;\n\n  // Roof exposure readiness: rotated roof geometry + explicit local normal/exposed-face declaration only.\n',
)

replace_once(
    browser,
    '  await waitForBodyText(page, "Wall readiness state: blocked_stage_before_walls");\n  await waitForBodyText(page, "Surface action state: blocked_stage_before_walls");\n  await waitForBodyTextAbsent(page, "Wall ID: synthetic-wall-north");\n',
    '  await waitForBodyText(page, "Wall readiness state: blocked_stage_before_walls");\n  await waitForBodyText(page, "Surface action state: blocked_stage_before_walls");\n  await waitForBodyText(page, "Multi-surface load-set state: blocked_surface_action");\n  await waitForBodyTextAbsent(page, "Wall ID: synthetic-wall-north");\n',
)

replace_once(
    browser,
    '  await waitForBodyTextAbsent(page, "q = 0.5ρV²: 240.000 Pa");\n  record.checks.wallReadinessBlockedBelowActivationStage = true;\n  record.checks.surfaceWindActionBlockedBelowWallStage = true;\n',
    '  await waitForBodyTextAbsent(page, "q = 0.5ρV²: 240.000 Pa");\n  await waitForBodyTextAbsent(page, "Algebraic global force-vector sum: (480.000, 0.000, -960.000) N");\n  record.checks.wallReadinessBlockedBelowActivationStage = true;\n  record.checks.surfaceWindActionBlockedBelowWallStage = true;\n  record.checks.multiSurfaceWindLoadSetBlockedBelowWallStage = true;\n',
)

replace_once(
    browser,
    '  await waitForBodyText(page, "Surface action state: blocked_stage_before_walls");\n  await waitForBodyText(page, "Connection location state: blocked_stage_before_connections");\n',
    '  await waitForBodyText(page, "Surface action state: blocked_stage_before_walls");\n  await waitForBodyText(page, "Multi-surface load-set state: blocked_surface_action");\n  await waitForBodyText(page, "Connection location state: blocked_stage_before_connections");\n',
)
