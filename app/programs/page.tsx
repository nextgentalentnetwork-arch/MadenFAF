'use client';

import React, { useState } from 'react';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { ProgramsSection } from '@/components/home/ProgramsSection';
import { JoinModal } from '@/components/modals/JoinModal';
import { VideoModal, ActiveVideoData } from '@/components/modals/VideoModal';
import { Trophy, Shield, CheckCircle, Sparkles, Target, Users, Calendar } from 'lucide-react';

export default function ProgramsPage() {
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string>('development');
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<ActiveVideoData | null>(null);

  const handleSelectProgram = (programId: string) => {
    setSelectedProgram(programId);
    setJoinModalOpen(true);
  };

  const handleWatchVideo = (video: ActiveVideoData) => {
    setActiveVideo(video);
    setVideoModalOpen(true);
  };

  return (
    <PublicPageShell
      title="Football Training Programs"
      subtitle="Age-specific European training curriculums designed by AFC & AIFF licensed technical educators across Bengal."
      badge="Curriculum & Pathways"
      breadcrumbs={[{ label: 'Programs' }]}
      ctaText="Apply for Evaluation"
      ctaAction={() => setJoinModalOpen(true)}
    >
      <div className="py-10 space-y-16">
        {/* Key Academy Highlights Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">AFC & AIFF Certified</div>
                <div className="text-[11px] text-slate-500">Structured syllabus</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">1:12 Coach Ratio</div>
                <div className="text-[11px] text-slate-500">Individual attention</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Weekly GPS Metrics</div>
                <div className="text-[11px] text-slate-500">Performance tracking</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Need-Based Aid</div>
                <div className="text-[11px] text-slate-500">Up to 100% scholarships</div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Interactive Programs Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProgramsSection
            onSelectProgram={handleSelectProgram}
            onWatchVideo={handleWatchVideo}
          />
        </div>
      </div>

      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        defaultProgram={selectedProgram}
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
