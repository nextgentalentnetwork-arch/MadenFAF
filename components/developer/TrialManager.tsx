'use client';

import React, { useState, useEffect } from 'react';
import { AcademyDataManager } from '@/lib/academyDataManager';
import { TrialSlot } from '@/data/academyData';
import {
  getRegistrations,
  updateRegistrationStatus,
  deleteRegistration,
  submitRegistration,
  AcademyRegistrationData,
  checkSupabaseHealth,
} from '@/lib/supabaseClient';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  Download,
  Printer,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Award,
  ChevronDown,
  X,
  Save,
  Check,
  Sparkles,
  Phone,
  Mail,
} from 'lucide-react';

interface TrialManagerProps {
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}

export const TrialManager: React.FC<TrialManagerProps> = ({ onNotify }) => {
  const [activeSubTab, setActiveSubTab] = useState<'candidates' | 'slots'>('candidates');

  // Candidate Registrations State
  const [candidates, setCandidates] = useState<AcademyRegistrationData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [campusFilter, setCampusFilter] = useState<string>('all');

  // Trial Slots State
  const [trialSlots, setTrialSlots] = useState<TrialSlot[]>(() => AcademyDataManager.getTrialSlots());
  const [editingSlot, setEditingSlot] = useState<TrialSlot | null>(null);
  const [isAddSlotOpen, setIsAddSlotOpen] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'candidate' | 'slot'; id: string; name: string } | null>(null);

  // Candidate Scheduling / Evaluation Modal
  const [editingCandidate, setEditingCandidate] = useState<AcademyRegistrationData | null>(null);
  const [candidateNotes, setCandidateNotes] = useState<string>('');
  const [candidateTrialDate, setCandidateTrialDate] = useState<string>('May 16, 2026');
  const [candidateEvaluator, setCandidateEvaluator] = useState<string>('Coach Bapi Roy (AFC ‘B’)');

  // Add Manual Candidate Modal
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState<boolean>(false);
  const [newCandidateForm, setNewCandidateForm] = useState({
    playerName: '',
    parentName: '',
    email: '',
    phone: '',
    dob: '2012-05-10',
    gender: 'male',
    preferredCampus: 'gayeshpur',
    position: 'midfielder',
    experienceLevel: 'intermediate',
    program: 'development',
    status: 'pending_trial',
    message: '',
  });

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const data = await getRegistrations();
      setCandidates(data);
    } catch (e) {
      console.warn('Failed to load candidate registrations:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const refreshSlots = () => {
    setTrialSlots(AcademyDataManager.getTrialSlots());
  };

  // Status update handler
  const handleStatusChange = async (
    bookingRef: string,
    newStatus: 'pending_trial' | 'confirmed' | 'attended' | 'enrolled' | 'waitlist' | 'rejected',
    notes?: string
  ) => {
    try {
      await updateRegistrationStatus(bookingRef, newStatus, notes);
      setCandidates((prev) =>
        prev.map((c) => (c.bookingRef === bookingRef ? { ...c, status: newStatus as any } : c))
      );
      onNotify({
        type: 'success',
        text: `Candidate (${bookingRef}) updated to "${newStatus.replace('_', ' ')}". Persisted to Supabase!`,
      });
    } catch (err: any) {
      onNotify({ type: 'error', text: err?.message || 'Failed to update status' });
    }
  };

  // Delete candidate
  const handleDeleteCandidate = (bookingRef: string, name: string) => {
    setDeleteTarget({ type: 'candidate', id: bookingRef, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'candidate') {
        await deleteRegistration(deleteTarget.id);
        setCandidates((prev) => prev.filter((c) => c.bookingRef !== deleteTarget.id));
        onNotify({
          type: 'success',
          text: `Registration for ${deleteTarget.name} removed from Supabase and local storage.`,
        });
      } else if (deleteTarget.type === 'slot') {
        AcademyDataManager.deleteTrialSlot(deleteTarget.id);
        refreshSlots();
        onNotify({ type: 'success', text: `Trial session removed.` });
      }
    } catch (err: any) {
      onNotify({ type: 'error', text: err?.message || 'Failed to delete' });
    } finally {
      setDeleteTarget(null);
    }
  };

  // Save Candidate Assessment Notes & Schedule
  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;

    const fullNotes = `[Trial: ${candidateTrialDate} | Evaluator: ${candidateEvaluator}] ${candidateNotes}`;
    await updateRegistrationStatus(
      editingCandidate.bookingRef,
      (editingCandidate.status as any) || 'confirmed',
      fullNotes
    );
    setCandidates((prev) =>
      prev.map((c) =>
        c.bookingRef === editingCandidate.bookingRef
          ? { ...c, message: fullNotes, status: (editingCandidate.status as any) || 'confirmed' }
          : c
      )
    );
    setEditingCandidate(null);
    onNotify({
      type: 'success',
      text: `Scout assessment and schedule saved for ${editingCandidate.playerName}.`,
    });
  };

  // Add Manual Candidate Submit
  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidateForm.playerName.trim() || !newCandidateForm.phone.trim()) {
      alert('Please provide player name and phone number.');
      return;
    }
    const res = await submitRegistration({
      playerName: newCandidateForm.playerName,
      parentName: newCandidateForm.parentName,
      email: newCandidateForm.email,
      phone: newCandidateForm.phone,
      dob: newCandidateForm.dob,
      gender: newCandidateForm.gender,
      location: '',
      preferredCampus: newCandidateForm.preferredCampus,
      position: newCandidateForm.position,
      experienceLevel: newCandidateForm.experienceLevel,
      program: newCandidateForm.program,
      message: newCandidateForm.message,
    });

    if (res.success) {
      await loadCandidates();
      setIsAddCandidateOpen(false);
      setNewCandidateForm({
        playerName: '',
        parentName: '',
        email: '',
        phone: '',
        dob: '2012-05-10',
        gender: 'male',
        preferredCampus: 'gayeshpur',
        position: 'midfielder',
        experienceLevel: 'intermediate',
        program: 'development',
        status: 'pending_trial',
        message: '',
      });
      onNotify({
        type: 'success',
        text: `New trial candidate registered with Ref: ${res.bookingRef}!`,
      });
    }
  };

  // Trial Slot Handlers
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;
    AcademyDataManager.updateTrialSlot(editingSlot.id, editingSlot);
    refreshSlots();
    setEditingSlot(null);
    onNotify({
      type: 'success',
      text: `Trial intake session at ${editingSlot.campusName} updated and synchronized.`,
    });
  };

  const handleDeleteSlot = (id: string, name: string) => {
    setDeleteTarget({ type: 'slot', id, name });
  };

  // CSV Export
  const exportCandidatesCSV = () => {
    const headers = [
      'Booking Ref',
      'Player Name',
      'DOB',
      'Gender',
      'Parent Name',
      'Phone',
      'Email',
      'Campus',
      'Position',
      'Program',
      'Status',
      'Notes',
    ];
    const rows = candidates.map((c) => [
      c.bookingRef,
      `"${c.playerName}"`,
      c.dob,
      c.gender,
      `"${c.parentName}"`,
      c.phone,
      c.email,
      c.preferredCampus,
      c.position,
      c.program,
      c.status || 'pending_trial',
      `"${(c.message || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MADEN_FAF_Trial_Candidates_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering candidates
  const filteredCandidates = candidates.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (c.playerName || '').toLowerCase().includes(q) ||
      (c.parentName || '').toLowerCase().includes(q) ||
      (c.bookingRef || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.email || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || (c.status || 'pending_trial') === statusFilter;
    const matchesCampus = campusFilter === 'all' || (c.preferredCampus || '').toLowerCase() === campusFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCampus;
  });

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight">
                Trial Management & Scouting Intake
              </h2>
              <p className="text-xs text-slate-500">
                Manage player scouting trials, assessment scores, intake sessions, and trial statuses across all campuses.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-tab switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold border border-slate-200">
            <button
              onClick={() => setActiveSubTab('candidates')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeSubTab === 'candidates' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Candidates ({candidates.length})
            </button>
            <button
              onClick={() => setActiveSubTab('slots')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeSubTab === 'slots' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Intake Sessions ({trialSlots.length})
            </button>
          </div>

          <button
            onClick={() => setIsAddCandidateOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Candidate</span>
          </button>

          <button
            onClick={exportCandidatesCSV}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export CSV Roster"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={loadCandidates}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>
      </div>

      {activeSubTab === 'candidates' ? (
        <div className="space-y-3">
          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col md:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidate name, parent, phone, booking ref..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending_trial">Pending Trial</option>
                <option value="confirmed">Trial Confirmed</option>
                <option value="attended">Attended Trial</option>
                <option value="enrolled">Enrolled in Academy</option>
                <option value="waitlist">Waitlist</option>
                <option value="rejected">Not Selected</option>
              </select>

              <select
                value={campusFilter}
                onChange={(e) => setCampusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Campuses</option>
                <option value="gayeshpur">Gayeshpur Campus</option>
                <option value="ichapore">Ichapore Campus</option>
                <option value="krishnanagar">Krishnanagar Football School</option>
              </select>
            </div>
          </div>

          {/* Candidates Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Booking Ref</th>
                    <th className="py-3 px-4">Candidate & Age</th>
                    <th className="py-3 px-4">Parent & Contact</th>
                    <th className="py-3 px-4">Campus & Position</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4">Evaluation / Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        {isLoading ? 'Querying candidate applications...' : 'No candidate trial registrations match your search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((c) => {
                      const status = c.status || 'pending_trial';
                      return (
                        <tr key={c.id || c.bookingRef} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {c.bookingRef}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-black text-slate-900">{c.playerName}</div>
                            <div className="text-[11px] text-slate-500">
                              DOB: {c.dob} · <span className="capitalize">{c.gender}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{c.parentName}</div>
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{c.phone}</span>
                            </div>
                            {c.email && (
                              <div className="text-[10px] text-slate-500 truncate max-w-[140px] flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{c.email}</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-amber-800 capitalize">
                              {c.preferredCampus}
                            </div>
                            <div className="text-[10px] text-slate-500 capitalize">
                              {c.position} · {c.program}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <select
                              value={status}
                              onChange={(e) =>
                                handleStatusChange(c.bookingRef, e.target.value as any, c.message)
                              }
                              className={`text-[10px] font-bold font-mono uppercase px-2 py-1 rounded-lg border cursor-pointer outline-none ${
                                status === 'enrolled'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : status === 'attended'
                                  ? 'bg-sky-50 text-sky-800 border-sky-300'
                                  : status === 'confirmed'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : status === 'rejected'
                                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              <option value="pending_trial">Pending Trial</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="attended">Attended</option>
                              <option value="enrolled">Enrolled</option>
                              <option value="waitlist">Waitlist</option>
                              <option value="rejected">Not Selected</option>
                            </select>
                          </td>

                          <td className="py-3 px-4">
                            {c.message ? (
                              <div className="text-[11px] text-slate-600 line-clamp-2 max-w-[200px]" title={c.message}>
                                {c.message}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">No notes</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingCandidate(c);
                                  setCandidateNotes(c.message || '');
                                }}
                                className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                title="Schedule / Add Assessment"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCandidate(c.bookingRef, c.playerName)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete application"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Intake Sessions / Slots Sub-Tab */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trialSlots.map((slot) => (
              <div
                key={slot.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Intake Session
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${
                        slot.status === 'Open'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : slot.status === 'Filling Fast'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {slot.status}
                    </span>
                  </div>

                  <h3 className="text-base font-black uppercase text-slate-900 tracking-tight leading-snug">
                    {slot.campusName}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{slot.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{slot.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Age Groups: {slot.ageGroups}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Evaluator: {slot.evaluatorCoach}</span>
                    </div>
                  </div>

                  {/* Slot progress bar */}
                  <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-500">Intake Capacity</span>
                      <span className="font-bold text-slate-900">
                        {slot.slotsBooked} / {slot.slotsTotal} Slots
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (slot.slotsBooked / slot.slotsTotal) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2.5 italic">
                    Requirements: {slot.requirements}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => setEditingSlot(slot)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Edit Session</span>
                  </button>
                  <button
                    onClick={() => handleDeleteSlot(slot.id, slot.campusName)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Evaluation & Scheduling Modal */}
      {editingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black uppercase text-slate-900 tracking-tight">
                  Scout Evaluation & Trial Scheduling
                </h3>
                <p className="text-xs text-slate-500">
                  Candidate: <span className="font-bold text-slate-800">{editingCandidate.playerName}</span> ({editingCandidate.bookingRef})
                </p>
              </div>
              <button
                onClick={() => setEditingCandidate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Scheduled Trial Date
                  </label>
                  <input
                    type="text"
                    value={candidateTrialDate}
                    onChange={(e) => setCandidateTrialDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Assigned Evaluator Coach
                  </label>
                  <input
                    type="text"
                    value={candidateEvaluator}
                    onChange={(e) => setCandidateEvaluator(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Candidate Trial Status
                </label>
                <select
                  value={editingCandidate.status || 'pending_trial'}
                  onChange={(e) =>
                    setEditingCandidate({ ...editingCandidate, status: e.target.value as any })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="pending_trial">Pending Trial Assessment</option>
                  <option value="confirmed">Trial Confirmed & Scheduled</option>
                  <option value="attended">Attended On-Pitch Session</option>
                  <option value="enrolled">Offered Academy Enrollment</option>
                  <option value="waitlist">Waitlist for Next Intake</option>
                  <option value="rejected">Not Selected</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Technical Scout & Coach Assessment Notes
                </label>
                <textarea
                  rows={4}
                  value={candidateNotes}
                  onChange={(e) => setCandidateNotes(e.target.value)}
                  placeholder="Record player first-touch quality, speed, tactical awareness, and enrollment recommendation..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCandidate(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Evaluation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Trial Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-slate-900 tracking-tight">
                Edit Intake Session
              </h3>
              <button
                onClick={() => setEditingSlot(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Campus Title
                </label>
                <input
                  type="text"
                  value={editingSlot.campusName}
                  onChange={(e) => setEditingSlot({ ...editingSlot, campusName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={editingSlot.date}
                    onChange={(e) => setEditingSlot({ ...editingSlot, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Timings
                  </label>
                  <input
                    type="text"
                    value={editingSlot.time}
                    onChange={(e) => setEditingSlot({ ...editingSlot, time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingSlot.status}
                    onChange={(e) => setEditingSlot({ ...editingSlot, status: e.target.value as any })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="Open">Open</option>
                    <option value="Filling Fast">Filling Fast</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Total Slots
                  </label>
                  <input
                    type="number"
                    value={editingSlot.slotsTotal}
                    onChange={(e) =>
                      setEditingSlot({ ...editingSlot, slotsTotal: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Booked Slots
                  </label>
                  <input
                    type="number"
                    value={editingSlot.slotsBooked}
                    onChange={(e) =>
                      setEditingSlot({ ...editingSlot, slotsBooked: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Evaluator Coach
                </label>
                <input
                  type="text"
                  value={editingSlot.evaluatorCoach}
                  onChange={(e) => setEditingSlot({ ...editingSlot, evaluatorCoach: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Candidate Requirements
                </label>
                <textarea
                  rows={2}
                  value={editingSlot.requirements}
                  onChange={(e) => setEditingSlot({ ...editingSlot, requirements: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Session</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Candidate Registration Modal */}
      {isAddCandidateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-slate-900 tracking-tight">
                Register Candidate for Scouting Trial
              </h3>
              <button
                onClick={() => setIsAddCandidateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCandidate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Player Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCandidateForm.playerName}
                    onChange={(e) =>
                      setNewCandidateForm({ ...newCandidateForm, playerName: e.target.value })
                    }
                    placeholder="e.g. Subham Roy"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Parent / Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCandidateForm.parentName}
                    onChange={(e) =>
                      setNewCandidateForm({ ...newCandidateForm, parentName: e.target.value })
                    }
                    placeholder="e.g. Pradip Roy"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newCandidateForm.phone}
                    onChange={(e) =>
                      setNewCandidateForm({ ...newCandidateForm, phone: e.target.value })
                    }
                    placeholder="+91 98300 00000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newCandidateForm.email}
                    onChange={(e) =>
                      setNewCandidateForm({ ...newCandidateForm, email: e.target.value })
                    }
                    placeholder="contact@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Preferred Campus
                  </label>
                  <select
                    value={newCandidateForm.preferredCampus}
                    onChange={(e) =>
                      setNewCandidateForm({ ...newCandidateForm, preferredCampus: e.target.value })
                    }
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="gayeshpur">Gayeshpur Campus</option>
                    <option value="ichapore">Ichapore Campus</option>
                    <option value="krishnanagar">Krishnanagar Football School</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Playing Position
                  </label>
                  <select
                    value={newCandidateForm.position}
                    onChange={(e) =>
                      setNewCandidateForm({ ...newCandidateForm, position: e.target.value })
                    }
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="midfielder">Midfielder</option>
                    <option value="forward">Forward / Winger</option>
                    <option value="defender">Defender</option>
                    <option value="goalkeeper">Goalkeeper</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    DOB
                  </label>
                  <input
                    type="date"
                    value={newCandidateForm.dob}
                    onChange={(e) =>
                      setNewCandidateForm({ ...newCandidateForm, dob: e.target.value })
                    }
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Initial Notes / Coach Instructions
                </label>
                <textarea
                  rows={2}
                  value={newCandidateForm.message}
                  onChange={(e) =>
                    setNewCandidateForm({ ...newCandidateForm, message: e.target.value })
                  }
                  placeholder="Notes from front desk or preliminary screening..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCandidateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Candidate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title={
          deleteTarget?.type === 'candidate'
            ? 'Delete Candidate Registration'
            : 'Delete Intake Assessment Slot'
        }
        message={
          deleteTarget?.type === 'candidate'
            ? 'Are you sure you want to permanently remove this candidate application? It will be removed from Supabase and local storage.'
            : 'Are you sure you want to remove this trial intake session from the schedule?'
        }
        itemName={deleteTarget?.name}
        confirmLabel={deleteTarget?.type === 'candidate' ? 'Delete Registration' : 'Delete Slot'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
