import type {
  GenesisDebrisDynamicsGateResult,
  GenesisEvidenceEvent,
  GenesisRigidBodyGateResult,
} from "../../types/genesis";
import {
  buildGenesisOrderedEventLedger,
  type GenesisCollisionRecord,
  type GenesisOrderedEvidenceEvent,
} from "./simulationEventLedger";

export interface GenesisLiveSimulationEvidenceContext {
  analyticalEvents: GenesisEvidenceEvent[];
  releaseGate: GenesisRigidBodyGateResult;
  dynamicsGate: GenesisDebrisDynamicsGateResult;
  collisions: GenesisCollisionRecord[];
}

export interface GenesisLiveSimulationEvidenceSnapshot {
  context: GenesisLiveSimulationEvidenceContext;
  ledger: GenesisOrderedEvidenceEvent[];
}

function cloneCollision(record: GenesisCollisionRecord): GenesisCollisionRecord {
  return { ...record };
}

function buildSnapshot(
  context: GenesisLiveSimulationEvidenceContext,
): GenesisLiveSimulationEvidenceSnapshot {
  const copiedContext: GenesisLiveSimulationEvidenceContext = {
    analyticalEvents: context.analyticalEvents.map((event) => ({ ...event })),
    releaseGate: { ...context.releaseGate },
    dynamicsGate: { ...context.dynamicsGate },
    collisions: context.collisions.map(cloneCollision),
  };

  return {
    context: copiedContext,
    ledger: buildGenesisOrderedEventLedger(
      copiedContext.analyticalEvents,
      copiedContext.releaseGate,
      copiedContext.dynamicsGate,
      copiedContext.collisions,
    ),
  };
}

export function createGenesisLiveSimulationEvidence(
  analyticalEvents: GenesisEvidenceEvent[],
  releaseGate: GenesisRigidBodyGateResult,
  dynamicsGate: GenesisDebrisDynamicsGateResult,
): GenesisLiveSimulationEvidenceSnapshot {
  return buildSnapshot({
    analyticalEvents,
    releaseGate,
    dynamicsGate,
    collisions: [],
  });
}

export function recordGenesisRapierCollisionEnter(
  snapshot: GenesisLiveSimulationEvidenceSnapshot,
  collision: GenesisCollisionRecord,
): GenesisLiveSimulationEvidenceSnapshot {
  return buildSnapshot({
    analyticalEvents: snapshot.context.analyticalEvents,
    releaseGate: snapshot.context.releaseGate,
    dynamicsGate: snapshot.context.dynamicsGate,
    collisions: [...snapshot.context.collisions, cloneCollision(collision)],
  });
}
