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
    <div className="max-w-2xl mx-auto py-8 space-y-8 animate-fade-in">
      
      {/* Title */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-100 px-3.5 py-1 rounded-full text-[10px] font-bold text-rose-700 tracking-wider uppercase">
          <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>EMT & First Responder Portal</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Lifesaving Medical Summary
        </h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Unauthenticated rapid access query. Retrieve blood groupings, allergy lists, and emergency contacts to make fast rescue decisions.
        </p>
      </div>

      {/* Query Search Panel */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <form onSubmit={handleLookupEmergency} className="flex gap-2.5">
          <input 
            type="text" 
            required
            value={emergencyIdInput}
            onChange={e => setEmergencyIdInput(e.target.value)}
            placeholder="Enter Patient ID e.g. PAT-100001" 
            className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 text-xs font-mono font-bold tracking-wider outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 transition text-slate-800" 
          />
          <button 
            type="submit" 
            className="bg-gradient-to-tr from-rose-600 to-pink-500 text-white font-bold px-7 py-3.5 rounded-xl text-xs tracking-wide transition shadow-md shadow-rose-950/10 hover:scale-[1.01]"
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
          className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-lg"
        >
          {/* High-visibility header */}
          <div className="bg-gradient-to-tr from-rose-700 to-pink-600 px-6 py-6 text-white flex justify-between items-center">
            <div>
              <span className="block text-[10px] font-bold text-rose-200 uppercase tracking-widest mb-1">Emergency Profile</span>
              <h3 className="font-display text-xl font-bold tracking-tight">{emergencyProfile.name}</h3>
              <span className="block text-[10px] text-rose-100 font-mono mt-0.5">ID: {emergencyProfile.patientId}</span>
            </div>
            <Heart className="w-8 h-8 text-white animate-pulse" />
          </div>

          <div className="p-6 space-y-6 divide-y divide-slate-50">
            {/* Critical Metrics: Blood Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
              <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 flex flex-col justify-between">
                <span className="block text-[9px] font-bold text-rose-700 uppercase tracking-widest mb-1.5">Critical Blood Type</span>
                <span className="text-3xl font-display font-black text-rose-600">{emergencyProfile.bloodGroup || 'Awaiting Input'}</span>
                <span className="text-[9px] text-rose-500/80 mt-2 block leading-normal">
                  Always verify patient blood status physically prior to active operations.
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Allergy Matrix</span>
                  <p className="font-bold text-rose-600 text-sm mt-0.5">
                    {emergencyProfile.allergies || 'None declared'}
                  </p>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Chronic Conditions</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {emergencyProfile.chronicDiseases || 'None declared'}
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="pt-6 space-y-4">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Emergency Guardian</span>
              
              {emergencyProfile.emergencyContactName ? (
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-slate-800 text-xs block leading-tight">{emergencyProfile.emergencyContactName}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{emergencyProfile.emergencyContactRelation}</span>
                  </div>
                  <a 
                    href={`tel:${emergencyProfile.emergencyContactPhone}`}
                    className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-teal-500/30 text-teal-600 font-bold px-3.5 py-1.5 rounded-xl text-xs transition shrink-0 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Contact
                  </a>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center text-xs text-slate-400 italic">
                  No emergency guardian contacts are set for this patient.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-12 text-center text-slate-400 flex flex-col items-center justify-center shadow-inner">
          <AlertTriangle className="w-10 h-10 text-slate-200 mb-3" />
          <h4 className="font-display font-bold text-sm text-slate-600">Awaiting Search Query</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            Enter the patient's unique physical registry key above to pull clinical vitals.
          </p>
        </div>
      )}

    </div>
  );
}
