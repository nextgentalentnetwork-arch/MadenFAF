'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { Campus, ACADEMY_CAMPUSES } from '@/data/academyData';
import { AcademyDataManager, subscribeAcademyData } from '@/lib/academyDataManager';
import { MapPin, Calendar, Clock, CheckCircle2, Phone, Mail, ArrowRight, Shield, Award } from 'lucide-react';

interface CampusNetworkProps {
  onBookCampusTrial: (campusId: string) => void;
}

export const CampusNetwork: React.FC<CampusNetworkProps> = ({ onBookCampusTrial }) => {
  const campuses = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getCampuses(),
    () => ACADEMY_CAMPUSES
  );

  const [selectedCampusId, setSelectedCampusId] = useState<string>('gayeshpur');

  const selectedCampus =
    campuses.find((c) => c.id === selectedCampusId) || campuses[0] || ACADEMY_CAMPUSES[0];

  return (
    <section id="campuses" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-8 sm:mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-800">
            Regional Infrastructure
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-900">
            THE MADEN FOOTBALL SCHOOL NETWORK
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Purpose-built training grounds and strategic sporting club collaborations across Bengal delivering safe, floodlit, high-standard football education.
          </p>
        </div>

        {/* Campus Switcher Tabs */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-6 sm:mb-10 overflow-x-auto no-scrollbar touch-pan-x">
          {campuses.map((campus) => {
            const isSelected = selectedCampus?.id === campus.id;
            return (
              <button
                key={campus.id}
                onClick={() => setSelectedCampusId(campus.id)}
                className={`shrink-0 sm:shrink text-left p-3.5 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer border min-w-[200px] sm:min-w-0 ${
                  isSelected
                    ? 'bg-white border-amber-500 shadow-md ring-1 ring-amber-500/20 -translate-y-0.5'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className={`text-[10px] uppercase font-mono font-bold ${campus.status === 'active' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {campus.status === 'active' ? '● Active' : '★ Vision'}
                  </span>
                  <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-600' : 'text-slate-400'}`} />
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  {campus.name}
                </div>
                <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {campus.location}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Campus Showcase Card */}
        {selectedCampus && (
          <div className="p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              {/* Visual Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 group shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedCampus.image || 'https://images.unsplash.com/photo-1529900240041-22f114d18eb1?auto=format&fit=crop&w=1200&q=80'}
                    alt={selectedCampus.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-85" />

                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-white">
                    <div className="text-[11px] font-mono uppercase text-amber-300 font-bold">
                      {selectedCampus.association || 'MADEN FAF Academy'}
                    </div>
                    <div className="text-base sm:text-lg font-bold text-white leading-tight mt-0.5">
                      {selectedCampus.name}
                    </div>
                  </div>
                </div>

                {/* Head Coach Mini Profile */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 uppercase">
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    <span>Head of Campus Coaching</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {selectedCampus.headCoach?.name || 'Technical Director'}
                  </div>
                  <div className="text-xs text-amber-700 font-semibold">
                    {selectedCampus.headCoach?.license || 'AFC Licensed'}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {selectedCampus.headCoach?.experience || 'Academy Experience'}
                  </div>
                </div>

                {/* Campus Contact Strip */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a
                    href={`tel:${(selectedCampus.contactPhone || '+919830245891').replace(/\s+/g, '')}`}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors font-semibold text-slate-700 min-h-[40px]"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Campus</span>
                  </a>
                  <a
                    href={`mailto:${selectedCampus.contactEmail || 'admissions@madenfaf.com'}`}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors font-semibold text-slate-700 min-h-[40px] truncate"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                    <span>Email Desk</span>
                  </a>
                </div>
              </div>

              {/* Details Column */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-amber-600 font-bold">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedCampus.location}</span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 mt-1">
                    {selectedCampus.name}
                  </h3>
                  <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider mt-0.5">
                    {selectedCampus.tagline}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2.5">
                    {selectedCampus.description}
                  </p>
                  <div className="text-xs text-slate-500 mt-2 font-mono">
                    Grounds: {selectedCampus.address}
                  </div>
                </div>

                {/* Training Schedule & Timings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>Training Days & Dates</span>
                    </div>
                    <div className="text-slate-700 font-medium">{selectedCampus.trainingDays || 'Weekly Scheduled Sessions'}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Timings</span>
                    </div>
                    <div className="text-slate-700 font-medium">{selectedCampus.timings || 'Contact desk for batch times'}</div>
                  </div>
                </div>

                {/* Facilities Checklist */}
                {selectedCampus.facilities && selectedCampus.facilities.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Campus Facilities & Equipment
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedCampus.facilities.map((fac, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{fac}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Age Groups Enrolled */}
                {selectedCampus.ageGroups && selectedCampus.ageGroups.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Active Age Cohorts at this Campus
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCampus.ageGroups.map((ag, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono">
                          {ag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Book Trial Action */}
                <div className="pt-2">
                  <button
                    onClick={() => onBookCampusTrial(selectedCampus.id)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm shadow-amber-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Book Trial at {selectedCampus.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
