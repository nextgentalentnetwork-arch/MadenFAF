import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cyolljxxcmaekhhllbix.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5b2xsanh4Y21hZWtoaGxsYml4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDUwMDkzNSwiZXhwIjoyMTA2MDc2OTM1fQ.YUQW0sdxzObMXueBkZsxor-GlJ06Se1PbyXUmvRzQ_4';

function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

// Map camelCase to snake_case for dedicated tables
function mapCoachToDb(coach: any) {
  return {
    id: coach.id,
    name: coach.name,
    role: coach.role,
    category: coach.category || 'leadership',
    license: coach.license,
    license_level: coach.licenseLevel || coach.license,
    campus: coach.campus,
    experience_years: coach.experienceYears || 0,
    playing_background: coach.playingBackground || '',
    philosophy: coach.philosophy || '',
    bio: coach.bio || '',
    key_specialties: coach.keySpecialties || [],
    certifications: coach.certifications || [],
    career_highlights: coach.careerHighlights || [],
    image: coach.image || '',
    accent_color: coach.accentColor || 'amber',
    updated_at: new Date().toISOString(),
  };
}

function mapDbToCoach(row: any) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    category: row.category,
    license: row.license,
    licenseLevel: row.license_level,
    campus: row.campus,
    experienceYears: row.experience_years,
    playingBackground: row.playing_background,
    philosophy: row.philosophy,
    bio: row.bio,
    keySpecialties: row.key_specialties || [],
    certifications: row.certifications || [],
    careerHighlights: row.career_highlights || [],
    image: row.image,
    accentColor: row.accent_color,
  };
}

function mapFixtureToDb(fix: any) {
  return {
    id: fix.id,
    competition: fix.competition,
    status: fix.status || 'upcoming',
    home_team: fix.homeTeam,
    away_team: fix.awayTeam,
    home_team_logo: fix.homeTeamLogo || '',
    away_team_logo: fix.awayTeamLogo || '',
    is_home: fix.isHome ?? true,
    home_score: fix.homeScore ?? 0,
    away_score: fix.awayScore ?? 0,
    date: fix.date,
    time: fix.time,
    venue: fix.venue,
    age_group: fix.ageGroup,
    player_of_the_match: fix.playerOfTheMatch || '',
    match_report_snippet: fix.matchReportSnippet || '',
    updated_at: new Date().toISOString(),
  };
}

function mapDbToFixture(row: any) {
  return {
    id: row.id,
    competition: row.competition,
    status: row.status,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    homeTeamLogo: row.home_team_logo || row.homeTeamLogo || '',
    awayTeamLogo: row.away_team_logo || row.awayTeamLogo || '',
    isHome: row.is_home,
    homeScore: row.home_score,
    awayScore: row.away_score,
    date: row.date,
    time: row.time,
    venue: row.venue,
    ageGroup: row.age_group,
    playerOfTheMatch: row.player_of_the_match,
    matchReportSnippet: row.match_report_snippet,
  };
}

function mapNewsToDb(story: any) {
  return {
    id: story.id,
    title: story.title,
    category: story.category || 'Academy News',
    date: story.date,
    read_time: story.readTime || '3 min read',
    author: story.author || 'Academy Editorial',
    summary: story.summary || '',
    content: story.content || [],
    image: story.image || '',
    featured: story.featured || false,
    updated_at: new Date().toISOString(),
  };
}

function mapDbToNews(row: any) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    date: row.date,
    readTime: row.read_time,
    author: row.author,
    summary: row.summary,
    content: row.content || [],
    image: row.image,
    featured: row.featured,
  };
}

