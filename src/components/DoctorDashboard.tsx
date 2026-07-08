import React from 'react';
import { motion } from 'motion/react';
import { 
  Search, ShieldAlert, BadgeCheck, FileText, Download, Plus, X, 
  FilePlus, Lock, Unlock, ClipboardList, Shield, Activity, HelpCircle, User 
} from 'lucide-react';
import { MedicalRecord, Doctor } from '../types';

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

  const doctor: Doctor = doctorData.doctor;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Clinician Welcome Header */}
      <div className="bg-gradient-to-tr from-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-teal-500 opacity-10 blur-3xl" />
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-white/10 border border-white/10 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Practitioner Central Console
            </span>
            
            {doctor.isVerified ? (
              <span className="bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5" /> Verified Clinician
              </span>
            ) : (
              <span className="bg-amber-500/15 border border-amber-500/25 text-amber-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5" /> Pending Verification
              </span>
            )}
          </div>
          
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
            Dr. {doctorData.name}
          </h2>
          <p className="text-xs text-slate-400">
            {doctor.specialization} • Licensed Partner Hospital: <span className="text-teal-300 font-bold">{doctor.hospitalName}</span>
          </p>
        </div>

        {!doctor.isVerified && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 max-w-sm text-xs text-amber-200">
            <span className="font-bold block text-amber-300 mb-1">Verification Required:</span>
            Practitioner lookup privileges are locked until administrators verify your medical registry credentials.
          </div>
        )}
      </div>

      {/* Main Panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Patient Search and Records List column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Patient Lookup Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
              <Search className="w-5 h-5 text-teal-600" /> Patient Registry Lookup
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              Query the decentralized registry using the patient's unique physical key. This establishes an authorized clinical pipeline.
            </p>

            <form onSubmit={handleSearchPatient} className="flex gap-2.5">
              <input 
                type="text" 
                required
                disabled={!doctor.isVerified}
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                placeholder={doctor.isVerified ? "Enter Patient ID e.g. PAT-100001" : "Practitioner not verified"}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-xs font-mono font-bold tracking-wider outline-none focus:border-teal-500/80 focus:ring-4 focus:ring-teal-500/5 transition" 
              />
              <button 
                type="submit"
                disabled={!doctor.isVerified}
                className="bg-gradient-to-tr from-teal-600 to-emerald-500 hover:opacity-95 text-white font-bold px-6 py-3 rounded-xl text-xs tracking-wide transition shadow-md disabled:opacity-40 shrink-0"
              >
                Inspect Records
              </button>
            </form>
          </div>

          {/* Searched Patient Results */}
          {searchedPatient ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Searched Patient Metadata summary */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 flex items-center justify-center rounded-2xl bg-teal-50 text-teal-700 font-display text-sm font-bold uppercase">
                    {searchedPatient.patient.name.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-800 text-sm leading-tight">
                      {searchedPatient.patient.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {searchedPatient.patient.patientId}
                    </span>
                  </div>
                </div>

                <div className="flex gap-6 text-xs text-slate-500 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl">
                  <div>
                    <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">Blood Type</span>
                    <span className="font-bold text-teal-600">{searchedPatient.patient.bloodGroup || 'Not specified'}</span>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">Gender</span>
                    <span className="font-bold text-slate-700">{searchedPatient.patient.gender || 'Not specified'}</span>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">Dob</span>
                    <span className="font-bold text-slate-700">{searchedPatient.patient.dob || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Patient Records Timeline */}
              <div className="space-y-4">
                <h3 className="font-display text-base font-bold text-slate-800">Available Clinical Vaults</h3>
                
                {searchedPatient.records?.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center text-slate-400">
                    <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-xs font-semibold">Patient clinical timeline is completely empty.</p>
                  </div>
                ) : (
                  searchedPatient.records.map((rec: MedicalRecord) => (
                    <div 
                      key={rec.id}
                      className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.01)]"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="space-y-2.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-0.75 rounded-md text-[9px] font-bold uppercase tracking-wider">
                              {rec.category}
                            </span>
                            {rec.isLocked ? (
                              <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.75 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Lock className="w-3.5 h-3.5 text-amber-500" /> Active Access Lock
                              </span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.75 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Unlock className="w-3.5 h-3.5 text-emerald-500" /> Clearance Approved
                              </span>
                            )}
                          </div>

                          <h4 className="font-display font-bold text-slate-800 text-xs">
                            {rec.title}
                          </h4>

                          {rec.isLocked ? (
                            <p className="text-[11px] font-medium text-amber-700 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 leading-relaxed">
                              🔒 This sensitive medical document requires explicit clearance. Submit an authorization request to prompt the patient for unlock approval.
                            </p>
                          ) : (
                            <>
                              <p className="text-xs text-slate-400 leading-normal">{rec.description || 'No descriptive clinician notes.'}</p>
                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 max-w-max">
                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                <span className="max-w-xs truncate">{rec.fileName}</span>
                                <span>({rec.fileSize})</span>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="shrink-0 w-full sm:w-auto border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0 flex justify-end">
                          {rec.isLocked ? (
                            <button 
                              onClick={() => handleRequestAccess(rec.id)}
                              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition"
                            >
                              Request Access Clearance
                            </button>
                          ) : (
                            <button 
                              onClick={() => downloadFile(rec.fileName, rec.fileContent)}
                              className="p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl border border-slate-100 hover:border-teal-200/50 transition-all"
                              title="Download Report"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-16 text-center text-slate-400 shadow-inner flex flex-col items-center justify-center">
              <Activity className="w-12 h-12 text-slate-200 mb-4 animate-pulse-slow" />
              <h4 className="font-display font-bold text-sm text-slate-700">Practitioner Registry Workspace</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                Query a Patient ID above to retrieve clinical timeline files, issue active medical scripts, or upload authorized diagnostic records.
              </p>
            </div>
          )}
        </div>

        {/* Right side column: Prescribe Treatment & Diagnostic Uploader */}
        <div className="space-y-6">
          
          {searchedPatient ? (
            <>
              {/* Prescribe Treatment Form */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-teal-600" /> Prescribe Treatment Script
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Record official medical diagnostics and treatment directions directly into the patient's decentralized ledger timeline.
                </p>

                <form onSubmit={handleAddPrescription} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clinical Diagnosis</label>
                    <input 
                      type="text" 
                      required 
                      value={diagnosis} 
                      onChange={e => setDiagnosis(e.target.value)} 
                      placeholder="e.g. Acute Bronchitis" 
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none" 
                    />
                  </div>

                  {/* Add Medication item row form */}
                  <div className="border-t border-slate-50 pt-3 space-y-2.5">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Builder Medications</span>
                    
                    <input 
                      type="text" 
                      placeholder="Medication name e.g. Amoxicillin" 
                      value={addMedName} 
                      onChange={e => setAddMedName(e.target.value)} 
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs outline-none bg-slate-50/50" 
                    />
                    
                    <div className="grid grid-cols-3 gap-2">
                      <input 
                        type="text" 
                        placeholder="Dosage (500mg)" 
                        value={addMedDosage} 
                        onChange={e => setAddMedDosage(e.target.value)} 
                        className="px-2 py-2 rounded-lg border border-slate-200 text-xs outline-none bg-slate-50/50" 
                      />
                      <input 
                        type="text" 
                        placeholder="Freq (Daily)" 
                        value={addMedFreq} 
                        onChange={e => setAddMedFreq(e.target.value)} 
                        className="px-2 py-2 rounded-lg border border-slate-200 text-xs outline-none bg-slate-50/50" 
                      />
                      <input 
                        type="text" 
                        placeholder="Duration (7d)" 
                        value={addMedDur} 
                        onChange={e => setAddMedDur(e.target.value)} 
                        className="px-2 py-2 rounded-lg border border-slate-200 text-xs outline-none bg-slate-50/50" 
                      />
                    </div>

                    <button 
                      type="button" 
                      onClick={handleAddMedication} 
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-[10px] transition"
                    >
                      + Append Medication Item
                    </button>
                  </div>

                  {/* Added Medications list */}
                  {medsList.length > 0 && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 divide-y divide-slate-100">
                      {medsList.map((m, idx) => (
                        <div key={idx} className="py-2 flex justify-between items-center text-[10px]">
                          <div>
                            <span className="font-bold text-slate-800">{m.name}</span>
                            <span className="text-slate-400 ml-1.5">({m.dosage})</span>
                            <span className="block text-slate-500 text-[9px] mt-0.5">{m.frequency} • {m.duration}</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveMedication(idx)} 
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-md font-bold py-3 rounded-xl text-xs tracking-wide transition"
                  >
                    Issue Clinical Script
                  </button>
                </form>
              </div>

              {/* Clinic Diagnostic Report Upload */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
                  <FilePlus className="w-5 h-5 text-teal-600" /> Upload Diagnostic Report
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Directly upload lab, imaging, or scan results. Directly carries your authorized partner clinic verified badge.
                </p>

                <form onSubmit={handleDocUploadForPatient} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Report Title</label>
                    <input 
                      type="text" 
                      required 
                      value={docUploadTitle} 
                      onChange={e => setDocUploadTitle(e.target.value)} 
                      placeholder="e.g. Chest X-Ray scan" 
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                    <select 
                      value={docUploadCategory} 
                      onChange={e => setDocUploadCategory(e.target.value as any)} 
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                    >
                      <option>Lab Report</option>
                      <option>Prescription</option>
                      <option>Scan</option>
                      <option>Discharge Summary</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes / Diagnoses</label>
                    <textarea 
                      value={docUploadDesc} 
                      onChange={e => setDocUploadDesc(e.target.value)} 
                      placeholder="e.g. Cleared of respiratory infection." 
                      rows={2} 
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none resize-none" 
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
                        {docUploadFile ? docUploadFile.name : 'Choose file or drag here'}
                      </span>
                      <span className="block text-[9px] text-slate-400 font-mono uppercase">
                        {docUploadFile ? docUploadFile.size : 'PDF, PNG, JPG up to 10MB'}
                      </span>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-xs tracking-wide transition shadow-sm"
                  >
                    Upload Certified Document
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="bg-slate-50/40 border border-slate-100 rounded-3xl p-6 text-center text-slate-400 shadow-inner flex flex-col items-center justify-center py-12">
              <ClipboardList className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-[11px] leading-relaxed max-w-xs font-medium">
                Once a patient registry key is queried successfully, clinical prescription scripts and diagnostic uploads will enable on this panel.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
