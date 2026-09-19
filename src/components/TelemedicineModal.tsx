import React, { useState, useEffect } from 'react';
import { 
  X, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  UserCheck, 
  PhoneOff, 
  ShieldCheck, 
  Activity, 
  FileText, 
  Heart, 
  AlertTriangle 
} from 'lucide-react';
import { Victim } from '../types';

interface TelemedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  victim: Victim | null;
}

export const TelemedicineModal: React.FC<TelemedicineModalProps> = ({
  isOpen,
  onClose,
  victim,
}) => {
  const [callDuration, setCallDuration] = useState<number>(0);
  const [micMuted, setMicMuted] = useState<boolean>(false);
  const [camOff, setCamOff] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen || !victim) return null;

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md font-mono text-xs">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  Emergency Medical Telemedicine Link
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE ENCRYPTED ({formatDuration(callDuration)})
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Dr. Amanda Vance (Trauma Attending) • Stanford Emergency Response Base
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Grid Simulation */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Physician Feed */}
            <div className="relative h-56 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between p-3">
              <div className="flex items-center justify-between text-[10px] text-slate-300 z-10 bg-slate-900/80 px-2 py-1 rounded">
                <span className="font-bold text-purple-300">DR. AMANDA VANCE, MD</span>
                <span className="text-emerald-400">HQ MEDICAL COMMAND</span>
              </div>

              {/* Physician visual placeholder avatar simulation */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="w-20 h-20 rounded-full bg-purple-900/40 border-2 border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-xl">
                  MD
                </div>
                <p className="text-slate-400 text-[11px] mt-2">Trauma Care Center • Video Feed Active</p>
              </div>

              <div className="z-10 bg-slate-900/80 px-2 py-1 rounded text-[10px] text-slate-400 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Audio Latency: 18ms • HD 1080p</span>
              </div>
            </div>

            {/* Drone Aerial Camera Feed of Victim */}
            <div className="relative h-56 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between p-3">
              <div className="flex items-center justify-between text-[10px] text-slate-300 z-10 bg-slate-900/80 px-2 py-1 rounded">
                <span className="font-bold text-cyan-300">AERIS DRONE FORWARD FEED</span>
                <span className="text-rose-400">TARGET: {victim.name.slice(0, 16)}</span>
              </div>

              {/* Visual simulated telemetry overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 text-center">
                <div className="w-28 h-20 border-2 border-dashed border-cyan-400/60 rounded flex items-center justify-center text-cyan-300 text-[10px]">
                  THERMAL SPOT: {victim.thermalTemp}°C
                </div>
                <p className="text-slate-400 text-[10px] mt-1">{victim.condition}</p>
              </div>

              <div className="z-10 bg-slate-900/80 px-2 py-1 rounded text-[10px] text-slate-400 flex items-center justify-between">
                <span>SECTOR: {victim.sector}</span>
                <span className="text-amber-400 font-bold">PRIORITY {victim.priority}</span>
              </div>
            </div>
          </div>

          {/* Physician Medical Notes & Triage Orders */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider block">
              Physician Emergency Orders & Triage Confirmation
            </span>
            <p className="text-slate-200 text-xs leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              "Operator, based on the drone's thermal signature ({victim.thermalTemp}°C) and visible airway status, prioritize cervical spine stabilization during extrication. Broadcast the tourniquet instructions over the drone speaker now. I have approved Level-1 Trauma diversion."
            </p>
          </div>
        </div>

        {/* Video Call Controls */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMicMuted(!micMuted)}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                micMuted ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setCamOff(!camOff)}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                camOff ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              {camOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-2 transition cursor-pointer shadow-md"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Consultation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
