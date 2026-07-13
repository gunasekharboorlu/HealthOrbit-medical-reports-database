import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, Building, ClipboardList, Shield, BadgeCheck, AlertCircle, 
  Building2, PlusCircle, Activity, User, Eye, Terminal, Sparkles, MapPin, Check, X, ShieldAlert
} from 'lucide-react';
import { AuditLog, Doctor, Patient, Hospital } from '../types';

interface AdminDashboardProps {
  adminData: any;
  newHospitalName: string;
  setNewHospitalName: (val: string) => void;
  newHospitalAddress: string;
  setNewHospitalAddress: (val: string) => void;
  handleVerifyDoctor: (userId: string, verify: boolean) => void;
  handleAddHospital: (e: React.FormEvent) => void;
}

export default function AdminDashboard({
  adminData,
  newHospitalName,
  setNewHospitalName,
  newHospitalAddress,
  setNewHospitalAddress,
  handleVerifyDoctor,
  handleAddHospital,
}: AdminDashboardProps) {
  if (!adminData) return null;

  return (
    <div id="admin-portal-root" className="space-y-8 animate-fade-in pb-10">
      
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-tr from-[#090e29] to-[#0d2240] border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#4f8cff] opacity-15 blur-3xl animate-pulse" />
        
        <div className="space-y-2.5 relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-[#4f8cff]/10 border border-[#4f8cff]/20 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-[#5da9ff] font-mono">
            <Sparkles className="w-3.5 h-3.5" /> Core Network Controller
          </span>
          <h2 className="font-display text-2xl sm:text-4.5xl font-black tracking-tight">System Controller Console</h2>
          <p className="text-xs text-slate-300">HealthOrbit Global Health Registry Network Controller & Audit Core</p>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          whileHover={{ y: -4, borderColor: "rgba(79, 140, 255, 0.35)", boxShadow: "0 10px 25px -5px rgba(79, 140, 255, 0.15)" }}
          className="glass-card border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-between h-28 transition-colors duration-300"
        >
          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Total Registry Users</span>
            <span className="text-3xl font-display font-black text-white font-mono mt-1 block">{adminData.users?.length || 0}</span>
          </div>
          <span className="text-[9px] text-[#4f8cff] font-medium">Synced blockchain nodes</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ y: -4, borderColor: "rgba(79, 140, 255, 0.35)", boxShadow: "0 10px 25px -5px rgba(79, 140, 255, 0.15)" }}
          className="glass-card border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-between h-28 transition-colors duration-300"
        >
          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Verified Practitioners</span>
            <span className="text-3xl font-display font-black text-white font-mono mt-1 block">{adminData.doctors?.length || 0}</span>
          </div>
          <span className="text-[9px] text-[#4f8cff] font-medium">Licensed clinical experts</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          whileHover={{ y: -4, borderColor: "rgba(16, 185, 129, 0.35)", boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.15)" }}
          className="glass-card border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-between h-28 transition-colors duration-300"
        >
          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Registered Patients</span>
            <span className="text-3xl font-display font-black text-white font-mono mt-1 block">{adminData.patients?.length || 0}</span>
          </div>
          <span className="text-[9px] text-emerald-400 font-medium">Confidential records profiles</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ y: -4, borderColor: "rgba(20, 184, 166, 0.35)", boxShadow: "0 10px 25px -5px rgba(20, 184, 166, 0.15)" }}
          className="glass-card border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-between h-28 transition-colors duration-300"
        >
          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Partner Medical Centers</span>
            <span className="text-3xl font-display font-black text-white font-mono mt-1 block">{adminData.hospitals?.length || 0}</span>
          </div>
          <span className="text-[9px] text-teal-400 font-medium">Whitelisted nodes</span>
        </motion.div>

      </div>

      {/* Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Doctors list + Patients list) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Doctor Licensing Verification module */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card border border-white/10 rounded-3xl p-6 shadow-xl space-y-4"
          >
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#4f8cff]" /> Verify Clinical Credentials
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              Review practitioner license registrations against official medical registries to verify credentials.
            </p>

            <div className="divide-y divide-white/5">
              {adminData.doctors?.map((doc: any, idx: number) => {
                const userAccount = adminData.users.find((u: any) => u.id === doc.userId);
                return (
                  <motion.div 
                    key={doc.userId} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <span className="font-bold text-white block text-sm">Dr. {userAccount?.name || 'Unknown Doctor'}</span>
                      <span className="text-slate-300 text-[10px] block font-medium">
                        {doc.hospitalName} • <span className="font-semibold text-slate-400">{doc.specialization}</span>
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold tracking-wider">License Registry ID: {doc.licenseNumber}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {doc.isVerified ? (
                        <>
                          <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 font-mono">
                            <BadgeCheck className="w-3.5 h-3.5" /> Licensed
                          </span>
                          <button 
                            onClick={() => handleVerifyDoctor(doc.userId, false)} 
                            className="border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer"
                          >
                            Revoke
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 animate-pulse font-mono">
                            <AlertCircle className="w-3.5 h-3.5" /> Review Needed
                          </span>
                          <button 
                            onClick={() => handleVerifyDoctor(doc.userId, true)} 
                            className="bg-gradient-to-r from-[#4f8cff] to-[#7c5cff] text-white font-bold px-4 py-1.5 rounded-xl text-[10px] transition shadow-md cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
                          >
                            Approve License
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Patient Directory Registries */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="glass-card border border-white/10 rounded-3xl p-6 shadow-xl space-y-4"
          >
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#4f8cff]" /> Decentralized Patient Registry
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-white/5">
                <thead>
                  <tr className="text-slate-400 uppercase font-bold tracking-wider text-[9px] font-mono pb-3">
                    <th className="py-3 px-2">Registry ID</th>
                    <th className="py-3 px-2">Name</th>
                    <th className="py-3 px-2">Birth Date</th>
                    <th className="py-3 px-2">Blood Type</th>
                    <th className="py-3 px-2">Emergency Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 font-medium">
                  {adminData.patients?.map((p: any, index: number) => {
                    const userAccount = adminData.users.find((u: any) => u.id === p.userId);
                    return (
                      <motion.tr 
                        key={p.userId} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25, delay: index * 0.03 }}
                        className="hover:bg-white/5 transition"
                      >
                        <td className="py-3.5 px-2 font-mono font-bold text-[#5da9ff]">{p.patientId}</td>
                        <td className="py-3.5 px-2 font-bold text-white">{userAccount?.name || 'Unknown'}</td>
                        <td className="py-3.5 px-2 text-slate-400">{p.dob || 'Not specified'}</td>
                        <td className="py-3.5 px-2 font-bold text-teal-400 font-mono">{p.bloodGroup || 'Not specified'}</td>
                        <td className="py-3.5 px-2">
                          {p.isEmergencyProfileComplete ? (
                            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold text-[9px] font-mono">Active Summary</span>
                          ) : (
                            <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-bold text-[9px] font-mono">Awaiting Data</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

        </div>

        {/* Right column: Register hospitals & system audit logger */}
        <div className="space-y-6">
          
          {/* Register Partner clinic */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card border border-white/10 rounded-3xl p-6 shadow-xl space-y-4"
          >
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#4f8cff]" /> Whitelist Medical Center
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Registers partner clinical networks into the secure authority registry directory.
            </p>

            <form onSubmit={handleAddHospital} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-mono">Hospital / Clinic Name</label>
                <input 
                  type="text" 
                  required 
                  value={newHospitalName} 
                  onChange={e => setNewHospitalName(e.target.value)} 
                  placeholder="e.g. Saint Jude General Hospital" 
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#090d23]/80 text-xs text-white outline-none focus:border-[#4f8cff] placeholder-slate-500 transition-all focus:ring-2 focus:ring-[#4f8cff]/20" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-mono">Physical Address Location</label>
                <input 
                  type="text" 
                  required 
                  value={newHospitalAddress} 
                  onChange={e => setNewHospitalAddress(e.target.value)} 
                  placeholder="e.g. 101 Hospital Blvd, Westcity" 
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#090d23]/80 text-xs text-white outline-none focus:border-[#4f8cff] placeholder-slate-500 transition-all focus:ring-2 focus:ring-[#4f8cff]/20" 
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit" 
                className="w-full bg-gradient-to-r from-[#4f8cff] to-[#7c5cff] text-white font-bold py-3 rounded-xl text-xs tracking-wide transition shadow-lg cursor-pointer hover:shadow-[#4f8cff]/25"
              >
                Whitelist Clinical Partner
              </motion.button>
            </form>
          </motion.div>

          {/* Audit Trail Terminal Ledger */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="glass-card border border-white/10 rounded-3xl p-6 shadow-xl space-y-4 bg-slate-950/40"
          >
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#4f8cff]" /> Real-time Audit Trail
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              Unmodifiable system ledger logging all record uploads, medical lookup activities, and profile access requests.
            </p>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
              {adminData.auditLogs?.map((log: any, index: number) => (
                <motion.div 
                  key={log.id} 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.4) }}
                  className="p-3 bg-[#030612]/90 border border-white/5 rounded-xl text-[10px] space-y-1 hover:border-[#4f8cff]/20 transition-all"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="font-bold text-slate-200">{log.userName} <span className="text-[8px] text-slate-500 uppercase">({log.userRole})</span></span>
                    <span className="text-[8px] font-mono text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <span className="bg-[#4f8cff]/10 text-[#5da9ff] border border-[#4f8cff]/20 font-mono px-1.5 py-0.25 rounded text-[8px] font-bold inline-block uppercase mt-1">
                    {log.action}
                  </span>
                  <p className="text-slate-400 leading-relaxed text-[10px] pt-1 font-mono">{log.details}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>

      </div>

    </div>
  );
}
