'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  AcademyRegistrationData,
  updateRegistrationStatus,
  ApplicantNotificationLog,
} from '@/lib/supabaseClient';
import {
  X,
  MessageSquare,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  User,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Send,
  Ticket,
} from 'lucide-react';

interface BulkSendTrialPassesModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: AcademyRegistrationData[];
  onPassSent?: (candidateBookingRef: string) => void;
  onNotify?: (msg: { type: 'success' | 'error'; text: string }) => void;
}

interface DispatchItem {
  candidate: AcademyRegistrationData;
  cleanPhone: string;
  hasValidPhone: boolean;
  status: 'pending' | 'processing' | 'dispatched' | 'skipped' | 'failed';
  dispatchedAt?: string;
  error?: string;
}

export const BulkSendTrialPassesModal: React.FC<BulkSendTrialPassesModalProps> = ({
  isOpen,
  onClose,
  candidates,
  onPassSent,
  onNotify,
}) => {
  // Batch session defaults
  const [batchDate, setBatchDate] = useState<string>('May 16, 2026');
  const [batchTime, setBatchTime] = useState<string>('07:30 AM – 09:30 AM');
  const [batchVenue, setBatchVenue] = useState<string>(
    'Central Ground Complex, Gayeshpur / Kalyani, Nadia, West Bengal - 741234'
  );
  const [batchEvaluator, setBatchEvaluator] = useState<string>(
    'Coach Bapi Roy (AFC ‘B’ License)'
  );
  const [batchInstructions, setBatchInstructions] = useState<string>(
    'Report 30 minutes prior in standard athletic kit with football boots, shin guards, water bottle, and original age proof document.'
  );

  // Queue state initialized directly from filtered candidates
  const [queue, setQueue] = useState<DispatchItem[]>(() => {
    return candidates.map((c) => {
      const rawPhone = c.phone || '';
      const digitsOnly = rawPhone.replace(/\D/g, '');
      const cleanPhone =
        digitsOnly.startsWith('91') && digitsOnly.length === 12
          ? digitsOnly
          : digitsOnly.length === 10
          ? `91${digitsOnly}`
          : digitsOnly;

      const hasValidPhone = cleanPhone.length >= 10;

      return {
        candidate: c,
        cleanPhone,
        hasValidPhone,
        status: hasValidPhone ? 'pending' : 'skipped',
        error: hasValidPhone ? undefined : 'No registered mobile number',
      };
    });
  });
  const [isAutomating, setIsAutomating] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [intervalMs, setIntervalMs] = useState<number>(1500);
  const [copiedBatch, setCopiedBatch] = useState<boolean>(false);
  const [copiedPhones, setCopiedPhones] = useState<boolean>(false);

  const isAutomatingRef = useRef<boolean>(false);

  useEffect(() => {
    isAutomatingRef.current = isAutomating;
  }, [isAutomating]);

  if (!isOpen) return null;

  // Format WhatsApp Message for a candidate
  const buildWhatsAppMessage = (item: DispatchItem): string => {
    const c = item.candidate;
    const date = c.scheduledTrialDetails?.date || c.preferredTrialDate || batchDate;
    const time = c.scheduledTrialDetails?.time || batchTime;
    const venue =
      c.scheduledTrialDetails?.venue || c.preferredVenue || c.preferredCampus || batchVenue;
    const evaluator = c.scheduledTrialDetails?.evaluator || batchEvaluator;
    const instructions =
      c.scheduledTrialDetails?.reportingInstructions || batchInstructions;

    return `⚽ *MADEN FOOTBALL ACADEMY FOUNDATION*\n*OFFICIAL CANDIDATE TRIAL PASS & ENTRY PERMIT*\n\nDear ${c.parentName || c.playerName},\nGreetings from the Technical & Foundation Directorate!\n\nYour trial registration has been approved. Please find the official Trial Session Pass details below:\n\n📋 *Pass Reference:* ${c.bookingRef}\n👤 *Candidate Name:* ${c.playerName}\n🎂 *Date of Birth:* ${c.dob} ${c.age ? `(Age: ${c.age} yrs)` : ''}\n⚽ *Preferred Position:* ${c.position ? c.position.toUpperCase() : 'ALL-ROUND'}\n🏟️ *Trial Venue:* ${venue}\n📅 *Trial Date:* ${date}\n⏰ *Reporting Time:* ${time}\n🏅 *Evaluator Coach:* ${evaluator}\n\n📌 *Mandatory Reporting Checklist:*\n1. Standard football boots (studs/turf) & shin guards with long football socks.\n2. Personal water bottle / hydration.\n3. Original Age Proof Document (Aadhaar Card / Official Birth Certificate).\n4. Report 30 minutes prior to session at registration desk.\n\n📝 *Instructions:* ${instructions}\n📍 *Ground:* ${venue}\n📞 *Helpline:* +91 98302 45891 | ✉️ foundation@madenfaf.in\n\nPlease present this message or your printed Trial Pass at the entry checkpoint. Best of luck!`;
  };

  // Launch a single WhatsApp link in browser safely
  const dispatchSingleCandidate = async (index: number) => {
    const item = queue[index];
    if (!item || !item.hasValidPhone) return;

    setQueue((prev) =>
      prev.map((it, i) => (i === index ? { ...it, status: 'processing' } : it))
    );

    const message = buildWhatsAppMessage(item);
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${item.cleanPhone}?text=${encoded}`;

    if (typeof window !== 'undefined') {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    const nowIso = new Date().toISOString();
    const newLog: ApplicantNotificationLog = {
      id: `wa-bulk-${Date.now()}-${index}`,
      sentAt: nowIso,
      channel: 'sms',
      status: 'delivered',
      message: `Automated WhatsApp Trial Pass sent for session on ${batchDate}`,
    };

    const updatedCandidate: AcademyRegistrationData = {
      ...item.candidate,
      notificationLog: [...(item.candidate.notificationLog || []), newLog],
      scheduledTrialDetails: {
        date: item.candidate.scheduledTrialDetails?.date || batchDate,
        time: item.candidate.scheduledTrialDetails?.time || batchTime,
        venue: item.candidate.scheduledTrialDetails?.venue || batchVenue,
        evaluator: item.candidate.scheduledTrialDetails?.evaluator || batchEvaluator,
        reportingInstructions:
          item.candidate.scheduledTrialDetails?.reportingInstructions || batchInstructions,
      },
    };

    try {
      await updateRegistrationStatus(
        item.candidate.bookingRef,
        item.candidate.status || 'trial_scheduled',
        updatedCandidate
      );
    } catch (e) {
      console.warn('Could not update candidate notification log in cloud:', e);
    }

    if (onPassSent) {
      onPassSent(item.candidate.bookingRef);
    }

    setQueue((prev) =>
      prev.map((it, i) =>
        i === index
          ? {
              ...it,
              status: 'dispatched',
              dispatchedAt: new Date().toLocaleTimeString(),
              candidate: updatedCandidate,
            }
          : it
      )
    );
  };

  // Automated Sequential Iterator Runner
  const startAutomation = async () => {
    if (isAutomating) return;

    setIsAutomating(true);
    let idx = currentIndex;

    while (idx < queue.length) {
      if (!isAutomatingRef.current) break;

      const item = queue[idx];
      if (item && item.status === 'pending' && item.hasValidPhone) {
        setCurrentIndex(idx);
        await dispatchSingleCandidate(idx);
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }

      idx++;
      setCurrentIndex(idx);
    }

    setIsAutomating(false);
    if (onNotify) {
      onNotify({
        type: 'success',
        text: `Bulk WhatsApp trial pass dispatch automation finished!`,
      });
    }
  };

  const pauseAutomation = () => {
    setIsAutomating(false);
  };

  const resetAutomation = () => {
    setIsAutomating(false);
    setCurrentIndex(0);
    setQueue((prev) =>
      prev.map((it) => ({
        ...it,
        status: it.hasValidPhone ? 'pending' : 'skipped',
        dispatchedAt: undefined,
      }))
    );
  };

  const handleCopyAllInvitations = () => {
    const allTexts = queue
      .filter((it) => it.hasValidPhone)
      .map((it) => buildWhatsAppMessage(it))
      .join('\n\n========================================\n\n');

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(allTexts);
      setCopiedBatch(true);
      setTimeout(() => setCopiedBatch(false), 2500);
    }
  };

  const handleCopyPhoneNumbers = () => {
    const phones = queue
      .filter((it) => it.hasValidPhone)
      .map((it) => it.cleanPhone)
      .join(', ');

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(phones);
      setCopiedPhones(true);
      setTimeout(() => setCopiedPhones(false), 2500);
    }
  };

  const totalValid = queue.filter((q) => q.hasValidPhone).length;
  const dispatchedCount = queue.filter((q) => q.status === 'dispatched').length;
  const progressPercent = totalValid > 0 ? Math.round((dispatchedCount / totalValid) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Bulk WhatsApp Automation
                </span>
                <span className="text-xs text-slate-400">· Filtered Batch</span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase mt-0.5">
                Bulk Send Trial Passes to Candidates
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status & Progress Summary Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 shrink-0 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div>
              <span className="font-bold text-slate-900">{queue.length}</span>{' '}
              <span className="text-slate-500">Total Filtered</span>
            </div>
            <span>·</span>
            <div>
              <span className="font-bold text-emerald-700">{totalValid}</span>{' '}
              <span className="text-slate-500">With Valid WhatsApp</span>
            </div>
            <span>·</span>
            <div>
              <span className="font-bold text-indigo-700">{dispatchedCount}</span>{' '}
              <span className="text-slate-500">Dispatched</span>
            </div>
            {queue.length - totalValid > 0 && (
              <>
                <span>·</span>
                <div className="text-amber-700 font-semibold">
                  {queue.length - totalValid} Missing Numbers (Skipped)
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyPhoneNumbers}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
              title="Copy all candidate mobile numbers"
            >
              {copiedPhones ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{copiedPhones ? 'Copied Numbers!' : 'Copy Numbers'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyAllInvitations}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
              title="Copy all formatted invitation texts"
            >
              {copiedBatch ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{copiedBatch ? 'Copied Batch Text!' : 'Copy All Invitations'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 shrink-0">
          <div
            className="bg-emerald-500 h-2 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Automation Control Panel */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-950 font-black text-sm uppercase">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>Automated WhatsApp Dispatch Runner</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Automatically opens candidate chat with pre-filled official Trial Pass &amp; reporting instructions one by one.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 mr-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Pacing:</span>
                <select
                  value={intervalMs}
                  onChange={(e) => setIntervalMs(Number(e.target.value))}
                  disabled={isAutomating}
                  className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                >
                  <option value={1000}>1.0s / player</option>
                  <option value={1500}>1.5s / player</option>
                  <option value={2000}>2.0s / player</option>
                  <option value={3000}>3.0s / player</option>
                </select>
              </div>

              {!isAutomating ? (
                <button
                  type="button"
                  onClick={startAutomation}
                  disabled={totalValid === 0 || dispatchedCount === totalValid}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>
                    {dispatchedCount > 0 && dispatchedCount < totalValid
                      ? 'Resume Automation'
                      : 'Start Bulk Dispatch'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pauseAutomation}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Pause className="w-4 h-4 fill-slate-950" />
                  <span>Pause Automation</span>
                </button>
              )}

              <button
                type="button"
                onClick={resetAutomation}
                disabled={isAutomating || dispatchedCount === 0}
                className="p-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 text-slate-700 cursor-pointer"
                title="Reset dispatch progress"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Session Preset Configuration */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-amber-600" />
                <span>Session Preset for This Batch</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 lowercase">
                applied unless player has custom schedule
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                  Trial Date
                </label>
                <input
                  type="text"
                  value={batchDate}
                  onChange={(e) => setBatchDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                  Reporting Time
                </label>
                <input
                  type="text"
                  value={batchTime}
                  onChange={(e) => setBatchTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                  Evaluator Coach
                </label>
                <input
                  type="text"
                  value={batchEvaluator}
                  onChange={(e) => setBatchEvaluator(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                  Pitch Venue
                </label>
                <input
                  type="text"
                  value={batchVenue}
                  onChange={(e) => setBatchVenue(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Candidate Queue Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Candidate Dispatch Queue ({queue.length} Candidates)</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Click Send to trigger WhatsApp individually or use the runner above
              </span>
            </div>

            <div className="overflow-x-auto max-h-[380px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-600 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Candidate &amp; Booking Ref</th>
                    <th className="py-2.5 px-3">Guardian</th>
                    <th className="py-2.5 px-3">Registered WhatsApp</th>
                    <th className="py-2.5 px-3">Pathway &amp; Position</th>
                    <th className="py-2.5 px-3">Dispatch Status</th>
                    <th className="py-2.5 px-3 text-right">Trigger Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queue.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No candidates match current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    queue.map((item, index) => {
                      const c = item.candidate;
                      const isCurrent = isAutomating && currentIndex === index;

                      return (
                        <tr
                          key={c.bookingRef}
                          className={`transition-colors ${
                            isCurrent
                              ? 'bg-emerald-50/80 font-medium'
                              : item.status === 'dispatched'
                              ? 'bg-slate-50/60'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3 px-3 font-mono text-slate-400">
                            {index + 1}
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{c.playerName}</div>
                            <div className="text-[10px] font-mono text-slate-500">
                              Ref: {c.bookingRef} · DOB: {c.dob}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-slate-700">
                            <div>{c.parentName}</div>
                          </td>

                          <td className="py-3 px-3 font-mono">
                            {item.hasValidPhone ? (
                              <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <span>+{item.cleanPhone}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-rose-600 font-semibold">
                                No mobile number
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 capitalize text-slate-700">
                            <div className="font-medium">{c.position}</div>
                            <div className="text-[10px] text-amber-800 uppercase font-mono">
                              {c.applicationType === 'trial' ? 'Trial Session' : 'Admission'}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            {item.status === 'dispatched' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Dispatched {item.dispatchedAt ? `(${item.dispatchedAt})` : ''}</span>
                              </span>
                            ) : item.status === 'processing' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Dispatching...</span>
                              </span>
                            ) : item.status === 'skipped' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                                <AlertCircle className="w-3 h-3 text-rose-600" />
                                <span>Skipped (No Phone)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200">
                                Pending
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => dispatchSingleCandidate(index)}
                              disabled={!item.hasValidPhone || isAutomating}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                              title="Send WhatsApp trial pass directly to candidate"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{item.status === 'dispatched' ? 'Resend' : 'Send'}</span>
                            </button>
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

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between text-xs">
          <div className="text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Authorized Administrator WhatsApp Dispatch Controller · Live Synced</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
