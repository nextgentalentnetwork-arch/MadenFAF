'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { AcademyDataManager } from '@/lib/academyDataManager';
import { UserRole, isValidRole } from '@/lib/rbac';
export type { UserRole };

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  campus?: string;
  avatarUrl?: string;
  status?: 'active' | 'pending' | 'suspended';
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
  logout: () => Promise<void>;
}

// Built-in credential profiles for role testing & fallback verification
const SEED_ROLE_PROFILES: Record<string, UserProfile> = {
  'player@madenfaf.com': {
    id: 'usr-player-01',
    email: 'player@madenfaf.com',
    fullName: 'Subham Roy',
    role: 'player',
    campus: 'Gayeshpur Flagship Campus',
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80',
    status: 'active',
  },
  'parent@madenfaf.com': {
    id: 'usr-parent-01',
    email: 'parent@madenfaf.com',
    fullName: 'Mr. Pradip Roy',
    role: 'parent',
    campus: 'Gayeshpur Campus',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    status: 'active',
  },
  'coach@madenfaf.com': {
    id: 'usr-coach-01',
    email: 'coach@madenfaf.com',
    fullName: 'Coach Bapi Roy (AFC B)',
    role: 'coach',
    campus: 'Gayeshpur Campus',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    status: 'active',
  },
  'manager@madenfaf.com': {
    id: 'usr-manager-01',
    email: 'manager@madenfaf.com',
    fullName: 'Arindam Sen (Campus Director)',
    role: 'manager',
    campus: 'Nadia District & Central Grounds',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    status: 'active',
  },
  'staff1@madenfaf.com': {
    id: 'usr-staff1-01',
    email: 'staff1@madenfaf.com',
    fullName: 'Rohan Das (Intake Coordinator)',
    role: 'staff1',
    campus: 'Gayeshpur Admissions Desk',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    status: 'active',
  },
  'staff2@madenfaf.com': {
    id: 'usr-staff2-01',
    email: 'staff2@madenfaf.com',
    fullName: 'Debasish Paul (Field & Attendance)',
    role: 'staff2',
    campus: 'North 24 Parganas Campus',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    status: 'active',
  },
  'admin@madenfaf.com': {
    id: 'usr-admin-01',
    email: 'admin@madenfaf.com',
    fullName: 'Technical Director Ghosh',
    role: 'admin',
    campus: 'All Campuses (Headquarters)',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    status: 'active',
  },
  'pending@madenfaf.com': {
    id: 'usr-pending-01',
    email: 'pending@madenfaf.com',
    fullName: 'Ananya Roy (Applicant)',
    role: 'pending',
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
            const rawRole = session.user.user_metadata?.role || registered?.role;
            const verifiedRole: UserRole = isValidRole(rawRole) ? rawRole : isDev ? 'admin' : 'player';

            const userProf: UserProfile = {
              id: session.user.id,
              email: userEmail,
              fullName: session.user.user_metadata?.full_name || registered?.fullName || userEmail.split('@')[0],
              role: verifiedRole,
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
              const rawRole = session.user.user_metadata?.role || registered?.role;
              const verifiedRole: UserRole = isValidRole(rawRole) ? rawRole : isDev ? 'admin' : 'player';

              const prof: UserProfile = {
                id: session.user.id,
                email: userEmail,
                fullName: session.user.user_metadata?.full_name || registered?.fullName || userEmail.split('@')[0],
                role: verifiedRole,
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
          const rawRole = data.user.user_metadata?.role || registered?.role;
          const role: UserRole = isValidRole(rawRole) ? rawRole : 'player';

          const userProf: UserProfile = {
            id: data.user.id,
            email: data.user.email || normalizedEmail,
            fullName: data.user.user_metadata?.full_name || registered?.fullName || normalizedEmail.split('@')[0],
            role,
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

      // 4. Default user creation if not found in registry (default to player role or pending)
      const newProf: UserProfile = {
        id: `usr-${Date.now()}`,
        email: normalizedEmail,
        fullName: normalizedEmail.split('@')[0].toUpperCase(),
        role: 'player',
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
    requestedRole: UserRole = 'player'
  ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const role: UserRole = isValidRole(requestedRole) ? requestedRole : 'player';

      if (isSupabaseActive) {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: fullName,
              role,
              campus: 'Gayeshpur Flagship Campus',
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        const newProf: UserProfile = {
          id: data?.user?.id || `usr-${Date.now()}`,
          email: normalizedEmail,
          fullName,
          role,
          campus: 'Gayeshpur Flagship Campus',
          status: role === 'pending' ? 'pending' : 'active',
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
      const newProf: UserProfile = {
        id: `usr-${Date.now()}`,
        email: normalizedEmail,
        fullName,
        role,
        campus: 'Gayeshpur Flagship Campus',
        status: role === 'pending' ? 'pending' : 'active',
      };

      setUser({ id: newProf.id, email: normalizedEmail });
      setProfile(newProf);
      saveUserProfileToRegistry(newProf);
      if (typeof window !== 'undefined') {
        localStorage.setItem('maden_faf_active_user', JSON.stringify(newProf));
      }
      setIsLoading(false);
      return { success: true, role };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Registration failed' };
    }
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
