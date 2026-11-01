'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { AcademyGrowthCharts } from '@/components/home/AcademyGrowthCharts';
import { JoinModal } from '@/components/modals/JoinModal';
import { TrendingUp, BarChart3, Users, Award, Shield, ArrowRight } from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  return (
    <PublicPageShell
      title="Academy Growth & Cohort Analytics"
      subtitle="Interactive 3-year performance trends, squad demographics, scholarship allocation ratios, and player retention rates."
      badge="Visual Intelligence"
      breadcrumbs={[{ label: 'Growth & Analytics' }]}
      ctaText="Register Candidate"
      ctaAction={() => setJoinModalOpen(true)}
    >
      <div className="py-10 space-y-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AcademyGrowthCharts
            onJoinClick={() => setJoinModalOpen(true)}
            onScholarshipClick={() => router.push('/scholarships')}
          />
        </div>
      </div>

      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />
    </PublicPageShell>
  );
}
