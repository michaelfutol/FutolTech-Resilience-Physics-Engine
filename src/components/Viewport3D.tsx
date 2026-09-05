"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box, Grid, Html, Line } from "@react-three/drei";
import { Physics, RigidBody, type RapierRigidBody } from "@react-three/rapier";

import { Specimen, FailureEvent } from "@/types/rpe";
import {
  GENESIS_SCHEMA_VERSION,
  type GenesisDebrisDynamicsGateResult,
  type GenesisNullHouseResult,
  type GenesisPanelExperimentResult,
  type GenesisRigidBodyGateResult,
  type GenesisVector3,
} from "@/types/genesis";
import type { GenesisCollisionTargetContract } from "@/types/genesisCollisionTarget";
import {
  buildGenesisEvidenceLog,
  calculateGenesisPanelExperiment,
} from "@/lib/genesis/panelExperiment";
import { assessGenesisRigidBodyReleaseGate } from "@/lib/genesis/rigidBodyGate";
import { assessGenesisDebrisDynamicsGate } from "@/lib/genesis/debrisDynamicsGate";
import {
  assessGenesisAerodynamicForceApplicationGate,
  createGenesisAerodynamicForceApplicationPlan,
} from "@/lib/genesis/aerodynamicForceApplication";
import type { GenesisAerodynamicForceApplicationPlan } from "@/types/genesisForceApplication";
import type { GenesisAerodynamicForceStepEvaluation } from "@/lib/genesis/aerodynamicForceWindow";
import {
  assessGenesisPostReleaseAerodynamicGate,
  calculateGenesisPostReleaseAerodynamics,
} from "@/lib/genesis/postReleaseAerodynamics";
import {
  createGenesisCollisionTargetUserData,
  resolveGenesisCollisionTargetObjectId,
  validateGenesisCollisionTargetInput,
} from "@/lib/genesis/collisionTarget";
import {
  createGenesisLiveSimulationEvidence,
  recordGenesisAerodynamicForceApplication,
  recordGenesisRapierCollisionEnter,
  type GenesisLiveSimulationEvidenceSnapshot,
} from "@/lib/genesis/liveSimulationEvidence";
import GenesisAerodynamicForceDriver, {
  GENESIS_RAPIER_FIXED_STEP_SECONDS,
} from "@/components/GenesisAerodynamicForceDriver";
import GenesisEventLedgerPanel from "@/components/GenesisEventLedgerPanel";
import SmallHouseWindStageScene from "@/components/SmallHouseWindStageScene";
import PrimarySupportReadinessPanel from "@/components/PrimarySupportReadinessPanel";
import FloorRingFrameReadinessPanel from "@/components/FloorRingFrameReadinessPanel";
import WallPanelExposureReadinessPanel from "@/components/WallPanelExposureReadinessPanel";
import { SYNTHETIC_PHASE4_HOUSE } from "@/data/smallHouseWind/syntheticPhase4House";
import { materializeSmallHouseWindStage } from "@/lib/smallHouseWind/systemContract";
import type { SmallHouseWindStage } from "@/types/smallHouseWind";
import { rpeTokens } from "@/lib/ui/tokens";

interface Viewport3DProps {
  specimen: Specimen | null;
  activeFailureEvent: FailureEvent | null;
}

type ViewMode = "conceptual" | "genesis_null" | "genesis_panel" | "phase4_house";
type TargetVerificationText = "" | "verified" | "provisional" | "unverified";

type CollisionEvidenceState = {
  inputKey: string;
  snapshot: GenesisLiveSimulationEvidenceSnapshot | null;
};

const PHASE4_STAGES: SmallHouseWindStage[] = [
  "empty_envelope",
  "primary_supports",
  "floor_ring_frame",
  "walls",
  "roof",
  "connections",
  "bracing",
  "anchorage",
  "storm_protection",
];

const NULL_HOUSE_RESULT: GenesisNullHouseResult = {
  schemaVersion: GENESIS_SCHEMA_VERSION,
  evidenceLayer: "rpe_simulation",
  structuralResult: "N/A",
  reason: "no_physical_specimen",
};

function parseInputNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseVector3(xText: string, yText: string, zText: string): GenesisVector3 | null {
  if ([xText, yText, zText].some((value) => value.trim() === "")) return null;
  const x = parseInputNumber(xText);
  const y = parseInputNumber(yText);
  const z = parseInputNumber(zText);
  if (x === null || y === null || z === null) return null;
  return { x, y, z };
}

function FastSmoke({ directionDegrees }: { directionDegrees: number }) {
  const radians = (directionDegrees * Math.PI) / 180;
  const directionX = Math.cos(radians);
  const directionZ = Math.sin(radians);
  const normalX = -directionZ;
  const normalZ = directionX;

  const streamlines = useMemo(() => {
    return [-1.6, -0.8, 0, 0.8, 1.6].map((offset, index) => {
      const startX = -5 * directionX + offset * normalX;
      const startZ = -5 * directionZ + offset * normalZ;
      const endX = 5 * directionX + offset * normalX;
      const endZ = 5 * directionZ + offset * normalZ;
      const height = 0.8 + index * 0.45;
      return [
        [startX, height, startZ],
        [0, height, 0],
        [endX, height, endZ],
      ] as [number, number, number][];
    });
  }, [directionX, directionZ, normalX, normalZ]);

  return (
    <group>
      {streamlines.map((points, index) => (
        <Line
          key={index}
          points={points}
          color="#38bdf8"
          lineWidth={1.2}
          transparent
          opacity={0.55}
        />
      ))}
    </group>
  );
}

function GenesisNullHouse({ directionDegrees }: { directionDegrees: number | null }) {
  return (
    <group>
      <Box args={[3, 3, 3]} position={[0, 1.5, 0]}>
        <meshStandardMaterial
          color="#94a3b8"
          transparent
          opacity={0.1}
          wireframe
          depthWrite={false}
        />
      </Box>
      {directionDegrees !== null && <FastSmoke directionDegrees={directionDegrees} />}
    </group>
  );
}

function connectionColor(experiment: GenesisPanelExperimentResult | null): string {
  if (!experiment || experiment.connection.state === "unverified") return "#94a3b8";
  if (experiment.connection.state === "exceeded") return "#ef4444";
  return "#22c55e";
}

function StaticPanel({ widthM, heightM }: { widthM: number; heightM: number }) {
  return (
    <Box args={[0.08, heightM, widthM]} position={[0, heightM / 2, 0]}>
      <meshStandardMaterial color="#64748b" transparent opacity={0.72} />
    </Box>
  );
}

function CollisionTargetVisual({ target }: { target: GenesisCollisionTargetContract }) {
  return (
    <Box
      args={[target.sizeM.x, target.sizeM.y, target.sizeM.z]}
      position={[target.centerM.x, target.centerM.y, target.centerM.z]}
    >
      <meshStandardMaterial color="#a855f7" transparent opacity={0.58} />
    </Box>
  );
}

