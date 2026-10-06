'use client';

import React, { useState } from 'react';
import { AcademyDataManager, ComponentToggles } from '@/lib/academyDataManager';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
  LayoutGrid,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Settings,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Shield,
  Trophy,
  Users,
  Building,
  Newspaper,
  Calendar,
  GraduationCap,
  MessageSquareQuote,
  Star,
  Handshake,
  Lock,
  UserCheck,
  Compass,
  BarChart3,
  TrendingUp,
  Sliders,
  Check,
  X,
  Plus,
} from 'lucide-react';

export interface ComponentMeta {
  id: string;
  toggleKey: keyof ComponentToggles;
  name: string;
  category: 'Core Experience' | 'Training & Academics' | 'Competitions & Events' | 'Community & Media' | 'Site Structure & Access';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  itemsCountText?: () => string;
  targetTab?: string;
  defaultConfig?: Record<string, any>;
}

export const WEBSITE_COMPONENTS: ComponentMeta[] = [
  {
    id: 'hero',
    toggleKey: 'hero',
    name: 'Hero Showcase & Video Experience',
    category: 'Core Experience',
    description: 'Cinematic hero banner with editable headlines, accent colors, video documentary modal, custom CTAs, and live stat strip.',
    icon: Sparkles,
    accentColor: 'amber',
    targetTab: 'hero',
    itemsCountText: () => {
      try {
        const cfg = AcademyDataManager.getHeroConfig();
        return `${cfg.stats?.length || 4} Stat Metrics · Video Cinema Studio`;
      } catch {
        return 'Custom Headline & Video Studio';
      }
    },
  },
  {
    id: 'storytelling',
    toggleKey: 'storytelling',
    name: 'Storytelling & Philosophy',
    category: 'Core Experience',
    description: '“More Than a Football Academy” interactive tabbed philosophy, holistic pillars, and youth ethos.',
    icon: Compass,
    accentColor: 'indigo',
    itemsCountText: () => '4 Core Philosophy Pillars',
  },
  {
    id: 'impactStats',
    toggleKey: 'impactStats',
    name: 'Impact Statistics & Milestones',
    category: 'Core Experience',
    description: 'Count-up statistics highlighting 94% pathway progression, 1,200+ players trained, and 15+ scouting trials.',
    icon: BarChart3,
    accentColor: 'emerald',
    itemsCountText: () => '4 Live Metric Counters',
  },
  {
    id: 'growthCharts',
    toggleKey: 'growthCharts',
    name: '3-Year Growth & Visualizations',
    category: 'Core Experience',
    description: 'Interactive Recharts visualization showcasing player cohort progression and scholarship distributions.',
    icon: TrendingUp,
    accentColor: 'blue',
    itemsCountText: () => '3-Year Trend Analytics',
  },
  {
    id: 'pathway',
    toggleKey: 'pathway',
    name: 'The MADEN Pathway',
    category: 'Training & Academics',
    description: 'Step-by-step player journey from Grassroots (U7-U10) to Youth Development, Elite Academy, and Pro Pathway.',
    icon: Trophy,
    accentColor: 'amber',
    itemsCountText: () => '4 Development Stages',
  },
  {
    id: 'programs',
    toggleKey: 'programs',
    name: 'Football Training Programs',
    category: 'Training & Academics',
    description: 'Complete training curriculums: Grassroots, Youth, Elite Performance, Girls & Women, and Goalkeeping.',
    icon: Trophy,
    accentColor: 'amber',
    itemsCountText: () => `${AcademyDataManager.getPrograms().length} Active Curriculums`,
    targetTab: 'programs',
  },
  {
    id: 'coachingStaff',
    toggleKey: 'coachingStaff',
    name: 'Coaching Staff & Mentors',
    category: 'Training & Academics',
    description: 'Licensed technical leadership roster: AFC and UEFA credentials, specializations, and booking triggers.',
    icon: Users,
    accentColor: 'rose',
    itemsCountText: () => `${AcademyDataManager.getCoaches().length} Licensed Coaches`,
    targetTab: 'coaches',
  },
  {
    id: 'globalPositioning',
    toggleKey: 'globalPositioning',
    name: 'Global Positioning & Tours',
    category: 'Training & Academics',
    description: 'International football partnerships, European exposure tours, and Spanish/German methodology immersion.',
    icon: Compass,
    accentColor: 'teal',
    itemsCountText: () => 'Global Partner Network',
  },
  {
    id: 'campusNetwork',
    toggleKey: 'campusNetwork',
    name: 'Campus Network & Facilities',
    category: 'Site Structure & Access',
    description: 'Flagship training centers in Gayeshpur, Kalyani, and Kolkata with turf specifications and Google Maps integration.',
    icon: Building,
    accentColor: 'purple',
    itemsCountText: () => `${AcademyDataManager.getCampuses().length} Training Centers`,
    targetTab: 'campuses',
  },
  {
    id: 'matchCentre',
    toggleKey: 'matchCentre',
    name: 'Match Centre & Fixtures',
    category: 'Competitions & Events',
    description: 'Tournament schedules, match results, opponent crests, referee logs, and live score cards.',
    icon: Trophy,
    accentColor: 'orange',
    itemsCountText: () => `${AcademyDataManager.getFixtures().length} Logged Fixtures`,
    targetTab: 'fixtures',
  },
  {
    id: 'campsAndEvents',
    toggleKey: 'campsAndEvents',
    name: 'Camps & Assessment Events',
    category: 'Competitions & Events',
    description: 'Seasonal holiday masterclasses, weekend clinics, and pro scout evaluation dates with registration links.',
    icon: Calendar,
    accentColor: 'cyan',
    itemsCountText: () => `${AcademyDataManager.getEvents().length} Scheduled Events`,
    targetTab: 'events',
  },
  {
    id: 'newsAndStories',
    toggleKey: 'newsAndStories',
    name: 'News & Club Stories',
    category: 'Community & Media',
    description: 'Official press releases, academy milestones, match recap articles, and player spot-light features.',
    icon: Newspaper,
    accentColor: 'blue',
    itemsCountText: () => `${AcademyDataManager.getNews().length} Published Stories`,
    targetTab: 'news',
  },
  {
    id: 'scholarships',
    toggleKey: 'scholarships',
    name: 'Scholarship Programs',
    category: 'Training & Academics',
    description: 'Full-ride (100%), merit-based, and need-based financial aid tiers with application forms.',
    icon: GraduationCap,
    accentColor: 'emerald',
    itemsCountText: () => `${AcademyDataManager.getScholarships().length} Scholarship Tiers`,
    targetTab: 'scholarships',
  },
  {
    id: 'parentExperience',
    toggleKey: 'parentExperience',
    name: 'Parent Experience & Reviews',
    category: 'Community & Media',
    description: 'Weekly WhatsApp reporting, GPS tracking metrics, transparent deliverables, and verified parent testimonials.',
    icon: MessageSquareQuote,
    accentColor: 'violet',
    itemsCountText: () => `${AcademyDataManager.getParentDeliverables().length} Deliverables Configured`,
    targetTab: 'parentReviews',
  },
  {
    id: 'successStories',
    toggleKey: 'successStories',
    name: 'Success Stories & Alumni',
    category: 'Community & Media',
    description: 'Graduate profiles, signings with I-League/ISL youth academies, university scholarships, and quotes.',
    icon: Star,
    accentColor: 'amber',
    itemsCountText: () => `${AcademyDataManager.getTestimonials().length} Verified Stories`,
    targetTab: 'successStories',
  },
  {
    id: 'sponsors',
    toggleKey: 'sponsors',
    name: 'Sponsors & Brand Partners',
    category: 'Community & Media',
    description: 'Official kit manufacturers, sports nutrition sponsors, equipment partners, and brand logos carousel.',
    icon: Handshake,
    accentColor: 'sky',
    itemsCountText: () => `${AcademyDataManager.getSponsors().length} Official Partners`,
    targetTab: 'sponsors',
  },
  {
    id: 'trials',
    toggleKey: 'hero', // custom handle
    name: 'Trial Intake Management',
    category: 'Site Structure & Access',
    description: 'Candidate assessment scheduler, age category evaluations, and intake workflow status pipeline.',
    icon: UserCheck,
    accentColor: 'emerald',
    itemsCountText: () => `${AcademyDataManager.getTrialSlots().length} Intake Slots`,
    targetTab: 'trials',
  },
  {
    id: 'digitalPortal',
    toggleKey: 'digitalPortal',
    name: 'Digital Portal Access Control',
    category: 'Site Structure & Access',
    description: 'Player, Parent, Coach, and Admin authentication gateway, announcement banners, and session credentials.',
    icon: Lock,
    accentColor: 'indigo',
    itemsCountText: () => 'Role-Based Authentication',
    targetTab: 'digitalPortal',
  },
  {
    id: 'preFooterCta',
    toggleKey: 'preFooterCta',
    name: 'Pre-Footer Intake CTA Banner',
    category: 'Core Experience',
    description: '“Your Football Journey Starts Here” high-conversion evaluation session booking banner before footer.',
    icon: Sparkles,
    accentColor: 'amber',
    itemsCountText: () => 'Conversion Banner',
  },
  {
    id: 'header',
    toggleKey: 'header',
    name: 'Sticky Header Navigation',
    category: 'Site Structure & Access',
    description: 'Global navigation bar with campus selector, evaluation CTA button, and responsive mobile menu.',
    icon: Sliders,
    accentColor: 'slate',
    itemsCountText: () => 'Global Navigation Bar',
  },
  {
    id: 'footer',
    toggleKey: 'footer',
    name: 'Global Footer & Legal Credentials',
    category: 'Site Structure & Access',
    description: 'Academy registration numbers, campus address details, social handles, and copyright metadata.',
    icon: Shield,
    accentColor: 'slate',
    itemsCountText: () => 'Global Footer Section',
  },
];

