import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ShieldAlert, BadgeCheck, FileText, Download, Plus, X, 
  FilePlus, Lock, Unlock, ClipboardList, Shield, Activity, HelpCircle, User,
  Calendar, Phone, Mail, Award, Clock, ArrowLeft, RefreshCw, Trash2, Heart,
  Settings, CheckCircle, LayoutDashboard, ChevronRight, Eye, Edit3, UserCheck, 
  MapPin, BookOpen, AlertCircle, Sparkles, Building, Briefcase, FileSignature, Check,
  Key, ArrowRight, Stethoscope, Users
} from 'lucide-react';
import { MedicalRecord, Doctor } from '../types';
import { api } from '../api';
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';
import Avatar from './Avatar';

interface DoctorDashboardProps {
  doctorData: any;
  searchId: string;
  setSearchId: (val: string) => void;
  searchedPatient: any;
  diagnosis: string;
  setDiagnosis: (val: string) => void;
  medsList: { name: string; dosage: string; frequency: string; duration: string }[];
  addMedName: string;
  setAddMedName: (val: string) => void;
  addMedDosage: string;
  setAddMedDosage: (val: string) => void;
  addMedFreq: string;
  setAddMedFreq: (val: string) => void;
  addMedDur: string;
  setAddMedDur: (val: string) => void;
  handleAddMedication: (e: React.FormEvent) => void;
  handleRemoveMedication: (idx: number) => void;
  handleSearchPatient: (e: React.FormEvent) => void;
  handleRequestAccess: (recordId: string) => void;
  handleAddPrescription: (e: React.FormEvent) => void;
  docUploadTitle: string;
  setDocUploadTitle: (val: string) => void;
  docUploadCategory: 'Lab Report' | 'Prescription' | 'Scan' | 'Discharge Summary' | 'Other';
  setDocUploadCategory: (val: any) => void;
  docUploadDesc: string;
  setDocUploadDesc: (val: string) => void;
  docUploadFile: { name: string; size: string; content: string } | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDocUploadForPatient: (e: React.FormEvent) => void;
  downloadFile: (fileName: string, base64Content: string) => void;
  currentUser?: any;
  unreadCount?: number;
  handleLogout?: () => void;
}

