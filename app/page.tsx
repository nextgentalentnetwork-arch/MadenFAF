'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { Header } from '@/components/layout/Header';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Hero } from '@/components/home/Hero';
import { Storytelling } from '@/components/home/Storytelling';
import { ImpactStatistics } from '@/components/home/ImpactStatistics';
import { AcademyGrowthCharts } from '@/components/home/AcademyGrowthCharts';
import { MadenPathway } from '@/components/home/MadenPathway';
import { ProgramsSection } from '@/components/home/ProgramsSection';
import { CoachingStaff } from '@/components/home/CoachingStaff';
import { GlobalPositioning } from '@/components/home/GlobalPositioning';
import { CampusNetwork } from '@/components/home/CampusNetwork';
import { MatchCentre } from '@/components/home/MatchCentre';
import { CampsAndEvents } from '@/components/home/CampsAndEvents';
import { NewsAndStories } from '@/components/home/NewsAndStories';
import { ScholarshipSection } from '@/components/home/ScholarshipSection';
import { ParentExperience } from '@/components/home/ParentExperience';
import { SuccessStories } from '@/components/home/SuccessStories';
import { SponsorBrandsCarousel } from '@/components/home/SponsorBrandsCarousel';
import { Footer } from '@/components/layout/Footer';
import { DigitalPortalModal } from '@/components/modals/DigitalPortalModal';
import { JoinModal } from '@/components/modals/JoinModal';
import { VideoModal, ActiveVideoData } from '@/components/modals/VideoModal';
import { SectionBackgroundWrapper } from '@/components/common/SectionBackgroundWrapper';
import { FloatingBackgroundCustomizer } from '@/components/customizer/FloatingBackgroundCustomizer';
import { DEFAULT_SECTION_BACKGROUNDS } from '@/data/sectionBackgroundsData';
import { AcademyDataManager, DEFAULT_TOGGLES, subscribeAcademyData } from '@/lib/academyDataManager';
import { ArrowRight, Sparkles, Shield, Trophy } from 'lucide-react';

