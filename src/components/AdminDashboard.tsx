import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, Building, ClipboardList, Shield, BadgeCheck, AlertCircle, 
  Building2, PlusCircle, Activity, User, Eye, Terminal 
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
    <div className="space-y-8 animate-fade-in">
      
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-tr from-slate-900 via-slate-950 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-teal-500 opacity-10 blur-3xl" />
        
        <div className="space-y-2">
          <span className="bg-white/10 border border-white/10 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            System Administration Console
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">System Controller</h2>
          <p className="text-xs text-slate-400">SIHRMS Universal Health Registry Network Controller</p>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Users</span>
          <span className="text-3xl font-display font-black text-slate-800">{adminData.users?.length || 0}</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Practitioners</span>
          <span className="text-3xl font-display font-black text-slate-800">{adminData.doctors?.length || 0}</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Patients</span>
          <span className="text-3xl font-display font-black text-slate-800">{adminData.patients?.length || 0}</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Partner Centers</span>
          <span className="text-3xl font-display font-black text-slate-800">{adminData.hospitals?.length || 0}</span>
        </div>
      </div>

      {/* Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Doctors list + Patients list) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Doctor Licensing Verification module */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" /> Verify Clinical Credentials
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              Review practitioner license registrations against official medical registries to verify credentials.
            </p>

            <div className="divide-y divide-slate-50">
              {adminData.doctors?.map((doc: any) => {
                const userAccount = adminData.users.find((u: any) => u.id === doc.userId);
                return (
                  <div key={doc.userId} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-800 block text-xs">Dr. {userAccount?.name || 'Unknown Doctor'}</span>
                      <span className="text-slate-400 text-[10px] block font-medium">
                        {doc.hospitalName} • <span className="font-semibold text-slate-500">{doc.specialization}</span>
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">License Registry ID: {doc.licenseNumber}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {doc.isVerified ? (
                        <>
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                            <BadgeCheck className="w-3.5 h-3.5" /> Licensed
                          </span>
                          <button 
                            onClick={() => handleVerifyDoctor(doc.userId, false)} 
                            className="border border-slate-200 hover:bg-slate-50 text-rose-600 font-bold px-3 py-1.5 rounded-xl text-[10px] transition"
                          >
                            Revoke
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" /> Review Needed
                          </span>
                          <button 
                            onClick={() => handleVerifyDoctor(doc.userId, true)} 
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-1.5 rounded-xl text-[10px] transition shadow-sm"
                          >
                            Approve License
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Patient Directory Registries */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-teal-600" /> Decentralized Patient Registry
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100">
                <thead>
                  <tr className="text-slate-400 uppercase font-black tracking-wider text-[9px] pb-3">
                    <th className="py-3 px-1">Registry ID</th>
                    <th className="py-3 px-1">Name</th>
                    <th className="py-3 px-1">Birth Date</th>
                    <th className="py-3 px-1">Blood Type</th>
                    <th className="py-3 px-1">Emergency Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-600">
                  {adminData.patients?.map((p: any) => {
                    const userAccount = adminData.users.find((u: any) => u.id === p.userId);
                    return (
                      <tr key={p.userId} className="hover:bg-slate-50/40">
                        <td className="py-3.5 px-1 font-mono font-bold text-teal-600">{p.patientId}</td>
                        <td className="py-3.5 px-1 font-bold text-slate-800">{userAccount?.name || 'Unknown'}</td>
                        <td className="py-3.5 px-1 font-medium">{p.dob || 'Not specification'}</td>
                        <td className="py-3.5 px-1 font-bold text-teal-700">{p.bloodGroup || 'Not specified'}</td>
                        <td className="py-3.5 px-1">
                          {p.isEmergencyProfileComplete ? (
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-bold text-[9px]">Active Summary</span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded font-bold text-[9px]">Awaiting Data</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right column: Register hospitals & system audit logger */}
        <div className="space-y-6">
          
          {/* Register Partner clinic */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600" /> Authorized Clinical Center
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Whitelists and registers partner clinical networks into the medical authority directory.
            </p>

            <form onSubmit={handleAddHospital} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Clinic / Hospital Name</label>
                <input 
                  type="text" 
                  required 
                  value={newHospitalName} 
                  onChange={e => setNewHospitalName(e.target.value)} 
                  placeholder="e.g. Saint Jude General Hospital" 
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-teal-500/80 transition" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mailing / Physical Address</label>
                <input 
                  type="text" 
                  required 
                  value={newHospitalAddress} 
                  onChange={e => setNewHospitalAddress(e.target.value)} 
                  placeholder="e.g. 101 Hospital Blvd, Westcity" 
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-teal-500/80 transition" 
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-bold py-3 rounded-xl text-xs tracking-wide transition shadow-sm"
              >
                Whitelist Clinical Partner
              </button>
            </form>
          </div>

          {/* Audit Trail Terminal Ledger */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-teal-600" /> Real-time Audit Trail
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              Unmodifiable ledger logging all medical uploads, lookups, and profile access requests.
            </p>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {adminData.auditLogs?.map((log: any) => (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] space-y-1">
                  <div className="flex justify-between items-center border-b border-slate-200/40 pb-1">
                    <span className="font-bold text-slate-700">{log.userName} <span className="text-[8px] text-slate-400 uppercase">({log.userRole})</span></span>
                    <span className="text-[8px] font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <span className="bg-teal-500/10 text-teal-800 font-mono px-1.5 py-0.25 rounded text-[8px] font-bold inline-block uppercase mt-1">
                    {log.action}
                  </span>
                  <p className="text-slate-500 leading-relaxed text-[10px] pt-1">{log.details}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
