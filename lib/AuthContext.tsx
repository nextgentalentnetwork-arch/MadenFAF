'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { AcademyDataManager } from '@/lib/academyDataManager';
import { DonatorsPortalService } from '@/lib/donatorsPortalService';
import {
  UserRole,
  isValidRole,
  canSelfAssignRole,
  canUserAccessPortal,
  UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
} from '@/lib/rbac';
export type { UserRole };

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  roles?: UserRole[];
  campus?: string;
  avatarUrl?: string;
  status?: 'active' | 'pending' | 'suspended';
  migrationStatus?:
    | 'verified'
    | 'flagged_missing_role'
    | 'flagged_conflicting_role'
    | 'flagged_ambiguous_role';
  migrationNotes?: string;
  approvedByAdmin?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  rbacToken: string | null;
  isLoading: boolean;
  isSupabaseActive: boolean;
  accessDeniedReason: string | null;
  clearAccessDenied: () => void;
  login: (
    email: string,
    password: string,
    requestedPortalRole?: UserRole | 'auto'
  ) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  signup: (
    email: string,
    password: string,
    fullName: string,
    role?: UserRole
  ) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  revalidateSession: (
    targetPortalRole?: UserRole | null
  ) => Promise<{ authorized: boolean; error?: string; authoritativeRole?: UserRole }>;
  grantMemberAccess: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

