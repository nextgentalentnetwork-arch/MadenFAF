'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import {
  getRoleDefinition,
  UserRole,
  isValidRole,
  canUserAccessPortal,
  getPortalPathForRole,
  UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
} from '@/lib/rbac';
import { PlayerDashboard } from '@/components/portal/PlayerDashboard';
import { ParentDashboard } from '@/components/portal/ParentDashboard';
import { CoachDashboard } from '@/components/portal/CoachDashboard';
import { ManagerDashboard } from '@/components/portal/ManagerDashboard';
import { Staff1Dashboard } from '@/components/portal/Staff1Dashboard';
import { Staff2Dashboard } from '@/components/portal/Staff2Dashboard';
import { AdminDashboard } from '@/components/portal/AdminDashboard';
import { PendingDashboard } from '@/components/portal/PendingDashboard';
import { MemberDashboard } from '@/components/membership/MemberDashboard';

interface DigitalPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: string;
  onBookTrialClick?: () => void;
}

export const DigitalPortalModal: React.FC<DigitalPortalModalProps> = ({
  isOpen,
  onClose,
  initialRole,
  onBookTrialClick,
}) => {
  const { profile, login, logout, accessDeniedReason, clearAccessDenied } = useAuth();

  // Sign In State for logged-out modal view
  const [modalEmail, setModalEmail] = useState('');
  const [modalPassword, setModalPassword] = useState('');
  const [modalTargetRole, setModalTargetRole] = useState<UserRole | 'auto'>(
    initialRole && isValidRole(initialRole) ? initialRole : 'auto'
  );
  const [modalShowPassword, setModalShowPassword] = useState(false);
  const [modalAuthError, setModalAuthError] = useState('');
  const [isModalLoggingIn, setIsModalLoggingIn] = useState(false);

  if (!isOpen) return null;

  const handleModalSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalAuthError('');
    clearAccessDenied();
    if (!modalEmail.trim() || !modalPassword.trim()) {
      setModalAuthError('Please enter both email and password.');
      return;
    }
    setIsModalLoggingIn(true);
    const res = await login(modalEmail, modalPassword, modalTargetRole);
    setIsModalLoggingIn(false);
    if (!res.success) {
      setModalAuthError(
        res.error || 'Invalid credentials. Please verify your email and password.'
      );
    }
  };

  // If user is authenticated, determine their authorized role definition
  const roleDef = profile ? getRoleDefinition(profile.role) : null;
  const requestedModalRole =
    initialRole && isValidRole(initialRole) ? initialRole : null;
  const isModalRoleUnauthorized = Boolean(
    profile &&
      requestedModalRole &&
      !canUserAccessPortal(profile.role, requestedModalRole, profile.roles)
  );

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

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-amber-400/40 bg-slate-950 flex items-center justify-center shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/maden-faf-official-logo.png"
                alt="MADEN FAF Crest"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-amber-800 font-bold">
                Digital Academy Platform
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                {profile && roleDef ? (
                  <>
                    <span>{profile.fullName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${roleDef.badgeColor}`}>
                      {roleDef.badge}
                    </span>
                  </>
                ) : (
                  <span>Member Digital Portal</span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/portal"
                  onClick={onClose}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs"
                >
                  <span>Fullscreen Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={onClose}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>Full Sign In</span>
              </Link>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
              aria-label="Close portal dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* CASE 1: Logged-out user -> Hide all role options, show clean sign in */}
          {!profile ? (
            <div className="py-6 sm:py-10 max-w-md mx-auto w-full space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-inner">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-tight">
                  Sign In Required
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Individual role options and academy dashboards are protected. Please sign in with your verified credentials to view your assigned portal.
                </p>
              </div>

              <form onSubmit={handleModalSignIn} className="space-y-4 bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-xs">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={modalEmail}
                      onChange={(e) => setModalEmail(e.target.value)}
                      placeholder="Enter your email address"
                      autoComplete="email"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={modalShowPassword ? 'text' : 'password'}
                      value={modalPassword}
                      onChange={(e) => setModalPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setModalShowPassword(!modalShowPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      {modalShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Portal Verification Target
                  </label>
                  <select
                    value={modalTargetRole}
                    onChange={(e) => setModalTargetRole(e.target.value as UserRole | 'auto')}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  >
                    <option value="auto">Registered Account Role (Auto-Redirect)</option>
                    <option value="member">Member Portal (Donators Portal)</option>
                    <option value="player">Player Portal (Academy Athlete)</option>
                    <option value="parent">Parent / Guardian Portal</option>
                    <option value="coach">Coach Portal</option>
                    <option value="manager">Manager Portal</option>
                    <option value="staff1">Staff 1 Portal</option>
                    <option value="staff2">Staff 2 Portal</option>
                    <option value="admin">Admin Portal</option>
                  </select>
                </div>

                {modalAuthError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold text-xs">
                    {modalAuthError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isModalLoggingIn}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isModalLoggingIn ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>{isModalLoggingIn ? 'Verifying Role...' : 'Verify Role & Sign In'}</span>
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="text-amber-800 hover:text-amber-900 font-bold"
                  >
                    Open Full Sign In Page ➔
                  </Link>
                  <Link
                    href="/join"
                    onClick={() => {
                      onClose();
                      onBookTrialClick?.();
                    }}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    Need an account? Book Trial
                  </Link>
                </div>
              </form>
            </div>
          ) : isModalRoleUnauthorized || accessDeniedReason ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-300 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black uppercase text-rose-900">
                  Unauthorized Portal Access
                </h3>
                <p className="text-xs font-semibold text-rose-800 max-w-md mx-auto">
                  {accessDeniedReason || UNAUTHORIZED_PORTAL_ACCESS_MESSAGE}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Link
                  href={getPortalPathForRole(profile.role)}
                  onClick={() => {
                    clearAccessDenied();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold uppercase tracking-wider"
                >
                  Open Authorized {roleDef?.label} Portal
                </Link>
              </div>
            </div>
          ) : (
            /* CASE 2: Authenticated user -> Render ONLY their assigned role dashboard */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                    Authorized Role Portal · Strict RBAC Verified
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    {roleDef?.portalTitle}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {roleDef?.portalSubtitle}
                  </p>
                </div>
                <Link
                  href={getPortalPathForRole(profile.role)}
                  onClick={onClose}
                  className="sm:hidden w-full py-2 px-3 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Open Fullscreen Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Strictly render the authorized dashboard for the user's role */}
              {profile.role === 'member' ? (
                <MemberDashboard profile={profile} />
              ) : profile.role === 'pending' || profile.status === 'pending' ? (
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
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 text-center sm:text-left">
            {profile ? (
              <span>
                Authenticated as <strong className="text-slate-800">{profile.email}</strong> (
                {roleDef?.label} — Exclusively Authorized)
              </span>
            ) : (
              <span>One account, one assigned role, one authorized portal.</span>
            )}
          </div>
          {profile ? (
            <Link
              href={getPortalPathForRole(profile.role)}
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 font-bold text-xs uppercase tracking-wider text-slate-950 transition-all flex items-center justify-center gap-2 min-h-[42px] shadow-sm shadow-amber-200 cursor-pointer"
            >
              <span>Go to {roleDef?.label || 'Portal'} Page</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={() => {
                onClose();
                onBookTrialClick?.();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 font-bold text-xs uppercase tracking-wider text-slate-950 transition-all flex items-center justify-center gap-2 min-h-[42px] shadow-sm shadow-amber-200 cursor-pointer"
            >
              <span>Apply for Admission</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
