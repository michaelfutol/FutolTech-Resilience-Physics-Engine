"use client";

import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box, Grid, Html, Line } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";

import { Specimen, FailureEvent } from "@/types/rpe";
import {
  GENESIS_SCHEMA_VERSION,
  type GenesisDebrisDynamicsGateResult,
  type GenesisNullHouseResult,
  type GenesisPanelExperimentResult,
  type GenesisRigidBodyGateResult,
  type GenesisVector3,
} from "@/types/genesis";
import {
  buildGenesisEvidenceLog,
  calculateGenesisPanelExperiment,
} from "@/lib/genesis/panelExperiment";
import { assessGenesisRigidBodyReleaseGate } from "@/lib/genesis/rigidBodyGate";
import { assessGenesisDebrisDynamicsGate } from "@/lib/genesis/debrisDynamicsGate";
import { rpeTokens } from "@/lib/ui/tokens";

interface Viewport3DProps {
  specimen: Specimen | null;
  activeFailureEvent: FailureEvent | null;
}

type ViewMode = "conceptual" | "genesis_null" | "genesis_panel";

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

function DynamicPanel({
  widthM,
  heightM,
  releaseGate,
  dynamicsGate,
}: {
  widthM: number;
  heightM: number;
  releaseGate: GenesisRigidBodyGateResult;
  dynamicsGate: GenesisDebrisDynamicsGateResult;
}) {
  if (
    releaseGate.state !== "release_ready" ||
    !releaseGate.canRelease ||
    dynamicsGate.state !== "simulation_ready" ||
    !dynamicsGate.canSimulate ||
    releaseGate.massKg === null ||
    dynamicsGate.gravityMps2 === null ||
    dynamicsGate.initialLinearVelocityMps === null ||
    dynamicsGate.initialAngularVelocityRadPerSec === null
  ) {
    return <StaticPanel widthM={widthM} heightM={heightM} />;
  }

  const gravity = dynamicsGate.gravityMps2;
  const linear = dynamicsGate.initialLinearVelocityMps;
  const angular = dynamicsGate.initialAngularVelocityRadPerSec;

  return (
    <Physics gravity={[gravity.x, gravity.y, gravity.z]}>
      <RigidBody
        colliders="cuboid"
        mass={releaseGate.massKg}
        position={[0, heightM / 2, 0]}
        linvel={[linear.x, linear.y, linear.z]}
        angvel={[angular.x, angular.y, angular.z]}
      >
        <Box args={[0.08, heightM, widthM]}>
          <meshStandardMaterial color="#f59e0b" transparent opacity={0.8} />
        </Box>
      </RigidBody>
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
}: {
  widthM: number;
  heightM: number;
  directionDegrees: number | null;
  experiment: GenesisPanelExperimentResult | null;
  releaseGate: GenesisRigidBodyGateResult | null;
  dynamicsGate: GenesisDebrisDynamicsGateResult | null;
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
        />
      ) : (
        <StaticPanel widthM={widthM} heightM={heightM} />
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

  const panelEvidenceLog = useMemo(() => (panelExperiment ? buildGenesisEvidenceLog(panelExperiment) : []), [panelExperiment]);
  const simulationReady = releaseGate?.state === "release_ready" && releaseGate.canRelease && dynamicsGate?.state === "simulation_ready" && dynamicsGate.canSimulate;

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
          />
        ) : viewMode === "genesis_panel" ? (
          <GenesisNullHouse directionDegrees={smokeEnabled ? directionDegrees : null} />
        ) : null}

        <Grid infiniteGrid fadeDistance={20} sectionColor="#334155" cellColor="#0f172a" />
        <OrbitControls makeDefault />
      </Canvas>

      <div className={`absolute top-4 left-4 ${rpeTokens.colors.background.panel} px-3 py-2 ${rpeTokens.layout.borderRadius} ${rpeTokens.typography.data} ${rpeTokens.colors.text.muted} border ${rpeTokens.colors.borders.default} ${rpeTokens.layout.shadow}`}>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="rounded border border-slate-600 px-2 py-1 text-xs" onClick={() => setViewMode("conceptual")}>Conceptual</button>
          <button type="button" className="rounded border border-sky-700 px-2 py-1 text-xs" onClick={() => setViewMode("genesis_null")}>Null House</button>
          <button type="button" className="rounded border border-amber-700 px-2 py-1 text-xs" onClick={() => setViewMode("genesis_panel")}>Panel 001</button>
        </div>
        <div className="mt-1">
          {viewMode === "conceptual" && `Conceptual Physics Viewport — ${specimen ? specimen.name : "Loading..."}`}
          {viewMode === "genesis_null" && "Genesis Test Chamber — empty envelope only"}
          {viewMode === "genesis_panel" && "Genesis Test Chamber — analytical gate + explicit Rapier initial conditions"}
        </div>
      </div>

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
                  {releaseGate && <div className="mt-1 text-[10px] text-slate-500">{releaseGate.reason}</div>}
                  {dynamicsGate && <div className="mt-1 text-[10px] text-slate-500">{dynamicsGate.reason}</div>}
                </div>
                <div className="pt-1 text-[10px] text-slate-500">Analytical evidence remains {panelExperiment.evidenceLayer}. Rapier state is a separate rpe_simulation layer and is never treated as manual/code, solver, CFD, or physical-test evidence.</div>

                <div className="mt-3 border-t border-slate-800 pt-2">
                  <div className="font-semibold text-slate-300">Analytical evidence sequence</div>
                  <ol className="mt-1 space-y-1.5">
                    {panelEvidenceLog.map((event) => (
                      <li key={`${event.sequence}-${event.eventType}`} className="rounded border border-slate-800 bg-slate-900/60 p-1.5">
                        <div className="flex items-center justify-between gap-2 text-[10px]"><span>{event.sequence}. {event.eventType.replaceAll("_", " ")}</span><span className="text-slate-500">{event.status}</span></div>
                        <div className="mt-0.5 text-[10px] text-slate-500">{event.message}</div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
