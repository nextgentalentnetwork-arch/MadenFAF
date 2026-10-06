'use client';

import React, { useRef, useState, useSyncExternalStore } from 'react';
import { AcademyDataManager, subscribeAcademyData } from '@/lib/academyDataManager';
import { DEFAULT_SPONSORS, SponsorPartner } from '@/data/academyData';
import { ChevronLeft, ChevronRight, Pause, Play, Handshake, ExternalLink } from 'lucide-react';

const PRESET_SVG_MAP: Record<string, React.ReactNode> = {
  nivia: (
    <svg viewBox="0 0 160 48" className="h-9 w-auto fill-current" aria-label="Nivia Sports">
      <path d="M12 6L28 38H18L6 14V38H0V6H12Z" />
      <path d="M36 6H42V38H36V6Z" />
      <path d="M48 6L58 34L68 6H75L62 42H54L41 6H48Z" />
      <path d="M82 6H88V38H82V6Z" />
      <path d="M102 6L116 38H108L104 29H94L90 38H83L97 6H102ZM99 15L96 23H102L99 15Z" />
      <circle cx="132" cy="18" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M128 18L136 18M132 14L132 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <text x="144" y="16" fontSize="7" fontWeight="bold" fontFamily="sans-serif">®</text>
    </svg>
  ),
  'leninnagar-sc': (
    <div className="flex items-center gap-2.5 font-black tracking-tight text-slate-900">
      <svg viewBox="0 0 40 44" className="w-9 h-9 shrink-0" fill="none">
        <path d="M20 2L36 7V22C36 33 20 42 20 42C20 42 4 33 4 22V7L20 2Z" fill="#b45309" />
        <path d="M20 6L32 10V21C32 29 20 37 20 37C20 37 8 29 8 21V10L20 6Z" fill="#fef3c7" />
        <path d="M16 14H24V18H18V22H23V26H18V32H14V14H16Z" fill="#b45309" />
      </svg>
      <div className="text-left leading-none">
        <span className="block text-sm font-black tracking-wider uppercase">LENINNAGAR</span>
        <span className="block text-[9px] font-bold text-amber-700 font-mono tracking-widest mt-0.5">SPORTING CLUB · 1952</span>
      </div>
    </div>
  ),
  fastandup: (
    <div className="flex items-center gap-2 font-black text-slate-900 tracking-tighter">
      <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0 text-emerald-600 fill-current">
        <path d="M18 2L6 20H17L14 34L28 15H17L22 2H18Z" />
      </svg>
      <div className="text-left leading-tight">
        <span className="text-base sm:text-lg font-black tracking-tighter uppercase text-slate-900">FAST<span className="text-emerald-600">&</span>UP</span>
        <span className="block text-[8px] font-bold uppercase tracking-widest text-slate-500 font-mono">ACTIVE NUTRITION</span>
      </div>
    </div>
  ),
  'ifa-bengal': (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 42 42" className="w-9 h-9 shrink-0 text-amber-600" fill="none">
        <circle cx="21" cy="21" r="19" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="21" cy="21" r="14" fill="#fef3c7" />
        <path d="M21 7V35M7 21H35" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
        <circle cx="21" cy="21" r="6" fill="#d97706" />
      </svg>
      <div className="text-left leading-none">
        <span className="block text-base font-black tracking-wider text-slate-900">IFA BENGAL</span>
        <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono mt-0.5">GOVERNING BODY</span>
      </div>
    </div>
  ),
  'apex-physio': (
    <div className="flex items-center gap-2 text-slate-900">
      <svg viewBox="0 0 38 38" className="w-8 h-8 shrink-0 text-sky-600 fill-none stroke-current" strokeWidth="3">
        <rect x="5" y="5" width="28" height="28" rx="8" fill="#e0f2fe" stroke="none" />
        <path d="M19 10V28M10 19H28" strokeLinecap="round" />
        <circle cx="19" cy="19" r="3" fill="#0284c7" stroke="none" />
      </svg>
      <div className="text-left leading-tight">
        <span className="block text-sm font-black tracking-tight text-slate-900 uppercase">APEX PHYSIO</span>
        <span className="block text-[8px] font-bold text-sky-700 tracking-widest font-mono uppercase">SPORTS MEDICINE</span>
      </div>
    </div>
  ),
  'kalyani-sports': (
    <div className="flex items-center gap-2 text-slate-900">
      <svg viewBox="0 0 38 38" className="w-8 h-8 shrink-0 text-slate-800" fill="none" stroke="currentColor" strokeWidth="2.5">
        <ellipse cx="19" cy="19" rx="16" ry="11" />
        <ellipse cx="19" cy="19" rx="8" ry="5.5" />
        <path d="M3 19H35" strokeDasharray="2 2" />
      </svg>
      <div className="text-left leading-none">
        <span className="block text-sm font-black tracking-tight text-slate-900 uppercase">KALYANI COMPLEX</span>
        <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono mt-0.5">STADIUM PARTNER</span>
      </div>
    </div>
  ),
};

