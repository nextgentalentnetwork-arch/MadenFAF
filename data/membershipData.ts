export interface MembershipPlan {
  id: string;
  name: string;
  tagline: string;
  price: number; // in INR
  billingPeriod: 'annual' | 'monthly' | 'lifetime';
  popular?: boolean;
  badgeColor: string;
  description: string;
  benefits: string[];
  eligibility: string;
  maxMembers?: number;
  active: boolean;
  category: 'individual' | 'youth' | 'patron' | 'corporate';
}

export interface MemberUser {
  id: string;
  membershipId: string; // e.g. MADEN-MEM-000101
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  avatar: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  country: string;
  occupation: string;
  preferredLanguage: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  howDidYouHear: string;
  referralCode?: string; // used to refer others
  referredBy?: string;
  
  // Optional Sports Profile
  footballExperience?: string;
  favouriteClub?: string;
  favouritePlayer?: string;
  areasOfInterest: string[];
  skillsAndExpertise: string[];
  
  // Volunteer Profile
  isVolunteer: boolean;
  volunteerAvailability?: string;
  preferredVolunteerActivities: string[];
  previousVolunteering?: string;
  
  // Membership Status
  planId: string;
  planName: string;
  membershipStatus: 'active' | 'pending_payment' | 'expired' | 'suspended';
  startDate: string;
  expiryDate: string;
  isAutoRenew: boolean;
  
  // Privacy & Safeguarding
  isMinor: boolean;
  guardianConsent?: boolean;
  guardianName?: string;
  guardianPhone?: string;
  showInPublicDirectory: boolean;
  emailConsent: boolean;
  termsAccepted: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface MembershipEvent {
  id: string;
  title: string;
  category: 'tournament' | 'trial' | 'grassroots' | 'workshop' | 'girls_football' | 'clinic' | 'community';
  date: string;
  time: string;
  venue: string;
  district: string;
  image: string;
  description: string;
  ageEligibility: string;
  capacity: number;
  registeredCount: number;
  registrationDeadline: string;
  organizer: string;
  isMembersOnly: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  volunteerRolesNeeded?: string[];
}

export interface EventRegistration {
  id: string; // e.g. EVT-REG-1001
  eventId: string;
  eventTitle: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  registrationDate: string;
  attendanceStatus: 'registered' | 'attended' | 'absent' | 'cancelled';
  notes?: string;
}

export interface VolunteerOpportunity {
  id: string;
  roleTitle: string;
  category: string;
  description: string;
  requirements: string[];
  location: string;
  timeCommitment: string;
  openingsCount: number;
  active: boolean;
}

export interface VolunteerApplication {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  roleId: string;
  roleTitle: string;
  eventId?: string;
  eventTitle?: string;
  areasOfInterest: string[];
  skills: string;
  experience: string;
  availability: string;
  motivation: string;
  status: 'applied' | 'under_review' | 'shortlisted' | 'approved' | 'assigned' | 'completed' | 'rejected';
  assignedEvent?: string;
  appliedDate: string;
  adminNotes?: string;
  certificateIssued?: boolean;
  hoursCompleted?: number;
}

export interface TalentReferral {
  id: string;
  referralRef: string; // e.g. TR-2026-0042
  referrerMemberId: string;
  referrerName: string;
  referrerPhone: string;
  referrerEmail: string;
  
  // Talent details
  playerName: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  district: string;
  state: string;
  playingPosition: string;
  preferredFoot: 'left' | 'right' | 'both';
  currentClubOrSchool: string;
  playingLevel: string;
  parentGuardianName?: string;
  parentGuardianContact?: string;
  playerPhotoUrl?: string;
  videoLink?: string;
  scoutingNotes: string;
  whyHighPotential: string;
  
  // Safeguarding & Disclaimers
  hasParentalConsent: boolean;
  disclaimerAcknowledged: boolean; // Does not guarantee trial/admission
  
