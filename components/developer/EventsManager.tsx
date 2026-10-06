'use client';

import React, { useState } from 'react';
import { AcademyDataManager } from '@/lib/academyDataManager';
import { AcademyEvent } from '@/data/academyData';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit3,
  Trash2,
  Tag,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Search,
} from 'lucide-react';

interface EventsManagerProps {
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}

const CATEGORIES = [
  'Training Camp',
  'Football School',
  'Tournament',
  'Trial',
  'Workshop',
  'Community Event',
] as const;

const STATUSES = ['Open', 'Filling Fast', 'Waitlist'] as const;

export const EventsManager: React.FC<EventsManagerProps> = ({ onNotify }) => {
  const [events, setEvents] = useState<AcademyEvent[]>(() => AcademyDataManager.getEvents());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingEvent, setEditingEvent] = useState<AcademyEvent | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newEvent, setNewEvent] = useState<Omit<AcademyEvent, 'id'>>({
    title: '',
    category: 'Training Camp',
    date: 'April 25 – May 02, 2026',
    duration: '7 Days (Morning Sessions)',
    location: 'Gayeshpur Central Ground',
    ageGroup: 'U11 – U17 (Boys & Girls)',
    registrationStatus: 'Open',
    fee: 'Subsidized Academy Rates',
    description: 'High-intensity tactical conditioning, small-sided games, and position-specific coaching.',
  });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const refreshEvents = () => {
    setEvents(AcademyDataManager.getEvents());
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    AcademyDataManager.updateEvent(editingEvent.id, editingEvent);
    refreshEvents();
    setEditingEvent(null);
    onNotify({
      type: 'success',
      text: `Event "${editingEvent.title}" updated. Persisted to Supabase & live on Camps & Events!`,
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) {
      alert('Please enter an event title.');
      return;
    }

    const created: AcademyEvent = {
      ...newEvent,
      id: `ev-${Date.now()}`,
    };

    AcademyDataManager.addEvent(created);
    refreshEvents();
    setIsAddOpen(false);
    setNewEvent({
      title: '',
      category: 'Training Camp',
      date: 'April 25 – May 02, 2026',
      duration: '7 Days',
      location: 'Gayeshpur Central Ground',
      ageGroup: 'U11 – U17',
      registrationStatus: 'Open',
      fee: 'Registration Required',
      description: '',
    });
    onNotify({
      type: 'success',
      text: `New camp/event "${created.title}" published. Persisted to Supabase & live on website!`,
    });
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteTarget({ id, title });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    AcademyDataManager.deleteEvent(deleteTarget.id);
    refreshEvents();
    onNotify({
      type: 'success',
      text: `Event "${deleteTarget.title}" removed from Supabase & live website.`,
    });
    setDeleteTarget(null);
  };

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.location.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || ev.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">
              Camps & Events Management
            </h2>
            <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-full border border-amber-500/20">
              {events.length} Active Events
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage holiday camps, talent scouting festivals, masterclasses, and weekend tournaments.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Camp / Event</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events by title, venue, or campus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors shrink-0 ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors shrink-0 ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((ev) => (
          <div
            key={ev.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {ev.category}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    ev.registrationStatus === 'Open'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : ev.registrationStatus === 'Filling Fast'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {ev.registrationStatus}
                </span>
              </div>

              <h3 className="text-base font-black uppercase text-slate-900 leading-snug tracking-tight mb-2">
                {ev.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                {ev.description}
              </p>

              <div className="space-y-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{ev.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{ev.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{ev.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Age Cohort: {ev.ageGroup}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-semibold text-slate-700">{ev.fee}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => setEditingEvent(ev)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(ev.id, ev.title)}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-base font-black uppercase text-slate-900">Edit Camp / Event</h3>
              <button onClick={() => setEditingEvent(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingEvent.category}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registration Status</label>
                  <select
                    value={editingEvent.registrationStatus}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, registrationStatus: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Dates</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration & Schedule</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.duration}
                    onChange={(e) => setEditingEvent({ ...editingEvent, duration: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location / Pitch</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age Bracket</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.ageGroup}
                    onChange={(e) => setEditingEvent({ ...editingEvent, ageGroup: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fee / Admissions Details</label>
                <input
                  type="text"
                  required
                  value={editingEvent.fee}
                  onChange={(e) => setEditingEvent({ ...editingEvent, fee: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-base font-black uppercase text-slate-900">Add New Camp or Event</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer High-Performance Intensive Camp 2026"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registration Status</label>
                  <select
                    value={newEvent.registrationStatus}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, registrationStatus: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Dates</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. May 10 – May 17, 2026"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration & Schedule</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 7 Days (Morning 7:00 AM – 9:30 AM)"
                    value={newEvent.duration}
                    onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location / Pitch</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gayeshpur Central Ground"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age Bracket</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. U10, U12, U14, U16"
                    value={newEvent.ageGroup}
                    onChange={(e) => setNewEvent({ ...newEvent, ageGroup: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fee / Admissions Details</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free for Scholarship athletes / Standard Academy rate"
                  value={newEvent.fee}
                  onChange={(e) => setNewEvent({ ...newEvent, fee: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe camp curriculum, guest coaches, and match schedule..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Camp / Event Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Camp or Assessment Event"
        message="Are you sure you want to remove this camp/event? It will be removed from the Camps & Events section on the website and synchronized with Supabase Cloud."
        itemName={deleteTarget?.title}
        confirmLabel="Delete Event"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
