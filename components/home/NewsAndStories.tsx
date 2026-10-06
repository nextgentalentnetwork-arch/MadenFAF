'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { NewsStory, NEWS_STORIES } from '@/data/academyData';
import { AcademyDataManager, subscribeAcademyData } from '@/lib/academyDataManager';
import { BookOpen, Clock, ArrowRight, X, User, Sparkles } from 'lucide-react';

export const NewsAndStories: React.FC = () => {
  const news = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getNews(),
    () => NEWS_STORIES
  );

  const [selectedStory, setSelectedStory] = useState<NewsStory | null>(null);

  const featuredStory = news.find((n) => n.featured) || news[0] || NEWS_STORIES[0];
  const sideStories = news.filter((n) => n.id !== featuredStory?.id);

  return (
    <section id="news" className="py-16 sm:py-24 bg-white border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="space-y-2 sm:space-y-3 mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold uppercase tracking-wider text-amber-800 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Academy Editorial & Matchweek</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-900">
            NEWS & STORIES
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
            Inside the training grounds, player breakthroughs, match reports, and grassroots community narratives shaping MADEN FAF.
          </p>
        </div>

        {/* Magazine Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Featured Large Hero Story */}
          <div
            onClick={() => setSelectedStory(featuredStory)}
            className="lg:col-span-7 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 hover:border-slate-300 overflow-hidden transition-all duration-300 group cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredStory.image}
                alt={featuredStory.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase text-slate-950 bg-amber-500 px-2.5 py-1 rounded-full shadow-xs">
                  FEATURE STORY
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-8 space-y-3 sm:space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="text-amber-800 font-bold uppercase">{featuredStory.category}</span>
                <span aria-hidden="true">·</span>
                <span>{featuredStory.date}</span>
                <span aria-hidden="true">·</span>
                <span>{featuredStory.readTime}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                {featuredStory.title}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                {featuredStory.summary}
              </p>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 truncate max-w-[180px]">By {featuredStory.author}</span>
                <span className="text-amber-600 font-bold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform min-h-[36px]">
                  <span>Read Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Stories Stack */}
          <div className="lg:col-span-5 space-y-4">
            {sideStories.map((story) => (
              <div
                key={story.id}
                onClick={() => setSelectedStory(story)}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 transition-all duration-200 group cursor-pointer flex gap-4 shadow-xs hover:shadow-sm"
              >
                <div className="w-24 sm:w-32 h-24 sm:h-28 rounded-xl overflow-hidden shrink-0 relative bg-slate-100 border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
                      <span className="text-amber-800 font-mono font-bold uppercase">{story.category}</span>
                      <span>·</span>
                      <span>{story.readTime}</span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                      {story.title}
                    </h4>

                    <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-2 mt-1">
                      {story.summary}
                    </p>
                  </div>

                  <div className="text-[11px] text-amber-600 font-bold mt-1.5 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Read Article</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Story Modal View */}
        {selectedStory && (
          <div 
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedStory(null)}
          >
            <div 
              className="relative w-full max-w-2xl bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag bar for mobile */}
              <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

              <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-50 border-b border-slate-200">
                <span className="text-xs font-mono uppercase text-amber-800 font-bold truncate max-w-[240px]">
                  {selectedStory.category} · {selectedStory.date}
                </span>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
                  aria-label="Close story"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-7 overflow-y-auto space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight leading-snug">
                  {selectedStory.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>Reported by {selectedStory.author}</span>
                  <span>·</span>
                  <span>{selectedStory.readTime}</span>
                </div>

                <div className="relative aspect-video rounded-xl overflow-hidden my-3 border border-slate-200 bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedStory.image || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80'}
                    alt={selectedStory.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                  {Array.isArray(selectedStory.content) ? (
                    selectedStory.content.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))
                  ) : (
                    <p>{selectedStory.content}</p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedStory(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold uppercase tracking-wider text-white transition-colors min-h-[42px]"
                >
                  Close Story
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
