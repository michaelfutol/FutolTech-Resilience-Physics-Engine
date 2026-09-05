import test from "node:test";
import assert from "node:assert/strict";

import { materializeSmallHouseWindStage } from "../src/lib/smallHouseWind/systemContract";
import { assessPrimarySupportMechanicsReadiness } from "../src/lib/smallHouseWind/primarySupportReadiness";
import {
  PRIMARY_SUPPORT_MECHANICS_SCHEMA_VERSION,
  type PrimarySupportMechanicsReadinessInput,
} from "../src/types/primarySupportMechanics";
import {
  SMALL_HOUSE_WIND_SCHEMA_VERSION,
  type SmallHouseWindSpecimenInput,
} from "../src/types/smallHouseWind";

function specimen(completeSupport = false): SmallHouseWindSpecimenInput {
  return {
    schemaVersion: SMALL_HOUSE_WIND_SCHEMA_VERSION,
    id: "readiness-house-001",
    label: "Synthetic primary-support readiness fixture",
    envelope: {
      id: "readiness-envelope-001",
      centerM: { x: 0, y: 1.5, z: 0 },
      sizeM: { x: 4, y: 3, z: 4 },
      sourceNote: "Synthetic envelope for software regression only",
      verificationState: "unverified",
    },
    components: [
      {
        id: "support-001",
        kind: "primary_support",
        activationStage: "primary_supports",
        centerM: { x: -1.5, y: 1.5, z: -1.5 },
        sizeM: { x: 0.2, y: 3, z: 0.2 },
        rotationRad: { x: 0, y: 0, z: 0 },
        materialId: completeSupport ? "synthetic-material-001" : null,
        massKg: completeSupport ? 25 : null,
        sourceNote: "Synthetic primary support geometry only",
        verificationState: "unverified",
      },
      {
        id: "wall-001",
        kind: "wall_panel",
        activationStage: "walls",
        centerM: { x: 0, y: 1.5, z: -2 },
        sizeM: { x: 3.5, y: 2.5, z: 0.08 },
        rotationRad: { x: 0, y: 0, z: 0 },
        materialId: null,
        massKg: null,
        sourceNote: "Synthetic wall geometry only",
        verificationState: "unverified",
      },
    ],
    connections: [],
    sourceNote: "Synthetic primary-support readiness fixture only",
    verificationState: "unverified",
  };
}

function unknownProperty() {
  return {
    value: null,
    sourceNote: null,
    verificationState: null,
  } as const;
}

function readinessInput(): PrimarySupportMechanicsReadinessInput {
  return {
    schemaVersion: PRIMARY_SUPPORT_MECHANICS_SCHEMA_VERSION,
    supportComponentId: "support-001",
    longitudinalAxis: "local_y",
    endA: {
      endLabel: "lower end",
      dofs: {
        ux: "restrained",
        uy: "restrained",
        uz: "restrained",
        rx: "restrained",
        ry: "restrained",
        rz: "restrained",
      },
      sourceNote: "Synthetic fixed-base assumption for software regression only",
      verificationState: "unverified",
    },
    endB: {
      endLabel: "upper end",
      dofs: {
        ux: "free",
        uy: "free",
        uz: "free",
        rx: "free",
        ry: "free",
        rz: "free",
      },
      sourceNote: "Synthetic free-end assumption for software regression only",
      verificationState: "unverified",
    },
    axialElasticModulusPa: unknownProperty(),
    sectionAreaM2: unknownProperty(),
    principalSecondMoment1M4: unknownProperty(),
    principalSecondMoment2M4: unknownProperty(),
    strengthData: [],
    sourceNote: "Synthetic readiness assumptions for software regression only",
    verificationState: "unverified",
  };
}

test("primary-support readiness sources identity and geometry from the staged specimen without inventing mechanics", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "primary_supports");
  const result = assessPrimarySupportMechanicsReadiness(snapshot, readinessInput());

  assert.equal(result.state, "review_ready_with_unknowns");
  assert.equal(result.canReview, true);
  assert.equal(result.calculationAvailable, false);
  assert.equal(result.structuralResult, "N/A");
  assert.equal(result.support?.id, "support-001");
  assert.deepEqual(result.support?.sizeM, { x: 0.2, y: 3, z: 0.2 });
  assert.deepEqual(result.support?.rotationRad, { x: 0, y: 0, z: 0 });
  assert.equal(result.longitudinalAxis, "local_y");
  assert.deepEqual(result.unknownFields, [
    "support.materialId",
    "support.massKg",
    "axialElasticModulusPa",
    "sectionAreaM2",
    "principalSecondMoment1M4",
    "principalSecondMoment2M4",
    "strengthData",
  ]);
});

test("bounding-box geometry does not silently become section area or second moment", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "primary_supports");
  const result = assessPrimarySupportMechanicsReadiness(snapshot, readinessInput());

  assert.equal(result.sectionAreaM2.value, null);
  assert.equal(result.principalSecondMoment1M4.value, null);
  assert.equal(result.principalSecondMoment2M4.value, null);
});

