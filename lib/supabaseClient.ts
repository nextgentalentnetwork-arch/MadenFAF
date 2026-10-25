import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Live Supabase configuration with environment variable support & production defaults
const configuredUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cyolljxxcmaekhhllbix.supabase.co';
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

export type ApplicationStatus =
  | 'pending_review'
  | 'under_review'
  | 'additional_info_required'
  | 'trial_scheduled'
  | 'waitlisted'
  | 'approved'
  | 'rejected'
  | 'completed'
  // Legacy compatibility aliases
  | 'pending_trial'
  | 'confirmed'
  | 'attended'
  | 'enrolled'
  | 'waitlist';

export const APPLICATION_STATUS_META: Record<
  | 'pending_review'
  | 'under_review'
  | 'additional_info_required'
  | 'trial_scheduled'
  | 'waitlisted'
  | 'approved'
  | 'rejected'
  | 'completed',
  { label: string; badgeClass: string; description: string }
> = {
  pending_review: {
    label: 'Pending Review',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    description: 'Application submitted and awaiting initial review by Academy Administration.',
  },
  under_review: {
    label: 'Under Review',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-300',
    description: 'Admin and technical coaching staff are actively reviewing player credentials.',
  },
  additional_info_required: {
    label: 'Additional Information Required',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-300',
    description: 'Additional documents, age proof, or guardian details requested from applicant.',
  },
  trial_scheduled: {
    label: 'Trial Scheduled',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
    description: 'On-pitch trial date, time, venue, and reporting instructions scheduled.',
  },
  waitlisted: {
    label: 'Waitlisted',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-300',
    description: 'Placed on official intake waitlist for the next available squad slot.',
  },
  approved: {
    label: 'Approved',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    description: 'Approved for Academy Admission / Trial Progression.',
  },
  rejected: {
    label: 'Rejected',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
    description: 'Application not selected for current intake cycle.',
  },
  completed: {
    label: 'Completed',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-300',
    description: 'Admission onboarding or trial session evaluation completed.',
  },
};

export function normalizeApplicationStatus(
  status?: string | null
):
  | 'pending_review'
  | 'under_review'
  | 'additional_info_required'
  | 'trial_scheduled'
  | 'waitlisted'
  | 'approved'
  | 'rejected'
  | 'completed' {
  switch (status) {
    case 'pending_review':
    case 'pending_trial':
      return 'pending_review';
    case 'under_review':
    case 'attended':
      return 'under_review';
    case 'additional_info_required':
      return 'additional_info_required';
    case 'trial_scheduled':
    case 'confirmed':
      return 'trial_scheduled';
    case 'waitlisted':
    case 'waitlist':
      return 'waitlisted';
    case 'approved':
    case 'enrolled':
      return 'approved';
    case 'rejected':
      return 'rejected';
    case 'completed':
      return 'completed';
    default:
      return 'pending_review';
  }
}

export interface ScheduledTrialDetails {
  date: string;
  time: string;
  venue: string;
  reportingInstructions: string;
  evaluator?: string;
}

export interface ApplicantNotificationLog {
  id: string;
  sentAt: string;
  channel: 'email' | 'sms';
  status: string;
  message: string;
}

