'use client';

import React, { useState } from 'react';
import { AcademyDataManager } from '@/lib/academyDataManager';
import { ScholarshipTier } from '@/data/academyData';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
  Award,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Save,
  X,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface ScholarshipsManagerProps {
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}

export const ScholarshipsManager: React.FC<ScholarshipsManagerProps> = ({ onNotify }) => {
  const [scholarships, setScholarships] = useState<ScholarshipTier[]>(() =>
    AcademyDataManager.getScholarships()
  );
  const [editingTier, setEditingTier] = useState<ScholarshipTier | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Tier Form
  const [newTier, setNewTier] = useState<ScholarshipTier>({
    id: `tier-${Date.now()}`,
    tier: '',
    coverage: '100% Full Coaching & Kit Subsidy',
    description: '',
    benefits: ['Full annual tuition grant', 'Official academy match kit & travel pack'],
    quota: '10 Dedicated Grants per Year',
    status: 'active',
  });

  const [newBenefitInput, setNewBenefitInput] = useState('');
  const [editBenefitInput, setEditBenefitInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const refreshTiers = () => {
    setScholarships(AcademyDataManager.getScholarships());
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier) return;
    AcademyDataManager.updateScholarship(editingTier.id, editingTier);
    refreshTiers();
    setEditingTier(null);
    onNotify({
      type: 'success',
      text: `Scholarship tier "${editingTier.tier}" updated. Persisted to Supabase & live on website!`,
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTier.tier.trim()) {
      alert('Please enter a scholarship tier name.');
      return;
    }
    const createdTier: ScholarshipTier = {
      ...newTier,
      id: `tier-${Date.now()}`,
    };
    AcademyDataManager.addScholarship(createdTier);
    refreshTiers();
    setIsAddOpen(false);
    setNewTier({
      id: `tier-${Date.now()}`,
      tier: '',
      coverage: '100% Tuition & Kit Grant',
      description: '',
      benefits: ['Full annual tuition grant', 'Official academy match kit & travel pack'],
      quota: '10 Dedicated Grants per Year',
      status: 'active',
    });
    onNotify({
      type: 'success',
      text: `New scholarship grant "${createdTier.tier}" created and published!`,
    });
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    AcademyDataManager.deleteScholarship(deleteTarget.id);
    refreshTiers();
    onNotify({ type: 'success', text: `Scholarship "${deleteTarget.name}" deleted.` });
    setDeleteTarget(null);
  };

  const toggleStatus = (tier: ScholarshipTier) => {
    const updatedStatus = tier.status === 'active' ? 'closed' : 'active';
    AcademyDataManager.updateScholarship(tier.id, { status: updatedStatus });
    refreshTiers();
    onNotify({
      type: 'success',
      text: `Scholarship "${tier.tier}" intake status switched to ${updatedStatus.toUpperCase()}.`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">
              Scholarship Programs Management
            </h2>
            <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-full border border-amber-500/20">
              {scholarships.length} Active Tiers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure merit scholarships, fee subsidies, inclusivity grants, quota limits, and coverage inclusions.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Scholarship Tier</span>
        </button>
      </div>

      {/* Scholarship Tiers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scholarships.map((tier) => (
          <div
            key={tier.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all relative group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {tier.quota}
                </span>

                <button
                  onClick={() => toggleStatus(tier)}
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full cursor-pointer transition-colors border ${
                    tier.status === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                  }`}
                  title="Click to toggle intake active/closed"
                >
                  {tier.status === 'active' ? '● Intake Active' : '○ Closed'}
                </button>
              </div>

              <div className="text-xs font-mono font-bold text-amber-700 uppercase">
                {tier.coverage}
              </div>

              <h3 className="text-base font-black uppercase text-slate-900 tracking-tight leading-snug mt-1 mb-2">
                {tier.tier}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                {tier.description}
              </p>

              {/* Benefits Checklist */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Inclusions ({tier.benefits.length}):
                </span>
                {tier.benefits.map((b, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span className="leading-tight">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => setEditingTier(tier)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Edit Tier</span>
              </button>
              <button
                onClick={() => handleDelete(tier.id, tier.tier)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete Tier"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Tier Modal */}
      {editingTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-slate-900 tracking-tight">
                Edit Scholarship Tier
              </h3>
              <button
                onClick={() => setEditingTier(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Tier Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingTier.tier}
                  onChange={(e) => setEditingTier({ ...editingTier, tier: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Coverage Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTier.coverage}
                    onChange={(e) => setEditingTier({ ...editingTier, coverage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-amber-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Quota Slots *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTier.quota}
                    onChange={(e) => setEditingTier({ ...editingTier, quota: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={editingTier.status}
                  onChange={(e) => setEditingTier({ ...editingTier, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="active">Active Intake</option>
                  <option value="closed">Closed / Quota Filled</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Program Description
                </label>
                <textarea
                  rows={3}
                  value={editingTier.description}
                  onChange={(e) => setEditingTier({ ...editingTier, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Inclusions / Benefits List */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Inclusions & Benefits Checklist
                </label>
                <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto">
                  {editingTier.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <span className="truncate">{b}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingTier({
                            ...editingTier,
                            benefits: editingTier.benefits.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editBenefitInput}
                    onChange={(e) => setEditBenefitInput(e.target.value)}
                    placeholder="Add new inclusion (e.g., Free state cup tournament registration)..."
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!editBenefitInput.trim()) return;
                      setEditingTier({
                        ...editingTier,
                        benefits: [...editingTier.benefits, editBenefitInput.trim()],
                      });
                      setEditBenefitInput('');
                    }}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTier(null)}
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

      {/* Add Tier Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-slate-900 tracking-tight">
                Create New Scholarship Grant
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Tier Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Under-14 District Talent Grant"
                  value={newTier.tier}
                  onChange={(e) => setNewTier({ ...newTier, tier: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Coverage Headline *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 100% Tuition & Kit Grant"
                    value={newTier.coverage}
                    onChange={(e) => setNewTier({ ...newTier, coverage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-amber-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Quota Limit *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 20 Slots per Season"
                    value={newTier.quota}
                    onChange={(e) => setNewTier({ ...newTier, quota: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newTier.description}
                  onChange={(e) => setNewTier({ ...newTier, description: e.target.value })}
                  placeholder="Detailed criteria, eligibility, and assessment character..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              {/* Benefits Checklist */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Inclusions Checklist
                </label>
                <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto">
                  {newTier.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <span className="truncate">{b}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setNewTier({
                            ...newTier,
                            benefits: newTier.benefits.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBenefitInput}
                    onChange={(e) => setNewBenefitInput(e.target.value)}
                    placeholder="Add inclusion item..."
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newBenefitInput.trim()) return;
                      setNewTier({
                        ...newTier,
                        benefits: [...newTier.benefits, newBenefitInput.trim()],
                      });
                      setNewBenefitInput('');
                    }}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
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
                  <span>Publish Scholarship</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Scholarship Tier Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Scholarship Grant Tier"
        message="Are you sure you want to delete this scholarship tier? It will be removed from the Scholarship Programs section on the live website and synced to Supabase Cloud."
        itemName={deleteTarget?.name}
        confirmLabel="Delete Scholarship"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
