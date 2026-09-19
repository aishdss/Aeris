import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Mic, 
  MicOff, 
  X, 
  Radio, 
  Sparkles, 
  Play, 
  Square, 
  Send, 
  Activity, 
  PhoneCall, 
  CheckCircle,
  AlertCircle,
  Shield,
  LifeBuoy
} from 'lucide-react';
import { Drone, Victim, RadioLogEntry } from '../types';

interface AudioCommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDrone: Drone | null;
  activeVictim: Victim | null;
  drones: Drone[];
  victims: Victim[];
  onBroadcastMessage: (victimId: string, message: string) => void;
}

export const AudioCommunicationModal: React.FC<AudioCommunicationModalProps> = ({
  isOpen,
  onClose,
  activeDrone,
  activeVictim,
  drones,
  victims,
  onBroadcastMessage,
}) => {
  const [selectedDroneId, setSelectedDroneId] = useState<string>(activeDrone?.id || drones[0]?.id || '');
  const [selectedVictimId, setSelectedVictimId] = useState<string>(activeVictim?.id || victims[0]?.id || '');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');
  const [isSpeakingSpeech, setIsSpeakingSpeech] = useState<boolean>(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [radioLogs, setRadioLogs] = useState<RadioLogEntry[]>([
    {
      id: 'log-1',
      timestamp: '00:26:12',
      source: 'drone',
      droneCallsign: 'Echo Lifeline',
      message: 'Loudspeaker PA powered on (118 dB directional horn). Ready for operator transmission.',
      type: 'broadcast',
    },
    {
      id: 'log-2',
      timestamp: '00:27:05',
      source: 'victim_audio',
      message: 'Acoustic sensor picked up repetitive metal banging sound (estimated human tapping SOS pattern).',
      type: 'incoming',
    },
  ]);

  const targetVictim = victims.find((v) => v.id === selectedVictimId) || activeVictim || victims[0];
  const targetDrone = drones.find((d) => d.id === selectedDroneId) || activeDrone || drones[0];

  useEffect(() => {
    if (activeVictim) setSelectedVictimId(activeVictim.id);
    if (activeDrone) setSelectedDroneId(activeDrone.id);
  }, [activeVictim, activeDrone]);

  if (!isOpen) return null;

  // Real Web Speech API voice broadcast synthesis
  const speakTextThroughSpeaker = (text: string) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeakingSpeech(true);
      utterance.onend = () => setIsSpeakingSpeech(false);
      utterance.onerror = () => setIsSpeakingSpeech(false);
      window.speechSynthesis.speak(utterance);
    }

    // Add to radio logs
    const newEntry: RadioLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      source: 'operator',
      droneCallsign: targetDrone?.callsign,
      message: `[BROADCAST via ${targetDrone?.name}]: "${text}"`,
      type: 'broadcast',
    };
    setRadioLogs((prev) => [newEntry, ...prev]);

    if (targetVictim) {
      onBroadcastMessage(targetVictim.id, text);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingSpeech(false);
  };

  // Generate real AI first-aid voice instructions from server
  const handleGenerateAiFirstAid = async () => {
    if (!targetVictim) return;
    setIsGeneratingAi(true);

    try {
      const res = await fetch('/api/generate-first-aid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          victimName: targetVictim.name,
          condition: targetVictim.condition,
          hazards: targetVictim.surroundingHazards,
          type: targetVictim.type,
          movementStatus: targetVictim.movementStatus,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const data = await res.json();
      if (data.voiceScript) {
        setCustomText(data.voiceScript);
        speakTextThroughSpeaker(data.voiceScript);
      } else {
        throw new Error('Empty script returned');
      }
    } catch (err) {
      console.warn('AI first-aid generation fallback activated:', err);
      // High-precision immediate emergency fallback
      let fallbackScript = `Attention ${targetVictim.name}, this is AERIS Drone Rescue. `;
      const cond = (targetVictim.condition || '').toLowerCase();
      const haz = (targetVictim.surroundingHazards || '').toLowerCase();

      if (cond.includes('bleed') || cond.includes('hemorrhage')) {
        fallbackScript += 'Apply continuous firm pressure to the injury with clean cloth. Keep elevated.';
      } else if (haz.includes('flood') || haz.includes('water')) {
        fallbackScript += 'Climb to the highest solid surface. Do not touch moving water. Conserve heat.';
      } else if (targetVictim.movementStatus === 'unresponsive_motionless') {
        fallbackScript += 'If you hear this drone speaker, move your fingers or blink twice. Medical teams are tracking your coordinates.';
      } else {
        fallbackScript += 'Stay low, protect your head, and remain in drone sight. Field medics ETA is 3 minutes.';
      }

      setCustomText(fallbackScript);
      speakTextThroughSpeaker(fallbackScript);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Canned First-Aid Guidance Protocols
  const firstAidProtocols = [
    {
      title: 'CPR / Breathing Cadence',
      desc: 'Paced audible chest compression beat and airway clearance guidance',
      text: 'Attention! If the victim is unresponsive, begin chest compressions now. Push hard and fast in the center of the chest to the beat of this beacon. One, two, three, four. Help is arriving.',
    },
    {
      title: 'Severe Bleeding & Tourniquet',
      desc: 'Instructs direct continuous pressure and limb elevation',
      text: 'This is AERIS Rescue. Locate the bleeding site and apply direct, continuous pressure using clean fabric or clothing. Do not release pressure. Elevate the limb if possible.',
    },
    {
      title: 'Rising Flood Surge Elevation',
      desc: 'Instructs immediate vertical climbing away from rising water',
      text: 'Flood warning! Water levels are rising rapidly in your sector. Immediately climb to the highest available counter, furniture, or roof structure. A rescue boat is 300 meters away.',
    },
    {
      title: 'Hypothermia Heat Conservation',
      desc: 'Instructs wrapping wet clothes and huddling against cold shock',
      text: 'AERIS Lifeline speaking. Conserve body heat. Wring out excess cold water from clothing. Huddle tight and protect your head. Heat beacon drops in 60 seconds.',
    },
    {
      title: 'Animal Calming & Containment',
      desc: 'Gentle low-frequency soothing voice for stranded domestic pets',
      text: 'Good dog, stay right there! Good boy, remain calm. Help is right here. Stay on the container roof.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2">
                AERIS Drone Loudspeaker & Operator Intercom
                {isSpeakingSpeech && (
                  <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded font-black animate-pulse">
                    ON AIR
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Direct Two-Way Audio Communication & Real-time First-Aid Broadcast
              </p>
            </div>
          </div>

          <button
            id="close-audio-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 font-mono text-xs">
          {/* Target Drone & Target Victim Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Broadcasting Drone
              </label>
              <select
                id="select-audio-drone"
                value={selectedDroneId}
                onChange={(e) => setSelectedDroneId(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
              >
                {drones.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} "{d.callsign}" • Altitude {d.altitude}m • Batt {d.battery}%
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Target Person / Entity
              </label>
              <select
                id="select-audio-victim"
                value={selectedVictimId}
                onChange={(e) => setSelectedVictimId(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
              >
                {victims.map((v) => (
                  <option key={v.id} value={v.id}>
                    P{v.priority} • {v.name} ({v.sector})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Target Banner */}
          {targetVictim && (
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase">
                  ACTIVE RECIPIENT TELEMETRY
                </span>
                <p className="text-slate-200 font-semibold text-sm">
                  {targetVictim.name} ({targetVictim.condition})
                </p>
                <p className="text-[11px] text-slate-400">
                  Hazards: {targetVictim.surroundingHazards} • Safe Time: {targetVictim.timeToCriticalMinutes} mins
                </p>
              </div>

              <button
                id="ai-generate-guidance-btn"
                type="button"
                onClick={handleGenerateAiFirstAid}
                disabled={isGeneratingAi}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>{isGeneratingAi ? 'Synthesizing...' : 'Generate AI First-Aid Audio'}</span>
              </button>
            </div>
          )}

          {/* Push-to-Talk (PTT) Operator Live Mic */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center">
            <div className="mb-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                OPERATOR PUSH-TO-TALK (PTT) CONSOLE
              </span>
              <p className="text-xs text-slate-500">
                Hold or click to broadcast your voice directly through the drone's external horn
              </p>
            </div>

            {/* PTT Large Button */}
            <button
              id="ptt-mic-button"
              type="button"
              onMouseDown={() => {
                setIsTransmitting(true);
                speakTextThroughSpeaker("This is AERIS Operator speaking through the drone. We see you on our thermal feed. Medical teams are dispatched to your exact coordinates.");
              }}
              onMouseUp={() => setIsTransmitting(false)}
              onClick={() => {
                if (!isTransmitting) {
                  setIsTransmitting(true);
                  speakTextThroughSpeaker("Attention, this is AERIS rescue control. Stay calm and keep clear of hazards.");
                  setTimeout(() => setIsTransmitting(false), 3000);
                }
              }}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isTransmitting || isSpeakingSpeech
                  ? 'bg-rose-600 text-white shadow-2xl shadow-rose-600/50 scale-105 ring-4 ring-rose-400/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border-2 border-cyan-500/40 hover:scale-102'
              }`}
            >
              {isTransmitting || isSpeakingSpeech ? (
                <Mic className="w-8 h-8 animate-pulse" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>

            {/* Waveform / VU meter simulation */}
            <div className="flex items-center gap-1 mt-3 h-5">
              {[4, 12, 8, 16, 20, 14, 10, 18, 22, 16, 12, 6].map((h, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isTransmitting || isSpeakingSpeech
                      ? 'bg-cyan-400 animate-pulse'
                      : 'bg-slate-800'
                  }`}
                  style={{
                    height: isTransmitting || isSpeakingSpeech ? `${Math.max(4, h * (Math.random() * 0.8 + 0.5))}px` : '4px',
                  }}
                />
              ))}
            </div>

            <div className="text-[11px] font-mono mt-1 text-slate-400">
              {isTransmitting || isSpeakingSpeech ? (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  TRANSMITTING TO {targetDrone?.name} LOUDSPEAKER (118 dB)
                </span>
              ) : (
                <span>MICROPHONE STANDBY • CLICK OR HOLD TO TRANSMIT</span>
              )}
            </div>
          </div>

          {/* Quick First-Aid Protocol Broadcasts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Emergency First-Aid Voice Protocols (One-Click Broadcast)
              </span>
              {isSpeakingSpeech && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="text-xs text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1"
                >
                  <Square className="w-3 h-3" /> Stop Broadcast
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {firstAidProtocols.map((protocol, idx) => (
                <div
                  key={idx}
                  onClick={() => speakTextThroughSpeaker(protocol.text)}
                  className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer flex items-start justify-between gap-2 group"
                >
                  <div>
                    <span className="font-bold text-slate-200 group-hover:text-cyan-300 transition">
                      {protocol.title}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {protocol.desc}
                    </p>
                  </div>
                  <Play className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 group-hover:scale-110 transition" />
                </div>
              ))}
            </div>
          </div>

          {/* Custom Message Dispatch */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Custom Loudspeaker Announcement
            </label>
            <div className="flex gap-2">
              <input
                id="custom-audio-text-input"
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type custom instructions for the drone to announce aloud..."
                className="flex-1 bg-slate-950 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customText) {
                    speakTextThroughSpeaker(customText);
                  }
                }}
              />
              <button
                id="send-custom-broadcast-btn"
                type="button"
                onClick={() => speakTextThroughSpeaker(customText)}
                disabled={!customText}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast</span>
              </button>
            </div>
          </div>

          {/* Two-Way Acoustic Log & Drone Transcripts */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
              Two-Way Audio Transmission Log & Acoustic Sensor Telemetry
            </span>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 max-h-36 overflow-y-auto space-y-1.5">
              {radioLogs.map((log) => (
                <div key={log.id} className="text-[11px] leading-relaxed flex items-start gap-2">
                  <span className="text-slate-500 font-mono shrink-0">[{log.timestamp}]</span>
                  <span className={`font-semibold shrink-0 ${
                    log.source === 'victim_audio' ? 'text-amber-400' : 'text-cyan-400'
                  }`}>
                    {log.source === 'victim_audio' ? 'VICTIM ACOUSTIC DETECT:' : 'OPERATOR BROADCAST:'}
                  </span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>ENCRYPTED RESCUE AUDIO MESH • 99.8% QOS</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            Close Intercom
          </button>
        </div>
      </div>
    </div>
  );
};
