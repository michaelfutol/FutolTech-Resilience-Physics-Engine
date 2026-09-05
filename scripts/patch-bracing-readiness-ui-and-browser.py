from pathlib import Path


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected exactly one anchor, found {count}: {old[:80]!r}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


viewport = Path("src/components/Viewport3D.tsx")
replace_once(
    viewport,
    'import ConnectionJointLocationReadinessPanel from "@/components/ConnectionJointLocationReadinessPanel";\n',
    'import ConnectionJointLocationReadinessPanel from "@/components/ConnectionJointLocationReadinessPanel";\nimport BracingTopologyReadinessPanel from "@/components/BracingTopologyReadinessPanel";\n',
)
replace_once(
    viewport,
    '          <ConnectionJointLocationReadinessPanel snapshot={phase4Snapshot} />\n\n          <p className="mt-3 border-t border-slate-800 pt-2 text-[10px] text-amber-300">',
    '          <ConnectionJointLocationReadinessPanel snapshot={phase4Snapshot} />\n\n          <BracingTopologyReadinessPanel snapshot={phase4Snapshot} />\n\n          <p className="mt-3 border-t border-slate-800 pt-2 text-[10px] text-amber-300">',
)

workflow = Path(".github/workflows/genesis-browser-acceptance.yml")
replace_once(
    workflow,
    '      - src/components/ConnectionJointLocationReadinessPanel.tsx\n',
    '      - src/components/ConnectionJointLocationReadinessPanel.tsx\n      - src/components/BracingTopologyReadinessPanel.tsx\n',
)
replace_once(
    workflow,
    '      - src/types/connectionJointLocationReadiness.ts\n',
    '      - src/types/connectionJointLocationReadiness.ts\n      - src/types/bracingTopologyReadiness.ts\n',
)

browser = Path("scripts/phase4-house-browser-acceptance.mjs")
replace_once(browser, 'schemaVersion: "0.7.0",', 'schemaVersion: "0.8.0",')
replace_once(
    browser,
    '    "Connection joint-location readiness preserves topology and accepts only an explicit caller-declared global joint point; it never infers midpoint/intersection/touching geometry and does not calculate connection mechanics.",\n',
    '    "Connection joint-location readiness preserves topology and accepts only an explicit caller-declared global joint point; it never infers midpoint/intersection/touching geometry and does not calculate connection mechanics.",\n    "Bracing topology readiness requires two distinct explicit brace-end connection records; visible diagonal geometry cannot create a missing end, physical joint point, stiffness, axial force, buckling model, racking contribution, capacity, or adequacy verdict.",\n',
)
replace_once(
    browser,
    '  await waitForBodyText(page, "Connection joint-location readiness");\n',
    '  await waitForBodyText(page, "Connection joint-location readiness");\n  await waitForBodyText(page, "Bracing topology readiness");\n',
)
replace_once(
    browser,
    '  await waitForBodyText(page, "Connection mechanics: NO");\n  record.checks.phase4ViewerOpened = true;',
    '  await waitForBodyText(page, "Connection mechanics: NO");\n  await waitForBodyText(page, "Bracing mechanics: NO");\n  record.checks.phase4ViewerOpened = true;',
)
replace_once(
    browser,
    '  record.checks.wallExposureReadinessPanelVisible = true;\n',
    '  record.checks.wallExposureReadinessPanelVisible = true;\n  record.checks.bracingTopologyReadinessPanelVisible = true;\n',
)

anchor = '''  record.checks.connectionExplicitJointPointAccepted = true;\n  record.checks.connectionMechanicsRemainUnavailable = true;\n\n  // Lowering below connection activation must invalidate the retained location while roof review remains valid.\n'''
insert = '''  record.checks.connectionExplicitJointPointAccepted = true;\n  record.checks.connectionMechanicsRemainUnavailable = true;\n\n  // Bracing topology readiness: the current synthetic diagonal has only one explicit brace-end relationship.\n  await stage.selectOption("bracing");\n  await page.getByLabel("Bracing component", { exact: true }).selectOption("synthetic-brace-north-west");\n  await page.getByLabel("Bracing end A connection", { exact: true }).selectOption("synthetic-connection-brace-west");\n  await page.getByLabel("Bracing readiness source note", { exact: true }).fill("Synthetic browser QA bracing topology review only");\n  await page.getByLabel("Bracing readiness verification", { exact: true }).selectOption("unverified");\n\n  await waitForBodyText(page, "Bracing topology state: load_path_incomplete");\n  await waitForBodyText(page, "Brace ID: synthetic-brace-north-west");\n  await waitForBodyText(page, "Brace material: UNKNOWN");\n  await waitForBodyText(page, "Brace mass: UNKNOWN");\n  await waitForBodyText(page, "Explicit incident connections: 1");\n  await waitForBodyText(page, "Explicit selected brace ends: 1 / 2");\n  await waitForBodyText(page, "End A: synthetic-connection-brace-west");\n  await waitForBodyText(page, "End B: UNKNOWN");\n  await waitForBodyText(page, "Physical joint locations: UNKNOWN / NOT REVIEWED IN THIS GATE");\n  await waitForBodyText(page, "Inferred joint locations: NONE — PROHIBITED");\n  await waitForBodyText(page, "Bracing mechanics: NO");\n  await waitForBodyText(page, "Axial force / tension-compression / stiffness / effective length / slenderness / buckling: UNKNOWN / NOT EVALUATED");\n  await waitForBodyText(page, "Racking contribution / demand / capacity / utilization / PASS-FAIL / load-path adequacy: UNKNOWN / NOT EVALUATED");\n  if (await page.locator('input[aria-label*="axial force" i], input[aria-label*="brace capacity" i], input[aria-label*="slenderness" i], input[aria-label*="buckling" i], input[aria-label*="racking contribution" i]').count()) {\n    fail("Bracing topology readiness unexpectedly exposed mechanics/capacity inputs");\n  }\n  record.checks.bracingVisibleDiagonalDoesNotCreateSecondEnd = true;\n  record.checks.bracingIncompleteLoadPathVisible = true;\n  record.checks.bracingMechanicsRemainUnavailable = true;\n\n  // Lowering below bracing activation must block retained brace topology.\n  await stage.selectOption("connections");\n  await waitForBodyText(page, "Bracing topology state: blocked_stage_before_bracing");\n  await waitForBodyTextAbsent(page, "Brace ID: synthetic-brace-north-west");\n  record.checks.bracingReadinessBlockedBelowActivationStage = true;\n\n  // Lowering below connection activation must invalidate the retained location while roof review remains valid.\n'''
replace_once(browser, anchor, insert)

print("Bracing UI and real-browser acceptance patch applied deterministically.")
