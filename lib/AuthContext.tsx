'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { AcademyDataManager } from '@/lib/academyDataManager';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'player' | 'parent' | 'coach' | 'admin';
  campus?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isSupabaseActive: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, fullName: string, role?: 'player' | 'parent' | 'coach' | 'admin') => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginWithDemo: (role: 'player' | 'parent' | 'coach' | 'admin') => void;
}

const DEMO_PROFILES: Record<string, UserProfile> = {
  player: {
    id: 'demo-player-01',
    email: 'subham.roy@madenfaf.com',
    fullName: 'Subham Roy',
    role: 'player',
    campus: 'Gayeshpur Flagship Campus',
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80',
  },
  parent: {
    id: 'demo-parent-01',
    email: 'pradip.roy@madenfaf.com',
    fullName: 'Mr. Pradip Roy',
    role: 'parent',
    campus: 'Gayeshpur Campus',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  },
  coach: {
    id: 'demo-coach-01',
    email: 'bapi.roy@madenfaf.com',
    fullName: 'Coach Bapi Roy (AFC B)',
    role: 'coach',
    campus: 'Gayeshpur Campus',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
  },
  admin: {
    id: 'demo-admin-01',
    email: 'admin@madenfaf.com',
    fullName: 'Technical Director Ghosh',
    role: 'admin',
    campus: 'All Campuses (Headquarters)',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isSupabaseActive = isSupabaseConfigured();

  // Load existing session or persistent demo user on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // 1. Check local storage first for persisted Master Developer session
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

        const isLocalDev = localUser?.email?.toLowerCase() === 'pravakarghosh.2025@gmail.com' &&
          AcademyDataManager.isDeveloperAuthenticated();

        if (isLocalDev && localUser && isMounted) {
          AcademyDataManager.setDeveloperAuthenticated(true);
          setUser({ id: localUser.id, email: localUser.email });
          setProfile(localUser);
        }

        if (isSupabaseActive) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            const userEmail = session.user.email || '';
            const isDev = userEmail.toLowerCase() === 'pravakarghosh.2025@gmail.com';
            if (isDev) {
              AcademyDataManager.setDeveloperAuthenticated(true);
            }
            setUser(session.user);
            setProfile({
              id: session.user.id,
              email: userEmail,
              fullName: session.user.user_metadata?.full_name || userEmail.split('@')[0] || 'User',
              role: (session.user.user_metadata?.role as any) || (isDev ? 'admin' : 'player'),
              campus: session.user.user_metadata?.campus || 'Gayeshpur',
            });
          } else if (!isLocalDev && localUser && isMounted) {
            // Restore active local user profile if not master dev
            setUser({ id: localUser.id, email: localUser.email });
            setProfile(localUser);
          }

          // Listen for Supabase auth state changes
          supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) return;
            if (session?.user) {
              const userEmail = session.user.email || '';
              const isDev = userEmail.toLowerCase() === 'pravakarghosh.2025@gmail.com';
              AcademyDataManager.setDeveloperAuthenticated(isDev);
              setUser(session.user);
              setProfile({
                id: session.user.id,
                email: userEmail,
                fullName: session.user.user_metadata?.full_name || userEmail.split('@')[0] || 'User',
                role: (session.user.user_metadata?.role as any) || (isDev ? 'admin' : 'player'),
                campus: session.user.user_metadata?.campus || 'Gayeshpur',
              });
            } else {
              // If Supabase session is null, check if local master developer is active
              const savedUser = typeof window !== 'undefined' ? localStorage.getItem('maden_faf_active_user') : null;
              let parsed: UserProfile | null = null;
              try {
                parsed = savedUser ? JSON.parse(savedUser) : null;
              } catch {
                parsed = null;
              }

              if (parsed?.email?.toLowerCase() === 'pravakarghosh.2025@gmail.com' && AcademyDataManager.isDeveloperAuthenticated()) {
                // Keep Master Developer active
                AcademyDataManager.setDeveloperAuthenticated(true);
                setUser({ id: parsed.id, email: parsed.email });
                setProfile(parsed);
              } else {
                AcademyDataManager.setDeveloperAuthenticated(false);
                setUser(null);
                setProfile(null);
              }
            }
          });
        } else if (!isLocalDev && localUser && isMounted) {
          setUser({ id: localUser.id, email: localUser.email });
          setProfile(localUser);
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

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const isDevCredential =
        normalizedEmail === 'pravakarghosh.2025@gmail.com' &&
        password === 'maden-dev-2026';

      // 1. Check if user is attempting to sign in as the Master Developer
      if (normalizedEmail === 'pravakarghosh.2025@gmail.com') {
        if (!isDevCredential) {
          setIsLoading(false);
          AcademyDataManager.setDeveloperAuthenticated(false);
          return { success: false, error: 'Invalid password for Master Developer account.' };
        }

        // Grant exclusive backend developer authentication
        AcademyDataManager.setDeveloperAuthenticated(true);

        const devProf: UserProfile = {
          id: 'master-dev-pravakarghosh',
          email: 'pravakarghosh.2025@gmail.com',
          fullName: 'Pravakar Ghosh (Master Developer)',
          role: 'admin',
          campus: 'Headquarters & Command Center',
          avatarUrl: '/images/maden-faf-official-logo.png',
        };

        setUser({ id: devProf.id, email: devProf.email });
        setProfile(devProf);
        if (typeof window !== 'undefined') {
          localStorage.setItem('maden_faf_active_user', JSON.stringify(devProf));
        }

        // Background sync with Supabase Auth if available
        if (isSupabaseActive) {
          supabase.auth.signInWithPassword({ email: devProf.email, password }).catch(() => {
            supabase.auth.signUp({
              email: devProf.email,
              password,
              options: { data: { full_name: devProf.fullName, role: 'admin' } },
            }).catch(() => {});
          });
        }

        setIsLoading(false);
        return { success: true };
      }

      // 2. For ANY other credential: strictly ensure backend developer access is revoked
      AcademyDataManager.setDeveloperAuthenticated(false);

      if (isSupabaseActive) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const userProf: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.full_name || email.split('@')[0],
            role: (data.user.user_metadata?.role as any) || 'player',
            campus: data.user.user_metadata?.campus || 'Gayeshpur',
          };
          setUser(data.user);
          setProfile(userProf);
          if (typeof window !== 'undefined') {
            localStorage.setItem('maden_faf_active_user', JSON.stringify(userProf));
          }
          setIsLoading(false);
          return { success: true };
        }
      }

      // Demo/Fallback authentication handler
      const matchedDemo = Object.values(DEMO_PROFILES).find(p => p.email.toLowerCase() === email.toLowerCase());
      const selectedProf = matchedDemo || {
        id: `user-${Date.now()}`,
        email,
        fullName: email.split('@')[0].toUpperCase(),
        role: 'player' as const,
        campus: 'Gayeshpur Campus',
      };

      setUser({ id: selectedProf.id, email: selectedProf.email });
      setProfile(selectedProf);
      if (typeof window !== 'undefined') {
        localStorage.setItem('maden_faf_active_user', JSON.stringify(selectedProf));
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Login encountered an issue' };
    }
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    role: 'player' | 'parent' | 'coach' | 'admin' = 'player'
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseActive) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role,
              campus: 'Gayeshpur Campus',
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const newProf: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            fullName,
            role,
            campus: 'Gayeshpur Campus',
          };
          setUser(data.user);
          setProfile(newProf);
          if (typeof window !== 'undefined') {
            localStorage.setItem('maden_faf_active_user', JSON.stringify(newProf));
          }
          setIsLoading(false);
          return { success: true };
        }
      }

      // Fallback local registration
      const newProf: UserProfile = {
        id: `user-${Date.now()}`,
        email,
        fullName,
        role,
        campus: 'Gayeshpur Campus',
      };

      setUser({ id: newProf.id, email });
      setProfile(newProf);
      if (typeof window !== 'undefined') {
        localStorage.setItem('maden_faf_active_user', JSON.stringify(newProf));
      }
      setIsLoading(false);
      return { success: true };
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

  const loginWithDemo = (role: 'player' | 'parent' | 'coach' | 'admin') => {
    AcademyDataManager.setDeveloperAuthenticated(false);
    const demo = DEMO_PROFILES[role];
    setUser({ id: demo.id, email: demo.email });
    setProfile(demo);
    if (typeof window !== 'undefined') {
      localStorage.setItem('maden_faf_active_user', JSON.stringify(demo));
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
        loginWithDemo,
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
