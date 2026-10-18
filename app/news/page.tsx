'use client';

import React, { useState } from 'react';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { NewsAndStories } from '@/components/home/NewsAndStories';
import { VideoModal, ActiveVideoData } from '@/components/modals/VideoModal';
import { Newspaper, Sparkles, BookOpen } from 'lucide-react';

export default function NewsPage() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<ActiveVideoData | null>(null);

  const handleWatchVideo = (video: ActiveVideoData) => {
    setActiveVideo(video);
    setVideoModalOpen(true);
  };

  return (
    <PublicPageShell
      title="News & Academy Stories"
      subtitle="Inside the training grounds, player breakthroughs, match reports, and grassroots community narratives shaping MADEN FAF."
      badge="Editorial & Matchweek"
      breadcrumbs={[{ label: 'News & Stories' }]}
    >
      <div className="py-10 space-y-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsAndStories onWatchVideo={handleWatchVideo} />
        </div>
      </div>

      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => {
          setVideoModalOpen(false);
          setActiveVideo(null);
        }}
        customVideo={activeVideo || undefined}
      />
    </PublicPageShell>
  );
}
