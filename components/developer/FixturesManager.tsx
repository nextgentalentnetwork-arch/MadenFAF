'use client';

import React, { useState } from 'react';
import { MatchFixture } from '@/data/academyData';
import { AcademyDataManager } from '@/lib/academyDataManager';
import { TeamLogo, TEAM_LOGO_PRESETS } from '@/components/common/TeamLogo';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
  Trophy,
  Plus,
  Edit3,
  Trash2,
  X,
  Calendar,
  Clock,
  MapPin,
  Upload,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

const createEmptyFixture = (): MatchFixture => ({
  id: `m-${Date.now()}`,
  competition: 'IFA Bengal Youth Championship — U15',
  status: 'upcoming',
  homeTeam: 'MADEN FAF U15',
  awayTeam: 'East Bengal Youth Academy',
  homeTeamLogo: 'preset:maden-faf',
  awayTeamLogo: 'preset:east-bengal',
  isHome: true,
  homeScore: 0,
  awayScore: 0,
  date: 'October 15, 2026',
  time: '3:30 PM',
  venue: 'Gayeshpur Central Ground',
  ageGroup: 'U15',
  playerOfTheMatch: '',
  matchReportSnippet: '',
});

// Helper component for Team Logo Selector with presets, URL, and device upload
interface TeamLogoSelectorProps {
  label: string;
  teamName: string;
  value?: string;
  onChange: (logo: string) => void;
}

const TeamLogoSelector: React.FC<TeamLogoSelectorProps> = ({
  label,
  teamName,
  value,
  onChange,
}) => {
  const [mode, setMode] = useState<'preset' | 'url' | 'upload'>('preset');
  const [urlInput, setUrlInput] = useState(value?.startsWith('http') ? value : '');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo image should be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onChange(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <span>{label}</span>
        </label>
        <div className="flex items-center gap-1.5">
          <TeamLogo logo={value} teamName={teamName} size="sm" />
          <span className="text-[10px] font-mono font-bold text-slate-500 truncate max-w-[120px]">
            {value ? (value.startsWith('preset:') ? value.replace('preset:', '') : 'Custom') : 'Initial'}
          </span>
        </div>
      </div>

      {/* Mode switch */}
      <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[10px] font-bold uppercase">
        <button
          type="button"
          onClick={() => setMode('preset')}
          className={`py-1 rounded-lg transition-colors cursor-pointer text-center ${
            mode === 'preset' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Preset Crests
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`py-1 rounded-lg transition-colors cursor-pointer text-center ${
            mode === 'upload' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Upload Photo
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`py-1 rounded-lg transition-colors cursor-pointer text-center ${
            mode === 'url' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Image URL
        </button>
      </div>

      {/* Preset options */}
      {mode === 'preset' && (
        <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto no-scrollbar p-1">
          {TEAM_LOGO_PRESETS.map((p) => {
            const isSelected = value === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange(p.id)}
                className={`p-1.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <TeamLogo logo={p.id} teamName={p.name} size="sm" />
                <div className="truncate">
                  <div className="text-[10px] font-bold text-slate-800 truncate">{p.name}</div>
                  <div className="text-[9px] text-slate-400 font-mono">{p.category}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Upload mode */}
      {mode === 'upload' && (
        <div className="space-y-2">
          <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-white text-slate-600 text-xs font-bold cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-amber-500" />
            <span>Choose Logo File from Device (PNG/JPG/SVG)</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}

      {/* URL mode */}
      {mode === 'url' && (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://.../club-logo.png"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              onChange(e.target.value);
            }}
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
          />
        </div>
      )}
    </div>
  );
};

