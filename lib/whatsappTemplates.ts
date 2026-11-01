/**
 * MADEN Football Academy Foundation
 * Reusable WhatsApp Notification Templates Library & Variable Interpolation Engine
 */

import { AcademyRegistrationData } from './supabaseClient';

export type WhatsAppTemplateCategory =
  | 'all'
  | 'schedule'
  | 'selection'
  | 'postponement'
  | 'verification'
  | 'reminder'
  | 'feedback';

export interface WhatsAppTemplate {
  id: string;
  title: string;
  category: Exclude<WhatsAppTemplateCategory, 'all'>;
  badge: string;
  badgeColor: {
    bg: string;
    text: string;
    border: string;
  };
  description: string;
  templateText: string;
  recommendedForStatus?: string;
  suggestedTags: string[];
}

export interface TemplateVariables {
  candidateName: string;
  parentName: string;
  applicationId: string;
  applicationType: string;
  position: string;
  dob: string;
  age: string;
  campus: string;
  venue: string;
  trialDate: string;
  trialTime: string;
  evaluator: string;
  reportingInstructions: string;
  rescheduledDate?: string;
  rescheduledTime?: string;
  rescheduledReason?: string;
  requiredDocuments?: string;
  squadBatch?: string;
  admissionDeadline?: string;
  contactPhone: string;
  contactEmail: string;
  academyName: string;
  additionalNotes?: string;
}

export const TEMPLATE_CATEGORIES: {
  id: WhatsAppTemplateCategory;
  label: string;
  description: string;
  countKey?: string;
}[] = [
  { id: 'all', label: 'All Templates', description: 'Complete library of official WhatsApp communications' },
  { id: 'schedule', label: 'Trial Scheduling', description: 'Call letters, venue directions, reporting times & permits' },
  { id: 'selection', label: 'Selection & Offers', description: 'Merit qualifications, squad acceptance & academy admissions' },
  { id: 'postponement', label: 'Trial Postponed', description: 'Inclement weather alerts, ground maintenance & date rescheduling' },
  { id: 'verification', label: 'Review & Documents', description: 'Application received, Aadhaar / DOB verification required' },
  { id: 'reminder', label: '24h Reminders', description: 'Pre-session checklists, boots & kit requirements, gate reporting' },
  { id: 'feedback', label: 'Technical Feedback', description: 'Post-trial evaluation reports & developmental pathways' },
];

