'use client';

import React, { useState } from 'react';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { useAuth } from '@/lib/AuthContext';
import {
  User,
  Shield,
  Calendar,
  Activity,
  Award,
  Bell,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  FileText,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function PortalPage() {
  const { user, profile, logout, loginWithDemo } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'evaluations' | 'schedule'>('overview');

  return (
    <PublicPageShell
      title="Member Digital Portal"
      subtitle="Authenticated player passport, weekly training logs, coach evaluations, and attendance tracking."
      badge="Private Access"
      breadcrumbs={[{ label: 'Digital Portal' }]}
      accessLevel="login_required"
      showPreFooterCta={false}
    >
      <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Identity Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center font-black text-xl overflow-hidden shrink-0">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile?.fullName?.charAt(0) || 'U'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">{profile?.fullName || 'Enrolled Athlete'}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-900 border border-amber-200">
                  {profile?.role || 'player'}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile?.campus || 'Gayeshpur Flagship Campus'}</span>
                <span>•</span>
                <span className="font-mono">{profile?.email}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => logout()}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            {profile?.email?.toLowerCase() === 'pravakarghosh.2025@gmail.com' && (
              <Link
                href="/developer"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Backend Command Center</span>
              </Link>
            )}
          </div>
        </div>

        {/* Portal Subtabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
          {(['overview', 'attendance', 'evaluations', 'schedule'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer capitalize shrink-0 ${
                activeTab === tab
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview Dashboard */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase">Season Attendance</div>
                <div className="text-2xl font-black text-slate-900">96.4%</div>
                <div className="text-[11px] text-emerald-600 font-medium">27 of 28 Sessions</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase">Technical Rating</div>
                <div className="text-2xl font-black text-amber-600">8.4 / 10</div>
                <div className="text-[11px] text-amber-700 font-medium">Top quartile in U13 cohort</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase">Match Time Logged</div>
                <div className="text-2xl font-black text-slate-900">720 min</div>
                <div className="text-[11px] text-slate-500 font-medium">8 competitive matches</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase">Next Scheduled Session</div>
                <div className="text-sm font-black text-slate-900">Saturday 6:30 AM</div>
                <div className="text-[11px] text-slate-500 font-medium">Gayeshpur Main Turf</div>
              </div>
            </div>

            {/* Coach Review Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Latest Monthly Technical Evaluation</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">Coach Bapi Roy (AFC ‘B’)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                “Demonstrates superb first-touch speed under pressure and high game IQ in transition play. Focus area for next quarter: aerial duels and weaker-foot weak-side crossing.”
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Attendance */}
        {activeTab === 'attendance' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Attendance Logbook</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {[
                { date: 'Oct 14, 2026', type: 'Tactical Phase Drill', status: 'Present', duration: '90 min' },
                { date: 'Oct 12, 2026', type: 'Speed & Agility Assessment', status: 'Present', duration: '75 min' },
                { date: 'Oct 10, 2026', type: 'Friendly vs United Red Star', status: 'Present (60 min match)', duration: '90 min' },
                { date: 'Oct 07, 2026', type: 'Small-Sided Possession Games', status: 'Present', duration: '90 min' },
                { date: 'Oct 05, 2026', type: 'Recovery & Physio Workshop', status: 'Present', duration: '60 min' },
              ].map((row, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{row.type}</div>
                    <div className="text-[11px] text-slate-500">{row.date} • {row.duration}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Evaluations */}
        {activeTab === 'evaluations' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Quarterly Skill Matrix</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Ball Mastery & Dribbling</span>
                  <span className="text-amber-700">8.8 / 10</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '88%' }} />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Passing Accuracy & Range</span>
                  <span className="text-amber-700">8.5 / 10</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Tactical Decision Making</span>
                  <span className="text-amber-700">8.2 / 10</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Aerobic & Anaerobic Stamina</span>
                  <span className="text-amber-700">9.0 / 10</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Schedule */}
        {activeTab === 'schedule' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Weekly Training Calendar</h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Tuesday Morning Session</div>
                  <div className="text-slate-600">6:30 AM – 8:00 AM • Tactical Shape & Conditioning</div>
                </div>
                <span className="text-amber-800 font-bold">Gayeshpur Turf</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Thursday Evening Session</div>
                  <div className="text-slate-600">4:30 PM – 6:15 PM • Finishing Drills & Set Pieces</div>
                </div>
                <span className="text-amber-800 font-bold">Gayeshpur Turf</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Saturday Morning Matchplay</div>
                  <div className="text-slate-600">6:30 AM – 9:00 AM • Full Pitch 11v11 Game</div>
                </div>
                <span className="text-amber-800 font-bold">Gayeshpur Turf</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicPageShell>
  );
}
