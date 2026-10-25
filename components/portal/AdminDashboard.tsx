'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Database,
  CheckCircle2,
  ArrowRight,
  Building2,
  Code2,
  HeartHandshake,
  Shield,
  Trophy,
  LayoutGrid,
} from 'lucide-react';
import {
  getRegistrations,
  AcademyRegistrationData,
  normalizeApplicationStatus,
} from '@/lib/supabaseClient';
import { ACADEMY_CAMPUSES, ACADEMY_PROGRAMS } from '@/data/academyData';
import { useAuth } from '@/lib/AuthContext';
import { AdminDonationsManager } from './AdminDonationsManager';
import { AdminRbacGovernanceManager } from './AdminRbacGovernanceManager';
import { TrialManager } from '@/components/developer/TrialManager';

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [candidates, setCandidates] = useState<AcademyRegistrationData[]>([]);
  const [activeAdminSection, setActiveAdminSection] = useState<
    'applications' | 'donations' | 'rbac' | 'content'
  >('applications');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let active = true;
    getRegistrations()
      .then((data) => {
        if (active) setCandidates(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [activeAdminSection]);

  const admissionCount = candidates.filter(
    (c) => (c.applicationType || 'admission') === 'admission'
  ).length;
  const trialCount = candidates.filter((c) => c.applicationType === 'trial').length;
  const pendingReviewCount = candidates.filter(
    (c) => normalizeApplicationStatus(c.status) === 'pending_review'
  ).length;
  const approvedCount = candidates.filter(
    (c) => normalizeApplicationStatus(c.status) === 'approved'
  ).length;

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Executive Admin Command Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
              Admin — Backend Management
            </span>
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight mt-1">
              MADEN FAF Executive Admin Dashboard
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
              Manage player admission &amp; trial applications, member accounts, donation verification, official QR settings, receipts, schedules, and website content.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/developer"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Code2 className="w-4 h-4" />
            <span>Open Website CMS &amp; Backend Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* System Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Total Applications
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">{candidates.length}</div>
          <span className="text-[11px] text-slate-600 font-semibold">
            {admissionCount} Admission · {trialCount} Trial
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Pending Review
          </span>
          <div className="text-xl font-black text-amber-600 mt-1">
            {pendingReviewCount}
          </div>
          <span className="text-[11px] text-amber-700 font-semibold">
            Awaiting Admin Action
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Approved Applicants
          </span>
          <div className="text-xl font-black text-emerald-700 mt-1">{approvedCount}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">
            Verified &amp; Approved
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Active Campuses &amp; Programs
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {ACADEMY_CAMPUSES.length} Campuses / {ACADEMY_PROGRAMS.length} Squads
          </div>
          <span className="text-[11px] text-indigo-700 font-semibold">
            Member &amp; Admin RBAC Enforced
          </span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-2xl p-2 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveAdminSection('applications')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeAdminSection === 'applications'
              ? 'bg-slate-900 text-amber-400 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>1. Admission &amp; Trial Applications ({candidates.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminSection('donations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeAdminSection === 'donations'
              ? 'bg-slate-900 text-amber-400 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>2. Member Accounts, Donations, QR &amp; Receipts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminSection('rbac')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeAdminSection === 'rbac'
              ? 'bg-slate-900 text-amber-400 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>3. Role Access &amp; Security Audit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminSection('content')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeAdminSection === 'content'
              ? 'bg-slate-900 text-amber-400 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>4. Website Content &amp; Campuses</span>
        </button>
      </div>

      {/* Section 1: Player Admission & Trial Session Applications */}
      {activeAdminSection === 'applications' && (
        <TrialManager
          onNotify={(msg) => {
            setFeedback(msg.text);
            setTimeout(() => setFeedback(''), 4000);
          }}
        />
      )}

      {/* Section 2: Member Accounts, Donations, QR Code & Receipts */}
      {activeAdminSection === 'donations' && profile && (
        <AdminDonationsManager profile={profile} />
      )}

      {/* Section 3: Strict Two-Role Access Governance & Security Audit */}
      {activeAdminSection === 'rbac' && profile && (
        <AdminRbacGovernanceManager profile={profile} />
      )}

      {/* Section 4: Website Content, Banners, Announcements & Campuses */}
      {activeAdminSection === 'content' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-rose-600" />
                <span>Website Content, Banners, Announcements &amp; Public Pages</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage hero banners, training centres, coaches, match fixtures, news stories, events, and section visibility.
              </p>
            </div>
            <Link
              href="/developer"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <span>Launch Full Content Manager</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {ACADEMY_CAMPUSES.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-black text-slate-900 block">{c.name}</span>
                  <span className="text-[11px] text-slate-500">{c.trainingDays}</span>
                  <span className="text-[10px] font-mono text-amber-800 block mt-0.5">
                    {c.timings}
                  </span>
                </div>
                <Building2 className="w-5 h-5 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
