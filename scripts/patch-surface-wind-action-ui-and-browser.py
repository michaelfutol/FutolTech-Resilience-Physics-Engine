from pathlib import Path


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(
            f"{path}: expected exactly one anchor, found {count}: {old[:150]!r}"
        )
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


viewport = Path("src/components/Viewport3D.tsx")
replace_once(
    viewport,
    'import SmallHouseControlledABPanel from "@/components/SmallHouseControlledABPanel";\n',
    'import SmallHouseControlledABPanel from "@/components/SmallHouseControlledABPanel";\nimport SmallHouseSurfaceWindActionPanel from "@/components/SmallHouseSurfaceWindActionPanel";\n',
)
replace_once(
    viewport,
    '          <RoofPanelExposureReadinessPanel snapshot={phase4Snapshot} />\n\n          <ConnectionJointLocationReadinessPanel snapshot={phase4Snapshot} />\n',
    '          <RoofPanelExposureReadinessPanel snapshot={phase4Snapshot} />\n\n          <SmallHouseSurfaceWindActionPanel snapshot={phase4Snapshot} />\n\n          <ConnectionJointLocationReadinessPanel snapshot={phase4Snapshot} />\n',
)

browser = Path("scripts/phase4-house-browser-acceptance.mjs")
replace_once(
    browser,
    '  schemaVersion: "0.11.0",\n',
    '  schemaVersion: "0.12.0",\n',
)
replace_once(
    browser,
    '    "Controlled A/B comparison in this gate proves only that exactly one declared connection record differs while unrelated specimen inputs remain invariant; it does not compare structural performance or establish a stronger/better variant.",\n',
    '    "Controlled A/B comparison in this gate proves only that exactly one declared connection record differs while unrelated specimen inputs remain invariant; it does not compare structural performance or establish a stronger/better variant.",\n    "Single-surface wind action is RPE_ANALYTICAL only: density, speed, effective area, signed coefficient, and global action direction are explicit QA inputs; it is NON-CFD, NON-CODE-COMPLIANCE, and does not create connection demand, reactions, racking, PASS/FAIL, or whole-house performance evidence.",\n',
)
replace_once(
    browser,
    '  await waitForBodyText(page, "Controlled A/B specimen difference");\n',
    '  await waitForBodyText(page, "Controlled A/B specimen difference");\n  await waitForBodyText(page, "Analytical surface wind action");\n  await waitForBodyText(page, "RPE_ANALYTICAL · NON-CFD · NON-CODE-COMPLIANCE");\n',
)
replace_once(
    browser,
    '  record.checks.controlledABPanelVisible = true;\n',
    '  record.checks.controlledABPanelVisible = true;\n  record.checks.surfaceWindActionPanelVisible = true;\n',
)
replace_once(
    browser,
    '  record.checks.wallWindActionCalculationBlocked = true;\n\n  // Roof exposure readiness: rotated roof geometry + explicit local normal/exposed-face declaration only.\n',
    '  record.checks.wallWindActionCalculationBlocked = true;\n\n  // First Phase 4 analytical surface action: explicit aerodynamic/action inputs only.\n  await waitForBodyText(page, "Surface action state: analytical_ready");\n  await waitForBodyText(page, "Evidence layer: rpe_analytical");\n  await waitForBodyText(page, "Structural result: N/A");\n  await waitForBodyText(page, "Surface ID: synthetic-wall-north");\n  await waitForBodyText(page, "Surface kind: wall_panel");\n  await waitForBodyText(page, "Surface normal axis for geometry report: local_z");\n  await waitForBodyText(page, "Geometry-only face area: 7.140000 m²");\n  await waitForBodyText(page, "Effective wind area A_eff: 5.000000 m²");\n  await waitForBodyText(page, "Air density ρ: 1.200 kg/m³");\n  await waitForBodyText(page, "Wind speed V: 20.000 m/s");\n  await waitForBodyText(page, "Signed coefficient: -0.800");\n  await waitForBodyText(page, "Explicit direction input: (0.000, 0.000, 2.000)");\n  await waitForBodyText(page, "Normalized global action direction: (0.000, 0.000, 1.000)");\n  await waitForBodyText(page, "q = 0.5ρV²: 240.000 Pa");\n  await waitForBodyText(page, "Signed surface pressure qC: -192.000 Pa");\n  await waitForBodyText(page, "Scalar surface force qA_effC: -960.000 N");\n  await waitForBodyText(page, "Global force vector: (0.000, 0.000, -960.000) N");\n  await waitForBodyText(page, "Connection demand: N/A");\n  await waitForBodyText(page, "Connection capacity assessment: N/A");\n  await waitForBodyText(page, "Support reactions: N/A");\n  await waitForBodyText(page, "Uplift reaction: N/A");\n  await waitForBodyText(page, "Sliding reaction: N/A");\n  await waitForBodyText(page, "Racking indicator: N/A");\n  await waitForBodyText(page, "PASS/FAIL: N/A");\n  await waitForBodyText(page, "Geometry-only area 7.140000 m² ≠ declared A_eff 5.000000 m²");\n  record.checks.surfaceWindActionHandCheckVerified = true;\n  record.checks.surfaceWindActionGeometryAreaNotEffectiveArea = true;\n  record.checks.surfaceWindActionExplicitDirectionVerified = true;\n  record.checks.surfaceWindActionDownstreamMechanicsUnavailable = true;\n\n  // Roof exposure readiness: rotated roof geometry + explicit local normal/exposed-face declaration only.\n',
)
replace_once(
    browser,
    '  await waitForBodyText(page, "Wall readiness state: blocked_stage_before_walls");\n  await waitForBodyTextAbsent(page, "Wall ID: synthetic-wall-north");\n  record.checks.wallReadinessBlockedBelowActivationStage = true;\n',
    '  await waitForBodyText(page, "Wall readiness state: blocked_stage_before_walls");\n  await waitForBodyText(page, "Surface action state: blocked_stage_before_walls");\n  await waitForBodyTextAbsent(page, "Wall ID: synthetic-wall-north");\n  await waitForBodyTextAbsent(page, "Surface ID: synthetic-wall-north");\n  await waitForBodyTextAbsent(page, "q = 0.5ρV²: 240.000 Pa");\n  record.checks.wallReadinessBlockedBelowActivationStage = true;\n  record.checks.surfaceWindActionBlockedBelowWallStage = true;\n',
)
replace_once(
    browser,
    '  await waitForBodyText(page, "Wall readiness state: blocked_stage_before_walls");\n  await waitForBodyText(page, "Roof readiness state: blocked_stage_before_roof");\n',
    '  await waitForBodyText(page, "Wall readiness state: blocked_stage_before_walls");\n  await waitForBodyText(page, "Roof readiness state: blocked_stage_before_roof");\n  await waitForBodyText(page, "Surface action state: blocked_stage_before_walls");\n',
)
