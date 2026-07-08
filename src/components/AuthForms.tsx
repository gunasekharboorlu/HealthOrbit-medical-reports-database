import React from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User as UserIcon, Calendar, Activity, ChevronRight, Sparkles, Building, ShieldCheck } from 'lucide-react';

interface AuthFormsProps {
  view: 'login' | 'register';
  setView: (view: any) => void;
  authRole: 'patient' | 'doctor' | 'admin';
  setAuthRole: (role: any) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  name: string;
  setName: (val: string) => void;
  dob: string;
  setDob: (val: string) => void;
  gender: string;
  setGender: (val: string) => void;
  bloodGroup: string;
  setBloodGroup: (val: string) => void;
  specialization: string;
  setSpecialization: (val: string) => void;
  licenseNumber: string;
  setLicenseNumber: (val: string) => void;
  hospitalId: string;
  setHospitalId: (val: string) => void;
  handleLogin: (e: React.FormEvent) => void;
  handleRegister: (e: React.FormEvent) => void;
}

export default function AuthForms({
  view,
  setView,
  authRole,
  setAuthRole,
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  dob,
  setDob,
  gender,
  setGender,
  bloodGroup,
  setBloodGroup,
  specialization,
  setSpecialization,
  licenseNumber,
  setLicenseNumber,
  hospitalId,
  setHospitalId,
  handleLogin,
  handleRegister,
}: AuthFormsProps) {
  
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()]/.test(password);

  return (
    <div className="max-w-md mx-auto py-10">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-8 space-y-6"
      >
        {/* Toggle Switch */}
        <div className="text-center space-y-2">
          <span className="font-display text-2xl font-black tracking-tight text-slate-800">
            {view === 'login' ? 'Welcome to SIHRMS' : 'Register Profile'}
          </span>
          <p className="text-[11px] font-medium text-slate-400">
            {view === 'login' ? 'Access your clinical database control room' : 'Set up your secure digital clinical registry'}
          </p>
          
          <div className="flex justify-center p-1 bg-slate-50 border border-slate-100 rounded-xl mt-4">
            <button 
              type="button"
              onClick={() => setAuthRole('patient')} 
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authRole === 'patient' 
                  ? 'bg-white text-teal-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Patient
            </button>
            <button 
              type="button"
              onClick={() => setAuthRole('doctor')} 
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authRole === 'doctor' 
                  ? 'bg-white text-teal-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Doctor
            </button>
            {view === 'login' && (
              <button 
                type="button"
                onClick={() => setAuthRole('admin')} 
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authRole === 'admin' 
                    ? 'bg-white text-teal-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Admin
              </button>
            )}
          </div>
        </div>

        {/* Auth form */}
        <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-4">
          {view === 'register' && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Full Name
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. John Doe" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500/80 focus:ring-4 focus:ring-teal-500/5 transition outline-none text-xs font-medium" 
                />
                <UserIcon className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Email Address
            </label>
            <div className="relative">
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="e.g. john@example.com" 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500/80 focus:ring-4 focus:ring-teal-500/5 transition outline-none text-xs font-medium" 
              />
              <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Password
            </label>
            <div className="relative">
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500/80 focus:ring-4 focus:ring-teal-500/5 transition outline-none text-xs font-medium" 
              />
              <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
            </div>

            {/* Password Validation Requirements Panel */}
            {view === 'register' && (
              <div className="mt-2.5 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-[10px]">
                <p className="font-semibold text-slate-500 text-[9px] uppercase tracking-wider mb-1">Password Requirements:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      hasMinLength ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {hasMinLength ? '✓' : '•'}
                    </span>
                    <span className={hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                      Min 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      hasUppercase ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {hasUppercase ? '✓' : '•'}
                    </span>
                    <span className={hasUppercase ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                      1 uppercase (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      hasLowercase ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {hasLowercase ? '✓' : '•'}
                    </span>
                    <span className={hasLowercase ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                      1 lowercase (a-z)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      hasNumber ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {hasNumber ? '✓' : '•'}
                    </span>
                    <span className={hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                      1 number (0-9)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:col-span-2">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      hasSpecial ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {hasSpecial ? '✓' : '•'}
                    </span>
                    <span className={hasSpecial ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                      1 special char (!@#$%^&*())
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Registration Role Metadata */}
          {view === 'register' && authRole === 'patient' && (
            <div className="grid grid-cols-2 gap-3.5 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
              <div className="col-span-2">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Birth</label>
                <div className="relative">
                  <input 
                    type="date" 
                    required
                    value={dob} 
                    onChange={e => setDob(e.target.value)} 
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gender</label>
                <select 
                  value={gender} 
                  onChange={e => setGender(e.target.value)} 
                  className="w-full px-2 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium outline-none"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Blood Group</label>
                <select 
                  value={bloodGroup} 
                  onChange={e => setBloodGroup(e.target.value)} 
                  className="w-full px-2 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium outline-none"
                >
                  <option>O-Positive</option>
                  <option>O-Negative</option>
                  <option>A-Positive</option>
                  <option>A-Negative</option>
                  <option>B-Positive</option>
                  <option>B-Negative</option>
                  <option>AB-Positive</option>
                  <option>AB-Negative</option>
                </select>
              </div>
            </div>
          )}

          {view === 'register' && authRole === 'doctor' && (
            <div className="space-y-3.5 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clinical Specialization</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Cardiology, Pediatrics" 
                  value={specialization} 
                  onChange={e => setSpecialization(e.target.value)} 
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium outline-none" 
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Medical License ID</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. LIC-12345" 
                  value={licenseNumber} 
                  onChange={e => setLicenseNumber(e.target.value)} 
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-medium outline-none" 
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Partner Hospital</label>
                <select 
                  value={hospitalId} 
                  onChange={e => setHospitalId(e.target.value)} 
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium outline-none"
                >
                  <option value="HOSP-1">Saint Jude General Hospital</option>
                  <option value="HOSP-2">Metropolis Medical Center</option>
                  <option value="HOSP-3">Westcity Health Clinic</option>
                </select>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-gradient-to-tr from-teal-600 to-emerald-500 hover:opacity-95 text-white shadow-md shadow-teal-600/15 py-3.5 rounded-xl text-xs font-bold tracking-wide transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5"
          >
            {view === 'login' ? 'Access Database' : 'Register Profile'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 border-t border-slate-50 pt-4 font-medium">
          {view === 'login' ? (
            <>
              Don't have an account?{' '}
              <button 
                onClick={() => setView('register')} 
                className="text-teal-600 hover:underline font-bold"
              >
                Register as {authRole}
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button 
                onClick={() => setView('login')} 
                className="text-teal-600 hover:underline font-bold"
              >
                Login as {authRole}
              </button>
            </>
          )}
        </div>

        {/* Demo Account Credentials (Frictionless discovery) */}
        {view === 'login' && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[10px] text-slate-500 space-y-1.5">
            <span className="font-bold text-slate-700 block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              Developer Sandbox Access:
            </span>
            <ul className="space-y-1 font-mono text-[9px]">
              <li>
                <span className="font-bold text-slate-600">Patient:</span> john.doe@gmail.com / patient123
              </li>
              <li>
                <span className="font-bold text-slate-600">Doctor:</span> dr.smith@metro.org / doctor123
              </li>
              <li>
                <span className="font-bold text-slate-600">Admin:</span> admin@sihrms.org / admin123
              </li>
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  );
}
