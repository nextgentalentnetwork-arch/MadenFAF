'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { GlobalPositioning } from '@/components/home/GlobalPositioning';
import { JoinModal } from '@/components/modals/JoinModal';
import { Globe, Plane, Award, Compass, Shield, CheckCircle2, ArrowRight } from 'lucide-react';

export default function GlobalToursPage() {
  const router = useRouter();
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  return (
    <PublicPageShell
      title="Global Positioning & Overseas Tours"
      subtitle="Connecting Bengal's brightest football prodigies with international coaching methodology, European exposure tours, and overseas talent showcases."
      badge="International Network"
      breadcrumbs={[{ label: 'Global Tours & Exposure' }]}
      ctaText="Apply for Next Tour"
      ctaAction={() => setJoinModalOpen(true)}
    >
      <div className="py-10 space-y-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlobalPositioning
            onExplorePrograms={() => router.push('/programs')}
            onJoinClick={() => setJoinModalOpen(true)}
          />
        </div>

        {/* Tour Itinerary & Details */}
        <section className="bg-slate-50 py-16 border-y border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-amber-700 tracking-wider">
                International Immersion
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
                European Training Immersion Framework
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
                Selected U14 and U16 standout players participate in intensive 10-day European training camps in Spain and Germany.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  01
                </div>
                <h3 className="text-base font-bold text-slate-900">UEFA Pro Pitch Sessions</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Daily double sessions under UEFA A and Pro licensed youth directors focusing on rapid counter-pressing and spatial rondos.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  02
                </div>
                <h3 className="text-base font-bold text-slate-900">Competitive Friendly Matches</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Fixtures against local regional academy youth squads with video telemetry and individual performance index cards.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  03
                </div>
                <h3 className="text-base font-bold text-slate-900">Cultural & Stadium Tours</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Behind-the-scenes visits to legendary European football stadiums, museum archives, and professional match day experiences.
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
