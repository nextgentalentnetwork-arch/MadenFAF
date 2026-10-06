'use client';

import React from 'react';

interface MadenLogoProps {
  className?: string;
  variant?: 'full' | 'badge-only' | 'horizontal' | 'compact';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  lightText?: boolean;
}

export const MadenLogo: React.FC<MadenLogoProps> = ({
  className = '',
  variant = 'horizontal',
  size = 'md',
  lightText = true,
}) => {
  const badgeSizes = {
    sm: 'w-8 h-10',
    md: 'w-10 h-12',
    lg: 'w-14 h-16',
    xl: 'w-20 h-24',
  };

  const textSizes = {
    sm: { title: 'text-sm', sub: 'text-[9px]' },
    md: { title: 'text-base font-bold tracking-tight', sub: 'text-[10px] tracking-wider' },
    lg: { title: 'text-xl font-extrabold tracking-tight', sub: 'text-xs tracking-wider' },
    xl: { title: 'text-2xl font-black tracking-tight', sub: 'text-sm tracking-wider' },
  };

  // Official MADEN FAF Crest SVG
  const CrestSvg = (
    <svg
      viewBox="0 0 100 120"
      className={`${badgeSizes[size]} drop-shadow-md select-none shrink-0 transition-transform duration-300 hover:scale-105`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="MADEN FAF Official Crest"
    >
      <defs>
        {/* Shield Gradient */}
        <linearGradient id="crestBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="45%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#090D16" />
        </linearGradient>
        {/* Gold Accent Gradient */}
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        {/* Mustard Yellow Accent Gradient */}
        <linearGradient id="mustardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      {/* Outer Shield Border */}
      <path
        d="M50 4 L92 20 V62 C92 90 50 114 50 114 C50 114 8 90 8 62 V20 L50 4 Z"
        fill="url(#mustardGrad)"
        stroke="#D97706"
        strokeWidth="1.5"
      />

      {/* Inner Shield Body */}
      <path
        d="M50 8 L87 23 V61 C87 86 50 108 50 108 C50 108 13 86 13 61 V23 L50 8 Z"
        fill="url(#crestBg)"
        stroke="url(#goldGrad)"
        strokeWidth="1.8"
      />

      {/* Vertical Subtle Dividing Pinstripe */}
      <line x1="50" y1="8" x2="50" y2="106" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="1" strokeDasharray="2 2" />

      {/* Golden Championship Star at Top */}
      <path
        d="M50 15 L52.2 21.8 L59.3 21.8 L53.5 25.9 L55.7 32.7 L50 28.5 L44.3 32.7 L46.5 25.9 L40.7 21.8 L47.8 21.8 Z"
        fill="url(#goldGrad)"
      />

      {/* Center Stylized Football Geometric Panels */}
      <circle cx="50" cy="52" r="17" fill="#0A0F18" stroke="url(#goldGrad)" strokeWidth="1.4" />
      {/* Football Pentagon Core */}
      <polygon points="50,44 57,49 54,58 46,58 43,49" fill="#D97706" stroke="#FFFFFF" strokeWidth="0.8" />
      {/* Seam Lines */}
      <line x1="50" y1="44" x2="50" y2="36" stroke="#FFFFFF" strokeWidth="0.9" />
      <line x1="57" y1="49" x2="65" y2="46" stroke="#FFFFFF" strokeWidth="0.9" />
      <line x1="54" y1="58" x2="61" y2="65" stroke="#FFFFFF" strokeWidth="0.9" />
      <line x1="46" y1="58" x2="39" y2="65" stroke="#FFFFFF" strokeWidth="0.9" />
      <line x1="43" y1="49" x2="35" y2="46" stroke="#FFFFFF" strokeWidth="0.9" />

      {/* Brand Text Banner */}
      <rect x="22" y="74" width="56" height="15" rx="3" fill="#D97706" stroke="url(#goldGrad)" strokeWidth="0.8" />
      <text
        x="50"
        y="85"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="sans-serif"
        fontSize="8.5"
        fontWeight="900"
        letterSpacing="0.8"
      >
        MADEN FAF
      </text>

      {/* Est Ribbon / Subtext */}
      <text
        x="50"
        y="100"
        textAnchor="middle"
        fill="#FDE68A"
        fontFamily="sans-serif"
        fontSize="5.5"
        fontWeight="700"
        letterSpacing="1.2"
      >
        EST. 2021
      </text>
    </svg>
  );

  if (variant === 'badge-only') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{CrestSvg}</div>;
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center gap-2 ${className}`}>
        {CrestSvg}
        <div>
          <div className={`${textSizes[size].title} font-black ${lightText ? 'text-white' : 'text-slate-900'} uppercase tracking-wider`}>
            MADEN <span className="text-amber-500">FAF</span>
          </div>
          <div className={`${textSizes[size].sub} font-semibold uppercase text-amber-500 tracking-widest`}>
            Maden Football Academy Foundation
          </div>
        </div>
      </div>
    );
  }

  // Default Horizontal
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {CrestSvg}
      <div className="flex flex-col text-left">
        <div className={`flex items-center gap-1.5 ${textSizes[size].title} uppercase tracking-tight leading-none`}>
          <span className={`font-black ${lightText ? 'text-white' : 'text-slate-900'}`}>MADEN</span>
          <span className="font-black text-amber-500">FAF</span>
        </div>
        <div className={`${textSizes[size].sub} font-semibold uppercase ${lightText ? 'text-slate-300' : 'text-slate-600'} leading-tight tracking-wider mt-0.5`}>
          Maden Football Academy Foundation
        </div>
        <div className={`text-[9px] font-medium tracking-widest ${lightText ? 'text-amber-400' : 'text-amber-600 font-semibold'} uppercase`}>
          Where Passion Meets Excellence
        </div>
      </div>
    </div>
  );
};
