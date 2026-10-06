'use client';

import React, { useState } from 'react';
import { MADEN_PATHWAY } from '@/data/academyData';
import { Check, ArrowRight, Clock, Award, Shield, ChevronRight } from 'lucide-react';

interface MadenPathwayProps {
  onJoinClick: () => void;
}

export const MadenPathway: React.FC<MadenPathwayProps> = ({ onJoinClick }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const currentStage = MADEN_PATHWAY[activeStep];

  return (
    <section id="pathway" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-8 sm:mb-14">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-800">
            Player Development Journey
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-900">
            THE MADEN PATHWAY
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            A continuous, age-appropriate progression framework transforming raw potential into match-ready football excellence.
          </p>
        </div>

        {/* Stepper Timeline Nav */}
        <div className="flex md:grid md:grid-cols-5 gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-2xl bg-white border border-slate-200 mb-6 sm:mb-10 overflow-x-auto no-scrollbar touch-pan-x shadow-xs">
          {MADEN_PATHWAY.map((stage, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={stage.title}
                onClick={() => setActiveStep(idx)}
                className={`shrink-0 md:shrink text-left p-3 sm:p-4 rounded-xl transition-all duration-200 cursor-pointer min-w-[140px] md:min-w-0 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-200 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                    STAGE 0{stage.step}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-black/10 text-slate-950' : 'bg-slate-100 text-slate-600'}`}>
                    {stage.weeklyHours.split(' ')[0]}h/wk
                  </span>
                </div>
                <div className="text-sm sm:text-base font-black uppercase tracking-tight">
                  {stage.title}
                </div>
                <div className={`text-[11px] font-medium truncate mt-0.5 ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                  {stage.ageBracket.split(' ')[0]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detailed Display Box */}
        <div className="p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          {/* Top Stage Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-600 uppercase">
                <span>Stage 0{currentStage.step} of 05</span>
                <span>·</span>
                <span className="text-amber-700">{currentStage.ageBracket}</span>
              </div>
              <h3 className="text-xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-slate-900 mt-1 leading-snug">
                {currentStage.title} — {currentStage.objective}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 lg:pt-0">
              <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-xs">
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Weekly Volume</span>
                <strong className="text-slate-900 font-bold">{currentStage.weeklyHours}</strong>
              </div>
              <button
                onClick={onJoinClick}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-sm shadow-amber-200 min-h-[42px] cursor-pointer"
              >
                Enroll in {currentStage.title}
              </button>
            </div>
          </div>

          {/* Deep Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 pt-6 sm:pt-8">
            {/* Column 1: Training Focus */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Core Training Focus & Curriculum</span>
              </h4>
              <ul className="space-y-2.5 sm:space-y-3">
                {currentStage.trainingFocus.map((focus, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span>{focus}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Milestones */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Development Milestones</span>
              </h4>
              <ul className="space-y-2.5 sm:space-y-3">
                {currentStage.milestones.map((ms, mIdx) => (
                  <li key={mIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{ms}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Assessment & Progression Gate */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-600" />
                <span>Assessment & Next Stage Gate</span>
              </h4>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">Key Assessment Rubric</div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentStage.assessmentCriteria.map((crit, cIdx) => (
                      <span key={cIdx} className="text-xs text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-xs">
                        {crit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <div className="text-[10px] uppercase font-mono text-amber-700 font-bold mb-0.5">Progression Gate</div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {currentStage.progressionGate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 mt-6 sm:pt-8 sm:mt-8 border-t border-slate-100">
            <button
              disabled={activeStep === 0}
              onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors min-h-[40px] cursor-pointer ${
                activeStep === 0
                  ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                  : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              ← Previous Stage
            </button>

            <div className="text-xs font-mono text-slate-500">
              Stage 0{activeStep + 1} / 0{MADEN_PATHWAY.length}
            </div>

            <button
              disabled={activeStep === MADEN_PATHWAY.length - 1}
              onClick={() => setActiveStep(prev => Math.min(MADEN_PATHWAY.length - 1, prev + 1))}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 min-h-[40px] cursor-pointer ${
                activeStep === MADEN_PATHWAY.length - 1
                  ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                  : 'text-slate-950 bg-amber-500 hover:bg-amber-600 font-bold shadow-sm shadow-amber-200'
              }`}
            >
              <span>Next Stage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
