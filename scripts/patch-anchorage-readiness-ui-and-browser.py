from pathlib import Path


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(
            f"{path}: expected exactly one anchor, found {count}: {old[:100]!r}"
        )
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


viewport = Path("src/components/Viewport3D.tsx")
replace_once(
    viewport,
    'import BracingTopologyReadinessPanel from "@/components/BracingTopologyReadinessPanel";\n',
    'import BracingTopologyReadinessPanel from "@/components/BracingTopologyReadinessPanel";\nimport AnchorageInterfaceReadinessPanel from "@/components/AnchorageInterfaceReadinessPanel";\n',
)
replace_once(
    viewport,
    '          <BracingTopologyReadinessPanel snapshot={phase4Snapshot} />\n\n          <p className="mt-3 border-t border-slate-800 pt-2 text-[10px] text-amber-300">',
    '          <BracingTopologyReadinessPanel snapshot={phase4Snapshot} />\n\n          <AnchorageInterfaceReadinessPanel snapshot={phase4Snapshot} />\n\n          <p className="mt-3 border-t border-slate-800 pt-2 text-[10px] text-amber-300">',
)

browser = Path("scripts/phase4-house-browser-acceptance.mjs")
replace_once(browser, '  schemaVersion: "0.8.0",\n', '  schemaVersion: "0.9.0",\n')
replace_once(
    browser,
    '    "Bracing topology readiness requires two distinct explicit brace-end connection records; visible diagonal geometry cannot create a missing end, physical joint point, stiffness, axial force, buckling model, racking contribution, capacity, or adequacy verdict.",\n',
    '    "Bracing topology readiness requires two distinct explicit brace-end connection records; visible diagonal geometry cannot create a missing end, physical joint point, stiffness, axial force, buckling model, racking contribution, capacity, or adequacy verdict.",\n    "Anchorage interface readiness identifies only an explicit anchor-to-primary-support topology relationship; it does not infer the physical attachment point, bolt/rod, embedment, base plate, pedestal/footing, concrete/soil properties, reactions, resistance, capacity, or adequacy.",\n',
)
replace_once(
    browser,
    '  await waitForBodyText(page, "Bracing topology readiness");\n  await waitForBodyText(page, "Readiness contract calculation: NO");',
    '  await waitForBodyText(page, "Bracing topology readiness");\n  await waitForBodyText(page, "Anchorage interface readiness");\n  await waitForBodyText(page, "Readiness contract calculation: NO");',
)
replace_once(
    browser,
    '  await waitForBodyText(page, "Bracing mechanics: NO");\n  record.checks.phase4ViewerOpened = true;',
    '  await waitForBodyText(page, "Bracing mechanics: NO");\n  await waitForBodyText(page, "Anchorage mechanics: NO");\n  record.checks.phase4ViewerOpened = true;',
)
replace_once(
    browser,
    '  record.checks.bracingTopologyReadinessPanelVisible = true;\n  record.checks.roofExposureReadinessPanelVisible = true;',
    '  record.checks.bracingTopologyReadinessPanelVisible = true;\n  record.checks.anchorageInterfaceReadinessPanelVisible = true;\n  record.checks.roofExposureReadinessPanelVisible = true;',
)

bracing_end = '''  record.checks.bracingVisibleDiagonalDoesNotCreateSecondEnd = true;
  record.checks.bracingIncompleteLoadPathVisible = true;
  record.checks.bracingMechanicsRemainUnavailable = true;

  // Lowering below bracing activation must block retained brace topology.
'''
anchorage_block = '''  record.checks.bracingVisibleDiagonalDoesNotCreateSecondEnd = true;
  record.checks.bracingIncompleteLoadPathVisible = true;
  record.checks.bracingMechanicsRemainUnavailable = true;

  // Anchorage interface readiness: explicit topology identity only; no physical anchorage mechanics.
  await stage.selectOption("anchorage");
  await page.getByLabel("Anchorage component", { exact: true }).selectOption("synthetic-anchor-nw");
  await page.getByLabel("Anchorage attachment connection", { exact: true }).selectOption("synthetic-connection-anchor-nw");
  await page.getByLabel("Anchorage readiness source note", { exact: true }).fill("Synthetic browser QA anchorage interface identity only");
  await page.getByLabel("Anchorage readiness verification", { exact: true }).selectOption("unverified");

  await waitForBodyText(page, "Anchorage interface state: review_ready_interface");
  await waitForBodyText(page, "Anchor ID: synthetic-anchor-nw");
  await waitForBodyText(page, "Attachment connection: synthetic-connection-anchor-nw");
  await waitForBodyText(page, "Support ID: synthetic-support-nw");
  await waitForBodyText(page, "Anchor material: UNKNOWN");
  await waitForBodyText(page, "Anchor mass: UNKNOWN");
  await waitForBodyText(page, "Topology capacity: UNKNOWN");
  await waitForBodyText(page, "Physical attachment point: UNKNOWN / NOT DEFINED");
  await waitForBodyText(page, "Inferred attachment point: NONE — PROHIBITED");
  await waitForBodyText(page, "Anchorage mechanics: NO");
  await waitForBodyText(page, "Bolt/rod type & diameter / embedment / base plate / weld-fastener details: UNKNOWN / NOT DEFINED");
  await waitForBodyText(page, "Pedestal / footing / concrete strength / soil model / bearing / friction: UNKNOWN / NOT DEFINED");
  await waitForBodyText(page, "Uplift & shear reactions / sliding & overturning resistance / pullout & breakout: UNKNOWN / NOT EVALUATED");
  await waitForBodyText(page, "Demand / capacity / utilization / PASS-FAIL: UNKNOWN / NOT EVALUATED");
  if (await page.locator('input[aria-label*="bolt" i], input[aria-label*="embedment" i], input[aria-label*="footing" i], input[aria-label*="soil" i], input[aria-label*="uplift" i], input[aria-label*="sliding" i], input[aria-label*="anchorage capacity" i]').count()) {
    fail("Anchorage interface readiness unexpectedly exposed mechanics/capacity inputs");
  }
  record.checks.anchorageExplicitInterfaceIdentityAccepted = true;
  record.checks.anchoragePhysicalAttachmentNotInferred = true;
  record.checks.anchorageMechanicsRemainUnavailable = true;

  // Lowering below anchorage activation must block retained anchor-interface review.
  await stage.selectOption("bracing");
  await waitForBodyText(page, "Anchorage interface state: blocked_stage_before_anchorage");
  await waitForBodyTextAbsent(page, "Anchor ID: synthetic-anchor-nw");
  record.checks.anchorageReadinessBlockedBelowActivationStage = true;

  // Lowering below bracing activation must block retained brace topology.
'''
replace_once(browser, bracing_end, anchorage_block)
replace_once(
    browser,
    '  await waitForBodyText(page, "Connection location state: blocked_stage_before_connections");\n  await waitForBodyTextAbsent(page, "synthetic-support-nw");',
    '  await waitForBodyText(page, "Connection location state: blocked_stage_before_connections");\n  await waitForBodyText(page, "Anchorage interface state: blocked_stage_before_anchorage");\n  await waitForBodyTextAbsent(page, "synthetic-support-nw");',
)

print("Anchorage UI and real-browser acceptance patch applied deterministically.")
