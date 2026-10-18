'use client';

import React, { useState } from 'react';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { Storytelling } from '@/components/home/Storytelling';
import { ImpactStatistics } from '@/components/home/ImpactStatistics';
import { JoinModal } from '@/components/modals/JoinModal';
import { VideoModal, ActiveVideoData } from '@/components/modals/VideoModal';
import { Compass, ShieldCheck, Target, HeartHandshake } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<ActiveVideoData | null>(null);

  const handleWatchVideo = (video: ActiveVideoData) => {
    setActiveVideo(video);
    setVideoModalOpen(true);
  };

  return (
    <PublicPageShell
      title="Philosophy & Academy Ethos"
      subtitle="MADEN Football Academy Foundation is built on holistic player care: combining elite pitch coaching, character education, and equal opportunity."
      badge="More Than Football"
      breadcrumbs={[{ label: 'About Us' }]}
      ctaText="Join MADEN FAF"
      ctaAction={() => setJoinModalOpen(true)}
    >
      <div className="py-10 space-y-16">
        {/* Storytelling & 4 Pillars */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Storytelling
            onLearnMoreClick={(tab) => {
              if (tab === 'pathway') window.location.href = '/pathway';
            }}
            onWatchVideo={handleWatchVideo}
          />
        </div>

        {/* Audited Impact Stats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ImpactStatistics
            onJoinClick={() => setJoinModalOpen(true)}
            onScholarshipClick={() => (window.location.href = '/scholarships')}
          />
        </div>
      </div>

      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />

      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => {
          setVideoModalOpen(false);
          setActiveVideo(null);
        }}
        customVideo={activeVideo || undefined}
        onBookTrialClick={() => {
          setVideoModalOpen(false);
          setActiveVideo(null);
          setJoinModalOpen(true);
        }}
      />
    </PublicPageShell>
  );
}
