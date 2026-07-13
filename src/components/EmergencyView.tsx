import React from 'react';
import { motion } from 'motion/react';
import { Heart, Search, ShieldAlert, Phone, UserCheck, AlertTriangle, HelpCircle } from 'lucide-react';

interface EmergencyViewProps {
  emergencyIdInput: string;
  setEmergencyIdInput: (val: string) => void;
  emergencyProfile: any;
  handleLookupEmergency: (e: React.FormEvent) => void;
}

export default function EmergencyView({
  emergencyIdInput,
  setEmergencyIdInput,
  emergencyProfile,
  handleLookupEmergency,
}: EmergencyViewProps) {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8 animate-fade-in relative">
      
      {/* Title */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-3.5 py-1 rounded-full text-[10px] font-bold text-rose-400 tracking-wider uppercase">
          <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>EMT & First Responder Portal</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
          Lifesaving Medical Summary
        </h2>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          Unauthenticated rapid access query. Retrieve blood groupings, allergy lists, and emergency contacts to make fast rescue decisions.
        </p>
      </div>

      {/* Query Search Panel */}
      <div className="glass-card border border-white/10 rounded-3xl p-6 space-y-4">
        <form onSubmit={handleLookupEmergency} className="flex gap-2.5">
          <input 
            type="text" 
            required
            value={emergencyIdInput}
            onChange={e => setEmergencyIdInput(e.target.value)}
            placeholder="Enter Patient ID e.g. PAT-100001" 
            className="flex-1 px-4 py-3.5 rounded-xl border border-white/10 bg-[#090d23]/80 text-xs font-mono font-bold tracking-wider outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition text-white placeholder-slate-500" 
          />
          <button 
            type="submit" 
            className="bg-gradient-to-tr from-rose-600 to-pink-500 text-white font-bold px-7 py-3.5 rounded-xl text-xs tracking-wide transition shadow-md shadow-rose-950/20 hover:scale-[1.01] cursor-pointer"
          >
            Retrieve Summary
          </button>
        </form>
      </div>

      {/* Result Profile */}
      {emergencyProfile ? (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border border-white/10 rounded-3xl overflow-hidden shadow-lg"
        >
          {/* High-visibility header */}
          <div className="bg-gradient-to-r from-rose-950/60 to-pink-900/40 border-b border-white/10 px-6 py-6 text-white flex justify-between items-center">
            <div>
              <span className="block text-[10px] font-bold text-rose-300 uppercase tracking-widest mb-1 font-mono">Emergency Profile</span>
              <h3 className="font-display text-xl font-bold tracking-tight">{emergencyProfile.name}</h3>
              <span className="block text-[10px] text-rose-200/80 font-mono mt-0.5">ID: {emergencyProfile.patientId}</span>
            </div>
            <Heart className="w-8 h-8 text-rose-500 animate-pulse" />
          </div>

          <div className="p-6 space-y-6 divide-y divide-white/5">
            {/* Critical Metrics: Blood Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
              <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-4 flex flex-col justify-between">
                <span className="block text-[9px] font-bold text-rose-400 uppercase tracking-widest mb-1.5 font-mono">Critical Blood Type</span>
                <span className="text-3xl font-display font-black text-rose-500">{emergencyProfile.bloodGroup || 'Awaiting Input'}</span>
                <span className="text-[9px] text-rose-400/80 mt-2 block leading-normal font-mono">
                  Always verify patient blood status physically prior to active operations.
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Allergy Matrix</span>
                  <p className="font-bold text-rose-400 text-sm mt-0.5">
                    {emergencyProfile.allergies || 'None declared'}
                  </p>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Chronic Conditions</span>
                  <p className="font-bold text-white text-sm mt-0.5">
                    {emergencyProfile.chronicDiseases || 'None declared'}
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="pt-6 space-y-4">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Primary Emergency Guardian</span>
              
              {emergencyProfile.emergencyContactName ? (
                <div className="flex items-center gap-4 bg-[#090d23]/80 border border-white/5 rounded-2xl p-4">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-white text-xs block leading-tight">{emergencyProfile.emergencyContactName}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{emergencyProfile.emergencyContactRelation}</span>
                  </div>
                  <a 
                    href={`tel:${emergencyProfile.emergencyContactPhone}`}
                    className="flex items-center gap-1.5 bg-slate-950/50 border border-white/10 hover:border-teal-500/30 text-teal-400 hover:text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Contact
                  </a>
                </div>
              ) : (
                <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-center text-xs text-slate-400 italic">
                  No emergency guardian contacts are set for this patient.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="glass-card border border-white/5 rounded-3xl p-12 text-center text-slate-400 flex flex-col items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-slate-600 mb-3" />
          <h4 className="font-display font-bold text-sm text-white">Awaiting Search Query</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            Enter the patient's unique physical registry key above to pull clinical vitals.
          </p>
        </div>
      )}

    </div>
  );
}