test("empty envelope and inactive support IDs are blocked rather than inferred", () => {
  const empty = materializeSmallHouseWindStage(specimen(), "empty_envelope");
  const emptyResult = assessPrimarySupportMechanicsReadiness(empty, readinessInput());
  assert.equal(emptyResult.state, "blocked_stage_before_primary_supports");
  assert.equal(emptyResult.canReview, false);

  const supports = materializeSmallHouseWindStage(specimen(), "primary_supports");
  const missingInput = readinessInput();
  missingInput.supportComponentId = "missing-support";
  const missing = assessPrimarySupportMechanicsReadiness(supports, missingInput);
  assert.equal(missing.state, "blocked_support_not_active");
  assert.equal(missing.support, null);
});

test("a non-primary component cannot be reinterpreted as a primary support", () => {
  const walls = materializeSmallHouseWindStage(specimen(), "walls");
  const input = readinessInput();
  input.supportComponentId = "wall-001";
  const result = assessPrimarySupportMechanicsReadiness(walls, input);

  assert.equal(result.state, "blocked_not_primary_support");
  assert.equal(result.canReview, false);
  assert.equal(result.support?.kind, "wall_panel");
});

test("supplied engineering scalar values require explicit provenance and verification", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "primary_supports");
  const input = readinessInput();
  input.axialElasticModulusPa = {
    value: 10_000_000_000,
    sourceNote: null,
    verificationState: null,
  };

  assert.throws(
    () => assessPrimarySupportMechanicsReadiness(snapshot, input),
    /sourceNote is required when a value is supplied/,
  );

  const invalidUnknown = readinessInput();
  invalidUnknown.sectionAreaM2 = {
    value: null,
    sourceNote: "This note must not masquerade as a supplied value",
    verificationState: "unverified",
  };
  assert.throws(
    () => assessPrimarySupportMechanicsReadiness(snapshot, invalidUnknown),
    /provenance must remain null when the engineering value is unknown/,
  );
});

test("invalid restraint states and duplicate end labels are rejected", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "primary_supports");
  const invalidDof = readinessInput();
  invalidDof.endA.dofs.ux = "spring" as never;
  assert.throws(
    () => assessPrimarySupportMechanicsReadiness(snapshot, invalidDof),
    /must be free or restrained/,
  );

  const duplicateEnd = readinessInput();
  duplicateEnd.endB.endLabel = duplicateEnd.endA.endLabel;
  assert.throws(
    () => assessPrimarySupportMechanicsReadiness(snapshot, duplicateEnd),
    /must use distinct end labels/,
  );
});

test("fully supplied review evidence is preserved without producing a mechanics result", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(true), "primary_supports");
  const input = readinessInput();
  input.axialElasticModulusPa = {
    value: 10_000_000_000,
    sourceNote: "Synthetic modulus for software regression only",
    verificationState: "unverified",
  };
  input.sectionAreaM2 = {
    value: 0.04,
    sourceNote: "Synthetic explicit section area for software regression only",
    verificationState: "unverified",
  };
  input.principalSecondMoment1M4 = {
    value: 0.0001333333,
    sourceNote: "Synthetic explicit second moment for software regression only",
    verificationState: "unverified",
  };
  input.principalSecondMoment2M4 = {
    value: 0.0001333333,
    sourceNote: "Synthetic explicit second moment for software regression only",
    verificationState: "unverified",
  };
  input.strengthData = [
    {
      id: "synthetic-strength-001",
      label: "Synthetic labeled stress datum; not a governing capacity",
      valuePa: 20_000_000,
      sourceNote: "Synthetic strength datum for software regression only",
      verificationState: "unverified",
    },
  ];

  const result = assessPrimarySupportMechanicsReadiness(snapshot, input);
  assert.equal(result.state, "review_ready");
  assert.deepEqual(result.unknownFields, []);
  assert.equal(result.support?.materialId, "synthetic-material-001");
  assert.equal(result.support?.massKg, 25);
  assert.equal(result.axialElasticModulusPa.value, 10_000_000_000);
  assert.equal(result.strengthData[0]?.valuePa, 20_000_000);
  assert.equal(result.calculationAvailable, false);
  assert.equal(result.structuralResult, "N/A");
});

test("readiness result returns copied support geometry rather than a mutable alias", () => {
  const snapshot = materializeSmallHouseWindStage(specimen(), "primary_supports");
  const result = assessPrimarySupportMechanicsReadiness(snapshot, readinessInput());

  result.support!.centerM.x = 999;
  result.support!.rotationRad.z = 999;
  assert.notEqual(snapshot.components[0]!.centerM.x, 999);
  assert.notEqual(snapshot.components[0]!.rotationRad.z, 999);
});
