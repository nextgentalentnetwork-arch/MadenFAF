'use client';

import React, { useSyncExternalStore } from 'react';
import { ArrowRight, Play, ExternalLink } from 'lucide-react';
import {
  AcademyDataManager,
  DEFAULT_HERO_CONFIG,
  subscribeAcademyData,
} from '@/lib/academyDataManager';
import { HeroShowcaseConfig } from '@/data/academyData';

interface HeroProps {
  onJoinClick: () => void;
  onExploreProgramsClick: () => void;
  onWatchFilmClick?: () => void;
  onExploreCampusesClick?: () => void;
}

const HIGHLIGHT_COLOR_MAP: Record<string, string> = {
  amber: 'text-amber-600',
  emerald: 'text-emerald-500',
  blue: 'text-blue-600',
  rose: 'text-rose-600',
  slate: 'text-slate-900',
};

const PULSE_COLOR_MAP: Record<
  string,
  { dot: string; bg: string; border: string; text: string }
> = {
  amber: {
    dot: 'bg-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
  },
  emerald: {
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
  },
  blue: {
    dot: 'bg-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
  },
  rose: {
    dot: 'bg-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-800',
  },
};

export const Hero: React.FC<HeroProps> = ({
  onJoinClick,
  onExploreProgramsClick,
  onWatchFilmClick,
  onExploreCampusesClick,
}) => {
  const heroConfig: HeroShowcaseConfig = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getHeroConfig(),
    () => DEFAULT_HERO_CONFIG
  );

  const pulseStyle =
    PULSE_COLOR_MAP[heroConfig.eyebrowPulseColor] || PULSE_COLOR_MAP.amber;
  const highlightColorClass =
    HIGHLIGHT_COLOR_MAP[heroConfig.headlineHighlightColor] ||
    HIGHLIGHT_COLOR_MAP.amber;

  const handleCtaClick = (
    action: 'trialModal' | 'scrollPrograms' | 'scrollCampuses' | 'customUrl',
    url?: string
  ) => {
    if (action === 'trialModal') {
      onJoinClick();
    } else if (action === 'scrollPrograms') {
      onExploreProgramsClick();
    } else if (action === 'scrollCampuses') {
      if (onExploreCampusesClick) {
        onExploreCampusesClick();
      } else {
        const el = document.getElementById('campuses');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (action === 'customUrl' && url) {
      if (url.startsWith('http')) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = url;
      }
    }
  };

  const overlayOpacityDecimal =
    Math.min(Math.max(heroConfig.backgroundOverlayOpacity || 10, 0), 100) / 100;

  return (
    <section className="relative min-h-[90vh] sm:min-h-[92vh] flex flex-col justify-between items-center pt-28 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 text-center border-b border-slate-200">
      {/* Background Architectural Pitch Overlay with customizable image and opacity */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            heroConfig.backgroundImage ||
            'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=2000&q=85'
          }
          alt="MADEN FAF Football Ground"
          style={{ opacity: overlayOpacityDecimal }}
          className="w-full h-full object-cover object-center brightness-110 saturate-50 transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white" />
        {heroConfig.showPitchGridPattern && (
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
        )}
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center items-center text-center my-auto">
        {/* Eyebrow Label (Toggleable & Customizable) */}
        {heroConfig.eyebrowBadgeVisible && (
          <div
            className={`inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full ${pulseStyle.bg} border ${pulseStyle.border} mb-6 sm:mb-8 mx-auto text-center shadow-xs transition-all`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${pulseStyle.dot} animate-pulse`} />
            <span
              className={`text-[11px] sm:text-xs font-bold uppercase tracking-widest ${pulseStyle.text}`}
            >
              {heroConfig.eyebrowBadgeText}
            </span>
          </div>
        )}

        {/* Minimal Powerful Headline */}
        <h1 className="w-full text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tight text-slate-900 leading-[1.08] sm:leading-[1.04] text-center mx-auto text-balance">
          {heroConfig.headlinePart1} <br />
          <span className={highlightColorClass}>{heroConfig.headlineHighlight}</span>
        </h1>

        {/* Crisp Supporting Copy */}
        <p className="mt-5 sm:mt-7 text-sm sm:text-lg md:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto text-center text-balance px-2 sm:px-0">
          {heroConfig.subHeadline}
        </p>

        {/* Centered Action Cluster */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10 w-full sm:w-auto mx-auto">
          {/* CTA 1 (Primary) */}
          {heroConfig.cta1Visible && (
            <button
              onClick={() => handleCtaClick(heroConfig.cta1Action, heroConfig.cta1Url)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-amber-200 flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
            >
              <span>{heroConfig.cta1Text}</span>
              {heroConfig.cta1Action === 'customUrl' ? (
                <ExternalLink className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          )}

          {/* CTA 2 (Secondary) */}
          {heroConfig.cta2Visible && (
            <button
              onClick={() => handleCtaClick(heroConfig.cta2Action, heroConfig.cta2Url)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xs cursor-pointer min-h-[46px] flex items-center justify-center gap-1.5"
            >
              <span>{heroConfig.cta2Text}</span>
              {heroConfig.cta2Action === 'customUrl' && (
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          )}

          {/* Watch Film Button */}
          {heroConfig.showWatchFilmButton && onWatchFilmClick && (
            <button
              onClick={onWatchFilmClick}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer min-h-[46px] flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              <span>{heroConfig.watchFilmButtonText || 'Watch Film'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Clean Spacious Minimal Stat Strip (Dynamic Items) */}
      {heroConfig.stats && heroConfig.stats.length > 0 && (
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
          <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-10 gap-y-3 text-xs sm:text-sm text-slate-600 font-medium border-t border-slate-200 pt-5 sm:pt-6 text-center mx-auto">
            {heroConfig.stats.map((stat, idx) => (
              <React.Fragment key={stat.id || `stat-${idx}`}>
                {idx > 0 && (
                  <span className="hidden sm:inline text-slate-300 select-none">•</span>
                )}
                <div className="flex items-center justify-center gap-2">
                  <span className="font-black text-slate-900 text-sm sm:text-base">
                    {stat.value}
                  </span>
                  <span>{stat.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
