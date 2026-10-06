'use client';

import React from 'react';
import { Globe, Plane, Award, Compass, ArrowUpRight, Sparkles } from 'lucide-react';

interface GlobalPositioningProps {
  onExplorePrograms: () => void;
  onJoinClick: () => void;
}

export const GlobalPositioning: React.FC<GlobalPositioningProps> = ({
  onExplorePrograms,
  onJoinClick,
}) => {
  const internationalPillars = [
    {
      title: 'Training Exchanges & Tours',
      desc: 'Our vision is to build seasonal overseas training immersions where MADEN FAF standout squads can train at top academies and compete in youth friendlies.',
      status: 'Vision & Planning Phase',
      icon: Plane,
    },
    {
      title: 'International Coaching Masterclasses',
      desc: 'Inviting UEFA & AFC guest educators to conduct modern tactical clinics for our local coaching panel and elite youth players.',
      status: 'Annual Masterclass Calendar',
      icon: Award,
    },
    {
      title: 'Player Showcases & Scout Days',
      desc: 'Organizing structured showcase fixtures attended by domestic I-League, ISL youth scouts, and international talent spotters.',
      status: 'Established Season Feature',
      icon: Compass,
    },
    {
      title: 'Academic & Football Dual Pathways',
      desc: 'Building relationships with university sports programs and international soccer scholarship consultants to offer collegiate pathways.',
      status: 'Future Pathway Roadmap',
      icon: Globe,
    },
  ];

  return (
    <section id="global" className="py-16 sm:py-24 bg-white border-t border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          {/* Left Column: Vision Copy */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold uppercase tracking-wider text-amber-800 shadow-xs">
              <Globe className="w-3.5 h-3.5" />
              <span>International Youth Perspective</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-900 leading-tight">
              FROM LOCAL ROOTS <br />
              <span className="text-amber-600">TO GLOBAL OPPORTUNITIES</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Bengal has an unmatched heartbeat for football. At MADEN FAF, our driving purpose is to give our young footballers the exact same methodological rigor, sports science, and competitive exposure found in premier international academies.
            </p>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Transparent Strategic Roadmap</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900">Our vision is to build</strong> long-term technical affiliations with international youth institutions, reciprocal training tours, and European coaching clinics—ensuring a child from Gayeshpur, Ichapore, or Krishnanagar can dream without limits.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onJoinClick}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-sm shadow-amber-200 min-h-[44px] text-center cursor-pointer"
              >
                Join Academy Trials
              </button>
              <button
                onClick={onExplorePrograms}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-800 border border-slate-300 text-xs font-bold uppercase tracking-wider shadow-xs transition-colors min-h-[44px] text-center cursor-pointer"
              >
                View Elite Program
              </button>
            </div>
          </div>

          {/* Right Column: 4 Pillar Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {internationalPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all duration-300 group flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  <div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform mb-3 sm:mb-4 shadow-xs">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 sm:mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-5 pt-2.5 sm:pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                    <span className="text-amber-800 font-mono font-medium">
                      {pillar.status}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
