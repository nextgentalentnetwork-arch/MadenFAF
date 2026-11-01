'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Laptop,
  Tablet,
  Smartphone,
  Monitor,
  ExternalLink,
  Search,
  CheckCircle2,
  Sliders,
  Layers,
  ArrowRight,
  Eye,
  RotateCcw,
  Shield,
  Trophy,
  Users,
  Building,
  Calendar,
  Newspaper,
  GraduationCap,
  MessageSquareQuote,
  Star,
  Handshake,
  UserCheck,
  HeartHandshake,
  Lock,
} from 'lucide-react';

// Public Experience Components
import { Hero } from '@/components/home/Hero';
import { Storytelling } from '@/components/home/Storytelling';
import { ImpactStatistics } from '@/components/home/ImpactStatistics';
import { AcademyGrowthCharts } from '@/components/home/AcademyGrowthCharts';
import { ProgramsSection } from '@/components/home/ProgramsSection';
import { CoachingStaff } from '@/components/home/CoachingStaff';
import { CampusNetwork } from '@/components/home/CampusNetwork';
import { MatchCentre } from '@/components/home/MatchCentre';
import { CampsAndEvents } from '@/components/home/CampsAndEvents';
import { NewsAndStories } from '@/components/home/NewsAndStories';
import { ScholarshipSection } from '@/components/home/ScholarshipSection';
import { ParentExperience } from '@/components/home/ParentExperience';
import { SuccessStories } from '@/components/home/SuccessStories';
import { SponsorBrandsCarousel } from '@/components/home/SponsorBrandsCarousel';
import { GlobalPositioning } from '@/components/home/GlobalPositioning';
import { MadenPathway } from '@/components/home/MadenPathway';

// Developer & Admin Managers
import { WebsiteComponentsGrid } from '@/components/developer/WebsiteComponentsGrid';
import { TrialManager } from '@/components/developer/TrialManager';
import { CoachesManager } from '@/components/developer/CoachesManager';
import { ProgramsManager } from '@/components/developer/ProgramsManager';
import { CampusesManager } from '@/components/developer/CampusesManager';
import { FixturesManager } from '@/components/developer/FixturesManager';
import { NewsManager } from '@/components/developer/NewsManager';
import { EventsManager } from '@/components/developer/EventsManager';
import { ScholarshipsManager } from '@/components/developer/ScholarshipsManager';
import { SponsorsManager } from '@/components/developer/SponsorsManager';
import { AdminDonationsManager } from '@/components/portal/AdminDonationsManager';

// Modals
import { JoinModal } from '@/components/modals/JoinModal';
import { DigitalPortalModal } from '@/components/modals/DigitalPortalModal';

