'use client';

import React from 'react';
import { UserProfile, useAuth } from '@/lib/AuthContext';
import {
  Clock,
  ShieldAlert,
  Phone,
  Mail,
  RefreshCw,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface PendingDashboardProps {
  profile: UserProfile;
}

export const PendingDashboard: React.FC<PendingDashboardProps> = ({ profile }) => {
  const { logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 sm:p-10 rounded-3xl bg-white border border-amber-200 shadow-xl text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-inner">
        <Clock className="w-8 h-8 animate-pulse" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-mono font-bold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
          <span>Account Pending Verification</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
          Role Assignment Under Review
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Hello <strong>{profile.fullName}</strong> ({profile.email}). Your account has been registered with the MADEN FAF digital tracking system. In accordance with academy security and player welfare guidelines, your profile is currently undergoing verification by campus administration.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-left">
        <div className="font-bold text-slate-900 uppercase text-[11px]">
          Access Restriction Notice:
        </div>
        <p className="text-slate-600 leading-relaxed text-[11px]">
          Role-specific portals (Player Passport, Coach Planner, Staff Intake, or Executive Command) remain protected and will become active once your official player or staff credentials are confirmed by your designated campus director.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
        <div className="space-y-0.5">
          <div className="font-bold text-amber-950">Need expedited approval?</div>
          <div className="text-[11px] text-amber-900">
            Contact Nadia District Head Admissions: <strong>admissions@madenfaf.com</strong>
          </div>
        </div>
        <a
          href="mailto:admissions@madenfaf.com"
          className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-xs cursor-pointer"
        >
          Contact Office
        </a>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>

        <button
          onClick={() => logout()}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
