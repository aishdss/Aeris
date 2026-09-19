import React, { useState } from 'react';
import { 
  Compass, 
  Layers, 
  Crosshair, 
  Maximize2, 
  Navigation, 
  Eye, 
  Radio, 
  AlertOctagon, 
  Volume2, 
  CheckCircle,
  Skull,
  Flame,
  Droplets,
  Shield,
  LifeBuoy
} from 'lucide-react';
import { Drone, Victim, CalamityScenario } from '../types';

interface TacticalMapProps {
  drones: Drone[];
  victims: Victim[];
  selectedDroneId: string | null;
  selectedVictimId: string | null;
  onSelectDrone: (id: string) => void;
  onSelectVictim: (id: string) => void;
  onOpenBroadcast: (victimId?: string, droneId?: string) => void;
  scenario: CalamityScenario;
  calamitySeverity: number;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  drones,
  victims,
  selectedDroneId,
  selectedVictimId,
  onSelectDrone,
  onSelectVictim,
  onOpenBroadcast,
  scenario,
  calamitySeverity,
}) => {
  const [mapLayer, setMapLayer] = useState<'tactical' | 'thermal' | 'routes'>('tactical');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const getPriorityColor = (priority: number, movementStatus: string, type: string) => {
    if (movementStatus === 'unresponsive_motionless') return 'border-purple-500 bg-purple-950/80 text-purple-300';
    if (type === 'animal') return 'border-amber-400 bg-amber-950/80 text-amber-300';
    switch (priority) {
      case 1: return 'border-rose-500 bg-rose-950/80 text-rose-300 shadow-rose-500/50';
      case 2: return 'border-orange-500 bg-orange-950/80 text-orange-300 shadow-orange-500/40';
      case 3: return 'border-amber-500 bg-amber-950/80 text-amber-300';
      default: return 'border-emerald-500 bg-emerald-950/80 text-emerald-300';
    }
  };

  return (
    <div className="relative w-full h-[520px] lg:h-[620px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
      {/* Top Map HUD Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/70 text-xs font-mono">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="text-slate-300 font-semibold">GRID SECTOR 37°46'N / 122°25'W</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400">AGL SWEEP: 15–60M</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400">4 DRONES TRACKING</span>
        </div>

        {/* Layer Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/70">
          <button
            id="map-layer-tactical"
            type="button"
            onClick={() => setMapLayer('tactical')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
              mapLayer === 'tactical'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tactical Recon
          </button>
          <button
            id="map-layer-thermal"
            type="button"
            onClick={() => setMapLayer('thermal')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
              mapLayer === 'thermal'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            FLIR Thermal IR
          </button>
          <button
            id="map-layer-routes"
            type="button"
            onClick={() => setMapLayer('routes')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
              mapLayer === 'routes'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Evac & Route Access
          </button>
        </div>
      </div>

      {/* Main Tactical Map Viewport */}
      <div className="relative flex-1 w-full h-full overflow-hidden select-none">
        {/* Background Grid & Coordinate lines */}
        <div 
          className={`absolute inset-0 transition-opacity duration-500 ${
            mapLayer === 'thermal'
              ? 'bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950'
              : 'bg-[#0a0f18]'
          }`}
          style={{
            backgroundImage: mapLayer === 'thermal'
              ? 'radial-gradient(ellipse at 30% 40%, rgba(244, 63, 94, 0.18), transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(59, 130, 246, 0.15), transparent 50%)'
              : 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 80%)'
          }}
        >
          {/* Subtle tactical grid lines */}
          <svg className="w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
              </pattern>
              <pattern id="grid-sub" width="160" height="160" patternUnits="userSpaceOnUse">
                <path d="M 160 0 L 0 0 0 160" fill="none" stroke="#334155" strokeWidth="1.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect width="100%" height="100%" fill="url(#grid-sub)" />
          </svg>
        </div>

        {/* Hazard Zone Overlays (Scales with Calamity Severity) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* River / Flood Water Inundation Zone */}
          <div 
            className="absolute top-[18%] left-[10%] rounded-full filter blur-xl transition-all duration-1000"
            style={{
              width: `${calamitySeverity * 4.2}px`,
              height: `${calamitySeverity * 3.6}px`,
              backgroundColor: scenario.type === 'flood' ? 'rgba(14, 165, 233, 0.25)' : 'rgba(239, 68, 68, 0.22)',
            }}
          />
          {/* Flash Flood Surge Wavefront or Fire Front */}
          <svg className="absolute inset-0 w-full h-full">
            {/* Surge Contour / Fire line */}
            <path
              d={`M 0,220 Q 200,${180 + calamitySeverity * 0.4} 450,260 T 900,${210 + calamitySeverity * 0.6}`}
              fill="none"
              stroke={scenario.type === 'flood' ? '#0284c7' : '#ef4444'}
              strokeWidth="3"
              strokeDasharray="6 4"
              className="animate-pulse"
              opacity="0.6"
            />
            {/* Secondary perimeter */}
            <path
              d={`M 150,420 Q 400,${380 + calamitySeverity * 0.3} 750,460 T 1200,${430}`}
              fill="none"
              stroke={scenario.type === 'flood' ? '#38bdf8' : '#f97316'}
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.4"
            />

            {/* Access Route Layers (shown in 'routes' or 'tactical' mode) */}
            {(mapLayer === 'routes' || mapLayer === 'tactical') && (
              <>
                {/* Safe Corridor Alpha (Green Glowing Line) */}
                <path
                  d="M 50,80 L 350,110 L 720,90 L 950,140"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeDasharray="10 5"
                  className="opacity-70"
                />
                {/* Impassable / Submerged Route Echo-4 (Red X Path) */}
                <path
                  d="M 220,380 L 410,340 L 590,390"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray="5 5"
                  className="opacity-80"
                />
                {/* Compromised Bridge 02 (Amber Path) */}
                <path
                  d="M 680,240 L 820,310"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  className="opacity-70"
                />
              </>
            )}
          </svg>

          {/* Route Labels */}
          {mapLayer === 'routes' && (
            <>
              <div className="absolute top-[16%] left-[40%] bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                ROUTE ZULU-9 (CLEAR EVAC CORRIDOR)
              </div>
              <div className="absolute top-[60%] left-[26%] bg-rose-950/90 text-rose-300 border border-rose-500/50 px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1">
                <AlertOctagon className="w-3 h-3" />
                ROUTE ECHO-4 (IMPASSABLE / 2.4M SUBMERGED)
              </div>
            </>
          )}

          {/* Thermal Layer Heatmap Gradients */}
          {mapLayer === 'thermal' && (
            <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen">
              <div className="absolute top-[32%] left-[28%] w-32 h-32 rounded-full bg-rose-500 blur-2xl animate-pulse" />
              <div className="absolute top-[45%] left-[60%] w-24 h-24 rounded-full bg-amber-500 blur-xl" />
              <div className="absolute top-[68%] left-[42%] w-36 h-36 rounded-full bg-orange-500 blur-2xl" />
            </div>
          )}
        </div>

        {/* Victims & Animals Plot Markers */}
        {victims.map((victim) => {
          const isSelected = selectedVictimId === victim.id;
          const isPerishedCheck = victim.movementStatus === 'unresponsive_motionless';
          const isAnimal = victim.type === 'animal';

          return (
            <div
              key={victim.id}
              id={`map-victim-${victim.id}`}
              onClick={() => onSelectVictim(victim.id)}
              className="absolute z-10 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group transition-all"
              style={{ left: `${victim.coordinates.x}%`, top: `${victim.coordinates.y}%` }}
            >
              {/* Radar pulse rings for Priority 1 */}
              {victim.priority === 1 && (
                <span className="absolute -inset-3 rounded-full bg-rose-500/30 animate-ping" />
              )}

              {/* Marker Icon */}
              <div
                className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-lg transition-transform ${
                  isSelected ? 'scale-125 ring-2 ring-cyan-400' : 'group-hover:scale-110'
                } ${getPriorityColor(victim.priority, victim.movementStatus, victim.type)}`}
              >
                {isPerishedCheck ? (
                  <Skull className="w-4 h-4 text-purple-300" />
                ) : isAnimal ? (
                  <span className="text-xs font-bold font-mono">🐾</span>
                ) : (
                  <span className="text-xs font-black font-mono">P{victim.priority}</span>
                )}

                {/* Speaker indicator badge if audio is active */}
                {victim.audioFirstAidActive && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-500 border border-slate-900 flex items-center justify-center animate-bounce">
                    <Volume2 className="w-2 h-2 text-slate-950" />
                  </span>
                )}
              </div>

              {/* Hover / Active Tooltip */}
              <div className={`absolute left-1/2 -translate-x-1/2 top-9 w-44 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg p-2 text-left shadow-xl pointer-events-none transition-all z-20 ${
                isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
              }`}>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={`font-bold px-1 rounded ${
                    victim.priority === 1 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    PRIORITY {victim.priority}
                  </span>
                  <span className="text-slate-400">{victim.confidenceScore}% CONF</span>
                </div>
                <p className="text-xs font-semibold text-slate-200 mt-1 line-clamp-1">
                  {victim.name}
                </p>
                {isPerishedCheck && (
                  <p className="text-[10px] text-purple-300 font-mono mt-0.5 flex items-center gap-1">
                    <Skull className="w-2.5 h-2.5" /> MOTIONLESS / POSSIBLE PERISHED
                  </p>
                )}
                <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-1">
                  <span>TEMP: {victim.thermalTemp}°C</span>
                  <span className="text-rose-400 font-bold">{victim.timeToCriticalMinutes}m TO CRITICAL</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* 4 Drones on Map with Scanning Cones */}
        {drones.map((drone) => {
          const isSelected = selectedDroneId === drone.id;

          return (
            <div
              key={drone.id}
              id={`map-drone-${drone.id}`}
              onClick={() => onSelectDrone(drone.id)}
              className="absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group transition-all"
              style={{ left: `${drone.coordinates.x}%`, top: `${drone.coordinates.y}%` }}
            >
              {/* Radar Scanning Cone SVG Projection */}
              <div 
                className="absolute -top-16 -left-16 w-32 h-32 pointer-events-none opacity-40 transition-transform duration-700"
                style={{ transform: `rotate(${drone.heading}deg)` }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <radialGradient id={`sweep-${drone.id}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                      <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <path
                    d="M 50 50 L 25 5 A 50 50 0 0 1 75 5 Z"
                    fill={`url(#sweep-${drone.id})`}
                    className="animate-pulse"
                  />
                </svg>
              </div>

              {/* Drone Body Marker */}
              <div
                className={`relative flex items-center justify-center w-9 h-9 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950 text-cyan-200 shadow-lg shadow-cyan-500/50 scale-125'
                    : 'border-slate-600 bg-slate-900/90 text-slate-300 group-hover:border-cyan-500 group-hover:scale-110'
                }`}
              >
                <Navigation 
                  className="w-5 h-5 text-cyan-400 transition-transform duration-500" 
                  style={{ transform: `rotate(${drone.heading - 45}deg)` }} 
                />
                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-950 animate-pulse" />
              </div>

              {/* Drone Label Tag */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono text-slate-200 shadow-md flex items-center gap-1.5">
                <span className="font-bold text-cyan-400">{drone.name}</span>
                <span className="text-slate-500">|</span>
                <span>{drone.battery}%</span>
                <span className="text-slate-500">|</span>
                <span>{drone.altitude}m</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Map Status & Legend Footer */}
      <div className="bg-slate-900/95 border-t border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            HEADING: 145° SE
          </span>
          <span className="text-slate-600">•</span>
          <span>WIND: {scenario.windSpeed} KM/H</span>
          <span className="text-slate-600">•</span>
          <span>SURGE RATE: {scenario.waterOrFlameRiseRate}</span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>P1 Critical (Life Threat)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Motionless / Perished Review</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Animal in Danger</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-emerald-400" />
            <span>Safe Route</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-rose-500" />
            <span>Compromised</span>
          </div>
        </div>
      </div>
    </div>
  );
};
