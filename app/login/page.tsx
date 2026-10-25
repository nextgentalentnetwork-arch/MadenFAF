'use client';

import React, { useState } from 'react';
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
  HeartHandshake,
  Trophy,
  Calendar,
} from 'lucide-react';
import {
  UserRole,
  normalizePortalRoleParam,
  getPortalPathForRole,
} from '@/lib/rbac';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, clearAccessDenied } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get('mode')?.toLowerCase();
      const tabParam = params.get('tab')?.toLowerCase();
      if (modeParam === 'signup' || modeParam === 'register' || tabParam === 'register' || tabParam === 'signup') {
        return 'signup';
      }
    }
    return 'signin';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [isSecretAdminRoute] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return (
        params.get('secret') === 'admin' ||
        params.get('access') === 'backend' ||
        params.get('backend') === 'true' ||
        params.get('role') === 'admin'
      );
    }
    return false;
  });

  const [targetPortalRole, setTargetPortalRole] = useState<UserRole | 'auto'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const requestedRole = params.get('role');
      const normalized = normalizePortalRoleParam(requestedRole);
      if (normalized === 'admin' && (params.get('secret') === 'admin' || params.get('access') === 'backend' || params.get('backend') === 'true')) {
        return 'admin';
      }
      if (normalized === 'member') {
        return 'member';
      }
    }
    return 'auto';
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<{
    fullName: boolean;
    email: boolean;
    password: boolean;
  }>({
    fullName: false,
    email: false,
    password: false,
  });

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const fullNameError =
    mode === 'signup' && touched.fullName
      ? !fullName.trim()
        ? 'Full name is required for registration.'
        : fullName.trim().length < 2
          ? 'Full name must be at least 2 characters.'
          : ''
      : '';

  const emailError = touched.email
    ? !email.trim()
      ? 'Email address is required.'
      : !isValidEmail(email)
        ? 'Please enter a valid email address (e.g., name@example.com).'
        : ''
    : '';

  const passwordError = touched.password
    ? !password
      ? 'Password is required.'
      : password.length < 6
        ? 'Password must be at least 6 characters long.'
        : ''
    : '';

  const isFullNameValid = mode === 'signup' && fullName.trim().length >= 2;
  const isEmailValid = isValidEmail(email);
  const isPasswordValid = password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    clearAccessDenied();

    setTouched({
      fullName: true,
      email: true,
      password: true,
    });

    if (mode === 'signup' && (!fullName.trim() || fullName.trim().length < 2)) {
      setErrorMsg('Please fix the highlighted errors before completing registration.');
      return;
    }

    if (!email.trim() || !isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    if (mode === 'signin') {
      const res = await login(email, password, targetPortalRole);
      setIsSubmitting(false);
      if (res.success && res.role) {
        clearAccessDenied();
        if (res.role === 'admin' && targetPortalRole !== 'member') {
          setSuccessMsg('Admin Authenticated! Redirecting to the Admin Dashboard...');
          router.replace('/portal?role=admin');
        } else {
          const destPortal = getPortalPathForRole('member');
          setSuccessMsg(
            'Member Verified! Redirecting to the Member Donation & Support Portal...'
          );
          router.replace(destPortal);
        }
      } else {
        setErrorMsg(res.error || 'Invalid credentials. Please try again.');
      }
    } else {
      // Public self-registration is strictly for Member (Donation & Support Portal) accounts
      const res = await signup(email, password, fullName, 'member');
      setIsSubmitting(false);
      if (res.success) {
        clearAccessDenied();
        setErrorMsg('');
        const destPortal = getPortalPathForRole('member');
        setSuccessMsg(
          'Member Account Registered! Redirecting to the Member Donation & Support Portal...'
        );
        router.replace(destPortal);
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
          Member &amp; Admin RBAC
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
            {mode === 'signin'
              ? isSecretAdminRoute
                ? 'Administrative Backend Authentication'
                : 'Member Portal Login'
              : 'Register Member Support Account'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'signin'
              ? isSecretAdminRoute
                ? 'Authorized staff credentials required for MADEN FAF Executive Admin Dashboard.'
                : 'Sign in to access your Member Donation & Support Portal and verified tax receipts.'
              : 'Create a Member account to support MADEN FAF, donate, and download verified receipts.'}
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
              setTouched({ fullName: false, email: false, password: false });
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
              setTouched({ fullName: false, email: false, password: false });
            }}
            className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register Member
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
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <User
                  className={`w-4 h-4 absolute left-3.5 top-3.5 ${
                    fullNameError
                      ? 'text-rose-500'
                      : touched.fullName && isFullNameValid
                        ? 'text-emerald-600'
                        : 'text-slate-400'
                  }`}
                />
                <input
                  type="text"
                  required
                  aria-invalid={Boolean(fullNameError)}
                  placeholder="Enter your full name"
                  value={fullName}
                  onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (!touched.fullName) {
                      setTouched((prev) => ({ ...prev, fullName: true }));
                    }
                  }}
                  className={`w-full pl-10 pr-9 py-2.5 bg-white border rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors shadow-xs ${
                    fullNameError
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : touched.fullName && isFullNameValid
                        ? 'border-emerald-500 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500'
                        : 'border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                  }`}
                />
                {touched.fullName && isFullNameValid && !fullNameError && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
                )}
              </div>
              {fullNameError && (
                <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fullNameError}</span>
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Mail
                className={`w-4 h-4 absolute left-3.5 top-3.5 ${
                  emailError
                    ? 'text-rose-500'
                    : touched.email && isEmailValid
                      ? 'text-emerald-600'
                      : 'text-slate-400'
                }`}
              />
              <input
                type="email"
                required
                aria-invalid={Boolean(emailError)}
                placeholder="Enter your email address"
                value={email}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (!touched.email) {
                    setTouched((prev) => ({ ...prev, email: true }));
                  }
                }}
                className={`w-full pl-10 pr-9 py-2.5 bg-white border rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors shadow-xs ${
                  emailError
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : touched.email && isEmailValid
                      ? 'border-emerald-500 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500'
                      : 'border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                }`}
              />
              {touched.email && isEmailValid && !emailError && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
              )}
            </div>
            {emailError && (
              <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{emailError}</span>
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Password <span className="text-rose-600">*</span>
              </label>
              {mode === 'signup' && (
                <span
                  className={`text-[10px] font-mono font-semibold ${
                    isPasswordValid
                      ? 'text-emerald-700'
                      : touched.password
                        ? 'text-rose-600'
                        : 'text-slate-400'
                  }`}
                >
                  {password.length}/6+ chars
                </span>
              )}
            </div>
            <div className="relative">
              <Lock
                className={`w-4 h-4 absolute left-3.5 top-3.5 ${
                  passwordError
                    ? 'text-rose-500'
                    : touched.password && isPasswordValid
                      ? 'text-emerald-600'
                      : 'text-slate-400'
                }`}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                aria-invalid={Boolean(passwordError)}
                placeholder="Enter password (min. 6 characters)..."
                value={password}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (!touched.password) {
                    setTouched((prev) => ({ ...prev, password: true }));
                  }
                }}
                className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors shadow-xs ${
                  passwordError
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : touched.password && isPasswordValid
                      ? 'border-emerald-500 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500'
                      : 'border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                }`}
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
            {passwordError && (
              <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{passwordError}</span>
              </p>
            )}
          </div>

          {mode === 'signin' && isSecretAdminRoute && (
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authorized Administrative Access</span>
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase">
                  RESTRICTED
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Administrative credentials will redirect to the MADEN FAF Executive Admin Dashboard.
              </p>
            </div>
          )}

          {mode === 'signup' && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-indigo-700" />
                  <span>Account Role: Member (Donation &amp; Support Portal)</span>
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300">
                  MEMBER
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Public registration creates a <strong>Member</strong> account for foundation supporters, donors, and alumni to access the Member Portal.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-200 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            {isSubmitting ? (
              <span>Verifying Credentials...</span>
            ) : mode === 'signin' ? (
              <>
                <span>{isSecretAdminRoute ? 'Sign In to Admin Dashboard' : 'Sign In to Member Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Create Member Account</span>
                <ShieldCheck className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Public Player Admission & Trial Pathways (No Player Account Needed) */}
        <div className="mt-7 pt-6 border-t border-slate-200 space-y-3">
          <div className="text-center">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 block">
              Applying as a Player or Parent? No Account Required
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Submit a public Academy Admission or Trial Session application directly:
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link
              href="/join?type=admission"
              className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span>Apply for Admission</span>
            </Link>
            <Link
              href="/join?type=trial"
              className="px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Apply for Trial</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
