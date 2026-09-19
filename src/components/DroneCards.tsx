import React from 'react';
import { 
  Battery, 
  BatteryCharging, 
  Wifi, 
  Gauge, 
  Compass, 
  Thermometer, 
  Camera, 
  Volume2, 
  Eye, 
  AlertTriangle, 
  ShieldCheck, 
  Sun,
  Navigation,
  Send,
  Zap
} from 'lucide-react';
import { Drone } from '../types';

interface DroneCardsProps {
  drones: Drone[];
  selectedDroneId: string | null;
  onSelectDrone: (id: string) => void;
  onOpenFeed: (drone: Drone) => void;
  onOpenAudio: (droneId: string) => void;
  onToggleSearchlight: (droneId: string) => void;
  onDispatchToPriority: (droneId: string) => void;
}

export const DroneCards: React.FC<DroneCardsProps> = ({
  drones,
  selectedDroneId,
  onSelectDrone,
  onOpenFeed,
  onOpenAudio,
  onToggleSearchlight,
  onDispatchToPriority,
}) => {
  const getBatteryColor = (battery: number) => {
    if (battery > 60) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
    if (battery > 25) return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
    return 'text-rose-400 bg-rose-500/20 border-rose-500/40';
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'nominal':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3 h-3" /> AVIONICS NOMINAL
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3" /> SENSOR DEVIATION
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400 bg-rose-950/60 border border-rose-800/50 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3" /> MOTOR ANOMALY
          </span>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
            AERIS Drone Squadron Telemetry (3–4 Units Active)
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          REAL-TIME TELEMETRY & FIRST-AID AUDIO DISPATCH
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {drones.map((drone) => {
          const isSelected = selectedDroneId === drone.id;

          return (
            <div
              key={drone.id}
              id={`drone-card-${drone.id}`}
              onClick={() => onSelectDrone(drone.id)}
              className={`relative rounded-2xl p-4 transition-all duration-300 border flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Drone Header: Name, Model, Health */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-bold text-slate-100 font-mono tracking-wide">
                        {drone.name}
                      </span>
                      <span className="text-xs text-cyan-400 font-mono font-medium">
                        "{drone.callsign}"
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      {drone.model}
                    </p>
                  </div>
                  {getHealthBadge(drone.health)}
                </div>

                {/* Primary Telemetry Grid: Battery, Signal, Altitude, Speed */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs">
                  {/* Battery */}
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Battery className="w-3 h-3 text-slate-400" /> BATTERY
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`font-bold text-sm px-1.5 py-0.2 rounded border ${getBatteryColor(drone.battery)}`}>
                        {drone.battery}%
                      </span>
                      <span className="text-[10px] text-slate-400">~{drone.flightTimeRemainingMin}m</span>
                    </div>
                  </div>

                  {/* Signal Strength */}
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-slate-400" /> LINK SIGNAL
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-bold text-sm text-cyan-300">{drone.signalStrength}%</span>
                      <span className="text-[10px] text-slate-500">{drone.signalDbm}dBm</span>
                    </div>
                  </div>

                  {/* Altitude & Speed */}
                  <div className="flex flex-col pt-1.5 border-t border-slate-900">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-slate-400" /> ALTITUDE (AGL)
                    </span>
                    <span className="font-bold text-sm text-slate-200 mt-0.5">
                      {drone.altitude} m
                    </span>
                  </div>

                  {/* Ground Speed & Heading */}
                  <div className="flex flex-col pt-1.5 border-t border-slate-900">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Compass className="w-3 h-3 text-slate-400" /> SPEED / DIR
                    </span>
                    <span className="font-bold text-sm text-slate-200 mt-0.5">
                      {drone.speed} km/h <span className="text-[10px] text-slate-500">{drone.heading}°</span>
                    </span>
                  </div>
                </div>

                {/* Camera & Thermal Sensor Status */}
                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 font-mono text-[11px] mb-3 space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1 text-[10px]">
                      <Camera className="w-3 h-3 text-cyan-400" /> OPTICAL SENSOR
                    </span>
                    <span className="text-emerald-400 font-semibold">{drone.sensors.opticalStatus}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1 text-[10px]">
                      <Thermometer className="w-3 h-3 text-rose-400" /> THERMAL FLIR CORE
                    </span>
                    <span className="text-rose-300 font-semibold">{drone.sensors.thermalStatus.toUpperCase()}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 text-[10px] pt-1 border-t border-slate-900">
                    <span>SENSOR TEMP: {drone.sensors.sensorTemp}°C</span>
                    <span>{drone.sensors.fps} FPS</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Audio Broadcast & Live Camera Feed */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* View Live Feed */}
                  <button
                    id={`view-feed-${drone.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenFeed(drone);
                    }}
                    className="w-full py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>HUD Feed</span>
                  </button>

                  {/* Audio Communication / Loudspeaker */}
                  <button
                    id={`speak-drone-${drone.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAudio(drone.id);
                    }}
                    className={`w-full py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                      drone.speakerActive
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                        : 'bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border-cyan-800/60'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Speak Audio</span>
                  </button>
                </div>

                {/* Sub-actions: Searchlight and Dispatch */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    id={`toggle-light-${drone.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSearchlight(drone.id);
                    }}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-mono flex items-center justify-center gap-1 border transition cursor-pointer ${
                      drone.searchlightActive
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    <span>{drone.searchlightActive ? 'SEARCHLIGHT ON' : 'LIGHT OFF'}</span>
                  </button>

                  <button
                    id={`dispatch-drone-${drone.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDispatchToPriority(drone.id);
                    }}
                    className="flex-1 py-1 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-mono flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Navigation className="w-3 h-3 text-cyan-400" />
                    <span>DISPATCH P1</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
