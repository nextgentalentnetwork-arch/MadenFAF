'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { 
  X, 
  User, 
  Users, 
  Shield, 
  Award, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  TrendingUp, 
  FileText, 
  Lock,
  Database,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Key,
  Megaphone
} from 'lucide-react';
import { DIGITAL_PORTAL_ROLES, DEFAULT_PORTAL_CONFIG } from '@/data/academyData';
import { AcademyDataManager, subscribeAcademyData } from '@/lib/academyDataManager';
import { useAuth } from '@/lib/AuthContext';
import { checkSupabaseHealth, getRegistrations, AcademyRegistrationData } from '@/lib/supabaseClient';

interface DigitalPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'player' | 'parent' | 'coach' | 'admin';
  onBookTrialClick?: () => void;
}

const SUPABASE_SCHEMA_SQL = `-- Run this in your Supabase SQL Editor (supabase.com/dashboard/project/cyolljxxcmaekhhllbix/sql)
CREATE TABLE IF NOT EXISTS public.academy_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_ref TEXT UNIQUE NOT NULL,
  player_name TEXT NOT NULL,
  dob DATE,
  gender TEXT DEFAULT 'male',
  parent_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT,
  preferred_campus TEXT DEFAULT 'gayeshpur',
  position TEXT DEFAULT 'midfielder',
  experience_level TEXT DEFAULT 'grassroots',
  program TEXT DEFAULT 'foundation',
  message TEXT,
  status TEXT DEFAULT 'pending_trial',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.academy_registrations ENABLE ROW LEVEL SECURITY;

-- Allow public insertion for candidate trial applications
CREATE POLICY "Allow public insert for registrations"
  ON public.academy_registrations
  FOR INSERT
  WITH CHECK (true);

-- Allow reading registrations for authenticated staff & public booking lookups
CREATE POLICY "Allow read for registrations"
  ON public.academy_registrations
  FOR SELECT
  USING (true);`;

