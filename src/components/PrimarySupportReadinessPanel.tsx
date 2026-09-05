"use client";

import { useMemo, useState } from "react";

import { assessPrimarySupportMechanicsReadiness } from "@/lib/smallHouseWind/primarySupportReadiness";
import { calculatePrimarySupportCantilever } from "@/lib/smallHouseWind/primarySupportCantilever";
import {
  PRIMARY_SUPPORT_MECHANICS_SCHEMA_VERSION,
  type PrimarySupportDofState,
  type PrimarySupportLongitudinalAxis,
  type PrimarySupportMechanicsReadinessInput,
  type PrimarySupportRestraintDofs,
  type PrimarySupportScalarPropertyInput,
} from "@/types/primarySupportMechanics";
import {
  PRIMARY_SUPPORT_CANTILEVER_SCHEMA_VERSION,
  type PrimarySupportPrincipalBendingProperty,
} from "@/types/primarySupportCantilever";
import type { GenesisVerificationState } from "@/types/genesis";
import type { SmallHouseWindStageSnapshot } from "@/types/smallHouseWind";

type DofText = "" | PrimarySupportDofState;
type AxisText = "" | PrimarySupportLongitudinalAxis;
type VerificationText = "" | GenesisVerificationState;
type BendingPropertyText = "" | PrimarySupportPrincipalBendingProperty;
type DofDraft = Record<keyof PrimarySupportRestraintDofs, DofText>;

const DOF_KEYS: (keyof PrimarySupportRestraintDofs)[] = [
  "ux",
  "uy",
  "uz",
  "rx",
  "ry",
  "rz",
];

const EMPTY_DOFS: DofDraft = {
  ux: "",
  uy: "",
  uz: "",
  rx: "",
  ry: "",
  rz: "",
};

function allDofsExplicit(dofs: DofDraft): dofs is PrimarySupportRestraintDofs {
  return DOF_KEYS.every((key) => dofs[key] === "free" || dofs[key] === "restrained");
}

function parseFiniteNumber(text: string): number | null {
  if (text.trim() === "") return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : Number.NaN;
}

function scalarProperty(
  valueText: string,
  sourceNote: string,
  verificationState: VerificationText,
): PrimarySupportScalarPropertyInput {
  if (valueText.trim() === "") {
    return {
      value: null,
      sourceNote: null,
      verificationState: null,
    };
  }

  return {
    value: parseFiniteNumber(valueText),
    sourceNote: sourceNote.trim() === "" ? null : sourceNote,
    verificationState: verificationState === "" ? null : verificationState,
  };
}

function unknownProperty(): PrimarySupportScalarPropertyInput {
  return {
    value: null,
    sourceNote: null,
    verificationState: null,
  };
}

