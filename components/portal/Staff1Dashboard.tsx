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
  AlertTriangle,
  CheckCircle2,
  Clock,
  FilePlus,
  Lock,
  Phone,
  Shield,
  UserPlus,
  Users,
} from 'lucide-react';

interface Staff1DashboardProps {
  profile: UserProfile;
}

export const Staff1Dashboard: React.FC<Staff1DashboardProps> = ({ profile }) => {
  const [candidates, setCandidates] = useState<AcademyRegistrationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Intake Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    playerName: '',
    dob: '2012-05-10',
    gender: 'male',
    parentName: '',
    phone: '',
    email: '',
    preferredCampus: 'gayeshpur',
    position: 'midfielder',
    experienceLevel: 'intermediate',
    program: 'development',
    status: 'pending_trial' as 'pending_trial' | 'waitlist',
  });

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

  const handleRegisterIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayer.playerName || !newPlayer.parentName || !newPlayer.phone) {
      setMsg({ type: 'error', text: 'Please fill in player name, parent name, and contact phone.' });
      return;
    }

    try {
      const res = await submitRegistration({
        playerName: newPlayer.playerName,
        dob: newPlayer.dob,
        gender: newPlayer.gender,
        parentName: newPlayer.parentName,
        phone: newPlayer.phone,
        email: newPlayer.email || `${newPlayer.playerName.toLowerCase().replace(/\s+/g, '')}@example.com`,
        preferredCampus: newPlayer.preferredCampus,
        position: newPlayer.position,
        experienceLevel: newPlayer.experienceLevel,
        program: newPlayer.program,
        message: `Registered via Staff 1 Intake Desk (${profile.fullName}). Status: ${newPlayer.status.toUpperCase()}`,
      });

      if (res.success) {
        if (newPlayer.status === 'waitlist') {
          await updateRegistrationStatus(res.bookingRef, 'waitlist', 'Placed on waitlist by Staff 1 intake desk');
        }
        setMsg({
          type: 'success',
          text: `Player profile (${res.bookingRef}) created and saved as ${newPlayer.status === 'waitlist' ? 'WAITLISTED' : 'PENDING TRIAL'}! Queued for Admin/Coach review.`,
        });
        setShowAddModal(false);
        setNewPlayer({
          playerName: '',
          dob: '2012-05-10',
          gender: 'male',
          parentName: '',
          phone: '',
          email: '',
          preferredCampus: 'gayeshpur',
          position: 'midfielder',
          experienceLevel: 'intermediate',
          program: 'development',
          status: 'pending_trial',
        });
        loadData();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Failed to submit intake record.' });
    }
  };

  // Staff 1 status update enforcement
  const handleStaffStatusUpdate = async (bookingRef: string, targetStatus: 'pending_trial' | 'waitlist') => {
    try {
      const res = await updateRegistrationStatus(bookingRef, targetStatus, `Updated by Staff 1 (${profile.fullName})`);
      if (res.success) {
        setCandidates((prev) =>
          prev.map((c) => (c.bookingRef === bookingRef ? { ...c, status: targetStatus } : c))
        );
        setMsg({
          type: 'success',
          text: `Candidate ${bookingRef} saved as ${targetStatus === 'waitlist' ? 'WAITLIST' : 'PENDING TRIAL'}.`,
        });
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Update failed' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Admissions Coordinator Portal · Staff 1 Role</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
              Staff 1 Intake Desk: {profile.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Register trial applicants and organize intake queues. In accordance with academy policy, Staff 1 can submit player profiles and save them as Pending or Waitlisted for Admin, Coach, or Manager review.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Candidate Intake</span>
          </button>
        </div>
      </div>

      {/* Policy Enforcement Banner */}
      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs flex items-start gap-3">
        <Shield className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-sky-950 uppercase tracking-wide">
            Staff 1 Role Authorization Policy (Active)
          </div>
          <p className="text-sky-800 mt-0.5 leading-relaxed">
            Staff 1 users can create and register candidate player profiles and save their records as <strong>Pending Trial</strong> or <strong>Waitlist</strong>. Final approvals, squad enrollments, and status authorizations are restricted to authorized Admin, Coach, or Manager review.
          </p>
        </div>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{msg.text}</span>
        </div>
      )}

      {/* Intake Queue */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>Admissions Candidate Intake Queue ({candidates.length})</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">Desk: {profile.campus || 'Gayeshpur'}</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading intake candidates...</div>
        ) : candidates.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
            No applicants in the registry yet. Click &apos;New Candidate Intake&apos; to register a player.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {candidates.map((c) => (
              <div key={c.bookingRef} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{c.playerName}</span>
                    <span className="text-[10px] font-mono text-slate-400">({c.bookingRef})</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sky-50 text-sky-800 border border-sky-200">
                      {c.status || 'Pending Trial'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Parent: {c.parentName} · Phone: {c.phone} · Campus: {c.preferredCampus} · Program: {c.program}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStaffStatusUpdate(c.bookingRef, 'pending_trial')}
                    className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Save as Pending
                  </button>

                  <button
                    onClick={() => handleStaffStatusUpdate(c.bookingRef, 'waitlist')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Save as Waitlist
                  </button>

                  <div className="text-[10px] text-slate-400 italic px-2">
                    Approval: Admin/Coach only
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: New Intake Candidate Form */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
                Staff 1 — New Candidate Intake
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterIntake} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Player Full Name *</label>
                <input
                  type="text"
                  required
                  value={newPlayer.playerName}
                  onChange={(e) => setNewPlayer({ ...newPlayer, playerName: e.target.value })}
                  placeholder="Enter player name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newPlayer.dob}
                    onChange={(e) => setNewPlayer({ ...newPlayer, dob: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Position</label>
                  <select
                    value={newPlayer.position}
                    onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  >
                    <option value="midfielder">Midfielder</option>
                    <option value="forward">Forward / Striker</option>
                    <option value="defender">Defender</option>
                    <option value="goalkeeper">Goalkeeper</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parent Name *</label>
                  <input
                    type="text"
                    required
                    value={newPlayer.parentName}
                    onChange={(e) => setNewPlayer({ ...newPlayer, parentName: e.target.value })}
                    placeholder="Enter parent name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newPlayer.phone}
                    onChange={(e) => setNewPlayer({ ...newPlayer, phone: e.target.value })}
                    placeholder="Enter 10-digit number"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Save Profile Status *</label>
                <select
                  value={newPlayer.status}
                  onChange={(e) => setNewPlayer({ ...newPlayer, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-sky-50 border border-sky-300 rounded-xl font-bold text-sky-950 outline-none"
                >
                  <option value="pending_trial">Pending Trial (Ready for Coach Review)</option>
                  <option value="waitlist">Waitlisted (Capacity Reserve)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Staff 1 can only save as Pending or Waitlisted. Approval requires Admin/Coach.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold cursor-pointer"
                >
                  Save Intake Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