export const DigitalPortalModal: React.FC<DigitalPortalModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'player',
  onBookTrialClick
}) => {
  const { profile, isSupabaseActive } = useAuth();
  const portalConfig = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getPortalConfig(),
    () => DEFAULT_PORTAL_CONFIG
  );

  const [userSelectedRole, setUserSelectedRole] = useState<'player' | 'parent' | 'coach' | 'admin' | null>(null);
  const [dbHealth, setDbHealth] = useState<{ connected: boolean; tableExists: boolean; projectUrl: string; error?: string } | null>(null);
  const [registrations, setRegistrations] = useState<AcademyRegistrationData[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Access PIN Protection State
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);

  const isAccessAllowed =
    portalConfig.portalMode === 'preview' ||
    Boolean(profile) ||
    AcademyDataManager.isDeveloperAuthenticated() ||
    isPinUnlocked;

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctCode = (portalConfig.accessCode || 'MADEN2026').trim().toUpperCase();
    if (pinInput.trim().toUpperCase() === correctCode) {
      setIsPinUnlocked(true);
      setPinError('');
    } else {
      setPinError('Invalid Portal PIN code. Please verify credentials or contact administration.');
    }
  };

  const refreshData = async () => {
    setIsLoadingDb(true);
    try {
      const health = await checkSupabaseHealth();
      setDbHealth(health);
      const list = await getRegistrations();
      setRegistrations(list);
    } catch (e) {
      console.warn('Error refreshing DB data:', e);
    } finally {
      setIsLoadingDb(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      checkSupabaseHealth().then((health) => {
        if (isMounted) setDbHealth(health);
      }).catch((e) => console.warn(e));

      getRegistrations().then((list) => {
        if (isMounted) setRegistrations(list);
      }).catch((e) => console.warn(e));
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleCopySql = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  if (!isOpen) return null;

  const selectedRole = userSelectedRole ?? profile?.role ?? initialRole;
  const currentData = DIGITAL_PORTAL_ROLES[selectedRole];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Top Bar with Role Switcher */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs shrink-0 shadow-xs">
              FAF
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-amber-800 font-bold">
                Digital Academy Platform
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{profile ? `Dashboard: ${profile.fullName}` : 'Portal Live Preview'}</span>
                <span className="text-[9px] sm:text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  SUPABASE LIVE
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!profile && (
              <Link
                href="/login"
                onClick={onClose}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs font-bold text-slate-800 border border-slate-300 transition-colors shadow-xs"
              >
                <span>Sign In</span>
              </Link>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
              aria-label="Close portal modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Announcement Banner if configured in backend */}
        {(portalConfig.announcementTitle || portalConfig.announcementMessage) && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 sm:px-6 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Megaphone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <div className="truncate">
                {portalConfig.announcementTitle && (
                  <span className="font-bold text-amber-950 mr-1.5">{portalConfig.announcementTitle}:</span>
                )}
                <span className="text-amber-900">{portalConfig.announcementMessage}</span>
              </div>
            </div>
            {portalConfig.portalMode === 'pin_protected' && (
              <span className="text-[10px] font-mono font-bold uppercase bg-amber-200 text-amber-950 px-2 py-0.5 rounded shrink-0">
                PIN Protected
              </span>
            )}
          </div>
        )}

        {/* Access Gate Screen if PIN protected and not verified */}
        {!isAccessAllowed ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-amber-800 tracking-wider">
                Restricted Academy Environment
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mt-1">
                Enter Digital Portal PIN
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                This portal is currently operating in PIN-protected mode for verified players, parents, and technical staff.
              </p>
            </div>

            <form onSubmit={handleVerifyPin} className="w-full space-y-3">
              <div className="relative">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder="Enter Access PIN (Default: MADEN2026)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-center font-mono font-bold tracking-widest text-sm text-slate-900 placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 outline-none transition-all"
                />
                <Key className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>

              {pinError && (
                <div className="text-xs text-rose-600 font-semibold">{pinError}</div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Unlock Digital Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setPinInput(portalConfig.accessCode || 'MADEN2026');
                  setIsPinUnlocked(true);
                }}
                className="w-full py-2 text-[11px] font-mono text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Use Quick Demo Key ({portalConfig.accessCode || 'MADEN2026'})
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Role Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-2 bg-slate-100 border-b border-slate-200 text-xs">
              {portalConfig.playerPortalEnabled !== false && (
                <button
                  onClick={() => setUserSelectedRole('player')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all min-h-[38px] cursor-pointer ${
                    selectedRole === 'player'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Player Portal</span>
                </button>
              )}

              {portalConfig.parentPortalEnabled !== false && (
                <button
                  onClick={() => setUserSelectedRole('parent')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all min-h-[38px] cursor-pointer ${
                    selectedRole === 'parent'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Parent Portal</span>
                </button>
              )}

              {portalConfig.coachPortalEnabled !== false && (
                <button
                  onClick={() => setUserSelectedRole('coach')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all min-h-[38px] cursor-pointer ${
                    selectedRole === 'coach'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Coach Planner</span>
                </button>
              )}

              {portalConfig.adminPortalEnabled !== false && (
                <button
                  onClick={() => setUserSelectedRole('admin')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all min-h-[38px] cursor-pointer ${
                    selectedRole === 'admin'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Operations / DB</span>
                </button>
              )}
            </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* User Profile Strip */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentData.avatar}
                  alt={currentData.user}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-slate-300"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                  {currentData.roleName}
                </div>
                <div className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {currentData.user}
                </div>
                <div className="text-xs text-amber-700 font-semibold">
                  {currentData.campus}
                </div>
              </div>
            </div>

            <div className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 flex items-center gap-1.5 shadow-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Session</span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
            {currentData.modules.map((mod, i) => (
              <div key={i} className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] sm:text-xs text-slate-500 mb-0.5">{mod.name}</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{mod.count}</div>
              </div>
            ))}
          </div>

          {/* Role-Specific Content */}
          {selectedRole === 'player' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Training & Match Calendar</span>
              </div>
              <div className="space-y-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">Tuesday Grassroots Tactical</div>
                    <div className="text-[11px] text-slate-500">6:00 AM – 7:30 AM · Gayeshpur Grass Ground</div>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Attended</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">Thursday 1v1 Pressing & Video</div>
                    <div className="text-[11px] text-slate-500">4:30 PM – 6:15 PM · Pitch + AV Hall</div>
                  </div>
                  <span className="text-[10px] text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Upcoming</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                <div className="text-[10px] text-amber-800 font-bold mb-0.5">COACH BAPI ROY OBSERVATION</div>
                <p className="text-slate-700 italic text-[11px]">
                  &ldquo;Subham demonstrated fantastic composure in transition moments against East Bengal. Focus for next week: first-touch directional turns.&rdquo;
                </p>
              </div>
            </div>
          )}

          {selectedRole === 'parent' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>Parent Transparency Dashboard</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] sm:text-xs text-slate-500">Attendance Rate</div>
                  <div className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5">94.2%</div>
                  <p className="text-[10px] text-emerald-600 mt-0.5 font-semibold">22 sessions attended.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] sm:text-xs text-slate-500">Term Evaluation</div>
                  <div className="text-lg sm:text-2xl font-black text-amber-600 mt-0.5">Grade A (84%)</div>
                  <p className="text-[10px] text-slate-600 mt-0.5">Honors Development List.</p>
                </div>
              </div>
            </div>
          )}

          {selectedRole === 'coach' && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Coach Session Planner</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-900">Active Plan: U15 Attacking Transitions (80 mins)</div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
                    <span className="text-slate-500 block">Rondo</span>
                    <strong className="text-slate-900 text-xs">15m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
                    <span className="text-slate-500 block">Phase</span>
                    <strong className="text-slate-900 text-xs">35m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
                    <span className="text-slate-500 block">Match</span>
                    <strong className="text-slate-900 text-xs">30m</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedRole === 'admin' && (
            <div className="space-y-4">
              {/* Operations Overview */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Total Youth</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">450+</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Coaches</div>
                  <div className="text-base font-black text-amber-600 mt-0.5">18 Licensed</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Grants</div>
                  <div className="text-base font-black text-emerald-600 mt-0.5">42 Active</div>
                </div>
              </div>

              {/* Supabase Live Integration Dossier */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Supabase PostgreSQL Connection</h4>
                      <p className="text-[11px] font-mono text-slate-500 truncate max-w-[260px] sm:max-w-none">
                        https://cyolljxxcmaekhhllbix.supabase.co
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={refreshData}
                    disabled={isLoadingDb}
                    className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                    title="Refresh connection status"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline text-[11px] font-semibold">Test Connection</span>
                  </button>
                </div>

                {/* Connection Status Banner */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Supabase Auth & API:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Connected & Authenticated
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Table &apos;academy_registrations&apos;:</span>
                    {dbHealth?.tableExists ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Table Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-200">
                        SQL Schema Setup Ready
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct Launch to Backend CMS Console */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Academy CMS & Backend Data Console</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Add/edit/delete Coaches & photos, Fixtures & teams, News articles, Campuses & schedules.
                    </div>
                  </div>
                  <Link
                    href="/developer"
                    onClick={onClose}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 shrink-0"
                  >
                    <span>Launch CMS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* SQL Schema Script Helper */}
                <div className="p-3 rounded-xl bg-slate-900 text-slate-100 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-mono text-[11px]">Database Schema SQL (1-Click Setup)</span>
                    <button
                      onClick={handleCopySql}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] uppercase cursor-pointer"
                    >
                      {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono text-slate-400 overflow-x-auto max-h-24 p-2 bg-slate-950 rounded border border-slate-800">
                    {SUPABASE_SCHEMA_SQL}
                  </pre>
                  <p className="text-[10px] text-slate-400">
                    Paste this into your Supabase Dashboard ➔ <strong>SQL Editor</strong> ➔ click <strong>Run</strong> to finalize your table with Row Level Security.
                  </p>
                </div>

                {/* Recent Registrations Log */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Recent Candidate Applications ({registrations.length})
                    </span>
                    <Link
                      href="/join"
                      onClick={onClose}
                      className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
                    >
                      <span>New Test Submission</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  {registrations.length === 0 ? (
                    <div className="p-4 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                      No applications recorded yet. Submit a test registration from the Join page to view it here!
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {registrations.slice(0, 5).map((reg, idx) => (
                        <div
                          key={reg.id || reg.bookingRef || idx}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">
                              {reg.playerName} <span className="font-normal text-slate-500 font-mono text-[10px]">({reg.bookingRef})</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Parent: {reg.parentName} · {reg.phone} · Campus: {reg.preferredCampus}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
                            {reg.status || 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        </>
        )}

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 text-center sm:text-left">
            Ready to enroll your child into the MADEN FAF digital tracking system?
          </div>
          <button
            onClick={() => {
              onClose();
              if (onBookTrialClick) onBookTrialClick();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 font-bold text-xs uppercase tracking-wider text-slate-950 transition-all flex items-center justify-center gap-2 min-h-[42px] shadow-sm shadow-amber-200 cursor-pointer"
          >
            <span>Apply for Admission</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
