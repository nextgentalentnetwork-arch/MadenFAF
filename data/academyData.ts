export interface Program {
  id: string;
  name: string;
  subtitle: string;
  ageGroup: string;
  target: string;
  description: string;
  keyFeatures: string[];
  schedule: string;
  coachRatio: string;
  pillarEmphasis: {
    technical: number;
    tactical: number;
    physical: number;
    mental: number;
  };
  badgeColor: string;
}

export interface Campus {
  id: string;
  name: string;
  tagline: string;
  location: string;
  address: string;
  association?: string;
  status: 'active' | 'upcoming';
  description: string;
  facilities: string[];
  trainingDays: string;
  timings: string;
  ageGroups: string[];
  headCoach: {
    name: string;
    license: string;
    experience: string;
  };
  contactPhone: string;
  contactEmail: string;
  image: string;
}

export interface PathwayStage {
  step: number;
  title: string;
  ageBracket: string;
  objective: string;
  trainingFocus: string[];
  milestones: string[];
  assessmentCriteria: string[];
  progressionGate: string;
  weeklyHours: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  ageGroup: string;
  position: string;
  campus: string;
  pathwayStage: string;
  jerseyNumber: number;
  joinedYear: number;
  avatar: string;
  stats: {
    matchesPlayed: number;
    goals: number;
    assists: number;
    cleanSheets?: number;
    passAccuracy: number;
    minutesPlayed: number;
    overallRating: number;
  };
  metrics: {
    technical: number;
    tactical: number;
    physical: number;
    mental: number;
    matchPerformance: number;
  };
  drillScores: {
    firstTouchIndex: string;
    passingAccuracy: string;
    speed30m: string;
    yoYoLevel: string;
    decisionSpeed: string;
  };
  coachNotes: string;
  achievements: string[];
}

export interface MatchFixture {
  id: string;
  competition: string;
  status: 'upcoming' | 'completed';
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  isHome: boolean;
  homeScore?: number;
  awayScore?: number;
  date: string;
  time: string;
  venue: string;
  ageGroup: string;
  playerOfTheMatch?: string;
  matchReportSnippet?: string;
  keyEvents?: string[];
}

export interface ScholarshipTier {
  id: string;
  tier: string;
  coverage: string;
  description: string;
  benefits: string[];
  quota: string;
  badgeColor?: string;
  status: 'active' | 'closed';
}

export interface SponsorPartner {
  id: string;
  name: string;
  category: string;
  tier: 'Title Partner' | 'Technical Partner' | 'Nutrition Partner' | 'Federation / Sanctioning' | 'Ground Partner' | 'Medical Partner' | 'Community Partner';
  logoUrl?: string;
  presetKey?: string;
  websiteUrl?: string;
  active: boolean;
  order: number;
}

export interface ParentDeliverableItem {
  id: string;
  title: string;
  desc: string;
  iconName: string;
  active: boolean;
}

export interface DigitalPortalConfig {
  portalMode: 'preview' | 'pin_protected' | 'invite_only';
  accessCode: string;
  announcementTitle: string;
  announcementMessage: string;
  playerPortalEnabled: boolean;
  parentPortalEnabled: boolean;
  coachPortalEnabled: boolean;
  adminPortalEnabled: boolean;
  demoStudents: {
    id: string;
    name: string;
    role: string;
    campus: string;
    avatar: string;
    attendance: string;
    rating: string;
    analysisCount?: string;
  }[];
}

export interface TrialSlot {
  id: string;
  campus: string;
  campusName: string;
  date: string;
  time: string;
  ageGroups: string;
  slotsTotal: number;
  slotsBooked: number;
  evaluatorCoach: string;
  status: 'Open' | 'Filling Fast' | 'Closed';
  requirements: string;
}

export const DEFAULT_TRIAL_SLOTS: TrialSlot[] = [
  {
    id: 'ts-01',
    campus: 'gayeshpur',
    campusName: 'Gayeshpur Flagship Campus',
    date: 'Saturday, May 09, 2026',
    time: '08:00 AM – 11:30 AM',
    ageGroups: 'U11, U13 & U15',
    slotsTotal: 40,
    slotsBooked: 28,
    evaluatorCoach: 'Coach Bapi Roy (AFC ‘B’)',
    status: 'Filling Fast',
    requirements: 'Studded boots, shin guards, Aadhaar / DOB birth certificate copy.',
  },
  {
    id: 'ts-02',
    campus: 'ichapore',
    campusName: 'Ichapore Campus (Leninnagar SC)',
    date: 'Sunday, May 17, 2026',
    time: '08:30 AM – 12:00 PM',
    ageGroups: 'U9, U12 & U14',
    slotsTotal: 35,
    slotsBooked: 19,
    evaluatorCoach: 'Coach Soumitra Banerjee (AIFF ‘C’)',
    status: 'Open',
    requirements: 'Boots, water bottle, guardian presence mandatory for under-14s.',
  },
  {
    id: 'ts-03',
    campus: 'krishnanagar',
    campusName: 'Krishnanagar Football School',
    date: 'Saturday, May 23, 2026',
    time: '07:30 AM – 10:30 AM',
    ageGroups: 'Grassroots U8 – U13',
    slotsTotal: 50,
    slotsBooked: 46,
    evaluatorCoach: 'Coach Debabrata Das (AFC ‘C’)',
    status: 'Filling Fast',
    requirements: 'Grassroots candidates welcome; baseline physical evaluation conducted.',
  },
];

export interface AcademyEvent {
  id: string;
  title: string;
  category: 'Training Camp' | 'Football School' | 'Tournament' | 'Trial' | 'Workshop' | 'Community Event';
  date: string;
  duration: string;
  location: string;
  ageGroup: string;
  registrationStatus: 'Open' | 'Filling Fast' | 'Waitlist';
  fee: string;
  description: string;
}

export interface NewsStory {
  id: string;
  title: string;
  category: 'Academy News' | 'Match Report' | 'Player Story' | 'Coach Story' | 'Community Story';
  date: string;
  readTime: string;
  author: string;
  summary: string;
  content: string[];
  image: string;
  featured?: boolean;
}

