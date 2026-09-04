"use client";

import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box, Grid, Html, Line } from "@react-three/drei";

import { Specimen, FailureEvent } from "@/types/rpe";
import { GENESIS_SCHEMA_VERSION, type GenesisNullHouseResult } from "@/types/genesis";
import { rpeTokens } from "@/lib/ui/tokens";

interface Viewport3DProps {
  specimen: Specimen | null;
  activeFailureEvent: FailureEvent | null;
}

type ViewMode = "conceptual" | "genesis_null";

const NULL_HOUSE_RESULT: GenesisNullHouseResult = {
  schemaVersion: GENESIS_SCHEMA_VERSION,
  evidenceLayer: "rpe_simulation",
  structuralResult: "N/A",
  reason: "no_physical_specimen",
};

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

export default function Viewport3D({ specimen, activeFailureEvent }: Viewport3DProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("conceptual");
  const [speedText, setSpeedText] = useState("");
  const [directionText, setDirectionText] = useState("");

  const speedKph = speedText.trim() === "" ? null : Number(speedText);
  const directionDegrees = directionText.trim() === "" ? null : Number(directionText);
  const validSpeed = speedKph !== null && Number.isFinite(speedKph) && speedKph >= 0;
  const validDirection =
    directionDegrees !== null && Number.isFinite(directionDegrees);
  const smokeEnabled = validSpeed && validDirection;

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

        {viewMode === "conceptual" ? (
          <>
            <Box args={[3, 0.1, 3]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#1e293b" />
            </Box>
            <Box args={[0.1, 3, 0.1]} position={[-1.4, 1.5, -1.4]}>
              <meshStandardMaterial color="#475569" />
            </Box>
            <Box args={[0.1, 3, 0.1]} position={[1.4, 1.5, -1.4]}>
              <meshStandardMaterial color="#475569" />
            </Box>
            <Box args={[0.1, 3, 0.1]} position={[-1.4, 1.5, 1.4]}>
              <meshStandardMaterial color="#475569" />
            </Box>
            <Box args={[0.1, 3, 0.1]} position={[1.4, 1.5, 1.4]}>
              <meshStandardMaterial color="#475569" />
            </Box>
            <Box args={[3.2, 0.2, 3.2]} position={[0, 3.1, 0]}>
              <meshStandardMaterial color="#334155" />
            </Box>

            {activeFailureEvent && (
              <Html position={getMarkerPosition(activeFailureEvent.target)} center>
                <div className={`px-2 py-1 ${rpeTokens.layout.borderRadius} ${rpeTokens.typography.data} font-bold text-white whitespace-nowrap shadow-lg flex items-center gap-2 ${getMarkerColor(activeFailureEvent.severity)} border`}>
                  {activeFailureEvent.severity === "critical" && <span className="w-2 h-2 rounded-full bg-white opacity-50 animate-ping absolute -left-1"></span>}
                  {activeFailureEvent.name}
                </div>
              </Html>
            )}
          </>
        ) : (
          <GenesisNullHouse
            directionDegrees={smokeEnabled ? directionDegrees : null}
          />
        )}

        <Grid infiniteGrid fadeDistance={20} sectionColor="#334155" cellColor="#0f172a" />
        <OrbitControls makeDefault />
      </Canvas>

      <div className={`absolute top-4 left-4 ${rpeTokens.colors.background.panel} px-3 py-2 ${rpeTokens.layout.borderRadius} ${rpeTokens.typography.data} ${rpeTokens.colors.text.muted} border ${rpeTokens.colors.borders.default} ${rpeTokens.layout.shadow}`}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded border border-slate-600 px-2 py-1 text-xs"
            onClick={() => setViewMode("conceptual")}
          >
            Conceptual
          </button>
          <button
            type="button"
            className="rounded border border-sky-700 px-2 py-1 text-xs"
            onClick={() => setViewMode("genesis_null")}
          >
            Genesis Null House
          </button>
        </div>
        <div className="mt-1">
          {viewMode === "conceptual"
            ? `Conceptual Physics Viewport — ${specimen ? specimen.name : "Loading..."}`
            : "Genesis Test Chamber — empty envelope only"}
        </div>
      </div>

      {viewMode === "genesis_null" && (
        <div className="absolute top-4 right-4 w-64 rounded border border-slate-700 bg-slate-950/90 p-3 text-xs text-slate-200 shadow-lg">
          <div className="font-semibold text-sky-300">Fast Smoke — NON-CFD</div>
          <p className="mt-1 text-slate-400">
            Browser streamline visualization only. It is not a pressure solution, CFD result, or structural proof.
          </p>
          <label className="mt-3 block text-slate-300">
            Wind speed (kph)
            <input
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
              inputMode="decimal"
              value={speedText}
              onChange={(event) => setSpeedText(event.target.value)}
              placeholder="required; no default"
            />
          </label>
          <label className="mt-2 block text-slate-300">
            Direction (degrees)
            <input
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
              inputMode="decimal"
              value={directionText}
              onChange={(event) => setDirectionText(event.target.value)}
              placeholder="required; no default"
            />
          </label>
          <div className="mt-3 border-t border-slate-800 pt-2">
            <div>Structural result: <strong>{NULL_HOUSE_RESULT.structuralResult}</strong></div>
            <div>Reason: <code>{NULL_HOUSE_RESULT.reason}</code></div>
            <div>Evidence: <code>{NULL_HOUSE_RESULT.evidenceLayer}</code></div>
            <div className="mt-1 text-slate-400">
              {smokeEnabled
                ? `Visualization inputs accepted: ${speedKph} kph @ ${directionDegrees}°.`
                : "Enter explicit speed and direction to display streamlines."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
