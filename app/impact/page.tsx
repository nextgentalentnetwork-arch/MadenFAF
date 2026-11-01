'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { ImpactStatistics } from '@/components/home/ImpactStatistics';
import { JoinModal } from '@/components/modals/JoinModal';
import {
  BarChart3,
  Trophy,
  Users,
  GraduationCap,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Award,
  Shield,
  ArrowRight,
} from 'lucide-react';

export default function ImpactPage() {
  const router = useRouter();
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  return (
    <PublicPageShell
      title="Academy Impact & Milestones"
      subtitle="Measurable outcomes in grassroots scouting, athletic performance, and university scholarships across West Bengal."
      badge="Verified Milestones"
      breadcrumbs={[{ label: 'Impact & Statistics' }]}
      ctaText="Join Next Cohort"
      ctaAction={() => setJoinModalOpen(true)}
    >
      <div className="py-10 space-y-16">
        {/* Core Impact Statistics Component */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ImpactStatistics
            onJoinClick={() => setJoinModalOpen(true)}
            onScholarshipClick={() => router.push('/scholarships')}
          />
        </div>

        {/* Milestone Timeline Strip */}
        <section className="bg-slate-50 py-16 border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-mono font-bold uppercase text-amber-700 tracking-wider">
                Pathway Progression
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
                Where MADEN FAF Graduates Go
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Our curriculum delivers demonstrable progression into state leagues, national age-group squads, and higher education.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="text-3xl font-black text-amber-600">18+</div>
                <h3 className="text-base font-bold text-slate-900">I-League & ISL Placements</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Graduates signed to official U15/U17 youth teams at Mohun Bagan SG, East Bengal, Mohammedan SC, and Sudeva Delhi.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="text-3xl font-black text-emerald-600">₹14.5L+</div>
                <h3 className="text-base font-bold text-slate-900">Scholarship Aid Disbursed</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  100% full-ride funding for economically challenged candidates, covering football kits, meals, travel, and coaching.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="text-3xl font-black text-blue-600">98.2%</div>
                <h3 className="text-base font-bold text-slate-900">Academic Matriculation</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  High secondary school completion rate through integrated tutoring and coach-enforced grade minimums.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />
    </PublicPageShell>
  );
}