export const ACADEMY_PROGRAMS: Program[] = [
  {
    id: 'foundation',
    name: 'Foundation Program',
    subtitle: 'Building the Fundamentals & Passion',
    ageGroup: 'U8 – U10 (Ages 7–10)',
    target: 'Grassroots newcomers & young enthusiasts',
    description: 'Designed to build unconditional love for the ball. Players master foundational coordination, ball manipulation, and small-sided free play in a high-encouragement environment.',
    keyFeatures: [
      '1v1 Ball Mastery & bilateral footwork routines',
      'Fundamental movement skills (ABC: Agility, Balance, Coordination)',
      '3v3 & 4v4 Small-Sided Games (SSG) for maximum touches',
      'Fun game-based spatial perception drills',
      'Quarterly grassroots progress certificate'
    ],
    schedule: '3 Sessions / Week (60 mins)',
    coachRatio: '1:10 Coach-to-Player ratio',
    pillarEmphasis: { technical: 50, tactical: 15, physical: 20, mental: 15 },
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20'
  },
  {
    id: 'development',
    name: 'Development Program',
    subtitle: 'Developing Complete, Intelligent Footballers',
    ageGroup: 'U11 – U13 (Ages 11–13)',
    target: 'Intermediate youth players transitioning to competitive structures',
    description: 'Focus shifts from isolated technical work to technical execution under spatial and temporal pressure. Players learn passing triangles, pressing triggers, and defensive body shape.',
    keyFeatures: [
      'Passing rhythms: 1-touch & 2-touch dynamic rondos',
      'Positional awareness in 7v7 and 9v9 setups',
      'Speed of thought & scan frequency drills',
      'Aerobic base & athletic acceleration mechanics',
      'Individual technical report card twice per season'
    ],
    schedule: '4 Sessions / Week (75 mins)',
    coachRatio: '1:12 Coach-to-Player ratio',
    pillarEmphasis: { technical: 40, tactical: 30, physical: 15, mental: 15 },
    badgeColor: 'border-sky-500/40 text-sky-400 bg-sky-950/20'
  },
  {
    id: 'advanced',
    name: 'Advanced Development',
    subtitle: 'High-Tempo Tactical & Technical Mastery',
    ageGroup: 'U14 – U15 (Ages 14–15)',
    target: 'Committed players competing in district and state youth leagues',
    description: 'Transitioning to full 11v11 pitch dynamics. Players master tactical periodization, phase transitions (offensive & defensive transitions), and game-reading under intense competition.',
    keyFeatures: [
      '11v11 structural shapes & pressing schemes',
      'Tactical video analysis & match review classroom sessions',
      'Position-specific functional training (wingers, midfielders, CBs, strikers)',
      'Plyometric & functional agility strength conditioning',
      'Match exposure in recognized state/district youth cups'
    ],
    schedule: '5 Sessions / Week (90 mins)',
    coachRatio: '1:12 Coach-to-Player ratio',
    pillarEmphasis: { technical: 30, tactical: 35, physical: 20, mental: 15 },
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-950/20'
  },
  {
    id: 'elite',
    name: 'Elite Development',
    subtitle: 'Pre-Professional Pathway & High Performance',
    ageGroup: 'U16 – U18 (Ages 16–18)',
    target: 'Aspiring professional players and national trial prospects',
    description: 'Our apex academy tier. Rigorous sports science, biometric tracking, individualized gym programming, and direct scouting showcase fixtures against national academies.',
    keyFeatures: [
      'Professional match preparation & scouting showcase tournaments',
      'GPS player load management & recovery protocols',
      'Sports psychology, mental resilience, and media conduct',
      'Pathway to state senior leagues and professional club trials',
      'Comprehensive digital scouting profile dossier'
    ],
    schedule: '6 Sessions / Week (105 mins) + Matchday',
    coachRatio: '1:10 Coach-to-Player ratio',
    pillarEmphasis: { technical: 25, tactical: 35, physical: 25, mental: 15 },
    badgeColor: 'border-amber-500/40 text-amber-700 bg-amber-50'
  },
  {
    id: 'goalkeeper',
    name: 'Goalkeeper Program',
    subtitle: 'Specialized Modern Shot-Stopping & Distribution',
    ageGroup: 'U10 – U18 (Grouped by age & skill)',
    target: 'Dedicated goalkeepers seeking dedicated position coaching',
    description: 'Goalkeeping in modern football demands supreme footwork, sweeping confidence, aerial dominance, and surgical distribution. Led by licensed goalkeeper specialists.',
    keyFeatures: [
      'Diving mechanics, footwork sets, and low-shot handling',
      '1v1 spread blocks, closing angles, and reaction saves',
      'Distribution under press: Side volleys, clip passes, ground switches',
      'Defensive line communication & set-piece organization',
      'Integration into team tactical game models every session'
    ],
    schedule: '3 GK Specific Sessions + 2 Team Sessions / Week',
    coachRatio: '1:6 Specialized GK ratio',
    pillarEmphasis: { technical: 35, tactical: 30, physical: 20, mental: 15 },
    badgeColor: 'border-yellow-500/40 text-yellow-400 bg-yellow-950/20'
  },
  {
    id: 'girls-football',
    name: 'Girls Football Program',
    subtitle: 'Creating Structured Opportunities for Girls in Football',
    ageGroup: 'U10 – U17 (Girls)',
    target: 'Passionate female footballers from grassroots to competitive level',
    description: 'A dedicated high-performance and grassroots initiative providing equal training hours, licensed female coaching staff, safe spaces, and competitive tournaments.',
    keyFeatures: [
      'Same elite curriculum and coaching standards',
      'Female-athlete-specific physical conditioning and ACL injury prevention',
      'Exclusive friendly matches and state women’s league participation',
      'Mentorship by national and state female football icons',
      'Full scholarship slots available for top female talents'
    ],
    schedule: '4 Sessions / Week (75 mins)',
    coachRatio: '1:10 Coach-to-Player ratio',
    pillarEmphasis: { technical: 40, tactical: 25, physical: 20, mental: 15 },
    badgeColor: 'border-pink-500/40 text-pink-400 bg-pink-950/20'
  },
  {
    id: 'holiday-camps',
    name: 'Holiday Football Camps',
    subtitle: 'Intensive Seasonal Clinics & Masterclasses',
    ageGroup: 'U8 – U16 (Open to all)',
    target: 'Players looking for intensive development during school holidays',
    description: 'Action-packed 5 to 10 day immersive football bootcamps combining high-repetition skill stations, tournament days, skill challenges, and guest coach masterclasses.',
    keyFeatures: [
      'Multi-session daily training with morning & evening blocks',
      'Nutrition and tactical workshops between pitch drills',
      'World Cup tournament format on final day',
      'Camp jersey, official certificate, and assessment sheet',
      'Direct scouting bridge into MADEN FAF full-time academy'
    ],
    schedule: 'Seasonal: Winter / Summer / Puja Holidays',
    coachRatio: '1:12 Coach-to-Player ratio',
    pillarEmphasis: { technical: 45, tactical: 25, physical: 15, mental: 15 },
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-950/20'
  },
  {
    id: 'specialized',
    name: 'Specialized & 1-on-1 Training',
    subtitle: 'Targeted Technical & Athletic Fine-Tuning',
    ageGroup: 'U11 – U18',
    target: 'Players requiring bespoke correction or accelerated preparation',
    description: 'Private and micro-group (1–4 players) coaching focusing on specific biomechanics: weak foot mastery, ball striking from range, heading technique, and agility bursts.',
    keyFeatures: [
      'Pre-training video diagnostic of technique flaws',
      'Targeted 500+ ball contacts per 60-minute session',
      'High-speed camera slow-motion review with coach',
      'Position-specific scenarios (e.g., striker finishing under contact)',
      'Customized homework drill plans'
    ],
    schedule: 'Flexible / By Appointment',
    coachRatio: '1:1 to 1:4 Ratio',
    pillarEmphasis: { technical: 50, tactical: 20, physical: 20, mental: 10 },
    badgeColor: 'border-amber-400/40 text-amber-300 bg-amber-950/20'
  }
];

