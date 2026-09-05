from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected exactly one {label} anchor; found {count}")
    return text.replace(old, new, 1)


path = Path("scripts/phase4-house-browser-acceptance.mjs")
text = path.read_text()

text = replace_once(text, 'schemaVersion: "0.5.0",', 'schemaVersion: "0.6.0",', "browser schema version")

text = replace_once(
    text,
    '    "Wall-panel readiness derives box-face geometry only from an explicitly declared local normal; it does not define effective wind area, pressure coefficients, net pressure, stiffness, fastener capacity, or wind resistance.",\n',
    '    "Wall-panel readiness derives box-face geometry only from an explicitly declared local normal; it does not define effective wind area, pressure coefficients, net pressure, stiffness, fastener capacity, or wind resistance.",\n'
    '    "Roof-panel readiness preserves rotated geometry and explicit local-normal/exposed-face declarations only; it does not define roof zones, effective wind area, pressure coefficients, uplift force, connection demand/capacity, or wind resistance.",\n',
    "wall limitation",
)

text = replace_once(
    text,
    '  await waitForBodyText(page, "Wall-panel geometry / exposure readiness");\n',
    '  await waitForBodyText(page, "Wall-panel geometry / exposure readiness");\n'
    '  await waitForBodyText(page, "Roof-panel geometry / exposure readiness");\n',
    "wall panel heading",
)
text = replace_once(
    text,
    '  await waitForBodyText(page, "Wind-action calculation: NO");\n',
    '  await waitForBodyText(page, "Wind-action calculation: NO");\n'
    '  await waitForBodyText(page, "Uplift calculation: NO");\n',
    "wall calculation status",
)
text = replace_once(
    text,
    '  record.checks.wallExposureReadinessPanelVisible = true;\n',
    '  record.checks.wallExposureReadinessPanelVisible = true;\n'
    '  record.checks.roofExposureReadinessPanelVisible = true;\n',
    "wall panel visible check",
)

roof_block = '''  // Roof exposure readiness: rotated roof geometry + explicit local normal/exposed-face declaration only.\n  await stage.selectOption("roof");\n  await page.getByLabel("Roof panel component", { exact: true }).selectOption("synthetic-roof-west");\n  await page.getByLabel("Roof panel normal axis", { exact: true }).selectOption("local_y");\n  await page.getByLabel("Roof exposed face", { exact: true }).selectOption("positive_normal");\n  await page.getByLabel("Roof exposure class", { exact: true }).selectOption("exterior");\n  await page.getByLabel("Roof normal axis source note", { exact: true }).fill("Synthetic browser QA local-y roof normal declaration only");\n  await page.getByLabel("Roof normal axis verification", { exact: true }).selectOption("unverified");\n  await page.getByLabel("Roof exposure source note", { exact: true }).fill("Synthetic browser QA exterior positive-face roof declaration only");\n  await page.getByLabel("Roof exposure verification", { exact: true }).selectOption("unverified");\n  await page.getByLabel("Roof readiness source note", { exact: true }).fill("Synthetic browser QA roof exposure readiness only");\n  await page.getByLabel("Roof readiness verification", { exact: true }).selectOption("unverified");\n\n  await waitForBodyText(page, "Roof readiness state: review_ready");\n  await waitForBodyText(page, "Roof ID: synthetic-roof-west");\n  await waitForBodyText(page, "Rotation(rad): (0, 0, 0.35)");\n  await waitForBodyText(page, "Declared normal axis: local_y");\n  await waitForBodyText(page, "Declared exposed face: positive_normal");\n  await waitForBodyText(page, "Exposure class: exterior");\n  await waitForBodyText(page, "Geometric box-face area: 9.840000 m² — GEOMETRY ONLY");\n  await waitForBodyText(page, "Roof zone: UNKNOWN / NOT DEFINED");\n  await waitForBodyText(page, "Effective wind area: UNKNOWN / NOT DEFINED");\n  await waitForBodyText(page, "Wind velocity / density / Cp / internal pressure / net pressure / uplift force: UNKNOWN / NOT DEFINED");\n  await waitForBodyText(page, "Panel stiffness / strength / connection demand / connection capacity: UNKNOWN / NOT DEFINED");\n  await waitForBodyText(page, "Uplift calculation: NO");\n  if (await page.locator('input[aria-label*="roof zone" i], input[aria-label*="pressure coefficient" i], input[aria-label*="uplift" i], input[aria-label*="effective wind area" i]').count()) {\n    fail("Roof readiness unexpectedly exposed aerodynamic/uplift calculation inputs");\n  }\n  record.checks.roofExposureExplicitInputsAccepted = true;\n  record.checks.roofRotatedGeometryPreserved = true;\n  record.checks.roofGeometricFaceAreaVerified = true;\n  record.checks.roofZoneAndEffectiveWindAreaRemainUndefined = true;\n  record.checks.roofUpliftCalculationBlocked = true;\n\n  // Lowering below roof activation must block retained roof assumptions while walls remain active.\n  await stage.selectOption("walls");\n  await waitForBodyText(page, "Roof readiness state: blocked_stage_before_roof");\n  await waitForBodyTextAbsent(page, "Roof ID: synthetic-roof-west");\n  await waitForBodyText(page, "Wall readiness state: review_ready");\n  record.checks.roofReadinessBlockedBelowActivationStage = true;\n\n'''
text = replace_once(
    text,
    '  // Lowering below wall activation must block retained wall assumptions.\n',
    roof_block + '  // Lowering below wall activation must block retained wall assumptions.\n',
    "wall lowering comment",
)

text = replace_once(
    text,
    '  await waitForBodyText(page, "Wall readiness state: blocked_stage_before_walls");\n  await waitForBodyTextAbsent(page, "synthetic-support-nw");\n',
    '  await waitForBodyText(page, "Wall readiness state: blocked_stage_before_walls");\n'
    '  await waitForBodyText(page, "Roof readiness state: blocked_stage_before_roof");\n'
    '  await waitForBodyTextAbsent(page, "synthetic-support-nw");\n',
    "empty-envelope wall blocked state",
)

path.write_text(text)
