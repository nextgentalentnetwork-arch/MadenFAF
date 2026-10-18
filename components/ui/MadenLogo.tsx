'use client';

import React from 'react';

interface MadenLogoProps {
  className?: string;
  variant?: 'full' | 'badge-only' | 'horizontal' | 'compact';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  lightText?: boolean;
  logoType?: 'crest' | 'custom-image';
  customLogoUrl?: string;
  logoIconShape?: 'shield' | 'circle' | 'square' | 'rounded';
  title?: string;
  highlight?: string;
  taglinePrimary?: string;
  taglineSecondary?: string;
  showTaglines?: boolean;
  badgeText?: string;
  showBadge?: boolean;
}

export const MadenLogo: React.FC<MadenLogoProps> = ({
  className = '',
  variant = 'horizontal',
  size = 'md',
  lightText = true,
  logoType = 'crest',
  customLogoUrl,
  logoIconShape = 'shield',
  title = 'MADEN',
  highlight = 'FAF',
  taglinePrimary = 'Maden Football Academy Foundation',
  taglineSecondary = 'Where Passion Meets Excellence',
  showTaglines = true,
  badgeText = 'EST. 2021',
  showBadge = true,
}) => {
  const badgeSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const imageSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const shapeClasses = {
    shield: 'rounded-full', // Match circular official crest
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-2xl',
  };

  const textSizes = {
    sm: { title: 'text-sm', sub: 'text-[9px]' },
    md: { title: 'text-base font-bold tracking-tight', sub: 'text-[10px] tracking-wider' },
    lg: { title: 'text-xl font-extrabold tracking-tight', sub: 'text-xs tracking-wider' },
    xl: { title: 'text-2xl font-black tracking-tight', sub: 'text-sm tracking-wider' },
  };

  const effectiveLogoUrl = customLogoUrl && customLogoUrl.trim().length > 0
    ? customLogoUrl
    : '/images/maden-faf-official-logo.png';

  // Official MADEN FAF Identity Crest (The official circular emblem)
  const LogoGraphic = (
    <div
      className={`${imageSizes[size]} ${shapeClasses[logoIconShape] || 'rounded-full'} shrink-0 drop-shadow-md select-none transition-transform duration-300 hover:scale-105 flex items-center justify-center overflow-hidden bg-slate-950 border border-amber-400/40`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={effectiveLogoUrl}
        alt={`${title} ${highlight} Official Crest`}
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/images/maden-faf-official-logo.png';
        }}
      />
    </div>
  );

  if (variant === 'badge-only') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{LogoGraphic}</div>;
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center gap-2 ${className}`}>
        {LogoGraphic}
        <div>
          <div className={`${textSizes[size].title} font-black ${lightText ? 'text-white' : 'text-slate-900'} uppercase tracking-wider`}>
            {title} {highlight && <span className="text-amber-500">{highlight}</span>}
          </div>
          {showTaglines && taglinePrimary && (
            <div className={`${textSizes[size].sub} font-semibold uppercase text-amber-500 tracking-widest`}>
              {taglinePrimary}
            </div>
          )}
          {showBadge && badgeText && (
            <div className="mt-1 inline-block text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold">
              {badgeText}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default Horizontal
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {LogoGraphic}
      <div className="flex flex-col text-left">
        <div className={`flex items-center gap-1.5 ${textSizes[size].title} uppercase tracking-tight leading-none`}>
          <span className={`font-black ${lightText ? 'text-white' : 'text-slate-900'}`}>{title}</span>
          {highlight && <span className="font-black text-amber-500">{highlight}</span>}
          {showBadge && badgeText && (
            <span className="ml-1 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold">
              {badgeText}
            </span>
          )}
        </div>
        {showTaglines && taglinePrimary && (
          <div className={`${textSizes[size].sub} font-semibold uppercase ${lightText ? 'text-slate-300' : 'text-slate-600'} leading-tight tracking-wider mt-0.5`}>
            {taglinePrimary}
          </div>
        )}
        {showTaglines && taglineSecondary && (
          <div className={`text-[9px] font-medium tracking-widest ${lightText ? 'text-amber-400' : 'text-amber-600 font-semibold'} uppercase`}>
            {taglineSecondary}
          </div>
        )}
      </div>
    </div>
  );
};
