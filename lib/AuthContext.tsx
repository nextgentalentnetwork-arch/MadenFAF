'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { AcademyDataManager } from '@/lib/academyDataManager';
import { DonatorsPortalService } from '@/lib/donatorsPortalService';
import {
  UserRole,
  isValidRole,
  normalizeToTwoRoles,
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
  status?: 'active' | 'suspended';
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

// Simplified Role Structure: Strictly TWO Account Roles ('member' and 'admin')
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
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getRegisteredUsersRegistry(): Record<string, UserProfile> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem('maden_faf_registered_users_registry');
    if (!data) return {};
    const parsed = JSON.parse(data);
    // Keep a one-time backup before normalizing legacy roles
    if (!localStorage.getItem('maden_faf_registered_users_backup_v1')) {
      localStorage.setItem('maden_faf_registered_users_backup_v1', data);
    }
    const normalized: Record<string, UserProfile> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, any>)) {
      if (v && typeof v === 'object') {
        const key = k.toLowerCase().trim();
        const isProtectedAdmin =
          key === 'admin@madenfaf.com' || key === 'pravakarghosh.2025@gmail.com';
        const role: UserRole = isProtectedAdmin ? 'admin' : normalizeToTwoRoles(v.role);
        normalized[key] = {
          ...v,
          email: key,
          role,
          roles: isProtectedAdmin ? ['admin', 'member'] : [role],
          approvedByAdmin: isProtectedAdmin ? 'system' : v.approvedByAdmin,
        };
      }
    }
    return normalized;
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
  if (SEED_ROLE_PROFILES[key]) {
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

  const profileRef = useRef<UserProfile | null>(null);
  const rbacTokenRef = useRef<string | null>(null);

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
    const isProtectedAdmin =
      prof.email?.toLowerCase().trim() === 'admin@madenfaf.com' ||
      prof.email?.toLowerCase().trim() === 'pravakarghosh.2025@gmail.com';
    const safeRole: UserRole = isProtectedAdmin ? 'admin' : normalizeToTwoRoles(prof.role);
    const authoritativeRoles: UserRole[] = isProtectedAdmin
      ? ['admin', 'member']
      : Array.isArray(prof.roles) && prof.roles.length > 0 && prof.approvedByAdmin
        ? prof.roles.filter((r): r is UserRole => isValidRole(r))
        : [safeRole];

    const normalizedProf: UserProfile = {
      ...prof,
      role: safeRole,
      roles: authoritativeRoles.length > 0 ? authoritativeRoles : [safeRole],
      approvedByAdmin: isProtectedAdmin ? 'system' : prof.approvedByAdmin,
    };

    verifiedRoleSnapshotRef.current = {
      email: normalizedProf.email.toLowerCase(),
      role: normalizedProf.role,
      roles: [...(normalizedProf.roles || [normalizedProf.role])],
    };

    profileRef.current = normalizedProf;
    setAccessDeniedReason(null);
    setUser((prev: any) =>
      prev?.id === normalizedProf.id && prev?.email === normalizedProf.email
        ? prev
        : { id: normalizedProf.id, email: normalizedProf.email }
    );
    setProfile((prev) => {
      if (
        prev &&
        prev.id === normalizedProf.id &&
        prev.email === normalizedProf.email &&
        prev.fullName === normalizedProf.fullName &&
        prev.role === normalizedProf.role &&
        JSON.stringify(prev.roles) === JSON.stringify(normalizedProf.roles) &&
        prev.status === normalizedProf.status &&
        prev.campus === normalizedProf.campus
      ) {
        return prev;
      }
      return normalizedProf;
    });
    saveUserProfileToRegistry(normalizedProf);

    if (typeof window !== 'undefined') {
      localStorage.setItem('maden_faf_active_user', JSON.stringify(normalizedProf));
      if (token) {
        rbacTokenRef.current = token;
        setRbacToken((prev) => (prev === token ? prev : token));
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

      const currentProfile = profileRef.current;
      const rawActive = localStorage.getItem('maden_faf_active_user');
      const storedToken =
        localStorage.getItem('maden_faf_rbac_token') || rbacTokenRef.current;
      if (!rawActive && !verifiedRoleSnapshotRef.current && !currentProfile) {
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
        currentProfile?.email ||
        ''
      )
        .toLowerCase()
        .trim();

      if (!emailToCheck) {
        return { authorized: false, error: 'Not authenticated' };
      }

      // 1. Immediate client-side tamper detection: block only if a non-admin account tampered localStorage to claim 'admin'
      if (snapshot && parsedLocal && parsedLocal.email?.toLowerCase().trim() === snapshot.email) {
        const isSnapshotAdmin =
          snapshot.role === 'admin' || snapshot.roles.includes('admin');
        const localClaimsAdmin =
          (typeof parsedLocal.role === 'string' &&
            parsedLocal.role.trim().toLowerCase() === 'admin') ||
          (Array.isArray(parsedLocal.roles) &&
            parsedLocal.roles.some(
              (r) => typeof r === 'string' && r.trim().toLowerCase() === 'admin'
            ));

        if (!isSnapshotAdmin && localClaimsAdmin) {
          setAccessDeniedReason(UNAUTHORIZED_PORTAL_ACCESS_MESSAGE);
          // Restore true role in localStorage so manipulation cannot persist
          const restored: UserProfile = {
            ...(currentProfile || parsedLocal),
            email: snapshot.email,
            role: snapshot.role,
            roles: [...snapshot.roles],
          };
          profileRef.current = restored;
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
            uid: parsedLocal?.id || currentProfile?.id,
            email: emailToCheck,
            fullName: parsedLocal?.fullName || currentProfile?.fullName,
            clientRole: parsedLocal?.role || currentProfile?.role || 'member',
            clientRoles: parsedLocal?.roles || currentProfile?.roles || ['member'],
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

        setAccessDeniedReason(null);
        return {
          authorized: true,
          authoritativeRole: data?.authoritativeProfile?.role || snapshot?.role,
        };
      } catch {
        // Fallback to local verified snapshot if offline
        const authRole = snapshot?.role || parsedLocal?.role || 'member';
        const authRoles = snapshot?.roles || parsedLocal?.roles || [authRole];
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
        setAccessDeniedReason(null);
        return { authorized: true, authoritativeRole: authRole };
      }
    },
    [persistVerifiedSession]
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
        const isSnapAdmin = snap.role === 'admin' || snap.roles.includes('admin');
        const claimsAdmin =
          parsed.role === 'admin' ||
          (Array.isArray(parsed.roles) && parsed.roles.includes('admin'));
        if (!isSnapAdmin && claimsAdmin) {
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
              const rawParsed = JSON.parse(saved);
              if (rawParsed && rawParsed.email) {
                const normRole = normalizeToTwoRoles(rawParsed.role);
                localUser = {
                  ...rawParsed,
                  role: normRole,
                  roles: Array.isArray(rawParsed.roles) ? rawParsed.roles : [normRole],
                };
              }
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
                uid: localUser.id,
                email: localUser.email,
                fullName: localUser.fullName,
                clientRole: localUser.role,
                clientRoles: localUser.roles,
                rbacToken: storedToken,
              }),
            });
            const data = await res.json();
            if (isMounted && data?.authoritativeProfile) {
              const authProf: UserProfile = data.authoritativeProfile;
              const isAdminUser = authProf.role === 'admin';
              AcademyDataManager.setDeveloperAuthenticated(isAdminUser);
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
            const isDev =
              userEmail === 'pravakarghosh.2025@gmail.com' ||
              userEmail === 'admin@madenfaf.com';
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
              roles: [fallbackRole],
              campus:
                session.user.user_metadata?.campus ||
                registered?.campus ||
                'Kalyani & Nadia District',
              avatarUrl: registered?.avatarUrl,
              status: registered?.status || 'active',
            };
            persistVerifiedSession(userProf, storedToken);
          } else if (localUser && isMounted) {
            const authoritative = lookupProfileByEmail(localUser.email);
            if (authoritative && isValidRole(authoritative.role)) {
              persistVerifiedSession(authoritative, storedToken);
            } else {
              persistVerifiedSession(localUser, storedToken);
            }
          }
        } else if (localUser && isMounted) {
          const authoritative = lookupProfileByEmail(localUser.email);
          if (authoritative && isValidRole(authoritative.role)) {
            persistVerifiedSession(authoritative, storedToken);
          } else {
            persistVerifiedSession(localUser, storedToken);
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
      if (verifiedProfile.role === 'admin') {
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

      // Security: Public registration is strictly for 'member' accounts only
      if (!canSelfAssignRole(requestedRole)) {
        setIsLoading(false);
        setAccessDeniedReason(UNAUTHORIZED_PORTAL_ACCESS_MESSAGE);
        return {
          success: false,
          error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
        };
      }

      const role: UserRole = 'member';

      // 1. Register in server-side authoritative RBAC store first
      const rbacRegRes = await fetch('/api/auth/rbac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: normalizedEmail,
          fullName: fullName.trim(),
          requestedRole: role,
          campus: 'Kalyani & Nadia District',
        }),
      });

      const rbacRegData = await rbacRegRes.json();
      if (!rbacRegRes.ok || !rbacRegData.success) {
        setIsLoading(false);
        return {
          success: false,
          error:
            rbacRegData?.error ||
            'Unable to complete registration. Please check your details and try again.',
        };
      }

      const serverProfile: UserProfile = rbacRegData.authoritativeProfile;

      // 2. Ensure an initial draft Member dossier is created for the new Member
      try {
        const initialDossier = DonatorsPortalService.getMemberProfileByUid(
          serverProfile.id,
          serverProfile.email,
          serverProfile.fullName
        );
        DonatorsPortalService.saveMemberProfile(
          serverProfile.id,
          initialDossier,
          true,
          serverProfile.email,
          serverProfile.role
        );
      } catch {
        // Non-blocking
      }

      // 3. Persist verified session immediately so AuthContext state and localStorage are ready before route transition
      persistVerifiedSession(serverProfile, rbacRegData.rbacToken);

      // 4. Also register in Supabase Auth non-blockingly in the background
      if (isSupabaseActive) {
        void supabase.auth
          .signUp({
            email: normalizedEmail,
            password,
            options: {
              data: {
                full_name: fullName.trim(),
                role: 'player', // legacy Supabase column check compatibility
                portal_role: 'member',
                maden_role: 'member',
                roles: ['member'],
                campus: 'Kalyani & Nadia District',
              },
            },
          })
          .catch(() => {
            // Non-blocking: authoritative account is persisted in server RBAC store
          });
      }

      setIsLoading(false);
      // Always return 'member' as target portal role for Donator Member signup so the caller redirects to /portal?role=member
      return { success: true, role: 'member' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Registration failed' };
    }
  };

  // If a signed-in user requests Member portal access, ensure their session is validated for 'member'
  const grantMemberAccess = async (): Promise<{ success: boolean; error?: string }> => {
    if (profileRef.current) {
      setAccessDeniedReason(null);
      return { success: true };
    }
    return {
      success: false,
      error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
    };
  };

  const logout = async () => {
    AcademyDataManager.setDeveloperAuthenticated(false);
    verifiedRoleSnapshotRef.current = null;
    profileRef.current = null;
    rbacTokenRef.current = null;
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
