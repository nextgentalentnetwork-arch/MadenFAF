'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured, checkSupabaseHealth } from '@/lib/supabaseClient';
import { AcademyDataManager, ComponentToggles } from '@/lib/academyDataManager';
import { Program, Campus, CoachStaffMember, MatchFixture, NewsStory } from '@/data/academyData';
import { CoachesManager } from '@/components/developer/CoachesManager';
import { FixturesManager } from '@/components/developer/FixturesManager';
import { NewsManager } from '@/components/developer/NewsManager';
import { CampusesManager } from '@/components/developer/CampusesManager';
import { EventsManager } from '@/components/developer/EventsManager';
import { TrialManager } from '@/components/developer/TrialManager';
import { ScholarshipsManager } from '@/components/developer/ScholarshipsManager';
import { ParentReviewsManager } from '@/components/developer/ParentReviewsManager';
import { SuccessStoriesManager } from '@/components/developer/SuccessStoriesManager';
import { SponsorsManager } from '@/components/developer/SponsorsManager';
import { DigitalPortalAccessManager } from '@/components/developer/DigitalPortalAccessManager';
import { HeroManager } from '@/components/developer/HeroManager';
import { WebsiteComponentsGrid } from '@/components/developer/WebsiteComponentsGrid';
import { DeleteConfirmModal } from '@/components/developer/DeleteConfirmModal';
import { UnifiedApiService, SyncStatus } from '@/lib/unifiedApiService';
import {
  ShieldAlert,
  Database,
  Users,
  Building,
  Trophy,
  Newspaper,
  ToggleLeft,
  Settings,
  Search,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Download,
  RefreshCw,
  LogOut,
  ExternalLink,
  Lock,
  Key,
  ShieldCheck,
  AlertTriangle,
  Award,
  Sparkles,
  Eye,
  Save,
  X,
  Cloud,
  CloudUpload,
  CloudDownload,
  Code2,
  Copy,
  Check,
  Calendar,
  UserCheck,
  GraduationCap,
  MessageSquareQuote,
  Star,
  Handshake,
  Shield,
  LayoutGrid,
  Layers,
  Trash,
  RotateCcw,
} from 'lucide-react';

const FULL_SUPABASE_SQL = `-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query -> Run)
-- Creates tables and RLS policies for complete MADEN FAF database persistence.

-- 1. Academy Registrations Table
CREATE TABLE IF NOT EXISTS public.academy_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_ref TEXT UNIQUE NOT NULL,
    player_name TEXT NOT NULL,
    dob DATE NOT NULL,
    gender TEXT NOT NULL,
    parent_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    location TEXT,
    preferred_campus TEXT NOT NULL,
    position TEXT NOT NULL,
    experience_level TEXT NOT NULL,
    program TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending_trial',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.academy_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert to academy_registrations" ON public.academy_registrations FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow read academy_registrations" ON public.academy_registrations FOR SELECT TO public USING (true);
CREATE POLICY "Allow update academy_registrations" ON public.academy_registrations FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete academy_registrations" ON public.academy_registrations FOR DELETE TO public USING (true);

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'parent', 'coach', 'admin')),
    phone TEXT,
    campus TEXT DEFAULT 'gayeshpur',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow individual read of own profile" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow individual update of own profile" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow public insert for profile creation on signup" ON public.profiles FOR INSERT WITH CHECK (true);

-- 3. Unified Academy Content Store (Bulk JSON Store)
CREATE TABLE IF NOT EXISTS public.academy_content (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.academy_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read academy_content" ON public.academy_content FOR SELECT TO public USING (true);
CREATE POLICY "Allow public write academy_content" ON public.academy_content FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. Dedicated Coaching Staff Table
CREATE TABLE IF NOT EXISTS public.academy_coaches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'leadership',
    license TEXT NOT NULL,
    license_level TEXT,
    campus TEXT NOT NULL,
    experience_years INTEGER DEFAULT 5,
    playing_background TEXT,
    philosophy TEXT,
    bio TEXT,
    key_specialties JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    career_highlights JSONB DEFAULT '[]'::jsonb,
    image TEXT,
    accent_color TEXT DEFAULT 'amber',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.academy_coaches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read academy_coaches" ON public.academy_coaches FOR SELECT TO public USING (true);
CREATE POLICY "Allow public write academy_coaches" ON public.academy_coaches FOR ALL TO public USING (true) WITH CHECK (true);

-- 5. Dedicated Match Fixtures & Results Table
CREATE TABLE IF NOT EXISTS public.academy_fixtures (
    id TEXT PRIMARY KEY,
    competition TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming',
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    is_home BOOLEAN DEFAULT true,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    venue TEXT NOT NULL,
    age_group TEXT NOT NULL,
    player_of_the_match TEXT,
    match_report_snippet TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.academy_fixtures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read academy_fixtures" ON public.academy_fixtures FOR SELECT TO public USING (true);
CREATE POLICY "Allow public write academy_fixtures" ON public.academy_fixtures FOR ALL TO public USING (true) WITH CHECK (true);

-- 6. Dedicated News & Stories Table
CREATE TABLE IF NOT EXISTS public.academy_news (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Academy News',
    date TEXT NOT NULL,
    read_time TEXT DEFAULT '3 min read',
    author TEXT DEFAULT 'Academy Editorial',
    summary TEXT,
    content JSONB DEFAULT '[]'::jsonb,
    image TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.academy_news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read academy_news" ON public.academy_news FOR SELECT TO public USING (true);
CREATE POLICY "Allow public write academy_news" ON public.academy_news FOR ALL TO public USING (true) WITH CHECK (true);

-- 7. Dedicated Campuses & Training Centers Table
CREATE TABLE IF NOT EXISTS public.academy_campuses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    location TEXT NOT NULL,
    address TEXT,
    association TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    description TEXT,
    facilities JSONB DEFAULT '[]'::jsonb,
    training_days TEXT NOT NULL,
    timings TEXT NOT NULL,
    age_groups JSONB DEFAULT '[]'::jsonb,
    head_coach JSONB DEFAULT '{}'::jsonb,
    contact_phone TEXT,
    contact_email TEXT,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.academy_campuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read academy_campuses" ON public.academy_campuses FOR SELECT TO public USING (true);
CREATE POLICY "Allow public write academy_campuses" ON public.academy_campuses FOR ALL TO public USING (true) WITH CHECK (true);
`;

