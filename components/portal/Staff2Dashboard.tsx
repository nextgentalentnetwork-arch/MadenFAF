'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/lib/AuthContext';
import {
  AcademyRegistrationData,
  getRegistrations,
  submitRegistration,
  updateRegistrationStatus,
} from '@/lib/supabaseClient';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Shield,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';

interface Staff2DashboardProps {
  profile: UserProfile;
}

export const Staff2Dashboard: React.FC<Staff2DashboardProps> = ({ profile }) => {
  const [candidates, setCandidates] = useState<AcademyRegistrationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Daily Field Check-in sample data
  const [pitchRoster, setPitchRoster] = useState([
    { id: '1', name: 'Subham Roy', squad: 'U15 Elite', pitch: 'Gayeshpur Field 1', status: 'Checked In', time: '6:15 AM' },
    { id: '2', name: 'Aniket Mukherjee', squad: 'U12 Academy', pitch: 'Gayeshpur Field 2', status: 'Checked In', time: '6:22 AM' },
    { id: '3', name: 'Priya Sen', squad: 'U14 Girls', pitch: 'Gayeshpur Field 1', status: 'Pending Arrival', time: '--' },
    { id: '4', name: 'Rohan Ghosh', squad: 'U13 Development', pitch: 'Gayeshpur Field 2', status: 'Checked In', time: '6:28 AM' },
  ]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await getRegistrations();
      setCandidates(list);
    } catch (e) {
      console.warn('Error loading list:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    getRegistrations()
      .then((list) => {
        if (isMounted) {
          setCandidates(list);
          setIsLoading(false);
        }
      })
      .catch((e) => {
        console.warn('Error loading list:', e);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleCheckIn = (id: string) => {
    setPitchRoster(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              status: p.status === 'Checked In' ? 'Pending Arrival' : 'Checked In',
              time: p.status === 'Checked In' ? '--' : '6:35 AM',
            }
          : p
      )
    );
  };

  const handleStaff2Status = async (bookingRef: string, status: 'pending_trial' | 'waitlist') => {
    try {
      const res = await updateRegistrationStatus(bookingRef, status, `Logged by Staff 2 Field Desk (${profile.fullName})`);
      if (res.success) {
        setCandidates(prev =>
          prev.map(c => (c.bookingRef === bookingRef ? { ...c, status } : c))
        );
        setMsg({
          type: 'success',
          text: `Candidate ${bookingRef} status saved as ${status === 'waitlist' ? 'WAITLIST' : 'PENDING TRIAL'}.`,
        });
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e?.message || 'Update failed' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>Field Logistics & Attendance Desk · Staff 2 Role</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              Staff 2 Field Operations: {profile.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Track daily campus training attendance, pitch equipment, and intake check-ins at {profile.campus || 'designated campus'}.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-teal-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-md">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Field Authority</div>
              <div className="text-sm font-bold text-white">Attendance Counter</div>
              <div className="text-[10px] text-teal-300 font-semibold">Intake & Waitlist Desk Active</div>
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{msg.text}</span>
        </div>
      )}

      {/* Daily Campus Attendance Check-In Monitor */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>Live Pitchside Athlete Check-In Log</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Click player to mark present or absent.</p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Today&apos;s Training Cycle</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {pitchRoster.map((player) => (
            <div
              key={player.id}
              onClick={() => toggleCheckIn(player.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                player.status === 'Checked In'
                  ? 'bg-teal-50/70 border-teal-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">{player.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                  player.status === 'Checked In' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {player.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">{player.squad} · {player.pitch}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">Arrival: {player.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Policy Notice & Candidate Intake */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            <span>Field Intake Desk (Pending / Waitlist Queue)</span>
          </h3>
          <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            Staff 2 Restriction: Approvals reserved for Admin/Coach/Manager
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading registrations...</div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {candidates.slice(0, 5).map((c) => (
              <div key={c.bookingRef} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{c.playerName} ({c.bookingRef})</div>
                  <div className="text-[11px] text-slate-500">{c.parentName} · {c.phone} · {c.preferredCampus}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200">
                    {c.status || 'Pending'}
                  </span>
                  <button
                    onClick={() => handleStaff2Status(c.bookingRef, 'waitlist')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                  >
                    Set Waitlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
