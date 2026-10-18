'use client';

import React, { useState } from 'react';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { MadenPathway } from '@/components/home/MadenPathway';
import { JoinModal } from '@/components/modals/JoinModal';
import { Trophy, Target, Shield, CheckCircle2 } from 'lucide-react';

export default function PathwayPage() {
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  return (
    <PublicPageShell
      title="The MADEN Pathway"
      subtitle="A continuous, age-appropriate progression framework transforming raw youth potential into match-ready football excellence."
      badge="Development Framework"
      breadcrumbs={[{ label: 'The MADEN Pathway' }]}
      ctaText="Start Your Journey"
      ctaAction={() => setJoinModalOpen(true)}
    >
      <div className="py-10 space-y-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MadenPathway onJoinClick={() => setJoinModalOpen(true)} />
        </div>
      </div>

      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />
    </PublicPageShell>
  );
}
