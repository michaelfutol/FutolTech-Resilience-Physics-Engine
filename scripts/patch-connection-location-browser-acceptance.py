from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected exactly one {label} anchor; found {count}")
    return text.replace(old, new, 1)


path = Path("scripts/phase4-house-browser-acceptance.mjs")
text = path.read_text()

text = replace_once(text, 'schemaVersion: "0.6.0",', 'schemaVersion: "0.7.0",', "browser schema version")

text = replace_once(
    text,
    '    "Roof-panel readiness preserves rotated geometry and explicit local-normal/exposed-face declarations only; it does not define roof zones, effective wind area, pressure coefficients, uplift force, connection demand/capacity, or wind resistance.",\n',
    '    "Roof-panel readiness preserves rotated geometry and explicit local-normal/exposed-face declarations only; it does not define roof zones, effective wind area, pressure coefficients, uplift force, connection demand/capacity, or wind resistance.",\n'
    '    "Connection joint-location readiness preserves topology and accepts only an explicit caller-declared global joint point; it never infers midpoint/intersection/touching geometry and does not calculate connection mechanics.",\n',
    "roof limitation",
)

text = replace_once(
    text,
    '  await waitForBodyText(page, "Roof-panel geometry / exposure readiness");\n',
    '  await waitForBodyText(page, "Roof-panel geometry / exposure readiness");\n'
    '  await waitForBodyText(page, "Connection joint-location readiness");\n',
    "roof panel heading",
)

text = replace_once(
    text,
    '  await waitForBodyText(page, "Uplift calculation: NO");\n  record.checks.phase4ViewerOpened = true;\n',
    '  await waitForBodyText(page, "Uplift calculation: NO");\n'
    '  await waitForBodyText(page, "Connection mechanics: NO");\n'
    '  record.checks.phase4ViewerOpened = true;\n',
    "initial uplift status",
)

text = replace_once(
    text,
    '  record.checks.roofExposureReadinessPanelVisible = true;\n',
    '  record.checks.roofExposureReadinessPanelVisible = true;\n'
    '  record.checks.connectionJointLocationPanelVisible = true;\n',
    "roof panel visible check",
)

connection_block = '''  // Connection joint-location readiness: topology known first, physical point unknown until explicitly declared.\n  await stage.selectOption("connections");\n  await page.getByLabel("Connection component relationship", { exact: true }).selectOption("synthetic-connection-support-ring-nw");\n  await page.getByLabel("Connection readiness source note", { exact: true }).fill("Synthetic browser QA connection-location review only");\n  await page.getByLabel("Connection readiness verification", { exact: true }).selectOption("unverified");\n\n  await waitForBodyText(page, "Connection location state: location_unknown");\n  await waitForBodyText(page, "Connection ID: synthetic-connection-support-ring-nw");\n  await waitForBodyText(page, "From component: synthetic-support-nw");\n  await waitForBodyText(page, "To component: synthetic-ring-north");\n  await waitForBodyText(page, "Stored topology capacity: UNKNOWN");\n  await waitForBodyText(page, "Physical global joint point: UNKNOWN");\n  await waitForBodyText(page, "Coordinate basis: unknown");\n  await waitForBodyText(page, "Inferred joint point: NONE — PROHIBITED");\n  await waitForBodyText(page, "Connection mechanics: NO");\n  record.checks.connectionTopologyKnownLocationUnknown = true;\n  record.checks.connectionNoInferredPointVisible = true;\n\n  await page.getByLabel("Connection joint X (m)", { exact: true }).fill("-1.7");\n  await page.getByLabel("Connection joint Y (m)", { exact: true }).fill("0.6");\n  await page.getByLabel("Connection joint Z (m)", { exact: true }).fill("-2.2");\n  await page.getByLabel("Connection joint source note", { exact: true }).fill("Synthetic browser QA explicitly declared global joint point only");\n  await page.getByLabel("Connection joint verification", { exact: true }).selectOption("unverified");\n\n  await waitForBodyText(page, "Connection location state: review_ready");\n  await waitForBodyText(page, "Physical global joint point: (-1.7, 0.6, -2.2) m — CALLER DECLARED");\n  await waitForBodyText(page, "Coordinate basis: caller_declared_global_point");\n  await waitForBodyText(page, "Inferred joint point: NONE — PROHIBITED");\n  await waitForBodyText(page, "Connector path / axis / shape / bearing area: UNKNOWN / NOT DEFINED");\n  await waitForBodyText(page, "Stiffness / slip / fasteners / welds: UNKNOWN / NOT DEFINED");\n  await waitForBodyText(page, "Demand / capacity assessment / utilization / PASS-FAIL / load transfer: UNKNOWN / NOT EVALUATED");\n  await waitForBodyText(page, "Connection mechanics: NO");\n  if (await page.locator('input[aria-label*="connection demand" i], input[aria-label*="connection capacity" i], input[aria-label*="fastener count" i], input[aria-label*="connector path" i]').count()) {\n    fail("Connection location readiness unexpectedly exposed mechanics inputs");\n  }\n  record.checks.connectionExplicitJointPointAccepted = true;\n  record.checks.connectionMechanicsRemainUnavailable = true;\n\n  // Lowering below connection activation must invalidate the retained location while roof review remains valid.\n  await stage.selectOption("roof");\n  await waitForBodyText(page, "Connection location state: blocked_stage_before_connections");\n  await waitForBodyTextAbsent(page, "Connection ID: synthetic-connection-support-ring-nw");\n  await waitForBodyText(page, "Roof readiness state: review_ready");\n  record.checks.connectionLocationBlockedBelowActivationStage = true;\n\n'''
text = replace_once(
    text,
    '  // Lowering below roof activation must block retained roof assumptions while walls remain active.\n',
    connection_block + '  // Lowering below roof activation must block retained roof assumptions while walls remain active.\n',
    "roof lowering comment",
)

text = replace_once(
    text,
    '  await waitForBodyText(page, "Roof readiness state: blocked_stage_before_roof");\n  await waitForBodyTextAbsent(page, "synthetic-support-nw");\n',
    '  await waitForBodyText(page, "Roof readiness state: blocked_stage_before_roof");\n'
    '  await waitForBodyText(page, "Connection location state: blocked_stage_before_connections");\n'
    '  await waitForBodyTextAbsent(page, "synthetic-support-nw");\n',
    "empty-envelope roof blocked state",
)

path.write_text(text)
