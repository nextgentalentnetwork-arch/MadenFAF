import { NextRequest, NextResponse } from 'next/server';
import {
  supabase,
  isSupabaseConfigured,
  normalizeApplicationStatus,
  serializeApplicationMetadata,
  parseApplicationRow,
} from '@/lib/supabaseClient';
import {
  getAuthoritativeAccountByEmail,
  verifyRbacToken,
  UNAUTHORIZED_PORTAL_ACCESS_MESSAGE,
} from '@/lib/serverRbac';

async function verifyAdminCaller(req: NextRequest, body?: any): Promise<boolean> {
  const authHeader = req.headers.get('authorization');
  const token =
    (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null) ||
    body?.rbacToken ||
    new URL(req.url).searchParams.get('token');

  if (token) {
    const check = verifyRbacToken(token);
    if (check.valid && check.payload?.role === 'admin') {
      return true;
    }
  }

  const email = (
    body?.adminEmail ||
    body?.actorEmail ||
    new URL(req.url).searchParams.get('adminEmail') ||
    ''
  )
    .toLowerCase()
    .trim();

  if (email) {
    const account = await getAuthoritativeAccountByEmail(email);
    if (account && account.role === 'admin') {
      return true;
    }
  }

  return false;
}

// GET /api/registrations — Fetch applications (Admin-only for full list; public reference lookup by bookingRef)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookingRef = searchParams.get('bookingRef')?.trim();

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      mode: 'local_fallback',
      data: [],
      message: 'Supabase not configured. Using browser persistence.',
    });
  }

  try {
    if (bookingRef) {
      const { data, error } = await supabase
        .from('academy_registrations')
        .select('*')
        .eq('booking_ref', bookingRef)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        data: data ? parseApplicationRow(data) : null,
      });
    }

    const isAdmin = await verifyAdminCaller(req);
    const callerRoleParam = searchParams.get('callerRole');
    if (callerRoleParam && callerRoleParam !== 'admin' && !isAdmin) {
      return NextResponse.json(
        { success: false, error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from('academy_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message, data: [] },
        { status: 400 }
      );
    }

    const parsed = (data || [])
      .filter(
        (r: any) =>
          !String(r.booking_ref || '').startsWith('SYS-SYNC-') &&
          r.status !== 'cloud_persisted'
      )
      .map((row: any) => parseApplicationRow(row));

    return NextResponse.json({
      success: true,
      mode: 'supabase_live',
      count: parsed.length,
      data: parsed,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error fetching applications' },
      { status: 500 }
    );
  }
}

// POST /api/registrations — Create a new Academy Admission or Trial Session application (Public pathway; never creates a user account)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      applicationType = 'admission',
      playerName,
      dob,
      age,
      gender,
      parentName,
      phone,
      email,
      location,
      preferredCampus,
      position,
      experienceLevel,
      currentClubOrAcademy,
      program,
      preferredTrialEventId,
      preferredTrialDate,
      preferredVenue,
      playerPhotoUrl,
      playerPhotoName,
      supportingDocumentUrl,
      supportingDocumentName,
      minorConsentConfirmed,
      message,
    } = body;

    if (!playerName || !dob || !phone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields (playerName, dob, phone)',
        },
        { status: 400 }
      );
    }

    const appType: 'admission' | 'trial' =
      applicationType === 'trial' ? 'trial' : 'admission';
    const prefix = appType === 'trial' ? 'MADEN-TRL' : 'MADEN-ADM';
    const bookingRef =
      body.bookingRef ||
      `${prefix}-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const createdAt = new Date().toISOString();

    const serializedMessage = serializeApplicationMetadata({
      applicationType: appType,
      dob,
      age,
      currentClubOrAcademy,
      preferredTrialEventId,
      preferredTrialDate,
      preferredVenue,
      playerPhotoUrl,
      playerPhotoName,
      supportingDocumentUrl,
      supportingDocumentName,
      minorConsentConfirmed,
      message,
    });

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('academy_registrations').insert([
        {
          booking_ref: bookingRef,
          player_name: playerName,
          dob,
          gender: gender || 'male',
          parent_name: parentName || 'Self / Adult Applicant',
          phone,
          email: email || '',
          location: location || '',
          preferred_campus: preferredCampus || 'gayeshpur',
          position: position || 'midfielder',
          experience_level: experienceLevel || 'grassroots',
          program: program || 'development',
          message: serializedMessage,
          status: 'pending_review',
          created_at: createdAt,
        },
      ]);

      if (error) {
        return NextResponse.json({
          success: true,
          mode: 'local_fallback',
          bookingRef,
          status: 'pending_review',
          warning: error.message,
        });
      }

      return NextResponse.json({
        success: true,
        mode: 'supabase_live',
        bookingRef,
        status: 'pending_review',
      });
    }

    return NextResponse.json({
      success: true,
      mode: 'local_fallback',
      bookingRef,
      status: 'pending_review',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Invalid request body' },
      { status: 500 }
    );
  }
}

// PATCH /api/registrations — Admin-only status, remarks, and trial schedule updates
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const isAdmin = await verifyAdminCaller(req, body);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE },
        { status: 403 }
      );
    }

    const { idOrBookingRef, status, metadataPayload } = body;
    if (!idOrBookingRef || !status) {
      return NextResponse.json(
        { success: false, error: 'idOrBookingRef and status are required.' },
        { status: 400 }
      );
    }

    const normalized = normalizeApplicationStatus(status);
    if (isSupabaseConfigured()) {
      const updateObj: Record<string, any> = { status: normalized };
      if (metadataPayload) {
        updateObj.message =
          typeof metadataPayload === 'string'
            ? metadataPayload
            : JSON.stringify(metadataPayload);
      }

      const query = idOrBookingRef.includes('-')
        ? supabase
            .from('academy_registrations')
            .update(updateObj)
            .eq('booking_ref', idOrBookingRef)
        : supabase.from('academy_registrations').update(updateObj).eq('id', idOrBookingRef);
      const { error } = await query;
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, status: normalized });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update application' },
      { status: 500 }
    );
  }
}

// DELETE /api/registrations — Admin-only application deletion
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const isAdmin = await verifyAdminCaller(req, body);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: UNAUTHORIZED_PORTAL_ACCESS_MESSAGE },
        { status: 403 }
      );
    }

    const idOrBookingRef =
      body?.idOrBookingRef || new URL(req.url).searchParams.get('idOrBookingRef');
    if (!idOrBookingRef) {
      return NextResponse.json(
        { success: false, error: 'idOrBookingRef is required.' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      const query = idOrBookingRef.includes('-')
        ? supabase.from('academy_registrations').delete().eq('booking_ref', idOrBookingRef)
        : supabase.from('academy_registrations').delete().eq('id', idOrBookingRef);
      const { error } = await query;
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to delete application' },
      { status: 500 }
    );
  }
}
