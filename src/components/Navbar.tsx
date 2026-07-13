import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Heart, Bell, LogOut, ClipboardList, Menu, X, ShieldAlert, Check } from 'lucide-react';
import { User, Notification } from '../types';

interface NavbarProps {
  currentUser: User | null;
  unreadCount: number;
  notifications: Notification[];
  view: string;
  setView: (view: any) => void;
  navigateToDashboard: (user: User) => void;
  handleLogout: () => void;
  handleMarkAllRead: () => void;
  handleMarkRead: (id: string) => void;
}

export default function Navbar({
  currentUser,
  unreadCount,
  notifications,
  view,
  setView,
  navigateToDashboard,
  handleLogout,
  handleMarkAllRead,
  handleMarkRead,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setView('landing')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#38bdf8] to-[#22d3ee] text-white shadow-md shadow-[#38bdf8]/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[#38bdf8]/40">
              <Activity className="h-5.5 w-5.5 animate-pulse" />
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-[#4f8cff] via-[#5da9ff] to-[#22d3ee] bg-clip-text text-transparent">
                HealthOrbit
              </span>
              <span className="block font-mono text-[8px] font-bold tracking-widest text-[#94a3b8] uppercase">
                Clinical Ledger
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {currentUser ? (
              <>
                <button 
                  onClick={() => navigateToDashboard(currentUser)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    ['patient-dashboard', 'doctor-dashboard', 'admin-dashboard'].includes(view)
                      ? 'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 shadow-[0_0_15px_rgba(56,189,248,0.15)]' 
                      : 'text-slate-300 hover:text-[#38bdf8] hover:bg-white/5'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  Dashboard
                </button>

                <button 
                  onClick={() => setView('emergency-view')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    view === 'emergency-view'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                      : 'text-slate-300 hover:text-rose-400 hover:bg-rose-500/5'
                  }`}
                >
                  <Heart className="w-4 h-4 text-rose-400 animate-pulse-slow" />
                  Emergency Profile
                </button>

                {/* Notifications Dropdown Trigger */}
                <div className="relative">
                  <button 
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="relative p-2 text-slate-300 hover:text-[#38bdf8] hover:bg-white/5 rounded-xl transition-all"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-[#020617]">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notifDropdownOpen && (
                      <>
                        {/* Overlay backdrop to close */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setNotifDropdownOpen(false)} 
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2.5 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#020617]/95 backdrop-blur-md shadow-2xl z-50"
                        >
                          <div className="flex items-center justify-between border-b border-white/5 bg-[#1e293b]/40 px-4 py-3">
                            <span className="text-xs font-bold text-white font-display">Notifications</span>
                            {unreadCount > 0 && (
                              <button 
                                onClick={() => { handleMarkAllRead(); setNotifDropdownOpen(false); }}
                                className="text-[10px] font-bold text-[#4f8cff] hover:text-[#5da9ff] hover:underline"
                              >
                                Mark all read
                              </button>
                            )}
                          </div>

                          <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                            {notifications.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                                <Bell className="w-8 h-8 text-slate-600 mb-2" />
                                <p className="text-[11px] font-medium text-slate-400">All caught up! No notifications.</p>
                              </div>
                            ) : (
                              notifications.map((n) => (
                                <div 
                                  key={n.id} 
                                  onClick={() => {
                                    if (!n.read) handleMarkRead(n.id);
                                  }}
                                  className={`p-3.5 text-left text-xs cursor-pointer hover:bg-white/5 transition-colors ${
                                    !n.read ? 'bg-[#38bdf8]/5 border-l-2 border-[#38bdf8]' : ''
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[11px] font-bold ${!n.read ? 'text-white' : 'text-slate-300'}`}>
                                      {n.title}
                                    </span>
                                    <span className="text-[9px] text-slate-500 font-mono">
                                      {new Date(n.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-slate-400 text-[10px] leading-normal">{n.message}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Widget */}
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                  <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#1e293b] to-[#0f172a] border border-white/10 font-display text-xs font-bold text-[#38bdf8] uppercase">
                    {currentUser.name.slice(0, 2)}
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-bold text-white leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                      {currentUser.role}
                    </span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setView('emergency-view')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-slate-300 hover:text-rose-400 transition-all"
                >
                  <Heart className="w-4 h-4 text-rose-500 animate-pulse-slow" />
                  Emergency Lookup
                </button>
                <button 
                  onClick={() => { setView('login'); }}
                  className="text-xs font-bold text-slate-300 hover:text-[#38bdf8] transition-all"
                >
                  Login
                </button>
                <button 
                  onClick={() => { setView('register'); }}
                  className="bg-gradient-to-tr from-[#38bdf8] to-[#22d3ee] text-white shadow-md shadow-[#38bdf8]/20 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] hover:shadow-[#38bdf8]/30 active:scale-[0.98]"
                >
                  Register Now
                </button>
              </>
            )}
          </nav>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-2">
            {currentUser && unreadCount > 0 && (
              <span className="h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#020617] animate-pulse" />
            )}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-[#4f8cff] hover:bg-white/5 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-[#020617]/95 backdrop-blur-md px-4 py-4 space-y-3 shadow-lg overflow-hidden"
          >
            {currentUser ? (
              <>
                <div className="p-3 bg-white/5 rounded-xl flex items-center gap-3 border border-white/5">
                  <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-[#38bdf8]/10 text-[#38bdf8] font-display text-xs font-bold uppercase">
                    {currentUser.name.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white leading-tight">{currentUser.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{currentUser.role}</p>
                  </div>
                </div>

                <button 
                  onClick={() => { setMobileMenuOpen(false); navigateToDashboard(currentUser); }}
                  className="w-full text-left py-2.5 px-3 text-slate-300 font-semibold text-xs hover:text-[#38bdf8] hover:bg-white/5 rounded-xl flex items-center gap-2.5 transition-all"
                >
                  <ClipboardList className="w-4 h-4" /> Dashboard
                </button>

                <button 
                  onClick={() => { setMobileMenuOpen(false); setView('emergency-view'); }}
                  className="w-full text-left py-2.5 px-3 text-slate-300 font-semibold text-xs hover:text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2.5 transition-all"
                >
                  <Heart className="w-4 h-4 text-rose-400" /> Emergency Profile
                </button>

                <button 
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full text-left py-2.5 px-3 text-rose-400 font-semibold text-xs hover:bg-rose-500/10 rounded-xl flex items-center gap-2.5 transition-all border-t border-white/5 mt-2 pt-3"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => { setMobileMenuOpen(false); setView('emergency-view'); }}
                  className="w-full text-left py-2.5 px-3 text-slate-300 font-semibold text-xs hover:text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2.5 transition-all"
                >
                  <Heart className="w-4 h-4 text-rose-400" /> Emergency Lookup
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); setView('login'); }}
                  className="w-full text-left py-2.5 px-3 text-slate-300 font-semibold text-xs hover:text-[#38bdf8] hover:bg-white/5 rounded-xl transition-all"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); setView('register'); }}
                  className="w-full bg-gradient-to-tr from-[#38bdf8] to-[#22d3ee] text-white text-center py-2.5 rounded-xl font-bold text-xs shadow-md shadow-[#38bdf8]/20 block"
                >
                  Get Started
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