export const FixturesManager: React.FC<{
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}> = ({ onNotify }) => {
  const [fixtures, setFixtures] = useState<MatchFixture[]>(() => AcademyDataManager.getFixtures());
  const [editingFixture, setEditingFixture] = useState<MatchFixture | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'upcoming'>('all');
  const [newFixture, setNewFixture] = useState<MatchFixture>(createEmptyFixture);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  const refreshFixtures = () => {
    setFixtures(AcademyDataManager.getFixtures());
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFixture) return;

    AcademyDataManager.updateFixture(editingFixture.id, editingFixture);
    refreshFixtures();
    setEditingFixture(null);
    onNotify({
      type: 'success',
      text: `Fixture "${editingFixture.homeTeam} vs ${editingFixture.awayTeam}" updated with team logos. Persisted to Supabase & live in Match Centre!`,
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFixture.homeTeam.trim() || !newFixture.awayTeam.trim()) {
      alert('Please provide both team names.');
      return;
    }

    const created: MatchFixture = {
      ...newFixture,
      id: `m-${Date.now()}`,
    };

    AcademyDataManager.addFixture(created);
    refreshFixtures();
    setIsAddOpen(false);
    setNewFixture(createEmptyFixture());
    onNotify({
      type: 'success',
      text: `New match "${created.homeTeam} vs ${created.awayTeam}" created with logos. Persisted to Supabase & live on website!`,
    });
  };

  const handleDelete = (id: string, label: string) => {
    setDeleteTarget({ id, label });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    AcademyDataManager.deleteFixture(deleteTarget.id);
    refreshFixtures();
    onNotify({ type: 'success', text: `Match fixture was removed from Supabase & live website.` });
    setDeleteTarget(null);
  };

  const filteredFixtures = fixtures.filter((f) => {
    if (activeFilter === 'all') return true;
    return f.status === activeFilter;
  });

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">
              Match Centre & Team Logos Management
            </h2>
            <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-full border border-amber-500/20">
              {fixtures.length} Total Fixtures
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure match schedules, competition names, team names, official team crest logos, full-time scores, and player of the match.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                activeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                activeFilter === 'completed'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Results
            </button>
            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                activeFilter === 'upcoming'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upcoming
            </button>
          </div>

          <button
            onClick={() => {
              setNewFixture(createEmptyFixture());
              setIsAddOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Match</span>
          </button>
        </div>
      </div>

      {/* Team Crests & Logos Quick Library Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 text-white shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Team Crests & Logos Library (Match Centre Integration)
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            {TEAM_LOGO_PRESETS.length} Official Crests Ready
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          Select or assign team crests when creating matches. Preset crests display official colorways and shield emblems in the Match Centre on the public website. Custom images or device uploads are supported for any club.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {TEAM_LOGO_PRESETS.map((p) => (
            <div
              key={p.id}
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-2 hover:border-amber-400 transition-colors"
            >
              <TeamLogo logo={p.id} teamName={p.name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-white truncate">{p.name}</div>
                <div className="text-[9px] font-mono text-amber-400/90 truncate">{p.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixtures List */}
      <div className="space-y-3">
        {filteredFixtures.map((fix) => {
          const isCompleted = fix.status === 'completed';
          return (
            <div
              key={fix.id}
              className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-mono font-bold uppercase">
                    {fix.competition}
                  </span>
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{fix.date}</span>
                    <span>·</span>
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{fix.time}</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      isCompleted
                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isCompleted ? 'Completed' : 'Upcoming'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {fix.ageGroup}
                  </span>
                </div>

                {/* Teams & Logos Row */}
                <div className="flex flex-wrap items-center gap-3 text-base sm:text-lg font-black text-slate-900 py-1">
                  <div className="flex items-center gap-2">
                    <TeamLogo logo={fix.homeTeamLogo} teamName={fix.homeTeam} size="md" />
                    <span className="text-amber-800">{fix.homeTeam}</span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono font-bold px-1.5 py-0.5 bg-slate-100 rounded">
                    VS
                  </span>

                  <div className="flex items-center gap-2">
                    <TeamLogo logo={fix.awayTeamLogo} teamName={fix.awayTeam} size="md" />
                    <span>{fix.awayTeam}</span>
                  </div>

                  {isCompleted && (
                    <span className="font-mono font-black text-slate-900 ml-2 px-2.5 py-0.5 bg-amber-50 rounded-lg border border-amber-200 text-sm">
                      {fix.homeScore} - {fix.awayScore}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{fix.venue}</span>
                  </span>
                  {fix.playerOfTheMatch && (
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>POTM: {fix.playerOfTheMatch}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button
                  onClick={() => setEditingFixture(fix)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Logos & Info</span>
                </button>
                <button
                  onClick={() => handleDelete(fix.id, `${fix.homeTeam} vs ${fix.awayTeam}`)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                  title="Delete Fixture"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Fixture Modal */}
      {editingFixture && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-base font-black uppercase text-slate-900">
                Edit Match Details & Team Logos
              </h3>
              <button
                onClick={() => setEditingFixture(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Home Team Name *</label>
                  <input
                    type="text"
                    required
                    value={editingFixture.homeTeam}
                    onChange={(e) => setEditingFixture({ ...editingFixture, homeTeam: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Away Team Name *</label>
                  <input
                    type="text"
                    required
                    value={editingFixture.awayTeam}
                    onChange={(e) => setEditingFixture({ ...editingFixture, awayTeam: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Team Logos Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TeamLogoSelector
                  label="Home Team Crest Logo"
                  teamName={editingFixture.homeTeam}
                  value={editingFixture.homeTeamLogo}
                  onChange={(logo) => setEditingFixture({ ...editingFixture, homeTeamLogo: logo })}
                />
                <TeamLogoSelector
                  label="Away Team Crest Logo"
                  teamName={editingFixture.awayTeam}
                  value={editingFixture.awayTeamLogo}
                  onChange={(logo) => setEditingFixture({ ...editingFixture, awayTeamLogo: logo })}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tournament / League Information *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IFA Bengal Youth Championship — U15, Nadia District Cup"
                  value={editingFixture.competition}
                  onChange={(e) => setEditingFixture({ ...editingFixture, competition: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Match Status</label>
                  <select
                    value={editingFixture.status}
                    onChange={(e) => setEditingFixture({ ...editingFixture, status: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  >
                    <option value="upcoming">Upcoming Match</option>
                    <option value="completed">Completed (Has Score)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Home Team Score</label>
                  <input
                    type="number"
                    value={editingFixture.homeScore ?? 0}
                    onChange={(e) =>
                      setEditingFixture({ ...editingFixture, homeScore: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Away Team Score</label>
                  <input
                    type="number"
                    value={editingFixture.awayScore ?? 0}
                    onChange={(e) =>
                      setEditingFixture({ ...editingFixture, awayScore: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Match Date</label>
                  <input
                    type="text"
                    value={editingFixture.date}
                    onChange={(e) => setEditingFixture({ ...editingFixture, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kick-off Time</label>
                  <input
                    type="text"
                    value={editingFixture.time}
                    onChange={(e) => setEditingFixture({ ...editingFixture, time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age Group Cohort</label>
                  <input
                    type="text"
                    value={editingFixture.ageGroup}
                    onChange={(e) => setEditingFixture({ ...editingFixture, ageGroup: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Venue Ground & Location</label>
                  <input
                    type="text"
                    value={editingFixture.venue}
                    onChange={(e) => setEditingFixture({ ...editingFixture, venue: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Player of the Match (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Subham Roy (MADEN FAF #8)"
                    value={editingFixture.playerOfTheMatch || ''}
                    onChange={(e) =>
                      setEditingFixture({ ...editingFixture, playerOfTheMatch: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Match Report Snippet (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Summary of performance, goals scored, and tactical highlights..."
                  value={editingFixture.matchReportSnippet || ''}
                  onChange={(e) =>
                    setEditingFixture({ ...editingFixture, matchReportSnippet: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingFixture(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase"
                >
                  Save Fixture & Logos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Fixture Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-base font-black uppercase text-slate-900">
                Add New Match Fixture & Team Logos
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Home Team Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MADEN FAF U16"
                    value={newFixture.homeTeam}
                    onChange={(e) => setNewFixture({ ...newFixture, homeTeam: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Away Team Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohun Bagan Youth Academy"
                    value={newFixture.awayTeam}
                    onChange={(e) => setNewFixture({ ...newFixture, awayTeam: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Team Logos Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TeamLogoSelector
                  label="Home Team Crest Logo"
                  teamName={newFixture.homeTeam}
                  value={newFixture.homeTeamLogo}
                  onChange={(logo) => setNewFixture({ ...newFixture, homeTeamLogo: logo })}
                />
                <TeamLogoSelector
                  label="Away Team Crest Logo"
                  teamName={newFixture.awayTeam}
                  value={newFixture.awayTeamLogo}
                  onChange={(logo) => setNewFixture({ ...newFixture, awayTeamLogo: logo })}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tournament / League Information *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IFA Bengal Youth Championship — U15, Nadia District Cup"
                  value={newFixture.competition}
                  onChange={(e) => setNewFixture({ ...newFixture, competition: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Match Status</label>
                  <select
                    value={newFixture.status}
                    onChange={(e) => setNewFixture({ ...newFixture, status: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  >
                    <option value="upcoming">Upcoming Match</option>
                    <option value="completed">Completed (Has Score)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Home Team Score</label>
                  <input
                    type="number"
                    value={newFixture.homeScore ?? 0}
                    onChange={(e) =>
                      setNewFixture({ ...newFixture, homeScore: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Away Team Score</label>
                  <input
                    type="number"
                    value={newFixture.awayScore ?? 0}
                    onChange={(e) =>
                      setNewFixture({ ...newFixture, awayScore: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Match Date</label>
                  <input
                    type="text"
                    placeholder="e.g. October 15, 2026"
                    value={newFixture.date}
                    onChange={(e) => setNewFixture({ ...newFixture, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kick-off Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 3:30 PM"
                    value={newFixture.time}
                    onChange={(e) => setNewFixture({ ...newFixture, time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age Group Cohort</label>
                  <input
                    type="text"
                    placeholder="e.g. U15, U17 Girls, U18"
                    value={newFixture.ageGroup}
                    onChange={(e) => setNewFixture({ ...newFixture, ageGroup: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Venue Ground & Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Gayeshpur Central Ground"
                    value={newFixture.venue}
                    onChange={(e) => setNewFixture({ ...newFixture, venue: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Player of the Match (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Subham Roy (CM)"
                    value={newFixture.playerOfTheMatch || ''}
                    onChange={(e) =>
                      setNewFixture({ ...newFixture, playerOfTheMatch: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Match Report Snippet (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Summary of match highlights, tactical performance, and goals..."
                  value={newFixture.matchReportSnippet || ''}
                  onChange={(e) =>
                    setNewFixture({ ...newFixture, matchReportSnippet: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase"
                >
                  Create Match Fixture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Fixture Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Match Fixture"
        message="Are you sure you want to delete this match fixture? It will be removed from Match Centre on the website and synced to Supabase Cloud."
        itemName={deleteTarget?.label}
        confirmLabel="Delete Match"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