  // Scouting Review Workflow
  status: 'submitted' | 'under_review' | 'information_required' | 'recommended_for_assessment' | 'trial_scheduled' | 'closed';
  scoutAssigned?: string;
  internalEvaluationNotes?: string; // Hidden from referring member
  assessmentScore?: number;
  submittedAt: string;
  updatedAt: string;
}

export interface DonationRecord {
  id: string;
  receiptNumber: string; // e.g. MADEN-RCP-2026-0089
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorPan?: string;
  amount: number; // in INR
  cause: 'grassroots' | 'girls_football' | 'scholarships' | 'equipment' | 'nutrition' | 'general';
  frequency: 'one_time' | 'monthly';
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet';
  status: 'successful' | 'pending' | 'failed' | 'refunded';
  isAnonymous: boolean;
  taxExemptionEligible: boolean;
  transactionId: string;
  timestamp: string;
  memberId?: string;
}

export interface MemberCertificate {
  id: string; // e.g. CERT-MADEN-2026-042
  memberId: string;
  recipientName: string;
  title: string;
  category: 'volunteer' | 'event' | 'workshop' | 'community_champion' | 'founding_member';
  issueDate: string;
  signatory: string;
  signatoryTitle: string;
  description: string;
  qrVerificationUrl: string;
}

export interface MemberNotification {
  id: string;
  memberId: string;
  title: string;
  message: string;
  category: 'membership' | 'event' | 'volunteer' | 'talent' | 'donation' | 'general';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

// Default initial membership plans
export const DEFAULT_MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'plan-supporter',
    name: 'MADENATION Supporter',
    tagline: 'Join the grassroots football movement across Bengal',
    price: 499,
    billingPeriod: 'annual',
    badgeColor: 'blue',
    description: 'Ideal for football fans, parents, and community allies who want to fuel grassroots youth access.',
    benefits: [
      'Official Digital MADENATION Membership Card with verification QR',
      'Priority access to MADEN FAF exhibition matches & youth tournaments',
      'Quarterly MADENATION Digital Magazine & Scouting Insights',
      'Invitations to annual MADEN Football Community Day',
      'Voting rights for MADEN FAF Community Player of the Year',
      'Direct volunteer application privileges across events',
    ],
    eligibility: 'Open to all individuals passionate about football development',
    active: true,
    category: 'individual',
  },
  {
    id: 'plan-friend',
    name: 'MADENATION Friend & Mentor',
    tagline: 'Deepen your engagement with youth mentorship & matchday events',
    price: 1499,
    billingPeriod: 'annual',
    popular: true,
    badgeColor: 'amber',
    description: 'For committed football champions who want to actively participate, mentor, and sponsor youth boot kits.',
    benefits: [
      'Everything in Supporter Plan',
      'Guaranteed VIP seating at MADEN FAF Cup & Kalyani Stadium showcases',
      'Sponsor a Young Footballer’s Training Kit & Football (includes updates)',
      'Direct Talent Referral Fast-Track submission for scouting team review',
      'Access to Coaches & Scouting masterclasses with AFC-licensed mentors',
      'Exclusive MADENATION Member Badge & Official Lapel Pin voucher',
      '15% discount on MADEN official academy gear and summer camps',
    ],
    eligibility: 'Open to individuals, mentors, and local sports advocates',
    active: true,
    category: 'individual',
  },
  {
    id: 'plan-patron',
    name: 'MADENATION Patron of Bengal Football',
    tagline: 'High-impact visionary patron empowering next-generation talent',
    price: 4999,
    billingPeriod: 'annual',
    badgeColor: 'purple',
    description: 'Directly subsidizes a full youth player scholarship, travel stipend, and sports science assessment.',
    benefits: [
      'Everything in Friend & Mentor Plan',
      'Full season scholarship sponsorship acknowledgment in Annual Report',
      'Personal invitation to Annual MADEN FAF Gala & Honors Banquet',
      'Quarterly 1-on-1 development briefing with Academy Technical Director',
      'Personalized Framed Patron Certificate signed by Foundation Board',
      'Special scouting combine paddock pass & technical observer access',
      'Listed on MADEN FAF Wall of Champions at Gayeshpur Campus',
    ],
    eligibility: 'Open to individual patrons, philanthropists, and former players',
    active: true,
    category: 'patron',
  },
  {
    id: 'plan-youth',
    name: 'MADENATION Student & Youth Scout',
    tagline: 'For young dreamers, university students, and aspiring sports leaders',
    price: 199,
    billingPeriod: 'annual',
    badgeColor: 'emerald',
    description: 'Subsidized tier for youth under 23, college students, and grassroots players wanting to connect and volunteer.',
    benefits: [
      'Official Student Membership ID Card with instant QR check-in',
      'Free entry to all academy league matches & youth friendlies',
      'Opportunity to volunteer at major IFA Bengal sanctioned tournaments',
      'Youth Leadership & Event Management internship certificate eligibility',
      'Refer peers and grassroots talents directly to MADEN scouting scouts',
      'Access to Football Analytics & Media workshops',
    ],
    eligibility: 'Students & youths aged 14 to 23 with valid student ID',
    active: true,
    category: 'youth',
  },
  {
    id: 'plan-corporate',
    name: 'MADENATION Corporate / Institutional Partner',
    tagline: 'For companies, schools, clubs and CSR initiatives investing in Bengal youth',
    price: 25000,
    billingPeriod: 'annual',
    badgeColor: 'slate',
    description: 'Empowers an entire age-group team with tournament kits, certified coaching clinics, and CSR compliance.',
    benefits: [
      'Corporate Membership Certificate & Section 8 Non-Profit CSR receipt',
      'Branded logo presence on MADENATION Community Partner Carousel',
      'Custom Corporate Football Day or Youth Clinic hosted by licensed coaches',
      'Full Team Kit sponsorship branding opportunity for grassroots cohort',
      'Employee volunteering opportunities during MADEN Community Camps',
      'Executive invitations to Foundation Board events and player showcases',
    ],
    eligibility: 'Companies, schools, clubs, NGOs and institutions',
    active: true,
    category: 'corporate',
  },
];