function DofEditor({
  title,
  values,
  onChange,
}: {
  title: string;
  values: DofDraft;
  onChange: (key: keyof PrimarySupportRestraintDofs, value: DofText) => void;
}) {
  return (
    <div className="mt-2 rounded border border-slate-800 bg-slate-950/40 p-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{title}</div>
      <div className="mt-2 grid grid-cols-3 gap-1">
        {DOF_KEYS.map((key) => (
          <label key={key} className="text-[10px] text-slate-400">
            {key.toUpperCase()}
            <select
              aria-label={`${title} ${key}`}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-1 py-1 text-[10px] text-slate-200"
              value={values[key]}
              onChange={(event) => onChange(key, event.target.value as DofText)}
            >
              <option value="">required</option>
              <option value="free">free</option>
              <option value="restrained">restrained</option>
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function PrimarySupportReadinessPanel({
  snapshot,
}: {
  snapshot: SmallHouseWindStageSnapshot;
}) {
  const [supportId, setSupportId] = useState("");
  const [axis, setAxis] = useState<AxisText>("");
  const [endALabel, setEndALabel] = useState("");
  const [endBLabel, setEndBLabel] = useState("");
  const [endADofs, setEndADofs] = useState<DofDraft>({ ...EMPTY_DOFS });
  const [endBDofs, setEndBDofs] = useState<DofDraft>({ ...EMPTY_DOFS });
  const [endASource, setEndASource] = useState("");
  const [endBSource, setEndBSource] = useState("");
  const [endAVerification, setEndAVerification] = useState<VerificationText>("");
  const [endBVerification, setEndBVerification] = useState<VerificationText>("");
  const [sourceNote, setSourceNote] = useState("");
  const [verification, setVerification] = useState<VerificationText>("");

  const [elasticModulusText, setElasticModulusText] = useState("");
  const [elasticModulusSource, setElasticModulusSource] = useState("");
  const [elasticModulusVerification, setElasticModulusVerification] = useState<VerificationText>("");
  const [bendingProperty, setBendingProperty] = useState<BendingPropertyText>("");
  const [secondMomentText, setSecondMomentText] = useState("");
  const [secondMomentSource, setSecondMomentSource] = useState("");
  const [secondMomentVerification, setSecondMomentVerification] = useState<VerificationText>("");
  const [tipLoadText, setTipLoadText] = useState("");
  const [tipLoadSource, setTipLoadSource] = useState("");
  const [tipLoadVerification, setTipLoadVerification] = useState<VerificationText>("");
  const [calculationSource, setCalculationSource] = useState("");
  const [calculationVerification, setCalculationVerification] = useState<VerificationText>("");

  const activePrimarySupports = useMemo(
    () => snapshot.components.filter((component) => component.kind === "primary_support"),
    [snapshot],
  );

  const readinessResult = useMemo(() => {
    if (
      supportId.trim() === "" ||
      axis === "" ||
      endALabel.trim() === "" ||
      endBLabel.trim() === "" ||
      !allDofsExplicit(endADofs) ||
      !allDofsExplicit(endBDofs) ||
      endASource.trim() === "" ||
      endBSource.trim() === "" ||
      endAVerification === "" ||
      endBVerification === "" ||
      sourceNote.trim() === "" ||
      verification === ""
    ) {
      return null;
    }

    const selectedSecondMoment = scalarProperty(
      secondMomentText,
      secondMomentSource,
      secondMomentVerification,
    );

    const input: PrimarySupportMechanicsReadinessInput = {
      schemaVersion: PRIMARY_SUPPORT_MECHANICS_SCHEMA_VERSION,
      supportComponentId: supportId,
      longitudinalAxis: axis,
      endA: {
        endLabel: endALabel,
        dofs: { ...endADofs },
        sourceNote: endASource,
        verificationState: endAVerification,
      },
      endB: {
        endLabel: endBLabel,
        dofs: { ...endBDofs },
        sourceNote: endBSource,
        verificationState: endBVerification,
      },
      axialElasticModulusPa: scalarProperty(
        elasticModulusText,
        elasticModulusSource,
        elasticModulusVerification,
      ),
      sectionAreaM2: unknownProperty(),
      principalSecondMoment1M4:
        bendingProperty === "principal_1" ? selectedSecondMoment : unknownProperty(),
      principalSecondMoment2M4:
        bendingProperty === "principal_2" ? selectedSecondMoment : unknownProperty(),
      strengthData: [],
      sourceNote,
      verificationState: verification,
    };

    try {
      return assessPrimarySupportMechanicsReadiness(snapshot, input);
    } catch {
      return null;
    }
  }, [
    snapshot,
    supportId,
    axis,
    endALabel,
    endBLabel,
    endADofs,
    endBDofs,
    endASource,
    endBSource,
    endAVerification,
    endBVerification,
    sourceNote,
    verification,
    elasticModulusText,
    elasticModulusSource,
    elasticModulusVerification,
    bendingProperty,
    secondMomentText,
    secondMomentSource,
    secondMomentVerification,
  ]);

  const cantileverResult = useMemo(() => {
    if (
      !readinessResult ||
      bendingProperty === "" ||
      tipLoadText.trim() === "" ||
      tipLoadSource.trim() === "" ||
      tipLoadVerification === "" ||
      calculationSource.trim() === "" ||
      calculationVerification === ""
    ) {
      return null;
    }

    const signedTipLoadN = parseFiniteNumber(tipLoadText);
    if (signedTipLoadN === null || !Number.isFinite(signedTipLoadN)) return null;

    try {
      return calculatePrimarySupportCantilever({
        schemaVersion: PRIMARY_SUPPORT_CANTILEVER_SCHEMA_VERSION,
        readiness: readinessResult,
        bendingProperty,
        tipLoad: {
          signedTipLoadN,
          sourceNote: tipLoadSource,
          verificationState: tipLoadVerification,
        },
        sourceNote: calculationSource,
        verificationState: calculationVerification,
      });
    } catch {
      return null;
    }
  }, [
    readinessResult,
    bendingProperty,
    tipLoadText,
    tipLoadSource,
    tipLoadVerification,
    calculationSource,
    calculationVerification,
  ]);

  return (
    <div className="mt-3 border-t border-emerald-950 pt-3">
      <div className="font-semibold text-cyan-200">Primary-support mechanics readiness</div>
      <p className="mt-1 text-[10px] text-slate-500">
        The readiness gate reviews identity, geometry, orientation, restraints, and supplied property evidence. It does not itself calculate reactions, displacement, stress, buckling, capacity, or whole-house wind performance.
      </p>

      <label className="mt-2 block text-slate-300">
        Active primary support
        <select
          aria-label="Primary support component"
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
          value={supportId}
          onChange={(event) => setSupportId(event.target.value)}
        >
          <option value="">required; no default</option>
          {activePrimarySupports.map((support) => (
            <option key={support.id} value={support.id}>{support.id}</option>
          ))}
        </select>
      </label>

      <label className="mt-2 block text-slate-300">
        Declared longitudinal axis
        <select
          aria-label="Primary support longitudinal axis"
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
          value={axis}
          onChange={(event) => setAxis(event.target.value as AxisText)}
        >
          <option value="">required; no default</option>
          <option value="local_x">local x</option>
          <option value="local_y">local y</option>
          <option value="local_z">local z</option>
        </select>
      </label>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="text-slate-300">End A label<input aria-label="End A label" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={endALabel} onChange={(event) => setEndALabel(event.target.value)} placeholder="e.g. lower end" /></label>
        <label className="text-slate-300">End B label<input aria-label="End B label" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={endBLabel} onChange={(event) => setEndBLabel(event.target.value)} placeholder="e.g. upper end" /></label>
      </div>

      <DofEditor
        title="End A restraint"
        values={endADofs}
        onChange={(key, value) => setEndADofs((current) => ({ ...current, [key]: value }))}
      />
      <DofEditor
        title="End B restraint"
        values={endBDofs}
        onChange={(key, value) => setEndBDofs((current) => ({ ...current, [key]: value }))}
      />

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="text-slate-300">End A source note<input aria-label="End A source note" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={endASource} onChange={(event) => setEndASource(event.target.value)} placeholder="required provenance" /></label>
        <label className="text-slate-300">End B source note<input aria-label="End B source note" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={endBSource} onChange={(event) => setEndBSource(event.target.value)} placeholder="required provenance" /></label>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="text-slate-300">End A verification<select aria-label="End A restraint verification" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={endAVerification} onChange={(event) => setEndAVerification(event.target.value as VerificationText)}><option value="">required</option><option value="verified">verified</option><option value="provisional">provisional</option><option value="unverified">unverified</option></select></label>
        <label className="text-slate-300">End B verification<select aria-label="End B restraint verification" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={endBVerification} onChange={(event) => setEndBVerification(event.target.value as VerificationText)}><option value="">required</option><option value="verified">verified</option><option value="provisional">provisional</option><option value="unverified">unverified</option></select></label>
      </div>

      <label className="mt-2 block text-slate-300">Readiness source note<input aria-label="Readiness source note" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={sourceNote} onChange={(event) => setSourceNote(event.target.value)} placeholder="required provenance for the idealization" /></label>
      <label className="mt-2 block text-slate-300">Readiness verification state<select aria-label="Primary support readiness verification" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={verification} onChange={(event) => setVerification(event.target.value as VerificationText)}><option value="">required; no default</option><option value="verified">verified</option><option value="provisional">provisional</option><option value="unverified">unverified</option></select></label>

      <div className="mt-3 border-t border-cyan-950 pt-3">
        <div className="font-semibold text-violet-200">Isolated cantilever benchmark inputs</div>
        <p className="mt-1 text-[10px] text-slate-500">
          Optional next layer. Runs only for an exact fixed–free idealization with explicit E, selected principal I, and signed free-end transverse point load. The member length comes from the declared local longitudinal-axis dimension. No section property is derived from the rendered box.
        </p>

        <label className="mt-2 block text-slate-300">Elastic modulus E (Pa)<input aria-label="Elastic modulus E (Pa)" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={elasticModulusText} onChange={(event) => setElasticModulusText(event.target.value)} placeholder="explicit; > 0" /></label>
        <label className="mt-2 block text-slate-300">E source note<input aria-label="E source note" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={elasticModulusSource} onChange={(event) => setElasticModulusSource(event.target.value)} placeholder="required when E is supplied" /></label>
        <label className="mt-2 block text-slate-300">E verification<select aria-label="E verification" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={elasticModulusVerification} onChange={(event) => setElasticModulusVerification(event.target.value as VerificationText)}><option value="">required when E is supplied</option><option value="verified">verified</option><option value="provisional">provisional</option><option value="unverified">unverified</option></select></label>

        <label className="mt-2 block text-slate-300">Bending property<select aria-label="Bending property" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={bendingProperty} onChange={(event) => setBendingProperty(event.target.value as BendingPropertyText)}><option value="">required for calculation</option><option value="principal_1">principal 1</option><option value="principal_2">principal 2</option></select></label>
        <label className="mt-2 block text-slate-300">Selected principal second moment I (m⁴)<input aria-label="Selected principal second moment I (m⁴)" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={secondMomentText} onChange={(event) => setSecondMomentText(event.target.value)} placeholder="explicit; > 0" /></label>
        <label className="mt-2 block text-slate-300">I source note<input aria-label="I source note" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={secondMomentSource} onChange={(event) => setSecondMomentSource(event.target.value)} placeholder="required when I is supplied" /></label>
        <label className="mt-2 block text-slate-300">I verification<select aria-label="I verification" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={secondMomentVerification} onChange={(event) => setSecondMomentVerification(event.target.value as VerificationText)}><option value="">required when I is supplied</option><option value="verified">verified</option><option value="provisional">provisional</option><option value="unverified">unverified</option></select></label>

        <label className="mt-2 block text-slate-300">Signed tip load P (N)<input aria-label="Signed tip load P (N)" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={tipLoadText} onChange={(event) => setTipLoadText(event.target.value)} placeholder="explicit non-zero transverse point load" /></label>
        <label className="mt-2 block text-slate-300">Tip load source note<input aria-label="Tip load source note" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={tipLoadSource} onChange={(event) => setTipLoadSource(event.target.value)} placeholder="required provenance" /></label>
        <label className="mt-2 block text-slate-300">Tip load verification<select aria-label="Tip load verification" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={tipLoadVerification} onChange={(event) => setTipLoadVerification(event.target.value as VerificationText)}><option value="">required</option><option value="verified">verified</option><option value="provisional">provisional</option><option value="unverified">unverified</option></select></label>

        <label className="mt-2 block text-slate-300">Calculation source note<input aria-label="Calculation source note" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={calculationSource} onChange={(event) => setCalculationSource(event.target.value)} placeholder="required calculation provenance" /></label>
        <label className="mt-2 block text-slate-300">Calculation verification<select aria-label="Calculation verification" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={calculationVerification} onChange={(event) => setCalculationVerification(event.target.value as VerificationText)}><option value="">required</option><option value="verified">verified</option><option value="provisional">provisional</option><option value="unverified">unverified</option></select></label>
      </div>

      <div className="mt-3 rounded border border-cyan-950 bg-slate-900/60 p-2 text-[10px] text-slate-300">
        <div>Readiness state: <strong>{readinessResult?.state ?? "NOT EVALUATED"}</strong></div>
        <div className="mt-1">Readiness structural result: <strong>{readinessResult?.structuralResult ?? "N/A"}</strong></div>
        <div className="mt-1">Readiness contract calculation: <strong>NO</strong></div>
        {readinessResult?.support && (
          <>
            <div className="mt-2">Support ID: <strong>{readinessResult.support.id}</strong></div>
            <div>Geometry: <strong>{readinessResult.support.sizeM.x} × {readinessResult.support.sizeM.y} × {readinessResult.support.sizeM.z} m</strong></div>
            <div>Material: <strong>{readinessResult.support.materialId ?? "UNKNOWN"}</strong></div>
            <div>Mass: <strong>{readinessResult.support.massKg === null ? "UNKNOWN" : `${readinessResult.support.massKg} kg`}</strong></div>
          </>
        )}
        <div className="mt-2">Elastic modulus E: <strong>{readinessResult?.axialElasticModulusPa.value ?? "UNKNOWN"}</strong></div>
        <div>Section area: <strong>UNKNOWN — NOT DERIVED FROM BOX SIZE</strong></div>
        <div>Principal I1: <strong>{readinessResult?.principalSecondMoment1M4.value ?? "UNKNOWN"}</strong></div>
        <div>Principal I2: <strong>{readinessResult?.principalSecondMoment2M4.value ?? "UNKNOWN"}</strong></div>
        <div>Strength data: <strong>UNKNOWN / NONE SUPPLIED</strong></div>
        {readinessResult && (
          <>
            <div className="mt-2 text-slate-500">{readinessResult.reason}</div>
            <div className="mt-2">Unknown fields: <strong>{readinessResult.unknownFields.length ? readinessResult.unknownFields.join(", ") : "none recorded"}</strong></div>
          </>
        )}
      </div>

      <div className="mt-3 rounded border border-violet-950 bg-slate-900/60 p-2 text-[10px] text-slate-300">
        <div>Cantilever analytical result: <strong>{cantileverResult ? "READY" : "NOT AVAILABLE"}</strong></div>
        {cantileverResult ? (
          <div className="mt-2 space-y-1">
            <div>Evidence: <strong>{cantileverResult.evidenceLayer}</strong></div>
            <div>Model: <strong>{cantileverResult.model}</strong></div>
            <div>Length L: <strong>{cantileverResult.lengthM.toFixed(6)} m</strong></div>
            <div>Selected E: <strong>{cantileverResult.elasticModulusPa.toExponential(6)} Pa</strong></div>
            <div>Selected I: <strong>{cantileverResult.secondMomentM4.toExponential(6)} m⁴</strong></div>
            <div>Signed tip load P: <strong>{cantileverResult.signedTipLoadN.toFixed(6)} N</strong></div>
            <div>Fixed-end shear magnitude V: <strong>{cantileverResult.fixedEndShearMagnitudeN.toFixed(6)} N</strong></div>
            <div>Fixed-end moment magnitude M: <strong>{cantileverResult.fixedEndMomentMagnitudeNm.toFixed(6)} N·m</strong></div>
            <div>Signed tip deflection δ: <strong>{cantileverResult.signedTipDeflectionM.toExponential(6)} m</strong></div>
            <div className="pt-1">Equations: <strong>V=|P|; M=|P|L; δ=PL³/(3EI)</strong></div>
            <div>Structural result: <strong>{cantileverResult.structuralResult}</strong></div>
            <div>Capacity result: <strong>{cantileverResult.capacityResult}</strong></div>
            <div className="pt-1 text-amber-300">No strength/PASS/FAIL, P-Δ, shear deformation, connection slip, solver, CFD, or whole-house load-path claim is included in this benchmark.</div>
          </div>
        ) : (
          <p className="mt-1 text-slate-500">Requires exact fixed–free restraints plus explicit E, selected principal I, signed tip load, and provenance. Missing data blocks calculation.</p>
        )}
      </div>
    </div>
  );
}
