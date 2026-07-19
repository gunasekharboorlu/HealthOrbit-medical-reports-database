import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User as UserIcon, Calendar, Activity, ChevronRight, Sparkles, Building, ShieldCheck, Eye, EyeOff } from 'lucide-react';

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
  
  const [showPassword, setShowPassword] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()]/.test(password);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Modern illustration and features panel */}
        <div className="hidden md:flex md:col-span-5 flex-col justify-between p-8 rounded-3xl border border-white/10 bg-[#090d23]/40 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#38bdf8]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#7c5cff]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-2.5 text-[#38bdf8]">
              <ShieldCheck className="w-8 h-8 animate-pulse text-[#38bdf8]" />
              <span className="font-display font-extrabold text-xs uppercase tracking-widest font-mono">Clinical Shield Active</span>
            </div>
            <h2 className="font-display text-3xl font-black text-white leading-tight">
              Decentralized EHR Control Room.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Verify credentials, upload encrypted patient timelines, and manage instant health status updates on a tamper-proof system.
            </p>
          </div>
          
          {/* Dynamic ledger state visualization */}
          <div className="py-6 relative z-10 flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-mono text-slate-300">System Status: Active & Secured</span>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-[#38bdf8]" />
              <span className="text-[10px] font-mono text-slate-300">Integrity Check: SHA-256 Validated</span>
            </div>
          </div>
          
          <div className="text-[9px] font-mono text-slate-500 border-t border-white/5 pt-4">
            Security Protocol Version 4.1-A
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="md:col-span-7 flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl border border-white/10 p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
        {/* Toggle Switch */}
        <div className="text-center space-y-2">
          <span className="font-display text-2xl font-black tracking-tight text-white block">
            {view === 'login' ? 'Welcome to HealthOrbit' : 'Register Profile'}
          </span>
          <p className="text-[11px] font-medium text-slate-400">
            {view === 'login' ? 'Access your clinical database control room' : 'Set up your secure digital clinical registry'}
          </p>
          
          <div className="flex justify-center p-1 bg-slate-950/50 border border-white/5 rounded-xl mt-4">
            <button 
              type="button"
              onClick={() => setAuthRole('patient')} 
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authRole === 'patient' 
                  ? 'bg-gradient-to-tr from-[#38bdf8] to-[#22d3ee] text-slate-950 shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Patient
            </button>
            <button 
              type="button"
              onClick={() => setAuthRole('doctor')} 
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authRole === 'doctor' 
                  ? 'bg-gradient-to-tr from-[#38bdf8] to-[#22d3ee] text-slate-950 shadow-sm' 
                  : 'text-slate-400 hover:text-white'
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
                    ? 'bg-gradient-to-tr from-[#38bdf8] to-[#22d3ee] text-slate-950 shadow-sm' 
                    : 'text-slate-400 hover:text-white'
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
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">
                Full Name
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. John Doe" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl premium-input outline-none text-xs font-medium text-white placeholder-slate-500" 
                />
                <UserIcon className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">
              Email Address
            </label>
            <div className="relative">
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="e.g. john@example.com" 
                className="w-full pl-10 pr-4 py-3 rounded-xl premium-input outline-none text-xs font-medium text-white placeholder-slate-500" 
              />
              <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">
              Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="w-full pl-10 pr-10 py-3 rounded-xl premium-input outline-none text-xs font-medium text-white placeholder-slate-500" 
              />
              <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>

            {/* Password Validation Requirements Panel */}
            {view === 'register' && (
              <div className="mt-2.5 p-3 bg-slate-950/50 border border-white/5 rounded-xl space-y-1.5 text-[10px]">
                <p className="font-semibold text-slate-400 text-[9px] uppercase tracking-wider mb-1 font-mono">Password Requirements:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      hasMinLength ? 'bg-emerald-500/20 text-[#22c55e]' : 'bg-white/5 text-slate-500'
                    }`}>
                      {hasMinLength ? '✓' : '•'}
                    </span>
                    <span className={hasMinLength ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                      Min 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      hasUppercase ? 'bg-emerald-500/20 text-[#22c55e]' : 'bg-white/5 text-slate-500'
                    }`}>
                      {hasUppercase ? '✓' : '•'}
                    </span>
                    <span className={hasUppercase ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                      1 uppercase (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      hasLowercase ? 'bg-emerald-500/20 text-[#22c55e]' : 'bg-white/5 text-slate-500'
                    }`}>
                      {hasLowercase ? '✓' : '•'}
                    </span>
                    <span className={hasLowercase ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                      1 lowercase (a-z)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      hasNumber ? 'bg-emerald-500/20 text-[#22c55e]' : 'bg-white/5 text-slate-500'
                    }`}>
                      {hasNumber ? '✓' : '•'}
                    </span>
                    <span className={hasNumber ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                      1 number (0-9)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:col-span-2">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      hasSpecial ? 'bg-emerald-500/20 text-[#22c55e]' : 'bg-white/5 text-slate-500'
                    }`}>
                      {hasSpecial ? '✓' : '•'}
                    </span>
                    <span className={hasSpecial ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                      1 special char (!@#$%^&*())
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Registration Role Metadata */}
          {view === 'register' && authRole === 'patient' && (
            <div className="grid grid-cols-2 gap-3.5 p-4 bg-[#0c1425]/60 border border-white/5 rounded-2xl">
              <div className="col-span-2">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Date of Birth</label>
                <div className="relative">
                  <input 
                    type="date" 
                    required
                    value={dob} 
                    onChange={e => setDob(e.target.value)} 
                    className="w-full px-3 py-2.5 rounded-lg premium-input text-xs font-medium outline-none text-white" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Gender</label>
                <select 
                  value={gender} 
                  onChange={e => setGender(e.target.value)} 
                  className="w-full px-2 py-2.5 rounded-lg premium-input text-xs font-medium outline-none text-white"
                >
                  <option className="bg-[#020617]">Male</option>
                  <option className="bg-[#020617]">Female</option>
                  <option className="bg-[#020617]">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Blood Group</label>
                <select 
                  value={bloodGroup} 
                  onChange={e => setBloodGroup(e.target.value)} 
                  className="w-full px-2 py-2.5 rounded-lg premium-input text-xs font-medium outline-none text-white"
                >
                  <option className="bg-[#020617]">O-Positive</option>
                  <option className="bg-[#020617]">O-Negative</option>
                  <option className="bg-[#020617]">A-Positive</option>
                  <option className="bg-[#020617]">A-Negative</option>
                  <option className="bg-[#020617]">B-Positive</option>
                  <option className="bg-[#020617]">B-Negative</option>
                  <option className="bg-[#020617]">AB-Positive</option>
                  <option className="bg-[#020617]">AB-Negative</option>
                </select>
              </div>
            </div>
          )}

          {view === 'register' && authRole === 'doctor' && (
            <div className="space-y-3.5 p-4 bg-[#0c1425]/60 border border-white/5 rounded-2xl">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Clinical Specialization</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Cardiology, Pediatrics" 
                  value={specialization} 
                  onChange={e => setSpecialization(e.target.value)} 
                  className="w-full px-3 py-2.5 rounded-lg premium-input text-xs font-medium outline-none text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Medical License ID</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. LIC-12345" 
                  value={licenseNumber} 
                  onChange={e => setLicenseNumber(e.target.value)} 
                  className="w-full px-3 py-2.5 rounded-lg premium-input text-xs font-mono font-medium outline-none text-white placeholder-slate-500" 
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Partner Hospital</label>
                <select 
                  value={hospitalId} 
                  onChange={e => setHospitalId(e.target.value)} 
                  className="w-full px-3 py-2.5 rounded-lg premium-input text-xs font-medium outline-none text-white"
                >
                  <option className="bg-[#020617]" value="HOSP-1">Saint Jude General Hospital</option>
                  <option className="bg-[#020617]" value="HOSP-2">Metropolis Medical Center</option>
                  <option className="bg-[#020617]" value="HOSP-3">Westcity Health Clinic</option>
                </select>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full premium-btn-primary py-3.5 rounded-xl text-xs font-black tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {view === 'login' ? 'Access Database' : 'Register Profile'}
            <ChevronRight className="w-4 h-4 text-slate-950 stroke-[3]" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 border-t border-white/5 pt-4 font-medium">
          {view === 'login' ? (
            <>
              Don't have an account?{' '}
              <button 
                onClick={() => setView('register')} 
                className="text-[#38bdf8] hover:underline font-bold bg-transparent border-none cursor-pointer"
              >
                Register as {authRole}
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button 
                onClick={() => setView('login')} 
                className="text-[#38bdf8] hover:underline font-bold bg-transparent border-none cursor-pointer"
              >
                Login as {authRole}
              </button>
            </>
          )}
        </div>

        {/* Demo Account Credentials (Frictionless discovery) */}
        {view === 'login' && (
          <div className="bg-[#0c1425]/60 border border-white/5 rounded-2xl p-4 text-[10px] text-slate-400 space-y-2">
            <span className="font-bold text-white block flex items-center gap-1.5 font-sans">
              <Sparkles className="w-3.5 h-3.5 text-[#38bdf8] animate-pulse" />
              Developer Sandbox Access:
            </span>
            <p className="text-[9px] text-slate-400 font-sans">
              Click any account card below to automatically load its credentials and select the correct tab:
            </p>
            <ul className="space-y-1.5">
              <li 
                onClick={() => {
                  setEmail('john.doe@gmail.com');
                  setPassword('patient123');
                  setAuthRole('patient');
                }}
                className="cursor-pointer hover:bg-white/5 border border-transparent hover:border-white/10 p-2 rounded-xl transition flex justify-between items-center group font-mono text-[9px]"
              >
                <div>
                  <span className="font-bold text-slate-200 group-hover:text-[#38bdf8] transition-colors">Patient:</span> john.doe@gmail.com / patient123
                </div>
                <span className="text-[8px] bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all font-sans font-bold">Autofill</span>
              </li>
              <li 
                onClick={() => {
                  setEmail('dr.smith@metro.org');
                  setPassword('doctor123');
                  setAuthRole('doctor');
                }}
                className="cursor-pointer hover:bg-white/5 border border-transparent hover:border-white/10 p-2 rounded-xl transition flex justify-between items-center group font-mono text-[9px]"
              >
                <div>
                  <span className="font-bold text-slate-200 group-hover:text-[#38bdf8] transition-colors">Doctor:</span> dr.smith@metro.org / doctor123
                </div>
                <span className="text-[8px] bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all font-sans font-bold">Autofill</span>
              </li>
              <li 
                onClick={() => {
                  setEmail('admin@healthorbit.org');
                  setPassword('admin123');
                  setAuthRole('admin');
                }}
                className="cursor-pointer hover:bg-white/5 border border-transparent hover:border-white/10 p-2 rounded-xl transition flex justify-between items-center group font-mono text-[9px]"
              >
                <div>
                  <span className="font-bold text-slate-200 group-hover:text-[#38bdf8] transition-colors">Admin:</span> admin@healthorbit.org / admin123
                </div>
                <span className="text-[8px] bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all font-sans font-bold">Autofill</span>
              </li>
            </ul>
          </div>
        )}
      </motion.div>
        </div>
      </div>
    </div>
  );
}
