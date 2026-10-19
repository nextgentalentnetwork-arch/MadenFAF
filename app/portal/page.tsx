'use client';

import React from 'react';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { useAuth } from '@/lib/AuthContext';
import { getRoleDefinition } from '@/lib/rbac';
import {
  Lock,
  LogOut,
  MapPin,
  RefreshCw,
  Shield,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { AcademyDataManager } from '@/lib/academyDataManager';

import { PlayerDashboard } from '@/components/portal/PlayerDashboard';
import { ParentDashboard } from '@/components/portal/ParentDashboard';
import { CoachDashboard } from '@/components/portal/CoachDashboard';
import { ManagerDashboard } from '@/components/portal/ManagerDashboard';
import { Staff1Dashboard } from '@/components/portal/Staff1Dashboard';
import { Staff2Dashboard } from '@/components/portal/Staff2Dashboard';
import { AdminDashboard } from '@/components/portal/AdminDashboard';
import { PendingDashboard } from '@/components/portal/PendingDashboard';

export default function PortalPage() {
  const { user, profile, isLoading, logout } = useAuth();

  // 1. Loading State - prevent UI flash
  if (isLoading) {
    return (
      <PublicPageShell
        title="Member Digital Portal"
        subtitle="Verifying role authorizations and academy credentials..."
        badge="Secure Access"
        breadcrumbs={[{ label: 'Digital Portal' }]}
        accessLevel="public"
        showPreFooterCta={false}
      >
        <div className="py-24 max-w-md mx-auto text-center space-y-4 px-4">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Verifying Academy Credentials...
            </h3>
            <p className="text-xs text-slate-500">
              Checking assigned role permissions against central database records.
            </p>
          </div>
        </div>
      </PublicPageShell>
    );
  }

  // 2. Unauthenticated State - Hide all dashboards, require Login
  if (!user || !profile) {
    return (
      <PublicPageShell
        title="Member Digital Portal"
        subtitle="Private authenticated platform for enrolled athletes, guardians, coaches, and staff."
        badge="Protected Area"
        breadcrumbs={[{ label: 'Digital Portal' }]}
        accessLevel="public"
        showPreFooterCta={false}
      >
        <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Sign In Required
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Individual role options and academy dashboards are protected. Please sign in with your verified credentials to view your assigned portal.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In to Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/join"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Book a Trial
            </Link>
          </div>
        </div>
      </PublicPageShell>
    );
  }

  // 3. User is Authenticated: Retrieve verified role definition
  const roleDef = getRoleDefinition(profile.role);
  const isMasterDev = profile.email?.toLowerCase() === 'pravakarghosh.2025@gmail.com' ||
    AcademyDataManager.isDeveloperAuthenticated();

  return (
    <PublicPageShell
      title={roleDef.portalTitle}
      subtitle={roleDef.portalSubtitle}
      badge={roleDef.badge}
      breadcrumbs={[{ label: 'Digital Portal', href: '/portal' }, { label: roleDef.label }]}
      accessLevel="public"
      showPreFooterCta={false}
    >
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* User Identity Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 border border-slate-800 flex items-center justify-center font-black text-xl overflow-hidden shrink-0 shadow-md">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.fullName.charAt(0) || 'U'
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {profile.fullName}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${roleDef.badgeColor}`}>
                  {roleDef.badge}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  ({roleDef.label})
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile.campus || 'Gayeshpur Flagship Campus'}</span>
                <span>•</span>
                <span className="font-mono text-slate-600">{profile.email}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => logout()}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            {isMasterDev && (
              <Link
                href="/developer"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-slate-950" />
                <span>Backend Command Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* 4. Strictly render the assigned role dashboard */}
        {profile.role === 'pending' || profile.status === 'pending' ? (
          <PendingDashboard profile={profile} />
        ) : profile.role === 'player' ? (
          <PlayerDashboard profile={profile} />
        ) : profile.role === 'parent' ? (
          <ParentDashboard profile={profile} />
        ) : profile.role === 'coach' ? (
          <CoachDashboard profile={profile} />
        ) : profile.role === 'manager' ? (
          <ManagerDashboard profile={profile} />
        ) : profile.role === 'staff1' ? (
          <Staff1Dashboard profile={profile} />
        ) : profile.role === 'staff2' ? (
          <Staff2Dashboard profile={profile} />
        ) : profile.role === 'admin' ? (
          <AdminDashboard profile={profile} />
        ) : (
          <PendingDashboard profile={profile} />
        )}
      </div>
    </PublicPageShell>
  );
}
