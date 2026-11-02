export type BackgroundType = 'default' | 'solid' | 'gradient' | 'image' | 'pattern';

export interface SectionBackgroundConfig {
  type: BackgroundType;
  // Solid color
  color?: string;
  // Gradient preset or custom
  gradientPreset?: string;
  customGradient?: string;
  // Image URL & display
  imageUrl?: string;
  imagePosition?: 'center' | 'top' | 'bottom';
  imageSize?: 'cover' | 'contain' | 'auto';
  imageRepeat?: 'no-repeat' | 'repeat';
  imageFixed?: boolean;
  imageBlur?: 'none' | 'sm' | 'md' | 'lg';
  // Overlay for text legibility
  overlayColor?: 'black' | 'slate' | 'amber' | 'emerald' | 'white' | 'none';
  overlayOpacity?: number; // 0 to 100
  // Pattern texture
  patternType?: 'none' | 'dots' | 'grid' | 'diagonal' | 'turf' | 'radial-spotlight';
  patternOpacity?: number; // 0 to 100
  // Text contrast mode
  textMode?: 'auto' | 'light' | 'dark';
  // Border options
  borderTop?: boolean;
  borderBottom?: boolean;
  borderColor?: string;
  // Interactivity & transition options
  interactiveHover?: boolean;
  hoverScale?: boolean;
  hoverBorderOpacity?: boolean;
  // Custom classes
  customClass?: string;
}

export type SectionBackgroundsMap = Record<string, SectionBackgroundConfig>;

export interface SectionMetaItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Hero & Core' | 'Academics & Pathway' | 'Facilities & Matches' | 'Community & Media' | 'Conversion & Footer';
  defaultTextMode: 'light' | 'dark';
}

export const HOMEPAGE_SECTIONS: SectionMetaItem[] = [
  {
    id: 'hero',
    title: 'Hero Showcase & Video Experience',
    subtitle: 'Primary above-the-fold banner with headline, metrics, and documentary video launcher',
    category: 'Hero & Core',
    defaultTextMode: 'light',
  },
  {
    id: 'storytelling',
    title: 'Storytelling & Philosophy',
    subtitle: 'Core methodology, four development pillars, and founder vision',
    category: 'Hero & Core',
    defaultTextMode: 'dark',
  },
  {
    id: 'impactStats',
    title: 'Impact Statistics & Key Metrics',
    subtitle: 'Animated statistics showcasing student-athletes, scholarships, and training hours',
    category: 'Hero & Core',
    defaultTextMode: 'light',
  },
  {
    id: 'growthCharts',
    title: 'Academy Growth & Visualizations',
    subtitle: 'Interactive charts tracking player progression and scholarship allocation over 3 years',
    category: 'Academics & Pathway',
    defaultTextMode: 'dark',
  },
  {
    id: 'pathway',
    title: 'The MADEN Pathway',
    subtitle: 'From grassroots discovery to professional youth academy and international trials',
    category: 'Academics & Pathway',
    defaultTextMode: 'dark',
  },
  {
    id: 'programs',
    title: 'Football Training Programs',
    subtitle: 'Age-tiered curriculum (Grassroots U7-U11, Youth U13-U17, Elite Pro U19)',
    category: 'Academics & Pathway',
    defaultTextMode: 'dark',
  },
  {
    id: 'coachingStaff',
    title: 'Coaching Staff & Mentors',
    subtitle: 'AFC and AIFF certified coaching roster and tactical leadership',
    category: 'Academics & Pathway',
    defaultTextMode: 'dark',
  },
  {
    id: 'globalPositioning',
    title: 'Global Tours & International Exposure',
    subtitle: 'European scout trials, global tournaments, and partner clubs across Spain and Germany',
    category: 'Academics & Pathway',
    defaultTextMode: 'light',
  },
  {
    id: 'campusNetwork',
    title: 'Campus Network & Facilities',
    subtitle: 'Interactive facility map across Gayeshpur, Kalyani, and Kolkata hubs',
    category: 'Facilities & Matches',
    defaultTextMode: 'dark',
  },
  {
    id: 'matchCentre',
    title: 'Match Centre & Fixtures',
    subtitle: 'Live weekend tournament scores, youth league standings, and scout recordings',
    category: 'Facilities & Matches',
    defaultTextMode: 'light',
  },
  {
    id: 'campsAndEvents',
    title: 'Camps & Academy Events',
    subtitle: 'Holiday intensive bootcamps, summer clinics, and scouting trials',
    category: 'Facilities & Matches',
    defaultTextMode: 'dark',
  },
  {
    id: 'newsAndStories',
    title: 'News & Academy Stories',
    subtitle: 'Academy press updates, match reports, and player achievements',
    category: 'Community & Media',
    defaultTextMode: 'dark',
  },
  {
    id: 'scholarships',
    title: 'Scholarship & Financial Aid',
    subtitle: 'Need-based full and partial scholarships funded by patron donators',
    category: 'Community & Media',
    defaultTextMode: 'dark',
  },
  {
    id: 'parentExperience',
    title: 'Parent Experience & Community',
    subtitle: 'Comprehensive parent portal access, progress reporting, and community reviews',
    category: 'Community & Media',
    defaultTextMode: 'dark',
  },
  {
    id: 'successStories',
    title: 'Success Stories & Testimonials',
    subtitle: 'Player journey spotlights, parent reflections, and club signings',
    category: 'Community & Media',
    defaultTextMode: 'dark',
  },
  {
    id: 'preFooterCta',
    title: 'Pre-Footer Official Intake CTA',
    subtitle: 'High conversion evaluation booking banner before the footer',
    category: 'Conversion & Footer',
    defaultTextMode: 'dark',
  },
  {
    id: 'sponsors',
    title: 'Sponsor & Brand Partners Carousel',
    subtitle: 'Official academy sponsors, equipment providers, and corporate partners',
    category: 'Conversion & Footer',
    defaultTextMode: 'dark',
  },
];