export const DEFAULT_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'evaluation_scheduled',
    title: 'Evaluation Scheduled (Trial Call Letter)',
    category: 'schedule',
    badge: 'Official Call Letter',
    badgeColor: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-300',
    },
    description: 'Formal trial slot allocation with ground address, evaluator coach, footwear guidelines, and mandatory documents.',
    recommendedForStatus: 'trial_scheduled',
    suggestedTags: ['Trial Call', 'Official Slot', 'Schedule', 'Kit Checklist'],
    templateText: `⚽ *MADEN FOOTBALL ACADEMY FOUNDATION*
*OFFICIAL CANDIDATE TRIAL PASS & EVALUATION LETTER*

Dear {{parentName}},
Greetings from the Technical & Scout Directorate of {{academyName}}.

We are pleased to inform you that {{candidateName}} has been scheduled for official technical evaluation:

📋 *Pass Reference:* {{applicationId}}
👤 *Player Name:* {{candidateName}}
🎂 *Date of Birth:* {{dob}} (Age: {{age}})
⚽ *Preferred Position:* {{position}}
🏟️ *Venue:* {{venue}}
📅 *Date of Trial:* {{trialDate}}
⏰ *Reporting Time:* {{trialTime}}
🏅 *Head Evaluator:* {{evaluator}}

📌 *Mandatory Trial Checklist:*
1. Standard football boots (turf or studs) & mandatory shin guards with long football socks.
2. Official age proof document (original Aadhaar Card / Birth Certificate).
3. Personal hydration / sports water bottle.
4. Report at the registration desk 30 minutes prior to warm-up.

📝 *Reporting Instructions:* {{reportingInstructions}}
{{#if additionalNotes}}
💡 *Special Note:* {{additionalNotes}}
{{/if}}

📍 *Venue Landmark:* {{venue}}
📞 *Helpline Coordinator:* {{contactPhone}} | ✉️ {{contactEmail}}

Please present this message or your digital trial pass at the ground security checkpoint. Best of luck!`,
  },
  {
    id: 'selection_successful',
    title: 'Selection Successful (Squad Qualification Offer)',
    category: 'selection',
    badge: 'Selection Confirmed',
    badgeColor: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-300',
    },
    description: 'Congratulatory notification of candidate selection following technical evaluation, outlining squad placement and admission steps.',
    recommendedForStatus: 'approved',
    suggestedTags: ['Selection', 'Offer Letter', 'Admission', 'Squad Roster'],
    templateText: `🏆 *MADEN FOOTBALL ACADEMY FOUNDATION*
*OFFICIAL SQUAD SELECTION & ADMISSION OFFER*

Dear {{parentName}},
Hearty Congratulations from the Technical Committee!

Following outstanding performance in the recent technical & tactical trial evaluations, we are delighted to confirm that:

⭐ *{{candidateName}}* has been *SELECTED* for induction into the academy squad!

📋 *Applicant Dossier:* {{applicationId}}
⚽ *Position Confirmed:* {{position}}
🏅 *Selected Squad / Tier:* {{squadBatch}}
🏫 *Training Campus:* {{campus}}
🗓️ *Admission & Registration Deadline:* {{admissionDeadline}}

🎯 *Next Steps for Admission Finalization:*
1. Complete the formal Academy Student-Athlete enrolment agreement.
2. Submit 2 passport-size photographs & verified medical fitness certificate.
3. Collect official foundation training kit & player ID card.

{{#if additionalNotes}}
📝 *Coach Evaluation Remarks:* {{additionalNotes}}
{{/if}}

📞 *Academy Registrar:* {{contactPhone}}
✉️ *Email:* {{contactEmail}}

Welcome to the MADEN Football Academy family. We look forward to nurturing your champion's football journey!`,
  },
  {
    id: 'trial_postponed',
    title: 'Trial Postponed (Rescheduling & Weather Alert)',
    category: 'postponement',
    badge: 'Rescheduled Session',
    badgeColor: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-300',
    },
    description: 'Urgent notice informing parents of postponement due to weather, waterlogging, or ground maintenance with revised dates.',
    recommendedForStatus: 'trial_scheduled',
    suggestedTags: ['Postponement', 'Weather Alert', 'Rescheduled', 'Safety'],
    templateText: `⚠️ *MADEN FOOTBALL ACADEMY FOUNDATION*
*IMPORTANT NOTICE: TRIAL SESSION RESCHEDULED*

Dear {{parentName}},
Greetings regarding candidate {{candidateName}} (Ref: {{applicationId}}).

Please be advised that the trial evaluation scheduled for *{{trialDate}}* at *{{venue}}* has been *POSTPONED*.

🌧️ *Reason:* {{rescheduledReason}}
(The technical committee prioritizes athlete safety, pitch integrity, and fair evaluation conditions.)

🗓️ *REVISED TRIAL SCHEDULE:*
📅 *New Date:* {{rescheduledDate}}
⏰ *New Reporting Time:* {{rescheduledTime}}
🏟️ *Venue:* {{venue}}
🏅 *Evaluator Coach:* {{evaluator}}

Your existing booking reference ({{applicationId}}) remains 100% valid. No new registration is required.

If you have a scheduling conflict with this revised slot, please reply directly to this message or contact our help desk:
📞 *Helpline:* {{contactPhone}} | ✉️ {{contactEmail}}

We regret any inconvenience caused and appreciate your cooperation in prioritizing player safety!`,
  },
  {
    id: 'application_under_review',
    title: 'Application Received & Under Review',
    category: 'verification',
    badge: 'Under Review',
    badgeColor: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-300',
    },
    description: 'Confirmation that the registration has entered technical screening, with estimated review timeline.',
    recommendedForStatus: 'under_review',
    suggestedTags: ['Registration Ack', 'Screening', 'Status Update'],
    templateText: `⚽ *MADEN FOOTBALL ACADEMY FOUNDATION*
*APPLICATION CONFIRMATION & TECHNICAL SCREENING*

Dear {{parentName}},
Thank you for registering {{candidateName}} for the {{applicationType}} program.

📋 *Booking Reference:* {{applicationId}}
🎂 *DOB / Age:* {{dob}} ({{age}} yrs)
⚽ *Position:* {{position}}
📍 *Selected Campus:* {{campus}}

Our technical scouting department is currently reviewing candidate credentials, age eligibility, and campus capacity. 

Once your slot is allocated, you will receive an official Trial Pass with date, reporting time, and pitch location via WhatsApp and SMS.

🌐 Track real-time status online at our Candidate Portal using your Reference: *{{applicationId}}*.
📞 Questions? Contact: {{contactPhone}} | {{contactEmail}}`,
  },
  {
    id: 'additional_info_required',
    title: 'Additional Information / Verification Required',
    category: 'verification',
    badge: 'Action Required',
    badgeColor: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-300',
    },
    description: 'Request for missing age proof, Aadhaar card, medical certificate, or guardian contact verification.',
    recommendedForStatus: 'additional_info_required',
    suggestedTags: ['Verification', 'Aadhaar Required', 'Age Proof', 'Action Needed'],
    templateText: `📋 *MADEN FOOTBALL ACADEMY FOUNDATION*
*ACTION REQUIRED: CANDIDATE VERIFICATION PENDING*

Dear {{parentName}},
Regarding the application for {{candidateName}} (Ref: *{{applicationId}}*):

Before we can release the official Trial Pass & Evaluation Slot, our administrative team requires the following verification document(s):

📄 *Required Document(s):*
{{requiredDocuments}}

📌 *Submission Options:*
1. Reply to this WhatsApp number with a clear photo/PDF of the document.
2. Or email to: {{contactEmail}} mentioning reference *{{applicationId}}*.

{{#if additionalNotes}}
💬 *Admin Remarks:* {{additionalNotes}}
{{/if}}

Please share the required details within 48 hours to ensure priority slot allocation.
📞 Support Desk: {{contactPhone}}`,
  },
  {
    id: 'trial_pass_reminder',
    title: 'Trial Day 24h Reminder & Checklist',
    category: 'reminder',
    badge: '24-Hour Reminder',
    badgeColor: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-300',
    },
    description: 'High-urgency 24-hour reminder before the trial session with boots, shin guards, hydration, and gate reporting checklist.',
    recommendedForStatus: 'trial_scheduled',
    suggestedTags: ['Reminder', '24h Alert', 'Kit Checklist', 'Gate Pass'],
    templateText: `⏰ *MADEN FOOTBALL ACADEMY FOUNDATION*
*REMINDER: TRIAL SESSION TOMORROW*

Dear {{parentName}},
This is an urgent operational reminder for {{candidateName}}'s trial session scheduled tomorrow!

📅 *Date:* {{trialDate}}
⏰ *Reporting Time:* {{trialTime}} *(Strict: arrive 30 mins early)*
🏟️ *Venue:* {{venue}}
🎫 *Pass Reference:* {{applicationId}}
🏅 *Pitch Lead Coach:* {{evaluator}}

🎒 *Final Kit & Gear Checklist:*
✅ Football boots suitable for grass/turf.
✅ Shin guards with long socks (mandatory for safety).
✅ 1-litre water bottle / electrolyte hydration.
✅ Original Government Age Proof (Aadhaar or Birth Certificate).

📝 *Instructions:* {{reportingInstructions}}

Gate security will verify Pass Ref *{{applicationId}}*. See you on the pitch!
📞 On-ground coordinator: {{contactPhone}}`,
  },
  {
    id: 'trial_standby_waitlist',
    title: 'Trial Standby / Batch Waitlist Update',
    category: 'feedback',
    badge: 'Standby Waitlist',
    badgeColor: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-300',
    },
    description: 'Informs parent that the chosen date or campus is at maximum evaluation capacity and the candidate is on priority standby.',
    recommendedForStatus: 'waitlisted',
    suggestedTags: ['Waitlist', 'Standby', 'Capacity Alert'],
    templateText: `⚽ *MADEN FOOTBALL ACADEMY FOUNDATION*
*TRIAL SESSION STATUS: PRIORITY STANDBY WAITLIST*

Dear {{parentName}},
Thank you for your interest in {{academyName}} for {{candidateName}} (Ref: {{applicationId}}).

Due to overwhelming candidate registrations for the {{position}} position at the {{campus}} campus, the upcoming evaluation cohort has reached safety capacity limit.

{{candidateName}} has been placed on our *PRIORITY STANDBY ROSTER*. As soon as an opening arises or the next evaluation cohort opens, you will receive immediate notification with a direct slot allocation.

{{#if additionalNotes}}
📝 *Note from Technical Lead:* {{additionalNotes}}
{{/if}}

If you would like to explore alternative trial slots at our other campuses, please reply to this WhatsApp or contact:
📞 {{contactPhone}} | ✉️ {{contactEmail}}`,
  },
  {
    id: 'technical_feedback_pathway',
    title: 'Post-Trial Technical Feedback & Development Pathway',
    category: 'feedback',
    badge: 'Scouting Report',
    badgeColor: {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-300',
    },
    description: 'Constructive performance summary after trials with recommendations for weekend development camps or next trial window.',
    recommendedForStatus: 'completed',
    suggestedTags: ['Feedback', 'Scouting', 'Development Plan', 'Training Camp'],
    templateText: `📋 *MADEN FOOTBALL ACADEMY FOUNDATION*
*TECHNICAL EVALUATION SUMMARY & DEVELOPMENT PATHWAY*

Dear {{parentName}},
Thank you for bringing {{candidateName}} (Ref: {{applicationId}}) to our recent trial evaluation session at {{venue}}.

Our coaching staff was thoroughly impressed with {{candidateName}}'s enthusiasm, sporting discipline, and passion for the game.

🏅 *Evaluation Coach:* {{evaluator}}
⚽ *Position Assessed:* {{position}}

{{#if additionalNotes}}
🎯 *Technical Observations & Strengths:*
{{additionalNotes}}
{{else}}
🎯 *Key Assessment Notes:*
Good fundamental ball mastery and tactical awareness. Recommended focus on first-touch under pressure and sprint recovery agility.
{{/if}}

🌟 *Recommended Academy Pathway:*
We warmly invite {{candidateName}} to enroll in our *Weekend Grassroots Development Camp* to continue skill progression and prepare for the next competitive squad selection window.

📞 Speak with our Technical Youth Director: {{contactPhone}}
✉️ {{contactEmail}} | 🌐 {{academyName}}`,
  },
];

