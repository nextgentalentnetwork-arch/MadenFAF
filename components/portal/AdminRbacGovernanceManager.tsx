'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, useAuth } from '@/lib/AuthContext';
import { UserRole, ROLE_DEFINITIONS, getRoleDefinition } from '@/lib/rbac';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  KeyRound,
  History,
} from 'lucide-react';

interface AuthoritativeAccountItem {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  roles: UserRole[];
  campus: string;
  status: 'active' | 'pending' | 'suspended';
  migrationStatus:
    | 'verified'
    | 'flagged_missing_role'
    | 'flagged_conflicting_role'
    | 'flagged_ambiguous_role';
  migrationNotes?: string;
  approvedByAdmin?: string;
  updatedAt: string;
}

interface SecurityAuditItem {
  id: string;
  timestamp: string;
  eventType: string;
  actorEmail: string;
  actorRole?: string;
  targetPortalOrRole?: string;
  details: string;
}

const ALL_ROLES: UserRole[] = ['member', 'admin'];

export const AdminRbacGovernanceManager: React.FC<{ profile: UserProfile }> = ({
  profile,
}) => {
  const { rbacToken, revalidateSession } = useAuth();
  const [accounts, setAccounts] = useState<AuthoritativeAccountItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AuthoritativeAccountItem | null>(
    null
  );
  const [selectedPrimaryRole, setSelectedPrimaryRole] = useState<UserRole>('member');
  const [selectedAuthorizedRoles, setSelectedAuthorizedRoles] = useState<UserRole[]>([
    'member',
  ]);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'accounts' | 'flagged' | 'audit'>('accounts');

  const fetchGovernanceData = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/auth/rbac?adminView=true&callerEmail=${encodeURIComponent(profile.email)}`,
        {
          headers: rbacToken ? { Authorization: `Bearer ${rbacToken}` } : {},
        }
      );
      const data = await res.json();
      if (data?.success) {
        setAccounts(data.accounts || []);
        setAuditLogs(data.auditLogs || []);
      }
    } catch (e) {
      console.warn('Failed to load RBAC governance data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [profile.email, rbacToken]);

  useEffect(() => {
    let active = true;
    fetch(
      `/api/auth/rbac?adminView=true&callerEmail=${encodeURIComponent(profile.email)}`,
      {
        headers: rbacToken ? { Authorization: `Bearer ${rbacToken}` } : {},
      }
    )
      .then((r) => r.json())
      .then((data) => {
        if (active && data?.success) {
          setAccounts(data.accounts || []);
          setAuditLogs(data.auditLogs || []);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [profile.email, rbacToken]);

  const openRoleEditor = (acc: AuthoritativeAccountItem) => {
    setEditingAccount(acc);
    setSelectedPrimaryRole(acc.role);
    setSelectedAuthorizedRoles(
      Array.isArray(acc.roles) && acc.roles.length > 0 ? [...acc.roles] : [acc.role]
    );
    setStatusMessage(null);
  };

  const toggleAdditionalRole = (roleOption: UserRole) => {
    if (roleOption === selectedPrimaryRole) return; // Primary role is always included
    setSelectedAuthorizedRoles((prev) =>
      prev.includes(roleOption)
        ? prev.filter((r) => r !== roleOption)
        : [...prev, roleOption]
    );
  };

  const handleSaveRoleAssignment = async () => {
    if (!editingAccount) return;
    setStatusMessage(null);
    const finalRoles = Array.from(
      new Set([selectedPrimaryRole, ...selectedAuthorizedRoles])
    );

    try {
      const res = await fetch('/api/auth/rbac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adminUpdateUserRoles',
          adminToken: rbacToken,
          adminEmail: profile.email,
          targetEmail: editingAccount.email,
          newPrimaryRole: selectedPrimaryRole,
          newAuthorizedRoles: finalRoles,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAccounts(data.accounts || []);
        setAuditLogs(data.auditLogs || []);
        setEditingAccount(null);
        setStatusMessage({
          type: 'success',
          text: `Updated authoritative role permissions for ${editingAccount.email}: Primary [${selectedPrimaryRole.toUpperCase()}], Authorized Portals [${finalRoles.join(', ').toUpperCase()}].`,
        });
        if (editingAccount.email.toLowerCase() === profile.email.toLowerCase()) {
          await revalidateSession();
        }
      } else {
        setStatusMessage({
          type: 'error',
          text: data?.error || 'Failed to update account role permissions.',
        });
      }
    } catch (e: any) {
      setStatusMessage({
        type: 'error',
        text: e?.message || 'Error updating role assignment.',
      });
    }
  };

  const flaggedAccounts = accounts.filter((a) => a.migrationStatus !== 'verified');

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full mb-1.5">
            <Lock className="w-3 h-3" />
            <span>Strict Bidirectional RBAC Governance</span>
          </div>
          <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Account Role Separation, Migration Audit &amp; Multi-Role Authorization</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Default policy: one account, one assigned role, one authorized portal. Only an authorized Admin can grant additional portal roles or resolve migration flags.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchGovernanceData()}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh RBAC Store</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('accounts')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
            activeTab === 'accounts'
              ? 'bg-slate-900 text-amber-400'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Registered Accounts ({accounts.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('flagged')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
            activeTab === 'flagged'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Migration Review Queue ({flaggedAccounts.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
            activeTab === 'audit'
              ? 'bg-slate-900 text-amber-400'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Security &amp; Access Denied Audit Log ({auditLogs.length})</span>
        </button>
      </div>

      {/* Role Editor Drawer/Card */}
      {editingAccount && (
        <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                Admin Role &amp; Multi-Portal Authorization
              </div>
              <h4 className="text-sm font-black">
                {editingAccount.fullName} ({editingAccount.email})
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setEditingAccount(null)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1.5">
                Primary Assigned Role
              </label>
              <select
                value={selectedPrimaryRole}
                onChange={(e) => {
                  const newPrimary = e.target.value as UserRole;
                  setSelectedPrimaryRole(newPrimary);
                  setSelectedAuthorizedRoles((prev) =>
                    prev.includes(newPrimary) ? prev : [newPrimary, ...prev]
                  );
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              >
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.toUpperCase()} — {ROLE_DEFINITIONS[r].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1.5">
                Explicitly Authorized Portals (Admin Multi-Role Grant)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_ROLES.map((r) => {
                  const isPrimary = r === selectedPrimaryRole;
                  const isChecked = isPrimary || selectedAuthorizedRoles.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      disabled={isPrimary}
                      onClick={() => toggleAdditionalRole(r)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {r} {isPrimary ? '(Primary)' : isChecked ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Unchecked portals are strictly blocked in both directions for this account.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleSaveRoleAssignment}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              Save &amp; Authorize Role Permissions
            </button>
          </div>
        </div>
      )}

      {/* Tab 1 & 2: Accounts Table */}
      {(activeTab === 'accounts' || activeTab === 'flagged') && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-mono uppercase text-slate-500">
                <th className="py-2.5 px-3">Account</th>
                <th className="py-2.5 px-3">Primary Role</th>
                <th className="py-2.5 px-3">Authorized Portals</th>
                <th className="py-2.5 px-3">Migration &amp; Verification Status</th>
                <th className="py-2.5 px-3 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {(activeTab === 'flagged' ? flaggedAccounts : accounts).map((acc) => {
                const def = getRoleDefinition(acc.role);
                const isFlagged = acc.migrationStatus !== 'verified';
                return (
                  <tr key={acc.email} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{acc.fullName}</div>
                      <div className="font-mono text-[11px] text-slate-500">{acc.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${def.badgeColor}`}
                      >
                        {def.badge}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {(acc.roles || [acc.role]).map((r) => (
                          <span
                            key={r}
                            className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] font-bold uppercase text-slate-700"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {isFlagged ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-mono font-bold uppercase">
                            <AlertTriangle className="w-3 h-3" />
                            {acc.migrationStatus}
                          </span>
                          <div className="text-[11px] text-slate-500 max-w-xs">
                            {acc.migrationNotes}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold uppercase">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified Single-Role
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => openRoleEditor(acc)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>Manage Roles</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Security Audit Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {auditLogs.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
              No unauthorized access or role tamper events recorded yet.
            </div>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        log.eventType.includes('UNAUTHORIZED') ||
                        log.eventType.includes('BLOCKED')
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {log.eventType}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {log.actorEmail}
                    </span>
                  </div>
                  <div className="text-slate-600">{log.details}</div>
                </div>
                <div className="text-[10px] font-mono text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
