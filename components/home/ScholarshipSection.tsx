'use client';

import React, { useSyncExternalStore } from 'react';
import { AcademyDataManager, subscribeAcademyData } from '@/lib/academyDataManager';
import { SCHOLARSHIP_TIERS } from '@/data/academyData';
import { Award, CheckCircle2, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';

interface ScholarshipSectionProps {
  onApplyScholarship: () => void;
}

export const ScholarshipSection: React.FC<ScholarshipSectionProps> = ({ onApplyScholarship }) => {
  const tiers = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getScholarships(),
    () => SCHOLARSHIP_TIERS
  );

  return (
    <section id="scholarships" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold uppercase tracking-wider text-amber-800 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Social Impact & Equal Opportunity</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-900">
            TALENT SHOULD HAVE AN OPPORTUNITY
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            At MADEN FAF, financial background must never stand between a gifted young footballer and world-class technical coaching.
          </p>
        </div>

        {/* Dynamic Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {tiers.map((tier, idx) => (
            <div
              key={tier.id || idx}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all duration-300 flex flex-col justify-between shadow-xs relative overflow-hidden group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {tier.status === 'closed' && (
                      <span className="text-[10px] font-mono uppercase text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        Intake Closed
                      </span>
                    )}
                    <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      {tier.quota}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-mono uppercase text-amber-700 font-bold">
                  {tier.coverage}
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mt-1 mb-2.5 leading-snug">
                  {tier.tier}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  {tier.description}
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Coverage & Inclusions:
                  </div>
                  {tier.benefits.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 sm:pt-8">
                <button
                  onClick={onApplyScholarship}
                  className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[44px]"
                >
                  <span>Apply for Scholarship</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selection Process Info Box */}
        <div className="mt-10 sm:mt-14 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official 4-Step Scholarship Selection Process</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-mono text-amber-700 font-bold block mb-1">01. TRIAL APPLICATION</span>
              <p className="text-slate-600 leading-relaxed">Submit player age verification, background, and nearest campus preference.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-mono text-amber-700 font-bold block mb-1">02. ON-PITCH DRILLS</span>
              <p className="text-slate-600 leading-relaxed">Evaluated on ball mastery, 1v1 execution, speed, and match grit by AFC coaches.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-mono text-amber-700 font-bold block mb-1">03. COMMITTEE REVIEW</span>
              <p className="text-slate-600 leading-relaxed">Technical assessment cross-referenced with family circumstances for grant tier.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-mono text-amber-700 font-bold block mb-1">04. FORMAL INDUCTION</span>
              <p className="text-slate-600 leading-relaxed">Scholarship contract awarded with annual review based on attendance & discipline.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
