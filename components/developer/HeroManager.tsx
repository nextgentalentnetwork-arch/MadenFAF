'use client';

import React, { useState } from 'react';
import {
  HeroShowcaseConfig,
  HeroStatItem,
  DEFAULT_HERO_CONFIG,
} from '@/data/academyData';
import {
  AcademyDataManager,
  subscribeAcademyData,
} from '@/lib/academyDataManager';
import { MediaSelector } from './MediaSelector';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { VideoModal } from '@/components/modals/VideoModal';
import {
  Sparkles,
  Play,
  ArrowRight,
  Eye,
  Save,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Type,
  Video,
  Image as ImageIcon,
  BarChart3,
  ExternalLink,
  Plus,
  Trash2,
  Tv,
} from 'lucide-react';

interface HeroManagerProps {
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}

const PRESET_HERO_BACKGROUNDS = [
  {
    label: 'Kalyani Stadium Pitch Aerial',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=2000&q=85',
  },
  {
    label: 'Floodlit Stadium Turf at Dusk',
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=2000&q=85',
  },
  {
    label: 'Youth Footballers Training Drill',
    url: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=2000&q=85',
  },
  {
    label: 'Central Goal & Corner Arc Perspective',
    url: 'https://images.unsplash.com/photo-1529900240041-22f114d18eb1?auto=format&fit=crop&w=2000&q=85',
  },
  {
    label: 'High-Performance Match Action',
    url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=2000&q=85',
  },
];

const PRESET_VIDEO_POSTERS = [
  {
    label: 'Team Huddle & Tactical Briefing',
    url: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: 'Intense Match Coordination',
    url: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: 'Youth Player Ball Mastery Action',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: 'Championship Trophy Celebration',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80',
  },
];