export interface ShowcaseItem {
  id: string;
  name: string;
  category: 'Core Experience' | 'Operations & Media' | 'Developer Modules' | 'Interactive Modals';
  filePath: string;
  liveRoute: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SHOWCASE_COMPONENTS: ShowcaseItem[] = [
  // 1. Core Experience
  {
    id: 'hero',
    name: 'Hero Showcase & Cinema Reel',
    category: 'Core Experience',
    filePath: 'components/home/Hero.tsx',
    liveRoute: '/',
    description: 'Cinematic marquee hero with customizable headlines, video documentary modal, CTA buttons, and KPI stat strip.',
    icon: Sparkles,
  },
  {
    id: 'storytelling',
    name: 'Philosophy & Holistic Storytelling',
    category: 'Core Experience',
    filePath: 'components/home/Storytelling.tsx',
    liveRoute: '/philosophy',
    description: '4 core pillars of structured youth development: Train, Learn, Inspire, and Support.',
    icon: Star,
  },
  {
    id: 'impactStats',
    name: 'Impact Statistics & Milestones',
    category: 'Core Experience',
    filePath: 'components/home/ImpactStatistics.tsx',
    liveRoute: '/impact',
    description: 'Count-up metrics highlighting 450+ squad players, 3 campuses, and 18+ national youth placements.',
    icon: Trophy,
  },
  {
    id: 'growthCharts',
    name: 'Visualized Recharts Growth Cohorts',
    category: 'Core Experience',
    filePath: 'components/home/AcademyGrowthCharts.tsx',
    liveRoute: '/analytics',
    description: 'Interactive 3-year player enrollment trends, scholarship allocations, and age distributions.',
    icon: Sliders,
  },
  {
    id: 'pathway',
    name: 'The MADEN Pathway',
    category: 'Core Experience',
    filePath: 'components/home/MadenPathway.tsx',
    liveRoute: '/pathway',
    description: 'Step-by-step player journey from Grassroots to Pre-Professional progression.',
    icon: Trophy,
  },
  {
    id: 'programs',
    name: 'Football Training Curriculums',
    category: 'Core Experience',
    filePath: 'components/home/ProgramsSection.tsx',
    liveRoute: '/programs',
    description: 'Age-specific curriculums: Grassroots, Youth Development, Elite Performance, Girls & Women, Goalkeeping.',
    icon: Trophy,
  },
  {
    id: 'coachingStaff',
    name: 'Licensed Coaching Staff',
    category: 'Core Experience',
    filePath: 'components/home/CoachingStaff.tsx',
    liveRoute: '/coaches',
    description: 'AFC and UEFA licensed educators, profiles, licenses, and booking triggers.',
    icon: Users,
  },
  {
    id: 'globalPositioning',
    name: 'Global Positioning & Tours',
    category: 'Core Experience',
    filePath: 'components/home/GlobalPositioning.tsx',
    liveRoute: '/global-tours',
    description: 'European exposure tours, overseas scouting masterclasses, and international football immersion.',
    icon: Star,
  },

  // 2. Operations & Media
  {
    id: 'campusNetwork',
    name: 'Campus Network & Turfs',
    category: 'Operations & Media',
    filePath: 'components/home/CampusNetwork.tsx',
    liveRoute: '/campuses',
    description: 'Gayeshpur, Kalyani, and Kolkata training centers with turf specs and facilities.',
    icon: Building,
  },
  {
    id: 'matchCentre',
    name: 'Match Centre & Fixtures',
    category: 'Operations & Media',
    filePath: 'components/home/MatchCentre.tsx',
    liveRoute: '/fixtures',
    description: 'Official IFA Bengal youth fixtures, opponent crests, scores, and match reports.',
    icon: Trophy,
  },
  {
    id: 'campsAndEvents',
    name: 'Camps & Assessment Events',
    category: 'Operations & Media',
    filePath: 'components/home/CampsAndEvents.tsx',
    liveRoute: '/events',
    description: 'Seasonal holiday clinics, scouting dates, and registration capacities.',
    icon: Calendar,
  },
  {
    id: 'newsAndStories',
    name: 'News & Club Stories',
    category: 'Operations & Media',
    filePath: 'components/home/NewsAndStories.tsx',
    liveRoute: '/news',
    description: 'Academy press releases, match recaps, player spotlights, and video interviews.',
    icon: Newspaper,
  },
  {
    id: 'scholarships',
    name: 'Scholarship Aid Programs',
    category: 'Operations & Media',
    filePath: 'components/home/ScholarshipSection.tsx',
    liveRoute: '/scholarships',
    description: '100% full-ride, merit, and need-based financial aid tiers with application forms.',
    icon: GraduationCap,
  },
  {
    id: 'parentExperience',
    name: 'Parent Experience & Reviews',
    category: 'Operations & Media',
    filePath: 'components/home/ParentExperience.tsx',
    liveRoute: '/parent-experience',
    description: 'Weekly WhatsApp reporting, GPS tracking, and parent testimonials.',
    icon: MessageSquareQuote,
  },
  {
    id: 'successStories',
    name: 'Success Stories & Alumni',
    category: 'Operations & Media',
    filePath: 'components/home/SuccessStories.tsx',
    liveRoute: '/success-stories',
    description: 'Alumni signings with I-League/ISL youth academies and scholarships.',
    icon: Star,
  },
  {
    id: 'sponsors',
    name: 'Official Brand Partners Carousel',
    category: 'Operations & Media',
    filePath: 'components/home/SponsorBrandsCarousel.tsx',
    liveRoute: '/sponsors',
    description: 'Nivia Sports, IFA Bengal, Fast&Up, and partner logos carousel.',
    icon: Handshake,
  },

  // 3. Developer Modules
  {
    id: 'devTrials',
    name: 'Trial Intake & WhatsApp Manager',
    category: 'Developer Modules',
    filePath: 'components/developer/TrialManager.tsx',
    liveRoute: '/developer/trials',
    description: 'Trial registrations, candidate dossiers, WhatsApp pass dispatch, and slot scheduling.',
    icon: UserCheck,
  },
  {
    id: 'devCoaches',
    name: 'Coaches Technical Manager',
    category: 'Developer Modules',
    filePath: 'components/developer/CoachesManager.tsx',
    liveRoute: '/developer/coaches',
    description: 'CRUD management for technical staff, AFC license levels, and photos.',
    icon: Users,
  },
  {
    id: 'devPrograms',
    name: 'Programs & Curriculum Manager',
    category: 'Developer Modules',
    filePath: 'components/developer/ProgramsManager.tsx',
    liveRoute: '/developer/programs',
    description: 'Curriculum schedules, age categories, coach ratios, and drills.',
    icon: Trophy,
  },
  {
    id: 'devCampuses',
    name: 'Campus Facilities Manager',
    category: 'Developer Modules',
    filePath: 'components/developer/CampusesManager.tsx',
    liveRoute: '/developer/campuses',
    description: 'Turf grounds, addresses, facilities lists, and head coach allocations.',
    icon: Building,
  },
  {
    id: 'devFixtures',
    name: 'Match Centre Fixtures Manager',
    category: 'Developer Modules',
    filePath: 'components/developer/FixturesManager.tsx',
    liveRoute: '/developer/fixtures',
    description: 'Tournament fixtures, logos, match dates, scorecards, and reports.',
    icon: Trophy,
  },
  {
    id: 'devNews',
    name: 'News & Press Editor',
    category: 'Developer Modules',
    filePath: 'components/developer/NewsManager.tsx',
    liveRoute: '/developer/news',
    description: 'Press releases, article paragraphs, featured stories, and media presets.',
    icon: Newspaper,
  },
  {
    id: 'devEvents',
    name: 'Camps & Assessment Events Manager',
    category: 'Developer Modules',
    filePath: 'components/developer/EventsManager.tsx',
    liveRoute: '/developer/events',
    description: 'Event dates, capacities, registration pricing, and venues.',
    icon: Calendar,
  },
  {
    id: 'devScholarships',
    name: 'Scholarship Tiers Manager',
    category: 'Developer Modules',
    filePath: 'components/developer/ScholarshipsManager.tsx',
    liveRoute: '/developer/scholarships',
    description: 'Aid tiers, grant quotas, criteria, and benefit packages.',
    icon: GraduationCap,
  },
  {
    id: 'devSponsors',
    name: 'Sponsors & Brand Partners Manager',
    category: 'Developer Modules',
    filePath: 'components/developer/SponsorsManager.tsx',
    liveRoute: '/developer/sponsors',
    description: 'Brand partners, tiers, logos, and website carousel integration.',
    icon: Handshake,
  },
  {
    id: 'devDonations',
    name: 'Donators & Member Profiles Studio',
    category: 'Developer Modules',
    filePath: 'components/portal/AdminDonationsManager.tsx',
    liveRoute: '/developer/donations',
    description: 'Donor dossiers, UPI QR verifications, 80G tax certificates, and ledger.',
    icon: HeartHandshake,
  },
  {
    id: 'devComponentsGrid',
    name: 'Website Components & Visibility Deck',
    category: 'Developer Modules',
    filePath: 'components/developer/WebsiteComponentsGrid.tsx',
    liveRoute: '/developer/components',
    description: 'Interactive visual grid of all 21 website components with visibility switches.',
    icon: Sliders,
  },
];

type ViewportMode = 'full' | 'laptop' | 'tablet' | 'mobile';

export default function ComponentsShowcasePage() {
  const [selectedId, setSelectedId] = useState<string>('hero');
  const [viewport, setViewport] = useState<ViewportMode>('full');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Modal triggers for interactive testing
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [portalModalOpen, setPortalModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleNotify = (msg: { type: 'success' | 'error'; text: string }) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const selectedItem = SHOWCASE_COMPONENTS.find((c) => c.id === selectedId) || SHOWCASE_COMPONENTS[0];

  const filteredComponents = SHOWCASE_COMPONENTS.filter((comp) => {
    const matchesSearch =
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.filePath.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || comp.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const getViewportWidthClass = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[375px] mx-auto border-x-4 border-slate-700 shadow-2xl rounded-3xl overflow-hidden';
      case 'tablet':
        return 'max-w-[768px] mx-auto border-x-4 border-slate-700 shadow-2xl rounded-3xl overflow-hidden';
      case 'laptop':
        return 'max-w-[1024px] mx-auto border-x-2 border-slate-400 shadow-xl rounded-2xl overflow-hidden';
      case 'full':
      default:
        return 'w-full';
    }
  };

  // Render isolated component preview
  const renderComponentPreview = () => {
    switch (selectedItem.id) {
      case 'hero':
        return (
          <Hero
            onJoinClick={() => setJoinModalOpen(true)}
            onExploreProgramsClick={() => {}}
            onWatchFilmClick={() => {}}
          />
        );
      case 'storytelling':
        return (
          <Storytelling
            onLearnMoreClick={() => setJoinModalOpen(true)}
            onWatchVideo={() => {}}
          />
        );
      case 'impactStats':
        return (
          <ImpactStatistics
            onJoinClick={() => setJoinModalOpen(true)}
            onScholarshipClick={() => {}}
          />
        );
      case 'growthCharts':
        return (
          <AcademyGrowthCharts
            onJoinClick={() => setJoinModalOpen(true)}
            onScholarshipClick={() => {}}
          />
        );
      case 'pathway':
        return <MadenPathway onJoinClick={() => setJoinModalOpen(true)} />;
      case 'programs':
        return (
          <ProgramsSection
            onSelectProgram={() => setJoinModalOpen(true)}
            onWatchVideo={() => {}}
          />
        );
      case 'coachingStaff':
        return <CoachingStaff onBookTrialWithCoach={() => setJoinModalOpen(true)} />;
      case 'globalPositioning':
        return (
          <GlobalPositioning
            onExplorePrograms={() => {}}
            onJoinClick={() => setJoinModalOpen(true)}
          />
        );
      case 'campusNetwork':
        return <CampusNetwork onBookCampusTrial={() => setJoinModalOpen(true)} />;
      case 'matchCentre':
        return <MatchCentre onJoinClick={() => setJoinModalOpen(true)} />;
      case 'campsAndEvents':
        return <CampsAndEvents onRegisterEvent={() => setJoinModalOpen(true)} />;
      case 'newsAndStories':
        return <NewsAndStories onWatchVideo={() => {}} />;
      case 'scholarships':
        return <ScholarshipSection onApplyScholarship={() => setJoinModalOpen(true)} />;
      case 'parentExperience':
        return (
          <ParentExperience
            onOpenParentPortal={() => {}}
          />
        );
      case 'successStories':
        return <SuccessStories onJoinClick={() => setJoinModalOpen(true)} />;
      case 'sponsors':
        return <SponsorBrandsCarousel />;

      // Developer Modules
      case 'devTrials':
        return <TrialManager onNotify={handleNotify} />;
      case 'devCoaches':
        return <CoachesManager onNotify={handleNotify} />;
      case 'devPrograms':
        return <ProgramsManager onNotify={handleNotify} />;
      case 'devCampuses':
        return <CampusesManager onNotify={handleNotify} />;
      case 'devFixtures':
        return <FixturesManager onNotify={handleNotify} />;
      case 'devNews':
        return <NewsManager onNotify={handleNotify} />;
      case 'devEvents':
        return <EventsManager onNotify={handleNotify} />;
      case 'devScholarships':
        return <ScholarshipsManager onNotify={handleNotify} />;
      case 'devSponsors':
        return <SponsorsManager onNotify={handleNotify} />;
      case 'devDonations':
        return <AdminDonationsManager onNotify={handleNotify} />;
      case 'devComponentsGrid':
        return <WebsiteComponentsGrid onSelectTab={() => {}} onNotify={handleNotify} />;

      default:
        return (
          <div className="p-12 text-center text-slate-500">
            Preview loaded for {selectedItem.name}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black shadow-xs">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  MADEN FAF Architecture
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300">
                  {SHOWCASE_COMPONENTS.length} Components
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                Component Showcase & Design System Catalog
              </h1>
            </div>
          </div>

          {/* Viewport Controls & Links */}
          <div className="flex items-center gap-2">
            {/* Viewport Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewport('full')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewport === 'full' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
                title="Desktop 100% Full Viewport"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('laptop')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewport === 'laptop' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
                title="Laptop 1024px Viewport"
              >
                <Laptop className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewport === 'tablet' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
                title="Tablet 768px Viewport"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewport === 'mobile' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
                title="Mobile 375px Viewport"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Links */}
            <Link
              href="/developer"
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Developer Console</span>
            </Link>

            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Website</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Split Interface */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar Navigator */}
        <aside className="w-full lg:w-80 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 lg:max-h-[calc(100vh-65px)]">
          {/* Search Box */}
          <div className="p-4 border-b border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 25+ components..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
              {['All', 'Core Experience', 'Operations & Media', 'Developer Modules'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Component List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredComponents.map((comp) => {
              const Icon = comp.icon;
              const isSelected = comp.id === selectedId;
              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedId(comp.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border border-amber-500/50 shadow-md text-white'
                      : 'hover:bg-slate-900/80 text-slate-300 border border-transparent'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate block">{comp.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 block truncate">
                      {comp.filePath}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Isolated Preview Stage */}
        <main className="flex-1 bg-slate-900/60 overflow-y-auto flex flex-col">
          {/* Component Info Strip */}
          <div className="bg-slate-950/80 border-b border-slate-800 p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                  {selectedItem.category}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] font-mono text-slate-400">
                  Source: /{selectedItem.filePath}
                </span>
              </div>
              <h2 className="text-lg font-black uppercase text-white mt-0.5">
                {selectedItem.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                {selectedItem.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={selectedItem.liveRoute}
                target="_blank"
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Open Dedicated Route ({selectedItem.liveRoute})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Notice Banner */}
          {notification && (
            <div
              className={`p-3 text-xs font-bold text-center ${
                notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {notification.text}
            </div>
          )}

          {/* Component Canvas Preview Container */}
          <div className="flex-1 p-4 sm:p-6 flex items-start justify-center">
            <div className={`${getViewportWidthClass()} transition-all duration-300 bg-white rounded-3xl overflow-hidden shadow-2xl`}>
              {renderComponentPreview()}
            </div>
          </div>
        </main>
      </div>

      {/* Universal Test Modals */}
      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />

      <DigitalPortalModal
        isOpen={portalModalOpen}
        onClose={() => setPortalModalOpen(false)}
        initialRole="player"
        onBookTrialClick={() => {
          setPortalModalOpen(false);
          setJoinModalOpen(true);
        }}
      />
    </div>
  );
}
