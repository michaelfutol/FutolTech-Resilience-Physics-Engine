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
  schemaVersion: "0.1.0",
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
  ],
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

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
  record.checks.phase4ViewerOpened = true;
  record.checks.performanceDisclaimerVisible = true;

  const stage = page.getByLabel("Phase 4 stage", { exact: true });
  if ((await stage.count()) !== 1) fail(`Expected one Phase 4 stage selector; found ${await stage.count()}`);

  // Default stage must preserve Null-House semantics.
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

  // Explicit rotated members must remain reviewable in the UI metadata.
  await waitForBodyText(page, "synthetic-roof-west");
  await waitForBodyText(page, "rotation(rad)=(0, 0, 0.35)");
  await waitForBodyText(page, "synthetic-brace-north-west");
  await waitForBodyText(page, "rotation(rad)=(0, 0, -0.72)");
  record.checks.explicitOrientationVisible = true;

  // Lower the stage back to the empty envelope and confirm stale physical identities disappear.
  await stage.selectOption("empty_envelope");
  await waitForBodyText(page, "Structural result: N/A");
  await waitForBodyTextAbsent(page, "synthetic-support-nw");
  await waitForBodyTextAbsent(page, "synthetic-roof-west");
  await waitForBodyTextAbsent(page, "synthetic-storm-strap-west");
  record.checks.staleHigherStageComponentsCleared = true;

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
