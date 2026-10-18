'use client';

import {
  AcademyDataManager,
  HeaderConfig,
  HeaderMenuItem,
  HeaderSublink,
  FooterConfig,
  FooterColumn,
  DEFAULT_HEADER_CONFIG,
  DEFAULT_FOOTER_CONFIG,
} from '@/lib/academyDataManager';
import { PageItem, PageManagerService } from '@/lib/pageManager';

export interface NavCmsItem {
  id: string;
  label: string;
  href: string;
  itemType: 'page' | 'external' | 'dropdown_header';
  parentId: string | null; // For nested submenus
  sortOrder: number;
  location: 'header' | 'footer' | 'both';
  pageId?: string;
  icon?: string;
  badge?: string;
  desc?: string;
  isEnabled: boolean;
  visibility: 'public' | 'authenticated_only' | 'guest_only';
  permittedRoles: ('all' | 'player' | 'parent' | 'coach' | 'admin')[];
  openInNewTab: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const NAV_CMS_STORAGE_KEY = 'maden_dev_navigation_cms_v1';

export const DEFAULT_NAV_ITEMS: NavCmsItem[] = [
  // 1. ABOUT
  {
    id: 'nav-about',
    label: 'ABOUT',
    href: '/about',
    itemType: 'page',
    parentId: null,
    sortOrder: 1,
    location: 'both',
    pageId: 'page-about',
    isEnabled: true,
    visibility: 'public',
    permittedRoles: ['all'],
    openInNewTab: false,
  },
  {
    id: 'nav-about-who',
    label: 'Philosophy & Heritage',
    href: '/about',
    itemType: 'page',
    parentId: 'nav-about',
    sortOrder: 1,
    location: 'header',
    desc: 'Our vision, mission, and youth football ethos',
    isEnabled: true,
    visibility: 'public',
    permittedRoles: ['all'],
    openInNewTab: false,
  },
  {
    id: 'nav-about-pathway',
    label: 'The MADEN Pathway',
    href: '/pathway',
    itemType: 'page',
    parentId: 'nav-about',
    sortOrder: 2,
    location: 'header',
    desc: '5-stage player development roadmap',
    badge: 'CORE',
    isEnabled: true,
    visibility: 'public',
    permittedRoles: ['all'],
    openInNewTab: false,
  },
  {
    id: 'nav-about-coaches',
    label: 'Coaching Staff & Mentors',
    href: '/coaches',
    itemType: 'page',
    parentId: 'nav-about',
    sortOrder: 3,
    location: 'header',
    desc: 'Meet our AFC & AIFF certified technical panel',
    isEnabled: true,
    visibility: 'public',
    permittedRoles: ['all'],
    openInNewTab: false,
  },
  {
    id: 'nav-about-parent',
    label: 'Parent Experience & Reviews',
    href: '/parent-experience',
    itemType: 'page',
    parentId: 'nav-about',
    sortOrder: 4,
    location: 'header',
    desc: 'Weekly reports, GPS metrics & reviews',
    isEnabled: true,
    visibility: 'public',
    permittedRoles: ['all'],
    openInNewTab: false,
  },
  {
    id: 'nav-about-stories',
    label: 'Success Stories & Alumni',
    href: '/success-stories',
    itemType: 'page',
    parentId: 'nav-about',
    sortOrder: 5,
    location: 'header',
    desc: 'Alumni signings and collegiate awards',
    isEnabled: true,
    visibility: 'public',
    permittedRoles: ['all'],
    openInNewTab: false,
  },

  // 2. PROGRAMS
  {
    id: 'nav-programs',
    label: 'PROGRAMS',
    href: '/programs',
    itemType: 'page',
    parentId: null,
    sortOrder: 2,
    location: 'both',
    pageId: 'page-programs',
    badge: 'POPULAR',
    isEnabled: true,
    visibility: 'public',
    permittedRoles: ['all'],
    openInNewTab: false,
  },
  {
    id: 'nav-prog-all',
    label: 'All Training Programs',
    href: '/programs',
    itemType: 'page',
    parentId: 'nav-programs',
    sortOrder: 1,
    location: 'header',
    desc: 'Explore complete syllabus and age divisions',
    isEnabled: true,
    visibility: 'public',
    permittedRoles: ['all'],
    openInNewTab: false,
  },
  {
    id: 'nav-prog-scholarship',
    label: 'Scholarship Programs',
    href: '/scholarships',
    itemType: 'page',
    parentId: 'nav-programs',
    sortOrder: 2,
    location: 'header',
    desc: 'Full-ride 100% and need-based financial aid',
    badge: 'AID',
    isEnabled: true,
    visibility: 'public',
    permittedRoles: ['all'],
    openInNewTab: false,
  },

  // 3. CAMPUSES
  {
    id: 'nav-campuses',
    label: 'CAMPUSES',
    href: '/campuses',
    itemType: 'page',
    parentId: null,
    sortOrder: 3,
    location: 'both',
    pageId: 'page-campuses',
    badge: '3 SITES',
    isEnabled: true,
    visibility: 'public',
    permittedRoles: ['all'],
    openInNewTab: false,
  },

  // 4. MATCH CENTRE & FIXTURES
  {
    id: 'nav-fixtures',
    label: 'MATCH CENTRE',
    href: '/fixtures',
    itemType: 'page',
    parentId: null,
    sortOrder: 4,
    location: 'both',
    pageId: 'page-fixtures',
    badge: 'LIVE',
    isEnabled: true,
    visibility: 'public',
    permittedRoles: ['all'],
    openInNewTab: false,
  },

  // 5. CAMPS & EVENTS
  {
    id: 'nav-events',
    label: 'CAMPS & EVENTS',
    href: '/events',
    itemType: 'page',
    parentId: null,
    sortOrder: 5,
    location: 'both',
    pageId: 'page-events',
    isEnabled: true,
    visibility: 'public',
    permittedRoles: ['all'],
    openInNewTab: false,
  },

  // 6. NEWS
  {
    id: 'nav-news',
    label: 'NEWS',
    href: '/news',
    itemType: 'page',
    parentId: null,
    sortOrder: 6,
    location: 'both',
    pageId: 'page-news',
    isEnabled: true,
    visibility: 'public',
    permittedRoles: ['all'],
    openInNewTab: false,
  },

  // 7. CONTACT
  {
    id: 'nav-contact',
    label: 'CONTACT',
    href: '/contact',
    itemType: 'page',
    parentId: null,
    sortOrder: 7,
    location: 'both',
    pageId: 'page-contact',
    isEnabled: true,
    visibility: 'public',
    permittedRoles: ['all'],
    openInNewTab: false,
  },
];

export class NavigationCmsService {
  private static memoryCache: NavCmsItem[] | null = null;

