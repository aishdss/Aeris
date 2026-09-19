import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert, 
  Clock, 
  Navigation, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Compass, 
  Activity,
  Layers,
  MapPin,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { EscalationReport, CalamityScenario, Victim, Drone } from '../types';

interface EscalationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: EscalationReport;
  scenario: CalamityScenario;
  calamitySeverity: number;
  victims: Victim[];
  drones: Drone[];
  onApplyReRanking: () => void;
  onRefreshAiReport: (report: EscalationReport) => void;
}

export const EscalationReportModal: React.FC<EscalationReportModalProps> = ({
  isOpen,
  onClose,
  report,
  scenario,
  calamitySeverity,
  victims,
  drones,
  onApplyReRanking,
  onRefreshAiReport,
}) => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [reRankingApplied, setReRankingApplied] = useState<boolean>(false);
  const [trendHistory] = useState<Array<{ time: string; severity: number; label: string }>>([
    { time: '00:10', severity: 64, label: 'Base Deluge' },
    { time: '00:20', severity: 72, label: 'Dam Spillway Warning' },
    { time: '00:25', severity: 84, label: 'Barrier Breach Flagged' },
    { time: 'Current', severity: calamitySeverity, label: 'Active Critical Spread' },
  ]);

  if (!isOpen) return null;

  const handleRefreshGeminiAnalysis = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/analyze-escalation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          victims,
          hazardLevel: calamitySeverity,
          activeDrones: drones,
        }),
      });
      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }
      const data = await res.json();
      if (data.report) {
        onRefreshAiReport(data.report);
      }
    } catch (err) {
      console.error('Failed to refresh AI escalation analysis:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleApplyAction = () => {
    onApplyReRanking();
    setReRankingApplied(true);
    setTimeout(() => setReRankingApplied(false), 3000);
  };

  const isWorsening = report.trendStatus === 'worsening';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              isWorsening ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                  Live Calamity Escalation Intelligence Report
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isWorsening ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {isWorsening ? 'WORSENING TREND' : 'STABILIZING TREND'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Multi-Sensor Fusion: Radiometric FLIR, Acoustic Hydrophones, and Aerial CV
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="refresh-ai-escalation-btn"
              type="button"
              onClick={handleRefreshGeminiAnalysis}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Analyzing with Gemini...' : 'Re-Analyze AI Report'}</span>
            </button>

            <button
              id="close-escalation-modal"
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content: 7 Mandatory Elements */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Section 1: Situation Snapshot */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-bold uppercase tracking-wider mb-2">
              <MapPin className="w-3.5 h-3.5" /> 1. SITUATION SNAPSHOT
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Hazard Type</span>
                <span className="text-sm font-bold text-slate-100">{report.hazardType}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Current Severity Level</span>
                <span className="text-sm font-bold text-rose-400">{report.currentSeverityLevel}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Affected Zone on Map</span>
                <span className="text-sm font-bold text-cyan-300">{report.affectedZone}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Escalation Trend & Trajectory */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" /> 2. ESCALATION TREND & PREDICTED TRAJECTORY
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                CONFIDENCE: <strong className="text-emerald-400">{report.confidenceLevel}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Rate of Change</span>
                <span className="text-sm font-bold text-rose-300 flex items-center gap-1 mt-0.5">
                  <ArrowUpRight className="w-4 h-4 text-rose-400" /> {report.trendRate}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Predicted Trajectory (Next 5 Min)</span>
                <p className="text-xs text-slate-200 mt-0.5 font-medium">{report.predictedTrajectory5m}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Predicted Trajectory (Next 30 Min)</span>
                <p className="text-xs text-slate-200 mt-0.5 font-medium">{report.predictedTrajectory30m}</p>
              </div>
            </div>
          </div>

          {/* Section 3: Victim Impact */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2 text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-2">
              <Activity className="w-3.5 h-3.5" /> 3. VICTIM IMPACT (NEWLY ENDANGERED & SAFE TIME REDUCTION)
            </div>
            <div className="space-y-2">
              {report.newlyEndangeredVictims.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/50 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-rose-200 leading-relaxed font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Access / Route Impact */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-2">
              <Navigation className="w-3.5 h-3.5" /> 4. ACCESS & ROUTE IMPACT
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Compromised Routes */}
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1.5">
                  ⛔ Compromised / Impassable Routes
                </span>
                <ul className="space-y-1 text-slate-300">
                  {report.compromisedRoutes.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Safe Alternates */}
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1.5">
                  ✅ Designated Safe Alternate Routes
                </span>
                <ul className="space-y-1 text-slate-300">
                  {report.safeAlternateRoutes.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 5: Recommended Action */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-cyan-300 text-[10px] font-bold uppercase tracking-wider">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> 5. RECOMMENDED ACTION & TRIAGE ADJUSTMENT
              </div>
              <button
                id="apply-re-ranking-btn"
                type="button"
                onClick={handleApplyAction}
                className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition cursor-pointer"
              >
                <span>{reRankingApplied ? 'Triage Re-Ranked!' : 'Apply Suggested Re-Ranking'}</span>
              </button>
            </div>
            <p className="text-xs text-cyan-100 font-medium leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-cyan-500/20">
              {report.recommendedAction}
            </p>
          </div>

          {/* Section 6: Trigger & Reasoning Summary (Builds Operator Trust) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> 6. TRIGGER & REASONING SUMMARY (OPERATOR TRUST AUDIT)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              {report.triggerReasoning}
            </p>
          </div>

          {/* Section 7: Timestamp, Update Cadence & Trend History */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-indigo-400" /> 7. TIMESTAMP & UPDATE CADENCE (TREND HISTORY)
              </div>
              <span className="text-[10px] text-slate-400">
                LAST UPDATED: <strong className="text-slate-200">{report.timestamp}</strong> • CADENCE: 60 SEC
              </span>
            </div>

            {/* Visual Trend Bars (Worsening vs Stabilizing) */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {trendHistory.map((item, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">{item.time}</span>
                    <span className="font-bold text-rose-400">{item.severity}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 my-1.5 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${item.severity}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            AERIS AUTOMATED CALAMITY AUDIT • COMPLIANT WITH FEMA ICS-209
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
