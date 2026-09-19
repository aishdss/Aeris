import React, { useState, useEffect, useRef } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  TacticalMap 
} from './components/TacticalMap';
import { 
  DroneCards 
} from './components/DroneCards';
import { 
  VictimTriagePanel 
} from './components/VictimTriagePanel';
import { 
  AudioCommunicationModal 
} from './components/AudioCommunicationModal';
import { 
  CameraFeedModal 
} from './components/CameraFeedModal';
import { 
  FaceMatchModal 
} from './components/FaceMatchModal';
import { 
  EscalationReportModal 
} from './components/EscalationReportModal';
import { 
  MissingDatabaseModal 
} from './components/MissingDatabaseModal';
import { 
  TelemedicineModal 
} from './components/TelemedicineModal';
import { 
  INITIAL_DRONES, 
  INITIAL_VICTIMS, 
  MISSING_PERSONS_DATABASE, 
  CALAMITY_SCENARIOS, 
  INITIAL_ESCALATION_REPORT 
} from './data/initialState';
import { 
  Drone, 
  Victim, 
  MissingPerson, 
  CalamityScenario, 
  EscalationReport 
} from './types';
import { 
  AlertTriangle, 
  TrendingUp, 
  Volume2, 
  Activity, 
  ShieldCheck, 
  Radio, 
  Compass, 
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function App() {
  // Core Data State
  const [scenarios] = useState<CalamityScenario[]>(CALAMITY_SCENARIOS);
  const [activeScenario, setActiveScenario] = useState<CalamityScenario>(CALAMITY_SCENARIOS[0]);
  const [calamitySeverity, setCalamitySeverity] = useState<number>(activeScenario.baseSeverity);
  const [dynamicEscalationEnabled, setDynamicEscalationEnabled] = useState<boolean>(true);

  const [drones, setDrones] = useState<Drone[]>(INITIAL_DRONES);
  const [victims, setVictims] = useState<Victim[]>(INITIAL_VICTIMS);
  const [missingPersons] = useState<MissingPerson[]>(MISSING_PERSONS_DATABASE);
  const [escalationReport, setEscalationReport] = useState<EscalationReport>(INITIAL_ESCALATION_REPORT);

  // Selection State
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>('drone-01');
  const [selectedVictimId, setSelectedVictimId] = useState<string | null>('vic-01');

  // Modals State
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);
  const [isFeedModalOpen, setIsFeedModalOpen] = useState<boolean>(false);
  const [isFaceMatchModalOpen, setIsFaceMatchModalOpen] = useState<boolean>(false);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState<boolean>(false);
  const [isMissingDbModalOpen, setIsMissingDbModalOpen] = useState<boolean>(false);
  const [isTelemedModalOpen, setIsTelemedModalOpen] = useState<boolean>(false);

  // Active items for modals
  const activeDrone = drones.find((d) => d.id === selectedDroneId) || drones[0];
  const activeVictim = victims.find((v) => v.id === selectedVictimId) || victims[0];

  // Dynamic Escalation Simulation Loop
  useEffect(() => {
    if (!dynamicEscalationEnabled) return;

    const interval = setInterval(() => {
      setCalamitySeverity((prev) => {
        const next = Math.min(98, prev + 1);

        // Update victim safe times and dynamic priorities when severity grows
        setVictims((currVictims) =>
          currVictims.map((vic) => {
            // Safe time decreases as calamity escalates
            const newSafeTime = Math.max(1, vic.timeToCriticalMinutes - 0.2);

            // Dynamic priority re-ranking rule:
            // If victim safe time drops below 10 mins and was P2 or P3, escalate to P1!
            let newPriority = vic.priority;
            let priorityShift = vic.dynamicPriorityShift || 0;

            if (newSafeTime < 10 && vic.priority > 1) {
              priorityShift = vic.priority - 1;
              newPriority = 1;
            }

            return {
              ...vic,
              timeToCriticalMinutes: Number(newSafeTime.toFixed(1)),
              priority: newPriority as 1 | 2 | 3 | 4 | 5,
              dynamicPriorityShift: priorityShift,
            };
          })
        );

        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [dynamicEscalationEnabled]);

  // Subtle drone flight motion simulation
  useEffect(() => {
    const flightTimer = setInterval(() => {
      setDrones((currDrones) =>
        currDrones.map((drone) => {
          const deltaX = (Math.random() - 0.5) * 0.4;
          const deltaY = (Math.random() - 0.5) * 0.4;
          const deltaAlt = (Math.random() - 0.5) * 0.2;
          const deltaSpeed = (Math.random() - 0.5) * 1.0;

          return {
            ...drone,
            coordinates: {
              ...drone.coordinates,
              x: Math.max(10, Math.min(90, drone.coordinates.x + deltaX)),
              y: Math.max(10, Math.min(90, drone.coordinates.y + deltaY)),
            },
            altitude: Number(Math.max(12, drone.altitude + deltaAlt).toFixed(1)),
            speed: Number(Math.max(0, drone.speed + deltaSpeed).toFixed(1)),
            heading: (drone.heading + Math.floor(Math.random() * 3) - 1 + 360) % 360,
          };
        })
      );
    }, 2000);

    return () => clearInterval(flightTimer);
  }, []);

  // Handler: Change Scenario
  const handleSelectScenario = (scenario: CalamityScenario) => {
    setActiveScenario(scenario);
    setCalamitySeverity(scenario.baseSeverity);
    setEscalationReport((prev) => ({
      ...prev,
      hazardType: scenario.name,
      currentSeverityLevel: `SEVERITY LEVEL ${Math.floor(scenario.baseSeverity / 20)}: ${scenario.type.toUpperCase()} CRISIS`,
      affectedZone: 'Active Quadrant Perimeter',
      timestamp: 'Just now',
    }));
  };

  // Handler: Broadcast Message
  const handleBroadcastMessage = (victimId: string, message: string) => {
    setVictims((prev) =>
      prev.map((v) =>
        v.id === victimId
          ? { ...v, audioFirstAidActive: true, lastBroadcastMessage: message }
          : v
      )
    );
    // Mark target drone as speaker active
    if (selectedDroneId) {
      setDrones((prev) =>
        prev.map((d) => (d.id === selectedDroneId ? { ...d, speakerActive: true } : d))
      );
    }
  };

  // Handler: Toggle Drone Searchlight
  const handleToggleSearchlight = (droneId: string) => {
    setDrones((prev) =>
      prev.map((d) => (d.id === droneId ? { ...d, searchlightActive: !d.searchlightActive } : d))
    );
  };

  // Handler: Dispatch Drone to Priority 1
  const handleDispatchToPriority = (droneId: string) => {
    const p1 = victims.find((v) => v.priority === 1) || victims[0];
    if (p1) {
      setDrones((prev) =>
        prev.map((d) =>
          d.id === droneId
            ? {
                ...d,
                currentTargetId: p1.id,
                coordinates: { ...p1.coordinates },
                status: 'investigating',
              }
            : d
        )
      );
      setSelectedVictimId(p1.id);
    }
  };

  // Handler: Dispatch Ground Team to Victim
  const handleDispatchRescueTeam = (victimId: string) => {
    setVictims((prev) =>
      prev.map((v) =>
        v.id === victimId
          ? {
              ...v,
              responderDispatched: true,
              dispatchUnitName: 'Incident Alpha Rapid USAR Unit',
            }
          : v
      )
    );
  };

  // Handler: Confirm Biometric Verification
  const handleConfirmVerification = (victimId: string) => {
    setVictims((prev) =>
      prev.map((v) =>
        v.id === victimId && v.faceMatch
          ? {
              ...v,
              faceMatch: { ...v.faceMatch, verified: true },
              responderDispatched: true,
              dispatchUnitName: 'USAR Identification Unit',
            }
          : v
      )
    );
  };

  // Handler: Apply Re-Ranking Action from Escalation Report
  const handleApplyReRanking = () => {
    setVictims((prev) =>
      prev.map((v) => {
        if (v.sector.includes('Sector 4-B') || v.timeToCriticalMinutes < 15) {
          return {
            ...v,
            priority: 1,
            dynamicPriorityShift: (v.dynamicPriorityShift || 0) + 1,
          };
        }
        return v;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <Header
        scenarios={scenarios}
        activeScenario={activeScenario}
        onSelectScenario={handleSelectScenario}
        calamitySeverity={calamitySeverity}
        onSeverityChange={setCalamitySeverity}
        dynamicEscalationEnabled={dynamicEscalationEnabled}
        onToggleDynamicEscalation={() => setDynamicEscalationEnabled(!dynamicEscalationEnabled)}
        onOpenEscalationReport={() => setIsEscalationModalOpen(true)}
        onOpenMissingDatabase={() => setIsMissingDbModalOpen(true)}
        onOpenBroadcastModal={() => setIsAudioModalOpen(true)}
        escalationReport={escalationReport}
        activeDronesCount={drones.length}
        totalDronesCount={drones.length}
      />

      {/* Dynamic Escalation Alert Banner */}
      {dynamicEscalationEnabled && calamitySeverity > 75 && (
        <div className="bg-rose-950/80 border-b border-rose-800 px-4 py-2 text-xs font-mono text-rose-200 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <strong className="text-rose-100 font-bold uppercase tracking-wider">
                CALAMITY ESCALATION ALERT ({calamitySeverity}% SEVERITY):
              </strong>
              <span>
                {activeScenario.waterOrFlameRiseRate} • Victim safe time collapsing across lower quadrants.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsEscalationModalOpen(true)}
              className="underline font-bold text-rose-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>View Escalation Trajectory & Route Impact</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Mission Control Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 space-y-5">
        {/* Tactical Map & Map Overlays */}
        <section aria-label="Tactical Aerial Map">
          <TacticalMap
            drones={drones}
            victims={victims}
            selectedDroneId={selectedDroneId}
            selectedVictimId={selectedVictimId}
            onSelectDrone={(id) => setSelectedDroneId(id)}
            onSelectVictim={(id) => setSelectedVictimId(id)}
            onOpenBroadcast={(victimId, droneId) => {
              if (victimId) setSelectedVictimId(victimId);
              if (droneId) setSelectedDroneId(droneId);
              setIsAudioModalOpen(true);
            }}
            scenario={activeScenario}
            calamitySeverity={calamitySeverity}
          />
        </section>

        {/* Live Drone Squadron Telemetry Dashboard (3-4 Drones) */}
        <section aria-label="Drone Telemetry Squadron">
          <DroneCards
            drones={drones}
            selectedDroneId={selectedDroneId}
            onSelectDrone={(id) => setSelectedDroneId(id)}
            onOpenFeed={(drone) => {
              setSelectedDroneId(drone.id);
              setIsFeedModalOpen(true);
            }}
            onOpenAudio={(droneId) => {
              setSelectedDroneId(droneId);
              setIsAudioModalOpen(true);
            }}
            onToggleSearchlight={handleToggleSearchlight}
            onDispatchToPriority={handleDispatchToPriority}
          />
        </section>

        {/* Victim & Hazard Triage Panel (Priority 1 to 5) */}
        <section aria-label="Victim & Hazard Triage">
          <VictimTriagePanel
            victims={victims}
            selectedVictimId={selectedVictimId}
            onSelectVictim={(id) => setSelectedVictimId(id)}
            onOpenAudioBroadcast={(victim) => {
              setSelectedVictimId(victim.id);
              setIsAudioModalOpen(true);
            }}
            onOpenFaceMatchModal={(victim) => {
              setSelectedVictimId(victim.id);
              setIsFaceMatchModalOpen(true);
            }}
            onOpenTelemedicineModal={(victim) => {
              setSelectedVictimId(victim.id);
              setIsTelemedModalOpen(true);
            }}
            onDispatchRescueTeam={handleDispatchRescueTeam}
            dynamicEscalationEnabled={dynamicEscalationEnabled}
          />
        </section>
      </main>

      {/* System Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-800 px-4 py-3 mt-8 text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <span className="font-bold text-slate-200">AERIS DISASTER RESPONSE ENGINE v3.4</span>
            <span className="mx-2">•</span>
            <span>FLIR RADIOMETRIC & DUAL COMPUTER VISION MESH</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>SECURE BIOMETRIC HASH ACTIVE</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">ALL 4 DRONES IN LINK</span>
          </div>
        </div>
      </footer>

      {/* Modals Suite */}
      {/* 1. Audio Communication & Loudspeaker First-Aid Modal */}
      <AudioCommunicationModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        activeDrone={activeDrone}
        activeVictim={activeVictim}
        drones={drones}
        victims={victims}
        onBroadcastMessage={handleBroadcastMessage}
      />

      {/* 2. Live Drone Gimbal Optical & Thermal HUD Feed */}
      <CameraFeedModal
        isOpen={isFeedModalOpen}
        onClose={() => setIsFeedModalOpen(false)}
        drone={activeDrone}
        targetVictim={activeVictim}
        onOpenAudio={(droneId) => {
          setSelectedDroneId(droneId);
          setIsFeedModalOpen(false);
          setIsAudioModalOpen(true);
        }}
      />

      {/* 3. Probabilistic Biometric Face Matching Modal */}
      <FaceMatchModal
        isOpen={isFaceMatchModalOpen}
        onClose={() => setIsFaceMatchModalOpen(false)}
        victim={activeVictim}
        missingPerson={
          activeVictim?.faceMatch
            ? missingPersons.find((p) => p.id === activeVictim.faceMatch?.candidateId) || null
            : null
        }
        onConfirmVerification={handleConfirmVerification}
      />

      {/* 4. Live Calamity Escalation Intelligence Report */}
      <EscalationReportModal
        isOpen={isEscalationModalOpen}
        onClose={() => setIsEscalationModalOpen(false)}
        report={escalationReport}
        scenario={activeScenario}
        calamitySeverity={calamitySeverity}
        victims={victims}
        drones={drones}
        onApplyReRanking={handleApplyReRanking}
        onRefreshAiReport={(newReport) => setEscalationReport(newReport)}
      />

      {/* 5. Missing Individuals Database Registry */}
      <MissingDatabaseModal
        isOpen={isMissingDbModalOpen}
        onClose={() => setIsMissingDbModalOpen(false)}
        database={missingPersons}
        victims={victims}
        onOpenMatch={(victim) => {
          setSelectedVictimId(victim.id);
          setIsMissingDbModalOpen(false);
          setIsFaceMatchModalOpen(true);
        }}
      />

      {/* 6. Medical Telemedicine Video Link Preview */}
      <TelemedicineModal
        isOpen={isTelemedModalOpen}
        onClose={() => setIsTelemedModalOpen(false)}
        victim={activeVictim}
      />
    </div>
  );
}
