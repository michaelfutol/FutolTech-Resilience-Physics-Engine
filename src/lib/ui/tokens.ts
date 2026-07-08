/**
 * RPE Design Tokens
 * 
 * Defines the core visual language for the FutolTech Resilience Physics Engine.
 * Aesthetic: Engineering Cockpit / Disaster Test Lab
 * - Dark, technical, readable
 * - Muted forces, vibrant warnings
 */

export const rpeTokens = {
  colors: {
    background: {
      main: "bg-slate-950",
      panel: "bg-slate-900",
      surface: "bg-slate-800",
      input: "bg-slate-950",
    },
    text: {
      primary: "text-slate-100",
      secondary: "text-slate-300",
      muted: "text-slate-500",
      accent: "text-slate-200",
    },
    forces: {
      wind: "text-blue-400 border-blue-400/50",
      rain: "text-cyan-400 border-cyan-400/50",
      debris: "text-indigo-400 border-indigo-400/50",
    },
    status: {
      failure: "text-red-500 border-red-500 bg-red-500/10",
      warning: "text-orange-500 border-orange-500/50 bg-orange-500/10",
      caution: "text-amber-500 border-amber-500/50 bg-amber-500/10",
      success: "text-emerald-500 border-emerald-500/50 bg-emerald-500/10",
      info: "text-blue-400 border-blue-400/50 bg-blue-400/10",
    },
    borders: {
      default: "border-slate-800",
      focus: "border-emerald-500/50",
      divider: "border-slate-700",
    }
  },
  layout: {
    panelPadding: "p-4",
    itemPadding: "p-2",
    borderRadius: "rounded-sm", // Keep it tight and technical, not pill-shaped
    shadow: "shadow-lg shadow-black/40",
  },
  typography: {
    heading: "font-semibold tracking-wide uppercase text-xs text-slate-400",
    data: "font-mono text-xs",
    body: "text-sm",
    label: "text-xs text-slate-400",
  }
};
