'use client';

import React, { useState } from 'react';
import { AcademyDataManager } from '@/lib/academyDataManager';
import { TestimonialItem } from '@/data/academyData';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
  Trophy,
  Star,
  Quote,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Save,
  X,
  Search,
  Filter,
  Sparkles,
  Heart,
  Upload,
} from 'lucide-react';

interface SuccessStoriesManagerProps {
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}

export const SuccessStoriesManager: React.FC<SuccessStoriesManagerProps> = ({ onNotify }) => {
  const [stories, setStories] = useState<TestimonialItem[]>(() =>
    AcademyDataManager.getTestimonials()
  );
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'player' | 'parent' | 'scout'>('all');
  const [editingStory, setEditingStory] = useState<TestimonialItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; author: string } | null>(null);

  // New Story Form
  const [newStory, setNewStory] = useState<TestimonialItem>({
    id: `story-${Date.now()}`,
    author: '',
    role: 'U15 Striker (#9)',
    type: 'player',
    campus: 'Gayeshpur Flagship Campus',
    avatar: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=300&q=80',
    quote: '',
    fullStory: '',
    milestone: 'Selected for Bengal Youth Championship Squad',
    rating: 5,
    highlightTag: 'Tactical Game Intelligence',
    verifiedBadge: 'Advanced Academy Player',
  });

  const refreshStories = () => {
    setStories(AcademyDataManager.getTestimonials());
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory) return;
    AcademyDataManager.updateTestimonial(editingStory.id, editingStory);
    refreshStories();
    setEditingStory(null);
    onNotify({
      type: 'success',
      text: `Success story by "${editingStory.author}" updated. Persisted to Supabase and live in stories carousel!`,
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStory.author.trim() || !newStory.quote.trim()) {
      alert('Please provide author name and highlight quote.');
      return;
    }
    const created: TestimonialItem = {
      ...newStory,
      id: `story-${Date.now()}`,
    };
    AcademyDataManager.addTestimonial(created);
    refreshStories();
    setIsAddOpen(false);
    setNewStory({
      id: `story-${Date.now()}`,
      author: '',
      role: 'U15 Striker (#9)',
      type: 'player',
      campus: 'Gayeshpur Flagship Campus',
      avatar: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=300&q=80',
      quote: '',
      fullStory: '',
      milestone: 'Selected for Bengal Youth Championship Squad',
      rating: 5,
      highlightTag: 'Tactical Game Intelligence',
      verifiedBadge: 'Advanced Academy Player',
    });
    onNotify({
      type: 'success',
      text: `New success story "${created.author}" published! Live on website & Supabase.`,
    });
  };

  const handleDelete = (id: string, author: string) => {
    setDeleteTarget({ id, author });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    AcademyDataManager.deleteTestimonial(deleteTarget.id);
    refreshStories();
    onNotify({ type: 'success', text: `Story for "${deleteTarget.author}" removed.` });
    setDeleteTarget(null);
  };

  // Avatar upload handler
  const handleAvatarUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        if (isEdit && editingStory) {
          setEditingStory({ ...editingStory, avatar: event.target.result });
        } else {
          setNewStory({ ...newStory, avatar: event.target.result });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredStories = stories.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      s.author.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.milestone.toLowerCase().includes(q) ||
      s.campus.toLowerCase().includes(q) ||
      s.highlightTag.toLowerCase().includes(q);
    const matchesType = typeFilter === 'all' || s.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">
              Success Stories & Alumni Management
            </h2>
            <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-full border border-amber-500/20">
              {stories.length} Published Stories
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage player testimonials, scout dossiers, parent reflections, milestone achievements, and quotes.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Success Story</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search stories by player name, milestone, squad, or campus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['all', 'player', 'parent', 'scout'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                typeFilter === t
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'all' ? 'All Roles' : `${t}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStories.map((story) => (
          <div
            key={story.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {story.type}
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{story.verifiedBadge || 'Verified'}</span>
                </span>
              </div>

              <div className="text-[11px] font-mono font-bold text-amber-700 uppercase mb-1">
                {story.highlightTag}
              </div>

              <h4 className="text-xs font-black text-slate-900 mb-2">
                Milestone: <span className="text-amber-800 font-bold">{story.milestone}</span>
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed italic mb-4 line-clamp-3">
                &ldquo;{story.quote}&rdquo;
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <img
                  src={story.avatar || 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=150&q=80'}
                  alt={story.author}
                  className="w-10 h-10 rounded-full object-cover border border-amber-300 shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 truncate">{story.author}</div>
                  <div className="text-[11px] text-slate-500 truncate">{story.role}</div>
                  <div className="text-[10px] text-amber-700 truncate font-semibold">{story.campus}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => setEditingStory(story)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Edit Story</span>
              </button>
              <button
                onClick={() => handleDelete(story.id, story.author)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete Story"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Story Modal */}
      {editingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-slate-900 tracking-tight">
                Edit Success Story
              </h3>
              <button onClick={() => setEditingStory(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStory.author}
                    onChange={(e) => setEditingStory({ ...editingStory, author: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Category Type
                  </label>
                  <select
                    value={editingStory.type}
                    onChange={(e) => setEditingStory({ ...editingStory, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="player">Player / Graduate</option>
                    <option value="parent">Parent</option>
                    <option value="scout">Scout / Evaluator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Role / Position
                  </label>
                  <input
                    type="text"
                    value={editingStory.role}
                    onChange={(e) => setEditingStory({ ...editingStory, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Campus
                  </label>
                  <input
                    type="text"
                    value={editingStory.campus}
                    onChange={(e) => setEditingStory({ ...editingStory, campus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Milestone Achievement Headline
                </label>
                <input
                  type="text"
                  value={editingStory.milestone}
                  onChange={(e) => setEditingStory({ ...editingStory, milestone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Highlight Tag
                </label>
                <input
                  type="text"
                  value={editingStory.highlightTag}
                  onChange={(e) => setEditingStory({ ...editingStory, highlightTag: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Quote *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingStory.quote}
                  onChange={(e) => setEditingStory({ ...editingStory, quote: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Full Story Journey
                </label>
                <textarea
                  rows={3}
                  value={editingStory.fullStory}
                  onChange={(e) => setEditingStory({ ...editingStory, fullStory: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Avatar Photo (URL or Device Upload)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingStory.avatar}
                    onChange={(e) => setEditingStory({ ...editingStory, avatar: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAvatarUpload(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStory(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Story Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-slate-900 tracking-tight">
                Publish New Success Story
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Subham Roy"
                    value={newStory.author}
                    onChange={(e) => setNewStory({ ...newStory, author: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Role Category
                  </label>
                  <select
                    value={newStory.type}
                    onChange={(e) => setNewStory({ ...newStory, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="player">Player / Academy Graduate</option>
                    <option value="parent">Academy Parent</option>
                    <option value="scout">External Scout</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Squad Role / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. U15 Midfielder (#8)"
                    value={newStory.role}
                    onChange={(e) => setNewStory({ ...newStory, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Campus Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gayeshpur Flagship Campus"
                    value={newStory.campus}
                    onChange={(e) => setNewStory({ ...newStory, campus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Milestone Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Son Selected for Bengal U15 State Camp"
                  value={newStory.milestone}
                  onChange={(e) => setNewStory({ ...newStory, milestone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Highlight Quote *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Quote describing transformation, training rigor, match memories..."
                  value={newStory.quote}
                  onChange={(e) => setNewStory({ ...newStory, quote: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Full Story Journey
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed narrative for modal pop-up..."
                  value={newStory.fullStory}
                  onChange={(e) => setNewStory({ ...newStory, fullStory: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Avatar Photo (URL or Device Upload)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newStory.avatar}
                    onChange={(e) => setNewStory({ ...newStory, avatar: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAvatarUpload(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish Story</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Success Story Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Success Story / Testimonial"
        message="Are you sure you want to permanently delete this player graduate success story? It will be removed from the website and synced to Supabase Cloud."
        itemName={deleteTarget?.author}
        confirmLabel="Delete Story"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
