'use client';

import {
  ACADEMY_PROGRAMS,
  ACADEMY_CAMPUSES,
  COACHING_STAFF,
  MATCH_FIXTURES,
  NEWS_STORIES,
  ACADEMY_EVENTS,
  SCHOLARSHIP_TIERS,
  ACADEMY_TESTIMONIALS,
  DEFAULT_SPONSORS,
  DEFAULT_PARENT_DELIVERABLES,
  DEFAULT_PORTAL_CONFIG,
  DEFAULT_TRIAL_SLOTS,
  Program,
  Campus,
  CoachStaffMember,
  MatchFixture,
  NewsStory,
  AcademyEvent,
  TrialSlot,
  ScholarshipTier,
  TestimonialItem,
  SponsorPartner,
  ParentDeliverableItem,
  DigitalPortalConfig,
  HeroShowcaseConfig,
  DEFAULT_HERO_CONFIG,
} from '@/data/academyData';
import { UnifiedApiService } from '@/lib/unifiedApiService';

export { DEFAULT_HERO_CONFIG };

const STORAGE_KEYS = {
  HERO_CONFIG: 'maden_dev_hero_config',
  PROGRAMS: 'maden_dev_programs',
  CAMPUSES: 'maden_dev_campuses',
  COACHES: 'maden_dev_coaches',
  FIXTURES: 'maden_dev_fixtures',
  NEWS: 'maden_dev_news',
  EVENTS: 'maden_dev_events',
  TRIAL_SLOTS: 'maden_dev_trial_slots',
  SCHOLARSHIPS: 'maden_dev_scholarships',
  TESTIMONIALS: 'maden_dev_testimonials',
  SPONSORS: 'maden_dev_sponsors',
  PARENT_DELIVERABLES: 'maden_dev_parent_deliverables',
  PORTAL_CONFIG: 'maden_dev_portal_config',
  COMPONENT_TOGGLES: 'maden_dev_component_toggles',
  DEV_SESSION: 'maden_dev_auth_session',
  LAST_REMOTE_SYNC: 'maden_last_remote_sync',
};

export interface ComponentToggles {
  hero: boolean;
  storytelling: boolean;
  impactStats: boolean;
  growthCharts: boolean;
  pathway: boolean;
  programs: boolean;
  coachingStaff: boolean;
  globalPositioning: boolean;
  campusNetwork: boolean;
  matchCentre: boolean;
  campsAndEvents: boolean;
  newsAndStories: boolean;
  scholarships: boolean;
  parentExperience: boolean;
  successStories: boolean;
  sponsors: boolean;
  header?: boolean;
  footer?: boolean;
  preFooterCta?: boolean;
  digitalPortal?: boolean;
}

export const DEFAULT_TOGGLES: ComponentToggles = {
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

// In-memory cache to guarantee referential stability for React useSyncExternalStore
const memoryCache: Record<string, { raw: string | null; parsed: unknown }> = {};

// Safe helper to read from localStorage with snapshot caching
function getStored<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return defaultValue;
    }
    const cached = memoryCache[key];
    if (cached && cached.raw === raw) {
      return cached.parsed as T;
    }
    const parsed = JSON.parse(raw);
    memoryCache[key] = { raw, parsed };
    return parsed as T;
  } catch {
    return defaultValue;
  }
}

// Safe helper to write to localStorage and dispatch custom update event
function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = JSON.stringify(value);
    localStorage.setItem(key, raw);
    memoryCache[key] = { raw, parsed: value };
    window.dispatchEvent(new Event('maden_data_updated'));
  } catch (err) {
    console.error('Failed to store dev data:', err);
  }
}

// Universal subscription helper for React useSyncExternalStore that catches both intra-tab and cross-tab storage events
export const subscribeAcademyData = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('maden_data_updated', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('maden_data_updated', callback);
    window.removeEventListener('storage', callback);
  };
};

