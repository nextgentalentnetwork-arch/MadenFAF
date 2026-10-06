'use client';

import React, { useState } from 'react';
import { Campus } from '@/data/academyData';
import { AcademyDataManager } from '@/lib/academyDataManager';
import { ImageSelector } from './ImageSelector';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { Building, Plus, Edit3, Trash2, X, Calendar, Clock, MapPin, Phone, Mail, Shield, CheckCircle2 } from 'lucide-react';

const PRESET_CAMPUS_PHOTOS = [
  { label: 'Central Football Pitch & Goal', url: 'https://images.unsplash.com/photo-1529900240041-22f114d18eb1?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Floodlit Stadium Field', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Grass Training Complex', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80' },
  { label: 'High-Performance Turf Pitch', url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Mini 5v5 Turf Ground', url: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80' },
];

const createEmptyCampus = (): Campus => ({
  id: `campus-${Date.now()}`,
  name: '',
  tagline: 'MADEN Football Academy Campus',
  location: 'Nadia, West Bengal',
  address: '',
  association: 'MADEN FAF Academy',
  status: 'active',
  description: '',
  facilities: ['11v11 Natural Grass Pitch', 'Floodlights', 'Changing Rooms & Showers'],
  trainingDays: 'Tuesday, Thursday, Saturday & Sunday',
  timings: 'Morning: 6:00 AM – 8:15 AM | Evening: 4:15 PM – 6:45 PM',
  ageGroups: ['U8', 'U10', 'U12', 'U14', 'U16'],
  headCoach: {
    name: 'Technical Director',
    license: 'AFC ‘C’ Licensed Coach',
    experience: 'Academy Experience',
  },
  contactPhone: '+91 98302 45891',
  contactEmail: 'admissions@madenfaf.com',
  image: PRESET_CAMPUS_PHOTOS[0].url,
});

