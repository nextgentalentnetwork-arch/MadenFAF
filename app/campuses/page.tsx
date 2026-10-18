'use client';

import React, { useState } from 'react';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { CampusNetwork } from '@/components/home/CampusNetwork';
import { JoinModal } from '@/components/modals/JoinModal';
import { MapPin, Shield, Zap, Sparkles, Navigation } from 'lucide-react';

export default function CampusesPage() {
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<string>('gayeshpur');

  const handleBookCampusTrial = (campusId: string) => {
    setSelectedCampus(campusId);
    setJoinModalOpen(true);
  };

  return (
    <PublicPageShell
      title="Regional Campus Network"
      subtitle="Strategic training centers and club grounds across Bengal delivering safe, floodlit, high-standard football education."
      badge="Infrastructure & Grounds"
      breadcrumbs={[{ label: 'Campuses' }]}
      ctaText="Visit a Campus"
      ctaAction={() => setJoinModalOpen(true)}
    >
      <div className="py-10 space-y-12">
        {/* Campus Facilities Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">3 Floodlit Hubs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gayeshpur Flagship Arena, Kalyani Youth Centre, and Kolkata North Centre.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Safe Grass & Turf</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                FIFA-approved shockpad underlays and natural grass maintenance to protect youth joint health.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Athletic Gym & Physio</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated recovery zones, physiotherapy tables, and youth strength conditioning facilities.
              </p>
            </div>
          </div>
        </div>

        {/* Full Interactive Campus Network Component */}
        <CampusNetwork onBookCampusTrial={handleBookCampusTrial} />
      </div>

      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        defaultCampus={selectedCampus}
      />
    </PublicPageShell>
  );
}
