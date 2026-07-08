import React from 'react';
import { motion } from 'motion/react';
import { Activity, Shield, BadgeCheck, Heart, ArrowRight, Sparkles, ShieldAlert, FileText, Lock, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  setView: (view: any) => void;
  setAuthRole: (role: any) => void;
}

export default function LandingPage({ setView, setAuthRole }: LandingPageProps) {
  return (
    <div className="py-8 sm:py-12 space-y-20">
      
      {/* Hero Section */}
      <div className="relative text-center max-w-4xl mx-auto space-y-8">
        {/* Subtle decorative glowing background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-72 w-72 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-300 opacity-15 blur-[80px]" />

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-teal-50/60 border border-teal-100 px-4 py-1.5 rounded-full text-[11px] font-bold text-teal-800 tracking-wide uppercase shadow-xs backdrop-blur-xs"
        >
          <Sparkles className="w-4 h-4 text-teal-500 animate-spin-slow" />
          <span>Interoperable Universal Medical Registry</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]"
        >
          Your Clinical Records.<br/>
          <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
            Centralized & Patient-Owned.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed"
        >
          Break down healthcare silos. Securely store certified medical reports, manage granular privacy access locks, and grant zero-knowledge clearance to doctors instantly across partner clinics.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
        >
          <button 
            onClick={() => { setAuthRole('patient'); setView('register'); }} 
            className="w-full sm:w-auto bg-gradient-to-tr from-teal-600 to-emerald-500 hover:opacity-95 text-white shadow-lg shadow-teal-600/25 px-8 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            Create Patient Profile
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => { setAuthRole('doctor'); setView('login'); }} 
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm px-8 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Doctor Portal Access
          </button>
        </motion.div>
      </div>

      {/* Interactive Feature Showcases (Bento Grid) */}
      <div className="grid md:grid-cols-3 gap-8">
        
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex flex-col justify-between"
        >
          <div>
            <div className="bg-teal-50 text-teal-600 p-3.5 rounded-2xl w-12 h-12 flex items-center justify-center mb-6 shadow-xs">
              <Shield className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-800 mb-2">Granular Privacy Control</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Tag any clinical document as sensitive. Protected records are strictly locked and demand direct approval notifications before any practitioner can open them.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-mono font-bold text-teal-600 uppercase tracking-wide">
            <Lock className="w-3.5 h-3.5" /> Zero-Trust Security Protocol
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex flex-col justify-between"
        >
          <div>
            <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl w-12 h-12 flex items-center justify-center mb-6 shadow-xs">
              <BadgeCheck className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-800 mb-2">Cryptographic Verification</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Distinguish clinic-certified diagnostics from patient self-reports. Trust badges certify that files came from authorized medical centers and verified practitioners.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wide">
            <CheckCircle className="w-3.5 h-3.5" /> Certified Clinician Signature
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex flex-col justify-between"
        >
          <div>
            <div className="bg-rose-50 text-rose-600 p-3.5 rounded-2xl w-12 h-12 flex items-center justify-center mb-6 shadow-xs">
              <Heart className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-800 mb-2">Dynamic Emergency Summary</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Host critical lifesaving records like blood group, chronic allergies, and guardian contacts in a high-speed, unauthenticated ER portal for first responders.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-mono font-bold text-rose-600 uppercase tracking-wide">
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> Emergency Profile Link
          </div>
        </motion.div>

      </div>

      {/* Emergency Fast Look Up Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative overflow-hidden bg-gradient-to-tr from-rose-950 via-slate-900 to-slate-950 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col lg:flex-row justify-between items-center gap-8 border border-rose-900/10"
      >
        {/* Subtle decorative glow */}
        <div className="absolute right-0 bottom-0 h-44 w-44 rounded-full bg-rose-600 opacity-20 blur-[60px]" />
        
        <div className="space-y-3 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 bg-rose-500/15 border border-rose-500/25 px-3.5 py-1 rounded-full text-[10px] font-bold text-rose-300 tracking-wider uppercase">
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>Emergency Access Portal</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
            Are you an Emergency Responder or Clinic Staff?
          </h3>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Quickly query vital medical summaries like blood type, critical allergy matrices, and emergency contacts using the patient's physical Medical ID. Instant, zero-credential access for urgent rescue situations.
          </p>
        </div>
        
        <button 
          onClick={() => setView('emergency-view')} 
          className="w-full lg:w-auto shrink-0 bg-gradient-to-tr from-rose-600 to-pink-500 hover:opacity-95 text-white font-bold px-7 py-3.5 rounded-xl text-xs tracking-wide transition shadow-lg shadow-rose-950/40 hover:scale-[1.02]"
        >
          Launch Emergency Lookup
        </button>
      </motion.div>

    </div>
  );
}
