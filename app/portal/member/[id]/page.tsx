'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  DonatorsPortalService,
  MemberProfileRecord,
  DonationRecordItem,
} from '@/lib/donatorsPortalService';
import { printElementInIsolatedIframe } from '@/lib/pdfDocumentGenerator';
import {
  ArrowLeft,
  Printer,
  CreditCard,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Award,
  HeartHandshake,
  Copy,
  Check,
  Building,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { AcademyDataManager } from '@/lib/academyDataManager';

export default function MemberStandaloneIdCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const memberIdParam = decodeURIComponent(resolvedParams.id);
  const { profile, isLoading: isAuthLoading } = useAuth();

  const isPrivileged =
    profile?.role === 'admin' ||
    (typeof window !== 'undefined' && AcademyDataManager.isDeveloperAuthenticated()) ||
    profile?.email?.toLowerCase() === 'pravakarghosh.2025@gmail.com';
  const returnHref = isPrivileged ? '/developer/donations' : '/portal?role=member';
  const returnLabel = isPrivileged ? 'Return to Member Database' : 'Return to Member Portal';

  const [member, setMember] = useState<MemberProfileRecord | null>(null);
  const [donations, setDonations] = useState<DonationRecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  // Authentication check: unauthenticated visitors must be redirected directly to login
  useEffect(() => {
    if (!isAuthLoading && !profile) {
      router.replace(`/login?redirect=${encodeURIComponent('/portal/member/' + memberIdParam)}`);
    }
  }, [isAuthLoading, profile, memberIdParam, router]);

  useEffect(() => {
    let isMounted = true;
    if (!profile) return;

    const loadProfileData = async () => {
      try {
        await DonatorsPortalService.hydrateFromCloud();
        if (!isMounted) return;
        const allMembers = DonatorsPortalService.getAllMemberProfiles();
        const allDonations = DonatorsPortalService.getAllDonations();

        const found = allMembers.find(
          (m) =>
            m.uid === memberIdParam ||
            m.memberId?.toLowerCase() === memberIdParam.toLowerCase() ||
            m.fullName?.toLowerCase().replace(/\s+/g, '-') === memberIdParam.toLowerCase()
        );

        if (found) {
          // Profile Security: Verify that the authenticated user owns this profile or is an admin
          const isOwner =
            found.uid === profile.id ||
            found.authEmail?.toLowerCase() === profile.email.toLowerCase() ||
            found.email?.toLowerCase() === profile.email.toLowerCase();

          if (!isOwner && !isPrivileged) {
            // Block access to another member's profile and redirect to own dashboard
            setAccessDenied(true);
            router.replace('/portal?role=member');
            return;
          }

          setMember(found);
          setDonations(allDonations.filter((d) => d.uid === found.uid));
        } else {
          // If searching for own profile but id was generic, try loading own registered profile
          const ownProfile = allMembers.find(
            (m) =>
              m.uid === profile.id ||
              m.authEmail?.toLowerCase() === profile.email.toLowerCase() ||
              m.email?.toLowerCase() === profile.email.toLowerCase()
          );
          if (ownProfile) {
            setMember(ownProfile);
            setDonations(allDonations.filter((d) => d.uid === ownProfile.uid));
          } else {
            setMember(null);
            setDonations([]);
          }
        }
      } catch {
        if (isMounted) {
          setMember(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, [memberIdParam, profile, isPrivileged, router]);

  if (isAuthLoading || (!profile && loading)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Verifying Member Authentication & Security Access...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-3 max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black uppercase text-white">Security Access Restricted</h2>
          <p className="text-xs text-slate-400">
            You are only authorized to view your own registered Member Profile. Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (loading || !member) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-white">Member Profile Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            No registered Foundation Member was found matching identifier &ldquo;{memberIdParam}&rdquo;.
          </p>
          <div className="pt-2">
            <Link
              href="/portal?role=member"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to My Member Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const verifiedDonations = donations.filter((d) => d.paymentStatus === 'verified');
  const totalVerifiedAmount = verifiedDonations.reduce((sum, d) => sum + d.amount, 0);

  const handlePrint = () => {
    printElementInIsolatedIframe('printable-member-card', `MADEN_Member_ID_${member.memberId}`);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col selection:bg-amber-500 selection:text-amber-950">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 text-white px-4 sm:px-6 py-3 shadow-md print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={returnHref}
              className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition-colors"
              title={returnLabel}
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <span>Foundation Member Dossier</span>
                <span>•</span>
                <span className="text-amber-400 font-mono font-bold">{member.memberId}</span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-white">{member.fullName}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official ID Card</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Printable Card Area */}
        <div
          id="printable-member-card"
          className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-10 shadow-lg space-y-8 print:border-none print:shadow-none print:p-0"
        >
          {/* Header Strip with Academy Crest & Tax Exemption */}
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
                  Official Member Identity Card
                </h2>
                <div className="text-xs text-slate-500 font-semibold">
                  Section 80G Certified Non-Profit Foundation • West Bengal
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Official Membership ID
              </span>
              <div className="text-lg font-black font-mono text-slate-900 bg-slate-100 px-3 py-1 rounded-xl inline-block mt-0.5 border border-slate-200">
                {member.memberId}
              </div>
              <div className="text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1 sm:justify-end">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Foundation Supporter</span>
              </div>
            </div>
          </div>

          {/* Member Card Front Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Photo & Category Badge */}
            <div className="text-center space-y-3">
              <div className="w-32 h-32 rounded-3xl overflow-hidden mx-auto border-2 border-amber-400 shadow-md bg-slate-100 flex items-center justify-center">
                {member.profilePhotograph ? (
                  <img
                    src={member.profilePhotograph}
                    alt={member.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-400 font-bold text-sm">No Photo</div>
                )}
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-black uppercase tracking-wider inline-block">
                  {member.memberCategory?.toUpperCase() || 'PATRON'} TIER
                </span>
              </div>
            </div>

            {/* Member Details */}
            <div className="md:col-span-2 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block font-mono text-[10px] uppercase">Member Full Name</span>
                  <div className="font-black text-slate-900 text-base">{member.fullName}</div>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono text-[10px] uppercase">Date of Birth</span>
                  <div className="font-bold text-slate-900">{member.dob}</div>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono text-[10px] uppercase">Registered Mobile</span>
                  <div className="font-bold font-mono text-slate-900">{member.primaryMobile}</div>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono text-[10px] uppercase">Email Address</span>
                  <div className="font-bold text-slate-900 break-all">{member.email}</div>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono text-[10px] uppercase">District & State</span>
                  <div className="font-bold text-slate-900">{member.district}, {member.state}</div>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono text-[10px] uppercase">Membership Validity</span>
                  <div className="font-bold text-slate-900">Member since {member.membershipRegistrationDate || '2025-01-15'} (Active)</div>
                </div>
              </div>

              {/* Verified Cumulative Impact Progress */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900">Cumulative Foundation Impact:</span>
                  <span className="font-black text-amber-900 font-mono">
                    ₹{totalVerifiedAmount.toLocaleString('en-IN')} Raised
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-amber-200 overflow-hidden">
                  <div
                    className="h-full bg-amber-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(15, (totalVerifiedAmount / 25000) * 100))}%` }}
                  />
                </div>
                <span className="text-[10px] text-amber-800 block">
                  Eligible for 50% income tax deduction under Indian Income Tax Act Section 80G.
                </span>
              </div>
            </div>
          </div>

          {/* Legal Certification Footer */}
          <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                TAX 80G REGISTRATION & COMPLIANCE
              </div>
              <div className="font-mono font-bold text-slate-700">
                NGO DARPAN: WB/2023/0388419 • Section 80G Reg: CIT(E)/KOL/80G/2023-24
              </div>
              <div className="text-[10px] text-slate-400">
                Headquarters: Gayeshpur, Kalyani, Nadia, West Bengal 741234
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block p-2 rounded-xl bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-600 font-bold">
                [ GENERAL SECRETARY SEAL ]
              </div>
            </div>
          </div>
        </div>

        {/* Share & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Link Copied!' : 'Copy Shareable Member Card Link'}</span>
          </button>

          <Link
            href={returnHref}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            {isPrivileged ? 'Manage in Member Database' : 'Return to Member Portal'}
          </Link>
        </div>
      </main>
    </div>
  );
}
