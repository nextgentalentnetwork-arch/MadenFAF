'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/AuthContext';
import {
  AcademyRegistrationData,
  getRegistrations,
  updateRegistrationStatus,
} from '@/lib/supabaseClient';
import {
  Activity,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Filter,
  Plus,
  Shield,
  Sparkles,
  Target,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';

interface CoachDashboardProps {
  profile: UserProfile;
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<'planner' | 'evaluations' | 'candidates'>('planner');
  const [candidates, setCandidates] = useState<AcademyRegistrationData[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load trial candidates for coach evaluation
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoadingCandidates(true);
      try {
        const list = await getRegistrations();
        if (isMounted) setCandidates(list);
      } catch (e) {
        console.warn('Could not load candidates:', e);
      } finally {
        if (isMounted) setIsLoadingCandidates(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCandidateAction = async (
    bookingRef: string,
    newStatus: 'confirmed' | 'enrolled' | 'waitlist' | 'rejected',
    note: string
  ) => {
    try {
      const res = await updateRegistrationStatus(bookingRef, newStatus, note);
      if (res.success) {
        setCandidates((prev) =>
          prev.map((c) => (c.bookingRef === bookingRef ? { ...c, status: newStatus } : c))
        );
        setStatusMessage({
          type: 'success',
          text: `Candidate ${bookingRef} status updated to ${newStatus.toUpperCase()}!`,
        });
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to update candidate' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Coach Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Technical Staff Panel · AFC Licensed Coach Access</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              Coach Planner: {profile.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Design tactical session plans, record player performance dossiers, and evaluate incoming trial candidates at {profile.campus || 'Gayeshpur Campus'}.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-blue-500 text-white font-black flex items-center justify-center text-lg shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Technical Permission</div>
              <div className="text-sm font-bold text-white">Full Squad Evaluation</div>
              <div className="text-[10px] text-emerald-400 font-semibold">Authorized to Enroll Trials</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'planner', label: 'Tactical Drill Periodization', icon: Compass },
          { id: 'candidates', label: `Trial Evaluations (${candidates.length})`, icon: UserCheck },
          { id: 'evaluations', label: 'Squad Technical Radar', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Tactical Session Planner */}
      {activeTab === 'planner' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Today&apos;s Training Block: U15 Transition & Press Resistance (80 min)</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Phase 3 Cycle</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-slate-500 font-mono text-[10px]">
                  <span>WARM-UP</span>
                  <span className="font-bold text-slate-700">15 min</span>
                </div>
                <div className="font-bold text-slate-900">Dynamic Agility & Footwork</div>
                <p className="text-slate-600 text-[11px]">Speed ladders, low center of gravity turns, unilateral coordination.</p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between text-blue-700 font-mono text-[10px]">
                  <span>RONDO</span>
                  <span className="font-bold">20 min</span>
                </div>
                <div className="font-bold text-blue-950">5v2 Directional Press-Break</div>
                <p className="text-slate-700 text-[11px]">Two-touch limit. Third-man running trigger when central pivot scans.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-slate-500 font-mono text-[10px]">
                  <span>TACTICAL PHASE</span>
                  <span className="font-bold text-slate-700">25 min</span>
                </div>
                <div className="font-bold text-slate-900">Half-Space Overload & Cross</div>
                <p className="text-slate-600 text-[11px]">Winger tucks inside, fullback overlaps. Near-post and cut-back box crashing.</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between text-emerald-700 font-mono text-[10px]">
                  <span>CONDITIONED GAME</span>
                  <span className="font-bold">20 min</span>
                </div>
                <div className="font-bold text-emerald-950">7v7 Small-Sided Game</div>
                <p className="text-slate-700 text-[11px]">Double points for goals initiated within 5 seconds of defensive recovery.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Candidate Evaluations & Approval Workflow */}
      {activeTab === 'candidates' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
                  Trial Assessment & Intake Approvals
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  As an authorized Technical Coach, you have permission to evaluate trials, confirm attendance, or enroll standout players.
                </p>
              </div>
            </div>

            {isLoadingCandidates ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading candidate registrations...</div>
            ) : candidates.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                No active candidate applications waiting for evaluation.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {candidates.map((c) => (
                  <div key={c.bookingRef} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{c.playerName}</span>
                        <span className="text-[10px] font-mono text-slate-400">({c.bookingRef})</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === 'enrolled'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status || 'Pending Trial'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        DOB: {c.dob} · Pos: <strong className="text-slate-700">{c.position}</strong> · Campus: {c.preferredCampus}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCandidateAction(c.bookingRef, 'enrolled', 'Approved by Coach Bapi Roy after technical assessment.')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Enroll Player</span>
                      </button>

                      <button
                        onClick={() => handleCandidateAction(c.bookingRef, 'confirmed', 'Trial confirmed for upcoming weekend session.')}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-bold text-xs cursor-pointer transition-colors"
                      >
                        Confirm Trial
                      </button>

                      <button
                        onClick={() => handleCandidateAction(c.bookingRef, 'waitlist', 'Added to secondary cohort waitlist.')}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs cursor-pointer transition-colors"
                      >
                        Waitlist
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Squad Radar */}
      {activeTab === 'evaluations' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Squad Technical Benchmarks
          </h3>
          <p className="text-xs text-slate-600">
            Cohort averages tracked across 28 registered academy athletes in the U13–U16 division.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500 text-[10px]">Average Ball Mastery</div>
              <div className="text-xl font-black text-slate-900 mt-1">84.6%</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500 text-[10px]">Scanning Rate / min</div>
              <div className="text-xl font-black text-blue-600 mt-1">4.2 Scans</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500 text-[10px]">Yo-Yo Level 1 Avg</div>
              <div className="text-xl font-black text-emerald-600 mt-1">17.4 Lvl</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500 text-[10px]">Punctuality Compliance</div>
              <div className="text-xl font-black text-amber-600 mt-1">98.1%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
