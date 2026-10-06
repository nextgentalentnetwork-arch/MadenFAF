'use client';

import React, { useState } from 'react';
import { AcademyDataManager } from '@/lib/academyDataManager';
import { SponsorPartner, DEFAULT_SPONSORS } from '@/data/academyData';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
  Handshake,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Save,
  X,
  Upload,
  CheckCircle2,
  Globe,
  Tag,
  ArrowUpDown,
} from 'lucide-react';

interface SponsorsManagerProps {
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}

const PARTNER_TIERS = [
  'Title Partner',
  'Technical Partner',
  'Nutrition Partner',
  'Federation / Sanctioning',
  'Ground Partner',
  'Medical Partner',
  'Community Partner',
] as const;

const LOGO_PRESETS = [
  { key: 'nivia', name: 'Nivia Sports (Vector Crest)' },
  { key: 'leninnagar-sc', name: 'Leninnagar SC (Club Emblem)' },
  { key: 'fastandup', name: 'Fast&Up Active Nutrition' },
  { key: 'ifa-bengal', name: 'IFA Bengal (Federation Crest)' },
  { key: 'apex-physio', name: 'Apex Sports Physio' },
  { key: 'kalyani-sports', name: 'Kalyani Stadium Complex' },
  { key: 'custom', name: 'Custom Image URL / Device Upload' },
];

