import test from "node:test";
import assert from "node:assert/strict";

import { materializeSmallHouseWindStage } from "../src/lib/smallHouseWind/systemContract";
import { assessPrimarySupportMechanicsReadiness } from "../src/lib/smallHouseWind/primarySupportReadiness";
import { calculatePrimarySupportCantilever } from "../src/lib/smallHouseWind/primarySupportCantilever";
import {
  PRIMARY_SUPPORT_MECHANICS_SCHEMA_VERSION,
  type PrimarySupportMechanicsReadinessInput,
} from "../src/types/primarySupportMechanics";
import { PRIMARY_SUPPORT_CANTILEVER_SCHEMA_VERSION } from "../src/types/primarySupportCantilever";
import {
  SMALL_HOUSE_WIND_SCHEMA_VERSION,
  type SmallHouseWindSpecimenInput,
} from "../src/types/smallHouseWind";

function fixture(): SmallHouseWindSpecimenInput {
  return {
    schemaVersion: SMALL_HOUSE_WIND_SCHEMA_VERSION,
    id: "cantilever-house-001",
    label: "Synthetic cantilever formula fixture",
    envelope: {
      id: "cantilever-envelope-001",
      centerM: { x: 0, y: 1.5, z: 0 },
      sizeM: { x: 4, y: 3, z: 4 },
      sourceNote: "Synthetic envelope for formula regression only",
      verificationState: "unverified",
    },
    components: [
      {
        id: "cantilever-support-001",
        kind: "primary_support",
        activationStage: "primary_supports",
        centerM: { x: 0, y: 1.5, z: 0 },
        sizeM: { x: 0.2, y: 3, z: 0.3 },
        rotationRad: { x: 0, y: 0, z: 0 },
        materialId: null,
        massKg: null,
        sourceNote: "Synthetic support geometry for formula regression only",
        verificationState: "unverified",
      },
    ],
    connections: [],
    sourceNote: "Synthetic cantilever fixture only",
    verificationState: "unverified",
  };
}

function property(value: number | null, label: string) {
  return value === null
    ? { value: null, sourceNote: null, verificationState: null } as const
    : {
        value,
        sourceNote: `Synthetic ${label} for formula regression only`,
        verificationState: "unverified" as const,
      };
}

function readinessInput(): PrimarySupportMechanicsReadinessInput {
  return {
    schemaVersion: PRIMARY_SUPPORT_MECHANICS_SCHEMA_VERSION,
    supportComponentId: "cantilever-support-001",
    longitudinalAxis: "local_y",
    endA: {
      endLabel: "base",
      dofs: {
        ux: "restrained",
        uy: "restrained",
        uz: "restrained",
        rx: "restrained",
        ry: "restrained",
        rz: "restrained",
      },
      sourceNote: "Synthetic fixed end for formula regression only",
      verificationState: "unverified",
    },
    endB: {
      endLabel: "tip",
      dofs: {
        ux: "free",
        uy: "free",
        uz: "free",
        rx: "free",
        ry: "free",
        rz: "free",
      },
      sourceNote: "Synthetic free end for formula regression only",
      verificationState: "unverified",
    },
    axialElasticModulusPa: property(10_000_000_000, "elastic modulus"),
    sectionAreaM2: property(null, "section area"),
    principalSecondMoment1M4: property(0.0001, "principal I1"),
    principalSecondMoment2M4: property(0.0002, "principal I2"),
    strengthData: [],
    sourceNote: "Synthetic cantilever readiness idealization only",
    verificationState: "unverified",
  };
}

function readiness() {
  const snapshot = materializeSmallHouseWindStage(fixture(), "primary_supports");
  return assessPrimarySupportMechanicsReadiness(snapshot, readinessInput());
}

function calculate(
  overrides: Partial<Parameters<typeof calculatePrimarySupportCantilever>[0]> = {},
) {
  return calculatePrimarySupportCantilever({
    schemaVersion: PRIMARY_SUPPORT_CANTILEVER_SCHEMA_VERSION,
    readiness: readiness(),
    bendingProperty: "principal_1",
    tipLoad: {
      signedTipLoadN: 1000,
      sourceNote: "Synthetic 1 kN tip load for formula regression only",
      verificationState: "unverified",
    },
    sourceNote: "Synthetic Euler-Bernoulli benchmark calculation only",
    verificationState: "unverified",
    ...overrides,
  });
}

