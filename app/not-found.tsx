import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Home,
  User,
  Trophy,
  Calendar,
  Compass,
  MapPin,
  Shield,
  HelpCircle,
} from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
          <HelpCircle className="w-10 h-10" />
        </div>

        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-2">
            HTTP 404 • ROUTE REDIRECTION CENTER
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-md mx-auto">
            The page or module you requested may have moved or doesn&apos;t exist. Use the verified links below to navigate to any academy section.
          </p>
        </div>

        {/* Primary Redirect Hub */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
          <Link
            href="/"
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all flex items-center gap-3 group"
          >
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Academy Home</div>
              <div className="text-[11px] text-slate-400">Official homepage & overview</div>
            </div>
          </Link>

          <Link
            href="/portal?role=member"
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all flex items-center gap-3 group"
          >
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">Member Portal</div>
              <div className="text-[11px] text-slate-400">Donation &amp; Support dashboard</div>
            </div>
          </Link>

          <Link
            href="/join?type=admission"
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all flex items-center gap-3 group"
          >
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Apply for Admission</div>
              <div className="text-[11px] text-slate-400">Player enrollment application</div>
            </div>
          </Link>

          <Link
            href="/join?type=trial"
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all flex items-center gap-3 group"
          >
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">Apply for Trial</div>
              <div className="text-[11px] text-slate-400">Upcoming assessment slots</div>
            </div>
          </Link>

          <Link
            href="/programs"
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all flex items-center gap-3 group"
          >
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">Academy Programs</div>
              <div className="text-[11px] text-slate-400">Grassroots to elite pathway</div>
            </div>
          </Link>

          <Link
            href="/campuses"
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all flex items-center gap-3 group"
          >
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Training Centres</div>
              <div className="text-[11px] text-slate-400">Bengal campus network</div>
            </div>
          </Link>
        </div>

        {/* Bottom Direct CTA */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Academy Home</span>
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Account Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