function mapCampusToDb(campus: any) {
  return {
    id: campus.id,
    name: campus.name,
    tagline: campus.tagline || '',
    location: campus.location,
    address: campus.address || '',
    association: campus.association || '',
    status: campus.status || 'active',
    description: campus.description || '',
    facilities: campus.facilities || [],
    training_days: campus.trainingDays || '',
    timings: campus.timings || '',
    age_groups: campus.ageGroups || [],
    head_coach: campus.headCoach || {},
    contact_phone: campus.contactPhone || '',
    contact_email: campus.contactEmail || '',
    image: campus.image || '',
    updated_at: new Date().toISOString(),
  };
}

function mapDbToCampus(row: any) {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    location: row.location,
    address: row.address,
    association: row.association,
    status: row.status,
    description: row.description,
    facilities: row.facilities || [],
    trainingDays: row.training_days,
    timings: row.timings,
    ageGroups: row.age_groups || [],
    headCoach: row.head_coach || {},
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    image: row.image,
  };
}

// ---------------- Resilient Supabase Storage Helpers ----------------
// Saves JSON state directly into the verified active Supabase database table
async function saveToSystemRegistrationSync(supabase: any, section: string, data: any): Promise<boolean> {
  try {
    const bookingRef = `SYS-SYNC-${section.toUpperCase()}`;
    const { data: existing } = await supabase
      .from('academy_registrations')
      .select('id')
      .eq('booking_ref', bookingRef)
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from('academy_registrations')
        .update({
          message: JSON.stringify(data),
        })
        .eq('id', existing.id);
      return !error;
    } else {
      const payload = {
        booking_ref: bookingRef,
        player_name: `Cloud Stored: ${section}`,
        dob: '2000-01-01',
        gender: 'system',
        parent_name: 'MADEN FAF Database Engine',
        phone: '+91 00000 00000',
        email: 'system@madenfaf.com',
        location: 'Supabase Cloud',
        preferred_campus: 'all',
        position: 'system',
        experience_level: 'cloud',
        program: section,
        message: JSON.stringify(data),
        status: 'cloud_persisted',
        created_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from('academy_registrations')
        .insert(payload);
      return !error;
    }
  } catch (e: any) {
    console.warn('saveToSystemRegistrationSync error:', e?.message);
    return false;
  }
}

