'use client';

import React, { useState, useRef, useEffect, useCallback, useSyncExternalStore } from 'react';
import { Program, ACADEMY_PROGRAMS } from '@/data/academyData';
import { AcademyDataManager, subscribeAcademyData } from '@/lib/academyDataManager';
import { 
  Check, 
  ArrowRight, 
  Clock, 
  Users, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Shield, 
  Target, 
  Award,
  Layers,
  Info,
  Calendar,
  X,
  ExternalLink
} from 'lucide-react';

interface ProgramsSectionProps {
  onSelectProgram: (programId: string) => void;
}

export const ProgramsSection: React.FC<ProgramsSectionProps> = ({ onSelectProgram }) => {
  const programs = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getPrograms(),
    () => ACADEMY_PROGRAMS
  );

  const [activeFilter, setActiveFilter] = useState<'all' | 'foundation' | 'competitive' | 'specialized'>('all');
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [visibleColumns, setVisibleColumns] = useState<number>(3);
  const [selectedModalProgram, setSelectedModalProgram] = useState<Program | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Filter programs based on selected tab
  const filteredPrograms = programs.filter((p) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'foundation') return p.id === 'foundation' || p.id === 'development';
    if (activeFilter === 'competitive') return p.id === 'advanced' || p.id === 'elite';
    if (activeFilter === 'specialized') return p.id === 'goalkeeper' || p.id === 'girls-football' || p.id === 'holiday-camps' || p.id === 'specialized';
    return true;
  });

  // Calculate visible columns dynamically: PC: 3, Tablet: 2, Mobile: 1
  useEffect(() => {
    const updateColumns = () => {
      if (typeof window === 'undefined') return;
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
    if (!carousel) return;
    const cards = carousel.children;
    if (cards && cards[index]) {
      const targetCard = cards[index] as HTMLElement;
      carousel.scrollTo({
        left: targetCard.offsetLeft - carousel.offsetLeft,
        behavior: 'smooth'
      });
    }
    setActiveSlide(index);
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
    if (newIndex >= 0 && newIndex < filteredPrograms.length && newIndex !== activeSlide) {
      setActiveSlide(newIndex);
    }
  };

  const handlePrev = () => {
    const nextIndex = Math.max(0, activeSlide - 1);
    scrollToSlide(nextIndex);
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, filteredPrograms.length - visibleColumns);
    const nextIndex = Math.min(filteredPrograms.length - 1, activeSlide + 1);
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

  const handleFilterChange = (filter: 'all' | 'foundation' | 'competitive' | 'specialized') => {
    setActiveFilter(filter);
    setActiveSlide(0);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const isAtStart = activeSlide === 0;
  const isAtEnd = activeSlide >= filteredPrograms.length - 1;

  return (
    <section id="programs" className="py-16 sm:py-24 bg-white border-t border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold uppercase tracking-wider text-amber-800 shadow-xs">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Structured Age-Appropriate Curriculum</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-900">
              FOOTBALL PROGRAMS
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Periodized training modules designed around developmental stages from U6 Grassroots to U18 Pre-Professional squads.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl overflow-x-auto no-scrollbar touch-pan-x w-full md:w-auto">
            <button
              onClick={() => handleFilterChange('all')}
              className={`shrink-0 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer min-h-[38px] ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({ACADEMY_PROGRAMS.length})
            </button>
            <button
              onClick={() => handleFilterChange('foundation')}
              className={`shrink-0 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer min-h-[38px] ${
                activeFilter === 'foundation'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Foundation (U6–U13)
            </button>
            <button
              onClick={() => handleFilterChange('competitive')}
              className={`shrink-0 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer min-h-[38px] ${
                activeFilter === 'competitive'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Competitive (U14–U18)
            </button>
            <button
              onClick={() => handleFilterChange('specialized')}
              className={`shrink-0 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer min-h-[38px] ${
                activeFilter === 'specialized'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              GK, Girls & Clinics
            </button>
          </div>
        </div>

        {/* Carousel Control & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              Slide {activeSlide + 1} of {filteredPrograms.length}
            </span>
            <div className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide truncate max-w-[220px] sm:max-w-xs">
              {filteredPrograms[activeSlide]?.name || 'Programs'}
            </div>
            
            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-slate-500 font-mono pl-3 border-l border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              PC 3-Column View
            </span>
          </div>

          {/* Previous / Next Arrow Navigation Controls */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              onClick={handlePrev}
              disabled={isAtStart}
              aria-label="Previous program card"
              className={`p-2 rounded-xl border transition-all min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer ${
                isAtStart
                  ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed opacity-50'
                  : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-100 shadow-xs active:scale-95'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={isAtEnd}
              aria-label="Next program card"
              className={`p-2 rounded-xl border transition-all min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer ${
                isAtEnd
                  ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed opacity-50'
                  : 'border-amber-500 text-slate-950 bg-amber-500 hover:bg-amber-600 shadow-xs active:scale-95'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Track */}
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-2 px-0.5 touch-pan-x"
        >
          {filteredPrograms.map((prog, idx) => {
            const isCurrent = activeSlide === idx;

            return (
              <div
                key={prog.id}
                onClick={() => setActiveSlide(idx)}
                className={`shrink-0 snap-start rounded-2xl p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between group shadow-sm
                  w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]
                  ${
                    isCurrent
                      ? 'bg-white border-amber-500 shadow-xl shadow-amber-100 ring-1 ring-amber-500/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }
                `}
              >
                <div>
                  {/* Top Bar: Age Group & Ratio */}
                  <div className="flex items-center justify-between text-xs mb-3 gap-2">
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md text-[11px]">
                      {prog.ageGroup}
                    </span>
                    <span className="text-[11px] text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {prog.coachRatio.split(' ')[0]} Ratio
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="mb-2">
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
                      {prog.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1 line-clamp-1">
                      {prog.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
                    {prog.description}
                  </p>

                  {/* Key Highlights */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                      <span>Curriculum Highlights</span>
                      <span className="text-[10px] font-mono text-amber-600">AFC Standard</span>
                    </div>
                    {prog.keyFeatures.slice(0, 3).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pillar Balance Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1.5">
                      <span className="text-slate-700 font-semibold">Development Emphasis</span>
                      <span>Tech {prog.pillarEmphasis.technical}% · Tac {prog.pillarEmphasis.tactical}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                      <div 
                        style={{ width: `${prog.pillarEmphasis.technical}%` }} 
                        className="bg-amber-500 h-full" 
                        title={`Technical: ${prog.pillarEmphasis.technical}%`}
                      />
                      <div 
                        style={{ width: `${prog.pillarEmphasis.tactical}%` }} 
                        className="bg-amber-400 h-full" 
                        title={`Tactical: ${prog.pillarEmphasis.tactical}%`}
                      />
                      <div 
                        style={{ width: `${prog.pillarEmphasis.physical}%` }} 
                        className="bg-emerald-500 h-full" 
                        title={`Physical: ${prog.pillarEmphasis.physical}%`}
                      />
                      <div 
                        style={{ width: `${prog.pillarEmphasis.mental}%` }} 
                        className="bg-sky-500 h-full" 
                        title={`Mental: ${prog.pillarEmphasis.mental}%`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> Tech</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Tac</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Phys</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" /> Mental</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 truncate max-w-[130px] sm:max-w-[150px]">
                    <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400 shrink-0" />
                    <span>{prog.schedule.split('(')[0]}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModalProgram(prog);
                      }}
                      className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer min-h-[34px]"
                    >
                      Syllabus
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProgram(prog.id);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-slate-950 bg-amber-500 hover:bg-amber-600 active:scale-95 transition-all min-h-[34px] px-3 py-1.5 rounded-lg shadow-sm shadow-amber-200 cursor-pointer"
                    >
                      <span>Trial</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Pagination Indicators */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-1.5">
            {filteredPrograms.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToSlide(i)}
                aria-label={`Go to program slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer h-2 ${
                  activeSlide === i
                    ? 'w-8 bg-amber-500 shadow-sm'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
            <span>Showing {Math.min(activeSlide + visibleColumns, filteredPrograms.length)} of {filteredPrograms.length} programs</span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <button
              onClick={() => onSelectProgram('foundation')}
              className="text-amber-700 hover:text-amber-800 font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <span>Book General Assessment Trial</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Full Program Syllabus Modal */}
      {selectedModalProgram && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedModalProgram(null)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedModalProgram(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5 mb-6 pr-8">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  {selectedModalProgram.ageGroup}
                </span>
                <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {selectedModalProgram.coachRatio}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
                {selectedModalProgram.name}
              </h3>
              <p className="text-sm font-semibold text-amber-700">
                {selectedModalProgram.subtitle}
              </p>
            </div>

            <div className="mb-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-0.5">Target Player Profile:</span>
              {selectedModalProgram.target}
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Program Overview
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {selectedModalProgram.description}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Full Curriculum Modules & Drills
              </h4>
              <div className="space-y-2.5">
                {selectedModalProgram.keyFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">Weekly Training Schedule</span>
                <span className="font-bold text-slate-900">{selectedModalProgram.schedule}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">Coaching Standard</span>
                <span className="font-bold text-slate-900">AFC & AIFF Licensed Instructors</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setSelectedModalProgram(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Close Syllabus
              </button>
              <button
                onClick={() => {
                  const pId = selectedModalProgram.id;
                  setSelectedModalProgram(null);
                  onSelectProgram(pId);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm shadow-amber-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Register / Book Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