export interface AcademyRegistrationData {
  id?: string;
  bookingRef: string;
  applicationType?: 'admission' | 'trial';
  playerName: string;
  dob: string;
  age?: number;
  gender: string;
  parentName: string;
  phone: string;
  email: string;
  location?: string;
  preferredCampus: string;
  position: string;
  experienceLevel: string;
  currentClubOrAcademy?: string;
  program: string;
  preferredTrialEventId?: string;
  preferredTrialDate?: string;
  preferredVenue?: string;
  playerPhotoUrl?: string;
  playerPhotoName?: string;
  supportingDocumentUrl?: string;
  supportingDocumentName?: string;
  minorConsentConfirmed?: boolean;
  message?: string;
  adminRemarks?: string;
  scheduledTrialDetails?: ScheduledTrialDetails;
  notificationLog?: ApplicantNotificationLog[];
  status?: ApplicationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export function calculateAgeFromDob(dob?: string): number | undefined {
  if (!dob) return undefined;
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 && age < 100 ? age : undefined;
}

export function serializeApplicationMetadata(data: Partial<AcademyRegistrationData>): string {
  const payload = {
    __madenAppV2: true,
    applicationType: data.applicationType || 'admission',
    age: data.age ?? calculateAgeFromDob(data.dob),
    currentClubOrAcademy: data.currentClubOrAcademy || '',
    preferredTrialEventId: data.preferredTrialEventId || '',
    preferredTrialDate: data.preferredTrialDate || '',
    preferredVenue: data.preferredVenue || '',
    playerPhotoUrl: data.playerPhotoUrl || '',
    playerPhotoName: data.playerPhotoName || '',
    supportingDocumentUrl: data.supportingDocumentUrl || '',
    supportingDocumentName: data.supportingDocumentName || '',
    minorConsentConfirmed: Boolean(data.minorConsentConfirmed),
    applicantNotes: data.message || '',
    adminRemarks: data.adminRemarks || '',
    scheduledTrialDetails: data.scheduledTrialDetails,
    notificationLog: data.notificationLog || [],
  };
  return JSON.stringify(payload);
}

export function parseApplicationRow(row: any): AcademyRegistrationData {
  const rawMessage = row.message || '';
  let parsedMeta: any = null;
  if (typeof rawMessage === 'string' && rawMessage.trim().startsWith('{')) {
    try {
      const obj = JSON.parse(rawMessage);
      if (obj && (obj.__madenAppV2 || obj.applicationType)) {
        parsedMeta = obj;
      }
    } catch {
      parsedMeta = null;
    }
  }

  const bookingRef: string = row.booking_ref || row.bookingRef || '';
  const inferredType: 'admission' | 'trial' =
    parsedMeta?.applicationType ||
    row.applicationType ||
    (bookingRef.includes('-TRL-') ? 'trial' : 'admission');

  const dob = row.dob || '';
  return {
    id: row.id,
    bookingRef,
    applicationType: inferredType,
    playerName: row.player_name || row.playerName || '',
    dob,
    age: parsedMeta?.age ?? row.age ?? calculateAgeFromDob(dob),
    gender: row.gender || 'male',
    parentName: row.parent_name || row.parentName || '',
    phone: row.phone || '',
    email: row.email || '',
    location: row.location || '',
    preferredCampus: row.preferred_campus || row.preferredCampus || 'gayeshpur',
    position: row.position || 'midfielder',
    experienceLevel: row.experience_level || row.experienceLevel || 'grassroots',
    currentClubOrAcademy: parsedMeta?.currentClubOrAcademy ?? row.currentClubOrAcademy ?? '',
    program: row.program || 'development',
    preferredTrialEventId: parsedMeta?.preferredTrialEventId ?? row.preferredTrialEventId ?? '',
    preferredTrialDate: parsedMeta?.preferredTrialDate ?? row.preferredTrialDate ?? '',
    preferredVenue: parsedMeta?.preferredVenue ?? row.preferredVenue ?? '',
    playerPhotoUrl: parsedMeta?.playerPhotoUrl ?? row.playerPhotoUrl ?? '',
    playerPhotoName: parsedMeta?.playerPhotoName ?? row.playerPhotoName ?? '',
    supportingDocumentUrl: parsedMeta?.supportingDocumentUrl ?? row.supportingDocumentUrl ?? '',
    supportingDocumentName: parsedMeta?.supportingDocumentName ?? row.supportingDocumentName ?? '',
    minorConsentConfirmed:
      parsedMeta?.minorConsentConfirmed ?? row.minorConsentConfirmed ?? true,
    message: parsedMeta ? parsedMeta.applicantNotes || '' : rawMessage,
    adminRemarks: parsedMeta?.adminRemarks ?? row.adminRemarks ?? '',
    scheduledTrialDetails: parsedMeta?.scheduledTrialDetails ?? row.scheduledTrialDetails,
    notificationLog: parsedMeta?.notificationLog ?? row.notificationLog ?? [],
    status: normalizeApplicationStatus(row.status),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt,
  };
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
    if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
      return {
        connected: true,
        tableExists: false,
        projectUrl: configuredUrl,
        error:
          "Table 'academy_registrations' not created yet. Run SQL setup in Supabase SQL editor.",
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

// Helper: Save admission or trial application to Supabase database with persistent local fallback
export async function submitRegistration(
  data: Omit<AcademyRegistrationData, 'bookingRef' | 'createdAt' | 'status'>
): Promise<{
  success: boolean;
  bookingRef: string;
  isDatabaseSaved: boolean;
  error?: string;
}> {
  const appType = data.applicationType || 'admission';
  const prefix = appType === 'trial' ? 'MADEN-TRL' : 'MADEN-ADM';
  const bookingRef = `${prefix}-${new Date().getFullYear()}-${Math.floor(
    10000 + Math.random() * 90000
  )}`;
  const now = new Date().toISOString();

  const fullData: AcademyRegistrationData = {
    ...data,
    applicationType: appType,
    age: data.age ?? calculateAgeFromDob(data.dob),
    bookingRef,
    status: 'pending_review',
    createdAt: now,
    updatedAt: now,
  };

  let isDatabaseSaved = false;
  let insertError: string | undefined = undefined;

  const serializedMessage = serializeApplicationMetadata(fullData);

  // 1. Try server API / Supabase insertion if configured
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('academy_registrations').insert([
        {
          booking_ref: fullData.bookingRef,
          player_name: fullData.playerName,
          dob: fullData.dob,
          gender: fullData.gender,
          parent_name: fullData.parentName || 'Self / Adult Applicant',
          phone: fullData.phone,
          email: fullData.email || '',
          location: fullData.location || '',
          preferred_campus: fullData.preferredCampus,
          position: fullData.position,
          experience_level: fullData.experienceLevel,
          program: fullData.program,
          message: serializedMessage,
          status: 'pending_review',
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
      localStorage.setItem(existingKey, JSON.stringify(parsed.slice(0, 200)));
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

// Fetch admission & trial applications from Supabase with fallback & merge from localStorage
export async function getRegistrations(): Promise<AcademyRegistrationData[]> {
  let remoteList: AcademyRegistrationData[] = [];

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('academy_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        remoteList = data
          .filter(
            (row: any) =>
              !String(row.booking_ref || '').startsWith('SYS-SYNC-') &&
              row.status !== 'cloud_persisted'
          )
          .map((row: any) => parseApplicationRow(row));
      }
    } catch (err) {
      console.warn('Could not query registrations from Supabase, using local store:', err);
    }
  }

  let localList: AcademyRegistrationData[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('maden_faf_registrations');
      if (stored) {
        const raw = JSON.parse(stored);
        if (Array.isArray(raw)) {
          localList = raw.map((item) => parseApplicationRow(item));
        }
      }
    } catch (e) {
      console.error('LocalStorage read error:', e);
    }
  }

  // Merge by bookingRef so neither remote nor local records are lost
  const mergedMap = new Map<string, AcademyRegistrationData>();
  for (const item of remoteList) {
    mergedMap.set(item.bookingRef, item);
  }
  for (const localItem of localList) {
    if (!mergedMap.has(localItem.bookingRef)) {
      mergedMap.set(localItem.bookingRef, localItem);
    } else {
      // Preserve rich local fields if updated more recently
      const existing = mergedMap.get(localItem.bookingRef)!;
      mergedMap.set(localItem.bookingRef, {
        ...existing,
        playerPhotoUrl: existing.playerPhotoUrl || localItem.playerPhotoUrl,
        supportingDocumentUrl:
          existing.supportingDocumentUrl || localItem.supportingDocumentUrl,
        adminRemarks: localItem.adminRemarks || existing.adminRemarks,
        scheduledTrialDetails:
          localItem.scheduledTrialDetails || existing.scheduledTrialDetails,
        notificationLog:
          (localItem.notificationLog && localItem.notificationLog.length > 0
            ? localItem.notificationLog
            : existing.notificationLog) || [],
      });
    }
  }

  return Array.from(mergedMap.values());
}

// Update application status, admin remarks, trial schedule, and notifications in Supabase and localStorage
export async function updateRegistrationStatus(
  idOrBookingRef: string,
  newStatus: ApplicationStatus,
  notesOrUpdates?:
    | string
    | {
        adminRemarks?: string;
        scheduledTrialDetails?: ScheduledTrialDetails;
        notificationLog?: ApplicantNotificationLog[];
        message?: string;
      }
): Promise<{ success: boolean; error?: string }> {
  const normalizedStatus = normalizeApplicationStatus(newStatus);
  let targetRecord: AcademyRegistrationData | undefined;

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('maden_faf_registrations');
      if (stored) {
        const list: AcademyRegistrationData[] = JSON.parse(stored);
        targetRecord = list.find(
          (i) => i.id === idOrBookingRef || i.bookingRef === idOrBookingRef
        );
      }
    } catch {
      // Ignore
    }
  }

  const updatedFields: Partial<AcademyRegistrationData> = {
    ...(targetRecord || {}),
    status: normalizedStatus,
    updatedAt: new Date().toISOString(),
  };

  if (typeof notesOrUpdates === 'string') {
    updatedFields.adminRemarks = notesOrUpdates;
  } else if (notesOrUpdates && typeof notesOrUpdates === 'object') {
    if (notesOrUpdates.adminRemarks !== undefined) {
      updatedFields.adminRemarks = notesOrUpdates.adminRemarks;
    }
    if (notesOrUpdates.scheduledTrialDetails !== undefined) {
      updatedFields.scheduledTrialDetails = notesOrUpdates.scheduledTrialDetails;
    }
    if (notesOrUpdates.notificationLog !== undefined) {
      updatedFields.notificationLog = notesOrUpdates.notificationLog;
    }
    if (notesOrUpdates.message !== undefined) {
      updatedFields.message = notesOrUpdates.message;
    }
  }

  const serializedMessage = serializeApplicationMetadata(updatedFields);

  // 1. Update Supabase
  if (isSupabaseConfigured()) {
    try {
      const query = idOrBookingRef.includes('-')
        ? supabase
            .from('academy_registrations')
            .update({ status: normalizedStatus, message: serializedMessage })
            .eq('booking_ref', idOrBookingRef)
        : supabase
            .from('academy_registrations')
            .update({ status: normalizedStatus, message: serializedMessage })
            .eq('id', idOrBookingRef);
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
      const list: AcademyRegistrationData[] = stored ? JSON.parse(stored) : [];
      let found = false;
      const updatedList = list.map((item) => {
        if (item.id === idOrBookingRef || item.bookingRef === idOrBookingRef) {
          found = true;
          return {
            ...item,
            ...updatedFields,
            status: normalizedStatus,
          };
        }
        return item;
      });
      if (!found && targetRecord) {
        updatedList.unshift({ ...targetRecord, ...updatedFields, status: normalizedStatus });
      }
      localStorage.setItem('maden_faf_registrations', JSON.stringify(updatedList));
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
