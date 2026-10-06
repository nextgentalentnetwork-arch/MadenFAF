'use client';

import React, { useState } from 'react';
import { AcademyDataManager } from '@/lib/academyDataManager';
import { TestimonialItem, ParentDeliverableItem } from '@/data/academyData';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
  Users,
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
  MessageSquare,
  Sparkles,
  Calendar,
  TrendingUp,
  Bell,
  Shield,
  Upload,
} from 'lucide-react';

interface ParentReviewsManagerProps {
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}

export const ParentReviewsManager: React.FC<ParentReviewsManagerProps> = ({ onNotify }) => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'deliverables'>('reviews');

  // Reviews state (filtered for type: 'parent')
  const [allTestimonials, setAllTestimonials] = useState<TestimonialItem[]>(() =>
    AcademyDataManager.getTestimonials()
  );
  const parentReviews = allTestimonials.filter((t) => t.type === 'parent');

  const [search, setSearch] = useState('');
  const [editingReview, setEditingReview] = useState<TestimonialItem | null>(null);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);

  // Deliverables state
  const [deliverables, setDeliverables] = useState<ParentDeliverableItem[]>(() =>
    AcademyDataManager.getParentDeliverables()
  );
  const [editingDeliverable, setEditingDeliverable] = useState<ParentDeliverableItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'review' | 'deliverable'; id: string; name: string } | null>(null);

  // New Review Form
  const [newReview, setNewReview] = useState<TestimonialItem>({
    id: `story-parent-${Date.now()}`,
    author: '',
    role: 'Parent of Youth Academy Player',
    type: 'parent',
    campus: 'Gayeshpur Flagship Campus',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    quote: '',
    fullStory: '',
    milestone: 'Verified Academy Parent Review',
    rating: 5,
    highlightTag: 'Transparent Progression & Discipline',
    verifiedBadge: 'Verified Academy Parent',
  });

  const refreshData = () => {
    setAllTestimonials(AcademyDataManager.getTestimonials());
    setDeliverables(AcademyDataManager.getParentDeliverables());
  };

  // Save Edit Review
  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    AcademyDataManager.updateTestimonial(editingReview.id, editingReview);
    refreshData();
    setEditingReview(null);
    onNotify({
      type: 'success',
      text: `Parent review by "${editingReview.author}" updated and synchronized!`,
    });
  };

  // Add Review
  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.author.trim() || !newReview.quote.trim()) {
      alert('Please provide parent author name and review quote.');
      return;
    }
    const created: TestimonialItem = {
      ...newReview,
      id: `story-parent-${Date.now()}`,
      type: 'parent',
    };
    AcademyDataManager.addTestimonial(created);
    refreshData();
    setIsAddReviewOpen(false);
    setNewReview({
      id: `story-parent-${Date.now()}`,
      author: '',
      role: 'Parent of Youth Academy Player',
      type: 'parent',
      campus: 'Gayeshpur Flagship Campus',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
      quote: '',
      fullStory: '',
      milestone: 'Verified Academy Parent Review',
      rating: 5,
      highlightTag: 'Transparent Progression & Discipline',
      verifiedBadge: 'Verified Academy Parent',
    });
    onNotify({
      type: 'success',
      text: `New parent review published! Persisted to Supabase and live on website.`,
    });
  };

  // Delete Review
  const handleDeleteReview = (id: string, name: string) => {
    setDeleteTarget({ type: 'review', id, name });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'review') {
      AcademyDataManager.deleteTestimonial(deleteTarget.id);
      refreshData();
      onNotify({ type: 'success', text: `Review by "${deleteTarget.name}" removed.` });
    } else if (deleteTarget.type === 'deliverable') {
      AcademyDataManager.deleteParentDeliverable(deleteTarget.id);
      refreshData();
      onNotify({
        type: 'success',
        text: `Deliverable "${deleteTarget.name}" removed from Supabase and live site.`,
      });
    }
    setDeleteTarget(null);
  };

  // Deliverables Save
  const handleSaveDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeliverable) return;
    AcademyDataManager.updateParentDeliverable(editingDeliverable.id, editingDeliverable);
    refreshData();
    setEditingDeliverable(null);
    onNotify({
      type: 'success',
      text: `Parent deliverable "${editingDeliverable.title}" updated and live!`,
    });
  };

  const toggleDeliverableActive = (item: ParentDeliverableItem) => {
    const updated = !item.active;
    AcademyDataManager.updateParentDeliverable(item.id, { active: updated });
    refreshData();
    onNotify({
      type: 'success',
      text: `Deliverable "${item.title}" ${updated ? 'activated' : 'hidden'}.`,
    });
  };

  const handleDeleteDeliverable = (id: string, title: string) => {
    setDeleteTarget({ type: 'deliverable', id, name: title });
  };

  // Avatar Upload Helper
  const handleAvatarUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        if (isEdit && editingReview) {
          setEditingReview({ ...editingReview, avatar: event.target.result });
        } else {
          setNewReview({ ...newReview, avatar: event.target.result });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredReviews = parentReviews.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.author.toLowerCase().includes(q) ||
      r.role.toLowerCase().includes(q) ||
      r.quote.toLowerCase().includes(q) ||
      r.campus.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">
              Parent Portal & Experience Management
            </h2>
            <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-full border border-amber-500/20">
              {parentReviews.length} Verified Parent Reviews
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage parent portal transparency cards, verified parent reviews, feedback ratings, and testimonials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold border border-slate-200">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'reviews' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Parent Reviews ({parentReviews.length})
            </button>
            <button
              onClick={() => setActiveTab('deliverables')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'deliverables' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Portal Services ({deliverables.length})
            </button>
          </div>

          {activeTab === 'reviews' && (
            <button
              onClick={() => setIsAddReviewOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Parent Review</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'reviews' ? (
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search parent reviews by author, player role, or campus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: review.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{review.verifiedBadge || 'Verified'}</span>
                    </span>
                  </div>

                  <div className="text-[10px] font-mono font-bold text-amber-800 uppercase mb-1">
                    {review.highlightTag}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic mb-4 line-clamp-4">
                    &ldquo;{review.quote}&rdquo;
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                    <img
                      src={review.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
                      alt={review.author}
                      className="w-10 h-10 rounded-full object-cover border border-amber-300 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">{review.author}</div>
                      <div className="text-[11px] text-slate-500 truncate">{review.role}</div>
                      <div className="text-[10px] text-amber-700 truncate font-semibold">{review.campus}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => setEditingReview(review)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id, review.author)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Deliverables Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deliverables.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    Icon: {item.iconName}
                  </span>
                  <button
                    onClick={() => toggleDeliverableActive(item)}
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full cursor-pointer transition-colors border ${
                      item.active !== false
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {item.active !== false ? '● Visible' : '○ Hidden'}
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1.5">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => setEditingDeliverable(item)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Edit Service</span>
                </button>
                <button
                  onClick={() => handleDeleteDeliverable(item.id, item.title)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete Deliverable Service"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-slate-900 tracking-tight">
                Edit Parent Review
              </h3>
              <button onClick={() => setEditingReview(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Parent Author Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingReview.author}
                    onChange={(e) => setEditingReview({ ...editingReview, author: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Rating (1-5 Stars)
                  </label>
                  <select
                    value={editingReview.rating}
                    onChange={(e) =>
                      setEditingReview({ ...editingReview, rating: parseInt(e.target.value) || 5 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="5">★★★★★ 5 Stars</option>
                    <option value="4">★★★★☆ 4 Stars</option>
                    <option value="3">★★★☆☆ 3 Stars</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Parent Role / Child Cohort
                  </label>
                  <input
                    type="text"
                    value={editingReview.role}
                    onChange={(e) => setEditingReview({ ...editingReview, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Campus Location
                  </label>
                  <input
                    type="text"
                    value={editingReview.campus}
                    onChange={(e) => setEditingReview({ ...editingReview, campus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Highlight Tag Headline
                </label>
                <input
                  type="text"
                  value={editingReview.highlightTag}
                  onChange={(e) => setEditingReview({ ...editingReview, highlightTag: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Review Quote *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingReview.quote}
                  onChange={(e) => setEditingReview({ ...editingReview, quote: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Avatar Photograph (URL or Device Upload)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingReview.avatar}
                    onChange={(e) => setEditingReview({ ...editingReview, avatar: e.target.value })}
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
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Review Modal */}
      {isAddReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-slate-900 tracking-tight">
                Create Verified Parent Review
              </h3>
              <button onClick={() => setIsAddReviewOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Parent Author Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. Pradip Roy"
                    value={newReview.author}
                    onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Rating (1-5 Stars)
                  </label>
                  <select
                    value={newReview.rating}
                    onChange={(e) =>
                      setNewReview({ ...newReview, rating: parseInt(e.target.value) || 5 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="5">★★★★★ 5 Stars</option>
                    <option value="4">★★★★☆ 4 Stars</option>
                    <option value="3">★★★☆☆ 3 Stars</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Role / Child Info
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Parent of Subham Roy (U15 Midfielder)"
                    value={newReview.role}
                    onChange={(e) => setNewReview({ ...newReview, role: e.target.value })}
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
                    value={newReview.campus}
                    onChange={(e) => setNewReview({ ...newReview, campus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Highlight Tag Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Total Transparency & Academic Discipline"
                  value={newReview.highlightTag}
                  onChange={(e) => setNewReview({ ...newReview, highlightTag: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Review Quote *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter parent experience with the coaches, report cards, portal, and child character growth..."
                  value={newReview.quote}
                  onChange={(e) => setNewReview({ ...newReview, quote: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Avatar Photograph (URL or Device Upload)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newReview.avatar}
                    onChange={(e) => setNewReview({ ...newReview, avatar: e.target.value })}
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
                  onClick={() => setIsAddReviewOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Deliverable Modal */}
      {editingDeliverable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-slate-900 tracking-tight">
                Edit Parent Portal Deliverable
              </h3>
              <button onClick={() => setEditingDeliverable(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDeliverable} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Deliverable Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingDeliverable.title}
                  onChange={(e) => setEditingDeliverable({ ...editingDeliverable, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Icon Identifier
                </label>
                <select
                  value={editingDeliverable.iconName}
                  onChange={(e) => setEditingDeliverable({ ...editingDeliverable, iconName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Calendar">Calendar (Attendance / Schedule)</option>
                  <option value="TrendingUp">TrendingUp (Development Reports)</option>
                  <option value="Bell">Bell (Matchday Timetables)</option>
                  <option value="Users">Users (Direct Coach Comm)</option>
                  <option value="Shield">Shield (Physio & Injury Care)</option>
                  <option value="CheckCircle2">CheckCircle2 (Verified Fee Ledger)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingDeliverable.desc}
                  onChange={(e) => setEditingDeliverable({ ...editingDeliverable, desc: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDeliverable(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Deliverable</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title={
          deleteTarget?.type === 'review'
            ? 'Delete Parent Portal Review'
            : 'Delete Parent Deliverable Commitment'
        }
        message={
          deleteTarget?.type === 'review'
            ? 'Are you sure you want to remove this parent testimonial? It will be removed from the Parent Experience section and updated in Supabase.'
            : 'Are you sure you want to delete this deliverable commitment from the parent portal deliverables checklist?'
        }
        itemName={deleteTarget?.name}
        confirmLabel={deleteTarget?.type === 'review' ? 'Delete Review' : 'Delete Deliverable'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
