'use client';

import React, { useState } from 'react';
import { Program, ACADEMY_PROGRAMS } from '@/data/academyData';
import { AcademyDataManager } from '@/lib/academyDataManager';
import { MediaSelector } from './MediaSelector';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
  Award,
  Plus,
  Edit3,
  Trash2,
  X,
  Clock,
  Users,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  Play,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const PRESET_PROGRAM_MEDIA = [
  {
    label: 'Grassroots U8-U10 Ball Mastery Photo',
    url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80',
    type: 'image' as const,
  },
  {
    label: 'U11-U13 Intermediate Passing Rhythm Photo',
    url: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80',
    type: 'image' as const,
  },
  {
    label: 'Competitive 11v11 Match Preparation Photo',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    type: 'image' as const,
  },
  {
    label: 'Goalkeeper High-Performance Diving Photo',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=80',
    type: 'image' as const,
  },
  {
    label: 'Girls Youth Football Festival Photo',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
    type: 'image' as const,
  },
  {
    label: 'Passing Rhythm Rondo Video (YouTube 2:15)',
    url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    type: 'video' as const,
    duration: '2:15',
  },
  {
    label: 'Tactical Analysis & Pressing Drill (YouTube 3:15)',
    url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    type: 'video' as const,
    duration: '3:15',
  },
];

const createEmptyProgram = (): Program => ({
  id: `program-${Date.now()}`,
  name: '',
  subtitle: 'Structured Youth Football Training',
  ageGroup: 'U10 – U12',
  target: 'Youth candidates seeking structured methodology',
  description: '',
  keyFeatures: [
    'Bilateral ball mastery and first-touch index drills',
    'Small-sided rondos and spatial game intelligence',
    'Quarterly assessment card signed by AFC licensed coaches',
  ],
  schedule: '3 Sessions / Week (75 mins)',
  coachRatio: '1:10 Coach-to-Player ratio',
  pillarEmphasis: { technical: 40, tactical: 30, physical: 20, mental: 10 },
  badgeColor: 'border-amber-500/40 text-amber-700 bg-amber-50',
  image: PRESET_PROGRAM_MEDIA[0].url,
  videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
});

interface ProgramsManagerProps {
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}

