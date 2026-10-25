// MADEN FAF — Centralized Role-Based Access Control (RBAC) Module
// Simplified Role Structure: Strictly TWO Account Roles ('member' and 'admin')

export type UserRole = 'member' | 'admin';

export interface RoleDefinition {
  id: UserRole;
  label: string;
  portalTitle: string;
  portalSubtitle: string;
  badge: string;
  badgeColor: string;
  accentColor: string;
  navLabel: string;
  description: string;
  canApproveCandidates: boolean;
  canEditCurriculum: boolean;
  canManageAttendance: boolean;
  canAccessBackendDeveloper: boolean;
  canManageDonations: boolean;
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  member: {
    id: 'member',
    label: 'Member — Donation & Support Portal',
    portalTitle: 'MADEN FAF Member — Donation & Support Portal',
    portalSubtitle:
      'Manage your Member profile, Monthly/Quarterly/Yearly contribution plans, official QR payments, mobile verification, and verified receipts.',
    badge: 'MEMBER',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    accentColor: 'indigo',
    navLabel: 'Donation & Support Portal',
    description:
      'Registered supporter and donor of MADEN Football Academy Foundation with access to contribution plans, invoices, and verified receipts.',
    canApproveCandidates: false,
    canEditCurriculum: false,
    canManageAttendance: false,
    canAccessBackendDeveloper: false,
    canManageDonations: false,
  },
  admin: {
    id: 'admin',
    label: 'Admin — Backend Management',
    portalTitle: 'MADEN FAF Executive Admin Dashboard',
    portalSubtitle:
      'Complete academy backend management: player admission applications, trial sessions, member accounts, donation verification, QR settings, and website content.',
    badge: 'ADMIN',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-200',
    accentColor: 'rose',
    navLabel: 'Admin Dashboard',
    description:
      'Privileged backend administrator managing website content, player admission & trial applications, member accounts, donations, QR code, and receipts.',
    canApproveCandidates: true,
    canEditCurriculum: true,
    canManageAttendance: true,
    canAccessBackendDeveloper: true,
    canManageDonations: true,
  },
};

/**
 * Exact required error message when a user attempts to log in to or access another role's portal
 */
export const UNAUTHORIZED_PORTAL_ACCESS_MESSAGE =
  'Access Denied: Your account is not authorized to access this portal. Please log in using your registered account role.';

/**
 * Roles that can be selected by a public user during self-registration.
 * The Admin role must NEVER be available through public self-registration.
 */
export const SELF_ASSIGNABLE_ROLES: UserRole[] = ['member'];

/**
 * Normalizes any portal role query parameter or alias ('member', 'donator', 'donor', 'supporter', 'admin')
 * into a canonical UserRole ('member' | 'admin'), or null if unrecognized.
 */
export function normalizePortalRoleParam(role: any): UserRole | null {
  if (typeof role !== 'string') return null;
  const cleaned = role.trim().toLowerCase();
  if (cleaned === 'admin') return 'admin';
  if (
    cleaned === 'member' ||
    cleaned === 'donator' ||
    cleaned === 'donor' ||
    cleaned === 'supporter' ||
    cleaned === 'donator_member' ||
    cleaned === 'donators'
  ) {
    return 'member';
  }
  return null;
}

export function canSelfAssignRole(role: any): boolean {
  if (!role) return true;
  if (typeof role !== 'string') return false;
  const cleaned = role.trim().toLowerCase();
  if (cleaned === 'admin') return false;
  return normalizePortalRoleParam(cleaned) === 'member';
}

/**
 * Validates if a string is a recognized UserRole ('member' | 'admin') or a valid member alias
 */
export function isValidRole(role: any): role is UserRole {
  return role === 'member' || role === 'admin';
}

/**
 * Normalizes any legacy role string into one of the two valid roles ('member' | 'admin').
 * Never escalates a non-admin account to 'admin'.
 */
export function normalizeToTwoRoles(role: any): UserRole {
  if (typeof role === 'string' && role.trim().toLowerCase() === 'admin') return 'admin';
  return 'member';
}

/**
 * Returns role definition with safe fallback to 'member'
 */
export function getRoleDefinition(role?: UserRole | string | null): RoleDefinition {
  const canonical = normalizePortalRoleParam(role);
  if (canonical) {
    return ROLE_DEFINITIONS[canonical];
  }
  return ROLE_DEFINITIONS.member;
}

/**
 * Canonical portal path for a given role
 */
export function getPortalPathForRole(role: UserRole): string {
  const canonical = normalizeToTwoRoles(role);
  return `/portal?role=${canonical}`;
}

/**
 * Strict portal authorization check:
 * Only 'member' and 'admin' exist.
 * - A 'member' can NEVER access 'admin' routes or portals unless explicitly promoted by an Admin.
 * - Both 'member' and 'admin' accounts are authorized to access the 'member' (Donation & Support) portal.
 */
export function canUserAccessPortal(
  primaryRole: UserRole | string | undefined | null,
  targetPortalRole: UserRole | string | undefined | null,
  authorizedRoles?: UserRole[]
): boolean {
  const canonicalPrimary = normalizePortalRoleParam(primaryRole) || (primaryRole ? normalizeToTwoRoles(primaryRole) : null);
  const canonicalTarget = normalizePortalRoleParam(targetPortalRole);

  if (!canonicalPrimary || !canonicalTarget) return false;

  // Hard security rule: A 'member' primary role can never access 'admin' unless explicitly promoted to 'admin'
  if (canonicalTarget === 'admin') {
    if (canonicalPrimary === 'admin') return true;
    return Array.isArray(authorizedRoles) && authorizedRoles.includes('admin');
  }

  // Target is 'member': accessible to all authenticated 'member' and 'admin' accounts
  return canonicalPrimary === 'member' || canonicalPrimary === 'admin';
}

/**
 * Checks if a user role has authorization to access a required role or list of roles.
 */
export function isRoleAuthorized(
  userRole: UserRole | string | undefined | null,
  requiredRole: UserRole | UserRole[],
  authorizedRoles?: UserRole[]
): boolean {
  if (!userRole) return false;
  const targets = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return targets.some((target) => canUserAccessPortal(userRole, target, authorizedRoles));
}

/**
 * Policy: Can a visitor or user submit a public player admission or trial application?
 * Under the simplified 2-role model, public visitors and users can apply directly
 * for Academy Admission or a Trial Session without creating a separate Player account.
 */
export function canAccessRecruitmentAndTrials(
  _userRole?: UserRole | string | null,
  _authorizedRoles?: UserRole[]
): boolean {
  return true;
}

/**
 * Policy: Can this user approve, schedule, waitlist, or reject candidate admission/trial applications?
 * Strictly restricted to Admin role.
 */
export function canApproveCandidateStatus(role?: UserRole | string | null): boolean {
  return role === 'admin';
}

/**
 * Policy: Can this user verify donor payments, issue receipts, record refunds, or modify official QR settings?
 * Strictly restricted to Admin role.
 */
export function canManageDonations(role?: UserRole | string | null): boolean {
  return role === 'admin';
}
