'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/lib/AuthContext';
import {
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  MapPin,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface PlayerDashboardProps {
  profile: UserProfile;
}

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<'passport' | 'schedule' | 'evaluations'>('passport');

  const technicalMetrics = [
    { label: 'Ball Mastery & 1v1', score: 88, max: 100, trend: '+4% this month', color: 'bg-amber-500' },
    { label: 'Tactical Scanning & Shape', score: 82, max: 100, trend: 'High game IQ', color: 'bg-blue-500' },
    { label: 'Speed & First 5m Acceleration', score: 91, max: 100, trend: 'Cohort Top 10%', color: 'bg-emerald-500' },
    { label: 'Rondo Decision Speed', score: 85, max: 100, trend: 'Consistent touch', color: 'bg-purple-500' },
  ];

  const attendanceSessions = [
    { date: 'Oct 17, 2026', title: 'High-Pressing Transition & Rondo', campus: profile.campus || 'Gayeshpur HQ', status: 'Attended', duration: '90 min' },
    { date: 'Oct 15, 2026', title: 'Finishing Under Temporal Pressure', campus: profile.campus || 'Gayeshpur HQ', status: 'Attended', duration: '85 min' },
    { date: 'Oct 13, 2026', title: 'Yo-Yo Intermittent Recovery & Laser Speed', campus: profile.campus || 'Gayeshpur HQ', status: 'Attended', duration: '75 min' },
    { date: 'Oct 10, 2026', title: 'Match Simulation vs United Red Star', campus: profile.campus || 'Gayeshpur HQ', status: 'Attended (60 min played)', duration: '90 min' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Official Athlete Passport · Intake 2026/27</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              Welcome Back, {profile.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Track your tactical training logs, weekly attendance rate, and coach assessments at {profile.campus || 'Gayeshpur Flagship Campus'}.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-md">
              96%
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Season Attendance</div>
              <div className="text-sm font-bold text-white">27 / 28 Sessions</div>
              <div className="text-[10px] text-emerald-400 font-semibold">Eligible for Matchday Squad</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'passport', label: 'Performance Passport', icon: Target },
          { id: 'schedule', label: 'Training Calendar & Fixtures', icon: Calendar },
          { id: 'evaluations', label: 'Coach Evaluations', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Performance Passport */}
      {activeTab === 'passport' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {technicalMetrics.map((m, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>{m.label}</span>
                  <span className="font-mono text-slate-900">{m.score}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.score}%` }} />
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{m.trend}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Active Development Focus */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Quarterly Focus Milestones</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">Curriculum v2.4</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">1. Body Shape Orientation</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Receiving on the back foot prior to forward line-breaking passes.
                </p>
                <span className="inline-block text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                  85% Mastered
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">2. Counter-Press Triggers</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  5-second immediate pressing block upon turnover inside the final third.
                </p>
                <span className="inline-block text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold">
                  In Progress
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">3. Weak-Foot Finishing</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Low directional strikes into side netting using non-dominant foot.
                </p>
                <span className="inline-block text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
                  Assigned Drill
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Schedule & Fixtures */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Recent Training Attendance Log
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {attendanceSessions.map((session, i) => (
                <div key={i} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{session.title}</div>
                    <div className="text-[11px] text-slate-500">
                      {session.date} • {session.duration} • {session.campus}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Coach Evaluations */}
      {activeTab === 'evaluations' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Monthly Technical Evaluation
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Lead Coach Evaluation</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2">
            <div className="text-[10px] uppercase font-bold text-amber-900">Head Coach Tactical Feedback:</div>
            <p className="text-slate-800 leading-relaxed italic text-sm">
              &ldquo;{profile.fullName || 'Athlete'} continues to demonstrate standout spatial awareness and high-tempo decision making during transition phases. First-touch execution under aggressive pressure is in the top quartile of the cohort. Recommended focus for the upcoming quarter: aerial anticipation and weak-foot crossing delivery.&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
