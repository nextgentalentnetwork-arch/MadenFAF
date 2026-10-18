'use client';

import React, { useState } from 'react';
import { NavCmsItem, NavigationCmsService, DEFAULT_NAV_ITEMS } from '@/lib/navigationCms';
import { PageItem, PageManagerService } from '@/lib/pageManager';
import {
  Menu,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit3,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layers,
  Globe,
  Lock,
  Smartphone,
  Monitor,
  Tablet,
  Check,
  Save,
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  X,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface MenuManagerProps {
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}

export const MenuManager: React.FC<MenuManagerProps> = ({ onNotify }) => {
  const [navItems, setNavItems] = useState<NavCmsItem[]>(() =>
    NavigationCmsService.getNavItems()
  );
  const [pages] = useState<PageItem[]>(() => PageManagerService.getPages());
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [locationFilter, setLocationFilter] = useState<'all' | 'header' | 'footer'>('all');

  // Modals state
  const [editingItem, setEditingItem] = useState<NavCmsItem | null>(null);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<NavCmsItem | null>(null);

  const [form, setForm] = useState<Omit<NavCmsItem, 'id' | 'createdAt' | 'updatedAt'>>({
    label: '',
    href: '',
    itemType: 'page',
    parentId: null,
    sortOrder: 1,
    location: 'both',
    pageId: '',
    badge: '',
    desc: '',
    isEnabled: true,
    visibility: 'public',
    permittedRoles: ['all'],
    openInNewTab: false,
  });

  const refreshItems = () => {
    setNavItems(NavigationCmsService.getNavItems());
  };

  // Top-level parent items
  const parentItems = navItems
    .filter((item) => item.parentId === null)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) {
      onNotify({ type: 'error', text: 'Menu label is required.' });
      return;
    }

    let finalHref = form.href.trim();
    if (form.itemType === 'page' && form.pageId) {
      const selectedPage = pages.find((p) => p.id === form.pageId);
      if (selectedPage) finalHref = selectedPage.slug;
    } else if (form.itemType === 'dropdown_header') {
      finalHref = '#';
    }

    try {
      NavigationCmsService.addItem({
        ...form,
        href: finalHref || '#',
      });
      refreshItems();
      setIsAddItemOpen(false);
      onNotify({ type: 'success', text: `Menu item "${form.label}" created successfully!` });
    } catch (err: any) {
      onNotify({ type: 'error', text: err?.message || 'Failed to create menu item' });
    }
  };

  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    let finalHref = editingItem.href.trim();
    if (editingItem.itemType === 'page' && editingItem.pageId) {
      const selectedPage = pages.find((p) => p.id === editingItem.pageId);
      if (selectedPage) finalHref = selectedPage.slug;
    } else if (editingItem.itemType === 'dropdown_header') {
      finalHref = '#';
    }

    try {
      NavigationCmsService.updateItem(editingItem.id, {
        ...editingItem,
        href: finalHref || '#',
      });
      refreshItems();
      setEditingItem(null);
      onNotify({ type: 'success', text: `Menu item "${editingItem.label}" updated successfully!` });
    } catch (err: any) {
      onNotify({ type: 'error', text: err?.message || 'Failed to update menu item' });
    }
  };

  const handleDuplicateItem = (item: NavCmsItem) => {
    try {
      NavigationCmsService.addItem({
        ...item,
        label: `${item.label} (Copy)`,
        sortOrder: item.sortOrder + 1,
      });
      refreshItems();
      onNotify({ type: 'success', text: `Duplicated "${item.label}".` });
    } catch (err: any) {
      onNotify({ type: 'error', text: err?.message || 'Failed to duplicate' });
    }
  };

  const handleToggleEnabled = (item: NavCmsItem) => {
    NavigationCmsService.updateItem(item.id, { isEnabled: !item.isEnabled });
    refreshItems();
    onNotify({
      type: 'success',
      text: `Menu item "${item.label}" ${!item.isEnabled ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleMove = (id: string, dir: 'up' | 'down') => {
    NavigationCmsService.reorderItem(id, dir);
    refreshItems();
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    NavigationCmsService.deleteItem(deleteConfirm.id);
    refreshItems();
    setDeleteConfirm(null);
    onNotify({ type: 'success', text: `Deleted "${deleteConfirm.label}".` });
  };

  const handleResetDefaults = () => {
    if (confirm('Reset entire navigation hierarchy to official academy defaults?')) {
      NavigationCmsService.resetToDefault();
      refreshItems();
      onNotify({ type: 'success', text: 'Navigation hierarchy restored to default presets.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Menu className="w-5 h-5 text-amber-500" />
            <span>Dynamic Menu Management System</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure header navigation, mobile drawer items, and footer menus. Assign pages, nest submenus, set visibility rules, and reorder.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Restore default navigation structure"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={() => {
              setForm({
                label: '',
                href: '',
                itemType: 'page',
                parentId: null,
                sortOrder: parentItems.length + 1,
                location: 'both',
                pageId: pages[0]?.id || '',
                badge: '',
                desc: '',
                isEnabled: true,
                visibility: 'public',
                permittedRoles: ['all'],
                openInNewTab: false,
              });
              setIsAddItemOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Device Preview Simulator Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Interactive Navigation Simulator</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setDevicePreview('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              devicePreview === 'desktop' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setDevicePreview('tablet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              devicePreview === 'tablet' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => setDevicePreview('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              devicePreview === 'mobile' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Drawer</span>
          </button>
        </div>
      </div>

      {/* Simulator Frame */}
      <div className="bg-slate-100 p-4 rounded-3xl border border-slate-200 flex justify-center">
        <div
          className={`bg-white rounded-2xl border border-slate-300 shadow-md p-4 transition-all duration-300 ${
            devicePreview === 'desktop'
              ? 'w-full'
              : devicePreview === 'tablet'
              ? 'w-[720px]'
              : 'w-[360px]'
          }`}
        >
          <div className="text-[11px] font-mono text-slate-400 uppercase border-b border-slate-100 pb-2 mb-3 flex items-center justify-between">
            <span>Simulated Navigation Preview ({devicePreview})</span>
            <span className="text-amber-600 font-bold">Public Header Bar</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {parentItems
              .filter((i) => i.isEnabled)
              .map((parent) => {
                const subItems = navItems.filter((i) => i.parentId === parent.id && i.isEnabled);
                return (
                  <div key={parent.id} className="relative group">
                    <div className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                      <span>{parent.label}</span>
                      {parent.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {parent.badge}
                        </span>
                      )}
                      {subItems.length > 0 && <ChevronDown className="w-3 h-3 text-slate-400" />}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Menu Tree / Item Hierarchy List */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>Navigation Hierarchy & Submenus</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {parentItems.length} Main Items • {navItems.length - parentItems.length} Submenu Links
          </span>
        </div>

        <div className="space-y-3">
          {parentItems.map((parent, pIdx) => {
            const children = navItems
              .filter((i) => i.parentId === parent.id)
              .sort((a, b) => a.sortOrder - b.sortOrder);

            return (
              <div
                key={parent.id}
                className="rounded-2xl border border-slate-200/90 overflow-hidden bg-slate-50/50 space-y-2 p-3 sm:p-4"
              >
                {/* Main Level Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {pIdx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 uppercase">{parent.label}</span>
                        {parent.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            {parent.badge}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                          {parent.location}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-amber-700 flex items-center gap-2 mt-0.5">
                        <span>{parent.href}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 capitalize">{parent.visibility}</span>
                        {parent.openInNewTab && (
                          <span className="text-slate-400 text-[10px]">(opens in new tab)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleMove(parent.id, 'up')}
                      disabled={pIdx === 0}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(parent.id, 'down')}
                      disabled={pIdx === parentItems.length - 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleEnabled(parent)}
                      className={`p-1.5 rounded-lg border cursor-pointer ${
                        parent.isEnabled
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                      title={parent.isEnabled ? 'Active in navigation' : 'Hidden from navigation'}
                    >
                      {parent.isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateItem(parent)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                      title="Duplicate item"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...parent })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 cursor-pointer"
                      title="Edit menu item"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(parent)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Delete menu item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Submenu Children Items */}
                {children.length > 0 && (
                  <div className="pl-6 sm:pl-10 space-y-2 border-l-2 border-amber-300 ml-4">
                    {children.map((sub, sIdx) => (
                      <div
                        key={sub.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{sub.label}</span>
                            {sub.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-100 text-amber-800 font-bold">
                                {sub.badge}
                              </span>
                            )}
                          </div>
                          {sub.desc && (
                            <div className="text-[11px] text-slate-500">{sub.desc}</div>
                          )}
                          <div className="text-[10px] font-mono text-amber-700">{sub.href}</div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => handleMove(sub.id, 'up')}
                            disabled={sIdx === 0}
                            className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(sub.id, 'down')}
                            disabled={sIdx === children.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleEnabled(sub)}
                            className={`p-1 rounded border cursor-pointer ${
                              sub.isEnabled
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-400 border-slate-200'
                            }`}
                          >
                            {sub.isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingItem({ ...sub })}
                            className="p-1 rounded text-slate-400 hover:text-amber-700 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(sub)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Sublink Button */}
                <div className="pl-6 sm:pl-10">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        label: '',
                        href: '',
                        itemType: 'page',
                        parentId: parent.id,
                        sortOrder: children.length + 1,
                        location: 'header',
                        pageId: pages[0]?.id || '',
                        badge: '',
                        desc: '',
                        isEnabled: true,
                        visibility: 'public',
                        permittedRoles: ['all'],
                        openInNewTab: false,
                      });
                      setIsAddItemOpen(true);
                    }}
                    className="py-1.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-amber-500 hover:bg-amber-50 text-slate-600 hover:text-amber-800 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Submenu Link under {parent.label}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Add or Edit Menu Item */}
      {(isAddItemOpen || editingItem) && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Menu className="w-4 h-4 text-amber-500" />
                <span>{editingItem ? `Edit Menu Item: ${editingItem.label}` : 'Add New Menu Item'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddItemOpen(false);
                  setEditingItem(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Menu Label *</label>
                  <input
                    type="text"
                    required
                    value={editingItem ? editingItem.label : form.label}
                    onChange={(e) =>
                      editingItem
                        ? setEditingItem({ ...editingItem, label: e.target.value })
                        : setForm({ ...form, label: e.target.value })
                    }
                    placeholder="e.g. PROGRAMS"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Item Type</label>
                  <select
                    value={editingItem ? editingItem.itemType : form.itemType}
                    onChange={(e) => {
                      const type = e.target.value as any;
                      if (editingItem) setEditingItem({ ...editingItem, itemType: type });
                      else setForm({ ...form, itemType: type });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold"
                  >
                    <option value="page">Internal Dedicated Page</option>
                    <option value="external">Approved External URL</option>
                    <option value="dropdown_header">Non-clickable Dropdown Heading</option>
                  </select>
                </div>
              </div>

              {/* Destination URL or Page Selector */}
              {(editingItem ? editingItem.itemType : form.itemType) === 'page' ? (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Assign to Page</label>
                  <select
                    value={editingItem ? editingItem.pageId || '' : form.pageId || ''}
                    onChange={(e) => {
                      const pageId = e.target.value;
                      const selected = pages.find((p) => p.id === pageId);
                      if (editingItem) {
                        setEditingItem({
                          ...editingItem,
                          pageId,
                          href: selected ? selected.slug : editingItem.href,
                        });
                      } else {
                        setForm({
                          ...form,
                          pageId,
                          href: selected ? selected.slug : form.href,
                        });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold"
                  >
                    <option value="">-- Select an Existing Page --</option>
                    {pages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.slug})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Target URL / External Link *</label>
                  <input
                    type="text"
                    required={(editingItem ? editingItem.itemType : form.itemType) === 'external'}
                    value={editingItem ? editingItem.href : form.href}
                    onChange={(e) =>
                      editingItem
                        ? setEditingItem({ ...editingItem, href: e.target.value })
                        : setForm({ ...form, href: e.target.value })
                    }
                    placeholder="https://example.com/external-portal"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono"
                  />
                </div>
              )}

              {/* Parent Item Selector (for submenus) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Parent Item (Nest under)</label>
                  <select
                    value={editingItem ? editingItem.parentId || '' : form.parentId || ''}
                    onChange={(e) => {
                      const val = e.target.value || null;
                      if (editingItem) setEditingItem({ ...editingItem, parentId: val });
                      else setForm({ ...form, parentId: val });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold"
                  >
                    <option value="">-- Top Level Main Item --</option>
                    {parentItems
                      .filter((p) => !editingItem || p.id !== editingItem.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Location Display</label>
                  <select
                    value={editingItem ? editingItem.location : form.location}
                    onChange={(e) => {
                      const loc = e.target.value as any;
                      if (editingItem) setEditingItem({ ...editingItem, location: loc });
                      else setForm({ ...form, location: loc });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold"
                  >
                    <option value="both">Both Header & Footer</option>
                    <option value="header">Header & Mobile Drawer</option>
                    <option value="footer">Footer Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Badge Label (Optional)</label>
                  <input
                    type="text"
                    value={editingItem ? editingItem.badge || '' : form.badge || ''}
                    onChange={(e) =>
                      editingItem
                        ? setEditingItem({ ...editingItem, badge: e.target.value })
                        : setForm({ ...form, badge: e.target.value })
                    }
                    placeholder="e.g. POPULAR, NEW, AID"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Visibility Rule</label>
                  <select
                    value={editingItem ? editingItem.visibility : form.visibility}
                    onChange={(e) => {
                      const vis = e.target.value as any;
                      if (editingItem) setEditingItem({ ...editingItem, visibility: vis });
                      else setForm({ ...form, visibility: vis });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold"
                  >
                    <option value="public">Public (Everyone)</option>
                    <option value="authenticated_only">Authenticated Users Only</option>
                    <option value="guest_only">Unauthenticated Visitors Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Subtext / Card Description (Optional)</label>
                <input
                  type="text"
                  value={editingItem ? editingItem.desc || '' : form.desc || ''}
                  onChange={(e) =>
                    editingItem
                      ? setEditingItem({ ...editingItem, desc: e.target.value })
                      : setForm({ ...form, desc: e.target.value })
                  }
                  placeholder="e.g. Complete syllabus and divisions"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="openInNewTabCheckbox"
                  checked={editingItem ? editingItem.openInNewTab : form.openInNewTab}
                  onChange={(e) => {
                    const chk = e.target.checked;
                    if (editingItem) setEditingItem({ ...editingItem, openInNewTab: chk });
                    else setForm({ ...form, openInNewTab: chk });
                  }}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="openInNewTabCheckbox" className="text-slate-700 font-medium cursor-pointer">
                  Open link in a new browser tab
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddItemOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingItem ? 'Save Changes' : 'Create Item'}</span>
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
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900 uppercase">Delete Menu Item?</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to delete <span className="font-bold text-slate-900">{deleteConfirm.label}</span>? Any nested submenu links will also be detached.
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
