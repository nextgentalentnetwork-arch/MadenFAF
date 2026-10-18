'use client';

import React, { useState } from 'react';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { CampsAndEvents } from '@/components/home/CampsAndEvents';
import { JoinModal } from '@/components/modals/JoinModal';
import { VideoModal, ActiveVideoData } from '@/components/modals/VideoModal';
import { Calendar, Sparkles, MapPin, Trophy } from 'lucide-react';

export default function EventsPage() {
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedEventTitle, setSelectedEventTitle] = useState<string>('');
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<ActiveVideoData | null>(null);

  const handleRegisterEvent = (eventTitle: string) => {
    setSelectedEventTitle(eventTitle);
    setJoinModalOpen(true);
  };

  const handleWatchVideo = (video: ActiveVideoData) => {
    setActiveVideo(video);
    setVideoModalOpen(true);
  };

  return (
    <PublicPageShell
      title="Camps & Assessment Events"
      subtitle="Seasonal masterclasses, scout showcase clinics, and player assessment events scheduled across Bengal."
      badge="Special Masterclasses"
      breadcrumbs={[{ label: 'Camps & Events' }]}
      ctaText="Register for an Event"
      ctaAction={() => setJoinModalOpen(true)}
    >
      <div className="py-10 space-y-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CampsAndEvents
            onRegisterEvent={handleRegisterEvent}
            onWatchVideo={handleWatchVideo}
          />
        </div>
      </div>

      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        defaultProgram="holiday-camps"
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