test("cantilever benchmark reproduces transparent hand-calculation formulas", () => {
  const result = calculate();

  assert.equal(result.lengthM, 3);
  assert.equal(result.elasticModulusPa, 10_000_000_000);
  assert.equal(result.secondMomentM4, 0.0001);
  assert.equal(result.fixedEndShearMagnitudeN, 1000);
  assert.equal(result.fixedEndMomentMagnitudeNm, 3000);
  assert.ok(Math.abs(result.signedTipDeflectionM - 0.009) < 1e-12);
  assert.equal(result.equations.shear, "V = |P|");
  assert.equal(result.equations.fixedEndMoment, "M = |P|L");
  assert.equal(result.equations.tipDeflection, "delta = PL^3/(3EI)");
  assert.equal(result.structuralResult, "ANALYTICAL_RESPONSE_ONLY");
  assert.equal(result.capacityResult, "NOT_EVALUATED");
});

test("signed load reverses deflection sign but not reported support-demand magnitudes", () => {
  const base = readiness();
  const result = calculate({
    readiness: base,
    tipLoad: {
      signedTipLoadN: -1000,
      sourceNote: "Synthetic negative tip load for sign regression only",
      verificationState: "unverified",
    },
  });

  assert.equal(result.fixedEndShearMagnitudeN, 1000);
  assert.equal(result.fixedEndMomentMagnitudeNm, 3000);
  assert.ok(Math.abs(result.signedTipDeflectionM + 0.009) < 1e-12);
});

test("selected principal second moment is explicit and changes deflection deterministically", () => {
  const first = calculate({ bendingProperty: "principal_1" });
  const second = calculate({ bendingProperty: "principal_2" });

  assert.equal(first.secondMomentM4, 0.0001);
  assert.equal(second.secondMomentM4, 0.0002);
  assert.ok(Math.abs(second.signedTipDeflectionM - first.signedTipDeflectionM / 2) < 1e-12);
});

test("member length comes only from the declared longitudinal local axis", () => {
  const snapshot = materializeSmallHouseWindStage(fixture(), "primary_supports");
  const xInput = readinessInput();
  xInput.longitudinalAxis = "local_x";
  const xReadiness = assessPrimarySupportMechanicsReadiness(snapshot, xInput);
  const xResult = calculate({ readiness: xReadiness });

  assert.equal(xResult.lengthM, 0.2);
  assert.notEqual(xResult.lengthM, fixture().components[0]!.sizeM.y);
});

test("missing elastic modulus or selected second moment blocks calculation rather than deriving a value", () => {
  const snapshot = materializeSmallHouseWindStage(fixture(), "primary_supports");

  const noEInput = readinessInput();
  noEInput.axialElasticModulusPa = property(null, "elastic modulus");
  const noE = assessPrimarySupportMechanicsReadiness(snapshot, noEInput);
  assert.throws(
    () => calculate({ readiness: noE }),
    /axialElasticModulusPa must be explicitly supplied/,
  );

  const noIInput = readinessInput();
  noIInput.principalSecondMoment1M4 = property(null, "principal I1");
  const noI = assessPrimarySupportMechanicsReadiness(snapshot, noIInput);
  assert.throws(
    () => calculate({ readiness: noI }),
    /principalSecondMoment1M4 must be explicitly supplied/,
  );
});

test("non-cantilever restraint pattern is rejected rather than approximated", () => {
  const snapshot = materializeSmallHouseWindStage(fixture(), "primary_supports");
  const input = readinessInput();
  input.endB.dofs.ux = "restrained";
  const mixed = assessPrimarySupportMechanicsReadiness(snapshot, input);

  assert.throws(
    () => calculate({ readiness: mixed }),
    /requires one end with all six DOFs restrained and the other end with all six DOFs free/,
  );
});

test("zero, non-finite, or provenance-free tip load is rejected", () => {
  assert.throws(
    () => calculate({
      tipLoad: {
        signedTipLoadN: 0,
        sourceNote: "Synthetic zero load",
        verificationState: "unverified",
      },
    }),
    /must be a finite non-zero number/,
  );

  assert.throws(
    () => calculate({
      tipLoad: {
        signedTipLoadN: Number.NaN,
        sourceNote: "Synthetic NaN load",
        verificationState: "unverified",
      },
    }),
    /must be a finite non-zero number/,
  );

  assert.throws(
    () => calculate({
      tipLoad: {
        signedTipLoadN: 1000,
        sourceNote: "",
        verificationState: "unverified",
      },
    }),
    /tipLoad.sourceNote must be non-empty/,
  );
});

test("benchmark states its narrow assumptions and never emits a capacity verdict", () => {
  const result = calculate();

  assert.equal(result.evidenceLayer, "rpe_analytical");
  assert.ok(result.assumptions.includes("linear_elastic_material_response"));
  assert.ok(result.assumptions.includes("no_geometric_non_linearity_or_p_delta"));
  assert.ok(result.assumptions.includes("no_strength_or_capacity_check"));
  assert.ok(result.assumptions.includes("no_whole_house_load_path_claim"));
  assert.equal(result.capacityResult, "NOT_EVALUATED");
  assert.equal(result.provenance.loadVerificationState, "unverified");
});