  static getNavItems(): NavCmsItem[] {
    if (typeof window === 'undefined') return DEFAULT_NAV_ITEMS;
    try {
      if (this.memoryCache) return this.memoryCache;
      const raw = localStorage.getItem(NAV_CMS_STORAGE_KEY);
      if (!raw) {
        this.saveNavItems(DEFAULT_NAV_ITEMS);
        return DEFAULT_NAV_ITEMS;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        this.memoryCache = parsed;
        return parsed;
      }
      return DEFAULT_NAV_ITEMS;
    } catch {
      return DEFAULT_NAV_ITEMS;
    }
  }

  static saveNavItems(items: NavCmsItem[]): boolean {
    if (typeof window === 'undefined') return false;
    try {
      this.memoryCache = items;
      localStorage.setItem(NAV_CMS_STORAGE_KEY, JSON.stringify(items));

      // Also synchronize into HeaderConfig so the public header seamlessly reflects these items!
      this.syncToHeaderConfig(items);

      // Trigger store refresh
      AcademyDataManager.dispatchDataChange();
      return true;
    } catch {
      return false;
    }
  }

  // Synchronize NavCmsItems into HeaderConfig.menuItems
  static syncToHeaderConfig(navItems: NavCmsItem[]): void {
    try {
      const headerItems = navItems
        .filter((item) => (item.location === 'header' || item.location === 'both') && item.parentId === null)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      const menuItems: HeaderMenuItem[] = headerItems.map((parent) => {
        const subItems = navItems
          .filter((item) => item.parentId === parent.id && (item.location === 'header' || item.location === 'both'))
          .sort((a, b) => a.sortOrder - b.sortOrder);

        const sublinks: HeaderSublink[] = subItems.map((sub) => ({
          id: sub.id,
          title: sub.label,
          href: sub.href,
          desc: sub.desc || `Explore ${sub.label}`,
          badge: sub.badge,
        }));

        return {
          id: parent.id,
          label: parent.label,
          href: parent.href,
          visible: parent.isEnabled,
          badge: parent.badge,
          openInNewTab: parent.openInNewTab,
          sublinks: sublinks.length > 0 ? sublinks : undefined,
        };
      });

      const currentHeaderConfig = AcademyDataManager.getHeaderConfig();
      AcademyDataManager.saveHeaderConfig({
        ...currentHeaderConfig,
        menuItems,
      });
    } catch (e) {
      console.warn('Failed to sync Navigation CMS to HeaderConfig:', e);
    }
  }

  static addItem(item: Omit<NavCmsItem, 'id' | 'createdAt' | 'updatedAt'>): NavCmsItem {
    const items = this.getNavItems();
    const newItem: NavCmsItem = {
      ...item,
      id: `nav-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.saveNavItems([...items, newItem]);
    return newItem;
  }

  static updateItem(id: string, updates: Partial<NavCmsItem>): boolean {
    const items = this.getNavItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    items[idx] = {
      ...items[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.saveNavItems([...items]);
  }

  static deleteItem(id: string): boolean {
    const items = this.getNavItems();
    // Also remove or detach children to prevent orphaned submenus
    const filtered = items.filter((i) => i.id !== id && i.parentId !== id);
    return this.saveNavItems(filtered);
  }

  static reorderItem(id: string, direction: 'up' | 'down'): boolean {
    const items = this.getNavItems();
    const item = items.find((i) => i.id === id);
    if (!item) return false;

    // Siblings in same level
    const siblings = items
      .filter((i) => i.parentId === item.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const sIdx = siblings.findIndex((s) => s.id === id);
    if (direction === 'up' && sIdx > 0) {
      const prev = siblings[sIdx - 1];
      const tempOrder = item.sortOrder;
      item.sortOrder = prev.sortOrder;
      prev.sortOrder = tempOrder;
    } else if (direction === 'down' && sIdx < siblings.length - 1) {
      const next = siblings[sIdx + 1];
      const tempOrder = item.sortOrder;
      item.sortOrder = next.sortOrder;
      next.sortOrder = tempOrder;
    }

    return this.saveNavItems([...items]);
  }

  static resetToDefault(): void {
    this.saveNavItems(DEFAULT_NAV_ITEMS);
  }
}
