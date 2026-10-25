'use client';

import React, { useState } from 'react';
import {
  AcademyDataManager,
  HeaderConfig,
  FooterConfig,
  HeaderMenuItem,
  HeaderSublink,
  FooterColumn,
  FooterMenuItem,
  FooterSocialLink,
  DEFAULT_HEADER_CONFIG,
  DEFAULT_FOOTER_CONFIG,
} from '@/lib/academyDataManager';
import { MadenLogo } from '@/components/ui/MadenLogo';
import {
  Sparkles,
  Sliders,
  Menu,
  LayoutGrid,
  Shield,
  Layers,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Check,
  X,
  ExternalLink,
  RotateCcw,
  Save,
  Globe,
  Share2,
  Image as ImageIcon,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Link as LinkIcon,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  Twitter,
  Linkedin,
  MoveRight,
} from 'lucide-react';

interface HeaderFooterManagerProps {
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
  defaultSubTab?: 'headerBranding' | 'headerMenus' | 'footerBranding' | 'footerAllocation';
}

const PRESET_CUSTOM_LOGOS = [
  {
    label: 'MADEN FAF Official Identity Logo (Crest Badge)',
    url: '/images/maden-faf-official-logo.png',
  },
  {
    label: 'MADEN FAF Vector Master (SVG)',
    url: '/images/maden-faf-official-logo.svg',
  },
  {
    label: 'Modern Crimson & Gold Shield',
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Tactical Black & Gold Crest',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80',
  },
];