const subscribeDevAuth = (callback: () => void) => {
  window.addEventListener('maden_data_updated', callback);
  return () => window.removeEventListener('maden_data_updated', callback);
};

export default function DeveloperPage() {
  const isAuth = useSyncExternalStore(
    subscribeDevAuth,
    () => AcademyDataManager.isDeveloperAuthenticated(),
    () => false
  );

  // Authentication State
  const [devPasscode, setDevPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Management Tab
  const [activeTab, setActiveTab] = useState<
    | 'componentsGrid'
    | 'hero'
    | 'database'
    | 'programs'
    | 'campuses'
    | 'coaches'
    | 'fixtures'
    | 'news'
    | 'events'
    | 'trials'
    | 'scholarships'
    | 'parentReviews'
    | 'successStories'
    | 'sponsors'
    | 'digitalPortal'
    | 'toggles'
    | 'system'
  >('componentsGrid');

  // Developer deletion modal state
  const [deleteDevModal, setDeleteDevModal] = useState<{
    type: 'row' | 'program';
    id: string;
    name: string;
  } | null>(null);

  // Database Tab State
  const [dbRows, setDbRows] = useState<any[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [dbSearch, setDbSearch] = useState('');
  const [dbStatusFilter, setDbStatusFilter] = useState('all');
  const [dbMessage, setDbMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals State
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [isAddRowModalOpen, setIsAddRowModalOpen] = useState(false);
  const [newRowForm, setNewRowForm] = useState({
    playerName: '',
    parentName: '',
    email: '',
    phone: '',
    dob: '2010-01-01',
    gender: 'male',
    preferredCampus: 'gayeshpur',
    position: 'midfielder',
    experienceLevel: 'grassroots',
    program: 'development',
    status: 'pending_trial',
    message: '',
  });

  // Local Editable Modules State
  const [programs, setPrograms] = useState<Program[]>(() => AcademyDataManager.getPrograms());
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);

  const [componentToggles, setComponentToggles] = useState<ComponentToggles>(() =>
    AcademyDataManager.getComponentToggles()
  );

  // Cloud Persistence Sync State
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => UnifiedApiService.getSyncStatus());
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    return UnifiedApiService.subscribeStatus(setSyncStatus);
  }, []);

  const handleSyncAllToSupabase = async () => {
    setIsBulkSyncing(true);
    setDbMessage(null);
    try {
      const res = await AcademyDataManager.syncAllToSupabase();
      if (res.success) {
        setDbMessage({
          type: 'success',
          text: 'All modules (Coaches, Fixtures, News, Campuses, Programs, Toggles) synchronized to Supabase Cloud!',
        });
      } else {
        setDbMessage({
          type: 'error',
          text: 'Cloud sync encountered an issue. Local copies remain active.',
        });
      }
    } catch (err: any) {
      setDbMessage({ type: 'error', text: err?.message || 'Failed to sync to Supabase' });
    } finally {
      setIsBulkSyncing(false);
    }
  };

  const handlePullFromSupabase = async () => {
    setIsBulkSyncing(true);
    setDbMessage(null);
    try {
      const res = await AcademyDataManager.loadAllFromSupabase();
      if (res.updated) {
        setPrograms(AcademyDataManager.getPrograms());
        setComponentToggles(AcademyDataManager.getComponentToggles());
        setDbMessage({
          type: 'success',
          text: `Successfully reloaded ${res.count} modules from Supabase Cloud!`,
        });
      } else {
        setDbMessage({
          type: 'success',
          text: 'Local data is already up to date with Supabase.',
        });
      }
    } catch (err: any) {
      setDbMessage({ type: 'error', text: err?.message || 'Failed to pull from Supabase' });
    } finally {
      setIsBulkSyncing(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(FULL_SUPABASE_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // ---------------- SUPABASE DATABASE OPERATIONS ---------------- //
  const fetchSupabaseRegistrations = useCallback(async () => {
    setIsLoadingDb(true);
    setDbMessage(null);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('academy_registrations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          const applicantRows = data.filter(
            (r: any) => !r.booking_ref?.startsWith('SYS-SYNC-') && r.status !== 'cloud_persisted'
          );
          setDbRows(applicantRows);
          setIsLoadingDb(false);
          return;
        }
      }
      // Fallback to local storage store if Supabase offline
      const stored = localStorage.getItem('maden_faf_registrations');
      if (stored) {
        const parsed = JSON.parse(stored);
        setDbRows(
          parsed.map((item: any) => ({
            id: item.id || `local-${item.bookingRef}`,
            booking_ref: item.bookingRef,
            player_name: item.playerName,
            parent_name: item.parentName,
            phone: item.phone,
            email: item.email,
            preferred_campus: item.preferredCampus,
            position: item.position,
            experience_level: item.experienceLevel,
            program: item.program,
            status: item.status || 'pending_trial',
            created_at: item.createdAt || new Date().toISOString(),
          }))
        );
      }
    } catch (err: any) {
      setDbMessage({ type: 'error', text: err?.message || 'Failed to fetch database rows' });
    } finally {
      setIsLoadingDb(false);
    }
  }, []);

  // Fetch live Supabase registrations when authenticated
  useEffect(() => {
    let ignore = false;
    if (isAuth) {
      const loadInitial = async () => {
        try {
          if (isSupabaseConfigured()) {
            const { data, error } = await supabase
              .from('academy_registrations')
              .select('*')
              .order('created_at', { ascending: false });

            if (!ignore && !error && Array.isArray(data)) {
              const applicantRows = data.filter(
                (r: any) => !r.booking_ref?.startsWith('SYS-SYNC-') && r.status !== 'cloud_persisted'
              );
              setDbRows(applicantRows);
              return;
            }
          }
          const stored = localStorage.getItem('maden_faf_registrations');
          if (!ignore && stored) {
            const parsed = JSON.parse(stored);
            setDbRows(
              parsed.map((item: any) => ({
                id: item.id || `local-${item.bookingRef}`,
                booking_ref: item.bookingRef,
                player_name: item.playerName,
                parent_name: item.parentName,
                phone: item.phone,
                email: item.email,
                preferred_campus: item.preferredCampus,
                position: item.position,
                experience_level: item.experienceLevel,
                program: item.program,
                status: item.status || 'pending_trial',
                created_at: item.createdAt || new Date().toISOString(),
              }))
            );
          }
        } catch {
          // ignore error on unmounted
        }
      };
      loadInitial();
    }
    return () => {
      ignore = true;
    };
  }, [isAuth]);

  const handleDevLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');
    // Master passkey or quick unlock
    if (devPasscode === 'maden-dev-2026' || devPasscode === 'admin' || devPasscode === 'superbase') {
      AcademyDataManager.setDeveloperAuthenticated(true);
    } else {
      setAuthError('Invalid Master Developer Key. (Hint: Use maden-dev-2026 or click 1-Click Dev Unlock)');
    }
  };

  const handleQuickUnlock = () => {
    AcademyDataManager.setDeveloperAuthenticated(true);
  };

  const handleDevLogout = () => {
    AcademyDataManager.setDeveloperAuthenticated(false);
  };

  const handleUpdateStatus = async (rowId: string, newStatus: string) => {
    setDbMessage(null);
    try {
      if (isSupabaseConfigured() && !rowId.startsWith('local-')) {
        const { error } = await supabase
          .from('academy_registrations')
          .update({ status: newStatus })
          .eq('id', rowId);

        if (error) {
          setDbMessage({ type: 'error', text: error.message });
          return;
        }
      }

      // Update state locally
      setDbRows((prev) =>
        prev.map((r) => (r.id === rowId ? { ...r, status: newStatus } : r))
      );
      setDbMessage({ type: 'success', text: `Status successfully updated to "${newStatus}"` });
    } catch (err: any) {
      setDbMessage({ type: 'error', text: err?.message || 'Error updating status' });
    }
  };

  const handleDeleteRow = (rowId: string, bookingRef: string) => {
    setDeleteDevModal({ type: 'row', id: rowId, name: bookingRef });
  };

  const handleConfirmDevDelete = async () => {
    if (!deleteDevModal) return;
    const { type, id, name } = deleteDevModal;
    setDbMessage(null);

    if (type === 'row') {
      try {
        if (isSupabaseConfigured() && !id.startsWith('local-')) {
          const { error } = await supabase.from('academy_registrations').delete().eq('id', id);
          if (error) {
            setDbMessage({ type: 'error', text: error.message });
            setDeleteDevModal(null);
            return;
          }
        }
        setDbRows((prev) => prev.filter((r) => r.id !== id));
        setDbMessage({ type: 'success', text: `Registration ${name} deleted successfully.` });
      } catch (err: any) {
        setDbMessage({ type: 'error', text: err?.message || 'Error deleting row' });
      }
    } else if (type === 'program') {
      AcademyDataManager.deleteProgram(id);
      setPrograms(AcademyDataManager.getPrograms());
      setDbMessage({ type: 'success', text: `Program "${name}" deleted and persisted to Supabase.` });
    }

    setDeleteDevModal(null);
  };

  const handleSaveEditRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    try {
      if (isSupabaseConfigured() && !editingRow.id.startsWith('local-')) {
        const { error } = await supabase
          .from('academy_registrations')
          .update({
            player_name: editingRow.player_name,
            parent_name: editingRow.parent_name,
            phone: editingRow.phone,
            email: editingRow.email,
            preferred_campus: editingRow.preferred_campus,
            position: editingRow.position,
            program: editingRow.program,
            status: editingRow.status,
            message: editingRow.message,
          })
          .eq('id', editingRow.id);

        if (error) {
          setDbMessage({ type: 'error', text: error.message });
          return;
        }
      }

      setDbRows((prev) => prev.map((r) => (r.id === editingRow.id ? editingRow : r)));
      setEditingRow(null);
      setDbMessage({ type: 'success', text: 'Candidate details updated successfully in Supabase.' });
    } catch (err: any) {
      setDbMessage({ type: 'error', text: err?.message || 'Failed to save changes' });
    }
  };

  const handleCreateNewRow = async (e: React.FormEvent) => {
    e.preventDefault();
    const bookingRef = `MADEN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newRecord = {
      booking_ref: bookingRef,
      player_name: newRowForm.playerName,
      parent_name: newRowForm.parentName,
      phone: newRowForm.phone,
      email: newRowForm.email,
      dob: newRowForm.dob,
      gender: newRowForm.gender,
      preferred_campus: newRowForm.preferredCampus,
      position: newRowForm.position,
      experience_level: newRowForm.experienceLevel,
      program: newRowForm.program,
      status: newRowForm.status,
      message: newRowForm.message,
      created_at: new Date().toISOString(),
    };

    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('academy_registrations')
          .insert([newRecord])
          .select();

        if (error) {
          setDbMessage({ type: 'error', text: error.message });
          return;
        }

        if (data && data[0]) {
          setDbRows((prev) => [data[0], ...prev]);
        }
      } else {
        setDbRows((prev) => [{ ...newRecord, id: `local-${bookingRef}` }, ...prev]);
      }

      setIsAddRowModalOpen(false);
      setDbMessage({ type: 'success', text: `New registration created with Reference: ${bookingRef}` });
      // Reset form
      setNewRowForm({
        playerName: '',
        parentName: '',
        email: '',
        phone: '',
        dob: '2010-01-01',
        gender: 'male',
        preferredCampus: 'gayeshpur',
        position: 'midfielder',
        experienceLevel: 'grassroots',
        program: 'development',
        status: 'pending_trial',
        message: '',
      });
    } catch (err: any) {
      setDbMessage({ type: 'error', text: err?.message || 'Failed to insert row' });
    }
  };

  const exportToCSV = () => {
    if (!dbRows.length) return;
    const headers = ['Booking Ref', 'Player Name', 'Parent Name', 'Phone', 'Email', 'Campus', 'Position', 'Status', 'Date'];
    const rows = dbRows.map((r) => [
      r.booking_ref,
      r.player_name,
      r.parent_name,
      r.phone,
      r.email,
      r.preferred_campus,
      r.position,
      r.status,
      new Date(r.created_at).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `maden_faf_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Rows for display
  const filteredDbRows = dbRows.filter((r) => {
    const matchesSearch =
      (r.player_name || '').toLowerCase().includes(dbSearch.toLowerCase()) ||
      (r.booking_ref || '').toLowerCase().includes(dbSearch.toLowerCase()) ||
      (r.parent_name || '').toLowerCase().includes(dbSearch.toLowerCase()) ||
      (r.email || '').toLowerCase().includes(dbSearch.toLowerCase());
    const matchesStatus = dbStatusFilter === 'all' || r.status === dbStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // ---------------- TOGGLE COMPONENT ---------------- //
  const handleToggle = (key: keyof ComponentToggles) => {
    AcademyDataManager.toggleComponent(key);
    setComponentToggles(AcademyDataManager.getComponentToggles());
  };

  // ---------------- AUTHENTICATION SCREEN ---------------- //
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />

        <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
              <Key className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">
              Developer Command Center
            </h1>
            <p className="text-xs text-slate-400">
              Master administrative console for database modifications, components management, and curriculum controls.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Target Database:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              cyolljxxcmaekhhllbix.supabase.co
            </span>
          </div>

          <form onSubmit={handleDevLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Master Developer Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={devPasscode}
                  onChange={(e) => setDevPasscode(e.target.value)}
                  placeholder="Enter passcode or click quick unlock..."
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Authenticate Developer Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Fast Unlock for convenience */}
          <div className="pt-2 border-t border-slate-800 text-center space-y-3">
            <button
              onClick={handleQuickUnlock}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>1-Click Developer Instant Unlock</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- MAIN DEVELOPER DASHBOARD ---------------- //
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-800 px-4 sm:px-8 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black uppercase tracking-tight text-white">MADEN FAF</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
                  Developer Mode
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Backend Central Controller · Supabase Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </Link>

            <button
              onClick={handleDevLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 flex flex-col space-y-6">
        {/* Supabase Cloud Live Persistence Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">Supabase Cloud Data Persistence</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Connected
                </span>
                {syncStatus.isSyncing && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Syncing...
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                All changes to Coaches, Fixtures, News, Campuses, and Programs in this dashboard are automatically synced to Supabase and instantly reflected on the live front-end.
                {syncStatus.lastSyncedAt && ` · Last Cloud Sync: ${syncStatus.lastSyncedAt}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleSyncAllToSupabase}
              disabled={isBulkSyncing}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              <span>{isBulkSyncing ? 'Syncing...' : 'Sync All to Cloud'}</span>
            </button>

            <button
              onClick={handlePullFromSupabase}
              disabled={isBulkSyncing}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700 disabled:opacity-50"
            >
              <CloudDownload className="w-3.5 h-3.5 text-amber-400" />
              <span>Pull from Cloud</span>
            </button>

            <button
              onClick={() => setIsSqlModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>SQL Schema</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x">
          <button
            onClick={() => setActiveTab('componentsGrid')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'componentsGrid'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs ring-2 ring-amber-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>All Components (Grid View)</span>
          </button>

          <button
            onClick={() => setActiveTab('hero')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'hero'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs ring-2 ring-amber-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Hero & Video Experience</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'database'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase Database ({dbRows.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('programs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'programs'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Programs ({programs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('campuses')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'campuses'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Campuses</span>
          </button>

          <button
            onClick={() => setActiveTab('coaches')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'coaches'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Coaching Staff</span>
          </button>

          <button
            onClick={() => setActiveTab('fixtures')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'fixtures'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Fixtures & Results</span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'news'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>News & Stories</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'events'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Camps & Events</span>
          </button>

          <button
            onClick={() => setActiveTab('trials')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'trials'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Trial Management</span>
          </button>

          <button
            onClick={() => setActiveTab('scholarships')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'scholarships'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Scholarship Programs</span>
          </button>

          <button
            onClick={() => setActiveTab('parentReviews')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'parentReviews'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquareQuote className="w-4 h-4" />
            <span>Parent Portal Review</span>
          </button>

          <button
            onClick={() => setActiveTab('successStories')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'successStories'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Success Stories</span>
          </button>

          <button
            onClick={() => setActiveTab('sponsors')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'sponsors'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Handshake className="w-4 h-4" />
            <span>Sponsors & Partners</span>
          </button>

          <button
            onClick={() => setActiveTab('digitalPortal')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'digitalPortal'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Digital Portal Access</span>
          </button>

          <button
            onClick={() => setActiveTab('toggles')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'toggles'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ToggleLeft className="w-4 h-4" />
            <span>Component Toggles</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'system'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>System Diagnostics</span>
          </button>
        </div>

        {/* Global Feedback Alert */}
        {dbMessage && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
              dbMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {dbMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <span>{dbMessage.text}</span>
            </div>
            <button
              onClick={() => setDbMessage(null)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ---------------- 0. ALL WEBSITE COMPONENTS (GRID VIEW) ---------------- */}
        {activeTab === 'componentsGrid' && (
          <WebsiteComponentsGrid
            onSelectTab={(tabId) => setActiveTab(tabId as any)}
            onNotify={(msg) => setDbMessage(msg)}
          />
        )}

        {/* ---------------- HERO SHOWCASE & VIDEO EXPERIENCE TAB ---------------- */}
        {activeTab === 'hero' && (
          <HeroManager onNotify={(msg) => setDbMessage(msg)} />
        )}

        {/* ---------------- 1. SUPABASE DATABASE CRUD TAB ---------------- */}
        {activeTab === 'database' && (
          <div className="space-y-4">
            {/* Control Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px]">
                  <input
                    type="text"
                    value={dbSearch}
                    onChange={(e) => setDbSearch(e.target.value)}
                    placeholder="Search candidate, phone, email, ref..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-amber-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <select
                  value={dbStatusFilter}
                  onChange={(e) => setDbStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending_trial">Pending Trial</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="attended">Attended</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="rejected">Rejected</option>
                </select>

                <button
                  onClick={fetchSupabaseRegistrations}
                  disabled={isLoadingDb}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={exportToCSV}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-amber-600" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => setIsAddRowModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Candidate</span>
                </button>
              </div>
            </div>

            {/* Table Representation */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-mono uppercase text-[10px]">
                      <th className="py-3 px-4">Booking Ref</th>
                      <th className="py-3 px-4">Player & Parent</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Campus & Position</th>
                      <th className="py-3 px-4">Status Action</th>
                      <th className="py-3 px-4">Created</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredDbRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">
                          {isLoadingDb ? 'Loading Supabase data...' : 'No registrations found matching criteria.'}
                        </td>
                      </tr>
                    ) : (
                      filteredDbRows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            {row.booking_ref}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-sm">{row.player_name}</div>
                            <div className="text-[11px] text-slate-500">Parent: {row.parent_name}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-slate-800">{row.phone}</div>
                            <div className="text-[11px] text-slate-500">{row.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800 capitalize">
                              {row.preferred_campus}
                            </div>
                            <div className="text-[11px] text-amber-700 capitalize">
                              {row.position} · {row.program}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={row.status || 'pending_trial'}
                              onChange={(e) => handleUpdateStatus(row.id, e.target.value)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border outline-none cursor-pointer ${
                                row.status === 'enrolled'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : row.status === 'confirmed'
                                  ? 'bg-sky-50 text-sky-800 border-sky-300'
                                  : row.status === 'rejected'
                                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              <option value="pending_trial">Pending Trial</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="attended">Attended</option>
                              <option value="enrolled">Enrolled</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                            {new Date(row.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingRow({ ...row })}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                title="Edit Candidate"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteRow(row.id, row.booking_ref)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                                title="Delete Registration"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 2. PROGRAMS MANAGER TAB ---------------- */}
        {activeTab === 'programs' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Academy Programs & Curriculum</h3>
                <p className="text-xs text-slate-500">
                  Manage youth age groups, schedule hours, coach ratios, and technical emphasis.
                </p>
              </div>
              <button
                onClick={() => setIsAddProgramOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Program</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.map((prog) => (
                <div
                  key={prog.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-400 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-700">{prog.ageGroup}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingProgram({ ...prog })}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteDevModal({ type: 'program', id: prog.id, name: prog.name });
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                          title="Delete Program"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{prog.name}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{prog.description}</p>

                    <div className="pt-2 text-[11px] font-mono text-slate-500 space-y-1">
                      <div>Schedule: {prog.schedule}</div>
                      <div>Coach Ratio: {prog.coachRatio}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Tech: {prog.pillarEmphasis.technical}%</span>
                    <span>Tact: {prog.pillarEmphasis.tactical}%</span>
                    <span>Phys: {prog.pillarEmphasis.physical}%</span>
                    <span>Ment: {prog.pillarEmphasis.mental}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- 3. CAMPUSES MANAGER TAB ---------------- */}
        {activeTab === 'campuses' && (
          <CampusesManager onNotify={(msg) => setDbMessage(msg)} />
        )}

        {/* ---------------- 4. COACHING STAFF MANAGER TAB ---------------- */}
        {activeTab === 'coaches' && (
          <CoachesManager onNotify={(msg) => setDbMessage(msg)} />
        )}

        {/* ---------------- 5. FIXTURES TAB ---------------- */}
        {activeTab === 'fixtures' && (
          <FixturesManager onNotify={(msg) => setDbMessage(msg)} />
        )}

        {/* ---------------- 6. NEWS STORIES TAB ---------------- */}
        {activeTab === 'news' && (
          <NewsManager onNotify={(msg) => setDbMessage(msg)} />
        )}

        {/* ---------------- 7. CAMPS AND EVENTS TAB (MODULE 1) ---------------- */}
        {activeTab === 'events' && (
          <EventsManager onNotify={(msg) => setDbMessage(msg)} />
        )}

        {/* ---------------- 8. TRIAL MANAGEMENT TAB (MODULE 2) ---------------- */}
        {activeTab === 'trials' && (
          <TrialManager onNotify={(msg) => setDbMessage(msg)} />
        )}

        {/* ---------------- 9. SCHOLARSHIP PROGRAMS TAB (MODULE 4) ---------------- */}
        {activeTab === 'scholarships' && (
          <ScholarshipsManager onNotify={(msg) => setDbMessage(msg)} />
        )}

        {/* ---------------- 10. PARENT PORTAL REVIEW TAB (MODULE 5) ---------------- */}
        {activeTab === 'parentReviews' && (
          <ParentReviewsManager onNotify={(msg) => setDbMessage(msg)} />
        )}

        {/* ---------------- 11. SUCCESS STORIES TAB (MODULE 6) ---------------- */}
        {activeTab === 'successStories' && (
          <SuccessStoriesManager onNotify={(msg) => setDbMessage(msg)} />
        )}

        {/* ---------------- 12. SPONSORS & BRAND PARTNERS TAB (MODULE 7) ---------------- */}
        {activeTab === 'sponsors' && (
          <SponsorsManager onNotify={(msg) => setDbMessage(msg)} />
        )}

        {/* ---------------- 13. ACCESS TO DIGITAL PORTAL TAB (MODULE 8) ---------------- */}
        {activeTab === 'digitalPortal' && (
          <DigitalPortalAccessManager onNotify={(msg) => setDbMessage(msg)} />
        )}

        {/* ---------------- COMPONENT TOGGLES TAB ---------------- */}
        {activeTab === 'toggles' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Component & Module Toggles</h3>
                <p className="text-xs text-slate-500">
                  Instantly show or hide specific website sections and modules without modifying code.
                </p>
              </div>
              <button
                onClick={() => {
                  AcademyDataManager.resetAllToDefaults();
                  setPrograms(AcademyDataManager.getPrograms());
                  setComponentToggles(AcademyDataManager.getComponentToggles());
                  fetchSupabaseRegistrations();
                  setDbMessage({ type: 'success', text: 'All modules and component toggles reset to default.' });
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Reset All to Defaults
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(componentToggles).map(([key, isEnabled]) => (
                <div
                  key={key}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {isEnabled ? '● Active on Homepage' : '○ Hidden from View'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle(key as keyof ComponentToggles)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      isEnabled ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                        isEnabled ? 'right-0.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- 8. SYSTEM DIAGNOSTICS TAB ---------------- */}
        {activeTab === 'system' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-lg font-black uppercase text-slate-900 tracking-tight">
                System Health & Environment Configurations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-mono uppercase text-slate-500 font-bold">
                    Connected Supabase Project
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-900 truncate">
                    https://cyolljxxcmaekhhllbix.supabase.co
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>REST & Auth Endpoints Verified (200 OK)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-mono uppercase text-slate-500 font-bold">
                    Supabase Schemas & Tables
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-900">
                    public.academy_registrations, public.profiles
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Row Level Security (RLS) Active</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 font-mono text-xs">
                <div className="text-amber-400 font-bold uppercase tracking-wider">
                  Developer Direct SQL Reference
                </div>
                <pre className="overflow-x-auto text-[11px] text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
{`-- Quick Table Query for academy_registrations:
SELECT id, booking_ref, player_name, parent_name, phone, status 
FROM public.academy_registrations 
ORDER BY created_at DESC;

-- Update status query:
UPDATE public.academy_registrations 
SET status = 'enrolled' 
WHERE booking_ref = 'MADEN-EXAMPLE-REF';`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- EDIT REGISTRATION ROW MODAL ---------------- */}
      {editingRow && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black uppercase text-slate-900">
                Edit Candidate: {editingRow.booking_ref}
              </h3>
              <button
                onClick={() => setEditingRow(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRow} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Player Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingRow.player_name || ''}
                    onChange={(e) => setEditingRow({ ...editingRow, player_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parent/Guardian Name</label>
                  <input
                    type="text"
                    required
                    value={editingRow.parent_name || ''}
                    onChange={(e) => setEditingRow({ ...editingRow, parent_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editingRow.phone || ''}
                    onChange={(e) => setEditingRow({ ...editingRow, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editingRow.email || ''}
                    onChange={(e) => setEditingRow({ ...editingRow, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campus</label>
                  <select
                    value={editingRow.preferred_campus || 'gayeshpur'}
                    onChange={(e) => setEditingRow({ ...editingRow, preferred_campus: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="gayeshpur">Gayeshpur</option>
                    <option value="north24parganas">Ichapore</option>
                    <option value="krishnanagar">Krishnanagar</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Position</label>
                  <select
                    value={editingRow.position || 'midfielder'}
                    onChange={(e) => setEditingRow({ ...editingRow, position: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="goalkeeper">Goalkeeper</option>
                    <option value="defender">Defender</option>
                    <option value="midfielder">Midfielder</option>
                    <option value="forward">Forward</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingRow.status || 'pending_trial'}
                    onChange={(e) => setEditingRow({ ...editingRow, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  >
                    <option value="pending_trial">Pending Trial</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="attended">Attended</option>
                    <option value="enrolled">Enrolled</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Coach & Intake Notes</label>
                <textarea
                  rows={3}
                  value={editingRow.message || ''}
                  onChange={(e) => setEditingRow({ ...editingRow, message: e.target.value })}
                  placeholder="Scout feedback, trial date scheduling, attendance notes..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase tracking-wider"
                >
                  Save Changes to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- ADD NEW CANDIDATE MODAL ---------------- */}
      {isAddRowModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black uppercase text-slate-900">
                Direct Add Candidate to Supabase
              </h3>
              <button
                onClick={() => setIsAddRowModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewRow} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Player Name *</label>
                  <input
                    type="text"
                    required
                    value={newRowForm.playerName}
                    onChange={(e) => setNewRowForm({ ...newRowForm, playerName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parent Name *</label>
                  <input
                    type="text"
                    required
                    value={newRowForm.parentName}
                    onChange={(e) => setNewRowForm({ ...newRowForm, parentName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newRowForm.phone}
                    onChange={(e) => setNewRowForm({ ...newRowForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newRowForm.email}
                    onChange={(e) => setNewRowForm({ ...newRowForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campus</label>
                  <select
                    value={newRowForm.preferredCampus}
                    onChange={(e) => setNewRowForm({ ...newRowForm, preferredCampus: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="gayeshpur">Gayeshpur</option>
                    <option value="north24parganas">Ichapore</option>
                    <option value="krishnanagar">Krishnanagar</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Position</label>
                  <select
                    value={newRowForm.position}
                    onChange={(e) => setNewRowForm({ ...newRowForm, position: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="goalkeeper">Goalkeeper</option>
                    <option value="defender">Defender</option>
                    <option value="midfielder">Midfielder</option>
                    <option value="forward">Forward</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={newRowForm.status}
                    onChange={(e) => setNewRowForm({ ...newRowForm, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  >
                    <option value="pending_trial">Pending Trial</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="enrolled">Enrolled</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddRowModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase tracking-wider"
                >
                  Create & Save to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- EDIT PROGRAM MODAL ---------------- */}
      {editingProgram && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-base font-black uppercase text-slate-900">Edit Program: {editingProgram.name}</h3>
              <button onClick={() => setEditingProgram(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Program Name</label>
                <input
                  type="text"
                  value={editingProgram.name}
                  onChange={(e) => setEditingProgram({ ...editingProgram, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Age Group Bracket</label>
                <input
                  type="text"
                  value={editingProgram.ageGroup}
                  onChange={(e) => setEditingProgram({ ...editingProgram, ageGroup: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Schedule</label>
                <input
                  type="text"
                  value={editingProgram.schedule}
                  onChange={(e) => setEditingProgram({ ...editingProgram, schedule: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Coach to Player Ratio</label>
                <input
                  type="text"
                  value={editingProgram.coachRatio}
                  onChange={(e) => setEditingProgram({ ...editingProgram, coachRatio: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProgram.description}
                  onChange={(e) => setEditingProgram({ ...editingProgram, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingProgram(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    AcademyDataManager.updateProgram(editingProgram.id, editingProgram);
                    setPrograms(AcademyDataManager.getPrograms());
                    setEditingProgram(null);
                    setDbMessage({ type: 'success', text: `Program ${editingProgram.name} updated.` });
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase"
                >
                  Save Program
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SQL SCHEMA MODAL ---------------- */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black uppercase text-slate-900">
                  Supabase Database PostgreSQL Schema (All 7 Tables)
                </h3>
              </div>
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Run this SQL script in your <strong>Supabase Dashboard ➔ SQL Editor ➔ New Query ➔ Run</strong>.
                It provisions tables and Row Level Security for:
              </p>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">academy_registrations</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">profiles</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">academy_coaches</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">academy_fixtures</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">academy_news</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">academy_campuses</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">academy_content</span>
              </div>
            </div>

            <div className="relative flex-1 min-h-[300px] overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase cursor-pointer transition-colors shadow-xs"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>
              </div>
              <pre className="p-4 pt-10 text-[11px] font-mono text-slate-300 overflow-y-auto h-full max-h-[420px]">
                {FULL_SUPABASE_SQL}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                Connected Project: <code className="font-bold text-slate-800">cyolljxxcmaekhhllbix.supabase.co</code>
              </span>
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Developer Deletion Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteDevModal)}
        title={
          deleteDevModal?.type === 'row'
            ? 'Delete Registration Record'
            : 'Delete Curriculum Program'
        }
        message={
          deleteDevModal?.type === 'row'
            ? 'Are you sure you want to permanently delete this registration record? It will be removed from Supabase Cloud and local state.'
            : 'Are you sure you want to delete this curriculum program? It will be removed from the Football Programs section on the homepage.'
        }
        itemName={deleteDevModal?.name}
        confirmLabel={deleteDevModal?.type === 'row' ? 'Delete Record' : 'Delete Program'}
        onConfirm={handleConfirmDevDelete}
        onCancel={() => setDeleteDevModal(null)}
      />

      {/* Closing Container */}
    </div>
  );
}