async function readFromSystemRegistrationSync(supabase: any, section: string): Promise<any | null> {
  try {
    const bookingRef = `SYS-SYNC-${section.toUpperCase()}`;
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
    return null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get('section') || 'all';

  try {
    const supabase = getSupabaseClient();
    const result: Record<string, any> = {};

    // 1. Coaches
    if (section === 'coaches' || section === 'all') {
      const { data, error } = await supabase.from('academy_coaches').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        result.coaches = data.map(mapDbToCoach);
      } else {
        const { data: contentData } = await supabase
          .from('academy_content')
          .select('data')
          .eq('key', 'coaches')
          .maybeSingle();
        if (contentData?.data) {
          result.coaches = contentData.data;
        } else {
          // Resilient read from active Supabase table
          const sysData = await readFromSystemRegistrationSync(supabase, 'coaches');
          if (sysData) result.coaches = sysData;
        }
      }
    }

    // 2. Fixtures
    if (section === 'fixtures' || section === 'all') {
      const { data, error } = await supabase.from('academy_fixtures').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        result.fixtures = data.map(mapDbToFixture);
      } else {
        const { data: contentData } = await supabase
          .from('academy_content')
          .select('data')
          .eq('key', 'fixtures')
          .maybeSingle();
        if (contentData?.data) {
          result.fixtures = contentData.data;
        } else {
          const sysData = await readFromSystemRegistrationSync(supabase, 'fixtures');
          if (sysData) result.fixtures = sysData;
        }
      }
    }

    // 3. News
    if (section === 'news' || section === 'all') {
      const { data, error } = await supabase.from('academy_news').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        result.news = data.map(mapDbToNews);
      } else {
        const { data: contentData } = await supabase
          .from('academy_content')
          .select('data')
          .eq('key', 'news')
          .maybeSingle();
        if (contentData?.data) {
          result.news = contentData.data;
        } else {
          const sysData = await readFromSystemRegistrationSync(supabase, 'news');
          if (sysData) result.news = sysData;
        }
      }
    }

    // 4. Campuses
    if (section === 'campuses' || section === 'all') {
      const { data, error } = await supabase.from('academy_campuses').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        result.campuses = data.map(mapDbToCampus);
      } else {
        const { data: contentData } = await supabase
          .from('academy_content')
          .select('data')
          .eq('key', 'campuses')
          .maybeSingle();
        if (contentData?.data) {
          result.campuses = contentData.data;
        } else {
          const sysData = await readFromSystemRegistrationSync(supabase, 'campuses');
          if (sysData) result.campuses = sysData;
        }
      }
    }

    // 5. Programs
    if (section === 'programs' || section === 'all') {
      const { data: contentData } = await supabase
        .from('academy_content')
        .select('data')
        .eq('key', 'programs')
        .maybeSingle();
      if (contentData?.data) {
        result.programs = contentData.data;
      } else {
        const sysData = await readFromSystemRegistrationSync(supabase, 'programs');
        if (sysData) result.programs = sysData;
      }
    }

    // 6. Component Toggles
    if (section === 'toggles' || section === 'all') {
      const { data: contentData } = await supabase
        .from('academy_content')
        .select('data')
        .eq('key', 'toggles')
        .maybeSingle();
      if (contentData?.data) {
        result.toggles = contentData.data;
      } else {
        const sysData = await readFromSystemRegistrationSync(supabase, 'toggles');
        if (sysData) result.toggles = sysData;
      }
    }

    // 7. Camps and Events
    if (section === 'events' || section === 'all') {
      const { data: contentData } = await supabase
        .from('academy_content')
        .select('data')
        .eq('key', 'events')
        .maybeSingle();
      if (contentData?.data) {
        result.events = contentData.data;
      } else {
        const sysData = await readFromSystemRegistrationSync(supabase, 'events');
        if (sysData) result.events = sysData;
      }
    }

    // 7b. Trials and Assessment Slots
    if (section === 'trials' || section === 'all') {
      const { data: contentData } = await supabase
        .from('academy_content')
        .select('data')
        .eq('key', 'trials')
        .maybeSingle();
      if (contentData?.data) {
        result.trials = contentData.data;
      } else {
        const sysData = await readFromSystemRegistrationSync(supabase, 'trials');
        if (sysData) result.trials = sysData;
      }
    }

    // 8. Scholarships
    if (section === 'scholarships' || section === 'all') {
      const { data: contentData } = await supabase
        .from('academy_content')
        .select('data')
        .eq('key', 'scholarships')
        .maybeSingle();
      if (contentData?.data) {
        result.scholarships = contentData.data;
      } else {
        const sysData = await readFromSystemRegistrationSync(supabase, 'scholarships');
        if (sysData) result.scholarships = sysData;
      }
    }

    // 9. Testimonials & Success Stories
    if (section === 'testimonials' || section === 'all') {
      const { data: contentData } = await supabase
        .from('academy_content')
        .select('data')
        .eq('key', 'testimonials')
        .maybeSingle();
      if (contentData?.data) {
        result.testimonials = contentData.data;
      } else {
        const sysData = await readFromSystemRegistrationSync(supabase, 'testimonials');
        if (sysData) result.testimonials = sysData;
      }
    }

    // 10. Sponsors & Brand Partners
    if (section === 'sponsors' || section === 'all') {
      const { data: contentData } = await supabase
        .from('academy_content')
        .select('data')
        .eq('key', 'sponsors')
        .maybeSingle();
      if (contentData?.data) {
        result.sponsors = contentData.data;
      } else {
        const sysData = await readFromSystemRegistrationSync(supabase, 'sponsors');
        if (sysData) result.sponsors = sysData;
      }
    }

    // 11. Parent Deliverables
    if (section === 'parentDeliverables' || section === 'all') {
      const { data: contentData } = await supabase
        .from('academy_content')
        .select('data')
        .eq('key', 'parentDeliverables')
        .maybeSingle();
      if (contentData?.data) {
        result.parentDeliverables = contentData.data;
      } else {
        const sysData = await readFromSystemRegistrationSync(supabase, 'parentDeliverables');
        if (sysData) result.parentDeliverables = sysData;
      }
    }

    // 12. Digital Portal Access Config
    if (section === 'portalConfig' || section === 'all') {
      const { data: contentData } = await supabase
        .from('academy_content')
        .select('data')
        .eq('key', 'portalConfig')
        .maybeSingle();
      if (contentData?.data) {
        result.portalConfig = contentData.data;
      } else {
        const sysData = await readFromSystemRegistrationSync(supabase, 'portalConfig');
        if (sysData) result.portalConfig = sysData;
      }
    }

    // 13. Hero Showcase & Video Experience Config
    if (section === 'heroConfig' || section === 'hero' || section === 'all') {
      const { data: contentData } = await supabase
        .from('academy_content')
        .select('data')
        .in('key', ['heroConfig', 'hero'])
        .maybeSingle();
      if (contentData?.data) {
        result.heroConfig = contentData.data;
      } else {
        const sysData =
          (await readFromSystemRegistrationSync(supabase, 'heroConfig')) ||
          (await readFromSystemRegistrationSync(supabase, 'hero'));
        if (sysData) result.heroConfig = sysData;
      }
      if (section === 'hero') {
        result.hero = result.heroConfig;
      }
    }

    return NextResponse.json({
      success: true,
      section,
      data: section === 'all' ? result : result[section] || null,
      hasData: Object.keys(result).length > 0,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error querying Supabase' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { section, action, data, id, allData } = body;

    if (!section) {
      return NextResponse.json({ success: false, error: 'Section is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    let savedToDedicatedTable = false;
    let savedToContentStore = false;
    let savedToSystemTable = false;
    let errorMessage: string | null = null;

    // Determine the full section dataset to store in cloud
    const currentDataset = Array.isArray(allData) ? allData : data ? (Array.isArray(data) ? data : [data]) : [];
    const payloadData = allData !== undefined ? allData : data;

    // A. Sync entire section (array or object)
    if (action === 'syncAll' && payloadData !== undefined) {
      // 1. Try dedicated table if array of models
      if (Array.isArray(payloadData)) {
        try {
          if (section === 'coaches') {
            const dbRows = payloadData.map(mapCoachToDb);
            const { error } = await supabase.from('academy_coaches').upsert(dbRows, { onConflict: 'id' });
            if (!error) savedToDedicatedTable = true;
          } else if (section === 'fixtures') {
            const dbRows = payloadData.map(mapFixtureToDb);
            const { error } = await supabase.from('academy_fixtures').upsert(dbRows, { onConflict: 'id' });
            if (!error) savedToDedicatedTable = true;
          } else if (section === 'news') {
            const dbRows = payloadData.map(mapNewsToDb);
            const { error } = await supabase.from('academy_news').upsert(dbRows, { onConflict: 'id' });
            if (!error) savedToDedicatedTable = true;
          } else if (section === 'campuses') {
            const dbRows = payloadData.map(mapCampusToDb);
            const { error } = await supabase.from('academy_campuses').upsert(dbRows, { onConflict: 'id' });
            if (!error) savedToDedicatedTable = true;
          }
        } catch (err: any) {
          console.warn('Dedicated table upsert notice:', err?.message);
        }
      }

      // 2. Save to academy_content document (supports array or config object)
      try {
        const { error: contentErr } = await supabase.from('academy_content').upsert(
          {
            key: section,
            data: payloadData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
        if (!contentErr) savedToContentStore = true;
      } catch {}

      // 3. Resilient Supabase persistence in verified active table
      savedToSystemTable = await saveToSystemRegistrationSync(supabase, section, payloadData);

      const isSuccess = savedToDedicatedTable || savedToContentStore || savedToSystemTable;

      return NextResponse.json({
        success: isSuccess,
        savedToContentStore,
        savedToDedicatedTable,
        savedToSystemTable,
        section,
        error: isSuccess ? null : errorMessage,
        message: `Synced ${section} to Supabase Cloud`,
      });
    }

    // B. Single Item Upsert
    if (action === 'upsert' && data) {
      // 1. Try dedicated table
      try {
        if (section === 'coaches') {
          const { error } = await supabase
            .from('academy_coaches')
            .upsert(mapCoachToDb(data), { onConflict: 'id' });
          if (!error) savedToDedicatedTable = true;
        } else if (section === 'fixtures') {
          const { error } = await supabase
            .from('academy_fixtures')
            .upsert(mapFixtureToDb(data), { onConflict: 'id' });
          if (!error) savedToDedicatedTable = true;
        } else if (section === 'news') {
          const { error } = await supabase
            .from('academy_news')
            .upsert(mapNewsToDb(data), { onConflict: 'id' });
          if (!error) savedToDedicatedTable = true;
        } else if (section === 'campuses') {
          const { error } = await supabase
            .from('academy_campuses')
            .upsert(mapCampusToDb(data), { onConflict: 'id' });
          if (!error) savedToDedicatedTable = true;
        }
      } catch (err: any) {
        errorMessage = err?.message;
      }

      // 2. Also update academy_content document if full array was provided
      if (Array.isArray(allData)) {
        try {
          const { error: contentErr } = await supabase.from('academy_content').upsert(
            {
              key: section,
              data: allData,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'key' }
          );
          if (!contentErr) savedToContentStore = true;
        } catch {}
      }

      // 3. Resilient Supabase persistence in verified active table
      if (currentDataset.length > 0) {
        savedToSystemTable = await saveToSystemRegistrationSync(supabase, section, currentDataset);
      }

      const isSuccess = savedToDedicatedTable || savedToContentStore || savedToSystemTable;

      return NextResponse.json({
        success: isSuccess,
        savedToDedicatedTable,
        savedToContentStore,
        savedToSystemTable,
        section,
        error: isSuccess ? null : errorMessage,
        message: `Item in ${section} persisted to Supabase Cloud`,
      });
    }

    // C. Single Item Delete
    if (action === 'delete' && id) {
      try {
        if (section === 'coaches') {
          const { error } = await supabase.from('academy_coaches').delete().eq('id', id);
          if (!error) savedToDedicatedTable = true;
        } else if (section === 'fixtures') {
          const { error } = await supabase.from('academy_fixtures').delete().eq('id', id);
          if (!error) savedToDedicatedTable = true;
        } else if (section === 'news') {
          const { error } = await supabase.from('academy_news').delete().eq('id', id);
          if (!error) savedToDedicatedTable = true;
        } else if (section === 'campuses') {
          const { error } = await supabase.from('academy_campuses').delete().eq('id', id);
          if (!error) savedToDedicatedTable = true;
        }
      } catch (err: any) {
        errorMessage = err?.message;
      }

      if (Array.isArray(allData)) {
        try {
          const { error: contentErr } = await supabase.from('academy_content').upsert(
            {
              key: section,
              data: allData,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'key' }
          );
          if (!contentErr) savedToContentStore = true;
        } catch {}
      }

      if (currentDataset.length >= 0) {
        savedToSystemTable = await saveToSystemRegistrationSync(supabase, section, currentDataset);
      }

      return NextResponse.json({
        success: true,
        savedToDedicatedTable,
        savedToContentStore,
        savedToSystemTable,
        section,
        message: `Item ${id} deleted from ${section} and updated in Supabase Cloud`,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error processing request' },
      { status: 500 }
    );
  }
}
