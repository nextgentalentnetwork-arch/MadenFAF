'use client';

import React, { useState } from 'react';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { SuccessStories } from '@/components/home/SuccessStories';
import { JoinModal } from '@/components/modals/JoinModal';
import { VideoModal, ActiveVideoData } from '@/components/modals/VideoModal';
import { Trophy, Star, Award, Heart } from 'lucide-react';

export default function SuccessStoriesPage() {
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<ActiveVideoData | null>(null);

  const handleWatchVideo = (video: ActiveVideoData) => {
    setActiveVideo(video);
    setVideoModalOpen(true);
  };

  return (
    <PublicPageShell
      title="Success Stories & Alumni"
      subtitle="From Bengal grassroots pitches to national youth leagues and collegiate athletics: hear from players, parents, and scouts."
      badge="Verified Milestones"
      breadcrumbs={[{ label: 'Success Stories' }]}
      ctaText="Join the Academy"
      ctaAction={() => setJoinModalOpen(true)}
    >
      <div className="py-10 space-y-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SuccessStories
            onJoinClick={() => setJoinModalOpen(true)}
            onWatchVideo={handleWatchVideo}
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
