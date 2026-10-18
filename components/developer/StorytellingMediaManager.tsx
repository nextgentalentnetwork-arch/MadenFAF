'use client';

import React, { useState, useSyncExternalStore } from 'react';
import {
  StoryPillarMedia,
  DEFAULT_STORYTELLING_MEDIA,
} from '@/data/academyData';
import {
  AcademyDataManager,
  subscribeAcademyData,
} from '@/lib/academyDataManager';
import { MediaSelector } from './MediaSelector';
import {
  Sparkles,
  Target,
  BookOpen,
  Trophy,
  BarChart3,
  UserCheck,
  HeartHandshake,
  CheckCircle2,
  Film,
  Image as ImageIcon,
  Play,
  Save,
} from 'lucide-react';

interface StorytellingMediaManagerProps {
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}

const PILLAR_METAS = [
  {
    id: 'train',
    num: '01',
    title: 'TRAIN',
    headline: 'Structured Football Development',
    icon: Target,
    accent: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  {
    id: 'learn',
    num: '02',
    title: 'LEARN',
    headline: 'Football Intelligence & Education',
    icon: BookOpen,
    accent: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    id: 'compete',
    num: '03',
    title: 'COMPETE',
    headline: 'Regular Match & Competition Exposure',
    icon: Trophy,
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'perform',
    num: '04',
    title: 'PERFORM',
    headline: 'Data-Driven Player Assessment',
    icon: BarChart3,
    accent: 'text-sky-600 bg-sky-50 border-sky-200',
  },
  {
    id: 'grow',
    num: '05',
    title: 'GROW',
    headline: 'Character, Discipline & Leadership',
    icon: UserCheck,
    accent: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    id: 'serve',
    num: '06',
    title: 'SERVE',
    headline: 'Community & Financial Accessibility',
    icon: HeartHandshake,
    accent: 'text-rose-600 bg-rose-50 border-rose-200',
  },
];

export const StorytellingMediaManager: React.FC<StorytellingMediaManagerProps> = ({
  onNotify,
}) => {
  const storytellingMedia = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getStorytellingMedia(),
    () => DEFAULT_STORYTELLING_MEDIA
  );

  const [activePillarId, setActivePillarId] = useState<string>('train');

  const currentMedia: StoryPillarMedia =
    storytellingMedia[activePillarId] || {
      id: activePillarId,
      title: activePillarId.toUpperCase(),
      image: '',
      videoUrl: '',
    };

  const handleUpdate = (partial: Partial<StoryPillarMedia>) => {
    AcademyDataManager.updateStoryPillarMedia(activePillarId, partial);
    onNotify({
      type: 'success',
      text: `Updated media for Pillar 0${
        PILLAR_METAS.findIndex((p) => p.id === activePillarId) + 1
      } (${activePillarId.toUpperCase()}). Live on homepage!`,
    });
  };

  const activeMeta = PILLAR_METAS.find((p) => p.id === activePillarId) || PILLAR_METAS[0];
  const Icon = activeMeta.icon;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold uppercase tracking-wider text-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Storytelling & Academy Pillars Media</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight mt-1.5">
            PILLAR PHOTOS & VIDEOS (6 PILLARS)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Attach dedicated high-definition photographs and video clips (rondos, classroom, speed gates) to the Storytelling section cards.
          </p>
        </div>
      </div>

      {/* Pillars Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {PILLAR_METAS.map((pillar) => {
          const isSelected = activePillarId === pillar.id;
          const media = storytellingMedia[pillar.id];
          const hasImage = Boolean(media?.image);
          const hasVideo = Boolean(media?.videoUrl);
          const PillarIcon = pillar.icon;

          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => setActivePillarId(pillar.id)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 font-black border-amber-600 shadow-sm ring-2 ring-amber-500/20'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold opacity-80">
                  {pillar.num}
                </span>
                <div className="flex items-center gap-1">
                  {hasImage && (
                    <span
                      title="Photo attached"
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-slate-950' : 'bg-emerald-500'
                      }`}
                    />
                  )}
                  {hasVideo && (
                    <span
                      title="Video attached"
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-slate-950' : 'bg-purple-500'
                      }`}
                    />
                  )}
                </div>
              </div>
              <div className="mt-2">
                <div className="text-xs font-black tracking-wider uppercase">
                  {pillar.title}
                </div>
                <div className="text-[10px] opacity-75 truncate">
                  {pillar.headline}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Editor Box for Active Pillar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${activeMeta.accent}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-amber-700 font-bold">
                Configuring Pillar {activeMeta.num} Media
              </div>
              <h3 className="text-base font-black text-slate-900 uppercase">
                {activeMeta.title} — {activeMeta.headline}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <span>Autosaves on change</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        {/* 1. PHOTO SELECTOR */}
        <MediaSelector
          label={`Pillar ${activeMeta.num} (${activeMeta.title}) Custom Photo`}
          mediaType="image"
          section="storytelling"
          value={currentMedia.image || ''}
          onChange={(img) => handleUpdate({ image: img })}
          helperText="Custom background or action card photograph for this academy pillar."
        />

        {/* 2. VIDEO SELECTOR */}
        <MediaSelector
          label={`Pillar ${activeMeta.num} (${activeMeta.title}) Demonstration Video`}
          mediaType="video"
          section="storytelling"
          value={currentMedia.videoUrl || ''}
          onChange={(vid) => handleUpdate({ videoUrl: vid })}
          durationValue={currentMedia.videoTag}
          onDurationChange={(tag) => handleUpdate({ videoTag: tag })}
          helperText="Attach an action video or drill breakdown (YouTube, Vimeo, or MP4). Adds a playable video trigger directly on the storytelling card!"
        />
      </div>
    </div>
  );
};
