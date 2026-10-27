'use client';

import React, { useState } from 'react';
import {
  AcademyRegistrationData,
  APPLICATION_STATUS_META,
  normalizeApplicationStatus,
} from '@/lib/supabaseClient';
import { printElementInIsolatedIframe } from '@/lib/pdfDocumentGenerator';
import {
  X,
  Printer,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Copy,
  Check,
  Send,
  Download,
  Share2,
  ShieldCheck,
  Ticket,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

interface PlayerProfileDetailModalProps {
  candidate: AcademyRegistrationData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTrialSchedule?: (details: {
    date: string;
    time: string;
    venue: string;
    evaluator: string;
    instructions: string;
  }) => void;
}

export const PlayerProfileDetailModal: React.FC<PlayerProfileDetailModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onUpdateTrialSchedule,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'trial_pass'>('profile');
  const [copied, setCopied] = useState<boolean>(false);
  const [whatsAppDispatched, setWhatsAppDispatched] = useState<boolean>(false);
  const [whatsAppNotice, setWhatsAppNotice] = useState<string | null>(null);

  // Editable scheduled trial pass fields
  const [trialDate, setTrialDate] = useState<string>(() => {
    return (
      candidate?.scheduledTrialDetails?.date ||
      candidate?.preferredTrialDate ||
      'May 16, 2026'
    );
  });
  const [trialTime, setTrialTime] = useState<string>(() => {
    return candidate?.scheduledTrialDetails?.time || '07:30 AM – 09:30 AM';
  });
  const [trialVenue, setTrialVenue] = useState<string>(() => {
    const campus = candidate?.preferredVenue || candidate?.preferredCampus;
    if (campus === 'north24parganas') return 'North 24 Parganas Ground, Ichapore';
    if (campus === 'krishnanagar') return 'Krishnanagar Football School Ground, Nadia';
    return candidate?.scheduledTrialDetails?.venue || 'Central Ground Complex, Gayeshpur, Nadia';
  });
  const [evaluatorCoach, setEvaluatorCoach] = useState<string>(() => {
    return candidate?.scheduledTrialDetails?.evaluator || 'Coach Bapi Roy (AFC ‘B’ License)';
  });
  const [reportingInstructions, setReportingInstructions] = useState<string>(() => {
    return (
      candidate?.scheduledTrialDetails?.reportingInstructions ||
      'Report 30 minutes prior in standard athletic kit with football boots, shin guards, water bottle, and original age proof.'
    );
  });

  if (!isOpen || !candidate) return null;

  const normStatus = normalizeApplicationStatus(candidate.status);
  const statusMeta = APPLICATION_STATUS_META[normStatus];
  const isTrial = candidate.applicationType === 'trial';

  // Format phone number for WhatsApp (clean country code)
  const rawPhone = candidate.phone || '';
  const digitsOnly = rawPhone.replace(/\D/g, '');
  const cleanPhone = digitsOnly.startsWith('91') && digitsOnly.length === 12
    ? digitsOnly
    : digitsOnly.length === 10
    ? `91${digitsOnly}`
    : digitsOnly;

  // Build formatted WhatsApp message
  const generateWhatsAppMessage = () => {
    return `⚽ *MADEN FOOTBALL ACADEMY FOUNDATION*
*OFFICIAL CANDIDATE TRIAL PASS & ENTRY PERMIT*

Dear ${candidate.parentName || candidate.playerName},
Greetings from the Technical & Foundation Directorate!

Your trial registration has been approved. Please find the official Trial Session Pass details below:

📋 *Pass Reference:* ${candidate.bookingRef}
👤 *Candidate Name:* ${candidate.playerName}
🎂 *Date of Birth:* ${candidate.dob} ${candidate.age ? `(Age: ${candidate.age} yrs)` : ''}
⚽ *Preferred Position:* ${candidate.position ? candidate.position.toUpperCase() : 'ALL-ROUND'}
🏟️ *Trial Venue:* ${trialVenue}
📅 *Trial Date:* ${trialDate}
⏰ *Reporting Time:* ${trialTime}
🏅 *Evaluator Coach:* ${evaluatorCoach}

📌 *Mandatory Reporting Checklist:*
1. Standard football boots (studs/turf) & shin guards with long football socks.
2. Personal water bottle / hydration.
3. Original Age Proof Document (Aadhaar Card / Official Birth Certificate).
4. Report 30 minutes prior to session at the registration desk.

📍 *Ground Location:* Central Ground Complex, Gayeshpur / Kalyani, Nadia, West Bengal - 741234
📞 *Helpline:* +91 98302 45891 | ✉️ foundation@madenfaf.in

Please present this message or your printed Trial Pass at the entry checkpoint. Best of luck!`;
  };

  const handleSendWhatsApp = () => {
    if (!cleanPhone) {
      setWhatsAppNotice('Candidate has no registered mobile number on record.');
      setTimeout(() => setWhatsAppNotice(null), 3500);
      return;
    }
    const message = generateWhatsAppMessage();
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    
    // Safely open in new tab via link anchor
    if (typeof window !== 'undefined') {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setWhatsAppDispatched(true);
    setWhatsAppNotice(`Trial pass invitation launched for +${cleanPhone}`);
    setTimeout(() => {
      setWhatsAppDispatched(false);
      setWhatsAppNotice(null);
    }, 5000);
  };

  const handleCopyWhatsAppText = () => {
    const text = generateWhatsAppMessage();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrintDossier = () => {
    printElementInIsolatedIframe(
      'player-dossier-print-container',
      `MADEN-FAF-Player-Dossier-${candidate.bookingRef}`
    );
  };

  const handlePrintTrialPass = () => {
    printElementInIsolatedIframe(
      'trial-pass-print-container',
      `MADEN-FAF-Official-Trial-Pass-${candidate.bookingRef}`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                  {isTrial ? 'Trial Session Registration' : 'Academy Admission Registration'}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {candidate.bookingRef}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 leading-snug">
                {candidate.playerName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="inline-flex p-1 bg-slate-800 rounded-xl text-xs font-semibold mr-2">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'profile'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Player Profile</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('trial_pass')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'trial_pass'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Official Trial Pass</span>
              </button>
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
        </div>

        {/* Modal Action Strip */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-600">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusMeta.badgeClass}`}
            >
              {statusMeta.label}
            </span>
            <span>·</span>
            <span className="font-mono text-slate-900 font-semibold">
              DOB: {candidate.dob} {candidate.age ? `(${candidate.age} yrs)` : ''}
            </span>
            <span>·</span>
            <span className="capitalize font-semibold text-slate-800">
              Position: {candidate.position}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* WhatsApp Send Button */}
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title={`Send official trial pass to WhatsApp (+${cleanPhone})`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send to WhatsApp (+{cleanPhone || 'Registered'})</span>
            </button>

            {activeTab === 'profile' ? (
              <button
                type="button"
                onClick={handlePrintDossier}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Print Player Dossier (PDF)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePrintTrialPass}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Generate Official PDF Pass</span>
              </button>
            )}
          </div>
        </div>

        {whatsAppNotice && (
          <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{whatsAppNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setWhatsAppNotice(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* WhatsApp Dispatch Success Banner */}
        {whatsAppDispatched && (
          <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Web/App opened with the pre-formatted Trial Pass for +{cleanPhone}.</span>
            </span>
            <button
              type="button"
              onClick={() => setWhatsAppDispatched(false)}
              className="text-emerald-700 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ============================================================== */}
          {/* TAB 1: PLAYER COMPLETE PROFILE DOSSIER                         */}
          {/* ============================================================== */}
          {activeTab === 'profile' && (
            <div id="player-dossier-print-container" className="space-y-6">
              {/* Printable Header */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-2xl overflow-hidden border border-amber-400/30 shrink-0">
                    {candidate.playerPhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={candidate.playerPhotoUrl}
                        alt={candidate.playerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      candidate.playerName.charAt(0) || 'P'
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-white">
                      {candidate.playerName}
                    </h3>
                    <div className="text-xs text-slate-300 font-mono flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-amber-400 font-bold">{candidate.bookingRef}</span>
                      <span>·</span>
                      <span className="capitalize">{candidate.gender}</span>
                      <span>·</span>
                      <span>DOB: {candidate.dob} {candidate.age ? `(${candidate.age} yrs)` : ''}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right sm:self-center font-mono text-xs">
                  <div className="text-slate-400 text-[10px] uppercase">Application Pathway</div>
                  <div className="text-base font-bold text-amber-400">
                    {isTrial ? 'Trial Session Assessment' : 'Academy Full Admission'}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {candidate.program ? candidate.program.toUpperCase() : 'DEVELOPMENT SQUAD'}
                  </div>
                </div>
              </div>

              {/* 2-Column Detail Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. Player Athletic & Playing Details */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Trophy className="w-4 h-4 text-amber-600" />
                    <span>1. Athletic &amp; Playing Profile</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Player Name:</span>
                    <span className="col-span-2 font-semibold text-slate-900">{candidate.playerName}</span>

                    <span className="text-slate-500">Playing Position:</span>
                    <span className="col-span-2 font-semibold capitalize text-indigo-700">{candidate.position}</span>

                    <span className="text-slate-500">Date of Birth:</span>
                    <span className="col-span-2 font-mono text-slate-900">{candidate.dob}</span>

                    <span className="text-slate-500">Gender / Age:</span>
                    <span className="col-span-2 capitalize text-slate-900">
                      {candidate.gender} {candidate.age ? `(${candidate.age} yrs)` : ''}
                    </span>

                    <span className="text-slate-500">Experience Level:</span>
                    <span className="col-span-2 capitalize text-slate-900">{candidate.experienceLevel}</span>

                    <span className="text-slate-500">Club / School Team:</span>
                    <span className="col-span-2 text-slate-900">{candidate.currentClubOrAcademy || 'Local School / Community'}</span>
                  </div>
                </div>

                {/* 2. Guardian & Contact Details */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>2. Guardian &amp; Registered Channels</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Parent / Guardian:</span>
                    <span className="col-span-2 font-semibold text-slate-900">{candidate.parentName}</span>

                    <span className="text-slate-500">Registered Phone:</span>
                    <span className="col-span-2 font-mono font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{candidate.phone}</span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                        WhatsApp Active
                      </span>
                    </span>

                    <span className="text-slate-500">Email Address:</span>
                    <span className="col-span-2 text-slate-900 truncate">{candidate.email || '—'}</span>

                    <span className="text-slate-500">Residential Address:</span>
                    <span className="col-span-2 text-slate-900">{candidate.location || 'Nadia District, West Bengal'}</span>

                    <span className="text-slate-500">Minor Consent:</span>
                    <span className="col-span-2 text-emerald-700 font-semibold">
                      Confirmed by Parent / Guardian
                    </span>
                  </div>
                </div>

                {/* 3. Academy Pathway & Venue Selection */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span>3. Academy Campus &amp; Program Choice</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Preferred Campus:</span>
                    <span className="col-span-2 font-semibold capitalize text-slate-900">
                      {candidate.preferredVenue || candidate.preferredCampus}
                    </span>

                    <span className="text-slate-500">Squad Program:</span>
                    <span className="col-span-2 font-semibold uppercase text-amber-800">
                      {candidate.program}
                    </span>

                    <span className="text-slate-500">Preferred Date:</span>
                    <span className="col-span-2 font-mono text-slate-900">
                      {candidate.preferredTrialDate || trialDate}
                    </span>

                    <span className="text-slate-500">Application Date:</span>
                    <span className="col-span-2 font-mono text-slate-700">
                      {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString('en-IN') : '2026-04-10'}
                    </span>
                  </div>
                </div>

                {/* 4. Evaluator Remarks & Scheduled Session */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>4. Scheduled Trial Assessment Details</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Trial Date:</span>
                    <span className="col-span-2 font-mono font-bold text-slate-900">{trialDate}</span>

                    <span className="text-slate-500">Reporting Time:</span>
                    <span className="col-span-2 font-mono text-slate-900">{trialTime}</span>

                    <span className="text-slate-500">Pitch Venue:</span>
                    <span className="col-span-2 text-slate-900">{trialVenue}</span>

                    <span className="text-slate-500">Evaluator Coach:</span>
                    <span className="col-span-2 font-semibold text-slate-900">{evaluatorCoach}</span>

                    <span className="text-slate-500">Admin Remarks:</span>
                    <span className="col-span-2 text-slate-700 italic">
                      {candidate.adminRemarks || candidate.message || 'Candidate scheduled for formal assessment.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Banner to Switch to Trial Pass */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-amber-950">
                  <Ticket className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-bold">Official Trial Entry Pass Ready</div>
                    <p className="text-amber-800">
                      View or print the candidate&apos;s trial pass, or dispatch it directly to their registered WhatsApp number.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('trial_pass')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shrink-0 transition-colors"
                >
                  View Official Trial Pass
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: OFFICIAL CANDIDATE TRIAL PASS & WHATSAPP DISPATCH       */}
          {/* ============================================================== */}
          {activeTab === 'trial_pass' && (
            <div className="space-y-6">
              {/* Pass Management Controls */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-amber-600" />
                    <span>Official Candidate Trial Pass Generator</span>
                  </div>
                  <p className="text-slate-500">
                    Print this pass for official academy records, or send the trial invite directly to the candidate&apos;s registered WhatsApp number.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send to WhatsApp (+{cleanPhone})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyWhatsAppText}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied Invitation!' : 'Copy Text'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintTrialPass}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Print Official Pass (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Editable Trial Schedule Controls Bar */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3 text-xs">
                <div className="font-bold text-indigo-950 uppercase tracking-wide flex items-center justify-between">
                  <span>Customize Trial Pass Session Details:</span>
                  <span className="text-[10px] font-mono text-indigo-700">Live-Syncs on Pass</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Trial Date</label>
                    <input
                      type="text"
                      value={trialDate}
                      onChange={(e) => setTrialDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Reporting Time</label>
                    <input
                      type="text"
                      value={trialTime}
                      onChange={(e) => setTrialTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Venue / Ground</label>
                    <input
                      type="text"
                      value={trialVenue}
                      onChange={(e) => setTrialVenue(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Lead Evaluator</label>
                    <input
                      type="text"
                      value={evaluatorCoach}
                      onChange={(e) => setEvaluatorCoach(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* ============================================================== */}
              {/* OFFICIAL TRIAL PASS DOCUMENT (PRINTABLE CONTAINER)              */}
              {/* ============================================================== */}
              <div
                id="trial-pass-print-container"
                className="max-w-2xl mx-auto bg-white rounded-3xl border-4 border-slate-900 p-6 sm:p-8 shadow-xl text-slate-900 space-y-6 relative overflow-hidden"
              >
                {/* Official Header Strip */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-16 rounded-full bg-slate-950 p-1 border-2 border-amber-400 shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/maden-faf-official-logo.png"
                        alt="MADEN FAF Official Identity"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-bold">
                        MADEN FOOTBALL ACADEMY FOUNDATION
                      </div>
                      <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950">
                        Official Candidate Trial Pass
                      </h1>
                      <div className="text-xs text-slate-500 font-medium">
                        Technical Directorate · Intake &amp; Scouting Assessment
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-3 py-1 rounded-full bg-slate-950 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider inline-block">
                      ENTRY PERMIT
                    </span>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      Pass Ref: <span className="font-bold text-slate-900">{candidate.bookingRef}</span>
                    </div>
                  </div>
                </div>

                {/* Candidate & Assessment Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  {/* Photo & Barcode Column */}
                  <div className="sm:col-span-4 flex flex-col items-center text-center space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="w-24 h-28 rounded-xl bg-slate-800 border-2 border-amber-500 overflow-hidden flex items-center justify-center text-amber-400 font-bold text-2xl shadow-inner">
                      {candidate.playerPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={candidate.playerPhotoUrl}
                          alt={candidate.playerName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        candidate.playerName.charAt(0) || 'P'
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-900">{candidate.playerName}</div>
                    <div className="text-[10px] font-mono text-slate-500">
                      DOB: {candidate.dob}
                    </div>

                    {/* Barcode Graphic Simulation */}
                    <div className="w-full pt-1 border-t border-slate-200 font-mono text-[9px] text-slate-400 tracking-widest uppercase">
                      ||| | |||| | ||||| || |
                      <div className="text-[8px] text-slate-500">{candidate.bookingRef}</div>
                    </div>
                  </div>

                  {/* Candidate Details & Scheduled Session Column */}
                  <div className="sm:col-span-8 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-amber-900 block">Playing Position:</span>
                        <span className="font-bold text-slate-950 uppercase">{candidate.position || 'Forward / Midfield'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-amber-900 block">Age Category:</span>
                        <span className="font-bold text-slate-950">{candidate.age ? `U-${candidate.age + 1} Squad` : 'Youth Squad'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-amber-900 block">Parent / Guardian:</span>
                        <span className="font-semibold text-slate-900">{candidate.parentName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-amber-900 block">Registered Mobile:</span>
                        <span className="font-mono font-bold text-slate-900">{candidate.phone}</span>
                      </div>
                    </div>

                    {/* Session Specifics Box */}
                    <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-1.5 font-mono text-[11px]">
                      <div className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                        ★ SCHEDULED TRIAL SESSION DETAILS:
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Date:</span>
                        <span className="font-bold text-white">{trialDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Reporting Time:</span>
                        <span className="font-bold text-amber-300">{trialTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Pitch Venue:</span>
                        <span className="font-bold text-white truncate max-w-[240px]">{trialVenue}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Lead Evaluator:</span>
                        <span className="font-bold text-emerald-300">{evaluatorCoach}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mandatory Candidate Reporting Instructions & Checklist */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Mandatory Candidate Reporting Checklist</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                      <span>Football boots (moulded studs or turf)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                      <span>Shin guards &amp; athletic football socks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                      <span>Original Age Proof (Aadhaar / Birth Cert)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">4</span>
                      <span>Report 30 mins prior to scheduled time</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200">
                    Instructions: {reportingInstructions}
                  </p>
                </div>

                {/* Signatures & Security Verification Stamp */}
                <div className="grid grid-cols-3 gap-4 pt-3 border-t-2 border-slate-900 text-center text-xs">
                  <div>
                    <div className="font-serif italic font-bold text-slate-900 text-sm">
                      Director Ghosh
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-500 border-t border-slate-300 pt-1 mt-1 font-mono">
                      Director of Youth Football
                    </div>
                  </div>

                  <div>
                    <div className="w-14 h-14 mx-auto rounded-full border-2 border-dashed border-amber-600/70 flex items-center justify-center text-amber-700 font-mono text-[9px] font-bold rotate-12">
                      MADEN FAF<br />OFFICIAL SEAL
                    </div>
                  </div>

                  <div>
                    <div className="h-6 flex items-center justify-center font-mono text-[10px] text-slate-400">
                      [ Gate Verification ]
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-500 border-t border-slate-300 pt-1 mt-1 font-mono">
                      Campus Security Stamp
                    </div>
                  </div>
                </div>

                {/* Verification Notice */}
                <div className="text-center text-[10px] text-slate-400 font-mono pt-1">
                  MADEN Football Academy Foundation · Reg: WB-NAD-FAF-2023-SECTION8 · Helpline: +91 98302 45891
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
