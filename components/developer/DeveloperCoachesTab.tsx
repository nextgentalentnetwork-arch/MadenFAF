'use client';

import React, { useState } from 'react';
import { CoachStaffMember } from '@/data/academyData';
import { AcademyDataManager } from '@/lib/academyDataManager';
import { Plus, Edit3, Trash2, Shield, X, Sparkles, Image as ImageIcon } from 'lucide-react';

interface DeveloperCoachesTabProps {
  coaches: CoachStaffMember[];
  onCoachesUpdated: () => void;
  setMessage: (msg: { type: 'success' | 'error'; text: string }) => void;
}

export const DeveloperCoachesTab: React.FC<DeveloperCoachesTabProps> = ({
  coaches,
  onCoachesUpdated,
  setMessage,
}) => {
  const [editingCoach, setEditingCoach] = useState<CoachStaffMember | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [form, setForm] = useState<Omit<CoachStaffMember, 'id'>>({
    name: '',
    role: 'Campus Head Coach',
    category: 'campus-head',
    license: 'AFC ‘B’ License',
    licenseLevel: 'AFC B',
    campus: 'Gayeshpur Campus',
    experienceYears: 8,
    playingBackground: 'Former State Youth Footballer',
    philosophy: 'Player-first holistic development.',
    bio: '',
    keySpecialties: ['1v1 Ball Mastery', 'Game Intelligence'],
    certifications: ['AFC ‘B’ License', 'Safe Sport Certified'],
    careerHighlights: ['Trained over 200 youth players'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    accentColor: 'amber',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newCoach: CoachStaffMember = {
      ...form,
      id: `coach-${Date.now()}`,
    };
    AcademyDataManager.addCoach(newCoach);
    onCoachesUpdated();
    setIsAddOpen(false);
    setMessage({ type: 'success', text: `Coach ${newCoach.name} added successfully with photo.` });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoach) return;
    AcademyDataManager.updateCoach(editingCoach.id, editingCoach);
    onCoachesUpdated();
    setEditingCoach(null);
    setMessage({ type: 'success', text: `Coach ${editingCoach.name} updated successfully.` });
  };

  const handleDelete = (coach: CoachStaffMember) => {
    AcademyDataManager.deleteCoach(coach.id);
    onCoachesUpdated();
    setMessage({ type: 'success', text: `Coach ${coach.name} deleted.` });
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Coaching Staff & Mentors</h3>
          <p className="text-xs text-slate-500">
            Upload/update photographs, AFC/AIFF licenses, biographies, and campus assignments.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Coach</span>
        </button>
      </div>

      {/* Grid of Coaches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coaches.map((coach) => (
          <div
            key={coach.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 hover:border-amber-400 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
                  {coach.license}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingCoach({ ...coach })}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    title="Edit Coach & Photo"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(coach)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                    title="Delete Coach"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Coach Photo & Name */}
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coach.image}
                    alt={coach.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 leading-tight">{coach.name}</h4>
                  <p className="text-xs text-amber-700 font-semibold">{coach.role}</p>
                  <span className="text-[10px] text-slate-500 font-mono">{coach.campus}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{coach.bio}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>{coach.experienceYears} Years Exp</span>
              <span className="text-emerald-700 font-bold">● Active Mentor</span>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Coach Modal */}
      {editingCoach && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-base font-black uppercase text-slate-900">
                Edit Coach & Photograph: {editingCoach.name}
              </h3>
              <button onClick={() => setEditingCoach(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3.5 text-xs">
              {/* Photograph URL and Live Preview */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                  <span>Coach Photograph URL *</span>
                </label>
                <input
                  type="url"
                  required
                  value={editingCoach.image}
                  onChange={(e) => setEditingCoach({ ...editingCoach, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border rounded-xl"
                />

                {/* Photo Preview Strip */}
                <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 border rounded-xl">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 border shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editingCoach.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Live photo preview. Paste any high-res image URL (Unsplash, Cloudinary, Imgur, or direct link).
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Coach Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingCoach.name}
                    onChange={(e) => setEditingCoach({ ...editingCoach, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role / Designation</label>
                  <input
                    type="text"
                    required
                    value={editingCoach.role}
                    onChange={(e) => setEditingCoach({ ...editingCoach, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">License</label>
                  <input
                    type="text"
                    required
                    value={editingCoach.license}
                    onChange={(e) => setEditingCoach({ ...editingCoach, license: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Campus</label>
                  <input
                    type="text"
                    required
                    value={editingCoach.campus}
                    onChange={(e) => setEditingCoach({ ...editingCoach, campus: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
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
                <label className="block font-bold text-slate-700 mb-1">Biography & Credentials</label>
                <textarea
                  rows={3}
                  required
                  value={editingCoach.bio}
                  onChange={(e) => setEditingCoach({ ...editingCoach, bio: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingCoach(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase cursor-pointer"
                >
                  Save Coach & Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coach Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-base font-black uppercase text-slate-900">Add New Coach to Academy</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                  <span>Coach Photograph URL *</span>
                </label>
                <input
                  type="url"
                  required
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
                <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 border rounded-xl">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 border shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-[11px] text-slate-500">Live preview of coach headshot.</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Subrata Paul"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role / Designation *</label>
                  <input
                    type="text"
                    required
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="e.g. Senior Goalkeeping Coach"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">License *</label>
                  <input
                    type="text"
                    required
                    value={form.license}
                    onChange={(e) => setForm({ ...form, license: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Campus</label>
                  <input
                    type="text"
                    required
                    value={form.campus}
                    onChange={(e) => setForm({ ...form, campus: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Playing Background</label>
                <input
                  type="text"
                  value={form.playingBackground}
                  onChange={(e) => setForm({ ...form, playingBackground: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Biography & Credentials</label>
                <textarea
                  rows={3}
                  required
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Detail years of coaching, accomplishments, state titles..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase cursor-pointer"
                >
                  Add Coach to Live Academy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