export const ACADEMY_CAMPUSES: Campus[] = [
  {
    id: 'gayeshpur',
    name: 'Gayeshpur Campus',
    tagline: 'MADEN FAF Flagship Foundational Campus',
    location: 'Gayeshpur, Nadia, West Bengal',
    address: 'Near Gayeshpur Stadium Grounds, Ward 4, Gayeshpur 741234',
    association: 'MADEN FAF Central Training Ground',
    status: 'active',
    description: 'The historic starting point of MADEN FAF. Features high-standard natural grass pitches, modern floodlighting, agility track, tactical classroom, and specialized equipment room.',
    facilities: [
      'Full-size 11v11 natural grass pitch with automatic irrigation',
      'High-lux LED floodlights for evening training sessions',
      'Player gym & functional rehabilitation zone',
      'Audio-visual tactical review classroom (seats 35)',
      'Player changing rooms & physio treatment room',
      'Equipment store & ball-rebound walls'
    ],
    trainingDays: 'Tuesday, Thursday, Saturday & Sunday',
    timings: 'Morning: 6:00 AM – 8:30 AM | Evening: 4:00 PM – 7:00 PM',
    ageGroups: ['U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'Girls Academy'],
    headCoach: {
      name: 'Bapi Roy',
      license: 'AFC ‘B’ Licensed Coach',
      experience: '12+ years in elite youth development & state youth championships'
    },
    contactPhone: '+91 98302 45891',
    contactEmail: 'gayeshpur@madenfaf.com',
    image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'north24parganas',
    name: 'North 24 Parganas Campus',
    tagline: 'In Association with Leninnagar Sporting Club',
    location: 'Ichapore, North 24 Parganas, West Bengal',
    address: 'Leninnagar Sporting Club Grounds, Ichapore Nawabganj, 743144',
    association: 'In association with Leninnagar Sporting Club, Ichapore',
    status: 'active',
    description: 'A vibrant sporting hotbed partnering with the prestigious Leninnagar Sporting Club. Known for incredible grassroots football culture, high-tempo training, and passionate community backing.',
    facilities: [
      'Championship natural pitch with spectator stand',
      'Dedicated Goalkeeper training strip',
      'Clubhouse medical & physiotherapy station',
      'Community cafeteria & parent viewing pavilion',
      'Quarterly grassroots tournament hosting capabilities'
    ],
    trainingDays: 'Monday, Wednesday, Friday & Sunday',
    timings: 'Morning: 6:30 AM – 8:30 AM | Evening: 3:45 PM – 6:30 PM',
    ageGroups: ['U9', 'U11', 'U13', 'U15', 'U17'],
    headCoach: {
      name: 'Soumitra Banerjee',
      license: 'AIFF ‘C’ Licensed & NIS Certified',
      experience: 'Ex-Santosh Trophy player & 9 years youth academy leadership'
    },
    contactPhone: '+91 97481 12398',
    contactEmail: 'ichapore@madenfaf.com',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'krishnanagar',
    name: 'Krishnanagar Football School',
    tagline: 'In Collaboration with United Red Star Club',
    location: 'Krishnanagar, Nadia, West Bengal',
    address: 'United Red Star Club Ground, High Street Road, Krishnanagar 741101',
    association: 'In collaboration with United Red Star Club',
    status: 'active',
    description: 'Regional football academy hub catering to ambitious young footballers across the Krishnanagar and Nadia district. Focused on high-repetition technical development and tournament readiness.',
    facilities: [
      'Multi-pitch complex (Grass 11v11 + Mini 5v5 turf)',
      'Full perimeter fencing & secure athlete entry',
      'Modern equipment: speed gates, rebounders, target nets',
      'Dedicated parent lounge with hydration facilities',
      'Weekend competitive league matches'
    ],
    trainingDays: 'Wednesday, Friday, Saturday & Sunday',
    timings: 'Morning: 6:00 AM – 8:15 AM | Evening: 4:15 PM – 6:45 PM',
    ageGroups: ['U8', 'U10', 'U12', 'U14', 'U16'],
    headCoach: {
      name: 'Debabrata Das',
      license: 'AFC ‘C’ Licensed Coach',
      experience: 'Former IFA Shield youth finalist coach with 8 years academy tenure'
    },
    contactPhone: '+91 94340 76210',
    contactEmail: 'krishnanagar@madenfaf.com',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'kalyani-hub',
    name: 'Kalyani High-Performance Centre (Upcoming)',
    tagline: 'Planned Advanced Residential & Sports Science Hub',
    location: 'Kalyani Sports Corridor, Nadia',
    address: 'Phase III Development Zone, Kalyani 741235',
    association: 'MADEN FAF Future Vision',
    status: 'upcoming',
    description: 'Our vision for the next chapter: an integrated football and education centre with residential boarding, sports biomechanics lab, synthetic artificial turf pitch, and international scout hosting.',
    facilities: [
      'FIFA-standard artificial turf & hybrid grass pitches',
      'Athlete residential dormitory (60 capacity)',
      'Biomechanics & sports medicine recovery suite',
      'Classrooms for academic tutoring alongside football'
    ],
    trainingDays: 'Planned Full-Time Residential Academy',
    timings: 'Year-Round Structured Academic & Sports Timetable',
    ageGroups: ['U13', 'U15', 'U17', 'U19'],
    headCoach: {
      name: 'Technical Director Appointee',
      license: 'UEFA / AFC ‘A’ Licensed Panel',
      experience: 'National academy leadership'
    },
    contactPhone: '+91 98302 45891',
    contactEmail: 'future@madenfaf.com',
    image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80'
  }
];

export const MADEN_PATHWAY: PathwayStage[] = [
  {
    step: 1,
    title: 'DISCOVER',
    ageBracket: 'U8 – U10 (Ages 7–10)',
    objective: 'Ignite innate passion, establish ball love, and develop foundational neuromuscular agility.',
    trainingFocus: [
      'Joyful repetition of 1v1 ball mastery moves (scissors, drag-backs, step-overs)',
      'Basic spatial awareness through tag games and 3v3 mini-pitches',
      'Bilateral balance, jumping, landing, and dynamic coordination',
      'Sportsmanship, respect for teammates, and basic listening discipline'
    ],
    milestones: [
      'Comfortable juggling 15+ touches with both feet',
      'Able to execute 3 distinct turns under gentle pressure',
      'Demonstrates enthusiastic willingness to share and pass the ball'
    ],
    assessmentCriteria: ['Coordination Index', 'First Touch Confidence', 'Effort & Enjoyment'],
    progressionGate: 'Coach recommendation based on ball mastery rubric and attendance consistency (>80%).',
    weeklyHours: '4.5 Hours / Week'
  },
  {
    step: 2,
    title: 'DEVELOP',
    ageBracket: 'U11 – U13 (Ages 11–13)',
    objective: 'Transition from individual ball mastery to collective game understanding and positional discipline.',
    trainingFocus: [
      'Fast-paced rondos (4v1, 4v2, 5v3) emphasizing body shape and open stance',
      'Introduction to team shapes (1-3-2-1 in 7v7 and 1-3-3-2 in 9v9)',
      'Pre-orientation: scanning shoulders before receiving',
      'Aerobic stamina building through ball-oriented small-sided games'
    ],
    milestones: [
      'Executes accurate passing with both inside and outside of boot over 15 yards',
      'Understands pressing cues when the opponent takes a heavy touch',
      'Demonstrates mental focus across full 60-minute training sessions'
    ],
    assessmentCriteria: ['Passing Accuracy under Time Pressure', 'Scanning Rate', 'Tactical Shape Adherence'],
    progressionGate: 'Passing benchmark test (minimum 75% accuracy) and seasonal tactical assessment evaluation.',
    weeklyHours: '6.5 Hours / Week'
  },
  {
    step: 3,
    title: 'COMPETE',
    ageBracket: 'U14 – U15 (Ages 14–15)',
    objective: 'Master full 11v11 pitch tactical dynamics and cultivate a resilient competitive mindset.',
    trainingFocus: [
      'Full 11v11 phase transitions (attacking to defensive transition within 5 seconds)',
      'Position-specific roles: overlapping full-backs, double pivot coordination',
      'Set piece architecture (attacking corners, zonal marking setups)',
      'Strength, sprint mechanics, and core stability'
    ],
    milestones: [
      'Regular starter in district/state youth league fixtures',
      'Maintains composure and game discipline during tight scorelines',
      'Analyzes personal match video clips with coach feedback'
    ],
    assessmentCriteria: ['Match Decision-Making Index', '30m Sprint & Yo-Yo Test Level', 'Tactical Versatility'],
    progressionGate: 'State youth league trial assessment, physical fitness benchmarks, and academic standing check.',
    weeklyHours: '9 Hours / Week'
  },
  {
    step: 4,
    title: 'PERFORM',
    ageBracket: 'U16 – U17 (Ages 16–17)',
    objective: 'Refine high-performance consistency, tactical flexibility, and physical power for senior readiness.',
    trainingFocus: [
      'Advanced tactical periodization against varying tactical setups (low block vs high press)',
      'High-intensity interval conditioning and tailored resistance work',
      'Sports psychology: handling pressure, leadership, and match preparation',
      'Detailed statistical game tracking and biometric load monitoring'
    ],
    milestones: [
      'Dominates individual duels in state-level championship games',
      'Demonstrates vocal on-pitch leadership and tactical communication',
      'Maintains consistent performance ratings (>7.5/10) over 10+ competitive matches'
    ],
    assessmentCriteria: ['Game Impact Rating', 'Biometric Work Rate (km/min)', 'Mental Fortitude Score'],
    progressionGate: 'Technical Director panel review, physical battery test, and scout report endorsement.',
    weeklyHours: '11 Hours / Week'
  },
  {
    step: 5,
    title: 'ADVANCE',
    ageBracket: 'U18 & Pre-Pro (Ages 17–19+)',
    objective: 'Launch players into professional club trials, state senior squads, university scholarships, and national teams.',
    trainingFocus: [
      'Match tempo adaptation to senior football standards',
      'Individualized scouting dossiers and professional match highlight reels',
      'Professional player conduct, contract literacy, and athlete lifestyle',
      'Showcase exhibition matches against pro club reserves and university sides'
    ],
    milestones: [
      'Invited to trials with I-League, ISL youth academies, or Calcutta Football League clubs',
      'Represented district or state in national junior championships',
      'Signed semi-pro/pro youth contract or secured college sports scholarship'
    ],
    assessmentCriteria: ['Pro-Club Trial Readiness', 'High-Tempo Duel Success Rate', 'Comprehensive Scouting Grade'],
    progressionGate: 'Graduation into professional ecosystem with ongoing MADEN FAF alumni mentorship.',
    weeklyHours: '13+ Hours / Week'
  }
];

export const SAMPLE_PLAYERS: PlayerProfile[] = [
  {
    id: 'p-01',
    name: 'Subham Roy',
    ageGroup: 'U15',
    position: 'Central Midfielder (#8)',
    campus: 'Gayeshpur Campus',
    pathwayStage: 'COMPETE',
    jerseyNumber: 8,
    joinedYear: 2022,
    avatar: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=400&q=80',
    stats: {
      matchesPlayed: 18,
      goals: 5,
      assists: 11,
      passAccuracy: 88,
      minutesPlayed: 1420,
      overallRating: 8.4
    },
    metrics: {
      technical: 86,
      tactical: 84,
      physical: 79,
      mental: 88,
      matchPerformance: 85
    },
    drillScores: {
      firstTouchIndex: '9.2 / 10',
      passingAccuracy: '88% under press',
      speed30m: '4.12s',
      yoYoLevel: 'Level 18.4',
      decisionSpeed: '0.42s scan-to-pass'
    },
    coachNotes: 'Superb spatial awareness. Operates naturally in tight spaces between lines. Vocal leader on the pitch with exceptional work ethic.',
    achievements: [
      'Captain of MADEN FAF U15 Bengal Youth Cup Champions',
      'Player of the Tournament — Nadia District Youth Cup 2025',
      'Selected for State U15 Camp Probables'
    ]
  },
  {
    id: 'p-02',
    name: 'Ananya Das',
    ageGroup: 'U16',
    position: 'Left Winger (#11)',
    campus: 'Gayeshpur Campus (Girls)',
    pathwayStage: 'PERFORM',
    jerseyNumber: 11,
    joinedYear: 2023,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    stats: {
      matchesPlayed: 16,
      goals: 14,
      assists: 8,
      passAccuracy: 82,
      minutesPlayed: 1280,
      overallRating: 8.7
    },
    metrics: {
      technical: 89,
      tactical: 81,
      physical: 88,
      mental: 85,
      matchPerformance: 88
    },
    drillScores: {
      firstTouchIndex: '9.4 / 10',
      passingAccuracy: '82% completion',
      speed30m: '3.98s (Top Squad Burst)',
      yoYoLevel: 'Level 19.1',
      decisionSpeed: '0.38s in final 3rd'
    },
    coachNotes: 'Devastating 1v1 dribbler. Can cut inside on right foot or hit byline on left. High-motor pressing attitude from the front.',
    achievements: [
      'Top Goalscorer — West Bengal Girls Invitational 2025 (9 goals in 5 games)',
      'MADEN FAF Academy Player of the Month (January 2026)',
      'Full Merit Scholarship Recipient'
    ]
  },
  {
    id: 'p-03',
    name: 'Rahul Ghosh',
    ageGroup: 'U16',
    position: 'Centre Forward (#9)',
    campus: 'North 24 Parganas Campus',
    pathwayStage: 'PERFORM',
    jerseyNumber: 9,
    joinedYear: 2022,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    stats: {
      matchesPlayed: 20,
      goals: 19,
      assists: 4,
      passAccuracy: 76,
      minutesPlayed: 1540,
      overallRating: 8.5
    },
    metrics: {
      technical: 83,
      tactical: 80,
      physical: 89,
      mental: 82,
      matchPerformance: 86
    },
    drillScores: {
      firstTouchIndex: '8.7 / 10',
      passingAccuracy: '76% hold-up link',
      speed30m: '3.94s',
      yoYoLevel: 'Level 18.8',
      decisionSpeed: '0.45s shot release'
    },
    coachNotes: 'Lethal penalty box striker. Dominant aerial timing, clever blindside runs behind center backs. Excellent physical hold-up play.',
    achievements: [
      'Scored winning goal in IFA Youth Inter-Academy Final',
      'Hat-trick against Mohun Bagan Youth Academy U16'
    ]
  },
  {
    id: 'p-04',
    name: 'Aayan Mondal',
    ageGroup: 'U14',
    position: 'Goalkeeper (#1)',
    campus: 'Krishnanagar Football School',
    pathwayStage: 'COMPETE',
    jerseyNumber: 1,
    joinedYear: 2023,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    stats: {
      matchesPlayed: 15,
      goals: 0,
      assists: 2,
      cleanSheets: 8,
      passAccuracy: 84,
      minutesPlayed: 1200,
      overallRating: 8.3
    },
    metrics: {
      technical: 84,
      tactical: 82,
      physical: 81,
      mental: 87,
      matchPerformance: 83
    },
    drillScores: {
      firstTouchIndex: '8.8 / 10 (GK)',
      passingAccuracy: '84% distribution',
      speed30m: '4.25s',
      yoYoLevel: 'Level 17.6',
      decisionSpeed: '0.36s reaction saves'
    },
    coachNotes: 'Brave sweeper keeper. Outstanding foot distribution to fullbacks. Commands his penalty area with maturity far beyond his age.',
    achievements: [
      'Golden Glove — Krishnanagar Youth Invitational 2025',
      'Saved 3 penalties in penalty shootouts this season'
    ]
  }
];

export const MATCH_FIXTURES: MatchFixture[] = [
  {
    id: 'm-01',
    competition: 'IFA Bengal Youth Championship — U15',
    status: 'completed',
    homeTeam: 'MADEN FAF U15',
    awayTeam: 'East Bengal Youth Academy',
    homeTeamLogo: 'preset:maden-faf',
    awayTeamLogo: 'preset:east-bengal',
    isHome: true,
    homeScore: 3,
    awayScore: 1,
    date: 'March 18, 2026',
    time: '3:30 PM',
    venue: 'Gayeshpur Central Ground',
    ageGroup: 'U15',
    playerOfTheMatch: 'Subham Roy (MADEN FAF #8)',
    matchReportSnippet: 'A commanding display from MADEN FAF U15 as two clinical transition goals in the first half set the tone against an organized East Bengal side.',
    keyEvents: ['14’ Goal - Subham Roy (MADEN FAF)', '38’ Goal - Rahul Ghosh (MADEN FAF)', '62’ East Bengal Goal', '79’ Goal - Subham Roy Assist to Das']
  },
  {
    id: 'm-02',
    competition: 'Nadia District Inter-Club Youth Cup — U17',
    status: 'completed',
    homeTeam: 'Krishnanagar Football School',
    awayTeam: 'Barasat Sports Association',
    homeTeamLogo: 'preset:maden-faf',
    awayTeamLogo: 'preset:diamond-harbour',
    isHome: true,
    homeScore: 2,
    awayScore: 0,
    date: 'March 12, 2026',
    time: '4:00 PM',
    venue: 'United Red Star Ground, Krishnanagar',
    ageGroup: 'U17',
    playerOfTheMatch: 'Aayan Mondal (GK)',
    matchReportSnippet: 'Disciplined defensive shape and lethal counter-attacking efficiency earned a clean sheet victory for our Krishnanagar campus side.',
    keyEvents: ['22’ Goal - Counter attack finish', '45’ Penalty save by Aayan Mondal', '71’ Goal - Header from corner kick']
  },
  {
    id: 'm-02b',
    competition: 'Bengal Inter-Academy Grassroots League — U13',
    status: 'completed',
    homeTeam: 'North 24 Parganas Campus U13',
    awayTeam: 'Kalyani United FA',
    homeTeamLogo: 'preset:leninnagar',
    awayTeamLogo: 'preset:barrackpore',
    isHome: true,
    homeScore: 4,
    awayScore: 1,
    date: 'March 05, 2026',
    time: '3:00 PM',
    venue: 'Leninnagar Sporting Club Ground, Ichapore',
    ageGroup: 'U13',
    playerOfTheMatch: 'Rohit Biswas (MADEN FAF #10)',
    matchReportSnippet: 'A fluid passing masterclass with 18-pass build-up sequences leading to three first-half goals in front of home supporters.',
    keyEvents: ['11’ Goal - Rohit Biswas', '28’ Goal - Somnath Sarkar', '39’ Goal - Rohit Biswas', '54’ Kalyani United Goal', '68’ Goal - Corner header']
  },
  {
    id: 'm-02c',
    competition: 'All-Bengal Girls Football Invitational — U17',
    status: 'completed',
    homeTeam: 'MADEN FAF Girls Elite',
    awayTeam: 'Siliguri Football Academy',
    homeTeamLogo: 'preset:maden-faf',
    awayTeamLogo: 'preset:ifa-bengal',
    isHome: true,
    homeScore: 3,
    awayScore: 0,
    date: 'February 28, 2026',
    time: '4:15 PM',
    venue: 'Gayeshpur Central Ground',
    ageGroup: 'U17 Girls',
    playerOfTheMatch: 'Riya Das (Winger #7)',
    matchReportSnippet: 'Relentless counter-pressing and electric wing play secured an emphatic 3-0 clean sheet in the tournament quarter-finals.',
    keyEvents: ['19’ Goal - Riya Das solo run', '44’ Goal - Tap-in after high press', '78’ Goal - 25-yard curling strike by Riya Das']
  },
  {
    id: 'm-02d',
    competition: 'Kolkata Youth Premier Cup — U18',
    status: 'completed',
    homeTeam: 'MADEN FAF U18',
    awayTeam: 'Mohammedan SC Academy',
    homeTeamLogo: 'preset:maden-faf',
    awayTeamLogo: 'preset:mohammedan-sc',
    isHome: false,
    homeScore: 2,
    awayScore: 2,
    date: 'February 20, 2026',
    time: '2:30 PM',
    venue: 'Salt Lake Stadium Practice Ground',
    ageGroup: 'U18',
    playerOfTheMatch: 'Pritam Samanta (CM)',
    matchReportSnippet: 'A gritty, high-intensity draw against Mohammedan SC Academy showing immense character after trailing 0-1 at half-time.',
    keyEvents: ['31’ Mohammedan SC Goal', '55’ Goal - Free kick equalizer', '74’ Goal - Header from cross', '88’ Mohammedan SC Equalizer']
  },
  {
    id: 'm-03',
    competition: 'State Youth Development League — U16',
    status: 'upcoming',
    homeTeam: 'MADEN FAF U16',
    awayTeam: 'Mohun Bagan Youth Academy',
    homeTeamLogo: 'preset:maden-faf',
    awayTeamLogo: 'preset:mohun-bagan',
    isHome: true,
    date: 'April 04, 2026',
    time: '3:45 PM',
    venue: 'Gayeshpur Stadium Ground',
    ageGroup: 'U16',
    matchReportSnippet: 'High-stakes showcase match. Scouts from state youth development panels and national I-League clubs confirmed in attendance.'
  },
  {
    id: 'm-04',
    competition: 'Leninnagar Grassroots Cup — U13',
    status: 'upcoming',
    homeTeam: 'North 24 Parganas Campus U13',
    awayTeam: 'Barrackpore Youth FC',
    homeTeamLogo: 'preset:leninnagar',
    awayTeamLogo: 'preset:barrackpore',
    isHome: true,
    date: 'April 11, 2026',
    time: '9:00 AM',
    venue: 'Leninnagar Sporting Club Ground, Ichapore',
    ageGroup: 'U13',
    matchReportSnippet: 'Quarter-final clash showcasing our U13 development cohort in front of a passionate home crowd.'
  },
  {
    id: 'm-05',
    competition: 'Bengal Girls Youth Invitational — U17',
    status: 'upcoming',
    homeTeam: 'MADEN FAF Girls Elite',
    awayTeam: 'Kolkata Strikers Academy',
    homeTeamLogo: 'preset:maden-faf',
    awayTeamLogo: 'preset:kolkata-strikers',
    isHome: false,
    date: 'April 18, 2026',
    time: '4:30 PM',
    venue: 'Rabindra Sarobar Sports Complex, Kolkata',
    ageGroup: 'U17 Girls',
    matchReportSnippet: 'Top of the table clash. Our undefeated girls cohort looks to extend their 6-match winning run.'
  }
];

export const ACADEMY_EVENTS: AcademyEvent[] = [
  {
    id: 'ev-01',
    title: 'Spring High-Performance Intensive Camp 2026',
    category: 'Training Camp',
    date: 'April 14 – April 20, 2026',
    duration: '7 Days (Morning & Evening sessions)',
    location: 'Gayeshpur Central Campus',
    ageGroup: 'U11 – U17 (Boys & Girls)',
    registrationStatus: 'Filling Fast',
    fee: 'Subsidized Academy Rates (Free for Scholarship players)',
    description: 'High-tempo 7-day tactical immersion covering phase transitions, positional speed, video analysis, and daily competitive mini-matches.'
  },
  {
    id: 'ev-02',
    title: 'MADEN FAF Open Talent Trial — Summer Intake 2026',
    category: 'Trial',
    date: 'May 02 – May 03, 2026',
    duration: '2 Full Days',
    location: 'All 3 Campuses (Gayeshpur, Ichapore, Krishnanagar)',
    ageGroup: 'U10, U12, U14, U16',
    registrationStatus: 'Open',
    fee: 'Free Admission (Prior Online Registration Required)',
    description: 'Annual open scouting trials for admission to regular academy batches and full merit scholarship evaluation by licensed AFC coaches.'
  },
  {
    id: 'ev-03',
    title: 'Elite Goalkeeper Masterclass with Former National Pro',
    category: 'Workshop',
    date: 'May 16, 2026',
    duration: 'Full Day Intensive (8:00 AM – 5:00 PM)',
    location: 'North 24 Parganas Campus, Ichapore',
    ageGroup: 'U12 – U18 Goalkeepers',
    registrationStatus: 'Filling Fast',
    fee: 'Registration Required',
    description: 'Specialized clinic on 1v1 box coverage, reaction mechanics, diving biomechanics, and tactical distribution under press.'
  },
  {
    id: 'ev-04',
    title: 'Leninnagar Youth Football Festival (Under-12)',
    category: 'Tournament',
    date: 'June 06 – June 07, 2026',
    duration: 'Weekend Tournament',
    location: 'Leninnagar Sporting Club Grounds',
    ageGroup: 'U10 & U12',
    registrationStatus: 'Open',
    fee: 'Team Entry Registration',
    description: 'A celebration of grassroots football bringing together 16 youth teams across Bengal with family festivals and scout kiosks.'
  }
];

export const NEWS_STORIES: NewsStory[] = [
  {
    id: 'n-01',
    title: 'Inside Gayeshpur: How MADEN FAF’s Video Analysis Room is Revolutionizing U15 Game Intelligence',
    category: 'Academy News',
    date: 'March 22, 2026',
    readTime: '4 min read',
    author: 'Technical Media Team',
    summary: 'Step behind closed doors at our flagship campus to see how tactical video reviews and scan frequency tracking are turning young footballers into intelligent decision makers.',
    content: [
      'Modern football is won in milliseconds. At MADEN FAF, coaching doesn’t end when players step off the grass pitch. Every week, our U14, U15, and U16 cohorts spend structured hours in our dedicated tactical analysis room at Gayeshpur.',
      'Using wide-angle match recordings, coaches break down game clips into clear learning moments: body orientation before receiving, exploiting half-spaces, and synchronizing pressing triggers as a compact unit.',
      '“When players see themselves on screen, the penny drops,” explains Head Coach Bapi Roy. “They realize why taking two seconds to scan their shoulders creates an extra five yards of space. That is where European academies excel, and that is what we are embedding here at MADEN FAF.”'
    ],
    image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
    featured: true
  },
  {
    id: 'n-02',
    title: 'Player of the Month: Ananya Das on Breaking Barriers and Aiming for National Colors',
    category: 'Player Story',
    date: 'March 15, 2026',
    readTime: '3 min read',
    author: 'Academy Editorial',
    summary: 'With 14 goals this season and blazing speed on the wing, 15-year-old Ananya Das shares her journey from grassroots kickabouts to becoming one of Bengal’s most feared youth wingers.',
    content: [
      '“When I first started playing, there weren’t many structured opportunities for girls in our area,” Ananya shares with a smile. “Joining MADEN FAF changed everything. We train four days a week with the exact same high-performance equipment, coaches, and tactical rigor as the boys.”',
      'Her dedication has paid off. In the recent West Bengal Girls Invitational, Ananya netted 9 goals in 5 games, catching the eye of state team selectors. Her dream? Wearing the India jersey and leading a new generation of fearless female athletes.'
    ],
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'n-03',
    title: 'Leninnagar Campus Hosts Grassroots Grass Festival with 140+ Aspiring Youngsters',
    category: 'Community Story',
    date: 'March 04, 2026',
    readTime: '3 min read',
    author: 'Community Outreach',
    summary: 'A weekend of pure football joy in Ichapore as kids from local schools experienced structured football drills, obstacle courses, and mini World Cup matches.',
    content: [
      'Over 140 children from Ichapore, Barrackpore, and surrounding neighborhoods took over the Leninnagar Sporting Club pitch for the MADEN FAF Grassroots Festival. For many, it was their very first time receiving coaching from AFC-certified trainers.',
      'The event also identified 12 standout young talents who were awarded full development scholarships into the MADEN FAF U10 and U12 foundation squads.'
    ],
    image: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=80'
  }
];

export const SCHOLARSHIP_TIERS: ScholarshipTier[] = [
  {
    id: 'merit-full',
    tier: 'Full Merit Scholarship',
    coverage: '100% Tuition & Kit Grant',
    description: 'Awarded to exceptional state/district level talents who demonstrate standout technical ability, discipline, and match character during trials.',
    benefits: [
      'Zero tuition and coaching fee for the entire academic year',
      'Full MADEN FAF official kit package (home, away, training bibs, bag)',
      'Free participation in all high-performance holiday camps & tournaments',
      'Dedicated one-on-one video analysis and physical profiling'
    ],
    quota: '15 Full-Ride Slots per Season',
    status: 'active'
  },
  {
    id: 'need-based',
    tier: 'Need-Based Development Subsidy',
    coverage: '50% to 75% Fee Waiver',
    description: 'Ensuring financial hardship never prevents a dedicated young footballer from accessing top-tier training facilities and coaching.',
    benefits: [
      'Significantly reduced monthly academy contribution',
      'Subsidized match travel, tournament accommodation, and kit gear',
      'Flexible payment terms for families with multiple youth athletes',
      'Access to sports nutrition guidance and medical check-ups'
    ],
    quota: '40+ Subsidized Slots across all campuses',
    status: 'active'
  },
  {
    id: 'girls-grant',
    tier: 'Girls in Football Advancement Grant',
    coverage: 'Up to 100% Comprehensive Support',
    description: 'Special initiative designed to break societal barriers and empower female footballers with equal coaching, gear, and competitive matches.',
    benefits: [
      'Full or partial scholarship based on trial performance & commitment',
      'Free travel coordination for regional match fixtures',
      'Mentorship sessions with renowned female state football icons'
    ],
    quota: '25 Dedicated Grants per year',
    status: 'active'
  }
];

export const DEFAULT_SPONSORS: SponsorPartner[] = [
  {
    id: 'nivia',
    name: 'Nivia Sports',
    category: 'Match Ball & Technical Gear',
    tier: 'Technical Partner',
    presetKey: 'nivia',
    websiteUrl: 'https://www.niviasports.com',
    active: true,
    order: 1
  },
  {
    id: 'leninnagar-sc',
    name: 'Leninnagar Sporting Club',
    category: 'Official Ground Partner',
    tier: 'Ground Partner',
    presetKey: 'leninnagar-sc',
    websiteUrl: 'https://madenfaf.com',
    active: true,
    order: 2
  },
  {
    id: 'fastandup',
    name: 'Fast&Up India',
    category: 'Official Nutrition & Recovery',
    tier: 'Nutrition Partner',
    presetKey: 'fastandup',
    websiteUrl: 'https://www.fastandup.in',
    active: true,
    order: 3
  },
  {
    id: 'ifa-bengal',
    name: 'IFA West Bengal',
    category: 'Sanctioning Youth Federation',
    tier: 'Federation / Sanctioning',
    presetKey: 'ifa-bengal',
    websiteUrl: 'https://ifabengal.org',
    active: true,
    order: 4
  },
  {
    id: 'apex-physio',
    name: 'Apex Sports Physio',
    category: 'Sports Science & Rehab',
    tier: 'Medical Partner',
    presetKey: 'apex-physio',
    websiteUrl: 'https://madenfaf.com',
    active: true,
    order: 5
  }
];

export const DEFAULT_PARENT_DELIVERABLES: ParentDeliverableItem[] = [
  {
    id: 'del-1',
    title: 'Digital Attendance & Check-In',
    desc: 'Real-time logs of every training session attended, with notifications on schedule changes or bad-weather alerts.',
    iconName: 'Calendar',
    active: true
  },
  {
    id: 'del-2',
    title: 'Quarterly Development Reports',
    desc: 'Transparent progress evaluations across technical drills, tactical understanding, physical speed, and behavior.',
    iconName: 'TrendingUp',
    active: true
  },
  {
    id: 'del-3',
    title: 'Matchday Timetables & Locations',
    desc: 'Detailed fixture notices with reporting times, kit requirements, venue directions, and squad selection.',
    iconName: 'Bell',
    active: true
  },
  {
    id: 'del-4',
    title: 'Direct Coach Communication',
    desc: 'Structured parent-coach review windows each term to discuss academic balance, health, and player aspirations.',
    iconName: 'Users',
    active: true
  },
  {
    id: 'del-5',
    title: 'Physiotherapy & Injury Care',
    desc: 'Access to qualified sports rehabilitation advice, warmup routines, and certified medical checkups.',
    iconName: 'Shield',
    active: true
  },
  {
    id: 'del-6',
    title: 'Verified Fee & Receipt Ledger',
    desc: 'Instant digital invoice tracking, transparent monthly fees, and automatic scholarship subsidy reconciliation.',
    iconName: 'CheckCircle2',
    active: true
  }
];

export const DEFAULT_PORTAL_CONFIG: DigitalPortalConfig = {
  portalMode: 'preview',
  accessCode: 'MADEN2026',
  announcementTitle: 'Digital Academy Portal v3.2 Active',
  announcementMessage: 'Welcome to the MADEN FAF multi-role cloud portal. Explore live player analytics, attendance reports, and matchday lineups.',
  playerPortalEnabled: true,
  parentPortalEnabled: true,
  coachPortalEnabled: true,
  adminPortalEnabled: true,
  demoStudents: [
    {
      id: 'student-subham',
      name: 'Subham Roy',
      role: '#8 Midfielder (U15)',
      campus: 'Gayeshpur Campus',
      avatar: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=200&q=80',
      attendance: '94% (Last 90 days)',
      rating: '86% Score',
      analysisCount: '3 videos ready for review'
    },
    {
      id: 'student-aniket',
      name: 'Aniket Mukherjee',
      role: 'Goalkeeper (U12)',
      campus: 'Ichapore Campus',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      attendance: '98% (Clean Sheet Leader)',
      rating: '91% Score',
      analysisCount: '5 match tapes'
    },
    {
      id: 'student-priya',
      name: 'Priya Sen',
      role: '#11 Forward (U14 Girls)',
      campus: 'Gayeshpur Campus',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      attendance: '96% (Team Captain)',
      rating: '89% Score',
      analysisCount: '4 session clips'
    }
  ]
};

export const DIGITAL_PORTAL_ROLES = {
  player: {
    roleName: 'Player Portal',
    user: 'Subham Roy (#8 Midfielder)',
    campus: 'Gayeshpur Campus',
    avatar: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=200&q=80',
    modules: [
      { name: 'Training Schedule', count: '4 sessions this week' },
      { name: 'Attendance Rate', count: '94% (Last 90 days)' },
      { name: 'Technical Assessment', count: '86% Score' },
      { name: 'Match Analysis', count: '3 videos ready for review' }
    ]
  },
  parent: {
    roleName: 'Parent Portal',
    user: 'Mr. Pradip Roy (Parent of Subham Roy)',
    campus: 'Gayeshpur Campus',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    modules: [
      { name: 'Child Development Report', count: 'Q1 2026 Evaluation ready' },
      { name: 'Attendance & Wellness', count: 'Logged by Coach Bapi' },
      { name: 'Upcoming Fixtures', count: 'Next: vs Mohun Bagan U16' },
      { name: 'Academy Notices & Fees', count: 'Receipt #MF-2026-081 paid' }
    ]
  },
  coach: {
    roleName: 'Coach Portal',
    user: 'Coach Bapi Roy (AFC ‘B’ License)',
    campus: 'Gayeshpur Campus',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    modules: [
      { name: 'Session Planner', count: 'Next: Attacking Transitions & Rondos' },
      { name: 'Squad Roster', count: '24 Players active in U15 cohort' },
      { name: 'Player Assessment Rubric', count: '6 evaluations pending review' },
      { name: 'Matchday Sheet', count: 'Starting XI vs Mohun Bagan submitted' }
    ]
  },
  admin: {
    roleName: 'Admin & Director Portal',
    user: 'Academy Operations Desk',
    campus: 'Central Hub',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    modules: [
      { name: 'Campus Enrollment', count: '450+ Active Players across 3 Campuses' },
      { name: 'Coach Licensing', count: '18 Certified AFC/AIFF Trainers' },
      { name: 'Trial Registrations', count: '89 New Submissions for May Intake' },
      { name: 'Scholarship Allocation', count: '42 Active Scholarship Grants' }
    ]
  }
};

export interface CoachStaffMember {
  id: string;
  name: string;
  role: string;
  category: 'all' | 'leadership' | 'campus-head' | 'specialist';
  license: string;
  licenseLevel: 'AFC B' | 'AFC C' | 'AIFF / NIS' | 'Specialist';
  campus: string;
  experienceYears: number;
  playingBackground: string;
  philosophy: string;
  bio: string;
  keySpecialties: string[];
  certifications: string[];
  careerHighlights: string[];
  image: string;
  accentColor: string;
}

export const COACHING_STAFF: CoachStaffMember[] = [
  {
    id: 'coach-bapi-roy',
    name: 'Bapi Roy',
    role: 'Technical Director & Head of Youth Methodology',
    category: 'leadership',
    license: 'AFC ‘B’ Licensed Coach',
    licenseLevel: 'AFC B',
    campus: 'Gayeshpur Flagship Campus & Regional Oversight',
    experienceYears: 14,
    playingBackground: 'Former Calcutta Football League Premier Division Midfielder & Bengal State Youth Captain',
    philosophy: 'Every touch must carry an intention. We do not manufacture robotic players; we nurture autonomous decision-makers who read the pitch two moves ahead and play with courageous hearts.',
    bio: 'Bapi Roy directs MADEN FAF’s unified coaching curriculum across all campus branches. With over 14 years dedicated to youth football periodization and tactical analysis, he has developed a reputation for transforming raw grassroots talent into disciplined, tactically articulate competitors ready for state and national trials.',
    keySpecialties: ['Periodization & Session Design', 'Attacking Transitions & Rondos', 'Spatial Literacy & Scanning', 'Elite Trial Pathway Mentoring'],
    certifications: ['AFC ‘B’ Coaching License', 'AIFF Youth Instructor Certificate', 'AFC Grassroots Leader Diploma', 'Child Safeguarding in Sport Certified', 'Sports First Aid & CPR Level 2'],
    careerHighlights: [
      'Guided 18+ academy graduates to I-League 2 and state youth squads',
      '3x District Youth Championship Winning Head Coach',
      'Architect of the 5-Stage MADEN Pathway Curriculum'
    ],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    accentColor: 'amber'
  },
  {
    id: 'coach-soumitra-banerjee',
    name: 'Soumitra Banerjee',
    role: 'Head of Campus Coaching — North 24 Parganas',
    category: 'campus-head',
    license: 'AIFF ‘C’ Licensed & NIS Certified',
    licenseLevel: 'AIFF / NIS',
    campus: 'Ichapore Campus (in assoc. with Leninnagar Sporting Club)',
    experienceYears: 11,
    playingBackground: 'Former Santosh Trophy Defender & East Bengal Youth Academy Alumnus',
    philosophy: 'Discipline and defensive compactness form the bedrock of winning football. When a young player respects the ball and their teammates, creative brilliance emerges naturally.',
    bio: 'A distinguished former defender who represented Bengal in the prestigious Santosh Trophy, Soumitra brings gritty tactical rigor and professional standards to the North 24 Parganas campus. His training focuses on building mental resilience, positional discipline, and rapid transition mechanics.',
    keySpecialties: ['Defensive Line Compactness', '1v1 Duel Mechanics', 'Counter-Pressing Triggers', 'Youth Discipline & Character'],
    certifications: ['AIFF ‘C’ Coaching Certificate', 'NIS Patiala Diploma in Football Coaching', 'Safe Sport & Positive Coaching Alliance', 'Youth Fitness & Conditioning Level 1'],
    careerHighlights: [
      'Coached Leninnagar SC youth squad to 2024 District League Runners-Up',
      'Developed 6 defenders currently competing in Calcutta 1st Division',
      'Managed over 140+ competitive youth fixtures with a 72% win-rate'
    ],
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    accentColor: 'amber'
  },
  {
    id: 'coach-debabrata-das',
    name: 'Debabrata Das',
    role: 'Head of Football School — Krishnanagar',
    category: 'campus-head',
    license: 'AFC ‘C’ Licensed Coach',
    licenseLevel: 'AFC C',
    campus: 'Krishnanagar Football School (collab. with United Red Star)',
    experienceYears: 9,
    playingBackground: 'Former Mohun Bagan Youth & Calcutta Premier Division Striker',
    philosophy: 'Grassroots is where genuine love for football is forged. If training is vibrant, challenging, and packed with thousands of touches, a young player’s confidence will skyrocket without limit.',
    bio: 'Debabrata leads operations and coaching delivery across Krishnanagar and greater Nadia district. Having developed as a prolific striker in Kolkata’s club system, he is passionate about inspiring young attackers with bilateral finishing technique, sharp combination play, and attacking bravura.',
    keySpecialties: ['1v1 Ball Mastery & Feints', 'Small-Sided Games (SSG) Design', 'Bilateral Finishing Technique', 'Grassroots Talent Identification'],
    certifications: ['AFC ‘C’ Coaching License', 'AIFF Golden Baby Leagues Coordinator', 'First Touch Specialist Instructor', 'Youth Athlete Mental Conditioning'],
    careerHighlights: [
      'Discovered and nurtured 4 Nadia district youth state team inductees',
      'Led Krishnanagar U14 team to IFA Shield Youth Regional Quarter-Finals',
      'Over 200+ grassroots kids introduced to structured football training'
    ],
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80',
    accentColor: 'emerald'
  },
  {
    id: 'coach-ananya-ghosh',
    name: 'Ananya Ghosh',
    role: 'Head of Girls Football & Foundation Specialist',
    category: 'specialist',
    license: 'AFC ‘C’ Licensed Coach',
    licenseLevel: 'AFC C',
    campus: 'All Campuses (Girls Academy Director)',
    experienceYears: 7,
    playingBackground: 'Former Bengal Senior Women’s Team Winger & National Games Representative',
    philosophy: 'Football gives young girls an unshakeable voice, leadership, and athletic confidence. Every girl deserves elite training, equal floodlit pitch time, and a direct pathway to state and national jerseys.',
    bio: 'Ananya spearheads MADEN FAF’s groundbreaking Girls Football Program. A celebrated former state winger who represented Bengal in national championships, she designs age-specific biomechanics and skill development routines that empower young female athletes to excel technically and tactically.',
    keySpecialties: ['Female Player Athletic Pathway', 'Agility & First-5m Acceleration', 'Pressing Shapes & Wing Play', 'Player Psychological Empowerment'],
    certifications: ['AFC ‘C’ Coaching License', 'FIFA Women’s Football Development Diploma', 'Sports Psychology for Youth Athletes', 'Emergency Sports First Aid Certified'],
    careerHighlights: [
      'Grew MADEN FAF Girls cohort from 12 to 65+ competitive players in 18 months',
      '4 girls selected for Bengal U15 State Championship Training Camp',
      'Recognized by District Sports Authority for grassroots female inclusion'
    ],
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    accentColor: 'rose'
  },
  {
    id: 'coach-pritam-mukherjee',
    name: 'Pritam Mukherjee',
    role: 'Head of Goalkeeping & Modern Distribution',
    category: 'specialist',
    license: 'AFC Goalkeeping Level 1',
    licenseLevel: 'Specialist',
    campus: 'Academy-Wide (Specialized GK Strip Gayeshpur & Ichapore)',
    experienceYears: 10,
    playingBackground: 'Former I-League 2 Starting Goalkeeper & IFA Shield Finalist',
    philosophy: 'The modern goalkeeper is the team’s first playmaker and final defensive wall. Courage in high-traffic crosses, crisp foot distribution, and vocal command are non-negotiable.',
    bio: 'Pritam heads MADEN FAF’s Specialized Goalkeeper Academy. Having guarded the net in competitive I-League 2 campaigns, he trains our shot-stoppers using modern European drills focusing on sweeping outside the 18-yard box, split-second reflex saves, and pin-point ground and aerial distribution.',
    keySpecialties: ['Cross Interception & Aerial Timing', '1v1 Angle Narrowing & Smothers', 'Build-Up Distribution with Both Feet', 'Goalkeeper Psychological Toughness'],
    certifications: ['AFC Goalkeeping Coaching Level 1', 'AIFF ‘C’ Coaching License', 'Reaction Dynamics & Eye-Hand Coordination Specialist', 'Sports First Responder'],
    careerHighlights: [
      'Trained 3 goalkeepers currently on national youth scout watchlists',
      'Maintained 14 clean sheets in 22 competitive youth matches in 2025/26 season',
      'Organized Bengal’s first regional Youth Goalkeeper Combine'
    ],
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
    accentColor: 'sky'
  },
  {
    id: 'dr-subhajit-chakraborty',
    name: 'Dr. Subhajit Chakraborty (PT)',
    role: 'Head of Sports Science & Injury Prevention',
    category: 'specialist',
    license: 'MPT (Sports Physio) & CSCS',
    licenseLevel: 'Specialist',
    campus: 'Sports Medicine & Performance Unit',
    experienceYears: 8,
    playingBackground: 'Collegiate Track Sprinter & Sports Biomechanics Researcher',
    philosophy: 'Durability is as vital as ball skill. We monitor biological growth spurts, eliminate overuse injuries, and forge young athletes whose bodies withstand the physical demands of professional football.',
    bio: 'Dr. Subhajit oversees athlete wellness, load management, and recovery protocols at MADEN FAF. He conducts quarterly biomechanical screenings, Yo-Yo aerobic capacity assessments, and tailored injury prevention routines (incorporating FIFA 11+ youth guidelines) for every registered player.',
    keySpecialties: ['Growth Plate & Youth Load Monitoring', 'FIFA 11+ Injury Prevention Implementation', 'Yo-Yo Intermittent Recovery Protocols', 'Core Stability & Functional Movement Screen (FMS)'],
    certifications: ['Masters in Sports Physiotherapy (MPT)', 'Certified Strength & Conditioning Specialist (CSCS)', 'FIFA Diploma in Football Medicine', 'Dry Needling & Kinesiology Taping Practitioner'],
    careerHighlights: [
      'Administered 450+ comprehensive baseline screenings for academy players',
      '42% reduction in preventable soft-tissue strain injuries over two consecutive seasons',
      'Pioneered academy nutritional and hydration guidelines for tropical training conditions'
    ],
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=80',
    accentColor: 'purple'
  }
];

export interface TestimonialItem {
  id: string;
  author: string;
  role: string;
  type: 'parent' | 'player' | 'scout';
  campus: string;
  avatar: string;
  quote: string;
  fullStory: string;
  milestone: string;
  rating: number;
  highlightTag: string;
  verifiedBadge: string;
}

export const ACADEMY_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'story-pradip-roy',
    author: 'Mr. Pradip Roy',
    role: 'Parent of Subham Roy (U15 Midfielder)',
    type: 'parent',
    campus: 'Gayeshpur Flagship Campus',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    quote: 'Before MADEN FAF, training was just unguided evening play. Today, Subham has video analysis, structured tactical homework, and his academic discipline has improved tremendously because of the values Coach Bapi instills. The quarterly report cards give our family absolute transparency.',
    fullStory: 'Subham joined MADEN FAF when he was 12 years old. Over three years, we watched him evolve from an energetic runner into a calm, intelligent playmaker. The academy’s insistence on academic balance tracking ensured he never dropped below 80% in his school exams, proving that athletic pursuit and educational excellence go hand in hand.',
    milestone: 'Son Selected for Bengal U15 State Camp',
    rating: 5,
    highlightTag: 'Total Transparency & Discipline',
    verifiedBadge: 'Verified Academy Parent'
  },
  {
    id: 'story-subham-roy',
    author: 'Subham Roy',
    role: 'U15 Midfielder (#8)',
    type: 'player',
    campus: 'Gayeshpur Flagship Campus',
    avatar: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=300&q=80',
    quote: 'I used to just chase the ball. At MADEN FAF, I learned how to scan my shoulders before receiving and create half-space overloads. Playing in real IFA youth tournaments proved to me that my dream of playing professional football is within reach.',
    fullStory: 'In the tactical classroom, Coach Bapi breaks down clips of our weekend matches. Seeing where I positioned myself in 4K video changed how I think on the grass. Last month against Mohun Bagan U16, I assisted two goals because I saw the third-man run before the defender even reacted.',
    milestone: '94% Attendance & Starting XI Captain',
    rating: 5,
    highlightTag: 'Tactical Game Intelligence',
    verifiedBadge: 'Advanced Academy Player'
  },
  {
    id: 'story-sunita-mukherjee',
    author: 'Mrs. Sunita Mukherjee',
    role: 'Parent of Aniket Mukherjee (U12 Goalkeeper)',
    type: 'parent',
    campus: 'Ichapore Campus (Leninnagar SC)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    quote: 'Finding certified, dedicated goalkeeper coaching outside central Kolkata was almost impossible until MADEN FAF partnered with Leninnagar SC. Coach Pritam’s modern shot-stopping and foot-distribution sessions have given my son immense confidence and agility.',
    fullStory: 'Goalkeepers are often neglected in grassroots football, just standing in goal while other kids take shots. At MADEN FAF, Aniket has a dedicated goalkeeper coach, specialized diving equipment, and specific footwork training. His bravery in 1v1 situations has astonished us.',
    milestone: '14 Clean Sheets in 2025/26 Season',
    rating: 5,
    highlightTag: 'Specialist Goalkeeper Program',
    verifiedBadge: 'Verified Academy Parent'
  },
  {
    id: 'story-rohit-mondal',
    author: 'Rohit Mondal',
    role: 'U16 Centre-Back (#4)',
    type: 'player',
    campus: 'North 24 Parganas Campus',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    quote: 'Coming from a humble family in Nawabganj, the MADEN FAF Merit Scholarship gave me a chance I never thought I would have. Having access to floodlit grass pitches, speed gates, and NIS-certified mentors makes me work harder every single day.',
    fullStory: 'My family could not afford elite academy fees or specialized athletic boots. MADEN FAF evaluated my trials, recognized my hunger, and granted me a 100% scholarship kit and training waiver. Today, I am competing in the State Youth League and representing our district with pride.',
    milestone: '100% Merit Scholarship Recipient',
    rating: 5,
    highlightTag: 'Life-Changing Athletic Opportunity',
    verifiedBadge: 'Scholarship Athlete'
  },
  {
    id: 'story-dr-rajesh-sen',
    author: 'Dr. Rajesh Sen',
    role: 'Parent of Priya Sen (U14 Girls Academy)',
    type: 'parent',
    campus: 'Gayeshpur Flagship Campus',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    quote: 'As a parent, athlete safety, physical conditioning, and equal respect were my top priorities. Coach Ananya’s Girls Academy is world-class. My daughter isn’t just mastering ball manipulation; she is blossoming into a fearless, vocal leader.',
    fullStory: 'In many places, girls football is treated as an afterthought. At MADEN FAF, the girls squad trains on the same floodlit championship pitch, uses the same speed gates and tactical rooms, and receives identical sports physio screenings. The boost in Priya’s self-esteem has been remarkable.',
    milestone: 'Daughter Named Captain of Girls U14 Squad',
    rating: 5,
    highlightTag: 'Empowering Female Footballers',
    verifiedBadge: 'Verified Academy Parent'
  },
  {
    id: 'story-riya-das',
    author: 'Riya Das',
    role: 'U13 Winger (#11)',
    type: 'player',
    campus: 'Krishnanagar Football School',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    quote: 'Training here is high-speed and challenging. We don’t run pointless laps without balls—every drill involves touches, decisions, and speed. Scoring our winning goal in the Nadia District Youth Cup was the proudest day of my life!',
    fullStory: 'Coach Debabrata taught me how to shift my weight and explode past defenders on the wing. In our championship final against Krishnanagar Town Club, I executed a step-over transition drill we had practiced fifty times on Tuesday and scored the decider. I love this academy.',
    milestone: 'Top Scorer in Nadia Youth Cup (7 Goals)',
    rating: 5,
    highlightTag: 'High-Repetition Ball Mastery',
    verifiedBadge: 'Academy Youth Player'
  },
  {
    id: 'story-tushar-kanti-roy',
    author: 'Tushar Kanti Roy',
    role: 'Guest Scout & Former State Youth Evaluator',
    type: 'scout',
    campus: 'State Scouting Combine 2026',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    quote: 'MADEN FAF is executing what youth development in Bengal has needed for decades: true AFC periodization paired with sports science. The technical cleanliness and spatial composure of their players stand out immediately in every scouting combine.',
    fullStory: 'I evaluate youth academies across India. The differentiator at MADEN FAF is bilateral competence—their U13 players can receive with either foot on the half-turn without breaking stride. Their coaches are teaching modern European principles suited for Indian football realities.',
    milestone: 'Verified Scouting Evaluation Dossier',
    rating: 5,
    highlightTag: 'AFC Benchmark Technical Cleanliness',
    verifiedBadge: 'External Football Scout'
  }
];

