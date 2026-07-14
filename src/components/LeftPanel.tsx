import { Specimen } from "@/types/rpe";
import { rpeTokens } from "@/lib/ui/tokens";

interface LeftPanelProps {
  specimen: Specimen | null;
}

export default function LeftPanel({ specimen }: LeftPanelProps) {
  if (!specimen) return (
    <aside className={`w-64 ${rpeTokens.colors.background.surface} border-r ${rpeTokens.colors.borders.default} flex flex-col shrink-0 overflow-y-auto`}>
      <div className={`p-4 border-b ${rpeTokens.colors.borders.divider}`}>
        <h2 className={rpeTokens.typography.heading}>Model Builder</h2>
      </div>
      <div className={`p-4 ${rpeTokens.typography.body} ${rpeTokens.colors.text.muted}`}>Loading...</div>
    </aside>
  );

  return (
    <aside className={`w-64 ${rpeTokens.colors.background.surface} border-r ${rpeTokens.colors.borders.divider} flex flex-col shrink-0 overflow-y-auto`}>
      <div className={`p-4 border-b ${rpeTokens.colors.borders.divider}`}>
        <h2 className={rpeTokens.typography.heading}>Model Builder</h2>
      </div>
      <div className="p-4 flex-1">
        <div className="mb-6">
          <div className={rpeTokens.typography.heading}>Active Specimen</div>
          <div className={`text-sm font-medium ${rpeTokens.colors.text.primary} mt-1`}>{specimen.name}</div>
          <div className={`mt-2 ${rpeTokens.typography.data} ${rpeTokens.colors.status.success} border px-2 py-1 ${rpeTokens.layout.borderRadius} inline-block`}>
            {specimen.dimensions}
          </div>
        </div>
        
        <div className="mb-4">
          <div className={rpeTokens.typography.heading}>Structure Tree</div>
        </div>

        <ul className={`space-y-4 ${rpeTokens.typography.body} ${rpeTokens.colors.text.secondary}`}>
          <li className="flex flex-col gap-1 border-l-2 border-slate-700 pl-3 ml-1">
            <span className={rpeTokens.typography.label}>Site / Orientation</span>
            <span className={`flex items-center gap-2 ${rpeTokens.typography.data}`}>South Facing</span>
          </li>
          <li className="flex flex-col gap-1 border-l-2 border-slate-700 pl-3 ml-1">
            <span className={rpeTokens.typography.label}>Foundation / Base</span>
            <span className="flex items-center gap-2">{specimen.base_type}</span>
          </li>
          <li className="flex flex-col gap-1 border-l-2 border-slate-700 pl-3 ml-1">
            <span className={rpeTokens.typography.label}>Frame</span>
            <span className="flex items-center gap-2">{specimen.frame_type}</span>
          </li>
          <li className="flex flex-col gap-1 border-l-2 border-slate-700 pl-3 ml-1">
            <span className={rpeTokens.typography.label}>Wall System</span>
            <span className="flex items-center gap-2">{specimen.wall_type}</span>
            <span className={`flex items-center gap-2 ${rpeTokens.typography.data} ${rpeTokens.colors.text.muted}`}>+ {specimen.cladding}</span>
          </li>
          <li className="flex flex-col gap-1 border-l-2 border-slate-700 pl-3 ml-1">
            <span className={rpeTokens.typography.label}>Roof</span>
            <span className="flex items-center gap-2">{specimen.roof_type}</span>
          </li>
          <li className="flex flex-col gap-1 border-l-2 border-slate-700 pl-3 ml-1">
            <span className={rpeTokens.typography.label}>Connections</span>
            <span className={`flex items-center gap-2 ${rpeTokens.typography.data} ${rpeTokens.colors.text.muted}`}>Baseline fasteners</span>
          </li>
        </ul>
      </div>
    </aside>
  );
}
