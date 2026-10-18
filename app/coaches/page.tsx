'use client';

import React, { useState } from 'react';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { CoachingStaff } from '@/components/home/CoachingStaff';
import { JoinModal } from '@/components/modals/JoinModal';
import { Award, ShieldCheck, Users, Sparkles } from 'lucide-react';

export default function CoachesPage() {
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<string>('gayeshpur');

  const handleBookTrialWithCoach = (coachName: string, campus: string) => {
    setSelectedCampus(campus || 'gayeshpur');
    setJoinModalOpen(true);
  };

  return (
    <PublicPageShell
      title="Coaching Staff & Technical Mentors"
      subtitle="AFC & UEFA licensed technical instructors dedicated to individual player growth, modern football methodology, and athletic discipline."
      badge="Technical Leadership"
      breadcrumbs={[{ label: 'Coaching Staff' }]}
      ctaText="Meet the Panel"
      ctaAction={() => setJoinModalOpen(true)}
    >
      <div className="py-10 space-y-12">
        {/* Coaching Metrics */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-1">
              <div className="text-2xl font-black text-amber-600">AFC ‘A’ & ‘B’</div>
              <div className="text-xs text-slate-600 font-medium">Head coaches credentials</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-1">
              <div className="text-2xl font-black text-amber-600">1:12 Ratio</div>
              <div className="text-xs text-slate-600 font-medium">Max players per coach</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-1">
              <div className="text-2xl font-black text-amber-600">Specialists</div>
              <div className="text-xs text-slate-600 font-medium">Goalkeeping & Strength</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-1">
              <div className="text-2xl font-black text-amber-600">Continuous CPD</div>
              <div className="text-xs text-slate-600 font-medium">Annual European seminars</div>
            </div>
          </div>
        </div>

        {/* Full Coaching Roster Component */}
        <CoachingStaff onBookTrialWithCoach={handleBookTrialWithCoach} />
      </div>

      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        defaultCampus={selectedCampus}
      />
    </PublicPageShell>
  );
}
