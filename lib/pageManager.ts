'use client';

import { AcademyDataManager } from '@/lib/academyDataManager';

export interface PageItem {
  id: string;
  title: string;
  slug: string; // e.g. '/programs'
  description: string;
  status: 'published' | 'draft' | 'archived';
  accessLevel: 'public' | 'login_required' | 'role_restricted';
  allowedRoles: ('player' | 'parent' | 'coach' | 'admin')[];
  navigationLocation: 'header' | 'submenu' | 'footer' | 'both' | 'none';
  template:
    | 'home'
    | 'programs'
    | 'campuses'
    | 'coaches'
    | 'pathway'
    | 'fixtures'
    | 'events'
    | 'news'
    | 'scholarships'
    | 'parentExperience'
    | 'successStories'
    | 'about'
    | 'contact'
    | 'join'
    | 'login'
    | 'portal'
    | 'custom';
  isSystemPage: boolean;
  seoTitle: string;
  seoDescription: string;
  customContent?: string;
  updatedAt: string;
}

export const DEFAULT_PAGES: PageItem[] = [
  {
    id: 'page-home',
    title: 'Home',
    slug: '/',
    description: 'MADEN FAF flagship landing page with cinema hero showcase, stats, storytelling, and intake registration.',
    status: 'published',
    accessLevel: 'public',
    allowedRoles: ['player', 'parent', 'coach', 'admin'],
    navigationLocation: 'header',
    template: 'home',
    isSystemPage: true,
    seoTitle: 'MADEN FAF — Official Football Academy Foundation',
    seoDescription: 'Premier youth football academy in West Bengal. AFC/AIFF certified technical coaching, modern campuses, and international player pathway.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-about',
    title: 'About & Philosophy',
    slug: '/about',
    description: 'Academy heritage, technical methodology, 4 core pillars, mission, and youth development ethos.',
    status: 'published',
    accessLevel: 'public',
    allowedRoles: ['player', 'parent', 'coach', 'admin'],
    navigationLocation: 'header',
    template: 'about',
    isSystemPage: true,
    seoTitle: 'About MADEN FAF — Youth Football Philosophy & Vision',
    seoDescription: 'Learn about MADEN Football Academy Foundation, our holistic training pillars, international partnerships, and grassroots development in Bengal.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-programs',
    title: 'Football Programs',
    slug: '/programs',
    description: 'Structured youth training curriculums: Grassroots (U6–U9), Youth (U10–U13), Advanced (U14–U15), Elite Pro (U16–U18), Goalkeeping, and Girls Football.',
    status: 'published',
    accessLevel: 'public',
    allowedRoles: ['player', 'parent', 'coach', 'admin'],
    navigationLocation: 'header',
    template: 'programs',
    isSystemPage: true,
    seoTitle: 'Training Programs & Curriculums — MADEN FAF',
    seoDescription: 'Explore age-specific youth football training programs with AFC/AIFF licensed coaches, player assessment reports, and competitive league schedules.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-pathway',
    title: 'The MADEN Pathway',
    slug: '/pathway',
    description: '5-stage player development pathway from Grassroots Foundation to Youth Development, Elite Academy, and Professional Scouting.',
    status: 'published',
    accessLevel: 'public',
    allowedRoles: ['player', 'parent', 'coach', 'admin'],
    navigationLocation: 'submenu',
    template: 'pathway',
    isSystemPage: true,
    seoTitle: 'The MADEN Pathway — 5-Stage Youth Football Development',
    seoDescription: 'A transparent development roadmap guiding young footballers from basic motor skills to elite tactical execution and pro trials.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-campuses',
    title: 'Campus Network',
    slug: '/campuses',
    description: 'State-of-the-art training centers in Gayeshpur, Kalyani, and Kolkata with FIFA-spec turf, floodlights, and gym facilities.',
    status: 'published',
    accessLevel: 'public',
    allowedRoles: ['player', 'parent', 'coach', 'admin'],
    navigationLocation: 'header',
    template: 'campuses',
    isSystemPage: true,
    seoTitle: 'Campus Network & Facilities — MADEN FAF',
    seoDescription: 'Find your nearest MADEN FAF training ground across Bengal. Explore pitch turf specifications, amenities, and book campus evaluations.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-coaches',
    title: 'Coaching Staff & Mentors',
    slug: '/coaches',
    description: 'Licensed technical leadership roster: AFC and UEFA certified instructors, specialized mentors, and goalkeeper trainers.',
    status: 'published',
    accessLevel: 'public',
    allowedRoles: ['player', 'parent', 'coach', 'admin'],
    navigationLocation: 'header',
    template: 'coaches',
    isSystemPage: true,
    seoTitle: 'Licensed Technical Coaching Staff — MADEN FAF',
    seoDescription: 'Meet the AFC and UEFA credentialed mentors leading youth development at MADEN FAF.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-fixtures',
    title: 'Match Centre & Fixtures',
    slug: '/fixtures',
    description: 'Competitive match fixtures, tournament schedules, live results, scorecard archives, and referee reports.',
    status: 'published',
    accessLevel: 'public',
    allowedRoles: ['player', 'parent', 'coach', 'admin'],
    navigationLocation: 'header',
    template: 'fixtures',
    isSystemPage: true,
    seoTitle: 'Match Centre & Upcoming Fixtures — MADEN FAF',
    seoDescription: 'Track MADEN FAF competitive matches, tournament scoreboards, match recaps, and player performance stats.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-events',
    title: 'Camps & Assessment Events',
    slug: '/events',
    description: 'Holiday football masterclasses, weekend development clinics, and official talent scout evaluation dates.',
    status: 'published',
    accessLevel: 'public',
    allowedRoles: ['player', 'parent', 'coach', 'admin'],
    navigationLocation: 'submenu',
    template: 'events',
    isSystemPage: true,
    seoTitle: 'Holiday Camps & Scout Assessment Events — MADEN FAF',
    seoDescription: 'Register for seasonal training camps, holiday masterclasses, and scout assessment trials at MADEN FAF.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-news',
    title: 'News & Club Stories',
    slug: '/news',
    description: 'Official press releases, academy milestones, match recaps, scouting signings, and player spotlights.',
    status: 'published',
    accessLevel: 'public',
    allowedRoles: ['player', 'parent', 'coach', 'admin'],
    navigationLocation: 'header',
    template: 'news',
    isSystemPage: true,
    seoTitle: 'News & Official Stories — MADEN FAF',
    seoDescription: 'Stay updated with the latest news, tournament updates, player milestones, and announcements from MADEN FAF.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-scholarships',
    title: 'Scholarship Programs',
    slug: '/scholarships',
    description: 'Full-ride (100%), merit-based, and need-based financial aid tiers ensuring football talent is nurtured regardless of economic background.',
    status: 'published',
    accessLevel: 'public',
    allowedRoles: ['player', 'parent', 'coach', 'admin'],
    navigationLocation: 'footer',
    template: 'scholarships',
    isSystemPage: true,
    seoTitle: 'Scholarships & Financial Aid — MADEN FAF',
    seoDescription: 'Learn about MADEN FAF 100% full-ride and need-based youth scholarships, eligibility requirements, and application procedures.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-parent-experience',
    title: 'Parent Experience & Reviews',
    slug: '/parent-experience',
    description: 'Weekly WhatsApp performance reporting, GPS player tracking metrics, transparent deliverables, and verified parent reviews.',
    status: 'published',
    accessLevel: 'public',
    allowedRoles: ['player', 'parent', 'coach', 'admin'],
    navigationLocation: 'submenu',
    template: 'parentExperience',
    isSystemPage: true,
    seoTitle: 'Parent Experience & Testimonials — MADEN FAF',
    seoDescription: 'Discover how MADEN FAF partners with parents through weekly metrics, academic balance, and transparent progress reports.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-success-stories',
    title: 'Success Stories & Alumni',
    slug: '/success-stories',
    description: 'Graduate profiles, signings with I-League/ISL youth academies, university sports scholarships, and player testimonials.',
    status: 'published',
    accessLevel: 'public',
    allowedRoles: ['player', 'parent', 'coach', 'admin'],
    navigationLocation: 'footer',
    template: 'successStories',
    isSystemPage: true,
    seoTitle: 'Alumni & Player Success Stories — MADEN FAF',
    seoDescription: 'Meet the graduates and alumni of MADEN FAF who have progressed to national leagues, state teams, and college scholarships.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-contact',
    title: 'Contact & Admissions',
    slug: '/contact',
    description: 'Admissions office, campus phone numbers, WhatsApp contact, direct enquiry form, and visiting hours.',
    status: 'published',
    accessLevel: 'public',
    allowedRoles: ['player', 'parent', 'coach', 'admin'],
    navigationLocation: 'footer',
    template: 'contact',
    isSystemPage: true,
    seoTitle: 'Contact Admissions Office — MADEN FAF',
    seoDescription: 'Get in touch with MADEN Football Academy Foundation. Campus directions, telephone lines, and admissions enquiry form.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-join',
    title: 'Book a Trial / Registration',
    slug: '/join',
    description: 'Online player trial application and official intake registration for the 2026/27 youth season.',
    status: 'published',
    accessLevel: 'public',
    allowedRoles: ['player', 'parent', 'coach', 'admin'],
    navigationLocation: 'header',
    template: 'join',
    isSystemPage: true,
    seoTitle: 'Book Evaluation Session / Join MADEN FAF',
    seoDescription: 'Apply online for on-pitch evaluation session at Gayeshpur, Kalyani, or Kolkata campuses.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-login',
    title: 'Digital Portal Login',
    slug: '/login',
    description: 'Sign in to access player evaluation dashboards, parent weekly logs, coach planner, and administration.',
    status: 'published',
    accessLevel: 'public',
    allowedRoles: ['player', 'parent', 'coach', 'admin'],
    navigationLocation: 'header',
    template: 'login',
    isSystemPage: true,
    seoTitle: 'Digital Portal Gateway — MADEN FAF',
    seoDescription: 'Access your authenticated player passport, attendance metrics, and coach feedback.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-portal-dashboard',
    title: 'Member Digital Portal',
    slug: '/portal',
    description: 'Private authenticated dashboard for enrolled players, parents, technical staff, and academy managers.',
    status: 'published',
    accessLevel: 'login_required',
    allowedRoles: ['player', 'parent', 'coach', 'admin'],
    navigationLocation: 'none',
    template: 'portal',
    isSystemPage: true,
    seoTitle: 'Player & Parent Portal — MADEN FAF',
    seoDescription: 'Authenticated player performance passport and training calendar.',
    updatedAt: new Date().toISOString(),
  },
];

