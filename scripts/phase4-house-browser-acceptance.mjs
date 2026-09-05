import fs from "node:fs/promises";
import process from "node:process";
import { chromium } from "playwright";

const baseUrl = process.env.RPE_BASE_URL ?? "http://127.0.0.1:3000";
const outputPath = process.env.RPE_PHASE4_BROWSER_ACCEPTANCE_OUTPUT ?? "phase4-house-browser-acceptance.json";
const screenshotPath = process.env.RPE_PHASE4_BROWSER_ACCEPTANCE_SCREENSHOT ?? "phase4-house-browser-acceptance.png";

function fail(message) {
  throw new Error(message);
}

async function waitForBodyText(page, text, timeout = 10000) {
  await page.locator("body").getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout });
}

async function waitForBodyTextAbsent(page, text, timeout = 5000) {
  const locator = page.locator("body").getByText(text, { exact: false });
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if ((await locator.count()) === 0) return;
    const visible = await locator.first().isVisible().catch(() => false);
    if (!visible) return;
    await page.waitForTimeout(100);
  }
  fail(`Expected text to be absent: ${text}`);
}

const record = {
  schemaVersion: "0.3.0",
  evidenceLayer: "browser_qa",
  browser: "chromium",
  baseUrl,
  fixture: "synthetic-phase4-house-browser-001",
  checks: {},
  consoleErrors: [],
  pageErrors: [],
  limitations: [
    "Software/browser QA only; not an engineering performance benchmark.",
    "Synthetic house dimensions and topology are not adopted Dignity production geometry.",
    "Visible geometry does not establish structural capacity, code compliance, wind resistance, or material performance.",
    "Connection topology has no physical joint-coordinate contract yet, so the viewer intentionally draws no connection lines.",
    "Primary-support readiness is an input-review evidence layer, not a structural-response calculation.",
    "The isolated cantilever calculator is an RPE analytical formula benchmark only; it does not evaluate strength, PASS/FAIL, whole-house load path, solver response, or code compliance.",
  ],
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });

page.on("console", (message) => {
  if (message.type() === "error") record.consoleErrors.push(message.text());
});
page.on("pageerror", (error) => record.pageErrors.push(String(error)));

