'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/AuthContext';
import {
  AcademyRegistrationData,
  getRegistrations,
  updateRegistrationStatus,
} from '@/lib/supabaseClient';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';

interface ManagerDashboardProps {
  profile: UserProfile;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ profile }) => {
  const [candidates, setCandidates] = useState<AcademyRegistrationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchList = async () => {
      setIsLoading(true);
      try {
        const data = await getRegistrations();
        if (isMounted) setCandidates(data);
      } catch (err) {
        console.warn('Error fetching registrations:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchList();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleApprove = async (bookingRef: string, status: 'enrolled' | 'confirmed' | 'waitlist') => {
    try {
      const res = await updateRegistrationStatus(bookingRef, status, 'Approved by Campus Operations Manager');
      if (res.success) {
        setCandidates((prev) =>
          prev.map((c) => (c.bookingRef === bookingRef ? { ...c, status } : c))
        );
        setMsg({ type: 'success', text: `Candidate ${bookingRef} updated to ${status.toUpperCase()}!` });
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e?.message || 'Update failed' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Manager Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>Campus Operations Management Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              Manager Console: {profile.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Oversee multi-campus pitch logistics, admissions intake queues, and technical staff schedules across {profile.campus || 'all designated campuses'}.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-purple-500 text-white font-black flex items-center justify-center text-lg shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Operations Level</div>
              <div className="text-sm font-bold text-white">Full Admission Approval</div>
              <div className="text-[10px] text-emerald-400 font-semibold">Campus Executive Authorization</div>
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

      {/* Campus Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Gayeshpur Flagship Campus</span>
            <span className="text-emerald-600 font-bold">Pitch Active</span>
          </div>
          <div className="text-2xl font-black text-slate-900">4 Divisions</div>
          <p className="text-[11px] text-slate-600">Floodlights operational. 3 training sessions today.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Ichapore Campus (N24P)</span>
            <span className="text-emerald-600 font-bold">Turf Active</span>
          </div>
          <div className="text-2xl font-black text-slate-900">2 Divisions</div>
          <p className="text-[11px] text-slate-600">Youth development & Goalkeeper clinics.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Admissions Queue</span>
            <span className="text-purple-600 font-bold">{candidates.length} Total</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {candidates.filter(c => c.status === 'enrolled').length} Enrolled
          </div>
          <p className="text-[11px] text-slate-600">Official 2026/27 trial candidates pending.</p>
        </div>
      </div>

      {/* Admissions Management */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-purple-600" />
            <span>Admissions & Trial Applications Queue</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">Manager Review Console</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading registrations...</div>
        ) : candidates.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
            No applicant records available.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {candidates.map((c) => (
              <div key={c.bookingRef} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{c.playerName}</span>
                    <span className="text-[10px] font-mono text-slate-400">({c.bookingRef})</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-purple-800 border border-purple-200">
                      {c.status || 'Pending Trial'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Parent: {c.parentName} · Phone: {c.phone} · Campus: {c.preferredCampus} · Pos: {c.position}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(c.bookingRef, 'enrolled')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Admission</span>
                  </button>

                  <button
                    onClick={() => handleApprove(c.bookingRef, 'confirmed')}
                    className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Confirm Trial
                  </button>

                  <button
                    onClick={() => handleApprove(c.bookingRef, 'waitlist')}
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
  );
};