// ==========================================
// HERO SHOWCASE & VIDEO EXPERIENCE CONFIG
// ==========================================
export interface HeroStatItem {
  id: string;
  value: string;
  label: string;
}

export interface HeroShowcaseConfig {
  // Eyebrow badge
  eyebrowBadgeText: string;
  eyebrowPulseColor: 'amber' | 'emerald' | 'blue' | 'rose';
  eyebrowBadgeVisible: boolean;

  // Main Headline
  headlinePart1: string;
  headlineHighlight: string;
  headlineHighlightColor: 'amber' | 'emerald' | 'blue' | 'rose' | 'slate';
  subHeadline: string;

  // Primary Call-to-Action 1
  cta1Text: string;
  cta1Visible: boolean;
  cta1Action: 'trialModal' | 'scrollPrograms' | 'scrollCampuses' | 'customUrl';
  cta1Url?: string;

  // Secondary Call-to-Action 2
  cta2Text: string;
  cta2Visible: boolean;
  cta2Action: 'scrollPrograms' | 'scrollCampuses' | 'trialModal' | 'customUrl';
  cta2Url?: string;

  // Video Experience
  showWatchFilmButton: boolean;
  watchFilmButtonText: string;
  videoTitle: string;
  videoSubtitle: string;
  videoDuration: string;
  videoDescription: string;
  videoPosterImage: string;
  videoEmbedUrl?: string; // e.g. YouTube URL / MP4 URL
  videoAudioFeature: string;
  videoTag: string;
  videoCtaText: string;