// Initial default events
export const DEFAULT_MEMBERSHIP_EVENTS: MembershipEvent[] = [
  {
    id: 'evt-girls-cup-2026',
    title: 'MADEN FAF Girls Grassroots Football Festival 2026',
    category: 'girls_football',
    date: '2026-10-24',
    time: '08:30 AM – 04:00 PM',
    venue: 'Gayeshpur Central Ground, Kalyani',
    district: 'Nadia',
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80',
    description: 'An empowering full-day grassroots football festival featuring 16 U13 & U15 girls teams from Nadia and North 24 Parganas, with skills clinics conducted by AFC-certified coaches.',
    ageEligibility: 'U11 to U17 Girls & Community Volunteers',
    capacity: 250,
    registeredCount: 168,
    registrationDeadline: '2026-10-20',
    organizer: 'MADEN Sports Foundation Community Wing',
    isMembersOnly: false,
    status: 'upcoming',
    volunteerRolesNeeded: ['Registration Desk', 'Ground Operations', 'Photography & Media', 'Water & First Aid Support'],
  },
  {
    id: 'evt-scouting-combine',
    title: 'North 24 Parganas Open Scouting Combine & Physical Assessment',
    category: 'trial',
    date: '2026-11-08',
    time: '07:00 AM – 01:00 PM',
    venue: 'Barasat Stadium Complex',
    district: 'North 24 Parganas',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    description: 'Comprehensive technical and physical combine assessing ball mastery, speed agility, and spatial game awareness for potential academy residential scholarships.',
    ageEligibility: 'Boys & Girls born 2011 – 2016',
    capacity: 180,
    registeredCount: 112,
    registrationDeadline: '2026-11-04',
    organizer: 'MADEN FAF Technical Scouting Division',
    isMembersOnly: false,
    status: 'upcoming',
    volunteerRolesNeeded: ['Player Check-in', 'Warm-up Marshalling', 'Data Recording', 'Pitch Coordination'],
  },
  {
    id: 'evt-coaching-workshop',
    title: 'Grassroots Coaching Philosophy & Periodization Masterclass',
    category: 'workshop',
    date: '2026-11-22',
    time: '10:00 AM – 03:30 PM',
    venue: 'Kalyani Stadium Conference Hall & Pitch 2',
    district: 'Nadia',
    image: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=80',
    description: 'Theoretical and on-pitch workshop focusing on modern small-sided games, cognitive decision-making, and youth psychology for community coaches and mentors.',
    ageEligibility: 'Members 18+ (Aspiring Coaches & Teachers)',
    capacity: 60,
    registeredCount: 42,
    registrationDeadline: '2026-11-18',
    organizer: 'MADEN FAF Coach Education Dept',
    isMembersOnly: true,
    status: 'upcoming',
    volunteerRolesNeeded: ['Session Assistance', 'Equipment Setup', 'Participant Kit Distribution'],
  },
  {
    id: 'evt-community-league',
    title: 'MADENATION Inter-Campus Community Derby Day',
    category: 'tournament',
    date: '2026-12-05',
    time: '09:00 AM – 05:00 PM',
    venue: 'Gayeshpur Main Campus',
    district: 'Nadia',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    description: 'Annual celebratory showcase where academy cohorts from Gayeshpur, Krishnanagar, and North 24 Parganas compete in friendly cup matches with parents and members cheering.',
    ageEligibility: 'Open to All Members & Families',
    capacity: 400,
    registeredCount: 235,
    registrationDeadline: '2026-12-01',
    organizer: 'MADEN Sports Foundation',
    isMembersOnly: false,
    status: 'upcoming',
    volunteerRolesNeeded: ['Matchday Emcee', 'Live Score Updates', 'Hospitality', 'Ground Stewards'],
  },
];

