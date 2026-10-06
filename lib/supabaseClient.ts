import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Live Supabase configuration with environment variable support & production defaults
const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cyolljxxcmaekhhllbix.supabase.co';
const configuredAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5b2xsanh4Y21hZWtoaGxsYml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MDA5MzUsImV4cCI6MjEwNjA3NjkzNX0.AQYigXaGpysUDNxP9ei-chUB6MJg_SAU0Q6l5yl4pek';

// Validate if legitimate Supabase URL is present
export const isSupabaseConfigured = (): boolean => {
  return (
    typeof configuredUrl === 'string' &&
    configuredUrl.startsWith('https://') &&
    configuredUrl.includes('.supabase.co') &&
    typeof configuredAnonKey === 'string' &&
    configuredAnonKey.length > 20
  );
};

// Safe client creator: initialize live Supabase client
const createSafeSupabaseClient = (): SupabaseClient => {
  if (isSupabaseConfigured()) {
    return createClient(configuredUrl, configuredAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  // Fallback placeholder client with valid dummy URL so runtime never throws during import
  return createClient(
    'https://placeholder-domain-madenfaf.supabase.co',
    'placeholder-anon-key-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
};

export const supabase = createSafeSupabaseClient();

export interface AcademyRegistrationData {
  id?: string;
  bookingRef: string;
  playerName: string;
  dob: string;
  gender: string;
  parentName: string;
  phone: string;
  email: string;
  location?: string;
  preferredCampus: string;
  position: string;
  experienceLevel: string;
  program: string;
  message?: string;
  status?: 'pending_trial' | 'confirmed' | 'attended' | 'enrolled' | 'waitlist' | 'rejected';
  createdAt?: string;
}

// Health check to test Supabase connection and verify table availability
export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  tableExists: boolean;
  projectUrl: string;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { connected: false, tableExists: false, projectUrl: configuredUrl };
  }

  try {
    const { error } = await supabase.from('academy_registrations').select('id').limit(1);
    if (!error) {
      return { connected: true, tableExists: true, projectUrl: configuredUrl };
    }
    // PGRST205 indicates table does not exist in schema cache yet
    if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
      return {
        connected: true,
        tableExists: false,
        projectUrl: configuredUrl,
        error: "Table 'academy_registrations' not created yet. Run SQL setup in Supabase SQL editor.",
      };
    }
    return {
      connected: true,
      tableExists: false,
      projectUrl: configuredUrl,
      error: error.message,
    };
  } catch (err: any) {
    return {
      connected: false,
      tableExists: false,
      projectUrl: configuredUrl,
      error: err?.message || 'Network error connecting to Supabase',
    };
  }
}