/**
 * Clean & normalize Indian telephone numbers for WhatsApp Web / Deep Link URLs
 */
export function cleanWhatsAppPhoneNumber(phone: string): {
  cleanPhone: string;
  isValid: boolean;
  displayFormatted: string;
} {
  if (!phone) {
    return { cleanPhone: '', isValid: false, displayFormatted: 'No phone on record' };
  }

  const digits = phone.replace(/\D/g, '');
  let normalized = digits;

  // Handle leading 0
  if (normalized.startsWith('0') && normalized.length === 11) {
    normalized = normalized.slice(1);
  }

  // Prepend Indian 91 if 10 digits
  if (normalized.length === 10) {
    normalized = `91${normalized}`;
  } else if (normalized.length === 12 && normalized.startsWith('91')) {
    // already 91...
  } else if (normalized.length === 11 && normalized.startsWith('91')) {
    // malformed
  }

  const isValid = normalized.length >= 10 && normalized.length <= 13;
  const displayFormatted =
    normalized.startsWith('91') && normalized.length === 12
      ? `+91 ${normalized.slice(2, 7)} ${normalized.slice(7)}`
      : `+${normalized}`;

  return {
    cleanPhone: normalized,
    isValid,
    displayFormatted,
  };
}

/**
 * Generate full wa.me deep link URL
 */
