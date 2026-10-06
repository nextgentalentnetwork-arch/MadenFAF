'use client';

import React, { useEffect } from 'react';
import { AuthProvider } from '@/lib/AuthContext';
import { AcademyDataManager } from '@/lib/academyDataManager';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Reconcile and hydrate latest academy data from Supabase in background
    AcademyDataManager.loadAllFromSupabase().catch(() => {});
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}