export const CampusesManager: React.FC<{
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}> = ({ onNotify }) => {
  const [campuses, setCampuses] = useState<Campus[]>(() => AcademyDataManager.getCampuses());
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCampus, setNewCampus] = useState<Campus>(createEmptyCampus);
  const [facilitiesText, setFacilitiesText] = useState('');
  const [ageGroupsText, setAgeGroupsText] = useState('U8, U10, U12, U14, U16');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const refreshCampuses = () => {
    setCampuses(AcademyDataManager.getCampuses());
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampus) return;

    AcademyDataManager.updateCampus(editingCampus.id, editingCampus);
    refreshCampuses();
    setEditingCampus(null);
    onNotify({
      type: 'success',
      text: `Campus "${editingCampus.name}" updated. Persisted to Supabase & live in Campus Network!`,
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampus.name.trim()) {
      onNotify({ type: 'error', text: 'Please enter campus name.' });
      return;
    }

    const created: Campus = {
      ...newCampus,
      id: `campus-${Date.now()}`,
      facilities: facilitiesText
        ? facilitiesText.split(',').map((f) => f.trim()).filter(Boolean)
        : ['11v11 Natural Grass Pitch', 'Floodlights', 'Changing Rooms'],
      ageGroups: ageGroupsText
        ? ageGroupsText.split(',').map((ag) => ag.trim()).filter(Boolean)
        : ['U8', 'U10', 'U12', 'U14', 'U16'],
    };

    AcademyDataManager.addCampus(created);
    refreshCampuses();
    setIsAddOpen(false);
    setNewCampus(createEmptyCampus());
    setFacilitiesText('');
    setAgeGroupsText('U8, U10, U12, U14, U16');
    onNotify({
      type: 'success',
      text: `New campus "${created.name}" created. Persisted to Supabase & live in Campus Network!`,
    });
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    AcademyDataManager.deleteCampus(deleteTarget.id);
    refreshCampuses();
    onNotify({ type: 'success', text: `Campus "${deleteTarget.name}" removed from Supabase & live Campus Network.` });
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-600" />
            <span>Campus Network & Training Centers ({campuses.length})</span>
          </h3>
          <p className="text-xs text-slate-500">
            Add, update, or remove training centers, set specific training days & dates, batch timings, and coaching leadership.
          </p>
        </div>

        <button
          onClick={() => {
            setNewCampus(createEmptyCampus());
            setFacilitiesText('');
            setAgeGroupsText('U8, U10, U12, U14, U16');
            setIsAddOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Training Center</span>
        </button>
      </div>

      {/* Campuses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campuses.map((campus) => (
          <div
            key={campus.id}
            className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                    campus.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  ● {campus.status}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingCampus({ ...campus })}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer flex items-center gap-1 text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Campus</span>
                  </button>
                  <button
                    onClick={() => handleDelete(campus.id, campus.name)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                    title="Delete Campus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Photo & Name */}
              <div className="flex gap-3">
                <div className="w-20 sm:w-28 h-20 sm:h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={campus.image || PRESET_CAMPUS_PHOTOS[0].url}
                    alt={campus.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PRESET_CAMPUS_PHOTOS[0].url;
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-slate-900 leading-tight">{campus.name}</h4>
                  <p className="text-xs text-amber-700 font-semibold mt-0.5 truncate">{campus.tagline}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{campus.address}</span>
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2">{campus.description}</p>

              {/* Key Timings & Dates Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-start gap-1.5 text-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Training Days & Dates: </span>
                    <span className="text-slate-600">{campus.trainingDays}</span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Timings: </span>
                    <span className="text-slate-600">{campus.timings}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-800 pt-1 border-t border-slate-200/60">
                  <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    <strong>Head Coach:</strong> {campus.headCoach?.name} ({campus.headCoach?.license})
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Phone: {campus.contactPhone}</span>
              <span>{campus.location}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- EDIT CAMPUS MODAL ---------------- */}
      {editingCampus && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="text-base font-black uppercase text-slate-900">
                  Edit Campus: {editingCampus.name}
                </h3>
                <p className="text-xs text-slate-500">Update training timings, dates, ground address, and head coach.</p>
              </div>
              <button onClick={() => setEditingCampus(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Photo Selector */}
              <ImageSelector
                label="Campus Grounds Photograph (Upload from Device or pick a Preset)"
                value={editingCampus.image}
                onChange={(imgUrl) => setEditingCampus({ ...editingCampus, image: imgUrl })}
                presets={PRESET_CAMPUS_PHOTOS}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campus Name *</label>
                  <input
                    type="text"
                    required
                    value={editingCampus.name}
                    onChange={(e) => setEditingCampus({ ...editingCampus, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={editingCampus.tagline}
                    onChange={(e) => setEditingCampus({ ...editingCampus, tagline: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              {/* TIMING AND DATES */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <div className="font-bold text-amber-900 text-xs uppercase font-mono flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>Training Days, Dates & Timing Schedule</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Training Days & Dates *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wednesday, Friday, Saturday & Sunday"
                      value={editingCampus.trainingDays}
                      onChange={(e) => setEditingCampus({ ...editingCampus, trainingDays: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Batch Timings *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Morning: 6:00 AM – 8:15 AM | Evening: 4:15 PM – 6:45 PM"
                      value={editingCampus.timings}
                      onChange={(e) => setEditingCampus({ ...editingCampus, timings: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Regional Location</label>
                  <input
                    type="text"
                    value={editingCampus.location}
                    onChange={(e) => setEditingCampus({ ...editingCampus, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingCampus.status}
                    onChange={(e) => setEditingCampus({ ...editingCampus, status: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="active">Active Campus</option>
                    <option value="upcoming">Upcoming / Vision Campus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Address & Grounds</label>
                <input
                  type="text"
                  value={editingCampus.address}
                  onChange={(e) => setEditingCampus({ ...editingCampus, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Partner Club / Collaboration</label>
                <input
                  type="text"
                  value={editingCampus.association || ''}
                  onChange={(e) => setEditingCampus({ ...editingCampus, association: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              {/* Head Coach Profile */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Head of Campus Coaching</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-0.5">Coach Name</label>
                    <input
                      type="text"
                      value={editingCampus.headCoach?.name || ''}
                      onChange={(e) =>
                        setEditingCampus({
                          ...editingCampus,
                          headCoach: { ...editingCampus.headCoach, name: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5">License Title</label>
                    <input
                      type="text"
                      value={editingCampus.headCoach?.license || ''}
                      onChange={(e) =>
                        setEditingCampus({
                          ...editingCampus,
                          headCoach: { ...editingCampus.headCoach, license: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5">Experience</label>
                    <input
                      type="text"
                      value={editingCampus.headCoach?.experience || ''}
                      onChange={(e) =>
                        setEditingCampus({
                          ...editingCampus,
                          headCoach: { ...editingCampus.headCoach, experience: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editingCampus.contactPhone}
                    onChange={(e) => setEditingCampus({ ...editingCampus, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={editingCampus.contactEmail}
                    onChange={(e) => setEditingCampus({ ...editingCampus, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingCampus.description}
                  onChange={(e) => setEditingCampus({ ...editingCampus, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Facilities (Comma-separated)</label>
                <input
                  type="text"
                  value={editingCampus.facilities.join(', ')}
                  onChange={(e) =>
                    setEditingCampus({
                      ...editingCampus,
                      facilities: e.target.value.split(',').map((f) => f.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingCampus(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase tracking-wider"
                >
                  Save Campus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- ADD NEW CAMPUS MODAL ---------------- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="text-base font-black uppercase text-slate-900">Add New Training Center / Campus</h3>
                <p className="text-xs text-slate-500">Add a new academy branch with dates, timings, and grounds info.</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              {/* Photo Selector */}
              <ImageSelector
                label="Campus Grounds Photograph (Upload from Device or pick a Preset)"
                value={newCampus.image}
                onChange={(imgUrl) => setNewCampus({ ...newCampus, image: imgUrl })}
                presets={PRESET_CAMPUS_PHOTOS}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campus Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Barasat Regional Football Center"
                    value={newCampus.name}
                    onChange={(e) => setNewCampus({ ...newCampus, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. Grassroots & Youth Development Hub"
                    value={newCampus.tagline}
                    onChange={(e) => setNewCampus({ ...newCampus, tagline: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              {/* TIMING AND DATES */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <div className="font-bold text-amber-900 text-xs uppercase font-mono flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>Training Days, Dates & Timing Schedule</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Training Days & Dates *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wednesday, Friday, Saturday & Sunday"
                      value={newCampus.trainingDays}
                      onChange={(e) => setNewCampus({ ...newCampus, trainingDays: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Batch Timings *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Morning: 6:00 AM – 8:15 AM | Evening: 4:15 PM – 6:45 PM"
                      value={newCampus.timings}
                      onChange={(e) => setNewCampus({ ...newCampus, timings: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Regional Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Barasat, North 24 Parganas"
                    value={newCampus.location}
                    onChange={(e) => setNewCampus({ ...newCampus, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={newCampus.status}
                    onChange={(e) => setNewCampus({ ...newCampus, status: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="active">Active Campus</option>
                    <option value="upcoming">Upcoming / Vision Campus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address & Grounds</label>
                <input
                  type="text"
                  placeholder="e.g. Stadium Road Grounds, Barasat 700124"
                  value={newCampus.address}
                  onChange={(e) => setNewCampus({ ...newCampus, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              {/* Head Coach Profile */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Head Coach In-Charge</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-0.5">Coach Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Tapan Mondal"
                      value={newCampus.headCoach?.name || ''}
                      onChange={(e) =>
                        setNewCampus({
                          ...newCampus,
                          headCoach: { ...newCampus.headCoach, name: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5">License</label>
                    <input
                      type="text"
                      placeholder="e.g. AFC ‘C’ Licensed Coach"
                      value={newCampus.headCoach?.license || ''}
                      onChange={(e) =>
                        setNewCampus({
                          ...newCampus,
                          headCoach: { ...newCampus.headCoach, license: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5">Experience</label>
                    <input
                      type="text"
                      placeholder="e.g. 7 years youth academy coaching"
                      value={newCampus.headCoach?.experience || ''}
                      onChange={(e) =>
                        setNewCampus({
                          ...newCampus,
                          headCoach: { ...newCampus.headCoach, experience: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98302 45891"
                    value={newCampus.contactPhone}
                    onChange={(e) => setNewCampus({ ...newCampus, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="e.g. barasat@madenfaf.com"
                    value={newCampus.contactEmail}
                    onChange={(e) => setNewCampus({ ...newCampus, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Details about pitch, lighting, coaching delivery..."
                  value={newCampus.description}
                  onChange={(e) => setNewCampus({ ...newCampus, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Facilities (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Natural Grass Pitch, Floodlights, Changing Rooms, Hydration Lounge"
                  value={facilitiesText}
                  onChange={(e) => setFacilitiesText(e.target.value)}
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
                  Create Campus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Campus Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Training Center Campus"
        message="Are you sure you want to permanently delete this campus? This will remove the facility details, schedule, and Google Maps integration from the website and update Supabase Cloud."
        itemName={deleteTarget?.name}
        confirmLabel="Delete Campus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
