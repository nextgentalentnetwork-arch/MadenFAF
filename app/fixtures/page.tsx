'use client';

import React, { useState } from 'react';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { MatchCentre } from '@/components/home/MatchCentre';
import { JoinModal } from '@/components/modals/JoinModal';
import { Trophy, Calendar, Award, Shield } from 'lucide-react';

export default function FixturesPage() {
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  return (
    <PublicPageShell
      title="Match Centre & Fixtures"
      subtitle="Follow MADEN FAF competitive campaigns, AIFF youth league fixtures, tournament results, and match performance recaps."
      badge="Competition & League"
      breadcrumbs={[{ label: 'Match Centre' }]}
      ctaText="Attend Next Match"
      ctaAction={() => setJoinModalOpen(true)}
    >
      <div className="py-10 space-y-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MatchCentre onJoinClick={() => setJoinModalOpen(true)} />
        </div>
      </div>

      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />
    </PublicPageShell>
  );
}