function DynamicPanel({
  widthM,
  heightM,
  releaseGate,
  dynamicsGate,
  collisionTarget,
  aerodynamicForcePlan,
  runContextKey,
  onCollisionEnter,
  onAerodynamicForceStep,
}: {
  widthM: number;
  heightM: number;
  releaseGate: GenesisRigidBodyGateResult;
  dynamicsGate: GenesisDebrisDynamicsGateResult;
  collisionTarget: GenesisCollisionTargetContract | null;
  aerodynamicForcePlan: GenesisAerodynamicForceApplicationPlan | null;
  runContextKey: string;
  onCollisionEnter: (otherUserData: unknown) => void;
  onAerodynamicForceStep: (evaluation: GenesisAerodynamicForceStepEvaluation) => void;
}) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);

  const ready =
    releaseGate.state === "release_ready" &&
    releaseGate.canRelease &&
    dynamicsGate.state === "simulation_ready" &&
    dynamicsGate.canSimulate &&
    releaseGate.massKg !== null &&
    dynamicsGate.gravityMps2 !== null &&
    dynamicsGate.initialLinearVelocityMps !== null &&
    dynamicsGate.initialAngularVelocityRadPerSec !== null;

  useEffect(() => {
    if (
      !ready ||
      !rigidBodyRef.current ||
      dynamicsGate.initialLinearVelocityMps === null ||
      dynamicsGate.initialAngularVelocityRadPerSec === null
    ) {
      return;
    }

    rigidBodyRef.current.setLinvel(dynamicsGate.initialLinearVelocityMps, true);
    rigidBodyRef.current.setAngvel(dynamicsGate.initialAngularVelocityRadPerSec, true);
  }, [ready, dynamicsGate.initialLinearVelocityMps, dynamicsGate.initialAngularVelocityRadPerSec]);

  if (
    !ready ||
    releaseGate.massKg === null ||
    dynamicsGate.gravityMps2 === null
  ) {
    return <StaticPanel widthM={widthM} heightM={heightM} />;
  }

  const gravity = dynamicsGate.gravityMps2;

  return (
    <Physics gravity={[gravity.x, gravity.y, gravity.z]} timeStep={GENESIS_RAPIER_FIXED_STEP_SECONDS}>
      <GenesisAerodynamicForceDriver
        rigidBodyRef={rigidBodyRef}
        plan={aerodynamicForcePlan}
        runContextKey={runContextKey}
        onForceStepEvidence={onAerodynamicForceStep}
      />
      <RigidBody
        ref={rigidBodyRef}
        colliders="cuboid"
        mass={releaseGate.massKg}
        position={[0, heightM / 2, 0]}
        onCollisionEnter={(event) => onCollisionEnter(event.other.rigidBody?.userData)}
      >
        <Box args={[0.08, heightM, widthM]}>
          <meshStandardMaterial color="#f59e0b" transparent opacity={0.8} />
        </Box>
      </RigidBody>

      {collisionTarget && (
        <RigidBody
          type="fixed"
          colliders="cuboid"
          position={[
            collisionTarget.centerM.x,
            collisionTarget.centerM.y,
            collisionTarget.centerM.z,
          ]}
          userData={createGenesisCollisionTargetUserData(collisionTarget)}
        >
          <Box args={[collisionTarget.sizeM.x, collisionTarget.sizeM.y, collisionTarget.sizeM.z]}>
            <meshStandardMaterial color="#a855f7" transparent opacity={0.72} />
          </Box>
        </RigidBody>
      )}
    </Physics>
  );
}

function GenesisPanelScene({
  widthM,
  heightM,
  directionDegrees,
  experiment,
  releaseGate,
  dynamicsGate,
  collisionTarget,
  aerodynamicForcePlan,
  runContextKey,
  onCollisionEnter,
  onAerodynamicForceStep,
}: {
  widthM: number;
  heightM: number;
  directionDegrees: number | null;
  experiment: GenesisPanelExperimentResult | null;
  releaseGate: GenesisRigidBodyGateResult | null;
  dynamicsGate: GenesisDebrisDynamicsGateResult | null;
  collisionTarget: GenesisCollisionTargetContract | null;
  aerodynamicForcePlan: GenesisAerodynamicForceApplicationPlan | null;
  runContextKey: string;
  onCollisionEnter: (otherUserData: unknown) => void;
  onAerodynamicForceStep: (evaluation: GenesisAerodynamicForceStepEvaluation) => void;
}) {
  const halfWidth = widthM / 2;
  const halfHeight = heightM / 2;
  const markerColor = connectionColor(experiment);
  const simulationReady =
    releaseGate?.state === "release_ready" &&
    releaseGate.canRelease &&
    dynamicsGate?.state === "simulation_ready" &&
    dynamicsGate.canSimulate;

  const forceVector = useMemo(() => {
    if (directionDegrees === null) return null;
    const radians = (directionDegrees * Math.PI) / 180;
    return [
      [0, halfHeight, 0],
      [Math.cos(radians) * 1.8, halfHeight, Math.sin(radians) * 1.8],
    ] as [number, number, number][];
  }, [directionDegrees, halfHeight]);

  const connectionPositions: [number, number, number][] = [
    [0.08, 0.08, -halfWidth + 0.08],
    [0.08, 0.08, halfWidth - 0.08],
    [0.08, heightM - 0.08, -halfWidth + 0.08],
    [0.08, heightM - 0.08, halfWidth - 0.08],
  ];

  return (
    <group>
      <GenesisNullHouse directionDegrees={directionDegrees} />

      {simulationReady && releaseGate && dynamicsGate ? (
        <DynamicPanel
          widthM={widthM}
          heightM={heightM}
          releaseGate={releaseGate}
          dynamicsGate={dynamicsGate}
          collisionTarget={collisionTarget}
          aerodynamicForcePlan={aerodynamicForcePlan}
          runContextKey={runContextKey}
          onCollisionEnter={onCollisionEnter}
          onAerodynamicForceStep={onAerodynamicForceStep}
        />
      ) : (
        <>
          <StaticPanel widthM={widthM} heightM={heightM} />
          {collisionTarget && <CollisionTargetVisual target={collisionTarget} />}
        </>
      )}

      {connectionPositions.map((position, index) => (
        <Box key={index} args={[0.14, 0.14, 0.14]} position={position}>
          <meshStandardMaterial color={markerColor} />
        </Box>
      ))}

      {!simulationReady && forceVector && (
        <Line
          points={forceVector}
          color="#f59e0b"
          lineWidth={2.2}
          transparent
          opacity={0.9}
        />
      )}

      <Html position={[0.2, heightM + 0.2, 0]} center>
        <div className="rounded border border-slate-600 bg-slate-950/90 px-2 py-1 text-[10px] text-slate-200 whitespace-nowrap">
          Panel 001 · {simulationReady ? "Rapier rigid body · explicit initial conditions" : "attached analytical state"}
        </div>
      </Html>

      {collisionTarget && (
        <Html
          position={[
            collisionTarget.centerM.x,
            collisionTarget.centerM.y + collisionTarget.sizeM.y / 2 + 0.2,
            collisionTarget.centerM.z,
          ]}
          center
        >
          <div className="rounded border border-purple-700 bg-slate-950/90 px-2 py-1 text-[10px] text-purple-200 whitespace-nowrap">
            Target · {collisionTarget.objectId} · geometry/provenance only
          </div>
        </Html>
      )}

      {experiment && (
        <Html position={[0.2, halfHeight, halfWidth + 0.35]} center>
          <div className="rounded border border-slate-600 bg-slate-950/90 px-2 py-1 text-[10px] text-slate-200 whitespace-nowrap">
            F = {experiment.wind.panelForceN.toFixed(2)} N · demand = {experiment.connection.demandN.toFixed(2)} N
          </div>
        </Html>
      )}
    </group>
  );
}

