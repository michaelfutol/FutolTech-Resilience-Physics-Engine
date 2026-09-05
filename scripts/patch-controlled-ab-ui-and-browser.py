from pathlib import Path


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(
            f"{path}: expected exactly one anchor, found {count}: {old[:140]!r}"
        )
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


viewport = Path("src/components/Viewport3D.tsx")
replace_once(
    viewport,
    'import StormProtectionTopologyReadinessPanel from "@/components/StormProtectionTopologyReadinessPanel";\n',
    'import StormProtectionTopologyReadinessPanel from "@/components/StormProtectionTopologyReadinessPanel";\nimport SmallHouseControlledABPanel from "@/components/SmallHouseControlledABPanel";\n',
)
replace_once(
    viewport,
    '          <StormProtectionTopologyReadinessPanel snapshot={phase4Snapshot} />\n\n          <p className="mt-3 border-t border-slate-800 pt-2 text-[10px] text-amber-300">VISIBLE ≠ ADEQUATE.',
    '          <StormProtectionTopologyReadinessPanel snapshot={phase4Snapshot} />\n\n          <SmallHouseControlledABPanel snapshot={phase4Snapshot} />\n\n          <p className="mt-3 border-t border-slate-800 pt-2 text-[10px] text-amber-300">VISIBLE ≠ ADEQUATE.',
)

browser = Path("scripts/phase4-house-browser-acceptance.mjs")
replace_once(
    browser,
    '  schemaVersion: "0.10.0",\n',
    '  schemaVersion: "0.11.0",\n',
)
replace_once(
    browser,
    '    "Storm-protection topology readiness requires two distinct explicit incident connection records to two distinct active opposite endpoint components; visible strap geometry cannot create a missing end, attachment point, preload, stiffness, demand, capacity, PASS/FAIL, or whole-house benefit.",\n',
    '    "Storm-protection topology readiness requires two distinct explicit incident connection records to two distinct active opposite endpoint components; visible strap geometry cannot create a missing end, attachment point, preload, stiffness, demand, capacity, PASS/FAIL, or whole-house benefit.",\n    "Controlled A/B comparison in this gate proves only that exactly one declared connection record differs while unrelated specimen inputs remain invariant; it does not compare structural performance or establish a stronger/better variant.",\n',
)
replace_once(
    browser,
    '  await waitForBodyText(page, "Storm Protection restraint topology readiness");\n',
    '  await waitForBodyText(page, "Storm Protection restraint topology readiness");\n  await waitForBodyText(page, "Controlled A/B specimen difference");\n',
)
replace_once(
    browser,
    '  record.checks.stormProtectionTopologyReadinessPanelVisible = true;\n',
    '  record.checks.stormProtectionTopologyReadinessPanelVisible = true;\n  record.checks.controlledABPanelVisible = true;\n',
)
replace_once(
    browser,
    '  record.checks.stormProtectionCanonicalPathIncomplete = true;\n  record.checks.stormProtectionVisibleStrapDoesNotCreateSecondEnd = true;\n  record.checks.stormProtectionMechanicsRemainUnavailable = true;\n\n  // Lowering below storm-protection activation must block retained restraint topology.\n',
    '  record.checks.stormProtectionCanonicalPathIncomplete = true;\n  record.checks.stormProtectionVisibleStrapDoesNotCreateSecondEnd = true;\n  record.checks.stormProtectionMechanicsRemainUnavailable = true;\n\n  // Controlled A/B input-review: exactly one declared connection record differs; no performance ranking.\n  await waitForBodyText(page, "Controlled A/B state: controlled_input_difference");\n  await waitForBodyText(page, "Evidence layer: rpe_input_review");\n  await waitForBodyText(page, "Case A: A — canonical one-ended storm strap");\n  await waitForBodyText(page, "Case B: B — QA-only explicit second storm endpoint");\n  await waitForBodyText(page, "Same specimen ID: synthetic-phase4-house-browser-001");\n  await waitForBodyText(page, "Change kind: connection_record_added");\n  await waitForBodyText(page, "Connection record: synthetic-connection-storm-west-second-end");\n  await waitForBodyText(page, "Explicit topology: synthetic-storm-strap-west → synthetic-anchor-nw");\n  await waitForBodyText(page, "Added capacity: UNKNOWN");\n  await waitForBodyText(page, "Specimen metadata unchanged: YES");\n  await waitForBodyText(page, "Envelope unchanged: YES");\n  await waitForBodyText(page, "Component records unchanged: YES");\n  await waitForBodyText(page, "Component geometry unchanged: YES");\n  await waitForBodyText(page, "Existing connections unchanged: YES");\n  await waitForBodyText(page, "Only declared connection added: YES");\n  await waitForBodyText(page, "Mechanics available: NO");\n  await waitForBodyText(page, "Performance comparison: NO");\n  await waitForBodyText(page, "Performance conclusion: NOT AVAILABLE");\n  await waitForBodyText(page, "NO WINNER / NO STRENGTH RANKING");\n  record.checks.controlledABExactlyOneDeclaredDifference = true;\n  record.checks.controlledABUnrelatedInputsInvariant = true;\n  record.checks.controlledABPerformanceRankingUnavailable = true;\n\n  // Lowering below storm-protection activation must block retained restraint topology and A/B review.\n',
)
replace_once(
    browser,
    '  await waitForBodyText(page, "Storm restraint topology state: blocked_stage_before_storm_protection");\n  await waitForBodyTextAbsent(page, "Restraint member ID: synthetic-storm-strap-west");\n  record.checks.stormProtectionReadinessBlockedBelowActivationStage = true;\n',
    '  await waitForBodyText(page, "Storm restraint topology state: blocked_stage_before_storm_protection");\n  await waitForBodyText(page, "Controlled A/B state: BLOCKED — STORM PROTECTION STAGE REQUIRED");\n  await waitForBodyTextAbsent(page, "Restraint member ID: synthetic-storm-strap-west");\n  await waitForBodyTextAbsent(page, "Connection record: synthetic-connection-storm-west-second-end");\n  record.checks.stormProtectionReadinessBlockedBelowActivationStage = true;\n  record.checks.controlledABBlockedBelowStormProtectionStage = true;\n',
)
replace_once(
    browser,
    '  await waitForBodyText(page, "Storm restraint topology state: blocked_stage_before_storm_protection");\n  await waitForBodyTextAbsent(page, "synthetic-support-nw");\n',
    '  await waitForBodyText(page, "Storm restraint topology state: blocked_stage_before_storm_protection");\n  await waitForBodyText(page, "Controlled A/B state: BLOCKED — STORM PROTECTION STAGE REQUIRED");\n  await waitForBodyTextAbsent(page, "synthetic-support-nw");\n',
)
