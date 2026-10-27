'use client';

import React, { useState } from 'react';
import {
  MemberProfileRecord,
  OrganizationPaymentSettings,
  DonationRecordItem,
  maskIndianMobile,
} from '@/lib/donatorsPortalService';
import { printElementInIsolatedIframe } from '@/lib/pdfDocumentGenerator';
import {
  X,
  Printer,
  CreditCard,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  Award,
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle,
  HeartHandshake,
  Edit3,
  QrCode,
  Building2,
  Copy,
  Check,
} from 'lucide-react';

interface MemberProfileDetailModalProps {
  member: MemberProfileRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (member: MemberProfileRecord) => void;
  settings?: OrganizationPaymentSettings;
  donations?: DonationRecordItem[];
}

export const MemberProfileDetailModal: React.FC<MemberProfileDetailModalProps> = ({
  member,
  isOpen,
  onClose,
  onEdit,
  settings,
  donations = [],
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'id_card'>('profile');
  const [idCardSide, setIdCardSide] = useState<'front' | 'back' | 'both'>('both');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen || !member) return null;

  const memberDonations = donations.filter((d) => d.uid === member.uid);
  const verifiedDonations = memberDonations.filter((d) => d.paymentStatus === 'verified');
  const totalVerifiedAmount = verifiedDonations.reduce((sum, d) => sum + d.amount, 0);

  const org = settings?.organizationDisplayDetails || {
    legalName: 'MADEN Football Academy Foundation',
    brandName: 'MADEN FAF',
    registeredAddress:
      'Central Ground Complex, Gayeshpur, Kalyani, Nadia District, West Bengal – 741234, India',
    officialEmail: 'foundation@madenfaf.in',
    officialPhone: '+91 98302 45891',
    registrationNumber: 'WB-NAD-FAF-2023-SECTION8',
  };

  const handlePrintDossier = () => {
    printElementInIsolatedIframe(
      'member-dossier-print-container',
      `MADEN-FAF-Member-Dossier-${member.memberId}`
    );
  };

  const handlePrintIdCard = () => {
    printElementInIsolatedIframe(
      'member-id-card-print-container',
      `MADEN-FAF-Member-ID-Card-${member.memberId}`
    );
  };

  const handleCopyText = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                  Member Profile Dossier
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {member.memberId}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 leading-snug">
                {member.fullName}
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
                <FileText className="w-3.5 h-3.5" />
                <span>Complete Profile</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('id_card')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'id_card'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Official ID Card</span>
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

        {/* Modal Action Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold capitalize text-slate-900">
              {member.memberCategory?.replace(/_/g, ' ')} Member
            </span>
            <span>·</span>
            <span>Registered: {member.membershipRegistrationDate || member.createdAt?.split('T')[0] || '2026-01-10'}</span>
            <span>·</span>
            <span className={member.verifiedContactMetadata?.isVerified ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
              Mobile: {member.verifiedContactMetadata?.isVerified ? 'Verified' : 'Pending Verification'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'profile' ? (
              <button
                type="button"
                onClick={handlePrintDossier}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Print Profile Dossier (PDF)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePrintIdCard}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Print Member ID Card</span>
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(member);
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ============================================================== */}
          {/* TAB 1: COMPLETE PROFILE DOSSIER                                */}
          {/* ============================================================== */}
          {activeTab === 'profile' && (
            <div id="member-dossier-print-container" className="space-y-6">
              {/* Printable Header (Visible in printout / screen) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-2xl overflow-hidden border border-amber-400/30 shrink-0">
                    {member.profilePhotograph ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.profilePhotograph}
                        alt={member.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      member.fullName.charAt(0) || 'M'
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-white">
                      {member.fullName}
                    </h3>
                    <div className="text-xs text-slate-300 font-mono flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-amber-400 font-bold">{member.memberId}</span>
                      <span>·</span>
                      <span className="capitalize">{member.memberCategory?.replace(/_/g, ' ')} Supporter</span>
                      <span>·</span>
                      <span>Nadia District, West Bengal</span>
                    </div>
                  </div>
                </div>

                <div className="text-right sm:self-center font-mono text-xs">
                  <div className="text-slate-400 text-[10px] uppercase">Lifetime Verified Giving</div>
                  <div className="text-xl font-bold text-emerald-400">
                    ₹{totalVerifiedAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {verifiedDonations.length} official receipt(s)
                  </div>
                </div>
              </div>

              {/* Profile Details 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. Personal Information */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <User className="w-4 h-4 text-amber-600" />
                    <span>1. Personal &amp; Identity Information</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Full Name:</span>
                    <span className="col-span-2 font-semibold text-slate-900">{member.fullName}</span>

                    <span className="text-slate-500">Member ID:</span>
                    <span className="col-span-2 font-mono font-bold text-slate-900">{member.memberId}</span>

                    <span className="text-slate-500">Date of Birth:</span>
                    <span className="col-span-2 font-mono text-slate-900">{member.dob || '—'}</span>

                    <span className="text-slate-500">Gender:</span>
                    <span className="col-span-2 capitalize text-slate-900">{member.gender?.replace(/_/g, ' ') || 'Not specified'}</span>

                    <span className="text-slate-500">Occupation:</span>
                    <span className="col-span-2 text-slate-900">{member.occupation || '—'}</span>

                    <span className="text-slate-500">Member Category:</span>
                    <span className="col-span-2 capitalize font-semibold text-indigo-700">
                      {member.memberCategory?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* 2. Contact & Authentication Information */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>2. Contact &amp; Verified Channels</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Primary Mobile:</span>
                    <span className="col-span-2 font-mono font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{member.primaryMobile ? `+91 ${member.primaryMobile}` : '—'}</span>
                      {member.verifiedContactMetadata?.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" title="Verified by Administration" />
                      )}
                    </span>

                    <span className="text-slate-500">Alternate Mobile:</span>
                    <span className="col-span-2 font-mono text-slate-900">
                      {member.alternateMobile ? `+91 ${member.alternateMobile}` : '—'}
                    </span>

                    <span className="text-slate-500">Contact Email:</span>
                    <span className="col-span-2 text-slate-900 truncate">{member.email || '—'}</span>

                    <span className="text-slate-500">Auth Account:</span>
                    <span className="col-span-2 font-mono text-slate-700 truncate">{member.authEmail || member.email}</span>

                    <span className="text-slate-500">Preferred Comms:</span>
                    <span className="col-span-2 uppercase font-semibold text-slate-800">
                      {member.preferredCommunicationMethod || 'Email'}
                    </span>
                  </div>
                </div>

                {/* 3. Registered Residential Address */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span>3. Official Registered Address</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">House &amp; Street:</span>
                    <span className="col-span-2 text-slate-900">{member.houseAndStreet || '—'}</span>

                    <span className="text-slate-500">City / Village:</span>
                    <span className="col-span-2 text-slate-900">{member.villageTownCity || '—'}</span>

                    <span className="text-slate-500">Post Office:</span>
                    <span className="col-span-2 text-slate-900">{member.postOffice || '—'}</span>

                    <span className="text-slate-500">Police Station:</span>
                    <span className="col-span-2 text-slate-900">{member.policeStation || '—'}</span>

                    <span className="text-slate-500">District &amp; State:</span>
                    <span className="col-span-2 text-slate-900">
                      {[member.district, member.state].filter(Boolean).join(', ') || 'West Bengal'}
                    </span>

                    <span className="text-slate-500">PIN &amp; Country:</span>
                    <span className="col-span-2 font-mono font-bold text-slate-900">
                      {member.pinCode} ({member.country || 'India'})
                    </span>
                  </div>
                </div>

                {/* 4. Membership & Emergency Contact */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>4. Emergency Contact &amp; Preferences</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Emergency Contact:</span>
                    <span className="col-span-2 font-semibold text-slate-900">
                      {member.emergencyContact?.name || '—'}
                    </span>

                    <span className="text-slate-500">Relationship:</span>
                    <span className="col-span-2 text-slate-900">
                      {member.emergencyContact?.relationship || '—'}
                    </span>

                    <span className="text-slate-500">Emergency Phone:</span>
                    <span className="col-span-2 font-mono text-slate-900">
                      {member.emergencyContact?.phone ? `+91 ${member.emergencyContact.phone}` : '—'}
                    </span>

                    <span className="text-slate-500">Areas of Interest:</span>
                    <div className="col-span-2 flex flex-wrap gap-1">
                      {member.areasOfInterest && member.areasOfInterest.length > 0 ? (
                        member.areasOfInterest.map((a, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-medium text-slate-700"
                          >
                            {a}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400">Grassroots Youth Training</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Statutory Foundation Directorate Certification Footer */}
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
                <div>
                  <div className="font-bold text-slate-800">
                    Official Member Dossier — {org.legalName}
                  </div>
                  <div>Registration No: {org.registrationNumber} · Nadia District, West Bengal</div>
                </div>
                <div className="text-right">
                  <div>Issued Date: {new Date().toLocaleDateString('en-IN')}</div>
                  <div className="text-emerald-700 font-semibold">Status: Officially Verified Active</div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: OFFICIAL MEMBER ID CARD OPTION                         */}
          {/* ============================================================== */}
          {activeTab === 'id_card' && (
            <div className="space-y-6">
              {/* ID Card Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <span>Display Card Layout:</span>
                  <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setIdCardSide('both')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        idCardSide === 'both' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
                      }`}
                    >
                      Both Sides (Front &amp; Back)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIdCardSide('front')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        idCardSide === 'front' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
                      }`}
                    >
                      Front Side Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setIdCardSide('back')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        idCardSide === 'back' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
                      }`}
                    >
                      Back Side Only
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintIdCard}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Official ID Card</span>
                  </button>
                </div>
              </div>

              {/* ID Card Display & Print Container */}
              <div
                id="member-id-card-print-container"
                className="flex flex-col lg:flex-row items-center justify-center gap-8 py-4"
              >
                {/* ---------------- FRONT OF CARD ---------------- */}
                {(idCardSide === 'both' || idCardSide === 'front') && (
                  <div className="w-[360px] sm:w-[400px] h-[240px] sm:h-[250px] rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border-2 border-amber-400/60 p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between shrink-0 select-none">
                    {/* Micro Holographic / Gold Ribbon Header */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500" />
                    <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

                    {/* Header Row with Logo Crest */}
                    <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-slate-950 border border-amber-400/80 p-0.5 shrink-0 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/images/maden-faf-official-logo.png"
                            alt="MADEN FAF Crest"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="text-[11px] font-black tracking-wider uppercase text-white leading-tight">
                            MADEN FOOTBALL ACADEMY
                          </div>
                          <div className="text-[9px] font-mono tracking-widest uppercase text-amber-400">
                            FOUNDATION MEMBER PASS
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] font-bold font-mono uppercase">
                          OFFICIAL ID
                        </span>
                      </div>
                    </div>

                    {/* Member Information Center */}
                    <div className="flex items-center gap-3.5 my-auto">
                      <div className="w-16 h-20 rounded-xl bg-slate-800 border-2 border-amber-400/80 overflow-hidden shrink-0 flex items-center justify-center text-amber-300 font-bold text-xl shadow-md">
                        {member.profilePhotograph ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.profilePhotograph}
                            alt={member.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          member.fullName.charAt(0) || 'M'
                        )}
                      </div>

                      <div className="space-y-1 truncate">
                        <div className="text-sm sm:text-base font-black tracking-tight text-white truncate leading-snug">
                          {member.fullName}
                        </div>
                        <div className="text-xs font-mono font-bold text-amber-400 tabular-nums">
                          {member.memberId}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-300 uppercase tracking-wide">
                          {member.memberCategory?.replace(/_/g, ' ')} Supporter
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {member.villageTownCity || 'Kalyani'}, {member.state || 'West Bengal'}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Row */}
                    <div className="flex items-center justify-between border-t border-white/15 pt-2 text-[10px] font-mono text-slate-300">
                      <div>
                        <span className="text-[8px] uppercase text-slate-400 block">Valid Thru:</span>
                        <span className="font-bold text-amber-300">2026 – LIFETIME</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[8px] uppercase text-slate-400 block">Status:</span>
                        <span className="text-emerald-400 font-bold">VERIFIED</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] uppercase text-slate-400 block">Directorate:</span>
                        <span className="text-white font-serif italic text-[11px]">Technical Director</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- BACK OF CARD ---------------- */}
                {(idCardSide === 'both' || idCardSide === 'back') && (
                  <div className="w-[360px] sm:w-[400px] h-[240px] sm:h-[250px] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white border-2 border-slate-700 p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between shrink-0 select-none">
                    {/* Magnetic Stripe / Gold Bar Simulation */}
                    <div className="absolute top-3 left-0 right-0 h-8 bg-slate-800 border-y border-slate-700 flex items-center px-4">
                      <span className="text-[8px] font-mono tracking-widest text-slate-400">
                        OFFICIAL VERIFICATION STRIPE · {member.memberId}
                      </span>
                    </div>

                    <div className="mt-8 space-y-1.5 text-[9px] text-slate-300 leading-tight">
                      <div className="font-bold text-amber-300 uppercase">
                        Terms of Foundation Membership:
                      </div>
                      <p>
                        This card verifies active supporter status with the MADEN Football Academy Foundation. Grants entry to academy fixtures, annual general meets, and campus facilities. Non-transferable.
                      </p>
                    </div>

                    {/* Emergency & Address Row */}
                    <div className="grid grid-cols-2 gap-2 text-[9px] border-t border-slate-800 pt-2 font-mono">
                      <div>
                        <span className="text-slate-400 block text-[8px] uppercase">Emergency Contact:</span>
                        <div className="font-semibold text-white truncate">
                          {member.emergencyContact?.name || 'Academy Desk'}
                        </div>
                        <div className="text-amber-400">
                          {member.emergencyContact?.phone ? `+91 ${member.emergencyContact.phone}` : org.officialPhone}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-400 block text-[8px] uppercase">Registered Campus:</span>
                        <div className="text-white">Gayeshpur / Kalyani</div>
                        <div className="text-slate-400">Nadia, WB – 741234</div>
                      </div>
                    </div>

                    {/* Bottom Verification & Barcode */}
                    <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-[9px]">
                      <div className="font-mono text-[8px] text-slate-400">
                        Reg: {org.registrationNumber}
                      </div>
                      <div className="font-mono font-bold text-amber-400 text-[10px] tracking-wider">
                        ★ MADEN FAF VERIFIED ★
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions Callout */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Official Card Printing Instructions</div>
                  <p className="text-amber-800 mt-0.5">
                    Click <strong>“Print Official ID Card”</strong> above to output to standard card stock or A4 photo paper. The card dimensions match standard CR80 identity credentials (85.6mm × 54mm equivalent ratio).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
