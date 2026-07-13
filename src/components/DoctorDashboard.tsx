import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ShieldAlert, BadgeCheck, FileText, Download, Plus, X, 
  FilePlus, Lock, Unlock, ClipboardList, Shield, Activity, HelpCircle, User,
  Calendar, Phone, Mail, Award, Clock, ArrowLeft, RefreshCw, Trash2, Heart,
  Settings, CheckCircle, LayoutDashboard, ChevronRight, Eye, Edit3, UserCheck, 
  MapPin, BookOpen, AlertCircle, Sparkles, Building, Briefcase, FileSignature, Check
} from 'lucide-react';
import { MedicalRecord, Doctor } from '../types';
import { api } from '../api';

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
}: DoctorDashboardProps) {
  if (!doctorData) return null;

  // Active workspace states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'search' | 'records' | 'pending' | 'approved' | 'prescriptions' | 'profile' | 'settings'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Profile edit states
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
  const [themeMode, setThemeMode] = useState('dark');

  // Directory filter state
  const [dirFilter, setDirFilter] = useState('');

  // Inline Notification trigger state to replace ugly browser alerts
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

  // Initialize form fields on doctor change
  useEffect(() => {
    if (doctor) {
      setProfName(doctor.name || '');
      setProfPhone(doctor.phone || '');
      setProfAbout(doctor.about || '');
      setProfPic(doctor.profilePicture || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300');
      setProfExp(doctor.experience || '8 years');
      setProfDept(doctor.department || 'General Medicine');
      setProfSpec(doctor.specialization || 'General Practitioner');
    }
  }, [doctorData]);

  // Synchronize when outer searchPatient state updates
  useEffect(() => {
    if (searchedPatient) {
      setSelectedPatientDetails(searchedPatient);
      setSelectedPatientId(searchedPatient.patient.patientId);
    }
  }, [searchedPatient]);

  // Custom multi-criteria patient search
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
          // Set parent App state for compatibility
          setSearchId(res.patient.patientId);
        } else {
          setSelectedPatientDetails(null);
          setSelectedPatientId(null);
        }
        api.logAction('PATIENT_SEARCH', `Searched the registry with query: "${searchQuery}"`);
      })
      .catch(err => {
        setSearchResults([]);
        setSelectedPatientDetails(null);
        setSelectedPatientId(null);
        showNotification(err.message || 'No patient matching search criteria.', 'error');
      })
      .finally(() => setSearchLoading(false));
  };

  // Select a patient and fetch their details
  const handleInspectPatient = (patientId: string) => {
    setSearchLoading(true);
    setSearchId(patientId);
    api.searchPatient(patientId)
      .then(res => {
        setSelectedPatientDetails(res);
        setSelectedPatientId(patientId);
        setActiveTab('search');
        api.logAction('RECORD_VIEW', `Inspected medical history for patient: ${patientId}`);
      })
      .catch(err => {
        showNotification(err.message || 'Could not load patient records.', 'error');
      })
      .finally(() => setSearchLoading(false));
  };

  // Access request helper
  const handleRequestAccessLocal = (recordId: string, recordTitle: string) => {
    if (!selectedPatientId) return;
    setSearchLoading(true);
    api.requestAccess(selectedPatientId, recordId)
      .then(() => {
        showNotification('Access clearance request sent to the patient! Once approved, files will be unlocked.', 'success');
        api.logAction('ACCESS_REQUEST', `Requested permission to view sensitive report "${recordTitle}" for patient ${selectedPatientId}`);
        // Refresh details
        api.searchPatient(selectedPatientId).then(res => setSelectedPatientDetails(res));
      })
      .catch(err => showNotification(err.message, 'error'))
      .finally(() => setSearchLoading(false));
  };

  // Submit doctor profile edits
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
        showNotification('Professional clinical credentials updated successfully!', 'success');
        setIsEditingProfile(false);
        // local synchronization
        doctor.name = profName;
        doctor.phone = profPhone;
        doctor.about = profAbout;
        doctor.profilePicture = profPic;
        doctor.experience = profExp;
        doctor.department = profDept;
        doctor.specialization = profSpec;
      })
      .catch(err => showNotification(err.message, 'error'))
      .finally(() => setSaveLoading(false));
  };

  // Calculate access expiry countdown beautifully
  const getAccessTimer = (respondedAt: string) => {
    if (!respondedAt) return 'Valid';
    const expiresAt = new Date(respondedAt).getTime() + 24 * 60 * 60 * 1000;
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m left`;
  };

  // Filtered Patient Directory list
  const filteredPatients = (doctorData.allPatients || []).filter((p: any) => 
    p.name.toLowerCase().includes(dirFilter.toLowerCase()) || 
    p.patientId.toLowerCase().includes(dirFilter.toLowerCase()) ||
    p.phone.includes(dirFilter)
  );

  return (
    <div id="doctor-portal-root" className="flex flex-col lg:flex-row gap-8 items-start animate-fade-in pb-10">
      
      {/* Toast Notification Container */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md ${
              notification.type === 'error' 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            }`}
          >
            {notification.type === 'error' ? <ShieldAlert className="w-4 h-4 text-rose-400" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
            <span className="text-xs font-bold">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-80">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside id="workspace-sidebar" className="w-full lg:w-72 shrink-0 glass-card border border-white/10 rounded-3xl p-5 shadow-lg space-y-6">
        
        {/* Clinician Profile Short Summary */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-white/5">
          <img 
            src={profPic || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'} 
            alt="Clinician Avatar"
            className="w-12 h-12 rounded-2xl object-cover border border-white/10 bg-slate-950"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300';
            }}
          />
          <div className="min-w-0">
            <h3 className="font-display font-extrabold text-sm text-white tracking-tight truncate flex items-center gap-1">
              Dr. {profName}
              {doctor.isVerified && <BadgeCheck className="w-4 h-4 text-[#4f8cff] shrink-0 animate-pulse" />}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate font-mono">
              {profSpec}
            </p>
            <p className="text-[9px] text-[#5da9ff] font-mono truncate">
              {doctor.hospitalName}
            </p>
          </div>
        </div>

        {/* Sidebar Tabs Links */}
        <nav className="space-y-1.5">
          <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 font-mono">Workspace Main</span>
          
          <button 
            id="nav-tab-dashboard"
            onClick={() => { setActiveTab('dashboard'); setSelectedPatientId(null); setSelectedPatientDetails(null); }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'bg-[#4f8cff]/10 text-[#5da9ff] border-l-2 border-[#4f8cff]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard Overview</span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 transition ${activeTab === 'dashboard' ? 'rotate-90 text-[#5da9ff]' : 'opacity-40'}`} />
          </button>

          <button 
            id="nav-tab-search"
            onClick={() => setActiveTab('search')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'search' 
                ? 'bg-[#4f8cff]/10 text-[#5da9ff] border-l-2 border-[#4f8cff]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 shrink-0" />
              <span>Patient Registry Search</span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 transition ${activeTab === 'search' ? 'rotate-90 text-[#5da9ff]' : 'opacity-40'}`} />
          </button>

          <button 
            id="nav-tab-records"
            onClick={() => { setActiveTab('records'); setSelectedPatientId(null); setSelectedPatientDetails(null); }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'records' 
                ? 'bg-[#4f8cff]/10 text-[#5da9ff] border-l-2 border-[#4f8cff]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>Patient Records Directory</span>
            </div>
            <span className="bg-white/10 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
              {(doctorData.allPatients || []).length}
            </span>
          </button>

          <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 pt-4 mb-2 font-mono">Clearance & Rx</span>

          <button 
            id="nav-tab-pending"
            onClick={() => setActiveTab('pending')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'pending' 
                ? 'bg-[#4f8cff]/10 text-[#5da9ff] border-l-2 border-[#4f8cff]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Pending Clearance requests</span>
            </div>
            {stats.pendingAccessRequests > 0 && (
              <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse border border-amber-500/30">
                {stats.pendingAccessRequests}
              </span>
            )}
          </button>

          <button 
            id="nav-tab-approved"
            onClick={() => setActiveTab('approved')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'approved' 
                ? 'bg-[#4f8cff]/10 text-[#5da9ff] border-l-2 border-[#4f8cff]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Unlock className="w-4 h-4 shrink-0" />
              <span>Approved Locked Reports</span>
            </div>
            {stats.approvedAccessRequests > 0 && (
              <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                {stats.approvedAccessRequests}
              </span>
            )}
          </button>

          <button 
            id="nav-tab-prescriptions"
            onClick={() => setActiveTab('prescriptions')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'prescriptions' 
                ? 'bg-[#4f8cff]/10 text-[#5da9ff] border-l-2 border-[#4f8cff]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FilePlus className="w-4 h-4 shrink-0" />
              <span>Prescribed Treatments</span>
            </div>
            <span className="bg-white/10 text-slate-300 text-[9px] font-mono px-2 py-0.5 rounded-full">
              {(doctorData.recentPrescriptions || []).length}
            </span>
          </button>

          <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 pt-4 mb-2 font-mono">Account</span>

          <button 
            id="nav-tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'profile' 
                ? 'bg-[#4f8cff]/10 text-[#5da9ff] border-l-2 border-[#4f8cff]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 shrink-0" />
              <span>Clinical Profile card</span>
            </div>
          </button>

          <button 
            id="nav-tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'settings' 
                ? 'bg-[#4f8cff]/10 text-[#5da9ff] border-l-2 border-[#4f8cff]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 shrink-0" />
              <span>Console Settings</span>
            </div>
          </button>
        </nav>

        {/* Access Status Information Box */}
        <div className="bg-[#090d23]/80 rounded-2xl p-4 border border-white/5 text-[10px] leading-relaxed text-slate-400 font-medium">
          <Shield className="w-4 h-4 text-[#4f8cff] mb-1.5 animate-pulse" />
          <span className="font-bold text-slate-200 block mb-0.5">Cryptographic Encryption Active</span>
          All clinician activity logs are strictly audited. Access keys automatically decay after 24 hours to secure confidential timelines.
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main id="workspace-main" className="flex-1 w-full min-w-0 space-y-6">

        {/* Loading Synchronizer Alert */}
        {searchLoading && (
          <div className="bg-[#4f8cff]/10 border border-[#4f8cff]/20 rounded-2xl p-3 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 text-[#5da9ff] text-xs font-semibold">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Decrypting and compiling patient registry logs...</span>
            </div>
          </div>
        )}

        {/* ACTIVE TABS CONDITIONAL CONTENT */}
        <AnimatePresence mode="wait">
          {/* 1. DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              id="view-dashboard" 
              className="space-y-6"
            >
            
            {/* Welcoming Doctor Banner */}
            <div className="bg-gradient-to-tr from-[#090e29] to-[#0d2240] border border-white/10 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#4f8cff] opacity-10 blur-3xl animate-pulse" />
              <div className="space-y-2.5 relative z-10">
                <span className="inline-flex items-center gap-1.5 bg-[#4f8cff]/10 border border-[#4f8cff]/20 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-[#5da9ff] font-mono">
                  <Sparkles className="w-3.5 h-3.5" /> Clinician Control Panel
                </span>
                <h1 className="font-display text-2xl sm:text-3.5xl font-black tracking-tight">
                  Welcome back, Dr. {profName}
                </h1>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Your medical portal is fully secure. Search patients below, inspect sensitive clinical timeline files, or issue official medical prescription scripts.
                </p>
              </div>
            </div>

            {/* Core Analytics Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              
              <div className="glass-card border border-white/5 hover:border-[#4f8cff]/30 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-28 transition duration-300">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Total Patients</span>
                  <div className="p-1.5 bg-[#4f8cff]/10 rounded-xl text-[#5da9ff]">
                    <User className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="block text-2xl font-black text-white font-mono tracking-tight">{stats.totalPatientsViewed}</span>
                  <span className="text-[9px] text-slate-400 font-medium">History viewed</span>
                </div>
              </div>

              <div className="glass-card border border-white/5 hover:border-amber-500/30 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-28 transition duration-300">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Pending Access</span>
                  <div className="p-1.5 bg-amber-500/10 rounded-xl text-amber-400">
                    <ShieldAlert className="w-4 h-4 animate-pulse" />
                  </div>
                </div>
                <div>
                  <span className="block text-2xl font-black text-white font-mono tracking-tight">{stats.pendingAccessRequests}</span>
                  <span className="text-[9px] text-slate-400 font-medium">Awaiting approval</span>
                </div>
              </div>

              <div className="glass-card border border-white/5 hover:border-emerald-500/30 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-28 transition duration-300">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Approved Access</span>
                  <div className="p-1.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                    <Unlock className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="block text-2xl font-black text-white font-mono tracking-tight">{stats.approvedAccessRequests}</span>
                  <span className="text-[9px] text-slate-400 font-medium">Valid for next 24h</span>
                </div>
              </div>

              <div className="glass-card border border-white/5 hover:border-blue-500/30 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-28 transition duration-300">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Today's Rx</span>
                  <div className="p-1.5 bg-blue-500/10 rounded-xl text-blue-400">
                    <FilePlus className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="block text-2xl font-black text-white font-mono tracking-tight">{stats.todayPrescriptions}</span>
                  <span className="text-[9px] text-slate-400 font-medium">Treatment logs added</span>
                </div>
              </div>

              <div className="glass-card border border-white/5 hover:border-[#4f8cff]/30 rounded-2xl p-4 col-span-2 lg:col-span-1 shadow-sm flex flex-col justify-between h-28 transition duration-300">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Verification status</span>
                  <div className={`p-1.5 rounded-xl ${doctor.isVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-bold text-white tracking-tight">
                    {doctor.isVerified ? 'Verified Partner' : 'Revoked Status'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono block truncate">{doctor.licenseNumber}</span>
                </div>
              </div>

            </div>

            {/* Welcome message + Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Doctor Details summary card */}
              <div className="glass-card border border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-white text-sm">Professional Summary</h3>
                  <button 
                    onClick={() => setActiveTab('profile')} 
                    className="text-[#4f8cff] hover:underline font-bold text-xs flex items-center gap-1 bg-transparent border-none cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
                
                <div className="space-y-3.5">
                  <div className="flex gap-3 items-start text-xs">
                    <User className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold font-mono">Registered Clinician</span>
                      <span className="font-bold text-white">Dr. {profName}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start text-xs">
                    <Building className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold font-mono">Hospital and Department</span>
                      <span className="font-bold text-white">{doctor.hospitalName} ({profDept})</span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start text-xs">
                    <Award className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold font-mono">License and Speciality</span>
                      <span className="font-bold text-white">{profSpec} • #{doctor.licenseNumber}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start text-xs">
                    <Phone className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold font-mono">Contact Hotline</span>
                      <span className="font-semibold text-white">{profPhone || 'Not set'}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start text-xs">
                    <Briefcase className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold font-mono">Practical experience</span>
                      <span className="font-semibold text-white">{profExp}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/40 rounded-2xl p-3.5 text-[11px] leading-relaxed text-slate-300 italic border border-white/5">
                  "{profAbout || 'No medical biography set yet. Introduce yourself under the profile tab!'}"
                </div>
              </div>

              {/* Recent Activity streams card */}
              <div className="lg:col-span-2 glass-card border border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
                <h3 className="font-display font-bold text-white text-sm">Security Audit Logs & Recent Activity</h3>
                
                <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto pr-2 space-y-3 scrollbar-thin">
                  {stats.recentActivity.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-1">
                      <Shield className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                      <p className="text-xs font-semibold text-slate-500">No secure audit records found</p>
                    </div>
                  ) : (
                    stats.recentActivity.map((log: any) => (
                      <div key={log.id} className="pt-3 first:pt-0 flex justify-between gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-200 block leading-tight">
                            {log.details}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono block">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <span className={`self-start text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                          log.action === 'PATIENT_SEARCH' 
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' 
                            : log.action === 'ACCESS_REQUEST' 
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' 
                            : log.action === 'PRESCRIPTION_ADD' 
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                            : 'bg-white/5 text-slate-300 border-white/10'
                        }`}>
                          {log.action}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </motion.div>
        )}

        {/* 2. PATIENT SEARCH TAB */}
        {activeTab === 'search' && (
          <motion.div 
            key="search"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            id="view-search-patients" 
            className="space-y-6"
          >
            
            {/* If a patient profile is currently selected, display the complete Patient Profile detailed view */}
            {selectedPatientDetails ? (
              <div className="space-y-6">
                
                {/* Back button header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button 
                    onClick={() => { setSelectedPatientDetails(null); setSelectedPatientId(null); setSearchQuery(''); setSearchResults([]); }}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-bold transition cursor-pointer bg-transparent border-none"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Search Panel
                  </button>
                  <span className="bg-[#4f8cff]/10 border border-[#4f8cff]/20 px-3 py-1 rounded-full text-[10px] font-bold text-[#5da9ff] uppercase tracking-wider font-mono">
                    Inspecting ID: {selectedPatientDetails.patient.patientId}
                  </span>
                </div>

                {/* Patient Profile Card (Basic info summary) */}
                <div className="glass-card border border-white/10 rounded-3xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[#4f8cff]/10 border border-[#4f8cff]/20 text-[#5da9ff] font-display text-base font-extrabold uppercase shrink-0">
                      {selectedPatientDetails.patient.name.slice(0, 2)}
                    </div>
                    <div>
                      <h2 className="font-display font-extrabold text-white text-base leading-snug">
                        {selectedPatientDetails.patient.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-mono">ID: {selectedPatientDetails.patient.patientId}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[10px] text-slate-300 font-semibold">{selectedPatientDetails.patient.gender} • {selectedPatientDetails.patient.dob ? `${new Date().getFullYear() - new Date(selectedPatientDetails.patient.dob).getFullYear()} yrs old` : 'Age N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-6 text-xs text-slate-300 bg-slate-950/40 border border-white/5 px-4 py-2.5 rounded-2xl w-full md:w-auto overflow-x-auto">
                    <div>
                      <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider font-mono">Blood Group</span>
                      <span className="font-bold text-teal-400 font-mono text-xs">{selectedPatientDetails.patient.bloodGroup || 'Not spec'}</span>
                    </div>
                    <div className="border-l border-white/10 pl-4">
                      <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider font-mono">Height</span>
                      <span className="font-semibold text-white font-mono text-xs">{selectedPatientDetails.patient.height || '175 cm'}</span>
                    </div>
                    <div className="border-l border-white/10 pl-4">
                      <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider font-mono">Weight</span>
                      <span className="font-semibold text-white font-mono text-xs">{selectedPatientDetails.patient.weight || '70 kg'}</span>
                    </div>
                  </div>
                </div>

                {/* Patient Profile detailed grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left columns for Basic Info & Emergency details */}
                  <div className="lg:col-span-1 space-y-6">
                    
                    {/* Basic Info & Emergency Profile Panel */}
                    <div className="glass-card border border-white/10 rounded-3xl p-5 shadow-lg space-y-4">
                      <h3 className="font-display font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider text-slate-400 font-mono">
                        <AlertCircle className="w-4.5 h-4.5 text-rose-500 animate-pulse" /> Emergency Health Profile
                      </h3>

                      <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 space-y-3">
                        <div className="space-y-1">
                          <span className="block text-[9px] uppercase font-extrabold text-rose-400 tracking-wider font-mono">Severe Allergies</span>
                          <span className="text-xs font-bold text-white leading-normal block">
                            {selectedPatientDetails.patient.allergies || 'No known allergies flagged'}
                          </span>
                        </div>

                        <div className="border-t border-rose-500/10 pt-2.5 space-y-1">
                          <span className="block text-[9px] uppercase font-extrabold text-rose-400 tracking-wider font-mono">Chronic Illnesses</span>
                          <span className="text-xs font-bold text-white leading-normal block">
                            {selectedPatientDetails.patient.chronicDiseases || 'No chronic diseases recorded'}
                          </span>
                        </div>

                        <div className="border-t border-rose-500/10 pt-2.5 space-y-1">
                          <span className="block text-[9px] uppercase font-extrabold text-rose-400 tracking-wider font-mono">Current Medications</span>
                          <span className="text-xs font-bold text-white leading-normal block">
                            {selectedPatientDetails.patient.currentMedications || 'None recorded'}
                          </span>
                        </div>
                      </div>

                      {/* Emergency Contact */}
                      <div className="pt-2 space-y-3">
                        <h4 className="font-display font-bold text-xs text-white">Primary Emergency Contact</h4>
                        
                        <div className="space-y-2.5 bg-slate-950/40 border border-white/5 p-3.5 rounded-2xl">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Contact Name:</span>
                            <span className="font-bold text-white">{selectedPatientDetails.patient.emergencyContactName || ' Jane Doe'}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Relationship:</span>
                            <span className="font-semibold text-slate-300">{selectedPatientDetails.patient.emergencyContactRelation || 'Spouse'}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Emergency Phone:</span>
                            <span className="font-bold text-[#4f8cff] font-mono">{selectedPatientDetails.patient.emergencyContactPhone || '+1 (555) 987-6543'}</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Write new prescription treatment box */}
                    <div className="glass-card border border-white/10 rounded-3xl p-5 shadow-lg space-y-4">
                      <h3 className="font-display font-bold text-white text-sm flex items-center gap-1.5">
                        <FileSignature className="w-4.5 h-4.5 text-[#4f8cff]" /> Prescribe Treatment Script
                      </h3>
                      
                      <form onSubmit={handleAddPrescription} className="space-y-3.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Clinical Diagnosis</label>
                          <input 
                            type="text" 
                            required 
                            value={diagnosis} 
                            onChange={e => setDiagnosis(e.target.value)} 
                            placeholder="e.g. Acute Bronchitis" 
                            className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#090d23]/80 text-xs font-semibold outline-none text-white focus:border-[#4f8cff] placeholder-slate-500" 
                          />
                        </div>

                        {/* Medications listing container */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Medications list</label>
                          
                          {medsList.length > 0 && (
                            <div className="space-y-1.5 pb-2">
                              {medsList.map((med, index) => (
                                <div key={index} className="flex items-center justify-between bg-slate-950/40 border border-white/5 p-2 rounded-xl text-xs">
                                  <div className="min-w-0">
                                    <span className="font-bold text-white truncate block">{med.name}</span>
                                    <span className="text-[9px] text-slate-400 block font-mono">{med.dosage} • {med.frequency} • {med.duration}</span>
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={() => handleRemoveMedication(index)}
                                    className="text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-lg transition shrink-0 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Quick Add Medication block */}
                          <div className="bg-[#090d23]/50 border border-white/5 rounded-2xl p-3 space-y-2.5">
                            <input 
                              type="text" 
                              value={addMedName} 
                              onChange={e => setAddMedName(e.target.value)} 
                              placeholder="Medication name (e.g. Amoxicillin)" 
                              className="w-full px-3 py-1.5 rounded-lg border border-white/10 text-xs outline-none bg-slate-950 text-white placeholder-slate-500" 
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <input 
                                type="text" 
                                value={addMedDosage} 
                                onChange={e => setAddMedDosage(e.target.value)} 
                                placeholder="Dosage" 
                                className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs outline-none bg-slate-950 text-white placeholder-slate-500" 
                              />
                              <input 
                                type="text" 
                                value={addMedFreq} 
                                onChange={e => setAddMedFreq(e.target.value)} 
                                placeholder="Freq" 
                                className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs outline-none bg-slate-950 text-white placeholder-slate-500" 
                              />
                              <input 
                                type="text" 
                                value={addMedDur} 
                                onChange={e => setAddMedDur(e.target.value)} 
                                placeholder="Dur" 
                                className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs outline-none bg-slate-950 text-white placeholder-slate-500" 
                              />
                            </div>
                            <button 
                              type="button" 
                              onClick={handleAddMedication}
                              className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-1.5 rounded-xl text-[11px] transition flex items-center justify-center gap-1 cursor-pointer border border-white/10"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add to Prescription
                            </button>
                          </div>
                        </div>

                        <button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-[#4f8cff] to-[#7c5cff] text-white font-bold py-2.5 rounded-xl text-xs tracking-wide transition shadow-lg shadow-[#4f8cff]/10 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" /> Issue Signed Prescription
                        </button>
                      </form>
                    </div>

                  </div>

                  {/* Right columns for Medical Timeline & Reports */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Clinical records timeline section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-display font-bold text-white text-sm flex items-center gap-1.5">
                          <Activity className="w-4.5 h-4.5 text-[#4f8cff]" /> Digital Health Timeline
                        </h3>
                        <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider">Chronological list</span>
                      </div>

                      <div className="space-y-4">
                        {selectedPatientDetails.records?.length === 0 ? (
                          <div className="glass-card border border-white/5 rounded-3xl p-12 text-center text-slate-400">
                            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3 animate-pulse" />
                            <p className="text-xs font-semibold">No medical history reports uploaded on this profile.</p>
                          </div>
                        ) : (
                          selectedPatientDetails.records.map((rec: MedicalRecord) => (
                            <div 
                              key={rec.id}
                              className="glass-card border border-white/5 hover:border-[#4f8cff]/30 rounded-2xl p-5 hover:shadow-lg transition duration-200 relative overflow-hidden"
                            >
                              {/* Background color block for categorization */}
                              <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${rec.isSensitive ? 'bg-amber-500' : 'bg-[#4f8cff]'}`} />
                              
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pl-2">
                                <div className="space-y-2 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="bg-[#4f8cff]/15 text-[#5da9ff] border border-[#4f8cff]/20 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider font-mono">
                                      {rec.category}
                                    </span>
                                    {rec.isSensitive ? (
                                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                                        <Lock className="w-3 h-3" /> Sensitive Record
                                      </span>
                                    ) : (
                                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                                        <Unlock className="w-3 h-3" /> Routine Record
                                      </span>
                                    )}
                                  </div>

                                  <h4 className="font-display font-extrabold text-white text-sm leading-tight">
                                    {rec.title}
                                  </h4>

                                  {rec.isLocked ? (
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300 leading-relaxed space-y-2.5">
                                      <div className="flex items-start gap-2">
                                        <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                        <span>This sensitive medical report is strictly locked to uphold patient privacy mandates. You must request clearance authorization.</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <p className="text-xs text-slate-300 leading-relaxed">{rec.description || 'No additional clinician diagnostic notes.'}</p>
                                      
                                      <div className="flex flex-wrap gap-4 items-center text-[10px] font-semibold text-slate-400">
                                        <span className="flex items-center gap-1">
                                          <User className="w-3.5 h-3.5" /> Uploaded by {rec.uploadedByUserName} ({rec.trustBadge === 'verified_hospital' ? 'Verified Hospital' : 'Patient Uploaded'})
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3.5 h-3.5" /> {new Date(rec.createdAt).toLocaleDateString()}
                                        </span>
                                        {rec.fileName && (
                                          <span className="bg-slate-950/40 border border-white/5 px-2 py-1 rounded-md flex items-center gap-1 text-[9px] font-mono text-slate-300">
                                            <FileText className="w-3 h-3" /> {rec.fileName} ({rec.fileSize})
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="shrink-0 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 flex justify-end">
                                  {rec.isLocked ? (
                                    <button 
                                      onClick={() => handleRequestAccessLocal(rec.id, rec.title)}
                                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition cursor-pointer"
                                    >
                                      Request Clearance
                                    </button>
                                  ) : (
                                    rec.fileContent && (
                                      <button 
                                        onClick={() => {
                                          downloadFile(rec.fileName, rec.fileContent);
                                          api.logAction('RECORD_DOWNLOAD', `Downloaded record "${rec.title}" for patient ${selectedPatientId}`);
                                        }}
                                        className="inline-flex items-center gap-1.5 bg-[#4f8cff]/10 hover:bg-[#4f8cff]/20 text-[#5da9ff] border border-[#4f8cff]/20 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                                      >
                                        <Download className="w-3.5 h-3.5" /> Download Report
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Certified Diagnostic Document Uploader Form */}
                    <div className="glass-card border border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
                      <div className="flex items-center gap-2">
                        <FilePlus className="w-5 h-5 text-[#4f8cff]" />
                        <div>
                          <h3 className="font-display font-bold text-white text-sm">Upload Certified Diagnostic Report</h3>
                          <p className="text-[11px] text-slate-400">Directly sync signed laboratory results or clinical discharge summaries.</p>
                        </div>
                      </div>

                      <form onSubmit={handleDocUploadForPatient} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Document Title</label>
                            <input 
                              type="text" 
                              required 
                              value={docUploadTitle} 
                              onChange={e => setDocUploadTitle(e.target.value)} 
                              placeholder="e.g. Chest X-Ray Report" 
                              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#090d23]/80 text-xs font-semibold outline-none text-white focus:border-[#4f8cff] placeholder-slate-500" 
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Category</label>
                            <select 
                              value={docUploadCategory} 
                              onChange={e => setDocUploadCategory(e.target.value as any)} 
                              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#090d23] text-xs font-bold outline-none text-white focus:border-[#4f8cff]"
                            >
                              <option className="bg-[#050816]">Lab Report</option>
                              <option className="bg-[#050816]">Prescription</option>
                              <option className="bg-[#050816]">Scan</option>
                              <option className="bg-[#050816]">Discharge Summary</option>
                              <option className="bg-[#050816]">Other</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Diagnoses / Diagnostic Notes</label>
                          <textarea 
                            value={docUploadDesc} 
                            onChange={e => setDocUploadDesc(e.target.value)} 
                            placeholder="Provide details of findings, clear observations, and critical parameters..." 
                            rows={3} 
                            className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#090d23]/80 text-xs outline-none text-white focus:border-[#4f8cff] resize-none font-medium placeholder-slate-500" 
                          />
                        </div>

                        {/* Custom File Upload Box with drag & drop support */}
                        <div className="border border-dashed border-white/10 hover:border-[#4f8cff] rounded-2xl p-5 text-center cursor-pointer hover:bg-[#4f8cff]/5 transition relative">
                          <input 
                            type="file" 
                            required 
                            accept="image/*,application/pdf" 
                            onChange={handleFileChange} 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                          />
                          <div className="space-y-1">
                            <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                            <span className="block text-xs font-bold text-white">
                              {docUploadFile ? docUploadFile.name : 'Choose file or drag and drop here'}
                            </span>
                            <span className="block text-[9px] text-slate-400 font-mono uppercase">
                              {docUploadFile ? docUploadFile.size : 'PDF, PNG, JPG up to 10MB'}
                            </span>
                          </div>
                        </div>

                        <button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-[#4f8cff] to-[#7c5cff] text-white font-bold py-3 rounded-xl text-xs tracking-wide transition shadow-lg cursor-pointer"
                        >
                          Upload & Sync Report to Timeline
                        </button>
                      </form>
                    </div>

                  </div>

                </div>

              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Search query box */}
                <div className="glass-card border border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
                  <h3 className="font-display font-extrabold text-white text-sm flex items-center gap-2">
                    <Search className="w-5 h-5 text-[#4f8cff]" /> Clinician Registry Lookup
                  </h3>
                  <p className="text-xs text-slate-400">
                    Query patient profiles securely across partner databases. Lookup by Patient ID (exact/partial), Full Name, or mobile phone number.
                  </p>

                  <form onSubmit={handleGeneralSearch} className="flex gap-2.5">
                    <input 
                      type="text" 
                      required
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Enter ID (PAT-100001), Name (John Doe), or Phone (+1...)"
                      className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-[#090d23]/80 text-xs font-bold outline-none text-white focus:border-[#4f8cff] placeholder-slate-500" 
                    />
                    <button 
                      type="submit"
                      className="bg-gradient-to-r from-[#4f8cff] to-[#7c5cff] hover:opacity-95 text-white font-bold px-6 py-3 rounded-xl text-xs tracking-wide transition shadow-md shrink-0 cursor-pointer"
                    >
                      Search Registry
                    </button>
                  </form>
                </div>

                {/* Results display */}
                {searchResults.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-display font-bold text-slate-400 text-xs uppercase tracking-wider font-mono">Search Results matches</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.map((p: any) => (
                        <div key={p.patientId} className="glass-card border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <div className="h-9 w-9 rounded-xl bg-[#4f8cff]/10 text-[#5da9ff] font-extrabold text-xs flex items-center justify-center uppercase shrink-0">
                                {p.name.slice(0, 2)}
                              </div>
                              <div>
                                <h5 className="font-display font-bold text-white text-sm leading-tight">{p.name}</h5>
                                <span className="text-[10px] text-slate-400 font-mono font-bold">{p.patientId}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 mt-4 border-t border-white/5 pt-3">
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold font-mono">Gender & Age</span>
                                <span className="font-semibold text-white">{p.gender} • {p.age} yrs</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold font-mono">Blood Group</span>
                                <span className="font-semibold text-white">{p.bloodGroup}</span>
                              </div>
                              <div className="mt-2 col-span-2">
                                <span className="text-slate-400 block text-[9px] uppercase font-bold font-mono">Contact hotline</span>
                                <span className="font-mono text-slate-300">{p.phone}</span>
                              </div>
                            </div>
                          </div>

                          <button 
                            onClick={() => handleInspectPatient(p.patientId)}
                            className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-2 rounded-xl text-xs transition border border-white/10 cursor-pointer"
                          >
                            Inspect Patient Profile
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="glass-card border border-white/5 rounded-3xl p-16 text-center text-slate-400 space-y-4">
                    <Activity className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
                    <div>
                      <h4 className="font-display font-bold text-slate-300 text-sm">Interactive Clinician Search Console</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                        Input a patient registry key, emergency contact, or full clinician database name above to begin profile inspections.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            )}

          </motion.div>
        )}

        {/* 3. PATIENT RECORDS TIMELINE DIRECTORY */}
        {activeTab === 'records' && (
          <motion.div 
            key="records"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            id="view-records-directory" 
            className="space-y-6"
          >
            
            <div className="glass-card border border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-extrabold text-white text-sm">Centralized Patients Records Directory</h3>
                  <p className="text-xs text-slate-400">Review all patient profiles currently active on this regional node database.</p>
                </div>
                
                <input 
                  type="text" 
                  value={dirFilter}
                  onChange={e => setDirFilter(e.target.value)}
                  placeholder="Filter by ID, name, phone..."
                  className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#090d23] text-xs text-white focus:border-[#4f8cff] outline-none w-full sm:w-64"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 uppercase tracking-wider text-[10px] font-bold font-mono">
                      <th className="py-3 px-4">Patient Profile</th>
                      <th className="py-3 px-4">Gender & Age</th>
                      <th className="py-3 px-4">Blood Group</th>
                      <th className="py-3 px-4">Last Timeline Visit</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium text-white">
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500 font-semibold">
                          No registered patients found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map((p: any) => (
                        <tr key={p.patientId} className="hover:bg-white/5 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#4f8cff]/10 text-[#5da9ff] flex items-center justify-center font-bold uppercase shrink-0">
                                {p.name.slice(0, 2)}
                              </div>
                              <div>
                                <span className="font-bold text-white block leading-tight">{p.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono font-bold block">{p.patientId}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {p.gender} • {p.age} yrs
                          </td>
                          <td className="py-3.5 px-4 text-teal-400 font-mono font-bold">
                            {p.bloodGroup}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono">
                            {p.lastVisit}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button 
                              onClick={() => handleInspectPatient(p.patientId)}
                              className="text-[#4f8cff] hover:underline font-bold inline-flex items-center gap-1 bg-transparent border-none cursor-pointer"
                            >
                              <Eye className="w-4 h-4" /> View Profile
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        )}

        {/* 4. PENDING REQUESTS TAB */}
        {activeTab === 'pending' && (
          <motion.div 
            key="pending"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            id="view-pending-clearance" 
            className="space-y-6"
          >
            
            <div className="glass-card border border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-white text-sm">Clearance Access Requests Pending</h3>
                <p className="text-xs text-slate-400">Practitioners are requesting authorization to inspect sensitive medical files.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.pendingAccessRequests === 0 ? (
                  <div className="col-span-2 py-16 text-center text-slate-500 space-y-2">
                    <Shield className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
                    <div>
                      <p className="text-sm font-semibold text-slate-400">No clearance requests currently pending</p>
                      <p className="text-xs text-slate-500">All submitted requests have been responded to by patients.</p>
                    </div>
                  </div>
                ) : (
                  doctorData.pendingRequests.map((req: any) => (
                    <div key={req.id} className="bg-[#090d23]/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-4 shadow-lg">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="block font-bold text-xs text-white">File: "{req.recordTitle}"</span>
                            <span className="block text-[10px] text-slate-400 uppercase font-bold font-mono mt-0.5">Patient ID: {req.patientId}</span>
                          </div>
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shrink-0 font-mono">
                            Awaiting response
                          </span>
                        </div>

                        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-white/5 font-mono">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span>Submitted on {new Date(req.requestedAt).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-semibold font-mono">
                        <span>Awaiting Patient Auth</span>
                        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </motion.div>
        )}

        {/* 5. APPROVED RECORDS TAB */}
        {activeTab === 'approved' && (
          <motion.div 
            key="approved"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            id="view-approved-clearance" 
            className="space-y-6"
          >
            
            <div className="glass-card border border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-white text-sm">Active Approved Clearance Reports</h3>
                <p className="text-xs text-slate-400">Sensitive patient documents currently unlocked. Access decays 24 hours after patient approval.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.approvedAccessRequests === 0 ? (
                  <div className="col-span-2 py-16 text-center text-slate-500 space-y-2">
                    <Lock className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
                    <div>
                      <p className="text-sm font-semibold text-slate-400">No active clearance keys approved</p>
                      <p className="text-xs text-slate-500">Submit requests under patient profiles to initiate clearance locks.</p>
                    </div>
                  </div>
                ) : (
                  doctorData.pastRequests.filter((r: any) => r.status === 'approved' && getAccessTimer(r.respondedAt) !== 'Expired').map((req: any) => (
                    <div key={req.id} className="bg-[#090d23]/80 border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between gap-4 shadow-lg">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="block font-bold text-xs text-white">"{req.recordTitle}"</span>
                            <span className="block text-[10px] text-slate-400 uppercase font-bold font-mono mt-0.5">Patient ID: {req.patientId}</span>
                          </div>
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 font-mono">
                            Clearance Active
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10">
                          <div>
                            <span className="text-[8px] uppercase font-bold text-slate-400 font-mono">Approved on</span>
                            <span className="font-semibold text-white block">{req.respondedAt ? new Date(req.respondedAt).toLocaleDateString() : 'Today'}</span>
                          </div>
                          <div>
                            <span className="text-[8px] uppercase font-bold text-slate-400 font-mono">Decay Countdown</span>
                            <span className="font-bold text-rose-400 flex items-center gap-0.5 block font-mono">
                              <Clock className="w-3.5 h-3.5" /> {getAccessTimer(req.respondedAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleInspectPatient(req.patientId)}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" /> Open Unlocked Timeline
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </motion.div>
        )}

        {/* 6. PRESCRIPTIONS TAB */}
        {activeTab === 'prescriptions' && (
          <motion.div 
            key="prescriptions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            id="view-all-prescriptions" 
            className="space-y-6"
          >
            
            <div className="glass-card border border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-white text-sm">Issued Treatment Prescriptions Log</h3>
                <p className="text-xs text-slate-400">Chronological ledger log of all treatment directions written by you.</p>
              </div>

              <div className="space-y-4">
                {(doctorData.recentPrescriptions || []).length === 0 ? (
                  <div className="py-16 text-center text-slate-500 space-y-2">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-sm font-semibold text-slate-400">No issued prescriptions recorded yet.</p>
                  </div>
                ) : (
                  (doctorData.recentPrescriptions || []).map((p: any) => (
                    <div key={p.id} className="glass-card border border-white/5 hover:border-[#4f8cff]/30 rounded-2xl p-5 transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-[#4f8cff]/10 text-[#5da9ff] border border-[#4f8cff]/20 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider font-mono">
                              {p.id}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold font-mono">
                              Patient ID: {p.patientId}
                            </span>
                          </div>

                          <h4 className="font-display font-extrabold text-white text-sm leading-tight">
                            Diagnosis: "{p.diagnosis}"
                          </h4>

                          <div className="pt-2 space-y-1">
                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">Medications and dosages</span>
                            <div className="flex flex-wrap gap-2">
                              {p.medications?.map((m: any, idx: number) => (
                                <span key={idx} className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-xs font-semibold text-white block">
                                  {m.name} ({m.dosage}) - {m.frequency} for {m.duration}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 font-mono shrink-0">
                          {new Date(p.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </motion.div>
        )}

        {/* 7. PROFILE TAB */}
        {activeTab === 'profile' && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            id="view-profile-page" 
            className="space-y-6"
          >
            
            <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/5">
                <div>
                  <h3 className="font-display font-extrabold text-white text-base leading-snug">Practitioner Clinical Profile</h3>
                  <p className="text-xs text-slate-400">Review your verification credentials, hospital affiliation, and edit about summaries.</p>
                </div>
                
                {!isEditingProfile && (
                  <button 
                    onClick={() => setIsEditingProfile(true)}
                    className="bg-[#4f8cff] hover:bg-[#5da9ff] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" /> Edit Professional Bio
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Full Doctor Name</label>
                      <input 
                        type="text" 
                        required 
                        value={profName} 
                        onChange={e => setProfName(e.target.value)} 
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#090d23]/80 text-xs text-white font-semibold outline-none focus:border-[#4f8cff] placeholder-slate-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Clinic Contact Phone</label>
                      <input 
                        type="text" 
                        required 
                        value={profPhone} 
                        onChange={e => setProfPhone(e.target.value)} 
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#090d23]/80 text-xs text-white font-semibold outline-none focus:border-[#4f8cff] placeholder-slate-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Clinical Department</label>
                      <input 
                        type="text" 
                        required 
                        value={profDept} 
                        onChange={e => setProfDept(e.target.value)} 
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#090d23]/80 text-xs text-white font-semibold outline-none focus:border-[#4f8cff] placeholder-slate-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Specialization</label>
                      <input 
                        type="text" 
                        required 
                        value={profSpec} 
                        onChange={e => setProfSpec(e.target.value)} 
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#090d23]/80 text-xs text-white font-semibold outline-none focus:border-[#4f8cff] placeholder-slate-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Experience (e.g. 15 years)</label>
                      <input 
                        type="text" 
                        required 
                        value={profExp} 
                        onChange={e => setProfExp(e.target.value)} 
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#090d23]/80 text-xs text-white font-semibold outline-none focus:border-[#4f8cff] placeholder-slate-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Profile Photo URL</label>
                      <input 
                        type="text" 
                        required 
                        value={profPic} 
                        onChange={e => setProfPic(e.target.value)} 
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#090d23]/80 text-xs text-white font-semibold outline-none focus:border-[#4f8cff] placeholder-slate-500" 
                      />
                    </div>
                  </div>

                  {/* Preset photo click list */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Or select preset professional photo</span>
                    <div className="flex gap-3">
                      {[
                        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
                        'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300',
                        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
                        'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300'
                      ].map((url, i) => (
                        <button 
                          key={i} 
                          type="button" 
                          onClick={() => setProfPic(url)}
                          className={`relative rounded-xl overflow-hidden border-2 w-12 h-12 transition shrink-0 cursor-pointer ${profPic === url ? 'border-[#4f8cff] scale-95 shadow-md shadow-[#4f8cff]/20' : 'border-transparent hover:border-slate-500'}`}
                        >
                          <img src={url} alt="preset doc" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Biographical / Professional Summary</label>
                    <textarea 
                      required 
                      value={profAbout} 
                      onChange={e => setProfAbout(e.target.value)} 
                      rows={4} 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#090d23]/80 text-xs outline-none text-white focus:border-[#4f8cff] resize-none font-medium placeholder-slate-500" 
                    />
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button 
                      type="submit" 
                      disabled={saveLoading}
                      className="bg-[#4f8cff] hover:bg-[#5da9ff] text-white font-bold px-6 py-2.5 rounded-xl text-xs transition disabled:opacity-40 cursor-pointer shadow-md"
                    >
                      {saveLoading ? 'Synchronizing secure credentials...' : 'Save credentials'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditingProfile(false)}
                      className="bg-white/5 hover:bg-white/10 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition border border-white/10 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  <div className="md:col-span-1 space-y-4 text-center">
                    <img 
                      src={profPic} 
                      alt="Dr. profile" 
                      className="w-40 h-40 rounded-3xl object-cover border-2 border-white/10 shadow-lg mx-auto bg-slate-950" 
                    />
                    <div>
                      <h4 className="font-display font-extrabold text-white text-base leading-tight">Dr. {profName}</h4>
                      <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5 font-mono">{profSpec}</p>
                    </div>

                    <div className="pt-2">
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border border-emerald-500/20 font-mono">
                        License Verified
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-4 font-mono">
                      <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4">
                        <span className="block text-[9px] uppercase font-bold text-slate-400">Clinical Department</span>
                        <span className="font-bold text-white text-xs mt-0.5 block">{profDept}</span>
                      </div>

                      <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4">
                        <span className="block text-[9px] uppercase font-bold text-slate-400">Medical License Number</span>
                        <span className="font-bold text-[#5da9ff] text-xs mt-0.5 block">{doctor.licenseNumber}</span>
                      </div>

                      <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4">
                        <span className="block text-[9px] uppercase font-bold text-slate-400">Registry Hotline Phone</span>
                        <span className="font-bold text-white text-xs mt-0.5 block">{profPhone || '+1 (555) 234-5678'}</span>
                      </div>

                      <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4">
                        <span className="block text-[9px] uppercase font-bold text-slate-400">Decentralized email</span>
                        <span className="font-bold text-white text-xs mt-0.5 block">{doctor.email}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-bold text-xs text-slate-400 uppercase tracking-wider font-mono">Clinical Biography</h4>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 border border-white/5 rounded-2xl p-4">
                        {profAbout || 'No biographical information set yet. Introduce your medical expertise, previous positions, and clinical scope.'}
                      </p>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </motion.div>
        )}

        {/* 8. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            id="view-settings-page" 
            className="space-y-6"
          >
            
            <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
              <div>
                <h3 className="font-display font-extrabold text-white text-base leading-snug">Console Configurations</h3>
                <p className="text-xs text-slate-400">Customize decentralized portal preferences, cryptographic printouts, and digital signatures.</p>
              </div>

              <div className="divide-y divide-white/5 space-y-4">
                
                <div className="flex justify-between items-center py-3">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-200 text-xs block">Timeline Alert Notifications</span>
                    <span className="text-[11px] text-slate-400 block max-w-sm">Trigger audible notifications when patients grant or deny clearance access requested by you.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifPref} 
                    onChange={e => setNotifPref(e.target.checked)} 
                    className="w-4.5 h-4.5 text-[#4f8cff] focus:ring-[#4f8cff] rounded border-white/10 bg-[#090d23] cursor-pointer" 
                  />
                </div>

                <div className="flex justify-between items-center py-3 pt-4">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-200 text-xs block">Digital Signature PIN security</span>
                    <span className="text-[11px] text-slate-400 block max-w-sm">Decentralized authorization PIN required for signing clinical scripts and uploading records.</span>
                  </div>
                  <input 
                    type="password" 
                    value={sigPin} 
                    onChange={e => setSigPin(e.target.value)} 
                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-950 text-xs text-right outline-none text-white font-mono w-28 focus:border-[#4f8cff]" 
                  />
                </div>

                <div className="flex justify-between items-center py-3 pt-4">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-200 text-xs block">Theme Workspace Profile</span>
                    <span className="text-[11px] text-slate-400 block max-w-sm">Adjust rendering style preferences for eye strain relief during night rounds.</span>
                  </div>
                  <select 
                    value={themeMode} 
                    onChange={e => setThemeMode(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-white/10 text-xs outline-none bg-[#090d23] text-white font-bold focus:border-[#4f8cff]"
                  >
                    <option className="bg-[#050816]" value="dark">Twilight Dark (Active)</option>
                    <option className="bg-[#050816]" value="light">Clinical Light (Simulated)</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#090d23]/80 rounded-2xl p-4 border border-white/5 text-xs leading-relaxed text-slate-400 font-medium flex items-start gap-2.5">
                <Shield className="w-5 h-5 text-[#4f8cff] shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-bold text-slate-200 block mb-0.5 font-mono">Automated Backups Synchronized</span>
                  All clinical credentials are fully encrypted and replicated across partner hospitals. Decentralized record timelines prevent downtime or single-point clinical failure.
                </div>
              </div>
            </div>

          </motion.div>
        )}
        </AnimatePresence>

      </main>

    </div>
  );
}
