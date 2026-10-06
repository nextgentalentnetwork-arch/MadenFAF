'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { X, Play, Volume2, Shield, RotateCcw } from 'lucide-react';
import {
  AcademyDataManager,
  DEFAULT_HERO_CONFIG,
  subscribeAcademyData,
} from '@/lib/academyDataManager';
import { HeroShowcaseConfig } from '@/data/academyData';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookTrialClick: () => void;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    if (url.includes('youtube.com/embed/')) {
      return url.includes('autoplay') ? url : `${url}?autoplay=1`;
    }
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
  } catch {}
  return null;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  onBookTrialClick,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const heroConfig: HeroShowcaseConfig = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getHeroConfig(),
    () => DEFAULT_HERO_CONFIG
  );

  if (!isOpen) return null;

  const ytEmbed = heroConfig.videoEmbedUrl
    ? getYouTubeEmbedUrl(heroConfig.videoEmbedUrl)
    : null;
  const isDirectVideo =
    heroConfig.videoEmbedUrl &&
    (heroConfig.videoEmbedUrl.endsWith('.mp4') ||
      heroConfig.videoEmbedUrl.endsWith('.webm') ||
      heroConfig.videoEmbedUrl.endsWith('.ogg'));

  const handleClose = () => {
    setIsPlaying(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-slate-950 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
              FILM
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                {heroConfig.videoSubtitle || 'Academy Documentary'}
              </div>
              <h3 className="text-xs sm:text-base font-bold text-white leading-tight">
                {heroConfig.videoTitle || 'Where Passion Meets Excellence'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPlaying && (
              <button
                onClick={() => setIsPlaying(false)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Return to synopsis view"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Overview</span>
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
              aria-label="Close video modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas or Poster Player */}
        <div className="relative aspect-video w-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden group">
          {isPlaying && ytEmbed ? (
            <iframe
              src={ytEmbed}
              title={heroConfig.videoTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : isPlaying && isDirectVideo ? (
            <video
              src={heroConfig.videoEmbedUrl}
              poster={heroConfig.videoPosterImage}
              controls
              autoPlay
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <>
              {/* Poster Backdrop */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  heroConfig.videoPosterImage ||
                  'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1600&q=80'
                }
                alt={heroConfig.videoTitle || 'MADEN FAF Footballers Training'}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />

              {/* Center Play Graphic */}
              <div className="relative z-10 flex flex-col items-center text-center p-4 sm:p-6 space-y-2 sm:space-y-4 max-w-lg">
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-2xl shadow-amber-900/40 border-2 border-amber-300 cursor-pointer transform hover:scale-110 active:scale-95 transition-transform"
                  aria-label="Play video"
                >
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-1" />
                </button>

                <div>
                  <span className="text-[10px] sm:text-xs uppercase font-mono text-amber-400 font-semibold tracking-wider">
                    {heroConfig.videoTag || `Full-Length Academy Showcase (${heroConfig.videoDuration || '3:45'})`}
                  </span>
                  <h4 className="text-base sm:text-xl font-black text-white uppercase tracking-tight mt-1 leading-tight">
                    {heroConfig.videoTitle || 'The Journey of a MADEN FAF Footballer'}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-300 mt-1 line-clamp-2 sm:line-clamp-none">
                    {heroConfig.videoDescription}
                  </p>
                </div>

                {heroConfig.videoAudioFeature && (
                  <div className="hidden sm:flex flex-wrap items-center justify-center gap-3 pt-1">
                    <span className="text-[11px] text-slate-300 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      {heroConfig.videoAudioFeature}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Bottom Action */}
        <div className="p-3.5 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs text-slate-300">
              Inspired by the dedication of our 450+ young footballers and licensed coaching panel.
            </div>
          </div>

          <button
            onClick={() => {
              handleClose();
              onBookTrialClick();
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider transition-all min-h-[44px] cursor-pointer"
          >
            {heroConfig.videoCtaText || 'Book a Trial Now'}
          </button>
        </div>
      </div>
    </div>
  );
};
