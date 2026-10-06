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
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Database,
  ArrowLeft
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, loginWithDemo, isSupabaseActive } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'player' | 'parent' | 'coach'>('player');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

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
      const res = await login(email, password);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg('Logged in successfully! Redirecting...');
        setTimeout(() => {
          router.push('/');
        }, 800);
      } else {
        setErrorMsg(res.error || 'Invalid credentials. Please try again.');
      }
    } else {
      if (!fullName) {
        setIsSubmitting(false);
        setErrorMsg('Please enter your full name for registration.');
        return;
      }
      const res = await signup(email, password, fullName, role);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => {
          router.push('/');
        }, 800);
      } else {
        setErrorMsg(res.error || 'Failed to create account.');
      }
    }
  };

  const handleDemoClick = (demoRole: 'player' | 'parent' | 'coach' | 'admin') => {
    loginWithDemo(demoRole);
    setSuccessMsg(`Logged in as Demo ${demoRole.toUpperCase()}! Redirecting...`);
    setTimeout(() => {
      router.push('/');
    }, 600);
  };

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

        {/* Supabase Status Indicator */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-mono shadow-xs">
          <Database className="w-3 h-3 text-emerald-600" />
          <span className="text-slate-500">Database:</span>
          {isSupabaseActive ? (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Supabase Live
            </span>
          ) : (
            <span className="text-amber-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Supabase Ready
            </span>
          )}
        </div>
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
            Access training dossiers, performance cards, schedules, and attendance.
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
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
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
                  placeholder="e.g. Subham Roy"
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
                placeholder="name@madenfaf.com"
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
              {mode === 'signin' && (
                <span className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer">
                  Forgot?
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors shadow-xs"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Primary Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-slate-900 outline-none transition-colors shadow-xs"
              >
                <option value="player">Player (Academy Athlete)</option>
                <option value="parent">Parent / Guardian</option>
                <option value="coach">Technical Coach / Staff</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-200 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : mode === 'signin' ? (
              <>
                <span>Sign In with Supabase</span>
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

        {/* Demo One-Click Sign In */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Instant Demo Access
            </span>
            <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
              1-Click Fill
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoClick('player')}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-500 hover:bg-white text-left transition-all cursor-pointer group shadow-xs"
            >
              <div className="font-bold text-slate-900 text-[11px] group-hover:text-amber-600 transition-colors">
                Subham Roy
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Player (U15)</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('parent')}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-500 hover:bg-white text-left transition-all cursor-pointer group shadow-xs"
            >
              <div className="font-bold text-slate-900 text-[11px] group-hover:text-amber-600 transition-colors">
                Mr. Pradip Roy
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Parent Account</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('coach')}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:bg-white text-left transition-all cursor-pointer group shadow-xs"
            >
              <div className="font-bold text-slate-900 text-[11px] group-hover:text-emerald-600 transition-colors">
                Coach Bapi Roy
              </div>
              <div className="text-[10px] text-slate-500 font-mono">AFC ‘B’ Head Coach</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('admin')}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-500 hover:bg-white text-left transition-all cursor-pointer group shadow-xs"
            >
              <div className="font-bold text-slate-900 text-[11px] group-hover:text-purple-600 transition-colors">
                Tech Director
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Academy Admin</div>
            </button>
          </div>
        </div>

        {/* Link to Join MADEN & Developer Command Center */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-600">
            Want to enroll a new player?{' '}
            <Link href="/join" className="text-amber-700 hover:text-amber-800 font-bold transition-colors">
              Book a Trial / Join MADEN
            </Link>
          </p>

          <div className="pt-2">
            <Link
              href="/developer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-mono font-bold transition-colors shadow-xs"
            >
              <Lock className="w-3 h-3" />
              <span>Developer & Superuser Backend Command Center →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