const renderPartnerLogo = (partner: SponsorPartner) => {
  if (partner.presetKey && PRESET_SVG_MAP[partner.presetKey]) {
    return PRESET_SVG_MAP[partner.presetKey];
  }
  if (partner.logoUrl) {
    return (
      <img
        src={partner.logoUrl}
        alt={partner.name}
        className="max-h-10 max-w-[170px] w-auto h-auto object-contain"
      />
    );
  }
  return (
    <div className="flex items-center gap-2 font-black text-slate-900 tracking-tight">
      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500 text-amber-700 flex items-center justify-center font-black text-xs font-mono">
        {partner.name.substring(0, 2).toUpperCase()}
      </div>
      <span className="text-sm font-black uppercase tracking-tight">{partner.name}</span>
    </div>
  );
};

export const SponsorBrandsCarousel: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sponsors = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getSponsors(),
    () => DEFAULT_SPONSORS
  );

  const activeSponsors = sponsors.filter((s) => s.active !== false);
  const carouselItems = activeSponsors.length > 0 ? activeSponsors : DEFAULT_SPONSORS;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="sponsors"
      className="py-14 sm:py-20 bg-slate-50/70 border-t border-slate-200 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center space-y-2.5">
          <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-widest shadow-xs">
            <Handshake className="w-3.5 h-3.5 text-amber-600" />
            <span>Institutional Supporters & Affiliations</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-slate-900 text-center">
            SPONSORS & BRAND PARTNERS
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto text-center leading-relaxed">
            Proudly collaborating with certified sporting clubs, national kit manufacturers, sports science hubs, and youth football federations across Bengal.
          </p>

          {/* Centered Carousel Controls */}
          <div className="flex items-center justify-center gap-2.5 pt-2">
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              aria-label={isPaused ? 'Resume Carousel' : 'Pause Carousel'}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer min-h-[38px]"
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                  <span>Resume Auto-Scroll</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-slate-500" />
                  <span>Pause Carousel</span>
                </>
              )}
            </button>

            <button
              onClick={scrollLeft}
              aria-label="Scroll left"
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-slate-700 hover:text-slate-900 transition-all shadow-xs cursor-pointer active:scale-95 min-w-[38px] min-h-[38px] flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={scrollRight}
              aria-label="Scroll right"
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-slate-700 hover:text-slate-900 transition-all shadow-xs cursor-pointer active:scale-95 min-w-[38px] min-h-[38px] flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- CONTINUOUS BRAND LOGO CAROUSEL ---------------- */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] py-3">
        <div
          ref={scrollContainerRef}
          className={`flex gap-4 sm:gap-6 ${isPaused ? 'overflow-x-auto no-scrollbar' : 'animate-marquee'}`}
        >
          {carouselItems.concat(carouselItems).map((partner, idx) => (
            <div
              key={`${partner.id}-${idx}`}
              className="shrink-0 h-24 sm:h-28 w-56 sm:w-64 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-400 hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center p-4 group cursor-default select-none relative"
            >
              <div className="h-10 sm:h-12 w-full flex items-center justify-center text-slate-700 group-hover:text-slate-950 transition-colors">
                {renderPartnerLogo(partner)}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 font-medium group-hover:text-amber-700 transition-colors truncate max-w-[190px]">
                  {partner.category}
                </span>
                {partner.websiteUrl && partner.websiteUrl !== '#' && (
                  <a
                    href={partner.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-600 transition-opacity"
                    title={`Visit ${partner.name}`}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reverse Sub-Row for dynamic visual balance */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] pt-2 pb-2">
        <div
          className={`flex gap-4 sm:gap-6 ${isPaused ? 'overflow-x-auto no-scrollbar' : 'animate-marquee-reverse'}`}
        >
          {carouselItems
            .slice()
            .reverse()
            .concat(carouselItems.slice().reverse())
            .map((partner, idx) => (
              <div
                key={`rev-${partner.id}-${idx}`}
                className="shrink-0 h-20 sm:h-24 w-48 sm:w-56 rounded-2xl bg-white/80 border border-slate-200 shadow-xs hover:bg-white hover:border-amber-400 hover:shadow-sm transition-all duration-300 flex flex-col items-center justify-center p-3 group cursor-default select-none"
              >
                <div className="h-9 w-full flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity">
                  {renderPartnerLogo(partner)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};