export const HeroManager: React.FC<HeroManagerProps> = ({ onNotify }) => {
  const [config, setConfig] = useState<HeroShowcaseConfig>(() =>
    AcademyDataManager.getHeroConfig()
  );
  const [activeSubTab, setActiveSubTab] = useState<
    'copy' | 'ctas' | 'video' | 'background' | 'stats'
  >('copy');
  const [isVideoModalPreviewOpen, setIsVideoModalPreviewOpen] = useState(false);
  const [deleteStatTarget, setDeleteStatTarget] = useState<HeroStatItem | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (updatedConfig = config) => {
    setIsSaving(true);
    try {
      AcademyDataManager.saveHeroConfig(updatedConfig);
      onNotify({
        type: 'success',
        text: 'Hero Showcase & Video Experience saved and synced to Supabase Cloud!',
      });
    } catch {
      onNotify({
        type: 'error',
        text: 'Failed to persist Hero Showcase changes.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const res = AcademyDataManager.resetHeroConfig();
    setConfig(res);
    onNotify({
      type: 'success',
      text: 'Hero Showcase configuration restored to default academy pedigree settings.',
    });
  };

  // Stat item handlers
  const handleAddStat = () => {
    const newStat: HeroStatItem = {
      id: `stat-${Date.now()}`,
      value: '100%',
      label: 'New Academy Metric',
    };
    const updated = {
      ...config,
      stats: [...(config.stats || []), newStat],
    };
    setConfig(updated);
    handleSave(updated);
  };

  const handleUpdateStat = (id: string, partial: Partial<HeroStatItem>) => {
    const updatedStats = (config.stats || []).map((s) =>
      s.id === id ? { ...s, ...partial } : s
    );
    const updated = { ...config, stats: updatedStats };
    setConfig(updated);
  };

  const handleConfirmDeleteStat = () => {
    if (!deleteStatTarget) return;
    const updatedStats = (config.stats || []).filter(
      (s) => s.id !== deleteStatTarget.id
    );
    const updated = { ...config, stats: updatedStats };
    setConfig(updated);
    AcademyDataManager.saveHeroConfig(updated);
    onNotify({
      type: 'success',
      text: `Metric "${deleteStatTarget.label}" removed from Hero stat strip.`,
    });
    setDeleteStatTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
                <span>Hero Showcase & Video Experience Studio</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live on Homepage
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Customize main headline, highlighted word styling, supporting copy, action buttons, full-length documentary film experience, background atmosphere, and stat strip metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsVideoModalPreviewOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Test Video Modal</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
            title="Restore original academy defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save & Sync Cloud'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveSubTab('copy')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'copy'
              ? 'bg-white text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Type className="w-3.5 h-3.5 text-amber-600" />
          <span>1. Headline & Copy</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('ctas')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'ctas'
              ? 'bg-white text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-amber-600" />
          <span>2. Action Buttons (CTAs)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('video')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'video'
              ? 'bg-white text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-amber-600" />
          <span>3. Video Experience Studio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('background')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'background'
              ? 'bg-white text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
          <span>4. Background Atmosphere</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('stats')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'stats'
              ? 'bg-white text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
          <span>5. Stat Strip Metrics ({config.stats?.length || 0})</span>
        </button>
      </div>

      {/* SUB-TAB 1: HEADLINE & COPY */}
      {activeSubTab === 'copy' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Type className="w-4 h-4 text-amber-600" />
              <span>Eyebrow Label & Headline Typography</span>
            </h3>
            <p className="text-xs text-slate-500">
              Control the top badge pill, primary headline words, highlight accent color, and supporting philosophy paragraph.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Eyebrow Label Settings */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Eyebrow Badge Pill
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.eyebrowBadgeVisible}
                    onChange={(e) =>
                      setConfig({ ...config, eyebrowBadgeVisible: e.target.checked })
                    }
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Show Badge Pill</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={config.eyebrowBadgeText}
                  onChange={(e) =>
                    setConfig({ ...config, eyebrowBadgeText: e.target.value })
                  }
                  placeholder="e.g. Maden Football Academy Foundation · Official Intake 2026/27"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Pulsing Indicator Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['amber', 'emerald', 'blue', 'rose'] as const).map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setConfig({ ...config, eyebrowPulseColor: col })}
                      className={`p-2 rounded-xl text-xs font-bold capitalize border flex items-center justify-center gap-1.5 cursor-pointer ${
                        config.eyebrowPulseColor === col
                          ? 'border-slate-900 bg-white ring-2 ring-slate-900/10'
                          : 'border-slate-200 bg-white hover:bg-slate-100'
                      }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          col === 'amber'
                            ? 'bg-amber-500'
                            : col === 'emerald'
                            ? 'bg-emerald-500'
                            : col === 'blue'
                            ? 'bg-blue-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      <span>{col}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Headline Color Theme */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Highlighted Word Accent Theme
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: 'amber', label: 'Gold Amber', bg: 'bg-amber-500', text: 'text-amber-600' },
                  { id: 'emerald', label: 'Pitch Emerald', bg: 'bg-emerald-500', text: 'text-emerald-500' },
                  { id: 'blue', label: 'Royal Blue', bg: 'bg-blue-600', text: 'text-blue-600' },
                  { id: 'rose', label: 'Crimson Rose', bg: 'bg-rose-600', text: 'text-rose-600' },
                  { id: 'slate', label: 'Solid Charcoal', bg: 'bg-slate-900', text: 'text-slate-900' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setConfig({ ...config, headlineHighlightColor: item.id as any })
                    }
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      config.headlineHighlightColor === item.id
                        ? 'border-slate-900 bg-white shadow-xs ring-2 ring-slate-900/10'
                        : 'border-slate-200 bg-white hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${item.bg} mx-auto mb-1`} />
                    <span className="text-[10px] font-bold text-slate-800 block">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                This color will be applied to the second line of the headline (`{config.headlineHighlight}`).
              </p>
            </div>
          </div>

          {/* Headline Text Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Headline Line 1 (Main Words)
                </label>
                <input
                  type="text"
                  value={config.headlinePart1}
                  onChange={(e) =>
                    setConfig({ ...config, headlinePart1: e.target.value })
                  }
                  placeholder="e.g. WHERE PASSION"
                  className="w-full px-3.5 py-2.5 text-sm font-black uppercase bg-white border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Headline Line 2 (Highlighted Words)
                </label>
                <input
                  type="text"
                  value={config.headlineHighlight}
                  onChange={(e) =>
                    setConfig({ ...config, headlineHighlight: e.target.value })
                  }
                  placeholder="e.g. MEETS EXCELLENCE"
                  className="w-full px-3.5 py-2.5 text-sm font-black uppercase bg-white border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supporting Paragraph Copy
              </label>
              <textarea
                rows={3}
                value={config.subHeadline}
                onChange={(e) =>
                  setConfig({ ...config, subHeadline: e.target.value })
                }
                placeholder="Describe your academy vision, coaching philosophy, and development opportunities..."
                className="w-full px-3.5 py-2 text-xs leading-relaxed bg-white border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CALL-TO-ACTION BUTTONS (CTAs) */}
      {activeSubTab === 'ctas' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600" />
              <span>Call-to-Action Action Buttons & Links</span>
            </h3>
            <p className="text-xs text-slate-500">
              Configure primary and secondary hero buttons, target modal triggers, in-page navigation anchors, or external links.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CTA 1 (Primary) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-amber-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-800 tracking-wider">
                  Button 1 (Primary High-Contrast)
                </span>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.cta1Visible}
                    onChange={(e) =>
                      setConfig({ ...config, cta1Visible: e.target.checked })
                    }
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Show Button</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Button Label
                </label>
                <input
                  type="text"
                  value={config.cta1Text}
                  onChange={(e) => setConfig({ ...config, cta1Text: e.target.value })}
                  placeholder="e.g. Book a Trial"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Click Action
                </label>
                <select
                  value={config.cta1Action}
                  onChange={(e) =>
                    setConfig({ ...config, cta1Action: e.target.value as any })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  <option value="trialModal">Open Book a Trial Modal (Recommended)</option>
                  <option value="scrollPrograms">Scroll to Football Programs Section</option>
                  <option value="scrollCampuses">Scroll to Campus Network Section</option>
                  <option value="customUrl">Open Custom URL / External Link</option>
                </select>
              </div>

              {config.cta1Action === 'customUrl' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Custom URL
                  </label>
                  <input
                    type="text"
                    value={config.cta1Url || ''}
                    onChange={(e) => setConfig({ ...config, cta1Url: e.target.value })}
                    placeholder="https://... or /portal"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              )}
            </div>

            {/* CTA 2 (Secondary) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  Button 2 (Secondary Outline)
                </span>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.cta2Visible}
                    onChange={(e) =>
                      setConfig({ ...config, cta2Visible: e.target.checked })
                    }
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Show Button</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Button Label
                </label>
                <input
                  type="text"
                  value={config.cta2Text}
                  onChange={(e) => setConfig({ ...config, cta2Text: e.target.value })}
                  placeholder="e.g. Explore Programs"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Click Action
                </label>
                <select
                  value={config.cta2Action}
                  onChange={(e) =>
                    setConfig({ ...config, cta2Action: e.target.value as any })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  <option value="scrollPrograms">Scroll to Football Programs Section</option>
                  <option value="scrollCampuses">Scroll to Campus Network Section</option>
                  <option value="trialModal">Open Book a Trial Modal</option>
                  <option value="customUrl">Open Custom URL / External Link</option>
                </select>
              </div>

              {config.cta2Action === 'customUrl' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Custom URL
                  </label>
                  <input
                    type="text"
                    value={config.cta2Url || ''}
                    onChange={(e) => setConfig({ ...config, cta2Url: e.target.value })}
                    placeholder="https://... or /programs"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Watch Film Button Config */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                <span>Watch Film Documentary Trigger Button</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Displays a third button that opens the full-screen interactive documentary cinema modal.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showWatchFilmButton}
                  onChange={(e) =>
                    setConfig({ ...config, showWatchFilmButton: e.target.checked })
                  }
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Enable Button</span>
              </label>

              <input
                type="text"
                value={config.watchFilmButtonText || 'Watch Film'}
                onChange={(e) =>
                  setConfig({ ...config, watchFilmButtonText: e.target.value })
                }
                placeholder="Button label..."
                className="w-32 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: VIDEO EXPERIENCE STUDIO */}
      {activeSubTab === 'video' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-600" />
                <span>Full-Length Video Showcase & Documentary Cinema</span>
              </h3>
              <p className="text-xs text-slate-500">
                Configure the cinema documentary modal that opens when visitors click &quot;Watch Film&quot;.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsVideoModalPreviewOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Preview Modal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Documentary Title
                </label>
                <input
                  type="text"
                  value={config.videoTitle}
                  onChange={(e) => setConfig({ ...config, videoTitle: e.target.value })}
                  placeholder="e.g. Where Passion Meets Excellence"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Documentary Subtitle / Badge
                </label>
                <input
                  type="text"
                  value={config.videoSubtitle}
                  onChange={(e) =>
                    setConfig({ ...config, videoSubtitle: e.target.value })
                  }
                  placeholder="e.g. Academy Documentary"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Duration / Tagline
                </label>
                <input
                  type="text"
                  value={config.videoTag}
                  onChange={(e) => setConfig({ ...config, videoTag: e.target.value })}
                  placeholder="e.g. Full-Length Academy Showcase (3:45)"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Synopsis Description
                </label>
                <textarea
                  rows={3}
                  value={config.videoDescription}
                  onChange={(e) =>
                    setConfig({ ...config, videoDescription: e.target.value })
                  }
                  placeholder="Describe the documentary narrative, coaching drills, training facilities, and player interviews..."
                  className="w-full px-3 py-2 text-xs leading-relaxed bg-white border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-4">
              {/* MediaSelector for Video Showcase */}
              <MediaSelector
                label="Full-Length Documentary or Video Showcase (YouTube, Vimeo, MP4)"
                mediaType="video"
                section="hero"
                value={config.videoEmbedUrl || ''}
                onChange={(vid) => setConfig({ ...config, videoEmbedUrl: vid })}
                durationValue={config.videoTag}
                onDurationChange={(tag) => setConfig({ ...config, videoTag: tag })}
                helperText="Upload a video from device, pick from the Media Hub, or paste any YouTube / MP4 stream link."
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Audio & Production Feature Tag
                </label>
                <input
                  type="text"
                  value={config.videoAudioFeature}
                  onChange={(e) =>
                    setConfig({ ...config, videoAudioFeature: e.target.value })
                  }
                  placeholder="e.g. Original Academy Score & Coach Interviews"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Modal Bottom Action CTA Text
                </label>
                <input
                  type="text"
                  value={config.videoCtaText}
                  onChange={(e) =>
                    setConfig({ ...config, videoCtaText: e.target.value })
                  }
                  placeholder="e.g. Book a Trial Now"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>
            </div>
          </div>

          {/* Video Poster Selector */}
          <div>
            <MediaSelector
              label="Video Cinema Poster Backdrop Photo"
              mediaType="image"
              section="hero"
              value={config.videoPosterImage}
              onChange={(img) => setConfig({ ...config, videoPosterImage: img })}
              presets={PRESET_VIDEO_POSTERS.map((p) => ({ label: p.label, url: p.url, type: 'image' as const }))}
              helperText="The still poster displayed before the video plays."
            />
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BACKGROUND ATMOSPHERE */}
      {activeSubTab === 'background' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>Architectural Pitch Atmosphere & Backdrop</span>
              </h3>
              <p className="text-xs text-slate-500">
                Configure full 100% clarity background visuals, overlay intensity, tactical grid, and contrast protection.
              </p>
            </div>
            {config.enableBackground100Percent && (
              <span className="self-start sm:self-auto text-[11px] font-mono font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>100% Full Clarity Active</span>
              </span>
            )}
          </div>

          {/* PRIMARY MASTER OPTION: 100% Background Visibility */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              config.enableBackground100Percent
                ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black uppercase tracking-wide text-slate-900">
                    Enable Background Picture Clearly Visible at 100%
                  </h4>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                      config.enableBackground100Percent
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {config.enableBackground100Percent ? 'Enabled (100% Clear)' : 'Standard Washout'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                  Removes the washed-out white overlay layer and renders your background pitch photograph completely visible at 100% natural opacity, vibrant saturation, and high definition.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={!!config.enableBackground100Percent}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setConfig({
                      ...config,
                      enableBackground100Percent: checked,
                      backgroundOverlayOpacity: checked ? 100 : (config.backgroundOverlayOpacity || 10),
                    });
                  }}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
              </label>
            </div>

            {/* When 100% Background Visibility is Enabled: Contrast Protection Style */}
            {config.enableBackground100Percent && (
              <div className="mt-4 pt-4 border-t border-amber-500/20 space-y-2.5">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Text Contrast & Scrim Atmosphere Style (When 100% Visible):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, backgroundClarityTheme: 'dark-contrast' })}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      config.backgroundClarityTheme === 'dark-contrast' || !config.backgroundClarityTheme
                        ? 'bg-slate-900 text-white border-amber-500 ring-2 ring-amber-500/30 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <span>Cinema Dark Scrim</span>
                      </span>
                      {(config.backgroundClarityTheme === 'dark-contrast' || !config.backgroundClarityTheme) && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Subtle stadium night scrim with crisp white typography, amber glow, and maximum cinematic stadium impact.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, backgroundClarityTheme: 'frosted-card' })}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      config.backgroundClarityTheme === 'frosted-card'
                        ? 'bg-slate-900 text-white border-amber-500 ring-2 ring-amber-500/30 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        <span>Frosted Glass Panel</span>
                      </span>
                      {config.backgroundClarityTheme === 'frosted-card' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      100% visible photograph edge-to-edge behind an architectural frosted-glass typography container.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, backgroundClarityTheme: 'clean-transparent' })}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      config.backgroundClarityTheme === 'clean-transparent'
                        ? 'bg-slate-900 text-white border-amber-500 ring-2 ring-amber-500/30 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>Vivid Unfiltered</span>
                      </span>
                      {config.backgroundClarityTheme === 'clean-transparent' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Pure 100% raw photograph visibility with high-contrast text drop shadows and zero heavy overlay filters.
                    </p>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Manual Opacity Intensity (0% to 100%)
                </label>
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 border border-amber-500/20">
                  {config.backgroundOverlayOpacity}%
                </span>
              </div>

              <div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={config.backgroundOverlayOpacity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setConfig({
                      ...config,
                      backgroundOverlayOpacity: val,
                      enableBackground100Percent: val >= 95,
                    });
                  }}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>0% (Off)</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span className="font-bold text-amber-700">100% (Full Clarity)</span>
                </div>
              </div>

              {/* Quick Opacity Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Quick Opacity Presets:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: '10% Subtle', val: 10, full: false },
                    { label: '35% Medium', val: 35, full: false },
                    { label: '70% Vivid', val: 70, full: false },
                    { label: '100% Clear', val: 100, full: true },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          backgroundOverlayOpacity: p.val,
                          enableBackground100Percent: p.full,
                        })
                      }
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase border transition-colors cursor-pointer text-center ${
                        config.backgroundOverlayOpacity === p.val
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Pitch Grid Blueprint Pattern
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Subtle 24px tactical dot matrix grid behind the copy
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.showPitchGridPattern}
                  onChange={(e) =>
                    setConfig({ ...config, showPitchGridPattern: e.target.checked })
                  }
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>

            {/* Live Backdrop Preview Box */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 min-h-[220px] flex flex-col items-center justify-center text-center p-5 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={config.backgroundImage}
                alt="Backdrop preview"
                style={{
                  opacity: config.enableBackground100Percent
                    ? 1
                    : (config.backgroundOverlayOpacity || 10) / 100,
                }}
                className={`absolute inset-0 w-full h-full object-cover ${
                  config.enableBackground100Percent
                    ? 'saturate-100 brightness-95'
                    : 'brightness-110 saturate-50'
                }`}
              />

              {config.enableBackground100Percent ? (
                config.backgroundClarityTheme === 'dark-contrast' ? (
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-900/45 to-slate-950/85" />
                ) : config.backgroundClarityTheme === 'frosted-card' ? (
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
                )
              ) : (
                <div
                  className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white"
                  style={{
                    opacity: Math.max(0.1, 1 - ((config.backgroundOverlayOpacity || 10) / 100) * 0.7),
                  }}
                />
              )}

              {config.showPitchGridPattern && (
                <div className={`absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] ${
                  config.enableBackground100Percent ? 'opacity-20 invert' : 'opacity-40'
                }`} />
              )}

              <div className={`relative z-10 max-w-sm ${
                config.enableBackground100Percent && config.backgroundClarityTheme === 'frosted-card'
                  ? 'backdrop-blur-md bg-white/90 border border-white/60 p-4 rounded-2xl shadow-lg'
                  : ''
              }`}>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border shadow-xs ${
                  config.enableBackground100Percent && config.backgroundClarityTheme !== 'frosted-card'
                    ? 'text-amber-300 bg-black/60 border-amber-400/40 backdrop-blur-md'
                    : 'text-amber-800 bg-amber-50 border-amber-200'
                }`}>
                  {config.enableBackground100Percent ? '100% Clear Backdrop Active' : 'Live Backdrop Preview'}
                </span>
                <h4 className={`text-base sm:text-lg font-black uppercase mt-2 leading-tight ${
                  config.enableBackground100Percent && config.backgroundClarityTheme !== 'frosted-card'
                    ? 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]'
                    : 'text-slate-900'
                }`}>
                  {config.headlinePart1}
                </h4>
                <p className={`text-[11px] mt-1 line-clamp-1 ${
                  config.enableBackground100Percent && config.backgroundClarityTheme !== 'frosted-card'
                    ? 'text-slate-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]'
                    : 'text-slate-500'
                }`}>
                  {config.subHeadline}
                </p>
              </div>
            </div>
          </div>

          <div>
            <MediaSelector
              label="Hero Pitch Background Image"
              mediaType="image"
              section="hero"
              value={config.backgroundImage}
              onChange={(img) => setConfig({ ...config, backgroundImage: img })}
              presets={PRESET_HERO_BACKGROUNDS.map((p) => ({ label: p.label, url: p.url, type: 'image' as const }))}
              helperText="Upload a high-res pitch or stadium photo from your device, or choose an academy preset."
            />
          </div>
        </div>
      )}

      {/* SUB-TAB 5: STAT STRIP METRICS */}
      {activeSubTab === 'stats' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-600" />
                <span>Stat Strip & Key Academy Highlights</span>
              </h3>
              <p className="text-xs text-slate-500">
                The horizontal proof strip displayed right below the hero action buttons.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddStat}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Metric</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(config.stats || []).map((stat, idx) => (
              <div
                key={stat.id || idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-amber-400 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      Metric #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDeleteStatTarget(stat)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete metric"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Numeric / Highlight Value
                    </label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) =>
                        handleUpdateStat(stat.id, { value: e.target.value })
                      }
                      placeholder="e.g. 450+ or AFC / AIFF"
                      className="w-full px-3 py-1.5 text-sm font-black text-slate-900 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Descriptive Label
                    </label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) =>
                        handleUpdateStat(stat.id, { label: e.target.value })
                      }
                      placeholder="e.g. Registered Players"
                      className="w-full px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-center">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Preview: <strong>{stat.value}</strong> {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>
              Changes to individual metrics save automatically when you click &quot;Save & Sync Cloud&quot;.
            </span>
            <button
              type="button"
              onClick={() => handleSave()}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase cursor-pointer"
            >
              Save Stat Strip
            </button>
          </div>
        </div>
      )}

      {/* Delete Stat Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteStatTarget)}
        title="Delete Stat Metric"
        message="Are you sure you want to remove this metric from the Hero stat strip on the homepage?"
        itemName={deleteStatTarget ? `${deleteStatTarget.value} ${deleteStatTarget.label}` : ''}
        confirmLabel="Remove Metric"
        onConfirm={handleConfirmDeleteStat}
        onCancel={() => setDeleteStatTarget(null)}
      />

      {/* Interactive Video Modal Preview */}
      <VideoModal
        isOpen={isVideoModalPreviewOpen}
        onClose={() => setIsVideoModalPreviewOpen(false)}
        onBookTrialClick={() => {
          setIsVideoModalPreviewOpen(false);
          onNotify({
            type: 'success',
            text: 'Trial booking triggered successfully from the video modal preview!',
          });
        }}
      />
    </div>
  );
};
