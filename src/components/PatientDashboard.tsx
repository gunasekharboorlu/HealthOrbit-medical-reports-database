import React from 'react';
import { motion } from 'motion/react';
import { 
  User, Shield, ShieldAlert, FileText, Plus, Trash2, Download, 
  CheckCircle, XCircle, FileUp, Key, Calendar, Mail, Heart, Sparkles, 
  Clock, ShieldCheck, HelpCircle, Edit3, X 
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

  // Function to copy Patient ID
  const copyPatientId = () => {
    navigator.clipboard.writeText(patient.patientId);
    alert('Patient ID copied to clipboard!');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Banner + Digital Medical ID Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-gradient-to-tr from-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-teal-500 opacity-10 blur-3xl" />
          
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Secure Medical Vault
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
              Hello, {patientData.name || 'Patient'}
            </h2>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Manage your dynamic clinical health files, review cryptographic trust signatures, and authorize practitioner access locks.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 items-center justify-between border-t border-white/5 pt-4">
            <div className="flex gap-6">
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider">Blood Type</span>
                <span className="text-xs font-bold text-teal-300">{patient.bloodGroup || 'Not set'}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider">Gender</span>
                <span className="text-xs font-bold text-slate-300">{patient.gender || 'Not set'}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider">Birth Date</span>
                <span className="text-xs font-bold text-slate-300">{patient.dob ? new Date(patient.dob).toLocaleDateString() : 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Clinic Membership Card */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-gradient-to-tr from-teal-600 to-teal-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between"
        >
          {/* Subtle microchip icon lookalike */}
          <div className="absolute top-6 right-6 h-10 w-12 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
            <Key className="w-5 h-5 text-teal-200" />
          </div>

          <div>
            <span className="font-display text-xs font-extrabold tracking-widest text-teal-200 block uppercase mb-1">
              Universal Clinical ID
            </span>
            <span className="block text-2xl font-mono font-bold tracking-tight mb-2">
              {patient.patientId}
            </span>
            <span className="text-[10px] text-teal-100 font-medium leading-normal block">
              Share this key with physicians to let them request clearance or link reports directly to your profile.
            </span>
          </div>

          <button 
            onClick={copyPatientId}
            className="w-full mt-6 bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-bold py-2 px-4 rounded-xl transition"
          >
            Copy ID to Clipboard
          </button>
        </motion.div>

      </div>

      {/* Pending Access Authorization Panel */}
      {pendingRequests && pendingRequests.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50/50 border border-rose-100 rounded-3xl p-6 space-y-4 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-slate-800">Clearance Access Requests Pending</h3>
              <p className="text-[11px] text-slate-500">Practitioners are requesting authorization to inspect sensitive medical files.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {pendingRequests.map((req: any) => (
              <div key={req.id} className="bg-white border border-rose-100 rounded-2xl p-4 flex flex-col justify-between gap-4">
                <div>
                  <span className="block font-bold text-xs text-slate-800">Dr. {req.doctorName}</span>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">{req.doctorSpecialization} • {req.hospitalName}</span>
                  <div className="mt-2.5 flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-600 truncate">File: "{req.recordTitle}"</span>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button 
                    onClick={() => handleRespondAccess(req.id, 'approved')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl shadow-xs transition"
                  >
                    Grant Access
                  </button>
                  <button 
                    onClick={() => handleRespondAccess(req.id, 'rejected')}
                    className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-rose-600 text-xs font-bold py-2 rounded-xl transition"
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Records Timeline) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-800">Clinical Timeline</h3>
              <p className="text-xs text-slate-400">Chronological list of all verified & personal medical documents.</p>
            </div>
          </div>

          {records && records.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xs">
              <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h4 className="font-bold text-sm text-slate-700">No medical records uploaded</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-normal">
                Upload your medical history, prescriptions, or laboratory logs to begin building your secure timeline.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((rec: MedicalRecord) => (
                <div 
                  key={rec.id}
                  className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.01)] hover:shadow-xs transition duration-200"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-2.5 flex-1">
                      {/* Meta Pill bar */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-0.75 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {rec.category}
                        </span>

                        {rec.isSensitive && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.75 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Sensitive Lock
                          </span>
                        )}

                        {rec.trustBadge === 'verified_hospital' ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.75 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" title="This document was directly submitted and signed by an accredited clinical practitioner.">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Clinic Verified
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.75 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" title="This is a personal health document submitted directly by the patient.">
                            <User className="w-3.5 h-3.5 text-slate-400" /> Patient Reported
                          </span>
                        )}
                      </div>

                      <h4 className="font-display font-bold text-slate-800 text-sm leading-snug">
                        {rec.title}
                      </h4>

                      <p className="text-xs text-slate-500 leading-normal">
                        {rec.description || 'No description notes provided.'}
                      </p>

                      {/* File Info */}
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 max-w-max">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span className="max-w-xs truncate">{rec.fileName}</span>
                        <span>({rec.fileSize})</span>
                      </div>
                    </div>

                    {/* Actions and Meta */}
                    <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-4 shrink-0 w-full sm:w-auto border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(rec.createdAt).toLocaleDateString()}
                      </span>

                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => downloadFile(rec.fileName, rec.fileContent)}
                          className="p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl border border-slate-100 hover:border-teal-200/50 transition-all"
                          title="Download medical file"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteRecord(rec.id)}
                          className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-100 hover:border-rose-200/50 transition-all"
                          title="Delete file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (Forms & Profile) */}
        <div className="space-y-6">
          
          {/* Upload New Medical Record */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
              <FileUp className="w-5 h-5 text-teal-600" /> Record Ingestion
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Upload diagnostic logs, vaccine notes, or prescriptions. All items remain client-encrypted.
            </p>

            <form onSubmit={handleUploadRecord} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Document Title</label>
                <input 
                  type="text" 
                  required 
                  value={uploadTitle} 
                  onChange={e => setUploadTitle(e.target.value)} 
                  placeholder="e.g. LabCorp Blood Panel" 
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category Type</label>
                <select 
                  value={uploadCategory} 
                  onChange={e => setUploadCategory(e.target.value as any)} 
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white font-medium outline-none"
                >
                  <option>Lab Report</option>
                  <option>Prescription</option>
                  <option>Scan</option>
                  <option>Discharge Summary</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Details / Notes</label>
                <textarea 
                  value={uploadDesc} 
                  onChange={e => setUploadDesc(e.target.value)} 
                  placeholder="e.g. Annual lipid panel, cholesterol is elevated." 
                  rows={2} 
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none resize-none" 
                />
              </div>

              {/* Sensitive Toggle */}
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-500" /> Apply Privacy Lock
                  </span>
                  <span className="block text-[9px] text-slate-400 mt-0.5 leading-normal">
                    Locks document from practitioner view until authorized.
                  </span>
                </div>
                <input 
                  type="checkbox" 
                  checked={uploadIsSensitive} 
                  onChange={e => setUploadIsSensitive(e.target.checked)} 
                  className="w-4.5 h-4.5 text-teal-600 focus:ring-teal-500 rounded border-slate-200 cursor-pointer" 
                />
              </div>

              {/* Custom File Upload Box */}
              <div className="border border-dashed border-slate-200 hover:border-teal-500 rounded-2xl p-4 text-center cursor-pointer hover:bg-teal-50/10 transition relative">
                <input 
                  type="file" 
                  required 
                  accept="image/*,application/pdf" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
                <div className="space-y-1">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <span className="block text-xs font-bold text-slate-700">
                    {uploadFile ? uploadFile.name : 'Choose file or drag here'}
                  </span>
                  <span className="block text-[9px] text-slate-400 font-mono uppercase">
                    {uploadFile ? uploadFile.size : 'PDF, PNG, JPG up to 10MB'}
                  </span>
                </div>
              </div>

              {duplicateWarning && (
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[10px] font-bold text-amber-700 leading-normal">
                  ⚠️ {duplicateWarning}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-md shadow-teal-600/10 font-bold py-3 rounded-xl text-xs tracking-wide transition hover:opacity-95"
              >
                Safeguard Report
              </button>
            </form>
          </div>

          {/* Quick Profile Overview / Emergency Profile details */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse-slow" /> Emergency Card
              </h3>
              <button 
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-[10px] font-bold text-teal-600 hover:underline flex items-center gap-1"
              >
                {isEditingProfile ? 'Cancel' : <><Edit3 className="w-3 h-3" /> Edit Profile</>}
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              These details are public-accessible for emergency EMT/First Responders in lifesaving rescues. Keep them accurate!
            </p>

            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Allergies Matrix</label>
                  <input type="text" value={editAllergies} onChange={e => setEditAllergies(e.target.value)} placeholder="e.g. Penicillin, Peanuts" className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chronic Pathologies</label>
                  <input type="text" value={editDiseases} onChange={e => setEditDiseases(e.target.value)} placeholder="e.g. Asthma, Hypertension" className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs" />
                </div>
                
                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Guardian Contact Details</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Guardian Name" value={editContactName} onChange={e => setEditContactName(e.target.value)} className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs" />
                    <input type="text" placeholder="Guardian Phone" value={editContactPhone} onChange={e => setEditContactPhone(e.target.value)} className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs" />
                  </div>
                  <input type="text" placeholder="Relation (e.g. Spouse, Parent)" value={editContactRelation} onChange={e => setEditContactRelation(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs" />
                </div>

                <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-lg text-xs transition shadow-sm">
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="space-y-3.5 divide-y divide-slate-50">
                <div className="pt-1 text-xs space-y-2">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Allergies Matrix</span>
                    <span className="font-bold text-rose-600">{patient.allergies || 'None declared'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Chronic Diseases</span>
                    <span className="font-bold text-slate-700">{patient.chronicDiseases || 'None declared'}</span>
                  </div>
                </div>

                <div className="pt-3.5 text-xs space-y-2">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Primary Emergency Contact</span>
                  {patient.emergencyContactName ? (
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">{patient.emergencyContactName}</span>
                      <span className="text-[10px] text-slate-500 block leading-tight">{patient.emergencyContactRelation} • {patient.emergencyContactPhone}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic block text-[11px]">No emergency contact set.</span>
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
