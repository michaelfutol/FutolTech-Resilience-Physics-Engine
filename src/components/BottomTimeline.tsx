import { FailureEvent } from "@/types/rpe";

interface BottomTimelineProps {
  events: FailureEvent[];
  activeEventIndex: number;
  elapsedTime: string;
}

export default function BottomTimeline({ events, activeEventIndex, elapsedTime }: BottomTimelineProps) {
  
  const getEventClass = (index: number, severity: string) => {
    // If it's in the future
    if (activeEventIndex < index) return "text-slate-500 opacity-50";
    
    // If it's exactly the active one, highlight it
    if (activeEventIndex === index) {
      switch (severity) {
        case "low": return "text-amber-400 bg-amber-400/10 -mx-2 px-2 py-0.5 rounded";
        case "medium": return "text-orange-400 bg-orange-400/10 -mx-2 px-2 py-0.5 rounded";
        case "high": return "text-red-400 bg-red-400/10 -mx-2 px-2 py-0.5 rounded";
        case "critical": return "text-red-500 font-bold bg-red-500/10 -mx-2 px-2 py-0.5 rounded";
        default: return "text-slate-200 bg-slate-800 -mx-2 px-2 py-0.5 rounded";
      }
    }
    
    // If it's in the past (completed)
    switch (severity) {
      case "low": return "text-amber-500";
      case "medium": return "text-orange-500";
      case "high": return "text-red-500";
      case "critical": return "text-red-600 font-medium";
      default: return "text-slate-400";
    }
  };

  return (
    <div className="h-48 bg-slate-900 border-t border-slate-700 flex flex-col shrink-0">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
        <h2 className="text-sm font-medium text-slate-200">Simulation Timeline & Events</h2>
        <div className="text-xs text-slate-400 font-mono">{elapsedTime} / 00:31</div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto flex gap-6">
        <div className="w-1/2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Event Log</h3>
          <ul className="space-y-1 font-mono text-xs">
            <li className={activeEventIndex >= -1 ? "text-slate-400" : "text-slate-600"}>
              <span className="text-slate-500 mr-2">00:00</span> Wind loading begins
            </li>
            {events.map((event, i) => (
              <li key={event.id} className={`transition-all ${getEventClass(i, event.severity)}`}>
                <span className="text-slate-500 mr-2">{event.time}</span>
                {event.name}: {event.description}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="w-1/2 border-l border-slate-800 pl-6 flex flex-col">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Export & Upgrade</h3>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg text-slate-500 text-sm">
            Simulation results placeholder
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded text-xs transition-colors">
              Export Report
            </button>
            <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded text-xs transition-colors">
              Cost Table
            </button>
            <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded text-xs transition-colors">
              Video Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
