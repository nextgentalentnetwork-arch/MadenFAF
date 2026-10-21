// MADEN FAF — Centralized Role-Based Access Control (RBAC) Module

export type UserRole =
  | 'player'
  | 'parent'
  | 'coach'
  | 'manager'
  | 'staff1'
  | 'staff2'
  | 'admin'
  | 'member'
  | 'pending';

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
  canManageDonations?: boolean;
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  player: {
    id: 'player',
    label: 'Academy Athlete',
    portalTitle: 'Player Performance Passport',
    portalSubtitle: 'Personal radar metrics, training logs, match schedules, and technical coach reviews.',
    badge: 'ATHLETE',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    accentColor: 'amber',
    navLabel: 'Player Passport',
    description: 'Enrolled academy youth athlete tracking individual development progress.',
    canApproveCandidates: false,
    canEditCurriculum: false,
    canManageAttendance: false,
    canAccessBackendDeveloper: false,
    canManageDonations: false,
  },
  parent: {
    id: 'parent',
    label: 'Parent / Guardian',
    portalTitle: 'Parent Transparency Dashboard',
    portalSubtitle: 'Attendance log, term evaluations, coach observations, and welfare coordination.',
    badge: 'PARENT',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    accentColor: 'emerald',
    navLabel: 'Parent Dashboard',
    description: 'Authorized parent monitoring child progress, session attendance, and safety records.',
    canApproveCandidates: false,
    canEditCurriculum: false,
    canManageAttendance: false,
    canAccessBackendDeveloper: false,
    canManageDonations: false,
  },
  coach: {
    id: 'coach',
    label: 'Technical Coach',
    portalTitle: 'Coach Tactical Planner & Squad Evaluations',
    portalSubtitle: 'Tactical phase drill builder, player ratings, match lineups, and candidate trial evaluations.',
    badge: 'COACH',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
    accentColor: 'blue',
    navLabel: 'Coach Planner',
    description: 'AFC / AIFF certified technical staff managing squad development and trial assessments.',
    canApproveCandidates: true,
    canEditCurriculum: true,
    canManageAttendance: true,
    canAccessBackendDeveloper: false,
    canManageDonations: false,
  },
  manager: {
    id: 'manager',
    label: 'Campus & Academy Manager',
    portalTitle: 'Campus Operations & Admissions Manager',
    portalSubtitle: 'Multi-campus schedules, candidate admission reviews, facility logistics, and staff management.',
    badge: 'MANAGER',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
    accentColor: 'purple',
    navLabel: 'Manager Portal',
    description: 'Executive campus manager coordinating pitch logistics, intake approvals, and regional schedules.',
    canApproveCandidates: true,
    canEditCurriculum: true,
    canManageAttendance: true,
    canAccessBackendDeveloper: false,
    canManageDonations: false,
  },
  staff1: {
    id: 'staff1',
    label: 'Staff 1 (Admissions Coordinator)',
    portalTitle: 'Staff 1 Intake & Waitlist Desk',
    portalSubtitle: 'Trial registrations desk. Staff 1 users can submit candidates and save records as Pending Trial or Waitlist only.',
    badge: 'STAFF 1',
    badgeColor: 'bg-sky-100 text-sky-900 border-sky-200',
    accentColor: 'sky',
    navLabel: 'Staff 1 Portal',
    description: 'Admissions intake staff. Restricted from approving or enrolling players; saves as Pending or Waitlisted for Admin/Coach review.',
    canApproveCandidates: false,
    canEditCurriculum: false,
    canManageAttendance: false,
    canAccessBackendDeveloper: false,
    canManageDonations: false,
  },
  staff2: {
    id: 'staff2',
    label: 'Staff 2 (Field & Attendance Monitor)',
    portalTitle: 'Staff 2 Field Logistics & Attendance Desk',
    portalSubtitle: 'Daily campus check-in log, training equipment monitoring, and candidate intake (Pending/Waitlist only).',
    badge: 'STAFF 2',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-200',
    accentColor: 'teal',
    navLabel: 'Staff 2 Portal',
    description: 'Field operations monitor recording daily session attendance. Saves candidate profiles as Pending or Waitlisted only.',
    canApproveCandidates: false,
    canEditCurriculum: false,
    canManageAttendance: true,
    canAccessBackendDeveloper: false,
    canManageDonations: false,
  },
  admin: {
    id: 'admin',
    label: 'Executive Technical Director',
    portalTitle: 'Executive Academy Command',
    portalSubtitle: 'Complete academy governance, candidate approvals, donor management, curriculum, and developer settings.',
    badge: 'ADMIN',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-200',
    accentColor: 'rose',
    navLabel: 'Admin Command',
    description: 'Executive director with full permissions across all dashboards, donor management, candidate approvals, and backend tools.',
    canApproveCandidates: true,
    canEditCurriculum: true,
    canManageAttendance: true,
    canAccessBackendDeveloper: true,
    canManageDonations: true,
  },
  member: {
    id: 'member',
    label: 'Foundation Member & Donor',
    portalTitle: 'MADEN FAF Donators Portal',
    portalSubtitle: 'Manage your Member profile, contribution plans, official QR payments, mobile verification, and tax/donation receipts.',
    badge: 'MEMBER',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    accentColor: 'indigo',
    navLabel: 'Donators Portal',
    description: 'Registered supporter and donor of MADEN Football Academy Foundation with access to contribution plans, invoices, and verified receipts.',
    canApproveCandidates: false,
    canEditCurriculum: false,
    canManageAttendance: false,
    canAccessBackendDeveloper: false,
    canManageDonations: false,
  },
  pending: {
    id: 'pending',
    label: 'Pending Role Assignment',
    portalTitle: 'Account Pending Review',
    portalSubtitle: 'Your account has been registered and is awaiting verification by the academy technical administration.',
    badge: 'PENDING',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    accentColor: 'amber',
    navLabel: 'Pending Approval',
    description: 'Newly registered account pending administrator role assignment. Access to protected dashboards is restricted.',
    canApproveCandidates: false,
    canEditCurriculum: false,
    canManageAttendance: false,
    canAccessBackendDeveloper: false,
    canManageDonations: false,
  },
};

