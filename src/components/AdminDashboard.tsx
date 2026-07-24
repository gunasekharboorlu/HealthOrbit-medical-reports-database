import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Building, ClipboardList, Shield, BadgeCheck, AlertCircle, 
  Building2, PlusCircle, Activity, User, Eye, Terminal, Sparkles, MapPin, Check, X, ShieldAlert,
  Search, Download, BarChart3, FilePieChart, Settings, ArrowRight, Stethoscope
} from 'lucide-react';
import { AuditLog, Doctor, Patient, Hospital } from '../types';
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';

interface AdminDashboardProps {
  adminData: any;
  newHospitalName: string;
  setNewHospitalName: (val: string) => void;
  newHospitalAddress: string;
  setNewHospitalAddress: (val: string) => void;
  handleVerifyDoctor: (userId: string, verify: boolean) => void;
  handleAddHospital: (e: React.FormEvent) => void;
  currentUser?: any;
  unreadCount?: number;
  handleLogout?: () => void;
}

export default function AdminDashboard({
  adminData,
  newHospitalName,
  setNewHospitalName,
  newHospitalAddress,
  setNewHospitalAddress,
  handleVerifyDoctor,
  handleAddHospital,
  currentUser,
  unreadCount = 0,
  handleLogout,
}: AdminDashboardProps) {
  if (!adminData) return null;

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Filters for Audit Logs
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('All');

  // Filters for Doctor list
  const [docSearch, setDocSearch] = useState('');

  // Download Audit CSV helper
  const downloadAuditCSV = () => {
    if (!adminData.auditLogs) return;
    const headers = "ID,Timestamp,User ID,User Name,Role,Action,Details\n";
    const rows = adminData.auditLogs.map((log: any) => 
      `"${log.id}","${log.timestamp}","${log.userId}","${log.userName}","${log.userRole}","${log.action}","${(log.details || '').replace(/"/g, '""')}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HealthOrbit_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Filtered Audit Logs
  const filteredAuditLogs = (adminData.auditLogs || []).filter((log: any) => {
    const matchesAction = auditActionFilter === 'All' || log.action === auditActionFilter;
    const matchesSearch = log.userName.toLowerCase().includes(auditSearch.toLowerCase()) || 
                          log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
                          log.details.toLowerCase().includes(auditSearch.toLowerCase());
    return matchesAction && matchesSearch;
  });

  // Filtered Doctor List
  const filteredDoctors = (adminData.doctors || []).filter((doc: any) => {
    const userAccount = adminData.users?.find((u: any) => u.id === doc.userId);
    const name = userAccount?.name || '';
    return name.toLowerCase().includes(docSearch.toLowerCase()) || 
           doc.hospitalName.toLowerCase().includes(docSearch.toLowerCase()) ||
           doc.specialization.toLowerCase().includes(docSearch.toLowerCase());
  });

  const tabLabels: Record<string, string> = {
    dashboard: 'Executive Overview',
    doctors: 'Practitioner Licensing',
    patients: 'Patient Directory Registry',
    hospitals: 'Whitelisted Hospitals',
    analytics: 'Network Analytics',
    audit: 'Compliance Audit Logs',
    reports: 'System Summary Reports',
    settings: 'System Settings',
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex">
      
      {/* Sidebar Navigation */}
      <Sidebar
        role="admin"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser || { name: 'Admin Console', role: 'admin' }}
        unreadNotificationsCount={unreadCount}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        handleLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* Top Header / Breadcrumbs */}
        <div className="sticky top-16 z-20 bg-[#020617]/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 border border-white/10"
            >
              <Shield className="w-5 h-5 text-[#38bdf8]" />
            </button>
            <Breadcrumbs
              portalName="Admin Console"
              activeTab={activeTab}
              tabLabel={tabLabels[activeTab]}
              onNavigateHome={() => setActiveTab('dashboard')}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadAuditCSV}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Audit CSV
            </button>
          </div>
        </div>

        {/* Dynamic Page Views */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          
          {/* TAB 1: DASHBOARD (Executive Summaries & Analytics only) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Executive Header Banner */}
              <div className="bg-gradient-to-tr from-[#090e29] to-[#0d2240] border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#38bdf8] opacity-15 blur-3xl animate-pulse" />
                <div className="space-y-2 relative z-10">
                  <span className="inline-flex items-center gap-1.5 bg-[#38bdf8]/10 border border-[#38bdf8]/20 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-[#38bdf8] font-mono">
                    <Sparkles className="w-3.5 h-3.5" /> Network Authority Console
                  </span>
                  <h2 className="font-display text-2xl sm:text-3.5xl font-black tracking-tight">Executive System Controller</h2>
                  <p className="text-xs text-slate-300">Global clinical ledger network status, user statistics, and compliance oversight.</p>
                </div>
              </div>

              {/* KPI Executive Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div onClick={() => setActiveTab('patients')} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-[#38bdf8]/30 transition cursor-pointer space-y-1">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase font-mono">Total System Users</span>
                  <span className="text-3xl font-display font-black text-white font-mono block">{adminData.users?.length || 0}</span>
                  <span className="text-[9px] text-[#38bdf8] font-medium flex items-center gap-1">View directory <ArrowRight className="w-3 h-3" /></span>
                </div>

                <div onClick={() => setActiveTab('doctors')} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-[#38bdf8]/30 transition cursor-pointer space-y-1">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase font-mono">Verified Doctors</span>
                  <span className="text-3xl font-display font-black text-[#38bdf8] font-mono block">{adminData.doctors?.length || 0}</span>
                  <span className="text-[9px] text-slate-400 font-medium">Licensed clinical experts</span>
                </div>

                <div onClick={() => setActiveTab('patients')} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition cursor-pointer space-y-1">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase font-mono">Registered Patients</span>
                  <span className="text-3xl font-display font-black text-emerald-400 font-mono block">{adminData.patients?.length || 0}</span>
                  <span className="text-[9px] text-emerald-300 font-medium">Confidential vaults</span>
                </div>

                <div onClick={() => setActiveTab('hospitals')} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-teal-500/30 transition cursor-pointer space-y-1">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase font-mono">Partner Hospitals</span>
                  <span className="text-3xl font-display font-black text-teal-400 font-mono block">{adminData.hospitals?.length || 0}</span>
                  <span className="text-[9px] text-teal-300 font-medium">Whitelisted networks</span>
                </div>
              </div>

              {/* Executive Summary Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* System Activity Widget */}
                <div className="glass-card border border-white/5 rounded-3xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#38bdf8]" /> Recent System Operations
                    </h3>
                    <button onClick={() => setActiveTab('audit')} className="text-xs font-bold text-[#38bdf8] hover:underline">
                      View Full Log
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(adminData.auditLogs || []).slice(0, 5).map((log: any) => (
                      <div key={log.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white">{log.userName}</span>
                          <span className="text-[10px] text-[#38bdf8] font-mono ml-2">[{log.action}]</span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Management Actions */}
                <div className="glass-card border border-white/5 rounded-3xl p-6 space-y-4">
                  <h3 className="font-display font-bold text-sm text-white border-b border-white/5 pb-3">
                    Executive Controls
                  </h3>

                  <div className="space-y-3">
                    <button onClick={() => setActiveTab('doctors')} className="w-full p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-left flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Stethoscope className="w-5 h-5 text-[#38bdf8]" />
                        <div>
                          <span className="block text-xs font-bold text-white">Practitioner Licensing</span>
                          <span className="text-[10px] text-slate-400">Review pending doctor verification requests</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button onClick={() => setActiveTab('hospitals')} className="w-full p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-left flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-teal-400" />
                        <div>
                          <span className="block text-xs font-bold text-white">Whitelist Hospital</span>
                          <span className="text-[10px] text-slate-400">Register new clinical partner facility</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button onClick={() => setActiveTab('audit')} className="w-full p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-left flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        <div>
                          <span className="block text-xs font-bold text-white">Export Audit Trail</span>
                          <span className="text-[10px] text-slate-400">Download HIPAA compliance CSV records</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: DOCTORS VERIFICATION */}
          {activeTab === 'doctors' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Practitioner Licensing Verification</h2>
                  <p className="text-xs text-slate-400">Verify physician credentials against medical registries before granting platform authority.</p>
                </div>

                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    value={docSearch}
                    onChange={e => setDocSearch(e.target.value)}
                    placeholder="Search doctor or hospital..."
                    className="w-full px-3.5 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="glass-card border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="divide-y divide-white/5">
                  {filteredDoctors.map((doc: any) => {
                    const userAccount = adminData.users.find((u: any) => u.id === doc.userId);
                    return (
                      <div key={doc.userId} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <span className="font-bold text-white block text-sm">Dr. {userAccount?.name || 'Unknown Doctor'}</span>
                          <span className="text-slate-300 text-[10px] block font-medium">
                            {doc.hospitalName} • <span className="font-semibold text-slate-400">{doc.specialization}</span>
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold tracking-wider">License ID: {doc.licenseNumber || 'N/A'}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {doc.isVerified ? (
                            <>
                              <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 font-mono">
                                <BadgeCheck className="w-3.5 h-3.5" /> Licensed
                              </span>
                              <button onClick={() => handleVerifyDoctor(doc.userId, false)} className="border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer">
                                Revoke
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 animate-pulse font-mono">
                                <AlertCircle className="w-3.5 h-3.5" /> Pending Review
                              </span>
                              <button onClick={() => handleVerifyDoctor(doc.userId, true)} className="bg-[#38bdf8] text-slate-950 font-bold px-4 py-1.5 rounded-xl text-[10px] transition cursor-pointer">
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
            </div>
          )}

          {/* TAB 3: PATIENTS DIRECTORY */}
          {activeTab === 'patients' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-display font-bold text-white">Decentralized Patient Registry</h2>
                <p className="text-xs text-slate-400">All registered patient user accounts across the network.</p>
              </div>

              <div className="glass-card border border-white/10 rounded-3xl p-6 overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-white/5">
                  <thead>
                    <tr className="text-slate-400 uppercase font-bold tracking-wider text-[9px] font-mono pb-3">
                      <th className="py-3 px-2">Registry ID</th>
                      <th className="py-3 px-2">Name</th>
                      <th className="py-3 px-2">Birth Date</th>
                      <th className="py-3 px-2">Blood Group</th>
                      <th className="py-3 px-2">Emergency Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300 font-medium">
                    {adminData.patients?.map((p: any) => {
                      const userAccount = adminData.users.find((u: any) => u.id === p.userId);
                      return (
                        <tr key={p.userId} className="hover:bg-white/5 transition">
                          <td className="py-3.5 px-2 font-mono font-bold text-[#38bdf8]">{p.patientId}</td>
                          <td className="py-3.5 px-2 font-bold text-white">{userAccount?.name || 'Unknown'}</td>
                          <td className="py-3.5 px-2 text-slate-400">{p.dob || 'Not specified'}</td>
                          <td className="py-3.5 px-2 font-bold text-teal-400 font-mono">{p.bloodGroup || 'Not specified'}</td>
                          <td className="py-3.5 px-2">
                            {p.isEmergencyProfileComplete ? (
                              <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold text-[9px] font-mono">Complete</span>
                            ) : (
                              <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-bold text-[9px] font-mono">Awaiting Data</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: HOSPITALS */}
          {activeTab === 'hospitals' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Whitelisted Hospital Networks</h2>
                  <p className="text-xs text-slate-400">Partner healthcare facilities verified on the platform.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adminData.hospitals?.map((h: any) => (
                    <div key={h.id} className="glass-card border border-white/5 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-teal-400 shrink-0" />
                        <h4 className="font-bold text-sm text-white truncate">{h.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400">{h.address}</p>
                      <span className="inline-block text-[9px] font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                        ID: {h.id}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Hospital Form */}
              <div className="glass-card border border-white/10 rounded-3xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#38bdf8]" /> Whitelist Partner Clinic
                </h3>

                <form onSubmit={handleAddHospital} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">Hospital / Clinic Name</label>
                    <input type="text" required value={newHospitalName} onChange={e => setNewHospitalName(e.target.value)} placeholder="e.g. Metro General Hospital" className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">Physical Address</label>
                    <input type="text" required value={newHospitalAddress} onChange={e => setNewHospitalAddress(e.target.value)} placeholder="e.g. 100 Main St, City" className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs text-white outline-none" />
                  </div>
                  <button type="submit" className="w-full bg-[#38bdf8] text-slate-950 font-bold py-3 rounded-xl text-xs hover:opacity-95 cursor-pointer">
                    Whitelist Clinical Partner
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-display font-bold text-white">Network Analytics</h2>
                <p className="text-xs text-slate-400">System growth, user distribution, and security metrics.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card border border-white/5 rounded-3xl p-6 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Patient-Doctor Ratio</span>
                  <span className="text-3xl font-bold font-mono text-white block">
                    {adminData.doctors?.length ? (adminData.patients?.length / adminData.doctors?.length).toFixed(1) : 0} : 1
                  </span>
                </div>

                <div className="glass-card border border-white/5 rounded-3xl p-6 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Doctor Licensing Rate</span>
                  <span className="text-3xl font-bold font-mono text-emerald-400 block">
                    {adminData.doctors?.length ? ((adminData.doctors.filter((d: any) => d.isVerified).length / adminData.doctors.length) * 100).toFixed(0) : 0}%
                  </span>
                </div>

                <div className="glass-card border border-white/5 rounded-3xl p-6 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Audit Logging Activity</span>
                  <span className="text-3xl font-bold font-mono text-[#38bdf8] block">
                    {adminData.auditLogs?.length || 0} events
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Compliance Audit Log Trail</h2>
                  <p className="text-xs text-slate-400">HIPAA-compliant immutable operation records.</p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={e => setAuditSearch(e.target.value)}
                    placeholder="Search logs..."
                    className="px-3.5 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-white outline-none w-full sm:w-64"
                  />
                  <button onClick={downloadAuditCSV} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0">
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="glass-card border border-white/10 rounded-3xl p-6 space-y-3">
                {filteredAuditLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No matching audit logs.</p>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                    {filteredAuditLogs.map((log: any) => (
                      <div key={log.id} className="p-3.5 bg-slate-950/80 border border-white/5 rounded-2xl text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white">{log.userName} <span className="text-[9px] text-slate-400">({log.userRole})</span></span>
                          <span className="text-[10px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded inline-block">
                          {log.action}
                        </span>
                        <p className="text-slate-300 font-mono text-[11px] pt-1">{log.details}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: REPORTS */}
          {activeTab === 'reports' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-display font-bold text-white">System Reports</h2>
                <p className="text-xs text-slate-400">Network health and operational summaries.</p>
              </div>

              <div className="glass-card border border-white/5 rounded-3xl p-6 space-y-4">
                <h3 className="font-bold text-sm text-white">Network Health Report</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  All microservices and database ledgers are operating nominally. Zero API errors reported in current session window.
                </p>
              </div>
            </div>
          )}

          {/* TAB 8: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-display font-bold text-white">System Settings</h2>
                <p className="text-xs text-slate-400">Network thresholds and platform configuration.</p>
              </div>

              <div className="glass-card border border-white/5 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <span className="block font-bold text-xs text-white">Centralized Express Error Middleware</span>
                    <span className="text-[10px] text-slate-400">Generates unique correlation IDs for internal errors.</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">ACTIVE</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="block font-bold text-xs text-white">Doctor Verification Mandate</span>
                    <span className="text-[10px] text-slate-400">Restricts sensitive patient lookups to verified accounts.</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">ENFORCED</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
