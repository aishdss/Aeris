import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Search, 
  UserCheck, 
  Phone, 
  Heart, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';
import { MissingPerson, Victim } from '../types';

interface MissingDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: MissingPerson[];
  victims: Victim[];
  onOpenMatch: (victim: Victim) => void;
}

export const MissingDatabaseModal: React.FC<MissingDatabaseModalProps> = ({
  isOpen,
  onClose,
  database,
  victims,
  onOpenMatch,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const filtered = database.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastKnownLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.medicalHistory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md font-mono text-xs">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Secure Missing Individuals Registry
              </h2>
              <p className="text-[11px] text-slate-400">
                Biometric Facial Recognition Database & Next-of-Kin Emergency Contacts
              </p>
            </div>
          </div>

          <button
            id="close-missing-db-modal"
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by missing person name, last known sector, or medical condition..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Database List */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          {filtered.map((person) => {
            // Check if there is an active drone match for this person
            const matchedVictim = victims.find((v) => v.faceMatch?.candidateId === person.id);

            return (
              <div
                key={person.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={person.photoUrl}
                    alt={person.name}
                    className="w-14 h-14 rounded-xl object-cover border border-blue-500/40 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-100">{person.name}</h3>
                      <span className="text-slate-400">({person.gender}, Age {person.age})</span>
                      {matchedVictim && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold animate-pulse">
                          AERIAL MATCH DETECTED ({matchedVictim.faceMatch?.confidence}%)
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-0.5">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Last Known: {person.lastKnownLocation}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>Emergency Contact: {person.nextOfKinContact}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-rose-300">
                        <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Medical File: {person.medicalHistory}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {matchedVictim ? (
                  <button
                    type="button"
                    onClick={() => onOpenMatch(matchedVictim)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>View Aerial Match</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-500 border border-slate-800 px-2.5 py-1 rounded-lg shrink-0">
                    Scanning Aerial Grid...
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-slate-400">
          <span>{database.length} Missing Records Synchronized with State Incident Command</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