export default function Home() {
  const toggles = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getComponentToggles(),
    () => DEFAULT_TOGGLES
  );
  const backgrounds = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getSectionBackgrounds(),
    () => DEFAULT_SECTION_BACKGROUNDS
  );
  const [portalOpen, setPortalOpen] = useState(false);
  const [portalInitialRole, setPortalInitialRole] = useState<'player' | 'parent' | 'coach' | 'admin'>('player');
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedCampusForTrial, setSelectedCampusForTrial] = useState<string>('gayeshpur');
  const [selectedProgramForTrial, setSelectedProgramForTrial] = useState<string>('development');
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<ActiveVideoData | null>(null);

  const handlePlayVideo = (video?: ActiveVideoData) => {
    setActiveVideo(video || null);
    setVideoModalOpen(true);
  };

  const handleOpenJoin = (campus = 'gayeshpur', program = 'development') => {
    setSelectedCampusForTrial(campus);
    setSelectedProgramForTrial(program);
    setJoinModalOpen(true);
  };

  const handleOpenPortal = (role: 'player' | 'parent' | 'coach' | 'admin' = 'player') => {
    setPortalInitialRole(role);
    setPortalOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Sticky Header */}
      {toggles.header !== false && (
        <Header
          onLoginClick={() => handleOpenPortal('player')}
          onJoinClick={() => handleOpenJoin()}
        />
      )}

      {/* Main Content */}
      <main className="flex-1">
        {/* Section 1: Premium Hero Experience */}
        {toggles.hero && (
          <SectionBackgroundWrapper
            sectionId="hero"
            id="hero"
            config={backgrounds.hero}
            defaultTextMode="light"
          >
            <Hero
              onJoinClick={() => handleOpenJoin()}
              onExploreProgramsClick={() => scrollToSection('programs')}
              onWatchFilmClick={() => handlePlayVideo()}
            />
          </SectionBackgroundWrapper>
        )}

        {/* Section 2: Storytelling — More Than a Football Academy */}
        {toggles.storytelling && (
          <SectionBackgroundWrapper
            sectionId="storytelling"
            id="about"
            config={backgrounds.storytelling}
            defaultTextMode="dark"
          >
            <Storytelling
              onLearnMoreClick={(tab) => {
                if (tab === 'pathway') scrollToSection('pathway');
                else scrollToSection('about');
              }}
              onWatchVideo={handlePlayVideo}
            />
          </SectionBackgroundWrapper>
        )}

        {/* Section 3: Dynamic Impact Statistics with Count-Up Animations */}
        {toggles.impactStats && (
          <SectionBackgroundWrapper
            sectionId="impactStats"
            id="impact"
            config={backgrounds.impactStats}
            defaultTextMode="light"
          >
            <ImpactStatistics
              onJoinClick={() => handleOpenJoin()}
              onScholarshipClick={() => scrollToSection('scholarships')}
            />
          </SectionBackgroundWrapper>
        )}

        {/* Section 4: 3-Year Academy Growth & Scholarship Visualizations (Recharts) */}
        {toggles.growthCharts && (
          <SectionBackgroundWrapper
            sectionId="growthCharts"
            id="growth"
            config={backgrounds.growthCharts}
            defaultTextMode="dark"
          >
            <AcademyGrowthCharts
              onJoinClick={() => handleOpenJoin()}
              onScholarshipClick={() => scrollToSection('scholarships')}
            />
          </SectionBackgroundWrapper>
        )}

        {/* Section 5: The MADEN Pathway */}
        {toggles.pathway && (
          <SectionBackgroundWrapper
            sectionId="pathway"
            id="pathway"
            config={backgrounds.pathway}
            defaultTextMode="dark"
          >
            <MadenPathway
              onJoinClick={() => handleOpenJoin()}
            />
          </SectionBackgroundWrapper>
        )}

        {/* Section 6: Football Programs */}
        {toggles.programs && (
          <SectionBackgroundWrapper
            sectionId="programs"
            id="programs"
            config={backgrounds.programs}
            defaultTextMode="dark"
          >
            <ProgramsSection
              onSelectProgram={(programId) => handleOpenJoin('gayeshpur', programId)}
              onWatchVideo={handlePlayVideo}
            />
          </SectionBackgroundWrapper>
        )}

        {/* Section 7: Coaching Staff & Mentors */}
        {toggles.coachingStaff && (
          <SectionBackgroundWrapper
            sectionId="coachingStaff"
            id="coaches"
            config={backgrounds.coachingStaff}
            defaultTextMode="dark"
          >
            <CoachingStaff
              onBookTrialWithCoach={(coachName, campus) => handleOpenJoin(campus, 'development')}
            />
          </SectionBackgroundWrapper>
        )}

        {/* Section 8: Global / International Positioning */}
        {toggles.globalPositioning && (
          <SectionBackgroundWrapper
            sectionId="globalPositioning"
            id="global-tours"
            config={backgrounds.globalPositioning}
            defaultTextMode="light"
          >
            <GlobalPositioning
              onExplorePrograms={() => scrollToSection('programs')}
              onJoinClick={() => handleOpenJoin()}
            />
          </SectionBackgroundWrapper>
        )}

        {/* Section 9: Campus Network */}
        {toggles.campusNetwork && (
          <SectionBackgroundWrapper
            sectionId="campusNetwork"
            id="campuses"
            config={backgrounds.campusNetwork}
            defaultTextMode="dark"
          >
            <CampusNetwork
              onBookCampusTrial={(campusId) => handleOpenJoin(campusId)}
            />
          </SectionBackgroundWrapper>
        )}

        {/* Section 10: Match Centre */}
        {toggles.matchCentre && (
          <SectionBackgroundWrapper
            sectionId="matchCentre"
            id="match-centre"
            config={backgrounds.matchCentre}
            defaultTextMode="light"
          >
            <MatchCentre
              onJoinClick={() => handleOpenJoin()}
            />
          </SectionBackgroundWrapper>
        )}

        {/* Section 11: Camps & Events */}
        {toggles.campsAndEvents && (
          <SectionBackgroundWrapper
            sectionId="campsAndEvents"
            id="events"
            config={backgrounds.campsAndEvents}
            defaultTextMode="dark"
          >
            <CampsAndEvents
              onRegisterEvent={(title) => handleOpenJoin('gayeshpur', 'holiday-camps')}
              onWatchVideo={handlePlayVideo}
            />
          </SectionBackgroundWrapper>
        )}

        {/* Section 12: News & Stories */}
        {toggles.newsAndStories && (
          <SectionBackgroundWrapper
            sectionId="newsAndStories"
            id="news"
            config={backgrounds.newsAndStories}
            defaultTextMode="dark"
          >
            <NewsAndStories
              onWatchVideo={handlePlayVideo}
            />
          </SectionBackgroundWrapper>
        )}

        {/* Section 13: Scholarship Section */}
        {toggles.scholarships && (
          <SectionBackgroundWrapper
            sectionId="scholarships"
            id="scholarships"
            config={backgrounds.scholarships}
            defaultTextMode="dark"
          >
            <ScholarshipSection
              onApplyScholarship={() => handleOpenJoin()}
            />
          </SectionBackgroundWrapper>
        )}

        {/* Section 14: Parent Experience */}
        {toggles.parentExperience && (
          <SectionBackgroundWrapper
            sectionId="parentExperience"
            id="parent-experience"
            config={backgrounds.parentExperience}
            defaultTextMode="dark"
          >
            <ParentExperience
              onOpenParentPortal={() => handleOpenPortal('parent')}
            />
          </SectionBackgroundWrapper>
        )}

        {/* Section 15: Success Stories & Testimonials Slider */}
        {toggles.successStories && (
          <SectionBackgroundWrapper
            sectionId="successStories"
            id="success-stories"
            config={backgrounds.successStories}
            defaultTextMode="dark"
          >
            <SuccessStories
              onJoinClick={() => handleOpenJoin()}
              onWatchVideo={handlePlayVideo}
            />
          </SectionBackgroundWrapper>
        )}

        {/* Section 16: High Conversion Pre-Footer CTA Banner */}
        {toggles.preFooterCta !== false && (
          <SectionBackgroundWrapper
            sectionId="preFooterCta"
            id="pre-footer-cta"
            config={backgrounds.preFooterCta}
            defaultTextMode="dark"
          >
            <section className="py-16 sm:py-24 relative overflow-hidden">
              <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]" />

              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold uppercase tracking-widest text-amber-800 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Official Intake 2026/27</span>
                </div>

                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-slate-900 leading-tight">
                  YOUR FOOTBALL JOURNEY <br />
                  <span className="text-amber-600">STARTS HERE</span>
                </h2>

                <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Take the first step toward structured player development. Book a comprehensive on-pitch evaluation session at your nearest campus today.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
                  <button
                    onClick={() => handleOpenJoin()}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-amber-200 hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer min-h-[48px]"
                  >
                    <span>BOOK AN EVALUATION SESSION</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenPortal('player')}
                    className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer min-h-[48px] shadow-xs text-center"
                  >
                    EXPLORE DIGITAL PORTAL
                  </button>
                </div>

                {/* Reassurance points */}
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 pt-4 border-t border-slate-200/80">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    <span>AFC & AIFF Certified Coaching</span>
                  </div>
                  <span className="hidden sm:inline text-slate-300 select-none">•</span>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>3 Floodlit Campuses in Bengal</span>
                  </div>
                  <span className="hidden sm:inline text-slate-300 select-none">•</span>
                  <span>Need-Based Scholarships Available</span>
                </div>
              </div>
            </section>
          </SectionBackgroundWrapper>
        )}

        {/* Section 17: Sponsor & Brand Partners Carousel */}
        {toggles.sponsors && (
          <SectionBackgroundWrapper
            sectionId="sponsors"
            id="sponsors"
            config={backgrounds.sponsors}
            defaultTextMode="dark"
          >
            <SponsorBrandsCarousel />
          </SectionBackgroundWrapper>
        )}
      </main>

      {/* On-Page Real-Time Background Customizer */}
      <FloatingBackgroundCustomizer />

      {/* Footer */}
      {toggles.footer !== false && (
        <Footer
          onJoinClick={() => handleOpenJoin()}
          onLoginClick={() => handleOpenPortal('parent')}
        />
      )}

      {/* Mobile Ergonomic Bottom Quick Navigation Bar */}
      <MobileBottomNav
        onJoinClick={() => handleOpenJoin()}
        onPortalClick={() => handleOpenPortal('player')}
      />

      {/* Modals with Mobile Bottom-Sheet Behavior */}
      <DigitalPortalModal
        isOpen={portalOpen}
        onClose={() => setPortalOpen(false)}
        initialRole={portalInitialRole}
        onBookTrialClick={() => {
          setPortalOpen(false);
          handleOpenJoin();
        }}
      />

      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        defaultCampus={selectedCampusForTrial}
        defaultProgram={selectedProgramForTrial}
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
          handleOpenJoin();
        }}
      />
    </div>
  );
}
