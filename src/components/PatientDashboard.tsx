import React from 'react';
import { motion } from 'motion/react';
import { 
  User, Shield, ShieldAlert, FileText, Plus, Trash2, Download, 
  CheckCircle, XCircle, FileUp, Key, Calendar, Mail, Heart, Sparkles, 
  Clock, ShieldCheck, HelpCircle, Edit3, X, Activity, Info, Copy, Check
} from 'lucide-react';
import { MedicalRecord, Patient } from '../types';

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
}: PatientDashboardProps) {
  if (!patientData) return null;

  const { patient, records, pendingRequests } = patientData;
  const [copied, setCopied] = React.useState(false);

  // Function to copy Patient ID safely
  const copyPatientId = () => {
    navigator.clipboard.writeText(patient.patientId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Timeline list sorted by date descending
  const sortedRecords = [...(records || [])].sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Calculate some analytics
  const totalReports = records?.length || 0;
  const sensitiveReports = records?.filter((r: any) => r.isSensitive).length || 0;
  const verifiedReports = records?.filter((r: any) => r.trustBadge === 'verified_hospital').length || 0;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Top Welcome Banner + Medical ID Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Welcome Section */}
        <div className="lg:col-span-8 bg-gradient-to-tr from-[#0a0f2b] to-[#0f173b] border border-white/10 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-[#4f8cff] opacity-10 blur-3xl pointer-events-none animate-pulse-slow" />
          
          <div className="space-y-3 relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-[#4f8cff]/10 border border-[#4f8cff]/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#5da9ff]">
              <Sparkles className="w-3.5 h-3.5" /> HealthOrbit Patient Vault
            </span>
            <h2 className="font-display text-3xl sm:text-4.5xl font-black tracking-tight leading-tight">
              Welcome Back, <span className="bg-gradient-to-r from-white via-[#86b0ff] to-[#5da9ff] bg-clip-text text-transparent">{patientData.name || 'Patient'}</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Your patient vault is secure. Oversee unified clinic timelines, inspect automated access requests, and manage cryptographic files safely.
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

        {/* Dynamic Digital Membership Card */}
        <motion.div 
          whileHover={{ y: -4, borderColor: "rgba(79,140,255,0.4)" }}
          className="lg:col-span-4 bg-gradient-to-br from-[#1b1c3d]/90 via-[#0d0e2c]/95 to-[#12133a]/90 border border-[#4f8cff]/25 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between shadow-[0_15px_30px_rgba(0,0,0,0.4)] transition-all duration-300"
        >
          {/* Microchip styling element */}
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
              Share this key with physicians to let them request clearance or link certified medical logs directly to your profile.
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

      {/* Stats Board */}
      <div className="grid grid-cols-3 gap-5">
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/5 text-left space-y-1 hover:border-[#4f8cff]/20 transition-all">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Timeline Files</span>
          <span className="text-2xl sm:text-3xl font-display font-black text-white font-mono block">{totalReports}</span>
          <span className="text-[9px] text-slate-500 block">Encrypted records stored</span>
        </div>
        
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/5 text-left space-y-1 hover:border-amber-500/20 transition-all">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Privacy Locked Files</span>
          <span className="text-2xl sm:text-3xl font-display font-black text-amber-400 font-mono block">{sensitiveReports}</span>
          <span className="text-[9px] text-slate-500 block">Require doctor credentials</span>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/5 text-left space-y-1 hover:border-emerald-500/20 transition-all">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Verified Clinic Logs</span>
          <span className="text-2xl sm:text-3xl font-display font-black text-emerald-400 font-mono block">{verifiedReports}</span>
          <span className="text-[9px] text-slate-500 block">Signed by partner clinics</span>
        </div>
      </div>

      {/* Clearance Access Requests Alerts */}
      {pendingRequests && pendingRequests.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-6 space-y-4 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/15 border border-rose-500/25 rounded-2xl text-rose-400 shrink-0">
              <ShieldAlert className="w-5.5 h-5.5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-white">Practitioner Clearance Access Pending</h3>
              <p className="text-[11px] text-slate-300">Registered clinicians are requesting authority to inspect locked sensitive timeline reports.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req: any) => (
              <div key={req.id} className="bg-[#0c0d24]/90 border border-rose-500/25 rounded-2xl p-5 flex flex-col justify-between gap-5 shadow-lg">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="block font-bold text-sm text-white">Dr. {req.doctorName}</span>
                      <span className="block text-[10px] text-rose-300 uppercase font-bold font-mono tracking-wider">{req.doctorSpecialization} • {req.hospitalName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-200 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                    <FileText className="w-4 h-4 text-rose-400" />
                    <span className="font-semibold truncate">File: "{req.recordTitle}"</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleRespondAccess(req.id, 'approved')}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold py-3 rounded-xl transition cursor-pointer shadow-md"
                  >
                    Grant Clearance
                  </button>
                  <button 
                    onClick={() => handleRespondAccess(req.id, 'rejected')}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-rose-400 text-xs font-bold py-3 rounded-xl transition cursor-pointer"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main split screen layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Columns (Records Timeline) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h3 className="font-display text-lg font-bold text-white">Clinical health history</h3>
              <p className="text-xs text-slate-400">Your unified cryptographic ledger.</p>
            </div>
          </div>

          {sortedRecords.length === 0 ? (
            <div className="glass-card border border-white/5 rounded-3xl p-16 text-center space-y-4">
              <div className="h-16 w-16 bg-slate-950/80 border border-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-display font-bold text-sm text-white">Your Medical Timeline is Empty</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Upload diagnostic logs, prescriptions, or laboratory panel summaries to establish your unified timeline.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative pl-5 sm:pl-8 space-y-6 border-l border-white/10 py-1 ml-3 sm:ml-4">
              
              {sortedRecords.map((rec: MedicalRecord) => {
                // Style variables for category capsules
                let categoryColor = "bg-[#4f8cff]/10 text-[#5da9ff] border-[#4f8cff]/20";
                if (rec.category === 'Lab Report') categoryColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                if (rec.category === 'Prescription') categoryColor = "bg-purple-500/10 text-purple-400 border-purple-500/20";
                if (rec.category === 'Scan') categoryColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                if (rec.category === 'Discharge Summary') categoryColor = "bg-teal-500/10 text-teal-400 border-teal-500/20";

                return (
                  <motion.div 
                    key={rec.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative group"
                  >
                    {/* Timeline Node circular bullet */}
                    <div className="absolute left-[-29px] sm:left-[-41px] top-4.5 h-4 w-4 rounded-full bg-[#050816] border-[3px] border-[#4f8cff] group-hover:scale-110 transition duration-300 z-10" />
                    
                    <div className="glass-card border border-white/5 hover:border-[#4f8cff]/35 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(79,140,255,0.04)]">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-5">
                        
                        {/* Record core details */}
                        <div className="space-y-3 flex-1 min-w-0">
                          
                          {/* Top Meta pills panel */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`border px-2.5 py-0.75 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono ${categoryColor}`}>
                              {rec.category}
                            </span>

                            {rec.isSensitive && (
                              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.75 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                                <ShieldAlert className="w-3.5 h-3.5" /> Privacy Lock
                              </span>
                            )}

                            {rec.trustBadge === 'verified_hospital' ? (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.75 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 font-mono" title="Certified & directly uploaded by a partner medical hospital.">
                                <ShieldCheck className="w-3.5 h-3.5" /> Clinic Verified
                              </span>
                            ) : (
                              <span className="bg-white/5 text-slate-300 border border-white/10 px-2.5 py-0.75 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 font-mono" title="Personally ingested by the patient.">
                                <User className="w-3.5 h-3.5 text-slate-400" /> Patient Reported
                              </span>
                            )}
                          </div>

                          {/* Record Title */}
                          <h4 className="font-display font-extrabold text-white text-base leading-snug">
                            {rec.title}
                          </h4>

                          {/* Record Notes Description */}
                          <p className="text-slate-300 text-xs leading-relaxed font-normal">
                            {rec.description || 'No medical description notes provided.'}
                          </p>

                          {/* File badge details block */}
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-white/5 max-w-max">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span className="max-w-[200px] sm:max-w-xs truncate text-slate-300">{rec.fileName}</span>
                            <span className="text-slate-500">({rec.fileSize})</span>
                          </div>

                        </div>

                        {/* Record Actions and upload meta */}
                        <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-4 shrink-0 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-3.5 sm:pt-0">
                          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {new Date(rec.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>

                          <div className="flex gap-2">
                            <button 
                              onClick={() => downloadFile(rec.fileName, rec.fileContent)}
                              className="p-2.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-[#4f8cff]/30 transition-all cursor-pointer flex items-center justify-center"
                              title="Download Report File"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteRecord(rec.id)}
                              className="p-2.5 text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer flex items-center justify-center"
                              title="Delete File from Timeline"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                );
              })}

            </div>
          )}
        </div>

        {/* Right Column (Forms & Profile) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Upload New Medical Record Form */}
          <div className="glass-card border border-white/10 rounded-3xl p-6 space-y-5 shadow-lg relative overflow-hidden">
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2.5">
              <FileUp className="w-5 h-5 text-[#4f8cff]" /> Timeline Ingestion Engine
            </h3>
            
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
                  placeholder="e.g. Annual lipid panel, cholesterol is elevated." 
                  rows={2} 
                  className="w-full px-3.5 py-2.5 rounded-xl premium-input text-xs font-semibold outline-none resize-none text-white placeholder-slate-500" 
                />
              </div>

              {/* Sensitive Toggle */}
              <div className="bg-slate-950/60 border border-white/5 p-3.5 rounded-2xl flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold text-white flex items-center gap-1.5 font-mono">
                    <ShieldAlert className="w-4 h-4 text-amber-500 animate-pulse" /> Apply Sensitive Lock
                  </span>
                  <p className="text-[9px] text-slate-400 leading-normal mt-1">
                    Hides report from physician search directories until you grant clearance keys manually.
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={uploadIsSensitive} 
                  onChange={e => setUploadIsSensitive(e.target.checked)} 
                  className="w-5 h-5 text-teal-600 focus:ring-teal-500 rounded border-white/10 bg-[#090d23] cursor-pointer shrink-0" 
                />
              </div>

              {/* Custom File Upload Box */}
              <div className="border border-dashed border-white/10 hover:border-[#4f8cff] rounded-2xl p-5 text-center cursor-pointer hover:bg-[#4f8cff]/5 transition-colors relative">
                <input 
                  type="file" 
                  required 
                  accept="image/*,application/pdf" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                />
                <div className="space-y-2">
                  <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                  <span className="block text-xs font-bold text-white">
                    {uploadFile ? uploadFile.name : 'Choose file or drag here'}
                  </span>
                  <span className="block text-[9px] text-slate-400 font-mono uppercase">
                    {uploadFile ? uploadFile.size : 'PDF, PNG, JPG up to 10MB'}
                  </span>
                </div>
              </div>

              {duplicateWarning && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-[10px] font-bold text-amber-400 leading-normal font-mono">
                  ⚠️ {duplicateWarning}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#4f8cff] to-[#7c5cff] text-white shadow-lg shadow-[#4f8cff]/20 font-bold py-3.5 rounded-xl text-xs tracking-wide transition hover:opacity-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Safeguard Timeline Record
              </button>
            </form>
          </div>

          {/* Lifesaving Emergency Card Detail Panel */}
          <div className="glass-card border border-white/10 rounded-3xl p-6 space-y-4 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" /> Emergency Card Vitals
              </h3>
              <button 
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-[10px] font-bold text-[#4f8cff] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
              >
                {isEditingProfile ? 'Cancel' : <><Edit3 className="w-3.5 h-3.5" /> Edit Vitals</>}
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              These clinical parameters are immediately accessible by First Responders (EMTs) during emergency rescues. Ensure values are accurate.
            </p>

            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4 pt-1">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Severe Allergies</label>
                  <input 
                    type="text" 
                    value={editAllergies} 
                    onChange={e => setEditAllergies(e.target.value)} 
                    placeholder="e.g. Penicillin, Peanuts" 
                    className="w-full px-3.5 py-2 rounded-xl premium-input text-xs text-white outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Chronic Diseases</label>
                  <input 
                    type="text" 
                    value={editDiseases} 
                    onChange={e => setEditDiseases(e.target.value)} 
                    placeholder="e.g. Asthma, Hypertension" 
                    className="w-full px-3.5 py-2 rounded-xl premium-input text-xs text-white outline-none" 
                  />
                </div>
                
                <div className="border-t border-white/5 pt-3.5 space-y-3">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Emergency Contact Guardian</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Guardian Name" 
                      value={editContactName} 
                      onChange={e => setEditContactName(e.target.value)} 
                      className="px-3.5 py-2 rounded-xl premium-input text-xs text-white outline-none" 
                    />
                    <input 
                      type="text" 
                      placeholder="Guardian Phone" 
                      value={editContactPhone} 
                      onChange={e => setEditContactPhone(e.target.value)} 
                      className="px-3.5 py-2 rounded-xl premium-input text-xs text-white outline-none" 
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Relation (e.g. Spouse, Parent)" 
                    value={editContactRelation} 
                    onChange={e => setEditContactRelation(e.target.value)} 
                    className="w-full px-3.5 py-2 rounded-xl premium-input text-xs text-white outline-none" 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md hover:opacity-95 cursor-pointer"
                >
                  Save Vitals Update
                </button>
              </form>
            ) : (
              <div className="space-y-4 divide-y divide-white/5 pt-1">
                <div className="text-xs space-y-3">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Severe Allergies</span>
                    <span className="font-bold text-rose-400 text-sm">{patient.allergies || 'None declared'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Chronic Diseases</span>
                    <span className="font-bold text-white text-sm">{patient.chronicDiseases || 'None declared'}</span>
                  </div>
                </div>

                <div className="pt-4 text-xs space-y-2">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Emergency Contact</span>
                  {patient.emergencyContactName ? (
                    <div className="bg-slate-950/40 border border-white/5 p-3.5 rounded-2xl space-y-1">
                      <span className="font-extrabold text-white block text-xs">{patient.emergencyContactName}</span>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider font-mono">{patient.emergencyContactRelation}</span>
                      <span className="text-[11px] text-[#4f8cff] font-mono block font-bold pt-1">{patient.emergencyContactPhone}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic block text-xs">No emergency contact set.</span>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
