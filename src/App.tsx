import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity } from 'lucide-react';
import { api } from './api';
import { Toast as ToastType, User } from './types';

// Import our beautiful modular sub-components
import Toast from './components/Toast';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthForms from './components/AuthForms';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AdminDashboard from './components/AdminDashboard';
import EmergencyView from './components/EmergencyView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'patient-dashboard' | 'doctor-dashboard' | 'admin-dashboard' | 'emergency-view'>('landing');
  const [authRole, setAuthRole] = useState<'patient' | 'doctor' | 'admin'>('patient');
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O-Positive');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [hospitalId, setHospitalId] = useState('HOSP-1');

  // App General State
  const [toast, setToast] = useState<ToastType | null>(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Patient Dashboard Data
  const [patientData, setPatientData] = useState<any>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'Lab Report' | 'Prescription' | 'Scan' | 'Discharge Summary' | 'Other'>('Lab Report');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadIsSensitive, setUploadIsSensitive] = useState(false);
  const [uploadFile, setUploadFile] = useState<{ name: string; size: string; content: string } | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Edit Patient Details
  const [editDob, setEditDob] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editBlood, setEditBlood] = useState('');
  const [editAllergies, setEditAllergies] = useState('');
  const [editDiseases, setEditDiseases] = useState('');
  const [editContactName, setEditContactName] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editContactRelation, setEditContactRelation] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Doctor Dashboard Data
  const [doctorData, setDoctorData] = useState<any>(null);
  const [searchId, setSearchId] = useState('');
  const [searchedPatient, setSearchedPatient] = useState<any>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [medsList, setMedsList] = useState<{ name: string; dosage: string; frequency: string; duration: string }[]>([]);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFreq, setMedFreq] = useState('');
  const [medDur, setMedDur] = useState('');

  // Doctor Upload For Patient
  const [docUploadTitle, setDocUploadTitle] = useState('');
  const [docUploadCategory, setDocUploadCategory] = useState<'Lab Report' | 'Prescription' | 'Scan' | 'Discharge Summary' | 'Other'>('Lab Report');
  const [docUploadDesc, setDocUploadDesc] = useState('');
  const [docUploadFile, setDocUploadFile] = useState<{ name: string; size: string; content: string } | null>(null);

  // Admin Dashboard Data
  const [adminData, setAdminData] = useState<any>(null);
  const [newHospitalName, setNewHospitalName] = useState('');
  const [newHospitalAddress, setNewHospitalAddress] = useState('');

  // Emergency Look up State
  const [emergencyIdInput, setEmergencyIdInput] = useState('');
  const [emergencyProfile, setEmergencyProfile] = useState<any>(null);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Initialize Auth
  useEffect(() => {
    const token = localStorage.getItem('sihrms_token');
    if (token) {
      setLoading(true);
      api.me()
        .then(user => {
          setCurrentUser(user);
          navigateToDashboard(user);
        })
        .catch(() => {
          localStorage.removeItem('sihrms_token');
          setView('landing');
        })
        .finally(() => setLoading(false));
    }
  }, []);

  // Poll Notifications when logged in
  useEffect(() => {
    if (!currentUser) return;
    const fetchNotifications = () => {
      api.getNotifications()
        .then(res => {
          setNotifications(res);
          setUnreadCount(res.filter((n: any) => !n.read).length);
        })
        .catch(err => console.error('Failed to load notifications', err));
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const clearAuthForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setDob('');
    setGender('Male');
    setBloodGroup('O-Positive');
    setSpecialization('');
    setLicenseNumber('');
    setHospitalId('HOSP-1');
  };

  // Clear forms when switching views between landing, login, or register
  useEffect(() => {
    if (view === 'login' || view === 'register' || view === 'landing') {
      clearAuthForm();
    }
  }, [view]);

  const handleLogout = () => {
    localStorage.removeItem('sihrms_token');
    setCurrentUser(null);
    setView('landing');
    clearAuthForm();
    showToast('Logged out successfully', 'success');
  };

  const navigateToDashboard = (user: any) => {
    if (user.role === 'patient') {
      setView('patient-dashboard');
      loadPatientDashboard();
    } else if (user.role === 'doctor') {
      setView('doctor-dashboard');
      loadDoctorDashboard();
    } else if (user.role === 'admin') {
      setView('admin-dashboard');
      loadAdminDashboard();
    }
  };

  // LOAD DATA ACTIONS
  const loadPatientDashboard = () => {
    setLoading(true);
    api.getPatientDashboard()
      .then(data => {
        setPatientData(data);
        // Fill profile edit defaults
        setEditDob(data.patient.dob || '');
        setEditGender(data.patient.gender || 'Male');
        setEditBlood(data.patient.bloodGroup || 'O-Positive');
        setEditAllergies(data.patient.allergies || '');
        setEditDiseases(data.patient.chronicDiseases || '');
        setEditContactName(data.patient.emergencyContactName || '');
        setEditContactPhone(data.patient.emergencyContactPhone || '');
        setEditContactRelation(data.patient.emergencyContactRelation || '');
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  const loadDoctorDashboard = () => {
    setLoading(true);
    api.getDoctorDashboard()
      .then(data => setDoctorData(data))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  const loadAdminDashboard = () => {
    setLoading(true);
    api.getAdminDashboard()
      .then(data => setAdminData(data))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  // AUTH ACTIONS
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return showToast('Please enter credentials', 'error');

    setLoading(true);
    api.login({ email, password, role: authRole })
      .then(res => {
        localStorage.setItem('sihrms_token', res.token);
        setCurrentUser(res.user);
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        navigateToDashboard(res.user);
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return showToast('All fields are required', 'error');

    if (password.length < 8) {
      return showToast('Password must be at least 8 characters long', 'error');
    }
    if (!/[A-Z]/.test(password)) {
      return showToast('Password must contain at least one uppercase letter (A-Z)', 'error');
    }
    if (!/[a-z]/.test(password)) {
      return showToast('Password must contain at least one lowercase letter (a-z)', 'error');
    }
    if (!/[0-9]/.test(password)) {
      return showToast('Password must contain at least one number (0-9)', 'error');
    }
    if (!/[!@#$%^&*()]/.test(password)) {
      return showToast('Password must contain at least one special character (!@#$%^&*())', 'error');
    }

    setLoading(true);
    const extraData = authRole === 'patient' 
      ? { dob, gender, bloodGroup }
      : { specialization, licenseNumber, hospitalId };

    api.register({ email, password, role: authRole, name, extraData })
      .then(res => {
        localStorage.setItem('sihrms_token', res.token);
        setCurrentUser(res.user);
        showToast('Account registered successfully!', 'success');
        navigateToDashboard(res.user);
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  // PATIENT FEATURES
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    api.updateProfile({
      dob: editDob,
      gender: editGender,
      bloodGroup: editBlood,
      allergies: editAllergies,
      chronicDiseases: editDiseases,
      emergencyContactName: editContactName,
      emergencyContactPhone: editContactPhone,
      emergencyContactRelation: editContactRelation
    })
      .then(() => {
        showToast('Medical profile updated successfully', 'success');
        setIsEditingProfile(false);
        loadPatientDashboard();
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isDoc: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Content = reader.result as string;
      const fileData = {
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        content: base64Content
      };

      if (isDoc) {
        setDocUploadFile(fileData);
      } else {
        setUploadFile(fileData);
        // Check for duplicate locally first to show immediate UI warning
        if (patientData?.records) {
          const isDup = patientData.records.some((r: any) => r.fileName === file.name && r.fileSize === fileData.size);
          if (isDup) {
            setDuplicateWarning('Warning: A file with the exact same name and size already exists in your timeline!');
          } else {
            setDuplicateWarning(null);
          }
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !uploadFile) return showToast('Please provide a title and select a report file', 'error');

    setLoading(true);
    api.uploadRecord({
      title: uploadTitle,
      description: uploadDesc,
      category: uploadCategory,
      fileName: uploadFile.name,
      fileSize: uploadFile.size,
      fileContent: uploadFile.content,
      isSensitive: uploadIsSensitive
    })
      .then(() => {
        showToast('Medical record uploaded successfully!', 'success');
        setUploadTitle('');
        setUploadDesc('');
        setUploadFile(null);
        setUploadIsSensitive(false);
        setDuplicateWarning(null);
        loadPatientDashboard();
      })
      .catch(err => {
        showToast(err.message, 'error');
      })
      .finally(() => setLoading(false));
  };

  const handleDeleteRecord = (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this medical report? This action is irreversible.')) return;

    setLoading(true);
    api.deleteRecord(id)
      .then(() => {
        showToast('Medical record deleted successfully', 'success');
        loadPatientDashboard();
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  const handleRespondAccess = (id: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    api.respondAccess(id, status)
      .then(() => {
        showToast(`Access request ${status} successfully`, 'success');
        loadPatientDashboard();
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  // DOCTOR ACTIONS
  const handleSearchPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId) return showToast('Please enter a Patient ID', 'error');

    setLoading(true);
    setSearchedPatient(null);
    api.searchPatient(searchId)
      .then(res => {
        setSearchedPatient(res);
        showToast(`Found records for patient ${res.patient.name}`, 'success');
      })
      .catch(err => {
        showToast(err.message, 'error');
      })
      .finally(() => setLoading(false));
  };

  const handleRequestAccess = (recordId: string) => {
    if (!searchedPatient) return;
    setLoading(true);
    api.requestAccess(searchedPatient.patient.patientId, recordId)
      .then(() => {
        showToast('Access request sent successfully! Awaiting patient approval.', 'success');
        // Reload searched patient to update pending locks
        api.searchPatient(searchedPatient.patient.patientId)
          .then(res => setSearchedPatient(res));
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !medDosage || !medFreq || !medDur) {
      return showToast('Please fill all medication fields', 'warning');
    }
    setMedsList([...medsList, { name: medName, dosage: medDosage, frequency: medFreq, duration: medDur }]);
    setMedName('');
    setMedDosage('');
    setMedFreq('');
    setMedDur('');
  };

  const handleRemoveMedication = (index: number) => {
    setMedsList(medsList.filter((_, i) => i !== index));
  };

  const handleAddPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchedPatient) return;
    if (!diagnosis) return showToast('Please enter diagnosis', 'error');
    if (medsList.length === 0) return showToast('Please add at least one medication', 'error');

    setLoading(true);
    api.addPrescription({
      patientId: searchedPatient.patient.patientId,
      diagnosis,
      medications: medsList
    })
      .then(() => {
        showToast('Prescription added successfully!', 'success');
        setDiagnosis('');
        setMedsList([]);
        // Refresh searched patient
        api.searchPatient(searchedPatient.patient.patientId)
          .then(res => setSearchedPatient(res));
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  const handleDocUploadForPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchedPatient) return;
    if (!docUploadTitle || !docUploadFile) return showToast('Please provide a title and select a report file', 'error');

    setLoading(true);
    api.uploadRecord({
      title: docUploadTitle,
      description: docUploadDesc,
      category: docUploadCategory,
      fileName: docUploadFile.name,
      fileSize: docUploadFile.size,
      fileContent: docUploadFile.content,
      isSensitive: false,
      targetPatientId: searchedPatient.patient.patientId
    })
      .then(() => {
        showToast('Medical record uploaded and linked directly to patient timeline!', 'success');
        setDocUploadTitle('');
        setDocUploadDesc('');
        setDocUploadFile(null);
        // Refresh searched patient
        api.searchPatient(searchedPatient.patient.patientId)
          .then(res => setSearchedPatient(res));
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  // ADMIN ACTIONS
  const handleVerifyDoctor = (userId: string, verify: boolean) => {
    setLoading(true);
    api.verifyDoctor(userId, verify)
      .then(() => {
        showToast(`Doctor account status ${verify ? 'verified' : 'revoked'}`, 'success');
        loadAdminDashboard();
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  const handleAddHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospitalName || !newHospitalAddress) return showToast('Please enter name and address', 'error');

    setLoading(true);
    api.addHospital({ name: newHospitalName, address: newHospitalAddress })
      .then(() => {
        showToast('New partner hospital registered successfully', 'success');
        setNewHospitalName('');
        setNewHospitalAddress('');
        loadAdminDashboard();
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  // EMERGENCY VIEW
  const handleLookupEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyIdInput) return showToast('Please enter Patient ID', 'error');

    setLoading(true);
    api.getEmergencyProfile(emergencyIdInput)
      .then(res => {
        if (res.error) {
          showToast(res.error, 'error');
          setEmergencyProfile(null);
        } else {
          setEmergencyProfile(res);
          showToast(`Emergency profile loaded for ${res.name}`, 'success');
        }
      })
      .catch(err => {
        showToast(err.message, 'error');
        setEmergencyProfile(null);
      })
      .finally(() => setLoading(false));
  };

  // NOTIFICATION UTILS
  const handleMarkRead = (id: string) => {
    api.markNotificationRead(id)
      .then(() => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      });
  };

  const handleMarkAllRead = () => {
    api.markAllNotificationsRead()
      .then(() => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        showToast('All notifications marked as read', 'success');
      });
  };

  // Helper download simulated PDF/image
  const downloadFile = (fileName: string, base64Content: string) => {
    const link = document.createElement('a');
    link.href = base64Content;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded: ${fileName}`, 'success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617]/50 text-white relative overflow-hidden">
      
      {/* Glowing Mesh Circles (Layer 2) */}
      <div className="absolute top-[-10%] left-[5%] w-[600px] h-[600px] bg-[#38bdf8]/12 rounded-full blur-[130px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[5%] w-[600px] h-[600px] bg-[#22d3ee]/10 rounded-full blur-[130px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] left-[45%] w-[350px] h-[350px] bg-[#14f195]/6 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '4s' }} />

      {/* Floating Sparkles & Clinical Ledger Particles (Layer 3) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#38bdf8]/20"
            style={{
              width: (i % 3 === 0 ? '6px' : i % 2 === 0 ? '4px' : '2.5px'),
              height: (i % 3 === 0 ? '6px' : i % 2 === 0 ? '4px' : '2.5px'),
              top: (15 + (i * 5.3) % 80) + '%',
              left: (10 + (i * 6.7) % 80) + '%',
            }}
            animate={{
              y: [0, -60, -120, -60, 0],
              x: [0, 20, -20, 10, 0],
              opacity: [0.15, 0.7, 0.15],
            }}
            transition={{
              duration: 18 + (i * 2) % 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Toast Alert Widget */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Navigation Header */}
      <Navbar 
        currentUser={currentUser}
        unreadCount={unreadCount}
        notifications={notifications}
        view={view}
        setView={setView}
        navigateToDashboard={navigateToDashboard}
        handleLogout={handleLogout}
        handleMarkAllRead={handleMarkAllRead}
        handleMarkRead={handleMarkRead}
      />

      {/* Global Syncing Loader */}
      {loading && (
        <div className="fixed inset-0 bg-[#050816]/75 backdrop-blur-md flex items-center justify-center z-[100] transition-all duration-300">
          <div className="glass-card-glowing max-w-sm w-full mx-4 p-8 rounded-3xl border border-[#4f8cff]/30 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-[#4f8cff]/20 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-t-[#4f8cff] border-r-transparent rounded-full animate-spin"></div>
              <Activity className="w-6 h-6 text-[#4f8cff] animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white tracking-wider uppercase font-display">HealthOrbit Secure Engine</p>
              <p className="text-xs text-slate-400 mt-1">Synchronizing clinical ledger ledger...</p>
            </div>
            <div className="w-full bg-slate-950/50 rounded-full h-1 overflow-hidden">
              <div className="bg-gradient-to-r from-[#4f8cff] to-[#7c5cff] h-full w-[70%] rounded-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Containers */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <LandingPage setView={setView} setAuthRole={setAuthRole} />
            </motion.div>
          )}

          {(view === 'login' || view === 'register') && (
            <motion.div
              key={view}
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <AuthForms 
                view={view}
                setView={setView}
                authRole={authRole}
                setAuthRole={setAuthRole}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                name={name}
                setName={setName}
                dob={dob}
                setDob={setDob}
                gender={gender}
                setGender={setGender}
                bloodGroup={bloodGroup}
                setBloodGroup={setBloodGroup}
                specialization={specialization}
                setSpecialization={setSpecialization}
                licenseNumber={licenseNumber}
                setLicenseNumber={setLicenseNumber}
                hospitalId={hospitalId}
                setHospitalId={setHospitalId}
                handleLogin={handleLogin}
                handleRegister={handleRegister}
              />
            </motion.div>
          )}

          {view === 'patient-dashboard' && (
            <motion.div
              key="patient-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <PatientDashboard 
                patientData={patientData}
                uploadTitle={uploadTitle}
                setUploadTitle={setUploadTitle}
                uploadCategory={uploadCategory}
                setUploadCategory={setUploadCategory}
                uploadDesc={uploadDesc}
                setUploadDesc={setUploadDesc}
                uploadIsSensitive={uploadIsSensitive}
                setUploadIsSensitive={setUploadIsSensitive}
                uploadFile={uploadFile}
                duplicateWarning={duplicateWarning}
                editDob={editDob}
                setEditDob={setEditDob}
                editGender={editGender}
                setEditGender={setEditGender}
                editBlood={editBlood}
                setEditBlood={setEditBlood}
                editAllergies={editAllergies}
                setEditAllergies={setEditAllergies}
                editDiseases={editDiseases}
                setEditDiseases={setEditDiseases}
                editContactName={editContactName}
                setEditContactName={setEditContactName}
                editContactPhone={editContactPhone}
                setEditContactPhone={setEditContactPhone}
                editContactRelation={editContactRelation}
                setEditContactRelation={setEditContactRelation}
                isEditingProfile={isEditingProfile}
                setIsEditingProfile={setIsEditingProfile}
                handleUpdateProfile={handleUpdateProfile}
                handleFileChange={handleFileChange}
                handleUploadRecord={handleUploadRecord}
                handleDeleteRecord={handleDeleteRecord}
                handleRespondAccess={handleRespondAccess}
                downloadFile={downloadFile}
              />
            </motion.div>
          )}

          {view === 'doctor-dashboard' && (
            <motion.div
              key="doctor-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <DoctorDashboard 
                doctorData={doctorData}
                searchId={searchId}
                setSearchId={setSearchId}
                searchedPatient={searchedPatient}
                diagnosis={diagnosis}
                setDiagnosis={setDiagnosis}
                medsList={medsList}
                addMedName={medName}
                setAddMedName={setMedName}
                addMedDosage={medDosage}
                setAddMedDosage={setMedDosage}
                addMedFreq={medFreq}
                setAddMedFreq={setMedFreq}
                addMedDur={medDur}
                setAddMedDur={setMedDur}
                handleAddMedication={handleAddMedication}
                handleRemoveMedication={handleRemoveMedication}
                handleSearchPatient={handleSearchPatient}
                handleRequestAccess={handleRequestAccess}
                handleAddPrescription={handleAddPrescription}
                docUploadTitle={docUploadTitle}
                setDocUploadTitle={setDocUploadTitle}
                docUploadCategory={docUploadCategory}
                setDocUploadCategory={setDocUploadCategory}
                docUploadDesc={docUploadDesc}
                setDocUploadDesc={setDocUploadDesc}
                docUploadFile={docUploadFile}
                handleFileChange={(e) => handleFileChange(e, true)}
                handleDocUploadForPatient={handleDocUploadForPatient}
                downloadFile={downloadFile}
              />
            </motion.div>
          )}

          {view === 'admin-dashboard' && (
            <motion.div
              key="admin-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <AdminDashboard 
                adminData={adminData}
                newHospitalName={newHospitalName}
                setNewHospitalName={setNewHospitalName}
                newHospitalAddress={newHospitalAddress}
                setNewHospitalAddress={setNewHospitalAddress}
                handleVerifyDoctor={handleVerifyDoctor}
                handleAddHospital={handleAddHospital}
              />
            </motion.div>
          )}

          {view === 'emergency-view' && (
            <motion.div
              key="emergency-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <EmergencyView 
                emergencyIdInput={emergencyIdInput}
                setEmergencyIdInput={setEmergencyIdInput}
                emergencyProfile={emergencyProfile}
                handleLookupEmergency={handleLookupEmergency}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Universal Footer */}
      <footer className="border-t border-white/5 bg-[#090d23]/40 py-12 text-center text-xs text-slate-400 mt-20 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex items-center justify-center space-x-2 text-white">
            <Activity className="w-5 h-5 text-[#4f8cff]" />
            <span className="font-display font-bold tracking-wider text-sm">HEALTHORBIT SECURE SUITE</span>
          </div>
          <p className="max-w-md mx-auto text-slate-400 font-sans leading-relaxed">
            Decentralized record timelines, zero-knowledge clinical clearance workflows, and instant medical interoperability ledger.
          </p>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#4f8cff]/30 to-transparent mx-auto"></div>
          <p className="text-[10px] text-slate-500 font-mono">
            © 2026 HealthOrbit Organisation. ALL DIGITAL PATIENT TRANSFERS FULLY ENCRYPTED.
          </p>
        </div>
      </footer>
    </div>
  );
}
