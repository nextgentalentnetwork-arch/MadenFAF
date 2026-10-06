'use client';

import React, { useState } from 'react';
import { AcademyDataManager } from '@/lib/academyDataManager';
import { DigitalPortalConfig, DEFAULT_PORTAL_CONFIG } from '@/data/academyData';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
  Lock,
  Key,
  Megaphone,
  User,
  Users,
  Shield,
  Award,
  Save,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  X,
  Upload,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface DigitalPortalAccessManagerProps {
  onNotify: (msg: { type: 'success' | 'error'; text: string }) => void;
}

export const DigitalPortalAccessManager: React.FC<DigitalPortalAccessManagerProps> = ({
  onNotify,
}) => {
  const [config, setConfig] = useState<DigitalPortalConfig>(() =>
    AcademyDataManager.getPortalConfig()
  );

  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'student' | 'banner'; id?: string; name: string } | null>(null);

  const [newStudent, setNewStudent] = useState({
    id: `student-${Date.now()}`,
    name: '',
    role: '#10 Attacking Midfielder (U15)',
    campus: 'Gayeshpur Campus',
    avatar: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=200&q=80',
    attendance: '95% (Last 90 days)',
    rating: '88% Score',
    analysisCount: '4 videos ready for review',
  });

  const handleSaveConfig = (partial: Partial<DigitalPortalConfig>) => {
    const updated = { ...config, ...partial };
    setConfig(updated);
    AcademyDataManager.savePortalConfig(updated);
    onNotify({
      type: 'success',
      text: 'Digital Portal Access Configuration saved to Supabase and live on portal modal!',
    });
  };

  const handleSaveStudentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    const updatedStudents = (config.demoStudents || []).map((s) =>
      s.id === editingStudent.id ? editingStudent : s
    );
    handleSaveConfig({ demoStudents: updatedStudents });
    setEditingStudent(null);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name.trim()) {
      alert('Please enter student name.');
      return;
    }
    const created = { ...newStudent, id: `student-${Date.now()}` };
    const updatedStudents = [created, ...(config.demoStudents || [])];
    handleSaveConfig({ demoStudents: updatedStudents });
    setIsAddStudentOpen(false);
    setNewStudent({
      id: `student-${Date.now()}`,
      name: '',
      role: '#10 Attacking Midfielder (U15)',
      campus: 'Gayeshpur Campus',
      avatar: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=200&q=80',
      attendance: '95% (Last 90 days)',
      rating: '88% Score',
      analysisCount: '4 videos ready for review',
    });
  };

  const handleDeleteStudent = (id: string, name: string) => {
    setDeleteTarget({ type: 'student', id, name });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'student' && deleteTarget.id) {
      const updatedStudents = (config.demoStudents || []).filter((s) => s.id !== deleteTarget.id);
      handleSaveConfig({ demoStudents: updatedStudents });
      onNotify({ type: 'success', text: `Student profile "${deleteTarget.name}" removed from portal roster.` });
    } else if (deleteTarget.type === 'banner') {
      setConfig({ ...config, announcementTitle: '', announcementMessage: '' });
      handleSaveConfig({ announcementTitle: '', announcementMessage: '' });
      onNotify({ type: 'success', text: 'Announcement banner cleared.' });
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">
              Access to Digital Portal Configuration
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage portal protection modes, PIN credentials, banner announcements, role permissions, and student profiles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Mode: {config.portalMode.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Security Mode & Announcements */}
        <div className="lg:col-span-6 space-y-4">
          {/* Access Mode Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-900 tracking-wider">
              <Key className="w-4 h-4 text-amber-600" />
              <span>Portal Access Mode & PIN Protection</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSaveConfig({ portalMode: 'preview' })}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  config.portalMode === 'preview'
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold uppercase">Open Preview</div>
                <div className="text-[10px] mt-0.5 opacity-80">No PIN prompt</div>
              </button>

              <button
                type="button"
                onClick={() => handleSaveConfig({ portalMode: 'pin_protected' })}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  config.portalMode === 'pin_protected'
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold uppercase">PIN Protected</div>
                <div className="text-[10px] mt-0.5 opacity-80">Requires Code</div>
              </button>

              <button
                type="button"
                onClick={() => handleSaveConfig({ portalMode: 'invite_only' })}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  config.portalMode === 'invite_only'
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold uppercase">Invite Only</div>
                <div className="text-[10px] mt-0.5 opacity-80">Enrolled Only</div>
              </button>
            </div>

            {/* Master Access PIN input */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                Master Access PIN Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.accessCode || 'MADEN2026'}
                  onChange={(e) => setConfig({ ...config, accessCode: e.target.value.toUpperCase() })}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-slate-900 tracking-widest uppercase focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleSaveConfig({ accessCode: config.accessCode })}
                  className="px-4 py-2 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Save PIN
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Share this PIN with academy parents and players for instant access in PIN-protected mode.
              </p>
            </div>
          </div>

          {/* Announcement Banner Config */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-900 tracking-wider">
              <Megaphone className="w-4 h-4 text-amber-600" />
              <span>Portal Announcement Banner</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Banner Headline
                </label>
                <input
                  type="text"
                  value={config.announcementTitle || ''}
                  onChange={(e) => setConfig({ ...config, announcementTitle: e.target.value })}
                  placeholder="e.g. Digital Academy Portal v3.2 Active"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Announcement Message
                </label>
                <textarea
                  rows={2}
                  value={config.announcementMessage || ''}
                  onChange={(e) => setConfig({ ...config, announcementMessage: e.target.value })}
                  placeholder="e.g. Welcome to MADEN FAF multi-role cloud portal. Explore live player analytics..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleSaveConfig({
                      announcementTitle: config.announcementTitle,
                      announcementMessage: config.announcementMessage,
                    })
                  }
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Banner Notice</span>
                </button>
                {(config.announcementTitle || config.announcementMessage) && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteTarget({ type: 'banner', name: 'Digital Portal Announcement Banner' });
                    }}
                    className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Delete / Clear Banner Notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Role Permissions & Student Roster */}
        <div className="lg:col-span-6 space-y-4">
          {/* Role Permissions Toggles */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-900 tracking-wider">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Active Role Tabs in Portal</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={config.playerPortalEnabled !== false}
                  onChange={(e) => handleSaveConfig({ playerPortalEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-bold text-slate-800">Player Portal</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={config.parentPortalEnabled !== false}
                  onChange={(e) => handleSaveConfig({ parentPortalEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-bold text-slate-800">Parent Portal</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={config.coachPortalEnabled !== false}
                  onChange={(e) => handleSaveConfig({ coachPortalEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-bold text-slate-800">Coach Planner</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={config.adminPortalEnabled !== false}
                  onChange={(e) => handleSaveConfig({ adminPortalEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-bold text-slate-800">Admin Operations</span>
              </label>
            </div>
          </div>

          {/* Demo Students & Enrolled Profiles Roster */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-900 tracking-wider">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Portal Enrolled Student Roster</span>
              </div>
              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-[11px] font-bold uppercase flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Student</span>
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(config.demoStudents || []).map((student) => (
                <div
                  key={student.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-9 h-9 rounded-full object-cover border border-amber-300 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-black text-slate-900 truncate">{student.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {student.role} · {student.campus}
                      </div>
                      <div className="text-[9px] font-mono font-bold text-amber-700">
                        {student.attendance} · {student.rating}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingStudent(student)}
                      className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id, student.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-slate-900 tracking-tight">
                Edit Portal Student Profile
              </h3>
              <button onClick={() => setEditingStudent(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentEdit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Squad Role & Jersey
                </label>
                <input
                  type="text"
                  value={editingStudent.role}
                  onChange={(e) => setEditingStudent({ ...editingStudent, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Campus
                </label>
                <input
                  type="text"
                  value={editingStudent.campus}
                  onChange={(e) => setEditingStudent({ ...editingStudent, campus: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Attendance Rate
                  </label>
                  <input
                    type="text"
                    value={editingStudent.attendance}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, attendance: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Rating Score
                  </label>
                  <input
                    type="text"
                    value={editingStudent.rating}
                    onChange={(e) => setEditingStudent({ ...editingStudent, rating: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-slate-900 tracking-tight">
                Add Enrolled Student Profile
              </h3>
              <button onClick={() => setIsAddStudentOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aniket Mukherjee"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Squad Role & Position
                </label>
                <input
                  type="text"
                  placeholder="e.g. Goalkeeper (U12)"
                  value={newStudent.role}
                  onChange={(e) => setNewStudent({ ...newStudent, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Campus
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ichapore Campus"
                  value={newStudent.campus}
                  onChange={(e) => setNewStudent({ ...newStudent, campus: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Attendance
                  </label>
                  <input
                    type="text"
                    value={newStudent.attendance}
                    onChange={(e) => setNewStudent({ ...newStudent, attendance: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Rating Score
                  </label>
                  <input
                    type="text"
                    value={newStudent.rating}
                    onChange={(e) => setNewStudent({ ...newStudent, rating: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
                >
                  Add Student
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
          deleteTarget?.type === 'student'
            ? 'Delete Student Portal Profile'
            : 'Clear Announcement Banner'
        }
        message={
          deleteTarget?.type === 'student'
            ? 'Are you sure you want to remove this student account profile from the portal roster?'
            : 'Are you sure you want to delete and clear the active announcement banner shown to students and parents?'
        }
        itemName={deleteTarget?.name}
        confirmLabel={deleteTarget?.type === 'student' ? 'Delete Profile' : 'Clear Banner'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
