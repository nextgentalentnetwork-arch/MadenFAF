import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cyolljxxcmaekhhllbix.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5b2xsanh4Y21hZWtoaGxsYml4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDUwMDkzNSwiZXhwIjoyMTA2MDc2OTM1fQ.YUQW0sdxzObMXueBkZsxor-GlJ06Se1PbyXUmvRzQ_4';

function getSupabaseServerClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

// In-memory rate limiter for submission/verification API endpoints
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  entry.count += 1;
  return true;
}

const ALLOWED_SECTIONS = new Set([
  'memberProfiles',
  'donationPlans',
  'donations',
  'paymentSubmissions',
  'organizationPaymentSettings',
  'notifications',
  'auditLogs',
]);

async function saveSectionToCloud(supabase: any, section: string, data: any): Promise<boolean> {
  let saved = false;
  const key = `donators_${section}`;

  try {
    const { error } = await supabase.from('academy_content').upsert(
      {
        key,
        data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
    if (!error) saved = true;
  } catch {
    // Fallback to system sync row
  }

  try {
    const bookingRef = `SYS-SYNC-DONATORS-${section.toUpperCase()}`;
    const { data: existing } = await supabase
      .from('academy_registrations')
      .select('id')
      .eq('booking_ref', bookingRef)
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from('academy_registrations')
        .update({ message: JSON.stringify(data) })
        .eq('id', existing.id);
      if (!error) saved = true;
    } else {
      const { error } = await supabase.from('academy_registrations').insert({
        booking_ref: bookingRef,
        player_name: `Donators Portal Store: ${section}`,
        dob: '2000-01-01',
        gender: 'system',
        parent_name: 'MADEN FAF Donators Engine',
        phone: '+91 00000 00000',
        email: 'foundation@madenfaf.in',
        location: 'Supabase Cloud',
        preferred_campus: 'all',
        position: 'system',
        experience_level: 'cloud',
        program: key,
        message: JSON.stringify(data),
        status: 'cloud_persisted',
        created_at: new Date().toISOString(),
      });
      if (!error) saved = true;
    }
  } catch {
    // Ignore fallback error
  }

  return saved;
}

async function readSectionFromCloud(supabase: any, section: string): Promise<any | null> {
  const key = `donators_${section}`;
  try {
    const { data } = await supabase
      .from('academy_content')
      .select('data')
      .eq('key', key)
      .maybeSingle();
    if (data?.data !== undefined) return data.data;
  } catch {
    // Fallback
  }

  try {
    const bookingRef = `SYS-SYNC-DONATORS-${section.toUpperCase()}`;
    const { data, error } = await supabase
      .from('academy_registrations')
      .select('message')
      .eq('booking_ref', bookingRef)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!error && data?.message) {
      return JSON.parse(data.message);
    }
  } catch {
    // Ignore
  }

  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get('section') || 'all';
  const uid = searchParams.get('uid');
  const role = searchParams.get('role');

  try {
    const supabase = getSupabaseServerClient();

    if (section !== 'all' && ALLOWED_SECTIONS.has(section)) {
      const data = await readSectionFromCloud(supabase, section);

      // Server-side ownership filtering if non-admin requests user-scoped collections
      if (uid && role !== 'admin' && Array.isArray(data)) {
        if (
          section === 'memberProfiles' ||
          section === 'donationPlans' ||
          section === 'donations' ||
          section === 'paymentSubmissions' ||
          section === 'notifications'
        ) {
          return NextResponse.json({
            success: true,
            section,
            data: data.filter((item: any) => item.uid === uid),
          });
        }
        if (section === 'auditLogs') {
          return NextResponse.json(
            { success: false, error: 'Unauthorized access to administrative audit logs.' },
            { status: 403 }
          );
        }
      }

      return NextResponse.json({ success: true, section, data });
    }

    const result: Record<string, any> = {};
    for (const sec of ALLOWED_SECTIONS) {
      const val = await readSectionFromCloud(supabase, sec);
      if (val !== null) {
        result[sec] = val;
      }
    }

    return NextResponse.json({
      success: true,
      section: 'all',
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to read Donators Portal data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { action, section, data } = body;

    if (action === 'syncSection') {
      if (!section || !ALLOWED_SECTIONS.has(section)) {
        return NextResponse.json(
          { success: false, error: 'Invalid or unauthorized section name.' },
          { status: 400 }
        );
      }

      const supabase = getSupabaseServerClient();
      const saved = await saveSectionToCloud(supabase, section, data);

      return NextResponse.json({
        success: true,
        persistedToCloud: saved,
        section,
      });
    }

    return NextResponse.json({ success: false, error: 'Unsupported action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error processing Donators Portal request' },
      { status: 500 }
    );
  }
}
