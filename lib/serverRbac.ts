import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import {
  UserRole,
  isValidRole,
  normalizeToTwoRoles,
  normalizePortalRoleParam,
  canSelfAssignRole,
  canUserAccessPortal,
  UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
} from '@/lib/rbac';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cyolljxxcmaekhhllbix.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5b2xsanh4Y21hZWtoaGxsYml4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDUwMDkzNSwiZXhwIjoyMTA2MDc2OTM1fQ.YUQW0sdxzObMXueBkZsxor-GlJ06Se1PbyXUmvRzQ_4';

const RBAC_HMAC_SECRET =
  process.env.RBAC_HMAC_SECRET ||
  `maden-faf-strict-rbac-secret-${supabaseServiceKey.slice(-24)}`;

export interface AuthoritativeAccountRecord {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  roles: UserRole[];
  campus: string;
  avatarUrl?: string;
  status: 'active' | 'suspended';
  migrationStatus:
    | 'verified'
    | 'flagged_missing_role'
    | 'flagged_conflicting_role'
    | 'flagged_ambiguous_role';
  migrationNotes?: string;
  approvedByAdmin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RbacSecurityAuditEntry {
  id: string;
  timestamp: string;
  eventType:
    | 'REGISTRATION'
    | 'LOGIN_SUCCESS'
    | 'UNAUTHORIZED_PORTAL_ATTEMPT'
    | 'ROLE_TAMPER_BLOCKED'
    | 'SELF_ROLE_MODIFICATION_BLOCKED'
    | 'ADMIN_ROLE_ASSIGNMENT'
    | 'ACCOUNT_MIGRATION_FLAG';
  actorEmail: string;
  actorRole?: string;
  targetPortalOrRole?: string;
  details: string;
}

// Simplified Role Structure: Strictly TWO Account Roles ('member' and 'admin')
export const AUTHORITATIVE_SEED_ACCOUNTS: Record<string, AuthoritativeAccountRecord> = {
  'member@madenfaf.com': {
    id: 'usr-member-01',
    email: 'member@madenfaf.com',
    fullName: 'Sourav Chatterjee',
    role: 'member',
    roles: ['member'],
    campus: 'Kalyani & Nadia District',
    status: 'active',
    migrationStatus: 'verified',
    migrationNotes:
      'Verified Foundation Member & Donor account (exclusively authorized for Member Donation & Support Portal).',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-10T09:00:00Z',
  },
  'admin@madenfaf.com': {
    id: 'usr-admin-01',
    email: 'admin@madenfaf.com',
    fullName: 'Technical Director Ghosh',
    role: 'admin',
    roles: ['admin', 'member'],
    approvedByAdmin: 'system',
    campus: 'All Campuses (Headquarters)',
    avatarUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    migrationStatus: 'verified',
    migrationNotes:
      'Verified Executive Admin account (authorized for Backend & Application Management).',
    createdAt: '2026-01-01T09:00:00Z',
    updatedAt: '2026-01-01T09:00:00Z',
  },
  'pravakarghosh.2025@gmail.com': {
    id: 'master-dev-pravakarghosh',
    email: 'pravakarghosh.2025@gmail.com',
    fullName: 'Pravakar Ghosh (Master Developer)',
    role: 'admin',
    roles: ['admin', 'member'],
    approvedByAdmin: 'system',
    campus: 'Headquarters & Command Center',
    avatarUrl: '/images/maden-faf-official-logo.png',
    status: 'active',
    migrationStatus: 'verified',
    migrationNotes: 'Master Developer & Executive Admin account.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
};

// Protected Admin emails that can never be downgraded to 'member'
const PROTECTED_ADMIN_EMAILS = new Set([
  'admin@madenfaf.com',
  'pravakarghosh.2025@gmail.com',
]);

export function isProtectedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return PROTECTED_ADMIN_EMAILS.has(email.toLowerCase().trim());
}

// In-memory cache synchronized with Supabase cloud storage
let inMemoryAccountsCache: Record<string, AuthoritativeAccountRecord> | null = null;
let inMemoryAuditLogs: RbacSecurityAuditEntry[] = [];
let hasBackedUpPreTwoRoleMigration = false;

export function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export function signRbacToken(payload: {
  id: string;
  email: string;
  role: UserRole;
  roles: UserRole[];
  iat?: number;
}): string {
  const tokenData = {
    id: payload.id,
    email: payload.email.toLowerCase(),
    role: payload.role,
    roles: payload.roles,
    iat: payload.iat || Date.now(),
  };
  const encoded = Buffer.from(JSON.stringify(tokenData)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', RBAC_HMAC_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyRbacToken(token?: string | null): {
  valid: boolean;
  payload?: { id: string; email: string; role: UserRole; roles: UserRole[]; iat: number };
} {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return { valid: false };
  }
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return { valid: false };

  const expectedSig = crypto
    .createHmac('sha256', RBAC_HMAC_SECRET)
    .update(encoded)
    .digest('base64url');

  if (sig !== expectedSig) {
    return { valid: false };
  }

  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!parsed?.email || !isValidRole(parsed?.role)) {
      return { valid: false };
    }
    return { valid: true, payload: parsed };
  } catch {
    return { valid: false };
  }
}

