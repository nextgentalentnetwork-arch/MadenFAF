'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Target, BookOpen, Trophy, BarChart3, UserCheck, HeartHandshake, CheckCircle2, ChevronRight, ChevronLeft, Sparkles, Quote } from 'lucide-react';

interface StorytellingProps {
  onLearnMoreClick: (tab: string) => void;
}

export const Storytelling: React.FC<StorytellingProps> = ({ onLearnMoreClick }) => {
  const [activeCard, setActiveCard] = useState<number>(0);
  const [visibleColumns, setVisibleColumns] = useState<number>(3);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const pillars = [
    {
      id: 'train',
      num: '01',
      title: 'TRAIN',
      headline: 'Structured Football Development',
      icon: Target,
      accent: 'border-amber-200 text-amber-700 bg-amber-50',
      badgeBg: 'bg-amber-500',
      summary: 'Periodized training sessions structured around high ball repetition, bilateral execution, and game-specific intensity.',
      details: [
        'Curriculum rooted in AFC and international modern youth development models',
        'Strict coach-to-player ratios ensuring personalized technical feedback',
        'Year-round periodization designed to avoid burnout and foster peak readiness',
        'High-lux floodlit grass pitches with modern speed gates and rebounders'
      ],
      quote: '“We do not run laps without balls. Every minute on the grass connects technical skill to spatial reality.”'
    },
    {
      id: 'learn',
      num: '02',
      title: 'LEARN',
      headline: 'Football Intelligence & Education',
      icon: BookOpen,
      accent: 'border-amber-200 text-amber-600 bg-amber-50',
      badgeBg: 'bg-amber-600',
      summary: 'Footballers who understand the game make decisions before the ball arrives. We teach scan frequencies and tactical literacy.',
      details: [
        'Dedicated Audio-Visual Tactical Room at Gayeshpur and Krishnanagar',
        'Pre-match tactical briefing and post-match video clip breakdowns',
        'Academic balance tracking to guarantee players maintain good school standing',
        'Nutrition workshops, sleep science, and athletic habit formation'
      ],
      quote: '“A player with great technique but poor game vision cannot survive in modern football. We build football intellect.”'
    },
    {
      id: 'compete',
      num: '03',
      title: 'COMPETE',
      headline: 'Regular Match & Competition Exposure',
      icon: Trophy,
      accent: 'border-emerald-200 text-emerald-600 bg-emerald-50',
      badgeBg: 'bg-emerald-600',
      summary: 'Training is tested in real competition. Our teams participate in authorized district leagues, IFA youth tournaments, and friendlies.',
      details: [
        'Regular competitive fixtures against Bengal’s storied clubs and academies',
        'Exposure to varied opposition styles (high pressing, deep block, physical direct)',
        'Home matchday experience with referees, ball kids, and local supporters',
        'High-pressure knockout cup tournaments fostering mental grit'
      ],
      quote: '“Competition is not about winning at all costs; it is the ultimate classroom for assessing developmental progress.”'
    },
    {
      id: 'perform',
      num: '04',
      title: 'PERFORM',
      headline: 'Data-Driven Player Assessment',
      icon: BarChart3,
      accent: 'border-sky-200 text-sky-600 bg-sky-50',
      badgeBg: 'bg-sky-600',
      summary: 'Replacing guesswork with structured assessment rubrics across technical, tactical, physical, and psychological markers.',
      details: [
        'Quarterly digital player report cards available directly in the Parent/Player portal',
        'Yo-Yo endurance test, 30m sprint laser timings, and first-touch index metrics',
        'Video tagged clips allowing coaches to share tailored individual development points',
        'Standardized grading rubrics recognized by scouts and state selectors'
      ],
      quote: '“When player progress is measured objectively, young athletes take genuine ownership of their development.”'
    },
    {
      id: 'grow',
      num: '05',
      title: 'GROW',
      headline: 'Character, Discipline & Leadership',
      icon: UserCheck,
      accent: 'border-purple-200 text-purple-600 bg-purple-50',
      badgeBg: 'bg-purple-600',
      summary: 'We build champions in life first. Respect, punctuality, resilience in defeat, and sportsmanship are non-negotiable standards.',
      details: [
        'Zero-tolerance policy on poor sportsmanship, bullying, or referee dissent',
        'Mandatory team duties (kit care, pitch equipment pack-down, ball management)',
        'Leadership captaincy rotation giving every trainee communication responsibility',
        'Parent workshops on supporting healthy athletic ambition and positive encouragement'
      ],
      quote: '“We judge our success not by the trophies on our shelves, but by the integrity of the young people who graduate our gates.”'
    },
    {
      id: 'serve',
      num: '06',
      title: 'SERVE',
      headline: 'Community & Financial Accessibility',
      icon: HeartHandshake,
      accent: 'border-rose-200 text-rose-600 bg-rose-50',
      badgeBg: 'bg-rose-600',
      summary: 'Football belongs to everyone. Our foundation guarantees that financial background never prevents an exceptional talent from thriving.',
      details: [
        '30% reserved full-merit scholarships for underprivileged grassroots footballers',
        'Free boots, training kits, and nutrition support for scholarship athletes',
        'Community grassroots football festivals open to all local village and town youth',
        'Collaboration with established local sports clubs like Leninnagar and United Red Star'
      ],
      quote: '“If a child in Bengal has the hunger and talent to play, MADEN FAF will ensure they have the pitch, boots, and coaches to flourish.”'
    }
  ];

  // Update visible columns on viewport change (PC: 3, Tablet: 2, Mobile: 1)
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth >= 1024) {
        setVisibleColumns(3);
      } else if (window.innerWidth >= 640) {
        setVisibleColumns(2);
      } else {
        setVisibleColumns(1);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const scrollToSlide = useCallback((index: number) => {
    const carousel = carouselRef.current;
    if (carousel) {
      const card = carousel.children[index] as HTMLElement;
      if (card) {
        carousel.scrollTo({
          left: card.offsetLeft - carousel.offsetLeft,
          behavior: 'smooth',
        });
      }
    }
    setActiveCard(index);
  }, []);

  const handleScroll = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const scrollPosition = carousel.scrollLeft;
    const firstChild = carousel.children[0] as HTMLElement;
    if (!firstChild) return;
    const cardWidth = firstChild.offsetWidth;
    const gap = window.innerWidth >= 640 ? 24 : 16;
    const newIndex = Math.round(scrollPosition / (cardWidth + gap));
    if (newIndex >= 0 && newIndex < pillars.length && newIndex !== activeCard) {
      setActiveCard(newIndex);
    }
  };

  const handlePrev = () => {
    const nextIndex = Math.max(0, activeCard - 1);
    scrollToSlide(nextIndex);
  };

  const handleNext = () => {
    const nextIndex = Math.min(pillars.length - 1, activeCard + 1);
    scrollToSlide(nextIndex);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section id="about" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold uppercase tracking-widest text-amber-800 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>The MADEN Philosophy</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-900 leading-tight">
            MORE THAN A FOOTBALL ACADEMY
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            MADEN FAF combines{' '}
            <span className="text-slate-900 font-bold">Training</span> +{' '}
            <span className="text-slate-900 font-bold">Education</span> +{' '}
            <span className="text-slate-900 font-bold">Competition</span> +{' '}
            <span className="text-slate-900 font-bold">Performance</span> +{' '}
            <span className="text-slate-900 font-bold">Character</span> +{' '}
            <span className="text-slate-900 font-bold">Opportunity</span>
          </p>
        </div>

        {/* Quick Pillar Tap Navigation Chips */}
        <div className="flex items-center justify-start md:justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-8 overflow-x-auto no-scrollbar touch-pan-x pb-2">
          {pillars.map((p, idx) => {
            const isCurrent = activeCard === idx;
            return (
              <button
                key={p.id}
                onClick={() => scrollToSlide(idx)}
                className={`shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all min-h-[38px] cursor-pointer flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm shadow-amber-200'
                    : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs'
                }`}
              >
                <span className="text-[10px] font-mono opacity-70">{p.num}</span>
                <span>{p.title}</span>
              </button>
            );
          })}
        </div>

        {/* Carousel Control Bar */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              Pillar 0{activeCard + 1} / 0{pillars.length}
            </span>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
              {pillars[activeCard].title}
            </span>
            <span className="hidden md:inline-block text-[11px] text-slate-500 font-mono pl-2 border-l border-slate-200">
              Showing 3 Pillars per view on PC
            </span>
          </div>

          {/* Left & Right Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={activeCard === 0}
              aria-label="Previous pillar in carousel"
              className={`p-2.5 rounded-xl border transition-all min-w-[42px] min-h-[42px] flex items-center justify-center cursor-pointer ${
                activeCard === 0
                  ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                  : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-xs active:scale-95'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={activeCard >= pillars.length - 1}
              aria-label="Next pillar in carousel"
              className={`p-2.5 rounded-xl border transition-all min-w-[42px] min-h-[42px] flex items-center justify-center cursor-pointer ${
                activeCard >= pillars.length - 1
                  ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                  : 'border-amber-500 text-slate-950 bg-amber-500 hover:bg-amber-600 active:scale-95 shadow-xs'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Unified Carousel */}
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-2 px-0.5 touch-pan-x"
        >
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            const isActive = activeCard === idx;

            return (
              <div
                key={pillar.id}
                onClick={() => setActiveCard(idx)}
                className={`shrink-0 snap-start rounded-2xl p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between cursor-pointer select-none
                  w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]
                  ${
                    isActive
                      ? 'bg-white border-amber-500 shadow-xl shadow-amber-100 ring-1 ring-amber-500/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md'
                  }
                `}
              >
                <div>
                  {/* Top Bar: Number & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                        {pillar.num}
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-600">
                        {pillar.title}
                      </span>
                    </div>

                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${pillar.accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Headline & Summary */}
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2 leading-snug">
                    {pillar.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                    {pillar.summary}
                  </p>

                  {/* Key Points Checklist */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    {pillar.details.map((item, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coach Quote Footer */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-amber-800 font-bold mb-1">
                    <Quote className="w-3 h-3 text-amber-600" />
                    <span>Academy Principle</span>
                  </div>
                  <p className="text-xs italic text-amber-900/90 leading-relaxed">
                    {pillar.quote}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Bottom Dot Indicators */}
        <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
          {pillars.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => scrollToSlide(idx)}
              aria-label={`Go to philosophy pillar ${p.title}`}
              className="p-1 rounded-full transition-all min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  activeCard === idx
                    ? 'w-8 h-2 bg-amber-500 shadow-sm'
                    : 'w-2.5 h-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Supporting Vision Banner */}
        <div className="mt-10 sm:mt-14 p-5 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1 text-left">
            <div className="text-xs uppercase font-mono tracking-wider text-amber-700 font-bold">
              Our Vision & Mission
            </div>
            <h4 className="text-base sm:text-xl font-bold text-slate-900 leading-tight">
              To be the gold standard in youth football development across Eastern India
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Nurturing technically gifted, tactically astute, physically resilient, and morally grounded athletes equipped to compete on state, national, and international stages.
            </p>
          </div>

          <button
            onClick={() => onLearnMoreClick('pathway')}
            className="w-full md:w-auto shrink-0 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 min-h-[44px] cursor-pointer shadow-sm"
          >
            <span>Explore The Pathway</span>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </section>
  );
};
