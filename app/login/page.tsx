'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { MadenLogo } from '@/components/ui/MadenLogo';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldAlert,
} from 'lucide-react';
import { UserRole, isValidRole, getPortalPathForRole } from '@/lib/rbac';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, accessDeniedReason, clearAccessDenied } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [targetPortalRole, setTargetPortalRole] = useState<UserRole | 'auto'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const requestedRole = params.get('role');
      if (requestedRole && isValidRole(requestedRole)) {
        return requestedRole;
      }
    }
    return 'auto';
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    clearAccessDenied();

    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    if (mode === 'signin') {
      const res = await login(email, password, targetPortalRole);
      setIsSubmitting(false);
      if (res.success && res.role) {
        const isDev =
          email.trim().toLowerCase() === 'pravakarghosh.2025@gmail.com' &&
          (targetPortalRole === 'auto' || targetPortalRole === 'admin');
        if (isDev && targetPortalRole === 'auto') {
          setSuccessMsg(
            'Master Developer Authenticated! Redirecting to Backend Command Center...'
          );
          setTimeout(() => {
            router.push('/developer');
          }, 500);
        } else {
          const destPortal = getPortalPathForRole(
            targetPortalRole !== 'auto' ? targetPortalRole : res.role
          );
          setSuccessMsg(
            `Role Verified (${res.role.toUpperCase()})! Redirecting to your authorized portal...`
          );
          setTimeout(() => {
            router.push(destPortal);
          }, 500);
        }
      } else {
        setErrorMsg(res.error || 'Invalid credentials. Please try again.');
      }
    } else {
      if (!fullName.trim()) {
        setIsSubmitting(false);
        setErrorMsg('Please enter your full name for registration.');
        return;
      }
      const res = await signup(email, password, fullName, role);
      setIsSubmitting(false);
      if (res.success && res.role) {
        const destPortal = getPortalPathForRole(res.role);
        setSuccessMsg(
          `Account registered under ${res.role.toUpperCase()} role! Redirecting to your authorized portal...`
        );
        setTimeout(() => {
          router.push(destPortal);
        }, 600);
      } else {
        setErrorMsg(res.error || 'Failed to create account.');
      }
    }
  };

  const isAccessDeniedError = errorMsg.startsWith('Access Denied:');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Top Bar with Back Link */}
      <div className="max-w-md w-full mx-auto mb-6 flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors p-2 px-3 rounded-xl bg-white border border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-amber-600" />
          <span>Back to Home</span>
        </Link>
        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-slate-900 text-amber-400 border border-slate-800">
          Strict RBAC Enforced
        </span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative z-10">
        {/* Header with Logo */}
        <div className="text-center mb-6">
          <div className="inline-block mb-3">
            <MadenLogo size="md" variant="horizontal" lightText={false} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight">
            {mode === 'signin' ? 'Academy Portal Sign In' : 'Create Academy Account'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            One account, one assigned role, one authorized portal.
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alert Notifications */}
        {errorMsg && (
          <div
            role="alert"
            className={`mb-4 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
              isAccessDeniedError
                ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            {isAccessDeniedError ? (
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login / Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors shadow-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors shadow-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signin' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Portal Verification Target
              </label>
              <select
                value={targetPortalRole}
                onChange={(e) => setTargetPortalRole(e.target.value as UserRole | 'auto')}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 outline-none transition-colors shadow-xs"
              >
                <option value="auto">
                  Registered Account Role (Verify &amp; Auto-Redirect)
                </option>
                <option value="member">
                  Member Portal (Foundation Supporter &amp; Donators Portal)
                </option>
                <option value="player">Player Portal (Academy Athlete)</option>
                <option value="parent">Parent / Guardian Portal</option>
                <option value="coach">Coach Portal (Technical Staff)</option>
                <option value="manager">Manager Portal (Campus Operations)</option>
                <option value="staff1">Staff 1 Portal (Admissions Desk)</option>
                <option value="staff2">Staff 2 Portal (Field &amp; Attendance)</option>
                <option value="admin">Admin Portal (Executive Command)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                Your portal access is strictly determined by your server-registered account role. Attempting to sign in to another role&apos;s portal will be denied.
              </p>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Assigned Account Role (Permanent)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 outline-none transition-colors shadow-xs"
              >
                <option value="member">
                  Member (Foundation Supporter &amp; Donators Portal Only)
                </option>
                <option value="player">Player (Academy Athlete Portal Only)</option>
                <option value="parent">Parent / Guardian (Parent Portal Only)</option>
                <option value="pending">
                  Applicant (Pending Admin Staff / Coach Role Assignment)
                </option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                <strong>Strict Role Separation:</strong> Accounts registered as{' '}
                <strong>Member</strong> are exclusively authorized for the Donators Portal and cannot access Player, Coach, Staff, or Admin portals.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-200 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            {isSubmitting ? (
              <span>Verifying Role &amp; Credentials...</span>
            ) : mode === 'signin' ? (
              <>
                <span>Verify Role &amp; Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ShieldCheck className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link to Join MADEN */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center space-y-2">
          <p className="text-xs text-slate-600">
            Want to enroll a new youth athlete?{' '}
            <Link
              href="/join"
              className="text-amber-700 hover:text-amber-800 font-bold transition-colors"
            >
              Book a Trial / Join MADEN
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
