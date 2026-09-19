import React from 'react';
import { 
  Radio, 
  ShieldAlert, 
  Flame, 
  Activity, 
  FileText, 
  Users, 
  Volume2, 
  TrendingUp,
  RefreshCw,
  Sliders,
  AlertTriangle,
  X,
  ShieldCheck,
  Download
} from 'lucide-react';
import { CalamityScenario, EscalationReport } from '../types';

interface HeaderProps {
  scenarios: CalamityScenario[];
  activeScenario: CalamityScenario;
  onSelectScenario: (scenario: CalamityScenario) => void;
  calamitySeverity: number;
  onSeverityChange: (val: number) => void;
  dynamicEscalationEnabled: boolean;
  onToggleDynamicEscalation: () => void;
  onOpenEscalationReport: () => void;
  onOpenMissingDatabase: () => void;
  onOpenBroadcastModal: () => void;
  escalationReport: EscalationReport;
  activeDronesCount: number;
  totalDronesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  scenarios,
  activeScenario,
  onSelectScenario,
  calamitySeverity,
  onSeverityChange,
  dynamicEscalationEnabled,
  onToggleDynamicEscalation,
  onOpenEscalationReport,
  onOpenMissingDatabase,
  onOpenBroadcastModal,
  escalationReport,
  activeDronesCount,
  totalDronesCount,
}) => {
  const [showLogoModal, setShowLogoModal] = React.useState<boolean>(false);
  const logoSrc = React.useMemo(() => {
    return localStorage.getItem('aeris_custom_logo') || '/aeris-logo.jpg';
  }, []);

  const getSeverityBadgeColor = (severity: number) => {
    if (severity >= 80) return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    if (severity >= 60) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  };

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Official Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowLogoModal(true)}
            className="relative group cursor-pointer flex items-center p-1 rounded-xl bg-slate-950/70 border border-cyan-500/40 hover:border-cyan-400 shadow-md shadow-cyan-950/50 transition-all text-left"
            title="Click to view AERIS Mission Emblem"
          >
            <img
              src={logoSrc}
              alt="AERIS - Eyes Where Help Can't Reach"
              className="h-11 sm:h-12 w-auto max-w-[160px] sm:max-w-[200px] object-contain rounded-lg transition-transform group-hover:scale-[1.02]"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </button>

          <div className="hidden sm:flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-mono">
                EYES WHERE HELP CANT REACH
              </span>
              <span className="text-emerald-400 text-[11px] font-mono flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-wide mt-0.5">
              <span>FLEET: {activeDronesCount}/{totalDronesCount} DEPLOYED</span>
              <span className="mx-1 text-slate-600">•</span>
              <span>RF TELEMETRY 5.8 GHz</span>
            </p>
          </div>
        </div>

        {/* Calamity Selector & Severity Level */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 px-2">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider leading-none">
                Active Calamity
              </span>
              <select
                id="calamity-scenario-select"
                value={activeScenario.id}
                onChange={(e) => {
                  const s = scenarios.find((item) => item.id === e.target.value);
                  if (s) onSelectScenario(s);
                }}
                className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer py-0.5"
              >
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Severity Meter & Dynamic Escalation Toggle */}
          <div className="flex items-center gap-2 px-2">
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 font-mono">
                <span>HAZARD SEVERITY</span>
                <span className={`font-bold px-1.5 rounded ${getSeverityBadgeColor(calamitySeverity)}`}>
                  {calamitySeverity}%
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <input
                  id="hazard-severity-slider"
                  type="range"
                  min="30"
                  max="98"
                  value={calamitySeverity}
                  onChange={(e) => onSeverityChange(Number(e.target.value))}
                  className="w-24 sm:w-28 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  title="Adjust calamity escalation level"
                />
              </div>
            </div>
          </div>

          <button
            id="dynamic-escalation-toggle"
            type="button"
            onClick={onToggleDynamicEscalation}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
              dynamicEscalationEnabled
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
            }`}
            title="Auto-escalate disaster condition over time and recalculate victim priorities dynamically"
          >
            <TrendingUp className={`w-3.5 h-3.5 ${dynamicEscalationEnabled ? 'text-rose-400 animate-pulse' : ''}`} />
            <span>{dynamicEscalationEnabled ? 'AUTO-ESCALATING' : 'DYNAMIC ESCALATION: OFF'}</span>
          </button>
        </div>

        {/* Tactical Actions: Live Report, Missing DB, Audio Broadcast */}
        <div className="flex items-center gap-2">
          {/* Audio Broadcast Quick Button */}
          <button
            id="open-audio-broadcast-btn"
            type="button"
            onClick={onOpenBroadcastModal}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm hover:shadow-cyan-500/10 cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Loudspeaker</span>
            <span>Broadcast</span>
          </button>

          {/* Missing Persons DB */}
          <button
            id="open-missing-db-btn"
            type="button"
            onClick={onOpenMissingDatabase}
            className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Missing</span>
            <span>Registry</span>
          </button>

          {/* Live Escalation Report Trigger */}
          <button
            id="open-escalation-report-btn"
            type="button"
            onClick={onOpenEscalationReport}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition relative cursor-pointer ${
              escalationReport.trendStatus === 'worsening'
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-600/30 animate-pulse'
                : 'bg-indigo-600/80 hover:bg-indigo-500 text-white border-indigo-400/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Escalation Report</span>
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          </button>
        </div>
      </div>

      {/* Expanded Logo Insignia Modal */}
      {showLogoModal && (
        <div 
          id="aeris-logo-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          onClick={() => setShowLogoModal(false)}
        >
          <div 
            className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden p-5 flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              id="close-logo-modal-btn"
              type="button"
              onClick={() => setShowLogoModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full max-w-md rounded-xl overflow-hidden border border-cyan-500/30 shadow-xl shadow-cyan-950/70 bg-slate-950 p-2 my-2">
              <img
                src={logoSrc}
                alt="AERIS Mission Emblem"
                className="w-full h-auto object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="mt-3 flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>AERIS Autonomous Disaster Response Network</span>
            </div>

            <p className="mt-1 text-xs text-slate-400 font-sans max-w-sm">
              AI-driven multi-drone search & rescue platform operating across flood surges, earthquake collapses, and landslide terrain.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800 w-full flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <a
                href="/api/download-zip"
                download="aeris-project.zip"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                title="Download entire AERIS codebase and assets as a ZIP archive"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Complete Code (.ZIP)</span>
              </a>

              <button
                type="button"
                onClick={() => setShowLogoModal(false)}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition shadow-md shadow-cyan-600/30 cursor-pointer"
              >
                Return to Mission Control
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
