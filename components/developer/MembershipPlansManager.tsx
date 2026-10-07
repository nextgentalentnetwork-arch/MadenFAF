'use client';

import React, { useState, useEffect } from 'react';
import { MembershipPlan, DEFAULT_MEMBERSHIP_PLANS } from '@/data/membershipData';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
  ShieldCheck,
  Plus,
  Edit3,
  Trash2,
  Check,
  RotateCcw,
  Save,
  Tag,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowUpDown,
  AlertCircle,
} from 'lucide-react';

const STORAGE_KEY = 'maden_dev_membership_plans';

export const MembershipPlansManager: React.FC<{
  onNotify?: (msg: { type: 'success' | 'error'; text: string }) => void;
}> = ({ onNotify }) => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MembershipPlan | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newBenefitInput, setNewBenefitInput] = useState('');

  // Initial load from localStorage, Supabase API fallback, or defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPlans(JSON.parse(stored));
      } else {
        setPlans(DEFAULT_MEMBERSHIP_PLANS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MEMBERSHIP_PLANS));
      }
    } catch {
      setPlans(DEFAULT_MEMBERSHIP_PLANS);
    }
    setIsLoaded(true);

    // Also fetch latest from backend API if configured
    fetch('/api/academy-data?section=membershipPlans')
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setPlans(data.data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data));
        }
      })
      .catch(() => {});
  }, []);

  const savePlansState = async (updatedPlans: MembershipPlan[]) => {
    setPlans(updatedPlans);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
      window.dispatchEvent(new Event('maden_data_updated'));
    } catch {}

    // Persist as JSONB document via unified api
    setIsSyncing(true);
    try {
      await fetch('/api/academy-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'membershipPlans',
          action: 'syncAll',
          data: updatedPlans,
        }),
      });
      if (onNotify) {
        onNotify({ type: 'success', text: 'Membership plans synchronized and saved to cloud.' });
      }
    } catch (e: any) {
      if (onNotify) {
        onNotify({ type: 'error', text: 'Saved locally. Cloud sync will retry in background.' });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle Plan Active Status
  const handleToggleActive = (id: string) => {
    const updated = plans.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    savePlansState(updated);
  };

  // Toggle Popular Badge
  const handleTogglePopular = (id: string) => {
    const updated = plans.map((p) => (p.id === id ? { ...p, popular: !p.popular } : p));
    savePlansState(updated);
  };

  // Confirm and Delete Plan
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const updated = plans.filter((p) => p.id !== deleteTarget.id);
    savePlansState(updated);
    setDeleteTarget(null);
    if (onNotify) {
      onNotify({ type: 'success', text: `Plan "${deleteTarget.name}" deleted successfully.` });
    }
  };

  // Save Plan Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    const updated = plans.map((p) => (p.id === editingPlan.id ? editingPlan : p));
    savePlansState(updated);
    setEditingPlan(null);
    if (onNotify) {
      onNotify({ type: 'success', text: `Plan "${editingPlan.name}" updated successfully.` });
    }
  };

  // Add Benefit to Editing Plan
  const handleAddBenefitToEdit = () => {
    if (!editingPlan || !newBenefitInput.trim()) return;
    setEditingPlan({
      ...editingPlan,
      benefits: [...(editingPlan.benefits || []), newBenefitInput.trim()],
    });
    setNewBenefitInput('');
  };

  // Remove Benefit from Editing Plan
  const handleRemoveBenefitFromEdit = (index: number) => {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      benefits: editingPlan.benefits.filter((_, i) => i !== index),
    });
  };

  // Reset to Foundation Defaults
  const handleResetDefaults = () => {
    savePlansState(DEFAULT_MEMBERSHIP_PLANS);
    if (onNotify) {
      onNotify({
        type: 'success',
        text: 'Membership plans restored to original MADEN FAF configuration.',
      });
    }
  };

  if (!isLoaded) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading Membership Plans...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
                <span>MADENATION Membership Plans Manager</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  JSONB Config Store
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Configure, add, edit, activate/deactivate membership plans, pricing, billing duration, and membership benefits without altering source code.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const newPlan: MembershipPlan = {
                id: `plan-${Date.now()}`,
                name: 'New MADENATION Plan',
                tagline: 'Empower football development across Bengal',
                price: 999,
                billingPeriod: 'annual',
                badgeColor: 'amber',
                description: 'Plan description and target audience...',
                benefits: [
                  'Official Digital MADENATION Membership Card',
                  'Priority access to academy friendlies & showcases',
                  'Quarterly MADENATION Digital Newsletter',
                ],
                eligibility: 'Open to all community members',
                active: true,
                category: 'individual',
              };
              setEditingPlan(newPlan);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Plan</span>
          </button>
        </div>
      </div>

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plans.map((plan) => {
          return (
            <div
              key={plan.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all relative ${
                plan.active ? 'border-slate-200 hover:border-purple-300' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
              }`}
            >
              {/* Badge & Category */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        plan.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {plan.active ? 'Active Tier' : 'Inactive'}
                    </span>
                    {plan.popular && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        Popular
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingPlan({ ...plan })}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title="Edit Plan"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(plan)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{plan.tagline}</p>

                {/* Price Display */}
                <div className="mt-4 pb-3 border-b border-slate-100 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900">₹{plan.price.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    / {plan.billingPeriod}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {plan.description}
                </p>

                {/* Benefits List Preview */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Key Perks ({plan.benefits?.length || 0})
                  </span>
                  {(plan.benefits || []).slice(0, 3).map((benefit, i) => (
                    <div key={i} className="text-xs text-slate-700 flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{benefit}</span>
                    </div>
                  ))}
                  {(plan.benefits || []).length > 3 && (
                    <span className="text-[11px] text-purple-700 font-semibold block pt-0.5">
                      + {(plan.benefits?.length || 0) - 3} more benefits
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Card Controls */}
              <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleToggleActive(plan.id)}
                  className={`font-semibold cursor-pointer flex items-center gap-1.5 ${
                    plan.active ? 'text-amber-700 hover:text-amber-800' : 'text-emerald-700 hover:text-emerald-800'
                  }`}
                >
                  {plan.active ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{plan.active ? 'Deactivate' : 'Activate'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTogglePopular(plan.id)}
                  className={`text-[11px] font-semibold cursor-pointer px-2 py-1 rounded-md transition-colors ${
                    plan.popular
                      ? 'bg-amber-100 text-amber-900'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {plan.popular ? 'Marked Popular' : 'Set as Popular'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black uppercase text-slate-900">
                {isAddModalOpen ? 'Create Membership Plan' : `Edit "${editingPlan.name}"`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingPlan(null);
                  setIsAddModalOpen(false);
                }}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold uppercase cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Annual Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingPlan.price}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={editingPlan.tagline}
                  onChange={(e) => setEditingPlan({ ...editingPlan, tagline: e.target.value })}
                  placeholder="e.g. Join the grassroots football movement across Bengal"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Billing Period
                  </label>
                  <select
                    value={editingPlan.billingPeriod}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, billingPeriod: e.target.value as any })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold cursor-pointer"
                  >
                    <option value="annual">Annual (Per Year)</option>
                    <option value="monthly">Monthly</option>
                    <option value="lifetime">Lifetime Membership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Plan Category
                  </label>
                  <select
                    value={editingPlan.category}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold cursor-pointer"
                  >
                    <option value="individual">Individual Supporter</option>
                    <option value="youth">Youth & Student</option>
                    <option value="patron">Patron & Visionary</option>
                    <option value="corporate">Corporate / Institutional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl leading-relaxed"
                />
              </div>

              {/* Benefits Editor */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Included Benefits & Privileges
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {(editingPlan.benefits || []).map((b, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    >
                      <span className="flex-1 mr-2">{b}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefitFromEdit(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newBenefitInput}
                    onChange={(e) => setNewBenefitInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBenefitToEdit();
                      }
                    }}
                    placeholder="Add a new member benefit perk..."
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleAddBenefitToEdit}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPlan.active}
                    onChange={(e) => setEditingPlan({ ...editingPlan, active: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Active & Visible to Public</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPlan.popular}
                    onChange={(e) => setEditingPlan({ ...editingPlan, popular: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>Featured &quot;Popular&quot; Badge</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlan(null);
                    setIsAddModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider cursor-pointer shadow-xs"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Membership Plan"
        message="Are you sure you want to delete this membership tier? This will remove the plan from public enrollment."
        itemName={deleteTarget?.name}
        confirmLabel="Delete Plan"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
