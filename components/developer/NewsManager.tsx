'use client';

import React, { useState } from 'react';
import { NewsStory } from '@/data/academyData';
import { AcademyDataManager } from '@/lib/academyDataManager';
import { ImageSelector } from './ImageSelector';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { Newspaper, Plus, Edit3, Trash2, X, Sparkles, Calendar, Clock, User } from 'lucide-react';

const PRESET_NEWS_PHOTOS = [
  { label: 'Tactical Analysis Classroom', url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Female Youth Athlete Action', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Grassroots Community Pitch Day', url: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Trophy Celebration & Team Spirit', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Intense Team Huddle', url: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80' },
];

const createEmptyStory = (): NewsStory => ({
  id: `n-${Date.now()}`,
  title: '',
  category: 'Academy News',
  date: 'October 10, 2026',
  readTime: '3 min read',
  author: 'Academy Editorial',
  summary: '',
  content: [],
  image: PRESET_NEWS_PHOTOS[0].url,
  featured: false,
});

export const NewsManager: React.FC<{
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}> = ({ onNotify }) => {
  const [news, setNews] = useState<NewsStory[]>(() => AcademyDataManager.getNews());
  const [editingStory, setEditingStory] = useState<NewsStory | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newStory, setNewStory] = useState<NewsStory>(createEmptyStory);
  const [contentParagraphsText, setContentParagraphsText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const refreshNews = () => {
    setNews(AcademyDataManager.getNews());
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory) return;

    AcademyDataManager.updateNews(editingStory.id, editingStory);
    refreshNews();
    setEditingStory(null);
    onNotify({
      type: 'success',
      text: `Article "${editingStory.title}" updated. Persisted to Supabase & live on homepage!`,
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStory.title.trim()) {
      onNotify({ type: 'error', text: 'Please provide an article title.' });
      return;
    }

    const paragraphs = contentParagraphsText
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const created: NewsStory = {
      ...newStory,
      id: `n-${Date.now()}`,
      content: paragraphs.length > 0 ? paragraphs : [newStory.summary],
    };

    AcademyDataManager.addNews(created);
    refreshNews();
    setIsAddOpen(false);
    setNewStory(createEmptyStory());
    setContentParagraphsText('');
    onNotify({
      type: 'success',
      text: `New article "${created.title}" published. Persisted to Supabase & live on website!`,
    });
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteTarget({ id, title });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    AcademyDataManager.deleteNews(deleteTarget.id);
    refreshNews();
    onNotify({ type: 'success', text: `Article was removed from Supabase & live website.` });
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-amber-600" />
            <span>News & Stories Editorial ({news.length})</span>
          </h3>
          <p className="text-xs text-slate-500">
            Publish match reports, player spotlights, tactical insights, and campus announcements.
          </p>
        </div>

        <button
          onClick={() => {
            setNewStory(createEmptyStory());
            setContentParagraphsText('');
            setIsAddOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Article</span>
        </button>
      </div>

      {/* News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {news.map((story) => (
          <div
            key={story.id}
            className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-20 sm:w-28 h-20 sm:h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={story.image || PRESET_NEWS_PHOTOS[0].url}
                    alt={story.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PRESET_NEWS_PHOTOS[0].url;
                    }}
                  />
                  {story.featured && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[9px] uppercase font-mono shadow-xs">
                      Featured
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span className="font-bold text-amber-800 uppercase">{story.category}</span>
                    <span>·</span>
                    <span>{story.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                    {story.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{story.summary}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-500 text-[11px]">
                By {story.author} · {story.readTime}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEditingStory({ ...story })}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(story.id, story.title)}
                  className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                  title="Delete Article"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- EDIT ARTICLE MODAL ---------------- */}
      {editingStory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="text-base font-black uppercase text-slate-900">
                  Edit Article: {editingStory.title}
                </h3>
                <p className="text-xs text-slate-500">Update story headline, image, category, and content.</p>
              </div>
              <button onClick={() => setEditingStory(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Photo Selector */}
              <ImageSelector
                label="Article Photograph (Upload from Device or pick a Preset)"
                value={editingStory.image}
                onChange={(imgUrl) => setEditingStory({ ...editingStory, image: imgUrl })}
                presets={PRESET_NEWS_PHOTOS}
              />

              <div>
                <label className="block font-bold text-slate-700 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={editingStory.title}
                  onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingStory.category}
                    onChange={(e) => setEditingStory({ ...editingStory, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="Academy News">Academy News</option>
                    <option value="Match Report">Match Report</option>
                    <option value="Player Story">Player Story</option>
                    <option value="Coach Story">Coach Story</option>
                    <option value="Community Story">Community Story</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Publication Date</label>
                  <input
                    type="text"
                    value={editingStory.date}
                    onChange={(e) => setEditingStory({ ...editingStory, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Read Time</label>
                  <input
                    type="text"
                    value={editingStory.readTime}
                    onChange={(e) => setEditingStory({ ...editingStory, readTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={editingStory.author}
                    onChange={(e) => setEditingStory({ ...editingStory, author: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={!!editingStory.featured}
                      onChange={(e) => setEditingStory({ ...editingStory, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500"
                    />
                    <span>Highlight as Featured Hero Story</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Summary / Card Teaser</label>
                <textarea
                  rows={2}
                  value={editingStory.summary}
                  onChange={(e) => setEditingStory({ ...editingStory, summary: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Story Content (Separate paragraphs with double enter)</label>
                <textarea
                  rows={5}
                  value={
                    Array.isArray(editingStory.content)
                      ? editingStory.content.join('\n\n')
                      : editingStory.content
                  }
                  onChange={(e) =>
                    setEditingStory({
                      ...editingStory,
                      content: e.target.value.split('\n\n').map((p) => p.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-xl leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingStory(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase tracking-wider"
                >
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- ADD ARTICLE MODAL ---------------- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="text-base font-black uppercase text-slate-900">Publish New Article</h3>
                <p className="text-xs text-slate-500">Create an academy news article or player story.</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              {/* Photo Selector */}
              <ImageSelector
                label="Article Photograph (Upload from Device or pick a Preset)"
                value={newStory.image}
                onChange={(imgUrl) => setNewStory({ ...newStory, image: imgUrl })}
                presets={PRESET_NEWS_PHOTOS}
              />

              <div>
                <label className="block font-bold text-slate-700 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inside Gayeshpur: Tactical Classroom Immersion..."
                  value={newStory.title}
                  onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newStory.category}
                    onChange={(e) => setNewStory({ ...newStory, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="Academy News">Academy News</option>
                    <option value="Match Report">Match Report</option>
                    <option value="Player Story">Player Story</option>
                    <option value="Coach Story">Coach Story</option>
                    <option value="Community Story">Community Story</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Publication Date</label>
                  <input
                    type="text"
                    value={newStory.date}
                    onChange={(e) => setNewStory({ ...newStory, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Read Time</label>
                  <input
                    type="text"
                    value={newStory.readTime}
                    onChange={(e) => setNewStory({ ...newStory, readTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={newStory.author}
                    onChange={(e) => setNewStory({ ...newStory, author: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={!!newStory.featured}
                      onChange={(e) => setNewStory({ ...newStory, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500"
                    />
                    <span>Highlight as Featured Hero Story</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Summary / Card Teaser</label>
                <textarea
                  rows={2}
                  placeholder="A short punchy teaser that draws readers in..."
                  value={newStory.summary}
                  onChange={(e) => setNewStory({ ...newStory, summary: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Article Paragraphs (Double enter between paragraphs)</label>
                <textarea
                  rows={5}
                  placeholder="First paragraph of the story...&#10;&#10;Second paragraph..."
                  value={contentParagraphsText}
                  onChange={(e) => setContentParagraphsText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl leading-relaxed"
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
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Article Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Editorial Article"
        message="Are you sure you want to permanently delete this news story? It will be removed from the homepage News & Stories feed and updated in Supabase Cloud."
        itemName={deleteTarget?.title}
        confirmLabel="Delete Article"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
