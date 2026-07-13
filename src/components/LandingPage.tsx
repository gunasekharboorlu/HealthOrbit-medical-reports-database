import React from 'react';
import { motion } from 'motion/react';
import { 
  Activity, Shield, BadgeCheck, Heart, ArrowRight, Sparkles, 
  ShieldAlert, FileText, Lock, CheckCircle2, Zap, Users, 
  Database, RefreshCw, Key, ChevronRight, Stethoscope
} from 'lucide-react';

interface LandingPageProps {
  setView: (view: any) => void;
  setAuthRole: (role: any) => void;
}

export default function LandingPage({ setView, setAuthRole }: LandingPageProps) {
  // Animation presets
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  const floatVariants = {
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseGlow = {
    animate: {
      opacity: [0.4, 0.8, 0.4],
      scale: [1, 1.05, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="space-y-32 relative overflow-hidden pb-16">
      
      {/* Background Decorative Ambient Flares */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-[#38bdf8]/8 to-[#22d3ee]/4 rounded-full blur-[160px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-[40%] left-[-15%] w-[500px] h-[500px] bg-gradient-to-tr from-[#22d3ee]/6 to-[#38bdf8]/4 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8 sm:pt-16 relative z-10"
      >
        
        {/* Left column: High-impact copy */}
        <div className="lg:col-span-7 space-y-8 text-left">
          
          {/* Sparkle Tag */}
          <motion.div variants={itemVariants} className="inline-flex">
            <div className="inline-flex items-center gap-2 bg-[#38bdf8]/10 border border-[#38bdf8]/20 px-4 py-1.5 rounded-full text-xs font-bold text-[#38bdf8] tracking-wide uppercase shadow-lg backdrop-blur-md">
              <Sparkles className="w-4.5 h-4.5 text-[#38bdf8] animate-pulse" />
              <span className="font-mono">Next-Gen Interoperable Health Protocol</span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={itemVariants} className="font-display text-4xl sm:text-6.5xl font-black text-white tracking-tight leading-[1.08]">
            Your Certified Medical Timeline. <br/>
            <span className="bg-gradient-to-r from-[#38bdf8] via-[#22d3ee] to-[#14f195] bg-clip-text text-transparent">
              Decentralized & Patient-Owned.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
            HealthOrbit dismantles fragmented medical silos. Securely compile certified diagnostics, govern access locks with cryptographic permission keys, and authorize doctors instantly across any network clinic.
          </motion.p>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button 
              onClick={() => { setAuthRole('patient'); setView('register'); }} 
              className="w-full sm:w-auto relative overflow-hidden group bg-gradient-to-r from-[#38bdf8] to-[#22d3ee] text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(56,189,248,0.5)] px-8 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2 font-black">
                Initialize Patient Vault
                <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#22d3ee] to-[#14f195] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
            
            <button 
              onClick={() => { setAuthRole('doctor'); setView('login'); }} 
              className="w-full sm:w-auto bg-[#0c1425]/80 hover:bg-[#12203b] text-white border border-white/10 hover:border-white/20 shadow-md px-8 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <Stethoscope className="w-4.5 h-4.5 text-[#38bdf8]" />
              Practitioner Entry
            </button>
          </motion.div>

          {/* Core Feature Badges */}
          <motion.div variants={itemVariants} className="pt-6 border-t border-white/5 flex flex-wrap gap-x-6 gap-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Shield className="w-4.5 h-4.5 text-[#38bdf8]" />
              <span>Zero-Knowledge Locks</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <BadgeCheck className="w-4.5 h-4.5 text-emerald-400" />
              <span>Accredited Clinic Stamps</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <RefreshCw className="w-4.5 h-4.5 text-[#22d3ee]" />
              <span>Real-Time Ingestion</span>
            </div>
          </motion.div>

        </div>

        {/* Right column: Futuristic Healthcare Illustration (SVG styled dynamically) */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-5 flex justify-center items-center relative"
        >
          {/* Outer Rotating Halo ring */}
          <div className="absolute w-[360px] h-[360px] rounded-full border border-[#38bdf8]/15 border-dashed animate-[spin_24s_infinite_linear]" />
          <div className="absolute w-[440px] h-[440px] rounded-full border border-cyan-500/10 pointer-events-none" />

          {/* Floating interactive card canvas */}
          <motion.div 
            variants={floatVariants}
            animate="animate"
            className="w-full max-w-[380px] bg-[#0c1425]/50 backdrop-blur-2xl rounded-[32px] p-6 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6 relative"
          >
            {/* Glowing node connections lines */}
            <div className="absolute top-0 left-12 w-[1px] h-full bg-gradient-to-b from-transparent via-[#38bdf8]/20 to-transparent" />
            
            {/* Animated medical timeline preview header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#38bdf8] to-[#22d3ee] flex items-center justify-center text-slate-950">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-white">Universal Clinical ID</span>
                  <span className="block text-[9px] text-[#22d3ee] font-mono">PAT-80924039</span>
                </div>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full font-bold">Secure Online</span>
            </div>

            {/* Medical Timeline Records Preview */}
            <div className="space-y-3.5 relative">
              
              {/* Record block 1 */}
              <div className="relative pl-7 space-y-1">
                <div className="absolute left-[9px] top-1.5 h-2 w-2 rounded-full bg-[#38bdf8] ring-4 ring-[#38bdf8]/25" />
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-white">LabCorp Blood Panel</span>
                  <span className="text-slate-400 font-mono">Today, 09:14 AM</span>
                </div>
                <p className="text-[9px] text-slate-300">St. Jude General Hospital • Verified Stamp</p>
              </div>

              {/* Record block 2 (Locked sensitive file) */}
              <div className="relative pl-7 space-y-1">
                <div className="absolute left-[9px] top-1.5 h-2 w-2 rounded-full bg-purple-500 ring-4 ring-purple-500/20" />
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-white flex items-center gap-1">
                    MRI Brain Scan <Lock className="w-2.5 h-2.5 text-purple-400" />
                  </span>
                  <span className="text-slate-400 font-mono">Yesterday</span>
                </div>
                <p className="text-[9px] text-slate-300">Metropolis Medical Center • Sensitive Lock</p>
              </div>

              {/* Record block 3 */}
              <div className="relative pl-7 space-y-1">
                <div className="absolute left-[9px] top-1.5 h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-white">COVID-19 Booster Stamp</span>
                  <span className="text-slate-400 font-mono">Jul 10, 2026</span>
                </div>
                <p className="text-[9px] text-slate-300">Westcity Health • Patient Reported</p>
              </div>

            </div>

            {/* Glowing biometric health waves vector */}
            <div className="bg-[#020617]/70 rounded-2xl p-3 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                <span>Interoperable Sync Feed</span>
                <span className="text-[#38bdf8] font-bold">60 FPS</span>
              </div>
              <svg viewBox="0 0 100 25" className="w-full h-8 stroke-[#38bdf8] fill-none stroke-[1.5] overflow-visible">
                <path d="M 0,12.5 L 20,12.5 L 25,2 L 30,23 L 35,12.5 L 55,12.5 L 60,7 L 65,18 L 70,12.5 L 100,12.5" />
                <circle cx="25" cy="2" r="1.5" className="fill-white stroke-[#38bdf8]" />
                <circle cx="30" cy="23" r="1.5" className="fill-white stroke-[#38bdf8]" />
              </svg>
            </div>

          </motion.div>

        </motion.div>

      </motion.div>

      {/* Statistics board with beautiful counters */}
      <div className="relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#38bdf8]/5 to-transparent blur-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          
          <div className="glass-card rounded-2xl p-6 border border-white/5 text-center space-y-1 hover:border-[#38bdf8]/20 transition duration-300">
            <div className="text-3xl sm:text-4xl font-display font-black text-white font-mono bg-gradient-to-r from-[#38bdf8] to-white bg-clip-text text-transparent">100%</div>
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#94a3b8] font-mono">Patient Sovereignty</p>
            <p className="text-[9px] text-slate-500">You hold the unique encryption keys</p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/5 text-center space-y-1 hover:border-[#38bdf8]/20 transition duration-300">
            <div className="text-3xl sm:text-4xl font-display font-black text-white font-mono bg-gradient-to-r from-[#22d3ee] to-white bg-clip-text text-transparent">24H</div>
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#94a3b8] font-mono">Access Clearance</p>
            <p className="text-[9px] text-slate-500">Unlocks decay automatically</p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/5 text-center space-y-1 hover:border-[#38bdf8]/20 transition duration-300">
            <div className="text-3xl sm:text-4xl font-display font-black text-white font-mono bg-gradient-to-r from-emerald-400 to-white bg-clip-text text-transparent">3s</div>
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#94a3b8] font-mono">Emergency Recall</p>
            <p className="text-[9px] text-slate-500">First Responders fetch vitals instantly</p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/5 text-center space-y-1 hover:border-[#38bdf8]/20 transition duration-300">
            <div className="text-3xl sm:text-4xl font-display font-black text-white font-mono bg-gradient-to-r from-[#14f195] to-white bg-clip-text text-transparent">Zero</div>
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#94a3b8] font-mono">Central Leak Risk</p>
            <p className="text-[9px] text-slate-500">Fragmented keys prevent database breaches</p>
          </div>

        </div>
      </div>

      {/* Features bento grid */}
      <div className="space-y-12 relative z-10">
        
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#38bdf8] font-mono bg-[#38bdf8]/10 px-3 py-1 rounded-full border border-[#38bdf8]/15">
            Architectural Excellence
          </span>
          <h2 className="font-display text-2xl sm:text-4.5xl font-black text-white tracking-tight">
            Engineered For Medical Interoperability.
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Discover a cryptographic framework built to satisfy both strict patient privacy demands and urgent clinical availability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <motion.div 
            whileHover={{ y: -6, borderColor: "rgba(56,189,248,0.25)" }}
            className="glass-card rounded-[24px] p-8 space-y-6 flex flex-col justify-between transition-all duration-300 border border-white/5"
          >
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/25 flex items-center justify-center text-[#38bdf8] shadow-inner">
                <Lock className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">Granular Privacy Control</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Tag any clinical document as sensitive. Protected records are strictly locked and demand direct approval notifications before any practitioner can open them.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] font-mono font-bold text-[#38bdf8] uppercase tracking-wide">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zero-Trust Security Protocol
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            whileHover={{ y: -6, borderColor: "rgba(34,211,238,0.25)" }}
            className="glass-card rounded-[24px] p-8 space-y-6 flex flex-col justify-between transition-all duration-300 border border-white/5"
          >
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-[#22d3ee]/10 border border-[#22d3ee]/25 flex items-center justify-center text-[#22d3ee] shadow-inner">
                <BadgeCheck className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">Cryptographic Verification</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Distinguish clinic-certified diagnostics from patient self-reports. Trust badges certify that files came from authorized medical centers and verified practitioners.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] font-mono font-bold text-[#22d3ee] uppercase tracking-wide">
              <CheckCircle2 className="w-3.5 h-3.5" /> Certified Clinician Signature
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            whileHover={{ y: -6, borderColor: "rgba(239,68,68,0.25)" }}
            className="glass-card rounded-[24px] p-8 space-y-6 flex flex-col justify-between transition-all duration-300 border border-white/5"
          >
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shadow-inner">
                <Heart className="w-5.5 h-5.5 animate-pulse" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">Dynamic Emergency Summary</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Host critical lifesaving records like blood group, chronic allergies, and guardian contacts in a high-speed, unauthenticated ER portal for first responders.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wide">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> Emergency Profile Link
            </div>
          </motion.div>

        </div>

      </div>

      {/* How it works - Visual Flow Timeline */}
      <div className="space-y-16 relative z-10">
        
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#22d3ee] font-mono bg-[#22d3ee]/10 px-3 py-1 rounded-full border border-[#22d3ee]/15">
            Operational Lifecycle
          </span>
          <h2 className="font-display text-2xl sm:text-4.5xl font-black text-white tracking-tight">
            How The HealthOrbit Ecosystem Syncs.
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            A frictionless, multi-lateral system uniting patients, medical practitioners, and center administrators.
          </p>
        </div>

        {/* Dynamic timeline grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-6xl mx-auto relative">
          
          {/* Connector horizontal line for desktops */}
          <div className="hidden lg:block absolute top-[44px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-[#38bdf8]/30 via-[#22d3ee]/30 to-[#38bdf8]/30 z-0" />
          
          {/* Step 1 */}
          <div className="glass-card rounded-3xl p-6 border border-white/5 text-left space-y-4 relative z-10">
            <div className="h-14 w-14 rounded-2xl bg-[#020617]/90 border border-white/10 flex items-center justify-center text-white relative shadow-md">
              <span className="absolute top-2 right-2 text-[9px] font-mono font-extrabold text-[#38bdf8]">01</span>
              <Key className="w-6 h-6 text-[#38bdf8]" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display text-sm font-bold text-white">Deploy Digital Vault</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Register a patient account to instantly spin up a secure, blockchain-signed Patient ID containing your physical data matrix.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-card rounded-3xl p-6 border border-white/5 text-left space-y-4 relative z-10">
            <div className="h-14 w-14 rounded-2xl bg-[#020617]/90 border border-white/10 flex items-center justify-center text-white relative shadow-md">
              <span className="absolute top-2 right-2 text-[9px] font-mono font-extrabold text-[#22d3ee]">02</span>
              <Database className="w-6 h-6 text-[#22d3ee]" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display text-sm font-bold text-white">Ingest Medical Logs</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Upload scans, scripts, and reports. Tag confidential reports as "Sensitive" to restrict automated practitioner clearances.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-card rounded-3xl p-6 border border-white/5 text-left space-y-4 relative z-10">
            <div className="h-14 w-14 rounded-2xl bg-[#020617]/90 border border-white/10 flex items-center justify-center text-white relative shadow-md">
              <span className="absolute top-2 right-2 text-[9px] font-mono font-extrabold text-[#38bdf8]">03</span>
              <Users className="w-6 h-6 text-[#38bdf8]" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display text-sm font-bold text-white">Clinical Inquiries</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Doctors query your Patient ID and request cryptographic clearance keys to safely inspect specific locked reports.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="glass-card rounded-3xl p-6 border border-white/5 text-left space-y-4 relative z-10">
            <div className="h-14 w-14 rounded-2xl bg-[#090d23]/90 border border-white/10 flex items-center justify-center text-white relative shadow-md">
              <span className="absolute top-2 right-2 text-[9px] font-mono font-extrabold text-emerald-400">04</span>
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display text-sm font-bold text-white">Grant Interoperability</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Grant clearance via your dashboard. The doctor views locked reports and writes new stamped prescriptions directly into your timeline.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Emergency Fast Look Up Action Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative overflow-hidden bg-gradient-to-tr from-[#1e0a14]/60 via-[#050816]/90 to-[#0c0d23]/60 border border-rose-500/30 rounded-[32px] p-8 sm:p-12 text-white shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-8 relative z-10"
      >
        {/* Soft glowing ambient drop */}
        <div className="absolute right-0 bottom-0 h-48 w-48 rounded-full bg-rose-600/15 blur-[80px]" />
        <div className="absolute left-0 top-0 h-48 w-48 rounded-full bg-purple-600/5 blur-[80px]" />
        
        <div className="space-y-4 text-center lg:text-left relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-rose-500/15 border border-rose-500/25 px-3.5 py-1 rounded-full text-xs font-bold text-rose-300 tracking-wider uppercase font-mono">
            <ShieldAlert className="w-4.5 h-4.5 text-rose-400 animate-pulse" />
            <span>Emergency Lookup Engine</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Urgent First Responder Access Portal
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Quickly query vital medical summaries like blood type, critical allergy matrices, and emergency contacts using the patient's physical Medical ID. Instant, zero-credential access for urgent rescue situations.
          </p>
        </div>
        
        <button 
          onClick={() => setView('emergency-view')} 
          className="w-full lg:w-auto shrink-0 bg-gradient-to-r from-rose-600 to-pink-500 hover:opacity-95 text-white font-bold px-8 py-4 rounded-2xl text-xs tracking-wider uppercase transition shadow-[0_0_25px_rgba(239,68,68,0.25)] hover:shadow-[0_0_35px_rgba(239,68,68,0.4)] hover:scale-[1.03] active:scale-[0.98] relative z-10 cursor-pointer"
        >
          Launch Emergency Lookup
        </button>
      </motion.div>

    </div>
  );
}
