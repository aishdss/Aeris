import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Volume2, 
  UserCheck, 
  Skull, 
  ShieldAlert, 
  HeartHandshake, 
  Clock, 
  Navigation, 
  Video, 
  CheckCircle,
  Flame,
  Droplets,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Victim } from '../types';

interface VictimTriagePanelProps {
  victims: Victim[];
  selectedVictimId: string | null;
  onSelectVictim: (id: string) => void;
  onOpenAudioBroadcast: (victim: Victim) => void;
  onOpenFaceMatchModal: (victim: Victim) => void;
  onOpenTelemedicineModal: (victim: Victim) => void;
  onDispatchRescueTeam: (victimId: string) => void;
  dynamicEscalationEnabled: boolean;
}

export const VictimTriagePanel: React.FC<VictimTriagePanelProps> = ({
  victims,
  selectedVictimId,
  onSelectVictim,
  onOpenAudioBroadcast,
  onOpenFaceMatchModal,
  onOpenTelemedicineModal,
  onDispatchRescueTeam,
  dynamicEscalationEnabled,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'human' | 'animal' | 'perished' | 'matched'>('all');

  // Sorted strictly by priority (P1 first, then P2, etc.)
  const sortedVictims = [...victims].sort((a, b) => a.priority - b.priority);

  const filteredVictims = sortedVictims.filter((v) => {
    if (filterType === 'human') return v.type === 'human';
    if (filterType === 'animal') return v.type === 'animal';
    if (filterType === 'perished') return v.movementStatus === 'unresponsive_motionless';
    if (filterType === 'matched') return Boolean(v.faceMatch);
    return true;
  });

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-black font-mono bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center gap-1 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            PRIORITY 1 (CRITICAL)
          </span>
        );
      case 2:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-black font-mono bg-orange-500/20 text-orange-300 border border-orange-500/50 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            PRIORITY 2 (HIGH)
          </span>
        );
      case 3:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-black font-mono bg-amber-500/20 text-amber-300 border border-amber-500/50">
            PRIORITY 3 (URGENT)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            PRIORITY {priority} (STABILIZED)
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-slate-900/80 rounded-2xl border border-slate-800 p-4 shadow-xl">
      {/* Panel Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide">
              Victim & Hazard Triage Ranking (P1 → P5)
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time Computer Vision & Radiometric Thermal Analysis • High-Priority First
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({victims.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('human')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
              filterType === 'human'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Humans ({victims.filter((v) => v.type === 'human').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('animal')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
              filterType === 'animal'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🐾 Animals ({victims.filter((v) => v.type === 'animal').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('perished')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
              filterType === 'perished'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            💀 Perished Review ({victims.filter((v) => v.movementStatus === 'unresponsive_motionless').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('matched')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
              filterType === 'matched'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Face Matched ({victims.filter((v) => Boolean(v.faceMatch)).length})
          </button>
        </div>
      </div>

      {/* Victim Cards List */}
      <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
        {filteredVictims.map((victim) => {
          const isSelected = selectedVictimId === victim.id;
          const isPerished = victim.movementStatus === 'unresponsive_motionless';
          const isAnimal = victim.type === 'animal';

          return (
            <div
              key={victim.id}
              id={`triage-card-${victim.id}`}
              onClick={() => onSelectVictim(victim.id)}
              className={`rounded-xl p-4 transition-all duration-200 border cursor-pointer ${
                isSelected
                  ? 'bg-slate-950 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                  : 'bg-slate-950/60 hover:bg-slate-950/90 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Header: Priority, Type, Name, Confidence */}
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  {getPriorityBadge(victim.priority)}

                  {dynamicEscalationEnabled && victim.dynamicPriorityShift && (
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-rose-400" />
                      ESCALATED: P{victim.priority + victim.dynamicPriorityShift} → P{victim.priority}
                    </span>
                  )}

                  {isAnimal && (
                    <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 text-[10px] font-mono flex items-center gap-1 font-bold">
                      🐾 ANIMAL IN DANGER ({victim.animalInfo?.species})
                    </span>
                  )}

                  {isPerished && (
                    <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 text-[10px] font-mono flex items-center gap-1 font-bold">
                      <Skull className="w-3 h-3 text-purple-400" />
                      CLASSIFIED: UNRESPONSIVE / POSSIBLY PERISHED
                    </span>
                  )}
                </div>

                {/* AI Confidence & Thermal Temp */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    CV CONF: <strong className="text-cyan-300">{victim.confidenceScore}%</strong>
                  </span>
                  <span className={`px-2 py-0.5 rounded border ${
                    victim.thermalTemp < 30 ? 'bg-purple-950 text-purple-300 border-purple-800' : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}>
                    TEMP: <strong>{victim.thermalTemp}°C</strong>
                  </span>
                </div>
              </div>

              {/* Victim Title & Sector */}
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-base font-bold text-slate-100 font-mono">
                  {victim.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono truncate">
                  LOCATION: {victim.sector}
                </span>
              </div>

              {/* Observable Condition & Surrounding Hazards Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 my-2.5 text-xs font-mono">
                {/* Observable Condition */}
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold mb-1">
                    Observable Physical Condition
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {victim.condition}
                  </p>
                </div>

                {/* Surrounding Hazards & Report */}
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold mb-1 flex items-center justify-between">
                    <span>Surrounding Hazards Assessment</span>
                    <span className="text-rose-400 font-bold">{victim.timeToCriticalMinutes}m Safe Window</span>
                  </span>
                  <p className="text-amber-200/90 leading-relaxed">
                    {victim.surroundingHazards}
                  </p>
                </div>
              </div>

              {/* Probabilistic Face Match Banner (if available) */}
              {victim.faceMatch && (
                <div className="mb-3 p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <img 
                      src={victim.faceMatch.photoUrl} 
                      alt="Registered Missing Person" 
                      className="w-10 h-10 rounded-lg object-cover border border-blue-400/40"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-blue-200">
                          PROBABILISTIC MATCH: {victim.faceMatch.candidateName} ({victim.faceMatch.confidence}% MATCH)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Medical: {victim.faceMatch.medicalConditions} • Kin: {victim.faceMatch.nextOfKin}
                      </p>
                    </div>
                  </div>

                  <button
                    id={`inspect-match-${victim.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenFaceMatchModal(victim);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    <span>Biometric Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Action Toolbar: Speak First-Aid Instructions, Connect Help, Telemedicine Video */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  {/* Real-time Audio Guidance */}
                  <button
                    id={`broadcast-victim-${victim.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAudioBroadcast(victim);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border cursor-pointer ${
                      victim.audioFirstAidActive
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                        : 'bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border-cyan-800/60'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{victim.audioFirstAidActive ? 'Audio Guidance Active' : 'Drone Voice Broadcast'}</span>
                  </button>

                  {/* Future Video Communication with Medical/Rescue Personnel */}
                  <button
                    id={`telemed-victim-${victim.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTelemedicineModal(victim);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                    title="Live video communication with medical doctor or tactical rescue commander"
                  >
                    <Video className="w-3.5 h-3.5 text-purple-400" />
                    <span className="hidden sm:inline">Medical Video Link</span>
                    <span className="sm:hidden">Video</span>
                  </button>
                </div>

                {/* Nearest Available Help Connection */}
                <div className="flex items-center gap-2">
                  <div className="text-[11px] font-mono text-slate-400 text-right hidden md:block">
                    <span>Nearest Unit: </span>
                    <strong className="text-slate-200">{victim.nearestHelpDistanceMeters}m</strong>
                  </div>

                  <button
                    id={`dispatch-victim-${victim.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDispatchRescueTeam(victim.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border cursor-pointer ${
                      victim.responderDispatched
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                        : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-600/20'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{victim.responderDispatched ? `Dispatched (${victim.dispatchUnitName || 'Team En Route'})` : 'Connect Nearest Help'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredVictims.length === 0 && (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            No victims or entities match current filter.
          </div>
        )}
      </div>
    </div>
  );
};
