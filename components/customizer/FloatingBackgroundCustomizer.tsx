'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  AcademyDataManager,
  SectionBackgroundConfig,
  HOMEPAGE_SECTIONS,
  SectionMetaItem,
  subscribeAcademyData,
} from '@/lib/academyDataManager';
import {
  CURATED_STOCK_IMAGES,
  GRADIENT_PRESETS,
  DEFAULT_SECTION_BACKGROUNDS,
} from '@/data/sectionBackgroundsData';
import {
  Palette,
  X,
  Sparkles,
  RotateCcw,
  Sliders,
  ChevronRight,
  ExternalLink,
  Layers,
  Check,
  Brush,
} from 'lucide-react';

export const FloatingBackgroundCustomizer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('hero');

  const backgrounds = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getSectionBackgrounds(),
    () => DEFAULT_SECTION_BACKGROUNDS
  );
  const currentConfig = backgrounds[selectedSectionId] || { type: 'default' };

  const handleUpdateCurrentSection = (partial: Partial<SectionBackgroundConfig>) => {
    AcademyDataManager.updateSectionBackground(selectedSectionId, partial);
  };

  const handleResetCurrent = () => {
    AcademyDataManager.resetSectionBackground(selectedSectionId);
  };

  const handleResetAll = () => {
    if (confirm('Reset all section backgrounds on the homepage to defaults?')) {
      AcademyDataManager.resetAllSectionBackgrounds();
    }
  };

  const handleApplyPresetAll = (presetKey: string) => {
    const preset = GRADIENT_PRESETS[presetKey];
    if (!preset) return;
    AcademyDataManager.applyBackgroundToAllSections({
      type: 'gradient',
      gradientPreset: presetKey,
      overlayColor: preset.textMode === 'light' ? 'black' : 'none',
      overlayOpacity: preset.textMode === 'light' ? 35 : 0,
      patternType: 'radial-spotlight',
      patternOpacity: 30,
      textMode: preset.textMode,
    });
  };

  const activeSectionMeta =
    HOMEPAGE_SECTIONS.find((s) => s.id === selectedSectionId) || HOMEPAGE_SECTIONS[0];

  return (
    <>
      {/* Floating Trigger Pill */}
      {!isOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/95 hover:bg-slate-900 text-amber-400 hover:text-amber-300 border border-slate-700/80 shadow-2xl backdrop-blur-md transition-all active:scale-95 cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:rotate-45 transition-transform">
              <Palette className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Customize Backgrounds
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      )}

      {/* Floating Side Drawer */}
      {isOpen && (
        <div className="fixed top-20 bottom-6 right-4 sm:right-6 w-96 max-w-[calc(100vw-2rem)] z-50 bg-slate-950/95 text-white border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Live Backgrounds Customizer
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">Real-time homepage editor</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
            {/* Quick Global Preset Themes */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Global Site Presets (All Sections):</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPresetAll('midnight')}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left cursor-pointer"
                >
                  <div className="font-bold text-white text-[11px]">Midnight Pitch</div>
                  <div className="text-[9px] text-slate-400">Dark Stadium</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetAll('emerald-turf')}
                  className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800 text-left cursor-pointer"
                >
                  <div className="font-bold text-emerald-300 text-[11px]">Emerald Turf</div>
                  <div className="text-[9px] text-emerald-400/70">Lush Green</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetAll('clean-light')}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-white border border-slate-300 text-slate-900 text-left cursor-pointer"
                >
                  <div className="font-bold text-[11px]">Clean Slate</div>
                  <div className="text-[9px] text-slate-500">Light Modern</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetAll('amber-glow')}
                  className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800 text-left cursor-pointer"
                >
                  <div className="font-bold text-amber-300 text-[11px]">Amber Gold</div>
                  <div className="text-[9px] text-amber-400/70">Signature Glow</div>
                </button>
              </div>
            </div>

            {/* Section Selector */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Select Section to Customize:
              </label>
              <select
                value={selectedSectionId}
                onChange={(e) => {
                  setSelectedSectionId(e.target.value);
                  const el = document.getElementById(e.target.value);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
              >
                {HOMEPAGE_SECTIONS.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.title} (#{sec.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Current Section Background Type */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                  Background Style:
                </span>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-black">
                  {currentConfig.type}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'default', label: 'Default' },
                  { id: 'gradient', label: 'Gradient' },
                  { id: 'image', label: 'Photo' },
                  { id: 'solid', label: 'Color' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleUpdateCurrentSection({ type: t.id as any })}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold uppercase tracking-wider text-center border transition-all cursor-pointer ${
                      currentConfig.type === t.id
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gradient Options */}
            {currentConfig.type === 'gradient' && (
              <div className="space-y-2 pt-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase block">
                  Select Preset Gradient:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(GRADIENT_PRESETS).map(([key, p]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        handleUpdateCurrentSection({
                          gradientPreset: key,
                          textMode: p.textMode,
                        })
                      }
                      className={`h-12 rounded-xl p-2 text-left relative overflow-hidden border cursor-pointer ${
                        currentConfig.gradientPreset === key
                          ? 'border-amber-400 ring-2 ring-amber-400/30'
                          : 'border-slate-700'
                      }`}
                      style={{ background: p.gradient }}
                    >
                      <div
                        className={`text-[10px] font-bold line-clamp-1 ${
                          p.textMode === 'light' ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {p.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Image Options */}
            {currentConfig.type === 'image' && (
              <div className="space-y-3 pt-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase block">
                  Select Pitch Photo:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CURATED_STOCK_IMAGES.slice(0, 4).map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() =>
                        handleUpdateCurrentSection({
                          imageUrl: img.url,
                          overlayColor: 'black',
                          overlayOpacity: 50,
                          textMode: 'light',
                        })
                      }
                      className={`h-14 rounded-xl relative overflow-hidden border cursor-pointer ${
                        currentConfig.imageUrl === img.url
                          ? 'border-amber-400 ring-2 ring-amber-400/30'
                          : 'border-slate-700'
                      }`}
                      style={{
                        backgroundImage: `url('${img.url}')`,
                        backgroundSize: 'cover',
                      }}
                    >
                      <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                        <span className="text-[9px] font-bold text-white line-clamp-1">
                          {img.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Or Image URL:
                  </label>
                  <input
                    type="url"
                    value={currentConfig.imageUrl || ''}
                    onChange={(e) => handleUpdateCurrentSection({ imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Solid Color Options */}
            {currentConfig.type === 'solid' && (
              <div className="space-y-2 pt-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase block">
                  Color Swatches:
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    '#090d16',
                    '#0f172a',
                    '#064e3b',
                    '#78350f',
                    '#ffffff',
                    '#f8fafc',
                    '#022c22',
                    '#451a03',
                    '#1e3a8a',
                    '#18181b',
                    '#fffbeb',
                    '#10b981',
                  ].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() =>
                        handleUpdateCurrentSection({
                          color: hex,
                          textMode: ['#ffffff', '#f8fafc', '#fffbeb'].includes(hex) ? 'dark' : 'light',
                        })
                      }
                      className="h-8 rounded-lg border border-slate-700 cursor-pointer transition-transform hover:scale-105"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Overlay & Text Legibility */}
            {currentConfig.type !== 'default' && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="uppercase">Dark Overlay Tint</span>
                  <span className="font-bold text-amber-400">
                    {currentConfig.overlayOpacity ?? 40}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={currentConfig.overlayOpacity ?? 40}
                  onChange={(e) =>
                    handleUpdateCurrentSection({
                      overlayOpacity: Number(e.target.value),
                      overlayColor: 'black',
                    })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            )}

            {/* Pattern Mesh Toggle */}
            {currentConfig.type !== 'default' && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[10px] font-mono text-slate-400 uppercase block">
                  Texture Pattern:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['none', 'dots', 'grid', 'radial-spotlight'].map((pat) => (
                    <button
                      key={pat}
                      type="button"
                      onClick={() => handleUpdateCurrentSection({ patternType: pat as any })}
                      className={`py-1 rounded-lg text-[10px] font-bold uppercase text-center border cursor-pointer ${
                        (currentConfig.patternType || 'none') === pat
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {pat === 'radial-spotlight' ? 'Spotlight' : pat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Section Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleResetCurrent}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase cursor-pointer border border-slate-800 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Section</span>
              </button>

              <Link
                href="/developer"
                className="py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold uppercase cursor-pointer border border-amber-500/40 flex items-center gap-1.5"
              >
                <span>Full Studio</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
