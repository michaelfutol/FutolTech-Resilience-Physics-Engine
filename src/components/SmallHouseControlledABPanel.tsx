"use client";

import { useMemo } from "react";

import { SYNTHETIC_PHASE4_HOUSE } from "@/data/smallHouseWind/syntheticPhase4House";
import { compareControlledSmallHouseVariants } from "@/lib/smallHouseWind/controlledABComparison";
import {
  SMALL_HOUSE_CONTROLLED_AB_SCHEMA_VERSION,
  type SmallHouseControlledABComparisonInput,
} from "@/types/smallHouseControlledAB";
import type {
  SmallHouseWindSpecimenInput,
  SmallHouseWindStageSnapshot,
} from "@/types/smallHouseWind";

const DECLARED_CONNECTION_ID = "synthetic-connection-storm-west-second-end";

function cloneSyntheticSpecimen(): SmallHouseWindSpecimenInput {
  return {
    ...SYNTHETIC_PHASE4_HOUSE,
    envelope: {
      ...SYNTHETIC_PHASE4_HOUSE.envelope,
      centerM: { ...SYNTHETIC_PHASE4_HOUSE.envelope.centerM },
      sizeM: { ...SYNTHETIC_PHASE4_HOUSE.envelope.sizeM },
    },
    components: SYNTHETIC_PHASE4_HOUSE.components.map((component) => ({
      ...component,
      centerM: { ...component.centerM },
      sizeM: { ...component.sizeM },
      rotationRad: { ...component.rotationRad },
    })),
    connections: SYNTHETIC_PHASE4_HOUSE.connections.map((connection) => ({
      ...connection,
    })),
  };
}

function buildControlledComparisonInput(): SmallHouseControlledABComparisonInput {
  const caseA = cloneSyntheticSpecimen();
  const caseB = cloneSyntheticSpecimen();

  caseB.connections.push({
    id: DECLARED_CONNECTION_ID,
    activationStage: "storm_protection",
    fromComponentId: "synthetic-storm-strap-west",
    toComponentId: "synthetic-anchor-nw",
    capacityN: null,
    sourceNote:
      "Synthetic QA A/B declared second storm-restraint endpoint only; no mechanics or capacity adopted",
    verificationState: "unverified",
  });

  return {
    schemaVersion: SMALL_HOUSE_CONTROLLED_AB_SCHEMA_VERSION,
    caseA: {
      label: "A — canonical one-ended storm strap",
      specimen: caseA,
    },
    caseB: {
      label: "B — QA-only explicit second storm endpoint",
      specimen: caseB,
    },
    declaredChange: {
      kind: "connection_record_added",
      connectionId: DECLARED_CONNECTION_ID,
    },
    sourceNote:
      "Synthetic Phase 4 controlled-input A/B browser QA only; no structural-performance claim",
    verificationState: "unverified",
  };
}

function YesNo({ value }: { value: boolean }) {
  return <strong>{value ? "YES" : "NO"}</strong>;
}

export default function SmallHouseControlledABPanel({
  snapshot,
}: {
  snapshot: SmallHouseWindStageSnapshot;
}) {
  const comparison = useMemo(() => {
    if (snapshot.stage !== "storm_protection") return null;

    try {
      return compareControlledSmallHouseVariants(buildControlledComparisonInput());
    } catch {
      return null;
    }
  }, [snapshot.stage]);

  return (
    <div className="mt-4 border-t border-cyan-950 pt-3">
      <div className="font-semibold text-cyan-200">
        Controlled A/B specimen difference
      </div>
      <p className="mt-1 text-[10px] text-slate-500">
        Input-control gate only. Case B may differ from Case A by exactly one
        declared structural record while all unrelated specimen inputs remain
        invariant. A controlled input difference is not evidence that either
        house is stronger, safer, or better.
      </p>

      {snapshot.stage !== "storm_protection" ? (
        <div className="mt-3 rounded border border-cyan-950 bg-slate-900/60 p-2 text-[10px] text-slate-300">
          <div>
            Controlled A/B state: <strong>BLOCKED — STORM PROTECTION STAGE REQUIRED</strong>
          </div>
          <div className="mt-1">
            Performance comparison: <strong>NO</strong>
          </div>
          <div>Structural result: <strong>N/A</strong></div>
        </div>
      ) : (
        <div className="mt-3 rounded border border-cyan-950 bg-slate-900/60 p-2 text-[10px] text-slate-300">
          <div>
            Controlled A/B state:{" "}
            <strong>{comparison?.state ?? "NOT EVALUATED"}</strong>
          </div>
          <div className="mt-1">
            Evidence layer: <strong>{comparison?.evidenceLayer ?? "N/A"}</strong>
          </div>
          <div>Structural result: <strong>{comparison?.structuralResult ?? "N/A"}</strong></div>
          <div>Mechanics available: <strong>NO</strong></div>
          <div>Performance comparison: <strong>NO</strong></div>
          <div>Performance conclusion: <strong>NOT AVAILABLE</strong></div>

          <div className="mt-3 font-semibold text-slate-200">Controlled cases</div>
          <div className="mt-1">
            Case A: <strong>{comparison?.caseA.label ?? "N/A"}</strong>
          </div>
          <div>
            Case B: <strong>{comparison?.caseB.label ?? "N/A"}</strong>
          </div>
          <div>
            Same specimen ID:{" "}
            <strong>
              {comparison && comparison.caseA.specimenId === comparison.caseB.specimenId
                ? comparison.caseA.specimenId
                : "NO"}
            </strong>
          </div>

          <div className="mt-3 font-semibold text-slate-200">Exactly one declared change</div>
          <div className="mt-1">
            Change kind: <strong>{comparison?.declaredChange.kind ?? "N/A"}</strong>
          </div>
          <div>
            Connection record: <strong>{comparison?.declaredChange.connectionId ?? "N/A"}</strong>
          </div>
          <div>
            Explicit topology:{" "}
            <strong>
              {comparison?.observedDifference.connection
                ? `${comparison.observedDifference.connection.fromComponentId} → ${comparison.observedDifference.connection.toComponentId}`
                : "NOT OBSERVED"}
            </strong>
          </div>
          <div>
            Added capacity: <strong>UNKNOWN</strong>
          </div>

          <div className="mt-3 font-semibold text-slate-200">Invariant proof</div>
          <div>
            Specimen metadata unchanged:{" "}
            <YesNo value={comparison?.invariants.specimenMetadataUnchanged ?? false} />
          </div>
          <div>
            Envelope unchanged:{" "}
            <YesNo value={comparison?.invariants.envelopeUnchanged ?? false} />
          </div>
          <div>
            Component records unchanged:{" "}
            <YesNo value={comparison?.invariants.componentRecordsUnchanged ?? false} />
          </div>
          <div>
            Component geometry unchanged:{" "}
            <YesNo value={comparison?.invariants.componentGeometryUnchanged ?? false} />
          </div>
          <div>
            Existing connections unchanged:{" "}
            <YesNo value={comparison?.invariants.existingConnectionRecordsUnchanged ?? false} />
          </div>
          <div>
            Only declared connection added:{" "}
            <YesNo value={comparison?.invariants.onlyDeclaredConnectionAdded ?? false} />
          </div>

          <div className="mt-3 text-amber-300">
            NO WINNER / NO STRENGTH RANKING. Adding a topology record does not
            prove that the restraint has stiffness, strength, attachment
            capacity, load sharing, uplift resistance, or whole-house benefit.
          </div>
          {comparison && (
            <div className="mt-2 text-slate-500">{comparison.reason}</div>
          )}
        </div>
      )}
    </div>
  );
}