export function generateWhatsAppUrl(phone: string, message: string): string {
  const { cleanPhone } = cleanWhatsAppPhoneNumber(phone);
  const encodedText = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Interpolate placeholders in WhatsApp template text
 * Supports {{variableName}} and simple conditional blocks {{#if variableName}}...{{/if}}
 */
export function renderWhatsAppTemplate(
  templateText: string,
  variables: Record<string, string | number | undefined>
): string {
  let output = templateText;

  // Process conditional blocks: {{#if varName}}content{{/if}}
  const conditionalRegex = /\{\{#if\s+([a-zA-Z0-9_]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  output = output.replace(conditionalRegex, (_, varName, innerContent) => {
    const val = variables[varName];
    if (val && String(val).trim().length > 0) {
      return innerContent;
    }
    return '';
  });

  // Replace standard placeholders: {{varName}}
  const varRegex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
  output = output.replace(varRegex, (_, varName) => {
    const val = variables[varName];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val);
    }
    return `[${varName}]`;
  });

  // Clean extra blank lines caused by conditional removals
  output = output.replace(/\n{3,}/g, '\n\n');

  return output.trim();
}

/**
 * Highlight variable tokens for visual template preview
 */
export function parseTemplateTokenSegments(
  templateText: string
): Array<{ text: string; isVariable: boolean; variableName?: string }> {
  const segments: Array<{ text: string; isVariable: boolean; variableName?: string }> = [];
  const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(templateText)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: templateText.substring(lastIndex, match.index),
        isVariable: false,
      });
    }
    segments.push({
      text: match[0],
      isVariable: true,
      variableName: match[1],
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < templateText.length) {
    segments.push({
      text: templateText.substring(lastIndex),
      isVariable: false,
    });
  }

  return segments;
}