const PAGES_STORAGE_KEY = 'maden_dev_pages_cms_v1';

export class PageManagerService {
  private static memoryCache: PageItem[] | null = null;

  static getPages(): PageItem[] {
    if (typeof window === 'undefined') return DEFAULT_PAGES;
    try {
      if (this.memoryCache) return this.memoryCache;
      const raw = localStorage.getItem(PAGES_STORAGE_KEY);
      if (!raw) {
        this.savePages(DEFAULT_PAGES);
        return DEFAULT_PAGES;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        this.memoryCache = parsed;
        return parsed;
      }
      return DEFAULT_PAGES;
    } catch {
      return DEFAULT_PAGES;
    }
  }

  static savePages(pages: PageItem[]): boolean {
    if (typeof window === 'undefined') return false;
    try {
      this.memoryCache = pages;
      localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(pages));
      // Notify external stores
      AcademyDataManager.dispatchDataChange();
      return true;
    } catch {
      return false;
    }
  }

  static getPageBySlug(slug: string): PageItem | undefined {
    const pages = this.getPages();
    const cleanSlug = slug.startsWith('/') ? slug : `/${slug}`;
    return pages.find((p) => p.slug === cleanSlug);
  }

  static getPageById(id: string): PageItem | undefined {
    return this.getPages().find((p) => p.id === id);
  }

  static updatePage(id: string, updates: Partial<PageItem>): boolean {
    const pages = this.getPages();
    const idx = pages.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    pages[idx] = {
      ...pages[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.savePages([...pages]);
  }

  static createPage(newPage: Omit<PageItem, 'id' | 'updatedAt'>): PageItem {
    const pages = this.getPages();
    const id = `page-custom-${Date.now()}`;
    const page: PageItem = {
      ...newPage,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.savePages([...pages, page]);
    return page;
  }

  static deletePage(id: string): { success: boolean; error?: string } {
    const pages = this.getPages();
    const page = pages.find((p) => p.id === id);
    if (!page) return { success: false, error: 'Page not found' };
    if (page.isSystemPage) {
      return { success: false, error: 'Cannot delete core system page required by the academy.' };
    }
    const filtered = pages.filter((p) => p.id !== id);
    this.savePages(filtered);
    return { success: true };
  }

  static resetToDefault(): void {
    this.savePages(DEFAULT_PAGES);
  }
}
