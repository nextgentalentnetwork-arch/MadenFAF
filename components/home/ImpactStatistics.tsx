'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Users, MapPin, Award, ShieldCheck, Trophy, Sparkles, TrendingUp, Heart, ArrowRight, Activity, Calendar } from 'lucide-react';

interface ImpactStatisticsProps {
  onJoinClick: () => void;
  onScholarshipClick: () => void;
}

interface StatItem {
  id: string;
  label: string;
  value: number;
  suffix: string;
  sublabel: string;
  growth: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  category: 'players' | 'infrastructure' | 'scholarships' | 'competitions';
}

const STATS_DATA: StatItem[] = [
  {
    id: 'players',
    label: 'Total Registered Players',
    value: 450,
    suffix: '+',
    sublabel: 'Active Squad Members',
    growth: '+42% YoY Growth',
    description: 'Enrolled across U8 Grassroots to U18 Pre-Professional cohorts receiving regular training.',
    icon: Users,
    accent: 'text-amber-700 bg-amber-50 border-amber-200',
    category: 'players',
  },
  {
    id: 'campuses',
    label: 'Campus Locations',
    value: 3,
    suffix: '',
    sublabel: 'Active Training Hubs',
    growth: '+1 Upcoming (Kalyani)',
    description: 'Gayeshpur Flagship, Ichapore (North 24 Pgs), and Krishnanagar Football School.',
    icon: MapPin,
    accent: 'text-amber-600 bg-amber-50 border-amber-200',
    category: 'infrastructure',
  },
  {
    id: 'scholarships',
    label: 'Scholarships Granted',
    value: 42,
    suffix: '+',
    sublabel: 'Full & Partial Grants',
    growth: '₹18.5L Total Aid Distributed',
    description: '100% need-based and talent-merit fee waivers ensuring no gifted child is left behind.',
    icon: Award,
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    category: 'scholarships',
  },
  {
    id: 'coaches',
    label: 'Licensed Coaching Staff',
    value: 18,
    suffix: '+',
    sublabel: 'AFC & AIFF Certified',
    growth: '1:10 Coach-Player Ratio',
    description: 'Every session is conducted by verified coaches upholding modern youth training periodization.',
    icon: ShieldCheck,
    accent: 'text-sky-600 bg-sky-50 border-sky-200',
    category: 'players',
  },
  {
    id: 'matches',
    label: 'Matches Played',
    value: 160,
    suffix: '+',
    sublabel: 'League & Tournament Games',
    growth: '74% Win / Draw Ratio',
    description: 'Competitive fixtures across IFA youth leagues, district cups, and showcase friendlies.',
    icon: Trophy,
    accent: 'text-purple-600 bg-purple-50 border-purple-200',
    category: 'competitions',
  },
  {
    id: 'sessions',
    label: 'Annual Pitch Sessions',
    value: 780,
    suffix: '+',
    sublabel: 'Hours of Training Conducted',
    growth: '48 Weeks / Year',
    description: 'Morning and evening sessions across multiple pitches with structured curriculum.',
    icon: Calendar,
    accent: 'text-rose-600 bg-rose-50 border-rose-200',
    category: 'infrastructure',
  },
  {
    id: 'graduates',
    label: 'Player Milestones',
    value: 28,
    suffix: '+',
    sublabel: 'District & State Trials',
    growth: '14 Signed to Senior Clubs',
    description: 'Athletes selected for Bengal state youth teams, I-League youth academies, and school teams.',
    icon: TrendingUp,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    category: 'players',
  }
];

export const ImpactStatistics: React.FC<ImpactStatisticsProps> = ({
  onJoinClick,
  onScholarshipClick,
}) => {
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const duration = 1800;
          const startTime = performance.now();

          const animateCounts = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const newCounts: { [key: string]: number } = {};
            STATS_DATA.forEach((stat) => {
              newCounts[stat.id] = Math.floor(stat.value * easeProgress);
            });

            setCounts(newCounts);

            if (progress < 1) {
              requestAnimationFrame(animateCounts);
            } else {
              const finalCounts: { [key: string]: number } = {};
              STATS_DATA.forEach((stat) => {
                finalCounts[stat.id] = stat.value;
              });
              setCounts(finalCounts);
            }
          };

          requestAnimationFrame(animateCounts);
        }
      },
      { threshold: 0.15 }
    );

    const currentElem = sectionRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) {
        observer.unobserve(currentElem);
      }
    };
  }, [hasAnimated]);

  return (
    <section
      id="impact-stats"
      ref={sectionRef}
      className="py-16 sm:py-24 bg-white border-t border-slate-200 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-700 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Audited Academy Metrics · 2026/27</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-slate-900 leading-tight">
            MEASURING OUR REAL IMPACT
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Beyond match victories, our success is defined by how many young athletes we develop, the quality of our educational environment, and the life opportunities we unlock.
          </p>
        </div>

        {/* 3 Primary Showcase Stat Cards (Hero Metrics) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-8 sm:mb-12">
          {STATS_DATA.slice(0, 3).map((stat) => {
            const Icon = stat.icon;
            const displayValue = counts[stat.id] ?? 0;

            return (
              <div
                key={stat.id}
                className="relative group p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${stat.accent}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      {stat.growth}
                    </span>
                  </div>

                  {/* Count-Up Metric */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight tabular-nums font-mono">
                      {displayValue}
                    </span>
                    <span className="text-3xl sm:text-5xl font-black text-amber-500">
                      {stat.suffix}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2 leading-tight">
                    {stat.label}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                    {stat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>{stat.sublabel}</span>
                  <span className="text-emerald-600 font-bold">● Active Cohort</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Secondary Metric Grid (4 Columns) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-14">
          {STATS_DATA.slice(3).map((stat) => {
            const Icon = stat.icon;
            const displayValue = counts[stat.id] ?? 0;

            return (
              <div
                key={stat.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${stat.accent}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 truncate max-w-[110px]">
                      {stat.growth}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums font-mono">
                      {displayValue}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-amber-500">
                      {stat.suffix}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 mt-1 leading-snug">
                    {stat.label}
                  </h4>
                </div>

                <div className="text-[10px] text-slate-500 font-mono mt-3 pt-2.5 border-t border-slate-200/80 truncate">
                  {stat.sublabel}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Direct CTA Action Bar */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Be Part of Our Next Milestone</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900">
              Every Great Football Story Starts With Day One
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              Whether you are an aspiring U10 beginner or a competitive U16 player seeking trials, MADEN FAF provides the coaching, facilities, and exposure you deserve.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={onScholarshipClick}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold uppercase tracking-wider transition-all min-h-[44px] cursor-pointer shadow-xs"
            >
              Scholarship Info
            </button>
            <button
              onClick={onJoinClick}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-sm shadow-amber-200 flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
            >
              <span>Join MADEN FAF</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
