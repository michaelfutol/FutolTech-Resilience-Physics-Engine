"use client";

import { useMemo, useState } from "react";

import { assessWallPanelExposureReadiness } from "@/lib/smallHouseWind/wallPanelExposureReadiness";
import {
  WALL_PANEL_EXPOSURE_READINESS_SCHEMA_VERSION,
  type WallPanelExposedFace,
  type WallPanelExposureClass,
  type WallPanelExposureReadinessInput,
  type WallPanelNormalAxis,
} from "@/types/wallPanelExposureReadiness";
import type { GenesisVerificationState } from "@/types/genesis";
import type { SmallHouseWindStageSnapshot } from "@/types/smallHouseWind";

type VerificationText = "" | GenesisVerificationState;
type NormalAxisText = "" | WallPanelNormalAxis;
type ExposedFaceText = "" | WallPanelExposedFace;
type ExposureClassText = "" | WallPanelExposureClass;

export default function WallPanelExposureReadinessPanel({
  snapshot,
}: {
  snapshot: SmallHouseWindStageSnapshot;
}) {
  const [wallId, setWallId] = useState("");
  const [normalAxis, setNormalAxis] = useState<NormalAxisText>("");
  const [exposedFace, setExposedFace] = useState<ExposedFaceText>("");
  const [exposureClass, setExposureClass] = useState<ExposureClassText>("");
  const [normalAxisSource, setNormalAxisSource] = useState("");
  const [normalAxisVerification, setNormalAxisVerification] = useState<VerificationText>("");
  const [exposureSource, setExposureSource] = useState("");
  const [exposureVerification, setExposureVerification] = useState<VerificationText>("");
  const [sourceNote, setSourceNote] = useState("");
  const [verification, setVerification] = useState<VerificationText>("");

  const activeWalls = useMemo(
    () => snapshot.components.filter((component) => component.kind === "wall_panel"),
    [snapshot],
  );

  const result = useMemo(() => {
    if (
      wallId.trim() === "" ||
      normalAxis === "" ||
      exposedFace === "" ||
      exposureClass === "" ||
      normalAxisSource.trim() === "" ||
      normalAxisVerification === "" ||
      exposureSource.trim() === "" ||
      exposureVerification === "" ||
      sourceNote.trim() === "" ||
      verification === ""
    ) {
      return null;
    }

    const input: WallPanelExposureReadinessInput = {
      schemaVersion: WALL_PANEL_EXPOSURE_READINESS_SCHEMA_VERSION,
      wallComponentId: wallId,
      panelNormalAxis: normalAxis,
      exposedFace,
      exposureClass,
      normalAxisSourceNote: normalAxisSource,
      normalAxisVerificationState: normalAxisVerification,
      exposureSourceNote: exposureSource,
      exposureVerificationState: exposureVerification,
      sourceNote,
      verificationState: verification,
    };

    try {
      return assessWallPanelExposureReadiness(snapshot, input);
    } catch {
      return null;
    }
  }, [
    snapshot,
    wallId,
    normalAxis,
    exposedFace,
    exposureClass,
    normalAxisSource,
    normalAxisVerification,
    exposureSource,
    exposureVerification,
    sourceNote,
    verification,
  ]);

  return (
    <div className="mt-4 border-t border-sky-950 pt-3">
      <div className="font-semibold text-sky-200">Wall-panel geometry / exposure readiness</div>
      <p className="mt-1 text-[10px] text-slate-500">
        Input review only. A geometric box-face area may be derived from the explicitly declared local normal axis, but it is not an effective wind area. No wind pressure, Cp, internal pressure, panel stiffness, fastener capacity, PASS/FAIL, or whole-house response is calculated here.
      </p>

      <label className="mt-2 block text-slate-300">
        Active wall panel
        <select
          aria-label="Wall panel component"
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
          value={wallId}
          onChange={(event) => setWallId(event.target.value)}
        >
          <option value="">required; no default</option>
          {activeWalls.map((wall) => (
            <option key={wall.id} value={wall.id}>{wall.id}</option>
          ))}
        </select>
      </label>

      <label className="mt-2 block text-slate-300">
        Declared panel normal axis
        <select
          aria-label="Wall panel normal axis"
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
          value={normalAxis}
          onChange={(event) => setNormalAxis(event.target.value as NormalAxisText)}
        >
          <option value="">required; no default</option>
          <option value="local_x">local x</option>
          <option value="local_y">local y</option>
          <option value="local_z">local z</option>
        </select>
      </label>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="text-slate-300">
          Exposed face sign
          <select
            aria-label="Wall exposed face"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={exposedFace}
            onChange={(event) => setExposedFace(event.target.value as ExposedFaceText)}
          >
            <option value="">required</option>
            <option value="positive_normal">positive normal</option>
            <option value="negative_normal">negative normal</option>
          </select>
        </label>
        <label className="text-slate-300">
          Exposure class
          <select
            aria-label="Wall exposure class"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={exposureClass}
            onChange={(event) => setExposureClass(event.target.value as ExposureClassText)}
          >
            <option value="">required</option>
            <option value="exterior">exterior</option>
            <option value="interior">interior</option>
          </select>
        </label>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="text-slate-300">
          Normal-axis source note
          <input aria-label="Wall normal axis source note" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={normalAxisSource} onChange={(event) => setNormalAxisSource(event.target.value)} placeholder="required provenance" />
        </label>
        <label className="text-slate-300">
          Normal-axis verification
          <select aria-label="Wall normal axis verification" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={normalAxisVerification} onChange={(event) => setNormalAxisVerification(event.target.value as VerificationText)}>
            <option value="">required</option><option value="verified">verified</option><option value="provisional">provisional</option><option value="unverified">unverified</option>
          </select>
        </label>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="text-slate-300">
          Exposure source note
          <input aria-label="Wall exposure source note" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={exposureSource} onChange={(event) => setExposureSource(event.target.value)} placeholder="required provenance" />
        </label>
        <label className="text-slate-300">
          Exposure verification
          <select aria-label="Wall exposure verification" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={exposureVerification} onChange={(event) => setExposureVerification(event.target.value as VerificationText)}>
            <option value="">required</option><option value="verified">verified</option><option value="provisional">provisional</option><option value="unverified">unverified</option>
          </select>
        </label>
      </div>

      <label className="mt-2 block text-slate-300">
        Readiness source note
        <input aria-label="Wall readiness source note" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={sourceNote} onChange={(event) => setSourceNote(event.target.value)} placeholder="required provenance" />
      </label>
      <label className="mt-2 block text-slate-300">
        Readiness verification
        <select aria-label="Wall readiness verification" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={verification} onChange={(event) => setVerification(event.target.value as VerificationText)}>
          <option value="">required; no default</option><option value="verified">verified</option><option value="provisional">provisional</option><option value="unverified">unverified</option>
        </select>
      </label>

      <div className="mt-3 rounded border border-sky-950 bg-slate-900/60 p-2 text-[10px] text-slate-300">
        <div>Wall readiness state: <strong>{result?.state ?? "NOT EVALUATED"}</strong></div>
        <div className="mt-1">Structural result: <strong>{result?.structuralResult ?? "N/A"}</strong></div>
        <div>Wind-action calculation: <strong>NO</strong></div>
        {result?.wall && (
          <>
            <div className="mt-2">Wall ID: <strong>{result.wall.id}</strong></div>
            <div>Geometry: <strong>{result.wall.sizeM.x} × {result.wall.sizeM.y} × {result.wall.sizeM.z} m</strong></div>
            <div>Rotation(rad): <strong>({result.wall.rotationRad.x}, {result.wall.rotationRad.y}, {result.wall.rotationRad.z})</strong></div>
            <div>Material: <strong>{result.wall.materialId ?? "UNKNOWN"}</strong></div>
            <div>Mass: <strong>{result.wall.massKg === null ? "UNKNOWN" : `${result.wall.massKg} kg`}</strong></div>
          </>
        )}
        <div className="mt-2">Declared normal axis: <strong>{result?.panelNormalAxis ?? "UNKNOWN"}</strong></div>
        <div>Declared exposed face: <strong>{result?.exposedFace ?? "UNKNOWN"}</strong></div>
        <div>Exposure class: <strong>{result?.exposureClass ?? "UNKNOWN"}</strong></div>
        <div>Geometric box-face area: <strong>{result?.geometricFaceAreaM2 === null || result?.geometricFaceAreaM2 === undefined ? "UNKNOWN" : `${result.geometricFaceAreaM2.toFixed(6)} m² — GEOMETRY ONLY`}</strong></div>
        <div>Effective wind area: <strong>UNKNOWN / NOT DEFINED</strong></div>
        <div>Wind velocity / density / Cp / internal pressure / net pressure: <strong>UNKNOWN / NOT DEFINED</strong></div>
        <div>Panel stiffness / strength / fastener capacity: <strong>UNKNOWN / NOT DEFINED</strong></div>
        {result && <div className="mt-2 text-slate-500">{result.reason}</div>}
      </div>
    </div>
  );
}