function VectorInputs({
  label,
  values,
  setters,
  unit,
}: {
  label: string;
  values: [string, string, string];
  setters: [(value: string) => void, (value: string) => void, (value: string) => void];
  unit: string;
}) {
  return (
    <div className="mt-2">
      <div className="text-slate-300">{label} ({unit})</div>
      <div className="mt-1 grid grid-cols-3 gap-1">
        {(["x", "y", "z"] as const).map((axis, index) => (
          <input
            key={axis}
            aria-label={`${label} ${axis}`}
            className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
            inputMode="decimal"
            value={values[index]}
            onChange={(event) => setters[index](event.target.value)}
            placeholder={axis}
          />
        ))}
      </div>
    </div>
  );
}

export default function Viewport3D({ specimen, activeFailureEvent }: Viewport3DProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("conceptual");
  const [phase4Stage, setPhase4Stage] = useState<SmallHouseWindStage>("empty_envelope");
  const [speedText, setSpeedText] = useState("");
  const [directionText, setDirectionText] = useState("");
  const [airDensityText, setAirDensityText] = useState("");
  const [panelWidthText, setPanelWidthText] = useState("");
  const [panelHeightText, setPanelHeightText] = useState("");
  const [pressureCoefficientText, setPressureCoefficientText] = useState("");
  const [connectionCapacityText, setConnectionCapacityText] = useState("");
  const [panelMassText, setPanelMassText] = useState("");
  const [gravityXText, setGravityXText] = useState("");
  const [gravityYText, setGravityYText] = useState("");
  const [gravityZText, setGravityZText] = useState("");
  const [linearXText, setLinearXText] = useState("");
  const [linearYText, setLinearYText] = useState("");
  const [linearZText, setLinearZText] = useState("");
  const [angularXText, setAngularXText] = useState("");
  const [angularYText, setAngularYText] = useState("");
  const [angularZText, setAngularZText] = useState("");
  const [targetIdText, setTargetIdText] = useState("");
  const [targetCenterXText, setTargetCenterXText] = useState("");
  const [targetCenterYText, setTargetCenterYText] = useState("");
  const [targetCenterZText, setTargetCenterZText] = useState("");
  const [targetSizeXText, setTargetSizeXText] = useState("");
  const [targetSizeYText, setTargetSizeYText] = useState("");
  const [targetSizeZText, setTargetSizeZText] = useState("");
  const [targetSourceNoteText, setTargetSourceNoteText] = useState("");
  const [targetVerificationText, setTargetVerificationText] = useState<TargetVerificationText>("");
  const [aeroIntervalText, setAeroIntervalText] = useState("");
  const [aeroDensityText, setAeroDensityText] = useState("");
  const [aeroRelativeXText, setAeroRelativeXText] = useState("");
  const [aeroRelativeYText, setAeroRelativeYText] = useState("");
  const [aeroRelativeZText, setAeroRelativeZText] = useState("");
  const [aeroProjectedAreaText, setAeroProjectedAreaText] = useState("");
  const [aeroDragCoefficientText, setAeroDragCoefficientText] = useState("");
  const [aeroSourceNoteText, setAeroSourceNoteText] = useState("");
  const [aeroVerificationText, setAeroVerificationText] = useState<TargetVerificationText>("");
  const [aeroApplicationEnabled, setAeroApplicationEnabled] = useState(false);
  const [aeroApplicationBodyIdText, setAeroApplicationBodyIdText] = useState("");
  const [aeroApplicationSourceNoteText, setAeroApplicationSourceNoteText] = useState("");
  const [aeroApplicationVerificationText, setAeroApplicationVerificationText] = useState<TargetVerificationText>("");
  const [collisionEvidenceState, setCollisionEvidenceState] = useState<CollisionEvidenceState>({
    inputKey: "",
    snapshot: null,
  });

  const speedKph = parseInputNumber(speedText);
  const directionDegrees = parseInputNumber(directionText);
  const airDensityKgPerM3 = parseInputNumber(airDensityText);
  const panelWidthM = parseInputNumber(panelWidthText);
  const panelHeightM = parseInputNumber(panelHeightText);
  const pressureCoefficient = parseInputNumber(pressureCoefficientText);
  const connectionCapacityN = parseInputNumber(connectionCapacityText);
  const panelMassKg = parseInputNumber(panelMassText);
  const gravityMps2 = parseVector3(gravityXText, gravityYText, gravityZText);
  const initialLinearVelocityMps = parseVector3(linearXText, linearYText, linearZText);
  const initialAngularVelocityRadPerSec = parseVector3(angularXText, angularYText, angularZText);
  const targetCenterM = parseVector3(targetCenterXText, targetCenterYText, targetCenterZText);
  const targetSizeM = parseVector3(targetSizeXText, targetSizeYText, targetSizeZText);
  const aeroIntervalSeconds = parseInputNumber(aeroIntervalText);
  const aeroDensityKgPerM3 = parseInputNumber(aeroDensityText);
  const aeroRelativeAirVelocityMps = parseVector3(aeroRelativeXText, aeroRelativeYText, aeroRelativeZText);
  const aeroProjectedAreaM2 = parseInputNumber(aeroProjectedAreaText);
  const aeroDragCoefficient = parseInputNumber(aeroDragCoefficientText);

  const validSpeed = speedKph !== null && speedKph >= 0;
  const validDirection = directionDegrees !== null;
  const validDensity = airDensityKgPerM3 !== null && airDensityKgPerM3 > 0;
  const validPanelWidth = panelWidthM !== null && panelWidthM > 0;
  const validPanelHeight = panelHeightM !== null && panelHeightM > 0;
  const validPressureCoefficient = pressureCoefficient !== null;
  const validConnectionCapacity = connectionCapacityText.trim() === "" || (connectionCapacityN !== null && connectionCapacityN >= 0);
  const validMass = panelMassText.trim() === "" || (panelMassKg !== null && panelMassKg > 0);

  const smokeEnabled = validSpeed && validDirection;
  const panelGeometryReady = validPanelWidth && validPanelHeight;
  const panelExperimentReady = validSpeed && validDirection && validDensity && validPanelWidth && validPanelHeight && validPressureCoefficient && validConnectionCapacity;

  const panelExperiment = useMemo<GenesisPanelExperimentResult | null>(() => {
    if (!panelExperimentReady || speedKph === null || directionDegrees === null || airDensityKgPerM3 === null || panelWidthM === null || panelHeightM === null || pressureCoefficient === null) return null;
    try {
      return calculateGenesisPanelExperiment(
        {
          schemaVersion: GENESIS_SCHEMA_VERSION,
          speedKph,
          directionDegrees,
          airDensityKgPerM3,
          sourceNote: "Interactive Genesis Panel 001 input",
          verificationState: "unverified",
        },
        {
          id: "genesis-panel-001",
          widthM: panelWidthM,
          heightM: panelHeightM,
          pressureCoefficient,
          sourceNote: "Interactive Genesis Panel 001 input",
          verificationState: "unverified",
        },
        {
          id: "genesis-connection-001",
          capacityN: connectionCapacityText.trim() === "" ? null : connectionCapacityN,
          sourceNote: connectionCapacityText.trim() === "" ? "Capacity not supplied" : "Interactive Genesis Panel 001 input",
          verificationState: "unverified",
        },
      );
    } catch {
      return null;
    }
  }, [panelExperimentReady, speedKph, directionDegrees, airDensityKgPerM3, panelWidthM, panelHeightM, pressureCoefficient, connectionCapacityText, connectionCapacityN]);

  const releaseGate = useMemo<GenesisRigidBodyGateResult | null>(() => {
    if (!panelExperiment || !validMass) return null;
    try {
      return assessGenesisRigidBodyReleaseGate(panelExperiment, {
        massKg: panelMassText.trim() === "" ? null : panelMassKg,
        sourceNote: panelMassText.trim() === "" ? "Panel mass not supplied" : "Interactive Genesis Panel 001 rigid-body input",
        verificationState: "unverified",
      });
    } catch {
      return null;
    }
  }, [panelExperiment, validMass, panelMassText, panelMassKg]);

  const dynamicsGate = useMemo<GenesisDebrisDynamicsGateResult | null>(() => {
    if (!releaseGate) return null;
    try {
      return assessGenesisDebrisDynamicsGate(releaseGate, {
        gravityMps2,
        initialLinearVelocityMps,
        initialAngularVelocityRadPerSec,
        sourceNote: "Interactive Genesis Panel 001 debris-dynamics input",
        verificationState: "unverified",
      });
    } catch {
      return null;
    }
  }, [releaseGate, gravityMps2, initialLinearVelocityMps, initialAngularVelocityRadPerSec]);

  const postReleaseAerodynamicGate = useMemo(() => {
    if (!dynamicsGate || aeroVerificationText === "") return null;
    try {
      return assessGenesisPostReleaseAerodynamicGate(dynamicsGate, {
        bodyId: "genesis-panel-001",
        intervalSeconds: aeroIntervalText.trim() === "" ? null : aeroIntervalSeconds,
        airDensityKgPerM3: aeroDensityText.trim() === "" ? null : aeroDensityKgPerM3,
        relativeAirVelocityMps: aeroRelativeAirVelocityMps,
        projectedAreaM2: aeroProjectedAreaText.trim() === "" ? null : aeroProjectedAreaM2,
        dragCoefficient: aeroDragCoefficientText.trim() === "" ? null : aeroDragCoefficient,
        sourceNote: aeroSourceNoteText,
        verificationState: aeroVerificationText,
      });
    } catch {
      return null;
    }
  }, [
    dynamicsGate,
    aeroIntervalText,
    aeroIntervalSeconds,
    aeroDensityText,
    aeroDensityKgPerM3,
    aeroRelativeAirVelocityMps,
    aeroProjectedAreaText,
    aeroProjectedAreaM2,
    aeroDragCoefficientText,
    aeroDragCoefficient,
    aeroSourceNoteText,
    aeroVerificationText,
  ]);

  const postReleaseAerodynamicResult = useMemo(() => {
    if (!postReleaseAerodynamicGate?.canCalculate || postReleaseAerodynamicGate.state !== "aerodynamic_ready") {
      return null;
    }
    try {
      return calculateGenesisPostReleaseAerodynamics(postReleaseAerodynamicGate);
    } catch {
      return null;
    }
  }, [postReleaseAerodynamicGate]);

  const aerodynamicForceApplicationGate = useMemo(() => {
    if (!dynamicsGate || aeroApplicationVerificationText === "") return null;
    try {
      return assessGenesisAerodynamicForceApplicationGate(
        dynamicsGate,
        postReleaseAerodynamicGate,
        postReleaseAerodynamicResult,
        {
          enabled: aeroApplicationEnabled,
          bodyId: aeroApplicationBodyIdText,
          sourceNote: aeroApplicationSourceNoteText,
          verificationState: aeroApplicationVerificationText,
        },
      );
    } catch {
      return null;
    }
  }, [
    dynamicsGate,
    postReleaseAerodynamicGate,
    postReleaseAerodynamicResult,
    aeroApplicationEnabled,
    aeroApplicationBodyIdText,
    aeroApplicationSourceNoteText,
    aeroApplicationVerificationText,
  ]);

  const aerodynamicForceApplicationPlan = useMemo<GenesisAerodynamicForceApplicationPlan | null>(() => {
    if (
      !aerodynamicForceApplicationGate?.canApply ||
      aerodynamicForceApplicationGate.state !== "force_application_ready" ||
      !postReleaseAerodynamicResult
    ) {
      return null;
    }
    try {
      return createGenesisAerodynamicForceApplicationPlan(
        aerodynamicForceApplicationGate,
        postReleaseAerodynamicResult,
      );
    } catch {
      return null;
    }
  }, [aerodynamicForceApplicationGate, postReleaseAerodynamicResult]);

  const collisionTarget = useMemo<GenesisCollisionTargetContract | null>(() => {
    if (
      targetIdText.trim() === "" ||
      targetSourceNoteText.trim() === "" ||
      targetVerificationText === "" ||
      targetCenterM === null ||
      targetSizeM === null
    ) {
      return null;
    }

    try {
      return validateGenesisCollisionTargetInput({
        schemaVersion: GENESIS_SCHEMA_VERSION,
        id: targetIdText,
        shape: "box",
        centerM: targetCenterM,
        sizeM: targetSizeM,
        sourceNote: targetSourceNoteText,
        verificationState: targetVerificationText,
      });
    } catch {
      return null;
    }
  }, [targetIdText, targetSourceNoteText, targetVerificationText, targetCenterM, targetSizeM]);

  const panelEvidenceLog = useMemo(() => (panelExperiment ? buildGenesisEvidenceLog(panelExperiment) : []), [panelExperiment]);
  const simulationReady = releaseGate?.state === "release_ready" && releaseGate.canRelease && dynamicsGate?.state === "simulation_ready" && dynamicsGate.canSimulate;

  const phase4Snapshot = useMemo(
    () => materializeSmallHouseWindStage(SYNTHETIC_PHASE4_HOUSE, phase4Stage),
    [phase4Stage],
  );

  const liveEvidenceInputKey = [
    speedText,
    directionText,
    airDensityText,
    panelWidthText,
    panelHeightText,
    pressureCoefficientText,
    connectionCapacityText,
    panelMassText,
    gravityXText,
    gravityYText,
    gravityZText,
    linearXText,
    linearYText,
    linearZText,
    angularXText,
    angularYText,
    angularZText,
    targetIdText,
    targetCenterXText,
    targetCenterYText,
    targetCenterZText,
    targetSizeXText,
    targetSizeYText,
    targetSizeZText,
    targetSourceNoteText,
    targetVerificationText,
    aeroIntervalText,
    aeroDensityText,
    aeroRelativeXText,
    aeroRelativeYText,
    aeroRelativeZText,
    aeroProjectedAreaText,
    aeroDragCoefficientText,
    aeroSourceNoteText,
    aeroVerificationText,
    aeroApplicationEnabled ? "enabled" : "disabled",
    aeroApplicationBodyIdText,
    aeroApplicationSourceNoteText,
    aeroApplicationVerificationText,
  ].join("|");

  const baseLiveEvidence = useMemo<GenesisLiveSimulationEvidenceSnapshot | null>(() => {
    if (!releaseGate || !dynamicsGate) return null;
    try {
      return createGenesisLiveSimulationEvidence(panelEvidenceLog, releaseGate, dynamicsGate);
    } catch {
      return null;
    }
  }, [panelEvidenceLog, releaseGate, dynamicsGate]);

  const liveEvidence =
    collisionEvidenceState.inputKey === liveEvidenceInputKey && collisionEvidenceState.snapshot
      ? collisionEvidenceState.snapshot
      : baseLiveEvidence;

  const handlePanelCollisionEnter = (otherUserData: unknown) => {
    if (!baseLiveEvidence) return;

    const otherObjectId = resolveGenesisCollisionTargetObjectId(otherUserData, collisionTarget);
    const sourceNote = otherObjectId
      ? `Live Rapier onCollisionEnter callback from Genesis Panel 001 against declared collision target ${otherObjectId}. Collision observation only; no impact force, energy, damage, or contact-property claim.`
      : "Live Rapier onCollisionEnter callback from Genesis Panel 001; the other collider was not resolved as the currently validated explicit Genesis collision target.";

    setCollisionEvidenceState((current) => {
      const startingSnapshot =
        current.inputKey === liveEvidenceInputKey && current.snapshot
          ? current.snapshot
          : baseLiveEvidence;

      try {
        return {
          inputKey: liveEvidenceInputKey,
          snapshot: recordGenesisRapierCollisionEnter(startingSnapshot, {
            panelId: "genesis-panel-001",
            otherObjectId,
            sourceNote,
          }),
        };
      } catch {
        return current;
      }
    });
  };

  const handleAerodynamicForceStep = (evaluation: GenesisAerodynamicForceStepEvaluation) => {
    if (!baseLiveEvidence || !aerodynamicForceApplicationPlan) return;

    setCollisionEvidenceState((current) => {
      const startingSnapshot =
        current.inputKey === liveEvidenceInputKey && current.snapshot
          ? current.snapshot
          : baseLiveEvidence;

      try {
        return {
          inputKey: liveEvidenceInputKey,
          snapshot: recordGenesisAerodynamicForceApplication(startingSnapshot, {
            bodyId: evaluation.bodyId,
            state: evaluation.state,
            elapsedSeconds: evaluation.elapsedSeconds,
            physicsStepSeconds: evaluation.physicsStepSeconds,
            activeDurationSeconds: evaluation.activeDurationSeconds,
            activeFractionOfPhysicsStep: evaluation.activeFractionOfPhysicsStep,
            effectiveForceN: evaluation.effectiveForceN,
            expectedImpulseNs: evaluation.expectedImpulseNs,
            sourceNote: `${aerodynamicForceApplicationPlan.provenance.sourceNote} Live fixed-step Rapier center-of-mass application observation; no aerodynamic torque, CFD authority, solver authority, or physical-test claim.`,
          }),
        };
      } catch {
        return current;
      }
    });
  };

  const getMarkerPosition = (target: string): [number, number, number] => {
    switch (target) {
      case "roof": return [0, 3, 0];
      case "wall": return [1.5, 1.5, 0];
      case "frame": return [1.5, 2.5, 1.5];
      case "base": return [1.5, 0.1, 1.5];
      case "global": return [0, 4, 0];
      default: return [0, 2, 0];
    }
  };

  const getMarkerColor = (severity: string) => {
    switch (severity) {
      case "low": return rpeTokens.colors.status.caution;
      case "medium": return rpeTokens.colors.status.warning;
      case "high": return rpeTokens.colors.status.failure;
      case "critical": return `${rpeTokens.colors.status.failure} font-bold animate-pulse`;
      default: return rpeTokens.colors.background.surface;
    }
  };

  return (
    <div className={`flex-1 ${rpeTokens.colors.background.main} relative`}>
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {viewMode === "conceptual" && (
          <>
            <Box args={[3, 0.1, 3]} position={[0, 0, 0]}><meshStandardMaterial color="#1e293b" /></Box>
            <Box args={[0.1, 3, 0.1]} position={[-1.4, 1.5, -1.4]}><meshStandardMaterial color="#475569" /></Box>
            <Box args={[0.1, 3, 0.1]} position={[1.4, 1.5, -1.4]}><meshStandardMaterial color="#475569" /></Box>
            <Box args={[0.1, 3, 0.1]} position={[-1.4, 1.5, 1.4]}><meshStandardMaterial color="#475569" /></Box>
            <Box args={[0.1, 3, 0.1]} position={[1.4, 1.5, 1.4]}><meshStandardMaterial color="#475569" /></Box>
            <Box args={[3.2, 0.2, 3.2]} position={[0, 3.1, 0]}><meshStandardMaterial color="#334155" /></Box>
            {activeFailureEvent && (
              <Html position={getMarkerPosition(activeFailureEvent.target)} center>
                <div className={`px-2 py-1 ${rpeTokens.layout.borderRadius} ${rpeTokens.typography.data} font-bold text-white whitespace-nowrap shadow-lg flex items-center gap-2 ${getMarkerColor(activeFailureEvent.severity)} border`}>
                  {activeFailureEvent.name}
                </div>
              </Html>
            )}
          </>
        )}

        {viewMode === "genesis_null" && <GenesisNullHouse directionDegrees={smokeEnabled ? directionDegrees : null} />}

        {viewMode === "genesis_panel" && panelGeometryReady && panelWidthM !== null && panelHeightM !== null ? (
          <GenesisPanelScene
            widthM={panelWidthM}
            heightM={panelHeightM}
            directionDegrees={smokeEnabled ? directionDegrees : null}
            experiment={panelExperiment}
            releaseGate={releaseGate}
            dynamicsGate={dynamicsGate}
            collisionTarget={collisionTarget}
            aerodynamicForcePlan={aerodynamicForceApplicationPlan}
            runContextKey={liveEvidenceInputKey}
            onCollisionEnter={handlePanelCollisionEnter}
            onAerodynamicForceStep={handleAerodynamicForceStep}
          />
        ) : viewMode === "genesis_panel" ? (
          <GenesisNullHouse directionDegrees={smokeEnabled ? directionDegrees : null} />
        ) : null}

        {viewMode === "phase4_house" && <SmallHouseWindStageScene snapshot={phase4Snapshot} />}

        <Grid infiniteGrid fadeDistance={20} sectionColor="#334155" cellColor="#0f172a" />
        <OrbitControls makeDefault />
      </Canvas>

      <div className={`absolute top-4 left-4 ${rpeTokens.colors.background.panel} px-3 py-2 ${rpeTokens.layout.borderRadius} ${rpeTokens.typography.data} ${rpeTokens.colors.text.muted} border ${rpeTokens.colors.borders.default} ${rpeTokens.layout.shadow}`}>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="rounded border border-slate-600 px-2 py-1 text-xs" onClick={() => setViewMode("conceptual")}>Conceptual</button>
          <button type="button" className="rounded border border-sky-700 px-2 py-1 text-xs" onClick={() => setViewMode("genesis_null")}>Null House</button>
          <button type="button" className="rounded border border-amber-700 px-2 py-1 text-xs" onClick={() => setViewMode("genesis_panel")}>Panel 001</button>
          <button type="button" className="rounded border border-emerald-700 px-2 py-1 text-xs" onClick={() => setViewMode("phase4_house")}>Small House</button>
        </div>
        <div className="mt-1">
          {viewMode === "conceptual" && `Conceptual Physics Viewport — ${specimen ? specimen.name : "Loading..."}`}
          {viewMode === "genesis_null" && "Genesis Test Chamber — empty envelope only"}
          {viewMode === "genesis_panel" && "Genesis Test Chamber — analytical gate + explicit Rapier initial conditions"}
          {viewMode === "phase4_house" && "Phase 4 Test Chamber — staged small-house topology review"}
        </div>
      </div>

      {viewMode === "phase4_house" && (
        <div className="absolute top-4 right-4 w-96 max-h-[calc(100%-2rem)] overflow-y-auto rounded border border-emerald-900 bg-slate-950/95 p-3 text-xs text-slate-200 shadow-lg">
          <div className="font-semibold text-emerald-300">Phase 4 · Small House Wind System</div>
          <p className="mt-1 text-slate-400">Synthetic software-QA geometry only. This is not a Dignity production dimension set and does not establish structural capacity, code compliance, wind resistance, or material performance.</p>

          <label className="mt-3 block text-slate-300">Construction stage
            <select
              aria-label="Phase 4 stage"
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
              value={phase4Stage}
              onChange={(event) => setPhase4Stage(event.target.value as SmallHouseWindStage)}
            >
              {PHASE4_STAGES.map((stage) => (
                <option key={stage} value={stage}>{stage.replaceAll("_", " ")}</option>
              ))}
            </select>
          </label>

          <div className="mt-3 rounded border border-slate-800 bg-slate-900/60 p-2">
            <div>Fixture: <strong>{SYNTHETIC_PHASE4_HOUSE.label}</strong></div>
            <div className="mt-1">Stage: <strong>{phase4Snapshot.stage}</strong></div>
            <div className="mt-1">Structural result: <strong>{phase4Snapshot.structuralResult}</strong></div>
            <div className="mt-1">Reason: <code>{phase4Snapshot.reason}</code></div>
            <div className="mt-1">Declared components: <strong>{phase4Snapshot.components.length}</strong></div>
            <div className="mt-1">Declared topology connections: <strong>{phase4Snapshot.connections.length}</strong></div>
          </div>

          <div className="mt-3 border-t border-slate-800 pt-2">
            <div className="font-semibold text-slate-200">Active component identities</div>
            {phase4Snapshot.components.length === 0 ? (
              <p className="mt-1 text-slate-500">No physical component exists in this stage. Envelope only.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {phase4Snapshot.components.map((component) => (
                  <div key={component.id} className="rounded border border-slate-800 bg-slate-900/55 p-2">
                    <div className="font-mono text-[10px] text-slate-200">{component.id}</div>
                    <div className="mt-1 text-[10px] text-slate-400">{component.kind} · stage={component.activationStage} · verification={component.verificationState}</div>
                    <div className="mt-1 text-[10px] text-slate-500">rotation(rad)=({component.rotationRad.x}, {component.rotationRad.y}, {component.rotationRad.z})</div>
                    <div className="mt-1 text-[10px] text-slate-500">material={component.materialId ?? "UNKNOWN"} · mass={component.massKg === null ? "UNKNOWN" : `${component.massKg} kg`}</div>
                    <div className="mt-1 text-[10px] text-slate-600">{component.sourceNote}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 border-t border-slate-800 pt-2">
            <div className="font-semibold text-slate-200">Active connection topology</div>
            <p className="mt-1 text-[10px] text-slate-500">Connections list object relationships only. No joint coordinate is declared yet, so RPE deliberately does not draw a physical connection line between member centers.</p>
            {phase4Snapshot.connections.length === 0 ? (
              <p className="mt-1 text-slate-500">No connection topology is active in this stage.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {phase4Snapshot.connections.map((connection) => (
                  <div key={connection.id} className="rounded border border-slate-800 bg-slate-900/55 p-2 text-[10px]">
                    <div className="font-mono text-slate-200">{connection.id}</div>
                    <div className="mt-1 text-slate-400">{connection.fromComponentId} → {connection.toComponentId}</div>
                    <div className="mt-1 text-slate-500">stage={connection.activationStage} · capacity={connection.capacityN === null ? "UNKNOWN" : `${connection.capacityN} N`} · verification={connection.verificationState}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <PrimarySupportReadinessPanel snapshot={phase4Snapshot} />

          <FloorRingFrameReadinessPanel snapshot={phase4Snapshot} />

          <WallPanelExposureReadinessPanel snapshot={phase4Snapshot} />

          <p className="mt-3 border-t border-slate-800 pt-2 text-[10px] text-amber-300">VISIBLE ≠ ADEQUATE. This viewer is topology/geometry QA only. Whole-house wind actions, stiffness, reactions, racking, uplift, sliding, failure, and debris are not claimed by this stage viewer.</p>
        </div>
      )}

      {viewMode === "genesis_null" && (
        <div className="absolute top-4 right-4 w-64 rounded border border-slate-700 bg-slate-950/90 p-3 text-xs text-slate-200 shadow-lg">
          <div className="font-semibold text-sky-300">Fast Smoke — NON-CFD</div>
          <p className="mt-1 text-slate-400">Browser streamline visualization only. It is not a pressure solution, CFD result, or structural proof.</p>
          <label className="mt-3 block text-slate-300">Wind speed (kph)<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={speedText} onChange={(event) => setSpeedText(event.target.value)} placeholder="required; no default" /></label>
          <label className="mt-2 block text-slate-300">Direction (degrees)<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={directionText} onChange={(event) => setDirectionText(event.target.value)} placeholder="required; no default" /></label>
          <div className="mt-3 border-t border-slate-800 pt-2">
            <div>Structural result: <strong>{NULL_HOUSE_RESULT.structuralResult}</strong></div>
            <div>Reason: <code>{NULL_HOUSE_RESULT.reason}</code></div>
            <div>Evidence: <code>{NULL_HOUSE_RESULT.evidenceLayer}</code></div>
            <div className="mt-1 text-slate-400">{smokeEnabled ? `Visualization inputs accepted: ${speedKph} kph @ ${directionDegrees}°.` : "Enter explicit speed and direction to display streamlines."}</div>
          </div>
        </div>
      )}

      {viewMode === "genesis_panel" && (
        <div className="absolute top-4 right-4 w-80 max-h-[calc(100%-2rem)] overflow-y-auto rounded border border-slate-700 bg-slate-950/95 p-3 text-xs text-slate-200 shadow-lg">
          <div className="font-semibold text-amber-300">Genesis Panel 001</div>
          <p className="mt-1 text-slate-400">Analytical wind action and release eligibility remain separate from Rapier simulation. Every motion-driving input is explicit; blank means missing.</p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="block text-slate-300">Wind (kph)<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={speedText} onChange={(event) => setSpeedText(event.target.value)} placeholder="required" /></label>
            <label className="block text-slate-300">Direction (°)<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={directionText} onChange={(event) => setDirectionText(event.target.value)} placeholder="required" /></label>
            <label className="block text-slate-300">Air density (kg/m³)<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={airDensityText} onChange={(event) => setAirDensityText(event.target.value)} placeholder="required" /></label>
            <label className="block text-slate-300">Coefficient C<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={pressureCoefficientText} onChange={(event) => setPressureCoefficientText(event.target.value)} placeholder="required" /></label>
            <label className="block text-slate-300">Panel width (m)<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={panelWidthText} onChange={(event) => setPanelWidthText(event.target.value)} placeholder="required" /></label>
            <label className="block text-slate-300">Panel height (m)<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={panelHeightText} onChange={(event) => setPanelHeightText(event.target.value)} placeholder="required" /></label>
          </div>

          <label className="mt-2 block text-slate-300">Equivalent connection capacity (N)<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={connectionCapacityText} onChange={(event) => setConnectionCapacityText(event.target.value)} placeholder="optional; blank = unverified" /></label>

          <div className="mt-3 border-t border-slate-800 pt-2">
            <div className="font-semibold text-amber-200">Rigid-body simulation inputs — explicit only</div>
            <label className="mt-2 block text-slate-300">Panel mass (kg)<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={panelMassText} onChange={(event) => setPanelMassText(event.target.value)} placeholder="required for release; no default" /></label>
            <VectorInputs label="Gravity" unit="m/s²" values={[gravityXText, gravityYText, gravityZText]} setters={[setGravityXText, setGravityYText, setGravityZText]} />
            <VectorInputs label="Initial linear velocity" unit="m/s" values={[linearXText, linearYText, linearZText]} setters={[setLinearXText, setLinearYText, setLinearZText]} />
            <VectorInputs label="Initial angular velocity" unit="rad/s" values={[angularXText, angularYText, angularZText]} setters={[setAngularXText, setAngularYText, setAngularZText]} />
            <p className="mt-2 text-[10px] text-slate-500">Zero vectors are accepted only when all three zero components are explicitly entered. Panel force is not converted into an impulse or continuing aerodynamic force.</p>
          </div>

          <div className="mt-3 border-t border-slate-800 pt-2">
            <div className="font-semibold text-sky-200">Post-release aerodynamics — analytical preview only</div>
            <p className="mt-1 text-[10px] text-slate-500">This simplified quasi-steady drag result is NOT applied to Rapier yet. Post-release density, relative airflow, projected area, Cd, and integration interval are entered separately; no pre-release panel force is reused as an impulse.</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="block text-slate-300">Aero interval (s)<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={aeroIntervalText} onChange={(event) => setAeroIntervalText(event.target.value)} placeholder="required; > 0" /></label>
              <label className="block text-slate-300">Aero air density (kg/m³)<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={aeroDensityText} onChange={(event) => setAeroDensityText(event.target.value)} placeholder="required; no inheritance" /></label>
              <label className="block text-slate-300">Projected area (m²)<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={aeroProjectedAreaText} onChange={(event) => setAeroProjectedAreaText(event.target.value)} placeholder="required; current state" /></label>
              <label className="block text-slate-300">Drag coefficient Cd<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" inputMode="decimal" value={aeroDragCoefficientText} onChange={(event) => setAeroDragCoefficientText(event.target.value)} placeholder="required; caller supplied" /></label>
            </div>
            <VectorInputs label="Relative air velocity" unit="m/s" values={[aeroRelativeXText, aeroRelativeYText, aeroRelativeZText]} setters={[setAeroRelativeXText, setAeroRelativeYText, setAeroRelativeZText]} />
            <label className="mt-2 block text-slate-300">Aerodynamic source note<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={aeroSourceNoteText} onChange={(event) => setAeroSourceNoteText(event.target.value)} placeholder="required provenance" /></label>
            <label className="mt-2 block text-slate-300">Aerodynamic verification state
              <select aria-label="Aerodynamic verification state" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={aeroVerificationText} onChange={(event) => setAeroVerificationText(event.target.value as TargetVerificationText)}>
                <option value="">required; no default</option>
                <option value="verified">verified</option>
                <option value="provisional">provisional</option>
                <option value="unverified">unverified</option>
              </select>
            </label>
            <div className="mt-2 rounded border border-sky-950 bg-slate-900/60 p-2 text-[10px] text-slate-300">
              <div>Aerodynamic gate: <strong>{postReleaseAerodynamicGate?.state ?? "NOT EVALUATED"}</strong></div>
              {postReleaseAerodynamicGate && <div className="mt-1 text-slate-500">{postReleaseAerodynamicGate.reason}</div>}
              {postReleaseAerodynamicResult && (
                <div className="mt-2 space-y-1">
                  <div>Relative air speed: <strong>{postReleaseAerodynamicResult.relativeAirSpeedMps.toFixed(4)} m/s</strong></div>
                  <div>Dynamic pressure: <strong>{postReleaseAerodynamicResult.dynamicPressurePa.toFixed(2)} Pa</strong></div>
                  <div>Drag magnitude: <strong>{postReleaseAerodynamicResult.dragForceMagnitudeN.toFixed(2)} N</strong></div>
                  <div>Drag vector: <strong>({postReleaseAerodynamicResult.dragForceN.x.toFixed(2)}, {postReleaseAerodynamicResult.dragForceN.y.toFixed(2)}, {postReleaseAerodynamicResult.dragForceN.z.toFixed(2)}) N</strong></div>
                  <div>Constant-force FΔt: <strong>({postReleaseAerodynamicResult.constantForceImpulseNs.x.toFixed(2)}, {postReleaseAerodynamicResult.constantForceImpulseNs.y.toFixed(2)}, {postReleaseAerodynamicResult.constantForceImpulseNs.z.toFixed(2)}) N·s</strong></div>
                  <div className="pt-1 font-semibold text-amber-300">ANALYTICAL RESULT ONLY — live application still requires the explicit force-application gate below.</div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 border-t border-slate-800 pt-2">
            <div className="font-semibold text-cyan-200">Live aerodynamic force application — explicit opt-in</div>
            <p className="mt-1 text-[10px] text-slate-500">Default is OFF. When ready, only the tested fixed-step scheduler output is applied at the rigid-body center of mass. Aerodynamic torque remains unmodeled.</p>
            <label className="mt-2 flex items-center gap-2 text-slate-300">
              <input aria-label="Enable post-release aerodynamic force" type="checkbox" checked={aeroApplicationEnabled} onChange={(event) => setAeroApplicationEnabled(event.target.checked)} />
              Enable post-release aerodynamic force
            </label>
            <label className="mt-2 block text-slate-300">Force application body ID<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={aeroApplicationBodyIdText} onChange={(event) => setAeroApplicationBodyIdText(event.target.value)} placeholder="required; must match aerodynamic body" /></label>
            <label className="mt-2 block text-slate-300">Force application source note<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={aeroApplicationSourceNoteText} onChange={(event) => setAeroApplicationSourceNoteText(event.target.value)} placeholder="required provenance" /></label>
            <label className="mt-2 block text-slate-300">Force application verification state
              <select aria-label="Force application verification state" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={aeroApplicationVerificationText} onChange={(event) => setAeroApplicationVerificationText(event.target.value as TargetVerificationText)}>
                <option value="">required; no default</option>
                <option value="verified">verified</option>
                <option value="provisional">provisional</option>
                <option value="unverified">unverified</option>
              </select>
            </label>
            <div className="mt-2 rounded border border-cyan-950 bg-slate-900/60 p-2 text-[10px] text-slate-300">
              <div>Force application gate: <strong>{aerodynamicForceApplicationGate?.state ?? "NOT EVALUATED"}</strong></div>
              <div className="mt-1">Force application plan: <strong>{aerodynamicForceApplicationPlan ? "READY — LIVE COM FORCE" : "NONE"}</strong></div>
              <div className="mt-1">Physics step: <strong>{GENESIS_RAPIER_FIXED_STEP_SECONDS.toFixed(6)} s fixed</strong></div>
              <div className="mt-1">Aerodynamic torque: <strong>NOT MODELED</strong></div>
              {aerodynamicForceApplicationGate && <div className="mt-1 text-slate-500">{aerodynamicForceApplicationGate.reason}</div>}
            </div>
          </div>

          <div className="mt-3 border-t border-slate-800 pt-2">
            <div className="font-semibold text-purple-200">Collision target — explicit geometry/provenance only</div>
            <p className="mt-1 text-[10px] text-slate-500">No target exists until every field validates. Geometry does not define material, friction, restitution, stiffness, impact force/energy, or damage.</p>
            <label className="mt-2 block text-slate-300">Target object ID<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={targetIdText} onChange={(event) => setTargetIdText(event.target.value)} placeholder="required; no default" /></label>
            <VectorInputs label="Target center" unit="m" values={[targetCenterXText, targetCenterYText, targetCenterZText]} setters={[setTargetCenterXText, setTargetCenterYText, setTargetCenterZText]} />
            <VectorInputs label="Target box size" unit="m" values={[targetSizeXText, targetSizeYText, targetSizeZText]} setters={[setTargetSizeXText, setTargetSizeYText, setTargetSizeZText]} />
            <label className="mt-2 block text-slate-300">Source note<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={targetSourceNoteText} onChange={(event) => setTargetSourceNoteText(event.target.value)} placeholder="required provenance" /></label>
            <label className="mt-2 block text-slate-300">Verification state
              <select className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1" value={targetVerificationText} onChange={(event) => setTargetVerificationText(event.target.value as TargetVerificationText)}>
                <option value="">required; no default</option>
                <option value="verified">verified</option>
                <option value="provisional">provisional</option>
                <option value="unverified">unverified</option>
              </select>
            </label>
            <div className="mt-2 text-[10px] text-slate-500">Target contract: <strong>{collisionTarget ? `VALID — ${collisionTarget.objectId}` : "ABSENT / INVALID"}</strong></div>
          </div>

          <div className="mt-3 border-t border-slate-800 pt-2 text-slate-300">
            {!panelExperiment && <div className="text-slate-500">Enter valid wind, density, geometry, and coefficient inputs. Capacity may remain blank, which keeps release blocked as unverified.</div>}
            {panelExperiment && (
              <div className="space-y-1">
                <div>Area: <strong>{panelExperiment.panel.exposedAreaM2.toFixed(4)} m²</strong></div>
                <div>Wind speed: <strong>{panelExperiment.wind.speedMps.toFixed(4)} m/s</strong></div>
                <div>Dynamic pressure q: <strong>{panelExperiment.wind.dynamicPressurePa.toFixed(2)} Pa</strong></div>
                <div>Signed panel force F: <strong>{panelExperiment.wind.panelForceN.toFixed(2)} N</strong></div>
                <div>Connection demand: <strong>{panelExperiment.connection.demandN.toFixed(2)} N</strong></div>
                <div>Capacity: <strong>{panelExperiment.connection.capacityN === null ? "UNVERIFIED" : `${panelExperiment.connection.capacityN.toFixed(2)} N`}</strong></div>
                <div>Analytical state: <strong>{panelExperiment.experimentState.replaceAll("_", " ").toUpperCase()}</strong></div>
                <div className="mt-2 rounded border border-slate-800 bg-slate-900/60 p-2">
                  <div>Release gate: <strong>{releaseGate?.state ?? (validMass ? "not evaluated" : "invalid mass input")}</strong></div>
                  <div className="mt-1">Dynamics gate: <strong>{dynamicsGate?.state ?? "not evaluated"}</strong></div>
                  <div className="mt-1">Rapier: <strong>{simulationReady ? "ACTIVE — RPE SIMULATION" : "BLOCKED"}</strong></div>
                  <div className="mt-1">Collision target: <strong>{collisionTarget ? `${collisionTarget.objectId} — DECLARED` : "NONE"}</strong></div>
                  {releaseGate && <div className="mt-1 text-[10px] text-slate-500">{releaseGate.reason}</div>}
                  {dynamicsGate && <div className="mt-1 text-[10px] text-slate-500">{dynamicsGate.reason}</div>}
                </div>
                <div className="pt-1 text-[10px] text-slate-500">Analytical evidence remains {panelExperiment.evidenceLayer}. Rapier state is a separate rpe_simulation layer and is never treated as manual/code, solver, CFD, or physical-test evidence.</div>

                <div className="mt-3 border-t border-slate-800 pt-2">
                  {liveEvidence ? (
                    <GenesisEventLedgerPanel events={liveEvidence.ledger} />
                  ) : (
                    <>
                      <div className="font-semibold text-slate-300">Analytical evidence sequence</div>
                      <ol className="mt-1 space-y-1.5">
                        {panelEvidenceLog.map((event) => (
                          <li key={`${event.sequence}-${event.eventType}`} className="rounded border border-slate-800 bg-slate-900/60 p-1.5">
                            <div className="flex items-center justify-between gap-2 text-[10px]"><span>{event.sequence}. {event.eventType.replaceAll("_", " ")}</span><span className="text-slate-500">{event.status}</span></div>
                            <div className="mt-0.5 text-[10px] text-slate-500">{event.message}</div>
                          </li>
                        ))}
                      </ol>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
