'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AcademyDataManager,
  SectionBackgroundConfig,
  SectionBackgroundsMap,
  HOMEPAGE_SECTIONS,
  SectionMetaItem,
  BackgroundType,
  subscribeAcademyData,
} from '@/lib/academyDataManager';
import {
  CURATED_STOCK_IMAGES,
  GRADIENT_PRESETS,
  DEFAULT_SECTION_BACKGROUNDS,
} from '@/data/sectionBackgroundsData';
import {
  Palette,
  Search,
  Filter,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sliders,
  Eye,
  Layers,
  ExternalLink,
  ChevronRight,
  Maximize2,
  X,
  Copy,
  Shield,
  Layout,
  Sun,
  Moon,
  Brush,
} from 'lucide-react';

interface SectionBackgroundsManagerProps {
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}

const COLOR_SWATCHES = [
  { name: 'Pure White', value: '#ffffff', textMode: 'dark' as const },
  { name: 'Light Slate', value: '#f8fafc', textMode: 'dark' as const },
  { name: 'Warm Cream', value: '#fffbeb', textMode: 'dark' as const },
  { name: 'Amber Tint', value: '#fef3c7', textMode: 'dark' as const },
  { name: 'Midnight Pitch', value: '#090d16', textMode: 'light' as const },
  { name: 'Deep Slate', value: '#0f172a', textMode: 'light' as const },
  { name: 'Carbon Black', value: '#09090b', textMode: 'light' as const },
  { name: 'Emerald Turf', value: '#064e3b', textMode: 'light' as const },
  { name: 'Forest Pitch', value: '#022c22', textMode: 'light' as const },
  { name: 'MADEN Amber', value: '#78350f', textMode: 'light' as const },
  { name: 'Dark Bronze', value: '#451a03', textMode: 'light' as const },
  { name: 'Royal Navy', value: '#1e3a8a', textMode: 'light' as const },
  { name: 'Deep Crimson', value: '#4c0519', textMode: 'light' as const },
  { name: 'Slate Gray', value: '#334155', textMode: 'light' as const },
  { name: 'Zinc Dark', value: '#18181b', textMode: 'light' as const },
  { name: 'Pitch Neon', value: '#10b981', textMode: 'dark' as const },
];

