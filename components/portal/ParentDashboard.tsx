'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/lib/AuthContext';
import {
  Award,
  CheckCircle2,
  Clock,
  HeartHandshake,
  MessageCircle,
  Phone,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';

interface ParentDashboardProps {
  profile: UserProfile;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'reports'>('overview');

  return (
    <div className="space-y-6">
      {/* Parent Welcome Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Parent Transparency Dashboard · Verified Guardian Access</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              Guardian Portal: {profile.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Real-time monitoring of your enrolled child&apos;s attendance, coach observations, match safety, and character development at MADEN FAF.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-md">
              A
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Term Evaluation</div>
              <div className="text-sm font-bold text-white">Grade A (84%)</div>
              <div className="text-[10px] text-emerald-400 font-semibold">Honors Development List</div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase">Season Attendance Rate</div>
          <div className="text-2xl font-black text-slate-900">94.2%</div>
          <div className="text-[11px] text-emerald-600 font-medium">22 of 24 scheduled sessions attended</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase">Discipline & Character</div>
          <div className="text-2xl font-black text-amber-600">10 / 10</div>
          <div className="text-[11px] text-slate-500 font-medium">Punctual & respectful conduct</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase">Match Time Logged</div>
          <div className="text-2xl font-black text-slate-900">320 min</div>
          <div className="text-[11px] text-slate-500 font-medium">Youth district and friendly matches</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase">Scholarship / Grant</div>
          <div className="text-sm font-black text-emerald-700">Need-Based Grant Active</div>
          <div className="text-[11px] text-slate-500 font-medium">100% Kit & Training Subsidized</div>
        </div>
      </div>

      {/* Welfare & Coach Direct Review */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Weekly Development & Academic Balance Report</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Oct 2026</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-2">
            <div className="font-bold text-emerald-950 uppercase text-[11px]">Coach Feedback:</div>
            <p className="text-slate-800 leading-relaxed text-sm">
              &ldquo;Your child is showing extraordinary discipline both on the pitch and in team meetings. Homework balance is checked every Friday before tactical blackboard sessions. We are very proud of his athletic commitment and positive sportsmanship toward teammates.&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">Hydration & Nutrition Compliance</div>
              <p className="text-slate-600 text-[11px]">Electrolyte and post-training fruit intake monitored daily.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">Injury & Welfare Status</div>
              <p className="text-emerald-700 font-semibold text-[11px]">Fit & Cleared for Competitive Matchday Play</p>
            </div>
          </div>
        </div>

        {/* Parent Support Contacts */}
        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Campus Welfare Coordinator
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Need to notify the coaches of an academic test, illness, or transport adjustment? Reach out directly to your campus desk.
          </p>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900">Nadia Flagship Campus Helpdesk</div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>+91 98300 12345</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Parent WhatsApp Community Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
