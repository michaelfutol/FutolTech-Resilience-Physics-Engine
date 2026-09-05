"use client";

import { useMemo, useState } from "react";

import { assessAnchorageInterfaceReadiness } from "@/lib/smallHouseWind/anchorageInterfaceReadiness";
import {
  ANCHORAGE_INTERFACE_READINESS_SCHEMA_VERSION,
  type AnchorageInterfaceReadinessInput,
} from "@/types/anchorageInterfaceReadiness";
import type { GenesisVerificationState } from "@/types/genesis";
import type { SmallHouseWindStageSnapshot } from "@/types/smallHouseWind";

type VerificationText = "" | GenesisVerificationState;

export default function AnchorageInterfaceReadinessPanel({
  snapshot,
}: {
  snapshot: SmallHouseWindStageSnapshot;
}) {
  const [anchorId, setAnchorId] = useState("");
  const [attachmentConnectionId, setAttachmentConnectionId] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  const [verification, setVerification] = useState<VerificationText>("");

  const activeAnchors = useMemo(
    () => snapshot.components.filter((component) => component.kind === "anchor"),
    [snapshot],
  );

  const incidentConnections = useMemo(() => {
    if (anchorId.trim() === "") return [];
    return snapshot.connections.filter(
      (connection) =>
        connection.fromComponentId === anchorId ||
        connection.toComponentId === anchorId,
    );
  }, [snapshot, anchorId]);

  const result = useMemo(() => {
    if (
      anchorId.trim() === "" ||
      sourceNote.trim() === "" ||
      verification === ""
    ) {
      return null;
    }

    const input: AnchorageInterfaceReadinessInput = {
      schemaVersion: ANCHORAGE_INTERFACE_READINESS_SCHEMA_VERSION,
      anchorId,
      attachmentConnectionId:
        attachmentConnectionId.trim() === "" ? null : attachmentConnectionId,
      sourceNote,
      verificationState: verification,
    };

    try {
      return assessAnchorageInterfaceReadiness(snapshot, input);
    } catch {
      return null;
    }
  }, [
    snapshot,
    anchorId,
    attachmentConnectionId,
    sourceNote,
    verification,
  ]);

  const handleAnchorChange = (nextAnchorId: string) => {
    setAnchorId(nextAnchorId);
    setAttachmentConnectionId("");
  };

  return (
    <div className="mt-4 border-t border-cyan-950 pt-3">
      <div className="font-semibold text-cyan-200">
        Anchorage interface readiness
      </div>
      <p className="mt-1 text-[10px] text-slate-500">
        Visible anchor marker ≠ anchorage capacity. This gate identifies only an
        explicit active anchor-to-primary-support topology relationship. It does
        not infer a physical attachment point, bolt/rod, embedment, base plate,
        pedestal, footing, concrete, soil, reactions, resistance, or adequacy.
      </p>

      <label className="mt-2 block text-slate-300">
        Active anchor
        <select
          aria-label="Anchorage component"
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
          value={anchorId}
          onChange={(event) => handleAnchorChange(event.target.value)}
        >
          <option value="">required; no default</option>
          {activeAnchors.map((anchor) => (
            <option key={anchor.id} value={anchor.id}>
              {anchor.id}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-2 block text-slate-300">
        Explicit anchor-to-support connection
        <select
          aria-label="Anchorage attachment connection"
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
          value={attachmentConnectionId}
          onChange={(event) => setAttachmentConnectionId(event.target.value)}
        >
          <option value="">UNKNOWN / not declared</option>
          {incidentConnections.map((connection) => (
            <option key={connection.id} value={connection.id}>
              {connection.id}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-2 block text-slate-300">
        Readiness source note
        <input
          aria-label="Anchorage readiness source note"
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
          value={sourceNote}
          onChange={(event) => setSourceNote(event.target.value)}
          placeholder="required provenance for this review"
        />
      </label>

      <label className="mt-2 block text-slate-300">
        Readiness verification
        <select
          aria-label="Anchorage readiness verification"
          className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
          value={verification}
          onChange={(event) =>
            setVerification(event.target.value as VerificationText)
          }
        >
          <option value="">required; no default</option>
          <option value="verified">verified</option>
          <option value="provisional">provisional</option>
          <option value="unverified">unverified</option>
        </select>
      </label>

      <div className="mt-3 rounded border border-cyan-950 bg-slate-900/60 p-2 text-[10px] text-slate-300">
        <div>
          Anchorage interface state: <strong>{result?.state ?? "NOT EVALUATED"}</strong>
        </div>
        <div className="mt-1">
          Structural result: <strong>{result?.structuralResult ?? "N/A"}</strong>
        </div>
        <div>
          Anchorage mechanics: <strong>NO</strong>
        </div>

        {result?.anchor && (
          <>
            <div className="mt-2">
              Anchor ID: <strong>{result.anchor.id}</strong>
            </div>
            <div>
              Anchor material: <strong>{result.declaredUnknowns.materialId ?? "UNKNOWN"}</strong>
            </div>
            <div>
              Anchor mass: <strong>{result.declaredUnknowns.massKg === null ? "UNKNOWN" : `${result.declaredUnknowns.massKg} kg`}</strong>
            </div>
          </>
        )}

        <div className="mt-2">
          Attachment connection: <strong>{result?.attachmentConnection?.id ?? "UNKNOWN"}</strong>
        </div>
        <div>
          Support ID: <strong>{result?.support?.id ?? "UNKNOWN"}</strong>
        </div>
        <div>
          Topology capacity: <strong>{result?.declaredUnknowns.topologyCapacityN === null || result?.declaredUnknowns.topologyCapacityN === undefined ? "UNKNOWN" : `${result.declaredUnknowns.topologyCapacityN} N`}</strong>
        </div>
        <div>
          Physical attachment point: <strong>UNKNOWN / NOT DEFINED</strong>
        </div>
        <div>
          Inferred attachment point: <strong>NONE — PROHIBITED</strong>
        </div>
        <div>
          Bolt/rod type & diameter / embedment / base plate / weld-fastener details: <strong>UNKNOWN / NOT DEFINED</strong>
        </div>
        <div>
          Pedestal / footing / concrete strength / soil model / bearing / friction: <strong>UNKNOWN / NOT DEFINED</strong>
        </div>
        <div>
          Uplift & shear reactions / sliding & overturning resistance / pullout & breakout: <strong>UNKNOWN / NOT EVALUATED</strong>
        </div>
        <div>
          Demand / capacity / utilization / PASS-FAIL: <strong>UNKNOWN / NOT EVALUATED</strong>
        </div>
        {result && (
          <div className="mt-2 text-slate-500">{result.reason}</div>
        )}
      </div>
    </div>
  );
}
