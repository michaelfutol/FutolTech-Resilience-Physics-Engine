import { Material, CostItem, FailureEvent } from "@/types/rpe";

interface RightPanelProps {
  materials: Material[];
  costItems: CostItem[];
  simulationStatus: "idle" | "running" | "complete";
  activeFailureEvent: FailureEvent | null;
}

export default function RightPanel({ materials, costItems, simulationStatus }: RightPanelProps) {
  const structureMaterials = materials.filter((m) => m.type !== "connection");
  const connections = materials.filter((m) => m.type === "connection");

  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col shrink-0 overflow-y-auto">
      <div className="p-4 border-b border-slate-800">
        <h2 className="font-medium text-slate-200">Simulation Results & Settings</h2>
      </div>
      <div className="p-4 space-y-6">
        {simulationStatus === "complete" && (
          <div className="bg-slate-800 rounded p-3 border border-red-900/50">
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Simulation Summary</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-slate-400">Baseline result:</span> <span className="text-red-400 font-medium">Likely fails / major damage</span></p>
              <p><span className="text-slate-400">First likely failure:</span> Sawali cladding vibration</p>
              <p><span className="text-slate-400">Primary weak points:</span> roof uplift, frame racking, cladding attachment</p>
              <div className="pt-2 mt-2 border-t border-slate-700">
                <p className="text-slate-400 text-xs mb-1">Suggested improvements:</p>
                <ul className="list-disc pl-4 text-slate-300 text-xs">
                  <li>Add diagonal bracing</li>
                  <li>Add roof tie-down straps</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Materials</h3>
          <div className="space-y-3">
            {structureMaterials.map((mat) => (
              <div key={mat.id} className="bg-slate-700 p-3 rounded-md">
                <div className="text-sm font-medium text-slate-200">{mat.name}</div>
                <div className="text-xs text-slate-400 mt-1 capitalize">{mat.type}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Connectors</h3>
          <div className="space-y-2">
            {connections.map((conn) => (
              <label key={conn.id} className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" className="rounded border-slate-600 bg-slate-700" defaultChecked />
                {conn.name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Cost Estimate</h3>
          <div className="space-y-2 text-sm">
            {costItems.map((cost) => (
              <div key={cost.id} className="flex justify-between border-b border-slate-700 pb-1 mb-1">
                <span className="text-slate-400">{cost.name}</span>
                <span className="text-slate-200 font-mono">₱{cost.placeholderCost.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-2 text-emerald-400">
              <span>Total Estimated</span>
              <span className="font-mono">₱{costItems.reduce((acc, curr) => acc + curr.placeholderCost, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
