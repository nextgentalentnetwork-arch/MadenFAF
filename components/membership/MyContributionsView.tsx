'use client';

import React, { useState, useMemo } from 'react';
import {
  MemberProfileRecord,
  DonationRecordItem,
  OrganizationPaymentSettings,
  FoundationInitiative,
  FOUNDATION_INITIATIVES,
  matchDonationToInitiative,
} from '@/lib/donatorsPortalService';
import { downloadAnnualVerifiedStatementPdf, downloadDonationPdf } from '@/lib/pdfDocumentGenerator';
import { DocumentViewMode } from './DonationDocumentViewer';
import {
  Target,
  Award,
  GraduationCap,
  Sparkles,
  HeartPulse,
  Building2,
  Trophy,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  Eye,
  FileCheck2,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Info,
  Calendar,
  Layers,
  HeartHandshake,
} from 'lucide-react';

interface MyContributionsViewProps {
  memberRecord: MemberProfileRecord;
  myDonations: DonationRecordItem[];
  settings: OrganizationPaymentSettings;
  onNavigateToDonation: (initiativePurpose?: string) => void;
  onViewDocument: (donation: DonationRecordItem, mode: DocumentViewMode) => void;
  onNavigateToSection: (section: any) => void;
}

// Supporter Tier Thresholds
const SUPPORTER_TIERS = [
  { name: 'Grassroots Friend', min: 0, max: 2499, badgeColor: 'bg-slate-100 text-slate-700 border-slate-300' },
  { name: 'Youth Academy Supporter', min: 2500, max: 9999, badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  { name: 'Academy Patron & Mentor', min: 10000, max: 24999, badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-300' },
  { name: 'Champion of Bengal Football', min: 25000, max: 49999, badgeColor: 'bg-amber-50 text-amber-900 border-amber-300' },
  { name: 'MADEN Foundation Laureate', min: 50000, max: Infinity, badgeColor: 'bg-purple-50 text-purple-900 border-purple-300' },
];

export const MyContributionsView: React.FC<MyContributionsViewProps> = ({
  memberRecord,
  myDonations,
  settings,
  onNavigateToDonation,
  onViewDocument,
  onNavigateToSection,
}) => {
  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'supported' | 'grassroots' | 'welfare'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedInitiativeId, setExpandedInitiativeId] = useState<string | null>(null);

  // Supporter Annual Goal (Stored in local storage or default ₹25,000)
  const [annualGoal, setAnnualGoal] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`maden_annual_goal_${memberRecord.uid}`);
      if (saved && !isNaN(Number(saved))) return Number(saved);
    }
    return 25000;
  });

  const handleUpdateAnnualGoal = (newGoal: number) => {
    setAnnualGoal(newGoal);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`maden_annual_goal_${memberRecord.uid}`, String(newGoal));
    }
  };

  // Group donations by verified vs pending
  const verifiedDonations = useMemo(
    () => myDonations.filter((d) => d.paymentStatus === 'verified'),
    [myDonations]
  );

  const pendingVerificationDonations = useMemo(
    () => myDonations.filter((d) => d.paymentStatus === 'submitted_for_verification'),
    [myDonations]
  );

  const totalVerifiedAmount = useMemo(
    () => verifiedDonations.reduce((sum, d) => sum + d.amount, 0),
    [verifiedDonations]
  );

  const totalPendingAmount = useMemo(
    () => pendingVerificationDonations.reduce((sum, d) => sum + d.amount, 0),
    [pendingVerificationDonations]
  );

  // Calculate initiative breakdowns
  const initiativeStats = useMemo(() => {
    return FOUNDATION_INITIATIVES.map((initiative) => {
      // Find all verified donations belonging to this initiative
      const matchedVerified = verifiedDonations.filter(
        (d) => matchDonationToInitiative(d.purpose).id === initiative.id
      );
      const matchedPending = pendingVerificationDonations.filter(
        (d) => matchDonationToInitiative(d.purpose).id === initiative.id
      );

      const verifiedTotal = matchedVerified.reduce((sum, d) => sum + d.amount, 0);
      const pendingTotal = matchedPending.reduce((sum, d) => sum + d.amount, 0);

      const milestoneTarget = initiative.supporterTargetAmount;
      const progressPercent = Math.min(100, Math.round((verifiedTotal / milestoneTarget) * 100));
      const rawPercent = Math.round((verifiedTotal / milestoneTarget) * 100);

      const tangibleUnits = Math.floor(verifiedTotal / initiative.metrics.costPerUnit);

      return {
        ...initiative,
        verifiedTotal,
        pendingTotal,
        progressPercent,
        rawPercent,
        tangibleUnits,
        matchedVerified,
        matchedPending,
        hasSupported: verifiedTotal > 0 || pendingTotal > 0,
      };
    });
  }, [verifiedDonations, pendingVerificationDonations]);

  // Overall Impact Metrics
  const activeSupportedCount = initiativeStats.filter((i) => i.verifiedTotal > 0).length;
  const totalTangibleMilestones = initiativeStats.reduce((sum, i) => sum + i.tangibleUnits, 0);

  // Supporter Tier determination
  const currentTier = useMemo(() => {
    for (let i = SUPPORTER_TIERS.length - 1; i >= 0; i--) {
      if (totalVerifiedAmount >= SUPPORTER_TIERS[i].min) {
        return SUPPORTER_TIERS[i];
      }
    }
    return SUPPORTER_TIERS[0];
  }, [totalVerifiedAmount]);

  const nextTier = useMemo(() => {
    const idx = SUPPORTER_TIERS.findIndex((t) => t.name === currentTier.name);
    if (idx >= 0 && idx < SUPPORTER_TIERS.length - 1) {
      return SUPPORTER_TIERS[idx + 1];
    }
    return null;
  }, [currentTier]);

  const nextTierProgress = useMemo(() => {
    if (!nextTier) return 100;
    const span = nextTier.min - currentTier.min;
    const progressInSpan = totalVerifiedAmount - currentTier.min;
    return Math.min(100, Math.max(0, Math.round((progressInSpan / span) * 100)));
  }, [currentTier, nextTier, totalVerifiedAmount]);

  // Annual Goal Progress
  const annualGoalProgress = Math.min(100, Math.round((totalVerifiedAmount / annualGoal) * 100));

  // Filtered Initiatives
  const filteredInitiatives = useMemo(() => {
    return initiativeStats.filter((item) => {
      // Tab filter
      if (activeFilter === 'supported' && !item.hasSupported) return false;
      if (activeFilter === 'grassroots' && item.category !== 'Grassroots' && item.category !== 'Scholarships') {
        return false;
      }
      if (activeFilter === 'welfare' && item.category !== 'Welfare' && item.category !== 'Infrastructure') {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [initiativeStats, activeFilter, searchQuery]);

  // Handle statement download
  const handleDownloadAnnualStatement = () => {
    downloadAnnualVerifiedStatementPdf(
      memberRecord,
      myDonations,
      settings,
      new Date().getFullYear().toString()
    );
  };

  // Helper to render matching Lucide icon
  const renderInitiativeIcon = (id: string, className = 'w-5 h-5') => {
    switch (id) {
      case 'grassroots_training':
        return <Award className={className} />;
      case 'player_scholarships':
        return <GraduationCap className={className} />;
      case 'girls_football':
        return <Sparkles className={className} />;
      case 'sports_nutrition':
        return <HeartPulse className={className} />;
      case 'campus_infrastructure':
        return <Building2 className={className} />;
      case 'tournament_travel':
        return <Trophy className={className} />;
      default:
        return <Target className={className} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. HERO CUMULATIVE IMPACT BANNER & LIFETIME METRICS            */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
                <Target className="w-3.5 h-3.5" />
                <span>My Contributions &amp; Cumulative Impact</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Supporter Impact Visualization
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Track your personal philanthropy across MADEN Foundation football initiatives. Every verified rupee empowers underprivileged athletes with professional coaching, full scholarships, sports nutrition, and tournament pathways in Bengal.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
              <button
                type="button"
                onClick={handleDownloadAnnualStatement}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm backdrop-blur-sm"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download Annual Statement (PDF)</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateToDonation()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>+ Make a Contribution</span>
              </button>
            </div>
          </div>

          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
            {/* Card 1: Cumulative Verified */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Total Verified Contributions
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 tabular-nums">
                ₹{totalVerifiedAmount.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{verifiedDonations.length} official receipt(s) issued</span>
              </div>
            </div>

            {/* Card 2: Initiatives Supported */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Initiatives Supported
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-300 tabular-nums">
                {activeSupportedCount} <span className="text-sm font-sans font-normal text-slate-400">/ 6</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Foundation impact programs
              </div>
            </div>

            {/* Card 3: Tangible Milestones */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Direct Youth Milestones
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-300 tabular-nums">
                {totalTangibleMilestones}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                Training &amp; welfare units funded
              </div>
            </div>

            {/* Card 4: Verification Pipeline / In Transit */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                In Verification Pipeline
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400 tabular-nums">
                ₹{totalPendingAmount.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{pendingVerificationDonations.length} UTR(s) awaiting review</span>
              </div>
            </div>
          </div>

          {/* Supporter Tier Progression Bar */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Member Supporter Level:</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  {currentTier.name}
                </span>
              </div>
              {nextTier ? (
                <div className="text-slate-400 font-medium">
                  Next Tier: <span className="text-white font-semibold">{nextTier.name}</span> (at ₹{nextTier.min.toLocaleString('en-IN')})
                </div>
              ) : (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Highest Foundation Supporter Honor Achieved
                </span>
              )}
            </div>

            {nextTier && (
              <div className="space-y-1">
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${nextTierProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>₹{totalVerifiedAmount.toLocaleString('en-IN')} verified</span>
                  <span>₹{(nextTier.min - totalVerifiedAmount).toLocaleString('en-IN')} to next honor</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CUMULATIVE ALLOCATION BAR & ANNUAL GOAL TRACKER             */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Cumulative Initiative Allocation Bar */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Contribution Allocation Across Initiatives</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Proportion of your total verified donations allocated by initiative
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
              100% Directed
            </span>
          </div>

          {totalVerifiedAmount > 0 ? (
            <div className="space-y-3">
              {/* Segmented multi-colored bar */}
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                {initiativeStats
                  .filter((i) => i.verifiedTotal > 0)
                  .map((item) => {
                    const widthPct = Math.max(2, (item.verifiedTotal / totalVerifiedAmount) * 100);
                    return (
                      <div
                        key={item.id}
                        className={`h-full ${item.barColor} transition-all duration-300 relative group`}
                        style={{ width: `${widthPct}%` }}
                        title={`${item.shortName}: ₹${item.verifiedTotal.toLocaleString('en-IN')} (${Math.round((item.verifiedTotal / totalVerifiedAmount) * 100)}%)`}
                      />
                    );
                  })}
              </div>

              {/* Legend with amounts & percentages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                {initiativeStats.map((item) => {
                  const sharePct =
                    totalVerifiedAmount > 0
                      ? Math.round((item.verifiedTotal / totalVerifiedAmount) * 100)
                      : 0;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
                        item.verifiedTotal > 0
                          ? 'bg-slate-50/80 border-slate-200 text-slate-900'
                          : 'bg-white border-slate-100 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.barColor}`} />
                        <span className="truncate font-medium">{item.shortName}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono shrink-0">
                        <span className="font-semibold text-slate-800">
                          ₹{item.verifiedTotal.toLocaleString('en-IN')}
                        </span>
                        {item.verifiedTotal > 0 && (
                          <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                            {sharePct}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center space-y-2 bg-slate-50 rounded-xl border border-slate-200/70">
              <Info className="w-6 h-6 text-slate-400 mx-auto" />
              <div className="text-xs font-semibold text-slate-800">No Verified Contributions Yet</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once your contributions are verified by foundation administrators, this progress bar will visualize your impact allocation.
              </p>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Personal 2026 Annual Goal Tracker */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-1 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>2026 Giving Milestone Goal</span>
              </h2>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Personal Target
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Set and track your cumulative pledge for the 2026 academy calendar year
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black font-mono tabular-nums text-slate-900">
                  ₹{totalVerifiedAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500 font-mono"> / ₹{annualGoal.toLocaleString('en-IN')}</span>
              </div>
              <span className="text-sm font-bold font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {annualGoalProgress}% Achieved
              </span>
            </div>

            {/* Main Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/70">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${annualGoalProgress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>
                {annualGoalProgress >= 100 ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    2026 Target Achieved! Thank you!
                  </span>
                ) : (
                  <span>
                    ₹{(annualGoal - totalVerifiedAmount).toLocaleString('en-IN')} remaining to goal
                  </span>
                )}
              </span>
              <span className="text-[11px] text-slate-400">Target Year: 2026</span>
            </div>
          </div>

          {/* Quick Goal Selectors */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-semibold text-slate-600">Adjust Your 2026 Supporter Goal:</div>
            <div className="flex flex-wrap gap-1.5">
              {[5000, 10000, 25000, 50000, 100000].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleUpdateAnnualGoal(g)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                    annualGoal === g
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  ₹{g >= 1000 ? `${g / 1000}k` : g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. INITIATIVE PROGRESS BARS & DETAILED CARDS                   */}
      {/* ============================================================== */}
      <div className="space-y-4">
        {/* Section Header with Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" />
              <span>Foundation Initiatives &amp; Progress Bars</span>
            </h2>
            <p className="text-xs text-slate-500">
              Detailed breakdown of your total donations, supporter targets, and tangible real-world youth sports impact
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Tabs */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All (6)
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('supported')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeFilter === 'supported'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Supported ({activeSupportedCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search initiative..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Initiative Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredInitiatives.map((item) => {
            const isExpanded = expandedInitiativeId === item.id;
            const hasMilestoneAchieved = item.verifiedTotal >= item.supporterTargetAmount;

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl p-5 sm:p-6 space-y-4 transition-all shadow-xs flex flex-col justify-between ${
                  item.verifiedTotal > 0
                    ? 'border-slate-300 ring-1 ring-slate-200/50 hover:shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Initiative Card Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shrink-0 shadow-xs`}
                      >
                        {renderInitiativeIcon(item.id, 'w-5 h-5')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${item.badgeBg} ${item.badgeText}`}
                          >
                            {item.category}
                          </span>
                          {hasMilestoneAchieved ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <Trophy className="w-3 h-3 text-amber-500" />
                              Milestone Reached!
                            </span>
                          ) : item.verifiedTotal > 0 ? (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Active Contributor
                            </span>
                          ) : null}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                          {item.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {item.description}
                  </p>
                </div>

                {/* Progress Bar Component for this Specific Initiative */}
                <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-baseline justify-between text-xs">
                    <div>
                      <span className="text-slate-500">My Total Donations:</span>{' '}
                      <span className="font-extrabold font-mono text-slate-900 text-sm">
                        ₹{item.verifiedTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="font-mono text-slate-500 text-[11px]">
                      Target: <span className="font-semibold text-slate-700">₹{item.supporterTargetAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Primary Visual Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden p-0.5 relative">
                    <div
                      className={`h-full rounded-full ${item.barColor} transition-all duration-700 flex items-center justify-end pr-1.5`}
                      style={{ width: `${Math.max(item.verifiedTotal > 0 ? 5 : 0, item.progressPercent)}%` }}
                    >
                      {item.progressPercent >= 15 && (
                        <span className="text-[9px] font-bold text-white font-mono leading-none">
                          {item.progressPercent}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Footnote & Pending Status */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-medium">
                      {item.verifiedTotal > 0 ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {item.rawPercent}% of Supporter Milestone Target
                        </span>
                      ) : (
                        <span className="text-slate-400">0% reached · Start with a contribution</span>
                      )}
                    </span>

                    {item.pendingTotal > 0 && (
                      <span className="text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded font-mono text-[10px] font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        +₹{item.pendingTotal.toLocaleString('en-IN')} in verification
                      </span>
                    )}
                  </div>
                </div>

                {/* Tangible Real-World Football Impact Badge */}
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-amber-950 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Tangible Realized Impact:</span>
                    </span>
                    <span className="font-mono font-bold text-amber-900">
                      {item.tangibleUnits} {item.unitLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900/80">
                    {item.impactFormula}
                  </p>
                </div>

                {/* Action Row */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigateToDonation(item.name)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
                      <span>Contribute to this Initiative</span>
                    </button>

                    {item.matchedVerified.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedInitiativeId(isExpanded ? null : item.id)
                        }
                        className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="View Receipts for this initiative"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-slate-600" />
                        <span>{item.matchedVerified.length}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Expandable list of verified contributions & receipts */}
                  {isExpanded && item.matchedVerified.length > 0 && (
                    <div className="pt-2 space-y-1.5 border-t border-slate-100 text-xs">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Verified Contribution Receipts ({item.name}):
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {item.matchedVerified.map((don) => (
                          <div
                            key={don.donationId}
                            className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="font-mono font-bold text-slate-900 tabular-nums">
                                ₹{don.amount.toLocaleString('en-IN')}{' '}
                                <span className="text-[11px] font-normal text-slate-500">
                                  ({don.paymentDate || don.createdAt.split('T')[0]})
                                </span>
                              </div>
                              <div className="text-[11px] font-mono text-emerald-700">
                                Receipt: {don.receiptNumber || 'Verified'}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => onViewDocument(don, 'receipt')}
                                className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3 text-slate-500" />
                                <span>Receipt</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadDonationPdf(don, memberRecord, settings, 'receipt')}
                                className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 cursor-pointer"
                                title="Download PDF"
                              >
                                <Download className="w-3 h-3 text-slate-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredInitiatives.length === 0 && (
          <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No Initiatives Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No foundation initiatives match your selected filter or search query.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 4. FOUNDATION IMPACT GOVERNANCE & TRANSPARENCY NOTICE          */}
      {/* ============================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs text-slate-700">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Foundation Supporter Transparency &amp; Governance Pledge</span>
        </div>
        <p className="text-slate-600 leading-relaxed">
          The MADEN Football Academy Foundation operates on 100% program allocation for member donations. All verified funds are directly utilized for coaching allowances, player nutritional supplementation, medical screenings, branded gear, and tournament transport. Official receipts issued through this portal are certified under foundation registration {settings.organizationDisplayDetails.registrationNumber}.
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-[11px] text-slate-500">
          <span>Campus: Gayeshpur &amp; Kalyani, West Bengal</span>
          <span aria-hidden="true">·</span>
          <span>Official Helpline: {settings.organizationDisplayDetails.officialPhone}</span>
          <span aria-hidden="true">·</span>
          <span>Contact: {settings.organizationDisplayDetails.officialEmail}</span>
        </div>
      </div>
    </div>
  );
};