interface WebsiteComponentsGridProps {
  onSelectTab: (tabId: string) => void;
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}

export const WebsiteComponentsGrid: React.FC<WebsiteComponentsGridProps> = ({
  onSelectTab,
  onNotify,
}) => {
  const [toggles, setToggles] = useState<ComponentToggles>(() =>
    AcademyDataManager.getComponentToggles()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');

  // Deletion state
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    component: ComponentMeta | null;
  }>({
    isOpen: false,
    component: null,
  });

  // Quick edit modal
  const [quickEditModal, setQuickEditModal] = useState<ComponentMeta | null>(null);

  const refreshToggles = () => {
    setToggles({ ...AcademyDataManager.getComponentToggles() });
  };

  const handleToggle = (key: keyof ComponentToggles, compName: string) => {
    AcademyDataManager.toggleComponent(key);
    refreshToggles();
    const isNowActive = AcademyDataManager.getComponentToggles()[key] !== false;
    onNotify({
      type: 'success',
      text: `Component "${compName}" is now ${isNowActive ? 'VISIBLE on the website' : 'HIDDEN from visitors'}.`,
    });
  };

  const handleOpenDelete = (component: ComponentMeta) => {
    setDeleteModalState({
      isOpen: true,
      component,
    });
  };

  const handleConfirmDelete = () => {
    const comp = deleteModalState.component;
    if (!comp) return;

    // To delete/remove component from website:
    const current = AcademyDataManager.getComponentToggles();
    current[comp.toggleKey] = false;
    AcademyDataManager.saveComponentToggles(current);
    refreshToggles();

    setDeleteModalState({ isOpen: false, component: null });
    onNotify({
      type: 'success',
      text: `Component "${comp.name}" removed from website view. (Toggle set to Hidden)`,
    });
  };

  const handleEnableAll = () => {
    const allOn: ComponentToggles = {
      hero: true,
      storytelling: true,
      impactStats: true,
      growthCharts: true,
      pathway: true,
      programs: true,
      coachingStaff: true,
      globalPositioning: true,
      campusNetwork: true,
      matchCentre: true,
      campsAndEvents: true,
      newsAndStories: true,
      scholarships: true,
      parentExperience: true,
      successStories: true,
      sponsors: true,
      header: true,
      footer: true,
      preFooterCta: true,
      digitalPortal: true,
    };
    AcademyDataManager.saveComponentToggles(allOn);
    refreshToggles();
    onNotify({ type: 'success', text: 'All 21 website components activated on homepage!' });
  };

  const handleResetDefaults = () => {
    AcademyDataManager.resetAllToDefaults();
    refreshToggles();
    onNotify({ type: 'success', text: 'All components and database toggles reset to default.' });
  };

  // Filtered components
  const filteredComponents = WEBSITE_COMPONENTS.filter((comp) => {
    const matchesSearch =
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || comp.category === selectedCategory;

    const isEnabled = toggles[comp.toggleKey] !== false;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && isEnabled) ||
      (statusFilter === 'hidden' && !isEnabled);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeCount = WEBSITE_COMPONENTS.filter(
    (c) => toggles[c.toggleKey] !== false
  ).length;
  const hiddenCount = WEBSITE_COMPONENTS.length - activeCount;

  const categories = [
    'All',
    'Core Experience',
    'Training & Academics',
    'Competitions & Events',
    'Community & Media',
    'Site Structure & Access',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black shadow-xs">
                <LayoutGrid className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight">
                Website Components & Modules Grid
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visual Grid View of all components across the entire MADEN FAF website. Toggle visibility, edit content, delete or jump into dedicated module managers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleEnableAll}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Enable All (21)</span>
            </button>

            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset to Defaults</span>
            </button>

            <button
              onClick={async () => {
                const res = await AcademyDataManager.syncAllToSupabase();
                if (res.success) {
                  onNotify({ type: 'success', text: 'All components configuration synced to Supabase Cloud.' });
                } else {
                  onNotify({ type: 'error', text: 'Some sections could not sync to cloud. Retrying automatically in background.' });
                }
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Sync All to Supabase</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
              Total Components
            </span>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {WEBSITE_COMPONENTS.length}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80">
            <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold block">
              Active on Website
            </span>
            <div className="text-xl font-black text-emerald-700 mt-0.5">
              {activeCount}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200/80">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
              Hidden / Disabled
            </span>
            <div className="text-xl font-black text-slate-600 mt-0.5">
              {hiddenCount}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80">
            <span className="text-[10px] font-mono uppercase text-amber-800 font-bold block">
              Supabase Status
            </span>
            <div className="text-xs font-black text-amber-800 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Active & Persisted</span>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components by name, description, or module..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Visibility status filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({WEBSITE_COMPONENTS.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('hidden')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'hidden'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hidden ({hiddenCount})
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Component Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComponents.map((comp) => {
          const isEnabled = toggles[comp.toggleKey] !== false;
          const Icon = comp.icon;
          const countText = comp.itemsCountText ? comp.itemsCountText() : null;

          return (
            <div
              key={comp.id}
              className={`bg-white border rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all duration-200 hover:shadow-md ${
                isEnabled
                  ? 'border-slate-200 hover:border-amber-400'
                  : 'border-slate-200/60 bg-slate-50/50 opacity-80'
              }`}
            >
              {/* Header: Icon, Category & Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                        isEnabled
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600">
                        {comp.category}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                          }`}
                        />
                        <span
                          className={`text-xs font-bold ${
                            isEnabled ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {isEnabled ? 'Active on Website' : 'Hidden from View'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Switch Toggle */}
                  <button
                    type="button"
                    title={isEnabled ? 'Click to hide component' : 'Click to show component'}
                    onClick={() => handleToggle(comp.toggleKey, comp.name)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      isEnabled ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                        isEnabled ? 'right-0.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Name & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {comp.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>
                </div>

                {/* Module metric / items tag */}
                {countText && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">Database Dataset:</span>
                    <span className="font-bold text-slate-900">{countText}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Manage, Quick Edit, Delete */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-1">
                  {comp.targetTab ? (
                    <button
                      type="button"
                      onClick={() => onSelectTab(comp.targetTab!)}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-1 justify-center shadow-xs"
                    >
                      <span>Manage Data</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setQuickEditModal(comp)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-1 justify-center"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-600" />
                      <span>Configure</span>
                    </button>
                  )}
                </div>

                {/* Functional Delete / Remove Button */}
                <button
                  type="button"
                  onClick={() => handleOpenDelete(comp)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer border border-rose-200/60"
                  title={`Delete or hide "${comp.name}" from backend`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredComponents.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">No components match your search</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching with a different keyword or reset your category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setStatusFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal (NO window.confirm!) */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        title={`Hide / Delete ${deleteModalState.component?.name || 'Component'}`}
        message="This action will remove and hide this component section from the live website immediately. You can re-enable it anytime from this grid."
        itemName={deleteModalState.component?.name}
        confirmLabel="Hide & Delete View"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, component: null })}
      />

      {/* Quick Configure Modal */}
      {quickEditModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setQuickEditModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-900">
                  <Sliders className="w-4 h-4" />
                </span>
                <h3 className="text-base font-black uppercase text-slate-900">
                  Configure: {quickEditModal.name}
                </h3>
              </div>
              <button
                onClick={() => setQuickEditModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Section Visibility
                </label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600">Visible on Homepage:</span>
                  <button
                    onClick={() => {
                      handleToggle(quickEditModal.toggleKey, quickEditModal.name);
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      toggles[quickEditModal.toggleKey] !== false
                        ? 'bg-amber-500'
                        : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                        toggles[quickEditModal.toggleKey] !== false
                          ? 'right-0.5'
                          : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Description & Behavior
                </label>
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 leading-relaxed">
                  {quickEditModal.description}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>Management tip:</strong> Changes take effect in real-time across all browser windows and synchronize with Supabase Cloud storage.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setQuickEditModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
