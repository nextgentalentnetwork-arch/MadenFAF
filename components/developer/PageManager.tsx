'use client';

import React, { useState } from 'react';
import { PageItem, PageManagerService } from '@/lib/pageManager';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Archive,
  Lock,
  Globe,
  Users,
  Edit3,
  Trash2,
  ExternalLink,
  Shield,
  Eye,
  Sparkles,
  Layers,
  Save,
  X,
  AlertTriangle,
} from 'lucide-react';

interface PageManagerProps {
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}

export const PageManager: React.FC<PageManagerProps> = ({ onNotify }) => {
  const [pages, setPages] = useState<PageItem[]>(() => PageManagerService.getPages());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [accessFilter, setAccessFilter] = useState<'all' | 'public' | 'login_required' | 'role_restricted'>('all');

  // Modals state
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [isAddPageOpen, setIsAddPageOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<PageItem | null>(null);

  const [form, setForm] = useState<Omit<PageItem, 'id' | 'updatedAt'>>({
    title: '',
    slug: '',
    description: '',
    status: 'published',
    accessLevel: 'public',
    allowedRoles: ['player', 'parent', 'coach', 'admin'],
    navigationLocation: 'header',
    template: 'custom',
    isSystemPage: false,
    seoTitle: '',
    seoDescription: '',
    customContent: '',
  });

  const refreshPages = () => {
    setPages(PageManagerService.getPages());
  };

  const filteredPages = pages.filter((page) => {
    if (statusFilter !== 'all' && page.status !== statusFilter) return false;
    if (accessFilter !== 'all' && page.accessLevel !== accessFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        page.title.toLowerCase().includes(q) ||
        page.slug.toLowerCase().includes(q) ||
        page.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      onNotify({ type: 'error', text: 'Title and Slug are required.' });
      return;
    }

    // Clean slug
    let cleanSlug = form.slug.trim().toLowerCase();
    if (!cleanSlug.startsWith('/')) cleanSlug = `/${cleanSlug}`;

    // Prevent duplicate slug
    if (pages.some((p) => p.slug === cleanSlug)) {
      onNotify({ type: 'error', text: `Route "${cleanSlug}" is already taken by another page.` });
      return;
    }

    try {
      PageManagerService.createPage({
        ...form,
        slug: cleanSlug,
        seoTitle: form.seoTitle || `${form.title} — MADEN FAF`,
        seoDescription: form.seoDescription || form.description,
      });
      refreshPages();
      setIsAddPageOpen(false);
      onNotify({ type: 'success', text: `Page "${form.title}" created successfully at ${cleanSlug}!` });
    } catch (err: any) {
      onNotify({ type: 'error', text: err?.message || 'Failed to create page' });
    }
  };

  const handleUpdatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    let cleanSlug = editingPage.slug.trim().toLowerCase();
    if (!cleanSlug.startsWith('/')) cleanSlug = `/${cleanSlug}`;

    // Check duplicate slug if changed
    if (pages.some((p) => p.id !== editingPage.id && p.slug === cleanSlug)) {
      onNotify({ type: 'error', text: `Route "${cleanSlug}" is already taken by another page.` });
      return;
    }

    try {
      PageManagerService.updatePage(editingPage.id, {
        ...editingPage,
        slug: cleanSlug,
      });
      refreshPages();
      setEditingPage(null);
      onNotify({ type: 'success', text: `Page "${editingPage.title}" updated successfully!` });
    } catch (err: any) {
      onNotify({ type: 'error', text: err?.message || 'Failed to update page' });
    }
  };

  const handleDeletePage = (page: PageItem) => {
    if (page.isSystemPage) {
      onNotify({ type: 'error', text: 'Core system pages cannot be deleted to prevent broken routes.' });
      return;
    }
    setDeleteConfirm(page);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const res = PageManagerService.deletePage(deleteConfirm.id);
    if (res.success) {
      refreshPages();
      setDeleteConfirm(null);
      onNotify({ type: 'success', text: `Page "${deleteConfirm.title}" deleted.` });
    } else {
      onNotify({ type: 'error', text: res.error || 'Failed to delete page' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <span>Central Page Manager & Route Registry</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage all public and authenticated pages, configure URLs, publication status, access control, and SEO metadata.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setForm({
                title: '',
                slug: '',
                description: '',
                status: 'published',
                accessLevel: 'public',
                allowedRoles: ['player', 'parent', 'coach', 'admin'],
                navigationLocation: 'header',
                template: 'custom',
                isSystemPage: false,
                seoTitle: '',
                seoDescription: '',
                customContent: '',
              });
              setIsAddPageOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Page</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages by title, slug, or purpose..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700"
          >
            <option value="all">All Statuses ({pages.length})</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={accessFilter}
            onChange={(e) => setAccessFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700"
          >
            <option value="all">All Access Levels</option>
            <option value="public">Publicly Accessible</option>
            <option value="login_required">Login Required</option>
            <option value="role_restricted">Role Restricted</option>
          </select>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-mono uppercase text-slate-500">
                <th className="py-3.5 px-4 font-bold">Page Title & Slug</th>
                <th className="py-3.5 px-4 font-bold">Template Type</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">Access Control</th>
                <th className="py-3.5 px-4 font-bold">Nav Allocation</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No pages found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{page.title}</span>
                        {page.isSystemPage && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                            Core
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-amber-700">{page.slug}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] capitalize">
                        {page.template}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          page.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : page.status === 'draft'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {page.status === 'published' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {page.status === 'draft' && <Clock className="w-3 h-3 text-amber-600" />}
                        {page.status === 'archived' && <Archive className="w-3 h-3 text-slate-400" />}
                        <span>{page.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          page.accessLevel === 'public'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : page.accessLevel === 'login_required'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {page.accessLevel === 'public' && <Globe className="w-3 h-3" />}
                        {page.accessLevel === 'login_required' && <Lock className="w-3 h-3" />}
                        {page.accessLevel === 'role_restricted' && <Shield className="w-3 h-3" />}
                        <span className="capitalize">{page.accessLevel.replace('_', ' ')}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase">
                        {page.navigationLocation}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={page.slug}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View live page"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => setEditingPage({ ...page })}
                          title="Edit page metadata"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {!page.isSystemPage && (
                          <button
                            type="button"
                            onClick={() => handleDeletePage(page)}
                            title="Delete page"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Page */}
      {isAddPageOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-500" />
                <span>Create New Page</span>
              </h3>
              <button
                onClick={() => setIsAddPageOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePage} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Page Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = `/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
                      setForm({ ...form, title, slug: form.slug || slug });
                    }}
                    placeholder="e.g. Goalkeeper Clinic"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">URL Slug / Route *</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="/goalkeeper-clinic"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Page Description / Summary</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief summary of what this page offers..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Access Level</label>
                  <select
                    value={form.accessLevel}
                    onChange={(e) => setForm({ ...form, accessLevel: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold"
                  >
                    <option value="public">Public</option>
                    <option value="login_required">Login Required</option>
                    <option value="role_restricted">Role Restricted</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Template</label>
                  <select
                    value={form.template}
                    onChange={(e) => setForm({ ...form, template: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold"
                  >
                    <option value="custom">Blank Custom Page</option>
                    <option value="programs">Programs Template</option>
                    <option value="campuses">Campuses Template</option>
                    <option value="coaches">Coaches Template</option>
                    <option value="events">Events Template</option>
                    <option value="news">News Template</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Navigation Location Assignment</label>
                <select
                  value={form.navigationLocation}
                  onChange={(e) => setForm({ ...form, navigationLocation: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold"
                >
                  <option value="header">Desktop Header Navigation</option>
                  <option value="submenu">Dropdown Submenu Item</option>
                  <option value="footer">Footer Column</option>
                  <option value="both">Both Header & Footer</option>
                  <option value="none">Hidden / Standalone Route</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPageOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase tracking-wider"
                >
                  Create Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Page */}
      {editingPage && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-500" />
                <span>Edit Page: {editingPage.title}</span>
              </h3>
              <button
                onClick={() => setEditingPage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePage} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Page Title *</label>
                  <input
                    type="text"
                    required
                    value={editingPage.title}
                    onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">URL Slug / Route *</label>
                  <input
                    type="text"
                    required
                    value={editingPage.slug}
                    onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Page Description</label>
                <textarea
                  rows={2}
                  value={editingPage.description}
                  onChange={(e) => setEditingPage({ ...editingPage, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Status</label>
                  <select
                    value={editingPage.status}
                    onChange={(e) => setEditingPage({ ...editingPage, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Access Level</label>
                  <select
                    value={editingPage.accessLevel}
                    onChange={(e) => setEditingPage({ ...editingPage, accessLevel: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold"
                  >
                    <option value="public">Public</option>
                    <option value="login_required">Login Required</option>
                    <option value="role_restricted">Role Restricted</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Navigation Location</label>
                  <select
                    value={editingPage.navigationLocation}
                    onChange={(e) => setEditingPage({ ...editingPage, navigationLocation: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold"
                  >
                    <option value="header">Desktop Header</option>
                    <option value="submenu">Dropdown Submenu</option>
                    <option value="footer">Footer Column</option>
                    <option value="both">Both</option>
                    <option value="none">Hidden Route</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 uppercase">SEO & Metadata</h4>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">SEO Title Tag</label>
                  <input
                    type="text"
                    value={editingPage.seoTitle || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, seoTitle: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Meta Description</label>
                  <input
                    type="text"
                    value={editingPage.seoDescription || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, seoDescription: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900 uppercase">Delete Page?</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to delete <span className="font-bold text-slate-900">{deleteConfirm.title}</span> ({deleteConfirm.slug})?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider"
              >
                Delete Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