try {
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 30000 });
  await page.getByRole("button", { name: "Small House", exact: true }).click();
  await waitForBodyText(page, "Phase 4 Test Chamber — staged small-house topology review");
  await waitForBodyText(page, "Synthetic Phase 4 staged-house QA fixture");
  await waitForBodyText(page, "VISIBLE ≠ ADEQUATE");
  await waitForBodyText(page, "Primary-support mechanics readiness");
  await waitForBodyText(page, "Readiness contract calculation: NO");
  record.checks.phase4ViewerOpened = true;
  record.checks.performanceDisclaimerVisible = true;
  record.checks.primarySupportReadinessPanelVisible = true;

  const stage = page.getByLabel("Phase 4 stage", { exact: true });
  if ((await stage.count()) !== 1) fail(`Expected one Phase 4 stage selector; found ${await stage.count()}`);

  if ((await stage.inputValue()) !== "empty_envelope") fail("Phase 4 viewer did not default to empty_envelope");
  await waitForBodyText(page, "Structural result: N/A");
  await waitForBodyText(page, "Reason: no_physical_specimen");
  await waitForBodyText(page, "Declared components: 0");
  await waitForBodyText(page, "Declared topology connections: 0");
  await waitForBodyText(page, "No physical component exists in this stage. Envelope only.");
  record.checks.emptyEnvelopeIsNA = true;

  const expectations = [
    ["primary_supports", 4, 0, "synthetic-support-nw"],
    ["floor_ring_frame", 8, 0, "synthetic-ring-north"],
    ["walls", 12, 0, "synthetic-wall-north"],
    ["roof", 14, 0, "synthetic-roof-west"],
    ["connections", 14, 10, "synthetic-connection-support-ring-nw"],
    ["bracing", 16, 12, "synthetic-brace-north-west"],
    ["anchorage", 20, 16, "synthetic-anchor-nw"],
    ["storm_protection", 22, 18, "synthetic-storm-strap-west"],
  ];

  for (const [stageValue, components, connections, requiredIdentity] of expectations) {
    await stage.selectOption(stageValue);
    await waitForBodyText(page, `Stage: ${stageValue}`);
    await waitForBodyText(page, `Declared components: ${components}`);
    await waitForBodyText(page, `Declared topology connections: ${connections}`);
    await waitForBodyText(page, requiredIdentity);
    await waitForBodyText(page, "Structural result: DECLARED_COMPONENTS_ONLY");
  }
  record.checks.orderedStageProgressionVerified = true;

  await waitForBodyText(page, "material=UNKNOWN");
  await waitForBodyText(page, "mass=UNKNOWN");
  await waitForBodyText(page, "capacity=UNKNOWN");
  await waitForBodyText(page, "Connections list object relationships only. No joint coordinate is declared yet");
  record.checks.unknownEngineeringPropertiesRemainVisible = true;
  record.checks.connectionGeometryLimitationVisible = true;

  await waitForBodyText(page, "synthetic-roof-west");
  await waitForBodyText(page, "rotation(rad)=(0, 0, 0.35)");
  await waitForBodyText(page, "synthetic-brace-north-west");
  await waitForBodyText(page, "rotation(rad)=(0, 0, -0.72)");
  record.checks.explicitOrientationVisible = true;

  // Primary-support readiness: explicit assumptions, no silent property inference.
  await stage.selectOption("primary_supports");
  await page.getByLabel("Primary support component", { exact: true }).selectOption("synthetic-support-nw");
  await page.getByLabel("Primary support longitudinal axis", { exact: true }).selectOption("local_y");
  await page.getByLabel("End A label", { exact: true }).fill("lower end");
  await page.getByLabel("End B label", { exact: true }).fill("upper end");

  for (const dof of ["ux", "uy", "uz", "rx", "ry", "rz"]) {
    await page.getByLabel(`End A restraint ${dof}`, { exact: true }).selectOption("restrained");
    await page.getByLabel(`End B restraint ${dof}`, { exact: true }).selectOption("free");
  }

  await page.getByLabel("End A source note", { exact: true }).fill("Synthetic browser QA fixed-base assumption only");
  await page.getByLabel("End B source note", { exact: true }).fill("Synthetic browser QA free-end assumption only");
  await page.getByLabel("End A restraint verification", { exact: true }).selectOption("unverified");
  await page.getByLabel("End B restraint verification", { exact: true }).selectOption("unverified");
  await page.getByLabel("Readiness source note", { exact: true }).fill("Synthetic browser QA readiness idealization only");
  await page.getByLabel("Primary support readiness verification", { exact: true }).selectOption("unverified");

  await waitForBodyText(page, "Readiness state: review_ready_with_unknowns");
  await waitForBodyText(page, "Support ID: synthetic-support-nw");
  await waitForBodyText(page, "Readiness contract calculation: NO");
  await waitForBodyText(page, "Section area: UNKNOWN — NOT DERIVED FROM BOX SIZE");
  await waitForBodyText(page, "Strength data: UNKNOWN / NONE SUPPLIED");
  await waitForBodyText(page, "sectionAreaM2");
  await waitForBodyText(page, "Cantilever analytical result: NOT AVAILABLE");
  record.checks.primarySupportReadinessExplicitInputsAccepted = true;
  record.checks.primarySupportSectionPropertiesNotInferred = true;
  record.checks.primarySupportReadinessDoesNotCalculate = true;

  // Explicit hand-checkable Euler-Bernoulli formula benchmark.
  await page.getByLabel("Elastic modulus E (Pa)", { exact: true }).fill("10000000000");
  await page.getByLabel("E source note", { exact: true }).fill("Synthetic browser QA E value only");
  await page.getByLabel("E verification", { exact: true }).selectOption("unverified");
  await page.getByLabel("Bending property", { exact: true }).selectOption("principal_1");
  await page.getByLabel("Selected principal second moment I (m⁴)", { exact: true }).fill("0.0001");
  await page.getByLabel("I source note", { exact: true }).fill("Synthetic browser QA I value only");
  await page.getByLabel("I verification", { exact: true }).selectOption("unverified");
  await page.getByLabel("Signed tip load P (N)", { exact: true }).fill("1000");
  await page.getByLabel("Tip load source note", { exact: true }).fill("Synthetic browser QA 1 kN tip load only");
  await page.getByLabel("Tip load verification", { exact: true }).selectOption("unverified");
  await page.getByLabel("Calculation source note", { exact: true }).fill("Synthetic browser QA Euler-Bernoulli formula benchmark only");
  await page.getByLabel("Calculation verification", { exact: true }).selectOption("unverified");

  // L=2.7 m from explicit local_y size, P=1000 N, E=10 GPa, I=1e-4 m^4.
  // Expected V=1000 N, M=2700 N-m, delta=0.006561 m.
  await waitForBodyText(page, "Cantilever analytical result: READY");
  await waitForBodyText(page, "Evidence: rpe_analytical");
  await waitForBodyText(page, "Length L: 2.700000 m");
  await waitForBodyText(page, "Fixed-end shear magnitude V: 1000.000000 N");
  await waitForBodyText(page, "Fixed-end moment magnitude M: 2700.000000 N·m");
  await waitForBodyText(page, "Signed tip deflection δ: 6.561000e-3 m");
  await waitForBodyText(page, "Structural result: ANALYTICAL_RESPONSE_ONLY");
  await waitForBodyText(page, "Capacity result: NOT_EVALUATED");
  await waitForBodyText(page, "No strength/PASS/FAIL, P-Δ, shear deformation, connection slip, solver, CFD, or whole-house load-path claim");
  record.checks.cantileverHandFormulaBenchmarkVerified = true;
  record.checks.cantileverCapacityNotEvaluated = true;

  // Returning to envelope-only must invalidate both readiness and analytical response.
  await stage.selectOption("empty_envelope");
  await waitForBodyText(page, "Structural result: N/A");
  await waitForBodyText(page, "Readiness state: blocked_stage_before_primary_supports");
  await waitForBodyText(page, "Cantilever analytical result: NOT AVAILABLE");
  await waitForBodyTextAbsent(page, "synthetic-support-nw");
  await waitForBodyTextAbsent(page, "synthetic-roof-west");
  await waitForBodyTextAbsent(page, "synthetic-storm-strap-west");
  record.checks.staleHigherStageComponentsCleared = true;
  record.checks.primarySupportReadinessBlockedWhenStageRemoved = true;
  record.checks.cantileverResultClearedWhenSupportStageRemoved = true;

  if (record.consoleErrors.length > 0) fail(`Browser console errors: ${record.consoleErrors.join(" | ")}`);
  if (record.pageErrors.length > 0) fail(`Page errors: ${record.pageErrors.join(" | ")}`);

  record.checks.noConsoleErrors = true;
  record.checks.noPageErrors = true;
  record.status = "passed";
  await page.screenshot({ path: screenshotPath, fullPage: true });
} catch (error) {
  record.status = "failed";
  record.error = error instanceof Error ? error.message : String(error);
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
  throw error;
} finally {
  await fs.writeFile(outputPath, `${JSON.stringify(record, null, 2)}\n`);
  await browser.close();
}
