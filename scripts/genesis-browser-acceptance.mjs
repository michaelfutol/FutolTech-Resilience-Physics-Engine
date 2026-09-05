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

async function selectAriaVerificationState(page, label, value) {
  const locator = page.getByLabel(label, { exact: true });
  if ((await locator.count()) !== 1) {
    fail(`Expected exactly one select labeled ${label}; found ${await locator.count()}`);
  }
  await locator.selectOption(value);
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
  // Keep one required linear-velocity component blank until every target/aero/application
  // input is ready so the live simulation starts from one controlled context.
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

  await fillLabel(page, "Aero interval (s)", 0.025);
  await fillLabel(page, "Aero air density (kg/m³)", 1);
  await fillLabel(page, "Projected area (m²)", 1);
  await fillLabel(page, "Drag coefficient Cd", 1);
  await fillLabel(page, "Relative air velocity x", 0.2);
  await fillLabel(page, "Relative air velocity y", 0);
  await fillLabel(page, "Relative air velocity z", 0);
  await fillLabel(page, "Aerodynamic source note", "Synthetic post-release aerodynamic browser fixture only");
  await selectAriaVerificationState(page, "Aerodynamic verification state", "unverified");

  await fillLabel(page, "Force application body ID", "genesis-panel-001");
  await fillLabel(page, "Force application source note", "Synthetic live force-application browser fixture only");
  await selectAriaVerificationState(page, "Force application verification state", "unverified");
  await waitForBodyText(page, "Force application gate: blocked_not_enabled");
  record.checks.forceApplicationOptInDefaultBlocked = true;

  await page.getByLabel("Enable post-release aerodynamic force", { exact: true }).check();
  await waitForBodyText(page, "Force application gate: blocked_dynamics_not_ready");
  record.checks.forceApplicationStillBlockedBeforeDynamicsReady = true;

  // Final required dynamics input activates the controlled live run.
  await fillLabel(page, "Initial linear velocity x", 1);

  await waitForBodyText(page, "Analytical state: THRESHOLD EXCEEDED");
  await waitForBodyText(page, "Release gate: release_ready");
  await waitForBodyText(page, "Dynamics gate: simulation_ready");
  await waitForBodyText(page, "Rapier: ACTIVE — RPE SIMULATION");
  await waitForBodyText(page, "Collision target: synthetic-browser-target-001 — DECLARED");
  await waitForBodyText(page, "Force application gate: force_application_ready");
  await waitForBodyText(page, "Force application plan: READY — LIVE COM FORCE");

  record.checks.analyticalThresholdExceeded = true;
  record.checks.releaseReady = true;
  record.checks.dynamicsReady = true;
  record.checks.rapierActive = true;
  record.checks.declaredTargetVisible = true;
  record.checks.forceApplicationReady = true;

  await waitForBodyText(page, "aerodynamic_force_application", 10000);
  await waitForBodyText(page, "state=active_full_step", 10000);
  await waitForBodyText(page, "state=active_partial_step", 10000);
  await waitForBodyText(page, "state=complete", 10000);
  record.checks.forceApplicationActiveFullStepObserved = true;
  record.checks.forceApplicationPartialTerminalStepObserved = true;
  record.checks.forceApplicationCompleteObserved = true;

  await waitForBodyText(page, "collision_enter", 10000);
  await waitForBodyText(page, "otherObjectId=synthetic-browser-target-001", 10000);
  record.checks.genuineCollisionEnterObserved = true;
  record.checks.collisionTargetIdentityMatched = true;

  const beforeResetText = await page.locator("body").innerText();
  if (!beforeResetText.includes("Aerodynamic force-application records are RPE simulation observations")) {
    fail("Aerodynamic force evidence-boundary disclaimer is missing from the live ledger");
  }
  if (!beforeResetText.includes("Collision-enter records likewise do not establish impact force")) {
    fail("Collision evidence-boundary disclaimer is missing from the live ledger");
  }
  record.checks.evidenceBoundaryVisible = true;

  // Change one explicit target input far enough away that no immediate new collision can be confused
  // with the prior observation. The purpose is to prove stale-context invalidation, not geometry.
  await fillLabel(page, "Target center x", 5);
  await waitForBodyTextAbsent(page, "collision_enter", 3000);
  await waitForBodyText(page, "Collision target: synthetic-browser-target-001 — DECLARED");
  record.checks.staleCollisionClearedAfterInputChange = true;

  // Change a relevant force-application identity input to a blocked mismatch.
  // This prevents a new application event and proves prior force evidence is not retained.
  await fillLabel(page, "Force application body ID", "synthetic-mismatched-body");
  await waitForBodyText(page, "Force application gate: blocked_body_mismatch");
  await waitForBodyTextAbsent(page, "aerodynamic_force_application", 3000);
  record.checks.staleForceApplicationEvidenceClearedAfterInputChange = true;

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