  // Background visual atmosphere
  backgroundImage: string;
  backgroundOverlayOpacity: number; // 0 to 100 percent
  showPitchGridPattern: boolean;

  // Stat Strip metrics
  stats: HeroStatItem[];
}

export const DEFAULT_HERO_CONFIG: HeroShowcaseConfig = {
  eyebrowBadgeText: 'Maden Football Academy Foundation · Official Intake 2026/27',
  eyebrowPulseColor: 'amber',
  eyebrowBadgeVisible: true,

  headlinePart1: 'WHERE PASSION',
  headlineHighlight: 'MEETS EXCELLENCE',
  headlineHighlightColor: 'amber',
  subHeadline:
    'Developing complete footballers, building lasting character, and opening professional pathways through structured AFC-certified youth football development in West Bengal.',

  cta1Text: 'Book a Trial',
  cta1Visible: true,
  cta1Action: 'trialModal',
  cta1Url: '',

  cta2Text: 'Explore Programs',
  cta2Visible: true,
  cta2Action: 'scrollPrograms',
  cta2Url: '',

  showWatchFilmButton: true,
  watchFilmButtonText: 'Watch Film',
  videoTitle: 'Where Passion Meets Excellence',
  videoSubtitle: 'Academy Documentary',
  videoDuration: '3:45',
  videoDescription:
    'Watch how our certified coaches break down tactical speed, ball mastery, and match resilience across Gayeshpur, North 24 Parganas, and Krishnanagar campuses.',
  videoPosterImage:
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1600&q=80',
  videoEmbedUrl: '',
  videoAudioFeature: 'Original Academy Score & Coach Interviews',
  videoTag: 'Full-Length Academy Showcase (3:45)',
  videoCtaText: 'Book a Trial Now',

  backgroundImage:
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=2000&q=85',
  backgroundOverlayOpacity: 10,
  showPitchGridPattern: true,

  stats: [
    { id: 'stat-1', value: '3', label: 'Campuses in Bengal' },
    { id: 'stat-2', value: '450+', label: 'Registered Players' },
    { id: 'stat-3', value: 'AFC / AIFF', label: 'Certified Staff' },
    { id: 'stat-4', value: 'U8 – U18', label: 'Development Cohorts' },
  ],
};

