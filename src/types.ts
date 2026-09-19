export type DroneHealth = 'nominal' | 'warning' | 'critical';
export type DroneStatus = 'patrolling' | 'investigating' | 'broadcasting' | 'returning' | 'charging';

export interface DroneSensors {
  thermalStatus: 'nominal' | 'calibrating' | 'high_temp';
  opticalStatus: '4K_HDR_ACTIVE' | 'LOW_LIGHT_ENHANCED';
  sensorTemp: number; // in Celsius
  fps: number;
  resolution: string;
  irCore: string;
}

export interface DroneCoordinates {
  x: number; // 0-100 percentage across tactical map
  y: number; // 0-100 percentage across tactical map
  lat: number;
  lng: number;
}

export interface Drone {
  id: string;
  name: string;
  callsign: string;
  model: string;
  battery: number; // 0-100%
  health: DroneHealth;
  status: DroneStatus;
  signalStrength: number; // 0-100%
  signalDbm: number; // e.g. -64 dBm
  altitude: number; // meters AGL
  speed: number; // km/h
  heading: number; // degrees 0-360
  coordinates: DroneCoordinates;
  sensors: DroneSensors;
  speakerActive: boolean;
  searchlightActive: boolean;
  currentTargetId: string | null;
  flightTimeRemainingMin: number;
}

export type VictimType = 'human' | 'animal';
export type MovementStatus = 'active' | 'sluggish' | 'unresponsive_motionless' | 'possibly_perished';

export interface FaceMatchRecord {
  candidateId: string;
  candidateName: string;
  age: number;
  confidence: number; // 0-100%
  photoUrl: string;
  matchedFeatures: string[];
  verified: boolean;
  nextOfKin: string;
  medicalConditions: string;
}

export interface AnimalInfo {
  species: string;
  breed?: string;
  collarDetected: boolean;
  distressLevel: 'moderate' | 'severe' | 'critical';
}

export interface Victim {
  id: string;
  name: string;
  type: VictimType;
  age?: number | string;
  condition: string;
  surroundingHazards: string;
  confidenceScore: number; // AI detection confidence 0-100%
  priority: 1 | 2 | 3 | 4 | 5; // 1 is highest emergency
  dynamicPriorityShift?: number; // e.g. +2 if escalated
  movementStatus: MovementStatus;
  thermalTemp: number; // degrees C
  timeToCriticalMinutes: number; // updated dynamically with escalation
  coordinates: DroneCoordinates;
  sector: string;
  assignedDroneId?: string;
  faceMatch?: FaceMatchRecord;
  animalInfo?: AnimalInfo;
  audioFirstAidActive?: boolean;
  lastBroadcastMessage?: string;
  nearestHelpDistanceMeters: number;
  responderDispatched: boolean;
  dispatchUnitName?: string;
}

export interface MissingPerson {
  id: string;
  name: string;
  age: number;
  gender: string;
  photoUrl: string;
  reportedMissingTime: string;
  lastKnownLocation: string;
  nextOfKinContact: string;
  medicalHistory: string;
  facialBiometricHash: string;
}

export interface EscalationReport {
  hazardType: string;
  currentSeverityLevel: string;
  affectedZone: string;
  trendRate: string;
  predictedTrajectory5m: string;
  predictedTrajectory30m: string;
  confidenceLevel: string;
  newlyEndangeredVictims: string[];
  compromisedRoutes: string[];
  safeAlternateRoutes: string[];
  recommendedAction: string;
  triggerReasoning: string;
  trendStatus: 'worsening' | 'stabilizing' | 'critical';
  timestamp: string;
}

export interface CalamityScenario {
  id: string;
  name: string;
  type: 'flood' | 'wildfire' | 'earthquake' | 'chemical';
  description: string;
  baseSeverity: number;
  activeHazardsSummary: string;
  ambientTemp: number;
  weatherCondition: string;
  windSpeed: number; // km/h
  waterOrFlameRiseRate: string;
  evacuationRoutes: {
    name: string;
    status: 'safe' | 'compromised' | 'impassable';
    description: string;
  }[];
}

export interface RadioLogEntry {
  id: string;
  timestamp: string;
  source: 'drone' | 'operator' | 'victim_audio' | 'ai_system' | 'ground_team';
  droneCallsign?: string;
  message: string;
  type: 'broadcast' | 'incoming' | 'alert';
}
