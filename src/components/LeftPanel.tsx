import { Specimen } from "@/types/rpe";

interface LeftPanelProps {
  specimen: Specimen | null;
}

export default function LeftPanel({ specimen }: LeftPanelProps) {
  if (!specimen) return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col shrink-0 overflow-y-auto">
      <div className="p-4 border-b border-slate-700">
        <h2 className="font-medium text-slate-200">Model Builder</h2>
      </div>
      <div className="p-4 text-sm text-slate-400">Loading...</div>
    </aside>
  );

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col shrink-0 overflow-y-auto">
      <div className="p-4 border-b border-slate-700">
        <h2 className="font-medium text-slate-200">Model Builder</h2>
      </div>
      <div className="p-4 flex-1">
        <div className="mb-4">
          <div className="text-xs text-slate-500 uppercase font-semibold">Active Specimen</div>
          <div className="text-sm font-medium text-slate-200 mt-1">{specimen.name}</div>
          <div className="text-xs text-slate-400 mt-1 text-emerald-400 border border-emerald-900 bg-emerald-950/30 px-2 py-1 rounded inline-block">
            {specimen.dimensions}
          </div>
        </div>
        <ul className="space-y-3 text-sm text-slate-300">
          <li className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">Frame</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-slate-700 rounded-sm inline-block"></span>{specimen.frame_type}</span>
          </li>
          <li className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">Wall & Cladding</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-slate-700 rounded-sm inline-block"></span>{specimen.wall_type}</span>
            <span className="flex items-center gap-2 ml-5 text-slate-400 text-xs">+ {specimen.cladding}</span>
          </li>
          <li className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">Roof</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-slate-700 rounded-sm inline-block"></span>{specimen.roof_type}</span>
          </li>
          <li className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">Base</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-slate-700 rounded-sm inline-block"></span>{specimen.base_type}</span>
          </li>
        </ul>
      </div>
    </aside>
  );
}