export default function DoctorDashboard({
  doctorData,
  searchId,
  setSearchId,
  searchedPatient,
  diagnosis,
  setDiagnosis,
  medsList,
  addMedName,
  setAddMedName,
  addMedDosage,
  setAddMedDosage,
  addMedFreq,
  setAddMedFreq,
  addMedDur,
  setAddMedDur,
  handleAddMedication,
  handleRemoveMedication,
  handleSearchPatient,
  handleRequestAccess,
  handleAddPrescription,
  docUploadTitle,
  setDocUploadTitle,
  docUploadCategory,
  setDocUploadCategory,
  docUploadDesc,
  setDocUploadDesc,
  docUploadFile,
  handleFileChange,
  handleDocUploadForPatient,
  downloadFile,
  currentUser,
  unreadCount = 0,
  handleLogout,
}: DoctorDashboardProps) {
  if (!doctorData) return null;

  // Tab navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search & Patient workspace states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Record Filters inside Patient workspace
  const [recordSearch, setRecordSearch] = useState('');
  const [recordCategoryFilter, setRecordCategoryFilter] = useState('All');

  // Profile Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profName, setProfName] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [profAbout, setProfAbout] = useState('');
  const [profPic, setProfPic] = useState('');
  const [profExp, setProfExp] = useState('');
  const [profDept, setProfDept] = useState('');
  const [profSpec, setProfSpec] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Settings states
  const [notifPref, setNotifPref] = useState(true);
  const [sigPin, setSigPin] = useState('****');

  // Directory filter state
  const [dirFilter, setDirFilter] = useState('');

  // Notification Toast state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const doctor: any = doctorData.doctor;
  const stats = doctorData.stats || {
    totalPatientsViewed: 0,
    pendingAccessRequests: 0,
    approvedAccessRequests: 0,
    todayPrescriptions: 0,
    recentActivity: []
  };

  // Sync profile values
  useEffect(() => {
    if (doctor) {
      setProfName(doctor.name || '');
      setProfPhone(doctor.phone || '');
      setProfAbout(doctor.about || '');
      setProfPic(doctor.profilePicture || '');
      setProfExp(doctor.experience || '8 years');
      setProfDept(doctor.department || 'General Medicine');
      setProfSpec(doctor.specialization || 'General Practitioner');
    }
  }, [doctorData]);

  // Sync outer searchedPatient state
  useEffect(() => {
    if (searchedPatient) {
      setSelectedPatientDetails(searchedPatient);
      setSelectedPatientId(searchedPatient.patient.patientId);
    }
  }, [searchedPatient]);

  // Search Patient in Registry
  const handleGeneralSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setSearchLoading(true);
    api.searchPatientByQuery(searchQuery)
      .then(res => {
        setSearchResults(res.matchedResults || []);
        if (res.patient) {
          setSelectedPatientDetails(res);
          setSelectedPatientId(res.patient.patientId);
          setSearchId(res.patient.patientId);
          setActiveTab('details');
        } else {
          setSelectedPatientDetails(null);
          setSelectedPatientId(null);
        }
        api.logAction('PATIENT_SEARCH', `Searched registry query: "${searchQuery}"`);
      })
      .catch(err => {
        setSearchResults([]);
        setSelectedPatientDetails(null);
        setSelectedPatientId(null);
        showNotification(err.message || 'No patient matching search criteria.', 'error');
      })
      .finally(() => setSearchLoading(false));
  };

  // Select patient from directory/results
  const handleInspectPatient = (patientId: string) => {
    setSearchLoading(true);
    setSearchId(patientId);
    api.searchPatient(patientId)
      .then(res => {
        setSelectedPatientDetails(res);
        setSelectedPatientId(patientId);
        setActiveTab('details');
        api.logAction('RECORD_VIEW', `Inspected history for patient: ${patientId}`);
      })
      .catch(err => {
        showNotification(err.message || 'Could not load patient records.', 'error');
      })
      .finally(() => setSearchLoading(false));
  };

  // Request Access for sensitive record
  const handleRequestAccessLocal = (recordId: string, recordTitle: string) => {
    if (!selectedPatientId) return;
    setSearchLoading(true);
    api.requestAccess(selectedPatientId, recordId)
      .then(() => {
        showNotification('Clearance request sent! Patient will receive a permission notification.', 'success');
        api.logAction('ACCESS_REQUEST', `Requested clearance for "${recordTitle}" (${selectedPatientId})`);
        api.searchPatient(selectedPatientId).then(res => setSelectedPatientDetails(res));
      })
      .catch(err => showNotification(err.message, 'error'))
      .finally(() => setSearchLoading(false));
  };

  // Save Doctor Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    api.updateDoctorProfile({
      name: profName,
      phone: profPhone,
      about: profAbout,
      profilePicture: profPic,
      experience: profExp,
      department: profDept,
      specialization: profSpec
    })
      .then(() => {
        showNotification('Doctor profile updated successfully!', 'success');
        setIsEditingProfile(false);
        if (doctor) doctor.profilePicture = profPic;
        if (currentUser) currentUser.profilePicture = profPic;
      })
      .catch(err => showNotification(err.message, 'error'))
      .finally(() => setSaveLoading(false));
  };

  // Calculate access clearance timer
  const getAccessTimer = (respondedAt: string) => {
    if (!respondedAt) return 'Valid';
    const expiresAt = new Date(respondedAt).getTime() + 24 * 60 * 60 * 1000;
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  // Filtered Patients Directory
  const filteredPatients = (doctorData.allPatients || []).filter((p: any) => 
    p.name.toLowerCase().includes(dirFilter.toLowerCase()) || 
    p.patientId.toLowerCase().includes(dirFilter.toLowerCase()) ||
    p.phone.includes(dirFilter)
  );

  // Filtered Medical Records for selected patient
  const patientRecords = selectedPatientDetails?.records || [];
  const filteredPatientRecords = patientRecords.filter((rec: any) => {
    const matchesCategory = recordCategoryFilter === 'All' || rec.category === recordCategoryFilter;
    const matchesSearch = rec.title.toLowerCase().includes(recordSearch.toLowerCase()) || 
                          (rec.description || '').toLowerCase().includes(recordSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const tabLabels: Record<string, string> = {
    dashboard: 'Clinical Overview',
    search: 'Patient Search & Registry',
    details: 'Patient Clinical Profile',
    records: 'Patient Medical Records',
    prescriptions: 'Rx Prescriptions Engine',
    requests: 'Access Clearances',
    recent: 'Recent Patients Directory',
    profile: 'Clinician Credentials Profile',
    settings: 'Practice Settings',
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex">
      
      {/* Toast Notification Container */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md ${
              notification.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            }`}
          >
            {notification.type === 'error' ? <ShieldAlert className="w-4 h-4 text-rose-400" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
            <span className="text-xs font-bold">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-80"><X className="w-3.5 h-3.5" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <Sidebar
        role="doctor"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser || { name: doctor.name || 'Doctor', role: 'doctor' }}
        unreadNotificationsCount={unreadCount}
        pendingRequestsCount={stats.pendingAccessRequests || 0}
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
              <Stethoscope className="w-5 h-5 text-[#38bdf8]" />
            </button>
            <Breadcrumbs
              portalName="Doctor Portal"
              activeTab={activeTab}
              tabLabel={tabLabels[activeTab]}
              onNavigateHome={() => setActiveTab('dashboard')}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('search')}
              className="bg-gradient-to-r from-[#38bdf8] to-[#4f8cff] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md hover:opacity-95 transition cursor-pointer flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" /> Patient Search
            </button>
          </div>
        </div>

        {/* Dynamic Page Views */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          
          {/* TAB 1: DASHBOARD (Doctor Summary & KPIs only) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Doctor Profile Banner */}
              <div className="bg-gradient-to-tr from-[#0a0f2b] to-[#0f173b] border border-white/10 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-5">
                  <Avatar name={profName} src={profPic} size="lg" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-display font-extrabold text-white">Dr. {profName}</h2>
                      {doctor.isVerified && (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono flex items-center gap-1">
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Practitioner
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-mono">{profSpec} • {doctor.hospitalName || 'Health Center'}</p>
                    <p className="text-[10px] text-slate-400">License: {doctor.licenseNumber || 'N/A'} | Experience: {profExp}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setActiveTab('search')} className="px-4 py-2 bg-[#38bdf8] text-slate-950 rounded-xl text-xs font-bold hover:opacity-95 cursor-pointer flex items-center gap-1.5">
                    <Search className="w-4 h-4" /> Search Registry
                  </button>
                  <button onClick={() => setActiveTab('recent')} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-xl text-xs font-bold cursor-pointer">
                    Patient Directory
                  </button>
                </div>
              </div>

              {/* Today's Clinical Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div onClick={() => setActiveTab('recent')} className="glass-card p-4 rounded-2xl border border-white/5 hover:border-[#38bdf8]/30 cursor-pointer space-y-1">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase font-mono">Patients Treated</span>
                  <span className="text-2xl font-display font-black text-white font-mono block">{stats.totalPatientsViewed}</span>
                  <span className="text-[9px] text-[#38bdf8] font-semibold flex items-center gap-1">View directory <ArrowRight className="w-3 h-3" /></span>
                </div>

                <div onClick={() => setActiveTab('requests')} className="glass-card p-4 rounded-2xl border border-white/5 hover:border-amber-500/30 cursor-pointer space-y-1">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase font-mono">Pending Clearances</span>
                  <span className="text-2xl font-display font-black text-amber-400 font-mono block">{stats.pendingAccessRequests}</span>
                  <span className="text-[9px] text-amber-300 font-semibold flex items-center gap-1">Review requests <ArrowRight className="w-3 h-3" /></span>
                </div>

                <div onClick={() => setActiveTab('requests')} className="glass-card p-4 rounded-2xl border border-white/5 hover:border-emerald-500/30 cursor-pointer space-y-1">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase font-mono">Active Clearances</span>
                  <span className="text-2xl font-display font-black text-emerald-400 font-mono block">{stats.approvedAccessRequests}</span>
                  <span className="text-[9px] text-emerald-300 font-semibold">24-hr access unlocked</span>
                </div>

                <div onClick={() => setActiveTab('prescriptions')} className="glass-card p-4 rounded-2xl border border-white/5 hover:border-purple-500/30 cursor-pointer space-y-1">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase font-mono">Today's Prescriptions</span>
                  <span className="text-2xl font-display font-black text-purple-400 font-mono block">{stats.todayPrescriptions}</span>
                  <span className="text-[9px] text-purple-300 font-semibold">Signed Rx issued</span>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button onClick={() => setActiveTab('search')} className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-[#38bdf8]/10 to-[#4f8cff]/10 border border-[#38bdf8]/20 rounded-2xl text-left hover:bg-[#38bdf8]/20 transition cursor-pointer">
                  <Search className="w-5 h-5 text-[#38bdf8] shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-white">Search Registry</span>
                    <span className="text-[9px] text-slate-400 font-mono">Find patient record</span>
                  </div>
                </button>

                <button onClick={() => setActiveTab('prescriptions')} className="flex items-center gap-3 p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-left hover:bg-purple-500/20 transition cursor-pointer">
                  <ClipboardList className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-white">Issue Rx</span>
                    <span className="text-[9px] text-purple-300 font-mono">Sign prescription</span>
                  </div>
                </button>

                <button onClick={() => setActiveTab('requests')} className="flex items-center gap-3 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-left hover:bg-amber-500/20 transition cursor-pointer">
                  <Key className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-white">Clearances</span>
                    <span className="text-[9px] text-amber-300 font-mono">24-hr unlocks</span>
                  </div>
                </button>

                <button onClick={() => setActiveTab('recent')} className="flex items-center gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-left hover:bg-emerald-500/20 transition cursor-pointer">
                  <Users className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-white">Directory</span>
                    <span className="text-[9px] text-emerald-300 font-mono">All patients</span>
                  </div>
                </button>
              </div>

              {/* Recent Activity Log */}
              <div className="glass-card border border-white/5 rounded-3xl p-6 space-y-4">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#38bdf8]" /> Recent Practitioner Activity Stream
                </h3>
                {stats.recentActivity && stats.recentActivity.length > 0 ? (
                  <div className="space-y-2.5">
                    {stats.recentActivity.slice(0, 5).map((log: any) => (
                      <div key={log.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <Activity className="w-3.5 h-3.5 text-[#38bdf8]" />
                          <span className="text-slate-200 font-medium">{log.details}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No recent activity recorded.</p>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: PATIENT SEARCH */}
          {activeTab === 'search' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-display font-bold text-white">Universal Patient Search</h2>
                <p className="text-xs text-slate-400">Search patient records by Universal Patient ID (e.g. PAT-100001), Full Name, or Phone Number.</p>
              </div>

              <form onSubmit={handleGeneralSearch} className="glass-card border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-[#38bdf8] absolute left-4 top-3.5" />
                  <input
                    type="text"
                    required
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Enter Patient ID (e.g. PAT-100001), Name, or Mobile..."
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950/70 border border-white/10 rounded-2xl text-sm font-semibold text-white outline-none focus:border-[#38bdf8]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={searchLoading}
                  className="w-full bg-gradient-to-r from-[#38bdf8] to-[#4f8cff] text-white font-bold py-3.5 rounded-2xl text-xs shadow-lg hover:opacity-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  {searchLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Search Registry</span>
                </button>
              </form>

              {/* Matched Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Search Results ({searchResults.length})</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {searchResults.map((p: any) => (
                      <div key={p.patientId} className="glass-card border border-white/5 hover:border-[#38bdf8]/30 rounded-2xl p-4 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{p.name}</span>
                            <span className="text-[10px] font-mono font-bold text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded">{p.patientId}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">{p.gender} • {p.age} yrs • Blood: {p.bloodGroup} • {p.phone}</span>
                        </div>
                        <button
                          onClick={() => handleInspectPatient(p.patientId)}
                          className="px-4 py-2 bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 border border-[#38bdf8]/30 text-[#38bdf8] rounded-xl text-xs font-bold cursor-pointer shrink-0"
                        >
                          Inspect Profile
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PATIENT DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6 animate-fade-in">
              {!selectedPatientDetails ? (
                <div className="glass-card border border-white/5 rounded-3xl p-16 text-center space-y-3">
                  <UserCheck className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="font-bold text-sm text-white">No Patient Selected</h4>
                  <p className="text-xs text-slate-400">Search the patient registry to inspect clinical vitals and history.</p>
                  <button onClick={() => setActiveTab('search')} className="px-4 py-2 bg-[#38bdf8] text-slate-950 rounded-xl text-xs font-bold cursor-pointer">
                    Search Registry Now
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Patient Info Header Card */}
                  <div className="glass-card border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-display font-extrabold text-white">{selectedPatientDetails.patient.name}</h2>
                        <span className="text-xs font-mono font-bold text-[#38bdf8] bg-[#38bdf8]/10 border border-[#38bdf8]/20 px-2.5 py-0.5 rounded-md">
                          {selectedPatientDetails.patient.patientId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        Gender: {selectedPatientDetails.patient.gender || 'N/A'} | DOB: {selectedPatientDetails.patient.dob || 'N/A'} | Blood: {selectedPatientDetails.patient.bloodGroup || 'N/A'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => setActiveTab('records')} className="px-3.5 py-1.5 bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 border border-[#38bdf8]/30 text-[#38bdf8] text-xs font-bold rounded-xl cursor-pointer">
                        View Records ({selectedPatientDetails.records?.length || 0})
                      </button>
                      <button onClick={() => setActiveTab('prescriptions')} className="px-3.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold rounded-xl cursor-pointer">
                        Issue Prescription
                      </button>
                    </div>
                  </div>

                  {/* Vitals & Emergency Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass-card border border-white/5 rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Clinical Baseline</h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-400 font-mono text-[10px] block">Severe Allergies:</span>
                          <span className="font-bold text-rose-400">{selectedPatientDetails.patient.allergies || 'None declared'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-mono text-[10px] block">Chronic Conditions:</span>
                          <span className="font-bold text-white">{selectedPatientDetails.patient.chronicDiseases || 'None declared'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card border border-white/5 rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Emergency Contact</h4>
                      <div className="space-y-1 text-xs">
                        <span className="font-bold text-white block">{selectedPatientDetails.patient.emergencyContactName || 'N/A'} ({selectedPatientDetails.patient.emergencyContactRelation || 'N/A'})</span>
                        <span className="text-[#38bdf8] font-mono block">{selectedPatientDetails.patient.emergencyContactPhone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MEDICAL RECORDS */}
          {activeTab === 'records' && (
            <div className="space-y-6 animate-fade-in">
              {!selectedPatientDetails ? (
                <div className="glass-card border border-white/5 rounded-3xl p-16 text-center text-slate-400 text-xs">
                  Please select a patient to view medical history records.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-display font-bold text-white">Records for {selectedPatientDetails.patient.name}</h2>
                      <p className="text-xs text-slate-400 font-mono">Patient ID: {selectedPatientDetails.patient.patientId}</p>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex gap-1.5 overflow-x-auto">
                      {['All', 'Lab Report', 'Prescription', 'Scan', 'Discharge Summary', 'Other'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setRecordCategoryFilter(cat)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                            recordCategoryFilter === cat ? 'bg-[#38bdf8] text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filtered Records List */}
                  {filteredPatientRecords.length === 0 ? (
                    <div className="glass-card border border-white/5 rounded-3xl p-12 text-center text-slate-400 text-xs">
                      No matching records for this patient.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredPatientRecords.map((rec: MedicalRecord) => (
                        <div key={rec.id} className="glass-card border border-white/5 hover:border-[#38bdf8]/30 rounded-2xl p-5 space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-mono font-bold uppercase text-[#38bdf8] bg-[#38bdf8]/10 px-2.5 py-0.5 rounded">
                              {rec.category}
                            </span>
                            {rec.isSensitive ? (
                              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Sensitive
                              </span>
                            ) : (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono flex items-center gap-1">
                                <Unlock className="w-3 h-3" /> Unlocked
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-white text-base">{rec.title}</h4>

                          {rec.isLocked ? (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300 space-y-2">
                              <span>Sensitive report is privacy locked. Request clearance authorization from the patient.</span>
                              <button
                                onClick={() => handleRequestAccessLocal(rec.id, rec.title)}
                                className="w-full bg-amber-500 text-slate-950 font-bold py-2 rounded-xl text-xs hover:bg-amber-400 cursor-pointer"
                              >
                                Request Access Clearance
                              </button>
                            </div>
                          ) : (
                            <>
                              <p className="text-xs text-slate-300">{rec.description}</p>
                              {rec.fileContent && (
                                <button
                                  onClick={() => downloadFile(rec.fileName, rec.fileContent)}
                                  className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" /> Download File ({rec.fileSize})
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload record on behalf of patient form */}
                  <div className="glass-card border border-white/10 rounded-3xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                      <FilePlus className="w-4 h-4 text-[#38bdf8]" /> Ingest Clinical Record for Patient
                    </h3>
                    <form onSubmit={handleDocUploadForPatient} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" required value={docUploadTitle} onChange={e => setDocUploadTitle(e.target.value)} placeholder="Report Title" className="px-3.5 py-2.5 rounded-xl premium-input text-xs text-white outline-none" />
                        <select value={docUploadCategory} onChange={e => setDocUploadCategory(e.target.value as any)} className="px-3.5 py-2.5 rounded-xl premium-input text-xs text-white outline-none cursor-pointer">
                          <option className="bg-[#050816]">Lab Report</option>
                          <option className="bg-[#050816]">Prescription</option>
                          <option className="bg-[#050816]">Scan</option>
                          <option className="bg-[#050816]">Discharge Summary</option>
                          <option className="bg-[#050816]">Other</option>
                        </select>
                      </div>
                      <textarea value={docUploadDesc} onChange={e => setDocUploadDesc(e.target.value)} placeholder="Clinical Notes..." rows={2} className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs text-white outline-none resize-none" />
                      <input type="file" required accept="image/*,application/pdf" onChange={handleFileChange} className="w-full text-xs text-slate-400" />
                      <button type="submit" className="w-full bg-[#38bdf8] text-slate-950 font-bold py-2.5 rounded-xl text-xs hover:opacity-95 cursor-pointer">
                        Upload to Patient Timeline
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-display font-bold text-white">Rx Prescriptions Engine</h2>
                <p className="text-xs text-slate-400">Issue digitally signed medical prescriptions for patient profiles.</p>
              </div>

              {!selectedPatientDetails ? (
                <div className="glass-card border border-white/5 rounded-3xl p-12 text-center text-slate-400 text-xs">
                  Please search and select a patient to issue a prescription.
                </div>
              ) : (
                <div className="glass-card border border-white/10 rounded-3xl p-6 space-y-5">
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    New Prescription for {selectedPatientDetails.patient.name} ({selectedPatientDetails.patient.patientId})
                  </h3>

                  <form onSubmit={handleAddPrescription} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">Clinical Diagnosis</label>
                      <input type="text" required value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="e.g. Acute Bronchitis" className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs text-white outline-none" />
                    </div>

                    {/* Medications List Builder */}
                    <div className="space-y-3 border-t border-white/5 pt-4">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono">Prescribed Medications</span>
                      
                      {medsList.map((m, idx) => (
                        <div key={idx} className="p-3 bg-white/5 rounded-xl flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{m.name} - {m.dosage} ({m.frequency}, {m.duration})</span>
                          <button type="button" onClick={() => handleRemoveMedication(idx)} className="text-rose-400 hover:underline">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <input type="text" placeholder="Medication" value={addMedName} onChange={e => setAddMedName(e.target.value)} className="px-3 py-2 rounded-xl premium-input text-xs text-white outline-none" />
                        <input type="text" placeholder="Dosage" value={addMedDosage} onChange={e => setAddMedDosage(e.target.value)} className="px-3 py-2 rounded-xl premium-input text-xs text-white outline-none" />
                        <input type="text" placeholder="Frequency" value={addMedFreq} onChange={e => setAddMedFreq(e.target.value)} className="px-3 py-2 rounded-xl premium-input text-xs text-white outline-none" />
                        <input type="text" placeholder="Duration" value={addMedDur} onChange={e => setAddMedDur(e.target.value)} className="px-3 py-2 rounded-xl premium-input text-xs text-white outline-none" />
                      </div>

                      <button type="button" onClick={handleAddMedication} className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 cursor-pointer">
                        + Add Medication Item
                      </button>
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl text-xs hover:opacity-95 cursor-pointer shadow-lg">
                      Issue Digitally Signed Prescription
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ACCESS REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-display font-bold text-white">Access Clearances Management</h2>
                <p className="text-xs text-slate-400">Track active 24-hour approved clearances and pending permission requests.</p>
              </div>

              {/* Active Approved Access Clearances */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">Active Approved Clearances (24-hr Valid)</h3>
                {!doctorData.approvedAccessRequests || doctorData.approvedAccessRequests.length === 0 ? (
                  <div className="glass-card border border-white/5 rounded-2xl p-6 text-center text-slate-400 text-xs">
                    No active approved clearances currently unlocked.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctorData.approvedAccessRequests.map((req: any) => (
                      <div key={req.id} className="glass-card border border-emerald-500/20 rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-sm text-white">Patient ID: {req.patientId}</span>
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {getAccessTimer(req.respondedAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">Unlocked Report: <strong>"{req.recordTitle}"</strong></p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: RECENT PATIENTS */}
          {activeTab === 'recent' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Patient Directory</h2>
                  <p className="text-xs text-slate-400">Complete registry of patients in the network.</p>
                </div>

                <div className="w-64">
                  <input
                    type="text"
                    value={dirFilter}
                    onChange={e => setDirFilter(e.target.value)}
                    placeholder="Filter directory..."
                    className="w-full px-3.5 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.map((p: any) => (
                  <div key={p.patientId} className="glass-card border border-white/5 hover:border-[#38bdf8]/30 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-white">{p.name}</h4>
                        <span className="text-[10px] font-mono font-bold text-[#38bdf8]">{p.patientId}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{p.lastVisit}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono space-y-1">
                      <div>Age: {p.age} | Gender: {p.gender} | Blood: {p.bloodGroup}</div>
                      <div>Phone: {p.phone}</div>
                    </div>

                    <button
                      onClick={() => handleInspectPatient(p.patientId)}
                      className="w-full py-2 bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 border border-[#38bdf8]/30 text-[#38bdf8] text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Inspect Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-display font-bold text-white">Clinician Professional Profile</h2>
                <p className="text-xs text-slate-400">Update professional clinical parameters and credentials.</p>
              </div>

              <div className="glass-card border border-white/10 rounded-3xl p-6 space-y-5">
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  
                  {/* Doctor Profile Photo Control */}
                  <div className="bg-slate-950/60 border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                    <Avatar name={profName || 'Doctor'} src={profPic} size="xl" />
                    <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                      <span className="block text-xs font-bold text-white">Practitioner Avatar Photo</span>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Upload a professional portrait image. If no custom image is uploaded, HealthOrbit automatically generates a custom circular avatar using your initials.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                        <label className="px-3.5 py-1.5 bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 border border-[#38bdf8]/30 text-[#38bdf8] text-xs font-bold rounded-xl cursor-pointer transition">
                          Upload Custom Photo
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  showNotification('Profile image file must be less than 5MB', 'error');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const base64 = event.target?.result as string;
                                  setProfPic(base64);
                                  showNotification('New profile photo staged. Click "Save Profile Updates" to apply.', 'success');
                                };
                                reader.readAsDataURL(file);
                              }
                            }} 
                            className="hidden" 
                          />
                        </label>
                        {profPic && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfPic('');
                              showNotification('Profile photo removed. Initials avatar restored.', 'success');
                            }}
                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl cursor-pointer transition"
                          >
                            Remove Custom Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">Full Name</label>
                      <input type="text" value={profName} onChange={e => setProfName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">Contact Phone</label>
                      <input type="text" value={profPhone} onChange={e => setProfPhone(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs text-white outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">Department</label>
                      <input type="text" value={profDept} onChange={e => setProfDept(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">Specialization</label>
                      <input type="text" value={profSpec} onChange={e => setProfSpec(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs text-white outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">Bio / About</label>
                    <textarea value={profAbout} onChange={e => setProfAbout(e.target.value)} rows={3} className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs text-white outline-none resize-none" />
                  </div>

                  <button type="submit" disabled={saveLoading} className="w-full bg-[#38bdf8] text-slate-950 font-bold py-3 rounded-xl text-xs hover:opacity-95 cursor-pointer">
                    Save Profile Updates
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-display font-bold text-white">Practice Settings</h2>
                <p className="text-xs text-slate-400">Digital signature PIN and clinical preferences.</p>
              </div>

              <div className="glass-card border border-white/5 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <span className="block font-bold text-xs text-white">Digital Signature PIN</span>
                    <span className="text-[10px] text-slate-400">Attached to issued prescription forms.</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#38bdf8]">{sigPin}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="block font-bold text-xs text-white">Clearance Expiration Window</span>
                    <span className="text-[10px] text-slate-400">Sensitive access keys automatically expire after 24 hours.</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">24 HOURS</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