export const SponsorsManager: React.FC<SponsorsManagerProps> = ({ onNotify }) => {
  const [sponsors, setSponsors] = useState<SponsorPartner[]>(() =>
    AcademyDataManager.getSponsors()
  );
  const [editingSponsor, setEditingSponsor] = useState<SponsorPartner | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // New Sponsor Form
  const [newSponsor, setNewSponsor] = useState<SponsorPartner>({
    id: `sponsor-${Date.now()}`,
    name: '',
    category: 'Match Ball & Technical Gear',
    tier: 'Technical Partner',
    presetKey: 'custom',
    logoUrl: '',
    websiteUrl: 'https://',
    active: true,
    order: sponsors.length + 1,
  });

  const refreshSponsors = () => {
    setSponsors(AcademyDataManager.getSponsors());
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSponsor) return;
    AcademyDataManager.updateSponsor(editingSponsor.id, editingSponsor);
    refreshSponsors();
    setEditingSponsor(null);
    onNotify({
      type: 'success',
      text: `Sponsor partner "${editingSponsor.name}" updated. Persisted to Supabase and live on carousel!`,
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSponsor.name.trim()) {
      alert('Please enter sponsor name.');
      return;
    }
    const created: SponsorPartner = {
      ...newSponsor,
      id: `sponsor-${Date.now()}`,
    };
    AcademyDataManager.addSponsor(created);
    refreshSponsors();
    setIsAddOpen(false);
    setNewSponsor({
      id: `sponsor-${Date.now()}`,
      name: '',
      category: 'Match Ball & Technical Gear',
      tier: 'Technical Partner',
      presetKey: 'custom',
      logoUrl: '',
      websiteUrl: 'https://',
      active: true,
      order: sponsors.length + 2,
    });
    onNotify({
      type: 'success',
      text: `New sponsor partner "${created.name}" created and published!`,
    });
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    AcademyDataManager.deleteSponsor(deleteTarget.id);
    refreshSponsors();
    onNotify({ type: 'success', text: `Sponsor partner "${deleteTarget.name}" removed.` });
    setDeleteTarget(null);
  };

  const toggleActive = (sponsor: SponsorPartner) => {
    const updated = !sponsor.active;
    AcademyDataManager.updateSponsor(sponsor.id, { active: updated });
    refreshSponsors();
    onNotify({
      type: 'success',
      text: `Partner "${sponsor.name}" ${updated ? 'activated' : 'deactivated'}.`,
    });
  };

  // Logo file upload helper
  const handleLogoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        if (isEdit && editingSponsor) {
          setEditingSponsor({
            ...editingSponsor,
            logoUrl: event.target.result,
            presetKey: 'custom',
          });
        } else {
          setNewSponsor({
            ...newSponsor,
            logoUrl: event.target.result,
            presetKey: 'custom',
          });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">
              Sponsors & Brand Partners Management
            </h2>
            <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-full border border-amber-500/20">
              {sponsors.length} Affiliated Brands
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage official kit suppliers, technical gear partners, hydration brands, federations, and ground partners.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Brand Partner</span>
        </button>
      </div>

      {/* Sponsors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sponsors.map((partner) => (
          <div
            key={partner.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {partner.tier}
                </span>

                <button
                  onClick={() => toggleActive(partner)}
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full cursor-pointer transition-colors border ${
                    partner.active
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                  title="Toggle visibility in public carousel"
                >
                  {partner.active ? '● Active' : '○ Hidden'}
                </button>
              </div>

              <div className="h-14 flex items-center justify-center p-2 bg-slate-50 border border-slate-100 rounded-xl mb-3">
                {partner.logoUrl ? (
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="max-h-10 max-w-[160px] object-contain"
                  />
                ) : (
                  <div className="font-mono font-black text-sm uppercase text-slate-800 tracking-wider">
                    {partner.name}
                  </div>
                )}
              </div>

              <h3 className="text-base font-black uppercase text-slate-900 tracking-tight leading-snug">
                {partner.name}
              </h3>

              <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>{partner.category}</span>
              </div>

              {partner.websiteUrl && partner.websiteUrl !== '#' && (
                <div className="text-[11px] text-amber-700 mt-2 truncate flex items-center gap-1 font-mono">
                  <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                  <a
                    href={partner.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline truncate"
                  >
                    {partner.websiteUrl}
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => setEditingSponsor(partner)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(partner.id, partner.name)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete Partner"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Sponsor Modal */}
      {editingSponsor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-slate-900 tracking-tight">
                Edit Sponsor Partner
              </h3>
              <button onClick={() => setEditingSponsor(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Brand / Partner Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingSponsor.name}
                  onChange={(e) => setEditingSponsor({ ...editingSponsor, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Partnership Tier
                  </label>
                  <select
                    value={editingSponsor.tier}
                    onChange={(e) =>
                      setEditingSponsor({ ...editingSponsor, tier: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {PARTNER_TIERS.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingSponsor.order || 1}
                    onChange={(e) =>
                      setEditingSponsor({ ...editingSponsor, order: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Category Tagline
                </label>
                <input
                  type="text"
                  value={editingSponsor.category}
                  onChange={(e) =>
                    setEditingSponsor({ ...editingSponsor, category: e.target.value })
                  }
                  placeholder="e.g. Match Ball & Technical Gear"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={editingSponsor.websiteUrl}
                  onChange={(e) =>
                    setEditingSponsor({ ...editingSponsor, websiteUrl: e.target.value })
                  }
                  placeholder="https://brand.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              {/* Logo Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Logo Crest / Image
                </label>
                <div className="space-y-2">
                  <select
                    value={editingSponsor.presetKey || 'custom'}
                    onChange={(e) =>
                      setEditingSponsor({ ...editingSponsor, presetKey: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {LOGO_PRESETS.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Custom Logo URL (https://... or uploaded)"
                      value={editingSponsor.logoUrl || ''}
                      onChange={(e) =>
                        setEditingSponsor({
                          ...editingSponsor,
                          logoUrl: e.target.value,
                          presetKey: 'custom',
                        })
                      }
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                    <label className="px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold cursor-pointer flex items-center gap-1 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSponsor(null)}
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

      {/* Add Sponsor Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-slate-900 tracking-tight">
                Add New Sponsor & Partner
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Puma Football"
                  value={newSponsor.name}
                  onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Partnership Tier
                  </label>
                  <select
                    value={newSponsor.tier}
                    onChange={(e) =>
                      setNewSponsor({ ...newSponsor, tier: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {PARTNER_TIERS.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={newSponsor.order}
                    onChange={(e) =>
                      setNewSponsor({ ...newSponsor, order: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Category Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Match Footwear & Training Bibs"
                  value={newSponsor.category}
                  onChange={(e) => setNewSponsor({ ...newSponsor, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newSponsor.websiteUrl}
                  onChange={(e) => setNewSponsor({ ...newSponsor, websiteUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Logo Crest / Image
                </label>
                <div className="space-y-2">
                  <select
                    value={newSponsor.presetKey || 'custom'}
                    onChange={(e) =>
                      setNewSponsor({ ...newSponsor, presetKey: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {LOGO_PRESETS.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Custom Logo URL (https://... or uploaded)"
                      value={newSponsor.logoUrl || ''}
                      onChange={(e) =>
                        setNewSponsor({
                          ...newSponsor,
                          logoUrl: e.target.value,
                          presetKey: 'custom',
                        })
                      }
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                    <label className="px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold cursor-pointer flex items-center gap-1 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, false)}
                        className="hidden"
                      />
                    </label>
                  </div>
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
                  <span>Publish Partner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Sponsor Partner Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Sponsor & Brand Partner"
        message="Are you sure you want to remove this brand sponsor from the homepage carousel and official partner roster?"
        itemName={deleteTarget?.name}
        confirmLabel="Delete Partner"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
