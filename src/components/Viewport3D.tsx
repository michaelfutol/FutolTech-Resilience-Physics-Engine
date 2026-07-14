"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box, Grid, Html } from "@react-three/drei";

import { Specimen, FailureEvent } from "@/types/rpe";
import { rpeTokens } from "@/lib/ui/tokens";

interface Viewport3DProps {
  specimen: Specimen | null;
  activeFailureEvent: FailureEvent | null;
}

export default function Viewport3D({ specimen, activeFailureEvent }: Viewport3DProps) {
  
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
        
        {/* Placeholder structure */}
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

        {/* Active Failure Marker */}
        {activeFailureEvent && (
          <Html position={getMarkerPosition(activeFailureEvent.target)} center>
            <div className={`px-2 py-1 ${rpeTokens.layout.borderRadius} ${rpeTokens.typography.data} font-bold text-white whitespace-nowrap shadow-lg flex items-center gap-2 ${getMarkerColor(activeFailureEvent.severity)} border`}>
              {activeFailureEvent.severity === "critical" && <span className="w-2 h-2 rounded-full bg-white opacity-50 animate-ping absolute -left-1"></span>}
              {activeFailureEvent.name}
            </div>
          </Html>
        )}

        <Grid infiniteGrid fadeDistance={20} sectionColor="#334155" cellColor="#0f172a" />
        <OrbitControls makeDefault />
      </Canvas>
      <div className={`absolute top-4 left-4 ${rpeTokens.colors.background.panel} px-3 py-1.5 ${rpeTokens.layout.borderRadius} ${rpeTokens.typography.data} ${rpeTokens.colors.text.muted} border ${rpeTokens.colors.borders.default} ${rpeTokens.layout.shadow}`}>
        Conceptual Physics Viewport — {specimen ? specimen.name : "Loading..."}
      </div>
    </div>
  );
}