/**
 * Exact required error message when a user attempts to log in to or access another role's portal
 */
export const UNAUTHORIZED_PORTAL_ACCESS_MESSAGE =
  'Access Denied: Your account is not authorized to access this portal. Please log in using your registered account role.';

/**
 * Roles that can be selected by a public user during self-registration.
 * Privileged roles (admin, manager, coach, staff1, staff2) CANNOT be self-assigned.
 */
export const SELF_ASSIGNABLE_ROLES: UserRole[] = ['member', 'player', 'parent', 'pending'];

export function canSelfAssignRole(role: any): role is UserRole {
  return typeof role === 'string' && SELF_ASSIGNABLE_ROLES.includes(role as UserRole);
}

/**
 * Validates if a string is a recognized UserRole
 */
export function isValidRole(role: any): role is UserRole {
  return typeof role === 'string' && role in ROLE_DEFINITIONS;
}

/**
 * Returns role definition with safe fallback to 'pending'
 */
export function getRoleDefinition(role?: UserRole | string | null): RoleDefinition {
  if (role && isValidRole(role)) {
    return ROLE_DEFINITIONS[role];
  }
  return ROLE_DEFINITIONS.pending;
}

/**
 * Canonical portal path for a given role
 */
export function getPortalPathForRole(role: UserRole): string {
  return `/portal?role=${role}`;
}

/**
 * Strict bidirectional portal authorization check:
 * Default policy: one account, one assigned role, one authorized portal.
 * A user registered under one role cannot access another role's portal unless an Admin
 * has explicitly authorized that account for the additional role in `authorizedRoles`.
 */
export function canUserAccessPortal(
  primaryRole: UserRole | string | undefined | null,
  targetPortalRole: UserRole | string | undefined | null,
  authorizedRoles?: UserRole[]
): boolean {
  if (!primaryRole || !isValidRole(primaryRole)) return false;
  if (!targetPortalRole || !isValidRole(targetPortalRole)) return false;

  const allowedSet = new Set<UserRole>([primaryRole]);
  if (Array.isArray(authorizedRoles)) {
    for (const r of authorizedRoles) {
      if (isValidRole(r)) {
        allowedSet.add(r);
      }
    }
  }

  return allowedSet.has(targetPortalRole);
}

/**
 * Checks if a user role has authorization to access a required role or list of roles.
 * Strictly enforces assigned role(s) without automatic cross-portal privilege escalation.
 */
export function isRoleAuthorized(
  userRole: UserRole | string | undefined | null,
  requiredRole: UserRole | UserRole[],
  authorizedRoles?: UserRole[]
): boolean {
  if (!userRole || !isValidRole(userRole)) return false;
  const targets = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return targets.some((target) => canUserAccessPortal(userRole, target, authorizedRoles));
}

/**
 * Policy: Can this user access player recruitment / trial application features?
 * Foundation Supporter & Donor ('member') accounts are strictly prohibited from accessing
 * player recruitment features or submitting trial applications unless explicitly authorized.
 */
export function canAccessRecruitmentAndTrials(
  userRole?: UserRole | string | null,
  authorizedRoles?: UserRole[]
): boolean {
  if (!userRole) return true; // Public unauthenticated visitors can book a trial
  if (!isValidRole(userRole)) return false;
  if (userRole === 'member') {
    const allowed = Array.isArray(authorizedRoles) ? authorizedRoles : ['member'];
    return allowed.some((r) => r === 'player' || r === 'parent' || r === 'admin');
  }
  return true;
}

/**
 * Policy: Can this user approve or enroll candidate trial applications?
 * Only Admin, Coach, and Manager can approve/enroll.
 */
export function canApproveCandidateStatus(role?: UserRole | string | null): boolean {
  if (!role || !isValidRole(role)) return false;
  return ROLE_DEFINITIONS[role].canApproveCandidates;
}

/**
 * Policy: Can this user verify donor payments, issue receipts, record refunds, or modify official QR settings?
 * Strictly restricted to Admin role.
 */
export function canManageDonations(role?: UserRole | string | null): boolean {
  if (!role || !isValidRole(role)) return false;
  return Boolean(ROLE_DEFINITIONS[role].canManageDonations);
}

