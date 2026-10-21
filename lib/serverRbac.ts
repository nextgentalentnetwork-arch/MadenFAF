import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import {
  UserRole,
  isValidRole,
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
  status: 'active' | 'pending' | 'suspended';
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

// Strict Default Policy: One Account, One Assigned Role, One Authorized Portal
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
    migrationNotes: 'Verified Foundation Member & Donor account (exclusively authorized for Member Portal).',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-10T09:00:00Z',
  },
  'player@madenfaf.com': {
    id: 'usr-player-01',
    email: 'player@madenfaf.com',
    fullName: 'Subham Roy',
    role: 'player',
    roles: ['player'],
    campus: 'Gayeshpur Flagship Campus',
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    migrationStatus: 'verified',
    migrationNotes: 'Verified Academy Athlete account (exclusively authorized for Player Portal).',
    createdAt: '2026-01-12T09:00:00Z',
    updatedAt: '2026-01-12T09:00:00Z',
  },
  'parent@madenfaf.com': {
    id: 'usr-parent-01',
    email: 'parent@madenfaf.com',
    fullName: 'Mr. Pradip Roy',
    role: 'parent',
    roles: ['parent'],
    campus: 'Gayeshpur Campus',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    migrationStatus: 'verified',
    migrationNotes: 'Verified Guardian account (exclusively authorized for Parent Portal).',
    createdAt: '2026-01-14T09:00:00Z',
    updatedAt: '2026-01-14T09:00:00Z',
  },
  'coach@madenfaf.com': {
    id: 'usr-coach-01',
    email: 'coach@madenfaf.com',
    fullName: 'Coach Bapi Roy (AFC B)',
    role: 'coach',
    roles: ['coach'],
    campus: 'Gayeshpur Campus',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    migrationStatus: 'verified',
    migrationNotes: 'Verified Technical Coach account (exclusively authorized for Coach Portal).',
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-01-15T09:00:00Z',
  },
  'manager@madenfaf.com': {
    id: 'usr-manager-01',
    email: 'manager@madenfaf.com',
    fullName: 'Arindam Sen (Campus Director)',
    role: 'manager',
    roles: ['manager'],
    campus: 'Nadia District & Central Grounds',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    migrationStatus: 'verified',
    migrationNotes: 'Verified Campus Manager account (exclusively authorized for Manager Portal).',
    createdAt: '2026-01-16T09:00:00Z',
    updatedAt: '2026-01-16T09:00:00Z',
  },
  'staff1@madenfaf.com': {
    id: 'usr-staff1-01',
    email: 'staff1@madenfaf.com',
    fullName: 'Rohan Das (Intake Coordinator)',
    role: 'staff1',
    roles: ['staff1'],
    campus: 'Gayeshpur Admissions Desk',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    migrationStatus: 'verified',
    migrationNotes: 'Verified Staff 1 account (exclusively authorized for Staff 1 Portal).',
    createdAt: '2026-01-17T09:00:00Z',
    updatedAt: '2026-01-17T09:00:00Z',
  },
  'staff2@madenfaf.com': {
    id: 'usr-staff2-01',
    email: 'staff2@madenfaf.com',
    fullName: 'Debasish Paul (Field & Attendance)',
    role: 'staff2',
    roles: ['staff2'],
    campus: 'North 24 Parganas Campus',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    migrationStatus: 'verified',
    migrationNotes: 'Verified Staff 2 account (exclusively authorized for Staff 2 Portal).',
    createdAt: '2026-01-18T09:00:00Z',
    updatedAt: '2026-01-18T09:00:00Z',
  },
  'admin@madenfaf.com': {
    id: 'usr-admin-01',
    email: 'admin@madenfaf.com',
    fullName: 'Technical Director Ghosh',
    role: 'admin',
    roles: ['admin'],
    campus: 'All Campuses (Headquarters)',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    migrationStatus: 'verified',
    migrationNotes: 'Verified Executive Admin account (single-role default enforced; can authorize additional roles).',
    createdAt: '2026-01-01T09:00:00Z',
    updatedAt: '2026-01-01T09:00:00Z',
  },
  'pravakarghosh.2025@gmail.com': {
    id: 'master-dev-pravakarghosh',
    email: 'pravakarghosh.2025@gmail.com',
    fullName: 'Pravakar Ghosh (Master Developer)',
    role: 'admin',
    roles: ['admin'],
    campus: 'Headquarters & Command Center',
    avatarUrl: '/images/maden-faf-official-logo.png',
    status: 'active',
    migrationStatus: 'verified',
    migrationNotes: 'Master Developer & Executive Admin account.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  'pending@madenfaf.com': {
    id: 'usr-pending-01',
    email: 'pending@madenfaf.com',
    fullName: 'Ananya Roy (Applicant)',
    role: 'pending',
    roles: ['pending'],
    campus: 'Krishnanagar Football School',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    status: 'pending',
    migrationStatus: 'flagged_ambiguous_role',
    migrationNotes: 'Account awaiting administrative role verification and assignment.',
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-02-01T09:00:00Z',
  },
};

// In-memory cache synchronized with Supabase cloud storage
let inMemoryAccountsCache: Record<string, AuthoritativeAccountRecord> | null = null;
let inMemoryAuditLogs: RbacSecurityAuditEntry[] = [];

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

