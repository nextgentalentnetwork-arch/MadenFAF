'use client';

import React, { useState } from 'react';
import { CoachStaffMember } from '@/data/academyData';
import { AcademyDataManager } from '@/lib/academyDataManager';
import { ImageSelector } from './ImageSelector';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { Users, Plus, Edit3, Trash2, X, Award, Shield, MapPin, CheckCircle2 } from 'lucide-react';

const PRESET_COACH_PHOTOS = [
  { label: 'Technical Director (Male)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Head of Girls Football (Female)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80' },
  { label: 'Goalkeeping Specialist (Male)', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80' },
  { label: 'Sports Medicine / Physio', url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=80' },
  { label: 'Senior Youth Coach', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Tactical Analyst', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80' },
];

const createEmptyCoach = (): CoachStaffMember => ({
  id: `coach-${Date.now()}`,
  name: '',
  role: '',
  category: 'leadership',
  license: 'AFC ‘C’ Licensed Coach',
  licenseLevel: 'AFC C',
  campus: 'Gayeshpur Flagship Campus',
  experienceYears: 5,
  playingBackground: '',
  philosophy: '',
  bio: '',
  keySpecialties: [],
  certifications: [],
  careerHighlights: [],
  image: PRESET_COACH_PHOTOS[0].url,
  accentColor: 'amber',
});

export const CoachesManager: React.FC<{
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}> = ({ onNotify }) => {
  const [coaches, setCoaches] = useState<CoachStaffMember[]>(() => AcademyDataManager.getCoaches());
  const [editingCoach, setEditingCoach] = useState<CoachStaffMember | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCoach, setNewCoach] = useState<CoachStaffMember>(createEmptyCoach);
  const [specialtiesText, setSpecialtiesText] = useState('');
  const [certificationsText, setCertificationsText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const refreshCoaches = () => {
    setCoaches(AcademyDataManager.getCoaches());
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoach) return;

    AcademyDataManager.updateCoach(editingCoach.id, editingCoach);
    refreshCoaches();
    setEditingCoach(null);
    onNotify({ type: 'success', text: `Coach "${editingCoach.name}" updated. Persisted to Supabase & live on homepage!` });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoach.name.trim()) {
      onNotify({ type: 'error', text: 'Please enter coach name' });
      return;
    }

    const created: CoachStaffMember = {
      ...newCoach,
      id: `coach-${Date.now()}`,
      keySpecialties: specialtiesText
        ? specialtiesText.split(',').map((s) => s.trim()).filter(Boolean)
        : ['Technical Ball Mastery', 'Tactical Intelligence'],
      certifications: certificationsText
        ? certificationsText.split(',').map((s) => s.trim()).filter(Boolean)
        : [newCoach.license],
    };

    AcademyDataManager.addCoach(created);
    refreshCoaches();
    setIsAddOpen(false);
    setNewCoach(createEmptyCoach());
    setSpecialtiesText('');
    setCertificationsText('');
    onNotify({ type: 'success', text: `New coach "${created.name}" created. Persisted to Supabase & live on homepage!` });
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    AcademyDataManager.deleteCoach(deleteTarget.id);
    refreshCoaches();
    onNotify({ type: 'success', text: `Coach "${deleteTarget.name}" removed from Supabase & live coaching roster.` });
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            <span>Coaching Staff & Mentors ({coaches.length})</span>
          </h3>
          <p className="text-xs text-slate-500">
            Add, update, or delete coaches, license credentials, campus assignments, and photos.
          </p>
        </div>

        <button
          onClick={() => {
            setNewCoach(createEmptyCoach());
            setSpecialtiesText('');
            setCertificationsText('');
            setIsAddOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Coach</span>
        </button>
      </div>

      {/* Coaches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coaches.map((coach) => (
          <div
            key={coach.id}
            className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3 transition-colors"
          >
            <div className="space-y-3">
              {/* Photo & Header */}
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coach.image || PRESET_COACH_PHOTOS[0].url}
                    alt={coach.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PRESET_COACH_PHOTOS[0].url;
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold truncate">
                      {coach.license}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 truncate mt-0.5">{coach.name}</h4>
                  <p className="text-xs text-amber-700 font-semibold truncate">{coach.role}</p>
                </div>
              </div>

              {/* Details Snippet */}
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="truncate">{coach.campus}</span>
                </div>
                <p className="line-clamp-2 italic text-[11px] text-slate-500">
                  &ldquo;{coach.philosophy}&rdquo;
                </p>
              </div>

              {/* Specialties */}
              {coach.keySpecialties && coach.keySpecialties.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {coach.keySpecialties.slice(0, 3).map((spec, sIdx) => (
                    <span key={sIdx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {spec}
                    </span>
                  ))}
                  {coach.keySpecialties.length > 3 && (
                    <span className="text-[10px] text-slate-400">+{coach.keySpecialties.length - 3}</span>
                  )}
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-500 text-[11px]">{coach.experienceYears}+ Yrs Exp</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEditingCoach({ ...coach })}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(coach.id, coach.name)}
                  className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                  title="Delete Coach"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- EDIT COACH MODAL ---------------- */}
      {editingCoach && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="text-base font-black uppercase text-slate-900">
                  Edit Coach Profile: {editingCoach.name}
                </h3>
                <p className="text-xs text-slate-500">Update coach photograph, credentials, and coaching philosophy.</p>
              </div>
              <button onClick={() => setEditingCoach(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Photo Selector */}
              <ImageSelector
                label="Coach Photograph (Upload from Device or pick a Preset)"
                value={editingCoach.image}
                onChange={(imgUrl) => setEditingCoach({ ...editingCoach, image: imgUrl })}
                presets={PRESET_COACH_PHOTOS}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Coach Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingCoach.name}
                    onChange={(e) => setEditingCoach({ ...editingCoach, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role / Designation *</label>
                  <input
                    type="text"
                    required
                    value={editingCoach.role}
                    onChange={(e) => setEditingCoach({ ...editingCoach, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingCoach.category}
                    onChange={(e) => setEditingCoach({ ...editingCoach, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="leadership">Leadership & Methodology</option>
                    <option value="campus-head">Campus Head Coach</option>
                    <option value="specialist">Specialist (GK, Girls, Science)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">License Title</label>
                  <input
                    type="text"
                    value={editingCoach.license}
                    onChange={(e) => setEditingCoach({ ...editingCoach, license: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={editingCoach.experienceYears}
                    onChange={(e) => setEditingCoach({ ...editingCoach, experienceYears: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Campus Assignment</label>
                <input
                  type="text"
                  value={editingCoach.campus}
                  onChange={(e) => setEditingCoach({ ...editingCoach, campus: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Playing Background</label>
                <input
                  type="text"
                  value={editingCoach.playingBackground}
                  onChange={(e) => setEditingCoach({ ...editingCoach, playingBackground: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Coaching Philosophy (Quote)</label>
                <textarea
                  rows={2}
                  value={editingCoach.philosophy}
                  onChange={(e) => setEditingCoach({ ...editingCoach, philosophy: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Biography</label>
                <textarea
                  rows={3}
                  value={editingCoach.bio}
                  onChange={(e) => setEditingCoach({ ...editingCoach, bio: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingCoach(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase tracking-wider"
                >
                  Save & Update Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- ADD NEW COACH MODAL ---------------- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="text-base font-black uppercase text-slate-900">Add New Coach / Mentor</h3>
                <p className="text-xs text-slate-500">Provide coach portrait, credentials, and coaching focus.</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              {/* Photo Selector */}
              <ImageSelector
                label="Coach Photograph (Upload from Device or pick a Preset)"
                value={newCoach.image}
                onChange={(imgUrl) => setNewCoach({ ...newCoach, image: imgUrl })}
                presets={PRESET_COACH_PHOTOS}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Coach Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sourav Mukherjee"
                    value={newCoach.name}
                    onChange={(e) => setNewCoach({ ...newCoach, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role / Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Head Coach U14 & Technical Mentor"
                    value={newCoach.role}
                    onChange={(e) => setNewCoach({ ...newCoach, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCoach.category}
                    onChange={(e) => setNewCoach({ ...newCoach, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="leadership">Leadership & Methodology</option>
                    <option value="campus-head">Campus Head Coach</option>
                    <option value="specialist">Specialist (GK, Girls, Science)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">License Title</label>
                  <input
                    type="text"
                    placeholder="e.g. AFC ‘C’ Licensed Coach"
                    value={newCoach.license}
                    onChange={(e) => setNewCoach({ ...newCoach, license: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={newCoach.experienceYears}
                    onChange={(e) => setNewCoach({ ...newCoach, experienceYears: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Campus Assignment</label>
                <input
                  type="text"
                  placeholder="e.g. North 24 Parganas Campus (Ichapore)"
                  value={newCoach.campus}
                  onChange={(e) => setNewCoach({ ...newCoach, campus: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Core Specialties (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. 1v1 Ball Mastery, Scanning Speed, Rondo Periodization"
                  value={specialtiesText}
                  onChange={(e) => setSpecialtiesText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Coaching Philosophy (Quote)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Football is played with the brain; feet are merely the tools."
                  value={newCoach.philosophy}
                  onChange={(e) => setNewCoach({ ...newCoach, philosophy: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Biography</label>
                <textarea
                  rows={3}
                  placeholder="Provide career pedigree, background, achievements..."
                  value={newCoach.bio}
                  onChange={(e) => setNewCoach({ ...newCoach, bio: e.target.value })}
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase tracking-wider"
                >
                  Create Coach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Coach Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Coach Roster Record"
        message="Are you sure you want to permanently remove this coach? The profile will be removed from the homepage and updated in Supabase Cloud."
        itemName={deleteTarget?.name}
        confirmLabel="Delete Coach"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