export interface BackgroundPresetOption {
  id: string;
  name: string;
  category: 'gradient' | 'image' | 'solid' | 'pattern';
  config: Partial<SectionBackgroundConfig>;
  previewColor?: string;
  previewGradient?: string;
  previewImage?: string;
}

export const CURATED_STOCK_IMAGES = [
  {
    id: 'floodlit-stadium',
    title: 'Floodlit Stadium Pitch (Night)',
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=2000&q=85',
    category: 'Stadium',
  },
  {
    id: 'aerial-pitch',
    title: 'Aerial Pitch & Stadium Lights',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=2000&q=85',
    category: 'Stadium',
  },
  {
    id: 'emerald-turf',
    title: 'Pristine Emerald Turf Field',
    url: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=2000&q=85',
    category: 'Turf',
  },
  {
    id: 'dynamic-action',
    title: 'Dynamic High-Performance Training',
    url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=2000&q=85',
    category: 'Action',
  },
  {
    id: 'tactical-turf',
    title: 'Tactical Lines & Pitch Markings',
    url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=2000&q=85',
    category: 'Turf',
  },
  {
    id: 'golden-hour-session',
    title: 'Golden Hour Academy Practice',
    url: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=2000&q=85',
    category: 'Action',
  },
  {
    id: 'carbon-texture',
    title: 'Dark Carbon High-Tech Geometry',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2000&q=85',
    category: 'Texture',
  },
  {
    id: 'minimal-slate',
    title: 'Minimal Slate Architecture',
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=2000&q=85',
    category: 'Texture',
  },
];

export const GRADIENT_PRESETS: Record<string, { name: string; gradient: string; textMode: 'light' | 'dark' }> = {
  'midnight': {
    name: 'Midnight Stadium Dark',
    gradient: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #030712 100%)',
    textMode: 'light',
  },
  'emerald-turf': {
    name: 'Deep Emerald Turf',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #022c22 50%, #0f172a 100%)',
    textMode: 'light',
  },
  'amber-glow': {
    name: 'MADEN Amber Glow',
    gradient: 'linear-gradient(135deg, #78350f 0%, #451a03 50%, #0f172a 100%)',
    textMode: 'light',
  },
  'royal-navy': {
    name: 'Royal Navy Pitch',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    textMode: 'light',
  },
  'clean-light': {
    name: 'Clean White Slate',
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #ffffff 100%)',
    textMode: 'dark',
  },
  'warm-cream': {
    name: 'Warm Academy Cream',
    gradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #ffffff 100%)',
    textMode: 'dark',
  },
  'sunset-gold': {
    name: 'Sunset Champion Gold',
    gradient: 'linear-gradient(135deg, #9a3412 0%, #7c2d12 40%, #0c0a09 100%)',
    textMode: 'light',
  },
  'carbon-tech': {
    name: 'Carbon Tech Mesh',
    gradient: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
    textMode: 'light',
  },
  'ice-silver': {
    name: 'Modern Ice Silver',
    gradient: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #f8fafc 100%)',
    textMode: 'dark',
  },
};

export const DEFAULT_SECTION_BACKGROUNDS: SectionBackgroundsMap = {
  hero: {
    type: 'default',
    textMode: 'light',
  },
  storytelling: {
    type: 'default',
    textMode: 'dark',
  },
  impactStats: {
    type: 'default',
    textMode: 'light',
  },
  growthCharts: {
    type: 'default',
    textMode: 'dark',
  },
  pathway: {
    type: 'default',
    textMode: 'dark',
  },
  programs: {
    type: 'default',
    textMode: 'dark',
  },
  coachingStaff: {
    type: 'default',
    textMode: 'dark',
  },
  globalPositioning: {
    type: 'default',
    textMode: 'light',
  },
  campusNetwork: {
    type: 'default',
    textMode: 'dark',
  },
  matchCentre: {
    type: 'default',
    textMode: 'light',
  },
  campsAndEvents: {
    type: 'default',
    textMode: 'dark',
  },
  newsAndStories: {
    type: 'default',
    textMode: 'dark',
  },
  scholarships: {
    type: 'default',
    textMode: 'dark',
  },
  parentExperience: {
    type: 'default',
    textMode: 'dark',
  },
  successStories: {
    type: 'default',
    textMode: 'dark',
  },
  preFooterCta: {
    type: 'default',
    textMode: 'dark',
  },
  sponsors: {
    type: 'default',
    textMode: 'dark',
  },
};