// Initial default volunteer opportunities
export const DEFAULT_VOLUNTEER_ROLES: VolunteerOpportunity[] = [
  {
    id: 'vol-matchday-ops',
    roleTitle: 'Matchday Operations & Ground Steward',
    category: 'Match Operations',
    description: 'Coordinate pitch setup, ball boys, referee liaison, and spectator flow during official IFA youth league and exhibition fixtures.',
    requirements: ['Punctuality', 'Enthusiasm for live football', 'Comfortable working outdoors'],
    location: 'Gayeshpur & Kalyani Stadium',
    timeCommitment: '4–6 hours on match days (Weekends)',
    openingsCount: 12,
    active: true,
  },
  {
    id: 'vol-media-photo',
    roleTitle: 'Matchday Photography & Social Media Storyteller',
    category: 'Media & Communications',
    description: 'Capture high-energy on-pitch action shots, record brief video interviews with young players, and produce reels highlighting community impact.',
    requirements: ['Own DSLR / good smartphone camera', 'Eye for sports moments', 'Basic video editing skill'],
    location: 'Across Nadia & North 24 Parganas campuses',
    timeCommitment: '3–4 hours per weekend event',
    openingsCount: 5,
    active: true,
  },
  {
    id: 'vol-girls-football',
    roleTitle: 'Girls Football Inclusion Coordinator',
    category: 'Inclusion & Grassroots',
    description: 'Support female player registration, help organize girls football festivals, and mentor young female footballers in a safe, inspiring environment.',
    requirements: ['Female candidates preferred', 'Empathetic communication', 'Passion for women’s sports empowerment'],
    location: 'Gayeshpur Central Ground',
    timeCommitment: 'Flexible (2–4 hours weekly)',
    openingsCount: 8,
    active: true,
  },
  {
    id: 'vol-scouting-assist',
    roleTitle: 'Grassroots Talent Spotter & District Scout Assistant',
    category: 'Scouting & Talent ID',
    description: 'Attend local school tournaments and district matches in Bengal to identify promising talent and enter verified referral dossiers into the MADEN portal.',
    requirements: ['Deep understanding of football fundamentals', 'Good communication with parents and local coaches'],
    location: 'Flexible across districts of West Bengal',
    timeCommitment: 'Flexible weekend scouting',
    openingsCount: 15,
    active: true,
  },
  {
    id: 'vol-firstaid-physio',
    roleTitle: 'First Aid & Sports Physio Assistant',
    category: 'Medical & Wellbeing',
    description: 'Assist academy certified physiotherapists in basic pitchside ice application, player hydration, stretching routines, and incident reporting.',
    requirements: ['Basic first-aid knowledge or sports science student'],
    location: 'All training campuses',
    timeCommitment: 'Saturday & Sunday mornings',
    openingsCount: 4,
    active: true,
  },
  {
    id: 'vol-education-mentor',
    roleTitle: 'Youth Academic Tutor & Life Skills Mentor',
    category: 'Education & Welfare',
    description: 'Help young residential and scholarship footballers with school curriculum support, basic English communication, and digital literacy after training.',
    requirements: ['Graduate / university student', 'Patience & mentoring mindset'],
    location: 'Gayeshpur Campus Study Centre or Online',
    timeCommitment: '2 hours weekly (Weekday evenings)',
    openingsCount: 6,
    active: true,
  },
];

