import { FailureEvent } from "@/types/rpe";
import { rpeTokens } from "@/lib/ui/tokens";

interface BottomTimelineProps {
  events: FailureEvent[];
  activeEventIndex: number;
  elapsedTime: string;
}

export default function BottomTimeline({ events, activeEventIndex, elapsedTime }: BottomTimelineProps) {
  
  const getEventClass = (index: number, severity: string) => {
    // If it's in the future
    if (activeEventIndex < index) return `${rpeTokens.colors.text.muted} opacity-50`;
    
    // If it's exactly the active one, highlight it
    if (activeEventIndex === index) {
      switch (severity) {
        case "low": return `${rpeTokens.colors.status.caution} -mx-2 px-2 py-0.5 rounded border`;
        case "medium": return `${rpeTokens.colors.status.warning} -mx-2 px-2 py-0.5 rounded border`;
        case "high": return `${rpeTokens.colors.status.failure} -mx-2 px-2 py-0.5 rounded border`;
        case "critical": return `${rpeTokens.colors.status.failure} font-bold -mx-2 px-2 py-0.5 rounded border`;
        default: return `${rpeTokens.colors.text.primary} bg-slate-800 -mx-2 px-2 py-0.5 rounded border ${rpeTokens.colors.borders.default}`;
      }
    }
    
    // If it's in the past (completed)
    switch (severity) {
      case "low": return "text-amber-500";
      case "medium": return "text-orange-500";
      case "high": return "text-red-500";
      case "critical": return "text-red-600 font-medium";
      default: return rpeTokens.colors.text.secondary;
    }
  };

  return (
    <div className={`h-48 ${rpeTokens.colors.background.panel} border-t ${rpeTokens.colors.borders.divider} flex flex-col shrink-0`}>
      <div className={`flex items-center justify-between px-4 py-2 border-b ${rpeTokens.colors.borders.divider}`}>
        <h2 className={`${rpeTokens.typography.heading}`}>Simulation Timeline & Events</h2>
        <div className={`${rpeTokens.typography.data} ${rpeTokens.colors.text.muted}`}>{elapsedTime} / 00:31</div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto flex gap-6">
        <div className="w-1/2">
          <h3 className={`${rpeTokens.typography.heading} mb-2`}>Event Log</h3>
          <ul className={`space-y-1 ${rpeTokens.typography.data}`}>
            <li className={activeEventIndex >= -1 ? rpeTokens.colors.text.secondary : rpeTokens.colors.text.muted}>
              <span className={`${rpeTokens.colors.text.muted} mr-2`}>00:00</span> Wind loading begins
            </li>
            {events.map((event, i) => (
              <li key={event.id} className={`transition-all ${getEventClass(i, event.severity)}`}>
                <span className={`${rpeTokens.colors.text.muted} mr-2`}>{event.time}</span>
                {event.name}: {event.description}
              </li>
            ))}
          </ul>
        </div>
        
        <div className={`w-1/2 border-l ${rpeTokens.colors.borders.divider} pl-6 flex flex-col`}>
          <h3 className={`${rpeTokens.typography.heading} mb-2`}>Export & Upgrade</h3>
          <div className={`flex-1 flex items-center justify-center border-2 border-dashed ${rpeTokens.colors.borders.default} rounded-lg ${rpeTokens.colors.text.muted} text-sm`}>
            Simulation results placeholder
          </div>
          <div className="flex gap-2 mt-3">
            <button className={`flex-1 ${rpeTokens.colors.background.surface} hover:bg-slate-700 ${rpeTokens.colors.text.secondary} py-1.5 ${rpeTokens.layout.borderRadius} text-xs transition-colors`}>
              Export Report
            </button>
            <button className={`flex-1 ${rpeTokens.colors.background.surface} hover:bg-slate-700 ${rpeTokens.colors.text.secondary} py-1.5 ${rpeTokens.layout.borderRadius} text-xs transition-colors`}>
              Cost Table
            </button>
            <button className={`flex-1 ${rpeTokens.colors.background.surface} hover:bg-slate-700 ${rpeTokens.colors.text.secondary} py-1.5 ${rpeTokens.layout.borderRadius} text-xs transition-colors`}>
              Video Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