export const SectionBackgroundsManager: React.FC<SectionBackgroundsManagerProps> = ({
  onNotify,
}) => {
  const [backgrounds, setBackgrounds] = useState<SectionBackgroundsMap>(() =>
    AcademyDataManager.getSectionBackgrounds()
  );

  useEffect(() => {
    return subscribeAcademyData(() => {
      setBackgrounds(AcademyDataManager.getSectionBackgrounds());
    });
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'customized' | 'default'>('all');

  // Active section currently being edited in modal
  const [editingSection, setEditingSection] = useState<SectionMetaItem | null>(null);
  const [draftConfig, setDraftConfig] = useState<SectionBackgroundConfig>({
    type: 'default',
  });

  const refreshData = () => {
    setBackgrounds(AcademyDataManager.getSectionBackgrounds());
  };

  const openEditor = (section: SectionMetaItem) => {
    setEditingSection(section);
    const existing = backgrounds[section.id] || DEFAULT_SECTION_BACKGROUNDS[section.id] || {
      type: 'default',
      textMode: section.defaultTextMode,
    };
    setDraftConfig({
      ...existing,
      textMode: existing.textMode || section.defaultTextMode,
    });
  };

  const handleSaveDraft = () => {
    if (!editingSection) return;
    AcademyDataManager.updateSectionBackground(editingSection.id, draftConfig);
    refreshData();
    onNotify({
      type: 'success',
      text: `Background updated for "${editingSection.title}".`,
    });
    setEditingSection(null);
  };

  const handleResetSection = (sectionId: string, title: string) => {
    AcademyDataManager.resetSectionBackground(sectionId);
    refreshData();
    onNotify({
      type: 'success',
      text: `Reset "${title}" to default academy background.`,
    });
  };

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all homepage section backgrounds to defaults?')) {
      AcademyDataManager.resetAllSectionBackgrounds();
      refreshData();
      onNotify({
        type: 'success',
        text: 'All section backgrounds reset to defaults.',
      });
    }
  };

  const handleApplyPresetThemeToAll = (
    themeName: string,
    presetConfig: SectionBackgroundConfig
  ) => {
    if (
      confirm(
        `Apply "${themeName}" theme across ALL homepage sections? This will overwrite individual section backgrounds.`
      )
    ) {
      AcademyDataManager.applyBackgroundToAllSections(presetConfig);
      refreshData();
      onNotify({
        type: 'success',
        text: `Applied "${themeName}" theme to all homepage sections.`,
      });
    }
  };

  // Filter sections
  const filteredSections = HOMEPAGE_SECTIONS.filter((sec) => {
    const matchesCat = categoryFilter === 'all' || sec.category === categoryFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.id.toLowerCase().includes(searchQuery.toLowerCase());

    const isCustom = (backgrounds[sec.id]?.type || 'default') !== 'default';
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'customized' && isCustom) ||
      (statusFilter === 'default' && !isCustom);

    return matchesCat && matchesSearch && matchesStatus;
  });

  const customizedCount = Object.keys(backgrounds).filter(
    (k) => (backgrounds[k]?.type || 'default') !== 'default'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Global Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider border border-amber-500/30">
              <Palette className="w-3.5 h-3.5" />
              <span>Homepage Customizer Studio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Section Backgrounds & Visual Themes
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Set customized backgrounds for every individual homepage section. Choose from high-resolution football photography, rich gradient presets, custom hex colors, or textured dot/grid patterns with adjustable overlays.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 border border-slate-700 shadow-xs"
            >
              <span>View Homepage</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </Link>

            <button
              type="button"
              onClick={handleResetAll}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/80 hover:border-rose-700 text-slate-300 hover:text-rose-200 border border-slate-700 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Defaults</span>
            </button>
          </div>
        </div>

        {/* Global One-Click Theme Templates Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>One-Click Global Presets (Apply Across Entire Homepage):</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() =>
                handleApplyPresetThemeToAll('Midnight Stadium', {
                  type: 'gradient',
                  gradientPreset: 'midnight',
                  overlayColor: 'black',
                  overlayOpacity: 40,
                  patternType: 'radial-spotlight',
                  patternOpacity: 30,
                  textMode: 'light',
                })
              }
              className="p-3 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-700 hover:border-amber-500/80 text-left transition-all group cursor-pointer"
            >
              <div className="text-xs font-bold text-white group-hover:text-amber-400">Midnight Stadium</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Cinematic dark pitch & spotlight</div>
            </button>

            <button
              type="button"
              onClick={() =>
                handleApplyPresetThemeToAll('Deep Emerald Turf', {
                  type: 'gradient',
                  gradientPreset: 'emerald-turf',
                  overlayColor: 'black',
                  overlayOpacity: 30,
                  patternType: 'turf',
                  patternOpacity: 40,
                  textMode: 'light',
                })
              }
              className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-900/60 hover:border-emerald-500 text-left transition-all group cursor-pointer"
            >
              <div className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200">Emerald Turf</div>
              <div className="text-[10px] text-emerald-400/80 mt-0.5">Lush pitch green & tactical grass</div>
            </button>

            <button
              type="button"
              onClick={() =>
                handleApplyPresetThemeToAll('Modern Clean Slate', {
                  type: 'gradient',
                  gradientPreset: 'clean-light',
                  overlayColor: 'none',
                  overlayOpacity: 0,
                  patternType: 'dots',
                  patternOpacity: 20,
                  textMode: 'dark',
                })
              }
              className="p-3 rounded-2xl bg-gradient-to-r from-slate-100 to-white text-slate-900 border border-slate-300 hover:border-amber-500 text-left transition-all group cursor-pointer shadow-xs"
            >
              <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700">Modern Clean Slate</div>
              <div className="text-[10px] text-slate-600 mt-0.5">Bright, crisp editorial contrast</div>
            </button>

            <button
              type="button"
              onClick={() =>
                handleApplyPresetThemeToAll('MADEN Amber Gold', {
                  type: 'gradient',
                  gradientPreset: 'amber-glow',
                  overlayColor: 'amber',
                  overlayOpacity: 35,
                  patternType: 'radial-spotlight',
                  patternOpacity: 40,
                  textMode: 'light',
                })
              }
              className="p-3 rounded-2xl bg-gradient-to-r from-amber-950 to-slate-950 border border-amber-800/60 hover:border-amber-400 text-left transition-all group cursor-pointer"
            >
              <div className="text-xs font-bold text-amber-300 group-hover:text-amber-200">MADEN Amber Gold</div>
              <div className="text-[10px] text-amber-400/80 mt-0.5">Foundation gold signature</div>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'Hero & Core', 'Academics & Pathway', 'Facilities & Matches', 'Community & Media', 'Conversion & Footer'].map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'All Sections (17)' : cat}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sections..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 bg-slate-50"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-[11px] font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-950 shadow-xs' : ''
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('customized')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                statusFilter === 'customized' ? 'bg-white text-amber-700 shadow-xs' : ''
              }`}
            >
              <span>Customized</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-[10px] text-amber-800">
                {customizedCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('default')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'default' ? 'bg-white text-slate-950 shadow-xs' : ''
              }`}
            >
              Defaults
            </button>
          </div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredSections.map((sec, idx) => {
          const bgConfig = backgrounds[sec.id] || { type: 'default' };
          const isCustom = bgConfig.type !== 'default';

          // Generate preview background style for miniature card preview
          let miniBgStyle: React.CSSProperties = {};
          if (bgConfig.type === 'solid' && bgConfig.color) {
            miniBgStyle.backgroundColor = bgConfig.color;
          } else if (bgConfig.type === 'gradient') {
            if (bgConfig.customGradient) miniBgStyle.background = bgConfig.customGradient;
            else if (bgConfig.gradientPreset && GRADIENT_PRESETS[bgConfig.gradientPreset]) {
              miniBgStyle.background = GRADIENT_PRESETS[bgConfig.gradientPreset].gradient;
            }
          } else if (bgConfig.type === 'image' && bgConfig.imageUrl) {
            miniBgStyle.backgroundImage = `url('${bgConfig.imageUrl}')`;
            miniBgStyle.backgroundSize = 'cover';
            miniBgStyle.backgroundPosition = 'center';
          } else {
            // Default appearance preview
            miniBgStyle.backgroundColor = sec.defaultTextMode === 'light' ? '#090d16' : '#ffffff';
          }

          const previewTextMode =
            bgConfig.textMode && bgConfig.textMode !== 'auto'
              ? bgConfig.textMode
              : bgConfig.type === 'gradient' && bgConfig.gradientPreset
              ? GRADIENT_PRESETS[bgConfig.gradientPreset]?.textMode || sec.defaultTextMode
              : isCustom && bgConfig.type === 'image'
              ? 'light'
              : sec.defaultTextMode;

          return (
            <div
              key={sec.id}
              className={`bg-white border rounded-3xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${
                isCustom ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3.5">
                {/* Header Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                        #{idx + 1} · {sec.category}
                      </span>
                      {isCustom ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-mono font-black uppercase">
                          CUSTOM BG
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-mono font-bold uppercase">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black uppercase text-slate-900 leading-tight">
                      {sec.title}
                    </h3>
                  </div>

                  <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                    #{sec.id}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {sec.subtitle}
                </p>

                {/* Miniature Section Visual Preview */}
                <div
                  style={miniBgStyle}
                  className={`h-24 rounded-2xl relative overflow-hidden border border-slate-200 flex flex-col justify-between p-3 transition-all ${
                    previewTextMode === 'light' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {/* Overlay layer */}
                  {isCustom && bgConfig.overlayColor && bgConfig.overlayColor !== 'none' && (
                    <div
                      className={`absolute inset-0 pointer-events-none ${
                        bgConfig.overlayColor === 'white'
                          ? 'bg-white'
                          : bgConfig.overlayColor === 'slate'
                          ? 'bg-slate-950'
                          : bgConfig.overlayColor === 'amber'
                          ? 'bg-amber-950'
                          : bgConfig.overlayColor === 'emerald'
                          ? 'bg-emerald-950'
                          : 'bg-black'
                      }`}
                      style={{ opacity: (bgConfig.overlayOpacity ?? 40) / 100 }}
                    />
                  )}

                  <div className="relative z-1 flex items-center justify-between text-[10px] font-mono font-bold uppercase">
                    <span className="px-2 py-0.5 rounded bg-black/40 backdrop-blur-xs text-amber-300">
                      {bgConfig.type.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/40 backdrop-blur-xs">
                      {previewTextMode === 'light' ? 'Light Text' : 'Dark Text'}
                    </span>
                  </div>

                  <div className="relative z-1 text-center font-black uppercase text-xs tracking-tight line-clamp-1 drop-shadow-xs">
                    {sec.title}
                  </div>
                </div>

                {/* Background Details Strip */}
                <div className="text-[11px] text-slate-600 bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400">Type:</span>
                    <span className="font-bold text-slate-800 capitalize">{bgConfig.type}</span>
                  </div>
                  {bgConfig.type === 'solid' && bgConfig.color && (
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-400">Color:</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full border border-slate-300 inline-block"
                          style={{ backgroundColor: bgConfig.color }}
                        />
                        <span className="font-bold">{bgConfig.color}</span>
                      </div>
                    </div>
                  )}
                  {bgConfig.type === 'gradient' && (
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-400">Preset:</span>
                      <span className="font-bold capitalize">
                        {bgConfig.gradientPreset || 'Custom'}
                      </span>
                    </div>
                  )}
                  {bgConfig.type === 'image' && bgConfig.imageUrl && (
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-400">Image:</span>
                      <span className="font-bold truncate max-w-[140px]">
                        {bgConfig.imageUrl.split('/').pop()?.slice(0, 15)}...
                      </span>
                    </div>
                  )}
                  {bgConfig.patternType && bgConfig.patternType !== 'none' && (
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-400">Pattern:</span>
                      <span className="font-bold capitalize">{bgConfig.patternType}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => openEditor(sec)}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Brush className="w-3.5 h-3.5" />
                  <span>Customize Background</span>
                </button>

                {isCustom && (
                  <button
                    type="button"
                    onClick={() => handleResetSection(sec.id, sec.title)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition-colors cursor-pointer"
                    title="Reset to Default"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Background Customizer Drawer / Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">
                    Customize Background: {editingSection.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Section ID: #{editingSection.id} · {editingSection.category}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Real-time Live Preview Card */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>Live Appearance Preview</span>
                  <span className="text-[10px] text-amber-600 font-semibold">
                    Changes reflect dynamically on save
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor:
                      draftConfig.type === 'solid'
                        ? draftConfig.color || '#090d16'
                        : draftConfig.type === 'default'
                        ? editingSection.defaultTextMode === 'light'
                          ? '#090d16'
                          : '#ffffff'
                        : undefined,
                    background:
                      draftConfig.type === 'gradient'
                        ? draftConfig.customGradient ||
                          (draftConfig.gradientPreset && GRADIENT_PRESETS[draftConfig.gradientPreset]?.gradient) ||
                          GRADIENT_PRESETS.midnight.gradient
                        : undefined,
                    backgroundImage:
                      draftConfig.type === 'image' && draftConfig.imageUrl
                        ? `url('${draftConfig.imageUrl}')`
                        : undefined,
                    backgroundSize: draftConfig.imageSize || 'cover',
                    backgroundPosition: draftConfig.imagePosition || 'center',
                    backgroundAttachment: draftConfig.imageFixed ? 'fixed' : 'scroll',
                    borderTop: draftConfig.borderTop
                      ? `1px solid ${draftConfig.borderColor || '#cbd5e1'}`
                      : undefined,
                    borderBottom: draftConfig.borderBottom
                      ? `1px solid ${draftConfig.borderColor || '#cbd5e1'}`
                      : undefined,
                  }}
                  className={`min-h-[160px] rounded-2xl relative overflow-hidden p-6 flex flex-col justify-between transition-all duration-300 border border-slate-300 ${
                    (draftConfig.textMode || 'auto') === 'light'
                      ? 'text-white'
                      : (draftConfig.textMode || 'auto') === 'dark'
                      ? 'text-slate-900'
                      : draftConfig.type === 'image'
                      ? 'text-white'
                      : editingSection.defaultTextMode === 'light'
                      ? 'text-white'
                      : 'text-slate-900'
                  }`}
                >
                  {/* Overlay */}
                  {draftConfig.type !== 'default' &&
                    draftConfig.overlayColor &&
                    draftConfig.overlayColor !== 'none' && (
                      <div
                        className={`absolute inset-0 pointer-events-none ${
                          draftConfig.overlayColor === 'white'
                            ? 'bg-white'
                            : draftConfig.overlayColor === 'slate'
                            ? 'bg-slate-950'
                            : draftConfig.overlayColor === 'amber'
                            ? 'bg-amber-950'
                            : draftConfig.overlayColor === 'emerald'
                            ? 'bg-emerald-950'
                            : 'bg-black'
                        }`}
                        style={{ opacity: (draftConfig.overlayOpacity ?? 40) / 100 }}
                      />
                    )}

                  {/* Pattern preview */}
                  {draftConfig.patternType === 'dots' && (
                    <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px]" />
                  )}
                  {draftConfig.patternType === 'grid' && (
                    <div className="absolute inset-0 pointer-events-none opacity-30 bg-[linear-gradient(to_right,#cbd5e120_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e120_1px,transparent_1px)] [background-size:24px_24px]" />
                  )}

                  {/* Sample content */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase bg-amber-500 text-slate-950 shadow-xs">
                      MADEN FAF ACADEMY
                    </span>
                    <span className="text-xs font-mono font-bold opacity-80">
                      Previewing #{editingSection.id}
                    </span>
                  </div>

                  <div className="relative z-10 my-4 text-center space-y-1">
                    <h4 className="text-2xl font-black uppercase tracking-tight">
                      {editingSection.title}
                    </h4>
                    <p className="text-xs max-w-lg mx-auto opacity-85 line-clamp-1">
                      {editingSection.subtitle}
                    </p>
                  </div>

                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <span className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase">
                      Action Button
                    </span>
                    <span className="px-4 py-1.5 rounded-xl bg-white/20 backdrop-blur-xs font-bold text-xs uppercase border border-white/30">
                      Learn More
                    </span>
                  </div>
                </div>
              </div>

              {/* Background Type Tabs */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span>1. Choose Background Type:</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'default', label: 'Default Theme', desc: 'Standard Academy' },
                    { id: 'solid', label: 'Solid Color', desc: 'Custom HEX/Color' },
                    { id: 'gradient', label: 'Gradient Presets', desc: 'Sleek Dual Color' },
                    { id: 'image', label: 'Image & Photo', desc: 'Pitch & Stadium' },
                    { id: 'pattern', label: 'Pattern Mesh', desc: 'Grid / Dot Texture' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setDraftConfig((prev) => ({
                          ...prev,
                          type: t.id as BackgroundType,
                        }))
                      }
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        draftConfig.type === t.id
                          ? 'border-amber-500 bg-amber-50/70 text-slate-950 font-bold ring-2 ring-amber-400/30'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{t.label}</div>
                      <div className="text-[10px] text-slate-500">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* TYPE: Solid Color Controls */}
              {draftConfig.type === 'solid' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-150">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span>Solid Background Color:</span>
                    <span className="font-mono text-amber-600">{draftConfig.color || '#090d16'}</span>
                  </div>

                  {/* Swatches */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {COLOR_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.value}
                        type="button"
                        onClick={() =>
                          setDraftConfig((prev) => ({
                            ...prev,
                            color: swatch.value,
                            textMode: swatch.textMode,
                          }))
                        }
                        className={`h-11 rounded-xl border flex flex-col items-center justify-center p-1 transition-all cursor-pointer relative ${
                          draftConfig.color === swatch.value
                            ? 'ring-2 ring-amber-500 scale-105 border-amber-500 shadow-md'
                            : 'border-slate-200 hover:scale-102'
                        }`}
                        style={{ backgroundColor: swatch.value }}
                        title={`${swatch.name} (${swatch.value})`}
                      >
                        {draftConfig.color === swatch.value && (
                          <Check
                            className={`w-4 h-4 ${
                              swatch.textMode === 'light' ? 'text-white' : 'text-slate-900'
                            }`}
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom Hex Input */}
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="color"
                      value={draftConfig.color || '#090d16'}
                      onChange={(e) =>
                        setDraftConfig((prev) => ({ ...prev, color: e.target.value }))
                      }
                      className="w-10 h-10 rounded-xl border border-slate-300 p-0.5 cursor-pointer bg-white"
                    />
                    <div className="flex-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase block">
                        Custom Hex / CSS Color
                      </label>
                      <input
                        type="text"
                        value={draftConfig.color || ''}
                        onChange={(e) =>
                          setDraftConfig((prev) => ({ ...prev, color: e.target.value }))
                        }
                        placeholder="#090d16 or rgb(9, 13, 22)"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TYPE: Gradient Presets */}
              {draftConfig.type === 'gradient' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-150">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Select Curated Gradient Preset:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.entries(GRADIENT_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setDraftConfig((prev) => ({
                            ...prev,
                            gradientPreset: key,
                            customGradient: undefined,
                            textMode: preset.textMode,
                          }))
                        }
                        className={`h-20 rounded-2xl p-3 text-left relative overflow-hidden border transition-all cursor-pointer flex flex-col justify-between ${
                          draftConfig.gradientPreset === key && !draftConfig.customGradient
                            ? 'ring-2 ring-amber-500 border-amber-500 shadow-md scale-102'
                            : 'border-slate-300 hover:border-amber-400'
                        }`}
                        style={{ background: preset.gradient }}
                      >
                        <div
                          className={`text-xs font-black uppercase ${
                            preset.textMode === 'light' ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {preset.name}
                        </div>
                        <div
                          className={`text-[9px] font-mono opacity-80 ${
                            preset.textMode === 'light' ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {preset.textMode.toUpperCase()} TEXT
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                      Or Custom CSS Gradient String:
                    </label>
                    <input
                      type="text"
                      value={draftConfig.customGradient || ''}
                      onChange={(e) =>
                        setDraftConfig((prev) => ({
                          ...prev,
                          customGradient: e.target.value,
                        }))
                      }
                      placeholder="e.g. linear-gradient(135deg, #090d16 0%, #111827 100%)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* TYPE: Image Background */}
              {draftConfig.type === 'image' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-150">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Choose from Curated Football Photography or Enter URL:
                  </div>

                  {/* Stock Image Gallery */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CURATED_STOCK_IMAGES.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() =>
                          setDraftConfig((prev) => ({
                            ...prev,
                            imageUrl: img.url,
                            overlayColor: 'black',
                            overlayOpacity: 50,
                            textMode: 'light',
                          }))
                        }
                        className={`h-24 rounded-2xl relative overflow-hidden border transition-all cursor-pointer group text-left ${
                          draftConfig.imageUrl === img.url
                            ? 'ring-2 ring-amber-500 border-amber-500 shadow-md'
                            : 'border-slate-200 hover:border-amber-400'
                        }`}
                        style={{
                          backgroundImage: `url('${img.url}')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-bold line-clamp-1 drop-shadow-xs">
                          {img.title}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Custom URL Input */}
                  <div className="space-y-1 pt-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase block">
                      Custom Background Image URL:
                    </label>
                    <input
                      type="url"
                      value={draftConfig.imageUrl || ''}
                      onChange={(e) =>
                        setDraftConfig((prev) => ({ ...prev, imageUrl: e.target.value }))
                      }
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Image Options Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                        Position
                      </label>
                      <select
                        value={draftConfig.imagePosition || 'center'}
                        onChange={(e) =>
                          setDraftConfig((prev) => ({
                            ...prev,
                            imagePosition: e.target.value as any,
                          }))
                        }
                        className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                      >
                        <option value="center">Center</option>
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                        Display Size
                      </label>
                      <select
                        value={draftConfig.imageSize || 'cover'}
                        onChange={(e) =>
                          setDraftConfig((prev) => ({
                            ...prev,
                            imageSize: e.target.value as any,
                          }))
                        }
                        className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                      >
                        <option value="cover">Cover (Fill Section)</option>
                        <option value="contain">Contain (Fit)</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                        Blur Filter
                      </label>
                      <select
                        value={draftConfig.imageBlur || 'none'}
                        onChange={(e) =>
                          setDraftConfig((prev) => ({
                            ...prev,
                            imageBlur: e.target.value as any,
                          }))
                        }
                        className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                      >
                        <option value="none">None (Crisp)</option>
                        <option value="sm">Subtle Blur (sm)</option>
                        <option value="md">Medium Blur (md)</option>
                        <option value="lg">Strong Blur (lg)</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={draftConfig.imageFixed || false}
                          onChange={(e) =>
                            setDraftConfig((prev) => ({
                              ...prev,
                              imageFixed: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                        />
                        <span>Parallax Fixed</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: Overlay Controls (Crucial for Text Legibility) */}
              {draftConfig.type !== 'default' && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-600" />
                      <span>2. Overlay Tint & Legibility:</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-800">
                      {draftConfig.overlayOpacity ?? 40}% Opacity
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-slate-600 uppercase block mb-1.5">
                        Overlay Color:
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {[
                          { id: 'black', label: 'Black' },
                          { id: 'slate', label: 'Dark Slate' },
                          { id: 'amber', label: 'Amber Tint' },
                          { id: 'emerald', label: 'Emerald' },
                          { id: 'white', label: 'White' },
                          { id: 'none', label: 'None' },
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() =>
                              setDraftConfig((prev) => ({
                                ...prev,
                                overlayColor: c.id as any,
                              }))
                            }
                            className={`p-1.5 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                              (draftConfig.overlayColor || 'black') === c.id
                                ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-600 uppercase block mb-1.5">
                        Overlay Strength (0% to 100%):
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={draftConfig.overlayOpacity ?? 40}
                        onChange={(e) =>
                          setDraftConfig((prev) => ({
                            ...prev,
                            overlayOpacity: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: Pattern & Texture */}
              {draftConfig.type !== 'default' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    3. Background Texture / Pattern:
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    {[
                      { id: 'none', label: 'No Pattern' },
                      { id: 'dots', label: 'Dot Matrix' },
                      { id: 'grid', label: 'Blueprint Grid' },
                      { id: 'diagonal', label: 'Diagonal Lines' },
                      { id: 'turf', label: 'Turf Glow' },
                      { id: 'radial-spotlight', label: 'Top Spotlight' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setDraftConfig((prev) => ({
                            ...prev,
                            patternType: p.id as any,
                          }))
                        }
                        className={`p-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                          (draftConfig.patternType || 'none') === p.id
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: Text Contrast & Border Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Text Contrast Mode:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'auto', label: 'Auto (Smart)' },
                      { id: 'light', label: 'Light Text (White)' },
                      { id: 'dark', label: 'Dark Text (Slate)' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() =>
                          setDraftConfig((prev) => ({
                            ...prev,
                            textMode: m.id as any,
                          }))
                        }
                        className={`p-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                          (draftConfig.textMode || 'auto') === m.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Section Divider Borders:
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draftConfig.borderTop || false}
                        onChange={(e) =>
                          setDraftConfig((prev) => ({ ...prev, borderTop: e.target.checked }))
                        }
                        className="w-4 h-4 rounded text-amber-500"
                      />
                      <span>Top Border</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draftConfig.borderBottom || false}
                        onChange={(e) =>
                          setDraftConfig((prev) => ({
                            ...prev,
                            borderBottom: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded text-amber-500"
                      />
                      <span>Bottom Border</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setDraftConfig({ type: 'default', textMode: editingSection.defaultTextMode });
                }}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase cursor-pointer"
              >
                Reset to Section Default
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        `Apply this exact background configuration to ALL 17 homepage sections?`
                      )
                    ) {
                      AcademyDataManager.applyBackgroundToAllSections(draftConfig);
                      refreshData();
                      onNotify({
                        type: 'success',
                        text: `Applied background to all homepage sections.`,
                      });
                      setEditingSection(null);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Apply to All Sections
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  Save Background
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