export const AcademyDataManager = {
  // 0. Hero Showcase & Video Experience (MODULE 0)
  getHeroConfig: (): HeroShowcaseConfig =>
    getStored<HeroShowcaseConfig>(STORAGE_KEYS.HERO_CONFIG, DEFAULT_HERO_CONFIG),
  saveHeroConfig: (config: HeroShowcaseConfig) => {
    setStored(STORAGE_KEYS.HERO_CONFIG, config);
    UnifiedApiService.persistChange({
      section: 'heroConfig',
      action: 'syncAll',
      data: config,
    }).catch(console.warn);
  },
  updateHeroConfig: (partial: Partial<HeroShowcaseConfig>): HeroShowcaseConfig => {
    const current = AcademyDataManager.getHeroConfig();
    const updated = { ...current, ...partial };
    AcademyDataManager.saveHeroConfig(updated);
    return updated;
  },
  resetHeroConfig: (): HeroShowcaseConfig => {
    AcademyDataManager.saveHeroConfig(DEFAULT_HERO_CONFIG);
    return DEFAULT_HERO_CONFIG;
  },

  // 1. Programs
  getPrograms: (): Program[] => getStored<Program[]>(STORAGE_KEYS.PROGRAMS, ACADEMY_PROGRAMS),
  savePrograms: (programs: Program[]) => {
    setStored(STORAGE_KEYS.PROGRAMS, programs);
    UnifiedApiService.persistChange({
      section: 'programs',
      action: 'syncAll',
      allData: programs,
    }).catch(console.warn);
  },
  updateProgram: (id: string, updated: Partial<Program>) => {
    const list = AcademyDataManager.getPrograms();
    const index = list.findIndex((p) => p.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updated };
      AcademyDataManager.savePrograms(list);
    }
  },
  addProgram: (program: Program) => {
    const list = AcademyDataManager.getPrograms();
    list.unshift(program);
    AcademyDataManager.savePrograms(list);
  },
  deleteProgram: (id: string) => {
    const list = AcademyDataManager.getPrograms().filter((p) => p.id !== id);
    setStored(STORAGE_KEYS.PROGRAMS, list);
    UnifiedApiService.persistChange({
      section: 'programs',
      action: 'delete',
      id,
      allData: list,
    }).catch(console.warn);
  },

  // 2. Campuses
  getCampuses: (): Campus[] => getStored<Campus[]>(STORAGE_KEYS.CAMPUSES, ACADEMY_CAMPUSES),
  saveCampuses: (campuses: Campus[]) => {
    setStored(STORAGE_KEYS.CAMPUSES, campuses);
    UnifiedApiService.persistChange({
      section: 'campuses',
      action: 'syncAll',
      allData: campuses,
    }).catch(console.warn);
  },
  updateCampus: (id: string, updated: Partial<Campus>) => {
    const list = AcademyDataManager.getCampuses();
    const index = list.findIndex((c) => c.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updated };
      setStored(STORAGE_KEYS.CAMPUSES, list);
      UnifiedApiService.persistChange({
        section: 'campuses',
        action: 'upsert',
        data: list[index],
        allData: list,
      }).catch(console.warn);
    }
  },
  addCampus: (campus: Campus) => {
    const list = AcademyDataManager.getCampuses();
    list.push(campus);
    setStored(STORAGE_KEYS.CAMPUSES, list);
    UnifiedApiService.persistChange({
      section: 'campuses',
      action: 'upsert',
      data: campus,
      allData: list,
    }).catch(console.warn);
  },
  deleteCampus: (id: string) => {
    const list = AcademyDataManager.getCampuses().filter((c) => c.id !== id);
    setStored(STORAGE_KEYS.CAMPUSES, list);
    UnifiedApiService.persistChange({
      section: 'campuses',
      action: 'delete',
      id,
      allData: list,
    }).catch(console.warn);
  },

  // 3. Coaching Staff
  getCoaches: (): CoachStaffMember[] => getStored<CoachStaffMember[]>(STORAGE_KEYS.COACHES, COACHING_STAFF),
  saveCoaches: (coaches: CoachStaffMember[]) => {
    setStored(STORAGE_KEYS.COACHES, coaches);
    UnifiedApiService.persistChange({
      section: 'coaches',
      action: 'syncAll',
      allData: coaches,
    }).catch(console.warn);
  },
  updateCoach: (id: string, updated: Partial<CoachStaffMember>) => {
    const list = AcademyDataManager.getCoaches();
    const index = list.findIndex((c) => c.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updated };
      setStored(STORAGE_KEYS.COACHES, list);
      UnifiedApiService.persistChange({
        section: 'coaches',
        action: 'upsert',
        data: list[index],
        allData: list,
      }).catch(console.warn);
    }
  },
  addCoach: (coach: CoachStaffMember) => {
    const list = AcademyDataManager.getCoaches();
    list.push(coach);
    setStored(STORAGE_KEYS.COACHES, list);
    UnifiedApiService.persistChange({
      section: 'coaches',
      action: 'upsert',
      data: coach,
      allData: list,
    }).catch(console.warn);
  },
  deleteCoach: (id: string) => {
    const list = AcademyDataManager.getCoaches().filter((c) => c.id !== id);
    setStored(STORAGE_KEYS.COACHES, list);
    UnifiedApiService.persistChange({
      section: 'coaches',
      action: 'delete',
      id,
      allData: list,
    }).catch(console.warn);
  },

  // 4. Match Fixtures & Team Logos
  getFixtures: (): MatchFixture[] => getStored<MatchFixture[]>(STORAGE_KEYS.FIXTURES, MATCH_FIXTURES),
  saveFixtures: (fixtures: MatchFixture[]) => {
    setStored(STORAGE_KEYS.FIXTURES, fixtures);
    UnifiedApiService.persistChange({
      section: 'fixtures',
      action: 'syncAll',
      allData: fixtures,
    }).catch(console.warn);
  },
  updateFixture: (id: string, updated: Partial<MatchFixture>) => {
    const list = AcademyDataManager.getFixtures();
    const index = list.findIndex((f) => f.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updated };
      setStored(STORAGE_KEYS.FIXTURES, list);
      UnifiedApiService.persistChange({
        section: 'fixtures',
        action: 'upsert',
        data: list[index],
        allData: list,
      }).catch(console.warn);
    }
  },
  addFixture: (fixture: MatchFixture) => {
    const list = AcademyDataManager.getFixtures();
    list.unshift(fixture);
    setStored(STORAGE_KEYS.FIXTURES, list);
    UnifiedApiService.persistChange({
      section: 'fixtures',
      action: 'upsert',
      data: fixture,
      allData: list,
    }).catch(console.warn);
  },
  deleteFixture: (id: string) => {
    const list = AcademyDataManager.getFixtures().filter((f) => f.id !== id);
    setStored(STORAGE_KEYS.FIXTURES, list);
    UnifiedApiService.persistChange({
      section: 'fixtures',
      action: 'delete',
      id,
      allData: list,
    }).catch(console.warn);
  },

  // 5. News & Stories
  getNews: (): NewsStory[] => getStored<NewsStory[]>(STORAGE_KEYS.NEWS, NEWS_STORIES),
  saveNews: (news: NewsStory[]) => {
    setStored(STORAGE_KEYS.NEWS, news);
    UnifiedApiService.persistChange({
      section: 'news',
      action: 'syncAll',
      allData: news,
    }).catch(console.warn);
  },
  updateNews: (id: string, updated: Partial<NewsStory>) => {
    const list = AcademyDataManager.getNews();
    const index = list.findIndex((n) => n.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updated };
      setStored(STORAGE_KEYS.NEWS, list);
      UnifiedApiService.persistChange({
        section: 'news',
        action: 'upsert',
        data: list[index],
        allData: list,
      }).catch(console.warn);
    }
  },
  addNews: (story: NewsStory) => {
    const list = AcademyDataManager.getNews();
    list.unshift(story);
    setStored(STORAGE_KEYS.NEWS, list);
    UnifiedApiService.persistChange({
      section: 'news',
      action: 'upsert',
      data: story,
      allData: list,
    }).catch(console.warn);
  },
  deleteNews: (id: string) => {
    const list = AcademyDataManager.getNews().filter((n) => n.id !== id);
    setStored(STORAGE_KEYS.NEWS, list);
    UnifiedApiService.persistChange({
      section: 'news',
      action: 'delete',
      id,
      allData: list,
    }).catch(console.warn);
  },

  // 6. Camps and Events (MODULE 1)
  getEvents: (): AcademyEvent[] => getStored<AcademyEvent[]>(STORAGE_KEYS.EVENTS, ACADEMY_EVENTS),
  saveEvents: (events: AcademyEvent[]) => {
    setStored(STORAGE_KEYS.EVENTS, events);
    UnifiedApiService.persistChange({
      section: 'events',
      action: 'syncAll',
      allData: events,
    }).catch(console.warn);
  },
  updateEvent: (id: string, updated: Partial<AcademyEvent>) => {
    const list = AcademyDataManager.getEvents();
    const index = list.findIndex((e) => e.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updated };
      setStored(STORAGE_KEYS.EVENTS, list);
      UnifiedApiService.persistChange({
        section: 'events',
        action: 'upsert',
        data: list[index],
        allData: list,
      }).catch(console.warn);
    }
  },
  addEvent: (event: AcademyEvent) => {
    const list = AcademyDataManager.getEvents();
    list.unshift(event);
    setStored(STORAGE_KEYS.EVENTS, list);
    UnifiedApiService.persistChange({
      section: 'events',
      action: 'upsert',
      data: event,
      allData: list,
    }).catch(console.warn);
  },
  deleteEvent: (id: string) => {
    const list = AcademyDataManager.getEvents().filter((e) => e.id !== id);
    setStored(STORAGE_KEYS.EVENTS, list);
    UnifiedApiService.persistChange({
      section: 'events',
      action: 'delete',
      id,
      allData: list,
    }).catch(console.warn);
  },

  // 6b. Trial Slots and Assessment Sessions (MODULE 2)
  getTrialSlots: (): TrialSlot[] =>
    getStored<TrialSlot[]>(STORAGE_KEYS.TRIAL_SLOTS, DEFAULT_TRIAL_SLOTS),
  saveTrialSlots: (slots: TrialSlot[]) => {
    setStored(STORAGE_KEYS.TRIAL_SLOTS, slots);
    UnifiedApiService.persistChange({
      section: 'trials',
      action: 'syncAll',
      allData: slots,
    }).catch(console.warn);
  },
  updateTrialSlot: (id: string, updated: Partial<TrialSlot>) => {
    const list = AcademyDataManager.getTrialSlots();
    const index = list.findIndex((s) => s.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updated };
      setStored(STORAGE_KEYS.TRIAL_SLOTS, list);
      UnifiedApiService.persistChange({
        section: 'trials',
        action: 'upsert',
        data: list[index],
        allData: list,
      }).catch(console.warn);
    }
  },
  addTrialSlot: (slot: TrialSlot) => {
    const list = AcademyDataManager.getTrialSlots();
    list.push(slot);
    setStored(STORAGE_KEYS.TRIAL_SLOTS, list);
    UnifiedApiService.persistChange({
      section: 'trials',
      action: 'upsert',
      data: slot,
      allData: list,
    }).catch(console.warn);
  },
  deleteTrialSlot: (id: string) => {
    const list = AcademyDataManager.getTrialSlots().filter((s) => s.id !== id);
    setStored(STORAGE_KEYS.TRIAL_SLOTS, list);
    UnifiedApiService.persistChange({
      section: 'trials',
      action: 'delete',
      id,
      allData: list,
    }).catch(console.warn);
  },

  // 7. Scholarship Programs (MODULE 4)
  getScholarships: (): ScholarshipTier[] =>
    getStored<ScholarshipTier[]>(STORAGE_KEYS.SCHOLARSHIPS, SCHOLARSHIP_TIERS),
  saveScholarships: (tiers: ScholarshipTier[]) => {
    setStored(STORAGE_KEYS.SCHOLARSHIPS, tiers);
    UnifiedApiService.persistChange({
      section: 'scholarships',
      action: 'syncAll',
      allData: tiers,
    }).catch(console.warn);
  },
  updateScholarship: (id: string, updated: Partial<ScholarshipTier>) => {
    const list = AcademyDataManager.getScholarships();
    const index = list.findIndex((t) => t.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updated };
      setStored(STORAGE_KEYS.SCHOLARSHIPS, list);
      UnifiedApiService.persistChange({
        section: 'scholarships',
        action: 'upsert',
        data: list[index],
        allData: list,
      }).catch(console.warn);
    }
  },
  addScholarship: (tier: ScholarshipTier) => {
    const list = AcademyDataManager.getScholarships();
    list.push(tier);
    setStored(STORAGE_KEYS.SCHOLARSHIPS, list);
    UnifiedApiService.persistChange({
      section: 'scholarships',
      action: 'upsert',
      data: tier,
      allData: list,
    }).catch(console.warn);
  },
  deleteScholarship: (id: string) => {
    const list = AcademyDataManager.getScholarships().filter((t) => t.id !== id);
    setStored(STORAGE_KEYS.SCHOLARSHIPS, list);
    UnifiedApiService.persistChange({
      section: 'scholarships',
      action: 'delete',
      id,
      allData: list,
    }).catch(console.warn);
  },

  // 8. Testimonials & Success Stories & Parent Reviews (MODULES 5 & 6)
  getTestimonials: (): TestimonialItem[] =>
    getStored<TestimonialItem[]>(STORAGE_KEYS.TESTIMONIALS, ACADEMY_TESTIMONIALS),
  saveTestimonials: (testimonials: TestimonialItem[]) => {
    setStored(STORAGE_KEYS.TESTIMONIALS, testimonials);
    UnifiedApiService.persistChange({
      section: 'testimonials',
      action: 'syncAll',
      allData: testimonials,
    }).catch(console.warn);
  },
  updateTestimonial: (id: string, updated: Partial<TestimonialItem>) => {
    const list = AcademyDataManager.getTestimonials();
    const index = list.findIndex((t) => t.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updated };
      setStored(STORAGE_KEYS.TESTIMONIALS, list);
      UnifiedApiService.persistChange({
        section: 'testimonials',
        action: 'upsert',
        data: list[index],
        allData: list,
      }).catch(console.warn);
    }
  },
  addTestimonial: (testimonial: TestimonialItem) => {
    const list = AcademyDataManager.getTestimonials();
    list.unshift(testimonial);
    setStored(STORAGE_KEYS.TESTIMONIALS, list);
    UnifiedApiService.persistChange({
      section: 'testimonials',
      action: 'upsert',
      data: testimonial,
      allData: list,
    }).catch(console.warn);
  },
  deleteTestimonial: (id: string) => {
    const list = AcademyDataManager.getTestimonials().filter((t) => t.id !== id);
    setStored(STORAGE_KEYS.TESTIMONIALS, list);
    UnifiedApiService.persistChange({
      section: 'testimonials',
      action: 'delete',
      id,
      allData: list,
    }).catch(console.warn);
  },

  // 9. Sponsors & Brand Partners (MODULE 7)
  getSponsors: (): SponsorPartner[] =>
    getStored<SponsorPartner[]>(STORAGE_KEYS.SPONSORS, DEFAULT_SPONSORS),
  saveSponsors: (sponsors: SponsorPartner[]) => {
    setStored(STORAGE_KEYS.SPONSORS, sponsors);
    UnifiedApiService.persistChange({
      section: 'sponsors',
      action: 'syncAll',
      allData: sponsors,
    }).catch(console.warn);
  },
  updateSponsor: (id: string, updated: Partial<SponsorPartner>) => {
    const list = AcademyDataManager.getSponsors();
    const index = list.findIndex((s) => s.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updated };
      setStored(STORAGE_KEYS.SPONSORS, list);
      UnifiedApiService.persistChange({
        section: 'sponsors',
        action: 'upsert',
        data: list[index],
        allData: list,
      }).catch(console.warn);
    }
  },
  addSponsor: (sponsor: SponsorPartner) => {
    const list = AcademyDataManager.getSponsors();
    list.push(sponsor);
    setStored(STORAGE_KEYS.SPONSORS, list);
    UnifiedApiService.persistChange({
      section: 'sponsors',
      action: 'upsert',
      data: sponsor,
      allData: list,
    }).catch(console.warn);
  },
  deleteSponsor: (id: string) => {
    const list = AcademyDataManager.getSponsors().filter((s) => s.id !== id);
    setStored(STORAGE_KEYS.SPONSORS, list);
    UnifiedApiService.persistChange({
      section: 'sponsors',
      action: 'delete',
      id,
      allData: list,
    }).catch(console.warn);
  },

  // 10. Parent Deliverables (MODULE 5)
  getParentDeliverables: (): ParentDeliverableItem[] =>
    getStored<ParentDeliverableItem[]>(STORAGE_KEYS.PARENT_DELIVERABLES, DEFAULT_PARENT_DELIVERABLES),
  saveParentDeliverables: (items: ParentDeliverableItem[]) => {
    setStored(STORAGE_KEYS.PARENT_DELIVERABLES, items);
    UnifiedApiService.persistChange({
      section: 'parentDeliverables',
      action: 'syncAll',
      allData: items,
    }).catch(console.warn);
  },
  updateParentDeliverable: (id: string, updated: Partial<ParentDeliverableItem>) => {
    const list = AcademyDataManager.getParentDeliverables();
    const index = list.findIndex((d) => d.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updated };
      setStored(STORAGE_KEYS.PARENT_DELIVERABLES, list);
      UnifiedApiService.persistChange({
        section: 'parentDeliverables',
        action: 'upsert',
        data: list[index],
        allData: list,
      }).catch(console.warn);
    }
  },
  addParentDeliverable: (item: ParentDeliverableItem) => {
    const list = AcademyDataManager.getParentDeliverables();
    list.push(item);
    setStored(STORAGE_KEYS.PARENT_DELIVERABLES, list);
    UnifiedApiService.persistChange({
      section: 'parentDeliverables',
      action: 'upsert',
      data: item,
      allData: list,
    }).catch(console.warn);
  },
  deleteParentDeliverable: (id: string) => {
    const list = AcademyDataManager.getParentDeliverables().filter((d) => d.id !== id);
    setStored(STORAGE_KEYS.PARENT_DELIVERABLES, list);
    UnifiedApiService.persistChange({
      section: 'parentDeliverables',
      action: 'delete',
      id,
      allData: list,
    }).catch(console.warn);
  },

  // 11. Digital Portal Access Config (MODULE 8)
  getPortalConfig: (): DigitalPortalConfig =>
    getStored<DigitalPortalConfig>(STORAGE_KEYS.PORTAL_CONFIG, DEFAULT_PORTAL_CONFIG),
  savePortalConfig: (config: DigitalPortalConfig) => {
    setStored(STORAGE_KEYS.PORTAL_CONFIG, config);
    UnifiedApiService.persistChange({
      section: 'portalConfig',
      action: 'syncAll',
      data: config,
    }).catch(console.warn);
  },
  updatePortalConfig: (partial: Partial<DigitalPortalConfig>) => {
    const current = AcademyDataManager.getPortalConfig();
    const updated = { ...current, ...partial };
    AcademyDataManager.savePortalConfig(updated);
  },

  // 12. Component Toggles
  getComponentToggles: (): ComponentToggles =>
    getStored<ComponentToggles>(STORAGE_KEYS.COMPONENT_TOGGLES, DEFAULT_TOGGLES),
  saveComponentToggles: (toggles: ComponentToggles) => {
    setStored(STORAGE_KEYS.COMPONENT_TOGGLES, toggles);
    UnifiedApiService.persistChange({
      section: 'toggles',
      action: 'syncAll',
      data: toggles,
    }).catch(console.warn);
  },
  toggleComponent: (key: keyof ComponentToggles) => {
    const current = AcademyDataManager.getComponentToggles();
    current[key] = !current[key];
    AcademyDataManager.saveComponentToggles(current);
  },

  // Developer Session Management
  isDeveloperAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.DEV_SESSION) === 'true';
  },
  setDeveloperAuthenticated: (auth: boolean) => {
    if (typeof window === 'undefined') return;
    if (auth) {
      localStorage.setItem(STORAGE_KEYS.DEV_SESSION, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.DEV_SESSION);
    }
  },

  // Bulk push everything to Supabase
  syncAllToSupabase: async () => {
    return UnifiedApiService.syncAllSections({
      heroConfig: AcademyDataManager.getHeroConfig(),
      coaches: AcademyDataManager.getCoaches(),
      fixtures: AcademyDataManager.getFixtures(),
      news: AcademyDataManager.getNews(),
      campuses: AcademyDataManager.getCampuses(),
      programs: AcademyDataManager.getPrograms(),
      events: AcademyDataManager.getEvents(),
      trials: AcademyDataManager.getTrialSlots(),
      scholarships: AcademyDataManager.getScholarships(),
      testimonials: AcademyDataManager.getTestimonials(),
      sponsors: AcademyDataManager.getSponsors(),
      parentDeliverables: AcademyDataManager.getParentDeliverables(),
      portalConfig: AcademyDataManager.getPortalConfig(),
      toggles: AcademyDataManager.getComponentToggles(),
    });
  },

  // Hydrate all local modules from remote Supabase if data exists
  loadAllFromSupabase: async (): Promise<{ updated: boolean; count: number }> => {
    if (typeof window === 'undefined') return { updated: false, count: 0 };
    try {
      const res = await UnifiedApiService.fetchFromSupabase('all');
      if (res.success && res.data) {
        let updatedCount = 0;
        const d = res.data;

        if (d.heroConfig && typeof d.heroConfig === 'object') {
          setStored(STORAGE_KEYS.HERO_CONFIG, { ...DEFAULT_HERO_CONFIG, ...d.heroConfig });
          updatedCount++;
        }
        if (Array.isArray(d.coaches) && d.coaches.length > 0) {
          setStored(STORAGE_KEYS.COACHES, d.coaches);
          updatedCount++;
        }
        if (Array.isArray(d.fixtures) && d.fixtures.length > 0) {
          setStored(STORAGE_KEYS.FIXTURES, d.fixtures);
          updatedCount++;
        }
        if (Array.isArray(d.news) && d.news.length > 0) {
          setStored(STORAGE_KEYS.NEWS, d.news);
          updatedCount++;
        }
        if (Array.isArray(d.campuses) && d.campuses.length > 0) {
          setStored(STORAGE_KEYS.CAMPUSES, d.campuses);
          updatedCount++;
        }
        if (Array.isArray(d.programs) && d.programs.length > 0) {
          setStored(STORAGE_KEYS.PROGRAMS, d.programs);
          updatedCount++;
        }
        if (Array.isArray(d.events) && d.events.length > 0) {
          setStored(STORAGE_KEYS.EVENTS, d.events);
          updatedCount++;
        }
        if (Array.isArray(d.trials) && d.trials.length > 0) {
          setStored(STORAGE_KEYS.TRIAL_SLOTS, d.trials);
          updatedCount++;
        }
        if (Array.isArray(d.scholarships) && d.scholarships.length > 0) {
          setStored(STORAGE_KEYS.SCHOLARSHIPS, d.scholarships);
          updatedCount++;
        }
        if (Array.isArray(d.testimonials) && d.testimonials.length > 0) {
          setStored(STORAGE_KEYS.TESTIMONIALS, d.testimonials);
          updatedCount++;
        }
        if (Array.isArray(d.sponsors) && d.sponsors.length > 0) {
          setStored(STORAGE_KEYS.SPONSORS, d.sponsors);
          updatedCount++;
        }
        if (Array.isArray(d.parentDeliverables) && d.parentDeliverables.length > 0) {
          setStored(STORAGE_KEYS.PARENT_DELIVERABLES, d.parentDeliverables);
          updatedCount++;
        }
        if (d.portalConfig && typeof d.portalConfig === 'object') {
          setStored(STORAGE_KEYS.PORTAL_CONFIG, { ...DEFAULT_PORTAL_CONFIG, ...d.portalConfig });
          updatedCount++;
        }
        if (d.toggles && typeof d.toggles === 'object') {
          setStored(STORAGE_KEYS.COMPONENT_TOGGLES, { ...DEFAULT_TOGGLES, ...d.toggles });
          updatedCount++;
        }

        if (updatedCount > 0) {
          localStorage.setItem(STORAGE_KEYS.LAST_REMOTE_SYNC, new Date().toISOString());
        }

        return { updated: updatedCount > 0, count: updatedCount };
      }
      return { updated: false, count: 0 };
    } catch (e) {
      console.warn('Could not load data from Supabase:', e);
      return { updated: false, count: 0 };
    }
  },

  // Reset all to defaults
  resetAllToDefaults: () => {
    if (typeof window === 'undefined') return;
    Object.keys(memoryCache).forEach((k) => delete memoryCache[k]);
    localStorage.removeItem(STORAGE_KEYS.HERO_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.PROGRAMS);
    localStorage.removeItem(STORAGE_KEYS.CAMPUSES);
    localStorage.removeItem(STORAGE_KEYS.COACHES);
    localStorage.removeItem(STORAGE_KEYS.FIXTURES);
    localStorage.removeItem(STORAGE_KEYS.NEWS);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.SCHOLARSHIPS);
    localStorage.removeItem(STORAGE_KEYS.TESTIMONIALS);
    localStorage.removeItem(STORAGE_KEYS.SPONSORS);
    localStorage.removeItem(STORAGE_KEYS.PARENT_DELIVERABLES);
    localStorage.removeItem(STORAGE_KEYS.PORTAL_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.COMPONENT_TOGGLES);
    window.dispatchEvent(new Event('maden_data_updated'));
  },
};