export async function recordRbacSecurityAudit(
  entry: Omit<RbacSecurityAuditEntry, 'id' | 'timestamp'>
) {
  const fullEntry: RbacSecurityAuditEntry = {
    id: `rbac-audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  inMemoryAuditLogs = [fullEntry, ...inMemoryAuditLogs].slice(0, 250);
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('academy_content').upsert(
      {
        key: 'rbac_security_audit_logs',
        data: inMemoryAuditLogs,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
  } catch {
    // Non-blocking audit persistence
  }
}

export async function getRbacSecurityAuditLogs(): Promise<RbacSecurityAuditEntry[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('academy_content')
      .select('data')
      .eq('key', 'rbac_security_audit_logs')
      .maybeSingle();
    if (Array.isArray(data?.data)) {
      inMemoryAuditLogs = data.data;
    }
  } catch {
    // Fallback to in-memory
  }
  return inMemoryAuditLogs;
}

/**
 * Loads and migrates all existing accounts from Supabase & seed records into the 2-role ('member' | 'admin') map.
 * Enforces:
 * - Keeping a backup before performing schema/role migration ('rbac_authoritative_accounts_backup_v1')
 * - Preserving existing Member and Admin accounts and credentials
 * - Converting any legacy player accounts into application records in academy_registrations if needed
 * - Removing obsolete login roles ('player', 'parent', 'coach', 'manager', 'staff1', 'staff2', 'pending')
 */
const LOCAL_RBAC_CACHE_FILE = '/tmp/maden_faf_rbac_accounts.json';

function readLocalRbacFile(): Record<string, AuthoritativeAccountRecord> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    if (fs.existsSync(LOCAL_RBAC_CACHE_FILE)) {
      const raw = fs.readFileSync(LOCAL_RBAC_CACHE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch {
    // Ignore file read errors
  }
  return {};
}

function writeLocalRbacFile(map: Record<string, AuthoritativeAccountRecord>): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    fs.writeFileSync(LOCAL_RBAC_CACHE_FILE, JSON.stringify(map), 'utf8');
  } catch {
    // Ignore file write errors
  }
}

export async function loadAuthoritativeAccountsMap(): Promise<
  Record<string, AuthoritativeAccountRecord>
> {
  const supabase = getSupabaseAdmin();
  const map: Record<string, AuthoritativeAccountRecord> = {};

  // 1. Seed accounts (baseline Member & Admin accounts)
  for (const [email, acc] of Object.entries(AUTHORITATIVE_SEED_ACCOUNTS)) {
    map[email.toLowerCase()] = { ...acc, roles: [...acc.roles] };
  }

  // 1b. Merge local server file cache and in-memory cache so newly registered accounts are never wiped
  const fileAccounts = readLocalRbacFile();
  for (const [email, acc] of Object.entries(fileAccounts)) {
    if (acc && typeof acc === 'object' && acc.email) {
      const key = email.toLowerCase().trim();
      const role: UserRole = isProtectedAdminEmail(key)
        ? 'admin'
        : normalizeToTwoRoles(acc.role);
      map[key] = {
        ...acc,
        email: key,
        role,
        roles: [role],
      };
    }
  }

  if (inMemoryAccountsCache) {
    for (const [email, acc] of Object.entries(inMemoryAccountsCache)) {
      if (acc && typeof acc === 'object' && acc.email) {
        const key = email.toLowerCase().trim();
        const role: UserRole = isProtectedAdminEmail(key)
          ? 'admin'
          : normalizeToTwoRoles(acc.role);
        map[key] = {
          ...acc,
          email: key,
          role,
          roles: [role],
        };
      }
    }
  }

  // 2. Load persisted authoritative RBAC store from academy_content (or fallback academy_registrations) and migrate to 2-role model
  try {
    let persistedAccountsObj: Record<string, any> | null = null;

    const { data } = await supabase
      .from('academy_content')
      .select('data')
      .eq('key', 'rbac_authoritative_accounts')
      .maybeSingle();

    if (data?.data && typeof data.data === 'object') {
      persistedAccountsObj = data.data as Record<string, any>;
    } else {
      // Fallback: Read SYS-SYNC-RBAC-ACCOUNTS from academy_registrations
      const { data: syncRow } = await supabase
        .from('academy_registrations')
        .select('message')
        .eq('booking_ref', 'SYS-SYNC-RBAC-ACCOUNTS')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (syncRow?.message) {
        try {
          const parsedSync = JSON.parse(syncRow.message);
          if (parsedSync && typeof parsedSync === 'object') {
            persistedAccountsObj = parsedSync;
          }
        } catch {
          // Ignore malformed JSON
        }
      }
    }

    if (persistedAccountsObj && typeof persistedAccountsObj === 'object') {
      // Save one-time backup before migrating legacy roles
      if (!hasBackedUpPreTwoRoleMigration) {
        hasBackedUpPreTwoRoleMigration = true;
        try {
          await supabase.from('academy_content').upsert(
            {
              key: 'rbac_authoritative_accounts_backup_v1',
              data: persistedAccountsObj,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'key' }
          );
        } catch {
          // Ignore backup error
        }
      }

      const legacyDemoEmailsToOmit = new Set([
        'player@madenfaf.com',
        'parent@madenfaf.com',
        'coach@madenfaf.com',
        'manager@madenfaf.com',
        'staff1@madenfaf.com',
        'staff2@madenfaf.com',
        'pending@madenfaf.com',
      ]);

      for (const [email, rawAcc] of Object.entries(persistedAccountsObj)) {
        const key = email.toLowerCase().trim();
        if (legacyDemoEmailsToOmit.has(key)) {
          continue;
        }
        if (rawAcc && typeof rawAcc === 'object') {
          const isProtectedAdmin = isProtectedAdminEmail(key);
          const normalizedRole: UserRole = isProtectedAdmin
            ? 'admin'
            : normalizeToTwoRoles(rawAcc.role);
          const wasMigratedFromLegacy = !isValidRole(rawAcc.role);

          map[key] = {
            id: rawAcc.id || map[key]?.id || `usr-${Date.now()}`,
            email: key,
            fullName: rawAcc.fullName || map[key]?.fullName || key.split('@')[0],
            role: normalizedRole,
            roles: [normalizedRole],
            campus: rawAcc.campus || map[key]?.campus || 'Gayeshpur Flagship Campus',
            avatarUrl: rawAcc.avatarUrl || map[key]?.avatarUrl,
            status: rawAcc.status === 'suspended' ? 'suspended' : 'active',
            migrationStatus: 'verified',
            migrationNotes: wasMigratedFromLegacy
              ? `Migrated from legacy '${String(rawAcc.role)}' role to '${normalizedRole}' under the 2-role (Member & Admin) system.`
              : rawAcc.migrationNotes || 'Verified authoritative role record.',
            approvedByAdmin: rawAcc.approvedByAdmin,
            createdAt: rawAcc.createdAt || new Date().toISOString(),
            updatedAt: rawAcc.updatedAt || new Date().toISOString(),
          };
        }
      }
    }
  } catch {
    // Continue migration
  }

  // 3. Migrate existing Donators Portal memberProfiles (trusted Member registration records)
  try {
    const { data: donorContent } = await supabase
      .from('academy_content')
      .select('data')
      .eq('key', 'donators_memberProfiles')
      .maybeSingle();

    if (Array.isArray(donorContent?.data)) {
      for (const memberProf of donorContent.data) {
        const email = (memberProf?.email || memberProf?.authEmail || '').toLowerCase().trim();
        if (!email) continue;
        const existing = map[email];
        if (!existing) {
          map[email] = {
            id: memberProf.uid || `usr-member-${Date.now()}`,
            email,
            fullName: memberProf.fullName || email.split('@')[0],
            role: 'member',
            roles: ['member'],
            campus: memberProf.district || 'Kalyani & Nadia District',
            status: 'active',
            migrationStatus: 'verified',
            migrationNotes:
              'Migrated from trusted Donators Portal member profile record (Member role locked).',
            createdAt: memberProf.createdAt || new Date().toISOString(),
            updatedAt: memberProf.updatedAt || new Date().toISOString(),
          };
        }
      }
    }
  } catch {
    // Ignore if table not present
  }

  // 4. Migrate existing profiles from Supabase Auth into 'member' or 'admin'
  try {
    const { data: dbProfiles } = await supabase.from('profiles').select('*');
    if (Array.isArray(dbProfiles)) {
      for (const row of dbProfiles) {
        const email = (row?.email || '').toLowerCase().trim();
        if (!email) continue;
        const existing = map[email];
        if (!existing) {
          const normalizedRole: UserRole = isProtectedAdminEmail(email)
            ? 'admin'
            : normalizeToTwoRoles(row.role);
          map[email] = {
            id: row.id,
            email,
            fullName: row.full_name || email.split('@')[0],
            role: normalizedRole,
            roles: [normalizedRole],
            campus: row.campus || 'Gayeshpur Flagship Campus',
            avatarUrl: row.avatar_url,
            status: 'active',
            migrationStatus: 'verified',
            migrationNotes: `Migrated from Supabase profiles table into '${normalizedRole}' role.`,
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
          };
        }
      }
    }
  } catch {
    // Ignore if profiles query fails
  }

  // 5. Re-apply local file cache and in-memory cache so newly registered accounts are never overwritten by stale DB snapshots
  for (const [email, acc] of Object.entries(fileAccounts)) {
    if (acc && typeof acc === 'object' && acc.email) {
      const key = email.toLowerCase().trim();
      const isProtected = isProtectedAdminEmail(key);
      const role: UserRole = isProtected ? 'admin' : normalizeToTwoRoles(acc.role);
      const roles: UserRole[] = isProtected ? ['admin', 'member'] : [role];
      map[key] = {
        ...map[key],
        ...acc,
        email: key,
        role,
        roles,
        approvedByAdmin: isProtected ? 'system' : acc.approvedByAdmin,
      };
    }
  }

  if (inMemoryAccountsCache) {
    for (const [email, acc] of Object.entries(inMemoryAccountsCache)) {
      if (acc && typeof acc === 'object' && acc.email) {
        const key = email.toLowerCase().trim();
        const isProtected = isProtectedAdminEmail(key);
        const role: UserRole = isProtected ? 'admin' : normalizeToTwoRoles(acc.role);
        const roles: UserRole[] = isProtected ? ['admin', 'member'] : [role];
        map[key] = {
          ...map[key],
          ...acc,
          email: key,
          role,
          roles,
          approvedByAdmin: isProtected ? 'system' : acc.approvedByAdmin,
        };
      }
    }
  }

  inMemoryAccountsCache = map;
  writeLocalRbacFile(map);
  return map;
}

export async function saveAuthoritativeAccountsMap(
  map: Record<string, AuthoritativeAccountRecord>
): Promise<void> {
  // Ensure protected admin accounts are never downgraded before saving
  for (const adminEmail of PROTECTED_ADMIN_EMAILS) {
    if (map[adminEmail]) {
      map[adminEmail].role = 'admin';
      map[adminEmail].roles = ['admin', 'member'];
      map[adminEmail].approvedByAdmin = 'system';
      map[adminEmail].status = 'active';
    }
  }

  inMemoryAccountsCache = map;
  writeLocalRbacFile(map);
  const supabase = getSupabaseAdmin();
  try {
    await supabase.from('academy_content').upsert(
      {
        key: 'rbac_authoritative_accounts',
        data: map,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
  } catch {
    // Fallback to academy_registrations sync row
  }

  try {
    const bookingRef = 'SYS-SYNC-RBAC-ACCOUNTS';
    const { data: existing } = await supabase
      .from('academy_registrations')
      .select('id')
      .eq('booking_ref', bookingRef)
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      await supabase
        .from('academy_registrations')
        .update({ message: JSON.stringify(map) })
        .eq('id', existing.id);
    } else {
      await supabase.from('academy_registrations').insert({
        booking_ref: bookingRef,
        player_name: 'RBAC Authoritative Accounts Store',
        dob: '2000-01-01',
        gender: 'other',
        parent_name: 'MADEN FAF Security Engine',
        phone: '+91 00000 00000',
        email: 'security@madenfaf.in',
        location: 'Supabase Cloud',
        preferred_campus: 'all',
        position: 'system',
        experience_level: 'cloud',
        program: 'rbac_authoritative_accounts',
        message: JSON.stringify(map),
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    }
  } catch {
    // Ignore fallback error
  }
}

export async function getAuthoritativeAccountByEmail(
  email?: string | null
): Promise<AuthoritativeAccountRecord | null> {
  if (!email) return null;
  const key = email.toLowerCase().trim();
  if (inMemoryAccountsCache && inMemoryAccountsCache[key]) {
    return inMemoryAccountsCache[key];
  }
  const map = await loadAuthoritativeAccountsMap();
  return map[key] || null;
}

export {
  canSelfAssignRole,
  canUserAccessPortal,
  isValidRole,
  normalizeToTwoRoles,
  normalizePortalRoleParam,
  UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
};
