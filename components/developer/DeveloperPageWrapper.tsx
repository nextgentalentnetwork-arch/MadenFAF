'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { UnifiedApiService, SyncStatus } from '@/lib/unifiedApiService';
import { AcademyDataManager } from '@/lib/academyDataManager';
import {
  ShieldAlert,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Shield,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  LayoutGrid,
  Users,
  Trophy,
  Building,
  Calendar,
  Newspaper,
  GraduationCap,
  Handshake,
  UserCheck,
  HeartHandshake,
  Sliders,
  Sparkles,
} from 'lucide-react';

export interface DeveloperPageWrapperProps {
  children: React.ReactNode;
  moduleTitle: string;
  moduleDescription: string;
  moduleId: string;
  badge?: string;
  actions?: React.ReactNode;
}

export const DEVELOPER_MODULE_LINKS = [
  { id: 'trials', name: 'Trials & Players', href: '/developer/trials', icon: UserCheck, count: () => `${AcademyDataManager.getTrialSlots().length} Slots` },
  { id: 'coaches', name: 'Coaching Staff', href: '/developer/coaches', icon: Users, count: () => `${AcademyDataManager.getCoaches().length} Coaches` },
  { id: 'programs', name: 'Programs & Pathway', href: '/developer/programs', icon: Trophy, count: () => `${AcademyDataManager.getPrograms().length} Curriculums` },
  { id: 'donations', name: 'Donations & Members', href: '/developer/donations', icon: HeartHandshake, count: () => 'Donor Studio' },
  { id: 'campuses', name: 'Campus Facilities', href: '/developer/campuses', icon: Building, count: () => `${AcademyDataManager.getCampuses().length} Centers` },
  { id: 'fixtures', name: 'Match Fixtures', href: '/developer/fixtures', icon: Trophy, count: () => `${AcademyDataManager.getFixtures().length} Fixtures` },
  { id: 'news', name: 'News & Press', href: '/developer/news', icon: Newspaper, count: () => `${AcademyDataManager.getNews().length} Stories` },
  { id: 'events', name: 'Camps & Events', href: '/developer/events', icon: Calendar, count: () => `${AcademyDataManager.getEvents().length} Events` },
  { id: 'scholarships', name: 'Scholarships', href: '/developer/scholarships', icon: GraduationCap, count: () => `${AcademyDataManager.getScholarships().length} Tiers` },
  { id: 'sponsors', name: 'Sponsors & Brands', href: '/developer/sponsors', icon: Handshake, count: () => `${AcademyDataManager.getSponsors().length} Partners` },
  { id: 'components', name: 'Components Grid', href: '/developer/components', icon: LayoutGrid, count: () => '21 Modules' },
];

export const DeveloperPageWrapper: React.FC<DeveloperPageWrapperProps> = ({
  children,
  moduleTitle,
  moduleDescription,
  moduleId,
  badge,
  actions,
}) => {
  const { user, profile } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(UnifiedApiService.getSyncStatus());
  const [isSyncing, setIsSyncing] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    return UnifiedApiService.subscribeStatus((status: SyncStatus) => {
      setSyncStatus(status);
    });
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await AcademyDataManager.syncAllToSupabase();
      if (res.success) {
        setNotice({ type: 'success', text: 'All module datasets successfully synchronized with Supabase Cloud.' });
      } else {
        setNotice({ type: 'error', text: 'Some records could not sync. Retrying in background.' });
      }
    } catch {
      setNotice({ type: 'error', text: 'Cloud sync encountered a network error.' });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setNotice(null), 5000);
    }
  };

  // RBAC Access Guard: only admin allowed for developer and backend management
  const isAllowed = profile?.role === 'admin';

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-black uppercase tracking-tight text-white">
              Restricted Developer Route
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              This module requires authenticated Developer or Master Admin credentials.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all text-center"
            >
              Log In as Developer / Admin
            </Link>
            <Link
              href="/"
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-all text-center"
            >
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col">
      {/* Top Universal Dev Bar */}
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 text-white px-4 sm:px-6 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Brand & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <Link
              href="/developer"
              className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition-colors"
              title="Return to Main Developer Console"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/developer" className="hover:text-amber-400 transition-colors font-semibold">
                Developer Console
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-amber-400 font-bold">{moduleTitle}</span>
            </div>

            {badge && (
              <span className="hidden md:inline-flex px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold uppercase">
                {badge}
              </span>
            )}
          </div>

          {/* Module Switcher & Cloud Status */}
          <div className="flex items-center gap-2.5">
            {/* Quick module jumper */}
            <div className="relative">
              <select
                aria-label="Switch Developer Module"
                value={moduleId}
                onChange={(e) => {
                  const target = DEVELOPER_MODULE_LINKS.find((m) => m.id === e.target.value);
                  if (target) window.location.href = target.href;
                }}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-hidden focus:border-amber-500 cursor-pointer"
              >
                <option disabled value="">Jump to Module...</option>
                {DEVELOPER_MODULE_LINKS.map((mod) => (
                  <option key={mod.id} value={mod.id}>
                    {mod.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cloud Sync Button */}
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Force Sync this module with Supabase Cloud"
            >
              <Cloud className={`w-3.5 h-3.5 ${syncStatus.lastSyncedAt ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="hidden md:inline">Sync Cloud</span>
            </button>

            {/* Showcase & Home link */}
            <Link
              href="/components-showcase"
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Showcase</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1"
              title="Open public website in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">View Site</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Module Sub-Navigation Bar */}
      <nav aria-label="Developer Modules" className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 min-w-max">
          <Link
            href="/developer"
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Overview</span>
          </Link>
          {DEVELOPER_MODULE_LINKS.map((mod) => {
            const Icon = mod.icon;
            const isActive = mod.id === moduleId;
            return (
              <Link
                key={mod.id}
                href={mod.href}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mod.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Notice Banner */}
      {notice && (
        <div
          className={`px-4 py-2.5 text-xs font-semibold text-center ${
            notice.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-rose-500 text-white'
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Module Header Strip */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-mono font-bold uppercase">
                Standalone Route: /developer/{moduleId}
              </span>
            </div>
            <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight mt-1.5">
              {moduleTitle}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {moduleDescription}
            </p>
          </div>

          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>

        {/* Content Children */}
        <div>{children}</div>
      </main>
    </div>
  );
};
