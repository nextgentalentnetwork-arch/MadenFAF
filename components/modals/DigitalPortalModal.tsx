'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  UserCheck,
  Shield,
  Calendar,
  ExternalLink,
  LogOut,
  HeartHandshake,
  Lock,
  ShieldAlert,
  ArrowRight,
  Trophy,
} from 'lucide-react';
import { useAuth, UserRole } from '@/lib/AuthContext';
import {
  getRoleDefinition,
  canUserAccessPortal,
  getPortalPathForRole,
  UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
} from '@/lib/rbac';
import { AdminDashboard } from '@/components/portal/AdminDashboard';
import { MemberDashboard } from '@/components/membership/MemberDashboard';

interface DigitalPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_TABS: { id: UserRole; label: string }[] = [
  { id: 'member', label: 'Member — Donation & Support Portal' },
  { id: 'admin', label: 'Admin — Backend Management' },
];

export const DigitalPortalModal: React.FC<DigitalPortalModalProps> = ({ isOpen, onClose }) => {
  const { profile, login, logout } = useAuth();
  const isAdmin =
    profile?.role === 'admin' ||
    profile?.email?.toLowerCase() === 'pravakarghosh.2025@gmail.com';

  const [manualTabSelection, setManualTabSelection] = useState<{
    email: string | null;
    tab: UserRole;
  } | null>(null);
  const [deniedBanner, setDeniedBanner] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentEmail = profile?.email || null;
  const selectedRoleTab: UserRole =
    manualTabSelection && manualTabSelection.email === currentEmail
      ? manualTabSelection.tab
      : (isAdmin ? (profile?.role || 'member') : 'member');

  const authorizedRolesList: UserRole[] =
    profile?.roles && profile.roles.length > 0 && profile.approvedByAdmin
      ? profile.roles
      : profile
        ? [profile.role]
        : [];

  const activeRole: UserRole =
    profile && canUserAccessPortal(profile.role, selectedRoleTab, authorizedRolesList)
      ? selectedRoleTab
      : (isAdmin ? (profile?.role || selectedRoleTab) : 'member');

  const isCurrentTabUnauthorized = Boolean(
    profile && !canUserAccessPortal(profile.role, selectedRoleTab, authorizedRolesList)
  );

  const roleDef = getRoleDefinition(activeRole);

  const handleSelectRoleTab = async (role: UserRole) => {
    if (!isAdmin && role === 'admin') return;
    setManualTabSelection({ email: currentEmail, tab: role });
    if (!profile) {
      setDeniedBanner(null);
      await login('member@madenfaf.com', 'maden2026', 'member');
      return;
    }

    const allowed = canUserAccessPortal(profile.role, role, authorizedRolesList);
    if (!allowed) {
      setDeniedBanner(UNAUTHORIZED_PORTAL_ACCESS_MESSAGE);
      try {
        await fetch('/api/auth/rbac', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'selfModifyRoleAttempt',
            email: profile.email,
            attemptedRole: role,
          }),
        });
      } catch {
        // Non-blocking audit
      }
    } else {
      setDeniedBanner(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl bg-slate-50 border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-950 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-amber-400/50 bg-slate-900 flex items-center justify-center shadow-xs p-0.5">
                <img
                  src="/images/maden-faf-official-logo.png"
                  alt="MADEN FAF Official Crest"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                    {isAdmin ? 'Administrative & Executive Management' : 'Foundation Member Digital Portal'}
                  </span>
                  {profile && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      Verified: {profile.role.toUpperCase()}
                    </span>
                  )}
                </div>
                <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-white">
                  {roleDef.portalTitle}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
            {/* Admin-Only Role Switch Tabs */}
            {isAdmin && (
              <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0 gap-1">
                {ROLE_TABS.map((t) => {
                  const isAllowed = profile
                    ? canUserAccessPortal(profile.role, t.id, authorizedRolesList)
                    : true;
                  const isSelected = selectedRoleTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectRoleTab(t.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? isAllowed
                            ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                            : 'bg-rose-600 text-white shadow-xs font-black'
                          : isAllowed
                            ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                            : 'text-slate-500 hover:text-rose-300'
                      }`}
                    >
                      {!isAllowed && <Lock className="w-3 h-3 text-rose-400" />}
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <Link
              href={getPortalPathForRole(profile?.role || activeRole)}
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 transition-colors"
              title="Open Dedicated Full-Screen Portal"
            >
              <span>Full Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            {profile && (
              <button
                onClick={async () => {
                  await logout();
                  setDeniedBanner(null);
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors shrink-0 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              aria-label="Close portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {isCurrentTabUnauthorized || deniedBanner ? (
            <div className="bg-white border-2 border-rose-300 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-lg max-w-xl mx-auto my-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-black uppercase text-slate-900">
                Unauthorized Portal Access Blocked
              </h3>
              <p
                role="alert"
                className="text-xs sm:text-sm font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-2xl p-4"
              >
                {UNAUTHORIZED_PORTAL_ACCESS_MESSAGE}
              </p>
              {profile && (
                <p className="text-xs text-slate-600">
                  Signed in as <strong>{profile.email}</strong> (Assigned Role:{' '}
                  <strong className="uppercase">{profile.role}</strong>). You can only access the{' '}
                  <strong>{getRoleDefinition(profile.role).portalTitle}</strong>.
                </p>
              )}
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                {profile && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeniedBanner(null);
                      setManualTabSelection({ email: currentEmail, tab: profile.role });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Return to My {profile.role.toUpperCase()} Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {activeRole === 'member' && <MemberDashboard />}
              {activeRole === 'admin' && <AdminDashboard />}
            </>
          )}
        </div>

        {/* Footer Info Bar */}
        <div className="px-4 sm:px-6 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isAdmin ? (
                <>
                  Administrative RBAC Active: <strong>Admin (Backend Management)</strong>
                </>
              ) : (
                <>
                  Verified Portal Active: <strong>Member (Donation &amp; Support)</strong>
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/join?type=admission"
              onClick={onClose}
              className="text-amber-700 hover:text-amber-800 font-bold inline-flex items-center gap-1"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Apply for Admission</span>
            </Link>
            <Link
              href="/join?type=trial"
              onClick={onClose}
              className="text-indigo-700 hover:text-indigo-800 font-bold inline-flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Apply for Trial</span>
            </Link>
            <Link
              href="/login"
              onClick={onClose}
              className="text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Account Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
