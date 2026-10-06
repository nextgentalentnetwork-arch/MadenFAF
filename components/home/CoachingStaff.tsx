'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { CoachStaffMember, COACHING_STAFF } from '@/data/academyData';
import { AcademyDataManager, subscribeAcademyData } from '@/lib/academyDataManager';
import { Award, ShieldCheck, CheckCircle2, ChevronRight, X, Sparkles, MapPin, GraduationCap, Quote, Calendar } from 'lucide-react';

interface CoachingStaffProps {
  onBookTrialWithCoach: (coachName: string, campus: string) => void;
}

export const CoachingStaff: React.FC<CoachingStaffProps> = ({ onBookTrialWithCoach }) => {
  const coaches = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getCoaches(),
    () => COACHING_STAFF
  );
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'leadership' | 'campus-head' | 'specialist'>('all');
  const [activeModalCoach, setActiveModalCoach] = useState<CoachStaffMember | null>(null);

  const filteredCoaches = coaches.filter((coach) => {
    if (selectedCategory === 'all') return true;
    return coach.category === selectedCategory;
  });

  return (
    <section id="coaches" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold uppercase tracking-widest text-amber-800 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Certified Academy Mentors</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-slate-900 leading-tight">
            THE COACHING STAFF
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            World-class player development begins with exceptional educators. Our technical panel combines AFC-licensed credentials, state playing pedigrees, and a child-centric development philosophy.
          </p>
        </div>

        {/* Credibility & Trust Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs mb-10 sm:mb-12">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-slate-900">100% Licensed</div>
              <div className="text-[11px] text-slate-500">AFC & AIFF Certified</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-slate-900">1:10 Ratio</div>
              <div className="text-[11px] text-slate-500">Dedicated Care</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-slate-900">Safe Sport</div>
              <div className="text-[11px] text-slate-500">Child Safeguarding Verified</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-slate-900">Sports Science</div>
              <div className="text-[11px] text-slate-500">Injury Prevention Protocol</div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-start md:justify-center gap-2 mb-8 sm:mb-10 overflow-x-auto no-scrollbar touch-pan-x pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all min-h-[40px] cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-200'
                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs'
            }`}
          >
            All Coaching Staff ({COACHING_STAFF.length})
          </button>
          <button
            onClick={() => setSelectedCategory('leadership')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all min-h-[40px] cursor-pointer ${
              selectedCategory === 'leadership'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-200'
                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs'
            }`}
          >
            Technical Leadership
          </button>
          <button
            onClick={() => setSelectedCategory('campus-head')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all min-h-[40px] cursor-pointer ${
              selectedCategory === 'campus-head'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-200'
                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs'
            }`}
          >
            Campus Head Coaches
          </button>
          <button
            onClick={() => setSelectedCategory('specialist')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all min-h-[40px] cursor-pointer ${
              selectedCategory === 'specialist'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-200'
                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs'
            }`}
          >
            GK, Girls & Science
          </button>
        </div>

        {/* Coaches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCoaches.map((coach) => (
            <div
              key={coach.id}
              className="group bg-white border border-slate-200 hover:border-slate-300 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div>
                {/* Top Coach Portrait & Certification Overlay */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coach.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'}
                    alt={coach.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* License Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-[11px] font-mono font-bold text-slate-900 backdrop-blur-md shadow-sm">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>{coach.license}</span>
                    </span>
                  </div>

                  {/* Experience Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-md bg-white/90 text-slate-800 text-[10px] font-mono uppercase font-semibold backdrop-blur-md shadow-xs">
                      {coach.experienceYears}+ Yrs Exp
                    </span>
                  </div>

                  {/* Coach Name & Role Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300">
                      {coach.role}
                    </div>
                    <h3 className="text-xl font-black text-white leading-tight mt-0.5">
                      {coach.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4">
                  {/* Campus & Playing Pedigree */}
                  <div className="space-y-1.5 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{coach.campus}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 italic">
                      {coach.playingBackground}
                    </div>
                  </div>

                  {/* Coaching Philosophy Quote */}
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 relative">
                    <Quote className="w-4 h-4 text-amber-500/40 absolute top-2 right-2" />
                    <div className="text-[10px] uppercase font-mono font-bold text-amber-800 mb-1">
                      Coaching Philosophy
                    </div>
                    <p className="text-xs text-amber-950 italic leading-relaxed line-clamp-3">
                      &ldquo;{coach.philosophy}&rdquo;
                    </p>
                  </div>

                  {/* Specialties Pills */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-mono text-slate-500">Core Specialties</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(coach.keySpecialties || []).map((spec, sIdx) => (
                        <span key={sIdx} className="text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-5 pt-0 mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                <button
                  onClick={() => setActiveModalCoach(coach)}
                  className="px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer min-h-[38px]"
                >
                  Full Bio
                </button>
                <button
                  onClick={() => onBookTrialWithCoach(coach.name, coach.campus.includes('Ichapore') ? 'north-24-pgs' : coach.campus.includes('Krishnanagar') ? 'krishnanagar' : 'gayeshpur')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 cursor-pointer min-h-[38px]"
                >
                  <span>Book Trial</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Coach Dossier Modal */}
      {activeModalCoach && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveModalCoach(null)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModalCoach(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeModalCoach.image}
                alt={activeModalCoach.name}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    {activeModalCoach.license}
                  </span>
                  <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                    {activeModalCoach.experienceYears}+ Yrs Experience
                  </span>
                </div>
                <h3 className="text-2xl font-black uppercase text-slate-900 mt-1">
                  {activeModalCoach.name}
                </h3>
                <p className="text-xs font-semibold text-amber-700">
                  {activeModalCoach.role} · {activeModalCoach.campus}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block uppercase font-mono text-[10px] mb-0.5">Playing Pedigree</span>
                <span className="text-slate-800 font-semibold">{activeModalCoach.playingBackground}</span>
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-700 mb-1.5 text-xs">
                  Full Coaching Bio & Career Impact
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  {activeModalCoach.bio}
                </p>
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-700 mb-1.5 text-xs">
                  Technical Certifications
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(activeModalCoach.certifications || []).map((cert, cIdx) => (
                    <span key={cIdx} className="text-xs text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setActiveModalCoach(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Close Bio
              </button>
              <button
                onClick={() => {
                  const c = activeModalCoach;
                  setActiveModalCoach(null);
                  onBookTrialWithCoach(c.name, c.campus.includes('Ichapore') ? 'north-24-pgs' : c.campus.includes('Krishnanagar') ? 'krishnanagar' : 'gayeshpur');
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm shadow-amber-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Request Trial with {activeModalCoach.name.split(' ')[0]}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
