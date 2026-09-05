"use client";

import { useMemo, useState } from "react";

import { assessPrimarySupportMechanicsReadiness } from "@/lib/smallHouseWind/primarySupportReadiness";
import {
  PRIMARY_SUPPORT_MECHANICS_SCHEMA_VERSION,
  type PrimarySupportDofState,
  type PrimarySupportLongitudinalAxis,
  type PrimarySupportMechanicsReadinessInput,
  type PrimarySupportRestraintDofs,
} from "@/types/primarySupportMechanics";
import type { GenesisVerificationState } from "@/types/genesis";
import type { SmallHouseWindStageSnapshot } from "@/types/smallHouseWind";

type DofText = "" | PrimarySupportDofState;
type AxisText = "" | PrimarySupportLongitudinalAxis;
type VerificationText = "" | GenesisVerificationState;
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

    const unknownProperty = () => ({
      value: null,
      sourceNote: null,
      verificationState: null,
    }) as const;

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
      axialElasticModulusPa: unknownProperty(),
      sectionAreaM2: unknownProperty(),
      principalSecondMoment1M4: unknownProperty(),
      principalSecondMoment2M4: unknownProperty(),
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
  ]);

  return (
    <div className="mt-3 border-t border-emerald-950 pt-3">
      <div className="font-semibold text-cyan-200">Primary-support mechanics readiness</div>
      <p className="mt-1 text-[10px] text-slate-500">
        Input review only. No support reaction, displacement, stress, buckling, capacity, or whole-house wind result is calculated here.
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
        <label className="text-slate-300">End A label<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={endALabel} onChange={(event) => setEndALabel(event.target.value)} placeholder="e.g. lower end" /></label>
        <label className="text-slate-300">End B label<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={endBLabel} onChange={(event) => setEndBLabel(event.target.value)} placeholder="e.g. upper end" /></label>
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
        <label className="text-slate-300">End A source note<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={endASource} onChange={(event) => setEndASource(event.target.value)} placeholder="required provenance" /></label>
        <label className="text-slate-300">End B source note<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={endBSource} onChange={(event) => setEndBSource(event.target.value)} placeholder="required provenance" /></label>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="text-slate-300">End A verification<select aria-label="End A restraint verification" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={endAVerification} onChange={(event) => setEndAVerification(event.target.value as VerificationText)}><option value="">required</option><option value="verified">verified</option><option value="provisional">provisional</option><option value="unverified">unverified</option></select></label>
        <label className="text-slate-300">End B verification<select aria-label="End B restraint verification" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={endBVerification} onChange={(event) => setEndBVerification(event.target.value as VerificationText)}><option value="">required</option><option value="verified">verified</option><option value="provisional">provisional</option><option value="unverified">unverified</option></select></label>
      </div>

      <label className="mt-2 block text-slate-300">Readiness source note<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={sourceNote} onChange={(event) => setSourceNote(event.target.value)} placeholder="required provenance for the idealization" /></label>
      <label className="mt-2 block text-slate-300">Readiness verification state<select aria-label="Primary support readiness verification" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={verification} onChange={(event) => setVerification(event.target.value as VerificationText)}><option value="">required; no default</option><option value="verified">verified</option><option value="provisional">provisional</option><option value="unverified">unverified</option></select></label>

      <div className="mt-3 rounded border border-cyan-950 bg-slate-900/60 p-2 text-[10px] text-slate-300">
        <div>Readiness state: <strong>{readinessResult?.state ?? "NOT EVALUATED"}</strong></div>
        <div className="mt-1">Structural result: <strong>{readinessResult?.structuralResult ?? "N/A"}</strong></div>
        <div className="mt-1">Calculation available: <strong>NO</strong></div>
        {readinessResult?.support && (
          <>
            <div className="mt-2">Support ID: <strong>{readinessResult.support.id}</strong></div>
            <div>Geometry: <strong>{readinessResult.support.sizeM.x} × {readinessResult.support.sizeM.y} × {readinessResult.support.sizeM.z} m</strong></div>
            <div>Material: <strong>{readinessResult.support.materialId ?? "UNKNOWN"}</strong></div>
            <div>Mass: <strong>{readinessResult.support.massKg === null ? "UNKNOWN" : `${readinessResult.support.massKg} kg`}</strong></div>
          </>
        )}
        <div className="mt-2">Axial elastic modulus: <strong>UNKNOWN</strong></div>
        <div>Section area: <strong>UNKNOWN — NOT DERIVED FROM BOX SIZE</strong></div>
        <div>Principal second moments: <strong>UNKNOWN — NOT DERIVED FROM BOX SIZE</strong></div>
        <div>Strength data: <strong>UNKNOWN / NONE SUPPLIED</strong></div>
        {readinessResult && (
          <>
            <div className="mt-2 text-slate-500">{readinessResult.reason}</div>
            <div className="mt-2">Unknown fields: <strong>{readinessResult.unknownFields.length ? readinessResult.unknownFields.join(", ") : "none recorded"}</strong></div>
          </>
        )}
      </div>
    </div>
  );
}
