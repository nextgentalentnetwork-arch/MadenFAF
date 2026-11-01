'use client';

import React, { useState } from 'react';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { Storytelling } from '@/components/home/Storytelling';
import { JoinModal } from '@/components/modals/JoinModal';
import { VideoModal, ActiveVideoData } from '@/components/modals/VideoModal';
import {
  Compass,
  Target,
  BookOpen,
  Trophy,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
  Shield,
  GraduationCap,
  Users,
  Activity,
  ArrowRight,
} from 'lucide-react';

export default function PhilosophyPage() {
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<ActiveVideoData | null>(null);

  const handleWatchVideo = (video: ActiveVideoData) => {
    setActiveVideo(video);
    setVideoModalOpen(true);
  };

  return (
    <PublicPageShell
      title="Academy Philosophy & Methodology"
      subtitle="More than football. We engineer disciplined thinkers, resilient athletes, and ethical leaders through structured youth education."
      badge="The MADEN Ethos"
      breadcrumbs={[{ label: 'Philosophy & Pillars' }]}
      ctaText="Apply for Trial"
      ctaAction={() => setJoinModalOpen(true)}
    >
      <div className="py-10 space-y-20">
        {/* Core Narrative / Introduction */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold uppercase tracking-wider text-amber-900">
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>Holistic Player Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-slate-900 tracking-tight">
            Building The Complete Footballer
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mx-auto">
            At MADEN Football Academy Foundation, we reject the obsolete notion of training athletes strictly as tactical units. Our holistic four-corner framework integrates technical mastery with academic tutoring, psychological fortitude, and civic responsibility.
          </p>
        </div>

        {/* Embedded Interactive Storytelling Component */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Storytelling
            onLearnMoreClick={() => setJoinModalOpen(true)}
            onWatchVideo={handleWatchVideo}
          />
        </div>

        {/* The 4 Corners of MADEN Football */}
        <section className="bg-slate-50 py-16 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="text-xs font-mono font-bold uppercase text-amber-700 tracking-wider">
                Scientific Player Development
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
                The 4-Corner Development Matrix
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Derived from UEFA Pro standards and AIFF guidelines, each training session simultaneously engages all four performance vectors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Corner 1: Technical & Tactical */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Pillar 01</span>
                  <h3 className="text-lg font-bold text-slate-900">Technical & Tactical</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bilateral ball mastery, scan-rate conditioning, spatial perception, and high-tempo decision making under match pressure.
                </p>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Scan-before-receive drills</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Small-sided rondo pressure</span>
                  </div>
                </div>
              </div>

              {/* Corner 2: Physical & Athletic */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Pillar 02</span>
                  <h3 className="text-lg font-bold text-slate-900">Physical & Biomechanics</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Age-appropriate agility, kinetic chain balance, injury prevention protocols, and sprint acceleration dynamics.
                </p>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>FIFA 11+ injury screening</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Deceleration & change of pace</span>
                  </div>
                </div>
              </div>

              {/* Corner 3: Psychological & Mindset */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Pillar 03</span>
                  <h3 className="text-lg font-bold text-slate-900">Psychological Fortitude</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Growth mindset over fear of error, handling high-stakes setbacks, concentration under exhaustion, and self-belief.
                </p>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Emotional recovery debriefs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Pressure scenario simulation</span>
                  </div>
                </div>
              </div>

              {/* Corner 4: Social & Ethics */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Pillar 04</span>
                  <h3 className="text-lg font-bold text-slate-900">Social Responsibility</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Locker room leadership, empathy toward referees and opponents, team camaraderie, and commitment to academic schooling.
                </p>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Academic grade monitoring</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Community outreach days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coach Code of Conduct & Child Protection */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden space-y-6">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black">
                <Shield className="w-5 h-5" />
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                Child Welfare & Safe Guarding Charter
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every staff member, head coach, and groundskeeper undergoes mandatory AIFF child safeguarding accreditation. We maintain a zero-tolerance policy for harassment, verbal abuse, or unsafe training conditions. Every parent has direct WhatsApp access to the Academy Welfare Committee.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div>
                <div className="text-amber-400 font-bold text-sm">100% Background Checked</div>
                <div className="text-[11px] text-slate-400">Police verified educators</div>
              </div>
              <div>
                <div className="text-amber-400 font-bold text-sm">Certified First Responders</div>
                <div className="text-[11px] text-slate-400">AED & sports triage certified</div>
              </div>
              <div>
                <div className="text-amber-400 font-bold text-sm">Parent Direct Hotlines</div>
                <div className="text-[11px] text-slate-400">Transparent weekly metrics</div>
              </div>
            </div>
          </div>
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