// Seed sample active members for immediate demonstration & test login
export const SEED_MEMBERS: MemberUser[] = [
  {
    id: 'mem-001',
    membershipId: 'MADEN-MEM-000001',
    fullName: 'Pravakar Ghosh',
    email: 'pravakarghosh.2025@gmail.com',
    phone: '+91 98765 43210',
    dob: '1992-06-15',
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    address: 'B-Block, Kalyani Township',
    city: 'Kalyani',
    district: 'Nadia',
    state: 'West Bengal',
    pinCode: '741235',
    country: 'India',
    occupation: 'Sports Technology & Youth Advocate',
    preferredLanguage: 'Bengali / English',
    emergencyContact: {
      name: 'R. Ghosh',
      relationship: 'Family Member',
      phone: '+91 98765 43211',
    },
    howDidYouHear: 'Academy Website & Kalyani Ground',
    referralCode: 'MADENPRAV123',
    areasOfInterest: ['Grassroots Football', 'Talent Scouting', 'Youth Scholarships', 'Match Operations'],
    skillsAndExpertise: ['Sports Management', 'Community Organizing', 'Digital Media'],
    isVolunteer: true,
    volunteerAvailability: 'Weekends & Matchdays',
    preferredVolunteerActivities: ['Match Operations', 'Talent Spotting', 'Media & Photography'],
    previousVolunteering: 'IFA Bengal Youth Festival 2025 Coordinator',
    planId: 'plan-friend',
    planName: 'MADENATION Friend & Mentor',
    membershipStatus: 'active',
    startDate: '2026-01-15',
    expiryDate: '2027-01-15',
    isAutoRenew: true,
    isMinor: false,
    showInPublicDirectory: true,
    emailConsent: true,
    termsAccepted: true,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-03-01T14:30:00Z',
  },
  {
    id: 'mem-002',
    membershipId: 'MADEN-MEM-000002',
    fullName: 'Ananya Mukherjee',
    email: 'ananya.sports@madenation.org',
    phone: '+91 98300 11223',
    dob: '1998-11-20',
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    address: 'College Para',
    city: 'Krishnanagar',
    district: 'Nadia',
    state: 'West Bengal',
    pinCode: '741101',
    country: 'India',
    occupation: 'School Physical Educator',
    preferredLanguage: 'Bengali',
    emergencyContact: {
      name: 'S. Mukherjee',
      relationship: 'Father',
      phone: '+91 98300 99887',
    },
    howDidYouHear: 'Social Media',
    referralCode: 'MADENANAN02',
    areasOfInterest: ['Girls Football', 'Coaching Clinics', 'Youth Education'],
    skillsAndExpertise: ['Physical Education', 'First Aid', 'Team Management'],
    isVolunteer: true,
    volunteerAvailability: 'Saturdays',
    preferredVolunteerActivities: ['Girls Football Inclusion', 'First Aid Support'],
    planId: 'plan-supporter',
    planName: 'MADENATION Supporter',
    membershipStatus: 'active',
    startDate: '2026-02-01',
    expiryDate: '2027-02-01',
    isAutoRenew: false,
    isMinor: false,
    showInPublicDirectory: true,
    emailConsent: true,
    termsAccepted: true,
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-02-01T09:00:00Z',
  },
];