// Strict Default Policy: One Account, One Assigned Role, One Authorized Portal
const SEED_ROLE_PROFILES: Record<string, UserProfile> = {
  'member@madenfaf.com': {
    id: 'usr-member-01',
    email: 'member@madenfaf.com',
    fullName: 'Sourav Chatterjee',
    role: 'member',
    roles: ['member'],
    campus: 'Kalyani & Nadia District',
    status: 'active',
    migrationStatus: 'verified',
    createdAt: '2026-01-10T09:00:00Z',
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
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getRegisteredUsersRegistry(): Record<string, UserProfile> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem('maden_faf_registered_users_registry');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveUserProfileToRegistry(prof: UserProfile) {
  if (typeof window === 'undefined') return;
  try {
    const registry = getRegisteredUsersRegistry();
    registry[prof.email.toLowerCase()] = prof;
    localStorage.setItem('maden_faf_registered_users_registry', JSON.stringify(registry));
  } catch (e) {
    console.warn('Error saving to user registry:', e);
  }
}

function lookupProfileByEmail(email: string): UserProfile | null {
  const key = email.trim().toLowerCase();
  // Seed profiles are authoritative over unverified localStorage edits
  if (SEED_ROLE_PROFILES[key]) {
    const reg = getRegisteredUsersRegistry()[key];
    if (reg && reg.approvedByAdmin) {
      return reg;
    }
    return SEED_ROLE_PROFILES[key];
  }
  const registry = getRegisteredUsersRegistry();
  if (registry[key]) {
    return registry[key];
  }
  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rbacToken, setRbacToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [accessDeniedReason, setAccessDeniedReason] = useState<string | null>(null);
  const isSupabaseActive = isSupabaseConfigured();

  // Immutable in-memory snapshot of server-verified role to detect localStorage tampering
  const verifiedRoleSnapshotRef = useRef<{
    email: string;
    role: UserRole;
    roles: UserRole[];
  } | null>(null);

  const clearAccessDenied = useCallback(() => {
    setAccessDeniedReason(null);
  }, []);

  const persistVerifiedSession = useCallback((prof: UserProfile, token?: string | null) => {
    const authoritativeRoles: UserRole[] =
      Array.isArray(prof.roles) && prof.roles.length > 0 && prof.approvedByAdmin
        ? prof.roles
        : [prof.role];

    const normalizedProf: UserProfile = {
      ...prof,
      roles: authoritativeRoles,
    };

    verifiedRoleSnapshotRef.current = {
      email: normalizedProf.email.toLowerCase(),
      role: normalizedProf.role,
      roles: [...authoritativeRoles],
    };

    setUser({ id: normalizedProf.id, email: normalizedProf.email });
    setProfile(normalizedProf);
    saveUserProfileToRegistry(normalizedProf);

    if (typeof window !== 'undefined') {
      localStorage.setItem('maden_faf_active_user', JSON.stringify(normalizedProf));
      if (token) {
        setRbacToken(token);
        localStorage.setItem('maden_faf_rbac_token', token);
      }
    }
  }, []);

  // Revalidate session against server-side RBAC authority and detect localStorage/request manipulation
  const revalidateSession = useCallback(
    async (
      targetPortalRole?: UserRole | null
    ): Promise<{ authorized: boolean; error?: string; authoritativeRole?: UserRole }> => {
      if (typeof window === 'undefined') {
        return { authorized: false, error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE };
      }

      const rawActive = localStorage.getItem('maden_faf_active_user');
      const storedToken = localStorage.getItem('maden_faf_rbac_token') || rbacToken;
      if (!rawActive && !verifiedRoleSnapshotRef.current) {
        return { authorized: false, error: 'Not authenticated' };
      }

      let parsedLocal: UserProfile | null = null;
      try {
        parsedLocal = rawActive ? JSON.parse(rawActive) : null;
      } catch {
        parsedLocal = null;
      }

      const snapshot = verifiedRoleSnapshotRef.current;
      const emailToCheck = (
        snapshot?.email ||
        parsedLocal?.email ||
        profile?.email ||
        ''
      )
        .toLowerCase()
        .trim();

      if (!emailToCheck) {
        return { authorized: false, error: 'Not authenticated' };
      }

      // 1. Immediate client-side tamper detection against in-memory verified snapshot
      if (snapshot && parsedLocal) {
        const localRoleChanged = parsedLocal.role !== snapshot.role;
        const localRolesChanged =
          Array.isArray(parsedLocal.roles) &&
          parsedLocal.roles.some((r) => !snapshot.roles.includes(r));

        if (localRoleChanged || localRolesChanged) {
          setAccessDeniedReason(UNAUTHORIZED_PORTAL_ACCESS_MESSAGE);
          // Restore true role in localStorage so manipulation cannot persist
          const restored: UserProfile = {
            ...(profile || parsedLocal),
            email: snapshot.email,
            role: snapshot.role,
            roles: [...snapshot.roles],
          };
          setProfile(restored);
          localStorage.setItem('maden_faf_active_user', JSON.stringify(restored));
          saveUserProfileToRegistry(restored);

          // Notify server RBAC audit log
          try {
            await fetch('/api/auth/rbac', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'validateSession',
                email: snapshot.email,
                clientRole: parsedLocal.role,
                clientRoles: parsedLocal.roles,
                targetPortalRole,
                rbacToken: storedToken,
              }),
            });
          } catch {
            // Non-blocking audit report
          }

          return {
            authorized: false,
            error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
            authoritativeRole: snapshot.role,
          };
        }
      }

      // 2. Server-side RBAC validation
      try {
        const res = await fetch('/api/auth/rbac', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'validateSession',
            email: emailToCheck,
            clientRole: parsedLocal?.role || profile?.role,
            clientRoles: parsedLocal?.roles || profile?.roles,
            targetPortalRole: targetPortalRole || undefined,
            rbacToken: storedToken,
          }),
        });

        const data = await res.json();
        if (data?.authoritativeProfile) {
          persistVerifiedSession(data.authoritativeProfile, data.rbacToken || storedToken);
        }

        if (!res.ok || !data?.authorized) {
          const errText = data?.error || UNAUTHORIZED_PORTAL_ACCESS_MESSAGE;
          setAccessDeniedReason(errText);
          return {
            authorized: false,
            error: errText,
            authoritativeRole: data?.authoritativeProfile?.role || snapshot?.role,
          };
        }

        return {
          authorized: true,
          authoritativeRole: data?.authoritativeProfile?.role || snapshot?.role,
        };
      } catch {
        // Fallback to local verified snapshot if offline
        const authRole = snapshot?.role || parsedLocal?.role;
        const authRoles = snapshot?.roles || parsedLocal?.roles || (authRole ? [authRole] : []);
        if (targetPortalRole && authRole) {
          const ok = canUserAccessPortal(authRole, targetPortalRole, authRoles);
          if (!ok) {
            setAccessDeniedReason(UNAUTHORIZED_PORTAL_ACCESS_MESSAGE);
            return {
              authorized: false,
              error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
              authoritativeRole: authRole,
            };
          }
        }
        return { authorized: true, authoritativeRole: authRole };
      }
    },
    [persistVerifiedSession, profile, rbacToken]
  );

  // Listen for browser storage tampering in real time (DevTools Application -> LocalStorage edits)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageOrFocusCheck = () => {
      if (!verifiedRoleSnapshotRef.current) return;
      const raw = localStorage.getItem('maden_faf_active_user');
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        const snap = verifiedRoleSnapshotRef.current;
        if (
          parsed.role !== snap.role ||
          (Array.isArray(parsed.roles) &&
            parsed.roles.some((r: UserRole) => !snap.roles.includes(r)))
        ) {
          void revalidateSession();
        }
      } catch {
        void revalidateSession();
      }
    };

    window.addEventListener('storage', handleStorageOrFocusCheck);
    window.addEventListener('focus', handleStorageOrFocusCheck);
    return () => {
      window.removeEventListener('storage', handleStorageOrFocusCheck);
      window.removeEventListener('focus', handleStorageOrFocusCheck);
    };
  }, [revalidateSession]);

  // Load existing session on mount and verify against server RBAC store
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        let localUser: UserProfile | null = null;
        let storedToken: string | null = null;
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('maden_faf_active_user');
          storedToken = localStorage.getItem('maden_faf_rbac_token');
          if (saved) {
            try {
              localUser = JSON.parse(saved);
            } catch {
              localUser = null;
            }
          }
        }

        if (localUser?.email) {
          try {
            const res = await fetch('/api/auth/rbac', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'validateSession',
                email: localUser.email,
                clientRole: localUser.role,
                clientRoles: localUser.roles,
                rbacToken: storedToken,
              }),
            });
            const data = await res.json();
            if (isMounted && data?.authoritativeProfile) {
              const authProf: UserProfile = data.authoritativeProfile;
              const isDev = authProf.email.toLowerCase() === 'pravakarghosh.2025@gmail.com';
              AcademyDataManager.setDeveloperAuthenticated(isDev);
              persistVerifiedSession(authProf, data.rbacToken || storedToken);
              if (data.tampered) {
                setAccessDeniedReason(UNAUTHORIZED_PORTAL_ACCESS_MESSAGE);
              }
              setIsLoading(false);
              return;
            }
          } catch {
            // Fallback to seed/registry lookup
          }
        }

        // Check Supabase session if active
        if (isSupabaseActive) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            const userEmail = (session.user.email || '').toLowerCase();
            const isDev = userEmail === 'pravakarghosh.2025@gmail.com';
            AcademyDataManager.setDeveloperAuthenticated(isDev);

            try {
              const verifyRes = await fetch('/api/auth/rbac', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'loginVerify',
                  email: userEmail,
                  supabaseUser: session.user,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyData?.authoritativeProfile && isMounted) {
                persistVerifiedSession(verifyData.authoritativeProfile, verifyData.rbacToken);
                setIsLoading(false);
                return;
              }
            } catch {
              // Fallback
            }

            const registered = lookupProfileByEmail(userEmail);
            const fallbackRole: UserRole = registered?.role || 'member';
            const userProf: UserProfile = {
              id: session.user.id,
              email: userEmail,
              fullName:
                session.user.user_metadata?.full_name ||
                registered?.fullName ||
                userEmail.split('@')[0],
              role: fallbackRole,
              roles: registered?.approvedByAdmin && registered.roles ? registered.roles : [fallbackRole],
              campus:
                session.user.user_metadata?.campus ||
                registered?.campus ||
                'Gayeshpur Flagship Campus',
              avatarUrl: registered?.avatarUrl,
              status: registered?.status || 'active',
            };
            persistVerifiedSession(userProf, storedToken);
          } else if (localUser && isMounted) {
            const authoritative = lookupProfileByEmail(localUser.email);
            if (authoritative && isValidRole(authoritative.role)) {
              if (localUser.role !== authoritative.role) {
                setAccessDeniedReason(UNAUTHORIZED_PORTAL_ACCESS_MESSAGE);
              }
              persistVerifiedSession(authoritative, storedToken);
            } else {
              localStorage.removeItem('maden_faf_active_user');
              localStorage.removeItem('maden_faf_rbac_token');
            }
          }
        } else if (localUser && isMounted) {
          const authoritative = lookupProfileByEmail(localUser.email);
          if (authoritative && isValidRole(authoritative.role)) {
            if (localUser.role !== authoritative.role) {
              setAccessDeniedReason(UNAUTHORIZED_PORTAL_ACCESS_MESSAGE);
            }
            persistVerifiedSession(authoritative, storedToken);
          } else {
            localStorage.removeItem('maden_faf_active_user');
            localStorage.removeItem('maden_faf_rbac_token');
          }
        }
      } catch (err) {
        console.warn('Auth initialization warning:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [isSupabaseActive, persistVerifiedSession]);

  const login = async (
    email: string,
    password: string,
    requestedPortalRole?: UserRole | 'auto'
  ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    setIsLoading(true);
    setAccessDeniedReason(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // 1. Master Developer account check
      if (normalizedEmail === 'pravakarghosh.2025@gmail.com') {
        if (password !== 'maden-dev-2026') {
          setIsLoading(false);
          AcademyDataManager.setDeveloperAuthenticated(false);
          return { success: false, error: 'Invalid password for Master Developer account.' };
        }
      } else {
        AcademyDataManager.setDeveloperAuthenticated(false);
      }

      // 2. Authenticate with Supabase if configured
      let supabaseUser: any = null;
      if (isSupabaseActive && normalizedEmail !== 'pravakarghosh.2025@gmail.com') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (!error && data?.user) {
          supabaseUser = data.user;
        }
      }

      // 3. Authoritative server-side RBAC role lookup & portal authorization verification
      const rbacRes = await fetch('/api/auth/rbac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'loginVerify',
          email: normalizedEmail,
          requestedPortalRole: requestedPortalRole || 'auto',
          supabaseUser,
        }),
      });

      const rbacData = await rbacRes.json();

      if (!rbacRes.ok || !rbacData.success) {
        // If user logged into Supabase Auth but attempted an unauthorized role portal, sign out immediately!
        if (isSupabaseActive && supabaseUser) {
          try {
            await supabase.auth.signOut();
          } catch {
            // Ignore
          }
        }
        const errMsg = rbacData?.error || UNAUTHORIZED_PORTAL_ACCESS_MESSAGE;
        if (rbacRes.status === 403) {
          setAccessDeniedReason(errMsg);
        }
        setIsLoading(false);
        return { success: false, error: errMsg };
      }

      const verifiedProfile: UserProfile = rbacData.authoritativeProfile;
      if (normalizedEmail === 'pravakarghosh.2025@gmail.com') {
        AcademyDataManager.setDeveloperAuthenticated(true);
      }

      persistVerifiedSession(verifiedProfile, rbacData.rbacToken);
      setIsLoading(false);
      return { success: true, role: verifiedProfile.role };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Login encountered an unexpected error' };
    }
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    requestedRole: UserRole = 'member'
  ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    setIsLoading(true);
    setAccessDeniedReason(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Security: Never allow self-assigning privileged roles
      if (!canSelfAssignRole(requestedRole)) {
        setIsLoading(false);
        setAccessDeniedReason(UNAUTHORIZED_PORTAL_ACCESS_MESSAGE);
        return {
          success: false,
          error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
        };
      }

      const role: UserRole = requestedRole;

      // 1. Register in server-side authoritative RBAC store first (prevents duplicate or cross-role registration)
      const rbacRegRes = await fetch('/api/auth/rbac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: normalizedEmail,
          fullName: fullName.trim(),
          requestedRole: role,
          campus: 'Gayeshpur Flagship Campus',
        }),
      });

      const rbacRegData = await rbacRegRes.json();
      if (!rbacRegRes.ok || !rbacRegData.success) {
        setIsLoading(false);
        return {
          success: false,
          error:
            rbacRegData?.error ||
            'An account with this email already exists. Please sign in using your registered account role.',
        };
      }

      const serverProfile: UserProfile = rbacRegData.authoritativeProfile;

      // 2. Also register in Supabase Auth if active (non-blocking if trigger/network fails)
      if (isSupabaseActive) {
        try {
          const legacyDbCompatibleRole =
            role === 'player' || role === 'parent' ? role : 'player';

          await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              data: {
                full_name: fullName.trim(),
                role: legacyDbCompatibleRole,
                portal_role: role,
                maden_role: role,
                roles: [role],
                campus: 'Gayeshpur Flagship Campus',
              },
            },
          });
        } catch {
          // Non-blocking: authoritative account is persisted in server RBAC store
        }
      }

      // 3. If registered as a Member, ensure an initial draft Member dossier is created
      if (serverProfile.role === 'member') {
        try {
          const initialDossier = DonatorsPortalService.getMemberProfileByUid(
            serverProfile.id,
            serverProfile.email,
            serverProfile.fullName
          );
          DonatorsPortalService.saveMemberProfile(serverProfile.id, initialDossier, true);
        } catch {
          // Non-blocking
        }
      }

      persistVerifiedSession(serverProfile, rbacRegData.rbacToken);
      setIsLoading(false);
      return { success: true, role: serverProfile.role };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Registration failed' };
    }
  };

  // Self-service role escalation is strictly prohibited under the One Account, One Assigned Role policy
  const grantMemberAccess = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await fetch('/api/auth/rbac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'selfModifyRoleAttempt',
          email: profile?.email || 'unknown',
          attemptedRole: 'member',
        }),
      });
    } catch {
      // Ignore
    }
    setAccessDeniedReason(UNAUTHORIZED_PORTAL_ACCESS_MESSAGE);
    return {
      success: false,
      error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
    };
  };

  const logout = async () => {
    AcademyDataManager.setDeveloperAuthenticated(false);
    verifiedRoleSnapshotRef.current = null;
    setAccessDeniedReason(null);
    setRbacToken(null);
    if (isSupabaseActive) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Signout exception:', e);
      }
    }
    setUser(null);
    setProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('maden_faf_active_user');
      localStorage.removeItem('maden_faf_rbac_token');
      localStorage.removeItem('maden_dev_auth_session');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        rbacToken,
        isLoading,
        isSupabaseActive,
        accessDeniedReason,
        clearAccessDenied,
        login,
        signup,
        revalidateSession,
        grantMemberAccess,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
