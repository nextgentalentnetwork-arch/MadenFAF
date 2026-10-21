'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/AuthContext';
import {
  AcademyRegistrationData,
  getRegistrations,
  updateRegistrationStatus,
} from '@/lib/supabaseClient';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Crown,
  Database,
  Lock,
  Shield,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { AdminDonationsManager } from '@/components/portal/AdminDonationsManager';

interface AdminDashboardProps {
  profile: UserProfile;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ profile }) => {
  const [candidates, setCandidates] = useState<AcademyRegistrationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const list = await getRegistrations();
        if (isMounted) setCandidates(list);
      } catch (err) {
        console.warn('Error fetching all registrations:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchAll();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAdminStatusChange = async (
    bookingRef: string,
    status: 'enrolled' | 'confirmed' | 'waitlist' | 'rejected'
  ) => {
    try {
      const res = await updateRegistrationStatus(bookingRef, status, 'Approved by Technical Director');
      if (res.success) {
        setCandidates(prev =>
          prev.map(c => (c.bookingRef === bookingRef ? { ...c, status } : c))
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
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-amber-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5" />
              <span>Executive Academy Command · Full Director Authorization</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              Executive Director: {profile.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Complete oversight of all campuses, licensed coaching staff, candidate enrollments, Donators Portal verifications, and system configurations.
            </p>
          </div>

          <Link
            href="/developer"
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer transition-all shrink-0"
          >
            <Shield className="w-4 h-4 text-slate-950" />
            <span>Backend Command Center</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </Link>
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

      {/* High Level Executive Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase">Registered Candidates</div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">{candidates.length}</div>
          <div className="text-[11px] text-amber-700 font-medium">Active admissions queue</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase">Approved Enrolled</div>
          <div className="text-2xl font-black text-emerald-600 tabular-nums">
            {candidates.filter(c => c.status === 'enrolled').length}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">Passed trial criteria</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase">Licensed Coaches</div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">18</div>
          <div className="text-[11px] text-slate-500 font-medium">AFC ‘A’, ‘B’, ‘C’ certified</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase">Active Campuses</div>
          <div className="text-2xl font-black text-blue-600 tabular-nums">3</div>
          <div className="text-[11px] text-slate-500 font-medium">Nadia & N24 Parganas</div>
        </div>
      </div>

      {/* Donators Portal & Official QR Payment Governance */}
      <AdminDonationsManager profile={profile} />

      {/* Candidate Approvals & Admissions Queue */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>Master Candidate Registry & Final Approval Action</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">Executive Authorization Level</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading registrations...</div>
        ) : candidates.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
            No applicant records available in the central database.
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
                    Parent: {c.parentName} · Phone: {c.phone} · Campus: {c.preferredCampus} · Pos: {c.position} · Program: {c.program}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAdminStatusChange(c.bookingRef, 'enrolled')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Enroll</span>
                  </button>

                  <button
                    onClick={() => handleAdminStatusChange(c.bookingRef, 'confirmed')}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Confirm Trial
                  </button>

                  <button
                    onClick={() => handleAdminStatusChange(c.bookingRef, 'waitlist')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Waitlist
                  </button>

                  <button
                    onClick={() => handleAdminStatusChange(c.bookingRef, 'rejected')}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                    title="Reject Application"
                  >
                    <XCircle className="w-4 h-4" />
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
