"use client";

import { useMemo, useState } from "react";

import { assessFloorRingFrameMemberReadiness } from "@/lib/smallHouseWind/floorRingFrameReadiness";
import {
  FLOOR_RING_FRAME_READINESS_SCHEMA_VERSION,
  type FloorRingFrameMemberReadinessInput,
} from "@/types/floorRingFrameReadiness";
import type { GenesisVerificationState } from "@/types/genesis";
import type { PrimarySupportLongitudinalAxis } from "@/types/primarySupportMechanics";
import type { SmallHouseWindStageSnapshot } from "@/types/smallHouseWind";

type VerificationText = "" | GenesisVerificationState;
type AxisText = "" | PrimarySupportLongitudinalAxis;

export default function FloorRingFrameReadinessPanel({
  snapshot,
}: {
  snapshot: SmallHouseWindStageSnapshot;
}) {
  const [memberId, setMemberId] = useState("");
  const [axis, setAxis] = useState<AxisText>("");
  const [endARole, setEndARole] = useState("");
  const [endBRole, setEndBRole] = useState("");
  const [endASource, setEndASource] = useState("");
  const [endBSource, setEndBSource] = useState("");
  const [endAVerification, setEndAVerification] = useState<VerificationText>("");
  const [endBVerification, setEndBVerification] = useState<VerificationText>("");
  const [sourceNote, setSourceNote] = useState("");
  const [verification, setVerification] = useState<VerificationText>("");

  const activeMembers = useMemo(
    () => snapshot.components.filter((component) => component.kind === "floor_ring_frame_member"),
    [snapshot],
  );

  const result = useMemo(() => {
    if (
      memberId.trim() === "" ||
      axis === "" ||
      endARole.trim() === "" ||
      endBRole.trim() === "" ||
      endASource.trim() === "" ||
      endBSource.trim() === "" ||
      endAVerification === "" ||
      endBVerification === "" ||
      sourceNote.trim() === "" ||
      verification === ""
    ) {
      return null;
    }

    const input: FloorRingFrameMemberReadinessInput = {
      schemaVersion: FLOOR_RING_FRAME_READINESS_SCHEMA_VERSION,
      memberComponentId: memberId,
      longitudinalAxis: axis,
      endA: {
        roleLabel: endARole,
        jointCoordinateM: null,
        sourceNote: endASource,
        verificationState: endAVerification,
      },
      endB: {
        roleLabel: endBRole,
        jointCoordinateM: null,
        sourceNote: endBSource,
        verificationState: endBVerification,
      },
      sourceNote,
      verificationState: verification,
    };

    try {
      return assessFloorRingFrameMemberReadiness(snapshot, input);
    } catch {
      return null;
    }
  }, [
    snapshot,
    memberId,
    axis,
    endARole,
    endBRole,
    endASource,
    endBSource,
    endAVerification,
    endBVerification,
    sourceNote,
    verification,
  ]);

  return (
    <div className="mt-4 border-t border-teal-950 pt-3">
      <div className="font-semibold text-teal-200">Floor/ring-frame member readiness</div>
      <p className="mt-1 text-[10px] text-slate-500">
        Member-level topology/idealization review only. This schema does not accept or infer physical joint coordinates, material stiffness, section properties, load transfer, global frame stiffness, reactions, racking, or capacity.
      </p>

      <label className="mt-2 block text-slate-300">
        Active floor/ring member
        <select
          aria-label="Floor ring member component"
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
          value={memberId}
          onChange={(event) => setMemberId(event.target.value)}
        >
          <option value="">required; no default</option>
          {activeMembers.map((member) => (
            <option key={member.id} value={member.id}>{member.id}</option>
          ))}
        </select>
      </label>

      <label className="mt-2 block text-slate-300">
        Declared member longitudinal axis
        <select
          aria-label="Floor ring member longitudinal axis"
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
        <label className="text-slate-300">
          End A role
          <input
            aria-label="Floor ring End A role"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={endARole}
            onChange={(event) => setEndARole(event.target.value)}
            placeholder="semantic role only"
          />
        </label>
        <label className="text-slate-300">
          End B role
          <input
            aria-label="Floor ring End B role"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={endBRole}
            onChange={(event) => setEndBRole(event.target.value)}
            placeholder="semantic role only"
          />
        </label>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="text-slate-300">End A role source<input aria-label="Floor ring End A source note" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={endASource} onChange={(event) => setEndASource(event.target.value)} placeholder="required provenance" /></label>
        <label className="text-slate-300">End B role source<input aria-label="Floor ring End B source note" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={endBSource} onChange={(event) => setEndBSource(event.target.value)} placeholder="required provenance" /></label>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="text-slate-300">End A verification<select aria-label="Floor ring End A verification" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={endAVerification} onChange={(event) => setEndAVerification(event.target.value as VerificationText)}><option value="">required</option><option value="verified">verified</option><option value="provisional">provisional</option><option value="unverified">unverified</option></select></label>
        <label className="text-slate-300">End B verification<select aria-label="Floor ring End B verification" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={endBVerification} onChange={(event) => setEndBVerification(event.target.value as VerificationText)}><option value="">required</option><option value="verified">verified</option><option value="provisional">provisional</option><option value="unverified">unverified</option></select></label>
      </div>

      <label className="mt-2 block text-slate-300">Readiness source note<input aria-label="Floor ring readiness source note" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={sourceNote} onChange={(event) => setSourceNote(event.target.value)} placeholder="required provenance" /></label>
      <label className="mt-2 block text-slate-300">Readiness verification<select aria-label="Floor ring readiness verification" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={verification} onChange={(event) => setVerification(event.target.value as VerificationText)}><option value="">required; no default</option><option value="verified">verified</option><option value="provisional">provisional</option><option value="unverified">unverified</option></select></label>

      <div className="mt-3 rounded border border-teal-950 bg-slate-900/60 p-2 text-[10px] text-slate-300">
        <div>Floor/ring readiness state: <strong>{result?.state ?? "NOT EVALUATED"}</strong></div>
        <div className="mt-1">Structural result: <strong>{result?.structuralResult ?? "N/A"}</strong></div>
        <div>Global frame calculation: <strong>NO</strong></div>
        {result?.member && (
          <>
            <div className="mt-2">Member ID: <strong>{result.member.id}</strong></div>
            <div>Geometry: <strong>{result.member.sizeM.x} × {result.member.sizeM.y} × {result.member.sizeM.z} m</strong></div>
            <div>Rotation(rad): <strong>({result.member.rotationRad.x}, {result.member.rotationRad.y}, {result.member.rotationRad.z})</strong></div>
            <div>Material: <strong>{result.member.materialId ?? "UNKNOWN"}</strong></div>
            <div>Mass: <strong>{result.member.massKg === null ? "UNKNOWN" : `${result.member.massKg} kg`}</strong></div>
          </>
        )}
        <div className="mt-2">End A joint coordinate: <strong>UNKNOWN — NOT ACCEPTED IN SCHEMA v0.1.0</strong></div>
        <div>End B joint coordinate: <strong>UNKNOWN — NOT ACCEPTED IN SCHEMA v0.1.0</strong></div>
        <div>Elastic modulus / A / I / strength: <strong>UNKNOWN — NOT DEFINED IN THIS CONTRACT</strong></div>
        <div>Load-transfer model: <strong>UNKNOWN / NONE</strong></div>
        {result && <div className="mt-2 text-slate-500">{result.reason}</div>}
      </div>
    </div>
  );
}
