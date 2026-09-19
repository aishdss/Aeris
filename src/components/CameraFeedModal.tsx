import React, { useState, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Thermometer, 
  Crosshair, 
  Maximize2, 
  Volume2, 
  Sun, 
  Navigation, 
  ShieldAlert, 
  Activity, 
  Radio,
  Eye,
  Sliders
} from 'lucide-react';
import { Drone, Victim } from '../types';

interface CameraFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  drone: Drone | null;
  targetVictim: Victim | null;
  onOpenAudio: (droneId: string) => void;
}

export const CameraFeedModal: React.FC<CameraFeedModalProps> = ({
  isOpen,
  onClose,
  drone,
  targetVictim,
  onOpenAudio,
}) => {
  const [feedMode, setFeedMode] = useState<'optical' | 'thermal'>('optical');
  const [scanlineTime, setScanlineTime] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanlineTime((prev) => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen || !drone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* HUD Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>LIVE GIMBAL STREAM: {drone.name} "{drone.callsign}"</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">LAT: {drone.coordinates.lat.toFixed(4)}° / LNG: {drone.coordinates.lng.toFixed(4)}°</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400">BATT {drone.battery}%</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Feed Mode Switcher */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setFeedMode('optical')}
                className={`px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer ${
                  feedMode === 'optical'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                4K Optical (EO)
              </button>
              <button
                type="button"
                onClick={() => setFeedMode('thermal')}
                className={`px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer ${
                  feedMode === 'thermal'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                FLIR Thermal (IR)
              </button>
            </div>

            <button
              id="close-feed-modal"
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Canvas Simulation */}
        <div className="relative w-full h-[460px] sm:h-[520px] bg-slate-950 overflow-hidden flex items-center justify-center select-none font-mono">
          {/* Simulated Optical vs Thermal Environment Canvas */}
          <div 
            className={`absolute inset-0 transition-all duration-700 ${
              feedMode === 'thermal'
                ? 'bg-gradient-to-br from-[#0c0827] via-[#2a0845] to-[#450a0a]'
                : 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950'
            }`}
          >
            {/* Disaster Scene Visual Representation */}
            <div className="absolute inset-0 opacity-40 mix-blend-overlay flex items-center justify-center">
              <div className="w-full h-full border border-dashed border-cyan-500/20" />
            </div>

            {/* Thermal Palette Heat Blobs (if Thermal mode) */}
            {feedMode === 'thermal' && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Person 1 Thermal Signature (Hot yellow/white core) */}
                <div className="absolute top-[42%] left-[46%] w-28 h-28 rounded-full bg-gradient-to-r from-yellow-300 via-amber-500 to-rose-600 blur-md opacity-85 animate-pulse" />
                {/* Cold water ambient gradient (deep blue/purple) */}
                <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-blue-950 to-purple-950/20 opacity-90" />
              </div>
            )}
          </div>

          {/* HUD Overlay Graphics: Artificial Horizon, Pitch Ladder, Crosshairs */}
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between text-xs text-cyan-400/90">
            {/* Top HUD tape: Heading & Coordinates */}
            <div className="flex items-center justify-between">
              <div className="bg-slate-900/80 px-2.5 py-1 rounded border border-cyan-500/30">
                <span>HDG: {drone.heading}° [{drone.heading > 180 ? 'W' : 'E'}]</span>
                <span className="mx-2">•</span>
                <span>AGL: {drone.altitude}M</span>
              </div>
              <div className="bg-slate-900/80 px-2.5 py-1 rounded border border-cyan-500/30 flex items-center gap-2">
                <span className="text-emerald-400">FLIR RADIOMETRIC: LOCKED</span>
                <span>REC 00:34:12</span>
              </div>
            </div>

            {/* Center Reticle & Artificial Horizon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 flex items-center justify-center">
              {/* Reticle Circle */}
              <div className="w-48 h-48 rounded-full border border-cyan-400/40 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border border-dashed border-cyan-400/60" />
                <Crosshair className="w-6 h-6 text-cyan-400" />
              </div>

              {/* Pitch Ladder Bars */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-32 border-t-2 border-cyan-400/40 text-[9px] text-center">
                +10°
              </div>
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-32 border-b-2 border-cyan-400/40 text-[9px] text-center">
                -10°
              </div>
            </div>

            {/* AI Bounding Box Tracker on Victim */}
            {targetVictim && (
              <div className="absolute top-[38%] left-[42%] w-48 h-36 border-2 border-cyan-400 rounded-lg p-1.5 shadow-lg shadow-cyan-500/20 animate-pulse pointer-events-none">
                <div className="flex items-center justify-between text-[10px] bg-slate-900/90 px-1.5 py-0.5 rounded text-cyan-300 font-bold">
                  <span>TARGET: {targetVictim.name.slice(0, 18)}</span>
                  <span>{targetVictim.confidenceScore}% CONF</span>
                </div>
                <div className="mt-1 text-[9px] bg-slate-950/80 p-1 rounded text-slate-300 space-y-0.5">
                  <div className="text-amber-400 font-semibold">
                    PRIORITY {targetVictim.priority} • {targetVictim.movementStatus.toUpperCase()}
                  </div>
                  <div>SPOT TEMP: <span className="text-rose-400 font-bold">{targetVictim.thermalTemp}°C</span></div>
                  <div>SURGE HAZARD: 1.4m WATER INGRESS</div>
                </div>
                {/* Corner crosshair ticks */}
                <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-200" />
                <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-cyan-200" />
                <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-cyan-200" />
                <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-cyan-200" />
              </div>
            )}

            {/* Loudspeaker Status Banner */}
            {drone.speakerActive && (
              <div className="self-center bg-cyan-950/90 border border-cyan-400 text-cyan-200 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-pulse text-xs font-bold">
                <Volume2 className="w-4 h-4 text-cyan-300" />
                <span>DRONE PA LOUDSPEAKER ACTIVE • BROADCASTING FIRST-AID PROTOCOL</span>
              </div>
            )}

            {/* Bottom HUD bar: Speed, Signal, Battery */}
            <div className="flex items-center justify-between">
              <div className="bg-slate-900/80 px-2.5 py-1 rounded border border-cyan-500/30">
                <span>SPEED: {drone.speed} KM/H</span>
                <span className="mx-2">•</span>
                <span>WIND RESIST: 12 KT</span>
              </div>
              <div className="bg-slate-900/80 px-2.5 py-1 rounded border border-cyan-500/30">
                <span>FPS: {drone.sensors.fps}</span>
                <span className="mx-2">•</span>
                <span>FOV: 84° WIDE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Controls */}
        <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="hud-speak-btn"
              type="button"
              onClick={() => onOpenAudio(drone.id)}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Speak to Victim Through Drone</span>
            </button>

            <button
              type="button"
              onClick={() => setFeedMode(feedMode === 'optical' ? 'thermal' : 'optical')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
            >
              <Thermometer className="w-4 h-4 text-rose-400" />
              <span>Toggle {feedMode === 'optical' ? 'Thermal IR' : 'Optical EO'}</span>
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400">
            AERIS GIMBAL 3-AXIS STABILIZED • DIRECT RF LINK -58 dBm
          </div>
        </div>
      </div>
    </div>
  );
};
