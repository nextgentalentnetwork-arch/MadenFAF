'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { MatchFixture, MATCH_FIXTURES } from '@/data/academyData';
import { AcademyDataManager, subscribeAcademyData } from '@/lib/academyDataManager';
import { TeamLogo } from '@/components/common/TeamLogo';
import { Trophy, Calendar, MapPin, Award, ChevronDown, ChevronUp, CheckCircle2, ArrowRight } from 'lucide-react';

interface MatchCentreProps {
  onJoinClick: () => void;
}

export const MatchCentre: React.FC<MatchCentreProps> = ({ onJoinClick }) => {
  const fixtures = useSyncExternalStore(
    subscribeAcademyData,
    () => AcademyDataManager.getFixtures(),
    () => MATCH_FIXTURES
  );

  const [filter, setFilter] = useState<'results' | 'fixtures' | 'all'>('results');
  const [showAllResults, setShowAllResults] = useState<boolean>(false);

  // Separate completed match results and upcoming fixtures
  const completedMatches = fixtures.filter((m) => m.status === 'completed');
  const upcomingMatches = fixtures.filter((m) => m.status === 'upcoming');

  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const selectedMatch =
    fixtures.find((m) => m.id === selectedMatchId) || completedMatches[0] || fixtures[0] || null;

  // If in 'results' mode, show only last two match results unless 'showAllResults' is true
  const displayedResults = showAllResults ? completedMatches : completedMatches.slice(0, 2);

  // Calculate items to show based on active filter
  const displayedMatches = (() => {
    if (filter === 'results') {
      return displayedResults;
    }
    if (filter === 'fixtures') {
      return upcomingMatches;
    }
    // 'all' tab: show current results slice + upcoming fixtures
    return [...displayedResults, ...upcomingMatches];
  })();

  const hasMoreResults = completedMatches.length > 2;

  return (
    <section id="match-centre" className="py-16 sm:py-24 bg-white border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div className="space-y-2 sm:space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold uppercase tracking-wider text-amber-800 shadow-xs">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Competitive Calendar</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-900">
              MATCH CENTRE
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Live fixtures, verified league results, goalscorers, and tactical post-match reports from state and district youth tournaments.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl overflow-x-auto no-scrollbar touch-pan-x w-full md:w-auto">
            <button
              onClick={() => setFilter('results')}
              className={`shrink-0 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer min-h-[38px] ${
                filter === 'results' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recent Results ({completedMatches.length})
            </button>
            <button
              onClick={() => setFilter('fixtures')}
              className={`shrink-0 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer min-h-[38px] ${
                filter === 'fixtures' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upcoming Fixtures ({upcomingMatches.length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`shrink-0 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer min-h-[38px] ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Matches
            </button>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Matches List Column */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            {/* Header pill showing current count info */}
            {filter === 'results' && (
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono pb-1">
                <span>
                  Showing {displayedResults.length} of {completedMatches.length} match results
                </span>
                {!showAllResults && hasMoreResults && (
                  <span className="text-[11px] text-amber-700 font-semibold">
                    Last 2 match results shown
                  </span>
                )}
              </div>
            )}

            {displayedMatches.map((match) => {
              const isSelected = selectedMatch?.id === match.id;
              const isCompleted = match.status === 'completed';

              return (
                <div
                  key={match.id}
                  onClick={() => setSelectedMatchId(match.id)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-white border-amber-500 shadow-md ring-1 ring-amber-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Competition Header */}
                  <div className="flex items-center justify-between text-xs mb-2 sm:mb-3">
                    <span className="font-mono text-amber-800 font-bold truncate max-w-[200px] sm:max-w-none">
                      {match.competition}
                    </span>
                    <span className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded shrink-0 ${
                      isCompleted ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {isCompleted ? 'Full Time' : 'Upcoming'}
                    </span>
                  </div>

                  {/* Scoreline or Teams with Crests */}
                  <div className="grid grid-cols-12 items-center py-2.5 gap-1.5">
                    <div className="col-span-5 flex items-center justify-end gap-2 pr-1 min-w-0">
                      <span className="font-black text-xs sm:text-base text-slate-900 truncate text-right">
                        {match.homeTeam}
                      </span>
                      <div className="shrink-0">
                        <TeamLogo logo={match.homeTeamLogo} teamName={match.homeTeam} size="sm" />
                      </div>
                    </div>

                    <div className="col-span-2 text-center">
                      {isCompleted ? (
                        <div className="inline-flex items-center justify-center px-2 sm:px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 font-mono font-black text-sm sm:text-lg text-slate-900 shadow-xs">
                          <span className="text-amber-600">{match.homeScore}</span>
                          <span className="mx-0.5 sm:mx-1 text-slate-400">-</span>
                          <span>{match.awayScore}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] font-mono font-bold text-slate-400">
                          VS
                        </div>
                      )}
                    </div>

                    <div className="col-span-5 flex items-center justify-start gap-2 pl-1 min-w-0">
                      <div className="shrink-0">
                        <TeamLogo logo={match.awayTeamLogo} teamName={match.awayTeam} size="sm" />
                      </div>
                      <span className="font-black text-xs sm:text-base text-slate-900 truncate text-left">
                        {match.awayTeam}
                      </span>
                    </div>
                  </div>

                  {/* Date, Time & Venue */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 gap-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{match.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 truncate max-w-[180px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{match.venue}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Small "See More" / "Show Less" Button */}
            {(filter === 'results' || filter === 'all') && hasMoreResults && (
              <div className="pt-2 flex items-center justify-start">
                <button
                  onClick={() => setShowAllResults(prev => !prev)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs group"
                >
                  <span>
                    {showAllResults
                      ? 'Show Less'
                      : `See More (${completedMatches.length - 2} more results)`}
                  </span>
                  {showAllResults ? (
                    <ChevronUp className="w-3.5 h-3.5 text-amber-600 group-hover:-translate-y-0.5 transition-transform" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-amber-600 group-hover:translate-y-0.5 transition-transform" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Selected Match Dossier & Tactical Review Card */}
          <div className="lg:col-span-5">
            {selectedMatch ? (
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 sm:space-y-5 sticky top-24">
                <div className="text-xs font-mono uppercase text-amber-600 font-bold flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>Match Dossier & Tactical Review</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-[10px] text-amber-700 font-mono font-bold uppercase tracking-wider">{selectedMatch.competition}</div>
                  
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <TeamLogo logo={selectedMatch.homeTeamLogo} teamName={selectedMatch.homeTeam} size="lg" />
                      <div className="min-w-0">
                        <span className="block font-black text-xs sm:text-sm text-slate-900 truncate">{selectedMatch.homeTeam}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Home</span>
                      </div>
                    </div>

                    <div className="shrink-0 px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono font-black text-sm text-slate-900 shadow-xs text-center min-w-[54px]">
                      {selectedMatch.status === 'completed' ? (
                        <span>
                          <span className="text-amber-600">{selectedMatch.homeScore}</span> - {selectedMatch.awayScore}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">VS</span>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2.5 min-w-0 flex-1 text-right">
                      <div className="min-w-0">
                        <span className="block font-black text-xs sm:text-sm text-slate-900 truncate">{selectedMatch.awayTeam}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Away</span>
                      </div>
                      <TeamLogo logo={selectedMatch.awayTeamLogo} teamName={selectedMatch.awayTeam} size="lg" />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-1">
                    <span className="font-semibold text-slate-700">{selectedMatch.venue}</span>
                    <span>{selectedMatch.date} · {selectedMatch.time}</span>
                  </div>
                </div>

                {selectedMatch.playerOfTheMatch && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                    <div className="text-[10px] font-mono uppercase text-amber-800 font-bold">Player of the Match</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">{selectedMatch.playerOfTheMatch}</div>
                  </div>
                )}

                {selectedMatch.keyEvents && selectedMatch.keyEvents.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase text-slate-500">Match Timeline</div>
                    <div className="space-y-1 text-xs text-slate-700">
                      {selectedMatch.keyEvents.map((evt, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{evt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Tactical Match Summary</div>
                  <p className="leading-relaxed">
                    {selectedMatch.matchReportSnippet}
                  </p>
                </div>

                <button
                  onClick={onJoinClick}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors shadow-sm shadow-amber-200 min-h-[44px] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Trial for Academy Match Roster</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};
