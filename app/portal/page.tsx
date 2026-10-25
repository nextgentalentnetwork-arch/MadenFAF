'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import {
  UserRole,
  getRoleDefinition,
  canUserAccessPortal,
  isValidRole,
  normalizePortalRoleParam,
  getPortalPathForRole,
  UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
} from '@/lib/rbac';
import { MadenLogo } from '@/components/ui/MadenLogo';
import { AdminDashboard } from '@/components/portal/AdminDashboard';
import { MemberDashboard } from '@/components/membership/MemberDashboard';
import {
  ArrowLeft,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Sparkles,
  CheckCircle2,
  UserCheck,
  HeartHandshake,
  ArrowRight,
  Code2,
} from 'lucide-react';

function PortalContent({ forcedRoleProp }: { forcedRoleProp?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    profile,
    isLoading,
    login,
    logout,
    revalidateSession,
    accessDeniedReason,
    clearAccessDenied,
  } = useAuth();

  const rawRoleParam = searchParams.get('role') || forcedRoleProp || null;
  const normalizedRoleParam = normalizePortalRoleParam(rawRoleParam);
  const requestedRoleParam: string | null = normalizedRoleParam || rawRoleParam;

  const [serverCheckError, setServerCheckError] = useState<string | null>(null);
  const [switchingAccountError, setSwitchingAccountError] = useState<string | null>(null);

  const profileEmail = profile?.email || null;
  const authoritativeRole: UserRole | null = profile?.role || null;
  const authorizedRolesList: UserRole[] =
    profile?.roles && profile.roles.length > 0 && profile.approvedByAdmin
      ? profile.roles
      : authoritativeRole
        ? [authoritativeRole]
        : [];

  // Revalidate session with server whenever profile identity or URL role parameter changes
  useEffect(() => {
    let active = true;
    if (!profileEmail || !authoritativeRole) return;

    const targetToCheck: UserRole =
      requestedRoleParam && isValidRole(requestedRoleParam)
        ? requestedRoleParam
        : authoritativeRole;

    // If URL specifies an obsolete role name (e.g., player, coach), skip async check (handled by isRequestedRoleInvalid)
    if (requestedRoleParam && !isValidRole(requestedRoleParam)) {
      return;
    }

    // If the user is requesting the Member portal and has a valid member/admin role, ensure any stale access denied banner is cleared immediately
    if (targetToCheck === 'member' && (authoritativeRole === 'member' || authoritativeRole === 'admin')) {
      clearAccessDenied();
    }

    revalidateSession(targetToCheck).then((res) => {
      if (!active) return;
      if (!res.authorized) {
        setServerCheckError(res.error || UNAUTHORIZED_PORTAL_ACCESS_MESSAGE);
      } else {
        setServerCheckError(null);
      }
    });

    return () => {
      active = false;
    };
  }, [profileEmail, authoritativeRole, requestedRoleParam, revalidateSession, clearAccessDenied]);

  // Determine whether the current URL requested an unauthorized or non-existent role
  const isRequestedRoleInvalid = Boolean(
    requestedRoleParam && !isValidRole(requestedRoleParam)
  );
  const isUnauthorizedRoleRequest = Boolean(
    profile &&
      (isRequestedRoleInvalid ||
        (requestedRoleParam &&
          isValidRole(requestedRoleParam) &&
          !canUserAccessPortal(profile.role, requestedRoleParam, authorizedRolesList)))
  );

  // Active portal role is strictly the user's verified role (or requested valid role if authorized)
  const activeRole: UserRole =
    profile &&
    requestedRoleParam &&
    isValidRole(requestedRoleParam) &&
    canUserAccessPortal(profile.role, requestedRoleParam, authorizedRolesList)
      ? requestedRoleParam
      : profile?.role || 'member';

  const currentRoleDef = getRoleDefinition(activeRole);
  const effectiveDeniedMessage = isUnauthorizedRoleRequest
    ? accessDeniedReason || serverCheckError || UNAUTHORIZED_PORTAL_ACCESS_MESSAGE
    : null;

  const handlePortalSwitchAttempt = async (targetRole: UserRole) => {
    setSwitchingAccountError(null);
    clearAccessDenied();
    setServerCheckError(null);

    if (!profile) {
      const emailMap: Record<UserRole, string> = {
        member: 'member@madenfaf.com',
        admin: 'admin@madenfaf.com',
      };
      const res = await login(emailMap[targetRole], 'maden2026', targetRole);
      if (res.success && res.role) {
        router.replace(getPortalPathForRole(res.role));
      } else {
        setSwitchingAccountError(res.error || UNAUTHORIZED_PORTAL_ACCESS_MESSAGE);
      }
      return;
    }

    // Logged-in user attempting to switch to another portal tab:
    const allowed = canUserAccessPortal(profile.role, targetRole, authorizedRolesList);
    if (!allowed) {
      try {
        await fetch('/api/auth/rbac', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'selfModifyRoleAttempt',
            email: profile.email,
            attemptedRole: targetRole,
          }),
        });
      } catch {
        // Non-blocking audit
      }
      setServerCheckError(UNAUTHORIZED_PORTAL_ACCESS_MESSAGE);
      router.replace(`/portal?role=${targetRole}`);
      return;
    }

    router.replace(getPortalPathForRole(targetRole));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono uppercase tracking-wider text-slate-500">
            Verifying Role-Based Access Permissions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top RBAC Command Header */}
      <div className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-amber-400 transition-colors px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Website Home</span>
            </Link>
            <div className="hidden sm:block">
              <MadenLogo size="sm" variant="horizontal" lightText={true} />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {profile ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-white truncate max-w-[160px]">
                  {profile.fullName}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                  {profile.role.toUpperCase()}
                </span>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors"
              >
                Sign In / Register
              </Link>
            )}

            {profile?.role === 'admin' && (
              <Link
                href="/developer"
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Backend Console</span>
              </Link>
            )}

            {profile && (
              <button
                onClick={async () => {
                  await logout();
                  router.push('/login');
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Two-Role Portal Bar (Strictly Member & Admin Only) */}
        <div className="bg-slate-900/90 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-amber-400 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {profile
                  ? `Authorized Role: ${profile.role.toUpperCase()} (${
                      profile.role === 'admin'
                        ? 'Admin Backend Management'
                        : 'Member Donation & Support Portal'
                    })`
                  : 'Select Portal View (Member or Admin)'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {(['member', 'admin'] as UserRole[]).map((r) => {
                const isSelected =
                  (requestedRoleParam === r && isUnauthorizedRoleRequest) ||
                  (!isUnauthorizedRoleRequest && activeRole === r);
                const isAuthorizedForUser = profile
                  ? canUserAccessPortal(profile.role, r, authorizedRolesList)
                  : true;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handlePortalSwitchAttempt(r)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? isAuthorizedForUser
                          ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                          : 'bg-rose-600 text-white shadow-xs font-black'
                        : isAuthorizedForUser
                          ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
                          : 'bg-slate-950/70 text-slate-500 border border-slate-800 hover:border-rose-800 hover:text-rose-300'
                    }`}
                  >
                    {!isAuthorizedForUser && <Lock className="w-3 h-3 text-rose-400" />}
                    <span>
                      {r === 'member'
                        ? 'Member — Donation & Support'
                        : 'Admin — Backend Management'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Portal Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {switchingAccountError && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2.5"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{switchingAccountError}</span>
          </div>
        )}

        {/* Unauthenticated Prompt */}
        {!profile ? (
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 text-center space-y-5 shadow-lg max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-400 text-[10px] font-mono font-bold uppercase">
                Authentication Required
              </span>
              <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900">
                Sign In to Access Your Authorized Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                MADEN FAF enforces strict role-based access control across its two account roles: <strong>Member (Donation &amp; Support Portal)</strong> and <strong>Admin (Backend Management)</strong>.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/login"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-sm"
              >
                <span>Go to Sign In / Register</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => handlePortalSwitchAttempt('member')}
                className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Demo Member Sign-In
              </button>
              <button
                type="button"
                onClick={() => handlePortalSwitchAttempt('admin')}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Demo Admin Sign-In
              </button>
            </div>
          </div>
        ) : effectiveDeniedMessage ? (
          /* Strict Unauthorized Cross-Portal Access Denied Banner */
          <div className="bg-white border-2 border-rose-300 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-xl max-w-2xl mx-auto my-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-[10px] font-mono font-bold uppercase border border-rose-300">
                Strict Role Separation Enforced
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-900">
                Unauthorized Portal Access Blocked
              </h2>
              <p
                role="alert"
                className="text-sm font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-2xl p-4 max-w-xl mx-auto"
              >
                {UNAUTHORIZED_PORTAL_ACCESS_MESSAGE}
              </p>
              <p className="text-xs text-slate-600 max-w-lg mx-auto pt-1">
                Your account (<strong>{profile.email}</strong>) is registered under the{' '}
                <strong className="uppercase text-slate-900">{profile.role}</strong> role and is only authorized to access the{' '}
                <strong>{getRoleDefinition(profile.role).portalTitle}</strong>.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  clearAccessDenied();
                  setServerCheckError(null);
                  router.replace(getPortalPathForRole(profile.role));
                }}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Return to My {profile.role.toUpperCase()} Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  router.push('/login');
                }}
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign Out &amp; Switch Account</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Role Identity Banner (Only shown for Admin; MemberDashboard renders its own complete Donators Portal header) */}
            {activeRole === 'admin' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${currentRoleDef.badgeColor}`}
                    >
                      {currentRoleDef.badge} ROLE VERIFIED
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {currentRoleDef.label}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight">
                    {currentRoleDef.portalTitle}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                    {currentRoleDef.portalSubtitle}
                  </p>
                </div>

                {/* Permission Matrix Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 bg-emerald-50 border-emerald-200 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Admissions &amp; Trials: Authorized</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 bg-emerald-50 border-emerald-200 text-emerald-800">
                    <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Donations &amp; QR: Authorized</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 bg-emerald-50 border-emerald-200 text-emerald-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Website CMS: Authorized</span>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Role Component Renderer: Strictly Member or Admin */}
            {activeRole === 'member' && <MemberDashboard profile={profile || undefined} />}
            {activeRole === 'admin' && <AdminDashboard />}
          </>
        )}
      </div>
    </div>
  );
}

export default function PortalPage({
  forcedRoleProp,
}: {
  forcedRoleProp?: string;
} = {}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500">
            Loading Portal...
          </div>
        </div>
      }
    >
      <PortalContent forcedRoleProp={forcedRoleProp} />
    </Suspense>
  );
}
