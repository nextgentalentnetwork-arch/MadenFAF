'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  getRegistrations,
  AcademyRegistrationData,
  APPLICATION_STATUS_META,
  normalizeApplicationStatus,
} from '@/lib/supabaseClient';
import { printElementInIsolatedIframe } from '@/lib/pdfDocumentGenerator';
import {
  ArrowLeft,
  Printer,
  Share2,
  Send,
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Award,
  Ticket,
  Copy,
  Check,
  Trophy,
} from 'lucide-react';

const FALLBACK_CANDIDATE: AcademyRegistrationData = {
  id: 'reg-demo-001',
  bookingRef: 'MADEN-2026-TR889',
  playerName: 'Arjun Dasgupta',
  dob: '2012-05-14',
  gender: 'male',
  parentName: 'Subir Dasgupta',
  phone: '+91 98301 23456',
  email: 'subir.dasgupta@gmail.com',
  location: 'Kalyani, Nadia',
  preferredCampus: 'Gayeshpur Flagship Campus',
  position: 'Attacking Midfielder (CAM)',
  experienceLevel: 'District Youth League (2 Years)',
  currentClubOrAcademy: 'Kalyani Sub-Junior Academy',
  program: 'Youth Development Phase (U11-U13)',
  preferredVenue: 'Pitch 1 — Central Grass Ground',
  scheduledTrialDetails: {
    date: 'Saturday, November 14, 2026',
    time: '7:30 AM – 9:45 AM',
    venue: 'Gayeshpur Flagship Campus (Pitch 1)',
    reportingInstructions: 'Report to Coach Anirban at Technical Dugout A in full football kit. Bring moulded boots, shin pads, and birth certificate photocopy.',
    evaluator: 'Coach Anirban Bhattacharya (AFC ‘C’ Licensed)',
  },
  status: 'trial_scheduled',
  createdAt: '2026-10-18T10:30:00Z',
};

