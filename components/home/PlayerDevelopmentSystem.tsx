'use client';

import React, { useState } from 'react';
import { SAMPLE_PLAYERS, PlayerProfile } from '@/data/academyData';
import { Activity, ShieldAlert, Award, ChevronRight, Zap, Target, Brain, Dumbbell, Compass, CheckCircle2 } from 'lucide-react';

interface PlayerDevelopmentSystemProps {
  onOpenPortal: () => void;
  onBookTrial: () => void;
}

export const PlayerDevelopmentSystem: React.FC<PlayerDevelopmentSystemProps> = ({
  onOpenPortal,
  onBookTrial,
}) => {
  const [selectedPillar, setSelectedPillar] = useState<'technical' | 'tactical' | 'physical' | 'mental' | 'performance'>('technical');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(SAMPLE_PLAYERS[0].id);

  const activePlayer = SAMPLE_PLAYERS.find(p => p.id === selectedPlayerId) || SAMPLE_PLAYERS[0];

  const pillarsData = [
    {
      id: 'technical',
      title: 'TECHNICAL',
      icon: Target,
      tagline: 'Clean Execution Under Spatial & Temporal Pressure',
      color: 'text-amber-400',
      activeColor: 'bg-amber-500 text-slate-950 font-bold',
      items: [
        { name: 'Ball Mastery', desc: 'Unilateral & bilateral sole touches, drag-backs, step-overs, rhythm juggling' },
        { name: 'Passing & Receiving', desc: 'Weighted ground passes, open-stance body orientation, receiving on the back foot' },
        { name: '1v1 Attacking & Dribbling', desc: 'Changes of pace, unbalancing defenders, using arm protection & feints' },
        { name: 'Finishing & Striking', desc: 'Side-foot placement, driven laces, volleys, header timing, both feet' }
      ]
    },
    {
      id: 'tactical',
      title: 'TACTICAL',
      icon: Compass,
      tagline: 'Spatial Intelligence, Scanning & Collective Game Models',
      color: 'text-amber-400',
      activeColor: 'bg-amber-600 text-white',
      items: [
        { name: 'Positioning & Spacing', desc: 'Creating passing angles, occupying half-spaces, maintaining team verticality' },
        { name: 'Decision-Making', desc: 'Scanning shoulders prior to receiving, choosing between dribble vs pass vs switch' },
        { name: 'Attacking Principles', desc: 'Overlapping fullbacks, third-man runs, box-crashing and combination play' },
        { name: 'Defensive Principles', desc: 'Pressing triggers on bad touches, delaying 1v1, rest-defense compactness' }
      ]
    },
    {
      id: 'physical',
      title: 'PHYSICAL',
      icon: Dumbbell,
      tagline: 'Athletic Foundation, Acceleration, Mobility & Durability',
      color: 'text-emerald-400',
      activeColor: 'bg-emerald-600 text-white',
      items: [
        { name: 'Linear & Curved Speed', desc: 'Sprint mechanics, first 5-meter acceleration, deceleration control' },
        { name: 'Agility & COD', desc: 'Change of direction, rapid foot turnover, low centre of gravity' },
        { name: 'Aerobic & Anaerobic Base', desc: 'Yo-Yo intermittent recovery capacity for high-intensity repeat sprints' },
        { name: 'Injury Prevention', desc: 'Knee and hamstring dynamic stability, core strength and mobility routines' }
      ]
    },
    {
      id: 'mental',
      title: 'MENTAL',
      icon: Brain,
      tagline: 'Psychological Fortitude, Leadership & Respect',
      color: 'text-sky-400',
      activeColor: 'bg-sky-600 text-white',
      items: [
        { name: 'Confidence & Bravery', desc: 'Willingness to attempt high-risk creative passes without fear of mistake' },
        { name: 'Focus & Concentration', desc: 'Mental alertness through 90 minutes; resetting after conceding' },
        { name: 'Resilience & Grit', desc: 'Reaction to physical contact, referee decisions, and trailing scorelines' },
        { name: 'Teamwork & Communication', desc: 'Vocal encouragement, tactical shouting, respect for coaches and officials' }
      ]
    },
    {
      id: 'performance',
      title: 'PERFORMANCE',
      icon: Zap,
      tagline: 'Data-Driven Assessments & Holistic Tracking',
      color: 'text-purple-400',
      activeColor: 'bg-purple-600 text-white',
      items: [
        { name: 'Match Statistics', desc: 'Minutes played, pass completion %, duels won, transition recoveries' },
        { name: 'Video Performance Review', desc: 'Post-match tactical video clip tagging with individual coaching notes' },
        { name: 'Quarterly Report Dossier', desc: 'Standardized developmental rubrics accessible by parents in real-time' },
        { name: 'Scouting Profiles', desc: 'Digital player portfolios shared with state selection panels and pro clubs' }
      ]
    }
  ];

  const renderRadarPolygon = (metrics: PlayerProfile['metrics']) => {
    const center = 110;
    const radius = 75;
    const angles = [-90, -18, 54, 126, 198].map(deg => (deg * Math.PI) / 180);

    const values = [
      metrics.technical / 100,
      metrics.tactical / 100,
      metrics.physical / 100,
      metrics.mental / 100,
      metrics.matchPerformance / 100,
    ];

    const points = values.map((val, i) => {
      const r = radius * val;
      const x = center + r * Math.cos(angles[i]);
      const y = center + r * Math.sin(angles[i]);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return points;
  };

  return (
    <section id="development" className="py-16 sm:py-24 bg-slate-950 border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-8 sm:mb-14">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-500">
            Holistic Methodology
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
            PLAYER DEVELOPMENT SYSTEM
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            A comprehensive, multidimensional framework balancing technical flair, tactical wisdom, athletic durability, and psychological strength.
          </p>
        </div>

        {/* 5 Pillars Selector Navigation - Mobile Swipeable Rail */}
        <div className="flex md:grid md:grid-cols-5 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 mb-8 sm:mb-10 overflow-x-auto no-scrollbar touch-pan-x">
          {pillarsData.map((pillar) => {
            const Icon = pillar.icon;
            const isSelected = selectedPillar === pillar.id;

            return (
              <button
                key={pillar.id}
                onClick={() => setSelectedPillar(pillar.id as any)}
                className={`shrink-0 md:shrink flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3.5 sm:px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer min-h-[42px] ${
                  isSelected
                    ? `${pillar.activeColor} shadow-lg shadow-black/40`
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{pillar.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Pillar Deep Dive Card */}
        {(() => {
          const currentPillarObj = pillarsData.find(p => p.id === selectedPillar)!;
          return (
            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-slate-800 mb-14 sm:mb-20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-800">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    Pillar Deep Dive
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-0.5">
                    {currentPillarObj.title} DEVELOPMENT
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    {currentPillarObj.tagline}
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Standardized AFC/AIFF Benchmark System
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5 sm:mt-6">
                {currentPillarObj.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ---------------- SECTION 10: PERFORMANCE DASHBOARD PREVIEW ---------------- */}
        <div id="dashboard" className="pt-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-amber-400 font-mono">
                Real-Time Academy Platform Preview
              </div>
              <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white mt-1">
                PERFORMANCE DASHBOARD
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                Showcasing live player assessment dossiers, radar metrics, drill speeds, and coach evaluations recorded in our digital tracking ecosystem.
              </p>
            </div>

            {/* Switch Player Selector - Mobile Swipeable Rail */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto no-scrollbar touch-pan-x w-full md:w-auto">
              <span className="text-[10px] uppercase font-mono text-slate-500 px-2 shrink-0">Sample Roster:</span>
              {SAMPLE_PLAYERS.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => setSelectedPlayerId(pl.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer min-h-[36px] ${
                    selectedPlayerId === pl.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {pl.name.split(' ')[0]} ({pl.ageGroup})
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Player Dashboard Board */}
          <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              {/* Left Column: Player Identity Card */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center gap-3.5 sm:gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activePlayer.avatar}
                    alt={activePlayer.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-lg shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded">
                        {activePlayer.ageGroup} SQUAD
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        #{activePlayer.jerseyNumber}
                      </span>
                    </div>
                    <h4 className="text-lg sm:text-xl font-black text-white mt-1">
                      {activePlayer.name}
                    </h4>
                    <div className="text-xs text-slate-300 font-medium">
                      {activePlayer.position}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {activePlayer.campus}
                    </div>
                  </div>
                </div>

                {/* Overall Rating & Pathway Tier */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Season Rating</span>
                    <div className="text-xl sm:text-2xl font-black text-white flex items-center gap-1.5 mt-0.5">
                      <span>{activePlayer.stats.overallRating}</span>
                      <span className="text-xs text-slate-500 font-normal">/ 10</span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded ml-1">
                        EXCELLENT
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Stage</span>
                    <strong className="text-amber-400 text-sm font-black">{activePlayer.pathwayStage}</strong>
                  </div>
                </div>

                {/* Match Stats Lineup */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase font-mono">Matches</span>
                    <strong className="text-sm sm:text-base font-black text-white">{activePlayer.stats.matchesPlayed}</strong>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase font-mono">G / A</span>
                    <strong className="text-sm sm:text-base font-black text-amber-400">
                      {activePlayer.stats.goals} / {activePlayer.stats.assists}
                    </strong>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase font-mono">Pass Acc</span>
                    <strong className="text-sm sm:text-base font-black text-white">{activePlayer.stats.passAccuracy}%</strong>
                  </div>
                </div>

                {/* Coach Comment */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">
                    Coach Observation:
                  </span>
                  &ldquo;{activePlayer.coachNotes}&rdquo;
                </div>
              </div>

              {/* Center Column: SVG Radar Chart */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-950/70 border border-slate-800 rounded-2xl relative">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                  5-Pillar Spider Radar
                </div>

                <div className="relative w-full max-w-[260px] aspect-square flex items-center justify-center select-none">
                  <svg viewBox="0 0 220 220" className="w-full h-full">
                    {/* Background Circles */}
                    <circle cx="110" cy="110" r="75" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="110" cy="110" r="55" fill="none" stroke="#1e293b" strokeWidth="1" />
                    <circle cx="110" cy="110" r="35" fill="none" stroke="#1e293b" strokeWidth="1" />
                    <circle cx="110" cy="110" r="18" fill="none" stroke="#1e293b" strokeWidth="1" />

                    {/* Radial Lines */}
                    {[-90, -18, 54, 126, 198].map((deg, i) => {
                      const rad = (deg * Math.PI) / 180;
                      const x2 = 110 + 75 * Math.cos(rad);
                      const y2 = 110 + 75 * Math.sin(rad);
                      return <line key={i} x1="110" y1="110" x2={x2} y2={y2} stroke="#334155" strokeWidth="1" />;
                    })}

                    {/* Filled Radar Polygon */}
                    <polygon
                      points={renderRadarPolygon(activePlayer.metrics)}
                      fill="rgba(217, 119, 6, 0.45)"
                      stroke="#F59E0B"
                      strokeWidth="2"
                    />

                    {/* Labels */}
                    <text x="110" y="24" textAnchor="middle" fill="#F59E0B" fontSize="9" fontWeight="bold">TECH ({activePlayer.metrics.technical}%)</text>
                    <text x="195" y="85" textAnchor="middle" fill="#F59E0B" fontSize="9" fontWeight="bold">TAC ({activePlayer.metrics.tactical}%)</text>
                    <text x="175" y="195" textAnchor="middle" fill="#10B981" fontSize="9" fontWeight="bold">PHY ({activePlayer.metrics.physical}%)</text>
                    <text x="45" y="195" textAnchor="middle" fill="#38BDF8" fontSize="9" fontWeight="bold">MEN ({activePlayer.metrics.mental}%)</text>
                    <text x="25" y="85" textAnchor="middle" fill="#C084FC" fontSize="9" fontWeight="bold">MATCH ({activePlayer.metrics.matchPerformance}%)</text>
                  </svg>
                </div>

                <div className="text-[10px] text-slate-500 font-mono mt-1 text-center">
                  Standardized Assessment Engine v2.4
                </div>
              </div>

              {/* Right Column: Physical Drills & Progress Indicators */}
              <div className="lg:col-span-4 space-y-3 sm:space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Laboratory Drill Scores
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">First Touch Index</div>
                      <div className="text-[10px] text-slate-500">Wall rebound reception velocity</div>
                    </div>
                    <strong className="text-amber-400 font-mono">{activePlayer.drillScores.firstTouchIndex}</strong>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">Yo-Yo Intermittent</div>
                      <div className="text-[10px] text-slate-500">High-intensity aerobic run</div>
                    </div>
                    <strong className="text-emerald-400 font-mono">{activePlayer.drillScores.yoYoLevel}</strong>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">30-Meter Laser Sprint</div>
                      <div className="text-[10px] text-slate-500">Acceleration & top burst</div>
                    </div>
                    <strong className="text-amber-400 font-mono">{activePlayer.drillScores.speed30m}</strong>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">Decision Speed</div>
                      <div className="text-[10px] text-slate-500">Scan-to-pass latency</div>
                    </div>
                    <strong className="text-sky-400 font-mono">{activePlayer.drillScores.decisionSpeed}</strong>
                  </div>
                </div>

                {/* Dashboard Action */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={onOpenPortal}
                    className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <span>VIEW PLAYER DEVELOPMENT DOSSIER</span>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>
                  <button
                    onClick={onBookTrial}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 text-amber-300 border border-amber-500/40 text-xs font-semibold uppercase tracking-wider transition-colors text-center cursor-pointer min-h-[42px]"
                  >
                    Book Your Child&apos;s Assessment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
