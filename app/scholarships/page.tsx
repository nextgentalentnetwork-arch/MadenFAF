'use client';

import React, { useState } from 'react';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { ScholarshipSection } from '@/components/home/ScholarshipSection';
import { JoinModal } from '@/components/modals/JoinModal';
import { GraduationCap, Award, Shield, CheckCircle2 } from 'lucide-react';

export default function ScholarshipsPage() {
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  return (
    <PublicPageShell
      title="Scholarship Programs & Financial Aid"
      subtitle="Financial background must never stand between a gifted young footballer and world-class technical coaching."
      badge="Equal Opportunity"
      breadcrumbs={[{ label: 'Scholarships' }]}
      ctaText="Apply for Scholarship"
      ctaAction={() => setJoinModalOpen(true)}
    >
      <div className="py-10 space-y-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScholarshipSection onApplyScholarship={() => setJoinModalOpen(true)} />
        </div>
      </div>

      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />
    </PublicPageShell>
  );
}
