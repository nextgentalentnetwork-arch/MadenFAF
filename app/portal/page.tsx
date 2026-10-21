'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { useAuth } from '@/lib/AuthContext';
import {
  getRoleDefinition,
  UserRole,
  isValidRole,
  canUserAccessPortal,
  getPortalPathForRole,
  UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
} from '@/lib/rbac';
import {
  Lock,
  LogOut,
  MapPin,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
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
import { MemberDashboard } from '@/components/membership/MemberDashboard';

export interface PortalPageProps {
  forcedRoleProp?: string;
}

export default function PortalPage({ forcedRoleProp }: PortalPageProps = {}) {
  const router = useRouter();
  const {
    user,
    profile,
    isLoading,
    accessDeniedReason,
    clearAccessDenied,
    revalidateSession,
    logout,
  } = useAuth();

  const [urlRequestedRole, setUrlRequestedRole] = useState<string | null>(() => {
    if (forcedRoleProp) return forcedRoleProp.toLowerCase().trim();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('role');
      return r ? r.toLowerCase().trim() : null;
    }
    return null;
  });
  const [activeAuthorizedRole, setActiveAuthorizedRole] = useState<UserRole | null>(null);
  const [serverDeniedMessage, setServerDeniedMessage] = useState<string | null>(null);

  const effectiveRequestedRole = forcedRoleProp
    ? forcedRoleProp.toLowerCase().trim()
    : urlRequestedRole;

  // Listen for browser popstate URL changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const readUrlRole = () => {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('role');
      setUrlRequestedRole(r ? r.toLowerCase().trim() : null);
    };

    window.addEventListener('popstate', readUrlRole);
    return () => window.removeEventListener('popstate', readUrlRole);
  }, []);

  // Revalidate session & role authorization with server whenever portal opens or URL role changes
  useEffect(() => {
    if (!profile) return;
    let isMounted = true;

    const targetRoleToValidate: UserRole | null =
      effectiveRequestedRole && isValidRole(effectiveRequestedRole)
        ? effectiveRequestedRole
        : profile.role;

    revalidateSession(targetRoleToValidate).then((res) => {
      if (!isMounted) return;
      if (!res.authorized) {
        setServerDeniedMessage(res.error || UNAUTHORIZED_PORTAL_ACCESS_MESSAGE);
      } else {
        setServerDeniedMessage(null);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [profile, effectiveRequestedRole, revalidateSession]);

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
    const loginHref =
      effectiveRequestedRole && isValidRole(effectiveRequestedRole)
        ? `/login?role=${effectiveRequestedRole}`
        : '/login';

    return (
      <PublicPageShell
        title="Member Digital Portal & Donators Portal"
        subtitle="Private authenticated platform for Foundation Members, Donors, Athletes, Guardians, Coaches, and Staff."
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
              The MADEN FAF Donators Portal and role-based academy dashboards are strictly protected. Please sign in with your registered account role credentials to continue.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={loginHref}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In / Register Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </PublicPageShell>
    );
  }

  // 3. Evaluate Strict Bidirectional Portal Authorization
  const authorizedRolesList: UserRole[] =
    Array.isArray(profile.roles) && profile.roles.length > 0 && profile.approvedByAdmin
      ? profile.roles
      : [profile.role];

  const targetPortalRole: UserRole =
    effectiveRequestedRole && isValidRole(effectiveRequestedRole)
      ? effectiveRequestedRole
      : activeAuthorizedRole && authorizedRolesList.includes(activeAuthorizedRole)
      ? activeAuthorizedRole
      : profile.role;

  const isTargetAuthorized =
    (!effectiveRequestedRole || isValidRole(effectiveRequestedRole)) &&
    canUserAccessPortal(profile.role, targetPortalRole, authorizedRolesList) &&
    !accessDeniedReason &&
    !serverDeniedMessage;

  const assignedRoleDef = getRoleDefinition(profile.role);

  // 4. UNAUTHORIZED PORTAL ATTEMPT OR STORAGE TAMPER DETECTED -> DENY ACCESS
  if (!isTargetAuthorized) {
    const attemptedLabel =
      effectiveRequestedRole && isValidRole(effectiveRequestedRole)
        ? getRoleDefinition(effectiveRequestedRole).portalTitle
        : effectiveRequestedRole
        ? `"${effectiveRequestedRole}" Portal`
        : 'Restricted Portal';

    return (
      <PublicPageShell
        title="Access Denied — Role Separation Enforced"
        subtitle="Strict bidirectional Role-Based Access Control (RBAC) policy prevented access to this portal."
        badge="RBAC Restricted"
        breadcrumbs={[
          { label: 'Digital Portal', href: getPortalPathForRole(profile.role) },
          { label: 'Access Denied' },
        ]}
        accessLevel="public"
        showPreFooterCta={false}
      >
        <div className="max-w-xl mx-auto my-14 p-8 bg-white border-2 border-rose-300 rounded-3xl text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-mono font-bold uppercase">
              <span>HTTP 403 · Unauthorized Role Portal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              Portal Access Denied
            </h2>
            <p
              role="alert"
              className="text-sm font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-2xl p-4 leading-relaxed"
            >
              {UNAUTHORIZED_PORTAL_ACCESS_MESSAGE}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Signed-In Account:</span>
              <span className="font-mono font-bold text-slate-900">{profile.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Registered Account Role:</span>
              <span className="font-mono font-bold uppercase text-amber-800">
                {assignedRoleDef.label} ({profile.role})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Attempted Target:</span>
              <span className="font-mono font-bold text-rose-700">{attemptedLabel}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                clearAccessDenied();
                setServerDeniedMessage(null);
                setUrlRequestedRole(profile.role);
                setActiveAuthorizedRole(profile.role);
                router.push(getPortalPathForRole(profile.role));
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Return to Authorized {assignedRoleDef.badge} Portal</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                clearAccessDenied();
                setServerDeniedMessage(null);
                await logout();
                router.push('/login');
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out &amp; Use Another Account</span>
            </button>
          </div>
        </div>
      </PublicPageShell>
    );
  }

  // 5. User is Authenticated AND Authorized for `targetPortalRole`
  const effectiveRole: UserRole = targetPortalRole;
  const roleDef = getRoleDefinition(effectiveRole);
  const isMasterDev =
    profile.role === 'admin' &&
    (profile.email?.toLowerCase() === 'pravakarghosh.2025@gmail.com' ||
      AcademyDataManager.isDeveloperAuthenticated());

  return (
    <PublicPageShell
      title={roleDef.portalTitle}
      subtitle={roleDef.portalSubtitle}
      badge={roleDef.badge}
      breadcrumbs={[{ label: 'Digital Portal', href: getPortalPathForRole(effectiveRole) }, { label: roleDef.label }]}
      accessLevel="public"
      showPreFooterCta={false}
      ctaText={effectiveRole === 'member' ? 'Visit Our Academy' : undefined}
      secondaryCtaText={effectiveRole === 'member' ? 'See Your Digital Profile' : undefined}
      secondaryCtaAction={
        effectiveRole === 'member'
          ? () => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('maden-open-member-profile'));
              }
            }
          : undefined
      }
    >
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* User Identity & Strict Role Separation Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 border border-slate-800 flex items-center justify-center font-black text-xl overflow-hidden shrink-0 shadow-md">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  referrerPolicy="no-referrer"
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
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${roleDef.badgeColor}`}
                >
                  {roleDef.badge}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  ({roleDef.label})
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold uppercase">
                  Role Verified
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 flex-wrap">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile.campus || 'Gayeshpur Flagship Campus'}</span>
                <span>•</span>
                <span className="font-mono text-slate-600">{profile.email}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Multi-role switcher ONLY rendered if an Administrator has explicitly authorized additional roles */}
            {authorizedRolesList.length > 1 && (
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                {authorizedRolesList.map((authRole) => {
                  const def = getRoleDefinition(authRole);
                  const isCurrent = effectiveRole === authRole;
                  return (
                    <button
                      key={authRole}
                      type="button"
                      onClick={() => {
                        setActiveAuthorizedRole(authRole);
                        setUrlRequestedRole(authRole);
                        router.push(getPortalPathForRole(authRole));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {def.navLabel}
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={async () => {
                await logout();
                router.push('/login');
              }}
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

        {/* 6. Strictly render ONLY the verified, authorized role dashboard */}
        {effectiveRole === 'member' ? (
          <MemberDashboard profile={profile} />
        ) : effectiveRole === 'pending' || profile.status === 'pending' ? (
          <PendingDashboard profile={profile} />
        ) : effectiveRole === 'player' ? (
          <PlayerDashboard profile={profile} />
        ) : effectiveRole === 'parent' ? (
          <ParentDashboard profile={profile} />
        ) : effectiveRole === 'coach' ? (
          <CoachDashboard profile={profile} />
        ) : effectiveRole === 'manager' ? (
          <ManagerDashboard profile={profile} />
        ) : effectiveRole === 'staff1' ? (
          <Staff1Dashboard profile={profile} />
        ) : effectiveRole === 'staff2' ? (
          <Staff2Dashboard profile={profile} />
        ) : effectiveRole === 'admin' ? (
          <AdminDashboard profile={profile} />
        ) : (
          <PendingDashboard profile={profile} />
        )}
      </div>
    </PublicPageShell>
  );
}