export default function PlayerStandaloneDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const playerId = decodeURIComponent(resolvedParams.id);

  const [candidate, setCandidate] = useState<AcademyRegistrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [whatsAppNotice, setWhatsAppNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadCandidate() {
      try {
        const registrations = await getRegistrations();
        const found = registrations.find(
          (r) =>
            r.id === playerId ||
            r.bookingRef?.toLowerCase() === playerId.toLowerCase() ||
            r.playerName?.toLowerCase().replace(/\s+/g, '-') === playerId.toLowerCase()
        );
        if (found) {
          setCandidate(found);
        } else if (registrations.length > 0 && playerId === 'sample') {
          setCandidate(registrations[0]);
        } else {
          setCandidate({ ...FALLBACK_CANDIDATE, bookingRef: playerId.toUpperCase() });
        }
      } catch {
        setCandidate(FALLBACK_CANDIDATE);
      } finally {
        setLoading(false);
      }
    }
    loadCandidate();
  }, [playerId]);

  if (loading || !candidate) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading Candidate Dossier & Trial Pass...</p>
        </div>
      </div>
    );
  }

  const statusMeta = APPLICATION_STATUS_META[normalizeApplicationStatus(candidate.status)];
  const schedule = candidate.scheduledTrialDetails || FALLBACK_CANDIDATE.scheduledTrialDetails!;

  const handlePrint = () => {
    printElementInIsolatedIframe('printable-trial-pass', `MADEN_Trial_Pass_${candidate.bookingRef}`);
  };

  const handleSendWhatsApp = () => {
    const rawPhone = (candidate.phone || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.startsWith('91') && rawPhone.length === 12
      ? rawPhone
      : rawPhone.length === 10
      ? `91${rawPhone}`
      : rawPhone;

    const message = `⚽ *MADEN FOOTBALL ACADEMY FOUNDATION* — OFFICIAL TRIAL PASS
----------------------------------------
Candidate: *${candidate.playerName}*
Booking Ref: *${candidate.bookingRef}*
Position: ${candidate.position || 'Player'}
Age Group: ${candidate.program || 'Youth Cohort'}

📅 *TRIAL SCHEDULE DETAILS:*
• Date: *${schedule.date}*
• Reporting Time: *${schedule.time}*
• Campus: *${schedule.venue}*
• Head Scout: ${schedule.evaluator}

⚠️ *REPORTING INSTRUCTIONS:*
${schedule.reportingInstructions}

Please arrive 30 mins early with boots, shin guards, and birth proof.
Digital Pass Link: ${typeof window !== 'undefined' ? window.location.href : ''}`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setWhatsAppNotice(`WhatsApp trial pass link opened for ${candidate.phone}`);
    setTimeout(() => setWhatsAppNotice(null), 5000);
  };

  const handleCopyPass = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col selection:bg-amber-500 selection:text-amber-950">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 text-white px-4 sm:px-6 py-3 shadow-md print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/developer/trials"
              className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition-colors"
              title="Return to Trial Database"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <span>Player Technical Dossier</span>
                <span>•</span>
                <span className="text-amber-400 font-mono font-bold">{candidate.bookingRef}</span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-white">{candidate.playerName}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official PDF</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send WhatsApp Pass</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notice Banner */}
      {whatsAppNotice && (
        <div className="bg-emerald-600 text-white text-xs font-bold text-center py-2 px-4 shadow-xs print:hidden">
          {whatsAppNotice}
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Printable Card Area */}
        <div
          id="printable-trial-pass"
          className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-10 shadow-lg space-y-8 print:border-none print:shadow-none print:p-0"
        >
          {/* Header Strip with Academy Crest & Watermark */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-sm">
                M
              </div>
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-700 block">
                  MADEN FOOTBALL ACADEMY FOUNDATION
                </span>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight">
                  Official On-Pitch Trial Pass
                </h2>
                <div className="text-xs text-slate-500 font-semibold">
                  AFC & AIFF Sanctioned Talent Assessment • West Bengal
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Booking Reference
              </span>
              <div className="text-lg font-black font-mono text-slate-900 bg-slate-100 px-3 py-1 rounded-xl inline-block mt-0.5 border border-slate-200">
                {candidate.bookingRef}
              </div>
              <div className="text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1 sm:justify-end">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Assessment Slot</span>
              </div>
            </div>
          </div>

          {/* Candidate Profile Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Candidate Vitals */}
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold uppercase text-slate-400 block tracking-wider">
                Candidate Vitals
              </span>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Full Name:</span>
                  <div className="font-black text-slate-900 text-sm">{candidate.playerName}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Date of Birth:</span>
                  <div className="font-bold text-slate-900">{candidate.dob} ({candidate.gender?.toUpperCase()})</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Assigned Squad Cohort:</span>
                  <div className="font-bold text-slate-900">{candidate.program}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Primary Tactical Role:</span>
                  <div className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block border border-amber-200">
                    {candidate.position}
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Guardian & Contact */}
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold uppercase text-slate-400 block tracking-wider">
                Guardian & Emergency
              </span>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Guardian Name:</span>
                  <div className="font-bold text-slate-900">{candidate.parentName}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Registered Mobile:</span>
                  <div className="font-bold font-mono text-slate-900">{candidate.phone}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Email Address:</span>
                  <div className="font-bold text-slate-900 break-all">{candidate.email}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Residential District:</span>
                  <div className="font-bold text-slate-900">{candidate.location || 'West Bengal'}</div>
                </div>
              </div>
            </div>

            {/* Column 3: Scheduled Session */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-mono font-bold uppercase text-amber-700 block tracking-wider">
                Reporting Schedule
              </span>
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-500 block">Trial Date:</span>
                  <div className="font-black text-slate-900">{schedule.date}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Reporting Time:</span>
                  <div className="font-black text-amber-700">{schedule.time}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Venue & Pitch:</span>
                  <div className="font-bold text-slate-900">{schedule.venue}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Lead Evaluator:</span>
                  <div className="font-bold text-slate-900">{schedule.evaluator}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reporting Instructions Callout */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
            <div className="font-bold text-amber-900 flex items-center gap-1.5 uppercase font-mono">
              <Ticket className="w-4 h-4 text-amber-600" />
              <span>Mandatory Candidate Instructions</span>
            </div>
            <p className="text-amber-950 leading-relaxed">
              {schedule.reportingInstructions}
            </p>
          </div>

          {/* Verification Barcode Simulation */}
          <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                VERIFICATION TOKEN
              </div>
              <div className="font-mono font-black text-slate-700 tracking-wider">
                {candidate.bookingRef}-AUTH-PASS
              </div>
              <div className="text-[10px] text-slate-400">
                Issued by Technical Admissions Directorate • Valid for pitch entry on scheduled date only.
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block p-2 rounded-xl bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-600 font-bold">
                [ OFFICIAL MADEN SEAL ]
              </div>
            </div>
          </div>
        </div>

        {/* Share & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            onClick={handleCopyPass}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Pass Link Copied!' : 'Copy Shareable Pass Link'}</span>
          </button>

          <div className="flex items-center gap-2">
            <Link
              href="/developer/trials"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              Manage in Trial Database
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
