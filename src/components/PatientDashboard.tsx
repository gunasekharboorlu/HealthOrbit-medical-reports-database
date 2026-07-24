import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Shield, ShieldAlert, FileText, Plus, Trash2, Download, 
  CheckCircle, XCircle, FileUp, Key, Calendar, Mail, Heart, Sparkles, 
  Clock, ShieldCheck, HelpCircle, Edit3, X, Activity, Info, Copy, Check,
  Search, Filter, Bell, Sliders, ArrowRight, Lock, Unlock, LogOut
} from 'lucide-react';
import { MedicalRecord, Patient, Notification as NotificationType } from '../types';
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';

interface PatientDashboardProps {
  patientData: any;
  uploadTitle: string;
  setUploadTitle: (val: string) => void;
  uploadCategory: 'Lab Report' | 'Prescription' | 'Scan' | 'Discharge Summary' | 'Other';
  setUploadCategory: (val: any) => void;
  uploadDesc: string;
  setUploadDesc: (val: string) => void;
  uploadIsSensitive: boolean;
  setUploadIsSensitive: (val: boolean) => void;
  uploadFile: { name: string; size: string; content: string } | null;
  duplicateWarning: string | null;
  editDob: string;
  setEditDob: (val: string) => void;
  editGender: string;
  setEditGender: (val: string) => void;
  editBlood: string;
  setEditBlood: (val: string) => void;
  editAllergies: string;
  setEditAllergies: (val: string) => void;
  editDiseases: string;
  setEditDiseases: (val: string) => void;
  editContactName: string;
  setEditContactName: (val: string) => void;
  editContactPhone: string;
  setEditContactPhone: (val: string) => void;
  editContactRelation: string;
  setEditContactRelation: (val: string) => void;
  isEditingProfile: boolean;
  setIsEditingProfile: (val: boolean) => void;
  handleUpdateProfile: (e: React.FormEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadRecord: (e: React.FormEvent) => void;
  handleDeleteRecord: (id: string) => void;
  handleRespondAccess: (id: string, status: 'approved' | 'rejected') => void;
  downloadFile: (fileName: string, base64Content: string) => void;
  currentUser?: any;
  unreadCount?: number;
  notifications?: NotificationType[];
  handleMarkRead?: (id: string) => void;
  handleMarkAllRead?: () => void;
  handleLogout?: () => void;
}

export default function PatientDashboard({
  patientData,
  uploadTitle,
  setUploadTitle,
  uploadCategory,
  setUploadCategory,
  uploadDesc,
  setUploadDesc,
  uploadIsSensitive,
  setUploadIsSensitive,
  uploadFile,
  duplicateWarning,
  editDob,
  setEditDob,
  editGender,
  setEditGender,
  editBlood,
  setEditBlood,
  editAllergies,
  setEditAllergies,
  editDiseases,
  setEditDiseases,
  editContactName,
  setEditContactName,
  editContactPhone,
  setEditContactPhone,
  editContactRelation,
  setEditContactRelation,
  isEditingProfile,
  setIsEditingProfile,
  handleUpdateProfile,
  handleFileChange,
  handleUploadRecord,
  handleDeleteRecord,
  handleRespondAccess,
  downloadFile,
  currentUser,
  unreadCount = 0,
  notifications = [],
  handleMarkRead,
  handleMarkAllRead,
  handleLogout,
}: PatientDashboardProps) {
  if (!patientData) return null;

  const { patient, records, pendingRequests, accessHistory } = patientData;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Filters for Medical Records tab
  const [recordSearch, setRecordSearch] = useState('');
  const [recordCategoryFilter, setRecordCategoryFilter] = useState('All');

  // Copy Patient ID helper
  const copyPatientId = () => {
    navigator.clipboard.writeText(patient.patientId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sorted records by date descending
  const sortedRecords = [...(records || [])].sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Filtered records for the Records tab
  const filteredRecords = sortedRecords.filter((rec: any) => {
    const matchesCategory = recordCategoryFilter === 'All' || rec.category === recordCategoryFilter;
    const matchesSearch = rec.title.toLowerCase().includes(recordSearch.toLowerCase()) || 
                          (rec.description || '').toLowerCase().includes(recordSearch.toLowerCase()) ||
                          (rec.fileName || '').toLowerCase().includes(recordSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Analytics
  const totalReports = records?.length || 0;
  const sensitiveReports = records?.filter((r: any) => r.isSensitive).length || 0;
  const verifiedReports = records?.filter((r: any) => r.trustBadge === 'verified_hospital').length || 0;

  const tabLabels: Record<string, string> = {
    dashboard: 'Dashboard Overview',
    records: 'Medical Records Library',
    upload: 'Upload Record',
    timeline: 'Clinical Health Timeline',
    emergency: 'Emergency Card',
    requests: 'Clearance Access Requests',
    notifications: 'Notifications Center',
    profile: 'Patient Profile & Vitals',
    settings: 'Portal Settings',
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex">
      
      {/* Sidebar Navigation */}
      <Sidebar
        role="patient"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser || { name: patientData.name || 'Patient', role: 'patient' }}
        unreadNotificationsCount={unreadCount}
        pendingRequestsCount={pendingRequests?.length || 0}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        handleLogout={handleLogout}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* Top Header / Breadcrumb Bar */}
        <div className="sticky top-16 z-20 bg-[#020617]/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 border border-white/10"
            >
              <Activity className="w-5 h-5 text-[#38bdf8]" />
            </button>
            <Breadcrumbs
              portalName="Patient Portal"
              activeTab={activeTab}
              tabLabel={tabLabels[activeTab]}
              onNavigateHome={() => setActiveTab('dashboard')}
            />
          </div>

          <div className="flex items-center gap-3">
            {activeTab !== 'upload' && (
              <button
                onClick={() => setActiveTab('upload')}
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-[#38bdf8] to-[#4f8cff] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-[#38bdf8]/20 hover:opacity-95 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Upload Record
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Tab Content */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          
          {/* TAB 1: DASHBOARD (Summary view only) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Welcome Banner */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-8 bg-gradient-to-tr from-[#0a0f2b] to-[#0f173b] border border-white/10 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-[#4f8cff] opacity-10 blur-3xl pointer-events-none animate-pulse-slow" />
                  
                  <div className="space-y-3 relative z-10">
                    <span className="inline-flex items-center gap-1.5 bg-[#4f8cff]/10 border border-[#4f8cff]/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#5da9ff]">
                      <Sparkles className="w-3.5 h-3.5" /> HealthOrbit Patient Vault
                    </span>
                    <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                      Welcome Back, <span className="bg-gradient-to-r from-white via-[#86b0ff] to-[#5da9ff] bg-clip-text text-transparent">{patientData.name || 'Patient'}</span>
                    </h2>
                    <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                      Your clinical ledger is synchronized. Manage records, monitor doctor access requests, and access your digital emergency card.
                    </p>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/5 pt-5 relative z-10">
                    <div className="space-y-1">
                      <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">Blood Group</span>
                      <span className="text-sm font-black text-teal-400 font-mono">{patient.bloodGroup || 'Not spec'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">Gender</span>
                      <span className="text-sm font-bold text-slate-200">{patient.gender || 'Not spec'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">Birth Date</span>
                      <span className="text-sm font-semibold text-slate-200">
                        {patient.dob ? new Date(patient.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not spec'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Digital Registry ID Card */}
                <motion.div 
                  whileHover={{ y: -4, borderColor: "rgba(79,140,255,0.4)" }}
                  className="lg:col-span-4 bg-gradient-to-br from-[#1b1c3d]/90 via-[#0d0e2c]/95 to-[#12133a]/90 border border-[#4f8cff]/25 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between shadow-[0_15px_30px_rgba(0,0,0,0.4)] transition-all duration-300"
                >
                  <div className="absolute top-6 right-6 h-9 w-11 rounded-lg bg-gradient-to-br from-amber-400/20 to-amber-500/10 border border-amber-400/30 flex items-center justify-center shadow-inner">
                    <Key className="w-4.5 h-4.5 text-amber-300 animate-pulse" />
                  </div>

                  <div className="space-y-1 text-left">
                    <span className="font-display text-[9px] font-black tracking-widest text-teal-300 uppercase font-mono">
                      Universal Registry ID
                    </span>
                    <span className="block text-2xl font-mono font-black tracking-tight text-white select-all">
                      {patient.patientId}
                    </span>
                    <p className="text-[10px] text-slate-300 leading-relaxed pt-2">
                      Provide this registry key to doctors to grant clearance for locked medical records.
                    </p>
                  </div>

                  <button 
                    onClick={copyPatientId}
                    className="w-full mt-6 premium-btn-secondary text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-300" />
                        <span>Copy Patient ID</span>
                      </>
                    )}
                  </button>
                </motion.div>
              </div>

              {/* Quick Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div 
                  onClick={() => setActiveTab('records')}
                  className="glass-card rounded-2xl p-4 border border-white/5 hover:border-[#38bdf8]/30 transition-all cursor-pointer space-y-1"
                >
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Reports</span>
                  <span className="text-2xl font-display font-black text-white font-mono block">{totalReports}</span>
                  <span className="text-[9px] text-[#38bdf8] flex items-center gap-1 font-semibold">View library <ArrowRight className="w-3 h-3" /></span>
                </div>

                <div 
                  onClick={() => setActiveTab('records')}
                  className="glass-card rounded-2xl p-4 border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer space-y-1"
                >
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Privacy Locked</span>
                  <span className="text-2xl font-display font-black text-amber-400 font-mono block">{sensitiveReports}</span>
                  <span className="text-[9px] text-amber-300 flex items-center gap-1 font-semibold">Protected records</span>
                </div>

                <div 
                  onClick={() => setActiveTab('records')}
                  className="glass-card rounded-2xl p-4 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer space-y-1"
                >
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Clinic Verified</span>
                  <span className="text-2xl font-display font-black text-emerald-400 font-mono block">{verifiedReports}</span>
                  <span className="text-[9px] text-emerald-300 flex items-center gap-1 font-semibold">Hospital certified</span>
                </div>

                <div 
                  onClick={() => setActiveTab('requests')}
                  className="glass-card rounded-2xl p-4 border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer space-y-1"
                >
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Pending Requests</span>
                  <span className="text-2xl font-display font-black text-rose-400 font-mono block">{pendingRequests?.length || 0}</span>
                  <span className="text-[9px] text-rose-300 flex items-center gap-1 font-semibold">Review clearances <ArrowRight className="w-3 h-3" /></span>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab('upload')}
                  className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-[#38bdf8]/10 to-[#4f8cff]/10 border border-[#38bdf8]/20 rounded-2xl text-left hover:bg-[#38bdf8]/20 transition cursor-pointer"
                >
                  <FileUp className="w-5 h-5 text-[#38bdf8] shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-white">Upload Record</span>
                    <span className="text-[9px] text-slate-400 font-mono">Add report to vault</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('emergency')}
                  className="flex items-center gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-left hover:bg-rose-500/20 transition cursor-pointer"
                >
                  <Heart className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-white">Emergency Card</span>
                    <span className="text-[9px] text-rose-300 font-mono">View EMT vitals</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('timeline')}
                  className="flex items-center gap-3 p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-left hover:bg-purple-500/20 transition cursor-pointer"
                >
                  <Activity className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-white">Clinical Timeline</span>
                    <span className="text-[9px] text-purple-300 font-mono">Chronological history</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('requests')}
                  className="flex items-center gap-3 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-left hover:bg-amber-500/20 transition cursor-pointer"
                >
                  <Key className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-white">Access Requests</span>
                    <span className="text-[9px] text-amber-300 font-mono">Doctor clearances</span>
                  </div>
                </button>
              </div>

              {/* Pending Requests Alert Summary */}
              {pendingRequests && pendingRequests.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Doctor Access Clearance Pending ({pendingRequests.length})</h3>
                    </div>
                    <button onClick={() => setActiveTab('requests')} className="text-xs font-bold text-rose-400 hover:underline">
                      Manage All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingRequests.slice(0, 2).map((req: any) => (
                      <div key={req.id} className="bg-[#0c0d24]/90 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between gap-3">
                        <div>
                          <span className="block font-bold text-xs text-white">Dr. {req.doctorName}</span>
                          <span className="block text-[10px] text-slate-400">{req.doctorSpecialization} • "{req.recordTitle}"</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleRespondAccess(req.id, 'approved')} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 cursor-pointer">
                            Grant
                          </button>
                          <button onClick={() => handleRespondAccess(req.id, 'rejected')} className="px-3 py-1.5 bg-white/10 text-rose-300 rounded-lg text-xs font-bold hover:bg-white/20 cursor-pointer">
                            Deny
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity Stream */}
              <div className="glass-card border border-white/5 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#38bdf8]" /> Recent Vault Activity
                  </h3>
                  <button onClick={() => setActiveTab('records')} className="text-xs font-bold text-[#38bdf8] hover:underline flex items-center gap-1">
                    View All Records <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {sortedRecords.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No medical records uploaded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {sortedRecords.slice(0, 3).map((rec: MedicalRecord) => (
                      <div key={rec.id} className="p-3.5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-[#38bdf8]/10 text-[#38bdf8] rounded-xl shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{rec.title}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">{rec.category} • {rec.fileName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(rec.createdAt).toLocaleDateString()}
                          </span>
                          <button onClick={() => downloadFile(rec.fileName, rec.fileContent)} className="p-1.5 text-slate-400 hover:text-white bg-white/5 rounded-lg border border-white/10">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: MEDICAL RECORDS LIBRARY */}
          {activeTab === 'records' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Medical Records Library</h2>
                  <p className="text-xs text-slate-400">Search, filter, and inspect your uploaded clinical reports.</p>
                </div>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="bg-gradient-to-r from-[#38bdf8] to-[#4f8cff] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:opacity-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Record
                </button>
              </div>

              {/* Search & Category Filter Toolbar */}
              <div className="glass-card border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={recordSearch}
                    onChange={e => setRecordSearch(e.target.value)}
                    placeholder="Search reports by title..."
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#38bdf8]"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                  {['All', 'Lab Report', 'Prescription', 'Scan', 'Discharge Summary', 'Other'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setRecordCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer shrink-0 ${
                        recordCategoryFilter === cat
                          ? 'bg-[#38bdf8] text-slate-950 shadow-md'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Records List */}
              {filteredRecords.length === 0 ? (
                <div className="glass-card border border-white/5 rounded-3xl p-16 text-center space-y-4">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="font-bold text-sm text-white">No Matching Medical Records Found</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">Try clearing search parameters or upload a new record.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRecords.map((rec: MedicalRecord) => (
                    <div key={rec.id} className="glass-card border border-white/5 hover:border-[#38bdf8]/30 rounded-2xl p-5 space-y-4 transition">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1.5">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20">
                            {rec.category}
                          </span>
                          <h4 className="font-display font-bold text-white text-base leading-snug">{rec.title}</h4>
                        </div>
                        {rec.isSensitive && (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Sensitive
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{rec.description || 'No description notes provided.'}</p>

                      <div className="flex items-center justify-between border-t border-white/5 pt-3.5">
                        <span className="text-[10px] text-slate-400 font-mono">{rec.fileName} ({rec.fileSize})</span>
                        <div className="flex gap-2">
                          <button onClick={() => downloadFile(rec.fileName, rec.fileContent)} className="p-2 text-slate-300 hover:text-white bg-white/5 rounded-xl border border-white/10">
                            <Download className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteRecord(rec.id)} className="p-2 text-slate-300 hover:text-rose-400 bg-white/5 rounded-xl border border-white/10">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: UPLOAD RECORD */}
          {activeTab === 'upload' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-display font-bold text-white">Upload Timeline Record</h2>
                <p className="text-xs text-slate-400">Ingest certified diagnostic logs or prescriptions into your vault.</p>
              </div>

              <div className="glass-card border border-white/10 rounded-3xl p-6 space-y-5 shadow-lg">
                <form onSubmit={handleUploadRecord} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Document Title</label>
                    <input 
                      type="text" 
                      required 
                      value={uploadTitle} 
                      onChange={e => setUploadTitle(e.target.value)} 
                      placeholder="e.g. LabCorp Blood Panel" 
                      className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs font-semibold outline-none text-white placeholder-slate-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Category Type</label>
                    <select 
                      value={uploadCategory} 
                      onChange={e => setUploadCategory(e.target.value as any)} 
                      className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs font-semibold outline-none text-white cursor-pointer"
                    >
                      <option className="bg-[#050816]">Lab Report</option>
                      <option className="bg-[#050816]">Prescription</option>
                      <option className="bg-[#050816]">Scan</option>
                      <option className="bg-[#050816]">Discharge Summary</option>
                      <option className="bg-[#050816]">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Physician/Document Notes</label>
                    <textarea 
                      value={uploadDesc} 
                      onChange={e => setUploadDesc(e.target.value)} 
                      placeholder="e.g. Annual lipid panel notes." 
                      rows={3} 
                      className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs font-semibold outline-none resize-none text-white placeholder-slate-500" 
                    />
                  </div>

                  <div className="bg-slate-950/60 border border-white/5 p-3.5 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-white flex items-center gap-1.5 font-mono">
                        <ShieldAlert className="w-4 h-4 text-amber-500" /> Apply Sensitive Lock
                      </span>
                      <p className="text-[9px] text-slate-400 mt-1">Requires manual patient authorization before doctors can inspect.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={uploadIsSensitive} 
                      onChange={e => setUploadIsSensitive(e.target.checked)} 
                      className="w-5 h-5 text-teal-600 focus:ring-teal-500 rounded border-white/10 bg-[#090d23] cursor-pointer" 
                    />
                  </div>

                  <div className="border border-dashed border-white/10 hover:border-[#38bdf8] rounded-2xl p-6 text-center cursor-pointer hover:bg-[#38bdf8]/5 transition relative">
                    <input 
                      type="file" 
                      required 
                      accept="image/*,application/pdf" 
                      onChange={handleFileChange} 
                      className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                    />
                    <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <span className="block text-xs font-bold text-white">
                      {uploadFile ? uploadFile.name : 'Choose file or drag here'}
                    </span>
                    <span className="block text-[9px] text-slate-400 font-mono uppercase mt-1">
                      {uploadFile ? uploadFile.size : 'PDF, PNG, JPG up to 10MB'}
                    </span>
                  </div>

                  {duplicateWarning && (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-[10px] font-bold text-amber-400 font-mono">
                      ⚠️ {duplicateWarning}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-[#38bdf8] to-[#4f8cff] text-white shadow-lg font-bold py-3.5 rounded-xl text-xs tracking-wide transition hover:opacity-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Ingest Report to Vault
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: MEDICAL TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-display font-bold text-white">Clinical Medical Timeline</h2>
                <p className="text-xs text-slate-400">Chronological history of your medical ledger.</p>
              </div>

              {sortedRecords.length === 0 ? (
                <div className="glass-card border border-white/5 rounded-3xl p-16 text-center space-y-3">
                  <Activity className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-400">No medical records uploaded yet.</p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 border-l border-white/10 py-2 ml-4">
                  {sortedRecords.map((rec: MedicalRecord) => (
                    <div key={rec.id} className="relative group">
                      <div className="absolute left-[-31px] top-4.5 h-3.5 w-3.5 rounded-full bg-[#050816] border-[3px] border-[#38bdf8] z-10" />
                      <div className="glass-card border border-white/5 rounded-2xl p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded">
                            {rec.category}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{new Date(rec.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-white text-sm">{rec.title}</h4>
                        <p className="text-xs text-slate-300">{rec.description || 'No notes.'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: EMERGENCY CARD */}
          {activeTab === 'emergency' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-display font-bold text-white">Digital Emergency ID Card</h2>
                <p className="text-xs text-slate-400">Emergency Vitals immediately accessible by First Responders (EMTs).</p>
              </div>

              <div className="glass-card border border-rose-500/20 rounded-3xl p-6 space-y-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-500/15 border border-rose-500/25 rounded-2xl text-rose-400">
                      <ShieldAlert className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-white">{patientData.name}</h3>
                      <span className="text-[10px] font-mono font-bold text-rose-300 uppercase">Emergency Rescue ID: {patient.patientId}</span>
                    </div>
                  </div>
                  <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300">
                    {isEditingProfile ? 'Cancel' : 'Edit Vitals'}
                  </button>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Severe Allergies</label>
                      <input type="text" value={editAllergies} onChange={e => setEditAllergies(e.target.value)} placeholder="e.g. Penicillin" className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Chronic Diseases</label>
                      <input type="text" value={editDiseases} onChange={e => setEditDiseases(e.target.value)} placeholder="e.g. Asthma" className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs text-white outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Guardian Name" value={editContactName} onChange={e => setEditContactName(e.target.value)} className="px-3.5 py-2.5 rounded-xl premium-input text-xs text-white outline-none" />
                      <input type="text" placeholder="Guardian Phone" value={editContactPhone} onChange={e => setEditContactPhone(e.target.value)} className="px-3.5 py-2.5 rounded-xl premium-input text-xs text-white outline-none" />
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs hover:bg-emerald-500 cursor-pointer">
                      Save Vitals
                    </button>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/60 border border-white/5 p-4 rounded-2xl space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">Blood Group</span>
                      <span className="text-xl font-bold text-teal-400 font-mono block">{patient.bloodGroup || 'Not specified'}</span>
                    </div>
                    <div className="bg-slate-950/60 border border-white/5 p-4 rounded-2xl space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">Severe Allergies</span>
                      <span className="text-sm font-bold text-rose-400 block">{patient.allergies || 'None declared'}</span>
                    </div>
                    <div className="bg-slate-950/60 border border-white/5 p-4 rounded-2xl space-y-1 col-span-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">Chronic Conditions</span>
                      <span className="text-sm font-bold text-white block">{patient.chronicDiseases || 'None declared'}</span>
                    </div>
                    <div className="bg-slate-950/60 border border-white/5 p-4 rounded-2xl space-y-1 col-span-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">Emergency Contact Guardian</span>
                      <span className="text-sm font-bold text-white block">{patient.emergencyContactName || 'Not set'} ({patient.emergencyContactRelation || 'N/A'})</span>
                      <span className="text-xs text-[#38bdf8] font-mono font-bold block">{patient.emergencyContactPhone || 'N/A'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: ACCESS REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-display font-bold text-white">Physician Access Clearances</h2>
                <p className="text-xs text-slate-400">Review pending doctor clearance requests and audit authorization history.</p>
              </div>

              {/* Pending Requests */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Pending Doctor Requests</h3>
                {!pendingRequests || pendingRequests.length === 0 ? (
                  <div className="glass-card border border-white/5 rounded-2xl p-8 text-center text-slate-400 text-xs">
                    No pending clearance requests.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingRequests.map((req: any) => (
                      <div key={req.id} className="glass-card border border-rose-500/20 rounded-2xl p-5 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm text-white">Dr. {req.doctorName}</h4>
                            <span className="text-[10px] text-slate-400">{req.doctorSpecialization} • {req.hospitalName}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300">Requested access to: <strong>"{req.recordTitle}"</strong></p>
                        <div className="flex gap-3 pt-2">
                          <button onClick={() => handleRespondAccess(req.id, 'approved')} className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-emerald-500 cursor-pointer">
                            Grant Clearance
                          </button>
                          <button onClick={() => handleRespondAccess(req.id, 'rejected')} className="flex-1 bg-white/10 text-rose-400 font-bold py-2 rounded-xl text-xs hover:bg-white/20 cursor-pointer">
                            Deny
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Notifications Center</h2>
                  <p className="text-xs text-slate-400">System updates and clearance notifications.</p>
                </div>
                {handleMarkAllRead && unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs font-bold text-[#38bdf8] hover:underline">
                    Mark all as read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="glass-card border border-white/5 rounded-2xl p-12 text-center text-slate-400 text-xs">
                  No notifications yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => !n.read && handleMarkRead && handleMarkRead(n.id)}
                      className={`glass-card border border-white/5 rounded-2xl p-4 transition ${!n.read ? 'border-l-4 border-l-[#38bdf8] bg-[#38bdf8]/5' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-xs text-white">{n.title}</h4>
                        <span className="text-[9px] text-slate-500 font-mono">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-300">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-display font-bold text-white">Patient Profile & Vitals</h2>
                <p className="text-xs text-slate-400">Manage your medical baseline information.</p>
              </div>

              <div className="glass-card border border-white/5 rounded-3xl p-6 space-y-5">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">Birth Date</label>
                      <input type="date" value={editDob} onChange={e => setEditDob(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">Blood Group</label>
                      <input type="text" value={editBlood} onChange={e => setEditBlood(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs text-white outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">Severe Allergies</label>
                    <input type="text" value={editAllergies} onChange={e => setEditAllergies(e.target.value)} placeholder="e.g. Penicillin" className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs text-white outline-none" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">Chronic Conditions</label>
                    <input type="text" value={editDiseases} onChange={e => setEditDiseases(e.target.value)} placeholder="e.g. Asthma" className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs text-white outline-none" />
                  </div>

                  <button type="submit" className="w-full bg-[#38bdf8] text-slate-950 font-bold py-3 rounded-xl text-xs hover:opacity-95 cursor-pointer">
                    Update Profile
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-display font-bold text-white">Portal Settings</h2>
                <p className="text-xs text-slate-400">Security preferences and data management.</p>
              </div>

              <div className="glass-card border border-white/5 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <span className="block font-bold text-xs text-white">Data Privacy Encryption</span>
                    <span className="text-[10px] text-slate-400">SHA-256 integrity verification is active on all uploads.</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">ACTIVE</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="block font-bold text-xs text-white">Automatic Token Session Expiration</span>
                    <span className="text-[10px] text-slate-400">Auto-flushes access credentials after 24 hours.</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">ENABLED</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
