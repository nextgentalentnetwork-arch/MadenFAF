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
  APPLICATION_STATUS_META,
  normalizeApplicationStatus,
  ApplicationStatus,
} from '@/lib/supabaseClient';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { PlayerProfileDetailModal } from '@/components/portal/PlayerProfileDetailModal';
import { BulkSendTrialPassesModal } from './BulkSendTrialPassesModal';
import {
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Plus,
  Trash2,
  Edit3,
  Download,
  RefreshCw,
  Award,
  X,
  Save,
  Phone,
  Mail,
  Send,
  FileText,
  Eye,
  Trophy,
  CheckCircle2,
  Ticket,
  MessageSquare,
} from 'lucide-react';

interface TrialManagerProps {
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}

const OFFICIAL_STATUS_KEYS: (keyof typeof APPLICATION_STATUS_META)[] = [
  'pending_review',
  'under_review',
  'additional_info_required',
  'trial_scheduled',
  'waitlisted',
  'approved',
  'rejected',
  'completed',
];

export const TrialManager: React.FC<TrialManagerProps> = ({ onNotify }) => {
  const [activeSubTab, setActiveSubTab] = useState<'candidates' | 'slots'>('candidates');
  const [pathwayFilter, setPathwayFilter] = useState<'all' | 'admission' | 'trial'>('all');

  // Applications State
  const [candidates, setCandidates] = useState<AcademyRegistrationData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [campusFilter, setCampusFilter] = useState<string>('all');

  // Trial Slots State
  const [trialSlots, setTrialSlots] = useState<TrialSlot[]>(() =>
    AcademyDataManager.getTrialSlots()
  );
  const [editingSlot, setEditingSlot] = useState<TrialSlot | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'candidate' | 'slot';
    id: string;
    name: string;
  } | null>(null);

  // Application Review, Remarks, Trial Scheduling & Applicant Notification Modal
  const [editingCandidate, setEditingCandidate] = useState<AcademyRegistrationData | null>(
    null
  );
  // Full Player Profile Dossier & Official Trial Pass Modal
  const [selectedPlayerForModal, setSelectedPlayerForModal] =
    useState<AcademyRegistrationData | null>(null);
  // Bulk WhatsApp Trial Passes Modal
  const [isBulkWhatsAppOpen, setIsBulkWhatsAppOpen] = useState<boolean>(false);
  const [adminRemarks, setAdminRemarks] = useState<string>('');
  const [scheduleDate, setScheduleDate] = useState<string>('May 16, 2026');
  const [scheduleTime, setScheduleTime] = useState<string>('07:30 AM – 09:30 AM');
  const [scheduleVenue, setScheduleVenue] = useState<string>(
    'Gayeshpur Central Ground, Nadia'
  );
  const [scheduleEvaluator, setScheduleEvaluator] = useState<string>(
    'Coach Bapi Roy (AFC ‘B’)'
  );
  const [reportingInstructions, setReportingInstructions] = useState<string>(
    'Report 30 minutes prior in training kit with football boots, shin guards, water bottle, and original age proof.'
  );
  const [notificationChannel, setNotificationChannel] = useState<'email' | 'sms'>('sms');
  const [sendApplicantNotification, setSendApplicantNotification] = useState<boolean>(true);

  // Add Manual Application Modal
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState<boolean>(false);
  const [newCandidateForm, setNewCandidateForm] = useState({
    applicationType: 'admission' as 'admission' | 'trial',
    playerName: '',
    parentName: '',
    email: '',
    phone: '',
    dob: '2012-05-10',
    gender: 'male',
    location: '',
    preferredCampus: 'gayeshpur',
    position: 'midfielder',
    experienceLevel: 'school-team',
    currentClubOrAcademy: '',
    program: 'development',
    message: '',
  });

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const data = await getRegistrations();
      setCandidates(data);
    } catch (e) {
      console.warn('Failed to load applications:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getRegistrations()
      .then((data) => {
        if (isMounted) setCandidates(data);
      })
      .catch((e) => {
        console.warn('Failed to load applications:', e);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshSlots = () => {
    setTrialSlots(AcademyDataManager.getTrialSlots());
  };

  const openApplicationReviewModal = (c: AcademyRegistrationData) => {
    setEditingCandidate({
      ...c,
      status: normalizeApplicationStatus(c.status),
    });
    setAdminRemarks(c.adminRemarks || '');
    setScheduleDate(
      c.scheduledTrialDetails?.date || c.preferredTrialDate || 'May 16, 2026'
    );
    setScheduleTime(c.scheduledTrialDetails?.time || '07:30 AM – 09:30 AM');
    setScheduleVenue(
      c.scheduledTrialDetails?.venue ||
        c.preferredVenue ||
        'Gayeshpur Central Ground, Nadia'
    );
    setScheduleEvaluator(
      c.scheduledTrialDetails?.evaluator || 'Coach Bapi Roy (AFC ‘B’)'
    );
    setReportingInstructions(
      c.scheduledTrialDetails?.reportingInstructions ||
        'Report 30 minutes prior in training kit with football boots, shin guards, water bottle, and original age proof.'
    );
  };

  // Status update handler (Admin-only)
  const handleStatusChange = async (
    bookingRef: string,
    newStatus: ApplicationStatus,
    existingCandidate?: AcademyRegistrationData
  ) => {
    const normalized = normalizeApplicationStatus(newStatus);
    try {
      await updateRegistrationStatus(bookingRef, normalized, {
        adminRemarks: existingCandidate?.adminRemarks,
        scheduledTrialDetails: existingCandidate?.scheduledTrialDetails,
        notificationLog: existingCandidate?.notificationLog,
        message: existingCandidate?.message,
      });
      setCandidates((prev) =>
        prev.map((c) =>
          c.bookingRef === bookingRef ? { ...c, status: normalized } : c
        )
      );
      onNotify({
        type: 'success',
        text: `Application (${bookingRef}) status updated to "${APPLICATION_STATUS_META[normalized].label}".`,
      });
    } catch (err: any) {
      onNotify({ type: 'error', text: err?.message || 'Failed to update status' });
    }
  };

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
          text: `Application for ${deleteTarget.name} removed.`,
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

  // Save Application Review, Remarks, Trial Schedule & Optional Applicant Notification
  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;

    const normalizedStatus = normalizeApplicationStatus(editingCandidate.status);
    const updatedSchedule = {
      date: scheduleDate,
      time: scheduleTime,
      venue: scheduleVenue,
      reportingInstructions,
      evaluator: scheduleEvaluator,
    };

    const existingLogs = editingCandidate.notificationLog || [];
    const newLogs = [...existingLogs];

    if (sendApplicantNotification) {
      const statusLabel = APPLICATION_STATUS_META[normalizedStatus].label;
      const msgSummary =
        normalizedStatus === 'trial_scheduled'
          ? `Trial Scheduled for ${editingCandidate.playerName} (${editingCandidate.bookingRef}) on ${scheduleDate} (${scheduleTime}) at ${scheduleVenue}. Instructions: ${reportingInstructions}`
          : `Application ${editingCandidate.bookingRef} for ${editingCandidate.playerName} updated to "${statusLabel}". ${adminRemarks ? `Note: ${adminRemarks}` : ''}`;

      newLogs.unshift({
        id: `notif-${Date.now()}`,
        sentAt: new Date().toISOString(),
        channel: notificationChannel,
        status: statusLabel,
        message: msgSummary,
      });
    }

    await updateRegistrationStatus(editingCandidate.bookingRef, normalizedStatus, {
      adminRemarks,
      scheduledTrialDetails: updatedSchedule,
      notificationLog: newLogs,
      message: editingCandidate.message,
    });

    setCandidates((prev) =>
      prev.map((c) =>
        c.bookingRef === editingCandidate.bookingRef
          ? {
              ...c,
              status: normalizedStatus,
              adminRemarks,
              scheduledTrialDetails: updatedSchedule,
              notificationLog: newLogs,
            }
          : c
      )
    );
    setEditingCandidate(null);
    onNotify({
      type: 'success',
      text: `Application ${editingCandidate.bookingRef} updated (${APPLICATION_STATUS_META[normalizedStatus].label})${sendApplicantNotification ? ` & applicant notified via ${notificationChannel.toUpperCase()}` : ''}.`,
    });
  };

  // Add Manual Application Submit
  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidateForm.playerName.trim() || !newCandidateForm.phone.trim()) {
      onNotify({
        type: 'error',
        text: 'Please provide player name and mobile phone number.',
      });
      return;
    }
    const res = await submitRegistration({
      applicationType: newCandidateForm.applicationType,
      playerName: newCandidateForm.playerName.trim(),
      parentName: newCandidateForm.parentName.trim() || 'Guardian on File',
      email: newCandidateForm.email.trim(),
      phone: newCandidateForm.phone.trim(),
      dob: newCandidateForm.dob,
      gender: newCandidateForm.gender,
      location: newCandidateForm.location.trim(),
      preferredCampus: newCandidateForm.preferredCampus,
      position: newCandidateForm.position,
      experienceLevel: newCandidateForm.experienceLevel,
      currentClubOrAcademy: newCandidateForm.currentClubOrAcademy.trim(),
      program: newCandidateForm.program,
      minorConsentConfirmed: true,
      message: newCandidateForm.message.trim(),
    });

    if (res.success) {
      await loadCandidates();
      setIsAddCandidateOpen(false);
      setNewCandidateForm({
        applicationType: 'admission',
        playerName: '',
        parentName: '',
        email: '',
        phone: '',
        dob: '2012-05-10',
        gender: 'male',
        location: '',
        preferredCampus: 'gayeshpur',
        position: 'midfielder',
        experienceLevel: 'school-team',
        currentClubOrAcademy: '',
        program: 'development',
        message: '',
      });
      onNotify({
        type: 'success',
        text: `New application recorded with Reference: ${res.bookingRef} (Pending Review)!`,
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
      'Application Ref',
      'Pathway',
      'Player Name',
      'DOB',
      'Age',
      'Gender',
      'Parent/Guardian',
      'Mobile',
      'Email',
      'Address',
      'Campus / Venue',
      'Position',
      'Experience',
      'Current Club',
      'Status',
      'Admin Remarks',
      'Scheduled Trial',
    ];
    const rows = candidates.map((c) => {
      const normStatus = normalizeApplicationStatus(c.status);
      return [
        c.bookingRef,
        c.applicationType || 'admission',
        `"${(c.playerName || '').replace(/"/g, '""')}"`,
        c.dob,
        c.age ?? '',
        c.gender,
        `"${(c.parentName || '').replace(/"/g, '""')}"`,
        c.phone,
        c.email,
        `"${(c.location || '').replace(/"/g, '""')}"`,
        c.preferredVenue || c.preferredCampus,
        c.position,
        c.experienceLevel,
        `"${(c.currentClubOrAcademy || '').replace(/"/g, '""')}"`,
        APPLICATION_STATUS_META[normStatus].label,
        `"${(c.adminRemarks || '').replace(/"/g, '""')}"`,
        `"${
          c.scheduledTrialDetails
            ? `${c.scheduledTrialDetails.date} ${c.scheduledTrialDetails.time} @ ${c.scheduledTrialDetails.venue}`
            : ''
        }"`,
      ];
    });
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `MADEN_FAF_Admission_And_Trial_Applications_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const admissionCount = candidates.filter(
    (c) => (c.applicationType || 'admission') === 'admission'
  ).length;
  const trialCount = candidates.filter((c) => c.applicationType === 'trial').length;

  // Filtering applications
  const filteredCandidates = candidates.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (c.playerName || '').toLowerCase().includes(q) ||
      (c.parentName || '').toLowerCase().includes(q) ||
      (c.bookingRef || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.email || '').toLowerCase().includes(q);

    const normStatus = normalizeApplicationStatus(c.status);
    const matchesStatus = statusFilter === 'all' || normStatus === statusFilter;
    const matchesCampus =
      campusFilter === 'all' ||
      (c.preferredCampus || '').toLowerCase().includes(campusFilter.toLowerCase());
    const matchesPathway =
      pathwayFilter === 'all' || (c.applicationType || 'admission') === pathwayFilter;

    return matchesSearch && matchesStatus && matchesCampus && matchesPathway;
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
                Admin Admission &amp; Trial Applications Management
              </h2>
              <p className="text-xs text-slate-500">
                Review player admission &amp; trial applications, update workflow statuses, add internal remarks, schedule trial sessions, and notify applicants.
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
                activeSubTab === 'candidates'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Applications ({candidates.length})
            </button>
            <button
              onClick={() => setActiveSubTab('slots')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeSubTab === 'slots'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Schedules &amp; Venues ({trialSlots.length})
            </button>
          </div>

          {activeSubTab === 'candidates' && (
            <button
              type="button"
              onClick={() => {
                if (filteredCandidates.length === 0) {
                  onNotify({
                    type: 'error',
                    text: 'No candidates match the current filter criteria.',
                  });
                  return;
                }
                setIsBulkWhatsAppOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title={`Bulk send official trial passes to ${filteredCandidates.length} filtered candidate(s) via WhatsApp`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-100" />
              <span>Bulk Send Trial Passes ({filteredCandidates.length})</span>
            </button>
          )}

          <button
            onClick={() => setIsAddCandidateOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Application</span>
          </button>

          <button
            onClick={exportCandidatesCSV}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export Applications CSV"
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
          {/* Pathway Filter Tabs (All / Academy Admission / Trial Sessions) */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPathwayFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                  pathwayFilter === 'all'
                    ? 'bg-slate-900 text-amber-400'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Applications ({candidates.length})
              </button>
              <button
                type="button"
                onClick={() => setPathwayFilter('admission')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors ${
                  pathwayFilter === 'admission'
                    ? 'bg-slate-900 text-amber-400'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Academy Admission ({admissionCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setPathwayFilter('trial')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors ${
                  pathwayFilter === 'trial'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Trial Sessions ({trialCount})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (filteredCandidates.length === 0) {
                    onNotify({
                      type: 'error',
                      text: 'No candidates match the current filter criteria.',
                    });
                    return;
                  }
                  setIsBulkWhatsAppOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                title={`Open bulk WhatsApp trial pass automation for ${filteredCandidates.length} candidate(s)`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-200" />
                <span>Bulk WhatsApp Passes ({filteredCandidates.length})</span>
              </button>
              <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                Admin-Only Access · Minor Data Protected
              </span>
            </div>
          </div>

          {/* Search & Status Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col md:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search player name, parent/guardian, mobile, email, reference..."
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
                <option value="all">All 8 Workflow Statuses</option>
                {OFFICIAL_STATUS_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {APPLICATION_STATUS_META[key].label}
                  </option>
                ))}
              </select>

              <select
                value={campusFilter}
                onChange={(e) => setCampusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Campuses / Venues</option>
                <option value="gayeshpur">Gayeshpur Campus</option>
                <option value="north24parganas">North 24 Parganas / Ichapore</option>
                <option value="krishnanagar">Krishnanagar Football School</option>
              </select>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Reference &amp; Pathway</th>
                    <th className="py-3 px-4">Player, DOB &amp; Age</th>
                    <th className="py-3 px-4">Guardian &amp; Contact</th>
                    <th className="py-3 px-4">Campus / Venue &amp; Position</th>
                    <th className="py-3 px-4">Application Status</th>
                    <th className="py-3 px-4">Internal Remarks &amp; Docs</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        {isLoading
                          ? 'Loading admission and trial applications...'
                          : 'No admission or trial applications match your current filter.'}
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((c) => {
                      const normStatus = normalizeApplicationStatus(c.status);
                      const statusMeta = APPLICATION_STATUS_META[normStatus];
                      const isTrial = c.applicationType === 'trial';
                      return (
                        <tr
                          key={c.id || c.bookingRef}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-slate-900">
                              {c.bookingRef}
                            </div>
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                                isTrial
                                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                                  : 'bg-slate-900 text-amber-400 border-slate-800'
                              }`}
                            >
                              {isTrial ? 'Trial Session' : 'Academy Admission'}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {c.playerPhotoUrl && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedPlayerForModal(c)}
                                  className="cursor-pointer focus:outline-none"
                                  title="View full player dossier and official trial pass"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={c.playerPhotoUrl}
                                    alt={c.playerName}
                                    className="w-8 h-8 rounded-full object-cover border border-amber-300 shrink-0 hover:scale-105 transition-transform"
                                  />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedPlayerForModal(c)}
                                className="text-left group cursor-pointer"
                                title="Click to view candidate complete profile, generate trial pass & send to WhatsApp"
                              >
                                <div className="font-black text-slate-900 group-hover:text-amber-600 group-hover:underline flex items-center gap-1.5">
                                  <span>{c.playerName}</span>
                                  <Ticket className="w-3.5 h-3.5 text-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  DOB: {c.dob}
                                  {c.age !== undefined ? ` (${c.age} yrs)` : ''} ·{' '}
                                  <span className="capitalize">{c.gender}</span>
                                </div>
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{c.parentName}</div>
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{c.phone}</span>
                            </div>
                            {c.email && (
                              <div className="text-[10px] text-slate-500 truncate max-w-[150px] flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{c.email}</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-amber-800 capitalize">
                              {c.preferredVenue || c.preferredCampus}
                            </div>
                            <div className="text-[10px] text-slate-500 capitalize">
                              {c.position} · {c.experienceLevel}
                            </div>
                            {c.scheduledTrialDetails?.date && (
                              <div className="text-[10px] font-mono text-indigo-700 mt-0.5">
                                Scheduled: {c.scheduledTrialDetails.date}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <select
                              value={normStatus}
                              onChange={(e) =>
                                handleStatusChange(
                                  c.bookingRef,
                                  e.target.value as ApplicationStatus,
                                  c
                                )
                              }
                              className={`text-[10px] font-bold font-mono uppercase px-2.5 py-1 rounded-lg border cursor-pointer outline-none ${statusMeta.badgeClass}`}
                            >
                              {OFFICIAL_STATUS_KEYS.map((key) => (
                                <option key={key} value={key}>
                                  {APPLICATION_STATUS_META[key].label}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="py-3 px-4">
                            {c.adminRemarks ? (
                              <div
                                className="text-[11px] text-slate-700 font-medium line-clamp-2 max-w-[200px]"
                                title={c.adminRemarks}
                              >
                                {c.adminRemarks}
                              </div>
                            ) : c.message ? (
                              <div
                                className="text-[11px] text-slate-500 line-clamp-2 max-w-[200px]"
                                title={c.message}
                              >
                                {c.message}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">
                                No remarks yet
                              </span>
                            )}
                            <div className="flex items-center gap-1.5 mt-1">
                              {c.supportingDocumentName && (
                                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 text-[9px] font-mono">
                                  Doc: {c.supportingDocumentName}
                                </span>
                              )}
                              {c.notificationLog && c.notificationLog.length > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[9px] font-mono">
                                  Notified ({c.notificationLog.length})
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedPlayerForModal(c)}
                                className="px-2.5 py-1.5 text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer text-[11px] font-bold inline-flex items-center gap-1 shadow-xs"
                                title="Open Player Profile, Official Trial Pass & WhatsApp Dispatch"
                              >
                                <Ticket className="w-3.5 h-3.5" />
                                <span>Trial Pass</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openApplicationReviewModal(c)}
                                className="px-2.5 py-1.5 text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors cursor-pointer text-[11px] font-bold inline-flex items-center gap-1"
                                title="Review Application, Schedule Trial & Notify Applicant"
                              >
                                <Eye className="w-3.5 h-3.5 text-amber-700" />
                                <span>Review</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteCandidate(c.bookingRef, c.playerName)
                                }
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
                      Admission &amp; Trial Schedule
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
                      <span className="text-slate-500">Available Slots</span>
                      <span className="font-bold text-slate-900">
                        {slot.slotsBooked} / {slot.slotsTotal} Booked
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (slot.slotsBooked / slot.slotsTotal) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2.5 italic">
                    Reporting Instructions: {slot.requirements}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => setEditingSlot(slot)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Edit Schedule / Slots</span>
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

      {/* Comprehensive Application Review, Trial Scheduling & Applicant Notification Modal */}
      {editingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 font-bold">
                    {editingCandidate.applicationType === 'trial'
                      ? 'Trial Session Application'
                      : 'Academy Admission Application'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {editingCandidate.bookingRef}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight mt-1">
                  Review Application: {editingCandidate.playerName}
                </h3>
              </div>
              <button
                onClick={() => setEditingCandidate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submitted Player & Guardian Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Player Details
                </span>
                <strong className="text-slate-900 block">
                  {editingCandidate.playerName} ({editingCandidate.gender})
                </strong>
                <span className="text-slate-600">
                  DOB: {editingCandidate.dob}{' '}
                  {editingCandidate.age !== undefined
                    ? `(${editingCandidate.age} yrs)`
                    : ''}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Parent / Guardian &amp; Contact
                </span>
                <strong className="text-slate-900 block">
                  {editingCandidate.parentName}
                </strong>
                <span className="text-slate-600 block">{editingCandidate.phone}</span>
                {editingCandidate.email && (
                  <span className="text-slate-500 text-[11px] block">
                    {editingCandidate.email}
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Position, Experience &amp; Address
                </span>
                <strong className="text-slate-900 capitalize block">
                  {editingCandidate.position} ({editingCandidate.experienceLevel})
                </strong>
                {editingCandidate.currentClubOrAcademy && (
                  <span className="text-slate-600 block">
                    Club: {editingCandidate.currentClubOrAcademy}
                  </span>
                )}
                {editingCandidate.location && (
                  <span className="text-slate-500 text-[11px] block">
                    Address: {editingCandidate.location}
                  </span>
                )}
              </div>

              {/* Uploaded Photo & Supporting Documents */}
              {(editingCandidate.playerPhotoUrl ||
                editingCandidate.supportingDocumentUrl ||
                editingCandidate.supportingDocumentName) && (
                <div className="sm:col-span-3 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-4">
                  {editingCandidate.playerPhotoUrl && (
                    <div className="flex items-center gap-2">
                      <img
                        src={editingCandidate.playerPhotoUrl}
                        alt={editingCandidate.playerName}
                        className="w-12 h-12 rounded-xl object-cover border border-amber-400"
                      />
                      <div>
                        <span className="text-[11px] font-bold text-slate-900 block">
                          Player Photograph
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {editingCandidate.playerPhotoName || 'Uploaded'}
                        </span>
                      </div>
                    </div>
                  )}
                  {(editingCandidate.supportingDocumentUrl ||
                    editingCandidate.supportingDocumentName) && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <div>
                        <span className="text-[11px] font-bold text-slate-900 block">
                          Supporting Document:{' '}
                          {editingCandidate.supportingDocumentName || 'Attached'}
                        </span>
                        {editingCandidate.supportingDocumentUrl && (
                          <a
                            href={editingCandidate.supportingDocumentUrl}
                            download={
                              editingCandidate.supportingDocumentName ||
                              'applicant-document'
                            }
                            className="text-[10px] font-bold text-indigo-700 hover:underline"
                          >
                            Download / Inspect Document
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4">
              {/* 1. Update Application Status */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  1. Application Workflow Status (8 Official Statuses)
                </label>
                <select
                  value={normalizeApplicationStatus(editingCandidate.status)}
                  onChange={(e) =>
                    setEditingCandidate({
                      ...editingCandidate,
                      status: e.target.value as ApplicationStatus,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                >
                  {OFFICIAL_STATUS_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {APPLICATION_STATUS_META[key].label} —{' '}
                      {APPLICATION_STATUS_META[key].description}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Trial Session Scheduling & Reporting Instructions */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>
                    2. Trial Session Schedule, Venue &amp; Reporting Instructions
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Trial Date
                    </label>
                    <input
                      type="text"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Trial Time
                    </label>
                    <input
                      type="text"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Trial Venue / Campus Ground
                    </label>
                    <input
                      type="text"
                      value={scheduleVenue}
                      onChange={(e) => setScheduleVenue(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Evaluator Coach
                    </label>
                    <input
                      type="text"
                      value={scheduleEvaluator}
                      onChange={(e) => setScheduleEvaluator(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Reporting Instructions for Applicant
                    </label>
                    <input
                      type="text"
                      value={reportingInstructions}
                      onChange={(e) => setReportingInstructions(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Internal Administrative Remarks */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  3. Internal Administrative Remarks &amp; Evaluation Notes
                </label>
                <textarea
                  rows={3}
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="Add internal administrative remarks, document verification notes, or coach evaluation summary..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 4. Notify Applicant */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={sendApplicantNotification}
                    onChange={(e) => setSendApplicantNotification(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Notify Applicant of Status &amp; Schedule Update
                    </span>
                    <span className="text-[11px] text-slate-600">
                      Sends status update &amp; trial reporting instructions to{' '}
                      {editingCandidate.phone}{' '}
                      {editingCandidate.email ? `/ ${editingCandidate.email}` : ''}
                    </span>
                  </div>
                </label>

                <div className="flex items-center gap-1.5">
                  <select
                    value={notificationChannel}
                    onChange={(e) =>
                      setNotificationChannel(e.target.value as 'email' | 'sms')
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 text-xs font-bold text-emerald-950"
                  >
                    <option value="sms">SMS / WhatsApp</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCandidate(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Status, Remarks &amp; Notify</span>
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
                Edit Admission / Trial Session Schedule
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
                  Campus / Venue Title
                </label>
                <input
                  type="text"
                  value={editingSlot.campusName}
                  onChange={(e) =>
                    setEditingSlot({ ...editingSlot, campusName: e.target.value })
                  }
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
                    onChange={(e) =>
                      setEditingSlot({ ...editingSlot, date: e.target.value })
                    }
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
                    onChange={(e) =>
                      setEditingSlot({ ...editingSlot, time: e.target.value })
                    }
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
                    onChange={(e) =>
                      setEditingSlot({ ...editingSlot, status: e.target.value as any })
                    }
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
                      setEditingSlot({
                        ...editingSlot,
                        slotsTotal: parseInt(e.target.value) || 0,
                      })
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
                      setEditingSlot({
                        ...editingSlot,
                        slotsBooked: parseInt(e.target.value) || 0,
                      })
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
                  onChange={(e) =>
                    setEditingSlot({ ...editingSlot, evaluatorCoach: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Reporting Instructions &amp; Requirements
                </label>
                <textarea
                  rows={2}
                  value={editingSlot.requirements}
                  onChange={(e) =>
                    setEditingSlot({ ...editingSlot, requirements: e.target.value })
                  }
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

      {/* Manual Application Creation Modal */}
      {isAddCandidateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-slate-900 tracking-tight">
                Record Player Admission / Trial Application
              </h3>
              <button
                onClick={() => setIsAddCandidateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCandidate} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Application Pathway
                </label>
                <select
                  value={newCandidateForm.applicationType}
                  onChange={(e) =>
                    setNewCandidateForm({
                      ...newCandidateForm,
                      applicationType: e.target.value as 'admission' | 'trial',
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="admission">Academy Admission Application</option>
                  <option value="trial">Trial Session Application</option>
                </select>
              </div>

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
                      setNewCandidateForm({
                        ...newCandidateForm,
                        playerName: e.target.value,
                      })
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
                      setNewCandidateForm({
                        ...newCandidateForm,
                        parentName: e.target.value,
                      })
                    }
                    placeholder="e.g. Pradip Roy"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Mobile Number *
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
                      setNewCandidateForm({
                        ...newCandidateForm,
                        preferredCampus: e.target.value,
                      })
                    }
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="gayeshpur">Gayeshpur Campus</option>
                    <option value="north24parganas">North 24 Parganas</option>
                    <option value="krishnanagar">Krishnanagar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Playing Position
                  </label>
                  <select
                    value={newCandidateForm.position}
                    onChange={(e) =>
                      setNewCandidateForm({
                        ...newCandidateForm,
                        position: e.target.value,
                      })
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
                  Initial Notes / Remarks
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
                  <span>Save Application</span>
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
            ? 'Delete Application Record'
            : 'Delete Schedule Slot'
        }
        message={
          deleteTarget?.type === 'candidate'
            ? 'Are you sure you want to permanently remove this player application? It will be removed from Supabase and local storage.'
            : 'Are you sure you want to remove this trial intake session from the schedule?'
        }
        itemName={deleteTarget?.name}
        confirmLabel={
          deleteTarget?.type === 'candidate' ? 'Delete Application' : 'Delete Slot'
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Bulk Send Trial Passes via WhatsApp Automation Modal */}
      {isBulkWhatsAppOpen && (
        <BulkSendTrialPassesModal
          isOpen={isBulkWhatsAppOpen}
          onClose={() => setIsBulkWhatsAppOpen(false)}
          candidates={filteredCandidates}
          onPassSent={(bookingRef) => {
            setCandidates((prev) =>
              prev.map((c) =>
                c.bookingRef === bookingRef
                  ? {
                      ...c,
                      notificationLog: [
                        ...(c.notificationLog || []),
                        {
                          id: `wa-bulk-${Date.now()}`,
                          sentAt: new Date().toISOString(),
                          channel: 'sms',
                          status: 'delivered',
                          message: 'Automated WhatsApp Trial Pass sent',
                        },
                      ],
                    }
                  : c
              )
            );
          }}
          onNotify={onNotify}
        />
      )}

      {/* Complete Player Profile Dossier & Official Trial Pass Modal */}
      {selectedPlayerForModal && (
        <PlayerProfileDetailModal
          candidate={selectedPlayerForModal}
          isOpen={Boolean(selectedPlayerForModal)}
          onClose={() => setSelectedPlayerForModal(null)}
          onUpdateTrialSchedule={async (details) => {
            if (!selectedPlayerForModal) return;
            const updated: AcademyRegistrationData = {
              ...selectedPlayerForModal,
              scheduledTrialDetails: {
                date: details.date,
                time: details.time,
                venue: details.venue,
                evaluator: details.evaluator,
                reportingInstructions: details.instructions,
              },
            };
            setSelectedPlayerForModal(updated);
            setCandidates((prev) =>
              prev.map((c) => (c.bookingRef === updated.bookingRef ? updated : c))
            );
            await updateRegistrationStatus(
              updated.bookingRef,
              updated.status || 'trial_scheduled',
              updated
            );
          }}
        />
      )}
    </div>
  );
};
