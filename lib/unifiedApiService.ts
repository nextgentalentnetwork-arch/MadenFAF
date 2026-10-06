'use client';

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  lastError: string | null;
  lastAction: string | null;
}

let currentSyncStatus: SyncStatus = {
  isSyncing: false,
  lastSyncedAt: null,
  lastError: null,
  lastAction: null,
};

const statusListeners = new Set<(status: SyncStatus) => void>();

function notifyStatusChange() {
  statusListeners.forEach((listener) => listener({ ...currentSyncStatus }));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('maden_sync_status', { detail: { ...currentSyncStatus } })
    );
  }
}

export const UnifiedApiService = {
  getSyncStatus(): SyncStatus {
    return { ...currentSyncStatus };
  },

  subscribeStatus(listener: (status: SyncStatus) => void): () => void {
    statusListeners.add(listener);
    listener({ ...currentSyncStatus });
    return () => statusListeners.delete(listener);
  },

  // Asynchronously persist single item or change to Supabase
  async persistChange(params: {
    section:
      | 'heroConfig'
      | 'coaches'
      | 'fixtures'
      | 'news'
      | 'campuses'
      | 'programs'
      | 'events'
      | 'trials'
      | 'scholarships'
      | 'testimonials'
      | 'sponsors'
      | 'parentDeliverables'
      | 'portalConfig'
      | 'toggles';
    action: 'upsert' | 'delete' | 'syncAll';
    data?: any;
    id?: string;
    allData?: any[];
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    currentSyncStatus = {
      ...currentSyncStatus,
      isSyncing: true,
      lastAction: `${params.action} on ${params.section}`,
    };
    notifyStatusChange();

    try {
      const response = await fetch('/api/academy-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const result = await response.json();

      if (result.success) {
        currentSyncStatus = {
          isSyncing: false,
          lastSyncedAt: new Date().toLocaleTimeString(),
          lastError: null,
          lastAction: `Persisted ${params.section} to Supabase`,
        };
      } else {
        currentSyncStatus = {
          isSyncing: false,
          lastSyncedAt: currentSyncStatus.lastSyncedAt,
          lastError: result.error || 'Failed to save to Supabase',
          lastAction: `Failed ${params.section}`,
        };
      }
      notifyStatusChange();
      return result;
    } catch (err: any) {
      console.warn('Supabase sync notice:', err?.message || err);
      currentSyncStatus = {
        isSyncing: false,
        lastSyncedAt: currentSyncStatus.lastSyncedAt,
        lastError: err?.message || 'Network error connecting to API',
        lastAction: `Offline queue for ${params.section}`,
      };
      notifyStatusChange();
      return { success: false, error: err?.message };
    }
  },

  // Fetch section data from Supabase backend
  async fetchFromSupabase(
    section: string = 'all'
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`/api/academy-data?section=${section}`);
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  // Bulk sync all local modules to Supabase
  async syncAllSections(sectionsData: {
    heroConfig?: any;
    coaches?: any[];
    fixtures?: any[];
    news?: any[];
    campuses?: any[];
    programs?: any[];
    events?: any[];
    trials?: any[];
    scholarships?: any[];
    testimonials?: any[];
    sponsors?: any[];
    parentDeliverables?: any[];
    portalConfig?: any;
    toggles?: any;
  }): Promise<{ success: boolean; results: Record<string, boolean> }> {
    currentSyncStatus = {
      ...currentSyncStatus,
      isSyncing: true,
      lastAction: 'Bulk syncing all modules to Supabase...',
    };
    notifyStatusChange();

    const results: Record<string, boolean> = {};

    for (const [section, data] of Object.entries(sectionsData)) {
      if (data) {
        const res = await UnifiedApiService.persistChange({
          section: section as any,
          action: 'syncAll',
          allData: Array.isArray(data) ? data : undefined,
          data: !Array.isArray(data) ? data : undefined,
        });
        results[section] = res.success;
      }
    }

    currentSyncStatus = {
      isSyncing: false,
      lastSyncedAt: new Date().toLocaleTimeString(),
      lastError: null,
      lastAction: 'Bulk sync complete!',
    };
    notifyStatusChange();

    return {
      success: Object.values(results).some(Boolean),
      results,
    };
  },
};
