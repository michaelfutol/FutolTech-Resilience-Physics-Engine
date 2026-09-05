import fs from "node:fs";
import { chromium } from "playwright";

const baseUrl = process.env.RPE_BASE_URL || "http://127.0.0.1:3000";
const outputPath = process.env.RPE_BROWSER_ACCEPTANCE_OUTPUT || "genesis-browser-acceptance.json";
const screenshotPath = process.env.RPE_BROWSER_ACCEPTANCE_SCREENSHOT || "genesis-browser-acceptance.png";

const record = {
  schemaVersion: "0.1.0",
  environment: "headless Chromium via Playwright",
  baseUrl,
  startedAt: new Date().toISOString(),
  checks: {},
  consoleErrors: [],
  pageErrors: [],
};

function fail(message) {
  throw new Error(message);
}

async function waitForBodyText(page, needle, timeout = 10000) {
  await page.waitForFunction(
    (expected) => document.body?.innerText.includes(expected),
    needle,
    { timeout },
  );
}

async function waitForBodyTextAbsent(page, needle, timeout = 3000) {
  await page.waitForFunction(
    (expected) => !document.body?.innerText.includes(expected),
    needle,
    { timeout },
  );
}

async function fillLabel(page, label, value) {
  const locator = page.getByLabel(label, { exact: true });
  if ((await locator.count()) !== 1) {
    fail(`Expected exactly one control labeled ${label}; found ${await locator.count()}`);
  }
  await locator.fill(String(value));
}

async function selectVerificationState(page, value) {
  // Scope from the collision-target Source note control to its immediately
  // following Verification state label. This keeps the browser contract tied
  // to the target section even when independent evidence forms add their own
  // verification controls elsewhere in the page.
  const sourceNote = page.getByLabel("Source note", { exact: true });
  if ((await sourceNote.count()) !== 1) {
    fail(`Expected exactly one collision-target Source note control; found ${await sourceNote.count()}`);
  }
  const locator = sourceNote.locator("xpath=../following-sibling::label[1]/select");
  if ((await locator.count()) !== 1) {
    fail(`Expected exactly one collision-target Verification state select; found ${await locator.count()}`);
  }
  await locator.selectOption(value);
}

const browser = await chromium.launch({
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});

try {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  page.on("console", (message) => {
    if (message.type() === "error") record.consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => record.pageErrors.push(String(error)));

  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 30000 });
  await page.getByRole("button", { name: "Panel 001", exact: true }).click();
  await waitForBodyText(page, "Genesis Panel 001");

  await fillLabel(page, "Wind (kph)", 36);
  await fillLabel(page, "Direction (°)", 0);
  await fillLabel(page, "Air density (kg/m³)", 1);
  await fillLabel(page, "Coefficient C", 1);
  await fillLabel(page, "Panel width (m)", 1);
  await fillLabel(page, "Panel height (m)", 1);
  await fillLabel(page, "Equivalent connection capacity (N)", 1);
  await fillLabel(page, "Panel mass (kg)", 1);

  await fillLabel(page, "Gravity x", 0);
  await fillLabel(page, "Gravity y", 0);
  await fillLabel(page, "Gravity z", 0);
  await fillLabel(page, "Initial linear velocity x", 1);
  await fillLabel(page, "Initial linear velocity y", 0);
  await fillLabel(page, "Initial linear velocity z", 0);
  await fillLabel(page, "Initial angular velocity x", 0);
  await fillLabel(page, "Initial angular velocity y", 0);
  await fillLabel(page, "Initial angular velocity z", 0);

  await fillLabel(page, "Target object ID", "synthetic-browser-target-001");
  await fillLabel(page, "Target center x", 0.5);
  await fillLabel(page, "Target center y", 0.5);
  await fillLabel(page, "Target center z", 0);
  await fillLabel(page, "Target box size x", 0.2);
  await fillLabel(page, "Target box size y", 1);
  await fillLabel(page, "Target box size z", 1);
  await fillLabel(page, "Source note", "Synthetic browser-QA fixture only");
  await selectVerificationState(page, "unverified");

  await waitForBodyText(page, "Analytical state: THRESHOLD EXCEEDED");
  await waitForBodyText(page, "Release gate: release_ready");
  await waitForBodyText(page, "Dynamics gate: simulation_ready");
  await waitForBodyText(page, "Rapier: ACTIVE — RPE SIMULATION");
  await waitForBodyText(page, "Collision target: synthetic-browser-target-001 — DECLARED");

  record.checks.analyticalThresholdExceeded = true;
  record.checks.releaseReady = true;
  record.checks.dynamicsReady = true;
  record.checks.rapierActive = true;
  record.checks.declaredTargetVisible = true;

  await waitForBodyText(page, "collision_enter", 10000);
  await waitForBodyText(page, "otherObjectId=synthetic-browser-target-001", 10000);
  record.checks.genuineCollisionEnterObserved = true;
  record.checks.collisionTargetIdentityMatched = true;

  const beforeResetText = await page.locator("body").innerText();
  if (!beforeResetText.includes("Collision-enter records are event observations only.")) {
    fail("Evidence-boundary disclaimer is missing from the live ledger");
  }
  record.checks.evidenceBoundaryVisible = true;

  // Change one explicit target input far enough away that no immediate new collision can be confused
  // with the prior observation. The purpose is to prove stale-context invalidation, not geometry.
  await fillLabel(page, "Target center x", 5);
  await waitForBodyTextAbsent(page, "collision_enter", 3000);
  await waitForBodyText(page, "Collision target: synthetic-browser-target-001 — DECLARED");
  record.checks.staleCollisionClearedAfterInputChange = true;

  await page.screenshot({ path: screenshotPath, fullPage: true });

  if (record.pageErrors.length > 0) {
    fail(`Browser page errors were observed: ${record.pageErrors.join(" | ")}`);
  }

  record.completedAt = new Date().toISOString();
  record.status = "passed";
  fs.writeFileSync(outputPath, JSON.stringify(record, null, 2));
  console.log(JSON.stringify(record, null, 2));
} catch (error) {
  record.completedAt = new Date().toISOString();
  record.status = "failed";
  record.failure = error instanceof Error ? error.message : String(error);
  fs.writeFileSync(outputPath, JSON.stringify(record, null, 2));
  console.error(JSON.stringify(record, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