/**
 * Extract sensible template variables from an applicant dossier
 */
export function extractTemplateVariablesFromCandidate(
  candidate?: Partial<AcademyRegistrationData> | null,
  overrides?: Partial<TemplateVariables>
): TemplateVariables {
  const c = candidate || {};

  const campusMap: Record<string, string> = {
    gayeshpur: 'Central Ground Complex, Gayeshpur, Nadia',
    north24parganas: 'Ichapore Ground, North 24 Parganas',
    krishnanagar: 'Krishnanagar Football School Ground, Nadia',
  };

  const defaultCampus =
    (c.preferredVenue || c.preferredCampus ? campusMap[c.preferredCampus || ''] : '') ||
    c.preferredVenue ||
    c.preferredCampus ||
    'Central Ground Complex, Gayeshpur, Nadia (741234)';

  const defaultVenue =
    c.scheduledTrialDetails?.venue ||
    defaultCampus;

  const defaultDate =
    c.scheduledTrialDetails?.date ||
    c.preferredTrialDate ||
    'Saturday, May 16, 2026';

  const defaultTime =
    c.scheduledTrialDetails?.time ||
    '07:30 AM – 09:30 AM (Morning Evaluation Slot)';

  const defaultEvaluator =
    c.scheduledTrialDetails?.evaluator ||
    'Coach Bapi Roy (AFC ‘B’ License, Head Scout)';

  const defaultReporting =
    c.scheduledTrialDetails?.reportingInstructions ||
    'Report 30 minutes prior in standard athletic kit with football boots, shin guards, water bottle, and original age proof document.';

  const defaultAge = c.age
    ? String(c.age)
    : c.dob
    ? String(new Date().getFullYear() - new Date(c.dob).getFullYear())
    : '14';

  return {
    candidateName: c.playerName || 'Candidate Player',
    parentName: c.parentName || 'Parent / Guardian',
    applicationId: c.bookingRef || 'MFA-TR-2026-0001',
    applicationType: c.applicationType === 'trial' ? 'Trial Session' : 'Academy Admission',
    position: (c.position ? c.position.toUpperCase() : 'MIDFIELDER / ALL-ROUND'),
    dob: c.dob || '2012-05-10',
    age: defaultAge,
    campus: defaultCampus,
    venue: defaultVenue,
    trialDate: defaultDate,
    trialTime: defaultTime,
    evaluator: defaultEvaluator,
    reportingInstructions: defaultReporting,
    rescheduledDate: 'Saturday, May 23, 2026',
    rescheduledTime: '07:30 AM – 09:30 AM',
    rescheduledReason: 'Heavy rainfall and pitch waterlogging alert issued for ground safety',
    requiredDocuments: '1. Original Aadhaar Card / Birth Certificate\n2. Recent Medical Fitness Certificate\n3. Two Passport Size Photographs',
    squadBatch: 'U-15 Elite Residential Academy Squad (Batch 2026-27)',
    admissionDeadline: 'Friday, May 29, 2026 (5:00 PM IST)',
    contactPhone: '+91 98302 45891',
    contactEmail: 'foundation@madenfaf.in',
    academyName: 'MADEN Football Academy Foundation',
    additionalNotes: c.adminRemarks || c.message || '',
    ...overrides,
  };
}
