from pathlib import Path


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(
            f"{path}: expected exactly one anchor, found {count}: {old[:110]!r}"
        )
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


viewport = Path("src/components/Viewport3D.tsx")
replace_once(
    viewport,
    'import AnchorageInterfaceReadinessPanel from "@/components/AnchorageInterfaceReadinessPanel";\n',
    'import AnchorageInterfaceReadinessPanel from "@/components/AnchorageInterfaceReadinessPanel";\nimport StormProtectionTopologyReadinessPanel from "@/components/StormProtectionTopologyReadinessPanel";\n',
)
replace_once(
    viewport,
    '          <AnchorageInterfaceReadinessPanel snapshot={phase4Snapshot} />\n\n          <p className="mt-3 border-t border-slate-800 pt-2 text-[10px] text-amber-300">',
    '          <AnchorageInterfaceReadinessPanel snapshot={phase4Snapshot} />\n\n          <StormProtectionTopologyReadinessPanel snapshot={phase4Snapshot} />\n\n          <p className="mt-3 border-t border-slate-800 pt-2 text-[10px] text-amber-300">',
)

browser = Path("scripts/phase4-house-browser-acceptance.mjs")
replace_once(browser, '  schemaVersion: "0.9.0",\n', '  schemaVersion: "0.10.0",\n')
replace_once(
    browser,
    '    "Anchorage interface readiness identifies only an explicit anchor-to-primary-support topology relationship; it does not infer the physical attachment point, bolt/rod, embedment, base plate, pedestal/footing, concrete/soil properties, reactions, resistance, capacity, or adequacy.",\n',
    '    "Anchorage interface readiness identifies only an explicit anchor-to-primary-support topology relationship; it does not infer the physical attachment point, bolt/rod, embedment, base plate, pedestal/footing, concrete/soil properties, reactions, resistance, capacity, or adequacy.",\n    "Storm-protection topology readiness requires two distinct explicit incident connection records to two distinct active opposite endpoint components; visible strap geometry cannot create a missing end, attachment point, preload, stiffness, demand, capacity, PASS/FAIL, or whole-house benefit.",\n',
)
replace_once(
    browser,
    '  await waitForBodyText(page, "Anchorage interface readiness");\n  await waitForBodyText(page, "Readiness contract calculation: NO");',
    '  await waitForBodyText(page, "Anchorage interface readiness");\n  await waitForBodyText(page, "Storm Protection restraint topology readiness");\n  await waitForBodyText(page, "Readiness contract calculation: NO");',
)
replace_once(
    browser,
    '  await waitForBodyText(page, "Anchorage mechanics: NO");\n  record.checks.phase4ViewerOpened = true;',
    '  await waitForBodyText(page, "Anchorage mechanics: NO");\n  await waitForBodyText(page, "Storm protection mechanics: NO");\n  record.checks.phase4ViewerOpened = true;',
)
replace_once(
    browser,
    '  record.checks.anchorageInterfaceReadinessPanelVisible = true;\n  record.checks.roofExposureReadinessPanelVisible = true;',
    '  record.checks.anchorageInterfaceReadinessPanelVisible = true;\n  record.checks.stormProtectionTopologyReadinessPanelVisible = true;\n  record.checks.roofExposureReadinessPanelVisible = true;',
)

anchor = '''  record.checks.anchorageExplicitInterfaceIdentityAccepted = true;
  record.checks.anchoragePhysicalAttachmentNotInferred = true;
  record.checks.anchorageMechanicsRemainUnavailable = true;

  // Lowering below anchorage activation must block retained anchor-interface review.
'''
replacement = '''  record.checks.anchorageExplicitInterfaceIdentityAccepted = true;
  record.checks.anchoragePhysicalAttachmentNotInferred = true;
  record.checks.anchorageMechanicsRemainUnavailable = true;

  // Storm Protection topology readiness: canonical strap has one explicit roof-side relationship only.
  await stage.selectOption("storm_protection");
  await page.getByLabel("Storm protection member", { exact: true }).selectOption("synthetic-storm-strap-west");
  await page.getByLabel("Storm restraint End A connection", { exact: true }).selectOption("synthetic-connection-storm-west");
  await page.getByLabel("Storm restraint readiness source note", { exact: true }).fill("Synthetic browser QA storm-restraint topology review only");
  await page.getByLabel("Storm restraint readiness verification", { exact: true }).selectOption("unverified");

  await waitForBodyText(page, "Storm restraint topology state: restraint_path_incomplete");
  await waitForBodyText(page, "Restraint member ID: synthetic-storm-strap-west");
  await waitForBodyText(page, "Restraint material: UNKNOWN");
  await waitForBodyText(page, "Restraint mass: UNKNOWN");
  await waitForBodyText(page, "Explicit selected ends: 1 / 2");
  await waitForBodyText(page, "Explicit incident relationships: 1");
  await waitForBodyText(page, "End A connection: synthetic-connection-storm-west");
  await waitForBodyText(page, "End B connection: UNKNOWN");
  await waitForBodyText(page, "Physical attachment points: UNKNOWN / NOT DEFINED");
  await waitForBodyText(page, "Inferred attachment points: NONE — PROHIBITED");
  await waitForBodyText(page, "Storm protection mechanics: NO");
  await waitForBodyText(page, "Tension / preload / stiffness / slack / elongation: UNKNOWN / NOT EVALUATED");
  await waitForBodyText(page, "Wind-uplift demand / restraint force / load sharing: UNKNOWN / NOT EVALUATED");
  await waitForBodyText(page, "Fasteners / attachments / member & connection capacity: UNKNOWN / NOT EVALUATED");
  await waitForBodyText(page, "Utilization / PASS-FAIL / whole-house improvement: UNKNOWN / NOT EVALUATED");
  if (await page.locator('input[aria-label*="tension" i], input[aria-label*="preload" i], input[aria-label*="stiffness" i], input[aria-label*="slack" i], input[aria-label*="storm capacity" i], input[aria-label*="restraint force" i]').count()) {
    fail("Storm Protection topology readiness unexpectedly exposed mechanics/capacity inputs");
  }
  record.checks.stormProtectionCanonicalPathIncomplete = true;
  record.checks.stormProtectionVisibleStrapDoesNotCreateSecondEnd = true;
  record.checks.stormProtectionMechanicsRemainUnavailable = true;

  // Lowering below storm-protection activation must block retained restraint topology.
  await stage.selectOption("anchorage");
  await waitForBodyText(page, "Storm restraint topology state: blocked_stage_before_storm_protection");
  await waitForBodyTextAbsent(page, "Restraint member ID: synthetic-storm-strap-west");
  record.checks.stormProtectionReadinessBlockedBelowActivationStage = true;

  // Lowering below anchorage activation must block retained anchor-interface review.
'''
replace_once(browser, anchor, replacement)
replace_once(
    browser,
    '  await waitForBodyText(page, "Anchorage interface state: blocked_stage_before_anchorage");\n  await waitForBodyTextAbsent(page, "synthetic-support-nw");',
    '  await waitForBodyText(page, "Anchorage interface state: blocked_stage_before_anchorage");\n  await waitForBodyText(page, "Storm restraint topology state: blocked_stage_before_storm_protection");\n  await waitForBodyTextAbsent(page, "synthetic-support-nw");',
)

print("Storm Protection UI and real-browser acceptance patch applied deterministically.")
