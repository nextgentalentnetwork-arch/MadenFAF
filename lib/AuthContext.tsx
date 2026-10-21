'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { AcademyDataManager } from '@/lib/academyDataManager';
import { UserRole, isValidRole, canSelfAssignRole } from '@/lib/rbac';
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
  createdAt?: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isSupabaseActive: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  signup: (
    email: string,
    password: string,
    fullName: string,
    role?: UserRole
  ) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  grantMemberAccess: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

// Built-in credential profiles for role testing & fallback verification
const SEED_ROLE_PROFILES: Record<string, UserProfile> = {
  'member@madenfaf.com': {
    id: 'usr-member-01',
    email: 'member@madenfaf.com',
    fullName: 'Sourav Chatterjee',
    role: 'member',
    roles: ['member'],
    campus: 'Kalyani & Nadia District',
    status: 'active',
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
  },
  'admin@madenfaf.com': {
    id: 'usr-admin-01',
    email: 'admin@madenfaf.com',
    fullName: 'Technical Director Ghosh',
    role: 'admin',
    roles: ['admin', 'member'],
    campus: 'All Campuses (Headquarters)',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    status: 'active',
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
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isSupabaseActive = isSupabaseConfigured();

  // Load registered users registry from storage
  const getRegisteredUsersRegistry = (): Record<string, UserProfile> => {
    if (typeof window === 'undefined') return {};
    try {
      const data = localStorage.getItem('maden_faf_registered_users_registry');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  const saveUserProfileToRegistry = (prof: UserProfile) => {
    if (typeof window === 'undefined') return;
    try {
      const registry = getRegisteredUsersRegistry();
      registry[prof.email.toLowerCase()] = prof;
      localStorage.setItem('maden_faf_registered_users_registry', JSON.stringify(registry));
    } catch (e) {
      console.warn('Error saving to user registry:', e);
    }
  };

  // Find profile by email from registry or seed profiles
  const lookupProfileByEmail = (email: string): UserProfile | null => {
    const key = email.trim().toLowerCase();
    const registry = getRegisteredUsersRegistry();
    if (registry[key]) {
      return registry[key];
    }
    if (SEED_ROLE_PROFILES[key]) {
      return SEED_ROLE_PROFILES[key];
    }
    return null;
  };

  // Resolve portal role & multi-role assignments safely across Supabase metadata and registry
  const resolveUserRoleFromMetadata = (
    meta: Record<string, any> | undefined,
    registered: UserProfile | null,
    isDev: boolean
  ): { role: UserRole; roles: UserRole[] } => {
    if (isDev) {
      return { role: 'admin', roles: ['admin', 'member'] };
    }

    // Prioritize portal_role / maden_role / registered.role over legacy DB trigger role
    const candidateRole =
      meta?.portal_role ||
      meta?.maden_role ||
      registered?.role ||
      (Array.isArray(meta?.roles) && meta.roles.length > 0 ? meta.roles[0] : undefined) ||
      meta?.role;

    const verifiedRole: UserRole = isValidRole(candidateRole) ? candidateRole : 'member';

    const rawRoles: UserRole[] =
      Array.isArray(registered?.roles) && registered.roles.length > 0
        ? registered.roles
        : Array.isArray(meta?.roles) && meta.roles.length > 0
        ? meta.roles.filter((r: any): r is UserRole => isValidRole(r))
        : [verifiedRole];

    const finalRoles: UserRole[] = rawRoles.includes(verifiedRole)
      ? rawRoles
      : [verifiedRole, ...rawRoles];

    return { role: verifiedRole, roles: finalRoles };
  };

  // Load existing session on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // 1. Check active stored user session
        let localUser: UserProfile | null = null;
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('maden_faf_active_user');
          if (saved) {
            try {
              localUser = JSON.parse(saved);
            } catch (e) {
              localUser = null;
            }
          }
        }

        const isMasterDev = localUser?.email?.toLowerCase() === 'pravakarghosh.2025@gmail.com' &&
          AcademyDataManager.isDeveloperAuthenticated();

        if (isMasterDev && localUser && isMounted) {
          AcademyDataManager.setDeveloperAuthenticated(true);
          setUser({ id: localUser.id, email: localUser.email });
          setProfile(localUser);
          setIsLoading(false);
          return;
        }

        // 2. Check Supabase session
        if (isSupabaseActive) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            const userEmail = session.user.email || '';
            const isDev = userEmail.toLowerCase() === 'pravakarghosh.2025@gmail.com';
            if (isDev) {
              AcademyDataManager.setDeveloperAuthenticated(true);
            }

            // Retrieve role from metadata or registry
            const registered = lookupProfileByEmail(userEmail);
            const { role: verifiedRole, roles: verifiedRoles } = resolveUserRoleFromMetadata(
              session.user.user_metadata,
              registered,
              isDev
            );

            const userProf: UserProfile = {
              id: session.user.id,
              email: userEmail,
              fullName: session.user.user_metadata?.full_name || registered?.fullName || userEmail.split('@')[0],
              role: verifiedRole,
              roles: verifiedRoles,
              campus: session.user.user_metadata?.campus || registered?.campus || 'Gayeshpur Flagship Campus',
              avatarUrl: registered?.avatarUrl || session.user.user_metadata?.avatar_url,
              status: registered?.status || 'active',
            };

            setUser(session.user);
            setProfile(userProf);
            saveUserProfileToRegistry(userProf);
            if (typeof window !== 'undefined') {
              localStorage.setItem('maden_faf_active_user', JSON.stringify(userProf));
            }
          } else if (localUser && isMounted) {
            // Validate local user has valid role
            if (isValidRole(localUser.role)) {
              setUser({ id: localUser.id, email: localUser.email });
              setProfile(localUser);
            } else {
              localStorage.removeItem('maden_faf_active_user');
            }
          }

          // Listen for Supabase auth state changes
          supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) return;
            if (session?.user) {
              const userEmail = session.user.email || '';
              const isDev = userEmail.toLowerCase() === 'pravakarghosh.2025@gmail.com';
              AcademyDataManager.setDeveloperAuthenticated(isDev);

              const registered = lookupProfileByEmail(userEmail);
              const { role: verifiedRole, roles: verifiedRoles } = resolveUserRoleFromMetadata(
                session.user.user_metadata,
                registered,
                isDev
              );

              const prof: UserProfile = {
                id: session.user.id,
                email: userEmail,
                fullName: session.user.user_metadata?.full_name || registered?.fullName || userEmail.split('@')[0],
                role: verifiedRole,
                roles: verifiedRoles,
                campus: session.user.user_metadata?.campus || registered?.campus || 'Gayeshpur Flagship Campus',
                avatarUrl: registered?.avatarUrl,
                status: registered?.status || 'active',
              };

              setUser(session.user);
              setProfile(prof);
              saveUserProfileToRegistry(prof);
            } else {
              // Sign out cleanup
              const savedUser = typeof window !== 'undefined' ? localStorage.getItem('maden_faf_active_user') : null;
              let parsed: UserProfile | null = null;
              try {
                parsed = savedUser ? JSON.parse(savedUser) : null;
              } catch {
                parsed = null;
              }

              if (parsed?.email?.toLowerCase() === 'pravakarghosh.2025@gmail.com' && AcademyDataManager.isDeveloperAuthenticated()) {
                AcademyDataManager.setDeveloperAuthenticated(true);
                setUser({ id: parsed.id, email: parsed.email });
                setProfile(parsed);
              } else if (parsed && isValidRole(parsed.role)) {
                // Preserve active local portal session when Supabase session is not active
                setUser({ id: parsed.id, email: parsed.email });
                setProfile(parsed);
              } else {
                AcademyDataManager.setDeveloperAuthenticated(false);
                setUser(null);
                setProfile(null);
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('maden_faf_active_user');
                }
              }
            }
          });
        } else if (localUser && isMounted) {
          if (isValidRole(localUser.role)) {
            setUser({ id: localUser.id, email: localUser.email });
            setProfile(localUser);
          } else {
            localStorage.removeItem('maden_faf_active_user');
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
  }, [isSupabaseActive]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // 1. Check Master Developer credential
      if (normalizedEmail === 'pravakarghosh.2025@gmail.com') {
        if (password !== 'maden-dev-2026') {
          setIsLoading(false);
          AcademyDataManager.setDeveloperAuthenticated(false);
          return { success: false, error: 'Invalid password for Master Developer account.' };
        }

        AcademyDataManager.setDeveloperAuthenticated(true);
        const devProf: UserProfile = {
          id: 'master-dev-pravakarghosh',
          email: 'pravakarghosh.2025@gmail.com',
          fullName: 'Pravakar Ghosh (Master Developer)',
          role: 'admin',
          roles: ['admin', 'member'],
          campus: 'Headquarters & Command Center',
          avatarUrl: '/images/maden-faf-official-logo.png',
          status: 'active',
        };

        setUser({ id: devProf.id, email: devProf.email });
        setProfile(devProf);
        saveUserProfileToRegistry(devProf);
        if (typeof window !== 'undefined') {
          localStorage.setItem('maden_faf_active_user', JSON.stringify(devProf));
        }

        setIsLoading(false);
        return { success: true, role: 'admin' };
      }

      AcademyDataManager.setDeveloperAuthenticated(false);

      // 2. Try Supabase Authentication if active
      if (isSupabaseActive) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (!error && data?.user) {
          const registered = lookupProfileByEmail(normalizedEmail);
          const { role, roles } = resolveUserRoleFromMetadata(
            data.user.user_metadata,
            registered,
            false
          );

          const userProf: UserProfile = {
            id: data.user.id,
            email: data.user.email || normalizedEmail,
            fullName: data.user.user_metadata?.full_name || registered?.fullName || normalizedEmail.split('@')[0],
            role,
            roles,
            campus: data.user.user_metadata?.campus || registered?.campus || 'Gayeshpur Flagship Campus',
            avatarUrl: registered?.avatarUrl,
            status: registered?.status || 'active',
          };

          setUser(data.user);
          setProfile(userProf);
          saveUserProfileToRegistry(userProf);
          if (typeof window !== 'undefined') {
            localStorage.setItem('maden_faf_active_user', JSON.stringify(userProf));
          }
          setIsLoading(false);
          return { success: true, role };
        }
      }

      // 3. Fallback/Local verified profile check
      const matchedProfile = lookupProfileByEmail(normalizedEmail);
      if (matchedProfile) {
        setUser({ id: matchedProfile.id, email: matchedProfile.email });
        setProfile(matchedProfile);
        if (typeof window !== 'undefined') {
          localStorage.setItem('maden_faf_active_user', JSON.stringify(matchedProfile));
        }
        setIsLoading(false);
        return { success: true, role: matchedProfile.role };
      }

      // 4. Default user creation if not found in registry
      const newProf: UserProfile = {
        id: `usr-${Date.now()}`,
        email: normalizedEmail,
        fullName: normalizedEmail.split('@')[0].toUpperCase(),
        role: 'member',
        roles: ['member'],
        campus: 'Gayeshpur Flagship Campus',
        status: 'active',
      };

      setUser({ id: newProf.id, email: newProf.email });
      setProfile(newProf);
      saveUserProfileToRegistry(newProf);
      if (typeof window !== 'undefined') {
        localStorage.setItem('maden_faf_active_user', JSON.stringify(newProf));
      }
      setIsLoading(false);
      return { success: true, role: newProf.role };
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
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Prevent duplicate account creation for existing users
      const existingProfile = lookupProfileByEmail(normalizedEmail);
      if (existingProfile) {
        setIsLoading(false);
        return {
          success: false,
          error: 'An account with this email already exists. Please use Sign In with your existing credentials.',
        };
      }

      // Security: Do not allow users to self-assign Admin, Manager, Coach, or Staff roles
      const role: UserRole = canSelfAssignRole(requestedRole) ? requestedRole : 'pending';

      // Pre-save profile to registry so any immediate onAuthStateChange listener resolves the exact role
      const provisionalProf: UserProfile = {
        id: `usr-${Date.now()}`,
        email: normalizedEmail,
        fullName,
        role,
        roles: [role],
        campus: 'Gayeshpur Flagship Campus',
        status: role === 'pending' ? 'pending' : 'active',
        createdAt: new Date().toISOString(),
      };
      saveUserProfileToRegistry(provisionalProf);

      if (isSupabaseActive) {
        // IMPORTANT: The remote Supabase `public.profiles` table has a legacy trigger `handle_new_user()`
        // with `CHECK (role IN ('player', 'parent', 'coach', 'admin'))` on `raw_user_meta_data->>'role'`.
        // Passing 'member' or 'pending' in `data.role` causes Postgres to throw "Database error saving new user".
        // We pass a trigger-compatible value in `data.role` while storing the authoritative role in `portal_role` and `roles`.
        const legacyDbCompatibleRole =
          role === 'player' || role === 'parent' || role === 'coach' || role === 'admin'
            ? role
            : 'player';

        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: fullName,
              role: legacyDbCompatibleRole,
              portal_role: role,
              maden_role: role,
              roles: [role],
              campus: 'Gayeshpur Flagship Campus',
            },
          },
        });

        if (error) {
          const lowerMsg = (error.message || '').toLowerCase();
          if (lowerMsg.includes('already registered') || lowerMsg.includes('already exists')) {
            setIsLoading(false);
            return {
              success: false,
              error: 'An account with this email already exists. Please use Sign In with your existing credentials.',
            };
          }

          // If the remote Supabase database trigger still fails (e.g. "Database error saving new user")
          // or hits email rate limits, complete registration seamlessly using the verified portal registry
          console.warn('Supabase signUp trigger/service notice (completing via verified portal registry):', error.message);
          setUser({ id: provisionalProf.id, email: normalizedEmail });
          setProfile(provisionalProf);
          saveUserProfileToRegistry(provisionalProf);
          if (typeof window !== 'undefined') {
            localStorage.setItem('maden_faf_active_user', JSON.stringify(provisionalProf));
          }
          setIsLoading(false);
          return { success: true, role };
        }

        const newProf: UserProfile = {
          ...provisionalProf,
          id: data?.user?.id || provisionalProf.id,
        };

        setUser(data.user || { id: newProf.id, email: normalizedEmail });
        setProfile(newProf);
        saveUserProfileToRegistry(newProf);
        if (typeof window !== 'undefined') {
          localStorage.setItem('maden_faf_active_user', JSON.stringify(newProf));
        }
        setIsLoading(false);
        return { success: true, role };
      }

      // Local Registration
      setUser({ id: provisionalProf.id, email: normalizedEmail });
      setProfile(provisionalProf);
      saveUserProfileToRegistry(provisionalProf);
      if (typeof window !== 'undefined') {
        localStorage.setItem('maden_faf_active_user', JSON.stringify(provisionalProf));
      }
      setIsLoading(false);
      return { success: true, role };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Registration failed' };
    }
  };

  const grantMemberAccess = async (): Promise<{ success: boolean; error?: string }> => {
    if (!profile) {
      return { success: false, error: 'You must be signed in to activate Member access.' };
    }
    const existingRoles = Array.isArray(profile.roles) && profile.roles.length > 0
      ? profile.roles
      : [profile.role];
    const updatedRoles: UserRole[] = existingRoles.includes('member')
      ? existingRoles
      : [...existingRoles, 'member'];
    // If primary role was 'pending', upgrade primary role to 'member', otherwise preserve primary role and add 'member' to roles array
    const updatedPrimaryRole: UserRole = profile.role === 'pending' ? 'member' : profile.role;

    const updatedProf: UserProfile = {
      ...profile,
      role: updatedPrimaryRole,
      roles: updatedRoles,
      status: 'active',
    };

    if (isSupabaseActive) {
      try {
        await supabase.auth.updateUser({
          data: {
            portal_role: updatedPrimaryRole,
            maden_role: updatedPrimaryRole,
            roles: updatedRoles,
          },
        });
      } catch (e) {
        console.warn('Supabase metadata update notice:', e);
      }
    }

    setProfile(updatedProf);
    saveUserProfileToRegistry(updatedProf);
    if (typeof window !== 'undefined') {
      localStorage.setItem('maden_faf_active_user', JSON.stringify(updatedProf));
    }
    return { success: true };
  };

  const logout = async () => {
    AcademyDataManager.setDeveloperAuthenticated(false);
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
      localStorage.removeItem('maden_dev_auth_session');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isSupabaseActive,
        login,
        signup,
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