export const ProgramsManager: React.FC<ProgramsManagerProps> = ({ onNotify }) => {
  const [programs, setPrograms] = useState<Program[]>(() => AcademyDataManager.getPrograms());
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProgram, setNewProgram] = useState<Program>(createEmptyProgram);
  const [keyFeaturesText, setKeyFeaturesText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null);

  const refreshPrograms = () => {
    setPrograms(AcademyDataManager.getPrograms());
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;

    AcademyDataManager.updateProgram(editingProgram.id, editingProgram);
    refreshPrograms();
    setEditingProgram(null);
    onNotify({
      type: 'success',
      text: `Program "${editingProgram.name}" updated with custom media. Persisted to cloud & live on homepage!`,
    });
  };

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgram.name.trim()) {
      onNotify({ type: 'error', text: 'Program name is required.' });
      return;
    }

    const features = keyFeaturesText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const programToSave: Program = {
      ...newProgram,
      keyFeatures: features.length > 0 ? features : newProgram.keyFeatures,
    };

    AcademyDataManager.addProgram(programToSave);
    refreshPrograms();
    setIsAddOpen(false);
    setNewProgram(createEmptyProgram());
    setKeyFeaturesText('');
    onNotify({
      type: 'success',
      text: `New program "${programToSave.name}" created and synced to Supabase!`,
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    AcademyDataManager.deleteProgram(deleteTarget.id);
    refreshPrograms();
    setDeleteTarget(null);
    onNotify({
      type: 'success',
      text: `Program "${deleteTarget.name}" deleted.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold uppercase tracking-wider text-amber-800">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>Curriculum & Program Media</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight mt-1.5">
            ACADEMY PROGRAMS ({programs.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Attach custom photo banners and drill demonstration videos to every football program.
          </p>
        </div>

        <button
          onClick={() => {
            setNewProgram(createEmptyProgram());
            setKeyFeaturesText(
              'Bilateral ball mastery and first-touch index drills\nSmall-sided rondos and spatial game intelligence\nQuarterly assessment card signed by AFC licensed coaches'
            );
            setIsAddOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Program</span>
        </button>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {programs.map((prog) => (
          <div
            key={prog.id}
            className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Image Banner / Video Badge */}
              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    prog.image ||
                    'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={prog.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Age Group Badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md bg-white/90 text-slate-900 backdrop-blur-xs shadow-xs">
                    {prog.ageGroup}
                  </span>
                </div>

                {/* Video Play Badge if program has video */}
                {prog.videoUrl && (
                  <div className="absolute top-2.5 right-2.5">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-purple-600 text-white shadow-xs flex items-center gap-1">
                      <Film className="w-3 h-3 text-amber-300" />
                      <span>Video Drill</span>
                    </span>
                  </div>
                )}

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <div className="text-[10px] font-mono uppercase text-amber-400 font-bold truncate">
                    {prog.subtitle}
                  </div>
                  <h3 className="text-base font-black uppercase text-white truncate">
                    {prog.name}
                  </h3>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {prog.description}
                </p>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{prog.schedule}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{prog.coachRatio}</span>
                  </div>
                </div>

                {/* Pillar Emphasis Strip */}
                <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-mono pt-1">
                  <div className="p-1 rounded bg-amber-50 text-amber-900 font-bold">
                    T: {prog.pillarEmphasis.technical}%
                  </div>
                  <div className="p-1 rounded bg-sky-50 text-sky-900 font-bold">
                    Ta: {prog.pillarEmphasis.tactical}%
                  </div>
                  <div className="p-1 rounded bg-emerald-50 text-emerald-900 font-bold">
                    P: {prog.pillarEmphasis.physical}%
                  </div>
                  <div className="p-1 rounded bg-purple-50 text-purple-900 font-bold">
                    M: {prog.pillarEmphasis.mental}%
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">
                {prog.keyFeatures?.length || 0} Key Milestones
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditingProgram({ ...prog })}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Edit & Media</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(prog)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Delete Program"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- EDIT PROGRAM MODAL WITH MEDIA SELECTOR ---------------- */}
      {editingProgram && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-700 font-bold">
                  Program Editor & Custom Media
                </span>
                <h3 className="text-base font-black uppercase text-slate-900">
                  {editingProgram.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingProgram(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Program Name</label>
                  <input
                    type="text"
                    value={editingProgram.name}
                    onChange={(e) =>
                      setEditingProgram({ ...editingProgram, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age Group Bracket</label>
                  <input
                    type="text"
                    value={editingProgram.ageGroup}
                    onChange={(e) =>
                      setEditingProgram({ ...editingProgram, ageGroup: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={editingProgram.subtitle}
                    onChange={(e) =>
                      setEditingProgram({ ...editingProgram, subtitle: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Schedule</label>
                  <input
                    type="text"
                    value={editingProgram.schedule}
                    onChange={(e) =>
                      setEditingProgram({ ...editingProgram, schedule: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingProgram.description}
                  onChange={(e) =>
                    setEditingProgram({ ...editingProgram, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              {/* 1. CUSTOM PHOTO SELECTOR */}
              <MediaSelector
                label="Custom Program Showcase Photo (Card Banner)"
                mediaType="image"
                section="programs"
                value={editingProgram.image || ''}
                onChange={(img) => setEditingProgram({ ...editingProgram, image: img })}
                presets={PRESET_PROGRAM_MEDIA.filter((p) => p.type === 'image')}
                helperText="Upload a photo from your device or select from the Media Library."
              />

              {/* 2. CUSTOM VIDEO DRILL SELECTOR */}
              <MediaSelector
                label="Custom Training Drill & Gameplay Demonstration Video"
                mediaType="video"
                section="programs"
                value={editingProgram.videoUrl || ''}
                onChange={(vid) => setEditingProgram({ ...editingProgram, videoUrl: vid })}
                presets={PRESET_PROGRAM_MEDIA.filter((p) => p.type === 'video')}
                helperText="Provide a YouTube drill link, direct MP4 file, or video file upload. Adds an interactive 'Watch Drill' button on the homepage!"
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProgram(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase cursor-pointer shadow-xs"
                >
                  Save Program & Media
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- ADD NEW PROGRAM MODAL ---------------- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-600" />
                <span>Create New Football Program</span>
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Program Name *</label>
                  <input
                    type="text"
                    required
                    value={newProgram.name}
                    onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                    placeholder="e.g. Pre-Academy Elite U12"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age Group Bracket</label>
                  <input
                    type="text"
                    value={newProgram.ageGroup}
                    onChange={(e) => setNewProgram({ ...newProgram, ageGroup: e.target.value })}
                    placeholder="e.g. U11 – U13"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={newProgram.subtitle}
                  onChange={(e) => setNewProgram({ ...newProgram, subtitle: e.target.value })}
                  placeholder="e.g. Technical Mastery & Spatial Intelligence"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newProgram.description}
                  onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                  placeholder="Program overview and developmental curriculum..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              {/* Media Selectors */}
              <MediaSelector
                label="Program Showcase Photo"
                mediaType="image"
                section="programs"
                value={newProgram.image || ''}
                onChange={(img) => setNewProgram({ ...newProgram, image: img })}
                presets={PRESET_PROGRAM_MEDIA.filter((p) => p.type === 'image')}
              />

              <MediaSelector
                label="Program Drill Demonstration Video"
                mediaType="video"
                section="programs"
                value={newProgram.videoUrl || ''}
                onChange={(vid) => setNewProgram({ ...newProgram, videoUrl: vid })}
                presets={PRESET_PROGRAM_MEDIA.filter((p) => p.type === 'video')}
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase cursor-pointer shadow-xs"
                >
                  Create Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Program"
        message="Are you sure you want to remove this football program from the academy curriculum?"
        itemName={deleteTarget?.name || ''}
        confirmLabel="Delete Program"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
