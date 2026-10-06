import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cyolljxxcmaekhhllbix.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5b2xsanh4Y21hZWtoaGxsYml4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDUwMDkzNSwiZXhwIjoyMTA2MDc2OTM1fQ.YUQW0sdxzObMXueBkZsxor-GlJ06Se1PbyXUmvRzQ_4';

export async function GET() {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: false, error: 'Supabase credentials missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('academy_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        tableExists: false,
        hint: "Run SQL setup script in Supabase Dashboard SQL Editor to create 'academy_registrations' table.",
      });
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      playerName,
      dob,
      gender,
      parentName,
      phone,
      email,
      location,
      preferredCampus,
      position,
      experienceLevel,
      program,
      message,
    } = body;

    if (!playerName || !parentName || !phone || !email) {
      return NextResponse.json(
        { error: 'Missing mandatory registration fields (player name, parent name, phone, email).' },
        { status: 400 }
      );
    }

    const bookingRef = `MADEN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const createdAt = new Date().toISOString();

    let dbSaved = false;
    let dbError: string | undefined = undefined;

    // If Supabase credentials exist, insert directly into public.academy_registrations
    if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('https://')) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { error } = await supabase.from('academy_registrations').insert([
          {
            booking_ref: bookingRef,
            player_name: playerName,
            dob: dob || null,
            gender: gender || 'male',
            parent_name: parentName,
            phone,
            email,
            location: location || '',
            preferred_campus: preferredCampus || 'gayeshpur',
            position: position || 'midfielder',
            experience_level: experienceLevel || 'grassroots',
            program: program || 'foundation',
            message: message || '',
            status: 'pending_trial',
            created_at: createdAt,
          },
        ]);

        if (!error) {
          dbSaved = true;
        } else {
          dbError = error.message;
          console.warn('Supabase API Route Insert Warning:', error.message);
        }
      } catch (dbErr: any) {
        dbError = dbErr?.message;
        console.warn('Supabase DB Exception in API route:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      bookingRef,
      dbSaved,
      dbError,
      message: 'Academy trial registration successfully registered.',
      data: {
        bookingRef,
        playerName,
        preferredCampus,
        program,
        status: 'pending_trial',
        createdAt,
      },
    });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error while processing academy registration.' },
      { status: 500 }
    );
  }
}
