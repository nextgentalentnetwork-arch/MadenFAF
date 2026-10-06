'use client';

import React, { useState, useRef, useEffect, useCallback, useSyncExternalStore } from 'react';
import { ACADEMY_TESTIMONIALS, TestimonialItem } from '@/data/academyData';
import { AcademyDataManager, subscribeAcademyData } from '@/lib/academyDataManager';
import { Quote, Star, CheckCircle2, ChevronRight, ChevronLeft, Sparkles, ShieldCheck, Heart, ArrowRight, X } from 'lucide-react';

interface SuccessStoriesProps {
  onJoinClick: () => void;
}

export const SuccessStories: React.FC<SuccessStoriesProps> = ({ onJoinClick }) => {
  const testimonials = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getTestimonials(),
    () => ACADEMY_TESTIMONIALS
  );

  const [filter, setFilter] = useState<'all' | 'parent' | 'player' | 'scout'>('all');
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [selectedStory, setSelectedStory] = useState<TestimonialItem | null>(null);

  const sliderRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const filteredStories = testimonials.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const scrollToSlide = useCallback((index: number) => {
    const slider = sliderRef.current;
    if (slider) {
      const card = slider.children[index] as HTMLElement;
      if (card) {
        slider.scrollTo({
          left: card.offsetLeft - slider.offsetLeft,
          behavior: 'smooth',
        });
      }
    }
    setActiveSlide(index);
  }, []);

  const handleNext = useCallback(() => {
    const nextIndex = (activeSlide + 1) % filteredStories.length;
    scrollToSlide(nextIndex);
  }, [activeSlide, filteredStories.length, scrollToSlide]);

  const handlePrev = useCallback(() => {
    const prevIndex = (activeSlide - 1 + filteredStories.length) % filteredStories.length;
    scrollToSlide(prevIndex);
  }, [activeSlide, filteredStories.length, scrollToSlide]);

  // Touch Swipe Handlers for mobile & tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleScroll = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    const scrollPosition = slider.scrollLeft;
    const firstChild = slider.children[0] as HTMLElement;
    if (!firstChild) return;
    const cardWidth = firstChild.offsetWidth;
    const gap = window.innerWidth >= 640 ? 24 : 16;
    const newIndex = Math.round(scrollPosition / (cardWidth + gap));
    if (newIndex >= 0 && newIndex < filteredStories.length && newIndex !== activeSlide) {
      setActiveSlide(newIndex);
    }
  };

  return (
    <section id="stories" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold uppercase tracking-wider text-amber-800 shadow-xs">
            <Heart className="w-3.5 h-3.5 text-amber-600" />
            <span>Community Impact & Reviews</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-slate-900 leading-tight">
            SUCCESS STORIES & REVIEWS
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Direct feedback from parents, players, and talent evaluators on how our football curriculum builds athletic discipline, confidence, and character.
          </p>
        </div>

        {/* High-Trust Impact Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs mb-10 sm:mb-12">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <div className="text-base sm:text-xl font-black text-slate-900">98% Satisfaction</div>
              <div className="text-[11px] text-slate-500">Verified Parent Feedback</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-base sm:text-xl font-black text-slate-900">18+ State Reps</div>
              <div className="text-[11px] text-slate-500">Selected for Bengal & District</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-base sm:text-xl font-black text-slate-900">42+ Grants</div>
              <div className="text-[11px] text-slate-500">Full & Partial Scholarships</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <div className="text-base sm:text-xl font-black text-slate-900">100% Monitored</div>
              <div className="text-[11px] text-slate-500">Academic Balance Tracking</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Slider Controls Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar touch-pan-x w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => {
                setFilter('all');
                setActiveSlide(0);
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all min-h-[38px] cursor-pointer ${
                filter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs shadow-amber-200'
                  : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
              }`}
            >
              All Stories ({ACADEMY_TESTIMONIALS.length})
            </button>
            <button
              onClick={() => {
                setFilter('parent');
                setActiveSlide(0);
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all min-h-[38px] cursor-pointer ${
                filter === 'parent'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs shadow-amber-200'
                  : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Parents
            </button>
            <button
              onClick={() => {
                setFilter('player');
                setActiveSlide(0);
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all min-h-[38px] cursor-pointer ${
                filter === 'player'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs shadow-amber-200'
                  : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Players
            </button>
            <button
              onClick={() => {
                setFilter('scout');
                setActiveSlide(0);
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all min-h-[38px] cursor-pointer ${
                filter === 'scout'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs shadow-amber-200'
                  : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Scouts & Evaluators
            </button>
          </div>

          {/* Slider Prev / Next Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <div className="text-xs font-mono text-slate-500">
              <span className="text-slate-900 font-bold">{activeSlide + 1}</span> / {filteredStories.length}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer active:scale-95 shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next testimonial"
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer active:scale-95 shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ---------------- TESTIMONIAL SLIDER ---------------- */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-2 px-0.5 touch-pan-x"
        >
          {filteredStories.map((story, idx) => {
            const isCurrent = activeSlide === idx;

            return (
              <div
                key={story.id}
                onClick={() => setActiveSlide(idx)}
                className={`shrink-0 snap-start rounded-3xl p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between select-none cursor-pointer
                  w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]
                  ${
                    isCurrent
                      ? 'bg-white border-amber-500 shadow-md ring-1 ring-amber-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm'
                  }
                `}
              >
                <div>
                  {/* Top Bar: Stars + Highlight Tag */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(story.rating)].map((_, rIdx) => (
                        <Star key={rIdx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    <span className="text-[10px] font-mono uppercase font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full truncate">
                      {story.highlightTag}
                    </span>
                  </div>

                  {/* Quote Body */}
                  <div className="relative mb-5">
                    <Quote className="w-6 h-6 text-amber-100 absolute -top-2 -left-1 pointer-events-none" />
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic line-clamp-4 relative z-10 pl-3 border-l-2 border-amber-500">
                      &ldquo;{story.quote}&rdquo;
                    </p>
                  </div>

                  {/* Milestone Badge */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-800 truncate">
                      {story.milestone}
                    </span>
                  </div>
                </div>

                {/* Author Information Strip */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={story.avatar}
                      alt={story.author}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-slate-900 leading-tight">
                        {story.author}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {story.role}
                      </div>
                      <div className="text-[10px] text-amber-700 font-mono font-semibold">
                        {story.campus}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStory(story);
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-amber-500 hover:text-slate-950 text-slate-600 border border-slate-200 transition-colors shrink-0 cursor-pointer"
                    aria-label={`Read story from ${story.author}`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Slider Dot Indicators */}
        <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
          {filteredStories.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => scrollToSlide(idx)}
              aria-label={`Go to testimonial from ${s.author}`}
              className="p-1 rounded-full transition-all min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  activeSlide === idx
                    ? 'w-7 h-2 bg-amber-500 shadow-xs'
                    : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Action Prompt Strip */}
        <div className="mt-10 sm:mt-12 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              Ready to write your child’s football success story?
            </h4>
            <p className="text-xs text-slate-600">
              Book an evaluation session with certified academy coaches across Gayeshpur, Ichapore, or Krishnanagar.
            </p>
          </div>

          <button
            onClick={onJoinClick}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-sm shadow-amber-200 cursor-pointer shrink-0 min-h-[42px] flex items-center justify-center gap-1.5"
          >
            <span>Book a Trial Today</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Full Testimonial Modal */}
      {selectedStory && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedStory(null)}
        >
          <div
            className="relative w-full max-w-xl bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">
                  {selectedStory.verifiedBadge}
                </span>
              </div>

              <button
                onClick={() => setSelectedStory(null)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                aria-label="Close story"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedStory.avatar}
                  alt={selectedStory.author}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-xs shrink-0"
                />
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedStory.author}</h3>
                  <div className="text-xs text-amber-700 font-semibold">{selectedStory.role}</div>
                  <div className="text-xs text-slate-500">{selectedStory.campus}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm italic text-slate-800 leading-relaxed">
                &ldquo;{selectedStory.quote}&rdquo;
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  The Full Journey & Experience
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {selectedStory.fullStory}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Verified Milestone: {selectedStory.milestone}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedStory(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold uppercase cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedStory(null);
                  onJoinClick();
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer"
              >
                Join MADEN FAF
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
