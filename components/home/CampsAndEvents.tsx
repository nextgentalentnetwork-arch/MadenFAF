'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { AcademyDataManager, subscribeAcademyData } from '@/lib/academyDataManager';
import { Calendar, MapPin, Users, Tag, ChevronRight, Sparkles, Play, Film } from 'lucide-react';
import { ActiveVideoData } from '@/components/modals/VideoModal';

interface CampsAndEventsProps {
  onRegisterEvent: (eventTitle: string) => void;
  onWatchVideo?: (video: ActiveVideoData) => void;
}

export const CampsAndEvents: React.FC<CampsAndEventsProps> = ({ onRegisterEvent, onWatchVideo }) => {
  const events = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getEvents(),
    () => AcademyDataManager.getEvents()
  );

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Training Camp', 'Trial', 'Tournament', 'Workshop'];

  const filteredEvents = events.filter((e) => {
    if (selectedCategory === 'All') return true;
    return e.category === selectedCategory;
  });

  return (
    <section id="events" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div className="space-y-2 sm:space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold uppercase tracking-wider text-amber-800 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Camps, Trials & Clinics</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-900">
              CAMPS & EVENTS
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Immersive high-performance training camps, open scouting trials, goalkeeper clinics, and regional youth football festivals.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto no-scrollbar touch-pan-x w-full md:w-auto shadow-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer min-h-[38px] ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs shadow-amber-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all duration-300 flex flex-col justify-between shadow-xs relative overflow-hidden group"
            >
              <div>
                {/* Event Banner Image with Video Trigger */}
                {evt.bannerImage && (
                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 border border-slate-200 bg-slate-100 group-hover:shadow-xs transition-all">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={evt.bannerImage}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {evt.videoUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWatchVideo?.({
                            title: evt.title,
                            subtitle: `${evt.category} · ${evt.location}`,
                            videoUrl: evt.videoUrl!,
                            posterImage: evt.bannerImage,
                            description: evt.description,
                            tag: `Event Video Preview (${evt.ageGroup})`,
                            ctaText: `Register for ${evt.category}`
                          });
                        }}
                        className="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-black/85 hover:bg-amber-500 hover:text-slate-950 text-white text-[10px] font-mono font-bold flex items-center gap-1.5 backdrop-blur-xs transition-colors cursor-pointer shadow-md"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Watch Preview</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Badge Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      {evt.category}
                    </span>
                    {!evt.bannerImage && evt.videoUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWatchVideo?.({
                            title: evt.title,
                            subtitle: `${evt.category} · ${evt.location}`,
                            videoUrl: evt.videoUrl!,
                            posterImage: evt.bannerImage,
                            description: evt.description,
                            tag: `Event Video Preview (${evt.ageGroup})`,
                            ctaText: `Register for ${evt.category}`
                          });
                        }}
                        className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Watch Video</span>
                      </button>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-full font-bold ${
                      evt.registrationStatus === 'Open'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : evt.registrationStatus === 'Filling Fast'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {evt.registrationStatus}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-2 leading-snug">
                  {evt.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  {evt.description}
                </p>

                {/* Details List */}
                <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      <strong className="text-slate-800">Date:</strong> {evt.date} ({evt.duration})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">
                      <strong className="text-slate-800">Venue:</strong> {evt.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      <strong className="text-slate-800">Age:</strong> {evt.ageGroup}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      <strong className="text-slate-800">Fee:</strong> {evt.fee}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  onClick={() => onRegisterEvent(evt.title)}
                  className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[44px]"
                >
                  <span>Register for {evt.category}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
