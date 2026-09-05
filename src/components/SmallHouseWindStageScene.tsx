import { Box, Html } from "@react-three/drei";

import type {
  SmallHouseStructuralComponentKind,
  SmallHouseWindStageSnapshot,
} from "@/types/smallHouseWind";

function componentColor(kind: SmallHouseStructuralComponentKind): string {
  switch (kind) {
    case "primary_support":
      return "#94a3b8";
    case "floor_ring_frame_member":
      return "#64748b";
    case "wall_panel":
      return "#cbd5e1";
    case "roof_panel":
      return "#f59e0b";
    case "brace":
      return "#22c55e";
    case "anchor":
      return "#38bdf8";
    case "storm_protection_member":
      return "#a855f7";
  }
}

interface SmallHouseWindStageSceneProps {
  snapshot: SmallHouseWindStageSnapshot;
}

/**
 * Geometry-review renderer only.
 *
 * It renders the validated snapshot literally. It does not create physics
 * bodies, loads, restraints, connection locations, capacities, PASS/FAIL
 * states, or hidden material properties.
 */
export default function SmallHouseWindStageScene({
  snapshot,
}: SmallHouseWindStageSceneProps) {
  const envelope = snapshot.envelope;

  return (
    <group>
      <Box
        args={[envelope.sizeM.x, envelope.sizeM.y, envelope.sizeM.z]}
        position={[envelope.centerM.x, envelope.centerM.y, envelope.centerM.z]}
      >
        <meshStandardMaterial
          color="#64748b"
          transparent
          opacity={0.08}
          wireframe
          depthWrite={false}
        />
      </Box>

      {snapshot.components.map((component) => (
        <Box
          key={component.id}
          args={[component.sizeM.x, component.sizeM.y, component.sizeM.z]}
          position={[component.centerM.x, component.centerM.y, component.centerM.z]}
          rotation={[
            component.rotationRad.x,
            component.rotationRad.y,
            component.rotationRad.z,
          ]}
        >
          <meshStandardMaterial
            color={componentColor(component.kind)}
            transparent
            opacity={component.kind === "wall_panel" ? 0.38 : 0.78}
          />
        </Box>
      ))}

      <Html
        position={[
          envelope.centerM.x,
          envelope.centerM.y + envelope.sizeM.y / 2 + 0.35,
          envelope.centerM.z,
        ]}
        center
      >
        <div className="rounded border border-slate-700 bg-slate-950/92 px-2 py-1 text-[10px] text-slate-200 whitespace-nowrap shadow-lg">
          Phase 4 · {snapshot.stage.replaceAll("_", " ")} · {snapshot.structuralResult}
        </div>
      </Html>
    </group>
  );
}