// Helper: Save registration to Supabase database with persistent local fallback
export async function submitRegistration(
  data: Omit<AcademyRegistrationData, 'bookingRef' | 'createdAt' | 'status'>
): Promise<{
  success: boolean;
  bookingRef: string;
  isDatabaseSaved: boolean;
  error?: string;
}> {
  const bookingRef = `MADEN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const fullData: AcademyRegistrationData = {
    ...data,
    bookingRef,
    status: 'pending_trial',
    createdAt: new Date().toISOString(),
  };

  let isDatabaseSaved = false;
  let insertError: string | undefined = undefined;

  // 1. Try Supabase insertion if configured
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('academy_registrations').insert([
        {
          booking_ref: fullData.bookingRef,
          player_name: fullData.playerName,
          dob: fullData.dob,
          gender: fullData.gender,
          parent_name: fullData.parentName,
          phone: fullData.phone,
          email: fullData.email,
          location: fullData.location || '',
          preferred_campus: fullData.preferredCampus,
          position: fullData.position,
          experience_level: fullData.experienceLevel,
          program: fullData.program,
          message: fullData.message || '',
          status: fullData.status,
          created_at: fullData.createdAt,
        },
      ]);

      if (!error) {
        isDatabaseSaved = true;
      } else {
        insertError = error.message;
        console.warn('Supabase insert notice:', error.message);
      }
    } catch (err: any) {
      insertError = err?.message || 'Connection error';
      console.warn('Supabase connection error:', err);
    }
  }

  // 2. Always persist a local copy in browser localStorage for offline durability & instant access
  if (typeof window !== 'undefined') {
    try {
      const existingKey = 'maden_faf_registrations';
      const stored = localStorage.getItem(existingKey);
      const parsed: AcademyRegistrationData[] = stored ? JSON.parse(stored) : [];
      parsed.unshift(fullData);
      localStorage.setItem(existingKey, JSON.stringify(parsed.slice(0, 100)));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }

  return {
    success: true,
    bookingRef,
    isDatabaseSaved,
    error: insertError,
  };
}

// Fetch registrations from Supabase with fallback to localStorage
export async function getRegistrations(): Promise<AcademyRegistrationData[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('academy_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          bookingRef: row.booking_ref,
          playerName: row.player_name,
          dob: row.dob,
          gender: row.gender,
          parentName: row.parent_name,
          phone: row.phone,
          email: row.email,
          location: row.location,
          preferredCampus: row.preferred_campus,
          position: row.position,
          experienceLevel: row.experience_level,
          program: row.program,
          message: row.message,
          status: row.status,
          createdAt: row.created_at,
        }));
      }
    } catch (err) {
      console.warn('Could not query registrations from Supabase, using local store:', err);
    }
  }

  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('maden_faf_registrations');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('LocalStorage read error:', e);
    }
  }

  return [];
}

// Update registration status in Supabase and localStorage
export async function updateRegistrationStatus(
  idOrBookingRef: string,
  newStatus: 'pending_trial' | 'confirmed' | 'attended' | 'enrolled' | 'waitlist' | 'rejected',
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Update Supabase
  if (isSupabaseConfigured()) {
    try {
      const query = idOrBookingRef.includes('-')
        ? supabase.from('academy_registrations').update({ status: newStatus, message: notes }).eq('booking_ref', idOrBookingRef)
        : supabase.from('academy_registrations').update({ status: newStatus, message: notes }).eq('id', idOrBookingRef);
      const { error } = await query;
      if (error) {
        console.warn('Supabase update status error:', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase update status failed:', err);
    }
  }

  // 2. Update LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('maden_faf_registrations');
      if (stored) {
        const list: AcademyRegistrationData[] = JSON.parse(stored);
        const updatedList = list.map((item) => {
          if (item.id === idOrBookingRef || item.bookingRef === idOrBookingRef) {
            return {
              ...item,
              status: newStatus as any,
              message: notes !== undefined ? notes : item.message,
            };
          }
          return item;
        });
        localStorage.setItem('maden_faf_registrations', JSON.stringify(updatedList));
      }
    } catch (e) {
      console.error('LocalStorage update error:', e);
    }
  }

  return { success: true };
}

// Delete registration in Supabase and localStorage
export async function deleteRegistration(
  idOrBookingRef: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Delete in Supabase
  if (isSupabaseConfigured()) {
    try {
      const query = idOrBookingRef.includes('-')
        ? supabase.from('academy_registrations').delete().eq('booking_ref', idOrBookingRef)
        : supabase.from('academy_registrations').delete().eq('id', idOrBookingRef);
      const { error } = await query;
      if (error) {
        console.warn('Supabase delete error:', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase delete failed:', err);
    }
  }

  // 2. Delete in LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('maden_faf_registrations');
      if (stored) {
        const list: AcademyRegistrationData[] = JSON.parse(stored);
        const filtered = list.filter(
          (item) => item.id !== idOrBookingRef && item.bookingRef !== idOrBookingRef
        );
        localStorage.setItem('maden_faf_registrations', JSON.stringify(filtered));
      }
    } catch (e) {
      console.error('LocalStorage delete error:', e);
    }
  }

  return { success: true };
}