export const HeaderFooterManager: React.FC<HeaderFooterManagerProps> = ({
  onNotify,
  defaultSubTab = 'headerBranding',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'headerBranding' | 'headerMenus' | 'footerBranding' | 'footerAllocation'
  >(defaultSubTab);

  // States
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(() =>
    AcademyDataManager.getHeaderConfig()
  );
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(() =>
    AcademyDataManager.getFooterConfig()
  );

  const [isSaving, setIsSaving] = useState(false);

  // Modal / Form States
  const [editingMenuItem, setEditingMenuItem] = useState<HeaderMenuItem | null>(null);
  const [isNewMenuModalOpen, setIsNewMenuModalOpen] = useState(false);
  const [activeSubmenuParentId, setActiveSubmenuParentId] = useState<string | null>(null);
  const [editingSublink, setEditingSublink] = useState<{ parentId: string; sublink: HeaderSublink } | null>(null);
  const [isNewSublinkModalOpen, setIsNewSublinkModalOpen] = useState<string | null>(null);

  // Footer allocation states
  const [editingFooterItem, setEditingFooterItem] = useState<{ colId: string; item: FooterMenuItem } | null>(null);
  const [isNewFooterItemModalOpen, setIsNewFooterItemModalOpen] = useState<string | null>(null); // colId
  const [editingColumn, setEditingColumn] = useState<FooterColumn | null>(null);
  const [isNewColumnModalOpen, setIsNewColumnModalOpen] = useState(false);

  // Save Handlers
  const handleSaveHeader = async (newCfg: HeaderConfig = headerConfig) => {
    setIsSaving(true);
    try {
      AcademyDataManager.saveHeaderConfig(newCfg);
      setHeaderConfig(newCfg);
      onNotify({
        type: 'success',
        text: 'Header configuration & navigation saved and synced to cloud!',
      });
    } catch {
      onNotify({
        type: 'error',
        text: 'Failed to persist Header changes.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFooter = async (newCfg: FooterConfig = footerConfig) => {
    setIsSaving(true);
    try {
      AcademyDataManager.saveFooterConfig(newCfg);
      setFooterConfig(newCfg);
      onNotify({
        type: 'success',
        text: 'Footer configuration & column allocations saved and synced to cloud!',
      });
    } catch {
      onNotify({
        type: 'error',
        text: 'Failed to persist Footer changes.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetHeader = () => {
    const res = AcademyDataManager.resetHeaderConfig();
    setHeaderConfig(res);
    onNotify({
      type: 'success',
      text: 'Header restored to official MADEN default configuration.',
    });
  };

  const handleResetFooter = () => {
    const res = AcademyDataManager.resetFooterConfig();
    setFooterConfig(res);
    onNotify({
      type: 'success',
      text: 'Footer restored to official MADEN default column layout.',
    });
  };

  // ------------------------------------------
  // HEADER MENU REORDER & CRUD
  // ------------------------------------------
  const moveMenuItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...headerConfig.menuItems];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    const updated = { ...headerConfig, menuItems: newItems };
    setHeaderConfig(updated);
    handleSaveHeader(updated);
  };

  const toggleMenuItemVisibility = (id: string) => {
    const newItems = headerConfig.menuItems.map((item) =>
      item.id === id ? { ...item, visible: !item.visible } : item
    );
    const updated = { ...headerConfig, menuItems: newItems };
    setHeaderConfig(updated);
    handleSaveHeader(updated);
  };

  const deleteMenuItem = (id: string) => {
    const newItems = headerConfig.menuItems.filter((item) => item.id !== id);
    const updated = { ...headerConfig, menuItems: newItems };
    setHeaderConfig(updated);
    handleSaveHeader(updated);
    onNotify({ type: 'success', text: 'Menu item deleted successfully.' });
  };

  // ------------------------------------------
  // FOOTER COLUMN & ITEM ALLOCATION CRUD
  // ------------------------------------------
  const moveFooterItemWithinCol = (colId: string, index: number, direction: 'up' | 'down') => {
    const newColumns = footerConfig.columns.map((col) => {
      if (col.id !== colId) return col;
      const newItems = [...col.items];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= newItems.length) return col;
      const temp = newItems[index];
      newItems[index] = newItems[targetIdx];
      newItems[targetIdx] = temp;
      return { ...col, items: newItems };
    });
    const updated = { ...footerConfig, columns: newColumns };
    setFooterConfig(updated);
    handleSaveFooter(updated);
  };

  const reallocateFooterItem = (sourceColId: string, itemId: string, targetColId: string) => {
    if (sourceColId === targetColId) return;
    let itemToMove: FooterMenuItem | undefined;

    // Find and remove from source
    const colsWithoutItem = footerConfig.columns.map((col) => {
      if (col.id === sourceColId) {
        const item = col.items.find((i) => i.id === itemId);
        if (item) itemToMove = item;
        return { ...col, items: col.items.filter((i) => i.id !== itemId) };
      }
      return col;
    });

    if (!itemToMove) return;

    // Insert into target column
    const finalCols = colsWithoutItem.map((col) => {
      if (col.id === targetColId) {
        return { ...col, items: [...col.items, itemToMove!] };
      }
      return col;
    });

    const updated = { ...footerConfig, columns: finalCols };
    setFooterConfig(updated);
    handleSaveFooter(updated);
    onNotify({
      type: 'success',
      text: `Item allocated to ${footerConfig.columns.find((c) => c.id === targetColId)?.title || 'new column'}.`,
    });
  };

  const deleteFooterItem = (colId: string, itemId: string) => {
    const newCols = footerConfig.columns.map((col) => {
      if (col.id !== colId) return col;
      return { ...col, items: col.items.filter((i) => i.id !== itemId) };
    });
    const updated = { ...footerConfig, columns: newCols };
    setFooterConfig(updated);
    handleSaveFooter(updated);
    onNotify({ type: 'success', text: 'Footer item removed.' });
  };

  const deleteFooterColumn = (colId: string) => {
    if (footerConfig.columns.length <= 1) {
      onNotify({ type: 'error', text: 'Must keep at least 1 footer column.' });
      return;
    }
    const newCols = footerConfig.columns.filter((col) => col.id !== colId);
    const updated = { ...footerConfig, columns: newCols };
    setFooterConfig(updated);
    handleSaveFooter(updated);
    onNotify({ type: 'success', text: 'Footer column removed.' });
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Header & Footer Customization Studio
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                Core Structure
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Customize Academy crest & tagline, build nested desktop/mobile navigation menus, configure footer branding, and allocate footer columns.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (activeSubTab.startsWith('header')) handleResetHeader();
              else handleResetFooter();
            }}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={() => {
              if (activeSubTab.startsWith('header')) handleSaveHeader();
              else handleSaveFooter();
            }}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {/* Subtab Navigation Pills */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('headerBranding')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'headerBranding'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>1. Header Icon & Taglines</span>
        </button>

        <button
          onClick={() => setActiveSubTab('headerMenus')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'headerMenus'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Menu className="w-4 h-4 text-amber-500" />
          <span>2. Header Menus ({headerConfig.menuItems.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('footerBranding')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'footerBranding'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4 text-amber-500" />
          <span>3. Footer Icon & Tagline</span>
        </button>

        <button
          onClick={() => setActiveSubTab('footerAllocation')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'footerAllocation'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="w-4 h-4 text-amber-500" />
          <span>4. Footer Menus & Allocation</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUBTAB 1: HEADER ACADEMY ICON & TAGLINE                  */}
      {/* ======================================================== */}
      {activeSubTab === 'headerBranding' && (
        <div className="space-y-6">
          {/* Live Header Simulator Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-500" />
                  <span>Live Header Preview</span>
                </h3>
                <p className="text-xs text-slate-500">
                  How the academy icon, branding, and taglines render on the sticky top header.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Desktop & Mobile Viewport</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl px-5 py-3 shadow-xs flex items-center justify-between">
                <MadenLogo
                  size={headerConfig.logoSize || 'md'}
                  variant="horizontal"
                  lightText={false}
                  logoType={headerConfig.logoType}
                  customLogoUrl={headerConfig.customLogoUrl}
                  logoIconShape={headerConfig.logoIconShape}
                  title={headerConfig.academyTitle}
                  highlight={headerConfig.academyHighlight}
                  taglinePrimary={headerConfig.taglinePrimary}
                  taglineSecondary={headerConfig.taglineSecondary}
                  showTaglines={headerConfig.showTaglines}
                  badgeText={headerConfig.badgeText}
                  showBadge={headerConfig.showBadge}
                />

                <div className="hidden md:flex items-center gap-4 text-xs font-bold text-slate-600">
                  {headerConfig.menuItems.slice(0, 4).map((m) => (
                    <span key={m.id} className="hover:text-amber-600 cursor-pointer">
                      {m.label}
                    </span>
                  ))}
                  {headerConfig.ctaButtonVisible && (
                    <span className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-xs">
                      {headerConfig.ctaButtonText}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box A: Icon & Logo Type */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  <span>Academy Icon & Crest Selection</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Choose between the vector SVG gold crest or your custom academy logo image.
                </p>
              </div>

              {/* Logo Type Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHeaderConfig({ ...headerConfig, logoType: 'crest' })}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    headerConfig.logoType === 'crest'
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                    <span>Official Vector Crest (SVG)</span>
                    {headerConfig.logoType === 'crest' && (
                      <Check className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Standard MADEN gold championship star & pinstripe shield.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setHeaderConfig({ ...headerConfig, logoType: 'custom-image' })}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    headerConfig.logoType === 'custom-image'
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                    <span>Custom Image / Logo URL</span>
                    {headerConfig.logoType === 'custom-image' && (
                      <Check className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Use your uploaded club image, PNG badge, or sponsor crest.
                  </p>
                </button>
              </div>

              {/* Custom Image URL Input */}
              {headerConfig.logoType === 'custom-image' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 block">
                    Custom Logo Image URL (PNG, SVG, JPG, WebP)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={headerConfig.customLogoUrl}
                      onChange={(e) =>
                        setHeaderConfig({ ...headerConfig, customLogoUrl: e.target.value })
                      }
                      placeholder="https://example.com/logo.png"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Preset quick picks */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Quick Sample Logos:
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {PRESET_CUSTOM_LOGOS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setHeaderConfig({ ...headerConfig, customLogoUrl: p.url })
                          }
                          className="text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 text-[11px] text-slate-700 hover:text-amber-800 transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>{p.label}</span>
                          <span className="text-[10px] text-amber-600 font-mono">Use Preset</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shape & Sizing */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Logo Frame Shape
                      </label>
                      <select
                        value={headerConfig.logoIconShape || 'shield'}
                        onChange={(e) =>
                          setHeaderConfig({
                            ...headerConfig,
                            logoIconShape: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="shield">Shield Crest (Curved bottom)</option>
                        <option value="circle">Circular Round Badge</option>
                        <option value="rounded">Smooth Rounded Rectangle</option>
                        <option value="square">Standard Square</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Display Size
                      </label>
                      <select
                        value={headerConfig.logoSize || 'md'}
                        onChange={(e) =>
                          setHeaderConfig({
                            ...headerConfig,
                            logoSize: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="sm">Small (Compact)</option>
                        <option value="md">Medium (Default)</option>
                        <option value="lg">Large (Prominent)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Box B: Academy Title & Taglines */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Academy Title & Taglines</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Configure brand naming, typography accents, and motto taglines.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Academy Title
                  </label>
                  <input
                    type="text"
                    value={headerConfig.academyTitle}
                    onChange={(e) =>
                      setHeaderConfig({ ...headerConfig, academyTitle: e.target.value })
                    }
                    placeholder="MADEN"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Highlight Suffix
                  </label>
                  <input
                    type="text"
                    value={headerConfig.academyHighlight}
                    onChange={(e) =>
                      setHeaderConfig({ ...headerConfig, academyHighlight: e.target.value })
                    }
                    placeholder="FAF"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-amber-600 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Primary Tagline (Subtitle)
                </label>
                <input
                  type="text"
                  value={headerConfig.taglinePrimary}
                  onChange={(e) =>
                    setHeaderConfig({ ...headerConfig, taglinePrimary: e.target.value })
                  }
                  placeholder="Maden Football Academy Foundation"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Secondary Tagline (Motto / Ethos)
                </label>
                <input
                  type="text"
                  value={headerConfig.taglineSecondary}
                  onChange={(e) =>
                    setHeaderConfig({ ...headerConfig, taglineSecondary: e.target.value })
                  }
                  placeholder="Where Passion Meets Excellence"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-amber-600 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Show Taglines in Header
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Show or hide the secondary tagline on desktop navbar.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setHeaderConfig({ ...headerConfig, showTaglines: !headerConfig.showTaglines })
                    }
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      headerConfig.showTaglines ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Show Badge / Foundation Year
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Display badge pill beside academy title (e.g. {headerConfig.badgeText}).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setHeaderConfig({ ...headerConfig, showBadge: !headerConfig.showBadge })
                    }
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      headerConfig.showBadge ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                  </button>
                </div>

                {headerConfig.showBadge && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={headerConfig.badgeText}
                      onChange={(e) =>
                        setHeaderConfig({ ...headerConfig, badgeText: e.target.value })
                      }
                      placeholder="EST. 2021"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action CTAs in Header */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-amber-500" />
                <span>Header Action CTAs & Quick Buttons</span>
              </h3>
              <p className="text-xs text-slate-500">
                Configure primary call-to-action button and member portal button shown in the top navigation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Primary CTA Button</span>
                  <button
                    type="button"
                    onClick={() =>
                      setHeaderConfig({
                        ...headerConfig,
                        ctaButtonVisible: !headerConfig.ctaButtonVisible,
                      })
                    }
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      headerConfig.ctaButtonVisible ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                  </button>
                </div>
                <input
                  type="text"
                  value={headerConfig.ctaButtonText}
                  onChange={(e) =>
                    setHeaderConfig({ ...headerConfig, ctaButtonText: e.target.value })
                  }
                  placeholder="JOIN MADEN"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Member Portal Button</span>
                  <button
                    type="button"
                    onClick={() =>
                      setHeaderConfig({
                        ...headerConfig,
                        portalButtonVisible: !headerConfig.portalButtonVisible,
                      })
                    }
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      headerConfig.portalButtonVisible ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                  </button>
                </div>
                <input
                  type="text"
                  value={headerConfig.portalButtonText}
                  onChange={(e) =>
                    setHeaderConfig({ ...headerConfig, portalButtonText: e.target.value })
                  }
                  placeholder="LOGIN"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 2: HEADER MENUES (CRUD & SUBMENU BUILDER)         */}
      {/* ======================================================== */}
      {activeSubTab === 'headerMenus' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Menu className="w-4 h-4 text-amber-500" />
                <span>Header Navigation Menu Items</span>
              </h3>
              <p className="text-xs text-slate-500">
                Manage top-level navigation links, reorder items, customize badges, or add rich dropdown submenus.
              </p>
            </div>

            <button
              onClick={() => setIsNewMenuModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-amber-500/20 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Top-Level Menu</span>
            </button>
          </div>

          {/* Menus List */}
          <div className="space-y-3">
            {headerConfig.menuItems.map((item, index) => {
              const sublinksCount = item.sublinks?.length || 0;
              const isSubmenuExpanded = activeSubmenuParentId === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-2xl transition-all shadow-xs overflow-hidden ${
                    item.visible ? 'border-slate-200' : 'border-slate-200/60 bg-slate-50/50 opacity-70'
                  }`}
                >
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => moveMenuItem(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                          aria-label="Move item up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveMenuItem(index, 'down')}
                          disabled={index === headerConfig.menuItems.length - 1}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                          aria-label="Move item down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Item Details */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900 tracking-wide uppercase">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                              {item.badge}
                            </span>
                          )}
                          {!item.visible && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-100 text-slate-500">
                              Hidden
                            </span>
                          )}
                          {item.openInNewTab && (
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                          <span>{item.href}</span>
                          <span>•</span>
                          <span className="text-amber-700 font-bold">
                            {sublinksCount} dropdown sublink{sublinksCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveSubmenuParentId(isSubmenuExpanded ? null : item.id)
                        }
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSubmenuExpanded
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${
                            isSubmenuExpanded ? 'rotate-180' : ''
                          }`}
                        />
                        <span>Manage Dropdown ({sublinksCount})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleMenuItemVisibility(item.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                        title={item.visible ? 'Hide from navigation' : 'Show in navigation'}
                      >
                        {item.visible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingMenuItem(item)}
                        className="p-2 rounded-xl text-slate-500 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 cursor-pointer"
                        title="Edit Menu Item"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteMenuItem(item.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 cursor-pointer"
                        title="Delete Menu Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Submenu Drawer for this item */}
                  {isSubmenuExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/70 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-amber-600" />
                          <span>Dropdown Sublinks for &ldquo;{item.label}&rdquo;</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => setIsNewSublinkModalOpen(item.id)}
                          className="px-3 py-1 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 text-xs font-bold text-slate-800 hover:text-amber-800 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-amber-600" />
                          <span>Add Dropdown Sublink</span>
                        </button>
                      </div>

                      {sublinksCount === 0 ? (
                        <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                          No dropdown sublinks under &ldquo;{item.label}&rdquo;. Direct click will navigate to {item.href}.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {item.sublinks?.map((sub, sIdx) => (
                            <div
                              key={sub.id || sIdx}
                              className="p-3 bg-white rounded-xl border border-slate-200 flex items-start justify-between gap-2 shadow-2xs"
                            >
                              <div className="space-y-0.5">
                                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{sub.title}</span>
                                  {sub.badge && (
                                    <span className="text-[9px] font-mono px-1 rounded bg-amber-100 text-amber-800">
                                      {sub.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 line-clamp-1">
                                  {sub.desc}
                                </div>
                                <div className="text-[10px] font-mono text-amber-700">
                                  {sub.href}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingSublink({ parentId: item.id, sublink: sub })
                                  }
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-slate-100"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSublinks = (item.sublinks || []).filter(
                                      (s) => s.id !== sub.id
                                    );
                                    const updated = {
                                      ...headerConfig,
                                      menuItems: headerConfig.menuItems.map((m) =>
                                        m.id === item.id ? { ...m, sublinks: newSublinks } : m
                                      ),
                                    };
                                    setHeaderConfig(updated);
                                    handleSaveHeader(updated);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 3: FOOTER ACADEMY ICON & TAGLINE                  */}
      {/* ======================================================== */}
      {activeSubTab === 'footerBranding' && (
        <div className="space-y-6">
          {/* Live Footer Brand Column Preview */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-500" />
                  <span>Live Footer Brand Card Preview</span>
                </h3>
                <p className="text-xs text-slate-500">
                  How the primary brand column will render in the footer on live pages.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Footer Column 1</span>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 max-w-xl space-y-3">
              <MadenLogo
                size="md"
                variant="horizontal"
                lightText={false}
                logoType={footerConfig.logoType}
                customLogoUrl={footerConfig.customLogoUrl}
                title={footerConfig.academyTitle}
                highlight={footerConfig.academyHighlight}
                taglinePrimary={footerConfig.establishedText}
                showTaglines={true}
              />

              <p className="text-slate-600 text-xs leading-relaxed">
                {footerConfig.tagline}
              </p>

              {footerConfig.showMotto && (
                <div className="text-amber-700 text-xs font-mono font-bold tracking-wider uppercase">
                  {footerConfig.motto}
                </div>
              )}

              {/* Social icons */}
              {footerConfig.showSocials && (
                <div className="flex items-center gap-2 pt-1">
                  {footerConfig.socialLinks
                    .filter((s) => s.visible)
                    .map((soc) => {
                      const destinationUrl =
                        soc.url.startsWith('http') || soc.url.startsWith('mailto:')
                          ? soc.url
                          : `https://${soc.url}`;
                      return (
                        <a
                          key={soc.id}
                          href={destinationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Test ${soc.label}: ${destinationUrl}`}
                          className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-amber-400 shadow-2xs transition-all active:scale-95"
                        >
                          {soc.platform === 'facebook' && <Facebook className="w-3.5 h-3.5" />}
                          {soc.platform === 'instagram' && <Instagram className="w-3.5 h-3.5" />}
                          {soc.platform === 'youtube' && <Youtube className="w-3.5 h-3.5" />}
                          {soc.platform === 'whatsapp' && <MessageCircle className="w-3.5 h-3.5" />}
                          {soc.platform === 'twitter' && <Twitter className="w-3.5 h-3.5" />}
                          {soc.platform === 'email' && <Mail className="w-3.5 h-3.5" />}
                          {soc.platform === 'linkedin' && <Linkedin className="w-3.5 h-3.5" />}
                          {!['facebook', 'instagram', 'youtube', 'whatsapp', 'twitter', 'email', 'linkedin'].includes(
                            soc.platform
                          )}
                        </a>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box A: Footer Icon & Branding */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>Footer Icon / Crest Selection</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Choose default gold crest or custom footer brand image.
                </p>
              </div>

              {/* Logo Type Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFooterConfig({ ...footerConfig, logoType: 'crest' })}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    footerConfig.logoType === 'crest'
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                    <span>Official Vector Crest (SVG)</span>
                    {footerConfig.logoType === 'crest' && (
                      <Check className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Gold championship star & pinstripe crest.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFooterConfig({ ...footerConfig, logoType: 'custom-image' })}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    footerConfig.logoType === 'custom-image'
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                    <span>Custom Brand Image URL</span>
                    {footerConfig.logoType === 'custom-image' && (
                      <Check className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Use high-resolution academy emblem or sponsor badge.
                  </p>
                </button>
              </div>

              {footerConfig.logoType === 'custom-image' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 block">
                    Custom Footer Logo URL
                  </label>
                  <input
                    type="url"
                    value={footerConfig.customLogoUrl}
                    onChange={(e) =>
                      setFooterConfig({ ...footerConfig, customLogoUrl: e.target.value })
                    }
                    placeholder="https://example.com/footer-logo.png"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Footer Title
                  </label>
                  <input
                    type="text"
                    value={footerConfig.academyTitle}
                    onChange={(e) =>
                      setFooterConfig({ ...footerConfig, academyTitle: e.target.value })
                    }
                    placeholder="MADEN"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Highlight Suffix
                  </label>
                  <input
                    type="text"
                    value={footerConfig.academyHighlight}
                    onChange={(e) =>
                      setFooterConfig({ ...footerConfig, academyHighlight: e.target.value })
                    }
                    placeholder="FAF"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-amber-600 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Accreditation / Established Tagline
                </label>
                <input
                  type="text"
                  value={footerConfig.establishedText}
                  onChange={(e) =>
                    setFooterConfig({ ...footerConfig, establishedText: e.target.value })
                  }
                  placeholder="EST. 2021 · AFC & AIFF CERTIFIED YOUTH PATHWAY"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Box B: Mission Tagline & Slogan */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Mission Tagline & Motto</span>
                </h3>
                <p className="text-xs text-slate-500">
                  The primary explanatory description and core slogan of the academy.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Footer Academy Mission Description (Tagline)
                </label>
                <textarea
                  rows={4}
                  value={footerConfig.tagline}
                  onChange={(e) =>
                    setFooterConfig({ ...footerConfig, tagline: e.target.value })
                  }
                  placeholder="MADEN FAF (Maden Football Academy Foundation) is dedicated to professional youth football development..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Motto Slogan
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFooterConfig({ ...footerConfig, showMotto: !footerConfig.showMotto })
                    }
                    className={`text-[10px] font-bold uppercase ${
                      footerConfig.showMotto ? 'text-amber-600' : 'text-slate-400'
                    }`}
                  >
                    {footerConfig.showMotto ? 'Visible' : 'Hidden'}
                  </button>
                </div>
                <input
                  type="text"
                  value={footerConfig.motto}
                  onChange={(e) =>
                    setFooterConfig({ ...footerConfig, motto: e.target.value })
                  }
                  placeholder="WHERE PASSION MEETS EXCELLENCE"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-amber-700 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Social Channels Manager */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Social Media Channels & Handles
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFooterConfig({ ...footerConfig, showSocials: !footerConfig.showSocials })
                    }
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      footerConfig.showSocials ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                  </button>
                </div>

                {footerConfig.showSocials && (
                  <div className="space-y-2.5">
                    <p className="text-[11px] text-slate-500">
                      When users click on any social media icon in the footer, they will be directed to the corresponding URL below in a new tab.
                    </p>
                    {footerConfig.socialLinks.map((soc, sIdx) => {
                      const testUrl =
                        soc.url.startsWith('http') || soc.url.startsWith('mailto:')
                          ? soc.url
                          : `https://${soc.url}`;

                      return (
                        <div
                          key={soc.id || sIdx}
                          className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200"
                        >
                          <span className="text-xs font-bold text-slate-700 w-24 capitalize shrink-0">
                            {soc.label}:
                          </span>
                          <input
                            type="text"
                            value={soc.url}
                            onChange={(e) => {
                              const newSocs = footerConfig.socialLinks.map((s) =>
                                s.id === soc.id ? { ...s, url: e.target.value } : s
                              );
                              setFooterConfig({ ...footerConfig, socialLinks: newSocs });
                            }}
                            placeholder={`https://${soc.platform}.com/...`}
                            className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-[11px]"
                          />
                          {soc.url && (
                            <a
                              href={testUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Test open link: ${testUrl}`}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50 transition-colors shrink-0"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const newSocs = footerConfig.socialLinks.map((s) =>
                                s.id === soc.id ? { ...s, visible: !s.visible } : s
                              );
                              setFooterConfig({ ...footerConfig, socialLinks: newSocs });
                            }}
                            title={soc.visible ? 'Hide icon in footer' : 'Show icon in footer'}
                            className={`p-1.5 rounded-lg border shrink-0 cursor-pointer ${
                              soc.visible
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-400 border-slate-200'
                            }`}
                          >
                            {soc.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 4: FOOTER MENUS & COLUMN ALLOCATION               */}
      {/* ======================================================== */}
      {activeSubTab === 'footerAllocation' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-amber-500" />
                <span>Footer Columns & Menu Allocation</span>
              </h3>
              <p className="text-xs text-slate-500">
                Organize footer navigation into columns. Move and reallocate menu items between columns using the instant column selector.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsNewColumnModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Column</span>
              </button>
            </div>
          </div>

          {/* Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {footerConfig.columns.map((column) => (
              <div
                key={column.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Column Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          {column.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {column.items.length} items
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Grid Span: {column.columnSpan || 2} cols
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingColumn(column)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 cursor-pointer"
                        title="Rename or Edit Column"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteFooterColumn(column.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Delete Column"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Allocated Items List */}
                  <div className="space-y-2 mt-3">
                    {column.items.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                        No items allocated to this column yet.
                      </div>
                    ) : (
                      column.items.map((item, itemIdx) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{item.label}</span>
                                {item.badge && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 font-bold">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              {item.desc && (
                                <div className="text-[11px] text-slate-500 line-clamp-1">
                                  {item.desc}
                                </div>
                              )}
                              <div className="text-[10px] font-mono text-amber-700">
                                {item.actionType === 'bookTrial'
                                  ? 'Action: Open Book Trial'
                                  : item.actionType === 'portalLogin'
                                  ? 'Action: Open Portal Login'
                                  : item.href}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  moveFooterItemWithinCol(column.id, itemIdx, 'up')
                                }
                                disabled={itemIdx === 0}
                                className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  moveFooterItemWithinCol(column.id, itemIdx, 'down')
                                }
                                disabled={itemIdx === column.items.length - 1}
                                className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingFooterItem({ colId: column.id, item })
                                }
                                className="p-1 rounded text-slate-400 hover:text-amber-700 cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteFooterItem(column.id, item.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Allocation Selector: Move to another column */}
                          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 flex items-center gap-1 font-medium">
                              <MoveRight className="w-3 h-3 text-slate-400" />
                              <span>Allocate to:</span>
                            </span>
                            <select
                              value={column.id}
                              onChange={(e) =>
                                reallocateFooterItem(column.id, item.id, e.target.value)
                              }
                              className="px-2 py-0.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                            >
                              {footerConfig.columns.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Add Item to this column */}
                <button
                  type="button"
                  onClick={() => setIsNewFooterItemModalOpen(column.id)}
                  className="w-full mt-3 py-2 rounded-xl border border-dashed border-slate-300 hover:border-amber-500 hover:bg-amber-50/50 text-slate-600 hover:text-amber-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item to {column.title}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Legal Bar & Copyright Customization */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <span>Footer Legal Notice & Copyright Strip</span>
              </h3>
              <p className="text-xs text-slate-500">
                Configure the copyright line, registration note, and back-to-top control.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Copyright Notice Text
                </label>
                <input
                  type="text"
                  value={footerConfig.copyrightText}
                  onChange={(e) =>
                    setFooterConfig({ ...footerConfig, copyrightText: e.target.value })
                  }
                  placeholder="© 2026 MADEN FAF. All rights reserved."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Bottom Affiliation / Registration Note
                </label>
                <input
                  type="text"
                  value={footerConfig.bottomNote}
                  onChange={(e) =>
                    setFooterConfig({ ...footerConfig, bottomNote: e.target.value })
                  }
                  placeholder="Registered Non-Profit Youth Sports Development Initiative"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Show &ldquo;Back to top&rdquo; Button
                </span>
                <span className="text-[11px] text-slate-500">
                  Allow users to smoothly scroll back to the hero section.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFooterConfig({ ...footerConfig, showScrollToTop: !footerConfig.showScrollToTop })
                }
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  footerConfig.showScrollToTop ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Collaborating Partners Row
                </span>
                <span className="text-[11px] text-slate-500">
                  Display collaborating partner clubs row above the footer copyright.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFooterConfig({
                    ...footerConfig,
                    showCollaboratingPartners: !footerConfig.showCollaboratingPartners,
                  })
                }
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  footerConfig.showCollaboratingPartners ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT TOP-LEVEL HEADER MENU ITEM           */}
      {/* ======================================================== */}
      {(isNewMenuModalOpen || editingMenuItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                {editingMenuItem ? 'Edit Menu Item' : 'Add Top-Level Menu'}
              </h3>
              <button
                onClick={() => {
                  setIsNewMenuModalOpen(false);
                  setEditingMenuItem(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const label = (form.elements.namedItem('label') as HTMLInputElement).value;
                const href = (form.elements.namedItem('href') as HTMLInputElement).value;
                const badge = (form.elements.namedItem('badge') as HTMLInputElement).value;
                const openInNewTab = (form.elements.namedItem('openInNewTab') as HTMLInputElement).checked;

                if (!label || !href) return;

                if (editingMenuItem) {
                  const updatedItems = headerConfig.menuItems.map((m) =>
                    m.id === editingMenuItem.id
                      ? { ...m, label, href, badge: badge || undefined, openInNewTab }
                      : m
                  );
                  const newCfg = { ...headerConfig, menuItems: updatedItems };
                  setHeaderConfig(newCfg);
                  handleSaveHeader(newCfg);
                  setEditingMenuItem(null);
                } else {
                  const newItem: HeaderMenuItem = {
                    id: `menu-${Date.now()}`,
                    label,
                    href,
                    badge: badge || undefined,
                    openInNewTab,
                    visible: true,
                    sublinks: [],
                  };
                  const newCfg = {
                    ...headerConfig,
                    menuItems: [...headerConfig.menuItems, newItem],
                  };
                  setHeaderConfig(newCfg);
                  handleSaveHeader(newCfg);
                  setIsNewMenuModalOpen(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Menu Label (e.g. ABOUT, PROGRAMS, MATCH CENTRE)
                </label>
                <input
                  name="label"
                  required
                  defaultValue={editingMenuItem?.label || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Target Link / Anchor (e.g. #programs, #about, /join, https://...)
                </label>
                <input
                  name="href"
                  required
                  defaultValue={editingMenuItem?.href || '#'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Optional Highlight Badge (e.g. HOT, NEW, AID, 2026/27)
                </label>
                <input
                  name="badge"
                  defaultValue={editingMenuItem?.badge || ''}
                  placeholder="Optional"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="openInNewTab"
                  name="openInNewTab"
                  defaultChecked={editingMenuItem?.openInNewTab || false}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="openInNewTab" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Open link in new browser tab
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewMenuModalOpen(false);
                    setEditingMenuItem(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider"
                >
                  {editingMenuItem ? 'Save Changes' : 'Create Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADD / EDIT DROPDOWN SUBLINK                     */}
      {/* ======================================================== */}
      {(isNewSublinkModalOpen || editingSublink) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                {editingSublink ? 'Edit Dropdown Sublink' : 'Add Dropdown Sublink'}
              </h3>
              <button
                onClick={() => {
                  setIsNewSublinkModalOpen(null);
                  setEditingSublink(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                const href = (form.elements.namedItem('href') as HTMLInputElement).value;
                const desc = (form.elements.namedItem('desc') as HTMLInputElement).value;
                const badge = (form.elements.namedItem('badge') as HTMLInputElement).value;

                const parentId = editingSublink ? editingSublink.parentId : isNewSublinkModalOpen!;

                const parentMenu = headerConfig.menuItems.find((m) => m.id === parentId);
                if (!parentMenu) return;

                let updatedSublinks = [...(parentMenu.sublinks || [])];

                if (editingSublink) {
                  updatedSublinks = updatedSublinks.map((s) =>
                    s.id === editingSublink.sublink.id
                      ? { ...s, title, href, desc, badge: badge || undefined }
                      : s
                  );
                } else {
                  updatedSublinks.push({
                    id: `sub-${Date.now()}`,
                    title,
                    href,
                    desc,
                    badge: badge || undefined,
                  });
                }

                const updated = {
                  ...headerConfig,
                  menuItems: headerConfig.menuItems.map((m) =>
                    m.id === parentId ? { ...m, sublinks: updatedSublinks } : m
                  ),
                };

                setHeaderConfig(updated);
                handleSaveHeader(updated);
                setIsNewSublinkModalOpen(null);
                setEditingSublink(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Sublink Title
                </label>
                <input
                  name="title"
                  required
                  defaultValue={editingSublink?.sublink.title || ''}
                  placeholder="e.g. Grassroots Foundation (U6–U9)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Target Link (Anchor or URL)
                </label>
                <input
                  name="href"
                  required
                  defaultValue={editingSublink?.sublink.href || '#programs'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Description / Subtitle
                </label>
                <input
                  name="desc"
                  defaultValue={editingSublink?.sublink.desc || ''}
                  placeholder="e.g. Agility, basic ball mastery & fun small-sided games"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Badge (Optional)
                </label>
                <input
                  name="badge"
                  defaultValue={editingSublink?.sublink.badge || ''}
                  placeholder="e.g. HQ, NEW"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewSublinkModalOpen(null);
                    setEditingSublink(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider"
                >
                  Save Sublink
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADD / EDIT FOOTER ITEM                          */}
      {/* ======================================================== */}
      {(isNewFooterItemModalOpen || editingFooterItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                {editingFooterItem ? 'Edit Footer Item' : 'Add Item to Footer Column'}
              </h3>
              <button
                onClick={() => {
                  setIsNewFooterItemModalOpen(null);
                  setEditingFooterItem(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const label = (form.elements.namedItem('label') as HTMLInputElement).value;
                const href = (form.elements.namedItem('href') as HTMLInputElement).value;
                const desc = (form.elements.namedItem('desc') as HTMLInputElement).value;
                const badge = (form.elements.namedItem('badge') as HTMLInputElement).value;
                const actionType = (form.elements.namedItem('actionType') as HTMLSelectElement).value as any;
                const allocatedColId = (form.elements.namedItem('allocatedColId') as HTMLSelectElement).value;

                if (!label) return;

                if (editingFooterItem) {
                  // If column changed
                  const oldColId = editingFooterItem.colId;
                  const itemObj: FooterMenuItem = {
                    ...editingFooterItem.item,
                    label,
                    href,
                    desc: desc || undefined,
                    badge: badge || undefined,
                    actionType,
                  };

                  let newCols = footerConfig.columns.map((c) => {
                    if (c.id === oldColId) {
                      return {
                        ...c,
                        items: c.items.filter((i) => i.id !== editingFooterItem.item.id),
                      };
                    }
                    return c;
                  });

                  newCols = newCols.map((c) => {
                    if (c.id === allocatedColId) {
                      return { ...c, items: [...c.items, itemObj] };
                    }
                    return c;
                  });

                  const updated = { ...footerConfig, columns: newCols };
                  setFooterConfig(updated);
                  handleSaveFooter(updated);
                  setEditingFooterItem(null);
                } else {
                  const newItem: FooterMenuItem = {
                    id: `f-item-${Date.now()}`,
                    label,
                    href: href || '#',
                    desc: desc || undefined,
                    badge: badge || undefined,
                    actionType,
                  };

                  const newCols = footerConfig.columns.map((c) => {
                    if (c.id === allocatedColId) {
                      return { ...c, items: [...c.items, newItem] };
                    }
                    return c;
                  });

                  const updated = { ...footerConfig, columns: newCols };
                  setFooterConfig(updated);
                  handleSaveFooter(updated);
                  setIsNewFooterItemModalOpen(null);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Item Label (e.g. Foundation (U8-U10), Gayeshpur Campus)
                </label>
                <input
                  name="label"
                  required
                  defaultValue={editingFooterItem?.item.label || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Column Allocation
                </label>
                <select
                  name="allocatedColId"
                  defaultValue={editingFooterItem?.colId || isNewFooterItemModalOpen || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {footerConfig.columns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Action Type
                  </label>
                  <select
                    name="actionType"
                    defaultValue={editingFooterItem?.item.actionType || 'link'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="link">Regular Navigation Link</option>
                    <option value="bookTrial">Open Book Trial Modal</option>
                    <option value="portalLogin">Open Portal Login Modal</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Target Link / Anchor
                  </label>
                  <input
                    name="href"
                    defaultValue={editingFooterItem?.item.href || '#programs'}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Optional Subtitle / Address Note
                </label>
                <input
                  name="desc"
                  defaultValue={editingFooterItem?.item.desc || ''}
                  placeholder="e.g. Central Training Ground, Nadia"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Optional Badge
                </label>
                <input
                  name="badge"
                  defaultValue={editingFooterItem?.item.badge || ''}
                  placeholder="e.g. HQ, Apply, Vision"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewFooterItemModalOpen(null);
                    setEditingFooterItem(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: ADD / EDIT FOOTER COLUMN                        */}
      {/* ======================================================== */}
      {(isNewColumnModalOpen || editingColumn) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                {editingColumn ? 'Edit Column Settings' : 'Create New Footer Column'}
              </h3>
              <button
                onClick={() => {
                  setIsNewColumnModalOpen(false);
                  setEditingColumn(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                const columnSpan = parseInt((form.elements.namedItem('columnSpan') as HTMLSelectElement).value, 10);

                if (!title) return;

                if (editingColumn) {
                  const newCols = footerConfig.columns.map((c) =>
                    c.id === editingColumn.id ? { ...c, title, columnSpan } : c
                  );
                  const updated = { ...footerConfig, columns: newCols };
                  setFooterConfig(updated);
                  handleSaveFooter(updated);
                  setEditingColumn(null);
                } else {
                  const newCol: FooterColumn = {
                    id: `col-${Date.now()}`,
                    title,
                    columnSpan,
                    items: [],
                  };
                  const updated = { ...footerConfig, columns: [...footerConfig.columns, newCol] };
                  setFooterConfig(updated);
                  handleSaveFooter(updated);
                  setIsNewColumnModalOpen(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Column Header Title
                </label>
                <input
                  name="title"
                  required
                  defaultValue={editingColumn?.title || ''}
                  placeholder="e.g. Club & Academics"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Grid Width Span
                </label>
                <select
                  name="columnSpan"
                  defaultValue={editingColumn?.columnSpan || 2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value={2}>Compact (2 Grid Columns)</option>
                  <option value={3}>Medium (3 Grid Columns - Default)</option>
                  <option value={4}>Wide (4 Grid Columns)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewColumnModalOpen(false);
                    setEditingColumn(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider"
                >
                  Save Column
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