export async function recordRbacSecurityAudit(entry: Omit<RbacSecurityAuditEntry, 'id' | 'timestamp'>) {
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
 * Loads and migrates all existing accounts from Supabase & seed records into a single authoritative map.
 * Enforces:
 * - Preserving existing account credentials and user data
 * - Assigning the single authoritative role from trusted registration records
 * - Flagging accounts with missing, conflicting, or ambiguous role assignments for admin review
 * - Never automatically granting multiple roles to resolve conflicts
 */
export async function loadAuthoritativeAccountsMap(): Promise<
  Record<string, AuthoritativeAccountRecord>
> {
  const supabase = getSupabaseAdmin();
  const map: Record<string, AuthoritativeAccountRecord> = {};

  // 1. Seed accounts (baseline single-role accounts)
  for (const [email, acc] of Object.entries(AUTHORITATIVE_SEED_ACCOUNTS)) {
    map[email.toLowerCase()] = { ...acc, roles: [...acc.roles] };
  }

  // 2. Load persisted authoritative RBAC store from academy_content
  try {
    const { data } = await supabase
      .from('academy_content')
      .select('data')
      .eq('key', 'rbac_authoritative_accounts')
      .maybeSingle();

    if (data?.data && typeof data.data === 'object') {
      for (const [email, rawAcc] of Object.entries(data.data as Record<string, any>)) {
        const key = email.toLowerCase().trim();
        if (rawAcc && typeof rawAcc === 'object') {
          const validPrimary: UserRole = isValidRole(rawAcc.role) ? rawAcc.role : 'pending';
          // Preserve multi-role ONLY if approvedByAdmin is explicitly recorded; otherwise enforce single role
          const hasAdminMultiApproval = Boolean(rawAcc.approvedByAdmin);
          const validRoles: UserRole[] =
            hasAdminMultiApproval && Array.isArray(rawAcc.roles) && rawAcc.roles.length > 0
              ? Array.from(new Set([validPrimary, ...rawAcc.roles.filter((r: any) => isValidRole(r))]))
              : [validPrimary];

          map[key] = {
            id: rawAcc.id || map[key]?.id || `usr-${Date.now()}`,
            email: key,
            fullName: rawAcc.fullName || map[key]?.fullName || key.split('@')[0],
            role: validPrimary,
            roles: validRoles,
            campus: rawAcc.campus || map[key]?.campus || 'Gayeshpur Flagship Campus',
            avatarUrl: rawAcc.avatarUrl || map[key]?.avatarUrl,
            status: rawAcc.status || 'active',
            migrationStatus: rawAcc.migrationStatus || 'verified',
            migrationNotes: rawAcc.migrationNotes || 'Verified authoritative role record.',
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
            migrationNotes: 'Migrated from trusted Donators Portal member profile record (Member role locked).',
            createdAt: memberProf.createdAt || new Date().toISOString(),
            updatedAt: memberProf.updatedAt || new Date().toISOString(),
          };
        } else if (existing.role !== 'member' && !existing.roles.includes('member')) {
          // Flag conflict without automatically granting multiple roles!
          existing.migrationStatus = 'flagged_conflicting_role';
          existing.migrationNotes = `Conflict detected during migration: Account has primary role '${existing.role}' but also has a Donators Portal record. Multi-role access was NOT auto-granted; awaiting Admin review.`;
        }
      }
    }
  } catch {
    // Ignore if table not present
  }

  // 4. Migrate existing public.profiles from Supabase Auth
  try {
    const { data: dbProfiles } = await supabase.from('public.profiles').select('*');
    if (Array.isArray(dbProfiles)) {
      for (const row of dbProfiles) {
        const email = (row?.email || '').toLowerCase().trim();
        if (!email) continue;
        const dbRole = row.role;
        const existing = map[email];
        if (!existing) {
          const validRole = isValidRole(dbRole);
          map[email] = {
            id: row.id,
            email,
            fullName: row.full_name || email.split('@')[0],
            role: validRole ? dbRole : 'pending',
            roles: [validRole ? dbRole : 'pending'],
            campus: row.campus || 'Gayeshpur Flagship Campus',
            avatarUrl: row.avatar_url,
            status: validRole ? 'active' : 'pending',
            migrationStatus: validRole ? 'verified' : 'flagged_missing_role',
            migrationNotes: validRole
              ? 'Migrated from Supabase public.profiles table.'
              : `Missing or unrecognized role '${String(dbRole)}' in public.profiles; flagged for Admin review.`,
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
          };
        }
      }
    }
  } catch {
    // Ignore if public.profiles query fails
  }

  inMemoryAccountsCache = map;
  return map;
}

export async function saveAuthoritativeAccountsMap(
  map: Record<string, AuthoritativeAccountRecord>
): Promise<void> {
  inMemoryAccountsCache = map;
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
        gender: 'system',
        parent_name: 'MADEN FAF Security Engine',
        phone: '+91 00000 00000',
        email: 'security@madenfaf.in',
        location: 'Supabase Cloud',
        preferred_campus: 'all',
        position: 'system',
        experience_level: 'cloud',
        program: 'rbac_authoritative_accounts',
        message: JSON.stringify(map),
        status: 'cloud_persisted',
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
  const map = inMemoryAccountsCache || (await loadAuthoritativeAccountsMap());
  return map[key] || null;
}

export {
  canSelfAssignRole,
  canUserAccessPortal,
  isValidRole,
  UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
};
