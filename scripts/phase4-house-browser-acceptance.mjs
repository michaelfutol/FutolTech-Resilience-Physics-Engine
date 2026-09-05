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
  schemaVersion: "0.15.0",
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
    "Floor/ring readiness is member/topology review only; schema v0.1.0 deliberately accepts no joint coordinates and performs no global frame calculation.",
    "Wall-panel readiness derives box-face geometry only from an explicitly declared local normal; it does not define effective wind area, pressure coefficients, net pressure, stiffness, fastener capacity, or wind resistance.",
    "Roof-panel readiness preserves rotated geometry and explicit local-normal/exposed-face declarations only; it does not define roof zones, effective wind area, pressure coefficients, uplift force, connection demand/capacity, or wind resistance.",
    "Connection joint-location readiness preserves topology and accepts only an explicit caller-declared global joint point; it never infers midpoint/intersection/touching geometry and does not calculate connection mechanics.",
    "Bracing topology readiness requires two distinct explicit brace-end connection records; visible diagonal geometry cannot create a missing end, physical joint point, stiffness, axial force, buckling model, racking contribution, capacity, or adequacy verdict.",
    "Anchorage interface readiness identifies only an explicit anchor-to-primary-support topology relationship; it does not infer the physical attachment point, bolt/rod, embedment, base plate, pedestal/footing, concrete/soil properties, reactions, resistance, capacity, or adequacy.",
    "Storm-protection topology readiness requires two distinct explicit incident connection records to two distinct active opposite endpoint components; visible strap geometry cannot create a missing end, attachment point, preload, stiffness, demand, capacity, PASS/FAIL, or whole-house benefit.",
    "Controlled A/B comparison in this gate proves only that exactly one declared connection record differs while unrelated specimen inputs remain invariant; it does not compare structural performance or establish a stronger/better variant.",
    "Single-surface wind action is RPE_ANALYTICAL only: density, speed, effective area, signed coefficient, and global action direction are explicit QA inputs; it is NON-CFD, NON-CODE-COMPLIANCE, and does not create connection demand, reactions, racking, PASS/FAIL, or whole-house performance evidence.",
    "Multi-surface wind loading only algebraically sums already-valid explicit single-surface global force vectors; the sum is not a support reaction, base shear, connection demand, racking demand, moment/torque, load-path distribution, CFD integration, code-compliance result, or adequacy verdict.",
    "Surface force application-point mapping attaches an accepted analytical force only to an explicit caller-declared global point. It does not infer center of pressure, panel centroid, joint, support, solver node, load path, moment/torque, reaction, or adequacy.",
    "Surface force moment is ordinary statics r×F about an explicit caller-declared global reference point only. It is not aerodynamic torque/free couple, support moment, reaction, load-path distribution, solver response, or adequacy evidence.",
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
  await waitForBodyText(page, "Floor/ring-frame member readiness");
  await waitForBodyText(page, "Wall-panel geometry / exposure readiness");
  await waitForBodyText(page, "Roof-panel geometry / exposure readiness");
  await waitForBodyText(page, "Connection joint-location readiness");
  await waitForBodyText(page, "Bracing topology readiness");
  await waitForBodyText(page, "Anchorage interface readiness");
  await waitForBodyText(page, "Storm Protection restraint topology readiness");
  await waitForBodyText(page, "Controlled A/B specimen difference");
  await waitForBodyText(page, "Analytical surface wind action");
  await waitForBodyText(page, "RPE_ANALYTICAL · NON-CFD · NON-CODE-COMPLIANCE");
  await waitForBodyText(page, "Controlled multi-surface analytical load set");
  await waitForBodyText(page, "RPE_ANALYTICAL · VECTOR ALGEBRA ONLY · NON-CFD · NON-CODE-COMPLIANCE");
  await waitForBodyText(page, "Explicit surface force application-point mapping");
  await waitForBodyText(page, "RPE_ANALYTICAL · EXPLICIT MAPPING ONLY · NO MOMENT / NO REACTION");
  await waitForBodyText(page, "Explicit force moment about declared reference point");
  await waitForBodyText(page, "RPE_ANALYTICAL · ORDINARY STATICS r×F · NOT AERODYNAMIC TORQUE");
  await waitForBodyText(page, "Readiness contract calculation: NO");
  await waitForBodyText(page, "Global frame calculation: NO");
  await waitForBodyText(page, "Wind-action calculation: NO");
  await waitForBodyText(page, "Uplift calculation: NO");
  await waitForBodyText(page, "Connection mechanics: NO");
  await waitForBodyText(page, "Bracing mechanics: NO");
  await waitForBodyText(page, "Anchorage mechanics: NO");
  await waitForBodyText(page, "Storm protection mechanics: NO");
  record.checks.phase4ViewerOpened = true;
  record.checks.performanceDisclaimerVisible = true;
  record.checks.primarySupportReadinessPanelVisible = true;
  record.checks.floorRingReadinessPanelVisible = true;
  record.checks.wallExposureReadinessPanelVisible = true;
  record.checks.bracingTopologyReadinessPanelVisible = true;
  record.checks.anchorageInterfaceReadinessPanelVisible = true;
  record.checks.stormProtectionTopologyReadinessPanelVisible = true;
  record.checks.controlledABPanelVisible = true;
  record.checks.surfaceWindActionPanelVisible = true;
  record.checks.multiSurfaceWindLoadSetVisible = true;
  record.checks.surfaceForceApplicationPointMappingVisible = true;
  record.checks.surfaceForceMomentVisible = true;
  record.checks.roofExposureReadinessPanelVisible = true;
  record.checks.connectionJointLocationPanelVisible = true;

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

  // Floor/ring readiness: semantic endpoints only. Joint coordinates remain unavailable by schema.
  await stage.selectOption("floor_ring_frame");
  await page.getByLabel("Floor ring member component", { exact: true }).selectOption("synthetic-ring-north");
  await page.getByLabel("Floor ring member longitudinal axis", { exact: true }).selectOption("local_x");
  await page.getByLabel("Floor ring End A role", { exact: true }).fill("west end role");
  await page.getByLabel("Floor ring End B role", { exact: true }).fill("east end role");
  await page.getByLabel("Floor ring End A source note", { exact: true }).fill("Synthetic browser QA endpoint role only");
  await page.getByLabel("Floor ring End B source note", { exact: true }).fill("Synthetic browser QA endpoint role only");
  await page.getByLabel("Floor ring End A verification", { exact: true }).selectOption("unverified");
  await page.getByLabel("Floor ring End B verification", { exact: true }).selectOption("unverified");
  await page.getByLabel("Floor ring readiness source note", { exact: true }).fill("Synthetic browser QA floor-ring readiness only");
  await page.getByLabel("Floor ring readiness verification", { exact: true }).selectOption("unverified");

  await waitForBodyText(page, "Floor/ring readiness state: review_ready");
  await waitForBodyText(page, "Member ID: synthetic-ring-north");
  await waitForBodyText(page, "Global frame calculation: NO");
  await waitForBodyText(page, "End A joint coordinate: UNKNOWN — NOT ACCEPTED IN SCHEMA v0.1.0");
  await waitForBodyText(page, "End B joint coordinate: UNKNOWN — NOT ACCEPTED IN SCHEMA v0.1.0");
  await waitForBodyText(page, "Elastic modulus / A / I / strength: UNKNOWN — NOT DEFINED IN THIS CONTRACT");
  await waitForBodyText(page, "Load-transfer model: UNKNOWN / NONE");
  if (await page.locator('input[aria-label*="joint coordinate" i]').count()) {
    fail("Floor/ring readiness schema unexpectedly exposed a joint-coordinate input");
  }
  record.checks.floorRingReadinessExplicitInputsAccepted = true;
  record.checks.floorRingJointCoordinatesRemainUnavailable = true;
  record.checks.floorRingGlobalFrameCalculationBlocked = true;

  // Wall exposure readiness: explicit local normal + face sign + exposure class only.
  await stage.selectOption("walls");
  await page.getByLabel("Wall panel component", { exact: true }).selectOption("synthetic-wall-north");
  await page.getByLabel("Wall panel normal axis", { exact: true }).selectOption("local_z");
  await page.getByLabel("Wall exposed face", { exact: true }).selectOption("negative_normal");
  await page.getByLabel("Wall exposure class", { exact: true }).selectOption("exterior");
  await page.getByLabel("Wall normal axis source note", { exact: true }).fill("Synthetic browser QA local-z normal declaration only");
  await page.getByLabel("Wall normal axis verification", { exact: true }).selectOption("unverified");
  await page.getByLabel("Wall exposure source note", { exact: true }).fill("Synthetic browser QA exterior negative-face declaration only");
  await page.getByLabel("Wall exposure verification", { exact: true }).selectOption("unverified");
  await page.getByLabel("Wall readiness source note", { exact: true }).fill("Synthetic browser QA wall exposure readiness only");
  await page.getByLabel("Wall readiness verification", { exact: true }).selectOption("unverified");

  await waitForBodyText(page, "Wall readiness state: review_ready");
  await waitForBodyText(page, "Wall ID: synthetic-wall-north");
  await waitForBodyText(page, "Declared normal axis: local_z");
  await waitForBodyText(page, "Declared exposed face: negative_normal");
  await waitForBodyText(page, "Exposure class: exterior");
  await waitForBodyText(page, "Geometric box-face area: 7.140000 m² — GEOMETRY ONLY");
  await waitForBodyText(page, "Effective wind area: UNKNOWN / NOT DEFINED");
  await waitForBodyText(page, "Wind velocity / density / Cp / internal pressure / net pressure: UNKNOWN / NOT DEFINED");
  await waitForBodyText(page, "Panel stiffness / strength / fastener capacity: UNKNOWN / NOT DEFINED");
  await waitForBodyText(page, "Wind-action calculation: NO");
  if (await page.locator('input[aria-label*="pressure coefficient" i], input[aria-label*="net pressure" i], input[aria-label*="effective wind area" i]').count()) {
    fail("Wall readiness unexpectedly exposed aerodynamic calculation inputs");
  }
  record.checks.wallExposureExplicitInputsAccepted = true;
  record.checks.wallGeometricFaceAreaVerified = true;
  record.checks.wallEffectiveWindAreaRemainsUndefined = true;
  record.checks.wallWindActionCalculationBlocked = true;

  // First Phase 4 analytical surface action: explicit aerodynamic/action inputs only.
  await waitForBodyText(page, "Surface action state: analytical_ready");
  await waitForBodyText(page, "Evidence layer: rpe_analytical");
  await waitForBodyText(page, "Structural result: N/A");
  await waitForBodyText(page, "Surface ID: synthetic-wall-north");
  await waitForBodyText(page, "Surface kind: wall_panel");
  await waitForBodyText(page, "Surface normal axis for geometry report: local_z");
  await waitForBodyText(page, "Geometry-only face area: 7.140000 m²");
  await waitForBodyText(page, "Effective wind area A_eff: 5.000000 m²");
  await waitForBodyText(page, "Air density ρ: 1.200 kg/m³");
  await waitForBodyText(page, "Wind speed V: 20.000 m/s");
  await waitForBodyText(page, "Signed coefficient: -0.800");
  await waitForBodyText(page, "Explicit direction input: (0.000, 0.000, 2.000)");
  await waitForBodyText(page, "Normalized global action direction: (0.000, 0.000, 1.000)");
  await waitForBodyText(page, "q = 0.5ρV²: 240.000 Pa");
  await waitForBodyText(page, "Signed surface pressure qC: -192.000 Pa");
  await waitForBodyText(page, "Scalar surface force qA_effC: -960.000 N");
  await waitForBodyText(page, "Global force vector: (0.000, 0.000, -960.000) N");
  await waitForBodyText(page, "Connection demand: N/A");
  await waitForBodyText(page, "Connection capacity assessment: N/A");
  await waitForBodyText(page, "Support reactions: N/A");
  await waitForBodyText(page, "Uplift reaction: N/A");
  await waitForBodyText(page, "Sliding reaction: N/A");
  await waitForBodyText(page, "Racking indicator: N/A");
  await waitForBodyText(page, "PASS/FAIL: N/A");
  await waitForBodyText(page, "Geometry-only area 7.140000 m² ≠ declared A_eff 5.000000 m²");
  record.checks.surfaceWindActionHandCheckVerified = true;
  record.checks.surfaceWindActionGeometryAreaNotEffectiveArea = true;
  record.checks.surfaceWindActionExplicitDirectionVerified = true;
  record.checks.surfaceWindActionDownstreamMechanicsUnavailable = true;

  // Controlled two-wall analytical vector aggregation. This is vector algebra only, not structural distribution.
  await waitForBodyText(page, "Multi-surface load-set state: analytical_ready");
  await waitForBodyText(page, "Load-set surface ID: synthetic-wall-east");
  await waitForBodyText(page, "Surface global force vector: (480.000, 0.000, 0.000) N");
  await waitForBodyText(page, "Load-set surface ID: synthetic-wall-north");
  await waitForBodyText(page, "Surface global force vector: (0.000, 0.000, -960.000) N");
  await waitForBodyText(page, "Algebraic global force-vector sum: (480.000, 0.000, -960.000) N");
  await waitForBodyText(page, "Resultant vector magnitude: 1073.313 N");
  await waitForBodyText(page, "REACTION: N/A");
  await waitForBodyText(page, "BASE SHEAR: N/A");
  await waitForBodyText(page, "UPLIFT REACTION: N/A");
  await waitForBodyText(page, "SLIDING REACTION: N/A");
  await waitForBodyText(page, "RACKING DEMAND: N/A");
  await waitForBodyText(page, "CONNECTION DEMAND: N/A");
  await waitForBodyText(page, "MOMENT/TORQUE: N/A");
  await waitForBodyText(page, "LOAD-PATH DISTRIBUTION: N/A");
  await waitForBodyText(page, "PASS/FAIL: N/A");
  await waitForBodyText(page, "VECTOR SUM ≠ REACTION / BASE SHEAR / STRUCTURAL DEMAND");
  record.checks.multiSurfaceHandVectorSumVerified = true;
  record.checks.multiSurfaceStructuralInterpretationUnavailable = true;

  // Explicit caller-declared application point for the accepted north-wall analytical force.
  await waitForBodyText(page, "Force application-point state: mapping_ready");
  await waitForBodyText(page, "Application surface ID: synthetic-wall-north");
  await waitForBodyText(page, "Source global force vector: (0.000, 0.000, -960.000) N");
  await waitForBodyText(page, "Caller-declared global application point: (0.370, 1.230, -2.410) m");
  await waitForBodyText(page, "APPLICATION POINT BASIS: CALLER_DECLARED_GLOBAL_POINT");
  await waitForBodyText(page, "Rendered north-wall center: (0.000, 1.650, -2.250) m — GEOMETRY REFERENCE ONLY");
  await waitForBodyText(page, "INFERRED APPLICATION POINT: NONE — PROHIBITED");
  await waitForBodyText(page, "CENTER OF PRESSURE: N/A");
  await waitForBodyText(page, "SOLVER NODE: N/A");
  await waitForBodyText(page, "APPLICATION POINT ≠ CENTER OF PRESSURE / JOINT / SUPPORT / SOLVER NODE");
  await waitForBodyText(page, "MOMENT remains N/A until a separate explicit reference-point/axis contract exists");
  record.checks.surfaceForceApplicationPointExplicitGlobalPointVerified = true;
  record.checks.surfaceForceApplicationPointNotRenderedCenter = true;
  record.checks.surfaceForceApplicationPointPreservesForceVector = true;
  record.checks.surfaceForceApplicationPointNoMomentOrStructuralMapping = true;

  // Ordinary statics force moment about one explicit non-origin caller-declared reference point.
  await waitForBodyText(page, "Force-moment state: analytical_ready");
  await waitForBodyText(page, "Moment surface ID: synthetic-wall-north");
  await waitForBodyText(page, "Source force vector F: (0.000, 0.000, -960.000) N");
  await waitForBodyText(page, "Application point r_app: (0.370, 1.230, -2.410) m");
  await waitForBodyText(page, "Caller-declared reference point r_ref: (0.100, 0.200, -2.000) m");
  await waitForBodyText(page, "Lever arm r = r_app − r_ref: (0.270, 1.030, -0.410) m");
  await waitForBodyText(page, "M_ref = r × F: (-988.800, 259.200, 0.000) N·m");
  await waitForBodyText(page, "|M_ref|: 1022.208 N·m");
  await waitForBodyText(page, "Moment basis: force_moment_about_caller_declared_global_reference_point");
  await waitForBodyText(page, "AERODYNAMIC TORQUE / FREE COUPLE: N/A");
  await waitForBodyText(page, "FORCE MOMENT r×F ≠ AERODYNAMIC TORQUE / SUPPORT MOMENT / SOLVER RESPONSE");
  record.checks.surfaceForceMomentHandCheckVerified = true;
  record.checks.surfaceForceMomentExplicitReferenceVerified = true;
  record.checks.surfaceForceMomentAerodynamicTorqueUnavailable = true;
  record.checks.surfaceForceMomentStructuralResponseUnavailable = true;

  // Roof exposure readiness: rotated roof geometry + explicit local normal/exposed-face declaration only.
  await stage.selectOption("roof");
  await page.getByLabel("Roof panel component", { exact: true }).selectOption("synthetic-roof-west");
  await page.getByLabel("Roof panel normal axis", { exact: true }).selectOption("local_y");
  await page.getByLabel("Roof exposed face", { exact: true }).selectOption("positive_normal");
  await page.getByLabel("Roof exposure class", { exact: true }).selectOption("exterior");
  await page.getByLabel("Roof normal axis source note", { exact: true }).fill("Synthetic browser QA local-y roof normal declaration only");
  await page.getByLabel("Roof normal axis verification", { exact: true }).selectOption("unverified");
  await page.getByLabel("Roof exposure source note", { exact: true }).fill("Synthetic browser QA exterior positive-face roof declaration only");
  await page.getByLabel("Roof exposure verification", { exact: true }).selectOption("unverified");
  await page.getByLabel("Roof readiness source note", { exact: true }).fill("Synthetic browser QA roof exposure readiness only");
  await page.getByLabel("Roof readiness verification", { exact: true }).selectOption("unverified");

  await waitForBodyText(page, "Roof readiness state: review_ready");
  await waitForBodyText(page, "Roof ID: synthetic-roof-west");
  await waitForBodyText(page, "Rotation(rad): (0, 0, 0.35)");
  await waitForBodyText(page, "Declared normal axis: local_y");
  await waitForBodyText(page, "Declared exposed face: positive_normal");
  await waitForBodyText(page, "Exposure class: exterior");
  await waitForBodyText(page, "Geometric box-face area: 9.840000 m² — GEOMETRY ONLY");
  await waitForBodyText(page, "Roof zone: UNKNOWN / NOT DEFINED");
  await waitForBodyText(page, "Effective wind area: UNKNOWN / NOT DEFINED");
  await waitForBodyText(page, "Wind velocity / density / Cp / internal pressure / net pressure / uplift force: UNKNOWN / NOT DEFINED");
  await waitForBodyText(page, "Panel stiffness / strength / connection demand / connection capacity: UNKNOWN / NOT DEFINED");
  await waitForBodyText(page, "Uplift calculation: NO");
  if (await page.locator('input[aria-label*="roof zone" i], input[aria-label*="pressure coefficient" i], input[aria-label*="uplift" i], input[aria-label*="effective wind area" i]').count()) {
    fail("Roof readiness unexpectedly exposed aerodynamic/uplift calculation inputs");
  }
  record.checks.roofExposureExplicitInputsAccepted = true;
  record.checks.roofRotatedGeometryPreserved = true;
  record.checks.roofGeometricFaceAreaVerified = true;
  record.checks.roofZoneAndEffectiveWindAreaRemainUndefined = true;
  record.checks.roofUpliftCalculationBlocked = true;

  // Connection joint-location readiness: topology known first, physical point unknown until explicitly declared.
  await stage.selectOption("connections");
  await page.getByLabel("Connection component relationship", { exact: true }).selectOption("synthetic-connection-support-ring-nw");
  await page.getByLabel("Connection readiness source note", { exact: true }).fill("Synthetic browser QA connection-location review only");
  await page.getByLabel("Connection readiness verification", { exact: true }).selectOption("unverified");

  await waitForBodyText(page, "Connection location state: location_unknown");
  await waitForBodyText(page, "Connection ID: synthetic-connection-support-ring-nw");
  await waitForBodyText(page, "From component: synthetic-support-nw");
  await waitForBodyText(page, "To component: synthetic-ring-north");
  await waitForBodyText(page, "Stored topology capacity: UNKNOWN");
  await waitForBodyText(page, "Physical global joint point: UNKNOWN");
  await waitForBodyText(page, "Coordinate basis: unknown");
  await waitForBodyText(page, "Inferred joint point: NONE — PROHIBITED");
  await waitForBodyText(page, "Connection mechanics: NO");
  record.checks.connectionTopologyKnownLocationUnknown = true;
  record.checks.connectionNoInferredPointVisible = true;

  await page.getByLabel("Connection joint X (m)", { exact: true }).fill("-1.7");
  await page.getByLabel("Connection joint Y (m)", { exact: true }).fill("0.6");
  await page.getByLabel("Connection joint Z (m)", { exact: true }).fill("-2.2");
  await page.getByLabel("Connection joint source note", { exact: true }).fill("Synthetic browser QA explicitly declared global joint point only");
  await page.getByLabel("Connection joint verification", { exact: true }).selectOption("unverified");

  await waitForBodyText(page, "Connection location state: review_ready");
  await waitForBodyText(page, "Physical global joint point: (-1.7, 0.6, -2.2) m — CALLER DECLARED");
  await waitForBodyText(page, "Coordinate basis: caller_declared_global_point");
  await waitForBodyText(page, "Inferred joint point: NONE — PROHIBITED");
  await waitForBodyText(page, "Connector path / axis / shape / bearing area: UNKNOWN / NOT DEFINED");
  await waitForBodyText(page, "Stiffness / slip / fasteners / welds: UNKNOWN / NOT DEFINED");
  await waitForBodyText(page, "Demand / capacity assessment / utilization / PASS-FAIL / load transfer: UNKNOWN / NOT EVALUATED");
  await waitForBodyText(page, "Connection mechanics: NO");
  if (await page.locator('input[aria-label*="connection demand" i], input[aria-label*="connection capacity" i], input[aria-label*="fastener count" i], input[aria-label*="connector path" i]').count()) {
    fail("Connection location readiness unexpectedly exposed mechanics inputs");
  }
  record.checks.connectionExplicitJointPointAccepted = true;
  record.checks.connectionMechanicsRemainUnavailable = true;

  // Bracing topology readiness: the current synthetic diagonal has only one explicit brace-end relationship.
  await stage.selectOption("bracing");
  await page.getByLabel("Bracing component", { exact: true }).selectOption("synthetic-brace-north-west");
  await page.getByLabel("Bracing end A connection", { exact: true }).selectOption("synthetic-connection-brace-west");
  await page.getByLabel("Bracing readiness source note", { exact: true }).fill("Synthetic browser QA bracing topology review only");
  await page.getByLabel("Bracing readiness verification", { exact: true }).selectOption("unverified");

  await waitForBodyText(page, "Bracing topology state: load_path_incomplete");
  await waitForBodyText(page, "Brace ID: synthetic-brace-north-west");
  await waitForBodyText(page, "Brace material: UNKNOWN");
  await waitForBodyText(page, "Brace mass: UNKNOWN");
  await waitForBodyText(page, "Explicit incident connections: 1");
  await waitForBodyText(page, "Explicit selected brace ends: 1 / 2");
  await waitForBodyText(page, "End A: synthetic-connection-brace-west");
  await waitForBodyText(page, "End B: UNKNOWN");
  await waitForBodyText(page, "Physical joint locations: UNKNOWN / NOT REVIEWED IN THIS GATE");
  await waitForBodyText(page, "Inferred joint locations: NONE — PROHIBITED");
  await waitForBodyText(page, "Bracing mechanics: NO");
  await waitForBodyText(page, "Axial force / tension-compression / stiffness / effective length / slenderness / buckling: UNKNOWN / NOT EVALUATED");
  await waitForBodyText(page, "Racking contribution / demand / capacity / utilization / PASS-FAIL / load-path adequacy: UNKNOWN / NOT EVALUATED");
  if (await page.locator('input[aria-label*="axial force" i], input[aria-label*="brace capacity" i], input[aria-label*="slenderness" i], input[aria-label*="buckling" i], input[aria-label*="racking contribution" i]').count()) {
    fail("Bracing topology readiness unexpectedly exposed mechanics/capacity inputs");
  }
  record.checks.bracingVisibleDiagonalDoesNotCreateSecondEnd = true;
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

  // Controlled A/B input-review: exactly one declared connection record differs; no performance ranking.
  await waitForBodyText(page, "Controlled A/B state: controlled_input_difference");
  await waitForBodyText(page, "Evidence layer: rpe_input_review");
  await waitForBodyText(page, "Case A: A — canonical one-ended storm strap");
  await waitForBodyText(page, "Case B: B — QA-only explicit second storm endpoint");
  await waitForBodyText(page, "Same specimen ID: synthetic-phase4-house-browser-001");
  await waitForBodyText(page, "Change kind: connection_record_added");
  await waitForBodyText(page, "Connection record: synthetic-connection-storm-west-second-end");
  await waitForBodyText(page, "Explicit topology: synthetic-storm-strap-west → synthetic-anchor-nw");
  await waitForBodyText(page, "Added capacity: UNKNOWN");
  await waitForBodyText(page, "Specimen metadata unchanged: YES");
  await waitForBodyText(page, "Envelope unchanged: YES");
  await waitForBodyText(page, "Component records unchanged: YES");
  await waitForBodyText(page, "Component geometry unchanged: YES");
  await waitForBodyText(page, "Existing connections unchanged: YES");
  await waitForBodyText(page, "Only declared connection added: YES");
  await waitForBodyText(page, "Mechanics available: NO");
  await waitForBodyText(page, "Performance comparison: NO");
  await waitForBodyText(page, "Performance conclusion: NOT AVAILABLE");
  await waitForBodyText(page, "NO WINNER / NO STRENGTH RANKING");
  record.checks.controlledABExactlyOneDeclaredDifference = true;
  record.checks.controlledABUnrelatedInputsInvariant = true;
  record.checks.controlledABPerformanceRankingUnavailable = true;

  // Lowering below storm-protection activation must block retained restraint topology and A/B review.
  await stage.selectOption("anchorage");
  await waitForBodyText(page, "Storm restraint topology state: blocked_stage_before_storm_protection");
  await waitForBodyText(page, "Controlled A/B state: BLOCKED — STORM PROTECTION STAGE REQUIRED");
  await waitForBodyTextAbsent(page, "Restraint member ID: synthetic-storm-strap-west");
  await waitForBodyTextAbsent(page, "Connection record: synthetic-connection-storm-west-second-end");
  record.checks.stormProtectionReadinessBlockedBelowActivationStage = true;
  record.checks.controlledABBlockedBelowStormProtectionStage = true;

  // Lowering below anchorage activation must block retained anchor-interface review.
  await stage.selectOption("bracing");
  await waitForBodyText(page, "Anchorage interface state: blocked_stage_before_anchorage");
  await waitForBodyTextAbsent(page, "Anchor ID: synthetic-anchor-nw");
  record.checks.anchorageReadinessBlockedBelowActivationStage = true;

  // Lowering below bracing activation must block retained brace topology.
  await stage.selectOption("connections");
  await waitForBodyText(page, "Bracing topology state: blocked_stage_before_bracing");
  await waitForBodyTextAbsent(page, "Brace ID: synthetic-brace-north-west");
  record.checks.bracingReadinessBlockedBelowActivationStage = true;

  // Lowering below connection activation must invalidate the retained location while roof review remains valid.
  await stage.selectOption("roof");
  await waitForBodyText(page, "Connection location state: blocked_stage_before_connections");
  await waitForBodyTextAbsent(page, "Connection ID: synthetic-connection-support-ring-nw");
  await waitForBodyText(page, "Roof readiness state: review_ready");
  record.checks.connectionLocationBlockedBelowActivationStage = true;

  // Lowering below roof activation must block retained roof assumptions while walls remain active.
  await stage.selectOption("walls");
  await waitForBodyText(page, "Roof readiness state: blocked_stage_before_roof");
  await waitForBodyTextAbsent(page, "Roof ID: synthetic-roof-west");
  await waitForBodyText(page, "Wall readiness state: review_ready");
  record.checks.roofReadinessBlockedBelowActivationStage = true;

  // Lowering below wall activation must block retained wall assumptions.
  await stage.selectOption("floor_ring_frame");
  await waitForBodyText(page, "Wall readiness state: blocked_stage_before_walls");
  await waitForBodyText(page, "Surface action state: blocked_stage_before_walls");
  await waitForBodyText(page, "Multi-surface load-set state: blocked_surface_action");
  await waitForBodyText(page, "Force application-point state: blocked_source_action");
  await waitForBodyText(page, "Force-moment state: blocked_source_mapping");
  await waitForBodyTextAbsent(page, "Wall ID: synthetic-wall-north");
  await waitForBodyTextAbsent(page, "Surface ID: synthetic-wall-north");
  await waitForBodyTextAbsent(page, "q = 0.5ρV²: 240.000 Pa");
  await waitForBodyTextAbsent(page, "Algebraic global force-vector sum: (480.000, 0.000, -960.000) N");
  await waitForBodyTextAbsent(page, "Caller-declared global application point: (0.370, 1.230, -2.410) m");
  await waitForBodyTextAbsent(page, "M_ref = r × F: (-988.800, 259.200, 0.000) N·m");
  record.checks.wallReadinessBlockedBelowActivationStage = true;
  record.checks.surfaceWindActionBlockedBelowWallStage = true;
  record.checks.multiSurfaceWindLoadSetBlockedBelowWallStage = true;
  record.checks.surfaceForceApplicationPointBlockedBelowWallStage = true;
  record.checks.surfaceForceMomentBlockedBelowWallStage = true;

  // Lowering below floor/ring activation must also block retained floor/ring assumptions.
  await stage.selectOption("primary_supports");
  await waitForBodyText(page, "Floor/ring readiness state: blocked_stage_before_floor_ring_frame");
  await waitForBodyText(page, "Wall readiness state: blocked_stage_before_walls");
  await waitForBodyTextAbsent(page, "Member ID: synthetic-ring-north");
  record.checks.floorRingReadinessBlockedBelowActivationStage = true;

  // Returning to envelope-only must invalidate all physical-member review/results.
  await stage.selectOption("empty_envelope");
  await waitForBodyText(page, "Structural result: N/A");
  await waitForBodyText(page, "Readiness state: blocked_stage_before_primary_supports");
  await waitForBodyText(page, "Cantilever analytical result: NOT AVAILABLE");
  await waitForBodyText(page, "Floor/ring readiness state: blocked_stage_before_floor_ring_frame");
  await waitForBodyText(page, "Wall readiness state: blocked_stage_before_walls");
  await waitForBodyText(page, "Roof readiness state: blocked_stage_before_roof");
  await waitForBodyText(page, "Surface action state: blocked_stage_before_walls");
  await waitForBodyText(page, "Multi-surface load-set state: blocked_surface_action");
  await waitForBodyText(page, "Force application-point state: blocked_source_action");
  await waitForBodyText(page, "Force-moment state: blocked_source_mapping");
  await waitForBodyText(page, "Connection location state: blocked_stage_before_connections");
  await waitForBodyText(page, "Anchorage interface state: blocked_stage_before_anchorage");
  await waitForBodyText(page, "Storm restraint topology state: blocked_stage_before_storm_protection");
  await waitForBodyText(page, "Controlled A/B state: BLOCKED — STORM PROTECTION STAGE REQUIRED");
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
